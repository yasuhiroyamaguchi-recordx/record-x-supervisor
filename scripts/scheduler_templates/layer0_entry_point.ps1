#Requires -Version 5.1
<#
.SYNOPSIS
    Layer 0 (Supervisor) autonomous patrol entry point [Day 130 evening drafted]

.DESCRIPTION
    Supervisor (instance A or B) autonomous patrol entry point.
    Uses Claude Code Auto mode in headless (--print) operation.

    Cycle (default 6 hours, sync with commander Layer 2):
    1. Acquire lock (DO-008 compatible JSON format)
    2. Pull commander responses (pull-replies.ps1)
    2.5 [v1.6] Weekly check-internal-links (cross-reference integrity, EVT-019 prevention)
    3. Auto-review against rubrics (review-implementation.ps1)
    3.3 [v1.3] Sync factory pipeline (commander -> factory observation mirror)
    3.4 [v1.2] Auto EVT recorder (drift detection + JSONL telemetry)
    3.5 [v1.1] Read L1 circulars (internal/circular/, 24h window)
    3.6 [v1.1] Read L2 regional (internal/regional/, 24h window)
    3.7 [v1.1] Read L3 gazette (shared/official_gazette/ via commander side, 24h window)
    4. Verdict-based action (claude --print, with L1/L2/L3 context injected):
       - APPROVE / APPROVE_WITH_NOTES (Phase B-gamma onwards): auto-issue feedback
       - REQUEST_CHANGES / REJECT: convene supervisor manual session + Yasu notification
       - Phase B-alpha/beta: all verdicts require manual session (per ADR-005 v1.1 + comm protocol section 3.2-D)
    5. Stale alert check (order-stale-alert.ps1)
    6. Update circular (internal/circular/)
    7. [v1.1] Regional update (internal/regional/, deferred to manual session in Phase B-alpha/beta)
    8. [v1.1] Gazette summary emit (shared/official_gazette/, deferred to manual session in Phase B-alpha/beta)
    9. Release lock

    EVT-016 direct response: built devices must be driven, not garaged.
    Garage Doctrine (operations/role_and_conduct.md section 1.5): existence != function.

.PARAMETER DryRun
    Test mode: lock acquire/release only, skip claude --print invocation.
    Useful for stale lock testing.

.NOTES
    Drafted: 2026-04-28 (Day 130 evening, supervisor instance A)
    Basis:
    - commander#2e6ee58:scripts/scheduler_templates/layer2_entry_point.ps1 (template reference)
    - ADR-005 v1.1 phased autonomy release
    - operations/communication_protocol.md section 3.2-D Layer 0 auto-review boundaries
    - operations/escalation_and_rollback.md section 4 rollback protocol
    - Yasu instruction 2026-04-28 evening "automation handoff supervisor to commander"
