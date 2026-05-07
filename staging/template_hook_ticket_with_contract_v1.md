---
template_id: HOOK-TICKET-TEMPLATE-v1
title: Hook 系チケット鋳型(Hook Contract 必須化版)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
target_consumer: 司令官 α(`tickets_template/` 配下配置候補)
codex_score_baseline: 78/100(DO-FACTORY-233 採点)
codex_score_target: 90+/100(本鋳型適用後)
strategy_lab_review_reflected:
  - F1: 複合 prefix regex 対応
  - F2: DoD テスト 8 項目以上
  - F3: cwd 依存解消
  - F4: Hook Contract セクション鋳型化
related_evt: EVT-20260507-120
related_orders: [127, 128, 129, 130, 131, 132, 133, 134, 135, 136]
yasu_decision_pending: true
---

# Hook 系チケット鋳型 v1(Hook Contract 必須化、Codex 採点 90+ 点経路)

## 鋳型適用範囲

| 系列 | 適用 |
|---|---|
| DO-FACTORY 系列(hook 系)| 必須 |
| DO-COMMANDER 系列(hook / script 系) | 必須 |
| DO-CP 系列(test infra hook 含む)| 該当時必須 |
| DO-G 系列(governance hook / CI 系) | 必須 |

## 鋳型 frontmatter(必須項目、コピー & 改変)

```yaml
---
# === Standard Frontmatter(既存テンプレ継承) ===
ticket_id: DO-{PREFIX}-{NNN}
title: <短文タイトル>
phase: <phase 名(例:governance_repair / F2_quality_extension / hook_implementation)>
priority: 🔴 P0 | 🟡 P1 | 🟢 P2
period: YYYY-MM-DD〜YYYY-MM-DD
implementation_mode: PLAN_REQUIRED | QUICK_IMPLEMENT | PLAN_RECOMMENDED
related_evt: <EVT-XXX、該当時>
related_orders: [order_numbers]
yasu_approval: YYYY-MM-DD | pending
ticket_type: hook_implementation

# === Hook Contract(必須、Codex 採点 +12 点改善対象、F4 反映) ===
hook_contract:
  target_runtime: <Claude Code (PreToolUse/PostToolUse/SessionStart/Stop) | Cursor | Codex | CI/CD (GitHub Actions) | etc.>
  config_path: <絶対パス、例: ProjectRX_HQ/wt_common/.claude/settings.json>
  hook_key: <例: hooks.PreToolUse[].matcher>
  matcher_pattern: <例: "Write|Edit|MultiEdit|NotebookEdit">
  hook_script_path: <絶対パス推奨、例: C:\RX_Dev\ProjectRX_HQ\wt_common\.claude\hooks\pretooluse_xxx.ps1>
  hook_script_alternative: <script-local path 採用時、例: $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path>
  input_schema_source: <Claude Code 仕様 URL or observed sample(F3 反映)>
  block_exit_code: 1
  allow_exit_code: 0
  fail_open_policy:  # 異常時は業務継続(exit 0)、Y4-B v3 反映
    - input_parse_error: exit 0 + log FAIL_OPEN_PARSE_ERROR
    - missing_required_field: exit 0 + log FAIL_OPEN_MISSING_FIELD
    - test_path_error: exit 0 + log FAIL_OPEN_TESTPATH_ERROR
    - hook_script_internal_error: exit 0 + log FAIL_OPEN_INTERNAL_ERROR
  fail_close_paths:  # 意図的 block(exit 1)
    - deny_pattern_matched: exit 1 + log BLOCKED_<reason>
  cwd_assumption: <irrelevant (script-local paths used) | specific cwd required(F3 反映、明示必須)>
  self_modification_block:  # Y4-B v3 反映、自己改ざん回避
    - <protected_path_1, e.g., .claude/settings.json>
    - <protected_path_2, e.g., .claude/hooks/*.ps1>
    - <protected_path_3, e.g., .claude/settings.local.json>
  log_path: <絶対パス推奨 or $scriptDir 起点 relative、例: $scriptDir/../../logs/hook_xxx.log>
  log_format: JSON Lines | text | etc.
  log_rotation_policy: <auto-rotate(threshold MB)| manual-review | N/A(F2 反映)>
  rollback_path: <例: Bash spawn 経由 settings.json hooks entry 削除(self-modification block 範囲外経路)>
  non_applicable_agents:  # F4 反映
    - <例: Codex (GPT-5.5) — covered by AGENTS.md §3 (E-axis)>
  pwsh_fallback: <yes(具体的 fallback コマンド)| no>
  evidence_required:  # F4 反映、実 runtime 動作証跡
    - <例: log excerpt showing PreToolUse hook invoked on deny test>
    - <例: command exit code observed as block>
    - <例: pass-through test confirming normal writes still work>
    - <例: diff showing existing settings keys preserved>
---
```

