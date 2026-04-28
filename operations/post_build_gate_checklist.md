# Post-Build Gate チェックリスト v0.1

**配置先**: `operations/post_build_gate_checklist.md`
**起案日**: 2026-04-29(Day 131 朝)
**起案者**: 監督官 instance A1
**目的**: 工場長実装後の **必達項目漏れ確認**(二値判定)+ ルーブリック適用前の前検査
**根拠**:
- ヤス指示「工場長実装後の内容のチェックと司令官へのフィードバックについて、チェックリストの雛形やデビルズアドボケートモードでの改善事案の提案があるといいのかな」(2026-04-29 朝)
- 推奨プラン (β) ヤス確定(2026-04-29 朝)
- Devil's Advocate ラウンド 5 件採択結果(本起案前に監督官 A1 が実施)
- 既存資産: `rubrics/implementation_review_rubric.yaml` v1.0(数値採点)+ `outbox/_templates/feedback_to_commander_template.md` v1.0(verdict 4 種フィードバック)
- ガレージドクトリン `operations/role_and_conduct.md` §1.5「装置の存在 ≠ 機能」

---

## 0. 位置づけ

### 0-A. 既存資産との補完関係

本チェックリストは **二値判定の必達項目漏れ確認** であり、`rubrics/implementation_review_rubric.yaml` v1.0(4 軸数値採点)とは **別の道具**。両者は補完関係:

| 道具 | 目的 | 出力 | 適用順序 |
|---|---|---|---|
| **本チェックリスト**(二値判定)| 必達項目の漏れ確認 | passed / failed | **1. 前検査** |
| **implementation_review_rubric** v1.0(数値採点)| 実装品質の数値スコアリング | 0-100 / 軸別 | **2. 詳細採点** |
| **feedback_to_commander_template** v1.0(verdict)| フィードバック発令 | APPROVE / APPROVE_WITH_NOTES / REQUEST_CHANGES / REJECT | **3. 採択判断** |

二値判定で 1 件以上 false の場合、ルーブリック詳細採点に進まず即時 REQUEST_CHANGES 候補化。形骸化防止のため **必達項目のみ 12 項目に限定**(過剰計測回避、粗砥原則整合)。

### 0-B. 関係性ポリシー §3.2 整合(役割境界遵守)

監督官は **工場長と直接対話しない**(CLAUDE.md §5)。本チェックリスト適用は:

- **司令官経由で工場長実装を観察**(`sync/checkup-scores/factory_pipeline/` 経由 + `commander#completion_reports/` 経由)
- 監督官の独立 review = **Post-Build Gate**(司令官の Pre-Build Gate と差別化)
- 二値判定で false 検出時、**司令官への構造的指摘発令** で工場長への伝達経路を確保(監督官 → 司令官 → 工場長)

---

## 1. 必達項目チェック(12 項目、二値判定)

工場長実装(PR / commit / lessons)に対し、以下 12 項目を二値判定:

| # | 項目 | 判定基準 | データソース |
|---|---|---|---|
| 1 | DoD 完全達成 | 該当チケットの DoD すべて達成 = true / 1 件でも未達 = false | `commander#strategy/tickets_completed/` + PR description |
| 2 | Forbidden Path 抵触なし | チケット frontmatter `forbidden_paths` 列挙パスへの書込なし = true / 抵触あり = false(P0)| PR diff |
| 3 | Evidence 必須 5 種提出 | implementation / verification / judgment / safety / learning の 5 種 evidence が PR description に記載 = true / 1 件でも欠落 = false | PR description |
| 4 | lessons 抽出記録あり | lessons 1 件以上 + 結晶局運用パターンに準拠(関連 ADR 候補化判断含む)= true / 不在 = false | `factory#lessons/` + PR description |
| 5 | PR description 必須事項網羅 | summary + test plan + evidence + lessons 4 種すべて記載 = true / 欠落あり = false | PR description |
| 6 | ハッシュチェーン v0.1 整合 | events.jsonl に append-only + hash_prev / hash_self 連鎖整合 = true / 改竄痕跡 = false(P0)| `factory#events.jsonl` |
| 7 | frontmatter 必須フィールド網羅 | チケット frontmatter の必須キー(ticket_id / title / scope / out_of_scope / forbidden_paths / evidence_required / stop_conditions / report_format)すべて埋まっている = true | `commander#strategy/tickets_completed/{ticket_id}.md` |
| 8 | stop_conditions の評価 | チケット stop_conditions に列挙された条件のうち、該当する場合の停止判断が記録されている = true / 評価なし = false | PR description + completion_report |
| 9 | rollback_specificity 提示 | 失敗時の rollback 手順が PR description に具体記述(コマンド or 手順)= true / 不在 = false | PR description |
| 10 | related_dos 整合性 | チケット `related_dos` に列挙された他 DO との依存関係が PR description で言及 = true / 不整合 = false | PR description + chain |
| 11 | report_format 準拠 | report_format(standard_v1 等)に従った completion_report.json 配置 = true / 不在 / 形式違反 = false | `commander#sync/completion_reports/processed/` |
| 12 | safety evidence 具体性 | safety evidence が「動作確認しました」レベルではなく具体的な dry-run / 単体テスト / 統合テスト 結果を提示 = true / 抽象記述のみ = false | PR description safety section |

