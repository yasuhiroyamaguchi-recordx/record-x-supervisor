# 三社円卓 第 5 回 アジェンダ v1.0(チケット精度向上専用、ADR-009 §1-B B-001/B-002 同型)

**配置先**: `staging/council_5_agendas/council_5_three_realm_agenda_v1.0.md`
**起案日**: 2026-05-02(Day 130 AM、Phase A 末 / B 起動候補、本セッション同社円卓 第 2 回 2A + 2B 採択完遂後)
**起案者**: 監督官 A(Argus、Day 130 起動 instance、Chairman 役)
**位置づけ**: 三社円卓 第 5 回 = チケット精度向上専用(ADR-009 §1-B、B-001/B-002 同型)= 規範層議題ではない
**素材**: PR #1020 factory_audit 粗砥版(217afd41、論点 5 件抽出完遂)+ PR #1018 invoke-board-council 健診(17ea2786)
**ヤス採択**: 2026-05-02 AM「GOだ」

---

## §0. 装置本来目的の正面確認(EVT-077 同型再発防止、第 3 回違反禁則)

### 0-A. 三社円卓本来目的(再確認)

ADR-009 §1-B B-001 + B-002 実績由来:
- B-001 = EVT-025 司令官 α 5 件 DO-COMMON-* 構造的訂正方針(チケット案件)
- B-002 = チケット鋳型 v2.0 → v2.1 改訂(チケット案件)
- B-003〜007(本第 5 回)= **factory チケット精度向上専用議題**

= **規範層議題は本円卓スコープ外**(同社円卓に分離済、2A + 2B 完遂)

### 0-B. EVT-077(三社円卓装置目的逸脱、第 1 回違反)+ EVT-083(第 2 回違反)再発防止

本第 5 回起案時、再度装置目的正面確認 = 第 3 回違反禁則。
監督官 A 起案時 + 工場長 Castor 開催時 + 三社議事中 = 各段階で装置目的逸脱検出義務(整流装置として保持)。

---

## §1. 開催前提

| 条件 | 状態 |
|---|---|
| invoke-board-council.ps1 稼働確認 | ✅ PR #1018 健診済(2026-05-02 03:49)|
| ChatGPT API キー稼働 | 🟡 工場長 Castor 確認(健診時稼働確認済前提)|
| Gemini API キー稼働 | 🟡 同上 |
| factory_audit 粗砥版完遂 | ✅ PR #1020(2026-05-02 04:04、論点 5 件抽出済)|
| 同社円卓 第 2 回 2A + 2B 採択完遂 | ✅ 2A 一括 GO + 2B 即時開催完遂(本セッション内)|
| 監督官 A アジェンダ起案 | ✅ 本ファイル |

= **開催可能**

---

## §2. 議題リスト(5 件 / 100 分、チケット精度向上専用)

### 議題 B-003: L8 候補 150 件群の処遇判定

