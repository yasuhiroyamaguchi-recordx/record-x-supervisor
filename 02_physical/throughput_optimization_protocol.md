# TOC スループット最適化プロトコル v0.1

**配置先**: `02_physical/throughput_optimization_protocol.md`
**起案日**: 2026-04-29(Day 131 午後、本セッション拡張継続)
**起案者**: 監督官 instance A1
**目的**: **司令官 → 工場長 → 監督官のチケット流通スループットを TOC(制約理論)+ DBR(ドラム・バッファ・ロープ)で最適化** + 1 枚あたり時間計測でボトルネック可視化 + 既存 ChatGPT メーター(品質軸)との統合
**根拠**:
- ヤス指示「司令官による工場長へのチケット補充の自動化、常にストックがある状態 + 溜まりすぎも良くない、制約理論でスループット最適化」(2026-04-29 午後)
- ヤス追加指示「1 枚あたりの司令官チケット発行時間 + 工場長実装時間でボトルネック可視化、ChatGPT メーター指標が役立つ」
- 推奨プラン (α) ヤス確定
- TOC 古典(Goldratt 1984)+ DBR フレームワーク
- ChatGPT 提案統合済資産:Dasei Risk / Ticket Fitness / Implementation Integrity / 軸 8 Cross-Layer Dialogue Health(逆 U 字)= 第 13 次発令採択 2 系列

---

## 0. 位置づけ

### 0-A. TOC 概念の本記録庁への適用

| TOC 概念 | 本記録庁での実体 |
|---|---|
| **ドラム**(ボトルネック)| **工場長 Layer 1**(10 分サイクル、実装速度がスループット律速候補)|
| **バッファ**(在庫)| `commander#strategy/tickets_issued/` 未着手 + `factory#WIP` 着手中チケット |
| **ロープ**(供給制御)| 司令官の発行ペース(`tickets_draft → tickets_issued` 移動速度)|
| **WIP 制限** | バッファ上限 + 司令官発行一時停止 |
| **従属化** | 司令官・監督官スループットをドラム(工場長)に従属させる |

### 0-B. ChatGPT メーター(品質軸)との統合

スループット軸(本プロトコル M1-M4 + T_***) と 品質軸(Q1-Q4)は **二段構えで補完運用**:

```
[品質ゲート Q1 Q2] (発行時、Pre-Build Gate)
    ↓
[1 枚時間 T_emit][スループット M1] (司令官)
    ↓
[バッファ健全度 M4 逆 U 字] (在庫管理)
    ↓
[1 枚時間 T_implement][スループット M2] (工場長 = ドラム)
    ↓
[品質ゲート Q3] (実装後、Post-Build Gate)
    ↓
[1 枚時間 T_review][スループット M3] (監督官)
    ↓
[品質ゲート Q4 軸 8 逆 U 字] (関係性整合)
```

---

## 1. コア指標(全 11)

### 1-A. スループット指標(M1-M4)

| # | 指標 | 種別 | 算出 | 緑 | 黄 | 赤 | データソース |
|---|---|---|---|---|---|---|---|
| **M1** | 司令官スループット | 件/日 | 直近 7 日間 tickets_draft → tickets_issued 移動件数 / 7 | 5-10 件/日 | 2-4 件/日 or 11-15 件/日 | <2 件/日 or >15 件/日 | `commander#strategy/tickets_issued/` git log |
| **M2** | **工場長スループット**(律速候補)| 件/日 | 直近 7 日間 tickets_completed/ 配置件数 / 7 | 5-10 件/日 | 2-4 件/日 or 11-15 件/日 | <2 件/日 or >15 件/日 | `commander#strategy/tickets_completed/` git log + `factory#completion_reports/` |
| **M3** | 監督官スループット | 件/日 | 直近 7 日間 archive 件数 / 7 | 5-10 件/日 | 2-4 件/日 | <2 件/日 | `archive/peer_reviews_history.md` + `outbox/_archive/` |
| **M4** | **バッファ健全度**(逆 U 字メーター)| 0-100 | M_buffer の目標域中央が 100、両端が 0 | 80+(目標域)| 50-79 | <50 | M_buffer = WIP + 待機キュー |

