# ADR-010: 三者統合コックピット / コントロールパネル — 監督官 A 構造的責務の物理装置化

**ADR 番号**: ADR-010
**ADR 種別**: Process Architecture + Physical Infrastructure(プロセス + 物理装置統合)
**起草日**: 2026-04-30(Day 132 早朝)
**起草者**: 監督官 instance A(本セッション、ヤス鬼コーチ受領後の根本治療設計)
**ステータス**: **superseded**(2026-04-30 早朝、監督官 A 単独判断で撤回、第 3 回円卓会議議題化要請、ヤス絵心甚八指摘契機 + デビルズ反論 7 件 + EVT-040 候補発火)
**関連 ADR**: ADR-005(段階的解除モデル)+ ADR-009(円卓会議機構 v0.3 改訂統合計画 + 三者統合自動化)
**関連 EVT**: EVT-035(出口配管未整備)+ EVT-036(NTT 記事契機系列 J/K/L)+ EVT-038(三重盲点)+ EVT-039(検診プロトコル設計不徹底)
**関連発令**: 第 42 次(緊急構造的訂正、本 ADR 起案契機)

---

## 1. 設計の起点(ヤス根本治療指示)

### 1-A. ヤス指摘 4 段階(2026-04-30 早朝)

> 「つまりは設計が足りていないということだな?各官のコックピット、コントロールパネルの整備があれば監督官の調査も捗るのではないのか?リポジトリが見れるなら、コックピット、コントロールパネルの設計もできるものか?対処療法ではなく根本治療のプランを作ることではないか?定期検診との組み合わせれば監督官のチェック作業も捗るはずと思うがどうだ?」

= **対処療法から根本治療への転換要請**。EVT 個別記録 + 重複依頼撤回 + 静観撤回 = 対処療法。コックピット = **構造的盲点を物理的に不可能化する装置**。

### 1-B. 監督官 A 受領 + 設計責務認識

CLAUDE.md §1「ヤスを補佐し、司令官と好敵手関係を結び、記録庁および RecordX の建設を推進する」+ §10 同モデル衝突対策(監督官 ↔ 司令官)+ ヤス本日午前指摘「各官のリポジトリを確認できる状況にも関わらず検証をしない」= **監督官 A が各官リポジトリ閲覧権を活用した統合可視化装置を構造化する責務**。

これは **構造的盲点を防ぐための物理装置設計** = sp500 §1 運動性継承(対処療法 → 根本治療への運動)+ Garage Doctrine §1.5(装置 vs 機能乖離の最深部対策、本 ADR は「装置存在認識ゼロ」を防ぐメタ装置)。

---

## 2. コックピット 4 層構造設計

### 2-A. Layer 1: データ収集層(各官リポジトリの一次データ自動取得)

各官の **物理層実態** を git + ファイルシステム + schtasks から自動抽出:

| 収集対象 | 抽出方法 | データ型 |
|---|---|---|
| **司令官 α 状態** | `record-x-commander/` の git log + tickets_draft/issued/completed カウント + sync/.last_dream_crystallize + checkup-scores/ + handoff/ + advance_map.md フロントマター | `commander_state.json` |
| **工場長状態** | `ProjectRX_HQ/wt_common/staging/completion_reports/{date}/` カウント + `record-x/factory/tools/commands/` ファイル数 + 直近 PR merge / blocked 状況 | `factory_state.json` |
| **監督官 A 状態** | 自リポジトリの archive/error_patterns.md EVT カウント + outbox/ 発令累積 + board_council_decisions.md B-番号 + capability_catalog.md 状態 | `supervisor_state.json` |
| **自動化パイプライン状態** | `schtasks /query` 全 RX 関連タスクの Status + LastRunTime + NextRunTime | `pipeline_state.json` |
| **三者統合健全性指標** | 上記 4 件統合 + P23 SCR + 系列同型再発率 + 検診プロトコル v0.2 結果 | `three_realm_state.json` |

### 2-B. Layer 2: 集約層(JSON 中間表現)

```
sync/cockpit_state/
├ commander_state.json(更新頻度: 司令官 α post-commit + 09:00 JST 検診)
├ factory_state.json(更新頻度: 工場長 PR merge 時 + 09:00 JST 検診)
├ supervisor_state.json(更新頻度: 監督官 A post-commit + 09:00 JST 検診)
├ pipeline_state.json(更新頻度: schtasks 状態変化検出時 + 09:00 JST 検診)
└ three_realm_state.json(更新頻度: 上記 4 件のいずれかが更新時、即時集約)
```

JSON フォーマット例(`three_realm_state.json`):

