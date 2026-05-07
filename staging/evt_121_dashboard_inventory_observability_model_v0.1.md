---
id: EVT-121-DASHBOARD-INVENTORY-OBSERVABILITY-MODEL-v0.1
title: EVT-121 Dashboard / Inventory Observability Model v0.1(read-only 設計、実装なし、ヤス方向転換採択)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
yasu_decision_history:
  - "2026-05-08 朝中盤後末末末: ヤス方向転換「hook/skill-first → dashboard/inventory-first、Stage 0 Mirror v1.2 reviewed = true delivery failure 0、EVT-121 = cross-pipeline observability + inventory deficiency に reframe」"
yasu_constraints:
  - "Read-only and evidence-index based"
  - "Do not implement dashboard UI"
  - "Do not approve DP-001 C-2/C-3/C-4"
  - "Do not issue Commander tickets"
  - "Do not instruct Factory"
  - "Do not add hooks or skills in this cycle"
  - "Do not treat dashboard-first planning as approval for write operations"
  - "Separate from DO-FACTORY-233 and G-009-012"
ticket_type: observability_design_proposal
applied_yasu_required_artifact: staging/evt_121_dashboard_inventory_observability_model_v0.1.md
---

# EVT-121 Dashboard / Inventory Observability Model v0.1

## 1. Current Problem Statement

EVT-121 の reframe(ヤス指示 2026-05-08 朝中盤後末末末):

| 旧 frame | 新 frame |
|---|---|
| 「Stage 0 delivery breakage」 | 「**cross-pipeline observability and inventory deficiency**」 |

### 1-A. 物理証拠累積(Stage 0 Mirror Reconciliation Note v1.2 経由)

| 段階 | 監督官認知 | 真値 |
|---|---|---|
| 初動 | diff 126 = broken | counting-method 誤認(完了/未集計) |
| v1 | 真 diff 約 6 件 | 対称的差分前提の浅薄推定 |
| v1.1 | 非対称 20 件(13 + 7) | 部分確証 |
| v1.2 | **真 delivery failure 0 件** | **完全確定**(全 20 件 retention/scope/variant/別経路/内部文書 mismatch) |

### 1-B. 真因(構造)

監督官・司令官・工場長・Strategy Lab・Codex 監督官並走 が **共有された inventory model を持たない** = 各自の観測が認知的に閉じる = 状態認識ラグ累積 = ヤス手動 trigger / 工場長報告 / Codex push 検出 経由でしか発見されない構造。

= **Stage 0 経路は健全、知の経路が欠落**

---

## 2. Revised Interpretation of Stage 0 Mirror Result

| 観点 | v1.2 確証 |
|---|---|
| Stage 0 配送経路 | ✅ 健全(物理装置は機能) |
| supervisor outbox の構成 | A-line(commander 配送)+ B-line(supervisor 内部 monitoring)+ research_reports(別経路)+ 旧形式残骸 |
| commander inbox の構成 | rolling 直下 + 完了/ stock + escalations + from_supervisor + research_reports + 内部 README |
| 1:1 マッピング前提 | ❌ 構造的不成立 |
| 真 delivery failure | 0 件(全 20 件 構造的説明可能) |
| 真の構造課題 | inventory 共有モデル不在(本 v0.1 提案対象) |

= **「failure 検出」から「inventory 構造化」へ**(treatment shift)

---

## 3. Inventory Axes(ヤス指定 8 軸)

