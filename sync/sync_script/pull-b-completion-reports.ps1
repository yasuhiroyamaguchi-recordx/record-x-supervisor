# ===================================================================
# pull-b-completion-reports.ps1
# Record X Supervisor - B ライン completion_report pull スクリプト v1.0
#
# 目的: record-x-commander の sync/completion_reports/processed/ から
#       B ライン（DO-COMMON-* / DO-CITY-* / DO-COMMANDER-B-*）の
#       completion_report を supervisor 側 b_line/ に片方向同期する
#
# 使い方:
#   .\sync\sync_script\pull-b-completion-reports.ps1
#   .\sync\sync_script\pull-b-completion-reports.ps1 -DryRun
#   .\sync\sync_script\pull-b-completion-reports.ps1 -Verbose
#
# 特性:
#   - 片方向のみ（commander → supervisor b_line/）
#   - 差分のみ（既存ファイルはスキップ、べき等）
#   - A ライン（DO-FACTORY-* / DO-CP-* / DO-COMMANDER-{無印} 等）は対象外
#   - エラー時も継続（個別ファイル失敗はカウント + WARNING、全失敗のみ exit 1）
#
# 前提:
#   - record-x-commander が C:\RX_Dev\record-x-commander に配置済み
#   - record-x-supervisor が C:\RX_Dev\record-x-supervisor に配置済み
#
# 実装根拠: DO-COMMANDER-B-001（B ライン引取、監督官 B 承認 + Yasu 経由確定）
# ===================================================================

param(
    [switch]$DryRun,
    [switch]$Verbose,
    [string]$SrcDir = "C:\RX_Dev\record-x-commander\sync\completion_reports\processed",
    [string]$DstDir = ""
)

# === cwd 非依存化: $repoRoot を $PSScriptRoot から解決 ===
# $PSScriptRoot = record-x-supervisor/sync/sync_script/
# Split-Path -Parent → record-x-supervisor/sync/
# Split-Path -Parent → record-x-supervisor/
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

if ($DstDir -eq "") {
    $DstDir = Join-Path $repoRoot "sync\completion_reports\b_line"
}

# === B ライン対象 glob パターン ===
$bLineGlobs = @("DO-COMMON-*_completion*.json", "DO-CITY-*_completion*.json", "DO-COMMANDER-B-*_completion*.json")

# === 存在チェック ===
if (-not (Test-Path $SrcDir)) {
    Write-Host "ERROR: SrcDir が存在しません: $SrcDir" -ForegroundColor Red
    Write-Host "       record-x-commander が C:\RX_Dev\record-x-commander に配置されているか確認してください。" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $DstDir)) {
    Write-Host "WARNING: DstDir が存在しません。作成します: $DstDir" -ForegroundColor Yellow
    if (-not $DryRun) {
        try {
            New-Item -ItemType Directory -Force -Path $DstDir | Out-Null
        } catch {
            Write-Host "ERROR: DstDir 作成失敗: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "[DRY RUN] DstDir 作成をスキップしました。" -ForegroundColor Yellow
    }
}

# === B ライン ファイル収集（再帰、date サブディレクトリ対応）===
$srcFiles = @()
foreach ($glob in $bLineGlobs) {
    $matched = Get-ChildItem -Path $SrcDir -Filter $glob -File -Recurse -ErrorAction SilentlyContinue
    if ($matched) { $srcFiles += $matched }
}

if ($srcFiles.Count -eq 0) {
    Write-Host "B ライン completion_report が $SrcDir に見つかりませんでした。" -ForegroundColor Yellow
    exit 0
}

# === 既存 b_line/ ファイル名セット（スキップ判定用）===
$dstFileNames = @{}
Get-ChildItem -Path $DstDir -Filter "*.json" -File -ErrorAction SilentlyContinue | ForEach-Object {
    $dstFileNames[$_.Name] = $true
}

$newFiles     = $srcFiles | Where-Object { -not $dstFileNames.ContainsKey($_.Name) }
$skippedFiles = $srcFiles | Where-Object { $dstFileNames.ContainsKey($_.Name) }

# === サマリー表示 ===
Write-Host ""
Write-Host "=== B ライン completion_report pull サマリー ===" -ForegroundColor Cyan
Write-Host "Source (再帰): $SrcDir"
Write-Host "Destination:   $DstDir"
Write-Host "B ライン総数:  $($srcFiles.Count) 本"
Write-Host "新規コピー:    $($newFiles.Count) 本"
Write-Host "既存スキップ:  $($skippedFiles.Count) 本"
Write-Host ""

if ($Verbose -and $skippedFiles.Count -gt 0) {
    Write-Host "[SKIP]" -ForegroundColor DarkGray
    $skippedFiles | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor DarkGray }
    Write-Host ""
}

if ($DryRun) {
    Write-Host "[DRY RUN] 以下のファイルがコピーされる予定:" -ForegroundColor Yellow
    if ($newFiles.Count -eq 0) {
        Write-Host "  (なし、全件スキップ)" -ForegroundColor Yellow
    } else {
        $newFiles | ForEach-Object { Write-Host "  + $($_.Name)" }
    }
    Write-Host ""
    Write-Host "実行するには -DryRun を外してください。" -ForegroundColor Yellow
    exit 0
}

# === 新規ファイルのコピー ===
if ($newFiles.Count -eq 0) {
    Write-Host "新規コピー対象なし。b_line/ は最新状態です。" -ForegroundColor Green
    exit 0
}

$successCount = 0
$failCount    = 0

foreach ($file in $newFiles) {
    try {
        $dstPath = Join-Path $DstDir $file.Name
        Copy-Item -Path $file.FullName -Destination $dstPath -Force -ErrorAction Stop
        Write-Host "  [OK]   $($file.Name)" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "  [WARN] $($file.Name): $($_.Exception.Message)" -ForegroundColor Yellow
        $failCount++
    }
}

# === 結果 ===
Write-Host ""
Write-Host "=== pull 結果 ===" -ForegroundColor Cyan
Write-Host "成功: $successCount 本" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "失敗: $failCount 本" -ForegroundColor Yellow
    if ($failCount -eq $newFiles.Count) {
        Write-Host "全件失敗。" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""
Write-Host "B ライン completion_report pull 完了。" -ForegroundColor Green
Write-Host ""
