#Requires -Version 5.1
<#
.SYNOPSIS
    Pipeline bottleneck probe v0.2 (Argus-B 自律執行、2026-05-01 Yas メーター計測提案 + メータ自己観測 提案 連動契機)

.DESCRIPTION
    自動同期パイプラインのボトルネック計測装置。

    観測対象:
    - Stage 1: factory staging → commander processed (file count + max mtime gap)
    - Stage 2: commander processed → supervisor b_line (file count + max mtime gap)
    - schtasks LastRun freshness (RecordX_ArchiveSync_ThreeRealm 等の停止経過時間)
    - Queue depth: tickets_issued 弾余り

    出力:
    - JSON snapshot to sync/cockpit_state/bottleneck_probe.json
    - Console summary with 🟢 / 🟡 / 🔴 alert level

    検診仕様 v1.0 の scope gap(役割実行のみ計測、装置稼働は未計測)を埋める。
    定期 cron で 09:00 JST 起動 → cockpit に統合 → 弾詰まり早期警告。

    本 probe は read-only。物理層への書込は cockpit_state JSON 1 件のみ。

.PARAMETER DryRun
    JSON 書込なしで console 出力のみ

.PARAMETER FactoryStagingRoot
    factory side staging completion_reports root

.PARAMETER CommanderRoot
    commander repo root

.NOTES
    Drafted: 2026-05-01 (真 Day 129) by Argus-B
    Basis: Yas 2026-05-01「定期検診でボトルネック探しのメーター計測をすべきか?」契機
    Related: operations/autonomy_boundary_doctrine.md §2-A 物理層機能等価検証義務、
             02_physical/recording_office_health_check_v1_0.md v1.0 の scope 拡張提案
#>