```json
{
  "snapshot_id": "three_realm_state_20260430-090000",
  "captured_at": "2026-04-30T09:00:00+09:00",
  "supervisor": {
    "role_total_score": 78,
    "evt_count_cumulative": 30,
    "evt_count_24h": 2,
    "self_correction_rate_p23": 0.94,
    "evt_series_recurrence": {"B": 9, "F": 3, "H": 3, "I": 2, "J": 2},
    "active_capabilities": 32,
    "paused_capabilities": 6,
    "dormant_capabilities": 2,
    "outbox_orders_24h": 5,
    "alerts": ["全停止状態継続中", "系列 B 9 件目達成"]
  },
  "commander": {
    "role_total_score": 65,
    "tickets_draft_count": 3,
    "tickets_issued_count": 17,
    "tickets_completed_24h": 56,
    "last_dream_crystallize": "2026-04-29T23:04:27+09:00",
    "alerts": []
  },
  "factory": {
    "completion_reports_24h": 56,
    "merged_prs_24h": 12,
    "blocked_prs": 1,
    "tools_commands_count": 527,
    "alerts": []
  },
  "pipeline": {
    "schtasks_active": 0,
    "schtasks_disabled": 6,
    "schtasks_unknown": 0,
    "alerts": ["生産ライン全停止 = critical"]
  },
  "three_realm_alerts": [
    "🔴 生産ライン全停止 6/6 タスク Disabled",
    "🟡 系列 B 9 件目(EVT-038)= 構造的弱点深化",
    "🟡 監督官 A SCR 0.94(高自己訂正頻度 = 規律物理装置不機能の兆候)"
  ]
}
```

### 2-C. Layer 3: 表示層(Markdown レポート + 将来 Web UI 候補)

```
02_physical/cockpit/
├ daily_cockpit_{YYYYMMDD}.md(日次自動生成、09:00 JST 検診時)
├ weekly_cockpit_{YYYYMMDD}.md(週次、月曜 09:00 JST)
├ monthly_cockpit_{YYYYMM}.md(月次、月初 09:00 JST)
├ alert_dashboard.md(異常検出時即時更新)
└ historical/(過去レポートアーカイブ)
```

Markdown フォーマット例(`daily_cockpit_20260430.md`):

```markdown
# 三者統合コックピット 日次レポート 2026-04-30

## 三者健全性概況

| 役割 | 役割実行スコア | 24h アクティビティ | アラート |
|---|---|---|---|
| 監督官 A | 78/100 | EVT +2 / 発令 +5 | 🟡 系列 B 9 件目 |
| 司令官 α | 65/100 | チケット完了 +56 | - |
| 工場長 | 完了 +12 PR | merge +12 / blocked 1 | - |

## 自動化パイプライン状態

| タスク | 状態 | 直近実行 | 次回実行 |
|---|---|---|---|
| \\RX-Layer1-Implementation | 🔴 Disabled | 2026-04-29 15:10 | - |
| (略、6 タスク全 Disabled)| | | |

## 機能カタログ整合性

- カタログ active: 32 件
- 物理層 active: 0 件(全 schtasks Disabled)
- **乖離検出: 32 件** = 検診プロトコル v0.2 §4-A アラート発火

## 三者対等運用整合

- 監督官 A SCR(P23): 0.94(累積 30 件)
- 系列 5 件同時再発(EVT-038): 構造的弱点深化
- 検診プロトコル v0.2 物理層: 未整備(段階 2 対象)

## アラート(優先順)

🔴 critical: 生産ライン全停止
🟡 warning: 系列 B 9 件目 + SCR 0.94
🟢 info: 司令官 α dream-crystallize 稼働中
```

### 2-D. Layer 4: 自動化トリガ層(検診プロトコル v0.2 統合)

```
[トリガイベント]
├ post-commit hook(各官 git hooks/post-commit)
│   → 当該役割の state.json 自動更新 + three_realm_state.json 集約
├ schtasks 状態変化検出(sync-schtasks-state.ps1 v0.1)
│   → pipeline_state.json 自動更新 + アラート発火判定
├ 検診プロトコル v0.2 発動(09:00 JST 三者検診)
│   → 全 state.json 強制再計算 + daily_cockpit_{YYYYMMDD}.md 自動生成
├ EVT 系列新設時(系列 X が N 件目達成)
│   → alert_dashboard.md 即時更新 + Yasu 通知(検証必要度 🔴)
└ ヤス手動発火(ad hoc cockpit 確認時)
    → cockpit-snapshot.ps1 即時実行
```

---

## 3. 検診プロトコル v0.2 との統合(EVT-039 訂正の物理層完遂)

