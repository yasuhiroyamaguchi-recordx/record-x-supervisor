#Requires -Version 5.1
<#
.SYNOPSIS
    Auto EVT recorder v0.2 - drift pattern detection + machine-readable telemetry

.NOTES (v0.8 changes from v0.7)
    - R8 added: L1 circular instance parallel detection (EVT-024 prevention, system E series)
    - Detects parallel instance usage on same date (e.g., A + A1 both writing circular_20260429_*.md)
    - Severity: info (parallel usage is normal, but tracked for §5-D Test-Path discipline)
    - Drafted: 2026-04-29 (Day 131 朝末, supervisor instance A)

.NOTES (v0.6 changes from v0.5)
    - R7 regex strictened: only "P\d+\s*採択" / "P\d+\s*提案" patterns count (EVT-022 final fix)
    - Single "P0" / "P2" etc. (axis indicators in physical layer spec) excluded
    - Drafted: 2026-04-29 (Day 131 朝, supervisor instance A, chain pattern 4th example final)

.NOTES (v0.5 changes from v0.4)
    - R7 skip patterns added (EVT-022 fix attempt 1, false positive ~89% -> ~89% (insufficient))
    - Skip: 00_origin/dialogues/* (claude.ai legacy session史料、史実保護)
    - Skip: archive/peer_reviews_history.md (legacy peer reviews)
    - Skip: archive/error_patterns.md (self-reference scope)

.NOTES (v0.4 changes from v0.3)
    - R7 added: P-number duplicate detection (EVT-021 prevention, system D series)
    - Reads _helpers/p_number_registry.json as source of truth

.NOTES (v0.3 changes from v0.2)
    - R6 logic corrected: filename "_order_NNN" suffix is order_number, not filename suffix.
      Must read referenced outbox file's frontmatter order_number for accurate mismatch detection.
    - v0.2 false positive ~87% (26/30) -> v0.3 target <10%

.DESCRIPTION
    Detects drift patterns from 5 rule classes and emits EVT candidates as JSONL telemetry.
    Does NOT auto-append to archive/error_patterns.md (false positive risk).
    Detection -> human/claude verification -> manual record.

    Detection rules:
    R1 verdict_approve_streak  : 7+ consecutive APPROVE (EVT-013 type)
    R2 role_total_red_streak   : commander role_total < 55 for 2+ cycles (P15 trigger)
    R3 order_pace_overrun      : daily order count exceeds section 1.1-A limit
    R4 sync_log_warnings       : sync script log contains warn/error patterns
    R5 escalation_file_emerged : new escalation file created in 24h

    Output: sync/checkup-scores/evt_telemetry/{YYYYMMDD}.jsonl (append mode)
    Layer 0 prompt: read latest line + inject as context

.PARAMETER DryRun
    Test mode: detect + log only, no JSONL write.

.NOTES
    Drafted: 2026-04-28 (Day 130 末, supervisor instance A)
    EVT-016 direct response: built device must be driven, not garaged.
    Garage Doctrine 1.5-B applied (Who/When/Where/Reflection 4 points defined at draft time).
#>
param(
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# v0.3: load responds_to normalization helper
. (Join-Path $PSScriptRoot "_helpers\responds_to_normalize.ps1")

# =========================================================================
# Logging
# =========================================================================
$logDir = Join-Path $repoRoot "logs\evt_recorder"
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
# Output: telemetry JSONL
# =========================================================================
$telemetryDir = Join-Path $repoRoot "sync\checkup-scores\evt_telemetry"
if (-not (Test-Path $telemetryDir)) {
    New-Item -ItemType Directory -Force -Path $telemetryDir | Out-Null
}
$today = Get-Date -Format "yyyyMMdd"
$jsonlFile = Join-Path $telemetryDir "$today.jsonl"

$candidates = @()

function Emit-Candidate {
    param(
        [string]$Rule,
        [string]$Type,
        [string]$Severity,
        [string]$Details
    )
    $now = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
    $entry = [ordered]@{
        timestamp     = $now
        rule          = $Rule
        evt_candidate = $Type
        severity      = $Severity
        details       = $Details
    }
    $script:candidates += $entry
    Write-Log ("[{0}] {1}: {2} ({3})" -f $Rule, $Type, $Details, $Severity)
}

# =========================================================================
# R1: verdict APPROVE streak (EVT-013 type)
# =========================================================================
function Detect-ApproveStreak {
    Write-Log "R1: verdict APPROVE streak detection"
    $inboxDir = Join-Path $repoRoot "inbox\from_commander"
    if (-not (Test-Path $inboxDir)) {
        Write-Log "inbox/from_commander/ not found, skipping R1" "WARN"
        return
    }
    # Get all *_response_to_order_*.md files, sort by name (chronological)
    $responses = @(Get-ChildItem -Path $inboxDir -Filter "*_response_to_order_*.md" -File -Recurse |
        Sort-Object Name -Descending |
        Select-Object -First 7)
    if ($responses.Count -lt 7) {
        Write-Log ("R1 skipped: only {0} responses found, need 7" -f $responses.Count)
        return
    }
    $approveCount = 0
    foreach ($f in $responses) {
        $head = Get-Content $f.FullName -TotalCount 15 -Encoding UTF8
        $verdictLine = $head | Where-Object { $_ -match "^verdict:\s*APPROVE\s*$" }
        if ($verdictLine) { $approveCount++ }
    }
    if ($approveCount -ge 7) {
        Emit-Candidate -Rule "R1" -Type "approve_streak" -Severity "yellow" `
            -Details ("Last 7 responses: {0}/7 are pure APPROVE (EVT-013 type, formal acceptance risk)" -f $approveCount)
    } else {
        Write-Log ("R1 healthy: {0}/7 APPROVE in recent responses" -f $approveCount)
    }
}

# =========================================================================
# R2: commander role_total red streak (P15 trigger)
# =========================================================================
function Detect-RoleTotalRedStreak {
    Write-Log "R2: commander role_total red streak detection"
    $snapshotDir = Join-Path $repoRoot "sync\checkup-scores\role_execution"
    if (-not (Test-Path $snapshotDir)) {
        Write-Log "role_execution snapshot dir not found, skipping R2" "INFO"
        return
    }
    $snapshots = @(Get-ChildItem -Path $snapshotDir -Filter "snapshot_commander_*.json" -File |
        Sort-Object Name -Descending |
        Select-Object -First 2)
    if ($snapshots.Count -lt 2) {
        Write-Log ("R2 skipped: only {0} snapshots found, need 2" -f $snapshots.Count)
        return
    }
    $redCount = 0
    foreach ($s in $snapshots) {
        try {
            $json = Get-Content $s.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
            $total = $json.role_total
            if ($total -lt 55) { $redCount++ }
        } catch {
            Write-Log ("R2 parse error on {0}: {1}" -f $s.Name, $_.Exception.Message) "WARN"
        }
    }
    if ($redCount -ge 2) {
        Emit-Candidate -Rule "R2" -Type "role_total_red_streak" -Severity "red" `
            -Details "commander role_total < 55 for 2 consecutive cycles (P15 trigger: suspend orders except emergency)"
    } else {
        Write-Log "R2 healthy: role_total not in red streak"
    }
}

# =========================================================================
# R3: order pace overrun (section 1.1-A)
# =========================================================================
function Detect-OrderPaceOverrun {
    Write-Log "R3: order pace overrun detection"
    $outboxDir = Join-Path $repoRoot "outbox"
    if (-not (Test-Path $outboxDir)) {
        Write-Log "outbox/ not found, skipping R3" "WARN"
        return
    }
    $todayPrefix = Get-Date -Format "yyyyMMdd"
    $todayOrders = @(Get-ChildItem -Path $outboxDir -Filter "${todayPrefix}_to_commander_*.md" -File)
    $count = $todayOrders.Count
    # Aggregate by scale
    $scaleCounts = @{ small = 0; medium = 0; large = 0; unknown = 0 }
    foreach ($f in $todayOrders) {
        $head = Get-Content $f.FullName -TotalCount 10 -Encoding UTF8
        $scaleLine = $head | Where-Object { $_ -match "^discussion_scale:\s*(.+)" }
        if ($scaleLine -and $scaleLine -match "discussion_scale:\s*(\w+)") {
            $s = $Matches[1].Trim().ToLower()
            if ($scaleCounts.ContainsKey($s)) { $scaleCounts[$s]++ } else { $scaleCounts['unknown']++ }
        } else {
            $scaleCounts['unknown']++
        }
    }
    # Limits: small 5-7 / medium 2-3 / large 1-2 per day
    $sevs = @()
    if ($scaleCounts['large'] -gt 2) { $sevs += "large=$($scaleCounts['large'])(limit 1-2)" }
    if ($scaleCounts['medium'] -gt 3) { $sevs += "medium=$($scaleCounts['medium'])(limit 2-3)" }
    if ($scaleCounts['small'] -gt 7) { $sevs += "small=$($scaleCounts['small'])(limit 5-7)" }
    if ($count -gt 10) { $sevs += "total=$count(combined cap ~12)" }
    if ($sevs.Count -gt 0) {
        $sev = if ($count -gt 20) { "red" } else { "yellow" }
        Emit-Candidate -Rule "R3" -Type "order_pace_overrun" -Severity $sev `
            -Details ("section 1.1-A overrun: " + ($sevs -join ", "))
    } else {
        Write-Log ("R3 healthy: today orders count={0}, by scale: {1}" -f $count, ($scaleCounts.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join " ")
    }
}

# =========================================================================
# R4: sync script log warnings/errors
# =========================================================================
function Detect-SyncLogWarnings {
    Write-Log "R4: sync log warnings/errors detection"
    $syncLog = Join-Path $repoRoot "sync\sync_script\order_sync.log"
    if (-not (Test-Path $syncLog)) {
        Write-Log "sync log not found, skipping R4" "INFO"
        return
    }
    $tail = Get-Content $syncLog -Tail 100 -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $tail) { return }
    $warnLines = @($tail | Where-Object { $_ -match "WARN|ERROR|fail|differs" })
    if ($warnLines.Count -ge 3) {
        Emit-Candidate -Rule "R4" -Type "sync_log_warnings" -Severity "yellow" `
            -Details ("Last 100 sync log lines contain {0} warn/error indicators (EVT-012/15 type, automation health degraded)" -f $warnLines.Count)
    } else {
        Write-Log ("R4 healthy: {0} warn/error indicators in recent sync log" -f $warnLines.Count)
    }
}

# =========================================================================
# R5: new escalation file in 24h
# =========================================================================
function Detect-EscalationFile {
    Write-Log "R5: escalation file emergence detection"
    $escalationDir = Join-Path $repoRoot "inbox\escalations"
    if (-not (Test-Path $escalationDir)) {
        Write-Log "inbox/escalations/ not found, skipping R5" "INFO"
        return
    }
    $cutoff = (Get-Date).AddHours(-24)
    $recent = @(Get-ChildItem -Path $escalationDir -Filter "*.md" -File |
        Where-Object { $_.LastWriteTime -gt $cutoff -and $_.Name -ne "README.md" })
    if ($recent.Count -ge 1) {
        $names = ($recent | Select-Object -First 5 | ForEach-Object { $_.Name }) -join ", "
        Emit-Candidate -Rule "R5" -Type "escalation_file_emerged" -Severity "red" `
            -Details ("{0} escalation file(s) created in 24h: {1}" -f $recent.Count, $names)
    } else {
        Write-Log "R5 healthy: no new escalation files in 24h"
    }
}

# =========================================================================
# R6: responds_to filename mismatch detection (EVT-020 prevention, v0.2)
# =========================================================================
function Detect-RespondsToMismatch {
    # v0.3: read referenced outbox file's frontmatter order_number for accurate detection
    Write-Log "R6: responds_to filename mismatch detection (v0.3, frontmatter aware)"
    $inboxDir = Join-Path $repoRoot "inbox\from_commander"
    $outboxDir = Join-Path $repoRoot "outbox"
    $outboxArchive = Join-Path $repoRoot "outbox_completed"
    if (-not (Test-Path $inboxDir)) {
        Write-Log "inbox/from_commander/ not found, skipping R6" "WARN"
        return
    }
    $responses = @(Get-ChildItem -Path $inboxDir -Filter "*_response_to_order_*.md" -File -Recurse -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 30)
    $mismatches = @()
    foreach ($r in $responses) {
        # Extract filename's target order_number (e.g., 002_response_to_order_010.md -> 10)
        if ($r.Name -notmatch '^\d+_response_to_order_(\d+)\.md$') { continue }
        $filenameTargetOrder = [int]$matches[1]
        $content = Get-Content -Path $r.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        if ($content -notmatch '(?im)^\s*responds_to:\s*(.+?)\s*$') { continue }
        $rt = $matches[1].Trim()
        # Resolve to outbox file via candidates (RETRACTED variant + .md补完)
        $candidates = Get-RespondsToCandidates -Value $rt
        $foundOrderNum = $null
        foreach ($cn in $candidates) {
            $outboxFile = Join-Path $outboxDir $cn
            if (Test-Path $outboxFile) {
                $oContent = Get-Content -Path $outboxFile -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
                if ($oContent -match '(?im)^\s*order_number:\s*(\d+)\s*$') {
                    $foundOrderNum = [int]$matches[1]
                    break
                }
            }
            if (Test-Path $outboxArchive) {
                $arch = @(Get-ChildItem -Path $outboxArchive -Filter $cn -Recurse -File -ErrorAction SilentlyContinue) | Select-Object -First 1
                if ($arch) {
                    $oContent = Get-Content -Path $arch.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
                    if ($oContent -match '(?im)^\s*order_number:\s*(\d+)\s*$') {
                        $foundOrderNum = [int]$matches[1]
                        break
                    }
                }
            }
        }
        if ($null -eq $foundOrderNum) {
            $mismatches += @{ file = $r.Name; filename_order = $filenameTargetOrder; responds_to_value = $rt; actual_order = $null; kind = "outbox_missing_or_no_order_number" }
        } elseif ($foundOrderNum -ne $filenameTargetOrder) {
            $mismatches += @{ file = $r.Name; filename_order = $filenameTargetOrder; responds_to_value = $rt; actual_order = $foundOrderNum; kind = "order_number_mismatch" }
        }
    }
    if ($mismatches.Count -eq 0) {
        Write-Log "R6 healthy: no responds_to filename mismatches detected"
        return
    }
    $severity = if ($mismatches.Count -ge 3) { "red" } elseif ($mismatches.Count -ge 1) { "yellow" } else { "info" }
    $sample = ($mismatches | Select-Object -First 3 | ForEach-Object {
        $a = if ($null -eq $_.actual_order) { "missing" } else { "#$($_.actual_order)" }
        "{0}: filename order #{1} vs actual {2} ({3})" -f $_.file, $_.filename_order, $a, $_.kind
    }) -join "; "
    Emit-Candidate -Rule "R6" -Type "responds_to_mismatch" -Severity $severity `
        -Details ("EVT-020 type: {0} mismatch(es). Sample: {1}" -f $mismatches.Count, $sample)
}

# =========================================================================
# R7: P-number duplicate detection (EVT-021 prevention, v0.4)
# =========================================================================
function Detect-PNumberDuplicate {
    Write-Log "R7: P-number registry compliance detection"
    $registryFile = Join-Path $PSScriptRoot "_helpers\p_number_registry.json"
    if (-not (Test-Path $registryFile)) {
        Write-Log "p_number_registry.json not found, skipping R7" "WARN"
        return
    }
    $registered = @{}
    try {
        $reg = Get-Content $registryFile -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($p in $reg.registered.PSObject.Properties) {
            $registered[$p.Name] = $p.Value
        }
    } catch {
        Write-Log "registry parse failed: $($_.Exception.Message)" "WARN"
        return
    }
    # Scan .md / .yaml files in supervisor repo for "P NN 採択" patterns
    # v0.5: skip historical / self-reference paths (EVT-022 fix)
    $exclude = @('logs', 'outbox_completed', '.git', 'node_modules', '.claude', '.obsidian')
    $skipPathPatterns = @(
        '\\00_origin\\dialogues\\',
        '\\archive\\peer_reviews_history\.md$',
        '\\archive\\error_patterns\.md$'
    )
    $targetFiles = @(Get-ChildItem -Path $repoRoot -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Extension -in @('.md', '.yaml', '.yml') -and
            ($exclude | ForEach-Object { $_ }) -notcontains ($_.FullName.Substring($repoRoot.Length).Split('\')[1])
        })
    # v0.5 skip filter
    $targetFiles = @($targetFiles | Where-Object {
        $path = $_.FullName
        $skipMatch = $false
        foreach ($pat in $skipPathPatterns) {
            if ($path -match $pat) { $skipMatch = $true; break }
        }
        -not $skipMatch
    })
    $found = @{}
    # v0.7: keywords loaded from registry JSON (ASCII PS1 + UTF-8 JSON, EVT-023 fix = EVT-002/015 type 7th chain)
    $kwList = @($reg.proposal_context_keywords_jp)
    if ($kwList.Count -eq 0) {
        Write-Log "R7 skipped: proposal_context_keywords_jp not found in registry" "WARN"
        return
    }
    $kwAlt = ($kwList | ForEach-Object { [regex]::Escape($_) }) -join '|'
    $pRegex = [regex]("P(\d+)(?=[\s\(]*(" + $kwAlt + "))")
    foreach ($f in $targetFiles) {
        $content = Get-Content -Path $f.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        $m = $pRegex.Matches($content)
        foreach ($match in $m) {
            $pkey = "P$($match.Groups[1].Value)"
            if (-not $found.ContainsKey($pkey)) {
                $found[$pkey] = @()
            }
            if ($found[$pkey].Count -lt 3) {
                $found[$pkey] += $f.FullName.Substring($repoRoot.Length).TrimStart('\','/')
            }
        }
    }
    # Detect unregistered P-numbers
    $unregistered = @()
    foreach ($pkey in $found.Keys) {
        if (-not $registered.ContainsKey($pkey)) {
            $unregistered += @{ pnum = $pkey; sample_files = $found[$pkey] }
        }
    }
    if ($unregistered.Count -eq 0) {
        Write-Log ("R7 healthy: all P-numbers found ({0} unique) are registered" -f $found.Keys.Count)
        return
    }
    $severity = if ($unregistered.Count -ge 2) { "yellow" } else { "info" }
    $sample = ($unregistered | Select-Object -First 3 | ForEach-Object {
        "{0} in {1}" -f $_.pnum, ($_.sample_files | Select-Object -First 1)
    }) -join "; "
    Emit-Candidate -Rule "R7" -Type "p_number_unregistered" -Severity $severity `
        -Details ("EVT-021 type: {0} unregistered P-number(s) detected. Sample: {1}. Update _helpers/p_number_registry.json + communication_protocol.md §3.2-A-0 台帳" -f $unregistered.Count, $sample)
}

# =========================================================================
# R8: L1 circular instance parallel detection (EVT-024 prevention, v0.8)
# =========================================================================
function Detect-CircularInstanceParallel {
    Write-Log "R8: L1 circular instance parallel detection"
    $circularDir = Join-Path $repoRoot "internal\circular"
    if (-not (Test-Path $circularDir)) {
        Write-Log "internal/circular/ not found, skipping R8" "WARN"
        return
    }
    $files = @(Get-ChildItem -Path $circularDir -Filter "circular_*.md" -File -ErrorAction SilentlyContinue)
    if ($files.Count -lt 2) {
        Write-Log "R8 healthy: insufficient circular files (count < 2)"
        return
    }
    $instanceMap = @{}
    foreach ($f in $files) {
        if ($f.Name -notmatch '^circular_(\d{8})_(\d{3})\.md$') { continue }
        $date = $matches[1]
        $num = $matches[2]
        $content = Get-Content $f.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        if ($content -match '(?im)^\s*instance_id:\s*(\S+)\s*$') {
            $iid = $matches[1].Trim()
            if (-not $instanceMap.ContainsKey($date)) {
                $instanceMap[$date] = @{}
            }
            $instanceMap[$date][$num] = $iid
        }
    }
    $parallelDates = @()
    foreach ($date in $instanceMap.Keys) {
        $uniqueInstances = @($instanceMap[$date].Values | Sort-Object -Unique)
        if ($uniqueInstances.Count -ge 2) {
            $parallelDates += @{
                date = $date
                instances = $uniqueInstances
                file_count = $instanceMap[$date].Count
            }
        }
    }
    if ($parallelDates.Count -eq 0) {
        Write-Log "R8 healthy: no parallel instance usage in any single date"
        return
    }
    $sample = ($parallelDates | Select-Object -First 2 | ForEach-Object {
        "{0}: instances [{1}], {2} files" -f $_.date, ($_.instances -join ','), $_.file_count
    }) -join "; "
    Emit-Candidate -Rule "R8" -Type "circular_instance_parallel" -Severity "info" `
        -Details ("EVT-008/024 type: {0} date(s) with parallel instance usage. Sample: {1}. §5-D 起案前 Test-Path 義務化 適用確認推奨" -f $parallelDates.Count, $sample)
}

function Detect-CatalogPipelineDrift {
    # R10: Catalog vs Physical Layer drift detection (M2.5、系列 I 11 件累積対策、EVT-038/057/058 同型再発防止)
    Write-Log "R10: catalog vs physical layer drift detection"

    $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
    $pipelineState = Join-Path $repoRoot "sync\cockpit_state\pipeline_state.json"
    $threeRealmCatalog = Join-Path $repoRoot "02_physical\three_realm_capability_catalog.md"
    $existingCatalog = Join-Path $repoRoot "02_physical\capability_catalog.md"

    $drifts = @()

    # Drift 1: pipeline_state.json 存在 + alerts.critical or naming_violations 検出
    if (Test-Path $pipelineState) {
        try {
            $state = Get-Content $pipelineState -Raw | ConvertFrom-Json
            if ($state.summary.naming_violations -gt 0) {
                $drifts += "naming_violations=$($state.summary.naming_violations) (EVT-041/057 同型再発)"
            }
            $criticalAlerts = @($state.alerts | Where-Object { $_.Severity -eq 'critical' })
            if ($criticalAlerts.Count -gt 0) {
                $drifts += "pipeline critical alerts: $($criticalAlerts.Count) 件 (EVT-038 全停止状態同型)"
            }
        } catch {
            Write-Log ("R10 pipeline_state parse error: {0}" -f $_.Exception.Message) "WARN"
        }
    } else {
        $drifts += "pipeline_state.json 不在 (sync-schtasks-state.ps1 未稼働、M2.4 整合性検証不能)"
    }

    # Drift 2: 三者統合カタログ未起案 + 既存 catalog のみ存在 = 移行未完遂
    if (-not (Test-Path $threeRealmCatalog) -and (Test-Path $existingCatalog)) {
        $drifts += "three_realm_capability_catalog.md 不在 (M2.1 段階 1 未着手、既存 catalog 単独運用)"
    }

    # Drift 3: 三者統合カタログ存在 + capability_log.jsonl 不在 = 自動更新機構未稼働
    if (Test-Path $threeRealmCatalog) {
        $logPath = Join-Path $repoRoot "02_physical\capability_log.jsonl"
        if (-not (Test-Path $logPath)) {
            $drifts += "capability_log.jsonl 不在 (M2.1 段階 2 自動更新機構未稼働、各官 post-commit hook 未配置)"
        }
    }

    if ($drifts.Count -eq 0) {
        Write-Log "R10 healthy: no catalog vs physical layer drift detected"
        return
    }

    Emit-Candidate -Rule "R10" -Type "catalog_pipeline_drift" -Severity "yellow" `
        -Details ("EVT-057/058 系列 I 同型再発防止: {0} drift(s) detected. {1}" -f $drifts.Count, ($drifts -join " | "))
}

# =========================================================================
# Main
# =========================================================================
Write-Log "=== auto-evt-recorder v0.9 start ==="
Write-Log "DryRun: $DryRun"
Write-Log "Output JSONL: $jsonlFile"

Detect-ApproveStreak
Detect-RoleTotalRedStreak
Detect-OrderPaceOverrun
Detect-SyncLogWarnings
Detect-EscalationFile
Detect-RespondsToMismatch  # v0.2/0.3 NEW (EVT-020 prevention)
Detect-PNumberDuplicate    # v0.4 NEW (EVT-021 prevention)
Detect-CircularInstanceParallel  # v0.8 NEW (EVT-024 prevention, system E series)
Detect-CatalogPipelineDrift      # v0.9 NEW (M2.5、EVT-038/057/058 prevention, system I series)

# =========================================================================
# Emit JSONL (unless DryRun)
# =========================================================================
if ($candidates.Count -eq 0) {
    Write-Log "No EVT candidates detected"
} else {
    Write-Log ("EVT candidates detected: {0}" -f $candidates.Count)
    if (-not $DryRun) {
        foreach ($c in $candidates) {
            $json = $c | ConvertTo-Json -Compress
            Add-Content -Path $jsonlFile -Value $json -Encoding UTF8
        }
        Write-Log ("Appended {0} candidate(s) to {1}" -f $candidates.Count, $jsonlFile)
    } else {
        Write-Log "DryRun: candidates not written to JSONL"
        foreach ($c in $candidates) {
            $json = $c | ConvertTo-Json -Compress
            Write-Log "  candidate: $json"
        }
    }
}

Write-Log "=== auto-evt-recorder end ==="
exit 0
