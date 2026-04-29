# ===================================================================
# sync-regional.ps1
# Record X Supervisor - L2 Regional Topic Forum Sync v1.0
#
# v1.0 changes from v0.1 (EVT-016 garage doctrine 1.5 direct response):
#   - Bidirectional sync by default (push + pull in single run)
#   - mtime-based conflict resolution (newer wins)
#   - Conflict detection (both sides present + content differs but mtime tied)
#   - L1/L2/L3 closed loop: write -> read -> reflect (reflection via Layer 0 Step 3.6)
#
# Usage:
#   .\sync\sync_script\sync-regional.ps1                    (default: bidirectional)
#   .\sync\sync_script\sync-regional.ps1 -Direction push    (supervisor -> commander only)
#   .\sync\sync_script\sync-regional.ps1 -Direction pull    (commander -> supervisor only)
#   .\sync\sync_script\sync-regional.ps1 -DryRun
#
# Drafted: 2026-04-28 (Day 130 末, supervisor instance A)
# Garage Doctrine 1.5-B applied at v1.0 (Who/When/Where/Reflection 4 points).
# ===================================================================

param(
    [switch]$DryRun,
    [switch]$VerboseOutput,
    [ValidateSet('push','pull','bidirectional')]
    [string]$Direction = 'bidirectional',
    [string]$CommanderRoot = "C:\RX_Dev\record-x-commander",
    [string]$CommanderRegionalRoot = "shared\regional"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$SupervisorRegional = Join-Path $repoRoot "internal\regional"
$CommanderRegional = Join-Path $CommanderRoot $CommanderRegionalRoot
$LOG_FILE = Join-Path $PSScriptRoot "regional_sync.log"

if (-not (Test-Path $SupervisorRegional)) {
    Write-Host "ERROR: Supervisor internal/regional/ not found: $SupervisorRegional" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $CommanderRoot)) {
    Write-Host "ERROR: Commander repo not found: $CommanderRoot" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $CommanderRegional)) {
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $CommanderRegional | Out-Null
    } else {
        Write-Host "WARN: $CommanderRegional missing (would create)" -ForegroundColor Yellow
    }
}

$totalNew = 0
$totalSkip = 0
$totalConflict = 0
$totalError = 0

function Sync-OneWay {
    param(
        [string]$Src,
        [string]$Dst,
        [string]$Label
    )
    if (-not (Test-Path $Src)) {
        Write-Host "  [INFO] $Label src not present, skipping" -ForegroundColor Gray
        return @{ new = 0; skip = 0; conflict = 0; err = 0 }
    }
    $srcFiles = @(Get-ChildItem -Path $Src -Filter "*.md" -File -Recurse -ErrorAction SilentlyContinue)
    if ($srcFiles.Count -eq 0) {
        Write-Host "  [INFO] $Label no files in src" -ForegroundColor Gray
        return @{ new = 0; skip = 0; conflict = 0; err = 0 }
    }
    Write-Host ("  --- $Label ($($srcFiles.Count) files) ---") -ForegroundColor Cyan
    $new = 0; $skip = 0; $conflict = 0; $err = 0
    foreach ($srcFile in $srcFiles) {
        $rel = $srcFile.FullName.Substring($Src.Length).TrimStart('\','/')
        $dstPath = Join-Path $Dst $rel
        $dstDir = Split-Path -Parent $dstPath

        if (Test-Path $dstPath) {
            $srcContent = Get-Content -Path $srcFile.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            $dstContent = Get-Content -Path $dstPath -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            if ($srcContent -eq $dstContent) {
                if ($VerboseOutput) { Write-Host "    [SKIP] $rel (identical)" -ForegroundColor Gray }
                $skip++
                continue
            }
            # Differs: mtime comparison
            $srcMtime = $srcFile.LastWriteTime
            $dstMtime = (Get-Item $dstPath).LastWriteTime
            if ($srcMtime -le $dstMtime) {
                if ($VerboseOutput) { Write-Host "    [SKIP-OLDER] $rel (src older than dst)" -ForegroundColor Gray }
                $skip++
                continue
            }
            $diffSec = ($srcMtime - $dstMtime).TotalSeconds
            if ([math]::Abs($diffSec) -lt 2) {
                Write-Host "    [CONFLICT] $rel (mtime tied, content differs - manual resolve)" -ForegroundColor Magenta
                $conflict++
                continue
            }
            # src is newer -> overwrite dst
            if ($DryRun) {
                Write-Host "    [DRY-OVERWRITE] $rel (src newer by $([math]::Round($diffSec,1))s)" -ForegroundColor Yellow
                $new++
                continue
            }
            try {
                Copy-Item -Path $srcFile.FullName -Destination $dstPath -Force
                Write-Host "    [UPDATE] $rel (newer overwrite)" -ForegroundColor Green
                $new++
            } catch {
                Write-Host "    [FAIL] $rel : $($_.Exception.Message)" -ForegroundColor Red
                $err++
            }
            continue
        }
        # New file
        if ($DryRun) {
            Write-Host "    [DRY] $rel" -ForegroundColor Yellow
            $new++
            continue
        }
        if (-not (Test-Path $dstDir)) {
            New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
        }
        try {
            Copy-Item -Path $srcFile.FullName -Destination $dstPath -Force
            Write-Host "    [OK] $rel" -ForegroundColor Green
            $new++
        } catch {
            Write-Host "    [FAIL] $rel : $($_.Exception.Message)" -ForegroundColor Red
            $err++
        }
    }
    return @{ new = $new; skip = $skip; conflict = $conflict; err = $err }
}

Write-Host ""
Write-Host "=== L2 Regional Sync (v1.0, $Direction) ===" -ForegroundColor Cyan
Write-Host "Supervisor: $SupervisorRegional"
Write-Host "Commander:  $CommanderRegional"
Write-Host ""

if ($Direction -eq 'push' -or $Direction -eq 'bidirectional') {
    $r = Sync-OneWay -Src $SupervisorRegional -Dst $CommanderRegional -Label "push (supervisor -> commander)"
    $totalNew += $r.new; $totalSkip += $r.skip; $totalConflict += $r.conflict; $totalError += $r.err
}
if ($Direction -eq 'pull' -or $Direction -eq 'bidirectional') {
    $r = Sync-OneWay -Src $CommanderRegional -Dst $SupervisorRegional -Label "pull (commander -> supervisor)"
    $totalNew += $r.new; $totalSkip += $r.skip; $totalConflict += $r.conflict; $totalError += $r.err
}

Write-Host ""
Write-Host "=== Result ===" -ForegroundColor Cyan
Write-Host ("New / Update:   $totalNew") -ForegroundColor Green
Write-Host ("Skip:           $totalSkip")
if ($totalConflict -gt 0) {
    Write-Host ("Conflicts:      $totalConflict (manual resolve)") -ForegroundColor Magenta
}
if ($totalError -gt 0) {
    Write-Host ("Errors:         $totalError") -ForegroundColor Red
}

if (-not $DryRun -and ($totalNew -gt 0 -or $totalConflict -gt 0)) {
    try {
        $logEntry = [ordered]@{
            timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
            direction = $Direction
            new = $totalNew
            skip = $totalSkip
            conflict = $totalConflict
            error = $totalError
        } | ConvertTo-Json -Compress
        Add-Content -Path $LOG_FILE -Value $logEntry -Encoding UTF8
    } catch {
        Write-Host "WARN: log write failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

if ($DryRun) {
    Write-Host "[DRY RUN] No files transferred." -ForegroundColor Yellow
}

if ($totalError -gt 0) { exit 1 }
if ($totalConflict -gt 0) { exit 2 }
exit 0
