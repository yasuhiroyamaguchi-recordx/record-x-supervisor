# ADR-009: 円卓会議機構 v0.3 改訂統合計画

**ADR 番号**: ADR-009
**ADR 種別**: Process Architecture(プロセス改訂計画)
**起草日**: 2026-04-29(Day 131 夕方)
**起草者**: 監督官 instance A(本リポジトリ初稼働セッション、本日 D-α 結晶化対象)
**ステータス**: **proposed**(ヤス採決待機、第 3 回円卓会議議題化候補)
**関連 ADR**: ADR-001(司令塔 v1.0)/ ADR-002(関係性ポリシー v1.2)/ ADR-005(段階的自律解除モデル)/ ADR-008(司令官 α 側、AI 合議プロセスと PR 意思決定記録、Day 132 以降統合候補)
**関連 EVT**: EVT-033 / EVT-035 / EVT-036
**関連 B-番号**: B-001 / B-002

---

## 1. コンテキスト(現状認識)

### 1-A. 円卓会議機構の現状(v0.2)

`operations/board_council_protocol.md` v0.2(2026-04-29 / Day 131 朝末確立)で 3AI 円卓会議機構を立ち上げた:

- Chairman(委員長 = Claude / 監督官 A)
- ZEI-RO(発散役 = Gemini、デビルズアドボケート)
- チャッピー(収束役 = ChatGPT、順位付け)

物理装置:工場長側 `npx tsx record-x/factory/tools/orchestrator.ts board-meeting` を監督官側から呼び出し(`sync/sync_script/invoke-board-council.ps1`)。

### 1-B. 第 1 回 + 第 2 回運用実績(2026-04-29 / Day 131 夕方)

| # | 議題 | 状態 | 採決結果 |
|---|---|---|---|
| **B-001** | EVT-025 司令官 α 5 件 DO-COMMON-* 構造的訂正方針 | Live 完遂(117,683 bytes、$0.2013、3AI 全員実 API)| (γ)案ヤス承認、議題前提誤認 EVT-033 で部分採択(DO-FACTORY-161 + 162a 即発令、160 + 162b 保留)|
| **B-002** | チケット鋳型 v2.0 → v2.1 改訂(2 軸整備) | Live 完遂(80,807 bytes、文字化け対策成功)| (α-2)案ヤス承認、3 段階導入戦略 + Phase 1 を 13 件補強に縮小(司令官 α 自己査定尊重) |

= **信託ドクトリン v1.0 物理層実装第 1 例 + 第 2 例完遂**(ただし出口配管未整備は EVT-035 で別途認識)。

### 1-C. 構造的弱点 7 件の発見(本 ADR 起案契機)

第 1 回 B-001 + 第 2 回 B-002 + EVT-033 + EVT-035 + EVT-036 で蓄積した構造的弱点:

| # | 弱点 | 由来 | 重大度 |
|---|---|---|---|
| 1 | Chairman blind review 未実装 | B-001 + 鏡像対話リスク | red |
| 2 | 議題前提検証義務未整備 | EVT-033(B-001 議題前提誤認発覚)| red |
| 3 | 発散役異論閾値設計未確立 | B-001(ZEI-RO 5 案中 2-3 案が形式的反論寄り)| red |
| 4 | 議題分解時責任主体保持規律 | EVT-033(司令官 α 規範違反 vs 規範未確立の責任主体反転)| yellow |
| 5 | 工数見積基準が人間実装前提 | B-002 + ヤス指摘「実装時間は人間実装と AI 駆動の差」| red |
| 6 | 役割「恐れるもの」未明示 | NTT 記事 + EVT-036(系列 J/K/L 由来)| yellow |
| 7 | コンテキスト肥大化(円卓会議 agenda)| NTT 記事 + EVT-036(系列 K)| yellow |

これら 7 件は v0.2 → v0.3 改訂で構造的に対処すべき統合課題。

---

## 2. 決定事項(本 ADR の中核)

### 2-A. 円卓会議機構 v0.3 改訂対処 7 件の構造的内訳

#### 対処 1: Chairman blind review 機構実装(red)

**問題**: 委員長(Claude)は ZEI-RO + チャッピー Round 1/2 発言を見た上で Round 3 最終決議を出す = **同モデル衝突の鏡像対話リスク**(Claude-Claude 間の判断パターン収束、結果的馴れ合い)。

**対処**: speaker masking 実装 — 委員長が Round 3 で独自観点を出してから Round 1/2 と照合する 2 段階構造。

**実装方針**:
- 工場長側 orchestrator.ts に `--chairman-blind` フラグ追加
- Round 3 委員長プロンプトを 2 分割(独自判断パート → 統合パート)
- 各パート出力を decisions[] に併記(blind_decision + integrated_decision)

#### 対処 2: 議題前提検証義務(red)

**問題**: B-001 議題「司令官 α 5 件 DO-COMMON-* 自己起案忘却」が **議題前提誤認**(実態は完遂、frontmatter 規範未確立)= EVT-033。3AI が誤前提のまま議論し決議も誤前提に基づく = 信託基盤毀損。

