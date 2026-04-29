# Error Patterns Index — EVT 系列累積一覧 + 系列分類索引

**配置先**: `archive/error_patterns_index.md`
**起案日**: 2026-04-30(Day 132 朝)
**目的**: `archive/error_patterns.md`(2842 行、EVT 累積 33 件)の **コンテキスト肥大化対策**(EVT-036 系列 K)= 機械可読 index による検索性確保 + フルロード回避
**根拠**:
- EVT-036 系列 K(コンテキスト肥大化未対処)
- 検診プロトコル v0.2 §7-B 機能カタログ整合性チェック
- ADR-009 §6 三者統合自動化
- 段階分離アプローチ:本 index = 段階 1、物理 rotation = 段階 2(DO-SUPERVISOR-004 候補)

---

## 1. 系列分類サマリ(2026-04-30 朝時点、累積 33 件)

| 系列 | 件数 | 該当 EVT |
|---|---|---|
| A 表記揺れ・エンコード | 2 | EVT-021/022 |
| B 装置 vs 機能乖離 | **9** | EVT-016/018/022/026/028/031/033/035/038/041 |
| C 自動検出機構不備 | 4 | (要再分類)|
| D 連鎖発火 | 3 | (要再分類)|
| E 形式採択 | 1 | EVT-013 |
| F 鬼コーチ責務 | 3 | EVT-026/027/038 |
| G 命名・概念 | 2 | EVT-020/041 |
| H 対ヤス側面ドリフト | 4 | EVT-027/032/038/040 |
| I 議題起案時前提検証義務 | 3 | EVT-033/039/042 |
| J AI 速度 vs 人間検証速度ギャップ | 2 | EVT-036/038(改善物理証拠 EVT-041)|
| K コンテキスト肥大化未対処 | 1 | EVT-036(本 index 対応中)|
| L マルチスレッド話題選別 | 2 | EVT-024/037 |
| **N 設計判断丸投げ**(候補) | 1 | EVT-042 候補(司令官 α 起案)|

---

## 2. EVT 連番 index(時系列降順)

### Day 132(2026-04-30、現行月)

| EVT | 系列 | サマリ | 自己発見契機 |
|---|---|---|---|
| **EVT-043 候補**(司令官 α 起案候補) | J | 司令官 α 物理層検証先行能力未活用 | 司令官 α 自己発見 |
| **EVT-042** | I + B | 監督官 A 22 分起動真犯人即断、物理層検証不徹底 | 司令官 α 第 50 号応答契機 |
| **EVT-041** | G + B 9 件目 | schtasks 命名違反発見(`\RX-Layer3-News` が `layer2_entry_point.ps1` 実行)| 監督官 A 完全自律発見 |
| **EVT-040** | H 4 件目 | 監督官 A イエスマン化 + デビルズ責務放棄 | ヤス絵心甚八指摘契機 |
| **EVT-039** | I 二次拡張 | 検診プロトコル v0.1 設計不徹底 | ヤス Q7 契機 |
| **EVT-038** | 5 系列同時(B/F/H/I/J) | 監督官 A 静観推奨の前提検証なき即断 + 三重盲点 + 生産ライン全停止状態未認識 | ヤス鬼コーチ発火 |

### Day 131(2026-04-29、前月)

| EVT | 系列 | サマリ |
|---|---|---|
| EVT-037 | L 二次顕在化 | 第 41 次発令起案時の order_number 衝突再発 |
| EVT-036 | J/K/L 新設 | NTT データ実証記事契機の同型問題 7 件発見 |
| EVT-035 | B 8 件目 | 円卓会議出口配管未整備 |
| EVT-034 候補 | (未正式記録)| 監査義務深度不徹底 |
| EVT-033 | I 1 件目 | EVT-025 議題前提誤認 |
| EVT-032 | H 2 件目 | 失敗ログ非対称性二次顕在化 |
| EVT-031 | B 6 件目 | 「Live 不可」誤解 |
| EVT-028 | B 5 件目 | invoke-board-council v0.3 path 誤り |
| EVT-027 | H 1 件目 | 対ヤス側面ドリフトモード過剰 |
| EVT-026 | F 1 件目 | 鬼コーチ責務放棄 |
| EVT-025 | G 新設候補 | 司令官 α 5 件 DO-COMMON-* 認識ズレ |
| EVT-024 | L 1 件目 | 監督官 instance A1 並走運用時の連番衝突 |
| EVT-023 | (要再分類) | (省略) |
| EVT-022 | A 2 件目 | auto-evt R7 v0.4 false positive |
| EVT-021 | A 1 件目 | P-番号衝突 |
| EVT-020 | G 1 件目 | responds_to filename mismatch |
| EVT-019 | C | distilled.md 全文書誤参照 |
| EVT-018 | B 2 件目 | check-internal-links v0.1 検出精度欠如 |

