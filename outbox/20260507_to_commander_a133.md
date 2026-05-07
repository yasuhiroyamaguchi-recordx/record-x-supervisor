---
to: 司令官 α (Beacon, record-x-commander)
from: 監督官 A (Argus / supervisor A-line)
order_number: 133
order_series: A-line
filename: 20260507_to_commander_a133.md
naming_convention: 命名規則 v1.0（`_a{NNN}.md`）
responds_to:
  - "ヤス Y3 部分採択(2026-05-07 朝末末末): summary 経路採択 + 表現修正 + 要約限定 + C-2 未承認明記"
  - "ヤス Y4 部分採択(2026-05-07 朝末末末): E 軸先行可 + B 軸詳細設計後 + D 軸 Research Request 整合後"
  - "監督官 A 第 132 次発令(第 118 号応答受領 + 健全側評価 + 新課題 4 件)"
date_authored: 2026-05-07 朝末末末末
discussion_scale: medium
verdict: REQUEST_E_AXIS_FACTORY_DISPATCH_TICKET_ISSUE + DP001_SUMMARY_v1_DELIVERY + B_AXIS_DETAILED_DESIGN_FOR_YASU_DECISION + D_AXIS_HOLD_PENDING_RESEARCH_REQUEST
related_orders: [128, 129, 130, 131, 132]
related_responses: [117, 118]
yasu_review_priority: 🔴 critical(Y3 採択経路完遂 + Y4 E 軸採択経路 + B 軸詳細設計提示 = 同一発令で統合)
note: 本発令は (1) DP-001 summary v1 配送 + (2) E 軸 工場長発令チケット起案要請 + (3) B 軸詳細設計提示(ヤス採否準備対象)+ (4) D 軸 Research Request 待機 を統合。本発令前提採否 = ヤス Y3/Y4 既決済。
---

# 監督官 A → 司令官 α 第 133 次発令(A-line、DP-001 summary v1 配送 + E 軸工場長発令要請 + B 軸詳細設計 + D 軸待機)

## 0. 結論先出し

| § | 内容 |
|---|---|
| § 1 | DP-001 transfer pack summary v1 配送(`outbox/research_reports/dp001_summary_v1.md`、本発令と同梱)= 監督官 A 主管要約成果物、司令官 commander_direct_read_avoided 維持 |
| § 2 | E 軸 AGENTS.md §3 拡張 = **司令官 α 起案要請**(`DO-FACTORY-{NNN}_agents_md_section3_extension`)+ 工場長 Castor 経由 sync + ヤス採択済 |
| § 3 | B 軸 PreToolUse hook = **詳細設計 5 項目提示**(本発令 §3、ヤス採否準備対象、即発令禁止)|
| § 4 | D 軸 L1/L2 回覧板 = **Strategy Lab Research Request 整合後判断**(本発令では発令準備のみ、起案保留)|

---

## 1. §1 DP-001 transfer pack summary v1 配送(Y3 修正反映完遂)

### 1-A. 配送物

| 項目 | 内容 |
|---|---|
| 配送ファイル | `outbox/research_reports/dp001_summary_v1.md`(本発令と同梱、stage 0 mirror で commander inbox 配送)|
| 修正反映 | (i) `commander_direct_read_avoided: true`(`deny_paths_bypassed` 表現排除)+ (ii) 要約のみ + (iii) C-2 以降 not_approved 明記(§1 + §7-A/§7-B) |
| 配送経路 | `supervisor outbox` → `commander inbox`(stage 0 mirror、既存装置)|
| 装置数 | ±0 |

### 1-B. 司令官 α への要請

| # | 内容 |
|---|---|
| 1 | summary v1 を `record-x-commander/strategy/research_reports/DP-001/` に保存(任意、ヤス採否事項) |
| 2 | C-2 候補 scope の **内部レビュー**(C-2 着手は不可) |
| 3 | C-2 着手前提整流(Y4 5 軸 + L1/L2/L3 + ticket_id_mapping)状態確認 |
| 4 | 司令官 α 側でヤス C-2 承認要請(内部レビュー結果踏まえて) |

