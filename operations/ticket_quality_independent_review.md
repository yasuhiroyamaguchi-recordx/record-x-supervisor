# 監督官側 チケット品質独立 review プロトコル v0.1

**配置先**: `operations/ticket_quality_independent_review.md`
**起案日**: 2026-04-29(Day 131 午後)
**起案者**: 監督官 instance A1
**目的**: 司令官 α 発行チケットの品質を **監督官側で独立 review**(自己採点との差分検出)+ Post-Build Gate Devil's Advocate 発動経路確立
**根拠**:
- ヤス指示「司令官のチケット発行精度の定期チェックは必要」(2026-04-29 午後)+ 推奨プラン (α) ヤス確定
- Devil's Advocate ラウンド 5 件採択
- 既存資産: `rubrics/ticket_quality_rubric.yaml` v1.0(A2 起案、6 軸採点)+ `rubrics/role_execution_rubric.yaml` v0.1 axis_2 ticket_quality_consistency
- ガレージドクトリン §1.5「装置の存在 ≠ 機能」(rubric を運転する物理装置)
- 検診仕様書 v1.0 §6-F 整合(対外 review への DA 適用)

---

## 0. 位置づけ

### 0-A. 既存資産との関係(補完)

| 既存 | 役割 | 主体 |
|---|---|---|
| `rubrics/ticket_quality_rubric.yaml` v1.0 | チケット品質 6 軸採点ルーブリック | 司令官 α 自己採点(periodic_checkup_protocol v0.1 経由)|
| `rubrics/role_execution_rubric.yaml` v0.1 axis_2 | 「次の 10 手提示率」内 ticket_quality_consistency | 司令官 α 自己採点 |
| **本プロトコル** | **監督官 A1/A2 による独立採点 + 自己採点との差分検出** | **監督官独立 review** |

監督官側独立 review は司令官 α 自己採点を **置換しない、上位レイヤーで補完**(関係性ポリシー §3.2 整合)。

### 0-B. 馴れ合い防止の物理装置

司令官 α 自己採点のみでは形式採択化リスクあり = 監督官独立 review が **対称的構造的反論経路** として機能。post_build_gate_checklist.md v0.2 §6 個別フィードバック品質ゲート閾値判定の前段。

---

## 1. 発動頻度

| 区分 | 頻度 | 主体 |
|---|---|---|
| **週次サンプリング review**(必達)| 毎週月曜 09:00 JST | 監督官 A1(主導)/ A2(クロスチェック)|
| 緊急 review | scale: large チケット発行直後 | 監督官即応 |
| 月次総括 | 月次定期検診時 | 三者(円卓会議)|

---

## 2. サンプリング方法

### 2-A. 直近発行チケットからのサンプリング

```powershell
# 司令官側 tickets_issued/ から直近 1 週間分を取得
$cmdTickets = "C:\RX_Dev\record-x-commander\strategy\tickets_issued"
$cutoff = (Get-Date).AddDays(-7)
$recent = Get-ChildItem $cmdTickets -Filter "DO-*.md" -Recurse |
    Where-Object { $_.LastWriteTime -gt $cutoff } |
    Sort-Object LastWriteTime -Descending
```

### 2-B. サンプル数

| 直近 7 日間発行数 | サンプル数 |
|---|---|
| 1-5 件 | 全件 review |
| 6-15 件 | 直近 5 件 + ランダム 3 件 |
| 16+ 件 | 直近 5 件 + ランダム 5 件(過剰運用回避)|

---

## 3. 採点軸(既存 ticket_quality_rubric.yaml v1.0 適用 + 監督官独自観点)

### 3-A. 既存 6 軸(ticket_quality_rubric.yaml v1.0)

ticket_fitness の標準採点を **監督官独立に実施**(司令官 α と同じ rubric を別主体で適用)。

### 3-B. 監督官独自観点(本プロトコル新設)

| 観点 | 確認事項 |
|---|---|
| **目的整合性** | チケット目的が直近 advance_map / SITREP / Phase 計画と整合 |
| **scope 過大過小** | 1 チケットでカバーする範囲が過大(複合化)or 過小(分割しすぎ)でないか |
| **Forbidden Path 完全性** | チケット frontmatter `forbidden_paths` 列挙の網羅度 |
| **DoD 検証可能性** | DoD が **検証可能 + 物理装置化** されているか(抽象記述のみは赤)|
| **stop_conditions 妥当性** | 撤退条件が現実的(数値閾値 / 時間制限 / 失敗回数)|
| **rollback specificity** | 失敗時の rollback 手順が具体記述されているか |
| **lessons 抽出予定** | 実装後の lessons 抽出経路が事前明示されているか |

