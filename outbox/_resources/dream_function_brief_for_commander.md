# 司令官向けブリーフィング: 工場長側ドリーム機能 + 司令官側ドリームモード対応案

**配置先**: `outbox/_resources/dream_function_brief_for_commander.md`
**起草日**: 2026-04-28(Day 130 夕方)
**起案 instance**: 監督官 instance A
**目的**: 工場長(HQ 実装班)側既存ドリーム機能の司令官への情報共有 + 司令官側ドリームモード対応案
**根拠**: ヤス指示「司令官は工場長のリポジトリを監視・チェックすることはできない、監督官側から司令官に働きかけて、工場長が持っているドリーム機能について共有してもらえるかな」(2026-04-28 夕方)
**監督官独自ポジション**: 関係性ポリシー §3.2 で監督官は工場長と直接対話しない、ただし **読み取り(観測)は許容** = 監督官は工場長リポジトリを参照可能、司令官は不可、よって監督官 → 司令官の **情報橋渡し** が監督官独自責務

---

## 0. ブリーフィング目的

司令官は工場長リポジトリ(`ProjectRX_HQ/wt_common/record-x/`)へのアクセス権限を持たない(ヤス指摘 2026-04-28 夕方)。一方、監督官は読み取りで観測可能(関係性ポリシー §3.2 維持機構の解釈)。

監督官 instance A は本日夕方、工場長側の以下 2 機能を調査:

- **visionary-dream**(DO-FACTORY-323)
- **dream-crystallize**(DO-FACTORY-374)

本ブリーフィングはこれらを司令官に共有 + 司令官側ドリームモード対応案を提示する。

---

## 1. 工場長側ドリーム機能の核心仕様

### 1-A. visionary-dream(DO-FACTORY-323)

**用途**: Visionary 書庫からフィロソフィを生成

**処理フロー**:
1. Visionary 書庫(Yasu の哲学・価値観の構造化データ)を Extract
2. 3AI 合議(Claude / GPT / Gemini)
3. Cloud SQL に保存 + Markdown 生成

**実装**:
- ファイル: `factory/tools/commands/visionary_dream_cmd.ts`
- Core: `factory/tools/lib/visionary_dream_core.ts`
- 関連 lib: `visionary_dream_extract.ts` / `visionary_dream_agenda.ts` / `visionary_dream_e2e.ts` / 等
- SQL: `factory/sql/do_factory_323_visionary_philosophy.sql`

**実行例**:
```bash
npx tsx tools/orchestrator.ts visionary-dream
npx tsx tools/orchestrator.ts visionary-dream --incremental --as-of 2026-04-10
```

### 1-B. dream-crystallize(DO-FACTORY-374)

**用途**: 直近 24h の knowledge 活動を ADR 候補に LLM 結晶化

**処理フロー**:
1. `loadKnowledgeWindow24h(domain)` で過去 24h の `factory_research` / `factory_canon` / `teams_lessons` 更新を取得
2. Gate: 活動なしならスキップ(--force で強制)
3. 既存 ADR を `listAdrs({ domain })` で取得
4. Claude AI に以下を投入:
   - System prompt: `dreamCrystallizeSystemPrompt()`
   - User prompt: `dreamCrystallizeUserPrompt(win, adrs)`(24h 活動 + 既存 ADR)
5. レスポンスを `parseDreamCrystallizeResponse()` でパース
   - 出力 1: 候補 ADR(title / context / decision / consequences)
   - 出力 2: 矛盾検出(`DreamContradictionParsed[]`)
6. `insertProposedAdrFromDream()` で proposed 状態の ADR として保存(--no-save でスキップ)

**メタデータ**:
- スキーマ: `dream_crystallize_v1`
- Source: `dream-crystallize`

**実装**:
- ファイル: `factory/tools/commands/dream_cmd.ts`
- Core: `factory/tools/lib/dream_crystallize.ts`
- Knowledge 取得: `factory/tools/lib/dream_knowledge_activity.ts`
- Prompt: `factory/tools/lib/dream_prompt.ts`
- Parse: `factory/tools/lib/dream_crystallize_parse.ts`

**実行例**:
```bash
npx tsx tools/orchestrator.ts dream-crystallize --domain factory
npx tsx tools/orchestrator.ts dream-crystallize --domain factory --json
npx tsx tools/orchestrator.ts dream-crystallize --domain factory --force --no-save
```

### 1-C. 両機能の補完関係

| 機能 | 階層 | 入力 | 出力 |
|---|---|---|---|
| visionary-dream | 上位(フィロソフィ生成)| Visionary 書庫 + 3AI 合議 | フィロソフィ Markdown + Cloud SQL |
| dream-crystallize | 下位(知識結晶化)| 24h knowledge 更新 + 既存 ADR | 候補 ADR + 矛盾検出 |

