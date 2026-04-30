#Requires -Version 5.1
<#
.SYNOPSIS
    Pull B-line completion_reports v0.1 (DO-COMMANDER-B-001)

.DESCRIPTION
    B ライン専用 completion_report の commander -> supervisor 片方向同期。
    A/B ライン分離プロトコル v1.0 における B ライン引取案件
    (横断調停依頼 001 を本ライン内完結で解決) の核心装置。

    Sync direction : record-x-commander/sync/completion_reports/processed
                     -> record-x-supervisor/sync/completion_reports/b_line
    Filter         : DO-COMMON-* / DO-CITY- / DO-COMMANDER-B- 系のみ。
                     A ライン系 (DO-FACTORY-* / DO-CP-* / DO-AUTO-*
                     / DO-COMMANDER-A-* / 無印 DO-COMMANDER-{NNN}) は対象外。
    Idempotent     : 既存ファイルはスキップ、新規のみコピー。
    A line非干渉  : sync-archive-three-realm.ps1 とは別ファイル
                     + 別 glob + 別配信先で完全独立。

.PARAMETER DryRun
    試行モード。コピー予定の表示のみ、実コピーはスキップ。

.PARAMETER VerboseLog
    各ファイルのコピー詳細を表示する追加ログ。
    PowerShell 共通パラメータ Verbose とは別物。

.PARAMETER SrcDir
    司令官側の completion_report 配布元ディレクトリ。

.PARAMETER DstDir
    監督官 B 側の B ライン専用配信先ディレクトリ。

.NOTES
    Drafted : 2026-04-30 (Castor-B, Day 132 evening)
    Basis   :
    - 監督官 B (Argus-B) 承認 + 司令官 B (Beacon-B) 発令
    - Yasu 経由 B ライン引取確定 (2026-04-30 朝)
    - 横断調停依頼 001 の B ライン側引取転換
    - sync-archive-three-realm.ps1 v0.1 同パターン実装
#>

param(
    [switch]$DryRun,
    [switch]$VerboseLog,
    [string]$SrcDir = "C:\RX_Dev\record-x-commander\sync\completion_reports\processed",
    [string]$DstDir = "C:\RX_Dev\record-x-supervisor\sync\completion_reports\b_line"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# B ライン専用 glob (frontmatter prefix 規約準拠)
$BLineGlobs = @(
    'DO-COMMON-*_completion*.json',
    'DO-CITY-*_completion*.json',
    'DO-COMMANDER-B-*_completion*.json'
)

$transferred = 0
$skipped = 0
$errors = 0

Write-Host "=== Pull B-line Completion Reports v0.1 (DO-COMMANDER-B-001) ==="
Write-Host "Src : $SrcDir"
Write-Host "Dst : $DstDir"
Write-Host "DryRun : $DryRun"
Write-Host ""

if (-not (Test-Path $SrcDir)) {
    Write-Host "[ERROR] Source directory not found: $SrcDir" -ForegroundColor Red
    Write-Host "  司令官側で completion_report が processed まで到達していない可能性。" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $DstDir)) {
    if ($DryRun) {
        Write-Host "[DryRun] Would create destination: $DstDir"
    } else {
        try {
            New-Item -ItemType Directory -Path $DstDir -Force | Out-Null
            Write-Host "Created destination: $DstDir"
        } catch {
            Write-Host "[ERROR] Failed to create destination: $DstDir" -ForegroundColor Red
            Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    }
}

foreach ($glob in $BLineGlobs) {
    $files = Get-ChildItem -Path $SrcDir -Filter $glob -File -Recurse -ErrorAction SilentlyContinue
    foreach ($f in $files) {
        $destFile = Join-Path $DstDir $f.Name

        if (Test-Path $destFile) {
            $skipped++
            if ($VerboseLog) {
                Write-Host "  [skip] already present: $($f.Name)"
            }
            continue
        }

        if ($DryRun) {
            Write-Host "  [DryRun] would copy: $($f.Name) -> $destFile"
            $transferred++
            continue
        }

        try {
            Copy-Item $f.FullName -Destination $destFile -Force
            Write-Host "  [copy] $($f.Name)"
            $transferred++
        } catch {
            Write-Host "  [WARN] copy failed: $($f.Name)" -ForegroundColor Yellow
            Write-Host "    $($_.Exception.Message)" -ForegroundColor Yellow
            $errors++
        }
    }
}

Write-Host ""
Write-Host "=== Sync Result ==="
Write-Host "Transferred : $transferred"
Write-Host "Skipped (already present) : $skipped"
Write-Host "Errors : $errors"
Write-Host ""

if ($errors -gt 0) {
    Write-Host "Sync completed with errors." -ForegroundColor Yellow
    exit 1
}

Write-Host "Sync complete."
exit 0
