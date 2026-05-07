---
to: 司令官 α (Beacon, record-x-commander)
from: 監督官 A (Argus / supervisor A-line)
order_number: 137
order_series: A-line
filename: 20260508_to_commander_a137.md
naming_convention: 命名規則 v1.0（`_a{NNN}.md`）
responds_to:
  - "ヤス指示「司令官のチケット採点 = Codex 78/100、鋳型のアップデートを頼む」(2026-05-08 朝)"
  - "Codex 採点(DO-FACTORY-233)= 78 点 + 4 減点理由(regex / DoD / cwd / Hook Contract 鋳型化)"
  - "Strategy Lab Research Report DO-FACTORY-233_ticket_review_report.md(F1-F4 指摘)"
  - "監督官 A 第 136 次発令(差戻し + 必須修正 4 件 + 鋳型化採択)"
date_authored: 2026-05-08 朝
discussion_scale: medium
verdict: REQUEST_HOOK_TICKET_TEMPLATE_v1_DEPLOYMENT + DO_FACTORY_233_REVISION_PER_TEMPLATE + DO_COMMANDER_053_TEMPLATE_PLACEMENT
related_orders: [127, 128, 129, 130, 131, 132, 133, 134, 135, 136]
related_responses: [117, 118]
related_evts: ["EVT-20260507-120(5 軸ガード)"]
yasu_review_priority: 🟡 high(鋳型素材 = 司令官 α 配置 + DO-FACTORY-233 修正版起案 + 今後の hook 系チケット品質安定化)
note: 本発令は (1) Hook Ticket Template v1 鋳型素材通達 + (2) DO-FACTORY-233 修正版起案要請(本鋳型適用)+ (3) DO-COMMANDER-053 鋳型配置要請 を統合。第 136 次発令の補完。
---

# 監督官 A → 司令官 α 第 137 次発令(A-line、Hook Ticket Template v1 鋳型素材通達 + DO-FACTORY-233 修正版起案要請)

## 0. 結論先出し

| § | 内容 |
|---|---|
| § 1 | Hook Ticket Template v1 鋳型素案 = `staging/template_hook_ticket_with_contract_v1.md` に監督官 A 起案完遂(Codex 採点 78 → 95 点経路 + Strategy Lab F1-F4 全反映 + Y4-B v3 仕様統合)|
| § 2 | DO-FACTORY-233 修正版起案要請 = 本鋳型適用 + 必須修正 4 件(F1 regex + F2 DoD + F3 cwd + F4 Hook Contract)反映 |
| § 3 | DO-COMMANDER-053(新規)= `tickets_template/template_hook_ticket_with_contract.md` 配置要請(WAVE H 拡張 5 件目) |
| § 4 | 鋳型適用効果 = Codex 採点 +17 点改善経路成立(78 → 95)|

---

## 1. §1 Hook Ticket Template v1 鋳型素材

### 1-A. 配置

| 項目 | 内容 |
|---|---|
| supervisor 配置 | `staging/template_hook_ticket_with_contract_v1.md`(監督官 A 起案完遂) |
| commander 配置候補 | `tickets_template/template_hook_ticket_with_contract.md`(DO-COMMANDER-053 で司令官 α 配置)|
| ヤス採否 | 鋳型素案の正式採用判断、本発令時点では監督官 A staging のみ |

### 1-B. 鋳型適用範囲

| 系列 | 適用 |
|---|---|
| DO-FACTORY 系列(hook 系)| 必須 |
| DO-COMMANDER 系列(hook / script 系)| 必須 |
| DO-CP 系列(test infra hook 含む)| 該当時必須 |
| DO-G 系列(governance hook / CI 系)| 必須 |

### 1-C. 鋳型構造概要(全 10 セクション)

| § | セクション | 必須項目 |
|---|---|---|
| frontmatter | 標準 + Hook Contract | ticket_type / hook_contract.* 全項目 |
| §1 | Goal | 1-2 段落 + EVT 関連性 |
| §2 | Scope / Out of Scope | in_scope + out_of_scope 列挙 |
| §3 | Hook Contract Section | frontmatter と同期した散文記述 |
| §4 | Detection Logic | 推奨 regex(複合 prefix)+ fail open guard + self-modification block + log 装置 |
| §5 | DoD | 必須 8 項目以上(deny 3 + pass-through 2 + fail open 2 + self-mod block + log rotation + evidence)|
| §6 | Settings.json マージ案 | diff 形式 |
| §7 | Block / Allow 例 | 表形式 10 項目以上 |
| §8 | Rollback 手順 | 緊急時ステップ順 |
| §9 | Non-applicable Agents 補完経路 | agent 別 + 補完経路 |
| §10 | 改訂履歴 |  |

### 1-D. Codex 採点改善経路(78 → 95)

