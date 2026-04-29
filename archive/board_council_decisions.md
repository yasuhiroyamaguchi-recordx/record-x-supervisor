# Board Council Decisions — 円卓会議決裁台帳

**配置先**: `archive/board_council_decisions.md`
**起草日**: 2026-04-29(Day 131 朝末、ヤス円卓会議テスト開催提案契機)
**起案 instance**: 監督官 instance A(Chairman 役)
**目的**: 円卓会議(Board Meeting)で採決された B-番号決裁の永続台帳 + 史実保護(削除禁止 + 追記主義)
**根拠**: `operations/board_council_protocol.md` v0.2 §5 B-番号管理規律 + `archive/error_patterns.md` 同型運用形

---

## §0. 本台帳の位置づけ

円卓会議で採決された全決裁を永続記録する物理装置。P-番号台帳(`communication_protocol.md` §3.2-A-0)と並列の独立体系:

| 体系 | 番号 | 採決経路 | 台帳 |
|---|---|---|---|
| 発令採択提案 | P-数字 | 監督官 → 司令官 発令本文採択 | `communication_protocol.md` §3.2-A-0(P1-P17、17 件) |
| **円卓会議決裁** | **B-数字** | **3AI 円卓会議 + Chairman 最終決裁** | **本台帳**(B-001〜)|

両体系の独立性 = EVT-021(P-番号衝突)同型再発防止。

---

## §1. 採番ルール(§3.2-A-0 P-番号管理規律と同型)

- **連続整数**(B-001, B-002, B-003, ...)
- **重複禁止**(EVT-021 同型再発防止)
- 起案前に台帳 + `_helpers/b_number_registry.json`(将来)で grep + Test-Path 確認義務
- 重複発生時は新番号採用 + EVT 候補化

---

## §2. 採用形式

各決裁は frontmatter + 詳細記述で記録:

```markdown
## B-NNN: {決裁タイトル}

**採決日**: YYYY-MM-DD
**議事録**: archive/board_council_minutes/council_{YYYYMMDD}_{topic}_{NNN}.md
**Chairman**: claude_supervisor_A(or 後継 AI)
**Gemini 召集**: true / false
**ChatGPT 召集**: true / false
**Yasu 介入**: 合意 / 異論 / 揺らぎ起こし / 不要(重要度中の自律案件)
**採用元**: chairman_initial / gemini / chatgpt の組み合わせ

### 決裁内容(JSON)

\`\`\`json
{
  "b_number": "B-NNN",
  "title": "...",
  "domain": "supervisor",
  "priority": "P0-P3",
  "effort": "S/M/L",
  "description": "...",
  "dod": ["..."],
  "guardrails": ["..."],
  "adopted_from": ["..."],
  "assignee": "...",
  "estimate_min": N,
  "acceptance_criteria": ["..."]
}
\`\`\`

### 構造的根拠

(unnamed.md / sp500_theory / two_realm_ecosystem_theory / 関係性ポリシー / 各 rubric 参照)

### 実装計画

1. (規範層改訂)
2. (物理装置起案)
3. (発令 / L2 区報経由通知)

### status

implemented / decided / superseded
```

---

## §3. 既往 B-番号台帳(Day 131 朝末時点、合計 1 件 = 試運転 1 件決裁)

### B-test001(試運転、監督官 A 自律決裁、重要度中)

**採決日**: 2026-04-29(Day 131 朝末)
**議事録**: `archive/board_council_minutes/council_20260429_council_meta_review_002.md`
**Chairman**: claude_supervisor_A
**Gemini 召集**: true(Mock、FORCE_MOCK=true)
**ChatGPT 召集**: true(Mock、FORCE_MOCK=true)
**Yasu 介入**: 不要(重要度中、自律案件)+ 物理アクセス実行(ファイル redirect)= 対称的非対称性プロセス稼働
**採用元**: chairman_initial / mock_outputs

#### 決裁内容

