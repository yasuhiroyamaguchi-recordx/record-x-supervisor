# ===================================================================
# order-stale-alert.ps1
# Record X Supervisor - Order Stale Alert v1.1 (idempotency fix)
#
# v1.1 changes (EVT-016 garage doctrine 1.5 + ESC file pollution fix):
#   - ESC filename state-based (no timestamp) -> idempotent
#   - Auto-cleanup resolved escalations (response found / deadline cleared)
#   - Auto-cleanup legacy timestamp-based ESC files (one-time at first v1.1 run)
#
# Purpose: Detect stale orders (deadline overdue, response missing,
#          dialogue stagnation) and trigger Yasu escalation per
#          operations/escalation_and_rollback.md sections R1-R7/Y1-Y6.
#
# Usage:
#   .\sync\sync_script\order-stale-alert.ps1                  (normal run)
#   .\sync\sync_script\order-stale-alert.ps1 -DryRun          (preview only)
#   .\sync\sync_script\order-stale-alert.ps1 -Quiet           (silent unless alert)
#   .\sync\sync_script\order-stale-alert.ps1 -CommanderRoot <path>
#
# Prerequisites:
#   - Run from record-x-supervisor root (cwd-independent via $PSScriptRoot)
#   - operations/escalation_and_rollback.md v1.0 confirmed
#   - Frontmatter format per communication_protocol.md section 3.2-A
#
# Detection rules (escalation_and_rollback.md v1.0):
#   - Y3: Order deadline overdue (immediate ERROR)
#   - Yellow: Response missing > 6h after order placement (WARN)
#   - Yellow: Round-trip 0 in last 7 days (WARN, dialogue stagnation)
#   - Info: Order placed but commander has not committed receipt
#
# Phase-switching pause: respects sync/sync_script/stale-alert-pause.flag
# (P5 adoption, applies during Phase transitions to avoid false positives).
#
# Drafted: 2026-04-28 (Day 130, supervisor session 10:00 onwards)
# Basis: Order #11 adoption 6 (deadline frontmatter) + Order #13 instruction 1-D +
#        operations/escalation_and_rollback.md sections 2-A/2-B + P6 +
#        outbox/_templates/feedback_to_commander_template.md
# ===================================================================

param(
    [switch]$DryRun,
    [switch]$Quiet,
    [switch]$VerboseOutput,
    [string]$CommanderRoot = "C:\RX_Dev\record-x-commander",
    [int]$ResponseMissingThresholdHours = 6,
    [int]$DialogueStagnationDays = 7
)

# === cwd-independent: resolve $repoRoot from $PSScriptRoot ===
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# === v1.2: load responds_to normalization helper (EVT-017 fix) ===
. (Join-Path $PSScriptRoot "_helpers\responds_to_normalize.ps1")

# === Configuration ===
$OUTBOX = Join-Path $repoRoot "outbox"
$INBOX_FROM_CMD = Join-Path $repoRoot "inbox\from_commander"
$COMMANDER_INBOX = Join-Path $CommanderRoot "inbox"
$COMMANDER_INDEX = Join-Path $CommanderRoot "index"
$ESCALATIONS_DIR = Join-Path $repoRoot "inbox\escalations"
$PAUSE_FLAG = Join-Path $repoRoot "sync\sync_script\stale-alert-pause.flag"

# === Pause flag check (P5 phase-switching) ===
if (Test-Path $PAUSE_FLAG) {
    if (-not $Quiet) {
        Write-Host "INFO: stale-alert-pause.flag present, skipping checks." -ForegroundColor Gray
        Write-Host "      Reason: $(Get-Content $PAUSE_FLAG -Raw 2>$null)" -ForegroundColor Gray
    }
    exit 0
}

# === Existence checks ===
if (-not (Test-Path $OUTBOX)) {
    Write-Host "ERROR: outbox/ not found: $OUTBOX" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $ESCALATIONS_DIR)) {
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $ESCALATIONS_DIR | Out-Null
    }
}

# === v1.1: Cleanup legacy timestamp-based ESC files (one-time, EVT-016 ESC pollution fix) ===
# Pattern: ESC-{8digit}-{6digit}-Y{type}-*.md  (legacy v1.0)
# Replace with: ESC-Y{type}-*.md (state-based v1.1)
if ((Test-Path $ESCALATIONS_DIR) -and (-not $DryRun)) {
    $legacyEscFiles = @(Get-ChildItem -Path $ESCALATIONS_DIR -Filter "ESC-2*.md" -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '^ESC-\d{8}-\d{6}-' })
    if ($legacyEscFiles.Count -gt 0) {
        if (-not $Quiet) {
            Write-Host ("INFO: cleanup {0} legacy timestamp-based ESC files (v1.0 -> v1.1 idempotency fix)" -f $legacyEscFiles.Count) -ForegroundColor Cyan
        }
        foreach ($f in $legacyEscFiles) { Remove-Item -Path $f.FullName -Force }
    }
}

