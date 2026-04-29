# inbox/escalations/ — エスカレーション通知ファイル投函先

**配置先**: `inbox/escalations/`
**起草日**: 2026-04-28(Day 130、本リポジトリ初稼働セッション)
**目的**: ヤスエスカレーション通知の冗長配信先(メール + 本ディレクトリ + 司令官側 inbox/escalations/ の 3 経路冗長)
**根拠**: `operations/escalation_and_rollback.md` v1.0 §3 通知チャネル

---

## 0. 本ディレクトリの位置づけ

`order-stale-alert.ps1` v1.0 + 将来の `notify-yasu.ps1`(司令官側マスター、commit `f09acbd` で skeleton 配置済)からエスカレーション通知ファイルが投函される受信箱。

メールが配信されない / 配信遅延した場合のフォールバック装置 + 過去通知履歴の追跡性確保。

## 1. ファイル命名規則

```
ESC-{YYYYMMDD}-{HHMMSS}-{TRIGGER}-{IDENTIFIER}.md
```

例:

- `ESC-20260428-093015-Y3-20260428_to_commander_006.md`(発令期限超過)
- `ESC-20260428-094500-Yresp-20260428_to_commander_007.md`(応答未着 6h+)
- `ESC-20260428-100000-Ystag.md`(対話停滞 7 日)
- `ESC-20260428-103000-R1-axis_8_red.md`(軸 8 赤判定)

`TRIGGER` は `operations/escalation_and_rollback.md` §2 の R1-R7 / Y1-Y6 / 派生コード(Yresp / Ystag 等)。

## 2. ファイル構造

各 ESC ファイルは frontmatter + 本文構造:

```yaml
---
escalation_id: ESC-{YYYYMMDD}-{HHMMSS}-{TRIGGER}-{...}
severity: red | yellow | info
trigger: R1 | R2 | ... | Y1 | ... | Yresp | Ystag | ...
detected_at: 2026-MM-DD HH:MM:SS JST
detected_by: order-stale-alert.ps1 v1.0 | review-implementation.ps1 v1.0 | manual | ...
---

# Escalation: {ESC-ID}

## Details

{trigger 詳細、機械検出 or 手動記載}

## Recommended Action (Supervisor view)

{監督官観点の推奨対応}

## Yasu Decision Required

{red severity 時のみ、ヤス判断必須事項}
```

## 3. 削除禁止 + 史実保持

ESC ファイルは **削除禁止**。誤検出だった場合も以下で対応:

- ESC ファイルに `false_positive: true` 注記を追記
- `archive/error_patterns.md` に EVT エントリを追加(自動化失敗カテゴリ)
- 検出ロジックを修正(scripts/order-stale-alert.ps1 v1.x 改訂)

これは sp500_theory.md §1「指数を算出する運動」の継承装置 — 失敗事例自体が学習素材。

## 4. ヤス確認後の処理

ヤスがエスカレーションを確認・判断した場合:

1. 同フォルダに `{ESC-ID}_resolution.md` を配置(ヤス回答記録)
2. `escalation_and_rollback.md` §5 復旧プロトコル実行
3. `archive/error_patterns.md` の該当 EVT エントリ更新

## 5. 司令官側との同期

司令官側 `inbox/escalations/`(commit `f09acbd` で配置済 skeleton)と本ディレクトリは **冗長運用**:

- マスター = 投函側スクリプト(monitor-stale-alert / notify-yasu 等)から両側に同時投函
- 監督官側で確認 = 監督官手動セッションで対応判断
- 司令官側で確認 = 司令官 Layer 2 自律巡回で対応判断(Phase B-α 起動後)

## 6. 関連

- `operations/escalation_and_rollback.md` v1.0(エスカレーション仕様)
- `sync/sync_script/order-stale-alert.ps1` v1.0(投函元)
- `archive/error_patterns.md` v1.0(学習結晶化先)
- `commander#sync/sync_script/notify-yasu.ps1` v0.1-skeleton(メール送信実装、Phase B-α 起動後)

---

## 7. 改訂履歴

- v1.0(2026-04-28 / Day 130 朝): 初版起草。inbox/escalations/ ディレクトリ確立、ファイル命名規則 + 構造仕様 + 削除禁止 + 司令官側同期方針を確立。
