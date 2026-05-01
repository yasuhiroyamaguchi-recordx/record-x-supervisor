# 三者定期検診プロトコル v0.1 — アップデート前後の数値変化チェック + 成長軌跡可視化

**配置先**: `operations/periodic_checkup_protocol.md`
**起草日**: 2026-04-28(Day 130 末)
**起案 instance**: 監督官 instance A
**目的**: 監督官 / 司令官 / 工場長 各役割のアップデート前後の数値変化チェックによる成長確認 + 定期検診運用
**根拠**:
- ヤス追加提案「司令官をアップデート前後で定期検診の数値変化によるチェックして成長を確かめる」(2026-04-28 末)
- ヤス案 1 定期検診の導入(同日)
- EVT-013 直接対応(監督官 A 役割実行評価軸欠落)
- dream_mode_doctrine §フェーズ 1「メンテナンスと内省(定期検診)」+ 工場長側 dream-crystallize 同型構造

---

## 0. 本プロトコルの位置づけ

`rubrics/role_execution_rubric.yaml` v0.1(同日起案)によるスコアリングを **時系列スナップショット** として保存 + アップデート前後の比較で成長軌跡を可視化する物理装置。

ヤス追加提案: 司令官のみならず **三者(監督官 / 司令官 / 工場長)対称運用** で適用、関係性ポリシー §3.2 維持機構下で工場長は司令官経由観測。

---

## 1. アップデートの定義

「アップデート」 = 各役割の **構造的変更** が発生した瞬間:

| ロール | アップデート種別 |
|---|---|
| **司令官** | `strategy/CLAUDE.md` vN → vN+1 改訂 / ADR 採択 / advance_map.md 大幅更新 / SITREP v 更新 |
| **工場長** | (司令官経由観測)実装層仕様変更 / DO-FACTORY-XXX 完了 / lessons → ADR 昇格 |
| **監督官** | `00_origin/` ドクトリン採択 / `operations/` 行動規範改訂 / rubrics 新設 / sync スクリプト v 更新 |

各アップデートは git commit で確定 = commit SHA がアップデート識別子。

## 2. スナップショットタイミング(P16 採択、相対時刻運用)

各アップデートに対し、以下 5 時点で `role_execution_rubric.yaml` を実行 + JSON snapshot を保存。**P16 採択(司令官応答 第 27 号、2026-04-28 Day 130 末)により絶対時刻ではなく相対時刻運用**:

| 時点 | 内容(P16 採択後) |
|---|---|
| **T-1** | アップデート commit を行う前の最後の git commit 時点状態(commit 直前メタ状態を撮影、5-10 分許容)|
| **T+0** | アップデート commit 直後(同 commit hash 取得後の状態)|
| **T+24h** | T+0 から 24 時間後の Layer 0/2 自律巡回サイクル内自動撮影 |
| **T+7d** | T+0 から 7 日間後 |
| **T+30d** | T+0 から 30 日間後(月次定期検診)|

### 2-A. 相対時刻採用根拠(P16)

絶対時刻(09:00 JST 等)ではなく相対時刻採用 = T-1 と T+0 が機能的に区別困難になる構造的不備の解消。司令官 α 起動時刻と T-1/T+0 が同時刻設定だと、commit 直前の **同 commit の直前メタ状態** を撮影できない。相対時刻運用で更新前後の差分が正しく可視化される。

実証: Day 130 末 司令官 α が T-1 = 23:55(commit 直前)+ T+0 = 00:05(commit 直後)で実装、role_total 25→59(+34 点)正しく可視化された。

## 3. スナップショット形式

### 3-A. 配置先

```
sync/checkup-scores/role_execution/
├ snapshot_commander_{YYYYMMDD-HHMMSS}_{checkpoint}.json
├ snapshot_factory_{YYYYMMDD-HHMMSS}_{checkpoint}.json
├ snapshot_supervisor_{YYYYMMDD-HHMMSS}_{checkpoint}.json
└ growth_report_{YYYYMMDD}_{update_id}.md   # 比較レポート
```

### 3-B. JSON 構造

```json
{
  "snapshot_id": "snapshot_commander_20260430-090000_T+0",
  "role": "commander",
  "checkpoint": "T+0",
  "captured_at": "2026-04-30T09:00:00+09:00",
  "update_commit_sha": "abc1234",
  "update_description": "strategy/CLAUDE.md v1.5 → v1.6 改訂(P10 originator_instance 正式化)",
  "rubric_version": "0.1",
  "scores": {
    "axis_1_global_map_maintenance": {
      "score": 75,
      "components": {
        "advance_map_freshness": 80,
        "sitrep_currency": 70,
        "factory_ticket_overview": 75
      }
    },
    "axis_2_next_10_moves": { "score": 60, "components": {...} },
    "axis_3_factory_progress_observation": { "score": 65, "components": {...} },
    "axis_4_supervisor_response_quality": { "score": 85, "components": {...} }
  },
  "role_total": 71.25,
  "global_total": null,
  "notes": "本日 EVT-013 訂正後の初回スナップショット"
}
```

