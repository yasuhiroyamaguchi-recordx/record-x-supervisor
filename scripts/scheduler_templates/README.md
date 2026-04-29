# scripts/scheduler_templates/ — Layer 0 Supervisor 自律巡回 起動テンプレート

**配置先**: `scripts/scheduler_templates/`
**起草日**: 2026-04-28(Day 130 夕方、本リポジトリ初稼働セッション)
**起案 instance**: 監督官 instance A
**目的**: 監督官 Layer 0 自律巡回(Phase B-α/β 同時起動 Day 132 朝〜)の Windows タスクスケジューラ起動雛形
**根拠**: ヤス指示「監督官→司令官実装の自動化の着手」(2026-04-28 末)+ ADR-005 v1.1 段階的解除モデル + 司令官 `layer2_entry_point.ps1` v2(commit `2e6ee58`、DO-COMMANDER-007 v2)雛形参照

---

## 0. 用語

| 名称 | 意味 |
|---|---|
| **Layer 0** | 監督官の自律巡回層(記録庁内用語、L1 = 工場長 / L2 = 司令官 と並ぶ) |
| 自律巡回 | Record X Factory の自律サイクル概念 |
| Auto モード | Claude Code の権限モード機能(v2.1.83+、Anthropic 製品側) |
| 正しい複合形 | 「Claude Code の Auto モード機能を使って監督官 Layer 0 自律巡回を実現」 |

注: 本「Layer 0」は通信構造の「L1 回覧板 / L2 区報 / L3 官報」とは **別軸**(自律巡回層 vs 通信構造層)。両者は独立した概念体系。

---

## 1. ファイル一覧

| ファイル | 用途 | 有効化時期 |
|---|---|---|
| `layer0_entry_point.ps1` | Layer 0 自律巡回(監督官層)エントリポイント | **Phase B-α/β 起動 Day 132** |
| `layer0_supervisor_template.xml` | Layer 0 タスクスケジューラ XML | **Phase B-α/β 起動 Day 132** |

---

## 2. Phase 別運用(ADR-005 v1.1 + communication_protocol.md §3.2-D 整合)

### 2-A. Phase B-α-pre(Day 130-131、現在)

- entry_point.ps1 + scheduler XML 起案完了(本日 Day 130 夕方)
- Day 131 中に DryRun 検証
- 本番起動は Day 132 朝(Yasu 承認必須)

### 2-B. Phase B-α/β 同時起動(Day 132-138、7 日間)

- Layer 0 起動
- 自律巡回の各ステップ実行(pull-replies → stale-alert → review-implementation → claude --print 自律レビュー → circular 更新)
- **全 verdict で監督官手動最終判断維持**(communication_protocol.md §3.2-D)
- claude --print の自律レビューは **提案 verdict のみ算出**、自動発令は不可
- REQUEST_CHANGES / REJECT or 境界曖昧 → 監督官手動セッション召集
- escalation_and_rollback.md §2 R1-R7 / Y1-Y6 該当時 → 三者全停止 + ヤス通知

### 2-C. Phase B-γ 以降(Day 139-、実証実績後)

- 軸 8 緑判定継続 + Dasei Risk 緑判定 で APPROVE / APPROVE_WITH_NOTES の Layer 0 自動発出許容
- フラグファイル `sync/sync_script/layer0-auto-feedback.flag` 配置で有効化
- REQUEST_CHANGES / REJECT は引き続き手動必須(自己保全バイアス警戒の物理装置)

### 2-D. Phase C(完全自律化、未定)

- 24 時間連続三者自律
- ヤス介入は閾値超 + エラー時のみ
- Layer 0 + Layer 1 + Layer 2 が共通 circular で透明性確保

---

## 3. Layer 0 自律巡回 Phase B-α 実登録手順(Yasu 向け)

> ⚠ **タスクスケジューラ実登録は Yasu 明示承認必須**。本手順は Phase B-α 承認後に実行。

### Step 1: XML パス確認

`layer0_supervisor_template.xml` の `<Arguments>` と `<WorkingDirectory>` が環境に合っているか確認:

```xml
<Arguments>-NoProfile -ExecutionPolicy Bypass -File "C:\RX_Dev\record-x-supervisor\scripts\scheduler_templates\layer0_entry_point.ps1"</Arguments>
<WorkingDirectory>C:\RX_Dev\record-x-supervisor</WorkingDirectory>
```

