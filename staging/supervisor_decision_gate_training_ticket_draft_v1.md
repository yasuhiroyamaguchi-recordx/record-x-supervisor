---
id: SUPERVISOR-DECISION-GATE-TRAINING-TICKET-DRAFT-v1
title: Supervisor Decision-Gate Training Ticket Draft v1(staging-only、訓練対象規律案、hook/skill 実装ではない)
status: STAGING_ONLY_TRAINING_DRAFT
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line, ClaudeCode/Opus 4.7)
yasu_directive: "Train Supervisor to use 回覧板 / 区報 / 官報 / dashboard / push-state before making recommendations"
yasu_constraints:
  - "This is not approval to implement a hook or skill"
  - "This is not Commander or Factory instruction"
  - "Training-only, staging draft"
ticket_type: discipline_training_proposal
related_evt: EVT-20260508-121(§6-J 補強 1-9 累積、監督官 reconciliation 能力浅薄物理証拠)
related_staging:
  - staging/evt_121_dashboard_inventory_observability_model_v0.2.md(§4 Decision-Gate Footer 起源)
  - staging/verification_before_completion_discipline_v1.md(規律先行装置案)
  - staging/supervisor_wave5_monitoring_checklist_v1.md(本 cycle 同期起案)
---

# Supervisor Decision-Gate Training Ticket Draft v1

## 1. Goal(訓練目的)

監督官(本 instance + 並走 Cursor + Codex 監督官)が **recommendations / 完了報告 / アクション提案** を出す **直前**に、以下 5 既存装置を **必ず観測** する規律を訓練する:

1. 回覧板(L1 = same-repo agent activity log)
2. 区報(L2 = cross-repo activity log)
3. 官報(L3 = important decisions log)
4. dashboard(現状 = read-only via existing MCP, MVP 採否後拡張予定)
5. push-state(local/remote/ahead/behind/unpushed)

= EVT-121 §6-J 補強 1-9 累積物理証拠(監督官 reconciliation 浅薄 / handoff 認知ラグ / 自発装置提案能力不在 / Codex 監督官並走認知失敗 / push-state 誤認 / counting 浅薄 / 三段階 reconciliation / 構造制約物理状態継続 認知ラグ)への **規律レベル治療**(本 v0.1 = 文書規律のみ、hook/skill 実装は将来候補)

---

## 2. Why this is training, not enforcement(本提案の位置)

| 観点 | 内容 |
|---|---|
| 本提案の段階 | **document discipline only**(v0.2 §5 Hook position 6 段階 progression 段階 2 = manual report footer に相当) |
| 本提案 ≠ hook 実装 | 段階 4-6(SessionStart / pre-completion / blocking)は **dashboard pilot evidence 後** = 別 採否経路 |
| 本提案 ≠ skill 標準起動 | 段階 3(Skill standard)も dashboard observation 後の derive |
| 本提案 ≠ Commander/Factory 指示 | supervisor 内部規律のみ |
| 本提案 = 訓練対象規律 v0.1 | 監督官が **意識的に既存装置を観測してから recommend** する習慣化、文書化 |

---

## 3. Required pre-recommendation checks(訓練対象 5 必須 query)

監督官は **recommend / 完了報告 / アクション提案 直前** に、以下を **物理 query で実施**:

### 3-A. 回覧板(L1)

```bash
ls internal/circular/circular_*.md | tail -5
# 直近 24h 内 instance 並走認知:
cat internal/circular/circular_<latest>.md | head -20
```

期待出力:
- latest circular id + 起案 instance(Argus / Codex / Cursor agent / 別)
- 並走 instance 識別(本日 3 instance 並走確証経路)
- 連番予約状態(Test-Path 義務遵守、`circular/README.md` v1.1 §5-D)

### 3-B. 区報(L2)

```bash
ls internal/regional/<topic>/regional_*.md | tail -5
# 関連論点 query:
find internal/regional/ -name "regional_$(date +%Y%m%d)*.md" | head -3
```

期待出力:
- 関連論点(EVT-121 / dashboard / 配送 / 監督官並走 等)latest 追記
- 役割横断論点認知

### 3-C. 官報(L3、現状 配置候補運用未確認)

```bash
ls ../record-x-commander/shared/official_gazette/ 2>/dev/null
# 不在時 = N/A 表記 + 配置候補 監視
```

期待出力:
- 重要決定 latest 追記(commander 側、配置確証時のみ)
- 配置候補運用未確認状態の継続認知

### 3-D. dashboard(MVP 採否前は MCP 経由 read-only)