# === Helper: Parse frontmatter from markdown file ===
function Parse-OrderFrontmatter {
    param([string]$FilePath)

    $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
    $result = @{
        deadline = $null
        order_number = $null
        discussion_scale = $null
        is_draft = $false
        responds_to = $null
    }

    if ($content -match '(?ms)^---\s*\r?\n(.*?)\r?\n---\s*\r?\n') {
        $fm = $matches[1]
        if ($fm -match 'deadline:\s*([^\r\n]+)') {
            $result.deadline = $matches[1].Trim()
        }
        if ($fm -match 'order_number:\s*(\d+)') {
            $result.order_number = $matches[1]
        }
        if ($fm -match 'discussion_scale:\s*([^\r\n]+)') {
            $result.discussion_scale = $matches[1].Trim()
        }
        if ($fm -match 'responds_to:\s*([^\r\n]+)') {
            $result.responds_to = $matches[1].Trim()
        }
        if ($fm -match '(?im)^\s*status:\s*draft\s*$') {
            $result.is_draft = $true
        }
    }

    return $result
}

# === Helper: Parse deadline string to DateTime ===
function Parse-Deadline {
    param([string]$DeadlineStr)

    if (-not $DeadlineStr -or $DeadlineStr -eq 'none') {
        return $null
    }

    # Try common formats
    $formats = @(
        'yyyy-MM-dd HH:mm "JST"',
        'yyyy-MM-dd HH:mm',
        'yyyy-MM-dd'
    )

    foreach ($fmt in $formats) {
        try {
            $dt = [datetime]::ParseExact($DeadlineStr, $fmt, [Globalization.CultureInfo]::InvariantCulture)
            return $dt
        } catch {}
    }

    # Fallback: generic parse
    try {
        return [datetime]::Parse($DeadlineStr)
    } catch {
        return $null
    }
}

# === Helper: Emit escalation file ===
function Emit-Escalation {
    param(
        [string]$EscalationId,
        [string]$Severity,
        [string]$Trigger,
        [hashtable]$Details
    )

    $fileName = "$EscalationId.md"
    $filePath = Join-Path $ESCALATIONS_DIR $fileName

    if (Test-Path $filePath) {
        # Already emitted, do not re-emit
        return $false
    }

    if ($DryRun) {
        Write-Host "  [DRY] Would emit: $fileName" -ForegroundColor Yellow
        return $true
    }

    $detailsLines = $Details.GetEnumerator() | ForEach-Object {
        "- $($_.Key): $($_.Value)"
    }

    $content = @"
---
escalation_id: $EscalationId
severity: $Severity
trigger: $Trigger
detected_at: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:sszzz')
detected_by: order-stale-alert.ps1 v1.0
---

# Escalation: $EscalationId

**Severity**: $Severity
**Trigger**: $Trigger
**Detected at**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss JST')
**Detected by**: ``sync/sync_script/order-stale-alert.ps1`` v1.0

## Details

$($detailsLines -join "`n")

## Recommended Action (Supervisor view)

See ``operations/escalation_and_rollback.md`` section 3 for notification channels and section 4 for rollback protocol.

For trigger '$Trigger', refer to:
- R1-R7 (red): three-party halt + Yasu notification
- Y1-Y6 (yellow): Yasu notification + stage-hold
- Info: record only

## Yasu Decision Required

If severity is red, three-party halt is auto-triggered (commander side ``staging/.three_party_halt.lock``).
Yasu decision needed before recovery per section 5 recovery protocol.
"@

    Set-Content -Path $filePath -Value $content -Encoding UTF8
    return $true
}

# === Main scan ===
$now = Get-Date
$alertCount = 0
$infoCount = 0

if (-not $Quiet) {
    Write-Host ""
    Write-Host "=== Order Stale Alert (v1.0) ===" -ForegroundColor Cyan
    Write-Host "Outbox:           $OUTBOX"
    Write-Host "Commander inbox:  $COMMANDER_INBOX"
    Write-Host "Commander index:  $COMMANDER_INDEX"
    Write-Host "Escalations dir:  $ESCALATIONS_DIR"
    Write-Host ""
}