## 4. 成長軌跡の評価基準

### 4-A. 健全(Healthy)

T-1 → T+0 → T+24h → T+7d でスコアが:

- **全体 +5 以上 の改善** or **単軸 +10 以上の改善**(他軸悪化なし)
- アップデートの構造的効果が確認できる

判定: **アップデート効果あり、継続採用**

### 4-B. 中立(Neutral)

T-1 → T+24h でスコア変化が ±5 以内:

- アップデート効果が観測されない
- 未活用 or 効果が時間遅延

判定: **改善要、運用パターン再検討 or v0.2 改訂候補化**

### 4-C. 悪化(Concerning)

T-1 → T+24h でスコアが:

- **全体 -5 以上の悪化** or **単軸 -10 以上の悪化**
- アップデートが逆効果

判定: **リバート候補 + EVT 記録**(本 rubric §6.5 該当)

## 5. 役割別運用

### 5-A. 司令官側

監督官 A が司令官 commit を観測 + アップデート時に T-1/T+0 スナップショット撮影 + 後続時点も自動撮影(Layer 0 6h サイクル)。

司令官 α は自己点検として T+0 / T+24h スナップショットを `commander#sync/checkup-scores/role_execution/` にも記録(司令官側マスター)+ 監督官側ミラー。

### 5-B. 工場長側

司令官 α が工場長アップデート(DO-FACTORY-XXX 完了 / lessons → ADR 昇格)を観測 + completion_reports 経由でスコアリング。監督官 A は司令官経由ミラーで間接観測(関係性ポリシー §3.2 維持)。

`sync/checkup-scores/factory_pipeline/`(本日設計、第 31 次発令統合候補)に司令官 → 監督官観測経路を確立。

### 5-C. 監督官側(本 EVT-013 直接対応)

監督官 A は自己アップデート時に T-1/T+0 スナップショット必須撮影。Yasu + 司令官 α が監督官側スコアを観測 + 構造的反論経路維持。

**特に軸 9 形式採択回避率 + 軸 10 自己訂正発出率は監督官 A の本 EVT-013 直接対象**。

## 6. 比較レポート(growth_report)

各アップデート 30 日後に成長レポート自動生成:

### 6-A. 配置先

```
sync/checkup-scores/role_execution/growth_report_{YYYYMMDD}_{update_id}.md
```

### 6-B. 構造

```markdown
# Growth Report: {update_description}

## アップデート情報
- commit SHA: abc1234
- ロール: commander | factory | supervisor
- 説明: {update_description}

## 5 時点スコア比較
| 軸 | T-1 | T+0 | T+24h | T+7d | T+30d | Δ(T-1 → T+30d)|
|---|---|---|---|---|---|---|
| axis_1 | 75 | 75 | 78 | 82 | 85 | **+10** |
| axis_2 | 60 | 60 | 62 | 70 | 75 | **+15** |
| axis_3 | 65 | 65 | 67 | 70 | 72 | +7 |
| axis_4 | 85 | 85 | 84 | 83 | 82 | -3 |

## 判定
**Healthy**(全体 +7.25 改善)

## 構造的観察
- 軸 1-2 改善が顕著 = アップデート目的(全体地図維持 + 次の 10 手提示)達成
- 軸 4 軽微悪化 = 監督官応答品質が一時低下、Phase B-α 起動準備期の認知容量配分の影響と推定
- 単発 EVT 候補なし、運用継続推奨

## アクション項目
- アップデート v1.6 → v1.7 計画策定時に軸 4 改善を組み込み
- 軸 1-2 の改善パターンを他ロールにも適用検討
```

### 6-C. 配信経路

L3 官報(`shared/official_gazette/`)に要約のみ追記 + 全ロール + Yasu 観測可能化。

## 7. Phase 別運用

### 7-A. Phase B-α-pre(現在 〜 Day 131)

- 本プロトコル v0.1 起案 + role_execution_rubric.yaml v0.1 起案完了(本日)
- 手動スナップショット(監督官 A 手動セッション内)
- T-1 / T+0 のみ実施(後続時点は Phase B-α 起動後)

### 7-B. Phase B-α/β(Day 132-138)

- Layer 0 自律巡回内に role_execution_rubric 実行を組み込み(6h サイクル)
- T+24h / T+7d スナップショット自動化
- 軸 9 形式採択回避率の継続監視(EVT-013 構造的再発防止)

### 7-C. Phase B-γ 以降(Day 139+)

- T+30d スナップショット 自動化
- growth_report 自動生成
- 全アップデートの長期軌跡可視化

