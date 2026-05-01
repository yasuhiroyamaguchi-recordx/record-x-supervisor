# 調査レポート: Claude 4.7 指示優先順位 + CLAUDE.md 実効性 + 業界知見

**配置先**: `02_physical/research/20260501_claude_md_effectiveness.md`
**起案日**: 2026-05-01(Day 129、Phase A 末)
**起案者**: 監督官 A(Argus、Clear 後新 instance)
**調査契機**: ヤス問題提起「Claude 4.7 は CLAUDE.md より個別指示を重視するか」「グランドルール vs 法令の枠組みの危険性」「機能実装があっても活用されない原因」
**調査経路**: claude-code-guide エージェント(公式仕様)+ general-purpose エージェント(エンジニア知見、WebSearch)並行起動
**用途**: 第 5 回円卓会議(2026-05-04 棚卸し後開催予定)の議題素材

---

## 結論先出し

| ヤス懸念 | 結論 |
|---|---|
| 「Claude 4.7 は CLAUDE.md より個別指示を重視するか」 | ✅ **科学的に正当**(モデル特性、業界共通現象、公式認定) |
| 法体系メタファー(憲法 vs 法令) | 🟡 **部分的にのみ妥当**(architectural 保証なし、認知科学枠組みが適切) |
| 「機能実装があっても活用されない原因」 | ✅ **モデル特性が支配的**(運用問題ではない、業界共通) |

---

## §1. 公式仕様階層

### 1-A. 階層構造(claude-code-guide 調査)

```
[最高] System prompt(Anthropic 提供)
  ↓
[中] CLAUDE.md / GEMINI.md / AGENTS.md(プロジェクトメモリ、context として注入)
  ↓
[低] 対話内ユーザー直接指示 + system-reminders
```

ただし「公式の指示優先順位仕様書は不存在」(Anthropic 公式ドキュメントで明示されていない)。

### 1-B. 重大な問題点

| # | 問題 | 出典 |
|---|---|---|
| 1 | CLAUDE.md は **context として注入**(system-prompt レベルではない)= override 宣言は marketing language | Claude Code Memory docs |
| 2 | **system-reminder 免責文** 「this context may or may not be relevant」「only if highly relevant」が **無視権を付与** | GitHub Issue #7571(既知バグ、未修正)|
| 3 | **conflicting instructions → arbitrary pick** | Claude Code Best Practices |
| 4 | **200 行超で adherence 低下**(公式注意喚起) | Claude Code Memory docs |

---

## §2. transformer attention 機構の本質的限界

### 2-A. 階層は architectural 保証ではない

| 観点 | 内容 | 出典 |
|---|---|---|
| self-attention | 各 token embedding が等価処理、階層的重要度を判別できない | atlassc.net |
| recency bias | 直近 token への attention 偏向(LLM 一般、model size と共に増大)| arXiv 2310.01427, 2509.11353 |
| system-prompt vs user-prompt 処理差 | 訓練 prior による誘導であり保証ではない | arXiv 2505.21091, 2404.13208 |

### 2-B. The Instruction Hierarchy(OpenAI 論文、arXiv 2404.13208)

「system > user > data の階層は **訓練で誘導された prior** であり保証ではない」+「違反時の +15.4% 改善 = 階層が architectural には保証されないことを示す」。

= **Anthropic Claude も OpenAI GPT も同型構造**。Claude 4.7 固有の問題ではない。

---

## §3. Claude 4 系モデル差異

### 3-A. Opus 4.7 の改善

| 項目 | 内容 | 出典 |
|---|---|---|
| literal instruction following 強化 | 「previous models read between the lines, 4.7 is better at doing as it's told」 | Anthropic 公式 |
| long context での drift 減 | Intuit/GitHub/Notion 早期評価 | 公式 + 著名媒体 |

### 3-B. 副作用(リテラル過剰)

| 観点 | 内容 | 出典 |
|---|---|---|
| 過剰なリテラル解釈 | 「過剰に文字通り取って意図を外す」 | Vellum, MindStudio レビュー |
| 互換性 | 「prompts written for earlier models can produce unexpected results」 | Anthropic 公式 migration guide |

= **Opus 4.7 移行で改善はあるが、recency/specificity bias は残存**。

---

## §4. CLAUDE.md 実効性 業界共通苦情

### 4-A. GitHub Issues 集約(general-purpose 調査)

