#Requires -Version 5.1
<#
.SYNOPSIS
    sync-factory-pipeline.ps1 v0.1 - commander -> factory observation mirror [Day 130 末 drafted]

.DESCRIPTION
    Read-only mirror of commander -> factory observation path.
    Supervisor observes commander state without direct factory dialogue
    (relationship policy 3.2 maintained).

    Mirror targets:
    A. commander#strategy/tickets_issued/        -> tickets_issued snapshot
    B. commander#strategy/tickets_completed/      -> tickets_completed snapshot
    C. commander#sync/completion_reports/         -> completion_reports snapshot
    D. commander#sync/merged-prs/                 -> merged_prs snapshot
    E. commander#sync/checkup-scores/role_execution/ -> role_execution mirror copy

    Output: sync/checkup-scores/factory_pipeline/snapshot_{YYYYMMDD-HH}.json
            sync/checkup-scores/role_execution/snapshot_commander_*.json (mirrored from commander)

.PARAMETER DryRun
    Test mode: detect + log only, no JSON write.

.NOTES
    Drafted: 2026-04-28 (Day 130 末, supervisor instance A)
    EVT-016 garage doctrine 1.5-B applied at draft (Who/When/Where/Reflection 4 points).
    Garage Doctrine 1.5: built device must be driven, not garaged.