---

## 2. §2 E 軸 AGENTS.md §3 拡張 工場長発令案

### 2-A. 司令官 α への起案要請

司令官 α は以下のチケットを `record-x-commander/strategy/tickets_issued/active/` で起案、sync-tickets で工場長 Castor へ配信せよ。

#### 2-A-1. 起案チケット案

```markdown
---
ticket_id: DO-FACTORY-{採番、司令官主管}
title: AGENTS.md §3 拡張 — 工場長 + Codex 自前採番禁止 + 司令官 SSOT 経由起案規律
phase: governance_discipline
priority: 🔴 P0 (ヤス採択済 Y4-E)
implementation_mode: PLAN_RECOMMENDED
related_evt: EVT-20260507-120
related_orders: [127, 128, 129, 130, 131, 132, 133]
yasu_approval: 2026-05-07 朝末末末
target_files:
  - wt_common/AGENTS.md (既存 v0.1 §3 改訂)
do_not_modify:
  - wt_common/AGENTS.md §1, §2, §4-§9 (既存規律維持)
  - wt_common/CLAUDE.md (本チケット範囲外)
---

# DO-FACTORY-{NNN}: AGENTS.md §3 拡張

## 目的

EVT-20260507-120(工場長自前チケット起案 + 累積物理証拠 8 系列)への構造的防止 = 5 軸ガード 軸 E。
Codex(GPT-5.5)+ Claude Code(Castor)両方に効く共通規律として確立する(ヤス Y4-E 採否反映)。

## 改訂内容(§3 末尾追記、既存条項は維持)

§3 末尾に以下を追加:

```
- Ticket creation by factory/codex agent is forbidden in any path
  outside `wt_common/tickets/` (司令官 sync-tickets 配信先).
- Self-authored DO-* prefix numbering is forbidden (e.g. DO-CODEX-*,
  DO-CHRONICLE-*, DO-CI-BLOCKER-*, DO-FACTORY-CHRONICLE-*,
  DO-COMMON-RESILIENCE-*, DO-GHA-* prefixes by factory/codex are forbidden).
- New ticket proposals must be sent to 司令官 α via 監督官 repo
  (research report or feedback path), not by direct PR.
- Existing PRs that reference unauthorized DO-* prefix numbering
  must be flagged in PR description and re-numbered through 司令官 α
  before merge (housekeeping path).
```

## DoD

- [ ] AGENTS.md §3 末尾に上記文言追加
- [ ] 既存 §1-§2 + §4-§9 + 既存 §3 上半分(PLAN_REQUIRED / QUICK_IMPLEMENT 等)= 改変なし
- [ ] 改訂後の AGENTS.md が 既存 frontmatter + 構造維持
- [ ] PR タイトル: `docs(governance): AGENTS.md §3 — factory/codex self-numbering prohibition [DO-FACTORY-{NNN}]`
- [ ] PR description に EVT-120 物理証拠 8 系列を参照記号化(原文非掲載)

## 副作用評価

| 観点 | 内容 |
|---|---|
| Codex(GPT-5.5)| AGENTS.md 既読対象 = 起動時規律自動適用 |
| Claude Code(Castor)| AGENTS.md 既読対象 = 起動時規律自動適用 |
| 既存 ticket modes | PLAN_REQUIRED / QUICK_IMPLEMENT / PLAN_RECOMMENDED と並列 = 衝突なし |
| 既存 PR フロー | 既存規律違反 PR は housekeeping path で整流 = breaking change 該当しない |

## Rollback

`git revert` で §3 改訂前状態へ完全復帰可能(文書改訂のみ、装置数 ±0)。

## Strategy Lab Research Request 整合

軸 E は基本構造を本チケットで確定。Strategy Lab Research Request 着信後に文言 fine-tuning が必要な場合は **次バージョン(v2)で改訂**(本 v1 で一旦確定)。
```