---

## 4. 司令官 α 自己採点との差分検出

### 4-A. 差分計算

```yaml
diff_analysis:
  commander_alpha_score: 85  # 司令官 α 自己採点(role_execution snapshot)
  supervisor_a1_score: 70    # 監督官独立採点
  diff: 15                    # 差分
  diff_threshold:
    green: ±5 以内
    yellow: ±6-15
    red: ±16 以上(認識乖離 = 構造的問題)
```

### 4-B. 差分赤判定時の対応

差分 ±16 以上 = **認識乖離** = post_build_gate_checklist.md v0.2 §6 個別フィードバック品質ゲート赤判定相当:

1. EVT 起案(監督官・司令官の認識乖離 = 系列 C 役割実行欠落)
2. 該当チケット詳細 review + Devil's Advocate ラウンド発動
3. 監督官 A1 → 司令官 α へ verdict: REQUEST_CHANGES 発令
4. 改善事案提案 3 件以上(post_build_gate v0.2 §6-A 軸 B 整合)
5. 月次円卓会議で議題化(連続発生時)

---

## 5. Devil's Advocate ラウンド統合

scale: medium 以上のチケット発行時、または差分赤判定時、監督官は **Post-Build Gate Devil's Advocate** を必達発動(検診仕様書 v1.1 §6-F-6 候補):

1. チケット内容を独立 read
2. 「このチケットの弱点は何か」を 3 件以上挙げる
3. 各弱点の構造的根拠 + 改善事案提案
4. 即時採択候補化判断(チケット差し戻し / 修正要請 / 構造的反論留保)

---

## 6. ログ記録(append-only)

各 review 結果は以下に記録:

```
sync/checkup-scores/ticket_review/
└ review_{YYYYMMDD-HHMMSS}_{instance_id}_{ticket_id}.json
```

JSON 構造:

```json
{
  "review_id": "review_20260506-090000_A1_DO-COMMANDER-014",
  "reviewer_instance": "A1",
  "ticket_id": "DO-COMMANDER-014",
  "reviewed_at": "2026-05-06T09:00:00+09:00",
  "rubric_scores": {
    "scope_clarity": 80,
    "dod_verifiability": 75,
    "evidence_required_completeness": 90,
    "stop_conditions_realism": 85,
    "rollback_specificity": 70,
    "lessons_extraction_path": 80
  },
  "supervisor_独自観点": {
    "purpose_alignment": "green",
    "scope_size": "green",
    "forbidden_paths_completeness": "yellow",
    "dod_physical_device": "green",
    "stop_conditions_validity": "green",
    "rollback_specificity": "yellow",
    "lessons_extraction_path": "green"
  },
  "supervisor_total_score": 80,
  "commander_alpha_self_score": 85,
  "diff": 5,
  "diff_judgment": "green",
  "da_round_performed": false,
  "da_round_required": false,
  "verdict": "APPROVE_WITH_NOTES",
  "findings": [
    {
      "severity": "P3",
      "category": "implementation",
      "message": "rollback_specificity が抽象記述、具体コマンド推奨"
    }
  ],
  "next_action": "司令官 α への定期通知 + 次回チケット起案時の改善期待"
}
```

---

## 7. 関連参照

- 既存 rubric: `rubrics/ticket_quality_rubric.yaml` v1.0
- 既存役割実行: `rubrics/role_execution_rubric.yaml` v0.1 axis_2
- 検診仕様書: `02_physical/recording_office_health_check_v1_0.md` v1.0 §6-F
- Post-Build Gate チェックリスト: `operations/post_build_gate_checklist.md` v0.2 §6 + §7
- 検診プロトコル: `operations/periodic_checkup_protocol.md` v0.1
- 機能カタログ: `02_physical/capability_catalog.md`(本日同時起案)
- 鋳型新陳代謝検診: `operations/template_metabolism_checkup.md`(本日同時起案)

---

## 8. 改訂履歴

- v0.1(2026-04-29 / Day 131 午後): 初版起案、監督官 instance A1。ヤス指示「司令官のチケット発行精度の定期チェックは必要」契機。既存 ticket_quality_rubric.yaml v1.0 を **監督官独立適用 + 自己採点差分検出** で補完運用。週次サンプリング + 月次総括 + 緊急 review。差分赤判定時の Devil's Advocate ラウンド発動。Phase B-α/β 7 日間実証実績で v0.2 改訂、Day 145+ で v1.0 統合予定。
