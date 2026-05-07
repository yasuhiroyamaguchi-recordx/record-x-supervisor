---
id: EVT-121-DASHBOARD-INVENTORY-OBSERVABILITY-MODEL-v0.2
title: EVT-121 Dashboard / Inventory Observability Model v0.2(既存ログ機構 7 lanes 統合 + Decision-gate footer + Hook position 6 段階、ヤス Review 反映)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
prior_versions:
  - "v0.1: 2026-05-08 朝中盤後末末末末末(staging/evt_121_dashboard_inventory_observability_model_v0.1.md)"
yasu_decision_history:
  - "2026-05-08 朝中盤後末末末末末末: ヤス Review v0.1 = 受領、ただし既存装置(回覧板/区報/官報/tickets/completion_reports/staging reports/push-state checks)が decision workflow と disconnected が真因 + 既存ログ機構を first-class data sources として明示追加 + 7 inventory lanes + Decision-gate manual footer 先行 + Hook position 6 段階"
yasu_constraints:
  - "Existing logs are first-class data sources(not new mechanisms primary)"
  - "Manual decision-gate footer first, hard hook later"
  - "Read-only and evidence-index based"
  - "Separate from DP-001 C-2/C-3/C-4"
  - "Do not implement dashboard UI"
  - "Do not add hooks or skills in this cycle"
ticket_type: observability_design_proposal_revised
---

# EVT-121 Dashboard / Inventory Observability Model v0.2(v0.1 改訂、既存装置 first-class)

## 0. v0.1 → v0.2 主要変更点(ヤス Review 反映)

| 項目 | v0.1 | v0.2(本改訂)|
|---|---|---|
| 真因 frame | cross-pipeline observability + inventory deficiency | **Existing observability artifacts are disconnected from the decision workflow**(ヤス再 frame)|
| 既存装置の位置 | data source candidates §5 で参照 | **first-class data sources、専用 lanes として §3 拡張**(本改訂主軸)|
| Inventory lanes | 8 axes(feature/ticket/completion/...) | **7 lanes(回覧板/区報/官報/ticket/completion/push-state/dashboard)+ 8 axes**(両立) |
| Decision-gate | 言及なし | **manual report footer 先行**(hard hook 禁止、§4 拡張) |
| Hook position | hook 補完段階 + 将来 derive | **6 段階 progression**(read-only → manual footer → warning summary → SessionStart display → pre-completion warning → blocking、最終のみ enforcement、§5 拡張)|
| 既存装置との関係 | §11 関連既存 staging | **§3 で first-class 統合**(既存 5 装置との接続経路明示)|

---

## 1. Current Problem Statement(ヤス再 frame 反映)

EVT-121 = `existing observability artifacts are disconnected from the decision workflow`

**not** simply: `more hooks or skills are needed`

### 1-A. 既存装置一覧(本日時点)

| 装置 | 配置 | 役割 | decision workflow 接続状態 |
|---|---|---|---|
| 回覧板(L1)| `internal/circular/` | 同 repo agent activity log + 連番予約 | 🟡 ClaudeCode 側のみ規律適用、Codex 側未確認 |
| 区報(L2)| `internal/regional/` | 役割横断論点 / 配送 log | 🟡 部分稼働 |
| 官報(L3)| `shared/official_gazette/`(司令官側) | 重要決定 + 共通規律 | 🟡 配置候補のみ、運用未確認 |
| tickets | `record-x-commander/strategy/tickets_*` | Commander/Factory work state | 🟡 SSOT 陳腐化(EVT-121 §6-J 補強 4 確証) |
| completion_reports | factory + commander | 実装証跡 | 🔴 supply path 不全(HQ staging 不在) |
| staging reports | `record-x-supervisor/staging/` | 監督官設計案 + reconciliation | 🟢 健全(本提案も staging) |
| push-state checks | `git fetch + log` 手動 | 同期確認 | 🔴 文書規律のみ、自動化なし |

= **全 7 装置 部分稼働、decision workflow への接続が散逸**

### 1-B. 真因(構造、v0.2 で精緻化)

監督官・司令官・工場長・Strategy Lab・Codex 監督官 が **共有 decision surface を持たない** = 各自の観測が個別装置に分散 = decision 直前に **誰も全装置を一度に確認しない** = 状態認識ラグ累積

