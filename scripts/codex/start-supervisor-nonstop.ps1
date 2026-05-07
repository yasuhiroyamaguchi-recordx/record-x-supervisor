param(
    [Parameter(Mandatory = $true)]
    [string] $Workdir
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $Workdir)) {
    Write-Error "Workdir が存在しません: $Workdir"
    exit 1
}

Write-Host ''
Write-Host '=== Supervisor Codex (non-stop) ===' -ForegroundColor Cyan
Write-Host '編集禁止: Factory / Commander / Strategy Lab の各リポジトリへの書き込みは行わないこと。'
Write-Host 'Danger / full access は無効方針: --sandbox workspace-write のみを使用。danger・full-access モードは使わないこと。'
Write-Host ''
Write-Host '--- git status ---' 
& git -C $Workdir status --short
if ($LASTEXITCODE -ne 0) {
    Write-Error "git -C が失敗しました (exit $LASTEXITCODE)."
    exit $LASTEXITCODE
}

$codex = Get-Command codex -ErrorAction SilentlyContinue
if (-not $codex) {
    Write-Error "codex コマンドが PATH で見つかりません。OpenAI Codex CLI をインストールし PATH に追加してください。"
    exit 127
}

& codex --sandbox workspace-write --ask-for-approval never --cd $Workdir @args
exit $LASTEXITCODE