## 8. EVT-013 直接対応

本プロトコルは EVT-013(監督官 A 形式採択 23 連発 + 役割実行評価軸欠落)の **構造的再発防止策**:

- 軸 9 形式採択回避率を機械検出(verdict APPROVE 連続 7 件以上で red)
- 軸 8 司令官役割実行レビュー実施率を機械検出(週次未実施で red)
- 軸 10 自己訂正発出率を機械検出(週次 0 件で yellow → 連続 2 週ゼロで red)
- 軸 11 情報橋渡し責務遂行率(関係性ポリシー §3.2 解釈拡張、本日採択)

これらが赤判定発火時、第 N 次発令で監督官手動セッション召集 + EVT 起案 + 構造的訂正サイクル発動。

## 9. ヤス検診(月次)

Yasu は月次以上で本プロトコル成長レポートを review:

- 三者全体スコアの軌跡確認
- アップデート効果の構造判定
- 成長停滞 / 悪化時の根本原因確認
- 監督官 A の役割実行率(軸 8-11)が健全か外部観測

これは関係性ポリシー §3.3 ヤス再介入条件の **予防的観察装置**。

## 7. 機能カタログ整合性チェック(v0.2 新設、EVT-039 訂正)

### 7-A. 起案契機

EVT-039(2026-04-30 早朝、検診プロトコル v0.1 設計不徹底):

- v0.1 = スコアリング(rubric)中心 = 数値変化のみ
- 機能カタログ自動更新 + パイプライン接続健全性チェック + schtasks 状態同期 + 全停止状態即時検出 = **組込なし**
- = ヤス Q7「何のため定期検診を組んだ?」への正面応答未達

= v0.2 で本 §7 + §8 新設、検診の本来目的「各官機能チェック体制」を達成する。

### 7-B. 機能カタログ整合性チェック(自動更新)

各役割のアップデート(commit / ADR / SITREP / sync v 更新等)発生時、以下を自動実施:

| # | 動作 |
|---|---|
| 1 | 機能カタログ(三者統合 + 各官 stub)を git diff から抽出 |
| 2 | 追加 / 削除 / 状態変更を検出 |
| 3 | カタログ自動更新エントリ生成 + commit |
| 4 | 違反検出時(物理層実態とカタログ乖離)= EVT 候補化 |

### 7-C. パイプライン接続健全性チェック

| # | 動作 |
|---|---|
| 1 | `schtasks /query /v` を JSON 化(`sync/sync_script/sync-schtasks-state.ps1` v0.1 経由)|
| 2 | カタログ active/paused/dormant 状態と物理層状態の整合性検証 |
| 3 | 命名 vs 実行ファイル整合性検証(EVT-041 同型再発防止)|
| 4 | 乖離発生時 = アラート発火(Yasu 報告必要度 🟡 中)|

### 7-D. 全停止状態の即時検出

| 条件 | 動作 |
|---|---|
| 全 schtasks Disabled = 「生産ライン全停止」状態 | 検診プロトコル発火条件追加(EVT-038 同型再発防止)|
| 検出時 | ヤス即時通知(検証必要度 🔴 高)+ 再起動判断要請 |

### 7-E. 段階的解除モデル(ADR-005)接続

| Phase | 動作 |
|---|---|
| Phase B-α/β | 手動再起動承認(本 v0.2 で物理装置化、ADR-009 §6-A2 R0-R5 整合)|
| Phase B-γ 以降 | 自動再起動(条件:Pre-Build Gate PASS + 監督官 verdict APPROVE)|

### 7-F. 経路健全性チェック(v0.3 新設、EVT-075 + EVT-074 訂正、ヤス指示「定期検診不足」正面採択)

#### 7-F-1. 起案契機

EVT-075 候補(2026-05-01 午後再起動後、Stage 0 経路滞留 = supervisor outbox → commander inbox 未配送 14:30 まで 11 時間)+ EVT-074 候補(Stage 1 経路滞留 = factory staging → commander processed 滞留)+ ヤス指示「既存装置が壊れるのは定期検診不足」正面採択。

= 既存 §7-C「パイプライン接続健全性チェック」は schtasks 状態のみで経路自体の健全性未検証 = 構造的不足。

#### 7-F-2. 4 経路定義