= **既存装置を decision surface につなぐ = 本 v0.2 の核心**(新規装置追加ではなく接続)

---

## 2. Revised Interpretation of Stage 0 Mirror Result(v0.1 §2 継承)

(変更なし、Stage 0 v1.2 確証 = true delivery failure 0 件 + 配送経路健全 + 知の経路欠落)

---

## 3. Inventory Lanes(ヤス §3 7 lanes、本 v0.2 主軸)

### 3-A. 7 Lanes 構造

| Lane | Purpose | Data Source | Connection to Decision |
|---|---|---|---|
| **回覧板 lane** | same-repo agent activity and reservation log | `internal/circular/circular_YYYYMMDD_NNN.md` | 起動時必読 + commit 予約 + 並走検出 |
| **区報 lane** | cross-repo delivery and activity log | `internal/regional/<topic>/regional_YYYYMMDD_NNN.md` | 役割横断論点 + 配送追跡 |
| **官報 lane** | important decisions and standing rules | `shared/official_gazette/`(司令官側候補) | 重要決定共有 + 共通規律 |
| **ticket lane** | Commander / Factory work state | `record-x-commander/strategy/tickets_*` + ticket_id_mapping.md | active / completed / draft / blocked / 自前採番疑い |
| **completion lane** | implementation evidence | `factory/completion_reports/` + `commander/completion_reports/` + HQ staging | 実装証跡 + supply path 健全性 |
| **push-state lane** | local / remote divergence and pending commits | `git fetch + log + rev-list`(supervisor + commander)| 同期状態 + divergence 検出 + multi-supervisor 並走認知 |
| **dashboard lane** | read-only synthesized current state | 上記 6 lanes 統合(将来 DP-001 C-3 連動候補) | 全装置の synthesized 表示 |

### 3-B. 8 axes(v0.1 §3 継承、本 7 lanes と直交)

| Axis | Required Question | 主要 Lane |
|---|---|---|
| Feature inventory | What functions currently exist? | dashboard / ticket / completion |
| Ticket inventory | Which DO tickets are active/completed/blocked/stale/duplicated? | ticket |
| Completion evidence | Which completion_reports prove implementation? | completion |
| Pipeline path | Which path produced the artifact? | 区報 / 官報 / dashboard |
| Stage mapping | A-line/B-line/dashboard/governance/legacy? | 回覧板 / 区報 |
| Reconciliation status | true_failure / retention / variant / counting / scope / unknown? | 全 lane(mismatch taxonomy 適用)|
| Source of truth candidate | Best evidence source? | 全 lane(SSOT 階層)|
| Human decision needed | What requires Yasu approval? | 官報 / dashboard |

= **lanes(横軸)+ axes(縦軸)= マトリクス観測**

---

## 4. Decision-Gate Design(ヤス §4、manual report footer 先行)

### 4-A. Decision-Gate footer 必須項目(7 件)

監督官が **完了報告 / アクション推奨 直前** に、報告に必ず含める:

```markdown
### Decision-Gate Footer(本完了報告作成時点)

- [ ] 最新 回覧板 確認:`internal/circular/<latest>.md` checked at <ISO8601>
- [ ] 最新 区報 確認:`internal/regional/<related>.md` checked
- [ ] 関連 官報 確認:`shared/official_gazette/<related>.md` checked(該当時)
- [ ] 関連 ticket state 確認:DO-<ID> status from commander tickets_*
- [ ] 関連 completion_report 確認:factory + commander side count 整合
- [ ] push-state 確認:local/remote diff + unpushed count(verification-before-completion 規律 既存)
- [ ] dashboard mismatch flags 確認:本 v0.2 inventory lanes mismatch state
```

### 4-B. footer 規律(Manual Decision Gate v1)

| 場面 | 必須化 |
|---|---|
| 完了報告作成時 | ✅ |
| アクション推奨時 | ✅ |
| EVT 候補記録時 | ✅ |
| 構造提案 staging 時 | 🟡(本提案で推奨、規律改訂は別)|

= **enforcement hook ではなく manual footer**(ヤス制約「hard hook 後回し」遵守)

### 4-C. 既存 verification-before-completion 規律との関係

```
verification-before-completion(v1、staging)= push state 中心 5 項目
        ↓ 本 v0.2 で拡張
Decision-Gate Footer(v0.2)= 7 項目(回覧板 + 区報 + 官報 + ticket + completion + push-state + dashboard mismatch)
```

