#Requires -Version 5.1
<#
.SYNOPSIS
    aggregate-failure-logs.ps1 v0.1 - three-role cross failure log aggregator [Day 131 朝末 drafted]

.DESCRIPTION
    EVT-025 emergency response. Aggregates failure logs across three roles.
    ASCII-only PS1 (EVT-026 fix, japanese strings externalized to JSON if needed in future).

    Targets:
    - supervisor archive/error_patterns.md (EVT-001..025)
    - supervisor sync/checkup-scores/evt_telemetry/{date}.jsonl
    - commander archive/error_patterns.md (existence check)
    - commander tickets_issued/ direct files (non-standard ticket detection)
    - commander sync/completion_reports/ (failure traces)
    - factory (commander-mediated sync-factory-pipeline mirror)

    Output: sync/checkup-scores/failure_telemetry/aggregate_{YYYYMMDD-HHMMSS}.json
#>
param([switch]$DryRun)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$commanderRepo = Join-Path (Split-Path $repoRoot -Parent) "record-x-commander"

$logDir = Join-Path $repoRoot "logs\failure_telemetry"
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

$outDir = Join-Path $repoRoot "sync\checkup-scores\failure_telemetry"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

Write-Log "=== aggregate-failure-logs v0.1 start ==="

$report = [ordered]@{
    aggregate_id = "failure_aggregate_$timestamp"
    captured_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
    supervisor = @{}
    commander = @{}
    factory = @{}
    cross_role_drift = @()
}

$supEvtFile = Join-Path $repoRoot "archive\error_patterns.md"
if (Test-Path $supEvtFile) {
    $content = Get-Content $supEvtFile -Raw -Encoding UTF8
    $evtMatches = [regex]::Matches($content, 'EVT-\d+-\d+|EVT-20\d{6}-\d+')
    $unique = @($evtMatches | ForEach-Object { $_.Value } | Sort-Object -Unique)
    $report.supervisor.evt_count = $unique.Count
    $report.supervisor.evt_list_sample = @($unique | Select-Object -First 10)
    Write-Log ("Supervisor EVT count: {0}" -f $unique.Count)
}

$telemetryDir = Join-Path $repoRoot "sync\checkup-scores\evt_telemetry"
$recentTelemetry = @()
if (Test-Path $telemetryDir) {
    $cutoff = (Get-Date).AddDays(-7)
    $files = @(Get-ChildItem -Path $telemetryDir -Filter "*.jsonl" -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -gt $cutoff })
    foreach ($f in $files) {
        $lines = @(Get-Content $f.FullName -Encoding UTF8 -ErrorAction SilentlyContinue)
        $recentTelemetry += $lines.Count
    }
    $sumLines = ($recentTelemetry | Measure-Object -Sum).Sum
    if (-not $sumLines) { $sumLines = 0 }
    $report.supervisor.recent_7day_telemetry_lines = $sumLines
    Write-Log ("Supervisor 7-day telemetry lines: {0}" -f $sumLines)
}

$cmdEvtFile = Join-Path $commanderRepo "archive\error_patterns.md"
if (Test-Path $cmdEvtFile) {
    $content = Get-Content $cmdEvtFile -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($content) {
        $evtMatches = [regex]::Matches($content, 'EVT-\d+-\d+|EVT-20\d{6}-\d+')
        $unique = @($evtMatches | ForEach-Object { $_.Value } | Sort-Object -Unique)
        $report.commander.evt_count = $unique.Count
        $report.commander.archive_exists = $true
    } else {
        $report.commander.evt_count = 0
        $report.commander.archive_exists = $true
        $report.commander.note = "archive exists but empty"
    }
} else {
    $report.commander.evt_count = 0
    $report.commander.archive_exists = $false
    $report.commander.note = "archive/error_patterns.md not present (EVT-025 type structural gap)"
    $report.cross_role_drift += @{
        type = "commander_archive_missing"
        severity = "yellow"
        details = "Commander archive absent = no independent failure log, depends on supervisor master"
    }
}

