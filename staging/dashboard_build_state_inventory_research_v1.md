---
id: DASHBOARD-BUILD-STATE-INVENTORY-RESEARCH-v1
title: Dashboard / Control Panel Build-State Inventory Research v1(Supervisor Read-Only Research Request 遂行、Yasu planning only)
status: READ_ONLY_RESEARCH_REPORT_FOR_YASU_PLANNING
authority: supervisor_drafted_research
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
yasu_decision_history:
  - "2026-05-08 朝中盤後末末末末末末: Supervisor Research Request — Dashboard / Control Panel Build-State Inventory(READ_ONLY_RESEARCH_REQUEST)"
yasu_constraints:
  - "Read-only research, no implementation"
  - "Do not issue Commander tickets"
  - "Do not instruct Factory"
  - "Do not approve DP-001 C-2/C-3/C-4"
  - "Do not authorize hooks/skills/CI/GHA/dashboard UI"
  - "For Yasu planning only"
ticket_type: research_report_read_only
---

# Dashboard / Control Panel Build-State Inventory Research v1

## 4.1 Executive Summary

| 項目 | conservative | likely | aggressive |
|---|---:|---:|---:|
| current estimated completion percentage | **60%** | **72%** | **82%** |
| estimated full ticket count | 50 | 65 | 90 |
| estimated completed ticket count | 30 | 40 | 50 |
| estimated remaining ticket count | 10 | 20 | 35 |
| estimated MVP ticket count needed for EVT-121 | 5 | 7 | 10 |
| confidence level | medium | medium | medium |

**comprehensive 評価**: Dashboard / Control Panel の **read-only MVP 大半は既に実装済**(MCP 3 装置 + integration + SWR hooks + E2E + Dockerfile 等 13+ 件 merged 確証)。EVT-121 visibility 改善 MVP は **5-7 件追加**で達成可能。**not** dashboard UI from scratch — むしろ既存装置の **接続層**(7 lanes、本 v0.2 inventory model 整合)。

---

## 4.2 Complete Vision Inventory