| Axis | Required Question | Data Source 候補(§5 参照) |
|---|---|---|
| Feature inventory | What functions currently exist? | ProjectRX merged PR + dashboard 装置稼働一覧 |
| Ticket inventory | Which DO tickets are active, completed, blocked, stale, or duplicated? | commander tickets_issued/active + tickets_completed |
| Completion evidence | Which completion_reports prove implementation or closure? | factory completion_reports + commander completion_reports |
| Pipeline path | Which path produced the artifact: Commander, Factory, Supervisor, HQ, manual, or legacy? | git log + PR metadata + branch name + 命名 convention |
| Stage mapping | Does the artifact belong to A-line delivery, B-line internal monitoring, dashboard, governance, or legacy? | 命名規則 v1.0 + 配置 path |
| Reconciliation status | Is mismatch caused by true failure, retention policy, naming variant, counting method, scope mismatch, or unknown? | 4 点照合(本 v0.1 §5 拡張)+ Stage 0 Mirror Reconciliation Note v1.2 |
| Source of truth candidate | Which repo/file is the best evidence source for each status? | ticket_id_mapping.md(commander 主管)+ 4 点照合 SSOT 階層 |
| Human decision needed | What requires Yasu approval before moving further? | Adoption Matrix v1(staging/adoption_matrix_v1.md)+ 本 §8 |

---

## 4. Sample Output Tables(4 種、ヤス指定列要件遵守)

### 4-A. Capability / Feature Inventory Table

```yaml
capability_id: <例: cap-mcp-capability-registry-v1>
capability_name: <例: MCP capability_registry server (4 tools, triparty query)>
source_repo: ProjectRX | record-x-commander | record-x-supervisor | ProjectRX_HQ/wt_common | recordx-strategy-lab
source_file: <例: ProjectRX/.../mcp/capability_registry/server.ts>
related_ticket: DO-CP-101
related_completion_report: <例: factory/completion_reports/DO-CP-101.json>
current_status: active | deprecated | superseded | unknown
evidence_path: <例: PR #1453 merged 2026-05-07T12:19:03Z>
last_verified_at: <ISO8601>
mismatch_flag: 🟢 healthy | 🟡 needs_verify | 🔴 unverified
notes: <例: ticket_id_mapping 旧 ID DO-CP-043 → 101 適用済>
```

#### Sample 行(本日確証データから)

| capability_id | capability_name | source_repo | related_ticket | current_status | mismatch_flag |
|---|---|---|---|---|---|
| cap-mcp-cap-reg-v1 | MCP capability_registry server | ProjectRX | DO-CP-101 | active | 🟢 healthy |
| cap-mcp-evt-search-v1 | MCP evt_search server | ProjectRX | DO-CP-102 | active | 🟢 healthy |
| cap-mcp-handoff-summary-v1 | MCP handoff_summary server | ProjectRX | DO-CP-103 | active | 🟢 healthy |
| cap-fast-gate-measurement | fast-gate effect measurement(49% 削減) | ProjectRX | DO-CP-104 | active | 🟢 healthy |
| cap-twin-pr-measurement | twin PR merge-queue effect(74%) | ProjectRX | DO-CP-105 | active | 🟢 healthy |
| cap-stage-0-mirror-path | supervisor outbox → commander inbox 配送経路 | record-x-supervisor + commander | (装置、ticket 不対応) | active | 🟢 healthy(v1.2 確証) |
| cap-evt-120-block-axis-b | factory PreToolUse hook(自前採番物理 block) | ProjectRX_HQ/wt_common | DO-FACTORY-233(REVISE) | unverified | 🔴(Y4-B v4 staging 未採否) |

### 4-B. Ticket Pipeline Table

```yaml
ticket_id: <例: DO-COMMON-W2-007>
commander_status: tickets_issued/active | tickets_completed | tickets_draft | absent
factory_status: wt_common/tickets present | absent | superseded
supervisor_status: referenced | unreferenced
completion_report_status: factory generated | commander pulled | absent
dashboard_visibility: visible | hidden | not_yet_modeled
mismatch_type: <§4-D の 10 分類のいずれか or none>
next_required_action: <例: housekeeping-D に含めて completed 移動>
approval_required: ヤス | 司令官 α | none(運用整流)
```

#### Sample 行(本日確証データから)