| Issue # | 内容 |
|---|---|
| #7571 | system-reminder 免責文が CLAUDE.md startup instructions を阻害(本調査の核心)|
| #15443 | explicit な指示を理解した宣言しつつ無視 |
| #27032 | session 開始で読んだのに無視 |
| #32161 | systematically ignores knowledge retrieval rules |
| #32775 | edit/write のたびに systematic に無視 |
| #23032 | Claude Code ignoring directives, breaking production |

### 4-B. コミュニティ報告

| 出典 | 報告 |
|---|---|
| HN 46102048 | 情報多いほど無視率上昇 |
| DEV Community | 200 行ルールが全無視された |
| Albert Nahas | too long なら半分は無視される |
| HumanLayer Blog | 60 行未満推奨、一般合意 300 行未満 |

---

## §5. 法体系メタファーの妥当性

### 5-A. 旧枠組み vs 適切な枠組み

| 旧(ヤス当初提示)| 新(調査結果反映)|
|---|---|
| 憲法 vs 法令 vs 個別命令 | **長期記憶 vs 作業記憶**(認知科学、Anthropic context engineering 整合)|
| 階層的優先順位 | attention weight 分配 + instruction budget(150-200 件で飽和)|
| 違反 = 違法 | 違反 = 確率的 attention 配分の結果 |

### 5-B. 適切な代替枠組み

Anthropic 公式「Effective context engineering for AI agents」整合:
> 「人間も全コーパスを暗記せず外部 index で必要時取り出し」
→ 「**長期記憶(CLAUDE.md)vs 作業記憶(対話内 context)**」メタファーが機構整合的

### 5-C. 法体系メタファーの保持価値

完全否定ではなく、**部分的に有用**:
- AI ガバナンス設計の言語としては保持
- 機構説明は context engineering 枠組みで補強
- 両用しつつ、規律装置の物理化(hooks 等)で機構非依存化を目指す

---

## §6. 推奨対策パターン(業界確立済)

### 6-A. パターン一覧

| # | 対策 | 強度 | L8 整合 |
|---|---|---|---|
| **A** | CLAUDE.md 短縮(現 ~200 行 → ~100 行以下) | 中 | ✅ 減算 = 簡素化 |
| **B** | Hooks 物理強制(`.claude/settings.json` PreToolUse 等)= disclaimer なし system-reminder 注入 | **最高(deterministic)** | 🟡 既存改訂 = 単独可、新規 hook = scale 別 |
| **C** | Progressive disclosure(`file:line` pointer + `.claude/rules/` path-scoped)| 中 | 🟡 階層追加 = scale 別 |
| **D** | system-prompt level 統合(`--append-system-prompt`) | 高(常時注入)| ✅ 既存仕様改訂 |
| **E** | 重要規律をトップ近接配置 + 自己点検プロンプト | 中 | ✅ 既存改訂 |
| **F** | 不変規律は hook で物理強制、価値判断規律は CLAUDE.md(役割分担)| 高 | ✅ |

### 6-B. HumanLayer Blog 推奨パターン

1. 最小普遍ルール
2. `file:line` pointer
3. separate file への progressive disclosure
4. linter は tool に委譲
5. `/init` 自動生成回避

### 6-C. SuperPower / awesome-claude-code 確立パターン

`hesreallyhim/awesome-claude-code` リポジトリ:hooks/skills/orchestrators の curated list として patterns 集約。

---

## §7. 監督官 A 認識訂正(EVT-071 候補)

| 旧認識(本セッション §2 で記述)| 新認識(調査後)|
|---|---|
| 「CLAUDE.md と直接指示は同列の最高優先度」| 🔴 訂正: 公式階層は「System prompt > CLAUDE.md > 直接指示」、CLAUDE.md は context として注入 = system-reminder 免責文付き = 実効的に直接指示と同列 or 劣後 |
| 「公式仕様で個別指示優位とは言われていない」 | 🟡 部分訂正: 明示的仕様文はないが、「conflicting → arbitrary pick」「200 行超で adherence 低下」等で公式認定 |

= EVT-071 候補(本セッション 2 件目自己違反候補、累積 51 件目、系列 I 19 件目候補)。

---

## §8. 第 4 回円卓会議への影響

### 8-A. 第 4 回決議の暫定位置づけ確定

ヤス指摘(2026-05-01):「第 4 回は調査結果不十分のまま開催 = 空転可能性」= 正面採択。

