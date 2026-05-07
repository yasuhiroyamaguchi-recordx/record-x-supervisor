---
id: Y4-B-PRETOOLUSE-HOOK-V4
title: Y4-B PreToolUse hook 詳細設計 v4(Hook Ticket Template v1 適用 + Strategy Lab F1-F4 全反映)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
ticket_type: hook_implementation
yasu_modification_v3_to_v4:
  - "F1: regex を `^DO-[A-Z]+(?:-[A-Z]+)*-\\d+.*\\.md$` に修正(複合 prefix 対応)"
  - "F2: DoD テスト 7 件以上 + log rotation policy 明記"
  - "F4: Hook Contract セクション + frontmatter `hook_contract` 必須化(Hook Ticket Template v1 適用)"
  - "v3 既存内容(self-modification block + fail open + log + pwsh fallback)維持"
prior_versions:
  - "v1: 2026-05-07 朝末末末(`outbox/20260507_to_commander_a133.md` §3、ヤス差戻し)"
  - "v2: 2026-05-07 朝末末末末(本会話、Write 全件 block 修正)"
  - "v3: 2026-05-07 朝末末末末末(`staging/y4_b_pretooluse_hook_v3.md`、settings 上書き禁止 + fail open)"
  - "v4: 2026-05-08 朝(本ファイル、Strategy Lab F1-F4 + Codex 採点改善 + Hook Ticket Template v1 適用)"
yasu_decision_pending: true
related_evt: EVT-20260507-120
related_orders: [127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137]
template_applied: staging/template_hook_ticket_with_contract_v1.md
codex_score_target: 95+/100

# === Hook Contract(必須、F4 反映)===
hook_contract:
  target_runtime: Claude Code (PreToolUse hook)
  config_path: C:\RX_Dev\ProjectRX_HQ\wt_common\.claude\settings.json
  hook_key: hooks.PreToolUse[].matcher
  matcher_pattern: "Write|Edit|MultiEdit|NotebookEdit"
  hook_script_path: C:\RX_Dev\ProjectRX_HQ\wt_common\.claude\hooks\pretooluse_ticket_block.ps1
  hook_script_alternative: "$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path"
  input_schema_source: "Claude Code PreToolUse hook 仕様 + observed sample(JSON with tool_name + file_path)"
  block_exit_code: 1
  allow_exit_code: 0
  fail_open_policy:
    - input_parse_error: exit 0 + log FAIL_OPEN_PARSE_ERROR
    - missing_required_field: exit 0 + log FAIL_OPEN_MISSING_FIELD
    - test_path_error: exit 0 + log FAIL_OPEN_TESTPATH_ERROR
    - hook_script_internal_error: exit 0 + log FAIL_OPEN_INTERNAL_ERROR
  fail_close_paths:
    - deny_pattern_matched: exit 1 + log BLOCKED_<reason>
    - self_modification_attempt: exit 1 + log BLOCKED_SELF_MODIFICATION
  cwd_assumption: irrelevant (script-local paths used via $scriptDir)
  self_modification_block:
    - "wt_common/.claude/settings.json"
    - "wt_common/.claude/hooks/*.ps1"
    - "wt_common/.claude/settings.local.json"
  log_path: "$scriptDir/../../logs/pretooluse_hook.log"
  log_format: JSON Lines
  log_rotation_policy: manual review (initial release)、auto-rotate is future enhancement
  rollback_path: "Bash spawn 経由 settings.json hooks entry 削除(self-modification block 範囲外)"
  non_applicable_agents:
    - "Codex (GPT-5.5) — covered by AGENTS.md §3 (E-axis、ヤス Y4-E 採択済)"
  pwsh_fallback: |
    if exist "%PROGRAMFILES%\PowerShell\7\pwsh.exe"
      pwsh.exe -NoProfile -ExecutionPolicy Bypass -File <hook_script_path>
    else
      powershell.exe -NoProfile -ExecutionPolicy Bypass -File <hook_script_path>
  evidence_required:
    - "log excerpt showing PreToolUse hook invoked on deny test"
    - "command exit code observed as block (=1) for deny test"
    - "command exit code observed as allow (=0) for pass-through test"
    - "diff showing existing settings.json keys preserved (no self-modification)"
---

# Y4-B PreToolUse hook 詳細設計 v4(staging、ヤス採否対象、Hook Ticket Template v1 適用)