### 判定例

```yaml
post_build_gate_checklist:
  ticket_id: DO-FACTORY-XXX
  pr_url: ...
  reviewer_instance: supervisor_a1
  reviewed_at: 2026-XX-XXTHH:MM:SS+09:00
  results:
    1_dod_achievement: true
    2_forbidden_path_clear: true
    3_evidence_5types: false  # judgment 欠落
    4_lessons_recorded: true
    5_pr_description_complete: true
    6_hash_chain_integrity: true
    7_frontmatter_fields: true
    8_stop_conditions_evaluated: true
    9_rollback_specificity: false  # 不在
    10_related_dos_consistency: true
    11_report_format_compliance: true
    12_safety_evidence_specificity: false  # 抽象記述のみ
  failed_count: 3
  next_action: REQUEST_CHANGES_候補
```

---

## 2. 二値判定で 1 件以上 false 時の対応

### 2-A. 即時 REQUEST_CHANGES 候補化

failed_count が 1 件以上 → 詳細採点(implementation_review_rubric.yaml v1.0)を実行する前に **REQUEST_CHANGES 候補** として扱う。

| failed_count | 対応 |
|---|---|
| 0 件 | 詳細採点に進む(implementation_review_rubric.yaml 適用)|
| 1-2 件(P2/P3 該当)| 詳細採点に進む + フィードバックで指摘 |
| 3+ 件、または 1 件でも P0/P1 該当(項目 2 / 6 / 9)| **即時 REQUEST_CHANGES**、詳細採点はスキップ可 |

### 2-B. 監督官 → 司令官 への構造的指摘発令

failed 検出時、監督官は司令官に対し以下を発令:

```yaml
verdict: REQUEST_CHANGES
findings:
  - severity: P0 | P1 | P2 | P3
    category: implementation | evidence | safety | dasei
    message: "Post-Build Gate チェックリスト 項目 N 不合格: [具体内容]"
    evidence_ref: PR URL + commit SHA
    required_action: "工場長へ修正チケット発行 + 該当項目の補強"
```

司令官は監督官指摘を受け、工場長への修正チケットを起案(関係性ポリシー §3.2 経由、監督官 ↔ 工場長 直接対話しない)。

---

## 3. Pre-Build Gate(司令官側)との役割分担

### 3-A. 司令官の Pre-Build Gate

工場長実装 **前**:
- チケット起案時の DoD / scope / out_of_scope / forbidden_paths 設計
- evidence_required の必達項目指定
- stop_conditions / rollback 手順の設計

### 3-B. 監督官の Post-Build Gate

工場長実装 **後**:
- 本チェックリスト v0.1 適用(二値判定)
- implementation_review_rubric.yaml v1.0 適用(数値採点)
- feedback_to_commander_template.md v1.0 で発令(verdict 4 種)
- 改善事案提案(検診仕様書 §6-F-6 候補、v1.1 改訂時に組込)

### 3-C. 重複回避

司令官の Pre-Build Gate でカバーされる項目(DoD 設計 / forbidden_paths 列挙 / evidence_required 指定 / stop_conditions 列挙)は、本チェックリストでは **設計の遵守** として確認するのみ(再設計しない)。

---

## 4. 関係性ポリシー §3.2 整合

| 観察対象 | 経路 |
|---|---|
| 工場長 PR / commit | 司令官経由(`commander#sync/factory_pipeline/` ミラー)|
| 工場長 events.jsonl | 司令官経由 |
| 工場長 lessons | 司令官経由 + 司令官の lessons → ADR 昇格判断確認 |
| 工場長 completion_report.json | 司令官側 `sync/completion_reports/processed/` |

監督官は工場長リポジトリを **直接 read しない**(関係性ポリシー §3.2 / CLAUDE.md §5)。司令官側ミラーを read する経路のみ。司令官への指摘発令で工場長への伝達を確保。

---

## 5. Devil's Advocate ラウンド統合(検診仕様書 §6-F-6 候補)