第 4 回円卓決議 = **暫定状態**、第 5 回円卓(2026-05-04 棚卸し完遂後)で:
- 本調査結果 + 棚卸し結果を素材として
- アジェンダ再構築
- 採択判定再評価

### 8-B. 第 4 回決議の保持/撤回判定

| 議題 | 第 4 回決議 | 第 5 回再評価対象? |
|---|---|---|
| #1 L8 構造的バイアス認定 | ✅ APPROVE | 維持(調査結果整合 = 業界共通) |
| #2 「装置」定義 | ✅ APPROVE(single source 主)| 維持(調査結果 instruction budget 整合)|
| #3 簡素化原則期間限定 | ✅ APPROVE | 維持(L8 整合)|
| #4 自己検診強化(各官 CLAUDE.md §4 改訂)| ✅ APPROVE | **再評価**(CLAUDE.md 改訂は実効性疑義 = hooks 化検討要)|
| #5 装置追加判断プロトコル | ✅ APPROVE | 維持 |
| #6 既存装置棚卸し | ✅ APPROVE | 維持(進行中、本調査も統合素材化)|
| #7 既 commit 分判定 | ✅ APPROVE | 維持 |
| #8 三者統合カタログ自動登録機構 | 🟡 CONDITIONAL | 棚卸し後再判定(予定通り)|
| #9 schema 統一 | 🟡 CONDITIONAL | 議題 #8 連動 |
| #10 ADR-010 再起案 | 🔴 REJECT | 維持 |
| #11 ADR-009 §6 v1.4 改訂 | ✅ APPROVE | 暫定 commit 済(b3dacad)、第 5 回後に v1.5 改訂可能 |

### 8-C. 第 5 回円卓追加議題候補

| # | 議題 |
|---|---|
| 新 1 | CLAUDE.md 実効性(本調査結果採択 + 200 行制限 + system-reminder 免責文認識) |
| 新 2 | hooks 物理強制設計(deterministic enforcement vs CLAUDE.md advisory)|
| 新 3 | progressive disclosure 階層化(`.claude/rules/` 等)|
| 新 4 | 法体系メタファー → 認知科学枠組み(長期記憶 vs 作業記憶)への再フレーム |
| 新 5 | 円卓召集前のリサーチ義務化(starter_checklist v0.2 円卓召集編 候補)|
| 新 6 | 監督官 A 単独 vs 監督官 B + 司令官 α + 工場長との合議の認知バイアス補完 |

---

## §9. 関連

- 第 4 回円卓議事録: `archive/board_council_minutes/council_20260501_l8_simplification_004.md`
- ADR-009 §6 v1.4: `adrs/ADR-009_council_v03_revision_plan.md`
- starter_checklist v0.2: `operations/starter_checklist_v0.2.md`
- error_patterns.md: `archive/error_patterns.md`(EVT-068, EVT-070 候補, EVT-071 候補, EVT-072 候補)

---

## §10. 出典(主要 URL)

### Anthropic 公式
- Claude Code Memory: https://code.claude.com/docs/en/memory
- Claude Code Best Practices: https://code.claude.com/docs/en/best-practices
- Opus 4.7: https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7
- Effective context engineering: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Hooks Guide: https://code.claude.com/docs/en/hooks-guide

### GitHub Issues(業界共通苦情)
- #7571: https://github.com/anthropics/claude-code/issues/7571
- #15443: https://github.com/anthropics/claude-code/issues/15443
- #27032: https://github.com/anthropics/claude-code/issues/27032
- #32161, #32775, #23032

### 査読論文
- arXiv 2310.01427(Attention Sorting Combats Recency Bias)
- arXiv 2505.21091(Position is Power: System Prompts as a Mechanism of Bias)
- arXiv 2509.11353(Recency Bias in LLM-Based Reranking)
- arXiv 2404.13208(The Instruction Hierarchy, OpenAI)

### コミュニティ
- HN 46102048
- DEV Community(Albert Nahas, Minato Planb 等)
- HumanLayer Blog
- awesome-claude-code(hesreallyhim)

---

## §11. 改訂履歴

- v1.0(2026-05-01 / Day 129、Phase A 末): 初版起案、claude-code-guide + general-purpose 並行調査結果統合、第 5 回円卓会議素材化、第 4 回決議暫定位置づけ確定、EVT-071/072 候補発生記録。