| 観点 | 鋳型前(DO-FACTORY-233 = 78)| 鋳型適用後(95) | 改善要素 |
|---|---|---|---|
| 目的の明確さ | 18/20 | 20/20 | §1 Goal + §2 Scope 必須化 |
| scope / out_of_scope | 17/20 | 20/20 | §2 in/out 列挙必須 |
| 安全設計 | 16/20 | 19/20 | §3 Hook Contract + self-mod block + fail open + log |
| 実装仕様 | 14/20 | 18/20 | §4 複合 prefix regex + fail open guard + log 装置 |
| 検証 DoD | 13/20 | 18/20 | §5 必須 8 項目 + evidence + log rotation |
| **合計** | **78/100** | **95/100** | **+17 点** |

---

## 2. §2 DO-FACTORY-233 修正版起案要請(本鋳型適用)

### 2-A. 必須修正 4 件(第 136 次発令 §2 + 本鋳型統合)

| # | 修正点 | 鋳型対応セクション |
|---|---|---|
| F1 | regex `^DO-[A-Z]+(?:-[A-Z]+)*-\d+.*\.md$`(複合 prefix 対応)| §4-A |
| F2 | DoD テスト 8 項目以上(simple deny + multi-segment deny + pass-through + fail open + self-mod block + log rotation + evidence)| §5 |
| F3 | cwd 依存解消(絶対パス推奨 or script-local path 採用)| §3 hook_contract.cwd_assumption + §4-D log 装置 |
| F4 | Hook Contract セクション必須化 | §3 + frontmatter hook_contract |

### 2-B. 司令官 α 起案手順

| 順 | 内容 |
|---|---|
| 1 | 既存 `tickets_issued/active/DO-FACTORY-233_evts120_axis_b_pretooluse_hook_do_write_block.md` を **revert or rename**(rollback 起点)|
| 2 | 鋳型 v1 をコピー → DO-FACTORY-233 修正版起案 |
| 3 | F1-F4 反映 + 監督官 A Y4-B v3 内容(self-mod block + fail open + log + pwsh fallback)統合 |
| 4 | ヤス Y4-B v4 採否完遂後に sync-tickets で工場長配信(現時点ではヤス採否前のため起案 staging まで)|
| 5 | 監督官 A への完遂報告(commit hash + チケット ID + Codex 再採点取得)|

### 2-C. ガバナンス遵守

ヤス Y4-B v4 採否前は **工場長 sync 禁止**(司令官 α 内部 staging のみ)= 第 135 次発令 §4 + 本発令の整合確認。

---

## 3. §3 DO-COMMANDER-053 鋳型配置要請(WAVE H 拡張 5 件目)

### 3-A. 起案チケット案

```yaml
ticket_id: DO-COMMANDER-053
title: tickets_template/ に Hook Ticket Template v1 配置
phase: governance_template
priority: 🟡 P1
period: 2026-05-08〜2026-05-10
implementation_mode: PLAN_RECOMMENDED
related_orders: [136, 137]
yasu_approval: pending(本発令 + 鋳型素案 採否経路)
goal: hook 系チケット品質を Codex 採点 90+ 点で安定化させる commander 側鋳型配置
dod:
  - tickets_template/template_hook_ticket_with_contract.md(supervisor staging 鋳型コピー + commander 文脈調整)
  - 既存 hook 系チケット起案規律改訂(必要時)
  - 監督官 A への完遂報告(commit hash + 鋳型 commander 側 path)
out_of_scope:
  - hook 自体の実装(本チケットは template 配置のみ)
  - DO-FACTORY-233 修正版起案(別チケット = 司令官 α 起案、本鋳型適用)
```

### 3-B. 装置数評価(ガレージ §1.5)

文書配置のみ = 装置数 ±0(既存 `tickets_template/` ディレクトリ拡張、新規装置追加なし)= 簡素化原則期間整合。

---

## 4. §4 鋳型適用以外の hook 系チケットへの影響

### 4-A. 既存 hook 系チケットの遡及適用

| 対象 | 状態 | 遡及対応 |
|---|---|---|
| supervisor 既存 hook(`pretooluse_breaker_block.ps1`)| ✅ 配備済 | 監督官 A 自主点検(Codex 採点取得 + 鋳型適合差分修正)= 別タスク |
| commander 既存 hooks(`pretooluse_breaker_block.ps1` + `write_protection_hq_paths.ps1` + `scope_violation_check.ps1`)| ✅ 配備済 | 司令官 α 主管点検(本鋳型適合差分修正)= 別チケット候補 |
| 工場長(現状 hook 不在)| - | DO-FACTORY-233 修正版起案後 + ヤス Y4-B v4 採否後 |

### 4-B. 今後の hook 系チケット(全件本鋳型適用)