**対処**: 議題起案テンプレに「対象状態完全把握確認」セクション必須化。

**実装方針**:
- 議題起案前 checklist:
  - 対象リポジトリの完了状況確認(commit 投入時点 + 実装結果両方)
  - 規範採択状況確認(規範違反 vs 規範未確立の区別)
  - 責任主体明示(議題内責任主体が単一 or 複数か)
  - 当事者(司令官 α / 工場長)からの自己評価入手 or 不在の理由明示
- council_*.md frontmatter に `agenda_premise_verified: true/false + verification_evidence_refs[]` 追加

#### 対処 3: 発散役異論閾値設計(red)

**問題**: ZEI-RO 出力 5 案中 2-3 案が形式的反論寄り(健全な異論ではない)= 過度な追認 / 過度な反論の混在。

**対処**: デビルズアドボケート プロンプトに「健全な異論」閾値内在化。

**実装方針**:
- 健全な異論定義: 議題前提を疑う / 前提条件の見落とし指摘 / リスク観点での代替案提示
- 不健全な異論定義: 形式的反論 / 過度な追認 / 過度な反論(現実不整合)
- ZEI-RO プロンプトに上記定義を明示(工場長側 orchestrator.ts 内)
- 出力検証 evidence_refs 必須化

#### 対処 4: 議題分解時責任主体保持規律(yellow)

**問題**: B-001 議題で「司令官 α 単独責任」と即断したが、実態は監督官 A 側議題誤認 + 規範未確立 = **責任主体複数 + 反転**。

**対処**: 議題テンプレに「責任主体」セクション必須化。

**実装方針**:
- 議題内に明示:
  - 責任主体(単一 / 複数)
  - 各主体の責任範囲
  - 責任反転リスク(議題前提誤認時の主体変更可能性)
- council_*.md frontmatter に `responsibility_subjects[]` フィールド追加

#### 対処 5: 工数見積 AI 駆動前提化(red)

**問題**: ZEI-RO B-002 工数見積が議題内見積の 3-20 倍。これは ZEI-RO が **人間実装基準** で算出している可能性(ヤス指摘:「実装時間は人間実装と AI 駆動の差、AI 駆動も過剰見積」)。

**対処**: ZEI-RO/チャッピー/委員長プロンプトに「AI 駆動工場前提」明示 + 過去実績ベース校正。

**実装方針**:
- 全 3AI プロンプトに前文追加:「実装は AI 駆動工場(司令官 α + 工場長 + Cursor + Sonnet)で行うため、工数見積は AI 駆動前提で算出すること。人間実装基準ではなく過去実績(工場長 archive 参照)で校正」
- 過去実績データソース: `record-x-commander/strategy/tickets_completed/` の実工数(各 DO の implementation_session_meta.duration_minutes)
- 議題内に「過去類似 DO 実績工数(参考)」セクション追加

#### 対処 6: 役割「恐れるもの」明示(yellow)

**問題**: 役割境界書(DO-FACTORY-161)に NTT 記事方式「恐れるもの」セクション未含有 = 視点自動分岐構造未明示。

**対処**: DO-FACTORY-161 拡張(第 37 次発令で司令官 α へ依頼済)+ 円卓会議 3 役にも適用。

**実装方針**:
- ZEI-RO「恐れるもの」: 議題前提未検証 + 健全な異論欠落 + 過度な追認 / 過度な反論
- チャッピー「恐れるもの」: 順位付け根拠不在 + 収束品質低下
- 委員長「恐れるもの」: 単独統合判断による鏡像対話 + Chairman blind review 不在
- プロンプトに「恐れるもの」を明示 = 視点自動分岐の構造的保証

#### 対処 7: コンテキスト肥大化対策(円卓会議 agenda)(yellow)

**問題**: B-001/B-002 共に agenda が長文フルテキスト投入(B-002 は 100 行以上)= NTT 記事「毎回フルセット渡しでトークン雪だるま式増加」同型。

**対処**: agenda 構造化テンプレ(YAML)+ コンテキスト差分のみ。

**実装方針**:
- agenda YAML 構造:
  ```yaml
  agenda_id: B-XXX
  title: ...
  background_summary: 200 字以内
  context_diff_refs:  # 過去の関連 council / EVT への参照のみ、フルテキスト不要
    - council_20260429_evt025_response_001.md §1-§2
    - EVT-033
  options:
    - id: I
      summary: ...
    - id: II
      summary: ...
  premise_verification:
    verified: true
    evidence_refs: [...]
  responsibility_subjects: [...]
  ai_implementation_premise: true  # 工数見積 AI 駆動前提
  ```
- 工場長側 CLI 拡張で YAML パース対応

### 2-B. 改訂優先順位