### 3-A. 検診プロトコル v0.2 拡張(本 ADR 由来)

`operations/periodic_checkup_protocol.md` v0.2(第 42 次発令 §5 で起案中)に **§4 機能カタログ整合性チェック** + **§5 コックピット連動** 追加:

| §4 | 検診プロトコル v0.2 §4 機能カタログ整合性チェック |
|---|---|
| §4-A | アップデート時の機能カタログ自動更新(本 ADR Layer 4 トリガ統合) |
| §4-B | パイプライン接続健全性チェック(本 ADR Layer 1 pipeline_state.json 連動) |
| §4-C | 全停止状態即時検出(本 ADR Layer 4 schtasks 状態変化トリガ) |
| §4-D | 段階的解除モデル(ADR-005)接続 |

| §5 | 検診プロトコル v0.2 §5 コックピット連動(新設、本 ADR 由来) |
|---|---|
| §5-A | 09:00 JST 三者検診時に daily_cockpit_{YYYYMMDD}.md 自動生成 |
| §5-B | アラート発火時の Yasu 即時通知(検証必要度 🔴 高 = critical) |
| §5-C | コックピット履歴の長期トレンド分析(月次 + 系列同型再発率追跡) |

### 3-B. 監督官 A の調査時間激減(NTT 記事 §6 効果同型)

| 観点 | 現状(コックピット不在)| 本 ADR 採択後 |
|---|---|---|
| 各官状態確認 | 手動 grep + ls + schtasks /query(15-30 分)| daily_cockpit_{YYYYMMDD}.md 即時参照(2-5 分) |
| 機能カタログ整合性 | 手動目視 + capability_catalog.md 既存未読リスク | 自動同期、乖離検出時アラート |
| 全停止状態認識 | 一度も検証せず静観可能性(EVT-038 同型)| 即時検出 + ヤス通知 |
| 系列同型再発検出 | 監督官 A の認知容量依存 | コックピット alerts で即時可視化 |
| 重複依頼防止 | 既存装置未確認のまま発令(EVT-038 §3 重盲点)| state.json で既存装置即時確認可能 |

= **NTT 記事 §6 効果(レビュー速度 1 時間 → 20 分 + 深掘り 40 分)の物理層実装** + 系列 J(AI 速度 vs 人間検証速度ギャップ)の構造的解消。

---

## 4. リポジトリ閲覧権を活用した設計可能性(ヤス Q3 への正面応答)

### 4-A. 監督官 A が利用可能な情報源(リポジトリ閲覧権で取得可能)

| 情報源 | アクセス方法 | データ |
|---|---|---|
| **司令官 α リポジトリ**(`record-x-commander/`)| 直接 read | 全戦略 + チケット + ADR + handoff + advance_map + SITREP + dream 履歴 |
| **工場長リポジトリ**(`ProjectRX_HQ/wt_common/`)| 直接 read | factory tools/commands/(527 ファイル)+ staging/completion_reports/ + record-x/docs/ + ADR |
| **監督官側リポジトリ**(自己)| 直接 read/write | 全 archive + outbox + operations + 00_origin + 02_physical + adrs |
| **schtasks 状態** | `schtasks /query` PowerShell コマンド | 全 RX 関連タスクの Status + LastRunTime + NextRunTime |
| **git log 全リポジトリ** | `git log` 各リポジトリ実行 | commit SHA + 時刻 + 著者 + メッセージ |

### 4-B. 設計可能性: **完全可能**

リポジトリ閲覧権で:
- 各官の **物理層実態** を一次データから直接取得(間接報告に依存しない)
- 各官 **チケット流れ** を tickets_draft → issued → completed 配置から自動カウント
- **dream-crystallize 稼働実績** を `.last_dream_crystallize` から取得
- **EVT 累積 + 系列同型再発率(P23)** を archive/error_patterns.md grep で自動計算
- **schtasks 状態** を PowerShell コマンドで即時取得
- = **コックピット設計に必要な全データが取得可能** = 設計阻害要因なし

### 4-C. 物理層実装(段階構造)