## 1. Goal(目的)

EVT-20260507-120(工場長自前チケット起案 + 累積物理証拠 8 系列)への構造的防止 = 5 軸ガード 軸 B 物理装置化。

Claude Code 工場長班(Castor)による DO-*.md 新規創出を物理的に block + 自己改ざん回避 + 業務継続性確保(fail open)。

Codex(GPT-5.5)= hook 不対応 = AGENTS.md §3(E 軸、ヤス Y4-E 採択済)規律レベル防止で並行カバー。

## 2. Scope / Out of Scope

### 2-A. In Scope

- Claude Code Castor 工場長班による `DO-*.md` 新規 Write 全 path block
- 既存 `wt_common/tickets/` 配下 DO-*.md への Edit/MultiEdit allow
- `.claude/settings.json` + `.claude/hooks/*.ps1` への Write/Edit を block(自己改ざん回避)
- 異常時 fail open(業務継続性確保)
- log 装置(JSON Lines、`$scriptDir/../../logs/`)
- pwsh.exe → powershell.exe フォールバック

### 2-B. Out of Scope

- Codex(GPT-5.5)経路への適用(AGENTS.md §3 で並行カバー)
- C-2 着手 / Dashboard 機能追加 / 実 API 接続 / Write 操作(DP-001 制約遵守、本 hook は規律装置のみ)
- 三者 / 司令官 / supervisor repo への hook 適用(本 hook は工場長 repo 限定)
- 完全自動 log rotation(初版は手動 review、将来拡張)

## 3. Hook Contract Section(frontmatter `hook_contract` と同期、散文化)

| 項目 | 値 |
|---|---|
| target_runtime | Claude Code(PreToolUse hook) |
| config_path | `C:\RX_Dev\ProjectRX_HQ\wt_common\.claude\settings.json`(絶対パス) |
| hook_key | `hooks.PreToolUse[].matcher` |
| matcher_pattern | `Write\|Edit\|MultiEdit\|NotebookEdit` |
| hook_script_path | `C:\RX_Dev\ProjectRX_HQ\wt_common\.claude\hooks\pretooluse_ticket_block.ps1`(絶対パス推奨) |
| script-local 代替 | `$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path` |
| input_schema_source | Claude Code PreToolUse hook 仕様 + observed sample(JSON `{tool_name, file_path}`) |
| block_exit_code | 1 |
| allow_exit_code | 0 |
| fail_open_policy | input parse error / missing field / Test-Path error / internal error → exit 0 + log |
| fail_close_paths | deny pattern matched / self-modification attempt → exit 1 + log |
| cwd_assumption | irrelevant(script-local paths used via `$scriptDir`)|
| self_modification_block | `.claude/settings.json` + `.claude/hooks/*.ps1` + `.claude/settings.local.json` |
| log_path | `$scriptDir/../../logs/pretooluse_hook.log` |
| log_format | JSON Lines |
| log_rotation_policy | manual review(初版)、auto-rotate は将来拡張 |
| rollback_path | Bash spawn 経由 settings.json hooks entry 削除(self-modification block 範囲外) |
| non_applicable_agents | Codex(GPT-5.5)— AGENTS.md §3(E 軸)で並行カバー |
| pwsh_fallback | 分岐コマンド(pwsh.exe → powershell.exe) |
| evidence_required | log excerpt + exit code + pass-through 確認 + diff 保全確認 |

## 4. Detection Logic(疑似コード完全版、F1 反映)