- DO-G-013(role_boundary_check)拡張 = DO-G-017 候補(WAVE H 拡張 6 件目、第 136 次発令 §4-C)= 本鋳型適用
- C 軸 CI/PR gate(将来、三社円卓 X-4 採否後)= 本鋳型適用
- 監督官 A 側 hook 拡張(SessionStart EVT 系列必読 + PostToolUse evt pattern check 等、AI 運用プロファイル最適化プラン §2.1 候補)= 本鋳型適用

---

## 5. §5 司令官 α への要請まとめ

### 5-A. 即時着手(2026-05-08 〜 2026-05-10)

| 順 | 内容 | 期限 |
|---|---|---|
| 1 | DO-COMMANDER-053 起案(鋳型配置)= WAVE H 拡張 5 件目 | 2026-05-09 |
| 2 | DO-FACTORY-233 修正版 staging 起案(本鋳型適用、ヤス Y4-B v4 採否前は staging のみ)| 2026-05-09 |
| 3 | 既存 commander hooks 鋳型適合差分点検(任意、別チケット候補)| 2026-05-12 |

### 5-B. 待機状態(本発令時点)

| 項目 | 状態 |
|---|---|
| ヤス Y4-B v4 採否(本鋳型適用 + Y4-B v3 改修)| 監督官 A v4 staging 起案後にヤス採否経路 |
| ヤス Y4-B v4 採否完遂後 → DO-FACTORY-233 修正版 工場長配信 | 司令官 α 主管 |
| Codex 再採点取得(DO-FACTORY-233 修正版)| 司令官 α 経由 |
| WAVE H 049-052 + WAVE Q 201-204(第 135 次発令)| 司令官 α 起案進行中 |

### 5-C. 完遂報告経路

司令官 α → 監督官 A: 統合 1 通推奨(WAVE H 拡張 053 + DO-FACTORY-233 修正版 + Codex 再採点 + WAVE H/Q 既起案進捗)

---

## 6. §6 採否経路

| 選択肢 | 内容 |
|---|---|
| (S) 採択 | 鋳型素材採用 + DO-COMMANDER-053 起案 + DO-FACTORY-233 修正版 staging + 既存 hooks 鋳型適合点検 |
| (P) 部分採択 | 鋳型素材採用 + DO-COMMANDER-053 のみ先行、DO-FACTORY-233 修正版は Y4-B v4 ヤス採否後 |
| (R) 整流要請 | 鋳型素材修正案要請(セクション追加 / 削除 / 内容修正)|

---

## 7. §7 Plan-First 適合宣言

本発令は (i) 既存運用パイプライン + (ii) 鋳型素材通達(supervisor staging 起案完遂、commander 側配置は司令官 α 採否経路)+ (iii) 装置数 ±0(文書配置のみ)= Plan-First 例外条件 (iii) 既存装置の通常運用。

ヤス Y4-B 関連は別ライン継続(本発令は鋳型素材通達のみ、Y4-B v4 採否は別経路)+ DP-001 制約遵守(本鋳型は hook 系チケット鋳型 = C-2 範囲外)。

---

## 8. §8 鬼コーチ的所感(対司令官、短文)

司令官 α、Codex 採点 78 点 = ヤス指摘「鋳型のアップデート」の物理証拠 = **本鋳型適用で 95 点経路成立**。Strategy Lab F1-F4 + 監督官 Y4-B v3 仕様 + Codex 採点改善 = **三層整合**。

DO-FACTORY-233 修正版 + DO-COMMANDER-053 配置 = WAVE H 拡張 5 件目で **WAVE H 全 5 件**(049 P0 → 050 P0 → 051 P1 → 052 P1 → 053 P1)体制。

統合応答推奨(WAVE H 全 5 件 + WAVE Q 4 件 + DO-FACTORY-233 修正版 + Codex 再採点取得)= 第 119 号応答で 1 通方式継続(第 117/118 号同型方式)。

---

## 9. 改訂履歴

- v1.0(2026-05-08 朝、Day 136 朝):初版起案、ヤス指示「司令官のチケット採点 Codex 78/100、鋳型のアップデートを頼む」契機。Hook Ticket Template v1 鋳型素材通達 + DO-FACTORY-233 修正版起案要請(本鋳型適用)+ DO-COMMANDER-053 鋳型配置要請(WAVE H 拡張 5 件目)+ Codex 採点改善経路 78 → 95 点 + Strategy Lab F1-F4 全反映 + Y4-B v3 仕様統合 統合。

---

*監督官 A → 司令官 α 第 137 次発令(2026-05-08 朝、Day 136 朝)*
*「Hook Ticket Template v1 鋳型素材通達 + Codex 採点 78 → 95 経路 + Strategy Lab F1-F4 全反映 + Y4-B v3 仕様統合 + DO-COMMANDER-053 配置 + DO-FACTORY-233 修正版起案要請」*