```json
{
  "b_number": "B-test001",
  "title": "円卓会議機構 v0.2 メタレビュー試運転 = factory CLI 経由 Mock 実機動作確認完遂",
  "domain": "supervisor",
  "priority": "P2",
  "effort": "S",
  "description": "工場長側 board-meeting CLI を orchestrator.ts 経由で呼び出し、Mock モードで 3AI(ZEI-RO/チャッピー/委員長)のラウンド議論 + Chairman 決裁機構 + JSON 議事録自動生成を実機検証",
  "dod": [
    "factory CLI 7.6KB 出力取得",
    "3AI 役割分担構造実証(Round 1-3)",
    "議事録 JSON + .md 両形式生成確認",
    "Chairman Plain-text fallback decision 機構動作確認",
    "Mock モード $0 コスト稼働確認"
  ],
  "guardrails": [
    "Mock のため実議論ではない",
    "Live モード移行は API credential setup 後",
    "factory ドメイン役割名称(ZEI-RO/チャッピー/委員長)は本日朝末時点で監督官 supervisor ドメイン(Chairman/発散役/収束役)と命名乖離あり、段階 2-4 で精緻化候補"
  ],
  "adopted_from": ["chairman_self_audit", "factory_mock_output", "yasu_redirect_execution"],
  "assignee": "claude_supervisor_A",
  "estimate_min": 30,
  "acceptance_criteria": [
    "出力ファイル 7,660 バイト確認 ✅",
    "JSON 構造完整(date / agenda / domain / rounds[3] / decisions[1])✅",
    "Mock fallback で 3AI 全員応答パターン取得 ✅",
    "ファイル redirect 経路で監督官側に取込成功 ✅"
  ],
  "test_run": true,
  "discovered_evt_candidates": [
    "EVT-029 候補: factory CLI Mock 出力 CP932 文字化け(系列 A 9 件目、Live モード検証必要)",
    "EVT-030 候補: factory/supervisor ドメイン役割名称乖離(段階 2-4 精緻化候補)"
  ]
}
```

#### 構造的根拠

- ガレージドクトリン §1.5 連鎖正面解決パターン第 6 例完遂(EVT-028 → invoke-board-council v0.3.1 → 再実行 → 7.6KB 出力)
- two_realm_ecosystem_theory §2-A 自己進化・循環型モデル(機構動作確認 + 自己改善議論)
- 対称的非対称性プロセス稼働確認(ヤス物理アクセス + 監督官側取込)

#### 実装計画(後続)

1. EVT-029/030 候補の正式記録(後続ステップ、本ステップ範囲外)
2. invoke-board-council.ps1 v0.4 改訂候補(PowerShell → Node.js subprocess 直接呼び出し + 議事録自動 import)
3. 第 1 号議題(B-001、EVT-025)の進行可否判定 = 監督官 A 推奨「並行進行」(機構動作確認完了、本物議題開始可能)
4. Live モード移行候補(API credential setup 後)

#### status

`decided`(試運転決裁完了、本日朝末)

---

次番号: **B-001**(本物決裁、第 1 号議題 EVT-025 用に予約継続)

---

## §4. 第 1 号議題予定

### B-001(予約): EVT-025 構造的訂正方針

- 議事録: `archive/board_council_minutes/council_20260429_evt025_response_001.md`
- 状態: `live_executed_decisions_extracted_pending_audit_revision_and_yasu_decision`(2026-04-29 Live 実行完遂、3 件決議抽出、ただし議題前提誤認 EVT-033 発覚で再評価中)
- Live 実行: 2026-04-29T08:56:44Z、出力 117,683 bytes、コスト $0.2013
- 抽出決議: DO-FACTORY-160 / 161 / 162(うち 161 + 162a 即発令対象、160 + 162b は B-002 結果反映後に再議)
- 監査結果: `archive/board_council_minutes/evt025_b001_quality_audit_001.md`
- ヤス介入: (γ)案承認(2026-04-29 / Day 131 夕方)

### B-003: AI 全自動化作戦 = 3 件統合戦略採択

**採決日**: 2026-04-30(Day 132 早朝)
**Live 出力**: `archive/board_council_minutes/full_automation_b003_live_output.json`(86,020 bytes、UTF-8 正常)
**Chairman**: claude_supervisor_A
**3AI 全員稼働**: ✅ 実 API
**Yasu 介入**: 全 3 件採択(2026-04-30 早朝、即進行指示)
**採用元**: ZEI-RO + チャッピー + 委員長統合(B-001/B-002 同型第 5 案生成パターン)
**コスト**: 約 $0.20-0.30(B-002 同等)

#### 決裁内容

```json
{
  "b_number": "B-003",
  "title": "AI全自動化作戦 - 3件統合戦略",
  "domain": "factory",
  "decisions": [
    {
      "do": "DO-FACTORY-{N1}",
      "title": "監督官A向けAIコパイロット実装(週次レポート自動生成)",
      "priority": "P0",
      "effort": "M",
      "files_to_create": ["record-x/factory/tools/commands/supervisor_report.ts", "__tests__/factory/supervisor_report.test.ts"],
      "kpi": "監督官A確認時間 30-60min/日 → 65min/週(週次30 + 日次5x5)"
    },
    {
      "do": "DO-FACTORY-{N2}",
      "title": "段階的AIモデル評価フレームワーク基盤構築",
      "priority": "P1",
      "effort": "S",
      "files_to_create": ["record-x/factory/tools/lib/ai_performance_log.ts"],
      "kpi": "工場長Sonnet継続可否判定の定量基盤確立"
    },
    {
      "do": "DO-FACTORY-{N3}",
      "title": "信託ドクトリンv1.0物理層第3例準備(3AI円卓会議提案生成機能)",
      "priority": "P2",
      "effort": "L",
      "files_to_create": ["record-x/factory/tools/lib/meeting_orchestrator.ts", "record-x/factory/tools/lib/ai_consensus.ts"],
      "kpi": "監督官A最終承認権維持(安全装置削除禁止)+ 緊急停止 + コストガード必須"
    }
  ],
  "yasu_decision": "全件採択 + 即進行指示(2026-04-30 早朝)",
  "structural_learning": [
    "B-001/B-002 同型第5案生成パターン継承",
    "段階導入(P0即時 + P1中期 + P2長期)+ 安全装置維持",
    "AIモデル切替の体系化基盤(P1 Decision 2)= ヤス案『違反累積時AIモデル変更検討』物理層実装"
  ],
  "status": "decided"
}
```