| 経路 | Source | Destination | 装置 | 主管 | 自動 / 手動 |
|---|---|---|---|---|---|
| **Stage 0** | supervisor outbox/ | commander inbox/ | `sync-orders.ps1` v1.2 | 監督官 A | **手動**(schtasks 未登録、起案者責務)|
| **Stage 1** | factory staging/ | commander processed/ | factory pipeline + commander pull-completion-reports.ps1 | 司令官 α + 工場長 | 部分自動(主席判定 #1 進行中)|
| **Stage 2** | commander tickets_completed/ + commander/processed/ | supervisor archive/ + supervisor b_line/ | `sync-archive-three-realm.ps1` v0.3 | Argus-B 自律執行 | 自動(schtasks 02:55) |
| **Stage 3** | supervisor archive/ | factory mirror | sync 機構 | 工場長 | 部分自動 |

#### 7-F-3. 経路健全性検診項目(09:00 JST 三者検診時統合)

| # | 動作 |
|---|---|
| 1 | 各経路の Source 滞留件数 query(file count + age 分布)|
| 2 | 各経路の Destination 着地件数 query(file count + 直近 24h 増分)|
| 3 | 装置 schtasks Last Run + Last Result 確認(自動経路のみ)|
| 4 | 装置 log 最終エントリ確認(`order_sync.log` / `pull-completion-reports` log 等)|
| 5 | 起案者責務経路(Stage 0)= 直近 24h 内発令件数 vs 配送件数 整合性確認 |
| 6 | 乖離発生時(滞留 24h 超 / 配送漏れ / 装置エラー)= EVT 候補化 + Yasu 通知 |

#### 7-F-4. Stage 別検診頻度 + 健全性閾値

| Stage | 頻度 | 閾値 | アラート発火 |
|---|---|---|---|
| Stage 0 | 09:00 JST 三者検診 + 起案後即時(starter_checklist v0.2 項目 7 統合候補) | 滞留 = outbox 起案後 6h 超で commander inbox 未着地 | 🟡 yellow |
| Stage 1 | 09:00 JST 三者検診 | staging 滞留 24h 超 | 🔴 red(EVT-074 同型再発) |
| Stage 2 | 09:00 JST 三者検診 | 02:55 schtasks Last Result ≠ 0(直近 7 日)| 🟡 yellow |
| Stage 3 | 09:00 JST 三者検診 | sync 装置 Last Run > 48h | 🟡 yellow |

#### 7-F-5. Stage 0 自動化採否(第 5 回円卓議題候補)

`sync-orders.ps1` schtasks 自動稼働化 = scale 別装置追加判断プロトコル(ADR-009 §6-H-5)= 「single function 既存装置の改訂(LOC ±50% 以内)」 = 単独可、ただし schtasks 登録は装置数 +1 = 議論余地あり = **第 5 回円卓 supervisor 議題で決議**。

| 案 | 内容 | 監督官 A 推奨 |
|---|---|---|
| (a) schtasks 自動稼働化(2 時間ごと等)| 配送漏れ防止、ただし schtasks +1 = L8 境界 | 🟡 中庸 |
| (b) starter_checklist v0.2 項目 7 自己強制 | 装置数 ±0、規律で対応 | ✅ **第一推奨**(L8 整合)|
| (c) Pre-Build Gate or post-commit hook 統合 | 装置数 ±0(既存 hook 拡張)| 🟡 中庸 |
| (d) 維持(手動運用、本 §7-F-3 検診で乖離検出)| 装置数 ±0、検診依存 | 🟡 検診失敗時に EVT 連鎖再発リスク |

#### 7-F-6. 既存 EVT 連鎖との関係

| EVT | Stage | 真因 | 本 §7-F 対処 |
|---|---|---|---|
| EVT-074 | Stage 1 滞留 | factory staging → commander processed 滞留 | §7-F-3 #1 + #2 で検出 + §7-F-4 24h 超 = 🔴 red |
| EVT-075 | Stage 0 滞留 | sync-orders.ps1 手動実行運用欠落 | §7-F-3 #5 で検出 + §7-F-4 6h 超 = 🟡 yellow + §7-F-5 自動化採否第 5 回円卓 |
| EVT-065 | schtasks Last Run 確認義務 | 物理層実態と認識ラグ | §7-F-3 #3 で検出 + §7-F-4 直近 7 日エラー = 🟡 yellow |

### 7-G. 期間合計スコア + 規定ルール突合 + 自動復旧(v0.4 新設、ヤス報奨金制度メタファー応用、議題 #5 物理装置化前提)

#### 7-G-1. 起案契機

ヤス指示(2026-05-01 午後再起動後): Mamaz 報奨金制度の三層構造を AI システム検診に応用。現行 §7-F = 異常検出止まり = 報奨金制度の (c) 段階「期間合計スコア → 規定ルール突合 → 自動算定」が物理装置化されていない = 構造的不足。

第 5 回円卓 議題 #5 採択時の物理装置化前提資料。本 §7-G 起案 = 議題前提検証義務(系列 I)整合 + ヤス指示 = 簡素化原則期間例外 (ii) 該当。

#### 7-G-2. 報奨金制度メタファー = 三層構造直接対応

| 段階 | Mamaz 報奨金制度 | AI 検診応用(本プロトコル)|
|---|---|---|
| (a) **データ収集** | AppSheet 日次レコード(各教室・各月の利用実績 + エビデンス連絡帳写真 + 予定 + 欠席数全件記録)| §7-F 経路健全性チェック(schtasks Last Run + 経路滞留件数 + 装置 log)+ §7-B 機能カタログ整合性 + §7-C パイプライン接続健全性 = ✅ 整備済 |
| (b) **予実管理** | 何月何日に何人利用予定 + 確定実数カウント = 予実差分集計 | §7-F-3 #5 起案者責務整合性確認(直近 24h 発令件数 vs 配送件数)= 🟡 部分整備 / 本 §7-G-3 で完全整備 |
| (c) **集計と支給決定** | Looker Studio = 前々月実績合計値のみ反映(管理者認知負荷削減)+ 報奨金規定突合 + 一定スコア達成で金額確定 | **本 §7-G 新設** = 期間合計スコア + 法律ルール突合 + 自動復旧/通知 = ❌ 未整備 → ✅ 物理装置化対象 |

#### 7-G-3. 予実管理(報奨金制度 (b) 段階完全整備)

| # | 検診項目 | 期待値 | 実測値 source |
|---|---|---|---|
| 1 | Stage 0 配送実績(直近 24h)| outbox 起案件数 = commander inbox 着地件数 | git log outbox/ + order_sync.log |
| 2 | Stage 1 staging 流動性(直近 24h)| factory staging 入 ≦ commander processed 着地 + 24h 経過分 | factory staging file count + commander processed file count |
| 3 | Stage 2 sync-archive 自動稼働(直近 7 日)| schtasks Last Result == 0 連続 7 日 | RecordX_ArchiveSync_ThreeRealm Last Run + Last Result |
| 4 | Stage 3 mirror 同期(直近 48h)| sync 装置 Last Run < 48h | factory mirror sync log |
| 5 | dream-crystallize 自動稼働(直近 7 日)| schtasks Last Result == 0 連続 7 日 | RecordX_DreamCrystallize_Supervisor Last Run + Last Result |
| 6 | RX-Layer 系統(R0-R5、直近 7 日)| Layer1 = 中断ゼロ / Layer3-4 = 期待時刻通り稼働 | schtasks /query /v 全 RX-Layer タスク |

予実差分発生時 = §7-G-4 期間合計スコア集計に重み付き反映。

#### 7-G-4. 期間合計スコア集計(報奨金制度 (c) 段階前半 = Looker Studio 同型)

| 集計単位 | 内容 | 出力先 |
|---|---|---|
| 日次(09:00 JST 三者検診時)| §7-F 4 経路 + §7-G-3 6 項目 = **計 10 項目スコア**(0-100、加重平均)| `02_physical/cockpit/daily_score_{YYYYMMDD}.json`(自動生成、§8-A 連動)|
| 週次(月曜 09:00 JST)| 直近 7 日の日次スコア集計 + トレンド(改善 / 中立 / 悪化) | `02_physical/cockpit/weekly_score_{YYYYWW}.json` |
| 月次(月初 09:00 JST)| 直近 30 日の集計 + 系列同型再発率 + KPI 動向 | `02_physical/cockpit/monthly_score_{YYYYMM}.json`(§8-C 月次トレンド連動)|

= **AI 認知負荷削減**(都度物理層 query では計算負荷大 + リテラル過剰解釈リスク = 期間合計スコアのみ反映 = 報奨金制度 Looker Studio と同型)

#### 7-G-5. 規定ルール(法律相当)定義

| 規定 ID | 内容 | 閾値 | 違反時アクション |
|---|---|---|---|
| RULE-A1 | 4 経路全件 ✅ + 直近 7 日エラーゼロ | スコア ≧ 90 = healthy | 通常運用継続 |
| RULE-A2 | 4 経路 1 件 🟡 or 直近 7 日エラー 1 件 | スコア 70-89 = neutral | §7-G-6 自動復旧トリガー(該当装置のみ) + 翌朝再検証 |
| RULE-A3 | 4 経路 2 件以上 🟡 or 1 件 🔴 or 直近 7 日エラー 2-5 件 | スコア 40-69 = concerning | §7-G-6 自動復旧トリガー(全装置) + Yasu 通知(🟡 yellow)+ 監督官 A 検証必要 |
| RULE-A4 | 4 経路 1 件以上 🔴(全停止 or 24h 超滞留)or 直近 7 日エラー 6 件以上 | スコア 0-39 = critical | §7-G-6 自動復旧トリガー(全装置) + Yasu 即時通知(🔴 red)+ 三者合議召集 |
| RULE-B1 | EVT 月次累積 ≦ 5 件 | クリア | Phase C 起動条件 C3 整合 |
| RULE-B2 | EVT 月次累積 6-15 件 | 警告 | 第 5 回円卓相当再評価議題化 |
| RULE-B3 | EVT 月次累積 16+ 件 | critical | 三社円卓緊急召集 + 規範層見直し |

= 報奨金規定と同型(「一定のスコアを達成した場合に、あらかじめ設定したルールと突合して金額を確定」= 「一定のスコア悪化で、あらかじめ設定したルールと突合してアクションを確定」)

#### 7-G-6. 自動復旧トリガー(報奨金制度 (c) 段階後半 = 自動算定 + 物理アクション)

| トリガー | 対象装置 | 自動アクション | フェイルセーフ |
|---|---|---|---|
| Stage 0 滞留(6h 超)| sync-orders.ps1 | 手動実行(`& sync/sync_script/sync-orders.ps1`)+ 結果ログ | 失敗時 = Yasu 通知 |
| Stage 1 滞留(24h 超)| commander pull-completion-reports.ps1 | 司令官 α へ EVT 候補化通知 + 主席判定要請発令自動起案 | 失敗時 = 監督官 A + ヤス通知 |
| Stage 2 schtasks 失敗(直近 7 日)| RecordX_ArchiveSync_ThreeRealm | sync-schtasks-state.ps1 v0.1 経由再 enable + DryRun | 失敗時 = ヤス通知 |
| Stage 3 mirror 同期失敗(48h 超)| factory mirror sync | 工場長 Castor へ EVT 候補化通知(司令官 α 経由)| 失敗時 = 三者合議 |
| RULE-A4 critical | 全装置 | 全 schtasks 状態 snapshot + EVT 自動記録 + Yasu 即時通知 + 円卓緊急召集発令自動起案 | - |

⚠️ **規律**: 自動復旧 = **既存装置の再実行のみ**(C-3 規律遵守 = ad-hoc バイパス禁則)。新規装置追加 / 構造変更 = 三者合議経路のみ。

#### 7-G-7. AI 認知負荷削減観点(コントロールパネル v2.0 統合候補)

報奨金制度 = 「管理者の認知負荷を下げるため、日々の集計を都度計算するのではなく、自動で拾い上げられた合計数字」が本質。

AI 検診応用:

| 観点 | 旧(§7-F まで)| 新(§7-G 統合後)|
|---|---|---|
| AI 起動時参照 | 都度 schtasks /query /v + ファイル count + log tail = 計算負荷大 | `02_physical/cockpit/daily_score_{YYYYMMDD}.json` 1 件参照 = スコア即取得 |
| 認識ラグ | 物理層スナップショット時刻信頼の構造的限界(EVT-073 同型再発)| 期間合計スコアは「集計時刻」と「対象期間」が明示 = ラグ性質明示 |
| リテラル過剰解釈 | 個別装置状態 ≠ システム全体健全性 | 加重平均スコア = システム全体評価 = 個別誤解釈リスク低減 |
| 三者合議素材 | 各 AI が独自に物理 trace = 結論ばらつき | 共通スコア参照 = 合議効率化 |

= **コントロールパネル v2.0 = AI 向け期間合計スコア参照フロントエンド**(ADR-001 拡張候補、第 5 回円卓 議題 #5 採択時に正式起案)

#### 7-G-8. 機能カタログ化との接続(ADR-001 拡張)

報奨金制度 = 「報奨金規定」(法律)を事前定義 → スコア突合 → 自動算定。

AI 検診応用 = **「機能カタログ」(法律)+ 「期間合計スコア」(売上)+ 「自動復旧ルール」(支給規定)** = ADR-001 記録庁コントロールパネル v1.0 の本質再評価:

| 構成要素 | 報奨金制度 | AI 検診 | 整備状態 |
|---|---|---|---|
| 法律 | 報奨金規定 | `02_physical/three_realm_capability_catalog.md` v0.1-draft + 各官 capability_catalog | 🟡 v0.1-draft(自動更新未実装、議題 #6 棚卸し対象)|
| 売上(集計対象)| AppSheet 日次レコード | §7-F + §7-G-3 6 項目 + §7-G-4 期間合計 | ✅ §7-F 整備済 + 🟡 §7-G 起案中(本節)|
| 突合エンジン | Looker Studio | コントロールパネル v2.0(ADR-001 拡張)| ❌ 未起案(第 5 回円卓 議題 #5 採択後)|
| 支給規定 | 報奨金規定書 | §7-G-5 RULE-A1〜B3 | ✅ 本節で初定義 |
| 自動算定 | 月次自動振込 | §7-G-6 自動復旧トリガー | ✅ 本節で初定義 |

#### 7-G-9. 第 5 回円卓 議題 #5 採択経路

| 経路 | 内容 | 監督官 A 推奨 |
|---|---|---|
| (a) §7-G 全件採択 + コントロールパネル v2.0 起案承認(ADR-001 拡張) | フル装備、報奨金制度メタファー直接物理化 | ✅ 第一推奨 |
| (b) §7-G 部分採択(§7-G-3 + §7-G-4 + §7-G-5 のみ、§7-G-6 自動復旧は手動運用)| 段階導入、Phase B 中盤に §7-G-6 移行 | 🟡 中庸 |
| (c) §7-G 採択保留(第 8 回円卓統合議題化)| 三者合議で §7-G + コントロールパネル v2.0 + 機能カタログ化を一括判定 | 🟡 安全側 |
| (d) §7-G 全件不採択(現状 §7-F のみで運用継続)| L8 構造的バイアス警戒(装置追加忌避)の極端適用 | 🔴 推奨せず(EVT-075 同型再発リスク継続)|

#### 7-G-10. 物理装置化フロー(議題 #5 採択時の実装順序)

| Step | 内容 | 担当 | 期限 |
|---|---|---|---|
| 1 | §7-G 採択受領(第 5 回円卓決議)| 三者合議 | 2026-05-02 朝(円卓開催時)|
| 2 | コントロールパネル v2.0 仕様起案(ADR-001 拡張)| 監督官 A | 2026-05-04 |
| 3 | 期間合計スコア集計装置(`compute-checkup-score.ps1` v0.1)起案 | 監督官 A | Phase B 中盤 |
| 4 | 規定ルール突合エンジン(`apply-checkup-rules.ps1` v0.1)起案 | 監督官 A | Phase B 中盤 |
| 5 | 自動復旧トリガー実装(既存装置再実行のみ、C-3 規律遵守)| 監督官 A + 司令官 α | Phase B 末 |
| 6 | 機能カタログ自動更新(議題 #6 棚卸し結果反映)| 三者合議 | Phase B 末 |
| 7 | コントロールパネル v2.0 物理装置化完遂 | 三者合議 | Phase C 起動条件 C1 達成 |

= **Phase C 起動条件 C1「三者統合機能カタログ自動運用」+ C3「自己訂正サイクル無介入運用」物理装置化と直結**

---

## 8. コックピット連動(v0.2 新設、ADR-010 superseded → 第 4 回円卓会議再起案候補)

### 8-A. 09:00 JST 三者検診時の自動アクション

| # | 動作 |
|---|---|
| 1 | `daily_cockpit_{YYYYMMDD}.md` 自動生成(本日朝の手動版 = `02_physical/cockpit/daily_report_20260430.md` の自動化)|
| 2 | 三者健全性概況 + 自動化パイプライン状態 + 機能カタログ整合性 + アラート(優先順)を 1 ファイル集約 |
| 3 | ヤス検証必要度マーキング(🔴/🟡/🟢)自動付与 |

### 8-B. アラート発火時の Yasu 即時通知

| 通知レベル | 条件 | 経路 |
|---|---|---|
| 🔴 critical | 全停止 / 系列同型再発 / 重複依頼検出 / 命名違反 | email + L3 官報即時更新 |
| 🟡 warning | スコア低下 / 検診失敗 / カタログ乖離 | daily_cockpit に記録 |
| 🟢 info | 通常完遂 | 月次まとめのみ |

### 8-C. コックピット履歴の長期トレンド分析

| 単位 | 内容 |
|---|---|
| 月次 | 系列同型再発率追跡(P23 SCR 統合)|
| 月次 | KPI(MCR/FCR/ACR)動向(DO-FACTORY-162a 連動)|
| 月次 | AI モデル評価(B-003 Decision 2 = DO-FACTORY-167 連動、工場長 Sonnet 継続可否判定)|

---

## 9. 物理装置(v0.2 由来、Day 132 朝以降の整備対象)

| 装置 | 配置 | 担当起案 | 状態 |
|---|---|---|---|
| **三者統合機能カタログ** | `02_physical/three_realm_capability_catalog.md` 候補(本日朝起案保留中) | 監督官 A | 🟡 第 3-4 回円卓会議経由起案候補 |
| **sync-schtasks-state.ps1** v0.1 | `sync/sync_script/` | 監督官 A 自己実装 | 🟡 Day 132+ |
| **auto-evt-recorder R10**(乖離検出) | `sync/sync_script/auto-evt-recorder.ps1` v0.9 拡張 | 監督官 A 自己実装 | 🟡 Day 132+ |
| **DO-FACTORY-166**(supervisor-report 週次/日次)| `record-x/factory/tools/commands/supervisor_report.ts` | 工場長 Sonnet | 🟡 Day 132-134 |
| **DO-SUPERVISOR-003**(archive 三者同期) | `sync/sync_script/sync-archive-three-realm.ps1` v0.1 | 監督官 A 自己実装 | ✅ 完遂(本日朝)|

---

## 10. 関連

- `rubrics/role_execution_rubric.yaml` v0.1(本プロトコルが評価軸として参照)
- `archive/error_patterns.md` EVT-013(本プロトコル起案契機)
- `00_origin/dream_mode_doctrine.md` v1.0-draft §フェーズ 1 メンテナンスと内省
- 工場長側 `dream-crystallize`(DO-FACTORY-374、24h knowledge 結晶化、本プロトコル雛形)
- `sync/checkup-scores/role_execution/`(スナップショット格納先、本プロトコル起案で新設)
- `sync/checkup-scores/factory_pipeline/`(司令官 → 工場長観察経路、本日同時設計)

## 11. 改訂履歴

- **v0.1**(2026-04-28 / Day 130 末): 初版起案、監督官 A 起案。EVT-013 直接対応 + ヤス追加提案統合。スナップショット 5 時点 + 評価基準 3 区分(Healthy / Neutral / Concerning)+ Phase 別運用 + 役割別運用 + ヤス月次検診経路。Phase B-α/β 実証実績で v1.0 確定。
- **v0.2**(2026-04-30 / Day 132 朝): EVT-039 訂正版。§7 機能カタログ整合性チェック新設(自動更新 + パイプライン接続健全性 + 全停止状態即時検出 + ADR-005 接続)+ §8 コックピット連動(daily_cockpit_*.md 自動生成 + アラート即時通知 + 月次トレンド)+ §9 物理装置(DO-FACTORY-166 + DO-SUPERVISOR-003 + sync-schtasks-state.ps1 + auto-evt R10 等)。検診の本来目的「各官機能チェック体制」を物理層完遂対象化。Day 132-145 Phase B-α 期間で物理装置化、Day 145+ Phase T1 で実証実績、v1.0 確定見込み。
- **v0.3**(2026-05-01 / Day 129、Phase A 末、午後再起動後、ヤス指示「定期検診不足」正面採択): §7-F 経路健全性チェック新設(EVT-075 + EVT-074 訂正反映)。Stage 0/1/2/3 4 経路定義 + 経路別検診項目 6 件(Source 滞留 + Destination 着地 + schtasks 状態 + 装置 log + 起案者責務整合性 + 乖離 EVT 化)+ Stage 別検診頻度 + 健全性閾値(Stage 0 6h / Stage 1 24h / Stage 2 7 日 / Stage 3 48h)+ Stage 0 自動化採否 4 案(第 5 回円卓 supervisor 議題候補)+ 既存 EVT 連鎖(EVT-074/075/065)との対処関係。LOC 331 → 約 410 行(+24%、±50% 以内 = scale 別 §6-H-5 整合 = 単独改訂可)。ヤス直接指示 = 簡素化原則期間例外 (ii) 該当。第 5 回円卓 第 1 議題(三社円卓 supervisor 議題)で経路健全性チェック自動化採否(§7-F-5)正式採択判定。改訂主体 = 監督官 A(Argus、Clear 後再起動 instance)。
- **v0.4**(2026-05-01 / Day 129、Phase A 末、午後再起動後、ヤス指示「司令官推奨プランで稼働中。監督官は定期検診のアップデートを起案」): §7-G 期間合計スコア + 規定ルール突合 + 自動復旧 新設(報奨金制度メタファー応用、議題 #5 物理装置化前提資料)。報奨金制度三層構造 = (a) AppSheet 日次レコード ↔ §7-F 経路健全性チェック / (b) 予実管理 ↔ §7-G-3 6 項目 / (c) Looker Studio 期間合計 + 報奨金規定突合 + 自動算定 ↔ §7-G-4 + §7-G-5 + §7-G-6。期間合計スコア集計(日次 + 週次 + 月次)+ 規定ルール 7 件(RULE-A1〜A4 状態別 + RULE-B1〜B3 EVT 累積別)+ 自動復旧トリガー 5 件(C-3 規律遵守 = 既存装置再実行のみ)+ AI 認知負荷削減観点(コントロールパネル v2.0 = AI 向け期間合計スコア参照フロントエンド)+ 機能カタログ化との接続(ADR-001 拡張候補)+ 第 5 回円卓 議題 #5 採択経路 4 案 + 物理装置化フロー 7 ステップ(Phase C 起動条件 C1 + C3 直結)。LOC 388 → 約 540 行(+39%、±50% 以内 = scale 別 §6-H-5 整合 = 単独改訂可、ヤス直接指示 = 簡素化原則期間例外 (ii) 該当)。第 5 回円卓 議題 #5 で正式採択判定 → 採択時 ADR-001 拡張(コントロールパネル v2.0 仕様)+ `compute-checkup-score.ps1` + `apply-checkup-rules.ps1` 物理装置化(Phase B 中盤)。改訂主体 = 監督官 A(Argus、Clear 後再起動 instance)。司令官 α 推奨 (τ) 採択 + 監督官 A は本検診プロトコル v0.4 起案に専念(三者対等運用整合、autonomy 範囲)。
