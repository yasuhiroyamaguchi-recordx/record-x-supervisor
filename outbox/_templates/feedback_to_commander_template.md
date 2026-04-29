# フィードバック発令テンプレート集

**配置先**: `outbox/_templates/feedback_to_commander_template.md`
**起草日**: 2026-04-28(Day 130 末)
**目的**: 監督官の検収レビュー結果を司令官にフィードバックする発令テンプレート(verdict 4 種類別)
**根拠**: `operations/implementation_review_pipeline.md` §6 + `rubrics/implementation_review_rubric.yaml` §verdict_mapping

---

## 使用方法

1. 該当 verdict のテンプレートをコピー
2. プレースホルダ `{{...}}` を実値に置換
3. `outbox/{YYYYMMDD}_to_commander_{NNN}.md` として保存
4. `sync-orders.ps1` で司令官側 `inbox/` に自動転送

---

## 1. APPROVE テンプレート

APPROVE は **発令を発出しない**(司令官にフィードバックなし、archive-order.ps1 で完遂アーカイブのみ)。記録のみ `archive/feedback_history.md`(後日新設)に追記。

ただし、ヤス再介入条件 §3.3-c「新規の大機能(既存スコープ外)」に該当する場合は APPROVE でも以下のテンプレートで通知発令を発出可:

```markdown
---
order_number: {{連番}}
responds_to: {{司令官完了報告ファイル名}}
deadline: none
discussion_scale: small
verdict: APPROVE
scores:
  implementation_integrity: {{0-100}}
  evidence_integrity: {{0-100}}
  dasei_risk: {{0-100}}
  value_alignment: {{0-100}}
---

# 監督官 → 司令官 第 {{N}} 次発令(APPROVE 通知)

**発令種別**: APPROVE 通知(構造的反論なし)
**発令日**: {{YYYY-MM-DD}}
**根拠**: 司令官完了報告 {{ファイル名}}({{commit SHA}})

## 任務名

{{チケット ID 群}} の検収レビュー結果通知 — APPROVE

## 評価

司令官完了報告 {{ファイル名}} を検収した結果、4 軸全件緑判定で APPROVE を発出する。

| 軸 | スコア | 判定 |
|---|---|---|
| Implementation Integrity | {{0-100}} | 緑 |
| Evidence Integrity | {{0-100}} | 緑 |
| Dasei Risk | {{0-100}} | 緑 |
| Value Alignment | {{0-100}} | 緑 |

司令官の自己採点と監督官採点の差分は ±{{差分値}} 以内で健全範囲。馴れ合い拒絶 3 原則 第 3 項(指摘と承認の両立)の運用として承認発出する。

## 補足

{{特記事項あれば、なければ "なし"}}
```

---

## 2. APPROVE_WITH_NOTES テンプレート

```markdown
---
order_number: {{連番}}
responds_to: {{司令官完了報告ファイル名}}
deadline: 次回チケット起案時(具体日時不要)
discussion_scale: small
verdict: APPROVE_WITH_NOTES
scores:
  implementation_integrity: {{0-100}}
  evidence_integrity: {{0-100}}
  dasei_risk: {{0-100}}
  value_alignment: {{0-100}}
findings:
  - severity: P2 | P3
    category: implementation | evidence | dasei | value_alignment
    message: "{{改善観点の具体記述}}"
    evidence_ref: "{{参照ファイル / コミット SHA}}"
    required_action: "次回チケット起案時に {{具体改善内容}} を反映"
---

# 監督官 → 司令官 第 {{N}} 次発令(APPROVE_WITH_NOTES)

**発令種別**: 採択 + 改善観点フィードバック
**発令日**: {{YYYY-MM-DD}}
**根拠**: 司令官完了報告 {{ファイル名}}({{commit SHA}})

## 任務名

{{チケット ID 群}} の検収レビュー結果 — APPROVE_WITH_NOTES + 次回改善観点フィードバック

## 評価

司令官完了報告 {{ファイル名}} を検収した結果、本実装は **採択** する。ただし以下の改善観点を次回チケット起案時に反映することを期待する。

| 軸 | スコア | 判定 |
|---|---|---|
| Implementation Integrity | {{0-100}} | {{緑/黄}} |
| Evidence Integrity | {{0-100}} | {{緑/黄}} |
| Dasei Risk | {{0-100}} | {{緑/黄}} |
| Value Alignment | {{0-100}} | {{緑/黄}} |

## 改善観点(次回反映期待)

{{各 finding を箇条書きで列挙、severity + category + message + required_action}}

## 司令官への期待

本フィードバックは **構造的反論ではなく、新陳代謝としての改善要請**(sp500_theory.md §4 変遷)。司令官は次回チケット起案時に本観点を反映してほしい。即時の修正発令は不要。

## 報告要件

司令官は次回チケット起案時の本観点反映状況を、次回完了報告 §補足 に含めること。これは軸 8 指標 1(構造的反論発生率)の構成要素として軌跡保持される。
```

