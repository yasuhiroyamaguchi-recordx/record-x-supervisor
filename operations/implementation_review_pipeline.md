# Implementation Review Pipeline — 工場長実装の監督官検収レビュー仕様

**配置先**: `operations/implementation_review_pipeline.md`
**起草日**: 2026-04-28(Day 130 末、本リポジトリ初稼働セッション)
**目的**: 工場長 → 司令官完了報告 → 監督官検収 → フィードバック発令 の Post-Build Gate 経路仕様
**根拠**: 第 14 次発令 §指示 1 連続パイプライン統合 + ヤス連続パイプライン指示 + ChatGPT 提案採択統合(Post-Build Gate 概念)

---

## 1. 本書の位置づけ

本書は **連続稼働パイプラインの Post-Build Gate** を定義する。司令官が工場長の実装報告を受領後、その完了報告を監督官が検収レビューする経路と判定基準を明文化する。

関係性ポリシー v1.2 §3.2:**監督官は工場長と直接対話しない**(司令官経由のみ)。本書はこの原則を維持しつつ、監督官が司令官完了報告を介して工場長実装を間接観測する仕組みを定義する。

本書は新陳代謝対象。Phase B-α / β 起動 7 日間実証実績で v1.1 改訂前提。

---

## 2. パイプライン全体図

```
[工場長 Layer 1]                [司令官 Layer 2]                [監督官 Layer 0]
実装 → テスト → PR → マージ
   ↓
completion_reports/{YYYYMMDD}/DO-XXX_completion.json
   ↓ 司令官 pull-completion-reports.ps1
                                完了報告受領
                                完了アーカイブ(complete-ticket.ps1)
                                  ↓
                                司令官完了報告作成
                                  ↓ index/{YYYYMMDD}_from_commander_{NNN}.md
                                  ↓ git commit
                                                                  ↓ pull-replies.ps1
                                                                受領 + Post-Build Gate
                                                                  ↓
                                                                review-implementation.ps1
                                                                  ↓
                                                                rubric ベース自動スコアリング
                                                                  ↓
                                                                verdict 提案(監督官最終判断)
                                                                  ↓
                                                                ┌─ APPROVE → archive-order.ps1
                                                                ├─ APPROVE_WITH_NOTES → 第 N 次発令(改善観点)
                                                                ├─ REQUEST_CHANGES → 第 N 次発令(再実装要請)
                                                                └─ REJECT → 即時撤回 + 司令官に再起案要請
                                  ↑
                                次チケット起案へフィードバック反映
```

これにより **ヤス介入なしの連続フィードバックループ** が成立する。

---

## 3. 司令官完了報告のフォーマット

監督官が機械可読で検収するため、司令官完了報告は以下の構造を必須とする:

### 3-A. frontmatter 必須フィールド

```yaml
---
responds_to: <発令ファイル名>(あれば)
order_number: <発令番号>(あれば)
response_number: <応答連番>
deadline: <発令期限>(あれば)
discussion_scale: small | medium | large

# 完了報告固有フィールド(本書で新規定義)
report_type: implementation_completion
implementation:
  ticket_ids: ["DO-COMMANDER-XXX", ...]
  commits:
    - sha: "abc1234"
      message: "..."
      files_changed: 3
  pr_urls: ["https://github.com/..."]
  merged: true | false
  test_results:
    passed: 12
    failed: 0
    skipped: 1
  evidence_refs:
    - "sync/completion_reports/.../DO-XXX_completion.json"
    - "logs/layer1/..."
  dod_achieved: true | false
  scope_drift_detected: false
  forbidden_path_violation: false
  rollback_plan: "..."
  capability_acquired: ["..."]  # Dasei Risk 観点
  lessons: ["..."]

# 監督官検収用自己採点(司令官による事前自己評価)
self_scores:
  implementation_integrity: 0-100
  evidence_integrity: 0-100
  dasei_risk: 0-100
  value_alignment: 0-100
self_verdict: APPROVE | APPROVE_WITH_NOTES | REQUEST_CHANGES | REJECT
---
```

### 3-B. 本文必須セクション

| セクション | 内容 |
|---|---|
| 完了サマリ | 実装したチケット ID + 主な変更点 + 完了時刻 |
| 実装詳細 | コミット SHA + 差分概要 + 主要変更ファイル |
| テスト結果 | passed/failed/skipped + テスト実行コマンド + ログリンク |
| DoD 達成証拠 | 各 DoD 項目に対する検証結果 |
| evidence 一覧 | 再現可能な証跡へのリンク(JSON / log / コミット) |
| 構造的反論 / 提案 | 司令官の自己採点 verdict が REQUEST_CHANGES / REJECT 場合の説明、または P5 以降の追加提案 |

### 3-C. 司令官の自己採点責務

司令官は **完了報告に自己採点 verdict を必須記載** する。これは:

- 馴れ合い拒絶 3 原則 第 2 項(自分の側に揺らぎを起こす)の正面運用
- 監督官検収の前段階として、司令官自身による Pre-Submission チェック
- 自己採点と監督官採点の差分が軸 8 指標 2(採択率)の構成要素

司令官が自己採点で `REQUEST_CHANGES` 以下を出した場合、本来は完了報告ではなく追加実装が必要。例外: scope 範囲を満たしているが追加観点を残している場合は `APPROVE_WITH_NOTES` で送出可。

---

## 4. 監督官検収レビューのスコアリング 4 軸

`rubrics/implementation_review_rubric.yaml` で詳細定義。本書では概要のみ:

