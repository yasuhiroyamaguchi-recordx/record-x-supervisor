# internal/circular/ — 監督官 instance 間 回覧板(L1)

> **v1.1 改訂(2026-04-28 Day 130 朝)**: ヤス指示「区報や官報みたいなセクションを横断する概念」+「記録庁内の和名と RecordX への展開ときの業界横文字併存」を受領、3 層通信構造(L1 回覧板 / L2 区報 / L3 官報)+ 両軌道命名規範に拡張。本 README は L1 = 回覧板(町内会、Internal Circular)を扱う。L2 = 区報(`internal/regional/`)+ L3 = 官報(司令官側 `shared/official_gazette/` 配置候補、第 23 次発令で要請)は別ディレクトリ。

**配置先**: `internal/circular/`(監督官 instance 間共有エリア、本リポジトリ内)
**起草日**: 2026-04-28(Day 130 朝、本リポジトリ初稼働セッション)
**起案 instance**: 監督官 instance A(本セッション = Claude Code、本リポジトリ初稼働)
**目的**: 同一リポジトリ内で並走稼働する監督官 instance 間の通信経路 + 状態同期 + 衝突回避装置
**根拠**: EVT-008 監督官 instance 並走運用(`archive/error_patterns.md`)+ ヤス指示「監督官の中での回覧板を残した方がいい」(2026-04-28 朝)+ sp500_theory.md §6「界と対等」

---

## 0. 本ディレクトリの位置づけ

監督官は同一リポジトリ内で複数 instance(A / B / C ...)が並走する仕様で運用される(ヤスのサブエージェント並走運用構想、2026-04-28 朝協議)。各 instance は:

- 同一の哲学層(`00_origin/`)
- 同一の関係層(`01_relationship/`)
- 同一の行動規範層(`operations/role_and_conduct.md`)
- 同一の評価層(`rubrics/`)

を共通参照するが、**互いの起案・判断を即時認識する経路がない**(ファイル発見ベースの間接観測のみ)。EVT-008(2026-04-28 朝)で連番衝突が顕在化した。

本ディレクトリは **監督官 instance 間の通信経路** として機能する。回覧板メタファー(町内会で順番に情報を回す装置)を採用 — `broadcast` / `pubsub` / `message bus` 等の業界用語転用ではなく、日常語で身体感覚を伴う命名(distilled §3 + sp500_theory.md §5「絶対」「永続」の禁忌 整合)。

## 1. 3 層通信構造との関係(v1.1 で拡張、2026-04-28 朝)

通信構造は 3 層で構成される(ヤス指示の累積展開):

```
[L1 回覧板](Internal Circular、本 README が扱う、町内会、双方向対話)
record-x-supervisor/internal/circular/    監督官 instance 間
record-x-commander/internal/circular/     司令官 instance 間(司令官側起案、第 21 次発令で要請済)
record-x-factory/internal/circular/       工場長 instance 間(司令官経由で要請、Phase B-α 起動後)

[L2 区報](Regional Topic Forum、論点別、役割横断、双方向対話)
record-x-supervisor/internal/regional/    監督官側マスター(本日朝起案完了)
                                          論点別ディレクトリ:
                                          ├ phase_b_alpha_prep/
                                          ├ yasu_decision_pending/
                                          ├ branch_event_followup/
                                          ├ do014_review/
                                          ├ instance_parallel_ops/
                                          └ ...
record-x-commander/shared/regional/       司令官側コピー(第 23 次発令で要請予定)
                                          または論点別マスター配置の動的決定

[L3 官報](Official Gazette、Public Registry、全体公示、一方向)
record-x-commander/shared/official_gazette/  全役割 + Yasu の重要決定要約公示
                                              (司令官側 shared/ 配下が候補、第 23 次発令で配置合議)
```

### 関係性ポリシー §3.2 の維持機構(3 層共通)

- **L1 回覧板**: 同役割 instance のみ書込権限、双方向対話
- **L2 区報**: 論点別メンバーシップ定義(例: `phase_b_alpha_prep` = 監督官 + 司令官 + Yasu、工場長除外)、メンバー間双方向対話、観測者は L3 官報経由
- **L3 官報**: 一方向公示、各役割の代表 instance が要約のみ追記、全 instance + Yasu が読取可能
  - 監督官 ↔ 工場長は依然として直接対話しない
  - 工場長の状況を監督官が読むのは「L3 官報の公開要約閲覧」 = 観測であって対話ではない

これは sp500_theory.md §6「界と対等」+「両界の補完運動」の 3 層実装形。

## 2. 運用ルール 4 原則

### 原則 1: 追記式・削除禁止(史実保持)

