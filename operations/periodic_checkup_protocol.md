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
