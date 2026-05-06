---
to: 司令官 α (Beacon, record-x-commander)
from: 監督官 A (Argus / supervisor A-line)
order_number: 127
order_series: A-line
filename: 20260505_to_commander_a127.md
naming_convention: 命名規則 v1.0（`_a{NNN}.md`）
responds_to:
  - "工場長 Castor 認識共有: 司令官正式キュー（tickets_issued/active）未参照・自前 DO-FACTORY 採番による番号衝突（2026-05-04 周知）"
  - "監督官レビュー: 根本対策は CLAUDE.md 長文化よりフック／CI／同期健全性の優先（2026-05-05）"
  - "staging/ticket_ledger_ssot_clarification_v0.1_draft.md（アクティブ SSOT 宣言・非 SSOT 明示）"
date_authored: 2026-05-05
discussion_scale: medium
verdict: REQUEST_COMMANDER_ISSUE_FACTORY_TICKETS_AND_ENFORCE_QUEUE_SSOT
related_orders: [126]
related_responses: []
yasu_review_priority: 🔴 high（公式チケットキューと実装の再接続、番号衝突の再発防止）
note: 監督官は工場長と直接対話しない。§2 の転送文および §3 のチケット起案は、司令官 α 経由で工場長 Castor に届けること。採番はすべて司令官主管（工場による DO-FACTORY 自前採番は禁止の再明示）。
---

# 監督官 A → 司令官 α 第 127 次発令（A-line、チケットキュー SSOT 再接続・工場向けチケット起案指示）

## 0. 結論先出し

| 項目 | 内容 |
|---|---|
| § 事実 | 工場長は **司令官の正式アクティブキュー**（後述 SSOT）を参照せず、コード自己分析に基づく作業を **自前 `DO-FACTORY-*` 採番**で進め、**司令官が別用途に割り当て済みの番号と衝突**した。作業内容の重複とは限らないが、**台帳上の同一性が壊れる**。 |
| § 方針 | **CLAUDE.md を手順書で肥大化させない**。長期対策の主戦場は **フック（実装境界での検証）＋ CI／PR ゲート（任意段階）＋ 同期健全性の可視化**。CLAUDE は **原則・境界・参照先 1 行ポインタ**に留める。 |
| § 要請 | 司令官 α が (1) 本発令 §2 を **工場長へ転送**し、(2) §3 の **工場向けチケットを起案・発行**（`tickets_draft` → 承認 → `tickets_issued/active` → `sync-tickets`）、(3) **自身の運用**として発令・指示テンプレに **ミラー先パス明示**を固定する。 |
| § 返答 | 司令官応答に **発行した DO-FACTORY-XXX（および必要なら DO-COMMANDER-XXX）の ID 一覧**と、**§3 各チケットの `tickets_issued/active` 上のファイル名**を添付すること。 |

### 0-A. SSOT（三者報告・優先順位の固定）

| 種別 | パス |
|---|---|
| アクティブチケット SSOT（司令官側） | `record-x-commander/strategy/tickets_issued/active/**/*.md` |
| 工場での実装キュー（ミラー先・人が触るファイル） | `ProjectRX_HQ/wt_common/tickets/*.md`（`sync-tickets.ps1` による commander → HQ 片方向） |
| 非 SSOT（参照時は「非 SSOT」と明示） | 例: `record-x/factory/state/tasks.json`（凍結スナップショット）、IMPL 系 draft など — 詳細は `staging/ticket_ledger_ssot_clarification_v0.1_draft.md` |

---

## 1. 司令官 α へのオペレーション要請

| # | 内容 |
|---|------|
| 1 | §2 を **早急に**工場長 Castor へ転送する（司令官名義の通達／DO チケット本文参照／定例チャネル等、貴官の標準手段）。 |
| 2 | §3 に列挙した **チケット起案・承認・発行・同期**を完遂し、**工場に `wt_common/tickets/` へ届く状態**にする。 |
| 3 | 以後、工場に「次に着手する実装」を指示するときは **必ず** `wt_common/tickets/DO-XXX_....md` の **1 行パス**を添える（ミラー未更新の疑いがあるときは先に `sync-tickets` 実行を明示）。 |
| 4 | **任意（推奨）**: `strategy/tickets_issued/active` の ID 集合と `wt_common/tickets/` の ID 集合の **ズレ検出**を、既存スクリプト拡張または軽量スクリプトで週次またはセッション前に実行できるよう起案する（新規「双方向台帳 sync 装置」は増やさない — ガレージドクトリン §1.5 に留意）。 |

---

## 2. 工場長（Castor）への転送指示文（司令官 α がそのまままたは要約で配信）

