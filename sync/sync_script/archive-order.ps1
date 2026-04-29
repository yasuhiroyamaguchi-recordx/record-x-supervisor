# ===================================================================
# archive-order.ps1
# Record X Supervisor - Order Archive v1.0
#
# Purpose: Archive completed orders from outbox/ to outbox_completed/
#          per year/month/day-bucket structure.
#          Mirror of commander-side complete-ticket.ps1.
#
# Usage:
#   .\sync\sync_script\archive-order.ps1 -Order 12              (single order number)
#   .\sync\sync_script\archive-order.ps1 -Orders 12,13,14       (multiple)
#   .\sync\sync_script\archive-order.ps1 -Order 12 -DryRun
#   .\sync\sync_script\archive-order.ps1 -AutoCommit            (git add + commit)
#
# Prerequisites:
#   - Run from record-x-supervisor root (cwd-independent via $PSScriptRoot)
#   - Order resolved via frontmatter order_number field
#   - Date-bucket: 01-05 / 06-10 / 11-15 / 16-20 / 21-25 / 26-31 (commander convention)
#
# Drafted: 2026-04-28 (Day 130, supervisor session 10:00 onwards)
# Basis: commander#sync-tickets.ps1 + complete-ticket.ps1 templates +
#        outbox/_templates/feedback_to_commander_template.md +
#        operations/implementation_review_pipeline.md (verdict APPROVE archives)
# ===================================================================

param(
    [int]$Order,
    [int[]]$Orders,
    [switch]$DryRun,
    [switch]$VerboseOutput,
    [switch]$AutoCommit,
    [switch]$AutoFromInbox
)

# === cwd-independent: resolve $repoRoot from $PSScriptRoot ===
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# === v1.2: load responds_to normalization helper (EVT-017 fix) ===
. (Join-Path $PSScriptRoot "_helpers\responds_to_normalize.ps1")

# === Configuration ===
$OUTBOX = Join-Path $repoRoot "outbox"
$ARCHIVE_ROOT = Join-Path $repoRoot "outbox_completed"

# === Existence checks ===
if (-not (Test-Path $OUTBOX)) {
    Write-Host "ERROR: outbox/ not found: $OUTBOX" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $ARCHIVE_ROOT)) {
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $ARCHIVE_ROOT | Out-Null
    }
}

# === Resolve order list ===
$orderNumbers = @()
if ($Order) { $orderNumbers += $Order }
if ($Orders) { $orderNumbers += $Orders }
$orderNumbers = @($orderNumbers | Sort-Object -Unique)

if ($orderNumbers.Count -eq 0 -and (-not $AutoFromInbox)) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  -Order <N>           Archive single order"
    Write-Host "  -Orders <N1,N2,...>  Archive multiple orders"
    Write-Host "  -AutoFromInbox       Auto detect archivable orders from inbox/from_commander/"
    Write-Host "                       (verdict APPROVE / APPROVE_WITH_NOTES only)"
    Write-Host "  -DryRun              Preview only"
    Write-Host "  -AutoCommit          Auto git add + commit"
    exit 0
}

# === Helper: Get day-bucket from current day ===
function Get-DayBucket {
    param([int]$Day)

    if ($Day -le 5) { return "01-05" }
    if ($Day -le 10) { return "06-10" }
    if ($Day -le 15) { return "11-15" }
    if ($Day -le 20) { return "16-20" }
    if ($Day -le 25) { return "21-25" }
    return "26-31"
}

# === Helper: Find order file by order_number ===
function Find-OrderFile {
    param([int]$OrderNum)

    $files = Get-ChildItem -Path $OUTBOX -Filter "*_to_commander_*.md" -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        if ($content -match '(?ms)^---\s*\r?\n.*?\border_number:\s*' + $OrderNum + '\b.*?\r?\n---') {
            return $file
        }
    }
    return $null
}