### 1-B. 1 枚あたり時間指標(T_emit / T_implement / T_review)

ヤス指摘「1 枚あたりの時間でボトルネック浮かび上がる」の正面実装:

| # | 指標 | 算出 | 緑 | 黄 | 赤 | データソース |
|---|---|---|---|---|---|---|
| **T_emit** | 司令官 1 枚時間 | tickets_draft → tickets_issued 中央値時間(直近 14 日)| 30-60 分 | 61-120 分 or <15 分(質低下疑い)| >120 分 or <5 分 | git log timestamp diff |
| **T_implement** | **工場長 1 枚時間**(律速候補)| tickets_issued → tickets_completed 中央値時間 | 1-4 時間 | 4-8 時間 or <30 分(質低下疑い)| >8 時間 or <10 分 | 同上 |
| **T_review** | 監督官 1 枚時間 | completion_report → archive 中央値時間 | 10-30 分 | 31-60 分 or <5 分 | >60 分 or <2 分 | 監督官 outbox/_archive/ + archive/* |

**ボトルネック判定**: max(T_emit, T_implement, T_review)が **律速層**。

### 1-C. 品質ゲート指標(Q1-Q4、ChatGPT メーター + 既存統合)

| # | 指標 | 種別 | 緑 | 黄 | 赤 | データソース(既存) |
|---|---|---|---|---|---|---|
| **Q1** | Ticket Fitness | 0-100 | 80+ | 60-79 | <60 | `rubrics/ticket_quality_rubric.yaml` v1.0 |
| **Q2** | Dasei Risk | 0-100(逆スコア)| <30 | 30-60 | >60 | `rubrics/dasei_detection_rubric.yaml` v1.0 |
| **Q3** | Implementation Integrity | 0-100 | 80+ | 60-79 | <60 | `rubrics/implementation_review_rubric.yaml` v1.0 |
| **Q4** | 軸 8 Cross-Layer Dialogue Health(逆 U 字)| 0-100 | 70-90(中央域)| 50-69 or 91-100 | <50 | `rubrics/role_execution_rubric.yaml` v0.1 axis_4 連動 |

### 1-D. M4 バッファ健全度の逆 U 字メーター詳細

ChatGPT 案 B「軸 8 Cross-Layer Dialogue Health 逆 U 字」と同型運用:

```
       100 (目標域中央)
        |
  80 ---+--- 80
   |    |    |
  50 ---+--- 50
   |    |    |
   0 ---+--- 0
   |         |
 在庫不足  溜まりすぎ
```

M_buffer のドラム稼働継続時間換算:

| M_buffer 換算 | M4 スコア | 状態 |
|---|---|---|
| 24-48h 稼働相当(目標域中央)| 95-100 | 🟢 緑(健全)|
| 12-24h or 48-72h | 70-94 | 🟡 黄(警戒)|
| 4-12h or 72-120h | 40-69 | 🟡 黄上位 |
| <4h | 0-39(在庫不足)| 🔴 赤低位(枯渇危機)|
| >120h | 0-39(滞留)| 🔴 赤高位(滞留危機)|

---

## 2. 5 段階閾値運用(M4 連動)

| 状態 | M4 | M_buffer 換算 | 司令官アクション | 監督官アクション |
|---|---|---|---|---|
| **🟢 緑** | 80+ | 24-48h | 通常発行(M1 緑域)| 月次検診のみ |
| **🟡 黄低位**(在庫不足兆候)| 50-79 | <12-24h | 発行加速(M1 11-15 件/日)| 早期警報、加速判断レビュー |
| **🟡 黄高位**(滞留兆候)| 50-79 | 48-72h | 発行減速(M1 2-4 件/日)| **ボトルネック調査開始**(T_implement 黄/赤か?)|
| **🔴 赤低位**(枯渇危機)| <50 | <4-12h | 緊急発行 or 工場長部分稼働 | **EVT 起案 + Yasu 通知**(notify-yasu-email)|
| **🔴 赤高位**(滞留危機)| <50 | >72h | **発行停止 + 真ボトルネック特定** | **EVT 起案 + 円卓会議緊急招集** + ヤス再介入条件 §6 候補 |

---

## 3. ボトルネック特定アルゴリズム(TOC + 1 枚時間)

### 3-A. 律速層特定

```
Step 1: T_emit / T_implement / T_review を計測
Step 2: max(T_***) = 候補律速層
Step 3: 候補律速層のスループット指標(M1/M2/M3)を確認
Step 4: M4 バッファ健全度で滞留 vs 枯渇を判定
Step 5: 律速層 + 状態を確定 → 改善 DO 起案へ
```

### 3-B. 律速層別の改善方向

| 律速層 | T_*** 値 | M_buffer | 改善方向 |
|---|---|---|---|
| **司令官**(T_emit が max)| >120 分/件 | M4 黄低位以下 | 司令官の発行プロセス簡略化 / 鋳型改訂 / Devil's Advocate ラウンド削減 |
| **工場長**(T_implement が max)= 想定主犯 | >8 時間/件 | M4 黄高位(滞留)| 工場長の実装プロセス改善 / 鋳型 v(N+1) / DoD 簡略化 / 並行作業 |
| **監督官**(T_review が max)| >60 分/件 | M4 赤高位 | 監督官の検収プロセス自動化 / Layer 0 巡回内 review 強化 |

### 3-C. 品質ゲート連動(別軸)

Q1-Q4 のいずれかが赤 → スループット改善より **品質再構築** 優先(TOC「品質はバッファに先立つ」原則):

- Q2 Dasei Risk 赤 → 馴れ合い化警告 + Devil's Advocate 連動 + 円卓会議緊急招集
- Q3 Implementation Integrity 赤 → 工場長実装品質低下 + 鋳型再評価
- Q4 軸 8 Cross-Layer Dialogue Health 逆 U 字赤 → 双方向通信不全 + 関係性ポリシー §3.2 再点検

---

## 4. 自動化機構の構成要素

| # | 機能 | 実装場所 | 起案責任 |
|---|---|---|---|
| 1 | **measure-throughput.ps1**(M1-M3 + T_*** 計測)| `commander#sync/sync_script/measure-throughput.ps1` | **司令官 α 起案領域**(本日発令第 36 次で要請予定)|
| 2 | **measure-buffer.ps1**(M4 + 5 段階閾値判定)| 同上 | 司令官 α |
| 3 | **発行ペース自動調整**(Layer 2 自律巡回内)| `commander#layer2_entry_point.ps1` 改訂(本日 22 分起動騒動の修正と並行)| 司令官 α |
| 4 | **TOC 健全度の監督官側観察** | 検診仕様書 §2-A M13 新設候補(v1.1)| 監督官 A1 |
| 5 | **buffer/throughput drift 検出ルール R9**(個別フィードバック単位)| A2 マスター `auto-evt-recorder.ps1` v0.8 拡張(L1 circular で要請)| 監督官 A2 |
| 6 | **赤判定時の EVT + 通知**(notify-yasu-email 経由)| 既存装置と統合 | 共通 |
| 7 | **円卓会議への議題化**(月次)| `operations/template_metabolism_checkup.md` v0.1 §6 連動 | 三者合議 |

---

## 5. 監督官の役割(TOC 観察者として再定義)

監督官 A1 は **ドラム外のメタ観察者**:

| 役割 | 内容 |
|---|---|
| **ボトルネック特定** | 検診仕様書 §4-A 優先順位 + TOC §3 = 同型 |
| **5 段階閾値の月次レビュー** | Day 145+ 実績で閾値再調整(粗砥原則整合)|
| **赤判定時の Pre-Build Gate** | 司令官 α の発行加速 / 停止判断への独立 review |
| **Post-Build Gate 検収** | バッファ滞留時の真因(鋳型陳腐化 / 工場長故障 / 構造問題)特定 |
| **品質ゲート併設** | Q1-Q4 を独立に観察、TOC 別軸警報 |

---

## 6. 既存資産との接続(重複回避)

| 既存 | TOC との関係 | 統合方法 |
|---|---|---|
| `rubrics/role_execution_rubric.yaml` v0.1 axis_2 ticket_issuance_velocity | **M1 と同一指標** | M1 を本プロトコル名称、計測式同一 |
| `rubrics/role_execution_rubric.yaml` v0.1 axis_5 daily_consumption_count | **M2 と同一指標** | M2 を本プロトコル名称、計測式同一 |
| `02_physical/recording_office_health_check_v1_0.md` v1.0 §2-A M3-M10 | 監督官個別検診、本プロトコル M1-M4 とは別軸(役割実行) | 補完 |
| `operations/post_build_gate_checklist.md` v0.2 §6 6 軸閾値 | 個別フィードバック品質ゲート、Q1-Q4 と整合 | 補完 |
| `02_physical/capability_catalog.md` v0.1 | TOC 機能を新規エントリ FUNC-D-006 で追加 | 統合 |
| `operations/template_metabolism_checkup.md` v0.1 | 鋳型新陳代謝、TOC スループット改善時の鋳型改訂と連動 | 統合 |

---

## 7. Phase 別運用

### 7-A. Phase B-α-pre(現在 〜 Day 131 夜)

- 本プロトコル v0.1 起案完了(本日午後)
- 自動化機構(measure-throughput.ps1 / measure-buffer.ps1)は司令官 α 起案待ち = 第 36 次発令で要請

### 7-B. Phase B-α/β(Day 132-138)

- 自動化機構実装 + 7 日間実証
- T_***  + M1-M4 + Q1-Q4 を 6h サイクル内計測
- 律速層特定の初回実証

### 7-C. Phase B-γ 以降(Day 139+)

- 5 段階閾値の Day 145+ 再調整
- 月次円卓会議で議題化(Day 162 初回)
- 鋳型新陳代謝検診 + チケット品質独立 review との統合運用

---

## 8. 関連参照

- 検診仕様書: `02_physical/recording_office_health_check_v1_0.md` v1.0 §4 ボトルネック特定
- ガレージドクトリン: `operations/role_and_conduct.md` §1.5
- 鋳型新陳代謝検診: `operations/template_metabolism_checkup.md` v0.1
- チケット品質独立 review: `operations/ticket_quality_independent_review.md` v0.1
- Post-Build Gate v0.2: `operations/post_build_gate_checklist.md` v0.2 §6
- 機能カタログ: `02_physical/capability_catalog.md` v0.1(本プロトコル登録予定)
- 既存メーター: `rubrics/dasei_detection_rubric.yaml` + `ticket_quality_rubric.yaml` + `implementation_review_rubric.yaml` + `role_execution_rubric.yaml`
- 哲学的根拠: TOC(Goldratt 1984)+ ChatGPT 提案統合(第 13 次発令採択 2)+ Gemini 提案統合(同 4)

---

## 9. 改訂履歴

- v0.1(2026-04-29 / Day 131 午後): 初版起案、監督官 instance A1 起案。ヤス指示「制約理論でスループット最適化 + 1 枚あたり時間でボトルネック可視化 + ChatGPT メーター指標」契機。Devil's Advocate ラウンド 5 件採択を反映(品質 vs スループット二段構え / 1 枚時間新規 / 既存資産結合 / 過剰指標化回避 / 逆 U 字メーター左右対称)。コア指標 11(スループット M1-M4 + 1 枚時間 T_*** 3 + 品質ゲート Q1-Q4)+ 5 段階閾値 + ボトルネック特定アルゴリズム + 自動化機構構成要素 7 + 監督官役割 + 既存資産接続。Phase B-α/β 7 日間実証実績で v0.2 改訂、Day 145+ で v1.0 確定予定。