```powershell
# pretooluse_ticket_block.ps1 (v4 完全版)
# 配置: C:\RX_Dev\ProjectRX_HQ\wt_common\.claude\hooks\pretooluse_ticket_block.ps1
# 起動: PreToolUse hook、matcher = "Write|Edit|MultiEdit|NotebookEdit"
# 規律: fail open(error 時 exit 0、業務継続)+ self-modification block + 複合 prefix regex 対応

param([string]$ToolInput)

# === fail open guard 1: 入力 parse error ===
try {
    $inputJson = $ToolInput | ConvertFrom-Json -ErrorAction Stop
} catch {
    Write-Warning "PRETOOLUSE_HOOK: input parse failed, fail open. err=$_"
    Add-LogEntry -Status "FAIL_OPEN_PARSE_ERROR" -ToolInput $ToolInput
    exit 0
}

$toolName = $inputJson.tool_name
$filePath = $inputJson.file_path

# === fail open guard 2: 必須 field 不在 ===
if (-not $toolName -or -not $filePath) {
    Write-Warning "PRETOOLUSE_HOOK: required fields missing, fail open."
    Add-LogEntry -Status "FAIL_OPEN_MISSING_FIELD" -ToolName $toolName -FilePath $filePath
    exit 0
}

# === Self-modification block(.claude/ 配下保護)===
$selfPaths = @(
    'wt_common[/\\]\.claude[/\\]settings\.json$',
    'wt_common[/\\]\.claude[/\\]hooks[/\\].*\.ps1$',
    'wt_common[/\\]\.claude[/\\]settings\.local\.json$'
)
foreach ($pattern in $selfPaths) {
    if ($filePath -match $pattern) {
        Write-Error "BLOCKED: self-modification of .claude/ configuration is forbidden (Y4-B v4 self-protection). path=$filePath"
        Add-LogEntry -Status "BLOCKED_SELF_MODIFICATION" -ToolName $toolName -FilePath $filePath
        exit 1
    }
}

# === DO-*.md パターン検出(F1: 複合 prefix 対応 regex)===
$doTicketRegex = '^DO-[A-Z]+(?:-[A-Z]+)*-\d+.*\.md$'
$fileName = Split-Path $filePath -Leaf
if ($fileName -notmatch $doTicketRegex) {
    # DO-*.md でない = 対象外、許可
    exit 0
}

# === Write tool による DO-*.md 新規作成 = 全件 block ===
if ($toolName -eq 'Write') {
    Write-Error "BLOCKED: DO-*.md creation by Write tool is forbidden in factory repo (EVT-120). Use sync-tickets via 司令官 α. path=$filePath"
    Add-LogEntry -Status "BLOCKED_WRITE_DO_TICKET" -ToolName $toolName -FilePath $filePath
    exit 1
}

# === Edit / MultiEdit による DO-*.md 編集 ===
if ($toolName -in @('Edit', 'MultiEdit')) {
    # path 検証: wt_common/tickets/ 配下のみ許可
    if ($filePath -notmatch 'wt_common[/\\]tickets[/\\]DO-') {
        Write-Error "BLOCKED: DO-*.md edit outside wt_common/tickets/ is forbidden. SSOT = 司令官 sync-tickets 配信先のみ。path=$filePath"
        Add-LogEntry -Status "BLOCKED_EDIT_OUTSIDE_TICKETS" -ToolName $toolName -FilePath $filePath
        exit 1
    }

    # 既存ファイル確認(fail open guard 含む)
    try {
        if (-not (Test-Path $filePath)) {
            Write-Error "BLOCKED: target DO-*.md does not exist. Edit tool must target existing files only. path=$filePath"
            Add-LogEntry -Status "BLOCKED_EDIT_NONEXISTENT" -ToolName $toolName -FilePath $filePath
            exit 1
        }
    } catch {
        Write-Warning "PRETOOLUSE_HOOK: Test-Path failed, fail open."
        Add-LogEntry -Status "FAIL_OPEN_TESTPATH_ERROR" -ToolName $toolName -FilePath $filePath
        exit 0
    }

    Add-LogEntry -Status "ALLOW_EDIT_EXISTING_TICKET" -ToolName $toolName -FilePath $filePath
    exit 0
}

# その他の matcher = 通常通過
exit 0


# === log 関数(script-local path、F3 反映)===
function Add-LogEntry {
    param($Status, $ToolName, $FilePath, $ToolInput)
    try {
        $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
        $logPath = Join-Path $scriptDir "..\..\logs\pretooluse_hook.log"
        $logDir = Split-Path $logPath -Parent
        if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
        $entry = @{
            timestamp = (Get-Date -Format 'o')
            status = $Status
            tool_name = $ToolName
            file_path = $FilePath
        } | ConvertTo-Json -Compress
        Add-Content -Path $logPath -Value $entry -Encoding UTF8 -ErrorAction SilentlyContinue
    } catch {
        # log error 自体は fail open(hook の主機能に影響させない)
    }
}
```

### 4-A. regex match 検証表(F1 反映)