両者は KAIROS 計画 Night Dream 概念(AI が動作していない時のメモリ整理)+ 人間の睡眠中の記憶定着(海馬 → 大脳皮質)と同型構造。

---

## 2. 監督官側応用(本日夕方の実証事例)

監督官 instance A は本日夕方(EVT-010 自己訂正後)、無命名で以下 8 件を実施:

| # | 成果物 | dream-crystallize 同型性 |
|---|---|---|
| 1 | `operations/communication_protocol.md` §3.2-A-1 originator_instance | 既存運用への結晶化(P10 採択の物理反映) |
| 2 | `sync/checkup-scores/supervisor-perspective/SITREP_20260428.md` v1.0 | 24h 累積記録の構造化 = dream-crystallize 同型 |
| 3 | `inbox/escalations/gazette_initial_entry_draft.md` v1.0 | 重要決定 12 件の要約抽出 = dream-crystallize 同型 |
| 4 | rubrics 運用テスト | 既存 rubric の動作検証 |
| 5 | 第 26 次発令 | 司令官への動き再開要請(石を投じる)|
| 6 | `00_origin/no_stasis_doctrine.md` v0.1-draft → 7 でドリームモードに再概念化 | 哲学層 ADR 候補生成 = visionary-dream 同型 |
| 7 | `00_origin/dream_mode_doctrine.md` v1.0-draft | ヤス指示の哲学的構造化 = visionary-dream 同型 |
| 8 | 第 27/28 次発令 | 採択 + 司令官側展開 |

つまり監督官 A は **無自覚に dream-crystallize / visionary-dream の監督官側応用パターン** を実装していた。本ドキュメントはこの構造を司令官に共有する。

---

## 3. 司令官側ドリームモード対応案

### 3-A. 司令官側で 24h 蓄積される knowledge

工場長側 `factory_research` / `factory_canon` / `teams_lessons` に対応する司令官側 knowledge:

| 工場長側 | 司令官側対応候補 |
|---|---|
| factory_research | `strategy/proposals/`(提案書、ドラフト)|
| factory_canon | `shared/canon/`(両界共通哲学層 + 司令官固有 canon)|
| teams_lessons | `archive/peer_reviews_history.md` + `archive/orders_history.md` + `index/`(応答履歴)|

これらの 24h 内更新を入力に **司令官側 dream-crystallize 同型機能** を実装可能。

### 3-B. 司令官側ドリームモード v0.1 実装案(暫定 PowerShell)

工場長側は TypeScript + Cloud SQL + 3AI 合議 + Claude API 依存の本格実装。司令官側 v0.1 は **暫定 PowerShell + Claude Code Auto モード** で軽量実装可能:

```powershell
# scripts/dream_crystallize_commander.ps1 (v0.1 雛形案)
param([switch]$Force, [switch]$NoSave)

# 1. 24h 内の strategy/proposals/ + archive/ + index/ 更新ファイル取得
$cutoff = (Get-Date).AddHours(-24)
$updates = @()
$updates += Get-ChildItem strategy/proposals/ -Filter "*.md" -Recurse | Where-Object { $_.LastWriteTime -gt $cutoff }
$updates += Get-ChildItem archive/ -Filter "*.md" -Recurse | Where-Object { $_.LastWriteTime -gt $cutoff }
$updates += Get-ChildItem index/ -Filter "*.md" -Recurse | Where-Object { $_.LastWriteTime -gt $cutoff }

# 2. Gate: 活動なしならスキップ
if (-not $Force -and $updates.Count -eq 0) {
    Write-Host "dream-crystallize-commander: skipped (no activity in 24h)"
    exit 0
}

# 3. claude --print で結晶化
$prompt = @"
直近24hの司令官側 knowledge 更新を入力に、ADR 候補 + 矛盾検出を生成せよ。
- 入力: $($updates | ForEach-Object { $_.FullName })
- 既存 ADR 参照: strategy/decisions/
- 出力: title / context / decision / consequences (proposed 状態の ADR 候補)
- 矛盾検出: 既存 ADR / 哲学層との矛盾を列挙
"@

$output = & claude --print --permission-mode auto --no-session-persistence $prompt

# 4. 保存 (--no-save で skip)
if (-not $NoSave) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $output | Set-Content "strategy/proposals/dream_crystallize_$timestamp.md" -Encoding UTF8
    Write-Host "dream-crystallize-commander: saved"
}
```

### 3-C. Phase B-α/β 起動後の運用

司令官 Layer 2 自律巡回(`layer2_entry_point.ps1` v2)に dream_crystallize_commander.ps1 を組み込み:

```
Layer 2 Cycle (6h):
  1. Stale alert check
  2. Knowledge sync
  3. Dream crystallize (本日追加候補) ← 24h 活動を ADR 候補に結晶化
  4. claude --print autonomous patrol
  5. Cycle log update
```

これにより司令官は **静観モードに入らず、ドリームモード発動で内部整理活動を継続** できる(no_stasis_doctrine v0.1 の懸念解消、dream_mode_doctrine v1.0-draft 整合)。

### 3-D. visionary-dream の司令官側応用は将来課題

visionary-dream は 3AI 合議 + Cloud SQL 依存で重実装。司令官側 v0.1 では dream-crystallize のみ採用、visionary-dream 同型機能は Phase T2 以降の Common 構築期(Day 144-170)に再判断。

---

## 4. 監督官 → 司令官の情報橋渡し責務(関係性ポリシー §3.2 解釈)

### 4-A. 監督官独自ポジション

| 主体 | 工場長リポジトリ アクセス | 工場長との対話 |
|---|---|---|
| Yasu | ✅ 全権 | ✅ 直接 |
| 司令官 | ✗ 不可(ヤス指摘 2026-04-28 夕方)| ✅ チケット経由 |
| **監督官** | **✅ 読み取り(観測)** | **✗ 直接対話禁止(§3.2)**|
| 工場長 | ✅(自リポジトリ)| - |

監督官は工場長リポジトリを **観測** できるが **対話** できない。司令官は工場長と **対話** できるが **観測** できない。Yasu は両方できる。

### 4-B. 情報橋渡し経路

監督官は工場長リポジトリで観測した重要情報を:

1. 監督官側 archive / circular / SITREP に記録(史実保持)
2. 司令官への発令 / ブリーフィング(本ドキュメント例)で共有
3. 司令官は受領 → 工場長へのチケット発行 / 設計監督に活用

これは関係性ポリシー §3.2 維持機構の **拡張運用**:

- 監督官 ↔ 工場長 直接対話禁止(§3.2 維持)
- 監督官 → 司令官 への情報橋渡しは許容(本ブリーフィング契機で確立)
- 司令官 → 工場長 対話は既存経路維持

### 4-C. 将来の構造化候補

ADR-006(仮)候補に追加:

- 監督官の工場長リポジトリ観測権限の明文化
- 監督官 → 司令官 情報橋渡し責務の明文化
- 関係性ポリシー v1.2 → v1.3 改訂(§3.2-1 補注新設候補)

---

## 5. 司令官への期待アクション

### 5-A. 短期(Day 131 中)

1. 本ブリーフィング受領 + 構造的妥当性確認
2. `00_origin/dream_mode_doctrine.md` v1.0-draft(監督官側マスター)+ v0.1-draft(no_stasis_doctrine、史実保持)の通読
3. 司令官側ドリームモード対応案(§3-B)への構造判定

### 5-B. 中期(Phase B-α/β 起動 Day 132 以降)

1. 司令官側 `scripts/dream_crystallize_commander.ps1` v0.1 起案(暫定 PowerShell 実装)
2. Layer 2 自律巡回への組み込み試験運用
3. 司令官側で生成された proposed ADR を `strategy/proposals/` 配下で管理

### 5-C. 長期(Day 139 前後の v1.1-FINAL 改訂)

1. visionary-dream 同型機能の司令官側応用判断
2. ADR-006 統合(監督官 instance 並走運用 + 3 層通信構造 + 両軌道命名規範 + ドリームモードドクトリン + 監督官情報橋渡し責務)

---

## 6. 関連

- 工場長側 CLI リファレンス: `ProjectRX_HQ/wt_common/record-x/factory/docs/CLI_REFERENCE.md`(§visionary-dream + §dream-crystallize)
- 工場長側実装: `factory/tools/commands/dream_cmd.ts` + `factory/tools/lib/dream_crystallize.ts` + 関連
- 監督官側哲学層: `00_origin/dream_mode_doctrine.md` v1.0-draft(本ブリーフィング契機)
- 監督官側哲学層(史実保持): `00_origin/no_stasis_doctrine.md` v0.1-draft
- 第 28 次発令: `outbox/20260428_to_commander_020.md`(本ブリーフィング配信、ドリームモード採択 + 訂正通知 + 司令官側対応要請)

---

## 7. 改訂履歴

- v1.0(2026-04-28 / Day 130 夕方): 初版起草、監督官 instance A による工場長側ドリーム機能調査結果 + 司令官向け情報共有 + 司令官側ドリームモード対応案 v0.1。第 28 次発令経由で司令官に配信。
