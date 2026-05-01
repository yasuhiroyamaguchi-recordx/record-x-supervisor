# 三社円卓 第 1 回(supervisor 議題)アジェンダ草案 v1.0

**配置先**: `staging/council_5_agendas/council_5_supervisor_agenda_v1.0.md`
**起案日**: 2026-05-01(Day 129、Phase A 末)
**起案者**: 監督官 A(Argus、Chairman 役)
**開催予定**: 2026-05-04(Day 132、Phase B-α 起動と同日)
**開催形式**: 三社円卓(Claude + ChatGPT + Gemini + ヤス)、Chairman = 監督官 A
**所要時間想定**: 1.5-2 時間
**素材**: `02_physical/garage_audit_20260504/supervisor_audit_v0.5.md` + `02_physical/research/20260501_claude_md_effectiveness.md` + 第 4 回円卓議事録 v1.1(暫定降格)

---

## §0. 開催前提

### 0-A. 開催可能条件

| 条件 | 状態 |
|---|---|
| supervisor 棚卸し v0.5 完遂 | ✅ 2026-05-01 完遂 |
| commander 棚卸し受領 | 🟡 司令官 α 自律進行待機 |
| factory 棚卸し受領 | 🟡 工場長 Castor 自律進行待機 |
| 監督官 A 二次解釈統合(`three_realm_audit_final.md`)| 🟡 #1 棚卸し受領後着手 |
| invoke-board-council.ps1 稼働確認 | 🟡 工場長 Castor 領域、第 5 回前必須 |
| ChatGPT API キー稼働 | 🟡 工場長 Castor 確認待機 |
| Gemini API キー稼働 | 🟡 工場長 Castor 確認待機 |

### 0-B. 第 4 回円卓暫定降格状態

第 4 回 = 同社円卓 第 1 回(Anthropic 系のみ、議題前提リサーチ + 棚卸し未完遂)= 暫定降格中。本第 5 回(三社円卓 第 1 回)で議題ごとに保持/再評価判定。

---

## §1. 議題リスト(supervisor スコープ絞り込み、5 件 + 振り返り 2 件 = 計 7 件)

### 議題 #1: 第 4 回円卓決議 議題 #4(各官 CLAUDE.md §4 改訂)再評価