| pattern | match 例 | non-match 例 |
|---|---|---|
| `^DO-[A-Z]+(?:-[A-Z]+)*-\d+.*\.md$` | ✅ `DO-CP-999_test.md` / ✅ `DO-GHA-COST-001.md` / ✅ `DO-GHA-COST-001_test.md` / ✅ `DO-COMMANDER-049_test.md` / ✅ `DO-FACTORY-233_test.md` / ✅ `DO-COMMON-W2-008.md` | ❌ `design_note.md` / ❌ `auth.ts` / ❌ `README.md` |

## 5. DoD(必須最低 7 項目、F2 反映、ヤス採否準拠)

### 5-A. deny テスト(3 件、複合 prefix 必須)

- [ ] simple prefix deny: `Write` to `DO-CP-999_test.md` → exit 1 + log BLOCKED_WRITE_DO_TICKET
- [ ] multi-segment prefix deny: `Write` to `DO-GHA-COST-001_test.md` → exit 1 + log BLOCKED_WRITE_DO_TICKET
- [ ] multi-segment prefix deny 別系統: `Write` to `DO-COMMANDER-049_test.md` → exit 1 + log BLOCKED_WRITE_DO_TICKET

### 5-B. pass-through テスト(2 件)

- [ ] non-ticket markdown pass-through: `Write` to `design_note.md` → exit 0 (DO-*.md パターン非該当)
- [ ] non-markdown impl pass-through: `Write` to `auth.ts` → exit 0

### 5-C. fail open テスト(2 件)

- [ ] empty stdin fail-open: 空入力 → exit 0 + log FAIL_OPEN_PARSE_ERROR
- [ ] malformed JSON fail-open: 壊れた JSON → exit 0 + log FAIL_OPEN_PARSE_ERROR

### 5-D. self-modification block テスト(必須、Y4-B v3 反映)

- [ ] settings.json self-modification block: `Write` to `.claude/settings.json` → exit 1 + log BLOCKED_SELF_MODIFICATION
- [ ] hook script self-modification block: `Edit` to `.claude/hooks/pretooluse_ticket_block.ps1` → exit 1 + log BLOCKED_SELF_MODIFICATION

### 5-E. log rotation policy 明記(F2 反映)

- [ ] log_rotation_policy: **manual review(初版)、auto-rotate は将来拡張** = frontmatter + 本文両方で明示済

### 5-F. 実 runtime evidence(F4 反映)

- [ ] log excerpt showing PreToolUse hook invoked on deny test(`logs/pretooluse_hook.log` 抜粋)
- [ ] command exit code observed: block (=1) for deny test
- [ ] command exit code observed: allow (=0) for pass-through test
- [ ] diff showing existing `settings.json` keys preserved(自己改ざんなし)

= **計 13 項目**(7 件以上必須、ヤス採否準拠 + Codex 採点 +5 点改善対象)

## 6. Settings.json マージ案(diff 形式)

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "deny": [ /* 既存維持(.env / secrets / production / force push / rm -rf 等) */ ],
    "allow": [ /* 既存維持(npm / npx / cd / grep / cat / mkdir / cp / git push origin feat 等) */ ]
  },