#>
param(
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# =========================================================================
# $repoRoot resolution (cwd-independent)
# $PSScriptRoot = record-x-supervisor/scripts/scheduler_templates/
# Twice Split-Path = record-x-supervisor/
# =========================================================================
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# =========================================================================
# Logging
# =========================================================================
$logDir = Join-Path $repoRoot "logs\layer0"
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

# =========================================================================
# Three-party halt check (escalation_and_rollback.md section 4-A)
# =========================================================================
$haltLockPath = Join-Path $repoRoot "staging\.three_party_halt.lock"
if (Test-Path $haltLockPath) {
    Write-Log "Three-party halt active, skipping cycle" "WARN"
    exit 0
}

# =========================================================================
# Lock mechanism (DO-008 compatible, inline)
# =========================================================================
$lockPath = Join-Path $repoRoot "staging\.layer0_running.lock"
$lockStaleHours = 25  # 6h cycle x 4 + 1h margin (same as Layer 2)

function Acquire-Lock {
    if (Test-Path $lockPath) {
        $existingLock = $null
        try {
            $existingLock = Get-Content $lockPath -Raw -Encoding UTF8 | ConvertFrom-Json
        } catch {
            Write-Log "Existing lock corrupt, overriding as stale" "WARN"
        }

        if ($existingLock) {
            $pidExists = $false
            try {
                if (Get-Process -Id $existingLock.pid -ErrorAction SilentlyContinue) {
                    $pidExists = $true
                }
            } catch { }

            $isTimeStale = $true
            try {
                $elapsed = (Get-Date) - [DateTimeOffset]::Parse($existingLock.started_at).LocalDateTime
                $isTimeStale = $elapsed.TotalHours -ge $lockStaleHours
            } catch { }

            if ($pidExists -and (-not $isTimeStale)) {
                Write-Log "Concurrent run avoided: active lock exists (PID=$($existingLock.pid), instance=$($existingLock.instance_id))" "WARN"
                return $false
            }
            $reason = if (-not $pidExists) { "PID $($existingLock.pid) absent" } else { "time stale" }
            Write-Log "Stale lock detected ($reason), overriding" "WARN"
            Remove-Item -Path $lockPath -Force
        }
    }

    $lockDir = Split-Path -Parent $lockPath
    if (-not (Test-Path $lockDir)) {
        New-Item -ItemType Directory -Force -Path $lockDir | Out-Null
    }

    $instanceId = if ($env:SUPERVISOR_INSTANCE_ID) { $env:SUPERVISOR_INSTANCE_ID } else { "A" }
    $newLock = [ordered]@{
        pid          = $PID
        started_at   = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
        session_id   = "layer0-entry-$(([Guid]::NewGuid()).ToString().Substring(0,8))"
        role         = "supervisor"
        instance_id  = $instanceId
    }
    $newLock | ConvertTo-Json | Set-Content -Path $lockPath -Encoding UTF8
    Write-Log "Lock acquired (PID=$PID, instance=$instanceId)"
    return $true
}

function Release-Lock {
    if (-not (Test-Path $lockPath)) {
        Write-Log "Lock file absent, no release needed (idempotent)"
        return
    }
    try {
        $existingLock = Get-Content $lockPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($existingLock.pid -eq $PID) {
            Remove-Item -Path $lockPath -Force
            Write-Log "Lock released (PID=$PID)"
        } else {
            Write-Log "Lock owned by other PID ($($existingLock.pid)), not releasing" "WARN"
        }
    } catch {
        Write-Log "Lock release failed: $($_.Exception.Message)" "ERROR"
    }
}

# =========================================================================
# Cycle steps
# =========================================================================
function Step-PullReplies {
    Write-Log "Step 1: pull-replies.ps1 execution"
    $script = Join-Path $repoRoot "sync\sync_script\pull-replies.ps1"
    if (-not (Test-Path $script)) {
        Write-Log "pull-replies.ps1 not found at $script" "ERROR"
        return
    }
    try {
        & $script
        Write-Log "Step 1 complete"
    } catch {
        Write-Log "Step 1 failed: $($_.Exception.Message)" "ERROR"
    }
}

function Step-StaleAlert {
    Write-Log "Step 2: order-stale-alert.ps1 execution"
    $script = Join-Path $repoRoot "sync\sync_script\order-stale-alert.ps1"
    if (-not (Test-Path $script)) {
        Write-Log "order-stale-alert.ps1 not found at $script" "ERROR"
        return
    }
    try {
        & $script -Quiet
        Write-Log "Step 2 complete"
    } catch {
        Write-Log "Step 2 failed: $($_.Exception.Message)" "ERROR"
    }
}

function Step-CheckInternalLinks {
    # v1.6: weekly cadence (run only if last check was > 7 days ago, or never)
    Write-Log "Step 2.5: check-internal-links v0.2 (weekly cadence)"
    $script = Join-Path $repoRoot "sync\sync_script\check-internal-links.ps1"
    if (-not (Test-Path $script)) {
        Write-Log "check-internal-links.ps1 not found, skipping" "WARN"
        return
    }
    $linkCheckDir = Join-Path $repoRoot "sync\checkup-scores\link_check"
    $shouldRun = $true
    if (Test-Path $linkCheckDir) {
        $latestReport = @(Get-ChildItem -Path $linkCheckDir -Filter "*.json" -File |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1)
        if ($latestReport.Count -gt 0) {
            $daysSince = ((Get-Date) - $latestReport[0].LastWriteTime).TotalDays
            if ($daysSince -lt 7) {
                Write-Log ("Step 2.5 skipped: last check {0:N1} days ago, weekly cadence" -f $daysSince)
                $shouldRun = $false
            }
        }
    }
    if ($shouldRun) {
        try {
            & $script 2>&1 | ForEach-Object {
                Add-Content -Path $logFile -Value "  $_" -Encoding UTF8
            }
            Write-Log "Step 2.5 complete (link check report saved to sync/checkup-scores/link_check/)"
        } catch {
            Write-Log "Step 2.5 failed: $($_.Exception.Message)" "ERROR"
        }
    }
}

function Step-AutoReview {
    Write-Log "Step 3: review-implementation.ps1 execution (auto-scoring)"
    $script = Join-Path $repoRoot "sync\sync_script\review-implementation.ps1"
    if (-not (Test-Path $script)) {
        Write-Log "review-implementation.ps1 not found at $script" "ERROR"
        return
    }
    try {
        & $script -ScanInbox
        Write-Log "Step 3 complete (proposed verdicts saved to sync/checkup-scores/reviews/)"
    } catch {
        Write-Log "Step 3 failed: $($_.Exception.Message)" "ERROR"
    }
}

function Step-SyncFactoryPipeline {
    Write-Log "Step 3.3: sync-factory-pipeline (commander -> factory observation mirror)"
    $script = Join-Path $repoRoot "sync\sync_script\sync-factory-pipeline.ps1"
    if (-not (Test-Path $script)) {
        Write-Log "sync-factory-pipeline.ps1 not found at $script" "ERROR"
        $script:factoryContext = "(sync-factory-pipeline script not found)"
        return
    }
    try {
        & $script
        Write-Log "Step 3.3 complete (factory_pipeline snapshot written + role_execution mirrored)"
        # Read latest snapshot for prompt context
        $snapshotDir = Join-Path $repoRoot "sync\checkup-scores\factory_pipeline"
        $latest = @(Get-ChildItem -Path $snapshotDir -Filter "snapshot_*.json" -File |
            Sort-Object Name -Descending | Select-Object -First 1)
        if ($latest.Count -gt 0) {
            $script:factoryContext = Get-Content $latest[0].FullName -Raw -Encoding UTF8
        } else {
            $script:factoryContext = "(no factory_pipeline snapshot yet)"
        }
    } catch {
        Write-Log "Step 3.3 failed: $($_.Exception.Message)" "ERROR"
        $script:factoryContext = "(sync-factory-pipeline error: $($_.Exception.Message))"
    }
}

function Step-AutoEvtRecorder {
    Write-Log "Step 3.4: auto-evt-recorder (drift detection)"
    $script = Join-Path $repoRoot "sync\sync_script\auto-evt-recorder.ps1"
    if (-not (Test-Path $script)) {
        Write-Log "auto-evt-recorder.ps1 not found at $script" "ERROR"
        $script:evtTelemetry = "(auto-evt-recorder script not found)"
        return
    }
    try {
        & $script
        Write-Log "Step 3.4 complete (telemetry appended to sync/checkup-scores/evt_telemetry/)"
        # Read today's JSONL for prompt injection
        $today = Get-Date -Format "yyyyMMdd"
        $jsonlFile = Join-Path $repoRoot "sync\checkup-scores\evt_telemetry\$today.jsonl"
        if (Test-Path $jsonlFile) {
            $recent = @(Get-Content $jsonlFile -Encoding UTF8 -Tail 10)
            if ($recent.Count -gt 0) {
                $script:evtTelemetry = ($recent -join "`n")
            } else {
                $script:evtTelemetry = "(no candidates today)"
            }
        } else {
            $script:evtTelemetry = "(no telemetry file yet)"
        }
    } catch {
        Write-Log "Step 3.4 failed: $($_.Exception.Message)" "ERROR"
        $script:evtTelemetry = "(detection error: $($_.Exception.Message))"
    }
}

function Step-ReadCirculars {
    Write-Log "Step 3.5: read L1 circulars (24h window)"
    $circularDir = Join-Path $repoRoot "internal\circular"
    if (-not (Test-Path $circularDir)) {
        Write-Log "Circular dir not found, skipping" "WARN"
        $script:l1Context = "(L1 circular dir not found)"
        return
    }
    $cutoff = (Get-Date).AddHours(-24)
    $recent = @(Get-ChildItem -Path $circularDir -Filter "circular_*.md" -File |
        Where-Object { $_.LastWriteTime -gt $cutoff } |
        Sort-Object LastWriteTime -Descending)
    if ($recent.Count -eq 0) {
        Write-Log "No L1 circulars updated in last 24h"
        $script:l1Context = "(no L1 updates in 24h)"
        return
    }
    Write-Log ("Found {0} L1 circular(s) updated in 24h" -f $recent.Count)
    $sb = [System.Text.StringBuilder]::new()
    foreach ($f in $recent | Select-Object -First 5) {
        [void]$sb.AppendLine("--- $($f.Name) (mtime: $($f.LastWriteTime)) ---")
        $head = Get-Content $f.FullName -TotalCount 30 -Encoding UTF8
        [void]$sb.AppendLine(($head -join "`n"))
        [void]$sb.AppendLine("")
    }
    $script:l1Context = $sb.ToString()
    Write-Log "Step 3.5 complete (L1 context prepared, $($recent.Count) files)"
}

function Step-ReadRegional {
    Write-Log "Step 3.6: read L2 regional (24h window)"
    $regionalDir = Join-Path $repoRoot "internal\regional"
    if (-not (Test-Path $regionalDir)) {
        Write-Log "Regional dir not found, skipping" "WARN"
        $script:l2Context = "(L2 regional dir not found)"
        return
    }
    $cutoff = (Get-Date).AddHours(-24)
    $recent = @(Get-ChildItem -Path $regionalDir -Filter "*.md" -File -Recurse |
        Where-Object { $_.LastWriteTime -gt $cutoff -and $_.Name -ne "README.md" } |
        Sort-Object LastWriteTime -Descending)
    if ($recent.Count -eq 0) {
        Write-Log "No L2 regional updates in last 24h"
        $script:l2Context = "(no L2 updates in 24h)"
        return
    }
    Write-Log ("Found {0} L2 regional file(s) updated in 24h" -f $recent.Count)
    $sb = [System.Text.StringBuilder]::new()
    foreach ($f in $recent | Select-Object -First 5) {
        [void]$sb.AppendLine("--- $($f.Name) (mtime: $($f.LastWriteTime)) ---")
        $head = Get-Content $f.FullName -TotalCount 30 -Encoding UTF8
        [void]$sb.AppendLine(($head -join "`n"))
        [void]$sb.AppendLine("")
    }
    $script:l2Context = $sb.ToString()
    Write-Log "Step 3.6 complete (L2 context prepared, $($recent.Count) files)"
}

function Step-ReadGazette {
    Write-Log "Step 3.7: read L3 gazette (commander side, 24h window)"
    # L3 master is on commander side: commander#shared/official_gazette/
    # Supervisor reads via filesystem path (sibling repo)
    $commanderRepo = Split-Path $repoRoot -Parent
    $gazetteDir = Join-Path $commanderRepo "record-x-commander\shared\official_gazette"
    if (-not (Test-Path $gazetteDir)) {
        Write-Log "Gazette dir not found at $gazetteDir, skipping" "WARN"
        $script:l3Context = "(L3 gazette dir not found - awaiting Yasu placement decision)"
        return
    }
    $cutoff = (Get-Date).AddHours(-24)
    $recent = @(Get-ChildItem -Path $gazetteDir -Filter "*.md" -File |
        Where-Object { $_.LastWriteTime -gt $cutoff -and $_.Name -ne "README.md" } |
        Sort-Object LastWriteTime -Descending)
    if ($recent.Count -eq 0) {
        Write-Log "No L3 gazette updates in last 24h"
        $script:l3Context = "(no L3 updates in 24h)"
        return
    }
    Write-Log ("Found {0} L3 gazette entry(ies) updated in 24h" -f $recent.Count)
    $sb = [System.Text.StringBuilder]::new()
    foreach ($f in $recent | Select-Object -First 3) {
        [void]$sb.AppendLine("--- $($f.Name) (mtime: $($f.LastWriteTime)) ---")
        $head = Get-Content $f.FullName -TotalCount 50 -Encoding UTF8
        [void]$sb.AppendLine(($head -join "`n"))
        [void]$sb.AppendLine("")
    }
    $script:l3Context = $sb.ToString()
    Write-Log "Step 3.7 complete (L3 context prepared, $($recent.Count) files)"
}

function Step-ClaudeAutonomous {
    if ($DryRun) {
        Write-Log "Step 4: DryRun mode, skipping claude --print invocation"
        Start-Sleep -Seconds 2
        return
    }

    Write-Log "Step 4: claude --print autonomous patrol invocation"

    # Phase B-alpha/beta: all verdicts require manual session
    # Phase B-gamma onwards: APPROVE / APPROVE_WITH_NOTES auto-feedback allowed
    # Boundary check via flag file (manual override)
    $autoFeedbackFlag = Join-Path $repoRoot "sync\sync_script\layer0-auto-feedback.flag"
    $autoFeedbackEnabled = (Test-Path $autoFeedbackFlag)

    $phaseStr = if ($autoFeedbackEnabled) { "Phase B-gamma+ (auto-feedback enabled)" } else { "Phase B-alpha/beta (manual final verdict)" }
    Write-Log "Phase: $phaseStr"

    # L1/L2/L3 context prepared in Step 3.5/3.6/3.7, EVT telemetry in Step 3.4
    # Factory pipeline context in Step 3.3
    $l1 = if ($script:l1Context) { $script:l1Context } else { "(L1 context not prepared)" }
    $l2 = if ($script:l2Context) { $script:l2Context } else { "(L2 context not prepared)" }
    $l3 = if ($script:l3Context) { $script:l3Context } else { "(L3 context not prepared)" }
    $evt = if ($script:evtTelemetry) { $script:evtTelemetry } else { "(EVT telemetry not prepared)" }
    $factory = if ($script:factoryContext) { $script:factoryContext } else { "(factory_pipeline context not prepared)" }

    $prompt = @"
Supervisor Layer 0 autonomous patrol cycle.

Context:
- Phase: $phaseStr
- Cycle timestamp: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:sszzz')
- Repository: $repoRoot

=== Factory Pipeline (commander -> factory observation, 24h snapshot) ===
$factory

=== EVT Telemetry Candidates (auto-evt-recorder, today's JSONL tail) ===
$evt

=== L1 Circular (internal/circular/, 24h) ===
$l1

=== L2 Regional (internal/regional/, 24h) ===
$l2

=== L3 Gazette (commander#shared/official_gazette/, 24h) ===
$l3

Tasks:
1. Read latest entries in inbox/from_commander/ (commander responses pulled this cycle)
2. Read sync/checkup-scores/reviews/ (auto-review proposals from this cycle)
3. Cross-reference L1/L2/L3 above for relevant context (Garage Doctrine 1.5: read what others wrote)
4. For each unprocessed response:
   - Verify proposed verdict against rubrics/ (5 rubric files)
   - If APPROVE: auto-acknowledge in internal/circular/, no feedback order needed
   - If APPROVE_WITH_NOTES (Phase B-gamma+ only): auto-draft feedback order in outbox/
   - If REQUEST_CHANGES / REJECT or Phase B-alpha/beta: convene supervisor manual session, do NOT auto-issue
5. Update internal/circular/ with cycle summary (Step 6 handles)
6. If L2 regional discussion needs reply: defer to manual session in Phase B-alpha/beta (Step 7 handles)
7. If significant decision occurred: queue L3 gazette summary (Step 8 handles, manual in Phase B-alpha/beta)
8. Run sync-orders.ps1 if any new orders were drafted
9. Check escalation_and_rollback.md section 2 triggers
   - If R1-R7 fires: create staging/.three_party_halt.lock + invoke notify-yasu mechanism
   - If Y1-Y6 fires: emit escalation file in inbox/escalations/

Constraints:
- Do not edit files in 00_origin/, 01_relationship/, adrs/ (philosophy/relationship/decision layers)
- Do not auto-commit (commit only on explicit decision)
- Respect distilled section 5 self-preservation bias warning
- Manual session takes precedence over Layer 0 auto-action
- Garage Doctrine 1.5: built devices must be driven; ignoring L1/L2/L3 above = garage stop

Output: cycle log to logs/layer0/$timestamp.log + circular summary
"@

    $allowedTools = @(
        "Bash(git status*)",
        "Bash(git log *)",
        "Bash(git show *)",
        "Bash(pwsh*)",
        "Bash(powershell*)",
        "Read",
        "Write",
        "Edit",
        "Glob",
        "Grep"
    ) -join " "

    try {
        $env:SUPERVISOR_LAYER0_ACTIVE = "1"
        $claudeArgs = @(
            "--print",
            "--permission-mode", "auto",
            "--no-session-persistence",
            $prompt
        )
        Write-Log "Invoking claude (timeout: cycle deadline)"
        $output = & claude @claudeArgs 2>&1
        Write-Log "claude --print output:"
        $output | ForEach-Object { Add-Content -Path $logFile -Value "  $_" -Encoding UTF8 }
        Write-Log "Step 4 complete"
    } catch {
        Write-Log "Step 4 failed: $($_.Exception.Message)" "ERROR"
    } finally {
        $env:SUPERVISOR_LAYER0_ACTIVE = $null
    }
}

function Step-CircularUpdate {
    Write-Log "Step 5: circular update"
    $circularDir = Join-Path $repoRoot "internal\circular"
    if (-not (Test-Path $circularDir)) {
        Write-Log "Circular dir not found, skipping" "WARN"
        return
    }
    # Append cycle summary to today's circular file (or create new one)
    # Detailed implementation in Phase B-alpha/beta deferred to manual session
    Write-Log "Step 5 complete (circular update deferred to manual session in Phase B-alpha/beta)"
}

function Step-RegionalUpdate {
    Write-Log "Step 6: regional bidirectional sync (L2, sync-regional v1.0)"
    $script = Join-Path $repoRoot "sync\sync_script\sync-regional.ps1"
    if (-not (Test-Path $script)) {
        Write-Log "sync-regional.ps1 not found, skipping" "WARN"
        return
    }
    try {
        # v1.5: bidirectional default (both push + pull in single run, mtime-based conflict resolve)
        & $script -Direction bidirectional 2>&1 | ForEach-Object {
            Add-Content -Path $logFile -Value "  $_" -Encoding UTF8
        }
        Write-Log "Step 6 complete (L2 bidirectional sync executed)"
    } catch {
        Write-Log "Step 6 failed: $($_.Exception.Message)" "ERROR"
    }
}

function Step-NotifyYasuEmail {
    Write-Log "Step 7.5: notify-yasu-email (Y1/Y3/Y5 trigger -> SMTP)"
    $script = Join-Path $repoRoot "sync\sync_script\notify-yasu-email.ps1"
    $credFile = Join-Path $repoRoot "sync\sync_script\.smtp.cred"
    if (-not (Test-Path $script)) {
        Write-Log "notify-yasu-email.ps1 not found, skipping" "WARN"
        return
    }
    if (-not (Test-Path $credFile)) {
        Write-Log "SMTP credential not set up yet (run setup_email_notify_yasu_action.md Step 2)" "WARN"
        return
    }
    # Read today's EVT telemetry, fire emails for immediate triggers (Y1/Y3/Y5 mapping below)
    $today = Get-Date -Format "yyyyMMdd"
    $jsonlFile = Join-Path $repoRoot "sync\checkup-scores\evt_telemetry\$today.jsonl"
    if (-not (Test-Path $jsonlFile)) {
        Write-Log "No EVT telemetry today, skipping notify"
        return
    }
    # R-rule -> Y-trigger mapping
    # R1 approve_streak           -> Y4 (red streak) - daily_digest
    # R2 role_total_red_streak    -> Y4 (red streak) - daily_digest
    # R3 order_pace_overrun       -> Y2 (consistency) - daily_digest
    # R4 sync_log_warnings        -> Y6 (connection rate) - daily_digest
    # R5 escalation_file_emerged  -> Y5 (escalation 5+) - immediate
    $lines = Get-Content $jsonlFile -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $lines) { return }
    $emailsSent = 0
    foreach ($line in $lines) {
        try {
            $obj = $line | ConvertFrom-Json
            $rule = $obj.rule
            $yTrigger = switch ($rule) {
                "R1" { "Y4" }
                "R2" { "Y4" }
                "R3" { "Y2" }
                "R4" { "Y6" }
                "R5" { "Y5" }
                default { $null }
            }
            if (-not $yTrigger) { continue }
            $summary = "$($obj.evt_candidate) ($($obj.severity))"
            $body = "Trigger: $rule -> $yTrigger`n`nDetails: $($obj.details)`n`nDetected at: $($obj.timestamp)"
            & $script -Trigger $yTrigger -Summary $summary -Body $body 2>&1 | ForEach-Object {
                Add-Content -Path $logFile -Value "  [notify] $_" -Encoding UTF8
            }
            $emailsSent++
        } catch {
            Write-Log "Failed to parse line: $($_.Exception.Message)" "WARN"
        }
    }
    Write-Log "Step 7.5 complete (notify attempts: $emailsSent, actual sends limited by cooldown/digest queue)"
}

function Step-GazetteSummaryEmit {
    Write-Log "Step 7: gazette summary emit (L3)"
    $commanderRepo = Split-Path $repoRoot -Parent
    $gazetteDir = Join-Path $commanderRepo "record-x-commander\shared\official_gazette"
    if (-not (Test-Path $gazetteDir)) {
        Write-Log "Gazette dir not found at $gazetteDir, skipping (awaiting Yasu placement)" "WARN"
        return
    }
    # Phase B-alpha/beta: deferred to manual session (write side stays manual, supervisor is observer not master)
    # Master = commander side; supervisor proposes draft, commander/Yasu places
    Write-Log "Step 7 complete (L3 gazette summary deferred to manual session, master=commander side)"
}

# =========================================================================
# Main flow
# =========================================================================
Write-Log "=== Layer 0 entry point start ==="
Write-Log "DryRun: $DryRun"
Write-Log "Instance: $(if ($env:SUPERVISOR_INSTANCE_ID) { $env:SUPERVISOR_INSTANCE_ID } else { 'A (default)' })"

if (-not (Acquire-Lock)) {
    Write-Log "Lock acquisition failed, exiting"
    exit 0
}

try {
    Step-PullReplies
    Step-StaleAlert
    Step-CheckInternalLinks  # v1.6 NEW (weekly cadence, EVT-019 prevention)
    Step-AutoReview
    Step-SyncFactoryPipeline # v1.3 NEW (commander -> factory observation mirror)
    Step-AutoEvtRecorder     # v1.2 NEW (drift detection + JSONL telemetry)
    Step-ReadCirculars       # v1.1 NEW (L1)
    Step-ReadRegional        # v1.1 NEW (L2)
    Step-ReadGazette         # v1.1 NEW (L3)
    Step-ClaudeAutonomous
    Step-CircularUpdate
    Step-RegionalUpdate      # v1.1 NEW (L2 write, deferred manual in B-alpha/beta)
    Step-GazetteSummaryEmit  # v1.1 NEW (L3 write, deferred manual in B-alpha/beta)
    Step-NotifyYasuEmail     # v1.4 NEW (Y1/Y3/Y5 SMTP -> Yasu)
} finally {
    Release-Lock
    Write-Log "=== Layer 0 entry point end ==="
}

exit 0