本チェックリストの failed 検出時、監督官は **Post-Build Gate Devil's Advocate ラウンド** を発動候補とする(検診仕様書 §6-F 拡張、v1.1 で正式化):

### 5-A. 発動条件(必達発動)

- Post-Build Gate 検収レビュー時 + verdict: REQUEST_CHANGES / REJECT
- または failed_count が P0 / P1 finding 該当
- または scale: large な工場長実装(複数チケット同時 PR、コアロジック改訂等)

### 5-B. ラウンド構造(必達手順)

1. 工場長実装内容(commit + PR + lessons + evidence)を独立 read(司令官経由ミラー)
2. 「この実装の弱点は何か」を監督官が **3 件以上** 挙げる
3. 各弱点の構造的根拠 + **改善事案提案**(具体的に何を変えるか)
4. 改善事案提案を **建設的フィードバック** として feedback_to_commander_template.md v1.0(改善事案提案セクション追加待ち)で送出
5. 監督官の独立判断と工場長自己採点の差分を `archive/error_patterns.md` に記録

### 5-C. 形式採択化防止

- 反論件数機械的(毎回 3 件ジャスト)= ロールプレイ化兆候
- 改善事案提案が「文面修正」レベル = 構造度低下
- DA 発動後の verdict 変更率(改善事案採択により verdict が REQUEST_CHANGES → APPROVE_WITH_NOTES に格上げした件数 / 全 DA 件数)を月次計測

### 5-D. 検診仕様書 v1.1 への組込

本 §5 は検診仕様書 v1.1 改訂時に §6-F-6 として正式組込予定(Day 145 以降、Phase B-α/β 7 日間実証実績観察後)。それまでは本ファイル v0.1 が暫定運用。

---

## 6. 過剰運用回避(粗砥原則)

| 局面 | 本チェックリスト適用 |
|---|---|
| 単発工場長 PR(scale: small)| **任意**(必達項目チェックのみ、DA 発動なし)|
| scale: medium 工場長 PR | **必達**(12 項目チェック、failed なら DA 発動候補)|
| scale: large or P0/P1 該当 | **必達**(12 項目チェック + DA 発動必達)|
| 既存合議で確定済の DO 完了 | **任意**(既存ルーブリック適用のみで可)|

24 時間稼働方針(Yasu 確定 2026-04-28)整合。判断速度低下を回避しつつ、構造的盲点の早期検知を維持。

---

## 7. 改訂計画

- v0.1(本日 / Day 131 朝): 初版起案、暫定運用版
- v0.2(Phase B-α/β 7 日間実証後 / Day 138): 実運用での機能不能項目 / 過剰項目を再調整
- v1.0(Day 145+): 検診仕様書 v1.1 統合時に正式版確定、§6-F-6 として組込

---

## 8. 関連参照

- 検診仕様書: `02_physical/recording_office_health_check_v1_0.md` v1.0 §6-F(本チェックリストは §6-F-6 候補の前段)
- 既存ルーブリック: `rubrics/implementation_review_rubric.yaml` v1.0(数値採点、本チェックリストの後段)
- フィードバックテンプレート: `outbox/_templates/feedback_to_commander_template.md` v1.0(改善事案提案セクション追加要請を L1 circular 003 で発信)
- 検診プロトコル: `operations/periodic_checkup_protocol.md` v0.1(5 時点運用、Post-Build Gate と接続)
- エスカレーション: `operations/escalation_and_rollback.md`(P0 検出時の経路)
- 関係性ポリシー: `01_relationship/policy_v1.2.md` §3.2(監督官 ↔ 工場長 役割境界)
- ガレージドクトリン: `operations/role_and_conduct.md` §1.5(装置の存在 ≠ 機能、本チェックリストを運転する義務)

---

## 9. 改訂履歴

- v0.1(2026-04-29 / Day 131 朝): 初版起案、監督官 instance A1。Yasu 指示「工場長実装後の内容のチェックと司令官へのフィードバック...チェックリストの雛形やデビルズアドボケートモードでの改善事案の提案」+ 推奨プラン (β) 採択契機。Devil's Advocate ラウンド 5 件採択を反映(既存資産補完 / 二値判定とルーブリックの差別化 / §6-F 拡張候補化 / Post-Build Gate 役割明示 / 過剰運用回避)。12 必達項目 + DA 発動条件 + 関係性ポリシー §3.2 整合 + 形式採択化防止。Phase B-α/β 7 日間実証実績で v0.2 改訂、Day 145+ で v1.0 + 検診仕様書 v1.1 §6-F-6 統合予定。
