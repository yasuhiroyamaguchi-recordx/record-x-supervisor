# チケット台帳 SSOT 整流宣言 v0.1 草案

**配置先**: `staging/ticket_ledger_ssot_clarification_v0.1_draft.md`
**起案日**: 2026-05-04 PM(JST)
**起案者**: 監督官 A(Argus)
**契機**: EVT-20260504-117（チケット二重台帳）+ 工場長 Castor 認識共有
**ヤス採否**: 未（staging 配置 — 司令官 α 経由実装前提）

---

## §1. 問題の一文定義

「チケット数」「未消化」という語が、**異なるファイル／ディレクトリ（別レジストリ）**を指しているときに、そのまま数値だけを報告すると **三者間で不可逆な認識ズレ**が発生する。

---

## §2. SSOT（単一情報源）宣言案（採択推奨）

| 項目 | 宣言内容 |
|---|---|
| **アクティブチケット SSOT** | `record-x-commander/strategy/tickets_issued/active/**/*.md` |
| **完了済みアーカイブ** | `record-x-commander/strategy/tickets_completed/**`（運用上の参照用） |
| **HQ 投入経路** | 司令官 α 主管の `sync-tickets`（既存装置の地位確認のみ・新規二重台帳装置は増やさない） |

上記以外のパスで「アクティブ残件」を語る場合は、**必ず SSOT ではない旨を明示**する。

---

## §3. 非 SSOT（参照時はパスと状態を必ず併記）

| レジストリ | 典型パス | 状態（2026-05-04 確証時点） |
|---|---|---|
| 工場ツール tasks グラフ | `ProjectRX_HQ/**/record-x/factory/state/tasks.json` | `updated_at` **2026-04-06** で更新停止（**凍結コピー**） |
| IMPL メモチケット | `**/factory/state/tickets/*.md` | すべて **draft** の別系統 |
| ルート `tickets/`（HQ） | `ProjectRX_HQ/tickets/` | **空**（別用途の可能性 — 実態 query 要） |

### §3-A. DEPRECATED マーカー仕様（司令官／工場長実装側）

対象: `tasks.json` と同じディレクトリに **`README_TICKET_REGISTRY_DEPRECATED.md`**（または JSON 先頭ブロックコメントが許される場合はその形式）を **1 ファイル追加**する。

必須文言（例・そのまま貼付可）:

```
STATUS: DEPRECATED (frozen snapshot)
FREEZE_DATE: 2026-04-06
SUPERSEDED_BY: record-x-commander/strategy/tickets_issued/active/
RULE: 数値報告時は本パスを明示し、「SSOT ではない」と併記すること。
```

**採用しない案**: `tasks.json` と SSOT を **双方向同期**する新スクリプト（装置追加 — ガレージ §1.5 違反候補）。

---

## §4. 報告規律（三者 + ヤス向け）

チケット件数・残件・枯渇を報告するときは **必ず次をセットで書く**:

1. **レジストリ種別**（例: `commander/tickets_issued/active`）
2. **絶対パスまたはリポジトリ相対パス**
3. **計測時刻（JST）**
4. **SSOT か否か**（Yes / No）

例:

> アクティブ残: **107** / SSOT: **Yes** / path: `record-x-commander/strategy/tickets_issued/active/` / captured: **2026-05-04 18:05 JST**

> 工場 tasks.json ベース残: **40** / SSOT: **No（凍結 2026-04-06）** / path: `ProjectRX_HQ/core/record-x/factory/state/tasks.json`

---

## §5. パイプライン出力への 1 行追記（要請）

`sync/sync_script/sync-factory-pipeline.ps1` の Summary に固定 1 行（**監督官 repo に実装済み**、v0.2 Summary 先頭）。

ログ出力は **ASCII**（PowerShell 5.1 でのパース安定のため）。意味は次と同等:

```
SSOT_REMINDER: commander/strategy/tickets_issued/active = アクティブチケット SSOT | factory/state/tasks.json = 2026-04-06 凍結参照のみ（非 SSOT）
```

実際のコンソール／ログ例:

```
SSOT_REMINDER: commander/strategy/tickets_issued/active = active ticket SSOT | factory/state/tasks.json = frozen 2026-04-06 snapshot only (not SSOT)
```

DO-CP-040 集約スクリプト側への統合は司令官 α 主管で継続可。

---

## §6. 改訂履歴

- v0.1-draft(2026-05-04 PM): 初版起案（EVT-20260504-117 連動）
- v0.1-draft-a(2026-05-04 PM): §5 — `sync-factory-pipeline.ps1` に Summary 恒常行を実装（推奨プラン実行）