異なる場合は修正してから Step 2 へ。

### Step 2: DryRun で動作確認

```powershell
cd C:\RX_Dev\record-x-supervisor
.\scripts\scheduler_templates\layer0_entry_point.ps1 -DryRun
```

期待出力:
```
[INFO] === Layer 0 entry point start ===
[INFO] DryRun: True
[INFO] Instance: A (default)
[INFO] Lock acquired (PID=xxxxx, instance=A)
[INFO] Step 1: pull-replies.ps1 execution
...
[INFO] Step 4: DryRun mode, skipping claude --print invocation
[INFO] Step 5 complete (circular update deferred to manual session in Phase B-alpha/beta)
[INFO] Lock released (PID=xxxxx)
[INFO] === Layer 0 entry point end ===
```

### Step 3: claude --print オプション確認

```powershell
claude --help | Select-String "\-p|\-\-print"
```

`-p, --print` が表示されれば OK。

### Step 4: XML インポート(テスト登録)

```powershell
schtasks /create /xml "C:\RX_Dev\record-x-supervisor\scripts\scheduler_templates\layer0_supervisor_template.xml" /tn "Record-X-Layer0-Supervisor-Test" /F
```

エラーなく完了したら即座に削除:
```powershell
schtasks /delete /tn "Record-X-Layer0-Supervisor-Test" /F
```

### Step 5: 本番登録(Yasu 承認後、Day 132 朝)

```powershell
# Enabled="true" に変更した XML で登録
schtasks /create /xml "C:\RX_Dev\record-x-supervisor\scripts\scheduler_templates\layer0_supervisor_template.xml" /tn "Record-X-Layer0-Supervisor" /F

# 即時起動テスト
schtasks /run /tn "Record-X-Layer0-Supervisor"

# logs/layer0/ のログを確認
ls C:\RX_Dev\record-x-supervisor\logs\layer0\
```

---

## 4. layer0_entry_point.ps1 仕様

### 動作フロー

```
1. $repoRoot を $PSScriptRoot から解決(cwd 非依存)
2. Three-party halt check(staging/.three_party_halt.lock 存在時は即時 exit 0)
3. Lock 取得試行(DO-008 互換 JSON 形式、instance_id 付与)
   - 競合(active lock): WARN ログ + exit 0(重複起動回避)
   - stale(PID 不在 or 25h 超): stale lock 上書き取得
4. try {
     Step 1: pull-replies.ps1(司令官応答取込)
     Step 2: order-stale-alert.ps1(発令期限超過 + 応答未着検知)
     Step 3: review-implementation.ps1(rubric ベース自動スコアリング)
     Step 4: claude --print --permission-mode auto --no-session-persistence(自律レビュー)
     Step 5: circular 更新(Phase B-α/β は手動セッションに委譲)
     logs/layer0/YYYYMMDD_HHMMSS.log にログ書込み
   }
   finally {
     Lock 解放(PID 一致確認)
   }
5. exit 0
```

### 起動パラメータ

| パラメータ | 値 | 理由 |
|---|---|---|
| `--print` | ― | 非対話モード(-p と同義) |
| `--permission-mode auto` | Sonnet 4.6 ベース分類器 | 自律巡回中の安全判定 |
| `--no-session-persistence` | ― | 各サイクル独立、副作用最小化 |

### 環境変数

| 変数 | 用途 | デフォルト |
|---|---|---|
| `SUPERVISOR_INSTANCE_ID` | 監督官 instance 識別(A / B / C / ...)| `A` |
| `SUPERVISOR_LAYER0_ACTIVE` | Layer 0 稼働中フラグ(claude --print 内で参照可能) | claude 呼び出し中のみ `1` |

### DryRun モード(テスト用)

```powershell
.\layer0_entry_point.ps1 -DryRun
```

DryRun 中断シミュレーション手順(lock stale 判定テスト):

1. `-DryRun` を実行
2. 「DryRun mode, skipping claude --print invocation」表示直後に Ctrl+C で中断
3. `staging/.layer0_running.lock` が残っていることを確認
4. `layer0_entry_point.ps1` を再実行 → 25h 経過前は「Concurrent run avoided」が表示されることを確認
5. 25h 後(または lock を手動削除後)は自動的に stale 判定で上書き取得