| 観点 | 内容 |
|---|---|
| 第 4 回決議 | ✅ APPROVE(各官 CLAUDE.md §4 に「3 段階深掘り + 簡素化対比義務化」追加)|
| 再評価事由 | 調査結果(`research/20260501_claude_md_effectiveness.md`)で CLAUDE.md 実効性疑義(GitHub Issue #7571 既知バグ + 200 行超 adherence 低下 + system-reminder 免責文)|
| 監督官 A 提案 | (a) CLAUDE.md §4 改訂維持 + hooks 物理強制併用 / (b) hooks 物理強制のみ採択(CLAUDE.md 改訂は実効性疑義で撤回)/ (c) Yasu 採否 |
| 期待される異社視点 | ChatGPT: 認知科学観点での advisory vs enforcement 分離評価 / Gemini: GitHub Issue 業界事例の経験値補完 |

### 議題 #2: starter_checklist v0.2 統合化(circular #7 既採択の物理装置化)

| 観点 | 内容 |
|---|---|
| 現状 | `operations/starter_checklist_v0.2.md`(225 行)= ❌ ガレージ完全停車 + L8 同型(EVT-070 候補)+ self-test 1 件 + EVT-068 retrospective 1 件 |
| 統合候補 | `operations/role_and_conduct.md` §1.5-B 内テーブル化 = 装置数 -1 |
| 監督官 A 提案 | (a) §1.5-B 内 9 項目テーブル化 + 元ファイル archive 移動 / (b) 元ファイル削除 / (c) 維持(裏腹に L8 違反継続)|
| 期待される異社視点 | ChatGPT: 単一情報源原則(single source of truth)整合 / Gemini: progressive disclosure 階層化観点 |

### 議題 #3: 02_physical/cockpit/ 装置の archive 移動(円卓 #10 既採択の物理装置化)

| 観点 | 内容 |
|---|---|
| 現状 | ADR-010 superseded 確定(2026-04-30 + 第 4 回 #10 不採択確定)、cockpit/ 残置 = L8 違反候補 |
| 監督官 A 提案 | (a) `archive/superseded_devices_20260501/cockpit/` 移動(史実保持)/ (b) 削除 / (c) 残置(L8 違反継続)|
| 期待される異社視点 | ChatGPT: 削除 vs 移動の組織記憶管理 / Gemini: superseded 装置運用パターン業界事例 |

### 議題 #4: role_and_conduct.md 短縮設計(調査結果反映、CLAUDE.md と並行)

| 観点 | 内容 |
|---|---|
| 現状 | ~700 行(本日 §1.5-B +10 行で +約 1%)、200 行制限超 = adherence 低下リスク |
| 短縮案 | (a) 60-100 行核化 + `.claude/rules/` path-scoped 階層化 / (b) セクション別ファイル分割(progressive disclosure)/ (c) hooks 物理強制で重要規律を補完 + 短縮はしない / (d) 現状維持 |
| 監督官 A 提案 | (a) + (c) 併用 = 核化 + hooks 補完(調査 §6-A + §6-B + §6-F 推奨パターン整合)|
| 期待される異社視点 | ChatGPT: 認知負荷分散観点 / Gemini: HumanLayer Blog 推奨 60 行運用の実証評価 |

### 議題 #5: invoke-board-council.ps1 稼働確認結果採択

| 観点 | 内容 |
|---|---|
| 開催前提 | 工場長 Castor 経由稼働確認 = ChatGPT/Gemini API キー稼働 = 第 5 回開催可能性の物理基盤 |
| 監督官 A 提案 | (a) 稼働確証 → 三社円卓本格運用開始 / (b) API 不調 → 暫定 Anthropic 円卓継続 + API 復旧 DO 起案 / (c) ヤス採否 |
| 期待される異社視点 | 各社 API 自身の運用実績フィードバック |

### 振り返り議題 #6: EVT-068/070-072 候補 構造的整理(本セッション 3 件自己違反)

| 観点 | 内容 |
|---|---|
| 候補整理 | EVT-068(starter_checklist 起案直後の項目 6 違反)+ EVT-070 候補(L8 同型 = post-commit hook ×3)+ EVT-071 候補(指示優先順位認識訂正)+ EVT-072 候補(第 4 回円卓召集前検証義務違反)|
| 監督官 A 提案 | 系列 M「AI over-engineering 偏向」正式認定 + 累積 EVT 系列分類更新 |
| 期待される異社視点 | ChatGPT: 自己訂正サイクル健全性評価 / Gemini: 業界事例(他社 LLM 同型現象)補強 |

### 振り返り議題 #7: Phase B-α 起動可否判定(2026-05-04 = Day 132 同日)

| 観点 | 内容 |
|---|---|
| 起動条件 | R0 完遂 ✅ / 段階 2 進捗 = 名目 60% / 実質 約 40-50%(EVT-065 訂正)/ M2.6-A 設置完遂 ✅(本日 09:00 修正)/ M2.6-B 自動稼働確証 = 2026-05-02 09:00 以降検証 |
| 監督官 A 提案 | (a) 第 5 回円卓終了後 Phase B-α 起動 / (b) M2.6-B 確証(2026-05-02 09:00)後起動 / (c) 棚卸し三者統合完遂(2026-05-04 段階 2)後起動 |
| 期待される異社視点 | Phase 移行判断の構造妥当性検証 |

---

## §2. 議題優先順位(時間管理)

| # | 議題 | 想定時間 |
|---|---|---|
| 5 | invoke-board-council.ps1 稼働確認結果(議題前提)| 5 分 |
| 1 | 議題 #4 再評価(CLAUDE.md 実効性)| 30 分 |
| 4 | role_and_conduct.md 短縮設計 | 25 分 |
| 2 | starter_checklist v0.2 統合化 | 15 分 |
| 3 | cockpit/ archive 移動 | 10 分 |
| 6 | EVT-068/070-072 構造的整理 | 10 分 |
| 7 | Phase B-α 起動可否判定 | 15 分 |
| 合計 | | 110 分(1 時間 50 分) |

---

## §3. 期待される決議成果

| # | 想定決議 |
|---|---|
| 1 | CLAUDE.md 実効性対策方針(hooks 物理強制 + 短縮)|
| 2 | starter_checklist v0.2 統合化 物理実行採否 |
| 3 | cockpit/ archive 移動 物理実行採否 |
| 4 | role_and_conduct.md 短縮設計 採択 |
| 5 | 三社円卓本格運用 採択 |
| 6 | 系列 M「AI over-engineering 偏向」正式認定 |
| 7 | Phase B-α 起動条件 + タイミング確定 |

---

## §4. スコープ外(明示的除外)

| 除外項目 | 別経路 |
|---|---|
| commander 領域(commander_judgment_starter_checklist 整合 + DO-COMMANDER-029 等) | 第 6 回(commander 議題、Chairman = 司令官 α)|
| factory 領域(invoke-board-council 内部実装 + dream-crystallize 等) | 第 7 回(factory 議題、Chairman = 工場長 Castor)|
| 三者跨ぎ統合(M2.3 post-commit hook L8 整合形式 + capability_catalog 三者統合 + ADR-009 §6 v1.5 改訂)| 第 8 回(統合議題、Chairman = 監督官 A)|

---

## §5. 改訂履歴

- v1.0(2026-05-01 / Day 129、Phase A 末): 初版起案、ヤス指示「タスクスケジューラ依存せず次に進む」採択、第 5 回円卓 supervisor 議題 7 件確定、commander/factory/統合は別円卓スコープ。