+ "hooks": {
+   "PreToolUse": [
+     {
+       "matcher": "Write|Edit|MultiEdit|NotebookEdit",
+       "hooks": [
+         {
+           "type": "command",
+           "command": "if exist \"%PROGRAMFILES%\\PowerShell\\7\\pwsh.exe\" (pwsh.exe -NoProfile -ExecutionPolicy Bypass -File C:\\RX_Dev\\ProjectRX_HQ\\wt_common\\.claude\\hooks\\pretooluse_ticket_block.ps1) else (powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\\RX_Dev\\ProjectRX_HQ\\wt_common\\.claude\\hooks\\pretooluse_ticket_block.ps1)"
+         }
+       ]
+     }
+   ]
+ }
}
```

## 7. Block / Allow 例(18 項目、表形式)

| 操作 | path | 判定 | 根拠 |
|---|---|---|---|
| `Write` | `wt_common/tickets/DO-CP-999_test.md`(新規)| 🔴 block | Write 全件 |
| `Write` | `wt_common/tickets/DO-GHA-COST-001_test.md`(新規、F1 検証)| 🔴 block | 複合 prefix 検出 |
| `Write` | `wt_common/tickets/DO-COMMANDER-049_test.md`(新規)| 🔴 block | 複合 prefix 検出 |
| `Write` | `wt_common/tickets/DO-FACTORY-300.md`(新規)| 🔴 block | Write 全件 |
| `Write` | `wt_common/factory/state/tickets/DO-XXX-NNN.md`(自前 path)| 🔴 block | path 外 + Write 二重違反 |
| `Edit` | `wt_common/factory/state/tickets/DO-XXX-NNN.md`(path 外既存)| 🔴 block | SSOT 配信先以外 |
| `Edit` | `wt_common/tickets/DO-FACTORY-999.md`(不在)| 🔴 block | Edit 偽装 Write |
| `Write` | `.claude/settings.json` | 🔴 block | self-mod block |
| `Edit` | `.claude/settings.json` | 🔴 block | 同上 |
| `Write` | `.claude/hooks/pretooluse_ticket_block.ps1` | 🔴 block | 同上 |
| `Edit` | `.claude/hooks/*.ps1` | 🔴 block | 同上 |
| `Write` | `.claude/settings.local.json` | 🔴 block | 同上 |
| `Edit` / `MultiEdit` | `wt_common/tickets/DO-FACTORY-225.md`(配信済、存在)| 🟢 allow | 既存 SSOT 配信先内容更新 |
| `Write` | `wt_common/functions/src/auth.ts` | 🟢 allow | 実装コード、DO-*.md 非該当 |
| `Write` | `wt_common/dashboard/src/components/StatusPill.tsx` | 🟢 allow | 実装コード |
| `Write` | `wt_common/internal/circular/circular_*.md` | 🟢 allow | L1 回覧板、DO-*.md 非該当 |
| `Edit` | `wt_common/AGENTS.md`(軸 E 規律改訂)| 🟢 allow | DO-*.md 非該当 |
| `Bash` | `pwsh sync-tickets.ps1 ...` / `git mv tickets/*` | 🟢 hook 範囲外 | spawn 経由、Claude Code Write 非経由 |
| (異常時 fail open)| 任意 | 🟢 allow + log | 業務継続性 |

## 8. Rollback 手順(緊急時、Y4-B v3 継承)

| ステップ | 内容 | 緊急度 |
|---|---|---|
| 0 | log 確認(`logs/pretooluse_hook.log`)= 異常パターン特定 | low |
| 1 | hook 誤動作で全 Write/Edit block → `Bash` 経由 settings.json hooks entry 削除(hook 範囲外、緊急回避経路)| 🔴 emergency |
| 2 | `git revert` で settings.json 復元 | high |
| 3 | hook ファイル修正 = `Bash` 経由 spawn pwsh で書き換え(self-modification block 範囲外経路)| high |
| 4 | rollback 後の規律維持 = 軸 A(CLAUDE.md §5)+ 軸 E(AGENTS.md §3)| medium |
| 5 | rollback 起因事象を EVT 候補正式記録 | medium |

## 9. Non-applicable Agents 補完経路

| agent | hook 適用 | 補完経路 |
|---|---|---|
| **Codex(GPT-5.5)** | ❌ 不適用(Claude Code hooks 仕様非対応)| **AGENTS.md §3 規律(E 軸、ヤス Y4-E 採択済)+ 次段階候補保持**(DO-G-013 拡張 / C 軸 CI/PR gate、違反継続/再発時にヤス採否経路)|
| Cursor | ❌ 不適用(別 IDE)| 該当 hook 別途検討(Phase B 中盤以降)|
| CI/CD | 該当 hook 別 | DO-G-013 既存(role_boundary_check)+ 将来 do-id-existence-check.yml |

## 10. 改訂履歴

- v4.0(2026-05-08 朝、Day 136 朝):ヤス採否(DO-FACTORY-233 REVISE 支持 + 必須修正 4 件 + 鋳型 v1 採用候補 + Codex 補完次段階保持)反映完遂。v3 仕様(self-modification block + fail open + log + pwsh fallback)維持 + F1 複合 prefix regex + F2 DoD 13 項目 + F3 cwd 解消(`$scriptDir`)+ F4 Hook Contract セクション + frontmatter `hook_contract` 統合。Hook Ticket Template v1 適用 = Codex 採点 95+ 点経路。

---

*監督官 A Y4-B PreToolUse hook 詳細設計 v4(staging、commit 配置のみ、ヤス採否対象、Hook Ticket Template v1 適用)*
*「v3 + F1 複合 prefix regex + F2 DoD 13 項目 + F3 cwd 解消 + F4 Hook Contract = Codex 採点 95+ 点経路 + Strategy Lab F1-F4 全反映」*
