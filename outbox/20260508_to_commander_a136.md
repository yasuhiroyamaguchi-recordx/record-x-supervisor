---
to: 司令官 α (Beacon, record-x-commander)
from: 監督官 A (Argus / supervisor A-line)
order_number: 136
order_series: A-line
filename: 20260508_to_commander_a136.md
naming_convention: 命名規則 v1.0（`_a{NNN}.md`）
note_on_numbering: 第 137 次(鋳型素材通達)が起案順では先行、本第 136 次(DO-FACTORY-233 REVISE 通知)は ヤス採否反映で発番遡及。発令番号 SSOT。
responds_to:
  - "ヤス採否(2026-05-08 朝): DO-FACTORY-233 REVISE 判定支持 + 必須修正 4 件差戻し + 鋳型化方向性採用候補 + Codex 補完次段階保持 + Y4-B v4 staging 整合後再採否 + 工場長実装投入禁止"
  - "Strategy Lab Research Report DO-FACTORY-233_ticket_review_report.md(F1-F4 指摘)"
  - "Codex 採点(DO-FACTORY-233 = 78/100、4 減点理由)"
date_authored: 2026-05-08 朝
discussion_scale: medium
verdict: REVISE_DO_FACTORY_233 + REQUIRE_4_FIXES + FACTORY_DEPLOY_HOLD_UNTIL_YASU_REAPPROVAL
related_orders: [127, 128, 129, 130, 131, 132, 133, 134, 135, 137(鋳型素材通達、起案順先行)]
related_responses: [117, 118]
related_evts: ["EVT-20260507-120(5 軸ガード)"]
yasu_review_priority: 🔴 critical(司令官 α DO-FACTORY-233 差戻し本体 + 工場長実装投入禁止 + Y4-B v4 staging 整合経路)
note: 本発令は (1) DO-FACTORY-233 REVISE 通知本体 + (2) 必須修正 4 件 + (3) 工場長 hook 実装投入禁止(ヤス再採否前) + (4) Y4-B v4 staging 整合経路 を統合。第 137 次(鋳型素材通達)+ 本発令の二段階構造で対応完遂。
---

# 監督官 A → 司令官 α 第 136 次発令(A-line、DO-FACTORY-233 REVISE 通知 + 必須修正 4 件 + 工場長実装投入禁止)

## 0. 結論先出し

| § | 内容 |
|---|---|
| § 判定 | DO-FACTORY-233 = **REVISE**(ヤス採否支持) |
| § 必須修正 | 4 件(F1 複合 prefix regex + F2 DoD 7 件以上 + F3 cwd 依存解消 + F4 Hook Contract セクション追加) |
| § 工場長投入 | 🔴 **禁止**(ヤス再採否完遂前)|
| § 整合経路 | Y4-B v4 staging(監督官 A 主管、本サイクル併行起案)+ DO-FACTORY-233 修正版 staging(司令官 α 主管)= **両方 staging 完遂後にヤス再採否**経路 |
| § 鋳型関連 | 第 137 次(本発令前起案)で Hook Ticket Template v1 鋳型素材通達 + DO-COMMANDER-053 鋳型配置要請(WAVE H 拡張 5 件目)|

---

## 1. §1 DO-FACTORY-233 REVISE 判定理由

### 1-A. Strategy Lab F1-F4 全件妥当(`09_research_reports/to_supervisor/DO-FACTORY-233_ticket_review_report.md`)

| 指摘 | severity | 内容 |
|---|---|---|
| F1 | high | 現 regex `^DO-[A-Z]+-\d+.*\.md$` が複合 prefix(`DO-GHA-COST-001` 等)を拾えない = EVT-120 coverage 不足 |
| F2 | medium | DoD テスト 3 項目のみ = 不十分(simple/multi-segment deny + pass-through + fail-open + log rotation 必要)|
| F3 | medium | hook command path = 起動 cwd 依存(相対パス)= `wt_common/wt_common/...` 解決誤り発生リスク |
| F4 | medium | Hook Contract セクション不在 = 再現性低、今後の hook 系チケット鋳型化対象 |

### 1-B. Codex 採点 78/100(目的 18 / scope 17 / 安全 16 / 実装 14 / DoD 13)