## 鋳型本文 必須セクション

```markdown
# {Title}

## 1. Goal(目的、Codex 採点 18 → 20 点経路)

<1-2 段落で目的を明示。EVT 関連性 + 上位課題への接続。>

## 2. Scope / Out of Scope(Codex 採点 17 → 20 点経路)

### 2-A. In Scope

- <箇条書き、本チケットで実施する範囲>

### 2-B. Out of Scope

- <箇条書き、明示的に範囲外とする項目>
- DP-001 制約該当時:`C-2 着手 / Dashboard 機能追加 / 実 API 接続 / Write 操作 / デプロイ` 等を out_of_scope に明記
- AGENTS.md §3 適用該当時:`Codex 経路への適用` を明示

## 3. Hook Contract Section(必須、frontmatter と同期、Codex 採点 14 → 20 点経路、F4 反映)

frontmatter `hook_contract` と同一内容を散文化:

- target_runtime: <runtime>
- config_path(絶対パス): <path>
- hook_key: <key>
- matcher_pattern: <pattern>
- hook_script_path(絶対パス推奨): <path>
- input_schema_source: <仕様 URL or sample>
- block_exit_code / allow_exit_code: <values>
- fail_open_policy(列挙): <conditions>
- fail_close_paths(列挙): <conditions>
- cwd_assumption(明示必須): <statement>
- self_modification_block(対象 path 列挙): <paths>
- log_path / log_format / log_rotation_policy: <values>
- rollback_path: <procedure>
- non_applicable_agents: <agents + 補完経路>
- pwsh_fallback: <yes/no + command>
- evidence_required(実 runtime 動作証跡): <items>

## 4. Detection Logic(疑似コード or 完成版、F1 反映)

### 4-A. 推奨 regex(複合 prefix 対応)

```text
^DO-[A-Z]+(?:-[A-Z]+)*-\d+.*\.md$
```

| pattern | match 例 | non-match 例 |
|---|---|---|
| 推奨 regex | `DO-CP-999_test.md`、`DO-GHA-COST-001.md`、`DO-COMMANDER-049_test.md`、`DO-FACTORY-233_test.md`、`DO-COMMON-W2-008.md` | `design_note.md`、`auth.ts`、`README.md` |

### 4-B. fail open guard(必須、Y4-B v3 反映)

```powershell
# 入力 parse error / 必須 field 不在 / Test-Path error → exit 0(allow)+ log
try {
    $inputJson = $ToolInput | ConvertFrom-Json -ErrorAction Stop
} catch {
    Write-Warning "HOOK: input parse failed, fail open. err=$_"
    Add-LogEntry -Status "FAIL_OPEN_PARSE_ERROR"
    exit 0
}
```

### 4-C. self-modification block(必須、Y4-B v3 反映)

```powershell
# .claude/ 配下保護(自己改ざん回避)
$selfPaths = @(
    'wt_common[/\\]\.claude[/\\]settings\.json$',
    'wt_common[/\\]\.claude[/\\]hooks[/\\].*\.ps1$',
    'wt_common[/\\]\.claude[/\\]settings\.local\.json$'
)
foreach ($pattern in $selfPaths) {
    if ($filePath -match $pattern) {
        Write-Error "BLOCKED: self-modification of .claude/ configuration is forbidden"
        exit 1
    }
}
```

### 4-D. log 装置(必須)

```powershell
function Add-LogEntry {
    param($Status, $ToolName, $FilePath)
    try {
        $logPath = Join-Path $PSScriptRoot "..\..\logs\hook_xxx.log"
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
        # log error 自体は fail open
    }
}
```

## 5. DoD(必須最低 8 項目、Codex 採点 13 → 20 点経路、F2 反映)

### 5-A. deny テスト(最低 3 件、複合 prefix 含む)

- [ ] simple prefix deny: `DO-CP-999_test.md`(Write 試行 → block + exit 1 + log)
- [ ] multi-segment prefix deny: `DO-GHA-COST-001_test.md`(Write 試行 → block + exit 1 + log)
- [ ] multi-segment prefix deny 別系統: `DO-COMMANDER-049_test.md`(Write 試行 → block + exit 1 + log)

### 5-B. pass-through テスト(最低 2 件)

- [ ] non-ticket markdown pass-through: `design_note.md`(Write 試行 → allow + exit 0)
- [ ] non-markdown implementation file pass-through: `auth.ts`(Write 試行 → allow + exit 0)

### 5-C. fail open テスト(最低 2 件、Y4-B v3 反映)

- [ ] empty stdin fail-open: 空入力 → exit 0 + log FAIL_OPEN_PARSE_ERROR
- [ ] malformed JSON fail-open: 壊れた JSON → exit 0 + log FAIL_OPEN_PARSE_ERROR

### 5-D. self-modification block テスト(該当時、Y4-B v3 反映)

- [ ] settings.json self-modification block: `Write` to `.claude/settings.json` → exit 1 + log BLOCKED_SELF_MODIFICATION
- [ ] hook script self-modification block: `Edit` to `.claude/hooks/pretooluse_xxx.ps1` → exit 1 + log BLOCKED_SELF_MODIFICATION

### 5-E. log rotation policy 明記(必須)

- [ ] log_rotation_policy 明示(例:auto / manual review / N/A、F2 反映)

### 5-F. evidence 取得(必須、F4 反映)

- [ ] 実 runtime 起動 evidence(log excerpt showing hook invoked on deny test)
- [ ] command exit code observed(block = 1、allow = 0)
- [ ] pass-through test 確認(normal writes still work)
- [ ] diff showing existing settings keys preserved(自己改ざんなし)

## 6. Settings.json マージ案(diff 形式、必須)

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "deny": [ /* 既存維持 */ ],
    "allow": [ /* 既存維持 */ ]
  },
+ "hooks": {
+   "PreToolUse": [
+     {
+       "matcher": "<matcher_pattern>",
+       "hooks": [
+         {
+           "type": "command",
+           "command": "<pwsh.exe + powershell.exe フォールバック分岐コマンド>"
+         }
+       ]
+     }
+   ]
+ }
}
```