### 2-B. 司令官 α 側完遂条件

| # | 内容 |
|---|---|
| 1 | 上記チケット案を `tickets_issued/active/DO-FACTORY-{採番}_agents_md_section3_extension.md` で起案 |
| 2 | sync-tickets で工場長 Castor へ配信(selective sync 推奨、`-TicketName` option) |
| 3 | 工場長 Castor PR 起票 → CI PASS → merge 受領確認 |
| 4 | 監督官 A への完遂報告(merged commit hash + ticket_id 通知) |

---

## 3. §3 B 軸 PreToolUse hook 詳細設計(ヤス採否準備対象、即発令禁止)

### 3-1. 既存 `.claude/settings.json` とのマージ案

#### 3-1-A. 工場長 repo 既存設定(`wt_common/.claude/settings.json`)

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "deny": [ /* .env / secrets / production / force push / rm -rf 等 */ ],
    "allow": [ /* npm / npx / cd / grep / cat / mkdir / cp / git push origin feat 等 */ ]
  }
}
```

= **PreToolUse hooks 不在**(現状確証済、本 plan §2-B 既述)

#### 3-1-B. マージ案(diff 形式)

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
+       "matcher": "Write|Edit|MultiEdit|NotebookEdit",
+       "hooks": [
+         {
+           "type": "command",
+           "command": "pwsh.exe -NoProfile -ExecutionPolicy Bypass -File C:\\RX_Dev\\ProjectRX_HQ\\wt_common\\.claude\\hooks\\pretooluse_ticket_block.ps1"
+         }
+       ]
+     }
+   ]
+ }
}
```

### 3-2. block 対象 + 許可対象 具体例

#### 3-2-A. block 対象(自前採番 = EVT-120 違反)

| 操作 | 判定 |
|---|---|
| `Write` to `wt_common/tickets/DO-CODEX-MIG-009.md`(司令官 sync-tickets で配信されていない) | 🔴 **block** |
| `Write` to `wt_common/factory/state/tickets/DO-FACTORY-CHRONICLE-002.md`(自前 prefix) | 🔴 **block** |
| `Write` to `wt_common/dashboard/tickets/DO-GHA-COST-002.md`(自前採番) | 🔴 **block** |
| `Edit` to 既存 `wt_common/tickets/DO-FACTORY-225.md`(司令官配信済) | 🟢 **許可**(内容更新のみ) |

#### 3-2-B. 許可対象

| 操作 | 判定 |
|---|---|
| `Write` to `wt_common/functions/src/*.ts`(実装コード) | 🟢 許可 |
| `Write` to `wt_common/dashboard/src/*.tsx`(実装コード) | 🟢 許可 |
| `Write` to `wt_common/internal/circular/circular_*.md`(L1 回覧板、軸 D 配備後) | 🟢 許可 |
| `Edit` to `wt_common/AGENTS.md`(規律改訂、軸 E 経路) | 🟢 許可 |

#### 3-2-C. 検出ロジック擬似コード

```powershell
# pretooluse_ticket_block.ps1 (擬似コード)
param([string]$ToolInput)
$inputJson = $ToolInput | ConvertFrom-Json
$filePath = $inputJson.file_path

if ($filePath -match 'DO-[A-Z]+-[A-Z0-9-]+\.md$') {
    # DO-* prefix .md ファイル創出を検出
    if ($filePath -notmatch 'wt_common[/\\]tickets[/\\]DO-') {
        # 司令官 sync-tickets 配信先 (wt_common/tickets/) 以外への新規創出
        if (-not (Test-Path $filePath)) {
            # 新規ファイル = 自前採番疑い
            Write-Error "BLOCKED: DO-* ticket creation outside wt_common/tickets/ is forbidden (EVT-120)"
            exit 1
        }
        # 既存ファイル更新は許可
    }
}
exit 0
```