| ticket_id | commander | factory | completion_report | mismatch_type | next_action |
|---|---|---|---|---|---|
| DO-COMMON-W2-007 | active(残存) | merged | factory generated | retention_policy_mismatch | housekeeping-D 経由 completed 移動 |
| DO-CP-038 | active(残存) | merged(PR #1457) | factory generated | retention_policy_mismatch | 同上 |
| DO-COMMON-HOUSEKEEPING-D | absent | merged(PR #1464) | factory generated | scope_mismatch + 自前採番(EVT-120 第 9) | ticket_id_mapping §3 拡張 |
| DO-CP-043(MCP) | tickets_completed/(rerouted) | (旧 ID は ProjectRX で別実装)| (両系統あり) | naming_variant(改番 → 101) | mapping 適用済 |
| G-009 〜 G-012 | active(blocked) | absent | absent | scope_mismatch(三者協議議事録 v1.0 不在) | 議事録起案後 |

### 4-C. Completion Report Reconciliation Table

```yaml
report_id: <例: completion_report_DO-COMMON-W2-007.json>
origin_repo: ProjectRX | wt_common | commander | supervisor | external
expected_destination: HQ staging/completion_reports/ | commander/completion_reports/ | etc
actual_location: <現実 path>
processed_or_pending: processed | pending | absent
mapped_ticket: <ticket_id>
mapped_capability: <capability_id>
mismatch_type: <§4-D 10 分類>
verified_result: 🟢 verified | 🟡 partial | 🔴 unverified
```

#### Sample 行

| report_id | origin | expected | actual | processed | mapped_ticket | mismatch | verified |
|---|---|---|---|---|---|---|---|
| DO-COMMON-W2-007 | wt_common | HQ staging | wt_common 直 | pending | W2-007 | retention(HQ staging 不在) | 🟡 partial |
| DO-CODEX-MIG-001 | ProjectRX(自前) | (commander 起案不在) | wt_common | absent | (mapping なし) | unverified_external_claim | 🔴 unverified |
| DO-CP-101 | wt_common | HQ staging | wt_common 直 | pending | DO-CP-101 | retention | 🟡 partial |
| (45 件不在) | (因子 PR merged) | HQ staging | absent | absent | (各 ticket) | missing_completion_report | 🔴 unverified |

### 4-D. Pipeline Error Classification Table(ヤス指定 10 分類)

| Class | 定義 | 検出ルール | 例 |
|---|---|---|---|
| **true_delivery_failure** | 配送経路自体の故障 | 期待経路 + 命名規則 + retention 整合チェック後も不在 | 現状 0 件(v1.2 確証) |
| **counting_method_mismatch** | 集計対象範囲の差異 | total - 期待 vs 全 path 合計 不一致 | diff 126 → 真 0(完了/未集計) |
| **retention_policy_mismatch** | 保持・削除ポリシー差 | supervisor 累積 vs commander rolling | A-line outbox 旧形式残存 |
| **naming_variant** | 同一実体・別命名 | rename / suffix / 改番 mapping 一致 | DO-CP-043 → 101、ROOT_VARIANT |
| **scope_mismatch** | 配送対象 scope 差 | A-line vs B-line vs 内部 monitoring | 2026-05-03 B-line outbox |
| **stale_status** | 状態更新ラグ | last_verified_at が threshold 超過 | DO-COMMON 53 active 大半が既 merged |
| **missing_completion_report** | 完遂証跡欠落 | PR merged + completion_report 不在 | 45 件 HQ staging 不在 |
| **duplicate_completion_report** | 同 ticket 複数 report | hash_chain mismatch | (将来検出) |
| **unverified_external_claim** | 自前採番疑い | commander SSOT 不在 + ProjectRX merged | EVT-120 累積 9 系列 |
| **unknown** | 上記いずれにも該当しない | デフォルト分類 | 詳細調査要 |

---

## 5. Data Source Candidates(read-only inventory 構築の証跡源)

| Data Source | path | role |
|---|---|---|
| supervisor outbox 累計 | `record-x-supervisor/outbox/*.md` | A-line/B-line 起案累計 |
| commander tickets_issued/active | `record-x-commander/strategy/tickets_issued/active/*.md` | active SSOT |
| commander tickets_completed | `record-x-commander/strategy/tickets_completed/**` | completed SSOT |
| commander tickets_draft | `record-x-commander/strategy/tickets_draft/**` | draft 段階 |
| commander completion_reports | `record-x-commander/sync/completion_reports/` | pulled 結果(現状 28 件 DO-COMMON) |
| factory completion_reports | `ProjectRX_HQ/wt_common/completion_reports/` | factory 生成済 |
| HQ staging/completion_reports/ | `ProjectRX_HQ/staging/completion_reports/` | 流入経路(現状不在 = 上流装置欠落) |
| ProjectRX merged PR | `gh pr list --state merged --search "DO- in:title"` | 物理証跡 |
| ticket_id_mapping.md | `record-x-commander/strategy/ticket_id_mapping.md` | mapping SSOT(DO-COMMANDER-051 起案済) |
| Stage 0 Mirror Note | `record-x-supervisor/staging/stage_0_mirror_reconciliation_note_v1.md` v1.2 | 直近 reconciliation |
| EVT 系列 | `record-x-supervisor/archive/error_patterns.md` §6-J(EVT-117/118/119/120/121) | 系列認識 |
| Strategy Lab DP-001 | `recordx-strategy-lab/04_decision_packets/DP-001*.md` | research 経路 |
| FACTORY_CAPABILITIES.yaml | `ProjectRX_HQ/wt_common/.../FACTORY_CAPABILITIES.yaml`(DO-FACTORY-172 merged)| 14 devices 既登録 |
| MCP capability_registry | dashboard 経由 query(DO-CP-101 既稼働)| 将来 SSOT 候補 |

= **既存装置で全 inventory 構築可能**(新規 装置追加不要、read-only query のみ)

---

## 6. Mismatch Taxonomy(§4-D 完全版、10 分類)

§4-D を Reconciliation 時の **必須分類規律** として固定。

### 6-A. 検出フロー(Phase 1 sample 段階運用想定)

```
[各 ticket / capability / completion_report について]
  1. 期待 inventory 表(§4-A〜C)に存在するか
  2. 実 source data から query
  3. mismatch 検出時 = §4-D 10 分類のいずれかに必ず分類
  4. 分類不能 = unknown(分類確証 後に再 query)
  5. true_delivery_failure 認定は 9 分類すべて除外後のみ(浅薄断定防止、Stage 0 v1.2 教訓反映)
```

### 6-B. 分類優先順(誤認防止)

```
unverified_external_claim(EVT-120 系列、優先検出)
  ↓
naming_variant(mapping 適用)
  ↓
scope_mismatch(A/B-line + 別経路)
  ↓
retention_policy_mismatch(累積 vs rolling)
  ↓
counting_method_mismatch(集計対象範囲)
  ↓
stale_status(更新ラグ)
  ↓
missing_completion_report(証跡欠落)
  ↓
duplicate_completion_report(複数 report)
  ↓
true_delivery_failure(最終認定、上記 9 すべて除外後のみ)
  ↓
unknown(詳細調査要)
```

= **true_delivery_failure 認定は最後**(浅薄断定防止 = Stage 0 Mirror v1.2 教訓物理装置化)

---

## 7. Hook/Skill-First Path vs Dashboard/Inventory-First Path(ヤス §7 要請)

| 観点 | hook/skill-first | dashboard/inventory-first |
|---|---|---|
| **error discovery ability** | event-driven、特定 trigger でのみ発火 | 包括的 query、全 inventory 横断観測 |
| **false-positive risk** | 高(個別 hook 設計の誤判定リスク、初版から FP review 必要)| 低(read-only 観測、判定は別段階で人間 + 規律) |
| **maintenance burden** | 高(各 hook 個別保守 + version 管理 + rollback 経路)| 中(SSOT 経路改修中心、装置数増加少)|
| **cross-repo boundary risk** | 高(各 hook 配備時に boundary 違反疑い再検証必要)| 低(read-only 横断、boundary 違反なし)|
| **human readability** | 低(hook 内 logic 個別 / log 散逸)| 高(table 形式 + axes 明示 + ヤス検証可能) |
| **suitability for staged adoption** | 中(hook 単独段階運用は可、ただし装置間整合性管理コスト高)| 高(staging → sample → pilot → enforce 各段階 read-only で検証可) |
| **EVT-121 治療への直接性** | 部分的(個別 hook = 個別 trigger、横断観測装置不在の根治にならず) | **直接的**(横断 inventory = ヤス仮説「観測装置不在」物理装置化主軸) |
| **Stage 0 Mirror v1.2 教訓反映** | 弱い(浅薄断定防止規律は別途必要)| 強い(mismatch taxonomy + 分類優先順 = 三段階浅薄反復防止) |

### 7-A. 結論(本 v0.1 提案)

**dashboard/inventory-first 採択推奨**:
- hook/skill は **dashboard で観測されたギャップから derive**(プライマリではない)
- EVT-121 reframe(cross-pipeline observability deficiency)への直接治療
- Stage 0 v1.2 教訓(浅薄断定防止)の物理装置化

**hook/skill-first は補完段階**(将来):
- dashboard で **明確 + 反復 + 構造的** な gap が確認された後、その gap への対症装置として derive
- 例:`unverified_external_claim` 系列が **dashboard で常時観測** + **反復継続発火** が確証された後、軸 B PreToolUse hook を pilot 投入(現 Y4-B v4 staging を再評価)

---

## 8. Adoption Path(staging → sample → pilot → enforce)

### 8-A. 段階定義(Adoption Matrix v1 同期)

| 段階 | 内容 |
|---|---|
| staging | 設計案配置のみ、実装/配備/運用なし(本 v0.1 = この段階) |
| sample | inventory query script による sample table 生成(read-only)+ ヤス検証 |
| pilot | sample table を週次/必要時生成 + 監督官手動レビュー + 限定的 commander 配信(任意) |
| enforce | 全完了報告に inventory snapshot 添付 + dashboard UI 連動(DP-001 C-2 採択前提) |

### 8-B. Phase 別計画

| Phase | 内容 | 装置数 | ヤス採否 |
|---|---|---|---|
| Phase 0(本 v0.1) | staging 設計、テーブル形式 + axes + taxonomy 定義 | ±0 | 本提案 |
| Phase 1 | sample inventory query script 起案(staging、実装は別採否) | ±0(設計のみ) | sample 移行採否 |
| Phase 2 | sample script 実装(supervisor scripts/observability/ 配下、read-only)| +1 | 別採否 |
| Phase 3 | pilot 運用(週次 / 必要時、監督官 footer 添付候補) | ±0(運用) | pilot 採否 |
| Phase 4 | DP-001 C-3 連動(dashboard UI、現状 C-2/C-3 not_approved)| ±0(既存統合) | DP-001 C-2/C-3 ヤス採否(本提案 scope 外) |
| Phase 5(将来) | enforce + hook/skill derive(dashboard 観測 gap から)| 装置別 | 個別採否 |

= **本 v0.1 = Phase 0 staging のみ**、Phase 1 以降は ヤス段階採否経路

---

## 9. Items Requiring Yasu Approval(明示一覧)

| # | 採否事項 | 緊急度 | 状態 |
|---|---|---|---|
| 1 | 本 v0.1 staging review(本提案、design accept)| - | 🔴 本サイクル次決定 scope |
| 2 | Phase 1 sample inventory query script 起案 | - | 🟡 v0.1 採択後 |
| 3 | Phase 2 script 実装(supervisor scripts/ 配置)| - | 🟡 sample 検証後 |
| 4 | Phase 3 pilot 運用(週次 / footer 統合)| - | 🟡 sample 安定後 |
| 5 | Phase 4 DP-001 C-3 連動 | - | 🔴 DP-001 C-2/C-3 ヤス採否前提(本提案 scope 外) |
| 6 | Phase 5 hook/skill derive(dashboard gap から)| - | 🔴 dashboard 反復観測後 |
| 7 | mismatch taxonomy 10 分類 規律化 | - | 🟡 v0.1 採択時に文書規律統合 |
| 8 | true_delivery_failure 認定規律(9 分類除外後のみ)| - | 🟡 同上(浅薄断定防止規律) |

---

## 10. Boundary Conditions 遵守(ヤス §6)

| 制約 | 遵守 |
|---|---|
| Do not approve DP-001 C-2/C-3/C-4 | ✅(本提案は Phase 4 で C-3 連動を「将来候補」とのみ言及、approve せず)|
| Do not implement dashboard UI | ✅(本提案は read-only design + sample tables のみ、UI 実装なし)|
| Do not issue Commander tickets | ✅(commander 起案は将来 Phase の範囲、本提案で起案なし)|
| Do not instruct Factory | ✅(factory 直接指示なし、関係性ポリシー §3.2 遵守)|
| Do not add hooks or skills in this cycle | ✅(本提案は dashboard/inventory-first、hook/skill は将来 derive 候補)|
| Read-only and evidence-index based | ✅(全 inventory query は read-only、装置追加なし)|
| Separate from DO-FACTORY-233 and G-009-012 | ✅(本提案は EVT-121 reframe 対応、DO-FACTORY-233 + G-009-012 は別ライン)|
| Dashboard-first ≠ write operations | ✅(write 操作含まず、UI 実装含まず) |

---

## 11. 関連既存 staging との関係

| staging file | 関係 |
|---|---|
| `staging/stage_0_mirror_reconciliation_note_v1.md` v1.2 | 本 v0.1 の真因分析の入力(reframe 起源) |
| `staging/adoption_matrix_v1.md` | 本 v0.1 と同期(adoption phase 定義共通) |
| `staging/evt_121_revised_staging_pack_v2.md` | hook/skill-first 経路、本 v0.1 で **dashboard-first を優先** に方針転換、v2 pack は将来 derive 候補として保持 |
| `staging/supervisor_hook_skill_proposal_policy_v1.md` | Hook/Skill Proposal Policy = dashboard 観測 gap 検出後の derive 規律として継続適用 |
| `staging/y4_b_pretooluse_hook_v4.md` | dashboard 観測で `unverified_external_claim` 反復継続発火確証後に再評価候補(現状は staging 継続)|

---

## 12. 改訂履歴

- v0.1(2026-05-08 朝中盤後末末末末末):初版起案、ヤス方向転換「hook/skill-first → dashboard/inventory-first、Stage 0 v1.2 reviewed = true delivery failure 0、EVT-121 reframe to cross-pipeline observability + inventory deficiency」契機。9 セクション(problem + interpretation + axes 8 + sample tables 4 + data sources + mismatch taxonomy 10 + adoption path 5 phase + Yasu approval items 8 + hook vs dashboard 比較 + boundary 遵守)+ Stage 0 v1.2 教訓反映(true_delivery_failure 認定は 9 分類除外後のみ)+ 既存 staging 5 件との関係明示 統合。

---

*監督官 A EVT-121 Dashboard / Inventory Observability Model v0.1(staging、ヤス方向転換採択、read-only design、実装なし、dashboard UI なし)*
*「hook/skill-first → dashboard/inventory-first 方針転換 + Stage 0 v1.2 reviewed + EVT-121 reframe + 8 axes + 4 sample tables + 10 mismatch taxonomy + adoption staged + Yasu approval items 明示」*
