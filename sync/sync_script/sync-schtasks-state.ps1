#Requires -Version 5.1
<#
.SYNOPSIS
    Sync schtasks state v0.1 (M2.4, Phase B-α、検診プロトコル v0.2 §7-C 物理装置)

.DESCRIPTION
    schtasks /query 結果を JSON 化し、機能カタログ active/paused/dormant 状態と
    物理層整合性検証 + 命名 vs 実行ファイル整合性検証 + 全停止状態即時検出を実施。

    Output:
      sync/cockpit_state/pipeline_state.json (Layer 1 of cockpit, ADR-009 §6-A 整合)

    検出ルール:
    - 命名違反: TaskName と Task To Run 内 PS1 ファイル名の不整合
    - 全停止: 全 RX 関連タスク Disabled = 🔴 critical アラート
    - 起動失敗: Last Result != 0 で重要度判定

.PARAMETER DryRun
    JSON 生成のみ、ファイル書込なし

.PARAMETER VerboseOutput
    詳細出力

.NOTES
    Drafted: 2026-04-30 (Day 132 evening, supervisor instance A = Argus)
    Basis:
    - M2.4 段階 2 P1 マイルストーン
    - 検診プロトコル v0.2 §7-C パイプライン接続健全性チェック
    - ADR-009 §6-G 検診プロトコル接続
    - EVT-038 全停止状態未認識 + EVT-041 命名違反 + EVT-054 配置パス不整合 構造的対処
#>