# === Helper: Auto-detect archivable orders from inbox/from_commander/ (v1.1) ===
function Get-ArchivableFromInbox {
    $inboxFromCmd = Join-Path $repoRoot "inbox\from_commander"
    if (-not (Test-Path $inboxFromCmd)) {
        Write-Host "  inbox/from_commander/ not found, skipping AutoFromInbox" -ForegroundColor Yellow
        return @()
    }
    $responses = @(Get-ChildItem -Path $inboxFromCmd -Filter "*.md" -File -Recurse -ErrorAction SilentlyContinue)
    $candidates = @()
    foreach ($r in $responses) {
        $content = Get-Content -Path $r.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        $respondsTo = $null
        $verdict = $null
        $orderNum = $null
        if ($content -match '(?ms)^---\s*\r?\n(.*?)\r?\n---\s*\r?\n') {
            $fm = $matches[1]
            if ($fm -match 'responds_to:\s*([^\r\n]+)') { $respondsTo = $matches[1].Trim() }
            if ($fm -match 'verdict:\s*([^\r\n]+)') { $verdict = $matches[1].Trim() }
            if ($fm -match 'order_number:\s*(\d+)') { $orderNum = [int]$matches[1] }
        }
        if (-not $respondsTo) { continue }
        # Skip if verdict requires more rounds
        if ($verdict -in @('REQUEST_CHANGES', 'REJECT')) {
            if ($VerboseOutput) {
                Write-Host ("  [SKIP-AUTO] {0} verdict={1} (more rounds needed)" -f $respondsTo, $verdict) -ForegroundColor Gray
            }
            continue
        }
        # v1.2: Normalize + try multiple candidate filenames (EVT-017 fix)
        $candidateNames = Get-RespondsToCandidates -Value $respondsTo
        if ($candidateNames.Count -eq 0) {
            if ($VerboseOutput) {
                Write-Host ("  [SKIP-AUTO] {0} (natural language or empty)" -f $respondsTo) -ForegroundColor Gray
            }
            continue
        }
        # Find outbox file by trying each candidate
        $outboxFile = $null
        $resolvedName = $null
        foreach ($cn in $candidateNames) {
            $tryPath = Join-Path $OUTBOX $cn
            if (Test-Path $tryPath) {
                $outboxFile = $tryPath
                $resolvedName = $cn
                break
            }
        }
        if (-not $outboxFile) {
            if ($VerboseOutput) {
                Write-Host ("  [SKIP-AUTO] outbox file not found: {0} (tried {1} candidates)" -f $respondsTo, $candidateNames.Count) -ForegroundColor Gray
            }
            continue
        }
        # Already archived? (check all candidate names)
        $alreadyArchived = $false
        foreach ($cn in $candidateNames) {
            $hits = @(Get-ChildItem -Path $ARCHIVE_ROOT -Filter $cn -File -Recurse -ErrorAction SilentlyContinue)
            if ($hits.Count -gt 0) { $alreadyArchived = $true; break }
        }
        if ($alreadyArchived) {
            if ($VerboseOutput) {
                Write-Host ("  [SKIP-AUTO] already archived: {0}" -f $resolvedName) -ForegroundColor Gray
            }
            continue
        }
        $candidates += @{
            outbox_file = $outboxFile
            outbox_name = $resolvedName
            order_num = $orderNum
            verdict = $verdict
            response_file = $r.Name
        }
    }
    return $candidates
}

# === Main archive flow ===
$now = Get-Date
$year = $now.Year.ToString()
$month = $now.Month.ToString("00")
$dayBucket = Get-DayBucket -Day $now.Day

Write-Host ""
Write-Host "=== Order Archive (v1.1) ===" -ForegroundColor Cyan
Write-Host "Outbox:           $OUTBOX"
Write-Host "Archive root:     $ARCHIVE_ROOT"
Write-Host "Target bucket:    $year\$month\$dayBucket"