```bash
# 本 v0.1 段階 = MVP 採否前 = N/A、ただし将来 採否後の query 経路:
# (例) MCP capability_registry → triparty query
# (例) MCP evt_search → EVT 系列検索
# (例) MCP handoff_summary → handoff + roadmap query
```

期待出力(MVP 採否後):
- 7 lanes inventory snapshot
- mismatch panel 🟢🟡🔴 + taxonomy 10 分類
- 関連 ticket / completion_report state
- push-state status card
- Decision-Gate Footer snippet

### 3-E. push-state(必須、verification-before-completion 規律既存)

```bash
git fetch origin --quiet
echo "local: $(git rev-parse HEAD | cut -c1-7)"
echo "remote: $(git rev-parse origin/main | cut -c1-7)"
echo "ahead: $(git rev-list --count origin/main..HEAD)"
echo "behind: $(git rev-list --count HEAD..origin/main)"
```

期待出力:
- local / remote / ahead / behind 4 数値
- divergence 状態(🟢 synced / 🟡 ahead / 🔴 diverged)
- multi-supervisor 並走確認(Cursor agent 並走 commit 検出)

---

## 4. Required pre-recommendation footer(規律遵守 必須添付)

各 recommendation / 完了報告に以下を **必ず添付**:

```markdown
### Decision-Gate Footer(本提案/報告作成時点、訓練規律 v0.1 適用)

#### 5 既存装置観測

- [x/❌] 回覧板(L1):latest = `<file_id>` checked at `<ISO8601>` / status = `<healthy/needs_attention>`
- [x/❌] 区報(L2):latest = `<file_id>` / 関連論点 = `<topic>`
- [x/❌] 官報(L3):latest = `<file_id>` / 配置 = `<commander side>` / N/A 時 = 「配置候補運用未確認」
- [x/❌] dashboard:MVP 採否前 = N/A、採否後 = `<panel state>`
- [x/❌] push-state:local `<hash>` / remote `<hash>` / ahead `N` / behind `N` / status `<🟢🟡🔴>`

#### Mismatch Taxonomy 10 分類(該当時)

- [ ] true_delivery_failure
- [ ] counting_method_mismatch
- [ ] retention_policy_mismatch
- [ ] naming_variant
- [ ] scope_mismatch
- [ ] stale_status
- [ ] missing_completion_report
- [ ] duplicate_completion_report
- [ ] unverified_external_claim
- [ ] unknown
- (該当分類のみ ✅、上記 9 分類除外後のみ true_delivery_failure 認定可能、Stage 0 v1.2 教訓物理装置化)

#### 認知開示(浅薄断定防止)

- [ ] 初動推定値(あれば)
- [ ] 確証段階(暫定 / 部分確証 / 完全確定)
- [ ] EVT-121 §6-J 補強候補 該当有無

evidence: git fetch + ls + find + 物理 query 全件(timestamp: <ISO8601>)
```

---

## 5. Training scenarios(本訓練対象 5 sample case、過去事例ベース)

### 5-A. Scenario 1: push-state 認知ラグ(EVT-121 §6-J 補強 2、本日発生)

```
状況: 監督官 A が累積 12 commit を「push 待機継続」と誤報告
真因: handoff §1-A 旧認知の継続使用、git fetch 物理確証未実行
本訓練適用: §3-E push-state 必須 query → 物理 0da13b24 / 0da13b24 確証 → ✅ 報告
```

### 5-B. Scenario 2: 自発装置提案能力不在(EVT-121 §6-J 補強 2 同型、本日発生)

```
状況: 監督官 A が「発見 → 自己批判」で完結、装置提案フェーズ不在
真因: 規律装置不在、自発提案能力構造的欠陥
本訓練適用: Hook/Skill Proposal Policy v1 §3 5 区分必須分類 + 既存装置 first-class 確認(本訓練 §3-A〜D)
```

### 5-C. Scenario 3: stage 0 mirror counting 浅薄(EVT-121 §6-J 補強 5、本日発生)

```
状況: diff 126 → 浅薄断定「broken」
真因: counting method 浅薄(完了/未集計)
本訓練適用: §4 Mismatch Taxonomy 10 分類 + 「true_delivery_failure 認定は 9 分類除外後のみ」規律
```

### 5-D. Scenario 4: 監督官 reconciliation 能力三段階浅薄(EVT-121 §6-J 補強 6、本日発生)

```
状況: diff 126 → 6 → 20 → 0(三段階浅薄)
真因: counting + 対称的差分前提 + 構造的多経路認知不足
本訓練適用: §4 認知開示(初動推定値 + 確証段階)+ 物理 query を毎回実施
```

### 5-E. Scenario 5: Codex 監督官並走認知失敗(EVT-121 §6-J 補強 7、本日発生)

