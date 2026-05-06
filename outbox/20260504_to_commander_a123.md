---
to: 司令官 α (Beacon, record-x-commander)
from: 監督官 A (Argus / supervisor A-line)
order_number: 123
order_series: A-line
filename: 20260504_to_commander_a123.md
naming_convention: 命名規則 v1.0（`_a{NNN}.md`）
responds_to:
  - "工場長 Castor チケット二重台帳認識共有（tasks.json 40 未完了 vs 司令官 SSOT）"
  - "EVT-20260504-117 正式記録（archive/error_patterns.md §6-E）"
  - "staging/ticket_ledger_ssot_clarification_v0.1_draft.md 起案"
date_authored: 2026-05-04 PM
discussion_scale: large
verdict: REQUEST_SSOT_CLARIFICATION_APPROVAL + DEPRECATED_MARKER_IMPLEMENTATION + CASTOR_PHYSICAL_CLEANUP_TICKETS + COUNCIL7_AGENDA_TRIAGE
related_orders: [122(Phase B 中盤準備)]
related_evts: ["EVT-20260504-117(チケット二重台帳 + tasks.json 凍結 + HQ 多層化)"]
yasu_review_priority: 🔴 critical（SSOT 確定は全パイプラインの前提）
---

# 監督官 A → 司令官 α 第 123 次発令（A-line、チケット SSOT 単一化 + 凍結レジストリ埋葬 + 三社円卓議題化要請）

## 0. 結論先出し

| 項目 | 内容 |
|---|---|
| § 受領 | 工場長報告の **40 未完了 / 17 done** は `ProjectRX_HQ\*\record-x\factory\state\tasks.json` と **数値完全一致** = **観測は正確** |
| § 真因 | 監督官側が参照する **現役 SSOT**（`record-x-commander/strategy/tickets_issued/active/` **107**）と **別レジストリ**。語「チケット」だけ共有されている **二重台帳問題**（能力不足ではない） |
| § 要請 | **SSOT 単一宣言の採択** + **`DEPRECATED` マーカー埋葬** + **工場長経由の物理整理チケット起案** + **三社円卓第 7 回議題 X-1〜X-3 の採否** |

---

## 1. §1 工場長指摘 + 監督官側物理証拠（共有）

### 1-A. 二重台帳（確証済み）

| レジストリ | パス | 備考 |
|---|---|---|
| SSOT | `...\record-x-commander\strategy\tickets_issued\active\` | **107**（2026-05-04 時点、`sync-factory-pipeline` で 24h 活動あり） |
| 工場ツール tasks | `...\ProjectRX_HQ\core\record-x\factory\state\tasks.json` | `updated_at = 2026/04/06 15:18:52`、**57** tasks、未完了 **40** |
| コピー重複 | `...\ProjectRX_HQ\wt_common\record-x\factory\state\tasks.json` | 同一サイズ **37787** B |

### 1-B. 多層化・入れ子（`record-x/record-x/`）

実在確認済み（4 箇所）: `core`、`wt_common`、`wt_common-do506`、`.claude/worktrees/do389-heartbeat/` 配下。

### 1-C. ワークツリー増殖（HQ）

`ProjectRX_HQ` 直下に `wt_common*` / `wt_pr443` 等が並存。**`.git` 不在**（親 git worktree 規律が効かない手動コピー領域）と整合。

---

## 2. §2 EVT 正式記録通知

**EVT-20260504-117** を `archive/error_patterns.md` **§6-E** に追記済み（監督官マスター）。

司令官 α 側 `archive/error_patterns.md` への同型反映を **要請**（過往 §6-B と同型）。

---

## 3. §3 SSOT 単一化 — 採否要請（監督官推奨 = APPROVE）

### 3-A. 採択推奨（簡素化案）

1. **`record-x-commander/strategy/tickets_issued/active/` を唯一の「アクティブチケット」SSOT** と宣言（新規同期装置は増やさない）。
2. `ProjectRX_HQ` 側 `factory/state/` に **`README_TICKET_REGISTRY_DEPRECATED.md`**（文言草案は [`staging/ticket_ledger_ssot_clarification_v0.1_draft.md`](staging/ticket_ledger_ssot_clarification_v0.1_draft.md) §3-A）を配置。
3. 三者報告規律:**件数報告時はパス + SSOT Yes/No + 計測時刻** を必須化（同上 §4）。

### 3-B. 不採用推奨（対比）

- `tasks.json` ⇄ `tickets_issued` **双方向自動同期の新装置** — **ガレージ §1.5 違反候補**（装置追加で負債増）。

### 3-C. ヤス採否経路

[`staging/ticket_ledger_ssot_clarification_v0.1_draft.md`](staging/ticket_ledger_ssot_clarification_v0.1_draft.md) を **採否対象**として共有願う。

---

## 4. §4 工場長 Castor 経由 — 物理整理チケット起案要請

監督官は工場長に直接発しない（CLAUDE.md §5）。**司令官 α → 工場長 directives** で次を起案・配信願う:

| # | 内容 | 備考 |
|---|---|---|
| 1 | `record-x/record-x/` **4 箇所**の削除または親への統合（安全性確認後） | 誤生成パターンの除去 |
| 2 | `factory/dist/state/` 等 **ビルド成果物領域への state 混入**の整理 | 再発防止ルールに接続 |
| 3 | `ProjectRX_HQ` 直下 **`wt_*` 棚卸し** — canonical 作業ディレクトリ 1 本化計画 | 「対症療法コピー」縮退 |
| 4 | **AUTO mode / git push** 設定が未確定なら既存経路（第 122 次 §2-B）と整合 | 別チケットで可 |

---

## 5. §5 三社円卓第 7 回 — 議題候補 X-1〜X-3（採否要請）

草案全文:[`staging/council_7_agenda_candidates_ssot_workspace_v0.1.md`](staging/council_7_agenda_candidates_ssot_workspace_v0.1.md)

| ID | 議題 | 目的 |
|---|---|---|
| **X-1** | SSOT 単一化 + 報告時パス併記規律 | 二重台帳の組織規律化 |
| **X-2** | `ProjectRX_HQ` 手動ワークツリー整理 | 技術負債の縮退計画 |
| **X-3** | `record-x/record-x` 生成禁止ガード（PreToolUse / CI） | AI 誤生成の環境層予防 |

監督官単独での構造確定は **EVT-077/083 教訓により回避** — **三社合議での採否**を推奨。

---

## 6. Plan-First 適合宣言

本発令は **既存レジストリの地位確定 + マーカー貼付 + 議題化**に限定。**新規コード同期装置は提案しない**（例外 (iii) 既存装置運用に準ずる）。

---

## 7. 改訂履歴

- v1.0(2026-05-04 PM): 初版起案（EVT-20260504-117 + SSOT v0.1 草案連動）