= **既存規律拡張、新規装置追加なし**

---

## 5. Hook Position(ヤス §5、6 段階 progression)

### 5-A. 6 段階(必ず段階順、各段階個別ヤス採否)

| 段階 | 内容 | 状態 |
|---|---|---|
| **1. read-only dashboard model** | 本 v0.2 staging | 🟡 本提案 |
| **2. manual report footer** | Decision-Gate Footer 7 項目(§4)| 🟡 v0.2 採択時に文書規律 |
| **3. dashboard-generated warning summary** | inventory lanes mismatch state を週次/必要時生成(read-only)| 🟡 sample 段階(別採否) |
| **4. SessionStart display-only hook** | 起動時 6 項目自動表示(display only)| 🔴 ヤス保留中(現状)|
| **5. pre-completion warning hook** | 完了報告生成時 warning 表示(non-blocking)| 🔴 段階 4 の pilot evidence 後 |
| **6. blocking hook** | 完了処理 block(enforcement) | 🔴 段階 5 の pilot evidence 後のみ |

### 5-B. 段階間 ゲート規律

```
段階 1 → 2: v0.2 staging review 完遂
段階 2 → 3: footer 規律 即時運用 + 4 週運用結果取得
段階 3 → 4: warning summary read-only 安定 + ヤス採否
段階 4 → 5: SessionStart pilot 4 週 + false-positive 評価
段階 5 → 6: pre-completion warning pilot 4 週 + blocking 必要性確証
```

= **enforcement は最終段階のみ、各段階個別 ヤス採否、bundle 禁止**

---

## 6. Sample Output Tables(v0.1 §4 継承、4 種、本 v0.2 で 7 lanes と整合)

(v0.1 §4-A〜§4-D 継承、本 v0.2 では §3 7 lanes 適用 column 拡張可)

### 6-A. v0.2 で追加する column(任意拡張)

| Lane | Sample column 追加候補 |
|---|---|
| 回覧板 lane | `latest_circular_id`(該当 capability/ticket の最新追記)|
| 区報 lane | `regional_topic`(該当論点)|
| 官報 lane | `gazette_decision_id`(該当決定)|

= existing tables(v0.1 §4)に lane column 追加で 7 lanes 統合可

---

## 7. Mismatch Taxonomy(v0.1 §6 継承、10 分類、変更なし)

### 7-A. 検出フロー + 分類優先順(変更なし)

(true_delivery_failure 認定は 9 分類除外後のみ、Stage 0 v1.2 教訓物理装置化、変更なし)

---

## 8. Hook/Skill-First vs Dashboard/Inventory-First(v0.1 §7 更新)

### 8-A. 比較 8 観点(変更なし)

(v0.1 §7 継承、dashboard-first 採択)

### 8-B. v0.2 補強(ヤス Review 反映)

| 補強観点 | 内容 |
|---|---|
| 既存装置接続 | dashboard-first = 既存 7 装置の **接続主軸**(新規装置を最後にする)|
| Decision workflow 接続 | 本 v0.2 §4 Decision-Gate Footer = 既存規律と decision の **接続装置**(マニュアル先行) |
| Hook 6 段階 | enforcement hook は **6 段階目のみ**(現状 1 段階目 staging)= 段階的接続深化 |

---

## 9. Adoption Path(v0.1 §8 継承 + v0.2 拡張)

| Phase | 内容 | 装置数 | ヤス採否 |
|---|---|---|---|
| Phase 0(本 v0.2)| staging design + 7 lanes + Decision-Gate Footer 設計 | ±0 | 本提案 |
| Phase 1 | sample inventory query script(read-only)起案 + manual footer 規律即時運用 | ±0 | 段階 2 採否 |
| Phase 2 | sample script 実装 + footer 規律 4 週運用 | +1(query script) | 段階 3 採否 |
| Phase 3 | warning summary 自動生成(read-only、週次)| +1 | 段階 4 採否 |
| Phase 4 | DP-001 C-3 連動(現状 not_approved)| ±0 | DP-001 C-2/C-3 ヤス採否 |
| Phase 5(将来)| Hook 4 段階目以降(SessionStart → pre-completion → blocking)| 装置別 | 各段階個別採否(bundle 禁止)|

---

## 10. Items Requiring Yasu Approval(v0.1 §9 拡張 + v0.2 追加)