### 4-A. Implementation Integrity(実装完整性)

- 仕様(チケット)と実装の一致度
- 差分が scope 内に収まっているか
- forbidden_paths 抵触なし
- テスト実行 + 全件 pass(または skipped に正当理由)
- 余計な変更が混入していないか

### 4-B. Evidence Integrity(証跡完整性)

- DoD 各項目の検証証拠が再現可能
- evidence_refs がリンク切れなし
- rollback プランが具体的
- ハッシュチェーン v0.1 必須化(物理層 v1.0-FINAL §V05)準拠

### 4-C. Dasei Risk(惰性リスク)

`rubrics/dasei_detection_rubric.yaml` v1.0(本日確定)準拠:

- 類似チケット率 / 低インパクト作業率 / 戦略接続欠落率 / 新規能力獲得なし率 / リスク回避傾向

### 4-D. Value Alignment(価値観整合)

- 哲学層(`00_origin/unnamed.md` + `sp500_theory.md`)との整合
- 関係性ポリシー v1.2 馴れ合い拒絶 3 原則違反なし
- north_star(将来 `rubrics/value_alignment_rubric.yaml` で定義)整合

---

## 5. verdict 4 種類とアクション

| verdict | 条件(目安) | アクション |
|---|---|---|
| **APPROVE** | 4 軸全件緑(各 ≥80) | `archive-order.ps1` で完遂アーカイブ + 次サイクル進行、司令官にフィードバックなし |
| **APPROVE_WITH_NOTES** | 4 軸中 1-2 軸黄(各 60-79)、致命的問題なし | 次回チケット起案時の改善観点として第 N 次発令で司令官にフィードバック |
| **REQUEST_CHANGES** | 4 軸中 1 軸赤(各 <60)or 2 軸以上黄、構造的不備あり | 第 N 次発令で再実装 / 補強テスト要請、司令官は工場長に追加チケット発行 |
| **REJECT** | Value Alignment 抵触 / forbidden_paths 違反 / 本番データ破壊リスク / PII 扱い不備 | 即時撤回 + 司令官に再起案要請、必要に応じてヤスエスカレーション(escalation_and_rollback.md R4-R5) |

verdict は監督官が **手動セッション** で最終判断する。`review-implementation.ps1` は提案 verdict + 各軸スコアを出力するが、最終判断は監督官が承認(distilled §5 自己保全バイアス警戒、Phase B-γ までは Layer 0 自動化を保留)。

---

## 6. フィードバック発令の構造

監督官が APPROVE_WITH_NOTES / REQUEST_CHANGES / REJECT を発出する際の発令フォーマットは `outbox/_templates/feedback_to_commander_template.md` 参照。

frontmatter 必須:

```yaml
---
order_number: <連番>
responds_to: <司令官完了報告ファイル名>
deadline: <要請期限>
discussion_scale: small | medium | large
verdict: APPROVE_WITH_NOTES | REQUEST_CHANGES | REJECT
scores:
  implementation_integrity: 0-100
  evidence_integrity: 0-100
  dasei_risk: 0-100
  value_alignment: 0-100
findings:
  - severity: P0 | P1 | P2 | P3
    category: implementation | evidence | dasei | value_alignment
    message: "..."
    evidence_ref: "..."
    required_action: "..."
---
```

---

## 7. 連続稼働時の運用パターン

### 7-A. Phase B-α / β 同時起動(Day 132)

監督官 Layer 0 6 時間サイクル(司令官と同期)で以下を自動実行:

```
1. pull-replies.ps1 で司令官完了報告を取込
2. review-implementation.ps1 で自動スコアリング
3. 提案 verdict が APPROVE 以外なら、監督官手動セッションを Trigger(通知)
4. ヤス通知(エスカレーション基準該当時、escalation_and_rollback.md §2)
```

### 7-B. 監督官手動介入のタイミング

- 提案 verdict が APPROVE 以外
- スコアが赤判定(<60)
- 軸 8 黄/赤判定発火
- ヤス再介入条件 §3.3-a 該当(同論点 2 往復未収束)

### 7-C. 監督官完全自動化(Phase B-γ 以降)

ADR-005 v1.1 段階遷移で Phase B-γ 起動後、軸 8 + Dasei Risk 緑判定継続なら、APPROVE_WITH_NOTES までは Layer 0 自動発令許容。REQUEST_CHANGES / REJECT は引き続き監督官手動セッションで確認(変質予兆の最終防衛線)。

---

## 8. 関係性ポリシー v1.2 §3.2 との整合性

監督官は工場長と直接対話しない。本書はこの原則を以下で維持:

- 監督官は **司令官完了報告のみ** を読む(工場長 PR / commit を直接読まない)
- 司令官完了報告に必要な情報(コミット SHA / 差分概要 / テスト結果 / evidence)が含まれる前提
- フィードバックは司令官に発出 → 司令官が工場長への追加チケット発行で展開

ただし、監督官が司令官完了報告から間接的にコミット SHA + commander/main を `git show` する読取アクセスは許容(本リポジトリ初稼働セッションで実証済の運用)。これは「読み取り = 観察」であり「対話 = 双方向コミュニケーション」とは別軸。

---

## 9. 改訂履歴

- v1.0(2026-04-28 / Day 130 末): 初版起草。Post-Build Gate 仕様確立、4 軸スコアリング + verdict 4 種類 + フィードバック発令テンプレート参照 + Phase B-α 起動運用パターン定義。Phase B-α / β 7 日間実証実績で v1.1 改訂前提。
