---
id: SUPERVISOR-WAVE5-MONITORING-CHECKLIST-v1
title: Supervisor Wave 5 Passive Monitoring + Readiness Preparation Checklist v1
status: STAGING_ONLY_MONITORING_NOTE
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line, ClaudeCode/Opus 4.7)
yasu_directive: "Supervisor passive monitoring during Factory Wave 5 dashboard work — no new implementation-direction lines"
ticket_type: passive_monitoring_checklist
mode: PASSIVE_MONITORING
related_evt: EVT-20260508-121
related_staging:
  - staging/evt_121_mvp_wave_draft_v1.md(Cursor 起案、Wave 5 候補母集団)
  - staging/dashboard_build_state_inventory_research_v1.md(v1.1)
  - staging/evt_121_dashboard_inventory_observability_model_v0.2.md
---

# Supervisor Wave 5 Passive Monitoring Checklist v1

## 1. Mode 宣言

**MODE: PASSIVE_MONITORING + READINESS_PREPARATION**

- 🚫 新 implementation-direction lines 開始禁止
- 🚫 新 hook/skill 提案禁止
- 🚫 新 ticket 起案禁止(ヤス explicit request 時を除く)
- 🚫 Commander への新発令禁止(本サイクル)
- 🚫 Factory への直接指示禁止(継続)
- 🚫 dashboard 実装着手禁止
- 🚫 DP-001 C-2/C-3/C-4 承認禁止
- ✅ 受動観測のみ
- ✅ Factory completion report 受領後の review criteria 準備

---

## 2. Expected Factory Tickets(Wave 5 想定母集団、Cursor 起案 wave_draft_v1 由来)

| 想定 ID | dashboard lane | 状態(本サイクル staging 時点) | Factory 着手 |
|---|---|---|---|
| DO-CP-MVP-EVT121-001 | 7 lanes 集約 inventory | staging draft(not approved)| ❌ 未着手 |
| DO-CP-MVP-EVT121-002 | pipeline mismatch panel(taxonomy 10 分類) | 同上 | ❌ |
| DO-CP-MVP-EVT121-003 | 回覧板/区報/官報 viewer | 同上 | ❌ |
| DO-CP-MVP-EVT121-004 | push-state lane | 同上(partially blocked) | ❌ |
| DO-CP-MVP-EVT121-005 | ticket state lane | 同上(partially blocked) | ❌ |
| DO-CP-MVP-EVT121-006 | completion evidence | 同上(blocked、観測のみ可) | ❌ |
| DO-CP-MVP-EVT121-007 | dashboard footer snippet | 同上(partially blocked) | ❌ |

**注記**: ヤス「Factory currently active on Wave 5 dashboard work」= **既存 Wave 5 系列**(DO-COMMON-W5-* + DO-CP-* 既稼働 + 工場長並走実装)を指す可能性あり。本 monitoring 対象は:
- (a) MVP-EVT121-* 系(本 wave draft 採否後)= 現状未着手
- (b) **DO-COMMON-W5-* 系 + DO-CP-* 既存系**(工場長 active 中、ProjectRX merged 継続)= 本日の Factory active 主対象 推定

---

## 3. Expected completion_report Paths

### 3-A. 標準経路(supply path 健全時、想定)

```
ProjectRX merged PR
  ↓ factory scripts/generate-completion-reports-from-prs.ps1(既存、稼働経路接続待機)
  ↓ factory scripts/write-merged-pr-completion-reports.ps1(既存、同上)
factory ProjectRX_HQ/wt_common/completion_reports/<ticket_id>.json
  ↓ HQ staging/completion_reports/(現状不在 = supply path 不全継続)
  ↓ commander pull-completion-reports.ps1
commander record-x-commander/sync/completion_reports/(現状 28 件)
  ↓ commander process-completion-reports.ps1
commander record-x-commander/strategy/tickets_completed/<YYYY/MM>/<DD>/
```

### 3-B. 監督官側 観測 path

```
factory side: ProjectRX_HQ/wt_common/completion_reports/(本日 73 件 DO-COMMON 確証)
commander side: record-x-commander/sync/completion_reports/(28 件)
HQ staging: ProjectRX_HQ/staging/completion_reports/(不在継続、流入装置欠落候補)
```

### 3-C. 期待される変化(Wave 5 active 中、passive 観測対象)

- factory completion_reports 件数増(Factory 実装 + completion_report 自動生成 既存 ps1 稼働時)
- commander side 件数増(supply path 復旧時)
- HQ staging 出現(supply path 修復成立時)

---

## 4. Dashboard Panels Expected to Appear(MVP 採否後、本 monitoring 範囲外)

