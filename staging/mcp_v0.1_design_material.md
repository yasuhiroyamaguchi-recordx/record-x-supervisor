# MCP 第 1 弾 設計素材 v0.1(Phase B 中盤起案準備、ドラフト)

**配置先**: `staging/mcp_v0.1_design_material.md`
**起案日**: 2026-05-03 早朝(Day 131 朝起動 → 本セッション末、監督官 A `Argus`)
**起案契機**: ヤス指示「推奨順にすすめて承認」(2026-05-03 早朝、推奨プラン #3 Phase B 中盤起動 #2 MCP 第 1 弾起案 採択経路)+ Phase B 中盤起動条件接近(Wave 1 100% + 環境層 Step 1 + フロントエンド v1.0 + プロシード壁クリア配備 = 4 件物理装置化深化)
**status**: design_material_draft(Phase B 中盤起案 = 2026-05-11 以降、新規装置追加禁止令明け)
**根拠**: 全体マップ v1.4 §11-J 推奨プラン #3 #2(MCP 第 1 弾起案、Phase B 中盤、capability_registry + handoff_summary + evt_search、エアークローゼット同型 70-90% トークン削減)+ 監督官 A 第 113 次発令 §6 #2

---

## 1. 起案目的

### 1-A. フロントエンド動的データ接続経路

`frontend/` 配下 22 files / 7816 LOC = **モック値**(data.jsx + catalog-data.jsx + dream-data.jsx 全件ハードコード)= プロトタイプ受領 + 動作可能化完遂、production 実装未着手。

**接続経路** = MCP 第 1 弾配備 = **動的データ source 統合**:
- 三者 git log(supervisor + commander + factory)
- outbox / inbox 統計(発令 + 応答件数)
- EVT 集計(`archive/error_patterns.md` 末尾、系列別累積)

### 1-B. 70-90% トークン削減目標(エアークローゼット同型)

エアークローゼット事例参照:
- 大規模 monolithic 文書 = 1 取得で 30-50K トークン消費
- MCP server 経由 query = 必要部分のみ取得 = 5-10K トークン消費
- = 70-90% 削減

本記録庁適用先:
- handoff/(全体マップ + 直近 handoff)= 1 セッション 30K+ トークン消費
- archive/error_patterns.md = 5175 行 = 1 取得 50K+ トークン消費
- outbox/ + inbox/ = 累計 100+ ファイル = 1 統合取得 100K+ トークン消費
- 司令官 α + 工場長 Castor 三者状態同期 = 1 セッション 50K+ トークン消費

= **MCP 第 1 弾配備 = 30-100K トークン × 1 セッション削減 = 50-90% 削減目標**

---

## 2. MCP server 3 件 設計

### 2-A. capability_registry MCP server

**目的**: 三者(supervisor + commander + factory)の機能カタログ + 物理層実態 + Phase 進捗 統合 query。

| エンドポイント | 入力 | 出力 |
|---|---|---|
| `capability/get` | `{ realm: "supervisor"|"commander"|"factory", category?: string }` | カテゴリ別機能リスト + 各機能の SUPERSEDED/active 状態 + 物理事例件数 |
| `capability/search` | `{ keyword: string, fuzzy?: boolean }` | キーワード一致機能 + 関連 EVT + 関連 PR + 関連発令 |
| `phase_progress/get` | `{ wave: 1|2|3 }` | Wave 別進捗 + 完遂 PR 一覧 + OPEN PR + BLOCKED 一覧 |
| `triparty_state/snapshot` | (なし)| 三者 git log 直近 + outbox/inbox 件数 + active tickets 件数 + 環境層配備進捗 |

**実装規模見積**: 200-400 LOC、TypeScript MCP SDK 経由、依存 = git log parser + frontmatter parser

**データソース**:
- supervisor + commander + factory 各 git log(直近 50-100 commit)
- supervisor `staging/function_catalog_v1_draft.md` v1.1
- commander `strategy/proposals/INDEX.md` + `strategy/audits/`
- ProjectRX PR list(gh pr list)

### 2-B. handoff_summary MCP server

**目的**: handoff(supervisor 7+ files、commander 7+ files、factory)+ 全体マップ(staging/high_autonomy_roadmap_v1.0_draft.md)サマリ統合 query。

| エンドポイント | 入力 | 出力 |
|---|---|---|
| `handoff/list` | `{ realm?: string, since?: date }` | handoff ファイル一覧 + 各 frontmatter 抜粋 |
| `handoff/summary` | `{ realm: string, file: string }` | 該当 handoff の §0 + §2 + §9 抜粋(critical_unfinished + マイルストン + 哲学層継承)|
| `roadmap/section` | `{ section: string }` | 全体マップ該当セクション抜粋(§10/§11 等)|
| `phase_status` | (なし)| Phase A/B/C/T1/T2 状態サマリ + 残課題マップ critical/high/medium/low |

**実装規模見積**: 150-250 LOC、handoff frontmatter parser + section extractor

**データソース**:
- supervisor `handoff/*.md` + `staging/high_autonomy_roadmap_v1.0_draft.md`
- commander `handoff/*.md` + `strategy/advance_map*.md`
- staging/handoffs/argus_b_*.md(B-line 進捗)

### 2-C. evt_search MCP server

**目的**: EVT 累計(`archive/error_patterns.md`、5175 行 → 拡張継続)系列別 + キーワード検索 + 統計集計。

| エンドポイント | 入力 | 出力 |
|---|---|---|
| `evt/search` | `{ series?: "I"|"J"|"M"|"N", keyword?: string, since?: date }` | 該当 EVT 一覧 + 各 EVT サマリ + 物理証拠 |
| `evt/stats` | `{ since?: date }` | 系列別累計件数 + 連続発生サマリ + 統計的有意性指標 |
| `evt/cross_reference` | `{ ticket_id?: string, pr?: number, commit?: string }` | 該当 ticket/PR/commit に関連する EVT 群 |

**実装規模見積**: 200-300 LOC、Markdown parser + 系列分類ロジック + 統計集計

**データソース**:
- supervisor `archive/error_patterns.md`(本日 5175 行 + §6 拡張)
- commander `archive/error_patterns.md`(同型反映後)
- ProjectRX PR title + body(EVT 候補参照)

---

## 3. 起案タイミング

| 段階 | 期日 | 状態 |
|---|---|---|
| 簡素化原則期間中(2026-05-01〜05-10)| 🔴 新規装置追加禁止令該当 = MCP 配備不可 |
| 検証期間中間評価(2026-05-09)| 🟡 環境層配備 Step 1-7 完遂判定 + Wave 1 完遂判定 + プロシード壁クリア効果測定 |
| 新規装置追加禁止令明け(2026-05-11)| ✅ MCP 第 1 弾起案可 |
| **Phase B 中盤(2026-05-12 以降)**| ✅ **MCP 第 1 弾着手**(本素材ベース) |
| 接続完成(動的データ統合 完遂)| 2026-05-15 周辺(Phase B 完遂判定タイミング)|

= **本素材 = 2026-05-12 起案準備、2026-05-15 完遂目標**

---

## 4. 司令官 α + 工場長 Castor 採否要請(Phase B 中盤起案前)

### 4-A. 司令官 α 採否要請

| # | 採否対象 |
|---|---|
| 1 | 本素材 v0.1 認識共有(supervisor 側 staging/ 配置) |
| 2 | 設計素材 v0.1 → v0.2 改訂(司令官 α + 工場長 Castor 経由 設計詳細追加)|
| 3 | MCP server 3 件起案先決定(capability_registry → handoff_summary → evt_search 順 推奨)|
| 4 | 配置先(commander or factory リポジトリ?)決定 |
| 5 | 工場長 Castor 経由実装可否判定(MCP SDK + TypeScript 経験要)|

### 4-B. 工場長 Castor 連動

工場長 Castor は本日朝〜現在 16 PR 連続 merge 実績 = **MCP 実装能力 高度可能性高**(TypeScript skeleton 多数完遂経由)。

ただし、Sonnet 駆動 = プロシード壁懸念 → 本セッション末プロシード壁クリア二重防護配備済 = 解消経路始動。

= **2026-05-12 以降 MCP 第 1 弾着手時 = プロシード壁解消後の最初の高難度実装** = 試金石。

---

## 5. 接続完成判定基準(Phase B 完遂タイミング 2026-05-15 周辺)

| 基準 | 内容 |
|---|---|
| MCP server 3 件配備完遂 | capability_registry + handoff_summary + evt_search 全件動作確証 |
| フロントエンド動的データ接続 | data.jsx + catalog-data.jsx + dream-data.jsx ハードコード → MCP query 経由動的取得 |
| 70-90% トークン削減効果測定 | 配備前後の 1 セッション平均トークン消費 比較 |
| 三者統合機能カタログ自動運用 | capability_registry MCP server 経由、リアルタイム取得 |
| 検診ダッシュボード動作 | ヘルス指標 5 項目 + アラート 4 段階 = 動的データで稼働 |

= **「ダッシュボード = 両界共通言語 第 1 例」物理装置化の運用フェーズ移行**(unnamed.md 核心一文物理装置化深化)

---

## 6. 哲学整合

| 哲学層 | 整合性 |
|---|---|
| `unnamed.md` 核心一文 | ✅ ダッシュボード = 両界共通言語 第 1 例 → 動的データ接続で運用フェーズ移行 |
| sp500 §1 運動性継承 | ✅ 配備済装置(frontend + 三者 git log + EVT)= 運動性継承健全側 → MCP server で接続経路成立 |
| ガレージ §1.5 装置 vs パイプライン接続 | ✅ 装置(frontend + EVT 5175 行 + handoff)= 完成、パイプライン接続(MCP)= Phase B 中盤候補 |
| ヤス哲学「ルールで縛れ」 | ✅ MCP server = 動的データ取得経路の物理装置化(モック → 実データ強制移行)|
| dream_mode §1-B コンテキスト溢出予防 | ✅ MCP server 経由 query = トークン消費削減 = 溢出予防装置物理化深化 |
| 簡素化原則期間整合 | ⚠️ MCP server 3 件 = 新規装置追加 = 2026-05-11 以降起案(禁止令明け)整合 |

---

## 7. リスク + 否定併記(構造的反論)

### 7-A. ✅ 承認(本素材起案推奨)

- フロントエンド動的データ接続経路 = Phase B 完遂判定の必須条件
- 70-90% トークン削減効果 = エアークローゼット実証済整合
- 工場長 Castor 実装能力 = 16 PR 連続 merge 実績(TypeScript skeleton 多数完遂)+ プロシード壁クリア二重防護配備済 = 高難度実装の射程内

### 7-B. 🟡 否定(構造的反論)

- 簡素化原則期間中 = 新規装置追加禁止令該当 = 2026-05-11 まで配備不可 = 待機期間長
- MCP SDK 学習コスト + TypeScript 経験要 = 工場長 Castor 単独不能の可能性 = 司令官 α 経由補佐要
- 配置先(commander or factory)未決 = 越境境界判定要(三者合議推奨)
- 設計素材 v0.1 → v0.2 改訂期間 = 工場長 Castor + 司令官 α 経由 1-2 ターン要

= **2026-05-09 中間評価 + 2026-05-11 起案 + 2026-05-15 完遂判定 = タイトスケジュール = ボトルネック対応経路明示要**

---

## 8. Plan-First 例外発動明示

| 条件 | 該当 |
|---|---|
| (ii) ヤス指示「推奨順にすすめて承認」即時整流 | ✅ |
| (iii) 既存装置(staging/)通常運用 = 設計素材 ドラフト配置 | ✅ |

= 例外 (ii)+(iii) 双方該当発動。装置数 ±0(設計素材 = ドラフト、装置追加ではない、Phase B 中盤起案時に正式装置化)。

---

## 9. 改訂履歴

- v0.1(2026-05-03 早朝、Day 131 朝起動 → 本セッション末): 監督官 A(`Argus`、A-line)起案、ヤス指示「推奨順にすすめて承認」(推奨プラン #3 Phase B 中盤起動 #2 MCP 第 1 弾起案 採択経路)+ Phase B 中盤起動条件接近契機。MCP 第 1 弾 3 件設計概要(capability_registry + handoff_summary + evt_search、各 150-400 LOC)+ 70-90% トークン削減目標(エアークローゼット同型)+ 起案タイミング(2026-05-12 以降、新規装置追加禁止令明け)+ 接続完成判定基準(2026-05-15 周辺、Phase B 完遂判定)+ 司令官 α + 工場長 Castor 採否要請 5 件 + 哲学整合 6 層 + リスク承認 + 否定併記 + Plan-First 例外整合。次段階 = v0.2 改訂(司令官 α + 工場長 Castor 経由 設計詳細追加、Phase B 中盤起案前)。
