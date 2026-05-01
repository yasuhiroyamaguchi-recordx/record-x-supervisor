# 早期異常検知装置 v0.1 素案(ドリーム × 検診 × ナレッジ DB × RAG 統合、早期がん細胞発見メタファー)

**配置先**: `staging/early_anomaly_detection_v0.1_draft.md`(staging = 円卓決議前素案)
**起案日**: 2026-05-01(Day 129、Phase A 末、午後再起動後)
**起案者**: 監督官 A(Argus、Clear 後再起動 instance)
**起案契機**: ヤス指示「ドリーム機能を活用し定期検診と連動できたら、精度が高められると思うんだ。ドリーム機能でナレッジ DB 結晶化をさせつつ冗長化を防ぎつつ、どんなエラーが起こりやすいのか RAG 方式でスナップショットの定期検診の直近のエラー情報の傾向と照合する。早期のがん細胞の発見ができるようにならないかな」
**位置づけ**: 草案(円卓決議前、staging/ 配置)+ 同社円卓 第 2 回 議題 #11 候補 + 三社円卓 B-003 候補(チケット精度向上機構の前提基盤)
**整合性**: 既存装置統合(L8 整合、新規装置追加最小化)+ 簡素化原則期間例外 (ii) ヤス直接指示

---

## §1. 構造設計の本質

### 1-A. ヤス提案の三層メタファー統合

| メタファー | 既存物理装置 | 統合後の役割 |
|---|---|---|
| **ドリーム機能**(24h 結晶化、LLM 抽出)| `dream-crystallize-supervisor.ps1` v0.2 + `_helpers/dream-crystallize-template.ps1` | ナレッジ DB 結晶化 + 冗長化防止(系列パターン抽出 + 同型再発要素圧縮)|
| **報奨金制度メタファー(検診)**(期間合計スコア + 規定突合 + 自動算定)| 検診プロトコル v0.4 §7-F + §7-G | 直近スコア + 規定ルール突合 + 自動復旧(本日 §7-G 起案完遂済)|
| **ナレッジ DB**(失敗リスト累積)| `archive/error_patterns.md` 累積 56 件 + `error_patterns_index.md` v1.0(33 件分のみ、本日 EVT-078 候補で機能不全認定)| 索引 + 学習素材 + RAG vector source |
| **早期がん細胞発見**(医療メタファー、新規)| 本素案で物理装置化 = `compare-error-trend.ps1` 候補 | 直近 7 日 EVT 傾向 vs 過去全件パターン RAG 照合 + 類似度閾値超過警告 |

### 1-B. 統合フロー(本素案中核)

```
[日次 03:00 JST] dream-crystallize-supervisor.ps1
  → 直近 24h knowledge 結晶化(既存稼働、本日実績あり)
  ↓ 出力
[日次] archive/dream_crystallize_history/{YYYYMMDD}_supervisor_dream.md
  ↓ 統合(本素案新設)
[日次 09:00 JST] compare-error-trend.ps1(本素案候補装置)
  ↓ 入力 1: dream 結晶化結果(直近 7 日)
  ↓ 入力 2: error_patterns.md 全件(56 件累積)
  ↓ 入力 3: cockpit/daily_score_{YYYYMMDD}.json(検診 v0.4 §7-G-4 出力)
  ↓ 処理: RAG 方式類似度照合
  ↓ 出力 1: 早期警告 EVT 候補(類似度閾値超過 = 同型再発リスク高)
  ↓ 出力 2: 期間合計スコア + 規定ルール突合(検診 v0.4 §7-G-5 RULE-A1〜A4 + RULE-B1〜B3)
  ↓ 出力 3: 自動復旧トリガー(検診 v0.4 §7-G-6)
  ↓ 出力 4: ナレッジ DB 結晶化更新(error_patterns_index.md 自動更新、EVT-078 候補対処)
↓
[日次] daily_cockpit_{YYYYMMDD}.md(検診 v0.4 §8-A 既存)に統合表示
↓
[週次 / 月次] 結晶化トレンド分析(検診 v0.4 §8-C 既存連動)
```