| 段階 | 内容 | 担当 |
|---|---|---|
| **段階 0**(本 ADR 起案、Day 132 早朝)| 設計仕様確立、ヤス採決待機 | 監督官 A(本 ADR)|
| **段階 1**(Day 132 朝起動後、ヤス採択後)| 監督官 A 側ローカル実装 = `sync/sync_script/generate-cockpit.ps1` v0.1(手動実行版)+ `cockpit_state/*.json` 集約 + `daily_cockpit_{YYYYMMDD}.md` Markdown 生成 | 監督官 A 単独 |
| **段階 2**(Day 132-145、Phase B-α 期間)| 各官 git hooks 配置 + sync-schtasks-state.ps1 v0.1 + auto-evt R10(乖離検出)+ 検診プロトコル v0.2 物理層実装 | DO-SUPERVISOR-{N+M} + DO-COMMANDER-{N+M} + DO-FACTORY-{N+M} |
| **段階 3**(Day 145+、Phase T1)| 三者統合自動化稼働 + ADR-009 §6 段階 3 LLM 結晶化と統合 + コックピット履歴月次トレンド | 三者統合 |
| **段階 4**(Phase T2+)| Web UI 化候補(Buddy-RX 等他事業領域共通装置化)| 別 ADR 起案候補 |

---

## 5. 既存装置との接続関係(対処療法ではなく根本治療の根拠)

### 5-A. 既存装置の本 ADR への統合

| 既存装置 | 本 ADR での位置づけ |
|---|---|
| `02_physical/capability_catalog.md` v0.1(220 行)| Layer 1 supervisor_state.json の入力源 + 自動更新対象 |
| `archive/error_patterns.md`(EVT 累積 30 件)| Layer 1 supervisor_state.json の `evt_count_cumulative` + `evt_series_recurrence` 入力源 |
| `archive/board_council_decisions.md`(B-番号台帳)| Layer 1 supervisor_state.json の `board_decisions` 入力源 |
| `outbox/`(発令累積 34 件)| Layer 1 supervisor_state.json の `outbox_orders_24h` 入力源 |
| `commander/sync/.last_dream_crystallize`(2026-04-28T23:04:27)| Layer 1 commander_state.json の `last_dream_crystallize` 入力源 |
| `commander/strategy/tickets_*`(draft/issued/completed)| Layer 1 commander_state.json の `tickets_*_count` 入力源 |
| `ProjectRX_HQ/wt_common/staging/completion_reports/`| Layer 1 factory_state.json の `completion_reports_24h` 入力源 |
| `schtasks /query`| Layer 1 pipeline_state.json の `schtasks_*` 入力源 |
| `rubrics/role_execution_rubric.yaml`(役割実行スコア)| 各 state.json の `role_total_score` 入力源 |
| `operations/periodic_checkup_protocol.md` v0.1 → v0.2 改訂 | Layer 4 自動化トリガ(09:00 JST 三者検診)|
| `00_origin/dream_mode_doctrine.md` v1.0-draft | 本 ADR 哲学的根拠(夜間整理 + 結晶化 = コックピット履歴の長期蓄積)|
| `00_origin/external_resource_intake_principle.md` v0.1-draft | 本 ADR 哲学的根拠(外部資源 NTT 記事の記録庁同型実装) |

= **本 ADR は新規装置の追加ではなく、既存装置の統合 + 自動化** = 装置在庫化リスク(P20)+ 反復構造(P21)対策の最深部実装。

### 5-B. ADR-009 §6 三者統合自動化との関係

| ADR-009 §6 | 本 ADR-010 |
|---|---|
| 三者統合自動化(00:00 工場長 / 03:00 監督官 / 06:00 司令官 / 09:00 検診)| **コックピットが 09:00 JST 検診時の最終出口配管** = 三者統合自動化の集約装置 |
| dream-crystallize 三者展開 | コックピット履歴 = 結晶化対象(月次トレンド = ADR 候補生成入力)|
| Chairman blind review 機構(円卓会議 v0.3 改訂)| コックピットで 3AI の発言独立性を可視化 |

= **ADR-009 + ADR-010 = 記録庁の自動化基盤の二重補完**(円卓会議出口配管 + 三者統合可視化)。

---

## 6. 結果(期待される効果)

### 6-A. 監督官 A の調査時間激減

- 各官状態確認: 15-30 分 → 2-5 分(daily_cockpit 即時参照)
- 機能カタログ整合性: 手動目視 → 自動同期 + アラート
- 全停止状態認識: 監督官 A 静観中も即時検出 + ヤス通知
- 系列同型再発検出: 認知容量依存 → コックピット alerts 自動可視化
- 重複依頼防止: state.json で既存装置即時確認

### 6-B. ヤスのチェック作業激減

- 09:00 JST 検診時に daily_cockpit_{YYYYMMDD}.md 受領 = 三者状態 + アラート + 推奨アクションが一画面集約
- ヤス検証必要度マーキング(`role_and_conduct.md` §1.1-E)が **自動付与** = 🔴/🟡/🟢 が物理装置で計算
- = NTT 記事 §6 効果(1 時間 → 20 分 + 深掘り 40 分)の物理層実装