# v1.1: AutoFromInbox mode — detect archivable orders from inbox/from_commander/ verdicts
if ($AutoFromInbox) {
    Write-Host "Mode:             AutoFromInbox (verdict-driven)" -ForegroundColor Cyan
    $autoCandidates = Get-ArchivableFromInbox
    Write-Host ("Auto-detected:    {0} archivable order(s) from response verdicts" -f $autoCandidates.Count) -ForegroundColor Cyan
    foreach ($c in $autoCandidates) {
        if ($c.order_num) {
            $orderNumbers = @($orderNumbers + $c.order_num)
        }
    }
    $orderNumbers = @($orderNumbers | Sort-Object -Unique)
}

Write-Host "Order numbers:    $($orderNumbers -join ', ')"
Write-Host ""

$archivedCount = 0
$missingCount = 0
$archivedFiles = @()

foreach ($orderNum in $orderNumbers) {
    $orderFile = Find-OrderFile -OrderNum $orderNum
    if (-not $orderFile) {
        Write-Host "  [MISS] Order #$orderNum not found in outbox/" -ForegroundColor Yellow
        $missingCount++
        continue
    }

    $destDir = Join-Path $ARCHIVE_ROOT "$year\$month\$dayBucket"
    $destPath = Join-Path $destDir $orderFile.Name

    if (Test-Path $destPath) {
        Write-Host "  [SKIP] Already archived: $($orderFile.Name)" -ForegroundColor Gray
        continue
    }

    if ($DryRun) {
        Write-Host "  [DRY] Order #${orderNum}: $($orderFile.Name) -> $destDir" -ForegroundColor Yellow
        $archivedCount++
        continue
    }

    # Create archive subdir
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    }

    # Move (git mv if tracked, else Move-Item)
    try {
        $isTracked = $false
        Push-Location $repoRoot
        $gitStatus = & git ls-files --error-unmatch $orderFile.FullName 2>$null
        if ($LASTEXITCODE -eq 0) {
            $isTracked = $true
        }
        Pop-Location

        if ($isTracked) {
            Push-Location $repoRoot
            $relSrc = $orderFile.FullName.Substring($repoRoot.Length + 1)
            $relDst = $destPath.Substring($repoRoot.Length + 1)
            & git mv $relSrc $relDst 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) {
                # Fallback to Move-Item
                Move-Item -Path $orderFile.FullName -Destination $destPath -Force
            }
            Pop-Location
        } else {
            Move-Item -Path $orderFile.FullName -Destination $destPath -Force
        }

        Write-Host "  [OK]   Order #${orderNum}: $($orderFile.Name) -> $year\$month\$dayBucket\" -ForegroundColor Green
        $archivedCount++
        $archivedFiles += @{
            order_number = $orderNum
            file = $orderFile.Name
            destination = "outbox_completed/$year/$month/$dayBucket/$($orderFile.Name)"
            archived_at = $now.ToString("yyyy-MM-ddTHH:mm:sszzz")
        }
    }
    catch {
        Write-Host "  [FAIL] Order #${orderNum}: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# === AutoCommit ===
if ($AutoCommit -and (-not $DryRun) -and $archivedCount -gt 0) {
    Push-Location $repoRoot
    try {
        & git add outbox/ outbox_completed/ 2>&1 | Out-Null
        $orderList = ($archivedFiles | ForEach-Object { "#$($_.order_number)" }) -join ", "
        $commitMsg = "archive: orders $orderList -> outbox_completed/$year/$month/$dayBucket/"
        & git commit -m $commitMsg 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Auto-committed: $commitMsg" -ForegroundColor Green
        } else {
            Write-Host "WARNING: git commit failed (no changes or error)" -ForegroundColor Yellow
        }
    }
    finally {
        Pop-Location
    }
}

# === Result summary ===
Write-Host ""
Write-Host "=== Result ===" -ForegroundColor Cyan
Write-Host "Archived: $archivedCount" -ForegroundColor Green
if ($missingCount -gt 0) {
    Write-Host "Missing:  $missingCount" -ForegroundColor Yellow
}

if ($DryRun) {
    Write-Host "[DRY RUN] No files moved." -ForegroundColor Yellow
}

exit 0