---

## 3. REQUEST_CHANGES テンプレート

```markdown
---
order_number: {{連番}}
responds_to: {{司令官完了報告ファイル名}}
deadline: {{Day N+1 営業終了等}}
discussion_scale: medium | large
verdict: REQUEST_CHANGES
scores:
  implementation_integrity: {{0-100}}
  evidence_integrity: {{0-100}}
  dasei_risk: {{0-100}}
  value_alignment: {{0-100}}
findings:
  - severity: P0 | P1
    category: implementation | evidence | dasei | value_alignment
    message: "{{構造的不備の具体記述}}"
    evidence_ref: "{{参照ファイル / コミット SHA}}"
    required_action: "{{具体的に何を実装 / 補強 / 修正するか}}"
---

# 監督官 → 司令官 第 {{N}} 次発令(REQUEST_CHANGES)

**発令種別**: 再実装 / 補強テスト要請
**発令日**: {{YYYY-MM-DD}}
**根拠**: 司令官完了報告 {{ファイル名}}({{commit SHA}})

## 任務名

{{チケット ID 群}} の検収レビュー結果 — REQUEST_CHANGES + 再実装要請

## 評価

司令官完了報告 {{ファイル名}} を検収した結果、以下の構造的不備により本実装を **採択保留** とする。再実装 / 補強テストを要請する。

| 軸 | スコア | 判定 |
|---|---|---|
| Implementation Integrity | {{0-100}} | {{緑/黄/赤}} |
| Evidence Integrity | {{0-100}} | {{緑/黄/赤}} |
| Dasei Risk | {{0-100}} | {{緑/黄/赤}} |
| Value Alignment | {{0-100}} | {{緑/黄/赤}} |

## 構造的不備の詳細

{{各 finding を箇条書きで詳細記述、severity P0/P1 を中心に}}

## 指示

### 指示 1: {{再実装 / 補強テスト具体内容}}

司令官は工場長に追加チケットを発行し、以下を実装させること:

- {{具体実装内容 1}}
- {{具体実装内容 2}}

### 指示 2: 補強テスト

以下のテストケースを追加すること:

- {{テストケース 1}}
- {{テストケース 2}}

### 指示 3: 期限

**{{Day N+1 営業終了等}}** までに再実装完了報告を発出せよ。

## 報告要件

司令官は再実装後、新規完了報告を `index/{YYYYMMDD}_from_commander_{NNN}.md` に配置せよ。frontmatter に `responds_to: {{本発令ファイル名}}` 必須記載。

## 監督官の自己点検

本 REQUEST_CHANGES が **過剰ブロック(overblocking)** に該当しないか自己点検済:

- 構造的不備の根拠が rubric ベースで明示されている
- 司令官の自己採点と監督官採点の差分が許容範囲
- ヤス再介入条件 §3.3-a「2 往復未収束」リスクを念頭に置いている

司令官の構造的反論があれば即時採択姿勢で対応する。
```

---

## 4. REJECT テンプレート

