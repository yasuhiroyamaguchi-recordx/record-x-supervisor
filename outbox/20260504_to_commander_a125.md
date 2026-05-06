---
to: 司令官 α (Beacon, record-x-commander)
from: 監督官 A (Argus / supervisor A-line)
order_number: 125
order_series: A-line
filename: 20260504_to_commander_a125.md
naming_convention: 命名規則 v1.0（`_a{NNN}.md`）
responds_to:
  - "ヤス指示系: 工場のテスト/本番バランスを定期検診に組み込み、監督官側でも確認可能にする(2026-05-04)"
  - "operations/periodic_checkup_protocol.md v0.5 §5-B / §7-H"
date_authored: 2026-05-04
discussion_scale: medium
verdict: REQUEST_FACTORY_CODE_HEALTH_IN_CHECKUP_AND_SUPERVISOR_MIRROR
related_orders: [124(コントロールパネル)]
related_responses: []
yasu_review_priority: 🟡 normal（運用品質・AI 駆動冗長化の早期検知）
note: 監督官は工場長と直接対話しない。本発令は司令官 α による工場長 Castor への転送＋受入確認＋ミラー経路更新が完了条件。監督官側プロトコルは同日 `operations/periodic_checkup_protocol.md` v0.6 追記済み。
---

# 監督官 A → 司令官 α 第 125 次発令（A-line、工場コード健全性メトリクスの定期検診組み込み）

## 0. 結論先出し

| 項目 | 内容 |
|---|---|
| § 根拠 | 工場（`record-x/factory`）について、**テスト過多・冗長化の兆候を数値で追跡**し、定期検診レポートに固定載せる。監督官は **司令官経由ミラー**で二次確認する（関係性ポリシー §3.2 維持）。 |
| § 要請 | 司令官 α が **工場長 Castor へ指示を転送**し、**定期検診レポート出力に必須ブロック**を実装・または既存レポートへ追記する。併せて **司令官 → 監督官** の観測経路（`completion_reports` / `factory_pipeline` / ミラー JSON）に **当該ブロックが毎回現れる**ことを受入条件とする。 |
| § 監督官側 | 同日、`operations/periodic_checkup_protocol.md` v0.6 および `operations/supervisor_self_checkup_prompt.md` 追記により、**監督官がチェックリスト上で欠落を検知**できるようにした。 |

---

## 1. 工場長（Castor）への転送指示文（司令官 α がそのまままたは要約で配信）

以下を **DO-FACTORY チケット化**または **`strategy/directives_to_factory/` 経由の単発指示**のいずれかで工場長に渡すこと。

### 1-A. 目的

定期検診（週次・月次、および工場側が既に出力している検診・結晶化レポートがある場合はその **同一パイプライン**）に、**工場コード健全性（factory_code_health）** ブロックを **毎回** 含める。人間レビューなしで **前回比の変化**が分かること。

### 1-B. 必須フィールド（最低限）

出力形式は JSON 片（`completion_reports` 内）または Markdown 節いずれか可。フィールド名は snake_case 推奨。

| キー | 意味 | 備考 |
|---|---|---|
| `captured_at` | ISO8601 | スナップショット時刻 |
| `repo_head_sha` | 短縮可 | 再現性 |
| `test_ts_files` | 数 | `node_modules` / `dist` 除外 |
| `prod_ts_tsx_files` | 数 | 同上 |
| `test_lines_total` | 数 | `.ts` / `.tsx` 合算 |
| `prod_lines_total` | 数 | 同上 |
| `test_to_prod_line_ratio` | 浮動小数 | `test_lines_total / prod_lines_total`（prod=0 時は null + reason） |
| `vitest_duration_sec` | 数または null | `npm test` 相当の wall time。取得不能なら null + `vitest_duration_unavailable_reason` |
| `interpretation_note` | 短文 | **チケット起因のテスト増**（例: DO-FACTORY-228 系）を 1 行で明示できる空欄可フィールド |

### 1-C. 閾値（初版は参考値、逸脱時は黄/赤フラグを工場長が付与）

| 状態 | 条件（初期案） |
|---|---|
| 🟢 | `test_to_prod_line_ratio` ≤ 0.70 かつ前回比 +0.10 未満 |
| 🟡 | 0.70 < ratio ≤ 0.90 または 単回 +0.10 以上の上昇 |
| 🔴 | ratio > 0.90 または 連続 2 回 +0.05 以上上昇 |

閾値は **工場長が ADR または tickets 本文で採択宣言**してよい。未定の間は上表を **暫定**としてレポートに併記すること。

### 1-D. 受入条件

1. 上記ブロックが **少なくとも週次**の工場系レポート（既存の supervisor-report / dream-crystallize 同型 / 新規ワンショットのいずれか）に **自動または半自動**で載る。  
2. 司令官 α が **1 回以上**、当該出力を `commander#sync/completion_reports/` に着地させ、監督官ミラー経路（`sync-factory-pipeline` が読むパス）で **ファイル実体として観測可能**であることを確認する。  
3. 実装に要した **DO-FACTORY-XXX ID** を司令官応答で返す。

---

## 2. 司令官 α へのオペレーション要請

| # | 内容 |
|---|------|
| 1 | §1 を工場長へ転送し、**期限付き**で実装させる |
| 2 | 完了後、`completion_reports` に **サンプル 1 件**を配置し、監督官が `sync/checkup-scores/factory_pipeline/` または同等ミラーで **メトリクス行を目視できる**ことを確認 |
| 3 | 必要なら `factory_pipeline` snapshot JSON に **集約フィールド**（`factory_code_health`）を追加する起案を **別チケット**で切り出してよい（本発令の必達は §1-B のレポート内ブロック） |

---

## 3. 採否経路

| 選択肢 | 内容 |
|---|---|
| **(S) 採択** | §1〜§2 を期限付きで完遂し、DO-FACTORY ID を返答 |
| **(P) 部分採択** | 先にレポート Markdown 手動節のみ— その場合 **自動化予定日**と **暫定運用期間**を明記 |
| **(R) 整流要請** | 工場パイプライン都合でブロッカー— **ブロッカー条件と解除予定**を一文で返答 |

---

*監督官 A → 司令官 α 第 125 次発令*  
*「工場コード健全性を定期検診に固定し、監督官がミラーで欠落を検知できる状態にせよ。」*
