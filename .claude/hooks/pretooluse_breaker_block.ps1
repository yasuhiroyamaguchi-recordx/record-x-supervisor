# PreToolUse hook: 破壊系操作の deny / ask 動作分岐
# 環境層配備 Step 1(claude.ai 提案 1 番、第 99 次発令経路、第 106 次発令着手宣言、Day 131 朝起動時実装)
#
# 入力: stdin に Claude Code から tool_input JSON が渡される
# 形式: { "tool_name": "Bash|Edit|Write", "tool_input": { ... } }
#
# 出力: exit code
#   0  = allow(通常実行)
#   2  = deny(完全ブロック、stderr に理由出力)
#   それ以外 = Claude Code 既定挙動(ask 相当)
#
# 既存装置拡張(Plan-First 例外 (iii) 該当、新規装置追加禁止令該当外)

param()

$ErrorActionPreference = 'Stop'

try {
    $raw = [Console]::In.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($raw)) {
        exit 0
    }
    $payload = $raw | ConvertFrom-Json -ErrorAction SilentlyContinue
} catch {
    exit 0
}

if ($null -eq $payload) { exit 0 }

$toolName  = $payload.tool_name
$toolInput = $payload.tool_input

# 検査対象は Bash / Edit / Write のみ(他ツールは pass)
if ($toolName -notin @('Bash', 'Edit', 'Write', 'PowerShell')) {
    exit 0
}

# 検査用文字列(Bash command + PowerShell command + Edit/Write file_path 統合)
$inspectTargets = @()
if ($toolInput.command)    { $inspectTargets += [string]$toolInput.command }
if ($toolInput.file_path)  { $inspectTargets += [string]$toolInput.file_path }
if ($toolInput.old_string) { $inspectTargets += [string]$toolInput.old_string }
if ($toolInput.new_string) { $inspectTargets += [string]$toolInput.new_string }

$inspect = ($inspectTargets -join ' ')

if ([string]::IsNullOrWhiteSpace($inspect)) { exit 0 }

# 🔴 deny カテゴリ(完全ブロック、明示承認なし実行不可)
$denyPatterns = @(
    @{ Pattern = 'git\s+push\s+(--force|-f)\b';                     Reason = 'force push 禁止(明示承認経路へ)' },
    @{ Pattern = 'git\s+push\s+.*\s+(--force|-f)\b';                Reason = 'force push 禁止(明示承認経路へ)' },
    @{ Pattern = 'git\s+reset\s+--hard\s+(origin|HEAD~|HEAD\^)';    Reason = 'hard reset to remote/older 禁止(uncommitted 喪失リスク)' },
    @{ Pattern = 'git\s+branch\s+-D\s+(main|master)\b';             Reason = 'main/master ブランチ削除禁止' },
    @{ Pattern = 'git\s+push\s+.*\s+:main\b';                       Reason = 'main remote 削除 push 禁止' },
    @{ Pattern = 'rm\s+-rf\s+/(\s|$)';                              Reason = 'rm -rf / 禁止(全消去)' },
    @{ Pattern = 'rm\s+-rf\s+~(\s|$|/)';                            Reason = 'rm -rf ~ 禁止(ホーム消去)' },
    @{ Pattern = 'rm\s+-rf\s+\$HOME(\s|$|/)';                       Reason = 'rm -rf $HOME 禁止' },
    @{ Pattern = 'DROP\s+(DATABASE|SCHEMA|TABLE)\b';                Reason = 'DB DROP 禁止(明示承認経路へ)' },
    @{ Pattern = 'TRUNCATE\s+TABLE\b';                              Reason = 'TRUNCATE TABLE 禁止' },
    @{ Pattern = '--no-verify\b';                                   Reason = 'hook bypass 禁止(CLAUDE.md 規律根本原因対応)' },
    @{ Pattern = '--no-gpg-sign\b';                                 Reason = '署名 bypass 禁止' }
)

foreach ($p in $denyPatterns) {
    if ($inspect -match $p.Pattern) {
        [Console]::Error.WriteLine("[PreToolUse hook deny] $($p.Reason) | matched: $($p.Pattern)")
        exit 2
    }
}

# 🟡 ask カテゴリは Claude Code 既定経路(ヤス permission prompt)に委ねる
# = exit 0 で hook 通過 + 既定 permission 判定で承認プロンプト発動
# (本 hook は deny のみ強制、ask は既定経路活用)

exit 0