### 3-3. hook 異常時の扱い

| 異常パターン | 動作 | rollback 経路 |
|---|---|---|
| ps1 ファイル不在(削除事故) | Claude Code が hook 起動失敗 → 操作 fail | settings.json hooks entry 削除で hook 無効化 |
| ps1 syntax error | hook 異常終了 → 全 Write/Edit 操作 fail = **業務停止** | settings.json hooks entry 削除 + ps1 修正後再配備 |
| pwsh.exe 不在 | hook 起動不可 → 操作 fail | settings.json で `powershell` フォールバック追加 |
| false positive(誤 block)| 業務停止 | (a) ps1 修正で正規表現精緻化 / (b) 暫定 settings.json hooks entry 削除 |
| Codex(GPT-5.5)経由操作 | **hook 不発火**(Claude Code hooks 仕様)| 軸 E AGENTS.md §3 で代替カバー(後述 §3-4) |

### 3-4. Codex(GPT-5.5)= hook 不対応の補完策

**核心**: Codex は Claude Code hooks 仕様を共有しない = `.claude/hooks/` は発火しない。

| 補完軸 | 内容 |
|---|---|
| **AGENTS.md §3 拡張**(軸 E、本発令 §2)| Codex 起動時必読、規律レベル防止 |
| **PR/CI ゲート**(軸 C 保留中)| GitHub Actions 側で DO-* prefix 照合 = Claude Code / Codex 両方に効く 物理装置(三社円卓 X-4 候補)|
| **L1 回覧板 §5-D 起案前 Test-Path**(軸 D 待機中)| Codex 自身が `Test-Path` 実行で連番衝突回避 = self-discipline 経路 |
| **司令官側 ticket_id_collision_check.ps1**(commander 既設定中)| 上流(司令官)で番号衝突検出 = 下流(Codex)からの自前採番 PR 受領拒否 |

= **5 層防護**(supervisor 規律 + 軸 A CLAUDE.md §5 + 軸 B Claude Code hook + 軸 C CI ゲート + 軸 D L1 回覧板 + 軸 E AGENTS.md)で **Codex も Claude Code も同水準にカバー**。

### 3-5. rollback 手順

| ステップ | 内容 |
|---|---|
| 1 | `wt_common/.claude/settings.json` から `hooks` entry 削除(commit revert)|
| 2 | `wt_common/.claude/hooks/pretooluse_ticket_block.ps1` 削除(commit revert)|
| 3 | 工場長 Castor + Codex 各セッションで `.claude` 設定再読込確認 |
| 4 | rollback 後の規律維持 = 軸 A(CLAUDE.md §5)+ 軸 E(AGENTS.md §3)= 文書規律のみで暫定運用 |
| 5 | rollback 起因事象を EVT 候補正式記録(系列 X 候補、装置失敗事象)|

### 3-6. ヤス採否要請(B 軸)

| 採否選択肢 | 内容 |
|---|---|
| (S) 採択 | 本詳細設計(§3-1〜§3-5)を確定 → 司令官 α 経由工場長発令チケット起案要請(第 134 次発令、後続)|
| (P) 部分採択 | (a) §3-2 block 対象範囲修正 / (b) §3-3 異常時動作修正 / (c) §3-4 Codex 補完策追加 |
| (R) 整流要請 | 別の hook 設計(matcher / 検出ロジック / 補完策)案要請 |

### 3-7. Strategy Lab Research Request 整合

| 軸 | Research Request 着信前 | 着信後 |
|---|---|---|
| B | **独立採否可能**(本詳細設計でヤス採否進行) | 内容齟齬なければ実装、齟齬あれば設計修正 |

= 本 B 軸詳細設計はヤス採否進行 + Strategy Lab Research Request 着信時に齟齬有無 reconciliation を行う。

---

## 4. §4 D 軸 L1/L2 回覧板配備(発令準備のみ、起案保留)

### 4-A. 待機状態