$cmdTicketsDir = Join-Path $commanderRepo "strategy\tickets_issued"
if (Test-Path $cmdTicketsDir) {
    $directFiles = @(Get-ChildItem -Path $cmdTicketsDir -Filter "*.md" -File -ErrorAction SilentlyContinue)
    $nonStandard = @()
    foreach ($f in $directFiles) {
        $head = Get-Content $f.FullName -TotalCount 5 -Encoding UTF8 -ErrorAction SilentlyContinue
        $hasFm = $false
        if ($head) {
            $hasFm = ($head[0] -match '^---\s*$')
        }
        if (-not $hasFm) {
            $nonStandard += $f.Name
        }
    }
    $report.commander.tickets_issued_direct_count = $directFiles.Count
    $report.commander.non_standard_tickets = $nonStandard
    if ($nonStandard.Count -gt 0) {
        $report.cross_role_drift += @{
            type = "non_standard_tickets_in_tickets_issued_root"
            severity = "red"
            count = $nonStandard.Count
            sample = ($nonStandard | Select-Object -First 5)
            details = "EVT-025 type: tickets_issued/ root contains non-frontmatter tickets (active/ subdir bypassed)"
        }
    }
    Write-Log ("Commander direct tickets: {0}, non-standard: {1}" -f $directFiles.Count, $nonStandard.Count)
}

$completionDir = Join-Path $commanderRepo "sync\completion_reports"
if (Test-Path $completionDir) {
    $cutoff = (Get-Date).AddDays(-7)
    $allReports = @(Get-ChildItem -Path $completionDir -Filter "*.json" -File -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -gt $cutoff })
    $report.commander.completion_reports_7day = $allReports.Count
}

$factoryMirrorDir = Join-Path $repoRoot "sync\checkup-scores\factory_pipeline"
if (Test-Path $factoryMirrorDir) {
    $latestSnap = @(Get-ChildItem -Path $factoryMirrorDir -Filter "snapshot_*.json" -File |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1)
    if ($latestSnap.Count -gt 0) {
        try {
            $snap = Get-Content $latestSnap[0].FullName -Raw -Encoding UTF8 | ConvertFrom-Json
            $report.factory.latest_snapshot = $latestSnap[0].Name
            $report.factory.tickets_issued_24h = $snap.tickets_issued.updated_24h
            $report.factory.tickets_completed_24h = $snap.tickets_completed.added_24h
            $report.factory.completion_reports_24h = $snap.completion_reports.added_24h
            $report.factory.note = "factory archive/factory_failures.md absent (EVT-025 type log gap)"
        } catch {
            $report.factory.parse_error = $_.Exception.Message
        }
    }
}

$report.symmetry_status = if ($report.cross_role_drift.Count -eq 0) { "balanced" } else { "asymmetric_failure_log" }
$report.recommendations = @(
    "supervisor aggregator running (this script)",
    "commander archive/error_patterns.md drafting requested via L2 regional archive_failure_log_symmetry",
    "factory archive/factory_failures.md drafting requested via commander relay",
    "tickets_issued root: 0 non-standard tickets target (active/ subdir mandatory, auto-evt R9 candidate)"
)

$outFile = Join-Path $outDir "aggregate_$timestamp.json"
if ($DryRun) {
    Write-Log "DryRun: aggregate report not written"
    Write-Log ($report | ConvertTo-Json -Depth 10 -Compress)
} else {
    $report | ConvertTo-Json -Depth 10 | Set-Content -Path $outFile -Encoding UTF8
    Write-Log ("Aggregate report saved: {0}" -f $outFile)
}

Write-Log "=== Summary ==="
Write-Log ("Supervisor EVT: {0}" -f $report.supervisor.evt_count)
Write-Log ("Commander EVT: {0} (archive exists: {1})" -f $report.commander.evt_count, $report.commander.archive_exists)
Write-Log ("Cross-role drift: {0} item(s)" -f $report.cross_role_drift.Count)
Write-Log ("Symmetry: {0}" -f $report.symmetry_status)

Write-Log "=== aggregate-failure-logs end ==="
exit 0