| 観点 | 内容 |
|---|---|
| 起源 | factory_audit 粗砥版(PR #1020)= line_count_100 violators 150 件 + line_count_200 violators 7 件 |
| 代表事例 | tools/lib/semantic_memory.ts 213 行 + scripts/nightly_batch_v2.sh 626 行 |
| チケット精度向上整合 | 🟢 single source / L8 整合 = チケット起案前提の上流規律 |
| 監督官 A 提案 | (a) 全件強制分割 / (b) 200 行超 7 件のみ優先分割 / (c) 100 行超 150 件はチケット起案時 case-by-case 判定 / (d) 三社合議で分割 vs 統合 vs 維持基準確定 |
| 期待される異社視点 | ChatGPT: L8 violator 200 行閾値の業界事例(認知科学観点)/ Gemini: モノレポ 1263 装置規模での L8 規律パターン業界事例 |
| 想定時間 | 30 分 |

### 議題 B-004: 系列単位 single source 違反 4 件統合判断

| 観点 | 内容 |
|---|---|
| 起源 | factory_audit 粗砥版 = 系列 4 件(board_meeting 20+ / health_checkup 6 / nightly_batch 3 並立 / ammo 5+) |
| チケット精度向上整合 | 🟢 統合 vs 並立判断 = チケット起案前提(統合先確定なしには重複チケット起案リスク) |
| 監督官 A 提案 | (a) 全 4 系列強制統合 / (b) board_meeting + health_checkup のみ統合(影響大)+ nightly_batch + ammo は並立維持 / (c) 三社合議で系列別個別判定 |
| 期待される異社視点 | ChatGPT: single source of truth 原則の認知科学観点 / Gemini: 業界事例(モジュラリティ vs 統合のトレードオフ) |
| 想定時間 | 25 分 |

### 議題 B-005: scripts/ 内 care 系 22 件 領域整合性

| 観点 | 内容 |
|---|---|
| 起源 | factory_audit 粗砥版 = scripts/ 内 care 系 22 件存在(factory 領域に care 系装置混在) |
| チケット精度向上整合 | 🟢 領域境界明確化 = チケット配置先精度(factory チケット vs care チケット混在防止) |
| 監督官 A 提案 | (a) 全 22 件 care/ ディレクトリ移動 / (b) factory 内 care 系 sub ディレクトリ作成 / (c) 三社合議で個別判定 |
| 期待される異社視点 | ChatGPT: 領域境界の認知科学観点 / Gemini: モノレポでの領域分離パターン |
| 想定時間 | 20 分 |

### 議題 B-006: factory orchestrator.ts 修復方針(jsonrepair 破損)

| 観点 | 内容 |
|---|---|
| 起源 | factory_audit 粗砥版 = factory orchestrator.ts 起動不可(jsonrepair 破損) |
| チケット精度向上整合 | 🟢 装置修復チケット起案精度向上(修復経路の標準化) |
| 監督官 A 提案 | (a) jsonrepair 単独修復 DO 起案 / (b) orchestrator.ts 全面リライト DO 起案 / (c) 三社合議で修復 vs リライト基準確定 |
| 期待される異社視点 | ChatGPT: 修復 vs リライトの判断基準 / Gemini: jsonrepair 同型業界事例 |
| 想定時間 | 15 分 |

### 議題 B-007: docs/decisions/ 配置先標準化

| 観点 | 内容 |
|---|---|
| 起源 | factory_audit 粗砥版 = 20260504_factory_audit.md 配置先妥当性疑義(docs/decisions/ 配置の標準化未確定) |
| チケット精度向上整合 | 🟢 ADR + audit + report の配置先標準化 = チケット起案先標準化 |
| 監督官 A 提案 | (a) docs/decisions/ = ADR 専用、audit/ + reports/ 別ディレクトリ / (b) docs/decisions/ = 全件統合 / (c) 三社合議で標準化 |
| 期待される異社視点 | ChatGPT: 文書分類の認知科学観点 / Gemini: モノレポ docs/ 構造業界事例 |
| 想定時間 | 10 分 |

---

## §3. 議題優先順位(時間管理)

| # | 議題 | 想定時間 |
|---|---|---|
| B-003 | L8 候補 150 件群の処遇判定(最重要構造議題)| 30 分 |
| B-004 | 系列単位 single source 違反 4 件統合判断 | 25 分 |
| B-005 | scripts/ 内 care 系 22 件 領域整合性 | 20 分 |
| B-006 | factory orchestrator.ts 修復方針 | 15 分 |
| B-007 | docs/decisions/ 配置先標準化 | 10 分 |
| **合計** | | **100 分(1 時間 40 分)** |

= EVT-077 教訓範囲内(165 分 < adherence 低下閾値、各議題 10-30 分均等配分)

---

## §4. 期待される決議成果

| # | 想定決議 |
|---|---|
| B-003 | L8 violator 処遇基準確定(三社合議)|
| B-004 | single source 違反 4 系列統合 vs 並立基準確定 |
| B-005 | scripts/ care 系領域分離方針確定 |
| B-006 | orchestrator.ts 修復 vs リライト基準確定 |
| B-007 | docs/decisions/ + audit/ + reports/ 配置先標準化基準確定 |

= 全件 = **チケット起案精度向上の上流規律確立**

---

## §5. スコープ外(明示的除外、EVT-077/083 同型再発防止)

| 除外項目 | 別経路 |
|---|---|
| 規範層議題(CLAUDE.md / role_and_conduct.md / ADR / 関係性ポリシー)| 同社円卓(本セッション内 2A + 2B 完遂) |
| Phase 移行判定(B-α / C / T1 / T2)| 同社円卓(議題 #9 完遂)|
| Layer 0/1/2 三層防護 | 同社円卓 議題 #15 採択経路 |
| 検診プロトコル v0.4 §7-F + §7-G | 同社円卓 議題 #8 採択経路 |
| 報奨金制度メタファー応用 | 同社円卓 議題 #5 採択経路(ただし B-003〜007 採択結果が機能カタログ v1.0 物理装置化に影響可能性、別途認識共有)|
| 監督官 A 単独構造改善プラン提示 | 監督官 A 自律改訂(円卓不要化禁則、EVT-083 再発防止)|

---

## §6. 開催経路

| Step | 主体 | アクション |
|---|---|---|
| 1 | 監督官 A | 本アジェンダ起案 + 第 81 次発令起案(司令官 α 経由 工場長 Castor へ開催依頼) |
| 2 | 司令官 α | 工場長 Castor へ転送 + 監督官 A 認識共有 |
| 3 | 工場長 Castor | invoke-board-council.ps1 起動 + ChatGPT + Gemini 召集 + 議事録起案 |
| 4 | 工場長 Castor → 司令官 α → 監督官 A → ヤス | 結果通知 + 議事録 + 採否依頼 |

---

## §7. 改訂履歴

- v1.0(2026-05-02 / Day 130 AM、Phase A 末 / B 起動候補、本セッション同社円卓 第 2 回 2A + 2B 採択完遂後): 監督官 A(Argus、Chairman)起案、ヤス採択「GOだ」契機、PR #1020 factory_audit 粗砥版 論点 5 件素材化、5 議題 / 100 分(B-003 L8 候補 30 + B-004 single source 違反 25 + B-005 care 系領域 20 + B-006 orchestrator 15 + B-007 配置先 10)+ EVT-077/083 同型再発防止(第 3 回違反禁則)+ 装置本来目的正面確認 + 物理基盤確証(invoke-board-council 健診 PR #1018)+ スコープ外明示(規範層 + Phase 移行 + Layer 0/1/2 + 検診 + 報奨金制度)+ 開催経路(監督官 A 起案 → 司令官 α → 工場長 Castor → invoke-board-council.ps1 起動 → 召集 → 議事 → 結果通知)。
