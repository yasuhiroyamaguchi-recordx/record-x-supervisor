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

## 8. 改訂履歴

- v1.0(2026-05-08 朝中盤後末末末末末末):初版起案、ヤス Supervisor Research Request 契機。§4.1 Executive Summary 3 bands + §4.2 11 areas 物理証拠 + §4.3 Ticket Estimate 5 scopes + §4.4 19+ 件 merged 確証 + §4.5 MVP 5-7 件 + §4.6 MVP 4 問い + §4.7 Governance Boundary 6 件 + §5 Estimation Rules 3 bands + §6 Cautions 5 件 + §7 Final Recommendation 4 件 統合。Read-only research、Yasu planning only、装置追加なし、ticket 起案なし。

---

*監督官 A Dashboard / Control Panel Build-State Inventory Research v1(staging、Read-only research、Yasu planning only)*
*「現状 60-82% 完了 + EVT-121 MVP 5-7 件で visibility 改善経路成立 + dashboard/inventory-first 継続推奨 + 物理証拠 19+ 件 merged 確証 + DP-001/DO-FACTORY-233/G-009-012 boundary 維持」*