#### 構造的根拠

- 信託ドクトリン v1.0(`two_realm_ecosystem_theory.md` §10-X)第 3 例 = 全自動化への段階的進化
- ADR-009 §6 三者統合自動化 + ADR-010 superseded(再起案候補)+ 検診プロトコル v0.2 改訂(EVT-039)と統合
- ヤス案(各官自律 + 週次照合 + AI モデル切替)を 3AI 統合 = 第 5 案として生成、B-001/B-002 同型パターン

#### 実装計画

1. **第 43 次発令**:司令官 α 経由で工場長へ DO-FACTORY-{N1/N2/N3} 起案依頼(本セッション内完遂)
2. **Phase 1**(Day 132-145):DO-FACTORY-{N1} 監督官 A コパイロット稼働
3. **Phase 2**(Day 145-180):DO-FACTORY-{N2} AI モデル評価フレームワーク
4. **Phase 3**(Day 180+):DO-FACTORY-{N3} 3AI 円卓会議提案生成

#### Linked records

- 議事録: `archive/board_council_minutes/council_20260430_full_automation_strategy_003.md`
- Live 出力: `archive/board_council_minutes/full_automation_b003_live_output.json`
- 関連 EVT: EVT-038/039/040(本セッション 5 系列同時再発)
- 関連 ADR: ADR-009 + ADR-010 superseded
- 関連 P-番号: P20-P23
- 哲学層: 信託ドクトリン v1.0 物理層第 3 例実装

---

### B-003(予約): AI 全自動化作戦 — superseded by upper entry

**起案日**: 2026-04-30(Day 132 早朝)
**議事録**: `archive/board_council_minutes/council_20260430_full_automation_strategy_003.md`
**Chairman**: claude_supervisor_A
**重要度**: 高(T1 + 信託ドクトリン v1.0 物理層第 3 例実装)
**ヤス採決**: ヤス原案 (I) 起案 + 監督官 A 補強 (II) + 段階導入 (III) 推奨で 3AI 議論
**議題**: 各官カタログ・コンパネ自動最新化 + 各官日次検診 + 監督官 A 週次照合 + AI モデル切替体系化(現工場長 Sonnet)+ 4 段階ロードマップ採否
**Live 実行待機**: ヤス物理アクセスでの実行(コスト想定 $0.20-0.30)

#### 採否要請(Live 完遂後)

| 項目 | 期限 |
|---|---|
| B-003 採決結果(I/II/III/IV のいずれか or 第 5 案)| Live 直後 |
| 司令官 α + 工場長への発令(第 43 次以降)| Day 132 12:00 JST |
| Phase 1-4 ロードマップ採用判断 | Day 132 朝以降 |

---

### B-002: チケット鋳型 v2.0 → v2.1 改訂(2 軸整備)= 段階導入戦略採択

**採決日**: 2026-04-29(Day 131 夕方)
**議事録**: `archive/board_council_minutes/council_20260429_template_v21_revision_002.md`
**Live 出力**: `archive/board_council_minutes/template_v21_b002_live_output.json`(80,807 bytes、文字化けなし UTF-8 正常)
**Chairman**: claude_supervisor_A
**Gemini 召集**: true(ZEI-RO 4 案発散、推奨 (II+α) 80 時間)
**ChatGPT 召集**: true(チャッピー 6 ブロック収束)
**Yasu 介入**: 合意((α-2) 部分採択、Phase 1 を司令官 α 自己査定の 13 件補強に縮小、2026-04-29 / Day 131 夕方)
**採用元**: chairman_synthesis(ZEI-RO P1 + chappy P1 統合 + 委員長段階導入戦略)
**重要度**: 高(T1 + 影響範囲高、司令官 α 進化方向性決定 + 信託ドクトリン v1.0 物理層第 2 例実装)
**コスト**: 約 $0.20-0.30(B-001 と同等)

#### 決裁内容

