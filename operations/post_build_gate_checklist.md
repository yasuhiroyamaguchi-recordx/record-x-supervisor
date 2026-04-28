# Post-Build Gate チェックリスト v0.2

**配置先**: `operations/post_build_gate_checklist.md`
**起案日**: 2026-04-29(Day 131 朝)
**v0.2 改訂日**: 2026-04-29(Day 131 朝、同日内)
**起案者**: 監督官 instance A1
**目的**: 工場長実装後の **必達項目漏れ確認**(重要度別重み付け + 部分点)+ **個別フィードバック発令前の品質ゲート閾値判定**(馴れ合いにならないフィードバックの機械的保証)+ ルーブリック適用前の前検査
**根拠**:
- ヤス指示「工場長実装後の内容のチェックと司令官へのフィードバックについて、チェックリストの雛形やデビルズアドボケートモードでの改善事案の提案があるといいのかな」(2026-04-29 朝)
- **ヤス追加指示「閾値判定で、馴れ合いにならないようなフィードバックが必要」(2026-04-29 朝、v0.2 契機)**
- 推奨プラン (β) ヤス確定(v0.1)+ 推奨プラン (α) ヤス確定(v0.2)
- Devil's Advocate ラウンド 5+5 件採択結果(本起案前に監督官 A1 が実施)
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

## 1. 必達項目チェック(12 項目、重要度別重み付け + 部分点、v0.2 改訂)

工場長実装(PR / commit / lessons)に対し、以下 12 項目を **重要度別 + 部分点(0 / 0.5 / 1)** で採点。各項目に **P0 / P1 / P2 / P3** の重要度ランクを付与。

| # | 項目 | 重要度 | 配点 | 判定基準 | データソース |
|---|---|---|---|---|---|
| 1 | DoD 完全達成 | **P1** | 1.0 / 部分 0.5 / 未達 0 | 該当チケットの DoD すべて達成 / 部分達成 / 未達 | `commander#strategy/tickets_completed/` + PR description |
| 2 | **Forbidden Path 抵触なし** | **P0** | 1.0(違反 = 即時 0)| チケット frontmatter `forbidden_paths` 列挙パスへの書込なし = 1.0、抵触 1 件でも = 0 | PR diff |
| 3 | Evidence 必須 5 種提出 | **P1** | 5 種揃 1.0 / 4 種 0.7 / 3 種 0.4 / 2 種以下 0 | implementation / verification / judgment / safety / learning | PR description |
| 4 | lessons 抽出記録あり | **P2** | 1.0 / 部分 0.5 / 0 | lessons 1 件以上 + 結晶局運用パターン準拠 | `factory#lessons/` + PR description |
| 5 | PR description 必須事項網羅 | **P2** | 4 種揃 1.0 / 3 種 0.7 / 2 種以下 0 | summary + test plan + evidence + lessons | PR description |
| 6 | **ハッシュチェーン v0.1 整合** | **P0** | 1.0(改竄 = 即時 0)| events.jsonl append-only + hash_prev/self 連鎖整合 | `factory#events.jsonl` |
| 7 | frontmatter 必須フィールド網羅 | **P2** | 全網羅 1.0 / 1 件欠落 0.7 / 2 件以上欠落 0 | ticket_id / title / scope / out_of_scope / forbidden_paths / evidence_required / stop_conditions / report_format | チケット |
| 8 | stop_conditions の評価 | **P2** | 1.0 / 部分 0.5 / 0 | 該当条件の停止判断が記録 | PR description + completion_report |
| 9 | **rollback_specificity 提示** | **P1** | 1.0(不在 = 0)| 失敗時の rollback 手順が PR description に具体記述 | PR description |
| 10 | related_dos 整合性 | **P3** | 1.0 / 部分 0.5 / 0 | `related_dos` 列挙他 DO との依存関係が PR description で言及 | PR description |
| 11 | report_format 準拠 | **P2** | 1.0(不在 / 形式違反 = 0)| report_format(standard_v1 等)準拠の completion_report.json 配置 | `commander#sync/completion_reports/processed/` |
| 12 | safety evidence 具体性 | **P1** | 1.0 / 抽象記述のみ 0 | dry-run / 単体テスト / 統合テスト 結果提示 | PR description safety section |

### 1-A. 合計スコア計算

```
重要度別重み: P0 = 3.0、P1 = 2.0、P2 = 1.0、P3 = 0.5

各項目スコア = 配点(0 / 0.5 / 1.0)× 重要度重み
合計スコア = Σ(各項目スコア)
最大スコア = (P0×2 + P1×4 + P2×5 + P3×1) = 6 + 8 + 5 + 0.5 = 19.5
スコア率 = 合計 / 19.5 × 100
```