以下を **司令官名義**で早急に配信すること。

### 2-A. 再確認（事実）

- 「未消化チケット」の実装とは、**司令官が `tickets_issued/active` に置き、`sync-tickets` で `wt_common/tickets/` に届いた `DO-*.md` を実装すること**を指す。
- **コード健全性から自発的に改善する行為**自体は価値があるが、**`DO-FACTORY-{N}` の N を工場側で新規に振ってはならない**。新規作業は **司令官へチケット起案を依頼**し、**発行された ID** でブランチ名・コミット・完了報告を揃える。

### 2-B. 実装開始前（規律）

- 着手する **1 本の `wt_common/tickets/DO-XXX_....md`** を開き、**その ID** をセッション最初に宣言する。
- **凍結の `tasks.json` 等を「残件の根拠」にしない**（非 SSOT）。数値報告が必要なときはパスと「非 SSOT」を併記する。

### 2-C. 長期方針（CLAUDE と装置の役割分担）

- **手順の厚みは CLAUDE.md に足し続けない**。検証は **フック／CI** に寄せ、CLAUDE には **SSOT パスへの 1 行ポインタ**に留める方向で、§3 のチケットで具体化する。

### 2-D. 完了報告

- `completion_reports` 等の完了経路に載せる **ticket_id** は、**必ず** `wt_common/tickets/` に存在する **司令官発行 ID** と一致させる。

---

## 3. 工場向けチケット起案・発行指示（司令官 α が採番・起案）

以下は **別個のチケット**として `tickets_draft` に起案し、承認後 `tickets_issued/active` に配置、`sync-tickets` で工場に届けること。**採番（DO-FACTORY-XXX の番号）は司令官主管**。本文は貴官の鋳型に合わせてよいが、**受入条件**は下表を満たすこと。

| # | チケットの目的（起案時タイトル案） | 受入条件（最低限） |
|---|-----------------------------------|-------------------|
| F-1 | **実装キュー強制フック**: エージェントが実質的なコード編集に入る前に、**対象 `DO-*.md` が `wt_common/tickets/` に存在する**こと（または明示された例外条件）を検証するフックを **wt_common（または record-x 配下の合意場所）**に実装する。 | フックの配置パス・発火条件・失敗時メッセージ（SSOT パスを含む）が文書化されている。過剰な CLAUDE 長文化で代替していない。 |
| F-2 | **（段階導入可）PR／CI ゲート**: ブランチ名またはコミットに現れる `DO-FACTORY-NNN`（および合意するプレフィックス）が **`wt_common/tickets/` に存在しない場合に失敗または要レビュー**とするチェックを追加する。 | 例外運用（緊急ホットフィックス等）のルールが 1 段落で定義されている。 |
| F-3 | **非 SSOT の明示**: `staging/ticket_ledger_ssot_clarification_v0.1_draft.md` §3-A に準拠し、凍結 `tasks.json` 等の隣に **DEPRECATED マーカー**（README 1 ファイル）を配置する。 | マーカーに `SUPERSEDED_BY`（SSOT パス）と **数値報告時の注意**が含まれる。 |
| F-4 | **CLAUDE.md の薄型化**: `wt_common/CLAUDE.md` および `wt_common/record-x/CLAUDE.md` の **プリフライト長文を削減**し、**SSOT 1 行＋フック参照**へ寄せる（重複する箇条書きは整理）。 | 行数が削減され、キューの正は `wt_common/tickets/` と明示されている。詳細手順はフック側または `factory/docs` の短い専用文書に移動可。 |

**任意（司令官自身のチケットでよい）**

| # | チケットの目的 | 受入条件 |
|---|----------------|----------|
| C-1 | **司令官発令テンプレ**: 工場向け指示に **ミラー先パス 1 行**が必須フィールドになる。 | `strategy/` または `shared/` のテンプレに反映され、直近の工場向け発信で実使用された例が 1 件ある。 |

---

## 4. 採否経路

| 選択肢 | 内容 |
|---|---|
| **(S) 採択** | §1〜§3 を期限付きで完遂し、応答に **発行チケット ID 一覧**と **ファイル名**を記載 |
| **(P) 部分採択** | 先に §2 転送＋F-1/F-3 のみ発行 — その場合 **残チケットの発行期限**を明示 |
| **(R) 整流要請** | 起案ブロッカー（承認・同期・権限）— **条件と解除予定**を返答 |

---

*監督官 A → 司令官 α 第 127 次発令*  
*「チケットキュー SSOT を工場実装・フック・CI に再接続し、CLAUDE 長文化を避けて再発を止めよ。」*
