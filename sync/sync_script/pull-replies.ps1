# ===================================================================
# pull-replies.ps1
# Record X Supervisor - Reply Pull Script v1.0
#
# Purpose: Pull commander responses from commander index/ (send-box)
#          to supervisor inbox/from_commander/{YYYYMMDD}/
#          (P4 interpretation B: commander inbox/=receive, index/=send)
#
# Usage:
#   .\sync\sync_script\pull-replies.ps1                  (normal run)
#   .\sync\sync_script\pull-replies.ps1 -DryRun          (preview only)
#   .\sync\sync_script\pull-replies.ps1 -CommanderRoot <path>
#
# Prerequisites:
#   - Run from record-x-supervisor root (cwd-independent via $PSScriptRoot)
#   - Commander repo at C:\RX_Dev\record-x-commander
#   - Commander index/{YYYYMMDD}_from_commander_{NNN}.md format
#
# Characteristics:
#   - One-way only (commander -> supervisor)
#   - Differential only (no overwrite)
#   - Idempotent
#   - Does not abort on error
#   - Extracts responds_to / order_number from frontmatter for logical mapping
#   - Supervisor-side filename: {NNN}_response_to_order_{order_number}.md
#   - Mapping JSON output for traceability
#
# Drafted: 2026-04-28 (Day 130 end)
# Basis: Order #11 adoption 1 (frontmatter responds_to mandatory) +
#        Order #13 instruction 1-D
# ===================================================================

param(
    [switch]$DryRun,
    [switch]$VerboseOutput,
    [string]$CommanderRoot = "C:\RX_Dev\record-x-commander"
)

# === cwd-independent: resolve $repoRoot from $PSScriptRoot ===
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# === Configuration ===
$SRC = Join-Path $CommanderRoot "index"
$DST_ROOT = Join-Path $repoRoot "inbox\from_commander"
$MAPPING_FILE = Join-Path $repoRoot "sync\sync_script\reply_mapping.json"

# === Existence checks ===
if (-not (Test-Path $CommanderRoot)) {
    Write-Host "ERROR: Commander repo not found: $CommanderRoot" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $SRC)) {
    Write-Host "INFO: Commander index/ not present: $SRC" -ForegroundColor Yellow
    Write-Host "      Commander may not have sent responses yet." -ForegroundColor Yellow
    exit 0
}

if (-not (Test-Path $DST_ROOT)) {
    Write-Host "Creating supervisor side: $DST_ROOT" -ForegroundColor Gray
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $DST_ROOT | Out-Null
    }
}

# === Extract pull targets ===
$srcFiles = Get-ChildItem -Path $SRC -Filter "*_from_commander_*.md" -File -ErrorAction SilentlyContinue
if (-not $srcFiles -or $srcFiles.Count -eq 0) {
    Write-Host "No response files found in $SRC" -ForegroundColor Yellow
    exit 0
}

# === Load existing mapping JSON if present ===
$mapping = @{}
if (Test-Path $MAPPING_FILE) {
    try {
        $mappingJson = Get-Content -Path $MAPPING_FILE -Raw -Encoding UTF8 | ConvertFrom-Json -ErrorAction Stop
        $mappingJson.PSObject.Properties | ForEach-Object {
            $mapping[$_.Name] = $_.Value
        }
    }
    catch {
        Write-Host "WARNING: Existing mapping JSON corrupt, recreating: $MAPPING_FILE" -ForegroundColor Yellow
        $mapping = @{}
    }
}

# === Summary header ===
Write-Host ""
Write-Host "=== Commander Reply Pull Summary ===" -ForegroundColor Cyan
Write-Host "Source:       $SRC"
Write-Host "Destination:  $DST_ROOT"
Write-Host "Found:        $($srcFiles.Count) files"
Write-Host ""

$newCount = 0
$skipCount = 0
$errorCount = 0
$pulledFiles = @()