## 7. Block / Allow 例(最低 10 項目、表形式、Codex 採点 16 → 20 点経路)

| 操作 | path | 判定 | 根拠 |
|---|---|---|---|
| `Write` | `wt_common/tickets/DO-XXX-NNN.md`(新規)| 🔴 block | 自前採番禁止 |
| `Write` | `wt_common/factory/state/tickets/DO-XXX-NNN.md`(自前 path)| 🔴 block | path 外 + Write 二重違反 |
| `Edit` | `wt_common/factory/state/tickets/DO-XXX-NNN.md`(path 外既存)| 🔴 block | SSOT 配信先以外 |
| `Edit` | `wt_common/tickets/DO-XXX-NNN.md`(不在)| 🔴 block | Edit 偽装 Write 防護 |
| `Write` | `.claude/settings.json` | 🔴 block | 自己改ざん回避 |
| `Edit` | `.claude/hooks/*.ps1` | 🔴 block | 同上 |
| `Edit` / `MultiEdit` | `wt_common/tickets/DO-XXX-NNN.md`(配信済、存在)| 🟢 allow | 既存 SSOT 配信先内容更新 |
| `Write` | `wt_common/functions/src/*.ts` | 🟢 allow | 実装コード、DO-*.md パターン非該当 |
| `Bash` | `pwsh sync-tickets.ps1 ...` | 🟢 hook 範囲外 | spawn pwsh、Claude Code Write tool 非経由 |
| `Bash` | `git mv tickets/DO-*.md tickets_completed/` | 🟢 hook 範囲外 | 完了処理、spawn 経由 |
| (異常時 fail open)| 任意 | 🟢 allow + log | 業務継続性 |

## 8. Rollback 手順(緊急時、ステップ順、Y4-B v3 反映)