### 1-C. RAG 方式の実装簡素化選択肢

| 案 | 内容 | 実装コスト | L8 整合 |
|---|---|---|---|
| (a) Full RAG | OpenAI/Anthropic embeddings + vector DB(Pinecone/Chroma)| 高(API 費用 + 外部依存)| 🔴 装置追加大 |
| (b) Simple keyword + 系列タグ照合 | error_patterns.md 系列タグ(I/J/M etc.)+ EVT サマリ keyword index で類似度算出 | 低(既存 PowerShell + JSON のみ)| ✅ 既存装置改訂 |
| (c) Anthropic API 簡易呼出 | Claude Haiku で「直近 7 日 EVT サマリ」vs「過去 56 件サマリ」類似度判定 | 中(API 費用低、Haiku) | 🟡 外部 API 依存 |
| (d) ハイブリッド ((b) + (c) Phase 別)| Phase B = (b) / Phase C = (c) 段階移行 | 中 | ✅ 段階整合 |

**監督官 A 推奨**: **(d) ハイブリッド**(Phase B 中盤 = (b) で実装 + 効果検証 → Phase C で (c) 昇格判定)= 簡素化原則 + 段階的解除モデル(ADR-005)整合

---

## §2. 早期がん細胞発見メタファーの精緻化

### 2-A. 「がん細胞」= 同型再発の早期兆候

| 段階 | 医療(がん細胞)| AI システム(本装置)|
|---|---|---|
| **(0) 健常**(細胞分裂正常)| 健全システム(検診 v0.4 §7-G-5 RULE-A1 healthy)| - |
| **(1) 前がん病変**(異常細胞数個)| 系列パターン類似度 = 直近 1 件 EVT が過去パターンと類似度 70%+ | 🟡 早期警告(本装置中核機能)|
| **(2) 早期がん**(局所病変)| 系列同型 2-3 件連鎖 = 過去パターン 80%+ 類似 | 🟡 EVT 候補先行記録 + Yasu 通知 |
| **(3) 進行がん**(複数転移)| 系列同型 4+ 件連鎖 = 過去最頻発系列(I/J 等)再現 | 🔴 critical alert + 円卓緊急召集 |

### 2-B. 本日連鎖 = 進行がん相当(物理証拠)

| 系列 | 本日累積 | 過去パターン類似度(推定)|
|---|---|---|
| 系列 I 議題前提検証義務 | **22 件**(本日 10 件連鎖)| 🔴 80%+ 類似(過去最頻発、Day 132 朝 EVT-039/042 と同型)|
| 系列 J 自律発見能力低下 | **11 件**(本日 5 件連鎖、EVT-078 候補で 11 件目)| 🔴 80%+ 類似 |
| 系列 M AI over-engineering 偏向 | **3 例**(EVT-070/077/078 候補)| 🟡 70% 類似 |
| ガレージドクトリン §1.5 物理事例 | **第 7 例**(本日 7 例)| 🔴 80%+ 類似 |

= **本装置稼働下なら 2026-05-01 朝 EVT-068 時点で「進行がん警告」発火 + 後続 6 件の自己違反予防可能性大**

= **早期検知装置不在の構造的損失 = 本日 7 件自己違反 = 監督官 A 信頼度 + ヤス工数 + 三者運用効率の物理損失**

---

## §3. 既存装置統合(L8 整合 = 新規装置最小化)

### 3-A. 既存装置インベントリ