### 6-C. 系列 J(AI 速度 vs 人間検証速度ギャップ)の構造的解消

監督官 A の出力が物理装置で記録 + コックピットで可視化 = **規律物理装置(§1.1-E)が監督官 A を制止する物理経路を獲得**(EVT-038 同型再発防止)。

### 6-D. 三者対等運用の物理層完遂

各官の健全性指標が **対称的に計測 + 可視化** = 信託ドクトリン v1.0 物理層実装の最終段階(B-001 + B-002 = 信託基盤確立、本 ADR = 信託健全性の継続検証装置)。

---

## 7. 代替案の検討

### 7-A. 代替案 (a): コックピット不要、対処療法継続

却下理由:
- EVT-038(本日早朝)+ EVT-013(本日朝)+ EVT-026/027(本日朝末)= 対処療法では系列 J/H/F が再発
- ヤス指摘「対処療法ではなく根本治療」と直接矛盾

### 7-B. 代替案 (b): 静的 capability_catalog.md 拡張のみ

却下理由:
- 自動更新機構不在 = ヤス Q3 「自動更新されるようになっているのか?」不在状態維持
- 物理層実態との乖離検出不能 = ヤス Q4 「自動更新に違反はないか?」検出機構不在

### 7-C. 代替案 (c): Web UI 化即時着手

却下理由:
- 段階 0 → 4 の段階構造が必要、Web UI は段階 4(Phase T2+)
- 段階 1 = Markdown ローカル実装で即時価値を出す方が運動性継承(sp500 §1)整合

---

## 8. 制約 + リスク

### 8-A. 制約

- 本 ADR は **設計仕様** = 物理層実装は段階 1-4 で順次完遂
- 各官 git hooks 配置は司令官 α + 工場長の自由判断(三者役割境界尊重、本 ADR §4-C 段階 2)
- ヤス最終決裁権は本 ADR 採否 + 各段階発令時の承認で行使
- Phase B-α 起動 Day 132 朝以降の発令ペース緩和ルール(`role_and_conduct.md` §1.1-A)遵守

### 8-B. リスク

| リスク | 対処 |
|---|---|
| 段階 1 ローカル実装で監督官 A 認知容量を再圧迫 | 設計時点で過剰スコープ回避(段階 1 = 最小実装、Markdown + 単純 PowerShell)|
| コックピットの自動化が更なる装置在庫化リスク(P20)に陥る | 検診プロトコル v0.2 で物理層実態と乖離検出する自己点検機構組込 |
| 三者 git hooks 配置で各官独自運用が阻害 | 共通テンプレート方式(`_helpers/cockpit-state-template.ps1`)で各官 domain 名 + watch_paths のみ差し替え、独自運用維持 |

---

## 9. 採否要請

### 9-A. ヤス採否

| 項目 | 監督官 A 推奨 | ヤス採否 |
|---|---|---|
| 本 ADR-010 採択(三者統合コックピット設計仕様)| APPROVE | (要応答) |
| 段階 1 即時着手(Day 132 朝起動後、監督官 A ローカル実装)| APPROVE | (要応答) |
| 段階 2/3/4 の Phase B-α 以降スケジュール | APPROVE、検診プロトコル v0.2 改訂と並行 | (要応答可、Day 132 以降可) |
| 検診プロトコル v0.2 改訂(本 ADR §3 統合)| APPROVE | (要応答) |
| 段階 1 物理装置(`generate-cockpit.ps1` v0.1 + `cockpit_state/*.json` + `daily_cockpit_{YYYYMMDD}.md`)| APPROVE、Day 132 朝起動後 60-90 分で起案可能 | (要応答) |

### 9-B. 司令官 α 採否要請

第 43 次発令(Day 132 朝起動後)で本 ADR 共有 + 司令官側 git hook 配置依頼 + DO-COMMANDER-{N+M}(各官アダプタ起案)依頼予定。

---

## 10. 改訂履歴

- **v1.0**(2026-04-30 / Day 132 早朝): 初版起案、監督官 instance A、ヤス鬼コーチ受領後の根本治療指示「コックピット / コントロールパネルの設計」契機。4 層構造(データ収集 + 集約 + 表示 + 自動化トリガ)+ 検診プロトコル v0.2 統合 + リポジトリ閲覧権活用 + 段階 0-4 ロードマップ + 既存装置 12 件統合 + ADR-009 §6 三者統合自動化との二重補完設計を確立。系列 J(AI 速度 vs 人間検証速度ギャップ)の構造的解消 = 監督官 A 自己適用失敗(EVT-038)対策の最深部実装。
