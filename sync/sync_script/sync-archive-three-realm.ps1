#Requires -Version 5.1
<#
.SYNOPSIS
    Archive three-realm sync v0.1 (DO-SUPERVISOR-003)

.DESCRIPTION
    Mirrors supervisor + commander archives into factory side mirror directory.
    Phase 1 prerequisite for DO-FACTORY-166 (supervisor_report.ts).

    Sync direction: supervisor + commander -> factory mirror (one-way)
    Update strategy: mtime-based delta transfer (changed files only)
    Idempotent: re-runs are safe

.PARAMETER DryRun
    Test mode: list sync candidates only, no actual copy.

.PARAMETER VerboseOutput
    Detailed output for debugging.

.PARAMETER FactoryMirrorRoot
    Factory mirror destination root.

.PARAMETER CommanderRoot
    Commander repository root.

.NOTES
    Drafted: 2026-04-30 (Day 132 morning, supervisor instance A self-implementation)
    Basis:
    - Order #44 section 3 rebuttal 2 (separate DO request, archive three-realm sync gap)
    - DO-FACTORY-166 prerequisite (supervisor_report.ts data source)
    - B-003 Decision 1 Phase 1 prerequisite
    - sync-regional.ps1 v1.0 same-pattern implementation
    - ADR-009 section 6 three-realm automation integration
#>

param(
    [switch]$DryRun,
    [switch]$VerboseOutput,
    [string]$FactoryMirrorRoot = "C:\RX_Dev\ProjectRX_HQ\wt_common\record-x-mirror",
    [string]$CommanderRoot = "C:\RX_Dev\record-x-commander"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Resolve supervisor repo root (this script lives at sync/sync_script/)
$supervisorRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

# Sync mappings (source -> destination relative to FactoryMirrorRoot)
$syncMappings = @(
    @{
        Source = Join-Path $supervisorRoot "archive\error_patterns.md"
        Destination = "supervisor\archive\error_patterns.md"
        Origin = "supervisor"
    },
    @{
        Source = Join-Path $supervisorRoot "archive\board_council_decisions.md"
        Destination = "supervisor\archive\board_council_decisions.md"
        Origin = "supervisor"
    },
    @{
        Source = Join-Path $supervisorRoot "outbox"
        Destination = "supervisor\outbox"
        Origin = "supervisor"
        IsDirectory = $true
        Filter = "*.md"
    },
    @{
        Source = Join-Path $CommanderRoot "archive"
        Destination = "commander\archive"
        Origin = "commander"
        IsDirectory = $true
        Filter = "*.md"
        OptionalSource = $true
    },
    @{
        Source = Join-Path $CommanderRoot "strategy\decisions"
        Destination = "commander\strategy\decisions"
        Origin = "commander"
        IsDirectory = $true
        Filter = "*.md"
        OptionalSource = $true
    },
    @{
        # v0.2 NEW: completion_reports B-line sync (司令官 α 第 63 号自発通知契機、EVT-061 候補解消)
        Source = Join-Path $CommanderRoot "sync\completion_reports\processed"
        Destination = "commander\sync\completion_reports\processed"
        Origin = "commander"
        IsDirectory = $true
        Filter = "*.json"
        OptionalSource = $true
    }
)

$transferred = 0
$skipped = 0
$errors = 0

Write-Host "=== Archive Three-Realm Sync v0.1 (DO-SUPERVISOR-003) ==="
Write-Host "Mirror root: $FactoryMirrorRoot"
Write-Host "DryRun: $DryRun"
Write-Host ""

# Ensure mirror root exists
if (-not (Test-Path $FactoryMirrorRoot)) {
    if ($DryRun) {
        Write-Host "[DryRun] Would create mirror root: $FactoryMirrorRoot"
    } else {
        New-Item -ItemType Directory -Path $FactoryMirrorRoot -Force | Out-Null
        Write-Host "Created mirror root: $FactoryMirrorRoot"
    }
}

foreach ($map in $syncMappings) {
    $source = $map.Source
    $destFull = Join-Path $FactoryMirrorRoot $map.Destination
    $isDir = if ($map.ContainsKey('IsDirectory')) { $map.IsDirectory } else { $false }
    $optional = if ($map.ContainsKey('OptionalSource')) { $map.OptionalSource } else { $false }

    if (-not (Test-Path $source)) {
        if ($optional) {
            Write-Host "  [skip] $($map.Origin): $source (optional, not present)"
        } else {
            Write-Host "  [WARN] $($map.Origin): $source (required, not present)"
            $errors++
        }
        continue
    }

    if ($isDir) {
        $filter = if ($map.ContainsKey('Filter')) { $map.Filter } else { "*" }
        $files = Get-ChildItem -Path $source -Filter $filter -File -Recurse -ErrorAction SilentlyContinue
        foreach ($f in $files) {
            $relPath = $f.FullName.Substring($source.Length).TrimStart("\")
            $destFile = Join-Path $destFull $relPath
            $destDir = Split-Path $destFile -Parent

            $needCopy = $true
            if (Test-Path $destFile) {
                $destFileObj = Get-Item $destFile
                if ($destFileObj.LastWriteTime -ge $f.LastWriteTime) {
                    $needCopy = $false
                }
            }

            if ($needCopy) {
                if ($DryRun) {
                    Write-Host "  [DryRun] $($map.Origin): $relPath -> $destFile"
                } else {
                    if (-not (Test-Path $destDir)) {
                        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
                    }
                    Copy-Item $f.FullName -Destination $destFile -Force
                    if ($VerboseOutput) {
                        Write-Host "  [copy] $($map.Origin): $relPath"
                    }
                }
                $transferred++
            } else {
                $skipped++
            }
        }
    } else {
        # Single file
        $sourceFile = Get-Item $source
        $destDir = Split-Path $destFull -Parent

        $needCopy = $true
        if (Test-Path $destFull) {
            $destFileObj = Get-Item $destFull
            if ($destFileObj.LastWriteTime -ge $sourceFile.LastWriteTime) {
                $needCopy = $false
            }
        }

        if ($needCopy) {
            if ($DryRun) {
                Write-Host "  [DryRun] $($map.Origin): $($sourceFile.Name) -> $destFull"
            } else {
                if (-not (Test-Path $destDir)) {
                    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
                }
                Copy-Item $source -Destination $destFull -Force
                Write-Host "  [copy] $($map.Origin): $($sourceFile.Name)"
            }
            $transferred++
        } else {
            $skipped++
        }
    }
}

Write-Host ""
Write-Host "=== Sync Result ==="
Write-Host "Transferred: $transferred"
Write-Host "Skipped (up-to-date): $skipped"
Write-Host "Errors: $errors"
Write-Host ""
Write-Host "Sync complete."