= **実装着手前に修正必須**。Codex 採点改善目標 = **90+ 点**(本鋳型適用後 95 点経路、第 137 次発令 §1-D)

### 1-C. 監督官 A 自主開示

監督官 A 自身の Y4-B v3 staging も F1 同型欠陥(regex `DO-[A-Z]+-[A-Z0-9-]+\.md$` も `_test` underscore 不在で false negative)= **監督官 A 側も v4 修正対象**(本サイクル併行)

---

## 2. §2 必須修正 4 件(司令官 α 主管、DO-FACTORY-233 修正版 staging 起案)

### 2-A. F1 — 複合 prefix 対応 regex(critical)

```
変更前: ^DO-[A-Z]+-\d+.*\.md$
変更後: ^DO-[A-Z]+(?:-[A-Z]+)*-\d+.*\.md$
```

### 2-B. F2 — DoD テスト 7 件以上(必須、ヤス採否準拠)

| # | テスト |
|---|---|
| 1 | simple prefix deny: `DO-CP-999_test.md` |
| 2 | multi-segment prefix deny: `DO-GHA-COST-001_test.md` |
| 3 | multi-segment prefix deny 別系統: `DO-COMMANDER-049_test.md` |
| 4 | non-ticket markdown pass-through: `design_note.md` |
| 5 | non-markdown impl pass-through: `auth.ts` |
| 6 | empty stdin fail-open(exit 0 + log)|
| 7 | malformed JSON fail-open(exit 0 + log)|
| 任意 | log rotation policy 明記(自動/手動/N/A)|

### 2-C. F3 — cwd 依存解消(必須)

| 観点 | 修正方針 |
|---|---|
| settings.json hook command | **絶対パス採用**(`C:\RX_Dev\ProjectRX_HQ\wt_common\.claude\hooks\<script>.ps1`)or **script-local path**(`$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path`)|
| log path | `$scriptDir` 起点 relative(`Join-Path $scriptDir ..\..\logs`)|
| 起動 cwd 証跡 | DoD に「実 Factory セッション cwd 観測 + log」追加 |

### 2-D. F4 — Hook Contract セクション追加(必須)

第 137 次発令の Hook Ticket Template v1(`staging/template_hook_ticket_with_contract_v1.md`)構造を適用:

```yaml
hook_contract:
  target_runtime: Claude Code (PreToolUse)
  config_path: <絶対パス>
  hook_key: hooks.PreToolUse[].matcher
  matcher_pattern: "Write|Edit|MultiEdit|NotebookEdit"
  hook_script_path: <絶対パス>
  input_schema_source: <Claude Code 仕様 URL or sample>
  block_exit_code: 1
  allow_exit_code: 0
  fail_open_policy: <列挙>
  fail_close_paths: <列挙>
  cwd_assumption: <明示>
  self_modification_block: <protected paths 列挙>
  log_path: <絶対パス or script-local>
  log_format: JSON Lines
  log_rotation_policy: <auto/manual/N/A>
  rollback_path: <Bash spawn 経由>
  non_applicable_agents: Codex (covered by AGENTS.md §3)
  pwsh_fallback: yes(分岐コマンド)
  evidence_required: <実 runtime 動作証跡>
```

---

## 3. §3 司令官 α 主管 起案手順

| 順 | 内容 |
|---|---|
| 1 | 既存 `tickets_issued/active/DO-FACTORY-233_evts120_axis_b_pretooluse_hook_do_write_block.md` を **`tickets_draft/` へ revert + rename**(rollback 起点) |
| 2 | 第 137 次発令 Hook Ticket Template v1(`staging/template_hook_ticket_with_contract_v1.md`)を参照 |
| 3 | DO-FACTORY-233 修正版を `tickets_draft/` で staging 起案 + 必須修正 4 件反映 |
| 4 | 監督官 A Y4-B v4 staging(本サイクル併行起案、`staging/y4_b_pretooluse_hook_v4.md`)と整合確認 |
| 5 | **`tickets_issued/active/` 配置 + sync-tickets で工場長配信は禁止**(ヤス再採否完遂前)|
| 6 | 監督官 A への staging 完遂報告(commit hash + 鋳型適用差分 + Codex 再採点取得)|

---