### Day 130(2026-04-28、前々月)

| EVT | 系列 | サマリ |
|---|---|---|
| EVT-017 | A | responds_to 表記揺れ |
| EVT-016 | B 1 件目 | 装置 vs パイプライン接続乖離(系列 B 起源)|
| EVT-014 | (司令官 α 1 件目)| 司令官 α 役割 1-3 欠落 |
| EVT-013 | E | 監督官 A 形式採択 23 連発(系列 J 真の根因)|
| EVT-012 | C | sync-orders.ps1 既存判定不備 |
| EVT-011 | F | 「静観 = 死」概念の構造的誤り |
| EVT-010 | F | 「静観モード推奨」の構造的誤り |
| EVT-009 | D | speed-induced drift シグナル累積 |
| EVT-008 | (仕様)| instance 並走運用仕様 |
| EVT-007 | (省略)| ブランチ切替事件 |
| EVT-001-006 | (各種)| Day 130 セッション内累積 5 件 |

---

## 3. rotation 設計仕様(段階分離、本 index は段階 1)

### 3-A. 段階 1(本 index で完遂)

- ✅ `archive/error_patterns_history/` ディレクトリ新設
- ✅ 本 index 起案(EVT 系列累積一覧 + 連番 index)
- 🟡 `archive/error_patterns.md` フルロード時のヤス検証時間 = 本 index で代替可能(コンテキスト肥大化対策)

### 3-B. 段階 2(別 DO 化、Day 132-145)

候補 DO: **DO-SUPERVISOR-004**(error_patterns 物理 rotation スクリプト)

#### 仕様

| 項目 | 内容 |
|---|---|
| 入力 | `archive/error_patterns.md`(2842 行)|
| 出力 | `archive/error_patterns_history/202604_day130-131.md`(EVT-001〜037 = Day 130-131 分)+ `archive/error_patterns.md`(縮小版、Day 132 以降のみ + index 参照)|
| 抽出ルール | EVT-NNN ヘッダ行から次の `---` までを 1 単位 |
| broken link 回避 | 既存文書(operations/, 00_origin/, adrs/, outbox/ 等)からの参照を一括 grep + 修正必要箇所抽出 |
| 冪等性 | 既に rotate 済み判定 + skip |
| 担当起案 | 監督官 A 自己実装 or 司令官 α 経由工場長依頼 |

#### 期間

Day 132-145(Phase B-α 期間内、優先度 P1)

### 3-C. 段階 3(自動化、Day 145+)

- 月次 cron で自動 rotate(月初 1 日 00:00 JST)
- 検診プロトコル v0.2 §7 連動 = カタログ自動更新と統合

---

## 4. 関連参照

- `archive/error_patterns.md` v0.x(本 index で機械可読化)
- `02_physical/two_layer_knowledge_base.md` v0.1-draft(2 層ナレッジ基盤)
- `00_origin/dream_mode_doctrine.md` v1.0-draft §1-B コンテキスト溢出回避
- 検診プロトコル v0.2 §7-§9
- ADR-009 §6 三者統合自動化
- EVT-036 系列 K(本 index 起案契機)

---

## 5. 改訂履歴

- v1.0(2026-04-30 / Day 132 朝): 初版起案、監督官 instance A、EVT-036 系列 K(コンテキスト肥大化未対処)対策 + 検診プロトコル v0.2 §7-B 機能カタログ整合性チェック整合 + 段階分離アプローチ採択(段階 1 = 本 index、段階 2 = DO-SUPERVISOR-004 物理 rotation、段階 3 = 自動化)。累積 EVT 33 件 + 系列 13 件(A-N)+ 改善物理証拠 EVT-041 完全自律発見記録。