| 段階 | 対処 | 重大度 | 実装順 |
|---|---|---|---|
| 段階 A(即急、Day 132 前後)| 対処 2 + 6 | red + yellow | 議題前提検証義務 + 役割「恐れるもの」(部分対応済、第 37 次発令)|
| 段階 B(Phase B-α 起動後、Day 132-145)| 対処 3 + 5 + 7 | red + red + yellow | 発散役プロンプト改訂 + 工数 AI 前提 + agenda YAML 化 |
| 段階 C(中期、Day 145+)| 対処 1 | red | Chairman blind review(工場長側 CLI 大規模拡張要)|
| 段階 D(長期、Phase T1)| 対処 4 | yellow | 議題分解時責任主体保持(規律 = 段階 A で部分対処済、フル正式化は段階 D)|

---

## 3. 結果(期待される効果)

### 3-A. 信託ドクトリン v1.0 物理層実装の品質保証強化

- 議題前提検証義務(対処 2)= EVT-033 同型再発防止
- 工数見積 AI 駆動前提化(対処 5)= AI 駆動工場との整合
- Chairman blind review(対処 1)= 鏡像対話リスク回避
- = **3AI が寄れば信頼度最高** の構造的保証

### 3-B. 系列 J/K/L 構造的対処

- 系列 J(AI 速度 vs 人間検証速度ギャップ)= `role_and_conduct.md` §1.1-E + 本 ADR で対処開始
- 系列 K(コンテキスト肥大化)= 対処 7(agenda YAML)+ 別途 archive rotate(別 ADR 候補)
- 系列 L(マルチスレッド話題選別)= task #59 引き上げ(別 ADR 候補)

### 3-C. 円卓会議機構の自己改善ループ

第 3 回円卓会議の議題候補として **円卓会議機構 v0.3 改訂自体** を付す = 自己改善ループの正面実装。

---

## 4. 代替案の検討

### 4-A. 代替案 (a): 円卓会議機構を凍結 + v0.4 で全面再設計

却下理由:
- 第 1 回 + 第 2 回で実証済の機能(3AI 議論、決議生成、信託基盤)を捨てるのは新陳代謝原則(sp500 §1)違反
- 段階的改訂(本 ADR 提案)で十分

### 4-B. 代替案 (b): 7 件を個別 ADR 化(ADR-009-A 〜 ADR-009-G)

却下理由:
- ADR 番号膨張、参照困難
- 7 件は構造的相互依存(対処 2 と 4、対処 5 と 7 等)= 統合 ADR が妥当

### 4-C. 代替案 (c): 7 件を全部段階 A(即急)で実装

却下理由:
- Chairman blind review(対処 1)は工場長側 CLI 大規模拡張要 = 段階 A は不可能
- 優先順位付けが必要(本 ADR 採用)

---

## 5. 制約 + リスク

### 5-A. 制約

- 工場長側 CLI 改修は司令官 α 経由の発令が必要(三者役割境界尊重)
- ヤスの最終決裁権は本 ADR 採否 + 各段階発令時の承認で行使
- Phase B-α 起動 Day 132 朝以降の発令ペース緩和ルール(`role_and_conduct.md` §1.1-A)遵守

### 5-B. リスク

| リスク | 対処 |
|---|---|
| v0.3 改訂中に円卓会議機構が一時的に機能低下 | 段階的改訂で機能継続性維持(段階 A → B → C → D 順次) |
| 工場長側 CLI 改修コスト過大 | 段階 C(Chairman blind review)を中期に分散、代替手段検討可 |
| 対処項目の追加発見 | 第 3 回円卓会議で追加対処項目検討 = 自己改善ループ |

---

## 6. 三者統合自動化(本 ADR 由来の追加要件、ヤス 2 段階指示反映)

ヤス指示 2 段階契機:
1. (2026-04-29 / Day 131 夕方 1)「定期検診同様に自動化も組み込もう」= 自動化統合の起点
2. (2026-04-29 / Day 131 夕方 2)「司令官リポジトリも同じこといえるよね、各官にも伝達実装を指示した方がいいのかな」= **三者対等運用の構造的整合性**

= **三者統合自動化** が本 ADR §6 の正式設計方針。三者対等運用 + 信託基盤の物理層完遂条件。

### 6-A. 三者統合自動化の構造

| 役割 | 現状 | 必要実装 | 担当起案 |
|---|---|---|---|
| **工場長** | ✅ 既存(`visionary-dream` + `dream-crystallize --domain factory`)| `--domain supervisor` + `--domain commander` 追加 | DO-FACTORY-{N}(司令官 α 経由依頼)|
| **監督官** | 🟡 暫定スタブ起案完遂(`dream-crystallize-supervisor.ps1` v0.2 + 共通テンプレート `_helpers/dream-crystallize-template.ps1`)| 工場長側ドメイン拡張後、本格 CLI ラッパー化 | 監督官 A 自身(本 ADR §6-D で完遂)|
| **司令官** | ✗ 未整備 | 共通テンプレート参照の `dream-crystallize-commander.ps1` 起案 + scheduler XML | DO-COMMANDER-{N}(第 38 次発令で依頼)|

### 6-A2. 段階的再起動順序(R0 新設 + R5 訂正、2026-04-30 朝改訂)

EVT-041(schtasks 命名違反 9/9 不整合)+ 司令官 α 第 50 号応答(6 件監査結果)契機の改訂:

