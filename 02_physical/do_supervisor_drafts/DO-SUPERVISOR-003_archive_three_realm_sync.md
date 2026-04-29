DO-SUPERVISOR-003を実装。
ブランチ: feat/archive-three-realm-sync-do003 (監督官 A 自己実装、commander 経由不要)
コミット: feat(sync): archive 三者同期スクリプト sync-archive-three-realm.ps1 v0.1 [DO-SUPERVISOR-003]
mainを最新にpullしてからブランチ切ること。

【実装モード: QUICK_IMPLEMENT】

監督官 A 自己実装(supervisor リポジトリ完結)。第 44 次発令 §3 反論 2(archive 三者同期経路欠落)別 DO 化として起案。DO-FACTORY-166 v1.x の前提整備、Phase 1 監督官 A コパイロット稼働の必須条件。

PR 不要(監督官 A 自己実装、direct commit on main 許容)。<!-- DOD_ACK -->

⚠ 本 DO は sync 系インフラ拡張。state/ 書込なし、既存 sync-regional.ps1 v1.0 同型実装パターン踏襲。

---

# DO-SUPERVISOR-003: archive 三者同期スクリプト v0.1

## 担当: 監督官 instance A(自己実装、supervisor リポジトリ完結)
## 種別: feat / Infrastructure / sync / B-003 Phase 1 前提整備
## 優先度: P0(DO-FACTORY-166 前提条件)
## Wave: 統治 / AI 全自動化作戦
## 依存: sync-regional.ps1 v1.0(既存、同型パターン参照)
## 競合注意: 既存 sync-regional.ps1 と協調(本 DO は archive ミラー専用、regional は触らない)

## 背景

第 44 次発令 §3 反論 2 で別 DO 化要請:

> DO-FACTORY-166 §3 注意事項「commander 側 `archive/error_patterns.md` 等を直接読取せず、factory 内に同期されたデータ(あれば)を使用」 → factory 側に supervisor archive が未同期な場合、supervisor_report は factory 内アクティビティのみ = 監督官 A コパイロット目的(三者統合可視化)未達 + KPI 週 65 分達成根拠薄弱化。

= **archive 三者同期経路の物理層整備** が DO-FACTORY-166 Phase 1 稼働の必須条件。本 DO で対処。

## 設計目標

| 観点 | 内容 |
|---|---|
| **同期対象** | supervisor archive(EVT/B-番号/outbox 等)+ commander archive(failure_log 等) → factory 側ミラー |
| **方向** | supervisor + commander → factory(一方向、ミラー読取専用)|
| **更新頻度** | scheduler 統合(03:00 JST 監督官側 dream-crystallize と同タイミング)+ 手動実行可 |
| **冪等性** | mtime ベース差分転送、重複コピー回避 |
| **DO-FACTORY-166 接続** | supervisor_report.ts が factory 側ミラーを集計対象として読取 |

## 修正対象ファイル

1. **新規**: `record-x-supervisor/sync/sync_script/sync-archive-three-realm.ps1`(目安 100 行以内)
2. **新規**: `record-x-supervisor/sync/scheduler_templates/archive_three_realm_sync_template.xml`(scheduler XML)
3. **変更(任意)**: `record-x-supervisor/scripts/scheduler_templates/layer0_entry_point.ps1`(Layer 0 自律巡回 Step 末尾に本同期統合、将来候補)

## 修正内容(仕様)

### sync-archive-three-realm.ps1(新規)

#### 同期マッピング

| 同期元 | 同期先 | 対象ファイル |
|---|---|---|
| `record-x-supervisor/archive/error_patterns.md` | `ProjectRX_HQ/wt_common/record-x-mirror/supervisor/archive/error_patterns.md` | EVT 累積 |
| `record-x-supervisor/archive/board_council_decisions.md` | 同上配下 | B-番号台帳 |
| `record-x-supervisor/outbox/*.md` | `ProjectRX_HQ/wt_common/record-x-mirror/supervisor/outbox/` | 発令累積 |
| `record-x-commander/archive/error_patterns.md`(将来同期完成後)| `ProjectRX_HQ/wt_common/record-x-mirror/commander/archive/error_patterns.md` | commander 側 EVT |
| `record-x-commander/strategy/decisions/*.md` | 同上配下 | commander 決裁 |

#### CLI 仕様

```
.\sync\sync_script\sync-archive-three-realm.ps1 [-DryRun] [-VerboseOutput]
  [-FactoryMirrorRoot "C:\RX_Dev\ProjectRX_HQ\wt_common\record-x-mirror"]
  [-CommanderRoot "C:\RX_Dev\record-x-commander"]
  [-Direction push]
```

- デフォルト: 一方向(supervisor + commander → factory mirror)
- `-DryRun`: 同期予定のみ表示、実コピーなし
- mtime ベース差分転送(変更ファイルのみコピー)

### scheduler XML(新規)

- 起動時刻: **02:55 JST**(03:00 JST 監督官 dream-crystallize の 5 分前)
- 実行頻度: 日次
- 既存 `dream_crystallize_template.xml` 同型構造

## DoD(完了条件)

- [ ] `sync-archive-three-realm.ps1` v0.1 作成(100 行以内、PowerShell strict mode 整合)
- [ ] DryRun 動作確認(supervisor → factory mirror 同期予定 N 件表示)
- [ ] 実行動作確認(初回実行で supervisor archive がミラーに配置)
- [ ] mtime ベース差分転送動作(2 回目実行で変更ファイルのみコピー)
- [ ] scheduler XML 配置 + 02:55 JST 日次起動定義
- [ ] `archive/error_patterns.md` に EVT-041 候補(本 DO 由来の構造的盲点解消)記録

## guardrails

| guardrail | 物理装置 |
|---|---|
| 一方向同期(逆方向なし)| ミラー側への書込のみ、読取なし(ミラーは factory 自己読取専用)|
| factory 側 forbidden_paths 尊重 | `record-x/` 配下ではなく `record-x-mirror/` 配下に配置(独立ディレクトリ)|
| commander リポジトリは読取のみ | commander 側 archive は変更しない |
| 失敗時 fail-safe | エラー時は部分同期で停止(ミラー破壊なし)|

## 工場長への接続

DO-FACTORY-166 Phase 1 稼働前に本 DO 完遂 → factory mirror に supervisor archive 配置 → supervisor_report.ts が `ProjectRX_HQ/wt_common/record-x-mirror/supervisor/` を集計対象として読取。

司令官 α 第 48 号応答の懸念(「factory 内に同期されたデータ(あれば)を使用」)を物理層解消。

## 関連参照

- 第 44 次発令: `outbox/20260430_to_commander_002.md` §3 反論 2(別 DO 化要請)
- DO-FACTORY-166 v1.x: `record-x-commander/strategy/tickets_draft/DO-FACTORY-166_supervisor_report_copilot.md`
- B-003: `archive/board_council_decisions.md` §B-003 Decision 1
- 既存同型: `sync/sync_script/sync-regional.ps1` v1.0
- ADR-009 §6 三者統合自動化(本 DO の上位構造)

## 改訂履歴

- v1.0(2026-04-30 / Day 132 朝): 初版起案、監督官 instance A、第 44 次発令 §3 反論 2 別 DO 化要請契機。DO-FACTORY-166 Phase 1 稼働の前提整備として、archive 三者同期スクリプト sync-archive-three-realm.ps1 v0.1 を監督官 A 自己実装で起案。