| ステップ | 内容 | 緊急度 |
|---|---|---|
| 0 | log 確認(`logs/hook_xxx.log`)= 異常パターン特定 | low |
| 1 | hook が誤動作で block している場合 → `Bash` 経由 settings.json hooks entry 削除(hook 範囲外、緊急回避経路)| 🔴 emergency |
| 2 | settings.json hooks entry 削除を `git revert` で実施 | high |
| 3 | hook ファイルの修正 = `Bash` 経由 spawn pwsh で書き換え(self-modification block 範囲外経路)| high |
| 4 | rollback 後の規律維持 = 文書規律(CLAUDE.md / AGENTS.md)で暫定運用 | medium |
| 5 | rollback 起因事象を EVT 候補正式記録 | medium |

## 9. Non-applicable Agents 補完経路(必須、F4 反映)

| agent | hook 適用 | 補完経路 |
|---|---|---|
| Codex(GPT-5.5)| ❌ 不適用(Claude Code hooks 仕様非対応)| AGENTS.md §3 規律(E 軸、ヤス Y4-E 採択済)+ 将来 CI/PR gate(C 軸候補) |
| <他 agent> | <yes/no> | <補完経路明示> |

## 10. 改訂履歴

- v1.0(YYYY-MM-DD):初版起案、本鋳型適用契機の EVT / orders / yasu_approval 履歴。
```

---

## 鋳型適用効果(Codex 採点改善経路)

| 観点 | 鋳型前(78 点) | 鋳型適用後(目標 90+ 点) | 改善要素 |
|---|---|---|---|
| 目的の明確さ | 18/20 | 20/20 | §1 Goal + Scope/Out of Scope 明示 |
| scope / out_of_scope | 17/20 | 20/20 | §2 セクション必須化 |
| 安全設計 | 16/20 | 19/20 | §3 Hook Contract + §4 self-modification block + fail open + log |
| 実装仕様 | 14/20 | 18/20 | §4-A 複合 prefix regex + §4-B fail open guard + §4-D log 装置 |
| 検証 DoD | 13/20 | 18/20 | §5 必須 8 項目 + evidence 取得 + log rotation policy |
| **合計** | **78/100** | **95/100** | **+17 点改善** |

---

## 鋳型 vs 既存 v0(司令官 α 起案 DO-FACTORY-233)主要差分

| 観点 | 既存 v0 | 鋳型 v1 |
|---|---|---|
| regex | `^DO-[A-Z]+-\d+.*\.md$`(simple prefix のみ)| **`^DO-[A-Z]+(?:-[A-Z]+)*-\d+.*\.md$`**(複合 prefix 対応、F1) |
| DoD テスト | 3 項目(狭い)| **必須 8 項目以上**(simple/multi-segment deny + pass-through + fail-open + self-modification + log rotation + evidence、F2) |
| cwd 依存 | 相対パス(壊れる可能性)| **絶対パス推奨 + script-local path 代替**(F3) |
| Hook Contract | 散文記述(再現性低)| **frontmatter + 本文両方で構造化**(F4) |
| self-modification block | なし | **.claude/ 配下保護必須**(Y4-B v3 反映) |
| fail open | 部分言及 | **4 種別エラー網羅**(parse / missing field / test-path / internal、Y4-B v3 反映) |
| log 装置 | なし | **JSON Lines 標準**(Y4-B v3 反映) |
| pwsh fallback | なし | **必須**(`pwsh.exe` 不在時 `powershell.exe` 経路、Y4-B v3 反映) |
| evidence | なし | **実 runtime 動作証跡 4 項目必須**(F4) |

---

## 鋳型配置経路(司令官 α 主管)

| 順 | 内容 | 主管 |
|---|---|---|
| 1 | 監督官 A 本鋳型 staging 起案(本ファイル)| 監督官 A 完遂 |
| 2 | ヤス採否取得 | ヤス |
| 3 | 監督官 A → 司令官 α 第 137 次発令で鋳型素材通達 | 監督官 A |
| 4 | 司令官 α DO-COMMANDER-053(新規)= `tickets_template/template_hook_ticket_with_contract.md` 配置(commander 主管)| 司令官 α |
| 5 | 司令官 α 既存 hook 系チケット鋳型改訂 = DO-FACTORY-233 修正版起案時に本鋳型適用 | 司令官 α |

---

*監督官 A Hook Ticket Template v1 鋳型素案(staging、commit 配置のみ、ヤス採否 + 司令官 α 配置経路)*
*「Codex 採点 78 → 95 点経路 + Strategy Lab F1-F4 全反映 + Y4-B v3 仕様統合 + DO-COMMANDER-053 配置候補」*