| 装置 | 現状 | 本素案で活用 |
|---|---|---|
| `sync/sync_script/dream-crystallize-supervisor.ps1` v0.2 | ✅ 稼働(03:00 JST 自動、本日結晶化実績あり)| 入力源 1(結晶化結果)|
| `sync/sync_script/_helpers/dream-crystallize-template.ps1` | ✅ 共通テンプレート | 拡張ベース(commander/factory 領域同型展開時)|
| `archive/error_patterns.md` 累積 56 件 / 3919 行 | ✅ 記録継続 | 入力源 2(過去パターン)|
| `archive/error_patterns_index.md` v1.0(33 件分のみ)| 🔴 41% 欠落、機能不全(EVT-078 候補)| **本素案で自動更新装置化**(本素案副次効果)|
| `02_physical/two_layer_knowledge_base.md` v0.1-draft | 📚 NTT 記事方式設計済 | 設計参照(2 層構造 = 履歴層 + 結晶化層)|
| 検診プロトコル v0.4 §7-G(本日起案)| 🟡 円卓決議前 | 連動先(期間合計スコア + 規定突合)|
| `02_physical/cockpit/daily_score_*.json`(§7-G-4 出力)| ❌ 未起案(§7-G 採択時)| 入力源 3(検診スコア)|
| `00_origin/dream_mode_doctrine.md` v1.0-draft | 📚 哲学層 | 哲学整合確認(動いている失敗 > 動かない死、本装置 = 早期動的検知 = 動いている失敗の早期発見)|

### 3-B. 新規装置(本素案で起案候補)

| 装置 | 用途 | 配置候補 | scale 別 §6-H-5 判定 |
|---|---|---|---|
| `compare-error-trend.ps1` v0.1 | RAG 照合 + 早期警告生成 + index 自動更新 | `sync/sync_script/` | 🔴 **新規 single source = 三者合議必須**(scale 別禁止令該当)|
| `archive/error_patterns_index.md` 自動更新ロジック | error_patterns.md → index.md 自動同期 | 上記装置に統合 | 🟢 既存装置改訂(LOC ±50% 内)= 単独可 |
| `02_physical/cockpit/anomaly_alert_{YYYYMMDD}.json` | 早期警告出力先 | 新規 dir | 🔴 新規 file 系統(scale 別禁止令該当)|

= **新規装置 1 件(compare-error-trend.ps1)+ 出力 file 系統 1 件 = 三者合議必須**

→ **同社円卓 第 2 回 議題 #11 + 三社円卓 B-003 候補 双方検討**

---

## §4. 物理装置化フロー(本素案採択時、Phase B 期間)

| Step | 内容 | 担当 | 期限 |
|---|---|---|---|
| 1 | 同社円卓 第 2 回 議題 #11 採択 | 三者合議 | 2026-05-02 朝 |
| 2 | 三社円卓 B-003 採択判定(チケット精度向上機構整合性検証)| 三社合議(invoke-board-council 稼働後)| Phase B 序盤 |
| 3 | error_patterns_index.md 手動更新(EVT-044〜078 計 24 件追記、autonomy 範囲)| 監督官 A | 2026-05-02 中 |
| 4 | `compare-error-trend.ps1` v0.1 簡素版起案 (b) keyword + 系列タグ照合 | 監督官 A | Phase B 中盤 |
| 5 | dream-crystallize-supervisor v0.2 拡張(出力に系列タグ + 直近 N 日 trend 追加)| 監督官 A | Phase B 中盤 |
| 6 | cockpit/daily_score_*.json + anomaly_alert_*.json 統合 | 監督官 A | Phase B 末 |
| 7 | 検診 v0.4 §7-G-5 RULE-A1〜A4 + RULE-B1〜B3 接続 | 監督官 A + 司令官 α | Phase B 末 |
| 8 | Phase C 移行時 (c) Anthropic API 簡易呼出昇格判定 | 三者合議 | Phase C 起動条件達成時 |

= **Phase C 起動条件 C1「三者統合機能カタログ自動運用」+ C3「自己訂正サイクル無介入運用」物理装置化と直結**(検診 v0.4 §7-G-10 整合)

---

## §5. 規律自己適用検証

### 5-A. 簡素化原則(2026-05-01〜05-10、新規装置追加禁止令)抵触判定