param(
    [switch]$DryRun,
    [string]$FactoryStagingRoot = "C:\RX_Dev\ProjectRX_HQ\wt_common\staging\completion_reports",
    [string]$CommanderRoot = "C:\RX_Dev\record-x-commander"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$supervisorRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$now = Get-Date

function Get-LatestMtime($path, $filter = "*.json") {
    if (-not (Test-Path $path)) { return $null }
    $files = Get-ChildItem -Path $path -Filter $filter -File -Recurse -ErrorAction SilentlyContinue
    if (-not $files -or $files.Count -eq 0) { return $null }
    return ($files | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
}

function Count-Files($path, $filter = "*.json") {
    if (-not (Test-Path $path)) { return 0 }
    return (Get-ChildItem -Path $path -Filter $filter -File -Recurse -ErrorAction SilentlyContinue).Count
}

# Stage 1: factory staging -> commander processed
$stage1Src = $FactoryStagingRoot
$stage1Dst = Join-Path $CommanderRoot "sync\completion_reports\processed"
$stage1SrcCount = Count-Files $stage1Src
$stage1DstCount = Count-Files $stage1Dst
$stage1SrcMtime = Get-LatestMtime $stage1Src
$stage1DstMtime = Get-LatestMtime $stage1Dst
$stage1Gap = if ($stage1SrcMtime -and $stage1DstMtime) {
    [int]($stage1SrcMtime - $stage1DstMtime).TotalHours
} else { $null }

# Stage 2: commander processed -> supervisor b_line
$stage2Src = Join-Path $CommanderRoot "sync\completion_reports\processed"
$stage2Dst = Join-Path $supervisorRoot "sync\completion_reports\b_line"
$stage2SrcCount = Count-Files $stage2Src
$stage2DstCount = Count-Files $stage2Dst
$stage2SrcMtime = Get-LatestMtime $stage2Src
$stage2DstMtime = Get-LatestMtime $stage2Dst
$stage2Gap = if ($stage2SrcMtime -and $stage2DstMtime) {
    [int]($stage2SrcMtime - $stage2DstMtime).TotalHours
} else { $null }

# schtasks freshness
$watchedTasks = @(
    'RecordX_ArchiveSync_ThreeRealm',
    'RecordX_DreamCrystallize_Supervisor',
    'RX-Layer1-Implementation',
    'RX-Layer2-Strategy',
    'RX-Layer3-News',
    'RX-Layer4-Checkup'
)
$taskHealth = @()
foreach ($tn in $watchedTasks) {
    try {
        $task = Get-ScheduledTask -TaskName $tn -ErrorAction Stop
        $info = $task | Get-ScheduledTaskInfo
        $hoursSinceLast = if ($info.LastRunTime -and $info.LastRunTime.Year -gt 2000) {
            [int]($now - $info.LastRunTime).TotalHours
        } else { 99999 }
        $alert = if ($hoursSinceLast -gt 168) { 'red' }    # > 7 days
                 elseif ($hoursSinceLast -gt 24) { 'yellow' }
                 else { 'green' }
        $taskHealth += [PSCustomObject]@{
            TaskName = $tn
            LastRunTime = if ($info.LastRunTime.Year -gt 2000) { $info.LastRunTime.ToString('yyyy-MM-ddTHH:mm:sszzz') } else { 'never' }
            HoursSinceLast = $hoursSinceLast
            LastResult = $info.LastTaskResult
            Alert = $alert
        }
    } catch {
        $taskHealth += [PSCustomObject]@{
            TaskName = $tn
            LastRunTime = 'task_not_found'
            HoursSinceLast = $null
            LastResult = $null
            Alert = 'red'
        }
    }
}

# Queue depth (tickets_issued)
$ticketsIssuedRoot = Join-Path $CommanderRoot "strategy\tickets_issued"
$queueDepth = if (Test-Path $ticketsIssuedRoot) {
    (Get-ChildItem -Path $ticketsIssuedRoot -Filter "*.md" -File -Recurse -ErrorAction SilentlyContinue).Count
} else { $null }

# v0.2 meta-meter: 既存検診メーター本体の生死確認(self-watching dog 問題対策)
# 各メーターの最終更新からの経過時間を計測、停滞 = 死亡シグナル
$meterPaths = @(
    @{ Name = "daily_cockpit"; Path = Join-Path $supervisorRoot "02_physical\cockpit"; Filter = "daily_cockpit_*.md"; Pattern = "latest" },
    @{ Name = "pipeline_state"; Path = Join-Path $supervisorRoot "sync\cockpit_state\pipeline_state.json"; Filter = $null; Pattern = "single" },
    @{ Name = "role_exec_snapshot"; Path = Join-Path $supervisorRoot "sync\checkup-scores\role_execution"; Filter = "*_cycle_auto.json"; Pattern = "latest" }
)
$meterHealth = @()
foreach ($m in $meterPaths) {
    if (-not (Test-Path $m.Path)) {
        $meterHealth += [PSCustomObject]@{
            Meter = $m.Name; LastUpdate = 'not_present'; HoursSinceLast = $null; Alert = 'red'
        }
        continue
    }
    $latestMtime = if ($m.Pattern -eq 'single') {
        (Get-Item $m.Path).LastWriteTime
    } else {
        $files = @(Get-ChildItem -Path $m.Path -Filter $m.Filter -File -ErrorAction SilentlyContinue)
        if ($files.Count -gt 0) {
            ($files | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
        } else { $null }
    }
    if (-not $latestMtime) {
        $meterHealth += [PSCustomObject]@{
            Meter = $m.Name; LastUpdate = 'no_files'; HoursSinceLast = $null; Alert = 'red'
        }
        continue
    }
    $h = [int]($now - $latestMtime).TotalHours
    $a = if ($h -gt 26) { 'red' }    # daily 装置で > 26h = 1 cycle 以上欠測
         elseif ($h -gt 12) { 'yellow' }
         else { 'green' }
    $meterHealth += [PSCustomObject]@{
        Meter = $m.Name
        LastUpdate = $latestMtime.ToString('yyyy-MM-ddTHH:mm:sszzz')
        HoursSinceLast = $h
        Alert = $a
    }
}

# Alert thresholds
$stage1Alert = if ($stage1SrcCount -eq 0) { 'green' }
               elseif ($stage1Gap -ge 24) { 'red' }
               elseif ($stage1Gap -ge 6) { 'yellow' }
               else { 'green' }
$stage2Alert = if ($stage2SrcCount -eq 0) { 'green' }
               elseif ($stage2Gap -ge 24) { 'red' }
               elseif ($stage2Gap -ge 6) { 'yellow' }
               else { 'green' }
$queueAlert = if ($queueDepth -ge 30) { 'red' }
              elseif ($queueDepth -ge 15) { 'yellow' }
              else { 'green' }

$overallAlert = @($stage1Alert, $stage2Alert, $queueAlert) + ($taskHealth | ForEach-Object { $_.Alert }) + ($meterHealth | ForEach-Object { $_.Alert }) |
                ForEach-Object { switch ($_) { 'red' { 3 } 'yellow' { 2 } 'green' { 1 } default { 0 } } } |
                Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
$overallSymbol = switch ($overallAlert) { 3 { '🔴' } 2 { '🟡' } 1 { '🟢' } default { '⚪' } }

$snapshot = [ordered]@{
    snapshot_id = "bottleneck_probe_$($now.ToString('yyyyMMdd-HHmmss'))"
    captured_at = $now.ToString('yyyy-MM-ddTHH:mm:sszzz')
    generator = "pipeline-bottleneck-probe.ps1 v0.2 (with meta-meter / self-watching dog)"
    overall = @{ alert = switch ($overallAlert) { 3 { 'red' } 2 { 'yellow' } 1 { 'green' } default { 'unknown' } }; symbol = $overallSymbol }
    stage1 = @{
        description = "factory staging -> commander processed"
        src_count = $stage1SrcCount
        dst_count = $stage1DstCount
        src_latest_mtime = if ($stage1SrcMtime) { $stage1SrcMtime.ToString('yyyy-MM-ddTHH:mm:sszzz') } else { $null }
        dst_latest_mtime = if ($stage1DstMtime) { $stage1DstMtime.ToString('yyyy-MM-ddTHH:mm:sszzz') } else { $null }
        gap_hours = $stage1Gap
        alert = $stage1Alert
    }
    stage2 = @{
        description = "commander processed -> supervisor b_line"
        src_count = $stage2SrcCount
        dst_count = $stage2DstCount
        src_latest_mtime = if ($stage2SrcMtime) { $stage2SrcMtime.ToString('yyyy-MM-ddTHH:mm:sszzz') } else { $null }
        dst_latest_mtime = if ($stage2DstMtime) { $stage2DstMtime.ToString('yyyy-MM-ddTHH:mm:sszzz') } else { $null }
        gap_hours = $stage2Gap
        alert = $stage2Alert
    }
    queue = @{
        description = "commander tickets_issued depth"
        depth = $queueDepth
        alert = $queueAlert
    }
    schtasks_health = $taskHealth
    meter_health = $meterHealth
}

$jsonOut = $snapshot | ConvertTo-Json -Depth 6

# Console summary
Write-Host "=== Pipeline Bottleneck Probe v0.1 ($overallSymbol) ==="
Write-Host "Captured: $($snapshot.captured_at)"
Write-Host ""
Write-Host "Stage 1 (factory->commander): $($stage1Alert.ToUpper()) | src=$stage1SrcCount, dst=$stage1DstCount, gap=${stage1Gap}h"
Write-Host "Stage 2 (commander->supervisor): $($stage2Alert.ToUpper()) | src=$stage2SrcCount, dst=$stage2DstCount, gap=${stage2Gap}h"
Write-Host "Queue depth (tickets_issued): $($queueAlert.ToUpper()) | depth=$queueDepth"
Write-Host ""
Write-Host "schtasks health:"
foreach ($t in $taskHealth) {
    $sym = switch ($t.Alert) { 'red' { '🔴' } 'yellow' { '🟡' } 'green' { '🟢' } default { '⚪' } }
    Write-Host "  $sym $($t.TaskName): LastRun=$($t.LastRunTime), hoursSince=$($t.HoursSinceLast), lastResult=$($t.LastResult)"
}
Write-Host ""
Write-Host "meter health (self-watching dog v0.2):"
foreach ($m in $meterHealth) {
    $sym = switch ($m.Alert) { 'red' { '🔴' } 'yellow' { '🟡' } 'green' { '🟢' } default { '⚪' } }
    Write-Host "  $sym $($m.Meter): LastUpdate=$($m.LastUpdate), hoursSince=$($m.HoursSinceLast)"
}

if (-not $DryRun) {
    $outPath = Join-Path $supervisorRoot "sync\cockpit_state\bottleneck_probe.json"
    $outDir = Split-Path $outPath -Parent
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
    $jsonOut | Out-File -FilePath $outPath -Encoding utf8 -Force
    Write-Host ""
    Write-Host "Snapshot written: $outPath"
}
