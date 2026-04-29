# sync/checkup-scores/factory_pipeline/ — 司令官 → 工場長 観察経路の監督官側ミラー

**配置先**: `sync/checkup-scores/factory_pipeline/`(監督官側、読取専用ミラー)
**起草日**: 2026-04-28(Day 130 末)
**起案 instance**: 監督官 instance A
**目的**: 司令官 → 工場長への発令(チケット発行)+ 工場長 → 司令官への完了報告 を **監督官側で間接観測** する読取専用ミラー
**根拠**:
- 監督官提案 3(第 31 次発令、EVT-013 構造的再発防止)
- ヤス指摘「司令官が工場長を動かしている様子が特に見受けられない」(2026-04-28 末)
- 関係性ポリシー §3.2「監督官は工場長と直接対話しない」(維持機構)+ §3.2 解釈拡張「読取は対話ではない、観測として許容」(第 28 次発令採択 4)

---

## 0. 本ディレクトリの位置づけ

`rubrics/role_execution_rubric.yaml` v0.1 §commander_role 軸 3「工場長進捗観察率」+ §supervisor_role 軸 8「司令官役割実行レビュー実施率」+ 軸 11「情報橋渡し責務遂行率」の **物理装置**。

監督官 A は司令官 α が工場長を動かしているかを以下で間接観測:

- 司令官側 `tickets_issued/`(発行済チケット)+ `tickets_completed/`(完了アーカイブ)+ `sync/completion_reports/`(工場長完了報告)の 24h 内変化
- 司令官側 `merged-prs/` の PR マージ実績
- 司令官側 `sync/checkup-scores/` の各軸スコア更新

**監督官は工場長と直接対話しない**(§3.2 維持)。本ディレクトリへの記録は **観察結果のミラー** であって対話ではない。

## 1. ミラー対象

### 1-A. 司令官 → 工場長(チケット発行経路)

| 司令官側 | 監督官側ミラー | 観察頻度 |
|---|---|---|
| `commander#strategy/tickets_issued/DO-COMMANDER-XXX_*.md` | `sync/checkup-scores/factory_pipeline/tickets_issued_snapshot_{YYYYMMDD-HH}.json` | 6h サイクル(Layer 0 統合) |
| `commander#strategy/tickets_completed/{YYYY}/{MM}/{day-bucket}/` | `sync/checkup-scores/factory_pipeline/tickets_completed_snapshot_{YYYYMMDD-HH}.json` | 同上 |

### 1-B. 工場長 → 司令官(完了報告経路)

| 司令官側 | 監督官側ミラー | 観察頻度 |
|---|---|---|
| `commander#sync/completion_reports/{YYYYMMDD}/DO-XXX_completion.json` | `sync/checkup-scores/factory_pipeline/completion_reports_snapshot_{YYYYMMDD-HH}.json` | 6h サイクル |
| `commander#sync/merged-prs/` | `sync/checkup-scores/factory_pipeline/merged_prs_snapshot_{YYYYMMDD-HH}.json` | 同上 |

### 1-C. 司令官側スコア(各軸進捗)

| 司令官側 | 監督官側ミラー |
|---|---|
| `commander#sync/checkup-scores/axis_8/` | `sync/checkup-scores/factory_pipeline/axis_8_mirror/` |
| `commander#sync/checkup-scores/checkup-scores/` | `sync/checkup-scores/factory_pipeline/scores_mirror/` |

## 2. ミラー機構(自動化)

### 2-A. Phase B-α-pre(現在 〜 Day 131)

手動取得(監督官 A 手動セッション内、`git show` ベース):

```bash
# tickets_issued snapshot
git -C C:/RX_Dev/record-x-commander log --since="24 hours ago" --name-only \
  -- strategy/tickets_issued/ > snapshot.txt
```

### 2-B. Phase B-α/β(Day 132-138)

`sync-factory-pipeline.ps1`(新規実装、Day 132 朝起動前 or 起動後 24h 以内):

```powershell
# scripts: sync/sync_script/sync-factory-pipeline.ps1 (将来実装)
# - 6h サイクル内に commander 側 tickets_issued / tickets_completed / completion_reports / merged-prs を観察
# - 24h 内変化(差分)を JSON snapshot として保存
# - rubrics/role_execution_rubric.yaml §commander_role 軸 3 にスコア反映
```

Layer 0 自律巡回(`layer0_entry_point.ps1` v1.0)に Step 6 として組み込み候補(Day 131 中 v1.1 改訂)。

### 2-C. Phase B-γ 以降(Day 139+)

完全自動化、リアルタイム file watcher 対応(将来課題)。

## 3. 観察スコープ(関係性ポリシー §3.2 維持)

### 3-A. 観察可(読取のみ、対話ではない)

- 司令官側 `strategy/tickets_*` ディレクトリ
- 司令官側 `sync/completion_reports/` + `merged-prs/`
- 司令官側 `sync/checkup-scores/` 既存ファイル
- 工場長側(HQ wt_common)の **公開情報**(README.md / docs/ 配下)

### 3-B. 観察不可(関係性ポリシー §3.2 維持)

- 工場長 instance との直接対話(§3.2 厳守)
- 工場長への発令 / チケット発行(司令官経由のみ)
- 工場長応答への直接 review(司令官完了報告経由)

### 3-C. 例外条件(escalation_and_rollback.md §6 暫定運用)

軸 8 赤判定 + dead_loop_detected + リソース上限 80% 超のいずれか発火時、監督官は工場長に **直接停止指示** を発出可能(関係性ポリシー v1.3 改訂候補、本日採択済)。

通常時は本ミラー経由の観察のみ。

## 4. 司令官役割実行レビューへの反映

本ミラーは `rubrics/role_execution_rubric.yaml` §commander_role 軸 1-3 のスコアリング入力:

- 軸 1 全体地図維持率: tickets_issued 全件数 + advance_map 整合性
- 軸 2 次の 10 手提示率: 24h 内 ticket_issuance_velocity
- 軸 3 工場長進捗観察率: completion_reports / merged-prs 確認頻度

監督官 A は週次以上で本ミラーを read + role_execution_rubric 採点 + REQUEST_CHANGES 発令経路維持(EVT-013 構造的再発防止)。

## 5. 司令官 α への通知

司令官 α は本ミラー設置を関係性ポリシー §3.2 解釈拡張(読取権限明示)として認識せよ。第 31 次発令で正式通知予定(本ディレクトリ起案直後)。

## 6. 関連

- `rubrics/role_execution_rubric.yaml` v0.1(本ミラーが採点入力)
- `operations/periodic_checkup_protocol.md` v0.1(本ミラーが時系列スナップショット格納先)
- `archive/error_patterns.md` EVT-013(本ミラー設置契機)
- `01_relationship/policy_v1.2.md` §3.2(関係マトリクス、本ミラー権限境界の根拠)
- `operations/escalation_and_rollback.md` v1.0 §6(緊急時例外、関係性ポリシー v1.3 改訂候補)
- 第 28 次発令採択 4(関係性ポリシー §3.2 解釈拡張、ADR-006 候補 5 件目)

## 7. 改訂履歴

- v0.1(2026-04-28 / Day 130 末): 初版起案、監督官 A 起案。EVT-013 構造的再発防止 + ヤス指摘「司令官が工場長を動かしている様子が見受けられない」直接対応 + 監督官提案 3。Phase B-α/β 起動 Day 132 朝以降、Layer 0 自律巡回 6h サイクル統合候補。