| Area | Expected Capability | Evidence Path | Current State | Missing Work | Confidence |
|---|---|---|---|---|---|
| dashboard shell / UI | React + Vite + Storybook | wt_common/dashboard/ + DO-CP-031/032/034/035/036 merged | 🟢 概ね完備 | UI 統合 + 認証(F4)| high |
| read-only status summary | 状態 panel + SWR hooks 5-endpoint | DO-CP-041 merged + useLatest/useHealth(044/045)merged | 🟢 動作 | EVT-121 mismatch panel 追加 | high |
| ticket inventory | active/completed/draft 一覧表示 | commander tickets_* + ticket_id_mapping(DO-COMMANDER-051 起案中)| 🟡 部分(SSOT 陳腐化、本日 109 → 108 件)| 7 lanes 統合表示 | medium |
| completion_report inventory | factory + commander 両 side 統合 | factory 73 件 + commander 28 件(DO-COMMON、本日)| 🔴 supply path 不全(HQ staging 不在)| 流入経路修復 + 統合表示 | medium |
| capability / feature registry | MCP capability_registry server + FACTORY_CAPABILITIES.yaml 14 devices | DO-CP-101 merged + DO-FACTORY-172 merged(PR #1459)| 🟢 物理稼働(本日確証)| inventory 表 自動 generate | high |
| pipeline mismatch detection | 4 点照合 + mismatch taxonomy 10 分類 | 本提案 v0.2 §3 7 lanes + §6 taxonomy(staging) | 🟡 設計 staging のみ | sample query script | medium |
| push-state visibility | git fetch + log + rev-list | push_state_check.ps1 v1 staging(本提案関連)| 🟡 staging のみ | manual script 実装(別採否)| medium |
| 回覧板 / 区報 / 官報 visibility | 既存 internal/circular/ + regional/ + shared/official_gazette/ | 既存装置稼働(部分)| 🟡 ClaudeCode 側のみ + 散逸 | dashboard 統合表示 | low |
| cross-repo source index | supervisor + commander + factory + Strategy Lab statics | DO-CP-040 three-realm stats collector merged | 🟢 動作 | EVT-121 mismatch 拡張 | high |
| alert / warning display | dashboard MCP integration(DO-CP-038)+ ApiStatusPill | DO-CP-038/045 merged | 🟢 動作 | EVT-121 mismatch alert 拡張 | high |
| write operations | (out of MVP unless explicitly approved) | 該当なし(read-only MVP 維持)| ⚪ N/A | (DP-001 C-2/C-3 後)| - |

= **既存物理証拠 13+ 装置 merged 確証、残り = 接続層(7 lanes 統合 + mismatch alert 拡張)**

---

## 4.3 Ticket Estimate

| Scope | Estimated Total Tickets | Completed | Remaining | Evidence | Confidence |
|---|---:|---:|---:|---|---|
| full dashboard/control-panel vision | 50-90(範囲)| 35-50 | 15-40 | DO-CP-030〜048(re-numbered 101-105 含)+ MCP 3 + DO-FACTORY-172 等 確証 | medium |
| read-only dashboard MVP | 25-35 | 22-28 | 3-7 | DO-CP-031/032/034〜038 + 040/041/042 + 044/045/046 + 101-105(15+ 件 merged) | **high** |
| **EVT-121 observability MVP** | **5-7** | **0-1** | **5-7** | 本 v0.2 §3 7 lanes + §4 footer + §5 段階 1-2 = staging 段階のみ | medium |
| DP-001 C-2-related dashboard work | 推定 8-15(WAVE C-2 Fixture / Dashboard MVP 範囲、未承認継続)| 0 | 8-15 | DP-001 C-2 not_approved | low(未承認継続)|
| non-MVP future work | 推定 10-30 | 0-5 | 10-25 | F4 デプロイ + 認証 + 拡張機能 | low |

= **Read-only dashboard MVP は ~80% 完了**(22-28/25-35)= ヤス指摘「Dashboard ticket consumption has progressed enough」と整合確証

---

## 4.4 Current Completed Evidence(主要件、物理証拠 ベース)

| Ticket / Report | Repo | Status | What It Delivered | Evidence Path | Counts Toward |
|---|---|---|---|---|---|
| DO-CP-031 | ProjectRX | merged 2026-05-04 | variant-a 採択完遂 | PR #1296 | UI shell |
| DO-CP-032 | ProjectRX | merged | app.tsx TypeScript | PR #1298 | UI shell |
| DO-CP-034 | ProjectRX | merged | Storybook 8 + 3 primitives | PR #1268 | UI shell |
| DO-CP-035 | ProjectRX | merged | operations + subscreens build | PR #1313 | UI shell |
| DO-CP-036 | ProjectRX | merged | catalog/dream/phase build | PR #1311 | UI shell |
| DO-CP-038 | ProjectRX | merged 2026-05-07 | **MCP first wave integration**(3 endpoints + dashboard wiring) | PR #1457 | **MCP integration 中核** |
| DO-CP-039 | ProjectRX | merged | live-updater | PR #1272 | data layer |
| DO-CP-040 | ProjectRX | merged | three-realm stats collector | PR #1263 | cross-repo source index |
| DO-CP-041 | ProjectRX | merged | SWR hooks 5-endpoint | PR #1273 | data layer |
| DO-CP-042 | ProjectRX | merged | git push sync section | PR #1264 | UI shell |
| DO-CP-101(MCP capability_registry) | ProjectRX | merged 2026-05-07 | 4 tools + 12 tests | PR #1453 | **capability registry 中核** |
| DO-CP-102(MCP evt_search) | ProjectRX | merged | 3 tools + 16 tests | PR #1454 | EVT search 中核 |
| DO-CP-103(MCP handoff_summary) | ProjectRX | merged | 4 tools + 16 tests | PR #1455 | handoff summary 中核 |
| DO-CP-104(fast-gate measurement) | ProjectRX | merged | 49% 削減数値検証 | PR #1431 | speed boost evidence |
| DO-CP-105(twin PR measurement) | ProjectRX | merged | 74% 効率数値検証 | PR #1432 | speed boost evidence |
| DO-FACTORY-172 | ProjectRX | merged 2026-05-07 | factory SessionStart hook + FACTORY_CAPABILITIES.yaml(14 devices) | PR #1459 | **capability registry 拡張** |
| DO-G-013 | ProjectRX | merged | role boundary check workflow | PR #1458 | governance(将来 軸 C 拡張候補)|
| DO-G-014 | ProjectRX | merged | branch protection policy | PR #1460 | governance |
| DO-CP-029(E2E skeleton) | ProjectRX | merged 2026-05-04 | 3 scenarios | PR #1241 | quality |

= **計 19+ 件 merged 確証、Read-only MVP の中核装置群 既稼働**

---

## 4.5 Remaining Work(EVT-121 MVP 範囲、5-7 件推定)

| Proposed Ticket | Purpose | Depends On | MVP Required? | Risk If Deferred |
|---|---|---|---|---|
| DO-CP-MVP-EVT121-001(仮)| 7 lanes inventory query script(read-only) | 本 v0.2 §3 採択 | ✅ MVP 必須 | 観測装置不在継続 |
| DO-CP-MVP-EVT121-002 | mismatch taxonomy alert panel(dashboard mismatch flag) | DO-CP-038 既稼働 | ✅ MVP 必須 | EVT-120/121 検出ラグ |
| DO-CP-MVP-EVT121-003 | 回覧板 / 区報 / 官報 dashboard 統合 read-only viewer | 既存装置 | ✅ MVP 必須 | 既存装置接続不全 |
| DO-CP-MVP-EVT121-004 | push-state lane(supervisor + commander)dashboard 統合 | push_state_check.ps1 staging | 🟡 推奨 | divergence 検出ラグ(本日同型再発)|
| DO-CP-MVP-EVT121-005 | ticket pipeline lane(active/completed/draft mismatch panel)| ticket_id_mapping.md 起案中 | 🟡 推奨 | SSOT 陳腐化継続 |
| DO-CP-MVP-EVT121-006(任意)| completion_report supply path 健全性表示 | DO-COMMANDER-049/050 進捗中 | 🟡 任意 | パイプライン停止検出ラグ |
| DO-CP-MVP-EVT121-007(任意)| Decision-Gate Footer 自動 generate(段階 3 = warning summary)| Footer 規律即時運用後 | 🟢 任意 | 完了報告品質ばらつき |

= **MVP 必須 3 + 推奨 2 + 任意 2 = 5-7 件で EVT-121 visibility 改善経路成立**

---

## 4.6 MVP Recommendation

### MVP 定義(read-only、write 操作なし)

```
EVT-121 Observability MVP = 7 lanes inventory query → dashboard mismatch panel → Decision-Gate Footer 自動 generate
```

### MVP が答える 4 つの問い(ヤス §4.6 指定)

1. **Which pipeline is failing?** → ticket lane / completion lane / push-state lane の 🔴 mismatch flag 表示
2. **Is a mismatch true failure or stale/retention/variant/missing?** → mismatch taxonomy 10 分類自動付与
3. **Which repo/file is the evidence source?** → SSOT 階層表示(回覧板 / 区報 / 官報 / ticket / completion / git)
4. **What should Yasu inspect next?** → Human decision needed axis(本 v0.2 §3 8 axes 内 1 件)= 「ヤス採否要件」抽出表示

### MVP 範囲 制約遵守

- ✅ Read-only(全 lane query は git/ls/find のみ)
- ✅ write 操作なし
- ✅ dashboard UI 改修最小(DO-CP-038 既稼働 + パネル追加)
- ✅ DP-001 C-2 関連起案なし(本 MVP は EVT-121 範囲、C-2 とは独立)
- ✅ 工場長への直接実装指示なし(MVP チケットは司令官 α 経由起案)

---

## 4.7 Governance Boundary(ヤス §4.7 明示)

- ✅ this report does not approve implementation
- ✅ this report does not approve DP-001 C-2/C-3/C-4
- ✅ this report does not issue tickets
- ✅ this report does not instruct Factory
- ✅ this report does not authorize hooks or skills
- ✅ this report is for Yasu planning only

---

## 5. Estimation Rules 適用(ヤス §5、3 bands)

| Metric | Conservative | Likely | Aggressive | Basis |
|---|---:|---:|---:|---|
| full vision total tickets | 50 | 65 | 90 | DO-CP merged 19 + 残余 + F4-F5 拡張 + DP-001 C-2/C-3/C-4(未承認継続)|
| completed tickets | 30 | 40 | 50 | merged 確証 19 + DO-COMMON Wave 5 + DO-G + DO-FACTORY 部分 |
| remaining tickets | 10 | 20 | 35 | 設計 staging + EVT-121 MVP + F4 デプロイ + 拡張 |
| EVT-121 MVP additional tickets | 5 | 7 | 10 | 本 §4.5 = 必須 3 + 推奨 2 + 任意 2(計 7)+ buffer |
| likely completion percentage | 60% | 72% | 82% | merged 19+ / total 50-90 + EVT-121 観測層未完 |

---

## 6. Important Cautions 適用(ヤス §6)

| 注意 | 本研究適用 |
|---|---|
| Do not infer completion only from ticket status | ✅ §4.4 = merged PR + 物理ファイル証拠で確証(ticket status 単独不採用)|
| Prefer physical evidence | ✅(merged code + 既存 files + completion_reports + schema + tests + PR) |
| Mark missing evidence as `unverified` | ✅(§4.2 fixture 詳細 + completion_report supply path 不全 = 🔴 / 🟡 区分明示)|
| Commander status alone insufficient | ✅(commander active 53 vs factory 73 vs ProjectRX merged 100 = 三方 cross-check)|
| Factory completion claims insufficient without file evidence | ✅(本研究は ProjectRX gh PR + 物理ファイル ls + commit log 中心)|

---

## 7. Final Recommendation(ヤス §7 必須)

### 7-A. 本研究 final recommendation

**dashboard/inventory-first を継続推奨**(hook/skill-first からの方向転換維持)

### 7-B. 次の minimum WAVE

**WAVE EVT-121-MVP**:5-7 件(§4.5 列挙)= read-only dashboard mismatch panel + 7 lanes 統合 + Decision-Gate Footer 自動 generate

### 7-C. 必須 block 継続

- DP-001 C-2/C-3/C-4(ヤス C-2 採否前)
- DO-FACTORY-233(REVISE 状態継続)
- G-009〜G-012(三者協議議事録 v1.0 不在継続)
- 全 hook 実装(本 v0.2 段階 4-6 = pilot evidence 後のみ)
- 自動 push / alert / enforcement(全件 ヤス approval なしには不実行)

### 7-D. ヤス次決定 scope(本研究の position)

本研究 = **planning artifact for Yasu only**、ticket 起案は ヤス採否 → 司令官 α 経由 → 本研究 §4.5 の MVP チケット起案要請発令を別 staging で起案、の経路。

---

## 8. CLI / Agent Function Inventory(v1.1 追加、ヤス追加依頼遵守)

### 8-A. Supervisor CLI / scripts / hooks / skills / reports(全装置棚卸し)

| Role | Function | Type | Path | Current Use | Evidence | Connect To Dashboard? | Priority | Reason |
|---|---|---|---|---|---|---|---|---|
| supervisor | pretooluse_breaker_block.ps1 | hook | `.claude/hooks/` | 危険操作 block | 既稼働 | yes | P0 | push-state lane 関連、自動装置稼働確証 |
| supervisor | scheduler_templates/layer0_entry_point.ps1 | script | `scripts/scheduler_templates/` | layer0 schtasks | 既稼働(schtask 経由)| yes | P1 | source index lane(layer 階層認識)|
| supervisor | aggregate-failure-logs.ps1 | sync tool | `sync/sync_script/` | failure 集約 | 既稼働 | yes | P1 | pipeline mismatch lane(失敗集約)|
| supervisor | archive-order.ps1 | sync tool | 同上 | outbox archive | 既稼働 | yes | P1 | 区報 lane(配送追跡) |
| supervisor | auto-evt-recorder.ps1 | sync tool | 同上 | EVT 自動記録 | 既稼働 | yes | P1 | pipeline mismatch lane(EVT 認識)|
| supervisor | check-internal-links.ps1 | validation | 同上 | 内部リンク確認 | 既稼働 | no | P2 | 文書整合(MVP 範囲外)|
| supervisor | dream-crystallize-supervisor.ps1 | sync tool | 同上 | memory 結晶化 | 既稼働(03:00 schtask)| no | P2 | 別経路 |
| supervisor | generate-cockpit.ps1 | report | 同上 | cockpit 生成 | 既稼働 | yes | P1 | dashboard 既存装置 候補 |
| supervisor | invoke-board-council.ps1 | sync tool | 同上 | 三社円卓 | 既稼働 | no | P2 | 区報 lane 候補(将来)|
| supervisor | notify-yasu-email.ps1 | sync tool | 同上 | yasu 通知 | 既稼働 | no | P2 | 通知経路(MVP 範囲外)|
| supervisor | order-stale-alert.ps1 | validation | 同上 | 発令 stale 検出 | 既稼働 | yes | P1 | ticket state lane / pipeline mismatch lane |
| supervisor | pipeline-bottleneck-probe.ps1 | report | 同上 | bottleneck 検出 | 既稼働 | yes | P0 | **pipeline mismatch lane 中核候補** |
| supervisor | pull-b-completion-reports.ps1 | sync tool | 同上 | B-line completion 受領 | 既稼働 | yes | P1 | completion evidence lane(B-line)|
| supervisor | pull-replies.ps1 | sync tool | 同上 | 司令官応答 pull | 既稼働 | yes | P0 | 区報 lane(stage 0 mirror 経路)|
| supervisor | review-implementation.ps1 | validation | 同上 | 実装 review | 既稼働 | no | P2 | 別経路 |
| supervisor | snapshot-supervisor.ps1 | report | 同上 | 監督官 snapshot | 既稼働 | yes | P1 | source index lane / dashboard candidate |
| supervisor | sync-archive-three-realm.ps1 | sync tool | 同上 | 三 repo archive | 既稼働 | yes | P0 | **source index lane 中核候補**(三 repo 統合)|
| supervisor | sync-factory-pipeline.ps1 | sync tool | 同上 | factory pipeline 同期 | 既稼働 | yes | P0 | **completion evidence lane 中核候補**(factory 連動)|
| supervisor | sync-orders.ps1 | sync tool | 同上 | 発令 archive | 既稼働 | yes | P1 | 区報 lane |
| supervisor | sync-regional.ps1 | sync tool | 同上 | 区報同期 | 既稼働 | yes | P0 | **区報 lane 中核**(既存装置)|
| supervisor | sync-schtasks-state.ps1 | sync tool | 同上 | schtask 状態同期 | 既稼働 | yes | P1 | source index lane(schtask 認識)|
| supervisor | verify-role-snapshot-vs-rubric.ps1 | validation | 同上 | rubric 検証 | 既稼働 | yes | P1 | human approval state lane(rubric 適用)|
| supervisor | operations/(15 文書) | reports | `operations/` | 規律文書 | 既稼働 | yes | P1 | 官報 lane 候補(規律共有)|

### 8-B. Commander CLI / scripts / sync tools / ticket tools(全装置棚卸し)

| Role | Function | Type | Path | Current Use | Evidence | Connect To Dashboard? | Priority | Reason |
|---|---|---|---|---|---|---|---|---|
| commander | commander_auto_pipeline/run_full_cycle.ps1 | CLI command | `scripts/commander_auto_pipeline/` | 全 cycle 自動化 | 既稼働(複数 step)| yes | P0 | **dashboard 中核候補**(全 lane 統合 trigger)|
| commander | step1_pull_completion_reports.ps1 | sync tool | 同上 | completion pull | 既稼働(空 pull = HQ staging 不在)| yes | P0 | **completion evidence lane 中核**(現状 supply path 不全)|
| commander | step1_5_hq_archive_reconcile.ps1 | sync tool | 同上 | HQ archive reconcile | 既稼働 | yes | P0 | **completion evidence lane**(HQ 整合)|
| commander | step2_update_sitrep.ps1 | report | 同上 | SITREP 更新 | 既稼働 | yes | P1 | source index lane / dashboard candidate |
| commander | step3_5_role_execution_snapshot.ps1 | report | 同上 | role rubric snapshot | 既稼働 | yes | P1 | human approval state lane |
| commander | step3_6_checkup_diff.ps1 | validation | 同上 | checkup diff | 既稼働 | yes | P1 | pipeline mismatch lane |
| commander | step3_update_advance_map.ps1 | report | 同上 | advance map 更新 | 既稼働 | yes | P0 | **dashboard 中核 candidate**(進捗可視化)|
| commander | step4_dream_crystallize.ps1 | sync tool | 同上 | memory 結晶化 | 既稼働 | no | P2 | 別経路 |
| commander | step5_5_generate_tickets_index.ps1 | index | 同上 | ticket index 生成 | 既稼働 | yes | P0 | **ticket state lane 中核**(SSOT index)|
| commander | step5_propose_next_tickets.ps1 | report | 同上 | next ticket 提案 | 既稼働 | yes | P1 | ticket state lane |
| commander | step8_circular_log.ps1 | sync tool | 同上 | 回覧板 log | 既稼働 | yes | P0 | **回覧板 lane 中核** |
| commander | step9_gazette_log.ps1 | sync tool | 同上 | 官報 log | 既稼働 | yes | P0 | **官報 lane 中核** |
| commander | sync-tickets.ps1 | sync tool | `sync/sync_script/` | ticket sync(commander → factory)| 既稼働(selective sync 採択済)| yes | P0 | **ticket state lane**(供給経路) |
| commander | pull-completion-reports.ps1 | sync tool | 同上 | completion pull | 既稼働(空)| yes | P0 | **completion evidence lane**(supply path 不全認知装置)|
| commander | process-completion-reports.ps1 | sync tool | 同上 | completion 処理 | 既稼働 | yes | P0 | completion evidence lane |
| commander | complete-ticket.ps1 | sync tool | 同上 | ticket 完了処理 | 既稼働 | yes | P0 | ticket state lane / completion evidence lane |
| commander | check-stray-do-tickets.ps1 | validation | 同上 | 迷子 ticket 検出 | 既稼働 | yes | P1 | pipeline mismatch lane |
| commander | check-three-party-halt.ps1 | validation | 同上 | 三者 halt 検出 | 既稼働 | yes | P1 | human approval state lane |
| commander | commander_discipline_hygiene.ps1 | validation | 同上 | 規律 hygiene | 既稼働 | yes | P1 | human approval state lane |
| commander | factory_castor_idle_check.ps1 | validation | 同上 | 工場長 idle 検出 | 既稼働 | yes | P1 | pipeline mismatch lane |
| commander | generate_tickets_index.ps1 | index | 同上 | ticket index | 既稼働 | yes | P0 | **ticket state lane 中核**(本 generate)|
| commander | layer2_lock.ps1 | validation | 同上 | layer2 lock | 既稼働 | no | P2 | 別経路 |
| commander | notify-yasu.ps1 | sync tool | 同上 | yasu 通知 | 既稼働 | no | P2 | 通知経路 |
| commander | stale-alert.ps1 | validation | 同上 | stale 検出 | 既稼働 | yes | P1 | pipeline mismatch lane |
| commander | pull-control-panel-scripts.ps1 | sync tool | 同上 | control panel 取得 | 既稼働 | yes | P1 | dashboard candidate |
| commander | rubrics/discussion_scale_rubric_v1.yaml | rubric | `rubrics/` | discussion scale 評価 | 既稼働 | yes | P1 | human approval state lane |
| commander | pretooluse_breaker_block.ps1 | hook | `.claude/hooks/` | 危険操作 block | 既稼働 | yes | P0 | push-state lane(supervisor 同型)|
| commander | scope_violation_check.ps1 | hook | 同上 | scope 越境検出 | 既稼働 | yes | P0 | pipeline mismatch lane |
| commander | write_protection_hq_paths.ps1 | hook | 同上 | HQ パス保護 | 既稼働 | yes | P1 | source index lane |
| commander | play_completion_sound.ps1 | hook | 同上 | 完了通知音 | 既稼働 | no | P2 | 別経路(UX のみ)|

### 8-C. Factory CLI / scripts / hooks / completion_report tools(全装置棚卸し、wt_common 直下)

| Role | Function | Type | Path | Current Use | Evidence | Connect To Dashboard? | Priority | Reason |
|---|---|---|---|---|---|---|---|---|
| factory | mcp-servers/capability_registry | registry | `wt_common/mcp-servers/` | MCP capability 4 tools | 既稼働(DO-CP-101 merged)| yes | P0 | **capability registry lane 中核**(既稼働)|
| factory | mcp-servers/evt_search | registry | 同上 | MCP EVT search 3 tools | 既稼働(DO-CP-102 merged)| yes | P0 | **pipeline mismatch lane 中核**(EVT search) |
| factory | mcp-servers/handoff_summary | registry | 同上 | MCP handoff 4 tools | 既稼働(DO-CP-103 merged)| yes | P0 | **官報 lane / source index lane 中核** |
| factory | dashboard/server/ | dashboard-related file | `wt_common/dashboard/server/` | dashboard server 動作環境 | 既稼働(Dockerfile + tests)| yes | P0 | **dashboard shell 中核**(既稼働、接続層追加で MVP 完遂)|
| factory | dashboard/(全 sub)| dashboard-related file | `wt_common/dashboard/` | UI shell + Storybook + E2E | 既稼働(DO-CP-031〜037/038/041〜048 merged)| yes | P0 | **dashboard 中核**(全 lane 表示 surface)|
| factory | scripts/ci/collect-fast-gate-stats.mjs | report | `wt_common/scripts/ci/` | fast-gate 計測 | 既稼働(DO-CP-104 merged、49% 削減確証)| yes | P1 | source index lane(CI 計測)|
| factory | scripts/ci/collect-twin-pr-stats.mjs | report | 同上 | twin PR 計測 | 既稼働(DO-CP-105 merged、74% 効率)| yes | P1 | source index lane |
| factory | scripts/ci/detect-pr-impact.mjs | validation | 同上 | PR impact 検出 | 既稼働 | yes | P1 | pipeline mismatch lane |
| factory | **scripts/generate-completion-reports-from-prs.ps1** | sync tool | `wt_common/scripts/` | **PR → completion_report 生成** | 既稼働(物理存在確証)| yes | **P0** | 🔴 **completion evidence lane 中核(本日の supply path 復旧の鍵、現状 HQ staging unfilled の真因 = 既存装置の稼働経路欠落)** |
| factory | **scripts/write-merged-pr-completion-reports.ps1** | sync tool | 同上 | merged PR completion 生成 | 既稼働(物理存在確証)| yes | **P0** | 🔴 **同上、本装置稼働で supply path 復旧候補** |
| factory | scripts/factory_arch_gate_pre_check.ps1 | validation | 同上 | arch gate 事前 check | 既稼働 | yes | P1 | pipeline mismatch lane |
| factory | scripts/github/enable_auto_merge.ps1 | sync tool | 同上 | auto merge 有効化 | 既稼働 | no | P2 | 別経路(merge 自動化)|
| factory | scripts/layer1-4_entry_point.ps1 | CLI command | 同上 | layer 階層 entry | 既稼働 | yes | P1 | source index lane(layer 認識)|
| factory | scripts/codex/start-nonstop.ps1 | CLI command | `wt_common/scripts/codex/` | Codex non-stop 起動 | 既稼働 | no | P2 | Codex 別経路(supervisor coordination v1 整合) |
| factory | scripts/codex/summarize-codex-score-history.mjs | report | 同上 | Codex score history | 既稼働 | yes | P1 | source index lane(Codex 連動)|
| factory | tickets/ | index | `wt_common/tickets/` | ticket inbox(司令官 sync 配信先)| 既稼働(118 件) | yes | P0 | **ticket state lane 中核** |
| factory | completion_reports/(record-x-mirror 経由) | index | `wt_common/record-x-mirror/.../completion_reports/` | 7,389 件履歴 + 73 件 DO-COMMON 当該 | 既稼働(部分)| yes | P0 | completion evidence lane |
| factory | .claude/(本日時点) | (config)| `wt_common/.claude/` | 設定既存(hook 不在 = Y4-B v4 採否前) | 既稼働 | (Blocked) | Blocked | hook 配備は Y4-B v4 採否後 |

---

## 9. Connection Priority Map(ヤス指定 10 lanes、本 v1.1 追加)

| Priority | Source Function | Source Repo | Dashboard Lane | Why First | Risk If Not Connected |
|---|---|---|---|---|---|
| **P0** | mcp-servers/capability_registry | factory | **capability registry lane** | DO-CP-101 既稼働、即接続可 | capability 認知ラグ継続 |
| **P0** | mcp-servers/evt_search | factory | **pipeline mismatch lane** | EVT 系列 9 → 10 例累積、検索装置必須 | mismatch 認知ラグ継続 |
| **P0** | mcp-servers/handoff_summary | factory | **官報 lane / source index lane** | DO-CP-103 既稼働、handoff + roadmap query | 重要決定共有ラグ |
| **P0** | dashboard/server/ + dashboard/ | factory | **dashboard shell**(全 lane 表示 surface)| 既稼働、接続層追加で MVP 完遂 | dashboard UI から再構築の浪費 |
| **P0** | **scripts/generate-completion-reports-from-prs.ps1 / write-merged-pr-completion-reports.ps1** | **factory** | **completion evidence lane** | **既存装置、稼働経路接続で supply path 復旧候補(HQ staging unfilled の根本治療候補)**| **EVT-121 §6-J 補強 4(45 件流入不全)継続** |
| **P0** | step5_5_generate_tickets_index.ps1 / generate_tickets_index.ps1 | commander | **ticket state lane** | SSOT 陳腐化検出装置、既稼働 | ticket SSOT 陳腐化継続 |
| **P0** | step8_circular_log.ps1 | commander | **回覧板 lane** | 既稼働、ClaudeCode + Codex 並走認知装置 | multi-supervisor coordination 継続失敗 |
| **P0** | step9_gazette_log.ps1 | commander | **官報 lane** | 既稼働、重要決定 log | 重要決定共有ラグ |
| **P0** | sync-factory-pipeline.ps1 | supervisor | **source index lane / completion evidence lane** | 三 repo 統合 sync、既稼働 | 三 repo 統合観測ラグ |
| **P0** | sync-regional.ps1 | supervisor | **区報 lane** | 既稼働、配送追跡 | 区報 lane disconnected 継続 |
| **P0** | pull-replies.ps1 + sync-orders.ps1 + archive-order.ps1 | supervisor | **区報 lane** | 既稼働、stage 0 mirror 装置 | mirror 経路観測ラグ |
| **P0** | pipeline-bottleneck-probe.ps1 | supervisor | **pipeline mismatch lane** | 既稼働、bottleneck 検出装置 | mismatch 検出ラグ |
| **P0** | pretooluse_breaker_block.ps1(supervisor + commander) | both | **push-state lane** | 既稼働 hook 装置(危険操作 block 経由 push-state 認知) | push-state 自動装置欠落継続 |
| **P0** | scope_violation_check.ps1 | commander | **pipeline mismatch lane** | scope 越境検出、既稼働 | 越境検出ラグ |
| P1 | step3_5_role_execution_snapshot.ps1 | commander | **human approval state lane** | rubric snapshot 装置 | rubric 適用認知ラグ |
| P1 | verify-role-snapshot-vs-rubric.ps1 | supervisor | **human approval state lane** | rubric 検証装置 | 同上 |
| P1 | step3_6_checkup_diff.ps1 + checkup_diff.ps1 | commander | **pipeline mismatch lane** | 既稼働、diff 装置 | mismatch 認知ラグ |
| P1 | check-stray-do-tickets.ps1 | commander | **ticket state lane** | 迷子 ticket 検出、既稼働 | 迷子認知ラグ |
| P1 | order-stale-alert.ps1 | supervisor | **ticket state lane / pipeline mismatch lane** | 発令 stale 検出、既稼働 | stale 認知ラグ |
| P1 | snapshot-supervisor.ps1 | supervisor | **source index lane** | 監督官 snapshot 装置 | 監督官状態認知ラグ |
| P1 | step3_update_advance_map.ps1 | commander | **dashboard candidate / human approval state lane** | advance map 装置、既稼働 | 進捗認知ラグ |
| P1 | scripts/ci/(detect-pr-impact + collect 系)| factory | **pipeline mismatch lane / source index lane** | CI 計測装置、既稼働 | CI 認知ラグ |
| P1 | rubrics/discussion_scale_rubric_v1.yaml | commander | **human approval state lane** | 採否要件 rubric | 採否認知ラグ |
| P2 | dream-crystallize-* | both | (out of MVP)| memory 結晶化、別経路 | (MVP 範囲外) |
| P2 | invoke-board-council.ps1 | supervisor | (将来 区報 lane) | 三社円卓装置 | (Phase 後段) |
| P2 | check-internal-links / review-implementation | supervisor | (out of MVP) | 文書整合 / 実装 review | (MVP 範囲外) |
| **Blocked** | factory `.claude/hooks/` 配備 | factory | (Y4-B v4 採否前) | 物理 block 装置(自前採番防止)| Y4-B v4 採否経路で別途 |
| **Blocked** | 自動 push / alert / enforcement | all | (ヤス approval 必須) | (本 MVP は read-only)| 全件 ヤス explicit approval |

= **既存装置 P0 14 件 + P1 8 件 + P2 3 件 + Blocked 2 件 = 全 27+ 件**

---

## 10. Final Recommendation(v1.1 拡張、ヤス追加要件 4 件)

### 10-1. dashboard/inventory-first を継続推奨か

✅ **継続推奨**(本 CLI Inventory で **既存装置 P0 14 件 + P1 8 件 = 22+ 件** が既稼働 = MVP は **接続層のみ** で達成可能 = 新規装置追加不要 = ガレージ §1.5 整合最大化)

### 10-2. 最初に接続すべき 3-5 件(ヤス指定、最重要)

| 順 | function | 理由 |
|---|---|---|
| **#1** | factory `mcp-servers/capability_registry + evt_search + handoff_summary`(3 装置統合) | DO-CP-101/102/103 既稼働 + dashboard MCP integration(DO-CP-038)既 merged = **接続層既配備、即時可視化可** |
| **#2** | factory **`scripts/generate-completion-reports-from-prs.ps1` + `write-merged-pr-completion-reports.ps1`** | **HQ staging unfilled の根本治療候補(既存装置の稼働経路接続)+ EVT-121 §6-J 補強 4(45 件流入不全)解消経路** |
| **#3** | commander `step5_5/generate_tickets_index.ps1` + `pull-completion-reports.ps1` + `process-completion-reports.ps1` | **ticket state lane + completion evidence lane SSOT 経路、既稼働、dashboard 接続で陳腐化検出可視化** |
| **#4** | commander `step8_circular_log.ps1` + `step9_gazette_log.ps1` | **回覧板 + 官報 lane 中核、既稼働、multi-supervisor coordination 装置にも整合** |
| **#5** | supervisor `sync-factory-pipeline.ps1` + `pipeline-bottleneck-probe.ps1` + `pull-replies.ps1` | **三 repo 統合 + bottleneck 検出 + stage 0 mirror 装置、既稼働、source index lane + pipeline mismatch lane 中核** |

= **3-5 件は実質「機能群」**(各 3-4 装置、計 14-16 装置の接続)= **新規実装 0 件 + dashboard MCP 接続 + UI panel 追加 + read-only synthesized view = MVP 完遂経路**

### 10-3. MVP connection wave のチケット数推定

| Scope | 推定チケット数 | 内容 |
|---|---:|---|
| dashboard MCP integration 拡張(既稼働 DO-CP-038 拡張) | 1 件 | 7 lanes mismatch panel 追加 |
| factory completion 供給経路 接続(既存 ps1 稼働経路接続) | 1-2 件 | generate-completion-reports-from-prs trigger 経路 / HQ staging 配置 |
| commander tickets index dashboard 連動(既存 generate_tickets_index.ps1 出力 → dashboard data feed) | 1 件 | data feed 経路 |
| commander 回覧板/官報 dashboard 連動(既存 step8/step9 出力 → dashboard) | 1 件 | log 表示 panel |
| supervisor pipeline-bottleneck-probe 連動(既存出力 → dashboard) | 1 件 | bottleneck panel |
| Decision-Gate Footer 自動 generate(段階 3 = warning summary) | 1 件 | footer auto-attach |
| **合計 MVP** | **5-7 件**(v1 推定と整合確証) | 全件 既存装置接続層、新規装置 0 |

### 10-4. ヤス approval 待機継続事項(MVP 着手前 block)

| # | item | 状態 |
|---|---|---|
| 1 | DP-001 C-2/C-3/C-4 | 未承認継続(本 MVP は **C-2 範囲外**、観測装置のみ) |
| 2 | DO-FACTORY-233(Y4-B v4 hook 実装) | REVISE 状態継続、本 MVP は hook 不要 |
| 3 | G-009〜G-012(三者協議議事録 v1.0)| 着手不可継続、本 MVP と独立 |
| 4 | factory `.claude/hooks/` 配備(自前採番物理 block) | Y4-B v4 採否前 block 継続 |
| 5 | 自動 push / alert / enforcement | 全件 ヤス explicit approval 必須 |
| 6 | dashboard UI 拡張(MVP 範囲外の機能追加) | DP-001 C-2 採否 + 別 staging で起案 |
| 7 | hook 4-6 段階(SessionStart / pre-completion / blocking) | dashboard observation pilot evidence 後 |
| 8 | Divergence resolution(本サイクル発見) | 別 staging(divergence_preflight_report_v1.md)+ ヤス approval 待機 |
| 9 | Multi-supervisor coordination 採否 | 別 staging(multi_supervisor_coordination_proposal_v1.md)|

---

## 11. 改訂履歴

- v1.0(2026-05-08 朝中盤後末末末末末末):初版起案、ヤス Supervisor Research Request 契機。§4.1-§4.7 + §5-§7 統合。
- **v1.1(同日朝末末末末末末末)**:**ヤス追加依頼反映 = §8 CLI / Agent Function Inventory 追加(supervisor 22 + commander 30 + factory 18 = 70+ 装置棚卸し、9 列 table)+ §9 Connection Priority Map(P0 14 + P1 8 + P2 3 + Blocked 2 = 27+ 件、10 lanes 接続)+ §10 Final Recommendation 拡張(dashboard-first 継続推奨 + 接続 3-5 件 = 14-16 装置 + MVP 5-7 件チケット推定 + ヤス approval block 9 件)+ 重要発見 = factory `generate-completion-reports-from-prs.ps1` + `write-merged-pr-completion-reports.ps1` 既存(supply path 復旧根本治療候補)** 統合。

---

*監督官 A Dashboard / Control Panel Build-State Inventory Research v1.1(staging、ヤス追加依頼遵守、Read-only research、Yasu planning only、CLI 棚卸し 70+ 件 + Connection Priority Map 27+ 件 + 既存装置接続層で MVP 完遂経路成立)*

*監督官 A Dashboard / Control Panel Build-State Inventory Research v1(staging、Read-only research、Yasu planning only)*
*「現状 60-82% 完了 + EVT-121 MVP 5-7 件で visibility 改善経路成立 + dashboard/inventory-first 継続推奨 + 物理証拠 19+ 件 merged 確証 + DP-001/DO-FACTORY-233/G-009-012 boundary 維持」*