| 段階 | 内容 | 状態 |
|---|---|---|
| **R0**(新設、本改訂)| schtasks 全件監査 + 命名整理完遂(DO-COMMANDER-024 + DO-COMMANDER-025 完遂)| 🟡 進行中、Day 132-134 完遂見込み |
| R1 | `\RX-Layer3-News`(`layer3_news_template.ps1` 修正後)| 🔴 BLOCK 中、R0 完遂後解除 |
| R2 | `\RX-Layer4-Checkup`(`layer4_checkup_template.ps1` 修正後)| 🔴 同上 |
| R3 | `\RX-Layer2-Strategy`(正本維持、`\Record-X-Layer2-Strategy` 撤廃後)| 🔴 同上 |
| R4 | `\RX-Layer1-Implementation`(`layer1_implementation_template.ps1` + 起動間隔 Phase A N=15 完走実績ベース修正後)| 🔴 同上 |
| **R5**(訂正、本改訂)| `\Record-X-Layer2-Strategy` 撤廃確認 + `\RecordX_NightlyFlight` 責務帰属確認(工場長 Sonnet 経由)| 🟡 同上 |

各段階間 24h 観察期間 + 監督官 A verdict。

### 6-B. 三者統合スケジュール(時差稼働、ヤス採択済)

#### 6-B-1. 設計上の想定スケジュール(本 ADR 採択時、2026-04-30 / Day 128 朝)

| 時刻(JST)| 役割 | 装置 | 目的 |
|---|---|---|---|
| **00:00** | 工場長 | `npx tsx tools/orchestrator.ts dream-crystallize --domain factory`(既存)| 直近 24h の factory_research / factory_canon / teams_lessons から ADR 候補結晶化 |
| **03:00** | 監督官 | `dream-crystallize-supervisor.ps1`(v0.2、共通テンプレート参照)| 直近 24h の archive/ + outbox/ + circular/ + minutes/ から監督官側 ADR 候補結晶化 |
| **06:00** | 司令官 | `dream-crystallize-commander.ps1`(司令官 α 起案予定、共通テンプレート参照)| 直近 24h の strategy/ + decisions/ + handoff/ + minutes/ から司令官側 ADR 候補結晶化 |
| **09:00** | 三者検診 | 既存 `operations/periodic_checkup_protocol.md` v0.1 | 三者結晶化結果の統合レビュー + 役割実行スコア更新 |

#### 6-B-2. 物理層実態(2026-05-01 / Day 129 深夜検証、EVT-065 訂正)

**v1.3 改訂で訂正対象**: §6-B-1 の想定スケジュールは設計上の理想であり、物理層 schtasks 実態と齟齬がある。EVT-065(2026-05-01 深夜、系列 I 15 件目、累積 48 件目自己訂正)で発覚。

| Task | §6-B-1 想定 | 物理層実態(supervisor + commander 共通)| 判定 |
|---|---|---|---|
| RecordX_ArchiveSync_ThreeRealm | 02:55 自動稼働 | Next Run 02:55 / **Last Run 1999/11/30 / Last Result 267011** | 🔴 設置完遂 / 自動稼働実績ゼロ |
| RecordX_DreamCrystallize_Supervisor | 03:00 自動稼働 | Next Run 03:00 / **Last Run 1999/11/30 / Last Result 267011** | 🔴 設置完遂 / 自動稼働実績ゼロ |
| RX-Layer4-Checkup | **09:00** 三者検診 | Next Run **03:00** / Last Run 04/29 12:50 / Last Result 0 | 🔴 **時刻齟齬(09:00 → 03:00)** |
| RX-Layer1-Implementation | 稼働継続 | Last Run 04/29 15:10 / **Last Result 267014(中断)** | 🔴 中断未対処 |
| RX-Layer3-News | 06:00 | Next Run 06:00 / Last Run 04/30 16:14 / Last Result 0 | ✅ 整合 |

**三者共同盲点**: 監督官 A + 司令官 α + ヤス三者全員が「09:00 JST 三者検診」前提を共有していた = 段階 1 双方向化(EVT-061/062)後の同型再発、本日 5 件連鎖(EVT-061→062→063→064→065)の集大成。

#### 6-B-3. M2.6 完遂判定の 2 段階分離(司令官 α 素材 §3 採用、v1.3 改訂)

旧 M2.6 完遂判定(撤回):
- 「M2.6 三者統合スケジュール schtasks /enable 完遂」= schtasks 設置 + Enabled 化のみで完遂判定 → 🔴 **撤回**(自動稼働実績ゼロ判明)

新 M2.6 完遂判定(2 段階分離):

| 段階 | 判定基準 | 達成方法 | 本日時点状態 |
|---|---|---|---|
| **M2.6-A 設置完遂** | schtasks 設置 + Enabled 化 | `schtasks /create` + `/change /enable` | ✅ 達成済 |
| **M2.6-B 自動稼働確証** | Last Run が想定起動時刻以降 + Last Result == 0(成功)| 設置後 24-48h 経過観察 + `sync-schtasks-state.ps1` v0.1 経由監視 | 🔴 未達(Last Run 1999/11/30 = 起動実績ゼロ)|

