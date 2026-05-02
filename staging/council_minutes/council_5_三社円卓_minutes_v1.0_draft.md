---
council_name: 三社円卓 第 5 回(チケット精度向上専用)
day: 130
phase: A 末(B 起動候補)
date: 2026-05-02(Day 130 AM、ヤス「GOだ」即時採択)
chairman: 工場長 Castor(Anthropic Claude)
participants:
  - 工場長 Castor(Chairman、Anthropic Claude)
  - Gemini(発散役 / Devil's Advocate、Google)
  - ChatGPT(収束役、OpenAI)
  - ヤス(最終採否権者)
council_id: council_20260502_ticket_quality_b003_b007_001
trigger: T4(Yasu 直接召集、2026-05-02 AM「GOだ」)
agenda_source: staging/council_5_agendas/council_5_three_realm_agenda_v1.0.md v1.0
evtsource: EVT-077(三社円卓装置目的逸脱 第 1 回違反) + EVT-083(第 2 回違反)
invoke_script: sync/sync_script/invoke-board-council.ps1 v0.1(T4、稼働確認済 PR #1018)
total_agendas: 5 件(B-003〜B-007)
total_time_planned: 100 分
status: draft(Chairman 起案完遂、Gemini + ChatGPT 集約待ち v0.1 手動モード)
related_orders: []
related_prs: ["#1018 invoke-board-council 健診", "#1020 factory_audit 粗砥版"]
evts_discussed: ["EVT-077", "EVT-083"]
---

# 三社円卓 第 5 回 議事録 v1.0 草案(チケット精度向上専用、Day 130 AM)

**Chairman**: 工場長 Castor(Anthropic Claude)  
**発散役**: Gemini(Google、v0.1 手動モード = Yasu 経由召集待ち)  
**収束役**: ChatGPT(OpenAI、v0.1 手動モード = Yasu 経由召集待ち)  
**最終採否**: ヤス  
**開催形式**: invoke-board-council v0.1 スケルトン起動 + Chairman 草案起案(Gemini + ChatGPT は v0.2 API 直接接続まで Yasu 手動貼付)

---

## §0. 開催前提確認

| 条件 | 状態 |
|---|---|
| invoke-board-council.ps1 v0.1 起動 | ✅ council_20260502_ticket_quality_b003_b007_001 生成済(T4) |
| ChatGPT 召集(Yasu 経由、v0.1) | 🟡 本議事録内プロンプト提示済、Yasu 貼付待ち |
| Gemini 召集(Yasu 経由、v0.1) | 🟡 同上 |
| factory_audit 粗砥版 素材 | ✅ PR #1020(217afd41、論点 5 件抽出済) |
| EVT-077/083 同型再発防止 | ✅ §0-A 装置目的正面確認実施 |
| 規範層議題スコープ外確認 | ✅ §0-A 明示的除外確認 |

### §0-A. 装置目的正面確認(EVT-077/083 第 3 回違反禁則)

本第 5 回三社円卓 = **factory チケット精度向上専用議題(B-003〜B-007)**。

以下は**本円卓スコープ外**:
- CLAUDE.md 改訂 / ADR / Phase 移行 / Layer 0/1/2 / 検診 / 報奨金制度
- 上記が混入した場合は即時 retract

= **開催可能、スコープ確認完了**

---

## §1. 議事進行(優先度順)

| 順 | 議題 | 想定時間 | 重要度 |
|---|---|---|---|
| 1 | B-003 L8 候補 150 件群の処遇判定 | 30 分 | 🔴 最重要構造議題 |
| 2 | B-004 系列単位 single source 違反 4 件統合判断 | 25 分 | 🔴 高(チケット起案前提) |
| 3 | B-005 scripts/ 内 care 系 22 件 領域整合性 | 20 分 | 🟡 中(領域境界明確化) |
| 4 | B-006 factory orchestrator.ts 修復方針 | 15 分 | 🔴 高(基盤装置) |
| 5 | B-007 docs/decisions/ 配置先標準化 | 10 分 | 🟡 中(チケット起案先標準化) |
| **合計** | | **100 分** | |

---

## §2. 議題 B-003 — L8 候補 150 件群の処遇判定(30 分)

### 2-A. 素材(factory_audit 粗砥版 §0-A より)

| 対象 | 件数 | 制約 | 状態 |
|---|---|---|---|
| tools/commands/ LOC ≥ 100 | 約 50 件 | line_count_100 | 🟡 境界張付(100行ちょうど多数) |
| tools/lib/ LOC ≥ 200 | **7 件** | line_count_200 | 🔴 **制約違反確定** |
| tools/lib/ LOC 180-199 | 約 30 件 | line_count_200 | 🟡 制約境界張付 |
| scripts/ nightly_batch_v2.sh | 626 行 | 規約なし | 🔴 **実質 L8「複雑装置」** |
| **合計 L8 候補母集団** | **150 件(line_count_100 ≥ 100)** | | |

代表事例: `tools/lib/semantic_memory.ts` 213 行、`scripts/nightly_batch_v2.sh` 626 行

### 2-B. Chairman(Castor)分析

**診断**: 150 件の「line_count_100 ≥ 100」には 3 種混在:

| 種別 | 件数 | 説明 |
|---|---|---|
| A: 制約違反(厳格) | 7 件(tools/lib/ ≥ 200 行) | line_count_200 確実超過、即修正対象 |
| B: 境界張付(注意) | 約 50 件(100 行ちょうど = tools/commands/) | 100 行制約に圧縮された状態、「症状治療装置」化リスク |
| C: scripts/ 長大 | nightly_batch_v2.sh 626 行 等 | LOC 規約なしだが実質 L8 複雑装置 |

**Chairman 見解**:
- 種別 A(7 件): **即時 DO 起案必須**。line_count_200 制約超過は SS_GUARD 違反確定。
- 種別 B(約 50 件): **チケット起案時 case-by-case 判定**を採用。強制分割でさらなる断片化リスク大。分割の判断基準 = 「単一責任原則(SRP)に基づき分割が可能か? 分割後に cohesion が上がるか?」
- 種別 C(scripts/): **規約策定が先決**。scripts/ は現在 LOC 規約なし。nightly_batch_v2.sh 626 行は機能単位での分割検討 DO 起案推奨。

### 2-C. Gemini(Devil's Advocate)への召集プロンプト

```
あなたは Record X 監督官 3AI 役員会の発散役 / Devil's Advocate(Google Gemini)です。
以下の議題に対して構造的反論 + 業界事例 + 「絶対禁忌」抵触チェックを行ってください。

【議題 B-003】: L8 候補 150 件群の処遇判定
【素材】:
- tools/lib/ に LOC ≥ 200 の制約違反ファイルが 7 件(最大 semantic_memory.ts 213 行)
- tools/commands/ に LOC = 100 の境界張付ファイルが約 50 件
- scripts/nightly_batch_v2.sh 626 行(LOC 規約なし)

【Chairman 暫定決議】:
- 7 件: 即時 DO 起案
- 50 件: チケット起案時 case-by-case
- scripts/: 規約策定 DO 起案

【期待出力】:
1. モノレポ 1263 装置規模での L8 規律パターン業界事例(Python/Go/TypeScript 系大規模プロジェクト)
2. 100 行 / 200 行閾値の妥当性検証(認知科学・コードレビュー観点)
3. Chairman 暫定決議への構造的反論 or 補強
4. 「絶対禁忌」抵触チェック(over-engineering 判定)
```

> **Gemini 出力(v0.1 手動モード、Yasu 貼付待ち)**:
>
> (ここに Gemini の回答を貼付)

### 2-D. ChatGPT(収束役)への召集プロンプト

```
あなたは Record X 監督官 3AI 役員会の収束役(OpenAI ChatGPT)です。
Chairman + Gemini の意見を統合して、最適な意思決定を導いてください。

【議題 B-003】: L8 候補 150 件群の処遇判定

【Chairman 暫定決議】:
- LOC ≥ 200 の 7 件: 即時 DO 起案
- LOC = 100 境界張付 50 件: チケット起案時 case-by-case
- scripts/ 長大ファイル: 規約策定 DO 起案

【Gemini 発散結果】:
(§2-C の Gemini 出力から転記)

【期待出力】:
1. L8 違反 200 行閾値の認知科学的根拠(Miller's Law / 認知負荷理論観点)
2. Chairman 決議 + Gemini 反論の統合案
3. 「チケット起案時 case-by-case」の判断基準具体化(どんな条件で split するか)
4. 推奨案 + 構造的根拠
```

> **ChatGPT 出力(v0.1 手動モード、Yasu 貼付待ち)**:
>
> (ここに ChatGPT の回答を貼付)

### 2-E. Chairman 暫定決議(B-003)

三者集約完遂後に確定。**Gemini + ChatGPT 集約前の Chairman 暫定**:

| # | 決議内容 | 根拠 | 優先度 |
|---|---|---|---|
| B-003-1 | tools/lib/ LOC ≥ 200 の 7 件に対し、個別分割リファクタリング DO を起案 | line_count_200 制約違反確定、SS_GUARD 違反 | **P0** |
| B-003-2 | tools/commands/ LOC = 100 境界張付 50 件は「チケット起案時 SRP 判断」を基準採用 | 強制一括分割は断片化リスク > 分割効果、case-by-case が安全 | **P1** |
| B-003-3 | scripts/ 対象に LOC 規律(暫定: 300 行 = L8 判定閾値)を策定する DO を起案 | 現在規約なしは構造的空白、nightly_batch_v2.sh 626 行が例証 | **P1** |
| B-003-4 | SRP 分割判断基準: 「① 単一の意図で記述可能か ② 分割後に各部品が独立してテスト可能か ③ 分割後に cohesion が上がるか」3 条件すべて YES の場合のみ分割 | 認知科学的整合(単一目的の方が記憶・検索・変更が容易) | **P1** |

---

## §3. 議題 B-004 — 系列単位 single source 違反 4 件統合判断(25 分)

### 3-A. 素材(factory_audit 粗砥版 §1-A/B より)

| 系列 | ファイル数 | 場所 | 状態 |
|---|---|---|---|
| board_meeting_* | 20+ 件 | tools/commands/ + tools/lib/ | 🔴 **単一 CLI から分割実装、single source 違反疑い強** |
| health_checkup_* | 6 件 | tools/commands/ + tools/lib/ | 🟡 stage 別分割(v0.1〜v0.4? etc.) |
| nightly_batch.* | 3 並立 | scripts/ | 🟡 `.sh` / `.ps1` / `_v2.sh` 並立、OS 違い? |
| factory_ammo_* | 5+ 件 | .github/workflows/ | 🟡 CI ammo 系列、機能境界不明 |

### 3-B. Chairman(Castor)分析

**系列別診断**:

**board_meeting (20+件)**: tools/commands/ の複数 CLI + tools/lib/ の複数ライブラリ = 三社円卓装置が断片化。起源は DO-FACTORY-122 以降の段階的追加。単一の「board-meeting」コマンドが本来の姿。→ **統合推奨**

**health_checkup (6件)**: 検診プロトコル v0.1〜v0.4 の段階対応で分割実装された可能性。機能が段階的に追加された場合、「バージョン別ファイル」は single source 違反と「段階実装の正常進化」の境界が曖昧。→ **個別調査後統合**

**nightly_batch (3並立)**: `.sh`(UNIX)、`.ps1`(Windows)、`_v2.sh`(バージョン)の 3 並立。OS 別並立は意図的設計の可能性あり(ただし `_v2.sh` は `_v1` の置換なら single source 違反)。→ **調査先行が安全**

**factory_ammo (5+件)**: CI ワークフローの ammo 系列。「段階的 CI 展開」または「単純な積み上げ」か不明。→ **調査先行**

### 3-C. Gemini(Devil's Advocate)への召集プロンプト

```
あなたは Record X 監督官 3AI 役員会の発散役(Google Gemini)です。

【議題 B-004】: 系列単位 single source 違反 4 件統合判断
【素材】:
- board_meeting_* 20+ 件: tools/ 複数 CLI + lib
- health_checkup_* 6 件: stage 別分割
- nightly_batch.* 3 並立: .sh / .ps1 / v2.sh
- factory_ammo_* 5+ 件: CI ワークフロー

【Chairman 暫定決議】:
- board_meeting: 統合推奨
- health_checkup: 個別調査後統合
- nightly_batch / ammo: 調査先行

【期待出力】:
1. large-scale monorepo での single source of truth 違反のパターン分類業界事例
2. OS 別並立(.sh vs .ps1)の「意図的設計 vs 技術的負債」判断基準
3. Chairman 決議への Devil's Advocate 反論
4. 統合 vs 並立の trade-off: cohesion・testability・deployability 観点
```

> **Gemini 出力(v0.1 手動モード、Yasu 貼付待ち)**:
>
> (ここに Gemini の回答を貼付)

### 3-D. ChatGPT(収束役)への召集プロンプト

```
あなたは Record X 監督官 3AI 役員会の収束役(ChatGPT)です。

【議題 B-004】: single source 違反 4 系列統合判断

【Chairman 暫定決議】:
- board_meeting(20+): 統合推奨
- health_checkup(6): 調査後統合
- nightly_batch(3): 調査先行
- ammo(5+): 調査先行

【Gemini 発散結果】:
(§3-C Gemini 出力から転記)

【期待出力】:
1. Single Source of Truth 原則の認知科学観点(なぜ違反がバグ・混乱を招くか)
2. 4 系列別の統合 vs 並立判断基準の具体化
3. DO 起案粒度の提案(何を 1 DO にするか)
4. 推奨 + 根拠
```

> **ChatGPT 出力(v0.1 手動モード、Yasu 貼付待ち)**:
>
> (ここに ChatGPT の回答を貼付)

### 3-E. Chairman 暫定決議(B-004)

| # | 決議内容 | 根拠 | 優先度 |
|---|---|---|---|
| B-004-1 | board_meeting_* 20+ 件: 統合 DO 起案(単一 board-meeting CLI + 対応 lib に集約) | 三社円卓装置の物理的断片化は single source 違反確定 | **P0** |
| B-004-2 | health_checkup_* 6 件: 構成調査 DO → 統合方針確定後に統合 DO 起案 | stage 別実装の可能性があるため調査先行が安全 | **P1** |
| B-004-3 | nightly_batch.* 3 並立: OS 別並立の意図確認 DO → `_v2.sh` が `_v1.sh` の置換なら即廃止、OS 別は維持 | `.sh`/`.ps1` は OS 別設計で正当、`_v2.sh` は旧版と並立なら技術的負債 | **P1** |
| B-004-4 | factory_ammo_* 5+ 件: CI 設計調査 DO → 段階展開計画書確認後に統合判断 | CI ammo は慎重に(破損リスク高) | **P2** |

---

## §4. 議題 B-005 — scripts/ 内 care 系 22 件 領域整合性(20 分)

### 4-A. 素材(factory_audit 粗砥版 §1-D より)

| 対象 | 件数 | LOC(代表) | 状態 |
|---|---|---|---|
| scripts/ 内 care_* | 22 件 | care_auth_contract_test.ts 559 行 / care_api_test_suite.ts 539 行 等 | 🟡 factory 配下に care-rx 領域装置混在 |

接続状態: 一部 ✅ active(care 認証テスト)、一部 📚 reference(過去移行装置)

### 4-B. Chairman(Castor)分析

**問題の本質**: factory(`record-x/factory/`)は「AI 開発ファクトリー装置群」の管理リポジトリ。care-rx はドメイン別サービス(`care/` または `functions/src/modules/2000_welfare/`)。scripts/ 内 care 系は「factory が care を操作するユーティリティ」か「care ドメインの装置が誤配置された」かで扱いが異なる。

**22 件の分類(推察)**:

| 分類 | 件数推定 | 説明 | 処置 |
|---|---|---|---|
| factory → care 統合テスト | 約 3-5 件(care_auth_contract_test, care_api_test_suite) | factory から care API を呼ぶ E2E テスト | scripts/ に残留 OK(factory の一機能) |
| care DB 移行スクリプト | 約 5-10 件 | 過去移行装置(dormant 多数) | scripts/care/ サブディレクトリへ移動 |
| care 系 CLI ユーティリティ | 約 5-10 件 | care-rx 運用支援スクリプト | 評価後に care モジュールへ移管候補 |

### 4-C. Gemini(Devil's Advocate)への召集プロンプト

```
あなたは Record X 監督官 3AI 役員会の発散役(Gemini)です。

【議題 B-005】: scripts/ 内 care 系 22 件の領域整合性
【素材】:
- factory(record-x/factory/)は AI 開発ファクトリー管理リポジトリ
- scripts/ 内に care_* 22 件が存在(最大 559 行、最大 539 行)
- care-rx は別ドメイン(functions/src/modules/2000_welfare/)

【Chairman 提案】: scripts/care/ サブディレクトリに移動 or 分類後に care モジュールへ移管

【期待出力】:
1. モノレポでの領域分離パターン業界事例(NX/Turborepo/Bazel 等)
2. 「factory → care 統合テスト」と「誤配置の care 装置」の判断基準
3. サブディレクトリ方式 vs 完全移管方式の trade-off
4. 22 件一括移動のリスク vs 段階的分類のリスク
```

> **Gemini 出力(v0.1 手動モード、Yasu 貼付待ち)**:
>
> (ここに Gemini の回答を貼付)

### 4-D. ChatGPT(収束役)への召集プロンプト

```
あなたは Record X 監督官 3AI 役員会の収束役(ChatGPT)です。

【議題 B-005】: scripts/ care 系 22 件の領域整合性

【Chairman 提案】: 分類(統合テスト残留 / 移行装置 → scripts/care/ / ユーティリティ → 移管候補)

【Gemini 発散結果】:
(§4-C Gemini 出力から転記)

【期待出力】:
1. ドメイン境界の認知科学観点(なぜ混在が認知コストを上げるか)
2. care_auth_contract_test.ts 559 行 + care_api_test_suite.ts 539 行 の最終的な配置先推奨
3. 段階的移管の DO 起案粒度提案
4. 推奨 + 根拠
```

> **ChatGPT 出力(v0.1 手動モード、Yasu 貼付待ち)**:
>
> (ここに ChatGPT の回答を貼付)

### 4-E. Chairman 暫定決議(B-005)

| # | 決議内容 | 根拠 | 優先度 |
|---|---|---|---|
| B-005-1 | 22 件を 3 分類する調査 DO 起案: (A) factory→care 統合テスト / (B) 移行スクリプト(dormant) / (C) care 運用ユーティリティ | 一括移動より分類先行が安全(CI パス破壊リスク回避) | **P1** |
| B-005-2 | (A) 統合テスト: scripts/ 残留 OK(factory の正当な機能)、ただし scripts/care/ サブディレクトリへ整理 | factory → care E2E テストは factory の一機能 | **P1** |
| B-005-3 | (B) dormant 移行スクリプト: scripts/care/archive/ へ移動 or 廃止判定 DO | 過去移行完了済みなら廃止が最適(L8 排除) | **P1** |
| B-005-4 | (C) care 運用ユーティリティ: care モジュール側への移管を検討(別 DO) | ドメイン境界明確化の長期目標 | **P2** |

---

## §5. 議題 B-006 — factory orchestrator.ts 修復方針(15 分)

### 5-A. 素材(factory_audit 粗砥版 §2-1 より)

| 項目 | 内容 |
|---|---|
| 対象ファイル | `record-x/factory/tools/orchestrator.ts` |
| 状態 | 🔴 起動不可 |
| 原因 | jsonrepair package.json 不在(Windows file lock 回避失敗、本セッション npm install 失敗確認済) |
| 影響 | factory 全 CLI が orchestrator 経由で dispatch 不可、自律稼働装置基盤の物理層破損 |
| LOC 推察 | 概算 200+(import 構造から推察、本セッション直接 view せず) |

### 5-B. Chairman(Castor)分析

**優先度**: orchestrator.ts は factory の唯一の CLI dispatch 経路。破損継続 = factory 全 CLI 機能停止。**P0 緊急修復**。

**修復経路分析**:

| 経路 | 内容 | リスク | 所要時間推定 |
|---|---|---|---|
| (a) jsonrepair 再インストール | `npm uninstall jsonrepair && npm install jsonrepair` 再実行 | Windows file lock 再発の可能性 | 15 分 |
| (a+) git worktree + 再インストール | 別 worktree で npm install 試行 | worktree 切り替えコスト | 30 分 |
| (b) jsonrepair import を削除 + 代替実装 | orchestrator.ts 内の jsonrepair 依存箇所を直接 JSON.parse + try-catch で置換 | orchestrator の jsonrepair 利用箇所の特定が必要 | 45-60 分 |
| (c) orchestrator.ts 全面リライト | 機能を再整理しながら書き直し | 既存 CLI 登録パターンの互換性リスク大 | 2-4 時間 |

**Chairman 推奨**: (a) 試行 → 失敗なら (b) の順。(c) は regression リスクが高すぎる(526 CLI の dispatch パターン破壊リスク)。

### 5-C. Gemini(Devil's Advocate)への召集プロンプト

```
あなたは Record X 監督官 3AI 役員会の発散役(Gemini)です。

【議題 B-006】: factory orchestrator.ts 修復方針(jsonrepair 破損)
【素材】:
- orchestrator.ts = factory 唯一の CLI dispatch エントリーポイント
- jsonrepair package.json 不在で起動不可
- 現象: Windows npm install file lock 失敗
- orchestrator が 526 CLI を registerCommand() で dispatch

【Chairman 推奨】: (a) 再インストール試行 → 失敗なら (b) jsonrepair 依存を直接 JSON.parse で置換

【期待出力】:
1. jsonrepair パッケージ破損の一般的原因と解決パターン(npm ecosystem 観点)
2. Windows file lock 問題の業界標準対処法
3. 修復 vs リライトの判断基準(技術的負債の解消 vs 安定性維持)
4. 526 CLI dispatch 基盤の修復時リスク管理
```

> **Gemini 出力(v0.1 手動モード、Yasu 貼付待ち)**:
>
> (ここに Gemini の回答を貼付)

### 5-D. ChatGPT(収束役)への召集プロンプト

```
あなたは Record X 監督官 3AI 役員会の収束役(ChatGPT)です。

【議題 B-006】: orchestrator.ts 修復方針

【Chairman 推奨】: (a)再インストール → 失敗なら(b)jsonrepair 依存置換

【Gemini 発散結果】:
(§5-C Gemini 出力から転記)

【期待出力】:
1. 修復 vs リライトの判断基準の認知科学的整合(なぜ最小変更が安全か)
2. DoD 提案: 修復完了の定義(何を確認すれば「修復完了」か)
3. 修復後の予防策(file lock 再発防止、package.json integrity 確保)
4. 推奨 DO 起案スコープ
```

> **ChatGPT 出力(v0.1 手動モード、Yasu 貼付待ち)**:
>
> (ここに ChatGPT の回答を貼付)

### 5-E. Chairman 暫定決議(B-006)

| # | 決議内容 | 根拠 | 優先度 |
|---|---|---|---|
| B-006-1 | orchestrator.ts 修復 DO を **P0** で即時起案。修復経路 (a) → (a+) → (b) の順で試行。(c) 全面リライトは禁止。 | 526 CLI dispatch 基盤の破損は P0 緊急事態、最小変更原則 | **P0** |
| B-006-2 | DoD: `npx tsx tools/orchestrator.ts --help` が exit 0 で返ること + 代表 CLI 3 件(board-meeting / health-checkup / factory-cleanup)が正常応答すること | 物理層動作確証の最小必要条件 | **P0** |
| B-006-3 | 修復後に `package-lock.json` を commit してバージョン固定 | Windows file lock 再発防止(lock ファイルによる再現性確保) | **P1** |
| B-006-4 | orchestrator.ts の jsonrepair 利用箇所を調査し、将来的に `JSON.parse` + バリデーション層に置換する技術的負債 DO を起案(修復後の後続) | 外部パッケージへの脆弱な依存を内部実装で代替 | **P2** |

---

## §6. 議題 B-007 — docs/decisions/ 配置先標準化(10 分)

### 6-A. 素材(factory_audit 粗砥版 §1-E より)

| 項目 | 内容 |
|---|---|
| 現状 | `record-x/factory/docs/decisions/` に 1 件のみ(本セッション PR #1018 起案分) |
| 疑問点 | ADR と audit report と decisions が同じディレクトリか不明 |
| 参照パス | `record-x/docs/decisions/`(全体 ADR)と `record-x/factory/docs/decisions/`(factory local)の 2 系統 |
| 現在のファイル | `20260504_factory_audit.md`(audit 性質)が decisions/ に配置 |

### 6-B. Chairman(Castor)分析

**現状の混在問題**:
- `20260504_factory_audit.md` は「factory の全装置棚卸し audit 結果」= audit レポート
- `20260501_invoke_board_council_health_check.md` は「稼働確認 decisions」= decision 記録

これらを同一ディレクトリに置くと、ADR(アーキテクチャ決定記録)と audit レポートが混在し、検索・参照コストが上昇する。

**Chairman 推奨構造**:

```
record-x/factory/docs/
  decisions/          # ADR 専用: アーキテクチャ決定記録(例: ADR-001_*.md)
  audits/             # audit 専用: 棚卸し・検診結果(例: 20260504_factory_audit.md)
  reports/            # report 専用: 進捗・品質報告(例: 20260502_phase_a_progress.md)
```

既存の `20260504_factory_audit.md` は `docs/audits/` へ移動が適切。

### 6-C. Gemini(Devil's Advocate)への召集プロンプト

```
あなたは Record X 監督官 3AI 役員会の発散役(Gemini)です。

【議題 B-007】: docs/decisions/ 配置先標準化
【素材】:
- 現在 factory/docs/decisions/ に audit 性質のファイルが配置
- ADR / audit / report の配置先標準化未確定

【Chairman 推奨】:
- decisions/ = ADR 専用
- audits/ = audit 結果
- reports/ = 進捗報告

【期待出力】:
1. 大規模モノレポでの docs/ 構造業界事例(GitHub/GitLab の docs/ organization pattern)
2. ADR vs audit report vs decision log の分類基準
3. Chairman 推奨構造への反論 or 補強(ディレクトリ数増加 vs 明確性の trade-off)
4. 既存ファイルの移動タイミング推奨
```

> **Gemini 出力(v0.1 手動モード、Yasu 貼付待ち)**:
>
> (ここに Gemini の回答を貼付)

### 6-D. ChatGPT(収束役)への召集プロンプト

```
あなたは Record X 監督官 3AI 役員会の収束役(ChatGPT)です。

【議題 B-007】: docs/decisions/ 配置先標準化

【Chairman 推奨】:
- decisions/ = ADR 専用
- audits/ = audit 結果
- reports/ = 進捗報告

【Gemini 発散結果】:
(§6-C Gemini 出力から転記)

【期待出力】:
1. 文書分類の認知科学観点(情報アーキテクチャ: なぜ目的別ディレクトリが有効か)
2. ADR の番号付け標準(ADR-001.md 形式 vs 日付形式 vs タイトル形式)
3. 統合 vs 分離の trade-off: チームサイズ・AI エージェント利用観点
4. 推奨 + チケット起案粒度
```

> **ChatGPT 出力(v0.1 手動モード、Yasu 貼付待ち)**:
>
> (ここに ChatGPT の回答を貼付)

### 6-E. Chairman 暫定決議(B-007)

| # | 決議内容 | 根拠 | 優先度 |
|---|---|---|---|
| B-007-1 | `factory/docs/` の下位構造: `decisions/`(ADR 専用) + `audits/`(棚卸し・検診) + `reports/`(進捗報告)の 3 分類標準を採用 | 目的別分離 = 検索コスト低減、AI エージェントの参照精度向上 | **P1** |
| B-007-2 | `20260504_factory_audit.md` を `decisions/` → `audits/` へ移動する DO を起案 | audit レポートは decisions/ に置くべきでない(性質不一致) | **P1** |
| B-007-3 | ADR 命名規則: `ADR-NNN_<slug>.md` 形式採用(日付プレフィックスは廃止) | 番号順参照が意思決定チェーンの追跡に有効 | **P1** |
| B-007-4 | `record-x/docs/decisions/`(全体 ADR)と `record-x/factory/docs/decisions/`(factory local ADR)の役割分担を明記する DO を起案 | 2 系統 ADR パスの混乱防止 | **P2** |

---

## §7. 統合決議(Chairman 暫定、三者合議確定待ち)

### 7-A. B-番号付き決議サマリー

| B 番号 | 議題 | Chairman 暫定決議 | 優先度 | DO 起案数 |
|---|---|---|---|---|
| B-003-1 | L8 tools/lib/ ≥ 200 行 7 件: 即時 DO 起案 | 分割リファクタリング DO × 7(または 1 統合 DO) | P0 | 1-7 |
| B-003-2 | 100 行境界張付 50 件: case-by-case 基準採用 | SRP 判断基準文書化 DO × 1 | P1 | 1 |
| B-003-3 | scripts/ LOC 規律策定 | 暫定 300 行閾値策定 DO × 1 | P1 | 1 |
| B-004-1 | board_meeting 20+ 件: 統合 DO 起案 | 統合リファクタリング DO × 1 | P0 | 1 |
| B-004-2 | health_checkup 6 件: 調査後統合 | 調査 DO + 統合 DO × 2 | P1 | 2 |
| B-004-3 | nightly_batch 3 並立: OS 別確認後判断 | 調査 DO × 1 | P1 | 1 |
| B-004-4 | factory_ammo 5+: 調査先行 | 調査 DO × 1 | P2 | 1 |
| B-005-1〜4 | care 系 22 件: 分類 DO + 各種処置 DO | 分類 DO × 1 + 処置 DO × 3 | P1〜P2 | 4 |
| B-006-1〜4 | orchestrator.ts 修復 | P0 修復 DO × 1 + 後続 DO × 2 | P0〜P2 | 3 |
| B-007-1〜4 | docs/decisions/ 標準化 | 構造化 DO × 1 + 移動 DO × 1 + 分担明記 DO × 1 | P1〜P2 | 3 |

**合計 DO 起案候補: 約 19-25 件**(B-003-1 の粒度次第)

### 7-B. 即時起案推奨(P0 = ヤス承認待ちなしに起案可能)

| DO | 内容 |
|---|---|
| DO-FACTORY-B006 | orchestrator.ts 修復(jsonrepair 再インストール、(a)→(a+)→(b) 順) |
| DO-FACTORY-B003 | tools/lib/ LOC ≥ 200 の 7 件個別分割(または 7 件一括 DO) |
| DO-FACTORY-B004-1 | board_meeting_* 20+件の統合 CLI 設計 + 実装 |

### 7-C. Gemini + ChatGPT 集約後の最終確定事項

以下は Gemini/ChatGPT 集約後に Chairman が最終決裁:
- B-003 の SRP 判断基準の具体文言
- B-004 の nightly_batch OS 別並立の「意図的 vs 技術的負債」判定
- B-005 の 22 件分類基準
- B-007 の ADR 番号形式詳細

---

## §8. 議事録起案・通知経路

| Step | 主体 | アクション | 状態 |
|---|---|---|---|
| 1 | 工場長 Castor | invoke-board-council.ps1 v0.1 起動 | ✅ 完遂 |
| 2 | 工場長 Castor | Chairman 分析 + 暫定決議起案(本ファイル) | ✅ 完遂(本草案) |
| 3 | ヤス | §2-C/D, §3-C/D, §4-C/D, §5-C/D, §6-C/D の各プロンプトを Gemini + ChatGPT に投入 | 🟡 **Yasu アクション待ち** |
| 4 | ヤス | Gemini + ChatGPT 出力を各プロンプト直下の PLACEHOLDER に貼付 | 🟡 **Yasu アクション待ち** |
| 5 | 工場長 Castor | Gemini + ChatGPT 集約後 Chairman 最終決裁 → v1.0-final 起案 | 🔴 待機 |
| 6 | 工場長 Castor → 監督官 A → ヤス | 最終議事録 + DO 起案候補リスト 通知 | 🔴 待機 |

**即時着手可能(Gemini + ChatGPT 集約前でも)**:
- B-006 orchestrator.ts 修復 DO(P0、即時起案・実装推奨)

---

## §9. スコープ外確認(EVT-077/083 第 3 回違反禁則)

本議事録内に以下の規範層議題が混入していないことを確認:

| 除外項目 | 確認 |
|---|---|
| CLAUDE.md 改訂 | ✅ なし |
| ADR 起案(規範層) | ✅ なし(B-007 は配置先標準化のみ、規範層 ADR でない) |
| Phase A → B 移行判定 | ✅ なし |
| Layer 0/1/2 三層防護 | ✅ なし |
| 検診プロトコル改訂 | ✅ なし |
| 報奨金制度 | ✅ なし |

= **スコープ逸脱なし確認完了**

---

## §10. 改訂履歴

- **v1.0-draft**(2026-05-02 / Day 130 AM、Phase A 末 / B 起動候補): 工場長 Castor(Chairman)起案。ヤス「GOだ」T4 即時召集契機。invoke-board-council.ps1 v0.1 スケルトン起動(council_20260502_ticket_quality_b003_b007_001 生成)+ Chairman 全 5 議題(B-003〜007)分析完遂 + Gemini/ChatGPT 召集プロンプト提示。暫定決議 P0: B-006 orchestrator 修復 + B-003 7件分割 + B-004 board_meeting 統合。Gemini + ChatGPT 集約(v0.1 手動モード、Yasu 貼付待ち)後に v1.0-final 確定予定。EVT-077/083 第 3 回違反禁則 = スコープ逸脱ゼロ確認済。