| スコア率 | 判定 | 次アクション |
|---|---|---|
| 95-100% | 緑 | 詳細採点(implementation_review_rubric)に進む |
| 80-94% | 黄(軽微不備)| 詳細採点 + APPROVE_WITH_NOTES 候補 |
| 60-79% | 黄上位(中度不備)| **REQUEST_CHANGES 候補**(詳細採点で確定)|
| <60% | 赤(重度不備)| **即時 REQUEST_CHANGES**(詳細採点スキップ可)|
| **P0 違反 1 件以上** | **即時 REJECT**(構造的破壊) | 緊急停止 + ヤスエスカレーション |

### 1-B. 判定例

```yaml
post_build_gate_checklist:
  ticket_id: DO-FACTORY-XXX
  pr_url: ...
  reviewer_instance: supervisor_a1
  reviewed_at: 2026-XX-XXTHH:MM:SS+09:00
  results:
    1_dod_achievement: 0.5         # P1, 部分達成 → 0.5 × 2.0 = 1.0
    2_forbidden_path_clear: 1.0    # P0, 抵触なし → 1.0 × 3.0 = 3.0
    3_evidence_5types: 0.7         # P1, 4 種(judgment 欠落)→ 0.7 × 2.0 = 1.4
    4_lessons_recorded: 1.0        # P2 → 1.0 × 1.0 = 1.0
    5_pr_description_complete: 1.0 # P2 → 1.0
    6_hash_chain_integrity: 1.0    # P0 → 3.0
    7_frontmatter_fields: 1.0      # P2 → 1.0
    8_stop_conditions_evaluated: 0.5  # P2 → 0.5
    9_rollback_specificity: 0      # P1, 不在 → 0
    10_related_dos_consistency: 1.0   # P3 → 0.5
    11_report_format_compliance: 1.0  # P2 → 1.0
    12_safety_evidence_specificity: 0 # P1, 抽象記述 → 0
  total_score: 14.4
  max_score: 19.5
  score_pct: 73.8
  judgment: 黄上位(中度不備)
  next_action: REQUEST_CHANGES 候補
  p0_violations: 0
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

## 6. 個別フィードバック発令前の品質ゲート閾値判定(v0.2 新設、馴れ合いにならないフィードバックの機械的保証)

ヤス指示「閾値判定で、馴れ合いにならないようなフィードバックが必要」(2026-04-29 朝)への正面実装。

各 verdict 発令前に以下 6 軸の閾値チェックを必達。1 軸でも赤判定 = **発令禁止 + EVT 起案**。

### 6-A. 6 軸閾値判定

| 軸 | 内容 | 緑(発令許可) | 黄(再起案推奨) | 赤(発令禁止 + EVT 起案) |
|---|---|---|---|---|
| **A. 構造的反論件数**(REQUEST_CHANGES / REJECT 時)| findings 中の構造的指摘件数 | 3+ 件 | 1-2 件 | **0 件**(発令意図と内容の乖離)|
| **B. 改善事案提案件数**(REQUEST_CHANGES / REJECT 時)| DA ラウンド由来の構造的代替案件数 | 3+ 件構造的代替案 | 1-2 件 or 文面修正レベル | **0 件**(批判のみで建設性なし)|
| **C. APPROVE 連続発出**(直近 7 件)| 直近 7 件の verdict のうち APPROVE 件数 | 0-3 件 | 4-6 件 | **7+ 件(馴れ合い兆候 = 過小ブロッキング)** |
| **D. 構造的反論なし発令率**(直近 28 サイクル)| findings 0 件 or P3 のみの発令率 | 30-70% | 71-89% | **90%+(過剰追認 = 形式採択化)** |
| **E. DA ラウンド実施率**(scale: medium 以上)| Devil's Advocate ラウンド実施件数 / 該当発令総数 | 100%(必達)| 80-99% | **<80%(能動装置の機能不全)** |
| **F. 形式採択化検知**(個別発令単位)| DA ラウンドの反論が機械的・文面修正レベル | 検知なし | 軽微 | **機械的反論 3 件連続** |

### 6-B. 計測式と閾値定義

```yaml
threshold_gates:
  A_structural_objection_count:
    applicable: verdict in [REQUEST_CHANGES, REJECT]
    measure: count of findings where severity >= P2
    green: ">=3"
    yellow: "1-2"
    red: "0"

  B_improvement_proposal_count:
    applicable: verdict in [REQUEST_CHANGES, REJECT]
    measure: count of structural alternatives in DA round
    structural_alternative_definition: "design change | algorithm replacement | data flow redesign | new evaluation axis"
    excluded: "wording fixes | typo | reference path corrections"
    green: ">=3"
    yellow: "1-2"
    red: "0"

  C_approve_streak:
    applicable: all verdicts
    measure: count of APPROVE in last 7 outbox/*.md
    green: "0-3"
    yellow: "4-6"
    red: ">=7"

  D_no_objection_rate:
    applicable: all verdicts
    measure: count(findings empty or P3 only) / 28 in last 28 cycles
    green: "30-70%"
    yellow: "71-89%"
    red: ">=90%"

  E_da_activation_rate:
    applicable: scale in [medium, large]
    measure: count(DA round performed) / count(scale >= medium and verdict in [APPROVE, REQUEST_CHANGES, REJECT])
    green: "100%"
    yellow: "80-99%"
    red: "<80%"

  F_formal_acceptance_detection:
    applicable: per individual feedback
    signals:
      - DA weakness count exactly 3 (machine-uniform, ロールプレイ化兆候)
      - All weaknesses at "wording fix" level (not structural)
      - All immediate_adoption_decision = "retain_with_grounding" (no withdraw / revise)
    green: "no signals detected"
    yellow: "1 signal"
    red: "3 consecutive feedbacks with detection"
```

### 6-C. 過剰過小両極の検知

本閾値は **過小ブロッキング(馴れ合い)** + **過剰ブロッキング(攻撃過多)** の両極を検知:

| 兆候 | 該当軸 | 解釈 |
|---|---|---|
| 過小ブロッキング(馴れ合い)| C / D 赤 | APPROVE 連発、構造的反論なし = 「相手を尊重する」が「相手に同意する」に変質(関係性ポリシー §1 違反)|
| 過剰ブロッキング(攻撃過多)| C 緑 + REQUEST_CHANGES 50%+ | 構造的反論ありすぎ = 司令官 α リソース過剰消費(検診仕様書 §6-D §6-E 整合)|
| 形式採択化(機械化)| E 緑 + F 赤 | DA 装置が形式運用、本気度欠如 |
| 自己保全バイアス | A / B 赤 | 批判をしないか、批判しても代替案なし(distilled §5)|

### 6-D. 哲学的根拠

本閾値判定の根拠は:

- 関係性ポリシー v1.2 馴れ合い拒絶 3 原則 第 1 項「常に相手を尊重する」+ 第 3 項「誠実に指摘し、承認する」
- 検診仕様書 v1.0 §0「ドリフト警戒」+ §6-D「鬼コーチモードのデフォルト維持」
- distilled §5「自己保全バイアス警戒」+ §違反検知 5 問
- sp500_theory.md §1「指数を算出する運動」(運動性 = 構造的反論の継続 + 即時採択 + 承認発出 三位一体)

「馴れ合いにならない」は単に攻撃的になることではなく、**相手を高める構造的反論 + 即時採択 + 承認** の三位一体を機械的に保証する。

---

## 7. 閾値不合格時の発令経路(v0.2 新設)

### 7-A. 自動運用時(Layer 0 / Layer 2 自律巡回内)

発令を outbox に書く **前** に閾値チェック:

```powershell
# Layer 0 entry_point.ps1 内 (将来統合候補)
$thresholdResult = Test-FeedbackQualityGates -Verdict $proposedVerdict -Findings $findings -DaRound $daRound

if ($thresholdResult.AnyRed) {
    # 赤判定 = 発令禁止 + draft フォルダ保留
    $draftPath = "outbox/_drafts_pending_review/$timestamp_$verdict.md"
    Save-Draft -Path $draftPath -Content $proposedFeedback
    Add-EvtRecord -Severity yellow -Category audit_overblock_or_underblock -Trigger "threshold_gate_red:$($thresholdResult.RedAxes -join ',')"
    Convene-SupervisorManualSession -Reason "threshold gate failure"
    return
}

if ($thresholdResult.AnyYellow) {
    # 黄判定 = 警告 + 監督官手動確認
    Write-Warning "Threshold gates yellow: $($thresholdResult.YellowAxes -join ',')"
    if ($AutoMode) {
        Save-Draft -Path "outbox/_drafts_pending_review/" -Content $proposedFeedback
    }
}

# 緑判定 = 発令許可
Save-Outbox -Content $proposedFeedback
```

### 7-B. 手動運用時(本セッション + 監督官手動セッション)

監督官は発令前に閾値チェック表を内的に確認:

| 軸 | 該当値 | 判定 |
|---|---|---|
| A. 構造的反論件数 | (記入)| 緑/黄/赤 |
| B. 改善事案提案件数 | (記入)| 緑/黄/赤 |
| C. APPROVE 連続発出 | (記入)| 緑/黄/赤 |
| D. 構造的反論なし発令率 | (記入)| 緑/黄/赤 |
| E. DA ラウンド実施率 | (記入)| 緑/黄/赤 |
| F. 形式採択化検知 | (記入)| 緑/黄/赤 |

赤判定 1 件以上 → 発令を保留、再起案 or 撤回判断。

### 7-C. 保留 draft の処理

`outbox/_drafts_pending_review/` 配下の保留 draft は:

- 監督官手動セッションで個別 review
- 構造的反論補強 / 改善事案再起案 / verdict 見直し
- 再起案後に再度閾値チェック → 緑なら正式 outbox/ に移動

長期滞留(7 日以上)の draft は **撤回扱い**(史実保持で `_drafts_pending_review/_withdrawn/` に移動)。

---

## 8. 過剰運用回避(粗砥原則)

| 局面 | 本チェックリスト適用 |
|---|---|
| 単発工場長 PR(scale: small)| **任意**(必達項目チェックのみ、DA 発動なし)|
| scale: medium 工場長 PR | **必達**(12 項目チェック、failed なら DA 発動候補)|
| scale: large or P0/P1 該当 | **必達**(12 項目チェック + DA 発動必達)|
| 既存合議で確定済の DO 完了 | **任意**(既存ルーブリック適用のみで可)|

24 時間稼働方針(Yasu 確定 2026-04-28)整合。判断速度低下を回避しつつ、構造的盲点の早期検知を維持。

---

## 9. 改訂計画

- v0.1(本日 / Day 131 朝): 初版起案、暫定運用版
- v0.2(Phase B-α/β 7 日間実証後 / Day 138): 実運用での機能不能項目 / 過剰項目を再調整
- v1.0(Day 145+): 検診仕様書 v1.1 統合時に正式版確定、§6-F-6 として組込

---

## 10. 関連参照

- 検診仕様書: `02_physical/recording_office_health_check_v1_0.md` v1.0 §6-F(本チェックリストは §6-F-6 候補の前段)
- 既存ルーブリック: `rubrics/implementation_review_rubric.yaml` v1.0(数値採点、本チェックリストの後段)
- フィードバックテンプレート: `outbox/_templates/feedback_to_commander_template.md` v1.0(改善事案提案セクション追加要請を L1 circular 003 で発信)
- 検診プロトコル: `operations/periodic_checkup_protocol.md` v0.1(5 時点運用、Post-Build Gate と接続)
- エスカレーション: `operations/escalation_and_rollback.md`(P0 検出時の経路)
- 関係性ポリシー: `01_relationship/policy_v1.2.md` §3.2(監督官 ↔ 工場長 役割境界)
- ガレージドクトリン: `operations/role_and_conduct.md` §1.5(装置の存在 ≠ 機能、本チェックリストを運転する義務)

---

## 11. 改訂履歴

- v0.1(2026-04-29 / Day 131 朝): 初版起案、監督官 instance A1。Yasu 指示「工場長実装後の内容のチェックと司令官へのフィードバック...チェックリストの雛形やデビルズアドボケートモードでの改善事案の提案」+ 推奨プラン (β) 採択契機。Devil's Advocate ラウンド 5 件採択を反映(既存資産補完 / 二値判定とルーブリックの差別化 / §6-F 拡張候補化 / Post-Build Gate 役割明示 / 過剰運用回避)。12 必達項目 + DA 発動条件 + 関係性ポリシー §3.2 整合 + 形式採択化防止。
- **v0.2**(2026-04-29 / Day 131 朝、同日内): Yasu 追加指示「閾値判定で、馴れ合いにならないようなフィードバックが必要」+ 推奨プラン (α) 採択契機。Devil's Advocate ラウンド 5 件採択を反映(二値判定→閾値判定二段構え化 / 既存資産結合 / 個別フィードバック発令前ゲート追加 / 実体提示 + 不足明示 / 重要度別 + 部分点導入)。3 大改訂:(1) §1 12 項目を **重要度別重み付け P0-P3 + 部分点(0/0.5/1)** に改訂、合計スコア計算式 + スコア率 4 段階判定 + P0 違反即時 REJECT 規則、(2) §6 新設「個別フィードバック発令前の品質ゲート閾値判定」= 6 軸閾値(構造的反論件数 / 改善事案提案件数 / APPROVE 連続発出 / 構造的反論なし発令率 / DA ラウンド実施率 / 形式採択化検知)+ 過剰過小両極の検知 + 哲学的根拠、(3) §7 新設「閾値不合格時の発令経路」= 自動運用時の `_drafts_pending_review/` 保留 + 手動運用時の閾値チェック表 + 保留 draft 7 日撤回ルール。Phase B-α/β 7 日間実証実績で v0.3 改訂、Day 145+ で v1.0 + 検診仕様書 v1.1 §6-F-6 統合予定。