| Panel | source | 状態 |
|---|---|---|
| 7 lanes inventory snapshot | MVP-001 採否後 | 🚫 not yet |
| pipeline mismatch alert | MVP-002 採否後 | 🚫 |
| 回覧板/区報/官報 viewer | MVP-003 採否後 | 🚫 |
| push-state status card | MVP-004 採否後(static or live)| 🚫 |
| ticket state mismatch | MVP-005 採否後 | 🚫 |
| completion evidence metrics | MVP-006 採否後(観測のみ)| 🚫 |
| Decision-Gate Footer snippet | MVP-007 採否後 | 🚫 |

= **本 monitoring 期間中、MVP 採否前のため 7 panel 全件「未出現」想定**

---

## 5. Evidence Required for Each Ticket(Factory completion 後の review 用)

### 5-A. 共通 evidence requirement(全 ticket)

- [ ] PR 番号 + merged_at(UTC ISO8601)+ merge commit hash
- [ ] PR title regex match `\[DO-[A-Z]+(?:-[A-Z]+)*-\d+\]`(Hook Ticket Template v1 適用 regex)
- [ ] completion_report JSON or MD 物理存在(factory side)
- [ ] commander side ticket 状態(active → tickets_completed 移動確証)
- [ ] read-only output 確証(write 操作なし、ヤス境界遵守)
- [ ] Decision-Gate Footer 適用(本完了報告 7 項目 checklist)

### 5-B. ticket 別 evidence requirement(将来 MVP 採否後の review 用 template)

| ticket | 追加 evidence |
|---|---|
| MVP-001 | snapshot JSON / Markdown table 物理存在 + 7 lanes 全件記載 + 再実行同型確証 |
| MVP-002 | mismatch panel 既存 MCP/health endpoint 非破壊確証 + taxonomy 10 分類列挙 + `unknown` 明示 |
| MVP-003 | latest circular id + 抜粋 + フルパス + write API なし確証 |
| MVP-004 | static vs live 表記 + ahead/behind 値 + last verified timestamp + divergence 🔴 表示 |
| MVP-005 | 件数比較 + mismatch flag + 最終同期時刻 + `unknown` empty state |
| MVP-006 | metrics 表示 + supply path empty 🔴 + 推奨確認手順(指示でなくチェックリスト) |
| MVP-007 | 7 項目すべて出力 + 欠損 `unchecked` 明示 + remote write なし |

= 本 5-B = **MVP 採否後の review template**(現時点では待機)

---

## 6. Review Questions After Factory Completion

### 6-A. 構造的観点(Mismatch Taxonomy 10 分類、観測能力訓練済規律遵守)

1. PR merged → completion_report 自動生成 supply path = 既存 ps1 稼働経路接続成立か?
2. HQ staging/completion_reports/ ディレクトリ出現か?(EVT-121 §6-J 補強 4 解消経路)
3. commander pull → process → tickets_completed 移動 経路 成立か?
4. ticket_id 自前採番(EVT-120 系列)発火か?(prefix 既知 9 系列以外の新規)
5. 1:1 マッピング前提 vs 構造的多経路(A-line/B-line 等)再確証か?

### 6-B. 物理証拠観点(evidence-first、Stage 0 v1.2 教訓反映)

1. PR merged + commit hash 物理確証
2. completion_report JSON schema 整合(ticket_id / pr_number / merged_at / commit / hash_chain)
3. commander tickets_completed 移動 git mv 履歴
4. dashboard panel 出現(MVP 採否時のみ、本期間 N/A)
5. read-only / write 操作なし確証

### 6-C. ヤス仮説検証(累積 12+ 例)

1. 観測装置不在(EVT-121)= Factory 完了時 supervisor が独自 query で確証可能か?
2. dashboard/inventory-first 方針 = 既存装置接続層で MVP 達成可能性確証か?
3. ガレージ §1.5 整合 = 装置追加 0 件 / 既存活用?
4. Hook/Skill Proposal Policy v1 適用 trigger 該当か?(発火時は 5 区分必須分類)

---

## 7. Decision-Gate Footer Checklist(本 monitoring 期間中、各サイクル完了報告で必須)

```markdown
### Decision-Gate Footer(passive monitoring サイクル末)

- [ ] 最新 回覧板 確認:`internal/circular/<latest>.md`
- [ ] 最新 区報 確認:`internal/regional/<latest>/`
- [ ] 関連 官報 確認:`shared/official_gazette/<related>.md`
- [ ] 関連 ticket state 確認:DO-COMMON / DO-CP active count + completed count
- [ ] 関連 completion_report 確認:factory / commander / HQ staging 件数 + supply path 状態
- [ ] push-state 確認:local / remote diff + unpushed count(verification-before-completion 規律)
- [ ] dashboard mismatch flags 確認:本 monitoring 期間 = N/A(MVP 採否前)
- [ ] **Factory active 状態確認**:Wave 5 ticket 着手有無 + 進捗指標
- [ ] **本 monitoring mode 違反確認**:新 implementation-direction lines / hook/skill 提案 / ticket 起案 = 全件 ❌ 確認
```

