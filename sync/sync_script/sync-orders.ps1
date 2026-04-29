# ===================================================================
# sync-orders.ps1
# Record X Supervisor - Order Sync Script v1.2 (EVT-015 fix)
#
# Purpose: Push orders from supervisor outbox/ to commander inbox/
#          (P4 interpretation B: commander inbox/=receive, index/=send)
#          Eliminates manual Yasu bridging.
#
# Usage:
#   .\sync\sync_script\sync-orders.ps1                  (normal run)
#   .\sync\sync_script\sync-orders.ps1 -DryRun          (preview only)
#   .\sync\sync_script\sync-orders.ps1 -CommanderRoot <path>
#   .\sync\sync_script\sync-orders.ps1 -IncludeDraft    (include draft orders)
#
# Prerequisites:
#   - Run from record-x-supervisor root (cwd-independent via $PSScriptRoot)
#   - Commander repo at C:\RX_Dev\record-x-commander
#   - Commander inbox/ directory exists (P4 interpretation B confirmed)
#   - Supervisor outbox/{YYYYMMDD}_to_commander_{NNN}.md format
#   - Write permission to commander repo: root CLAUDE.md section 2-C-1 (P2)
#
# Characteristics:
#   - One-way only (supervisor -> commander)
#   - Differential only (no overwrite of existing files)
#   - Idempotent
#   - Does not abort on error
#   - Skips draft orders by default (use -IncludeDraft to override)
#   - Extracts deadline / discussion_scale / order_number from frontmatter
#   - Same filename on both sides (P4 adoption 1: filename only same, dirs independent)
#
# Drafted: 2026-04-28 (Day 130 end, supervisor first session)
# Basis: Order #13 Addendum 3 (sync mechanism early implementation) +
#        Yasu instruction "build mechanism that detects naturally without investigation"
# ===================================================================

param(
    [switch]$DryRun,
    [switch]$VerboseOutput,
    [switch]$IncludeDraft,
    [string]$CommanderRoot = "C:\RX_Dev\record-x-commander"
)

# === cwd-independent: resolve $repoRoot from $PSScriptRoot ===
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# === Configuration ===
$SRC = Join-Path $repoRoot "outbox"
$DST = Join-Path $CommanderRoot "inbox"
$LOG_FILE = Join-Path $repoRoot "sync\sync_script\order_sync.log"

# === Existence checks ===
if (-not (Test-Path $SRC)) {
    Write-Host "ERROR: Supervisor outbox/ not found: $SRC" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $CommanderRoot)) {
    Write-Host "ERROR: Commander repo not found: $CommanderRoot" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $DST)) {
    Write-Host "WARNING: Commander inbox/ not present: $DST" -ForegroundColor Yellow
    Write-Host "         Commander side init may be incomplete." -ForegroundColor Yellow
    if (-not $DryRun) {
        Write-Host "         Auto-creating." -ForegroundColor Yellow
        New-Item -ItemType Directory -Force -Path $DST | Out-Null
    }
}

# === Extract sync targets ===
$srcFiles = Get-ChildItem -Path $SRC -Filter "*_to_commander_*.md" -File -ErrorAction SilentlyContinue
if (-not $srcFiles -or $srcFiles.Count -eq 0) {
    Write-Host "No order files found in $SRC" -ForegroundColor Yellow
    exit 0
}

# === Summary header ===
Write-Host ""
Write-Host "=== Supervisor Order Sync Summary ===" -ForegroundColor Cyan
Write-Host "Source:       $SRC"
Write-Host "Destination:  $DST"
Write-Host "Found:        $($srcFiles.Count) files"
Write-Host ""

$newCount = 0
$skipCount = 0
$draftSkipCount = 0
$errorCount = 0
$pushedFiles = @()