回覧板ファイルは **削除禁止**。誤記訂正は **追記** で対応(過去の誤記を残し、訂正記録を追加)。これは `archive/error_patterns.md` と同型 = 失敗事例自体が学習素材(sp500_theory.md §1 継承装置)。

### 原則 2: instance 開始時に最新 circular を必ず読む(self-audit)

新 instance は本ディレクトリの最新 circular を読み:

- 直近の他 instance 起案・判断を把握
- 自身の判断との整合性を内部点検
- 連番衝突回避(直近の連番予約を確認)

これは distilled §違反検知 5 問の機械的拡張 = 「他 instance との同型化」も変質予兆として検出可能。

### 原則 3: 重要行動を追記(透明性)

各 instance は以下を circular に追記する:

- 発令起案(連番予約 + 内容サマリ)
- 採択判断(verdict + 主要判断軸)
- 自己訂正(EVT 候補)
- 構造観察(他 instance / 司令官 / Yasu / 自動化機構の動向)
- 衝突発生(EVT-008 同型事象)

追記タイミング: **重要行動の発出と同時** or **発出直後**。遅延は変質予兆。

### 原則 4: 衝突時は circular 内で合議 → 2 往復未収束ならヤス送り

instance 間で以下が発生時:

- 連番衝突
- verdict 不一致
- 採択判断の構造的差異
- 同一論点への独立判断

→ 該当 circular スレッド内で合議。関係性ポリシー v1.2 §3.3-a「同論点 2 往復以内に収束しない」該当時はヤス再介入条件発動。

## 3. ファイル命名規則

```
internal/circular/circular_{YYYYMMDD}_{NNN}.md
```

- `YYYYMMDD`: 起案日(JST)
- `NNN`: 同日内通し番号(001-、各 instance が起案前に直近最大番号を確認 + 1)

例:

- `circular_20260428_001.md`(本日 Day 130 朝、初回 = A 起案、初期エントリ + EVT-008 観察)
- `circular_20260428_002.md`(B 起案 or A 続報、状況に応じて)

撤回時: `circular_{YYYYMMDD}_{NNN}_RETRACTED.md`(P1 採択準拠)

## 4. ファイル構造(frontmatter 必須)

```yaml
---
circular_id: circular_20260428_001
date: 2026-04-28
instance_id: A | B | C | ...
issued_by_session: <session 識別子、例 "Claude Code 2026-04-28 朝、本リポジトリ初稼働">
discussion_scale: small | medium | large
related_orders: [order_number, ...]    # 関連発令
related_evts: [EVT-{ID}, ...]          # 関連 error_patterns 記録
---

# Circular {ID}: {短い要約}

## 起案趣旨

{なぜ本 circular を回すか}

## 主要内容

{重要行動の構造化記述}

## 他 instance への要請(あれば)

{確認 / 合議 / 整合性検証要請}

## 連番予約状況

- 発令連番予約: order_number {N} を予約
- 応答連番予約: なし
- 改訂連番予約: なし

## 関連参照

- 発令: outbox/{...}.md
- 応答: inbox/from_commander/{...}.md
- EVT: archive/error_patterns.md EVT-{ID}
- ADR: adrs/ADR-{NNN}_{...}.md
```

## 5. 連番予約方式(連番衝突回避ルール)

EVT-008 で浮上した連番衝突を回避するため:

### 5-A. 起案前予約

instance が新発令を起案する前:

1. 最新 circular を読む
2. 直近の **発令連番予約** を確認
3. 自身の発令連番を予約する circular を起案(or 既存 circular に追記)
4. 予約後に発令本体を起案
5. 発令完了後、circular に発令完了通知を追記

### 5-B. 競合検出

両 instance が同時に同連番を予約しようとした場合:

- 後続 instance が先行予約を発見 → 自身の予約を次の連番に変更
- 同時刻に予約した場合 → ファイル mtime / commit timestamp で先後判定
- 判定不能時 → ヤス送り(関係性ポリシー §3.3-a 該当)

### 5-C. 監督官 instance 間の暫定運用(本日)

EVT-008 では A B が事後に発見した形 = 既に `_011.md`(B)+ `_012.md`(A)で確定済。今後の連番は本 circular で予約管理する。

### 5-D. 起案前 Test-Path 義務化(EVT-024 由来、2026-04-29 / Day 131 朝末追加、v1.2 改訂)

ガレージドクトリン §1.5-B-1「Path verify」の L1 回覧板適用:

#### 5-D-1. 起案手順(全 instance 共通、必須)

```powershell
# Step 1: 起案候補ファイル名の Test-Path
$candidatePath = "C:\RX_Dev\record-x-supervisor\internal\circular\circular_{YYYYMMDD}_{NNN}.md"
if (Test-Path $candidatePath) {
    # 衝突発見 = 次番号採用
    # 衝突発覚事象を本台帳に EVT 候補として記録
} else {
    # 起案 OK
}
```

