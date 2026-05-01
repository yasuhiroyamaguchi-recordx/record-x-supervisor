---
name: plan-first-enforcer
description: Use IMMEDIATELY when receiving any task involving Edit/Write/Bash modifications to existing files, before any tool invocation. Validates implementation mode and enforces plan presentation for non-QUICK_IMPLEMENT modes. Prevents AutoMode bias from skipping Plan-First Protocol.
---

# Plan-First Enforcer Skill

このスキルは Common Plan-First Protocol v1.0(`record-x-supervisor/operations/plan_first_protocol_common_v1.0.md`)の第 0 層(認知層)強制装置である。

## 適用判定(invoke 必須条件)

以下のいずれかに該当する場合、**実装着手前に必ず invoke**:

- DO-* チケット受領時(DO-COMMANDER-* / DO-FACTORY-* / DO-SUPERVISOR-* etc.)
- Edit / Write / NotebookEdit ツール呼出予定があり、対象が **既存装置の改訂**(LOC ±1 行超)
- Bash で既存装置の変更操作(rm / mv / git push --force / schtasks 変更)
- 構造設計判断を伴うタスク(規範改訂 + ADR 起案 + プロトコル改訂 + 円卓議題追加)
- inquiry-type タスクで **判断要素を含む**(SS_GUARD §DO-541「前提疑い」拡大解釈整合)

「該当する」判定は **「1% でも疑いがあれば invoke」** 基準(EVT-081/082 候補対処、EXTREMELY-IMPORTANT)。

## 実装モード判定(Mode detection)

タスクの実装モードを識別する:

| モード | 内容 | プラン要否 |
|---|---|---|
| **QUICK_IMPLEMENT** | チケット明示 + 1 行修正 + リスクゼロ判定 | ❌ プラン省略可 |
| **PLAN_REQUIRED** | チケット明示 + 構造判断要素含む | ✅ **5 セクションプラン必須** |
| **PLAN_RECOMMENDED** | 既存装置改訂 + LOC 増減あり | ✅ **5 セクションプラン必須** |
| **未指定**(デフォルト)| モード明示なし | ✅ **PLAN_REQUIRED 安全側扱い**(工場長 Castor 自己宣言整合) |

## Branch(分岐実行)

### QUICK_IMPLEMENT → 即実装可

例外条件 (i)〜(iv) 該当時のみ。完遂報告で「Plan-First 例外発動 + 該当条件」明示要(透明性確保)。

### PLAN_REQUIRED / PLAN_RECOMMENDED / 未指定 → 5 セクションプラン必須

Common Plan-First Protocol v1.0 §3 5 セクションテンプレ準拠で出力:

```markdown
## Plan for {タスク ID or 説明}

### 1. 前提確認
- 指示書 / ヤス指示 / ADR 規律の前提: {引用}
- 実態の確認: {grep / file 確認 / 物理層 query 結果}
- 一致 / 不一致: {判断}

### 2. 修正対象
| 操作 | ファイル | 内容 |
|---|---|---|
| 変更 | path/to/file.md | {要約} |
| 新規 | path/to/new.md | {要約} |
| 削除 | path/to/old.md | {要約 + 史実保持判断} |

### 3. 影響範囲
- 触らない: {明示}
- 副作用: {あれば記載}
- LOC 増減見積: ±{N}%

### 4. 代替案
- 案 A: {本提案}
- 案 B: {代替案、メリット / デメリット}
- 案 C: {現状維持の場合の構造的影響}

### 5. 承認待ち
「上記プランで進めてよろしいですか?」
```

プラン提示後、**Edit / Write / Bash ツール呼出を停止**。採否確定までは即実装開始禁則。

## Red Flags 先制表(rationalization 事前ブロック)

以下の rationalization が頭をよぎったら STOP — Plan-First 違反候補:

| Rationalization | 反論 |
|---|---|
| 「inquiry-type だからプラン不要」 | inquiry でも判断要素含む = プラン必須(SS_GUARD §DO-541「前提疑い」拡大解釈) |
| 「依存解消済だから即実装可」 | 依存解消 ≠ プラン免除 |
| 「ヤス指示 = 実装許可」 | ヤス「起案」依頼 ≠ 「実装」許可 = 自己都合拡張(EVT-079 物理事例) |
| 「staging/ 配置だから素案 = 採否前 Write OK」 | staging/ 配置 = 円卓決議前提 ≠ 採否前 Write 場(EVT-079 違反パターン B) |
| 「LOC ±50% 内だから単独可」 | scale 別 §6-H-5 = 単独可 = ただし構造設計事前提示 + 採否 + 検証は別義務 |
| 「AutoMode だから即実装」 | AutoMode = Plan 量産工場(ADR-003)= コード変更ゼロ = AutoMode 中の実装着手 = ADR-003 違反 |
| 「LOC 計測したから検証完了」 | LOC 計測 ≠ 機能検証(EVT-079 違反パターン C) |
| 「自分単独判断で大丈夫」 | 鏡像対話リスク発露(EVT-077 物理事例) |
| 「This is just a simple question」 | 問いも作業 = Plan-First 該当判定要 |
| 「I need more context first」 | Skill 呼出は context 取得前に必須 |
| 「Let me explore the codebase first」 | Skill が探索方法を指示 = 先行不要 |

これらが頭をよぎったら、**そのまま invoke** してから判定継続。

## 緊急例外条件(Common Plan-First Protocol v1.0 §7 整合)

以下の場合のみプラン提示省略可:

| 例外 | 条件 |
|---|---|
| (i) 環境修復(緊急対処) | 物理装置不稼働状態の即時修復 = 修復後にプラン段階で詳細記録(完遂報告で透明性確保) |
| (ii) ヤス直接「即実装」指示 | 「プラン不要、即実装」の明示指示時のみ |
| (iii) 既存装置の通常運用(LOC 増減なし) | sync-orders.ps1 手動実行 + commit + push 等 |
| (iv) 1 行修正 + リスクゼロ判定 | typo 修正 + 設定値微調整 + 自己違反検知後の即時 retract |

例外発動時も完遂報告で「Plan-First 例外発動 + 該当条件」明示 = 透明性確保。

## Verification step(プラン提示後、実装着手前)

採否受領後に以下を自己問答:

1. プラン提示済か?(本 Skill invoke 完遂か)
2. 採否経路明示済か?(ヤス or 司令官 α or 監督官 A による承認待機か)
3. 承認 or 修正指示 or 中止 or 保留 受領済か?
4. 採否済の場合、プラン内容と実装内容に齟齬がないか?
5. 検証ステップ(機能検証、LOC 計測のみではない)を計画に含むか?

5 件全件 ✅ なら実装着手可。1 件でも ❌ なら実装着手停止 + 不足部分対処要。

## 自己違反時の対処

万が一プラン提示せず実装着手した場合:

1. 即時 retract(可能な範囲で)
2. EVT 候補正式記録(誠実申告、累積件数 +1)
3. 完遂報告で違反 + 自己訂正 + 再発防止策明示
4. 検診プロトコル v0.4 §7-G RULE-B1〜B3 接続(月次メタ機能評価候補)

## 関連

- Common Plan-First Protocol v1.0: `record-x-supervisor/operations/plan_first_protocol_common_v1.0.md`
- 起案契機 EVT: EVT-079(プラン → 実装フロー違反)+ EVT-080(三者横断 ADR 機能不全 = Common 地盤不在)+ EVT-081 候補(skill 不使用)+ EVT-082 候補(Skill 強制力過大評価)
- 工場長 Castor 案 F + 5 階層根本原因分析(L1-L5)+ 5 案推奨(E + A + D + F)
- ADR-003(オートモード = Plan 量産工場、2026-02-09 Phase 1 決議)+ Plan-First Protocol 統合採択
- 三者共通自己宣言: モード未明示 = PLAN_REQUIRED 扱い + inquiry-type 判断要素含む = プラン必須 + AutoMode 中も skill invoke 必須 + 違反時 EVT 起案

## 起案履歴

- v1.0(2026-05-01 / Day 129、Phase A 末、午後再起動後): 初版起案、ヤス採択 (XXX) GO 受領後、工場長 Castor 案 F + Common Plan-First Protocol v1.0 §3 統合 + 三者共通 Layer 0 認知層強制装置として起案。supervisor 側 `.claude/skills/` 配置 = Common 地盤統合 + 三者共有経路。EVT-079/080/081/082 候補対処の物理装置化第 1 例(認知層 = Layer 0)。検証期間 = 本起案以降の Skill 実発火観察(検診プロトコル v0.4 §7-G RULE-B1〜B3 接続候補)。