foreach ($srcFile in $srcFiles) {
    $fileName = $srcFile.Name

    # Filename pattern check
    if ($fileName -notmatch '^(\d{8})_to_commander_(\d{3})(\.md|_RETRACTED\.md)$') {
        if ($VerboseOutput) {
            Write-Host "  [SKIP] $fileName (filename pattern mismatch)" -ForegroundColor Gray
        }
        $skipCount++
        continue
    }

    # Read content for frontmatter / status detection
    $content = Get-Content -Path $srcFile.FullName -Raw -Encoding UTF8
    $isDraft = $false
    $deadline = $null
    $discussionScale = $null
    $orderNumber = $null

    # Frontmatter extraction (and draft detection limited to frontmatter status field)
    if ($content -match '(?ms)^---\s*\r?\n(.*?)\r?\n---\s*\r?\n') {
        $frontmatter = $matches[1]
        if ($frontmatter -match 'deadline:\s*([^\r\n]+)') {
            $deadline = $matches[1].Trim()
        }
        if ($frontmatter -match 'discussion_scale:\s*([^\r\n]+)') {
            $discussionScale = $matches[1].Trim()
        }
        if ($frontmatter -match 'order_number:\s*(\d+)') {
            $orderNumber = $matches[1]
        }
        # Draft detection: only frontmatter status field (avoids free-text false positives)
        if ($frontmatter -match '(?im)^\s*status:\s*draft\s*$') {
            $isDraft = $true
        }
    }

    # Skip drafts unless -IncludeDraft
    if ($isDraft -and (-not $IncludeDraft)) {
        Write-Host "  [DRAFT-SKIP] $fileName (use -IncludeDraft to include)" -ForegroundColor Yellow
        $draftSkipCount++
        continue
    }

    # Commander-side paths
    # v1.2 (2026-04-28 末, EVT-015 fix): dynamically enumerate archive subdirs
    # to avoid CP932 encoding issue with hardcoded Japanese dir names ("完了").
    # EVT-002 type encoding pattern: ASCII-only PS1 + Japanese path literal -> Test-Path fails.
    $dstPath = Join-Path $DST $fileName
    $archivePaths = @()
    $subdirs = @(Get-ChildItem -Path $DST -Directory -ErrorAction SilentlyContinue)
    foreach ($sub in $subdirs) {
        $archivePaths += (Join-Path $sub.FullName $fileName)
    }

    # Skip existing in inbox direct
    if (Test-Path $dstPath) {
        $existingContent = Get-Content -Path $dstPath -Raw -Encoding UTF8
        if ($existingContent -eq $content) {
            if ($VerboseOutput) {
                Write-Host "  [SKIP] $fileName (identical content in inbox direct)" -ForegroundColor Gray
            }
            $skipCount++
            continue
        } else {
            Write-Host "  [WARN] $fileName differs from existing commander-side file" -ForegroundColor Yellow
            Write-Host "         Retraction rule: place ${fileName}_RETRACTED.md and create new file" -ForegroundColor Yellow
            $skipCount++
            continue
        }
    }

    # Skip if already archived (commander-side completed processing)
    $archivedHit = $false
    foreach ($archivePath in $archivePaths) {
        if (Test-Path $archivePath) {
            if ($VerboseOutput) {
                Write-Host "  [SKIP] $fileName (already archived at $(Split-Path $archivePath -Parent))" -ForegroundColor Gray
            }
            $archivedHit = $true
            break
        }
    }
    if ($archivedHit) {
        $skipCount++
        continue
    }

    # DryRun
    if ($DryRun) {
        Write-Host "  [DRY] $fileName -> $DST (scale: $discussionScale, deadline: $deadline)" -ForegroundColor Yellow
        $newCount++
        continue
    }

    # Copy file
    try {
        Copy-Item -Path $srcFile.FullName -Destination $dstPath -Force -ErrorAction Stop
        $info = "scale: $discussionScale, deadline: $deadline, order: $orderNumber"
        Write-Host "  [OK]   $fileName ($info)" -ForegroundColor Green
        $newCount++
        $pushedFiles += @{
            file = $fileName
            scale = $discussionScale
            deadline = $deadline
            order_number = $orderNumber
            pushed_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
        }
    }
    catch {
        Write-Host "  [FAIL] $fileName : $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

# === Log append ===
if (-not $DryRun -and $newCount -gt 0) {
    try {
        $logEntry = @{
            timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
            new_count = $newCount
            skip_count = $skipCount
            draft_skip_count = $draftSkipCount
            error_count = $errorCount
            pushed_files = $pushedFiles
        } | ConvertTo-Json -Depth 10 -Compress
        Add-Content -Path $LOG_FILE -Value $logEntry -Encoding UTF8
    }
    catch {
        Write-Host "WARNING: Log write failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# === Result summary ===
Write-Host ""
Write-Host "=== Sync Result ===" -ForegroundColor Cyan
Write-Host "New transferred:    $newCount" -ForegroundColor Green
Write-Host "Existing skipped:   $skipCount"
if ($draftSkipCount -gt 0) {
    Write-Host "Draft skipped:      $draftSkipCount (use -IncludeDraft to include)" -ForegroundColor Yellow
}
if ($errorCount -gt 0) {
    Write-Host "Failed:             $errorCount" -ForegroundColor Red
}

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] Run without -DryRun to execute." -ForegroundColor Yellow
    exit 0
}

# === Notification on new transfers ===
if ($newCount -gt 0) {
    Write-Host ""
    Write-Host "Sync complete. $newCount new orders placed in commander inbox/." -ForegroundColor Green
    Write-Host "Next action: commander reads inbox/ and sends responses to index/." -ForegroundColor Cyan
}
Write-Host ""

if ($errorCount -gt 0) {
    exit 1
}
exit 0