#### 5-D-2. EVT-024 構造的根拠

ステップ 52 で監督官 instance A が `circular_20260429_002.md` を起案しようとした時、instance A1 並走起案済を Test-Path で発見:
- A は `_003` で起案 = 連番衝突回避
- EVT-024 候補正式記録(`archive/error_patterns.md`、本日朝 8 件目自己発見)
- 本 §5-D は EVT-024 同型再発防止策

#### 5-D-3. instance 間共通連番運用の明示

L1 回覧板は **instance ごと独立連番ではなく、共通連番運用**:

- 全 instance(A / A1 / B / B1 / ...)が同じ `circular_{YYYYMMDD}_{NNN}.md` 名前空間を共有
- 異なる instance が同連番を起案してはならない
- 起案直前の git pull or Test-Path で最新状態確認義務

#### 5-D-4. 機械検出経路(将来候補)

`auto-evt-recorder.ps1` v0.8 候補 R8 ルール:
- 入力: `internal/circular/` ファイル一覧 + 各 instance_id frontmatter
- 検出: 同連番に異なる instance_id が並列起案された場合(現状は事後発見、未然防止は §5-D-1 起案前 Test-Path)
- severity: yellow(1 件) / red(連続 2 件以上)

Phase B-α/β 起動 Day 132 朝以降の Layer 0 統合候補。

#### 5-D-5. 衝突発覚時の処理(本日朝 EVT-024 実施例)

1. 衝突を検出した instance が次連番採用(史実保護、既起案ファイルは改変禁止)
2. 新 circular の `note_on_NNN` frontmatter field に衝突発覚事象を記録
3. `archive/error_patterns.md` に EVT 候補として正式記録
4. 必要に応じて L2 区報経由で他 instance に通知

## 6. L3 官報(司令官側 shared/official_gazette/)との関係

L1 回覧板(本ディレクトリ)で確定した重要決定は、**代表 instance** が L2 区報(該当論点)経由で L3 官報に **要約** を追記する経路と、L1 から直接 L3 に追記する経路がある(状況により判断、論点が役割を横断する場合は L2 経由)。

### 代表 instance の選定

- 暫定: 最新発令起案 instance を代表とする
- 将来: 持ち回り or 機械的選定(将来課題、Phase B-α/β 実証後)

### 共通 circular への追記内容(要約のみ)

- 発令採択の最終 verdict
- Pre-Build / Post-Build Gate 通過 / Reject 結果
- 自己訂正の構造的記録
- ヤス再介入条件発動

機密 / 詳細議論 / 内部合議は役割内 circular に留める。

## 7. ADR 起案候補

本回覧板の構造方針は ADR-006(仮)「監督官 instance 並走運用憲章」候補として記録(`02_physical/v1_1_FINAL_revision_candidates.md` 候補 4 関連)。Phase B-α/β 7 日間実証期間中に並走運用の実績を蓄積、Day 139 前後の v1.1-FINAL 改訂と並行して ADR-006 正式起案を判断する。

## 8. 関連

- `archive/error_patterns.md` EVT-008(監督官 instance 並走運用、本回覧板の起源)
- `00_origin/sp500_theory.md` §6 界と対等(構造的根拠)
- `01_relationship/policy_v1.2.md` §3.2(監督官 ↔ 工場長直接対話禁止維持)
- `outbox/20260428_to_commander_012.md`(第 20 次発令、A 起案、本回覧板への伏線)
- `outbox/20260428_to_commander_011.md`(第 19 次発令、B 起案、EVT-008 観察契機)
- 第 21 次発令(本回覧板 v0.1 完成後の司令官側起案要請、本セッション内で起案予定)

---

## 9. 改訂履歴

- v1.0(2026-04-28 / Day 130 朝): 初版起草。監督官 instance A 起案、(C) 共同案採択(役割内分離 + 共通 circular 併設)、運用ルール 4 原則 + ファイル命名規則 + frontmatter 必須 + 連番予約方式 + 共通 circular との関係を確立。Phase B-α/β 7 日間実証実績で v1.1 改訂前提。
- **v1.1(2026-04-28 / Day 130 朝同日)**: ヤス指示「区報や官報みたいなセクションを横断する概念」+「記録庁内の和名と RecordX への展開ときの業界横文字併存」を受領、3 層通信構造(L1 回覧板 / L2 区報 / L3 官報)に拡張。本 README は L1 を扱う、L2 区報は `internal/regional/README.md` v1.0(本日朝同時起案)、L3 官報は司令官側 `shared/official_gazette/`(第 23 次発令で配置合議)。両軌道命名規範(`00_origin/naming_dual_track.md` v0.1-draft)との接続を明記。