= **M2.6 完遂 = M2.6-A AND M2.6-B 両方達成**。本日時点では M2.6-A のみ達成、M2.6-B 未達 = M2.6 全体は **未完遂判定** に修正。

#### 6-B-4. 段階 2 進捗認識訂正(60% → 約 40-50%、v1.3 改訂)

旧認識(撤回): 段階 2 全体 60%(M2.6 完遂前提)

新認識(M2.6-B 未達反映、司令官 α 素材 §3-C 採用):
- M2.1-M2.5(P1 進捗)= 完遂継続(認識ラグなし)
- M2.6 = M2.6-A 達成 / M2.6-B 未達 = **半達成 50%**(M2.6 単独配点 20% × 50% = 10%)
- 段階 2 全体: **約 40-50%**(ArchiveSync/DreamCrystallize 自動稼働失敗原因調査完遂で +10pt 復元見込み)

正確な再評価値は `aggregate-cohesion-score.ps1`(DO-COMMANDER-027 §1-B、Day 131-132 持越し → Phase B-α 起動後 Day 132 以降算定)経由で次セッション中盤に確定。

#### 6-B-5. 物理層訂正アクション(v1.3 改訂後の運用)

| # | アクション | 担当 | 状態 |
|---|---|---|---|
| 1 | RX-Layer4-Checkup 03:00 → 09:00 修正(`schtasks /change /tn "RX-Layer4-Checkup" /st 09:00:00`)| ヤス直接実行(共有インフラ修正、EVT-050 系列 P 案 A)| 🟡 ヤス採否待機 |
| 2 | ArchiveSync + DreamCrystallize 自動稼働失敗原因調査(Last Run 1999/11/30 の根本原因)| 監督官 A + 司令官 α 共同 | 🔴 未着手 |
| 3 | RX-Layer1-Implementation 267014 中断原因調査 | 監督官 A | 🔴 未着手 |
| 4 | starter_checklist v0.2 物理装置化(系列 I 規律)| 監督官 A | ✅ 2026-05-01 / Day 129 完遂(`operations/starter_checklist_v0.2.md` v1.0)|

#### 6-B-6. Day 起算認識訂正(v1.3 改訂)

**旧認識(誤)**: Day 132 = 2026-04-30(Phase B-α 起動)、本日 = Day 133 = 2026-05-01
**新認識(正、ヤス指示 2026-05-01)**: Day 起算 = **2025-12-24**、Day 132 = **2026-05-04**(Phase B-α 起動)、本日 = **Day 129** = 2026-05-01(**Phase A 末**)

= 全文書で 4 日分のズレ伝播の可能性。監督官 B(Argus-B)で修正作業中、本 ADR §6-B-6 で A ライン側認識訂正記録。

時差稼働の効果:
- AI 駆動工場の負荷分散
- 三者の結晶化結果が次の工程に時系列で活用可能(工場長 → 監督官 → 司令官 → 検診の循環)
- **NTT 記事 §3 同型実装**(2 層ナレッジ基盤のバック層 = 継続抽出パイプラインを三者展開)

### 6-C. 円卓会議出口配管自動化(EVT-035 段階 2)

- DO-SUPERVISOR-001 候補(EVT-035 §段階 2):円卓会議 → 司令官 α 自動転記
- 段階 3(Day 132+):完全自動パイプライン稼働
- 本 ADR §6-A の三者統合自動化と統合運用

### 6-D. 監督官側自動化の物理装置(本 ADR 採択後の物理層、本セッション内完遂)

| ファイル | 用途 | 状態 |
|---|---|---|
| `sync/sync_script/_helpers/dream-crystallize-template.ps1` v0.1 | 三者共通テンプレート | ✅ 起案完遂 |
| `sync/sync_script/dream-crystallize-supervisor.ps1` v0.2 | 監督官側アダプタ(共通テンプレート参照)| ✅ 起案 + DryRun 動作確認完遂(26 件検出)|
| `sync/scheduler_templates/dream_crystallize_template.xml` | 監督官側 Windows Task Scheduler 定義(03:00 JST 日次)| ✅ 起案完遂 |
| `archive/dream_crystallize_history/{YYYYMMDD}_supervisor_dream.md` | 監督官側結晶化レポート出力先 | 自動生成 |

### 6-E. 各官への共通テンプレート展開(第 38 次発令で実装指示)

司令官 α へ第 38 次発令で依頼:

1. **DO-COMMANDER-{N}**(司令官側 PS1 起案):
   - 共通テンプレート(`record-x-supervisor/sync/sync_script/_helpers/dream-crystallize-template.ps1`)を参照
   - 司令官側 watch_paths 設定(`strategy/`, `decisions/`, `handoff/`, `minutes/` 等)
   - `$script:DreamDomain = "commander"` 設定
   - 出力先: `record-x-commander/archive/dream_crystallize_history/{YYYYMMDD}_commander_dream.md`

2. **DO-COMMANDER-{N+1}**(司令官側 scheduler XML 起案):
   - 監督官側 `dream_crystallize_template.xml` を参考に司令官側用に複製
   - 起動時刻 06:00 JST に設定