# === Scan 1: Deadline overdue (Y3 trigger) ===
$outboxFiles = Get-ChildItem -Path $OUTBOX -Filter "*_to_commander_*.md" -File -ErrorAction SilentlyContinue
foreach ($file in $outboxFiles) {
    $fm = Parse-OrderFrontmatter -FilePath $file.FullName
    if ($fm.is_draft) { continue }

    $deadline = Parse-Deadline -DeadlineStr $fm.deadline
    if (-not $deadline) { continue }

    if ($now -gt $deadline) {
        # Check if response exists (search inbox/from_commander/ for responds_to == this filename)
        $responseFound = $false
        if (Test-Path $INBOX_FROM_CMD) {
            # v1.2: normalize matching - check each response's responds_to via candidate list (EVT-017 fix)
            $responses = Get-ChildItem -Path $INBOX_FROM_CMD -Filter "*.md" -Recurse -File -ErrorAction SilentlyContinue
            foreach ($r in $responses) {
                $rContent = Get-Content -Path $r.FullName -Raw -Encoding UTF8
                if ($rContent -match '(?im)^\s*responds_to:\s*(.+?)\s*$') {
                    $rRespondsTo = $matches[1].Trim()
                    $rCandidates = Get-RespondsToCandidates -Value $rRespondsTo
                    if ($rCandidates -contains $file.Name) {
                        $responseFound = $true
                        break
                    }
                }
            }
        }

        if (-not $responseFound) {
            # v1.1: state-based naming (idempotent)
            $escalationId = "ESC-Y3-$($file.BaseName)"
            $details = @{
                order_file = $file.Name
                order_number = $fm.order_number
                deadline = $fm.deadline
                deadline_parsed = $deadline.ToString('yyyy-MM-dd HH:mm:ss')
                detected_now = $now.ToString('yyyy-MM-dd HH:mm:ss')
                overdue_minutes = [math]::Round(($now - $deadline).TotalMinutes)
                response_found = $false
            }
            $emitted = Emit-Escalation -EscalationId $escalationId -Severity "red" -Trigger "Y3 (deadline overdue)" -Details $details
            if ($emitted) {
                if (-not $Quiet) {
                    Write-Host "  [RED] Y3: $($file.Name) deadline overdue by $($details.overdue_minutes) minutes" -ForegroundColor Red
                }
                $alertCount++
            }
        }
    }
}

# === Scan 2: Response missing > N hours (yellow) ===
foreach ($file in $outboxFiles) {
    $fm = Parse-OrderFrontmatter -FilePath $file.FullName
    if ($fm.is_draft) { continue }

    # Skip if order placed less than threshold hours ago
    $age = $now - $file.LastWriteTime
    if ($age.TotalHours -lt $ResponseMissingThresholdHours) { continue }

    # Skip if deadline already overdue (Y3 already handles)
    $deadline = Parse-Deadline -DeadlineStr $fm.deadline
    if ($deadline -and $now -gt $deadline) { continue }

    # Skip if commander has not yet received (file not in commander inbox)
    $cmdInboxPath = Join-Path $COMMANDER_INBOX $file.Name
    if (-not (Test-Path $cmdInboxPath)) { continue }

    # Check if response exists
    $responseFound = $false
    if (Test-Path $INBOX_FROM_CMD) {
        $responses = Get-ChildItem -Path $INBOX_FROM_CMD -Filter "*.md" -Recurse -File -ErrorAction SilentlyContinue
        foreach ($r in $responses) {
            $rContent = Get-Content -Path $r.FullName -Raw -Encoding UTF8
            if ($rContent -match "responds_to:\s*$([regex]::Escape($file.Name))") {
                $responseFound = $true
                break
            }
        }
    }

    if (-not $responseFound) {
        # Yellow alert (response missing for > N hours, deadline not yet reached)
        # v1.1: state-based naming (idempotent)
        $escalationId = "ESC-Yresp-$($file.BaseName)"
        $details = @{
            order_file = $file.Name
            order_number = $fm.order_number
            placed_at = $file.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
            age_hours = [math]::Round($age.TotalHours, 1)
            threshold_hours = $ResponseMissingThresholdHours
            deadline = $fm.deadline
        }
        $emitted = Emit-Escalation -EscalationId $escalationId -Severity "yellow" -Trigger "Response missing > ${ResponseMissingThresholdHours}h" -Details $details
        if ($emitted) {
            if (-not $Quiet) {
                Write-Host "  [YEL] Response missing: $($file.Name) age $($details.age_hours)h" -ForegroundColor Yellow
            }
            $alertCount++
        }
    }
}

# === Scan 3: Dialogue stagnation (no orders + no responses in last N days) ===
$cutoff = $now.AddDays(-$DialogueStagnationDays)
$recentOrders = @($outboxFiles | Where-Object { $_.LastWriteTime -gt $cutoff })
$recentResponses = @()
if (Test-Path $INBOX_FROM_CMD) {
    $recentResponses = @(Get-ChildItem -Path $INBOX_FROM_CMD -Filter "*.md" -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -gt $cutoff })
}