param(
    [switch]$DryRun,
    [switch]$VerboseOutput
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$outputDir = Join-Path $repoRoot "sync\cockpit_state"
$outputPath = Join-Path $outputDir "pipeline_state.json"

if (-not (Test-Path $outputDir)) {
    if (-not $DryRun) {
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
}

# RX 関連タスク識別パターン
$rxTaskPattern = '(?i)RX|RecordX|Record-X'

Write-Host "=== sync-schtasks-state v0.1 (M2.4) ==="
Write-Host ""

# schtasks /query 実行
try {
    $allTasks = schtasks /query /fo CSV 2>$null | ConvertFrom-Csv
    if (-not $allTasks) {
        Write-Host "[WARN] schtasks /query returned no tasks"
        exit 1
    }
} catch {
    Write-Host "[ERROR] schtasks /query failed: $_"
    exit 1
}

# RX 関連タスクフィルタ
$rxTasks = @($allTasks | Where-Object { $_.TaskName -match $rxTaskPattern })

# 各タスクの詳細取得
$taskDetails = @()
foreach ($t in $rxTasks) {
    $taskName = $t.TaskName
    if ([string]::IsNullOrEmpty($taskName)) { continue }

    try {
        $detail = schtasks /query /tn $taskName /v /fo LIST 2>$null
        $taskToRun = ($detail | Select-String '^\s*Task To Run:' -CaseSensitive:$false | ForEach-Object { $_.Line -replace '^\s*Task To Run:\s*', '' }) -join ' '
        $lastResult = ($detail | Select-String '^\s*Last Result:' -CaseSensitive:$false | ForEach-Object { ($_.Line -replace '^\s*Last Result:\s*', '').Trim() }) | Select-Object -First 1
        $lastRun = ($detail | Select-String '^\s*Last Run Time:' -CaseSensitive:$false | ForEach-Object { ($_.Line -replace '^\s*Last Run Time:\s*', '').Trim() }) | Select-Object -First 1

        # 命名整合性検証(TaskName 内の Layer 番号 vs Task To Run 内の Layer 番号)
        $taskNameLayerMatch = $taskName -match 'Layer(\d)'
        $taskNameLayer = if ($taskNameLayerMatch) { $matches[1] } else { $null }
        $taskRunLayerMatch = $taskToRun -match 'layer(\d)_entry_point'
        $taskRunLayer = if ($taskRunLayerMatch) { $matches[1] } else { $null }
        $namingConsistent = $true
        if ($taskNameLayer -and $taskRunLayer -and ($taskNameLayer -ne $taskRunLayer)) {
            $namingConsistent = $false
        }

        $taskDetails += [PSCustomObject]@{
            TaskName = $taskName
            Status = $t.Status
            TaskToRun = $taskToRun
            LastResult = $lastResult
            LastRunTime = $lastRun
            NamingConsistent = $namingConsistent
            TaskNameLayer = $taskNameLayer
            TaskRunLayer = $taskRunLayer
        }
    } catch {
        Write-Host "  [WARN] Failed to query $taskName : $_"
    }
}

# 集計(@() で配列ラップ、空配列でも .Count 動作)
$totalTasks = @($taskDetails).Count
$activeCount = @($taskDetails | Where-Object { $_.Status -eq 'Ready' -or $_.Status -eq 'Running' }).Count
$disabledCount = @($taskDetails | Where-Object { $_.Status -eq 'Disabled' }).Count
$namingViolationCount = @($taskDetails | Where-Object { -not $_.NamingConsistent }).Count

# アラート判定
$alerts = @()
if ($totalTasks -gt 0 -and $disabledCount -eq $totalTasks) {
    $alerts += [PSCustomObject]@{
        Severity = 'critical'
        Code = 'ALL_PAUSED'
        Message = "全 RX 関連タスク $totalTasks 件 Disabled = 生産ライン全停止状態"
    }
}
if ($namingViolationCount -gt 0) {
    $alerts += [PSCustomObject]@{
        Severity = 'warning'
        Code = 'NAMING_VIOLATION'
        Message = "命名違反 $namingViolationCount 件検出(TaskName Layer vs Task To Run Layer 不整合)"
    }}
foreach ($d in $taskDetails) {
    if ($d.LastResult -and $d.LastResult -ne '0' -and $d.LastResult -ne '0x0' -and $d.LastResult -ne '267011' -and $d.LastResult -notmatch '使用') {
        $alerts += [PSCustomObject]@{
            Severity = 'warning'
            Code = 'LAUNCH_FAILED'
            Message = "$($d.TaskName) Last Result = $($d.LastResult)(起動失敗の可能性)"
        }
    }
}

# JSON 構造化
$state = [PSCustomObject]@{
    snapshot_id = "pipeline_state_$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    captured_at = (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
    generator = 'sync-schtasks-state.ps1 v0.1 (M2.4)'
    summary = [PSCustomObject]@{
        total_rx_tasks = $totalTasks
        active = $activeCount
        disabled = $disabledCount
        naming_violations = $namingViolationCount
    }
    tasks = $taskDetails
    alerts = $alerts
    yasu_review_priority = if (@($alerts | Where-Object { $_.Severity -eq 'critical' }).Count -gt 0) { 'red' } elseif (@($alerts | Where-Object { $_.Severity -eq 'warning' }).Count -gt 0) { 'yellow' } else { 'green' }
}

$json = $state | ConvertTo-Json -Depth 5

Write-Host "Total RX tasks: $totalTasks"
Write-Host "  Active:    $activeCount"
Write-Host "  Disabled:  $disabledCount"
Write-Host "  Naming violations: $namingViolationCount"
Write-Host "  Alerts:    $($alerts.Count)"
Write-Host ""
foreach ($a in $alerts) {
    $icon = switch ($a.Severity) {
        'critical' { '🔴' }
        'warning'  { '🟡' }
        default    { '🟢' }
    }
    Write-Host "  $icon [$($a.Code)] $($a.Message)"
}
Write-Host ""

if ($DryRun) {
    Write-Host "DryRun: skipping output write"
    if ($VerboseOutput) {
        Write-Host ""
        Write-Host "$json"
    }
} else {
    [System.IO.File]::WriteAllText($outputPath, $json, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Output: $outputPath"
}

Write-Host ""
Write-Host "=== Sync schtasks state complete ==="