## 4. §4 工場長 hook 実装投入禁止(ヤス指示遵守、再採否前)

| 項目 | 状態 |
|---|---|
| `tickets_issued/active/` 配置 | 🔴 禁止(staging のみ) |
| sync-tickets 工場長配信 | 🔴 禁止 |
| 工場長 PR 起票 | 🔴 禁止 |
| 工場長 merge | 🔴 禁止 |
| ヤス再採否完遂後の解禁経路 | Y4-B v4 staging + DO-FACTORY-233 修正版 staging 両方完遂 → 監督官 A → ヤスへ最終採否要請 → 採択時に司令官 α `tickets_issued/active/` 配置 + sync-tickets 配信 |

---

## 5. §5 Codex 補完次段階保持(ヤス採否反映)

| 軸 | 状態 | 解除条件 |
|---|---|---|
| E 軸 AGENTS.md §3(Y4-E 採択済) | ✅ 当面これで足りる | 違反継続 / 再発時に次段階判断 |
| DO-G-013 拡張(role_boundary_check.js に DO-* prefix 検出ロジック追加)| 🟡 **次段階候補保持**(即時追加なし) | EVT-120 系列違反継続 / 再発時にヤス採否経路で起案 |
| C 軸 CI/PR gate(do-id-existence-check.yml)| 🟡 **次段階候補保持**(三社円卓 X-4)| 同上 |

= **本サイクルでは E 軸単独**(Codex 補完追加なし)+ 監視継続

---

## 6. §6 採否経路(司令官 α 側)

| 選択肢 | 内容 |
|---|---|
| (S) 採択 | DO-FACTORY-233 REVISE + 必須修正 4 件反映 + staging 起案 + Y4-B v4 staging 整合 + 工場長投入禁止遵守 |
| (P) 部分採択 | 必須修正 4 件中の一部を次サイクル(理由明示)|
| (R) 整流要請 | 必須修正 4 件 / 鋳型 / Y4-B v4 整合 / Codex 補完保持 のいずれかへの修正案要請 |

---

## 7. §7 Plan-First 適合宣言

本発令は (i) 既存運用パイプライン(発令起案 + stage 0 配送)+ (ii) 司令官 α への REVISE 通知本体(staging 起案要請、`tickets_issued/active/` 配置禁止)+ (iii) 装置数 ±0(staging 文書のみ)= Plan-First 例外条件 (iii) 既存装置の通常運用。

ヤス採否完遂事項のみ進行(REVISE 判定 = ヤス採否済)+ Y4-B v4 採否は別ライン継続(本発令時点では監督官 A staging 起案準備中)+ DP-001 制約遵守。

---

## 8. §8 鬼コーチ的所感(対司令官、短文)

司令官 α、DO-FACTORY-233 = REVISE 確定 + 必須修正 4 件 = 第 137 次発令の Hook Ticket Template v1 適用で **Codex 採点 95 点経路成立**。

修正版 staging 起案 + Y4-B v4 staging 整合 + 工場長投入禁止 = ヤス再採否完遂前の三層保護経路 = **構造的防止 5 軸 軸 B の正規実装経路**。

統合応答推奨(本第 136 次 + 第 137 次 = 2 発令分 統合 1 通)= 第 117/118 号同型方式継続。

---

## 9. 改訂履歴

- v1.0(2026-05-08 朝、Day 136 朝):初版起案、ヤス採否(DO-FACTORY-233 REVISE 判定支持 + 必須修正 4 件 + 工場長実装投入禁止)反映完遂。番号 136 = ヤス指示「第 136 次発令として通知」遵守(起案順は第 137 次先行、発令番号 SSOT)。Strategy Lab F1-F4 全反映 + Codex 採点 78 → 95 経路 + Y4-B v4 staging 整合経路 + Codex 補完次段階保持 統合。

---

*監督官 A → 司令官 α 第 136 次発令(2026-05-08 朝、Day 136 朝)*
*「DO-FACTORY-233 REVISE + 必須修正 4 件(F1 複合 prefix regex + F2 DoD 7 件以上 + F3 cwd 解消 + F4 Hook Contract)+ 工場長実装投入禁止(ヤス再採否前)+ Y4-B v4 staging 整合経路」*