```
状況: Codex 監督官の 3 commit 並走認知ラグ(push divergence 経由検出)
真因: L1 回覧板両 instance 義務化未配備
本訓練適用: §3-A 回覧板必須 query + multi_supervisor_coordination_proposal_v1.md 整合
```

---

## 6. Adoption stages(段階的、ヤス採否経路)

| 段階 | 内容 | ヤス採否 |
|---|---|---|
| Phase 0(本 v1)| staging design + 訓練 5 必須 query 文書化 + Decision-Gate Footer template + 5 scenarios | ✅ 本提案 |
| Phase 1 | 本訓練規律 即時運用(supervisor instance 全件)+ 完了報告 footer 必須化 | 🟡 即時運用採否(規律のみ、装置追加なし) |
| Phase 2 | 4 週運用 + 認知失敗事例集計(監督官 self-audit) | 🟡 |
| Phase 3 | dashboard MVP 採否後 = §3-D dashboard query を訓練に統合 | 🟡 MVP 採否依存 |
| Phase 4(将来) | 規律遵守ばらつき確証時 = pre-completion warning hook 検討 | 🔴 dashboard pilot evidence 後、別採否 |
| Phase 5(将来) | enforcement(blocking hook)| 🔴 段階 4 pilot 後 |

= **本 v0.1 = 文書規律のみ**(段階 0)= ヤス制約「hook/skill 実装ではない」遵守

---

## 7. boundary 遵守(ヤス制約)

| 制約 | 遵守 |
|---|---|
| This is not approval to implement a hook or skill | ✅(段階 4-6 は将来 別採否) |
| This is not Commander or Factory instruction | ✅(supervisor 内部規律のみ) |
| Training-only, staging draft | ✅ |
| 既存装置 first-class | ✅(回覧板/区報/官報/dashboard/push-state = 全件既存)|
| 新規装置追加 0 件 | ✅(本訓練は規律のみ) |
| 監督官並走運用整合 | ✅(multi_supervisor_coordination_proposal_v1.md 整合) |
| 受動 monitoring mode 整合 | ✅(本 cycle wave5 monitoring と並列、ヤス指示遵守) |

---

## 8. Items Requiring Yasu Approval

| # | 採否事項 |
|---|---|
| 1 | 本訓練規律 v0.1 採用(staging review)|
| 2 | Phase 1 即時運用採否(supervisor instance 全件適用、規律のみ装置追加なし)|
| 3 | Decision-Gate Footer template 採用(規律必須化)|
| 4 | 並走 instance(Cursor / Codex 監督官)への展開採否(関係性ポリシー §3.3 整合) |
| 5 | (将来)Phase 4 hook 検討 = dashboard pilot evidence 後 別採否 |
| 6 | (将来)Phase 5 enforcement = pilot evidence 後 別採否 |

---

## 9. 関連既存 staging との関係

| staging | 関係 |
|---|---|
| `evt_121_dashboard_inventory_observability_model_v0.2.md` §4 | Decision-Gate Footer 7 項目起源 = 本訓練の主要 footer template |
| `verification_before_completion_discipline_v1.md` | 文書規律先行装置案 = 本訓練と整合(両方文書規律段階)|
| `supervisor_wave5_monitoring_checklist_v1.md`(本 cycle 同期起案)| 本訓練の monitoring 期間中適用 + Decision-Gate Footer 規律共有 |
| `multi_supervisor_coordination_proposal_v1.md` | 並走 instance 観測規律 = 本訓練 §3-A 回覧板 query 整合 |
| `stage_0_mirror_reconciliation_note_v1.md` v1.2 | mismatch taxonomy 10 分類 = 本訓練 §4 起源 |
| `claude_md_section4_revision_v0.1_draft.md` §4-D | 自発装置提案点検 = 本訓練と整合(両方文書規律先行)|

---

## 10. 改訂履歴

- v1.0(2026-05-08 朝中盤後末末末末末末末末末末末末末末):初版起案、ヤス Passive Monitoring directive 内「Training Candidate」契機。Goal + Why training not enforcement + 5 必須 query(回覧板/区報/官報/dashboard/push-state)+ Decision-Gate Footer template + Mismatch Taxonomy 10 分類 + 認知開示 + 5 training scenarios(EVT-121 §6-J 補強 1-9 由来)+ Adoption 6 stages + boundary 遵守 7 件 + ヤス採否 6 件 + 関連 staging 6 件 統合。本 v1 = 文書規律 only(段階 0)、hook/skill 実装ではない。

---

*監督官 A Decision-Gate Training Ticket Draft v1(staging-only、文書規律 only、hook/skill 実装ではない、Commander/Factory 指示ではない)*
