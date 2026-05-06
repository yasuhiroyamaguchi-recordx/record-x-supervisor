# 三社円卓 第 7 回 議題候補草案 v0.1 — SSOT / ワークツリー負債 / ディレクトリガード

**配置先**: `staging/council_7_agenda_candidates_ssot_workspace_v0.1.md`
**起案日**: 2026-05-04 PM(JST)
**起案者**: 監督官 A(Argus)
**契機**: EVT-20260504-117（チケット二重台帳）+ 工場長認識共有
**状態**: 草案（ヤス・司令官・工場長の採否前）

---

## 開催前提（提案）

- **議題確定は三社合議**（監督官単独構造判断回避 — EVT-077 / EVT-083 教訓）。
- 前提資料:
  - [`archive/error_patterns.md` §6-E EVT-20260504-117](../archive/error_patterns.md)
  - [`staging/ticket_ledger_ssot_clarification_v0.1_draft.md`](ticket_ledger_ssot_clarification_v0.1_draft.md)

---

## 議題 X-1 — SSOT 単一化と報告規律

**論点**

1. アクティブチケットの **SSOT** を `record-x-commander/strategy/tickets_issued/active/` に確定するか。
2. 件数報告時に **パス・SSOT フラグ・計測時刻** の併記を三者規律とするか。
3. `factory/state/tasks.json` を **DEPRECATED（凍結）** と明示埋葬するか（README 1 ファイル追加）。

**期待決議**: 三者 Yes で規律確定 → 司令官 α がドキュメント・マーカー実装主管。

---

## 議題 X-2 — `ProjectRX_HQ` ワークツリー／コピー肥大の縮退計画

**論点**

1. `ProjectRX_HQ` 直下の `wt_common*` / `wt_pr*` の **canonical を 1 本に収束**する方針か。
2. `.git` 不在領域での作業コピー増殖を **今後どう禁止／検知**するか（人手規律 vs スクリプト）。
3. 削除・統合の **安全検証ステップ**（Plan-First 5 ステップ）のテンプレ適用。

**期待決議**: 工場長 Castor 主管の「棚卸し → 削除計画 → 実行」のフェーズ分割と期限。

---

## 議題 X-3 — `record-x/record-x/` 誤生成の予防ガード

**論点**

1. PreToolUse hook で **`**/record-x/record-x/**` 作成を deny** する案の採否。
2. CI で **ネスト深度またはパス禁止規則** を検査する案の採否（alias: arch-gate 拡張）。
3. ガード対象を **HQ のみ** vs **三者リポジトリ全域** のどちらから始めるか。

**期待決議**: Phase B 中盤「環境層 Step 8 候補」として優先度付け。

---

## 参考（物理証拠の要約）

| 現象 | 証拠 |
|---|---|
| 二重台帳 | SSOT **107** vs `tasks.json` ベース **40** 未完了（別定義で両方真） |
| 凍結 | `tasks.json` `updated_at` = **2026-04-06** |
| 入れ子 | `record-x/record-x/` **4** 箇所 |
| WT 増殖 | `wt_common*` 複数 + `ProjectRX_HQ` **.git 不在** |

---

## 改訂履歴

- v0.1(2026-05-04 PM): 初版（X-1〜X-3 起案）