| # | 採否事項 | 状態 |
|---|---|---|
| 1 | 本 v0.2 staging review(design accept、ヤス Review v0.1 → v0.2 訂正反映) | 🔴 本サイクル次決定 scope |
| 2 | Decision-Gate Footer 7 項目 規律即時運用(段階 2)| 🟡 v0.2 採択時 |
| 3 | sample inventory query script 起案(段階 3 準備)| 🟡 v0.2 採択後 |
| 4 | warning summary 自動生成(段階 3)| 🟡 段階 2 安定後 |
| 5 | DP-001 C-3 連動(段階 4)| 🔴 DP-001 C-2/C-3 ヤス採否前提 |
| 6 | Hook 段階 4-6(SessionStart / pre-completion / blocking)| 🔴 段階別個別採否、pilot evidence 必須 |
| 7 | mismatch taxonomy 10 分類 規律化 | 🟡 v0.2 採択時 |
| 8 | true_delivery_failure 認定規律(9 分類除外後のみ)| 🟡 同上 |
| 9 | 7 lanes inventory model 規律化 | 🟡 v0.2 採択時 |
| 10 | hook position 6 段階 progression 規律化 | 🟡 v0.2 採択時 |

---

## 11. Boundary Conditions 遵守(v0.1 §10 継承)

| 制約 | 遵守 |
|---|---|
| Do not approve DP-001 C-2/C-3/C-4 | ✅ |
| Do not implement dashboard UI | ✅ |
| Do not issue Commander tickets | ✅ |
| Do not instruct Factory | ✅ |
| Do not add hooks or skills in this cycle | ✅(本 v0.2 は 7 lanes + footer + 6 段階設計のみ)|
| Read-only and evidence-index based | ✅ |
| Existing 回覧板/区報/官報 primary | ✅(本 v0.2 §3 で first-class 統合)|
| Manual decision-gate footer first, hard hook later | ✅(§4 + §5)|
| Separate from DO-FACTORY-233 + G-009-012 | ✅ |

---

## 12. 関連既存 staging との関係(v0.1 §11 拡張)

| staging file | v0.2 での関係 |
|---|---|
| `stage_0_mirror_reconciliation_note_v1.md` v1.2 | 真因分析入力 + Stage 0 v1.2 教訓 mismatch taxonomy 反映 |
| `adoption_matrix_v1.md` | 本 v0.2 6 段階 progression と整合(staging/sample/pilot/enforce 同期)|
| `evt_121_revised_staging_pack_v2.md`(hook/skill-first 5 区分)| **将来 derive 候補保持**(段階 4-6 で再評価)|
| `supervisor_hook_skill_proposal_policy_v1.md` | dashboard 観測 gap 検出後の derive 規律として継続 |
| `y4_b_pretooluse_hook_v4.md` | dashboard で `unverified_external_claim` 反復確証後に再評価 |
| **`multi_supervisor_coordination_proposal_v1.md`**(本サイクル新規)| **回覧板 lane の両 instance 義務化と整合**(本 v0.2 §3 回覧板 lane = multi-supervisor coordination 主装置)|
| **`divergence_preflight_report_v1.md`**(本サイクル新規)| **push-state lane の物理証拠**(divergence 状態 + Codex 監督官並走) |

---

## 13. 改訂履歴

- v0.2(2026-05-08 朝中盤後末末末末末末):ヤス Review v0.1 = REVIEWED_NOT_APPROVED + 訂正要請(既存装置 first-class + 7 lanes 統合 + Decision-Gate footer 先行 + Hook position 6 段階)契機。v0.1 → v0.2 主要変更点 6 件 + 1-A 既存装置一覧 + 1-B 真因精緻化 + §3 7 lanes 構造 + §4 Decision-Gate Footer 7 項目 + Manual Decision Gate v1 + §5 Hook 6 段階 progression + 段階間ゲート + §10 ヤス採否 10 件 + 既存 staging 7 件関係(multi-supervisor + divergence preflight 追加) 統合。
- v0.1(2026-05-08 朝中盤後末末末末末):初版起案。

---

*監督官 A EVT-121 Dashboard / Inventory Observability Model v0.2(staging、ヤス Review 反映、既存装置 first-class、Decision-Gate manual footer 先行、Hook 6 段階 progression、装置追加 0 件)*