3. **DO-FACTORY-{N+2}**(工場長側 CLI ドメイン拡張):
   - 司令官 α 経由で工場長へ依頼
   - `record-x/factory/tools/orchestrator.ts` の `dream-crystallize` コマンドに `--domain supervisor` + `--domain commander` 拡張
   - 既存 `--domain factory` ロジックを拡張、watch_paths をドメイン別に分岐
   - 完成後、各官の PS1 スタブを **CLI 呼び出しラッパー** に置換(LLM 駆動結晶化に進化)

### 6-H. L8 構造的バイアス対処(2026-05-01 / Day 129、Phase A 末、第 4 回円卓会議決議反映、v1.4 改訂)

第 4 回円卓会議(`archive/board_council_minutes/council_20260501_l8_simplification_004.md`、ヤス合意-1 全件採択)決議による AI over-engineering 偏向(L8 構造的バイアス)対処規律。

#### 6-H-1. L8 構造的バイアス命題

> AI は「動かないシステムを直す」より「動かないシステムを検知する装置を作る」を選ぶ構造的バイアスを持つ。

物理事例:
- Argus-B(supervisor B-line): probe v0.1 → v0.2(meta-meter)→ メーター監視メーター → cockpit rubric 拡張連鎖
- Argus-A(本セッション): starter_checklist v0.2(225 行、§1.5-B 拡張ではなく独立装置化)+ post-commit hook ×3(supervisor + commander + factory 個別)提案
- 系列 M「AI over-engineering 偏向」新設(`error_patterns.md` 系列分類追加)

#### 6-H-2. 「装置」定義(複合指標、議題 #2 採択)

| 指標 | 役割 |
|---|---|
| (iv) **単一機能の責任所在(single source)** | 主指標 = 同機能複数装置禁止、本日 5 件連鎖の根因 |
| (ii) **schtask 登録数** | 副指標 = pipeline 接続点数、運用整合 |
| (i) ファイル数 / (iii) LOC | 副次(LOC が増えても single source なら整合)|

#### 6-H-3. 簡素化原則(議題 #3 採択、期間限定)

| 項目 | 内容 |
|---|---|
| 期間 | 2026-05-01 ~ 2026-05-10(Phase A 末 → Phase B-α 起動 Day 132 = 2026-05-04 → 7 日実証期間)|
| 範囲 | 新規装置追加禁止、既存装置の統合・削除・整理のみ許可 |
| 例外 | (i) 棚卸しで判明した必須未実装機能 / (ii) ヤス直接指示 / (iii) 三者合議承認 |
| 違反検知 | starter_checklist v0.2 適用外起案を検知 → EVT 即時記録 + 撤回義務 |

#### 6-H-4. 自己検診強化(議題 #4 採択、各官 CLAUDE.md §4 改訂)

各官 CLAUDE.md §4 自己点検チェックリストに追加:
> 「症状治療を提案する前に **3 段階以上の原因深掘り** を提示し、**簡素化案と装置追加案を必ず対比** すること」

各官自律改訂、別 DO 起案不要。

#### 6-H-5. 装置追加判断プロトコル(議題 #5 採択、scale 別)

| scale | 単独追加可否 | 合議要否 |
|---|---|---|
| single function 既存装置の改訂(LOC ±50% 以内)| 🟢 単独可 | 不要 |
| 新規 single source(独立装置の追加)| 🔴 単独不可 | 三者合議必須 |
| 既存装置の統合・削除 | 🟢 単独可 | 不要(簡素化方向は推奨)|
| 三者跨ぎの装置(supervisor + commander + factory)| 🔴 単独不可 | 円卓会議必須 |

#### 6-H-6. 既存装置棚卸し義務(議題 #6 採択、ガレージドクトリン §1.5-C 強化)

ガレージドクトリン §1.5-C「過去装置の棚卸し義務」を以下強化:

| 項目 | 内容 |
|---|---|
| 棚卸し対象 | supervisor + commander + factory 三者全装置 |
| 担当 | 監督官 A 主導(supervisor 側自実施 + 統合)+ 司令官 α(commander)+ 工場長 Castor(factory)|
| 期限 | 2026-05-04(Phase B-α 起動 Day 132)|
| 出力 | `02_physical/garage_doctrine_audit_20260504.md`(三者統合棚卸しレポート、装置別 ✅/🟡/❌/📚 分類 + single source 違反検出)|
| 第 2 回監査位置づけ | 第 1 回(2026-04-28 / Day 130 末、32 装置中 ✅4 / 🟡9 / ❌8 / 📚11、接続率約 40%)からの改善検証 + L8 観点新規追加 |

#### 6-H-7. 既 commit 分判定結果(議題 #7 採択)