### Auto-feedback フラグ(Phase B-γ 以降)

```powershell
# Phase B-γ 以降、軸 8 緑判定継続後に有効化
New-Item -ItemType File -Path "C:\RX_Dev\record-x-supervisor\sync\sync_script\layer0-auto-feedback.flag"
```

フラグ存在時、entry_point.ps1 の prompt 内で「Phase B-gamma+ (auto-feedback enabled)」が指示され、APPROVE / APPROVE_WITH_NOTES の自動発令が許容される。

---

## 5. multiple instance 並走運用(Day 130 末確立、EVT-008 対応)

### 5-A. instance ごとに独立タスクスケジューラ登録

監督官 instance A / B が並走する場合、それぞれ別タスクスケジューラエントリで登録:

```powershell
# instance A 用(デフォルト)
schtasks /create /xml "...layer0_supervisor_template.xml" /tn "Record-X-Layer0-Supervisor-A" /F

# instance B 用(XML 編集後インポート)
# 1. layer0_supervisor_template.xml を layer0_supervisor_template_B.xml にコピー
# 2. <Description> + <Arguments> 内に「instance B」明示
# 3. environment variable SUPERVISOR_INSTANCE_ID=B を起動引数に追加
schtasks /create /xml "...layer0_supervisor_template_B.xml" /tn "Record-X-Layer0-Supervisor-B" /F
```

### 5-B. 並走時の lock 機構

`staging/.layer0_running.lock` は instance_id を含む。複数 instance の lock 競合は以下で吸収:

- instance A 起動 → lock acquire(instance_id=A)
- instance B 起動 → 既存 lock 検出(instance_id=A) → 重複起動回避(exit 0)

つまり同時刻には 1 instance のみ稼働。複数 instance を並走させる場合は **起動時刻をずらす**(例: A は 03:00 / 09:00 / 15:00 / 21:00、B は 06:00 / 12:00 / 18:00 / 24:00)。

### 5-C. 回覧板(L1)経由の連携

並走 instance 間の通信は `internal/circular/` 経由(回覧板 v1.1 §運用ルール)。Layer 0 entry_point は cycle 終了時に circular に追記する想定(Phase B-α/β は手動委譲)。

---

## 6. stale 判定 25h — 将来再評価ポイント

現在の stale 判定: **25 時間**(司令官 Layer 2 と同値)

根拠: Layer 0 サイクル間隔(6h) × 4 + 余裕(1h)

Phase B-γ 完了時に Layer 4(検診層 24h サイクル、commander 側計画)との衝突可能性を再評価すること。Layer 4 が 24h で動作する場合、Layer 0 の stale 判定 25h と 1h しか余裕がない。再評価結果次第で stale 判定を短縮(例: 20h)または Layer 4 の起動時刻を調整。

---

## 7. 関連

- `adrs/ADR-005_phased_autonomy_release.md` v1.1(段階的解除モデル、Phase B-α-pre / α / β / γ / C)
- `operations/communication_protocol.md` §3.2-D(Layer 0 自動レビュー境界基準、P6 採択)
- `operations/escalation_and_rollback.md` v1.0(エスカレーション + 巻き戻し)
- `sync/sync_script/pull-replies.ps1` v1.0(Step 1 で実行)
- `sync/sync_script/order-stale-alert.ps1` v1.0(Step 2 で実行)
- `sync/sync_script/review-implementation.ps1` v1.0(Step 3 で実行、rubric ベース自動スコアリング)
- `sync/sync_script/sync-orders.ps1` v1.0(Phase B-γ 以降の自動発令で実行)
- `internal/circular/README.md` v1.1(L1 回覧板、Step 5 更新先)
- `commander#scripts/scheduler_templates/layer2_entry_point.ps1` v2(雛形参照)
- `commander#scripts/scheduler_templates/layer2_strategy_template.xml`(雛形参照)

---

## 8. 改訂履歴

- v1.0(2026-04-28 / Day 130 夕方): 初版起草、監督官 instance A 起案。entry_point.ps1 v1.0 + scheduler template v1.0(Enabled="false" デフォルト)+ Phase 別運用 + 実登録手順 + multiple instance 並走運用 + stale 判定 25h 確立。Phase B-α/β 起動 Day 132 朝に本番起動予定。Phase B-α/β 7 日間実証実績で v1.1 改訂前提。