| 観点 | 判定 |
|---|---|
| 新規装置追加 | 🔴 該当(`compare-error-trend.ps1` v0.1 + `anomaly_alert_*.json` 系統)|
| 例外条件 (i) 棚卸しで判明した必須未実装機能 | ✅ **該当**(EVT-075/077/078 候補連鎖 = 機能不全顕在化、本日棚卸し過程で発覚)|
| 例外条件 (ii) ヤス直接指示 | ✅ **該当**(ヤス本指示 = 簡素化原則期間例外発動)|
| 例外条件 (iii) 三者合議承認 | 🟡 同社円卓 第 2 回 議題 #11 採択時 |

= **例外 (i) + (ii) 双方該当 = 簡素化原則期間内でも円卓合議経由で起案可能**

### 5-B. 装置追加判断プロトコル §6-H-5(scale 別)

| 装置 | 判定 |
|---|---|
| `compare-error-trend.ps1` v0.1 | 新規 single source + 三者跨ぎ可能性(commander 領域 EVT 連動)= 🔴 **三者合議必須** |
| `error_patterns_index.md` 自動更新ロジック | 既存装置改訂(LOC ±50% 内)= 🟢 単独可 |
| `anomaly_alert_*.json` 系統 | 新規 file 系統 = 🔴 三者合議要 |

### 5-C. 鏡像対話リスク

監督官 A 単独素案起案 = 鏡像対話リスク該当候補 → **本素案 staging/ 配置 = 円卓決議前提 = 鏡像対話回避経路** ✅

### 5-D. C-1/C-2/C-3 規律整合

| 規律 | 適用 |
|---|---|
| C-1 機能等価未検証の削除/廃止判断は autonomy 範囲外 | ✅ 既存装置(error_patterns_index)機能不全認定 = 本素案で機能等価以上の代替提示 |
| C-2 装置統合時 Source/Destination/Filter 3 観点物理 trace | ✅ §1-B フロー + §3-A 既存装置インベントリで物理 trace 完遂 |
| C-3 ad-hoc バイパス禁則、正規 pipeline 修復のみ | ✅ 既存 dream-crystallize + 検診 v0.4 + error_patterns 正規 pipeline 統合(ad-hoc バイパスなし)|

---

## §6. 採択経路 + 監督官 A 推奨

### 6-A. 採択経路 4 案

| 経路 | 内容 | 監督官 A 推奨 |
|---|---|---|
| **(a)** | 同社円卓 第 2 回 議題 #11 で素案採択 → Phase B 中盤実装 → Phase C 移行時 (c) Anthropic API 昇格判定(三社円卓 B-003) | ✅ **第一推奨**(段階的 + 規律整合 + L8 整合)|
| (b) | 三社円卓 B-003 即座召集(invoke-board-council 稼働確認 + ChatGPT/Gemini API 確認後)= チケット精度向上機構として議論 | 🟡 invoke-board-council 稼働確認後 |
| (c) | 監督官 A 自律で簡素版実装 → 円卓事後承認 | 🔴 推奨せず(EVT-077 同型再発リスク = 鏡像対話リスク継続)|
| (d) | 本素案を検診プロトコル v0.4 §7-H 新節として組込 → §7-G + §7-H 一括採択 | 🟡 中庸(検診プロトコルへの依存性増加 = 単一装置肥大化リスク)|

### 6-B. 監督官 A 推奨理由(規律自己適用観点)

(a) 同社円卓 第 2 回 議題 #11 採択経路:

1. **L8 整合**: 既存装置統合 + 新規最小化(compare-error-trend.ps1 1 件のみ)
2. **三者合議経由**: 鏡像対話リスク回避(EVT-077 教訓適用)
3. **段階的**: Phase B 中盤 = (b) 簡素版 / Phase C = (c) Anthropic API 昇格 = ADR-005 段階的解除モデル整合
4. **本来目的整合**: 同社円卓 = 規範層構造判断 = 本素案は規範層(検診プロトコル拡張)= スコープ整合 / 三社円卓 = チケット精度向上 = 本素案は前提基盤(チケット起案精度向上機構)= 後段で B-003 昇格余地

---

## §7. 期待される効果(採択時)