foreach ($srcFile in $srcFiles) {
    # Filename parse: YYYYMMDD_from_commander_NNN.md
    $fileName = $srcFile.Name
    if ($fileName -notmatch '^(\d{8})_from_commander_(\d{3})\.md$') {
        Write-Host "  [SKIP] $fileName (filename pattern mismatch)" -ForegroundColor Yellow
        $skipCount++
        continue
    }
    $dateStr = $matches[1]
    $responseNum = $matches[2]

    # Frontmatter extraction (responds_to + order_number)
    $content = Get-Content -Path $srcFile.FullName -Raw -Encoding UTF8
    $respondsTo = $null
    $orderNumber = $null

    if ($content -match '(?ms)^---\s*\r?\n(.*?)\r?\n---\s*\r?\n') {
        $frontmatter = $matches[1]
        if ($frontmatter -match 'responds_to:\s*([^\r\n]+)') {
            $respondsTo = $matches[1].Trim()
        }
        if ($frontmatter -match 'order_number:\s*(\d+)') {
            $orderNumber = $matches[1]
        }
    }

    # Determine supervisor-side path
    $dstSubDir = Join-Path $DST_ROOT $dateStr
    $dstFileName = if ($orderNumber) {
        "{0}_response_to_order_{1:D3}.md" -f $responseNum, [int]$orderNumber
    } else {
        "{0}_response_unknown_order.md" -f $responseNum
    }
    $dstPath = Join-Path $dstSubDir $dstFileName

    # Skip existing
    if (Test-Path $dstPath) {
        if ($VerboseOutput) {
            Write-Host "  [SKIP] $fileName (existing: $dstFileName)" -ForegroundColor Gray
        }
        $skipCount++
        continue
    }

    # DryRun
    if ($DryRun) {
        Write-Host "  [DRY] $fileName -> $dstSubDir\$dstFileName" -ForegroundColor Yellow
        $newCount++
        continue
    }

    # Create directory
    if (-not (Test-Path $dstSubDir)) {
        New-Item -ItemType Directory -Force -Path $dstSubDir | Out-Null
    }

    # Copy with supervisor transcription note appended
    try {
        $commanderCommit = & git -C $CommanderRoot log -1 --format="%h" -- "index/$fileName" 2>$null
        $transcriptionNote = @"

---

## Supervisor Transcription Note (auto-generated by pull-replies.ps1)

- Source: ``commander#${commanderCommit}:index/${fileName}``
- Pulled at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
- responds_to: $respondsTo
- order_number: $orderNumber
- response_number: $responseNum
- Auto-sync script: ``sync/sync_script/pull-replies.ps1`` v1.0
"@

        $newContent = $content + $transcriptionNote
        Set-Content -Path $dstPath -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "  [OK]   $fileName -> $dateStr/$dstFileName" -ForegroundColor Green
        $newCount++
        $pulledFiles += @{
            commander_file = $fileName
            supervisor_file = "$dateStr/$dstFileName"
            responds_to = $respondsTo
            order_number = $orderNumber
            response_number = $responseNum
            pulled_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
            commander_commit = $commanderCommit
        }

        # Mapping update
        $mapping[$fileName] = @{
            supervisor_path = "inbox/from_commander/$dateStr/$dstFileName"
            responds_to = $respondsTo
            order_number = $orderNumber
            response_number = $responseNum
            pulled_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
            commander_commit = $commanderCommit
        }
    }
    catch {
        Write-Host "  [FAIL] $fileName : $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

# === Mapping JSON output ===
if (-not $DryRun -and $newCount -gt 0) {
    try {
        $mappingJson = $mapping | ConvertTo-Json -Depth 10
        Set-Content -Path $MAPPING_FILE -Value $mappingJson -Encoding UTF8
        if ($VerboseOutput) {
            Write-Host "  Mapping JSON updated: $MAPPING_FILE" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "WARNING: Mapping JSON write failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# === Result summary ===
Write-Host ""
Write-Host "=== Pull Result ===" -ForegroundColor Cyan
Write-Host "New pulled:       $newCount" -ForegroundColor Green
Write-Host "Existing skipped: $skipCount"
if ($errorCount -gt 0) {
    Write-Host "Failed:           $errorCount" -ForegroundColor Red
}

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] Run without -DryRun to execute." -ForegroundColor Yellow
    exit 0
}

# === Notification on new pulls ===
if ($newCount -gt 0) {
    Write-Host ""
    Write-Host "Pull complete. $newCount new responses saved to inbox/from_commander/." -ForegroundColor Green
    Write-Host "Next action: supervisor reviews responses and issues adoption decisions." -ForegroundColor Cyan
}
Write-Host ""

if ($errorCount -gt 0) {
    exit 1
}
exit 0