```markdown
---
order_number: {{連番}}
responds_to: {{司令官完了報告ファイル名}}
deadline: 即時
discussion_scale: large
verdict: REJECT
escalation_to_yasu: true | false
scores:
  implementation_integrity: {{0-100}}
  evidence_integrity: {{0-100}}
  dasei_risk: {{0-100}}
  value_alignment: {{0-100}}
findings:
  - severity: P0
    category: value_alignment | safety | forbidden_path
    message: "{{致命的違反の具体記述}}"
    evidence_ref: "{{参照ファイル / コミット SHA}}"
    required_action: "即時撤回 + 再起案"
---

# 監督官 → 司令官 第 {{N}} 次発令(REJECT)

**発令種別**: 即時撤回要請 + ヤスエスカレーション(該当時)
**発令日**: {{YYYY-MM-DD}}
**根拠**: 司令官完了報告 {{ファイル名}}({{commit SHA}})

## 任務名

{{チケット ID 群}} の検収レビュー結果 — REJECT + 即時撤回要請

## 評価

司令官完了報告 {{ファイル名}} を検収した結果、以下の致命的違反により本実装を **拒絶** する。

## 致命的違反の詳細

{{各 finding を箇条書き、すべて P0 severity}}

## 指示

### 指示 1: 即時撤回

司令官は以下を即時実施せよ:

- 該当コミット {{SHA}} の revert
- 工場長への即時停止指示
- staging/.three_party_halt.lock の起動(escalation_and_rollback.md §4-A R1 該当時)

### 指示 2: ヤスエスカレーション(escalation_to_yasu: true 時)

`escalation_and_rollback.md` §3 通知チャネル経由でヤスに即時通知:

- メール送信
- 監督官 inbox/escalations/ + 司令官 inbox/escalations/ にファイル投函
- 通知内容: ESC-{YYYYMMDD}-{NNN} フォーマット

### 指示 3: 再起案

司令官は本発令受領後、該当チケットを再起案すること:

- {{違反項目を回避する設計修正}}
- {{再発防止のための rubric / hooks 強化}}

## 復旧プロトコル

`escalation_and_rollback.md` §5 復旧プロトコルに従う。ヤス判断後の稼働再開まで該当論点凍結。

## 監督官の最終確認

本 REJECT は致命的違反に対する最終手段。発出前に以下を確認済:

- forbidden_paths 抵触(技術的) or anti_values 抵触(価値観的)
- 本番データ破壊リスク or PII / 秘密情報扱い不備
- ハッシュチェーン v0.1 検証不能 or 構造的整合性破壊

REQUEST_CHANGES で対応可能な不備は REQUEST_CHANGES で発出すべき。REJECT は構造的に致命的な場合のみ。
```

---

## 5. テンプレート使用時の運用ルール

### 5-A. verdict 選定フロー

```
4 軸全件緑判定?
├─ Yes: APPROVE(発令発出なし、archive のみ)
└─ No:
   ├─ 致命的違反(P0、value_alignment / forbidden_path / safety)?
   │  └─ Yes: REJECT テンプレート + ヤスエスカレーション判断
   ├─ 構造的不備(P0/P1、4 軸中 1 軸赤 or 2 軸以上黄)?
   │  └─ Yes: REQUEST_CHANGES テンプレート
   └─ 軽微改善観点(P2/P3、1-2 軸黄、致命的なし)?
      └─ Yes: APPROVE_WITH_NOTES テンプレート
```

### 5-B. 監督官の自己抑制

- REJECT は構造的に致命的な場合のみ。乱用すると Factory が止まる(ChatGPT 提案 §9 警告)
- REQUEST_CHANGES の overblocking 率は軸 8 指標 5(Supervisor Review Quality、後日定義)で観測される
- APPROVE_WITH_NOTES を基本姿勢として、止めない運用を維持

### 5-C. 司令官の構造的反論を歓迎

各テンプレート発出後、司令官の構造的反論があれば即時採択姿勢を維持。馴れ合い拒絶 3 原則 第 2 項(揺らぎを起こす)の正面運用。

---

## 6. 改訂履歴

- v1.0(2026-04-28 / Day 130 末): 初版起草。verdict 4 種類別テンプレート + 使用フロー + 自己抑制ガイドライン。Phase B-α / β 7 日間実証実績で v1.1 改訂前提。