if ($recentOrders.Count -eq 0 -and $recentResponses.Count -eq 0) {
    # v1.1: state-based naming (idempotent, single Ystag at any time)
    $escalationId = "ESC-Ystag"
    $details = @{
        window_days = $DialogueStagnationDays
        recent_orders = 0
        recent_responses = 0
        cutoff = $cutoff.ToString('yyyy-MM-dd HH:mm:ss')
    }
    $emitted = Emit-Escalation -EscalationId $escalationId -Severity "yellow" -Trigger "Dialogue stagnation ${DialogueStagnationDays}d 0 events" -Details $details
    if ($emitted) {
        if (-not $Quiet) {
            Write-Host "  [YEL] Dialogue stagnation: 0 orders + 0 responses in last $DialogueStagnationDays days" -ForegroundColor Yellow
        }
        $alertCount++
    }
}

# === v1.1: Cleanup resolved escalations (auto-clear when state resolves) ===
$resolvedCount = 0
if ((Test-Path $ESCALATIONS_DIR) -and (-not $DryRun)) {
    $existingEscs = @(Get-ChildItem -Path $ESCALATIONS_DIR -Filter "ESC-*.md" -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '^ESC-(Y3|Yresp|Ystag)' })

    foreach ($esc in $existingEscs) {
        $name = $esc.Name
        $resolved = $false

        if ($name -match '^ESC-Y3-(.+)\.md$' -or $name -match '^ESC-Yresp-(.+)\.md$') {
            # v1.2: normalize matching with helper (EVT-017 fix)
            $orderBase = $matches[1]
            $orderFileName = "$orderBase.md"
            if (Test-Path $INBOX_FROM_CMD) {
                $responses = Get-ChildItem -Path $INBOX_FROM_CMD -Filter "*.md" -Recurse -File -ErrorAction SilentlyContinue
                foreach ($r in $responses) {
                    $rContent = Get-Content -Path $r.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
                    if (-not $rContent) { continue }
                    if ($rContent -match '(?im)^\s*responds_to:\s*(.+?)\s*$') {
                        $rRespondsTo = $matches[1].Trim()
                        $rCandidates = Get-RespondsToCandidates -Value $rRespondsTo
                        if ($rCandidates -contains $orderFileName) {
                            $resolved = $true
                            break
                        }
                    }
                }
            }
        } elseif ($name -eq 'ESC-Ystag.md') {
            # Resolved if any order or response in last DialogueStagnationDays
            $cutoffNow = $now.AddDays(-$DialogueStagnationDays)
            $hasRecentOrder = @($outboxFiles | Where-Object { $_.LastWriteTime -gt $cutoffNow }).Count -gt 0
            $hasRecentResponse = $false
            if (Test-Path $INBOX_FROM_CMD) {
                $hasRecentResponse = @(Get-ChildItem -Path $INBOX_FROM_CMD -Filter "*.md" -Recurse -File -ErrorAction SilentlyContinue |
                    Where-Object { $_.LastWriteTime -gt $cutoffNow }).Count -gt 0
            }
            if ($hasRecentOrder -or $hasRecentResponse) { $resolved = $true }
        }

        if ($resolved) {
            Remove-Item -Path $esc.FullName -Force
            $resolvedCount++
            if (-not $Quiet) {
                Write-Host "  [RESOLVED] cleared $name" -ForegroundColor Green
            }
        }
    }
}

# === Result summary ===
if (-not $Quiet) {
    Write-Host ""
    Write-Host "=== Result ===" -ForegroundColor Cyan
    if ($resolvedCount -gt 0) {
        Write-Host "Resolved cleared: $resolvedCount" -ForegroundColor Green
    }
    Write-Host "Alerts emitted:  $alertCount" -ForegroundColor $(if ($alertCount -gt 0) { "Yellow" } else { "Green" })
    Write-Host "Info recorded:   $infoCount"
    Write-Host ""
    if ($alertCount -gt 0) {
        Write-Host "Escalations saved to: $ESCALATIONS_DIR" -ForegroundColor Cyan
        Write-Host "Next: review escalation files and decide rollback action per" -ForegroundColor Cyan
        Write-Host "      operations/escalation_and_rollback.md sections 4-5" -ForegroundColor Cyan
    }
}

if ($DryRun) {
    Write-Host "[DRY RUN] No files written." -ForegroundColor Yellow
    exit 0
}

# Exit codes per stale-alert.ps1 convention
if ($alertCount -gt 0) { exit 2 }
exit 0
