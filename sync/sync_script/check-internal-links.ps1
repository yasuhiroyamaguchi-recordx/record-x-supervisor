#Requires -Version 5.1
<#
.SYNOPSIS
    check-internal-links.ps1 v0.2 - internal cross-reference integrity check [EVT-018 fix]

.NOTES (v0.2 changes from v0.1)
    - Markdown link: strict URL format only (path must end in .md/.yaml/.json/.ps1/.xml/.cred)
    - Backtick path: try sourcefile-relative resolve before repoRoot resolve
    - Skip outbox/_to_commander_*.md files (developer narrative, not link source)
    - target: false_positive < 10% (initial v0.1: ~98% false positive)

.DESCRIPTION
    Scans all .md / .yaml files in repo for internal references and verifies
    that referenced files exist. Flags broken links + style inconsistencies.

    Reference patterns detected:
    - Markdown link: [text](path)
    - Backtick path: `path/file.md`
    - Frontmatter: responds_to: filename
    - YAML reference: source: path

    Output:
    - sync/checkup-scores/link_check/{YYYYMMDD}.json (broken links + warnings)
    - Console summary

.PARAMETER DryRun
    Skip JSON write, console only.

.PARAMETER Verbose
    Show all checked references.

.NOTES
    Drafted: 2026-04-29 (Day 131 朝, supervisor instance A)
    EVT-016 garage doctrine 1.5-B applied at draft (4 points defined).
    EVT-017 follow-up: responds_to normalization detection input.
#>
param(
    [switch]$DryRun,
    [switch]$VerboseOutput
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# === Logging ===
$logDir = Join-Path $repoRoot "logs\link_check"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
}
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $logDir "$timestamp.log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [$Level] $Message"
    Write-Host $line
    Add-Content -Path $logFile -Value $line -Encoding UTF8
}

# === Output ===
$outDir = Join-Path $repoRoot "sync\checkup-scores\link_check"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}
$today = Get-Date -Format "yyyyMMdd"
$jsonOut = Join-Path $outDir "$today.json"