---

## 8. What Supervisor Must NOT Do During Waiting(規律明文化)

| # | 禁止行為 | 違反時 |
|---|---|---|
| 1 | 新 implementation-direction lines 起案 | EVT 候補正式記録 |
| 2 | 新 hook/skill 提案 | 同上 |
| 3 | 新 ticket 起案(ヤス explicit request 時を除く) | 同上 |
| 4 | Commander への新発令(本サイクル)| 同上 |
| 5 | Factory への直接指示 | 関係性ポリシー §3.2 違反、即時 EVT |
| 6 | dashboard 実装着手 | DP-001 C-2 採否前、boundary 違反 |
| 7 | DP-001 C-2/C-3/C-4 承認(監督官側) | ヤス採否権限侵害 |
| 8 | hook/skill enforcement 段階(4-6)起動 | v0.2 §5 段階規律違反 |
| 9 | 自動 push / alert / enforcement | ヤス制約継続 |
| 10 | 既存 staging 採否前段階 飛び越し | Adoption Matrix v1 違反 |

---

## 9. 監督官 A 許可行為(passive monitoring 範囲内)

| # | 許可行為 |
|---|---|
| 1 | git fetch + log + status(read-only)|
| 2 | 既存 staging 内容 review + 整合性確認 |
| 3 | Factory PR / commit log 観測(read-only)|
| 4 | factory completion_reports 件数 query(read-only) |
| 5 | commander tickets_* 件数 query(read-only)|
| 6 | EVT 系列 認知更新(observed only、自発 EVT 記録は controversial = ヤス確認推奨)|
| 7 | 完了報告作成時の Decision-Gate Footer 適用(規律遵守) |
| 8 | ヤス指示への即時応答 |
| 9 | 既存 staging 内 typo / link 軽微修正(意味変更なし) |

---

## 10. 観測 trigger(本 monitoring 期間 active 時)

### 10-A. 受動 trigger(ヤス指示で起動)

- ヤス「factory 完了」報告
- ヤス「review 開始」指示
- ヤス「採否」指示

### 10-B. 自発 trigger(本 monitoring mode 内、最小限)

- factory completion_reports 件数 大幅変化(±10 件以上)= ヤス報告候補
- HQ staging/completion_reports/ ディレクトリ出現 = 重要事象、即時 ヤス報告
- commander active 件数 大幅変化(±5 件以上)= 報告候補
- EVT-120 系列 新規発火検出 = ヤス報告候補(自前採番疑い検出時)
- Stage 0 mirror 配送経路 重大変化 = 報告候補

---

## 11. 関連既存 staging との関係

| staging | 本 monitoring での関係 |
|---|---|
| `evt_121_mvp_wave_draft_v1.md` | Wave 5 ticket 候補母集団(現状 staging draft、ヤス採否前) |
| `dashboard_build_state_inventory_research_v1.md` v1.1 | 70+ CLI inventory + Connection Priority Map(観測対象 mapping)|
| `evt_121_dashboard_inventory_observability_model_v0.2.md` | 7 lanes + Decision-Gate Footer 7 項目 + Hook 6 段階 |
| `stage_0_mirror_reconciliation_note_v1.md` v1.2 | mismatch taxonomy 10 分類(本 review 適用)|
| `multi_supervisor_coordination_proposal_v1.md` | 3 instance 並走運用認知(Cursor + ClaudeCode + Codex)|
| `evt_121_supervisor_main_reunify_verification_20260508.md` | merge + push 完遂 evidence(本 monitoring 起動条件)|

---

## 12. 改訂履歴

- v1.0(2026-05-08 朝中盤後末末末末末末末末末末末末):初版起案、ヤス Passive Monitoring directive 契機。Mode PASSIVE_MONITORING 宣言 + Wave 5 想定母集団 7 ticket + completion_report 標準経路 + Dashboard 7 panel 期待 + ticket 別 evidence template + review questions 構造/物理/ヤス仮説 3 観点 + Decision-Gate Footer + Supervisor 禁止 10 件 + 許可 9 件 + 観測 trigger 受動/自発 統合。

---

*監督官 A Wave 5 Passive Monitoring Checklist v1(staging-only、PASSIVE_MONITORING mode、新 implementation-direction lines 開始禁止、Factory completion 受領後 review criteria 準備)*