#>
param(
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$commanderRepo = Join-Path (Split-Path $repoRoot -Parent) "record-x-commander"

# === Logging ===
$logDir = Join-Path $repoRoot "logs\factory_pipeline"
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
$mirrorDir = Join-Path $repoRoot "sync\checkup-scores\factory_pipeline"
if (-not (Test-Path $mirrorDir)) {
    New-Item -ItemType Directory -Force -Path $mirrorDir | Out-Null
}
$roleExecDir = Join-Path $repoRoot "sync\checkup-scores\role_execution"
if (-not (Test-Path $roleExecDir)) {
    New-Item -ItemType Directory -Force -Path $roleExecDir | Out-Null
}

$snapshotTime = Get-Date -Format "yyyyMMdd-HHmm"
$snapshotFile = Join-Path $mirrorDir "snapshot_$snapshotTime.json"

# === Existence check ===
if (-not (Test-Path $commanderRepo)) {
    Write-Log "Commander repo not found at $commanderRepo, exiting" "ERROR"
    exit 1
}

$cutoff = (Get-Date).AddHours(-24)

# === A. tickets_issued snapshot ===
function Snap-TicketsIssued {
    $dir = Join-Path $commanderRepo "strategy\tickets_issued"
    if (-not (Test-Path $dir)) {
        Write-Log "tickets_issued not found, skipping A" "WARN"
        return @{ total_count = 0; updated_24h = 0; files_24h = @() }
    }
    $all = @(Get-ChildItem -Path $dir -Filter "*.md" -File -Recurse -ErrorAction SilentlyContinue)
    $recent = @($all | Where-Object { $_.LastWriteTime -gt $cutoff })
    Write-Log ("A: tickets_issued total={0}, 24h={1}" -f $all.Count, $recent.Count)
    return @{
        total_count = $all.Count
        updated_24h = $recent.Count
        files_24h = @($recent | Select-Object -First 20 | ForEach-Object { $_.Name })
    }
}

# === B. tickets_completed snapshot ===
function Snap-TicketsCompleted {
    $dir = Join-Path $commanderRepo "strategy\tickets_completed"
    if (-not (Test-Path $dir)) {
        Write-Log "tickets_completed not found, skipping B" "WARN"
        return @{ total_count = 0; added_24h = 0 }
    }
    $all = @(Get-ChildItem -Path $dir -Filter "*.md" -File -Recurse -ErrorAction SilentlyContinue)
    $recent = @($all | Where-Object { $_.LastWriteTime -gt $cutoff })
    Write-Log ("B: tickets_completed total={0}, 24h={1}" -f $all.Count, $recent.Count)
    return @{
        total_count = $all.Count
        added_24h = $recent.Count
    }
}

# === C. completion_reports snapshot ===
function Snap-CompletionReports {
    $dir = Join-Path $commanderRepo "sync\completion_reports"
    if (-not (Test-Path $dir)) {
        Write-Log "completion_reports not found, skipping C" "WARN"
        return @{ total_count = 0; added_24h = 0 }
    }
    $all = @(Get-ChildItem -Path $dir -Filter "*.json" -File -Recurse -ErrorAction SilentlyContinue)
    $recent = @($all | Where-Object { $_.LastWriteTime -gt $cutoff })
    Write-Log ("C: completion_reports total={0}, 24h={1}" -f $all.Count, $recent.Count)
    return @{
        total_count = $all.Count
        added_24h = $recent.Count
    }
}

# === D. merged_prs snapshot ===
function Snap-MergedPRs {
    $dir = Join-Path $commanderRepo "sync\merged-prs"
    if (-not (Test-Path $dir)) {
        Write-Log "merged-prs not found, skipping D" "WARN"
        return @{ total_count = 0; added_24h = 0 }
    }
    $all = @(Get-ChildItem -Path $dir -File -Recurse -ErrorAction SilentlyContinue)
    $recent = @($all | Where-Object { $_.LastWriteTime -gt $cutoff })
    Write-Log ("D: merged_prs total={0}, 24h={1}" -f $all.Count, $recent.Count)
    return @{
        total_count = $all.Count
        added_24h = $recent.Count
    }
}

# === E. role_execution snapshot mirror copy ===
function Mirror-RoleExecutionSnapshots {
    $sourceDir = Join-Path $commanderRepo "sync\checkup-scores\role_execution"
    if (-not (Test-Path $sourceDir)) {
        Write-Log "commander#sync/checkup-scores/role_execution not found, skipping E" "WARN"
        return 0
    }
    $sources = @(Get-ChildItem -Path $sourceDir -Filter "snapshot_commander_*.json" -File -ErrorAction SilentlyContinue)
    $copied = 0
    foreach ($s in $sources) {
        $dest = Join-Path $roleExecDir $s.Name
        $needsCopy = $true
        if (Test-Path $dest) {
            $sourceMtime = $s.LastWriteTime
            $destMtime = (Get-Item $dest).LastWriteTime
            if ($sourceMtime -le $destMtime) { $needsCopy = $false }
        }
        if ($needsCopy -and (-not $DryRun)) {
            Copy-Item -Path $s.FullName -Destination $dest -Force
            $copied++
        } elseif ($needsCopy -and $DryRun) {
            Write-Log ("DryRun would copy: {0}" -f $s.Name)
            $copied++
        }
    }
    Write-Log ("E: role_execution snapshots mirrored: {0} (sources={1})" -f $copied, $sources.Count)
    return $copied
}

# === Main ===
Write-Log "=== sync-factory-pipeline v0.1 start ==="
Write-Log "DryRun: $DryRun"
Write-Log "Commander repo: $commanderRepo"
Write-Log "Mirror dir: $mirrorDir"

$snapshot = [ordered]@{
    snapshot_id = "factory_pipeline_$snapshotTime"
    captured_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
    commander_repo_path = $commanderRepo
    cutoff_24h = $cutoff.ToString("yyyy-MM-ddTHH:mm:sszzz")
    tickets_issued = Snap-TicketsIssued
    tickets_completed = Snap-TicketsCompleted
    completion_reports = Snap-CompletionReports
    merged_prs = Snap-MergedPRs
    role_execution_snapshots_mirrored = Mirror-RoleExecutionSnapshots
}

if ($DryRun) {
    Write-Log "DryRun: snapshot not written"
    Write-Log ($snapshot | ConvertTo-Json -Depth 10 -Compress)
} else {
    $snapshot | ConvertTo-Json -Depth 10 | Set-Content -Path $snapshotFile -Encoding UTF8
    Write-Log ("Snapshot written: {0}" -f $snapshotFile)
}

# === Summary for prompt context ===
Write-Log ""
Write-Log "=== Summary ==="
Write-Log ("tickets_issued: total={0} / 24h={1}" -f $snapshot.tickets_issued.total_count, $snapshot.tickets_issued.updated_24h)
Write-Log ("tickets_completed: total={0} / 24h={1}" -f $snapshot.tickets_completed.total_count, $snapshot.tickets_completed.added_24h)
Write-Log ("completion_reports: total={0} / 24h={1}" -f $snapshot.completion_reports.total_count, $snapshot.completion_reports.added_24h)
Write-Log ("merged_prs: total={0} / 24h={1}" -f $snapshot.merged_prs.total_count, $snapshot.merged_prs.added_24h)
Write-Log ("role_execution_mirrored: {0}" -f $snapshot.role_execution_snapshots_mirrored)

# === Garage doctrine self-check ===
$tickets24h = $snapshot.tickets_issued.updated_24h + $snapshot.tickets_completed.added_24h
if ($tickets24h -eq 0) {
    Write-Log "WARN: 0 ticket activity in 24h - factory may be stalled or commander not driving (EVT-014 type)" "WARN"
}

Write-Log "=== sync-factory-pipeline end ==="
exit 0