| 装置 | 起案者 | L8 判定 | 採択アクション |
|---|---|---|---|
| starter_checklist v0.2(225 行)| Argus-A | 🟡 装置数 +1 | §1.5-B 内統合化検討(議題 #6 棚卸し後、必要時 simplify DO 起案)|
| pipeline-bottleneck-probe v0.2(238 行)| Argus-B | 🟡 装置数 +1 | 必要性再判定(議題 #6 棚卸し後)|
| sync-archive v0.3 改修(commit 06acc03)| Argus-B | 🟢 -1(B-001 削除込)| 残置(L8 整合)|
| autonomy_boundary_doctrine v0.1(148 行)| Argus-B | 🟡 規律装置 = +1 | §6-H-4 自己検診強化と統合候補 |
| post-commit hook ×3 提案(未実装)| Argus-A | 🔴 装置数 +3 | 凍結(§6-H-8 連動)|

#### 6-H-8. 三者統合カタログ自動登録機構(議題 #8 採択、CONDITIONAL)

| 観点 | 内容 |
|---|---|
| 既存装置 | `02_physical/three_realm_capability_catalog.md` v0.1-draft + `capability_catalog.md`(人間更新で機能している可能性、議題 #6 棚卸しで再判定対象)|
| 採否条件 | 議題 #6 棚卸しで「人間更新で十分機能」判定 → 不採択(自動更新装置不要)/「機能停止」判定 → 採択 |
| 採択時の設計原則 | 三者統合 single source(個別 hook ×3 ではなく統合スクリプト 1 本)= §6-H-2 (iv) 整合 |
| schema 統一(議題 #9)| 議題 #8 連動、不採択時は議題 #9 自動取下げ |

#### 6-H-9. ADR-010(三者統合コックピット)再起案不採択(議題 #10 採択)

| 観点 | 内容 |
|---|---|
| ADR-010 状態 | 2026-04-30 早朝 superseded、第 4 回円卓再起案候補だった |
| 第 4 回円卓決議 | 🔴 **REJECT 再起案**(検診プロトコル v0.2 §8 で simpler 版継承済 = 既存装置で機能、ADR-010 再起案不要 = L8 整合)|
| 確定状態 | superseded 維持 |

#### 6-H-10. ADR-010 superseded との関係(v1.2 §6-G 注記の本 v1.4 確定)

ADR-010(三者統合コックピット、2026-04-30 早朝 superseded)= **v1.4 改訂で再起案不採択を確定**(L8 整合)。検診プロトコル v0.2 §8 でコックピット概念継承(simpler version、3 層構造に縮小)= ADR-010 反論 6(設計過剰)整合 + 第 4 回円卓決議整合。

---

### 6-G. 検診プロトコル v0.2 接続(2026-04-30 朝改訂、EVT-039 訂正反映)

検診プロトコル v0.2(`operations/periodic_checkup_protocol.md` v0.2、2026-04-30 朝改訂)で本 ADR-009 §6 と物理装置接続を確立:

| 検診プロトコル v0.2 | ADR-009 §6 |
|---|---|
| §7-B 機能カタログ整合性チェック(自動更新)| §6-G-1 三者統合機能カタログの自動同期源(本ADR §6 + 検診で循環)|
| §7-C パイプライン接続健全性チェック(`sync-schtasks-state.ps1` v0.1 + 命名違反検出)| §6-G-2 sync-schtasks-state.ps1 起案根拠(EVT-041 命名違反 9/9 物理証拠)|
| §7-D 全停止状態即時検出 | §6-G-3 EVT-038 同型再発防止 + Yasu 即時通知(検証必要度 🔴)|
| §7-E 段階的解除モデル(ADR-005)接続 | §6-A2 段階 R0-R5 整合 |
| §8-A 09:00 JST 三者検診時 daily_cockpit 自動生成 | §6-B 三者統合スケジュール(09:00 三者検診)出口装置 |
| §8-B アラート発火時の Yasu 即時通知(🔴/🟡/🟢)| §6-D 監督官側自動化の物理装置(role_and_conduct.md §1.1-E 検証必要度マーキング自動付与)|
| §8-C コックピット履歴の長期トレンド分析(月次)| §6-F ロードマップ段階 4(全自律パイプライン)|
| §9 物理装置一覧(DO-FACTORY-166 + DO-SUPERVISOR-003 + sync-schtasks-state.ps1 + auto-evt R10)| §6-A 三者統合自動化構造(物理装置の集約)|

= **ADR-009 §6 = 自動化アーキテクチャ + 検診プロトコル v0.2 = 健全性チェック + コックピット = 出力装置** の三層構造で物理層完遂。

#### ADR-010 superseded との関係

ADR-010(三者統合コックピット、2026-04-30 早朝 superseded)は **第 4 回円卓会議で再起案候補**。検診プロトコル v0.2 §8 でコックピット概念を継承(simpler version、3 層構造に縮小)= ADR-010 反論 6(設計過剰)整合。第 4 回円卓会議で 3AI 議論を経て v2.0 仕様確立 = Chairman blind review 経由(ADR-009 §2-A 対処 1)。

### 6-F. 自動化進化ロードマップ(段階 1 → 4)

| 段階 | 状態 | 内容 |
|---|---|---|
| 段階 1(本 ADR 起案時)| ✅ 監督官側完遂 | 暫定スタブ運用、aggregation only(LLM 結晶化なし)|
| 段階 2(Day 132 朝起動後)| 🟡 第 38 次発令で実装指示 | 司令官側スタブ + 工場長側 CLI 拡張準備 |
| 段階 3(Day 132-145、Phase B-α 期間)| 🟡 計画 | 工場長側 CLI ドメイン拡張完遂 → 各官 PS1 をラッパー化 → LLM 結晶化稼働 |
| 段階 4(Day 145+、Phase T1)| 🟡 計画 | 円卓会議出口配管(EVT-035 段階 2)+ 検診プロトコル v1.1 統合 = 完全自律パイプライン |

これらは Phase B-α 起動 Day 132 以降に統合運用、本 ADR 採択後の DO-COMMANDER-{N} + DO-FACTORY-{N+2} 起案で各官の物理装置化完遂。

---

## 7. 採否要請

### ヤス採否

| 項目 | 監督官 A 推奨 | ヤス採否 |
|---|---|---|
| 本 ADR-009 採択(円卓会議機構 v0.3 改訂統合計画)| APPROVE | (要応答) |
| 段階 A 即時着手(対処 2 + 6 = 既に第 37 次発令で部分対処済、形式承認のみ要)| APPROVE | (要応答) |
| 段階 B/C/D の Phase B-α 以降スケジュール(別議題化、第 3 回円卓会議候補)| INVITE_REVIEW | (要応答可、Day 132 以降可) |
| 自動化統合(§6-A/B/C)を DO-SUPERVISOR-001/002 として別 DO 起案 | APPROVE | (要応答) |

### 司令官 α 採否要請(本 ADR 共有後)

第 38 次発令(Day 132 朝起動後)で司令官 α へ ADR-009 共有 + 工場長側 CLI 改修依頼を依頼予定。

---

## 8. 改訂履歴

- **v1.0**(2026-04-29 / Day 131 夕方): 初版起案、監督官 instance A、本日 D-α 結晶化対象として起案。EVT-033/035/036 + B-001/B-002 構造的弱点 7 件統合の正式 ADR 化。ヤス指示「定期検診同様に自動化も組み込もう」を §6 自動化統合に反映。第 3 回円卓会議議題化候補。
- **v1.1**(2026-04-30 / Day 132 朝): §6-A2 段階的再起動順序改訂(R0 新設 + R5 訂正、EVT-041 schtasks 命名違反 9/9 + 司令官 α 第 50 号応答 6 件監査結果反映)。
- **v1.2**(2026-04-30 / Day 128 朝): §6-G 検診プロトコル v0.2 接続節新設(EVT-039 訂正反映、機能カタログ整合性チェック + コックピット連動 + 物理装置一覧の三層構造接続確立)+ ADR-010 superseded との関係明示(第 4 回円卓会議再起案候補、検診プロトコル v0.2 §8 でコックピット概念継承)。
- **v1.3**(2026-05-01 / Day 129、Phase A 末): §6-B 三者統合スケジュール改訂 = §6-B-1(設計上の想定)+ §6-B-2(物理層実態 EVT-065 訂正)+ §6-B-3(M2.6 2 段階分離)+ §6-B-4(段階 2 進捗訂正 60% → 40-50%)+ §6-B-5(物理層訂正アクション 4 件)+ §6-B-6(Day 起算認識訂正、Day 起算 = 2025-12-24)。司令官 α 素材(`record-x-commander/strategy/proposals/20260501_adr_009_section6_revision_materials.md` v1.0、155 行)採用、starter_checklist v0.2 物理装置化(本日完遂)反映、本日 5 件連鎖(EVT-061-065)構造的訂正の集大成。改訂主体 = 監督官 A(Argus、Clear 後新 instance)、司令官 α は素材提供主体(CLAUDE.md §2-B-2 役割境界遵守)。
- **v1.4**(2026-05-01 / Day 129、Phase A 末、本セッション内、第 4 回円卓会議決議反映): §6-H 新節「L8 構造的バイアス対処」追加 = §6-H-1(L8 命題 + 系列 M 新設)+ §6-H-2(「装置」定義複合指標 single source + schtask 数)+ §6-H-3(簡素化原則期間限定 2026-05-01〜05-10)+ §6-H-4(自己検診強化 各官 CLAUDE.md §4 改訂)+ §6-H-5(装置追加判断プロトコル scale 別)+ §6-H-6(既存装置棚卸し義務、ガレージドクトリン §1.5-C 強化)+ §6-H-7(既 commit 分判定結果)+ §6-H-8(三者統合カタログ自動登録機構 CONDITIONAL)+ §6-H-9(ADR-010 再起案不採択確定)+ §6-H-10(ADR-010 superseded との関係確定)。第 4 回円卓会議議事録 = `archive/board_council_minutes/council_20260501_l8_simplification_004.md`、ヤス合意-1 全件採択。Argus-B L8 自認 + Argus-A 同型バイアス自認 + Argus-B 補強 3 件全採択(議題順序組替 + 「装置」定義 + 既 commit 分判定)。Phase A 末からの構造的方針見直し = 規範円卓会議 T7 + Phase 移行円卓会議 T8 該当。