# === Scan target files ===
$exclude = @('logs', 'outbox_completed', '.git', 'node_modules')
$targetFiles = @(Get-ChildItem -Path $repoRoot -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object {
        $_.Extension -in @('.md', '.yaml', '.yml') -and
        ($exclude | ForEach-Object { $_ }) -notcontains ($_.FullName.Substring($repoRoot.Length).Split('\')[1])
    })

Write-Log "=== check-internal-links v0.1 start ==="
Write-Log "Target files: $($targetFiles.Count)"

$brokenLinks = @()
$warnings = @()
$totalRefs = 0

# === Reference pattern: Markdown link [text](relative/path) ===
# v0.2: strict URL format - path must contain '/' or end with file extension
$mdLinkRegex = [regex]'\[(?:[^\]]+)\]\(([^)]+\.(?:md|yaml|yml|ps1|json|xml|cred|txt))\)'

# === Reference pattern: backtick path `path/file.ext` ===
$backtickRegex = [regex]'`([0-9_a-zA-Z][0-9_a-zA-Z\-/\.]*\.(md|yaml|yml|ps1|json|xml))`'

# === Frontmatter: responds_to ===
$respondsToRegex = [regex]'(?im)^\s*responds_to:\s*(.+?)\s*$'

# === v0.2: Skip files (developer narrative, not link source) ===
$skipPathPatterns = @(
    '\\outbox\\.*_to_commander_.*\.md$',
    '\\inbox\\from_commander\\.*\.md$',
    '\\internal\\circular\\.*\.md$',
    '\\internal\\regional\\.*\.md$'
)
function Should-SkipFile {
    param([string]$Path)
    foreach ($pat in $skipPathPatterns) {
        if ($Path -match $pat) { return $true }
    }
    return $false
}

# === Helpers ===
function Test-LinkPath {
    param([string]$Link, [string]$BasePath)
    # Skip external URLs
    if ($Link -match '^https?://') { return $true }
    if ($Link -match '^mailto:') { return $true }
    if ($Link -match '^#') { return $true }  # in-page anchor
    # Skip placeholder / template patterns (e.g., {VAR} or <name>)
    if ($Link -match '[\{<]') { return $true }
    if ($Link -match '\.\.\.') { return $true }
    # Cross-repo references (commander#... pseudo-syntax)
    if ($Link -match '^commander#') { return $true }  # supervisor cannot directly check, defer

    # Strip anchor
    $cleanPath = $Link -split '#' | Select-Object -First 1
    if (-not $cleanPath) { return $true }

    # Resolve relative path
    $absPath = if ([System.IO.Path]::IsPathRooted($cleanPath)) {
        $cleanPath
    } else {
        Join-Path $BasePath $cleanPath
    }

    return Test-Path $absPath
}

# === Main scan ===
foreach ($f in $targetFiles) {
    $relFromRoot = $f.FullName.Substring($repoRoot.Length).TrimStart('\','/')
    # v0.2: skip developer narrative files
    if (Should-SkipFile -Path $f.FullName) {
        if ($VerboseOutput) { Write-Log "  [SKIP-FILE] $relFromRoot (narrative file)" }
        continue
    }
    $content = Get-Content -Path $f.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    $baseDir = Split-Path -Parent $f.FullName

    # Markdown links
    $matches1 = $mdLinkRegex.Matches($content)
    foreach ($m in $matches1) {
        $link = $m.Groups[1].Value.Trim()
        $totalRefs++
        if (-not (Test-LinkPath -Link $link -BasePath $baseDir)) {
            $brokenLinks += @{
                source_file = $relFromRoot
                link_target = $link
                pattern = "markdown_link"
                line_excerpt = ($m.Value | Select-Object -First 80)
            }
        }
    }

    # Backtick paths
    # v0.2: try sourcefile-relative resolve first, then repoRoot resolve
    $matches2 = $backtickRegex.Matches($content)
    foreach ($m in $matches2) {
        $link = $m.Groups[1].Value.Trim()
        $totalRefs++
        $found = $false
        # Try 1: sourcefile-relative
        $relativePath = Join-Path $baseDir $link
        if (Test-Path $relativePath) { $found = $true }
        # Try 2: repoRoot-relative
        if (-not $found) {
            $rootPath = Join-Path $repoRoot $link
            if (Test-Path $rootPath) { $found = $true }
        }
        # Try 3: same-dir bare name (e.g., `unnamed.md` from 00_origin/dream_mode_doctrine.md)
        if (-not $found -and $link -notmatch '/') {
            $sameDir = Join-Path $baseDir $link
            if (Test-Path $sameDir) { $found = $true }
        }
        if (-not $found) {
            $warnings += @{
                source_file = $relFromRoot
                link_target = $link
                pattern = "backtick_path"
                severity = "soft"
            }
        }
    }

    # Frontmatter responds_to (EVT-017 follow-up)
    $matches3 = $respondsToRegex.Matches($content)
    foreach ($m in $matches3) {
        $val = $m.Groups[1].Value.Trim()
        $totalRefs++
        # EVT-017: normalization check
        $normalizedExpected = $val
        $issues = @()
        if ($val -notmatch '\.md$') {
            $issues += "missing .md extension"
            $normalizedExpected = $val + ".md"
        }
        if ($val -match '[　-鿿]') {
            $issues += "natural language form (should be filename)"
        }
        if ($issues.Count -gt 0) {
            $warnings += @{
                source_file = $relFromRoot
                link_target = $val
                pattern = "responds_to_normalization"
                severity = "evt_017"
                issues = $issues
                suggested = $normalizedExpected
            }
        }
        # Existence check (best effort, search outbox/ for ordered filename)
        if ($val -match '_to_commander_') {
            $candidatePaths = @(
                (Join-Path $repoRoot "outbox\$val"),
                (Join-Path $repoRoot "outbox\$normalizedExpected"),
                (Join-Path $repoRoot "outbox_completed\2026\04\26-31\$val"),
                (Join-Path $repoRoot "outbox_completed\2026\04\26-31\$normalizedExpected")
            )
            $found = $false
            foreach ($cp in $candidatePaths) {
                if (Test-Path $cp) { $found = $true; break }
            }
            if (-not $found) {
                $brokenLinks += @{
                    source_file = $relFromRoot
                    link_target = $val
                    pattern = "responds_to_target_missing"
                    candidate_paths_checked = $candidatePaths
                }
            }
        }
    }
}

Write-Log ""
Write-Log "=== Summary ==="
Write-Log "Total references checked: $totalRefs"
Write-Log "Broken links:             $($brokenLinks.Count)"
Write-Log "Warnings:                 $($warnings.Count)"

if ($VerboseOutput -or $brokenLinks.Count -gt 0) {
    Write-Log ""
    Write-Log "--- Broken links (top 20) ---"
    foreach ($b in $brokenLinks | Select-Object -First 20) {
        Write-Log ("  [BROKEN] {0} -> {1} ({2})" -f $b.source_file, $b.link_target, $b.pattern)
    }
}

if ($VerboseOutput -or $warnings.Count -gt 0) {
    Write-Log ""
    Write-Log "--- Warnings (top 20) ---"
    foreach ($w in $warnings | Select-Object -First 20) {
        $sev = if ($w.ContainsKey('severity')) { $w.severity } else { "soft" }
        Write-Log ("  [WARN-{0}] {1} -> {2} ({3})" -f $sev, $w.source_file, $w.link_target, $w.pattern)
    }
}

# === Output JSON ===
if (-not $DryRun) {
    $report = [ordered]@{
        check_id = "link_check_$today"
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
        total_references = $totalRefs
        target_files_count = $targetFiles.Count
        broken_links_count = $brokenLinks.Count
        warnings_count = $warnings.Count
        broken_links = $brokenLinks
        warnings = $warnings
    }
    $report | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonOut -Encoding UTF8
    Write-Log "Report saved: $jsonOut"
}

Write-Log "=== check-internal-links end ==="

# Exit code: 0=clean, 1=broken found, 2=warnings only
if ($brokenLinks.Count -gt 0) { exit 1 }
if ($warnings.Count -gt 0) { exit 2 }
exit 0