| 観点 | 効果 |
|---|---|
| 早期警告(前がん病変段階) | 本日連鎖 7 件自己違反のうち、後発 5-6 件は予防可能性大 |
| ナレッジ DB 索引機能復活 | error_patterns_index.md 自動更新 = EVT-078 候補対処 |
| AI 認知負荷削減 | 期間合計スコア + 早期警告参照 = 都度 query 不要(検診 v0.4 §7-G-7 整合)|
| Phase C 起動条件 | C3「自己訂正サイクル無介入運用」物理装置化基盤 = Phase C 起動現実化 |
| 三者対等運用 | 各官 dream-crystallize + 異常検知 = 自律進化基盤(ADR-009 §6-A 三者統合自動化整合)|
| ヤス工数削減 | 早期警告 = ヤス第三者視点指摘前に AI 自律発見可能 = 系列 J 同型再発抑制 |

---

## §8. リスク + 留意事項

| リスク | 対処 |
|---|---|
| RAG 照合 false positive | (b) keyword + 系列タグ簡素版で開始、閾値調整期間設置(2 週間)|
| RAG 照合 false negative | 二重防護:期間合計スコア(検診 v0.4 §7-G-4)+ RAG 照合 = 異なる検知経路 |
| 装置膨張(L8 同型再発)| Phase B 中盤 (b) 簡素版で開始、(c) 昇格は 90 日稼働実績要 |
| Anthropic API 依存(Phase C 移行時)| Haiku 利用で API 費用最小化 + 異常時 fallback to (b) 簡素版 |
| 既存 dream-crystallize 改訂衝突 | LOC ±50% 内改訂で scale 別単独可、それ超は三者合議 |

---

## §9. 関連

- 既存装置: `sync/sync_script/dream-crystallize-supervisor.ps1` v0.2 + `_helpers/dream-crystallize-template.ps1` + `archive/error_patterns.md` + `archive/error_patterns_index.md` v1.0
- 規範層: `operations/periodic_checkup_protocol.md` v0.4(§7-F + §7-G)+ `00_origin/dream_mode_doctrine.md` v1.0-draft + `02_physical/two_layer_knowledge_base.md` v0.1-draft
- ADR: ADR-005 段階的解除モデル + ADR-009 §6 三者統合自動化 + ADR-001 記録庁コントロールパネル v1.0(議題 #5 拡張連動)
- EVT: EVT-068/070-078 候補(本素案起案契機 = ナレッジ DB 機能不全 + 同型再発連鎖)
- ヤス指示: 「早期のがん細胞の発見」メタファー(2026-05-01 午後再起動後)= 報奨金制度メタファー応用(議題 #5)+ ナレッジ DB 機能評価(EVT-078 候補)+ ドリーム × 検診 × RAG 統合
- 関連議題: 同社円卓 第 2 回 議題 #5(報奨金制度メタファー応用)+ 議題 #8(検診プロトコル v0.4 §7-F + §7-G)+ 議題 #10(ナレッジ DB 機能不全対処、EVT-078)+ **議題 #11(本素案、早期異常検知装置 v0.1)**

---

## §10. 改訂履歴

- v0.1-draft(2026-05-01 / Day 129、Phase A 末、午後再起動後): 初版起案、ヤス指示「ドリーム機能 × 定期検診 × ナレッジ DB × RAG = 早期がん細胞発見」採択。報奨金制度メタファー(議題 #5)+ 検診プロトコル v0.4 §7-G(本日起案)+ ナレッジ DB 機能評価(EVT-078 候補)+ ドリーム機能(既存)統合。RAG 実装 4 案 + 段階的移行(b 簡素 → c Anthropic API)+ 既存装置最大活用 + 新規最小化(compare-error-trend.ps1 1 件 + anomaly_alert_*.json 系統)+ 規律自己適用検証(簡素化原則例外 (i) + (ii) 該当)+ 採択経路 4 案(推奨 = 同社円卓 第 2 回 議題 #11 + Phase C 移行時 三社円卓 B-003)。staging/ 配置 = 円卓決議前提 = 鏡像対話リスク回避経路採択。