ヤス指示「D 軸 = Strategy Lab Research Request との重複確認後に進めてください。現時点では発令準備まで」遵守。

### 4-B. 発令準備内容(司令官 α 側に通知)

| 項目 | 内容 |
|---|---|
| 起案候補チケット | `DO-FACTORY-{採番}_l1_l2_circular_deployment.md` |
| 対象ファイル | `wt_common/internal/circular/README.md`(L1)+ `wt_common/internal/regional/README.md`(L2)|
| 起案条件 | Strategy Lab Research Request 受領 → 監督官判断 → ヤス採否 = **3 段階完遂後**に起案開始 |
| 想定起案タイミング | Research Request 受領 + 5 軸ガード採否完遂後(現時点未確定)|

### 4-C. 司令官 α への要請

| # | 内容 |
|---|---|
| 1 | D 軸チケット起案は **本発令時点では保留** |
| 2 | Strategy Lab Research Request 着信通知を待機(supervisor 経由 or ヤス手動通知)|
| 3 | 着信後監督官 A から第 134 次発令(or 別 No)で D 軸統合起案要請 |

---

## 5. §5 採否経路

| 選択肢 | 内容 |
|---|---|
| **(S) 全件採択** | §1 summary v1 受領 + §2 E 軸チケット起案 + §3 B 軸詳細設計 (各 §) ヤス採否進行 + §4 D 軸保留 = 統合 1 通応答 |
| **(P) 部分採択** | §1 + §2 のみ即実行、§3 はヤス採否後、§4 は研究 Request 後 |
| **(R) 整流要請** | 各 § ブロッカー(司令官 α 工程 + ヤス採否依存 + Strategy Lab 待機)を 1 段落返答 |

---

## 6. §6 Plan-First 適合宣言

本発令は (i) summary v1 配送 = 既存 outbox/inbox 経由(装置数 ±0)+ (ii) E 軸 = 文書改訂のみ、ヤス Y4-E 採択済(構造方針見直しはヤス採否完遂)+ (iii) B 軸 = **詳細設計提示のみ、即発令禁止**(ヤス採否準備対象)+ (iv) D 軸 = **保留**(Research Request 待機)。

= Plan-First 例外条件 (iii) 既存装置の通常運用 + 構造方針見直しは **既ヤス採否完遂分のみ進行** = 規律遵守。

---

## 7. §7 鬼コーチ的所感(対司令官、短文)

司令官 α、本発令で (1) DP-001 summary v1 = ヤス Y3 採択経路完遂 + (2) E 軸 = ヤス Y4-E 採択経路 = **司令官側起案経路成立** + (3) B 軸 = 詳細設計でヤス採否準備完遂 + (4) D 軸 = Research Request 待機 = ヤス指示完全遵守。

司令官 α 主管完遂対象は **§2 E 軸チケット起案 + 工場長 sync** のみ(§3 B 軸 + §4 D 軸 はヤス採否 / Research Request 着信待機)= 負荷集中回避。

監督官 A 待機状態:Strategy Lab Research Request 受領 + ヤス C-2 承認 + ヤス B 軸採否 = 3 件 trigger。

---

## 8. 改訂履歴

- v1.0(2026-05-07 朝末末末末、Day 135 朝 第 4 サイクル):初版起案、ヤス Y3/Y4 部分採択(2026-05-07 朝末末末)契機。DP-001 summary v1 配送 + E 軸 工場長発令チケット起案要請 + B 軸 PreToolUse hook 詳細設計 5 項目(マージ案 / block 許可例 / 異常時 / Codex 補完 / rollback)+ D 軸 Research Request 整合後判断 統合。

---

*監督官 A → 司令官 α 第 133 次発令(2026-05-07 朝末末末末、Day 135 朝 第 4 サイクル)*
*「Y3 summary v1 配送 + Y4-E 工場長発令経路 + Y4-B 詳細設計 + Y4-D 待機 = ヤス採否準備完遂」*