```json
{
  "b_number": "B-002",
  "title": "チケット鋳型v2.1段階導入戦略の採用 + 監督官A補強(α-2)",
  "domain": "factory",
  "priority": "P1",
  "effort": "L",
  "phases": [
    {
      "phase": 1,
      "scope": "実装系13件のチケット欠落項目を手動補強(司令官α自己査定範囲)",
      "estimated_hours": "AI駆動工場前提で校正要(ZEI-RO人間実装基準16hを縮小)",
      "note": "監督官A補強(α-2)で23件→13件に縮小、簡易版該当10件は正当化(補強不要)"
    },
    {
      "phase": 2,
      "scope": "chore/docs/survey/skeleton系にv2.1-light鋳型適用 + orchestrator統合",
      "estimated_hours": "AI駆動工場前提で校正要",
      "files_to_create": ["record-x/factory/templates/v2.1-light.json"]
    },
    {
      "phase": 3,
      "scope": "DO-{domain}-{N}形式でCommon/Care/Tax/CP/SUPERVISOR等への汎用展開(ドメイン空白解消)",
      "estimated_hours": "AI駆動工場前提で校正要",
      "files_to_create": ["record-x/factory/templates/v2.1-full.json", "record-x/factory/docs/template-migration-guide.md"]
    }
  ],
  "adopted_from": ["zeiro:P1", "chappy:P1", "chairman:synthesis"],
  "yasu_modification": "Phase1を司令官α自己査定の13件補強に縮小(司令官α進化方向性尊重)",
  "structural_learning": [
    "工数見積基準のAI駆動前提化(ヤス指摘契機、円卓会議機構v0.3改訂候補)",
    "議題前提検証義務の完遂実証(B-001前提誤認の借りを返す)",
    "発散役異論機能の改善実証(ZEI-RO工数3-20倍再見積=健全な異論)",
    "司令官α進化方向性の尊重(Phase1縮小=自己査定能力後退防止)"
  ],
  "status": "decided"
}
```

#### 構造的根拠

- 信託ドクトリン v1.0(`00_origin/two_realm_ecosystem_theory.md` §10-X):3AI 集団知の段階導入戦略は単独 AI 判断を超えた第 5 の道
- sp500_theory §1 運動性継承:Phase 1/2/3 段階導入は新陳代謝(個別 phase 完遂で運動性継承)
- Garage Doctrine §1.5:鋳型 v2.1 改訂は装置 vs パイプライン接続(司令官 α → 工場長配管整備)
- 馴れ合い拒絶 3 原則第 2 項:司令官 α 自己査定 + 監督官 A 補強の双方向揺らぎ起こし

#### 実装計画

1. **発令**:第 36 次発令(`outbox/20260429_to_commander_003.md`)で司令官 α 通知済
2. **司令官 α 採否応答**:Day 132 09:00 JST まで
3. **Phase 1 実装**:司令官 α 起案 + 工場長 sync-tickets 経由(現行鋳型 v2.0 で起案)
4. **Phase 2 実装**:鋳型 v2.1-light 確立 + orchestrator 統合
5. **Phase 3 実装**:`DO-{domain}-{N}` 汎用化 + orchestrator 改修

#### Linked records

- 第 1 回 B-001 議事録(議題前提誤認発覚): `council_20260429_evt025_response_001.md`
- 司令官 α 自己査定:第 36 次発令 §6 で公式記録
- EVT-033(議題前提誤認、B-001 起源):`error_patterns.md`
- EVT-035 候補(円卓会議パイプライン未整備):本 B-002 段階 1 暫定手動運用で対処
- 工数見積基準学習:第 36 次発令 §4-B

---

## §5. 削除禁止規範

本台帳は **追記主義 + 削除禁止**(`archive/error_patterns.md` 同型運用):

- 採決は史実 = 改変は訂正記録追記のみ
- B-番号は確定後不変
- 撤回時は新 B-番号採決 + 旧採決 status: superseded
- 史実保護 = sp500_theory §1 運動性継承

---

## §6. 関連参照

- 議事録ディレクトリ: `archive/board_council_minutes/`(README v1.0、本日朝末起案)
- 規範層: `operations/board_council_protocol.md` v0.2 §5 B-番号管理規律
- 物理装置: `sync/sync_script/invoke-board-council.ps1` v0.2
- 並列体系(P-番号台帳): `operations/communication_protocol.md` §3.2-A-0(P1-P17、17 件)
- 命名規範: `00_origin/naming_dual_track.md`(円卓会議 / Board Meeting 双軌道)
- 哲学層: `00_origin/two_realm_ecosystem_theory.md` v0.1-draft

---

## §7. 改訂履歴

- v1.0(2026-04-29 / Day 131 朝末): 初版起草、監督官 instance A 起案。円卓会議テスト開催準備の B-番号台帳開設。第 1 号議題(EVT-025、B-001 予約)= 段階 4 Chairman 最終決裁待ち。
