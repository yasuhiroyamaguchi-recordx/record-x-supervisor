---
id: COMMANDER-OBSERVABILITY-DESIGN-v1
title: 司令官側 observability 装置設計 v1(Hook/Skill Proposal Policy v1 §3 5 区分必須分類提案、本サイクル適用例 第 2 例)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
yasu_decision_history:
  - "2026-05-08 朝中盤後末: ヤス指示「司令官側にも hooks/skills/scripts による運用強制」+ 4 件再計画要求"
related_evt: EVT-20260508-121 §6-J 補強 4(司令官側 completion_reports 流入不全 第 4 例物理証拠)
related_orders: [128-138]
related_policies: [SUPERVISOR-HOOK-SKILL-PROPOSAL-POLICY-v1]
applied_proposal_classification: B + C + D + E 統合(本 Policy v1 §3 適用例 第 2 例)
yasu_constraints:
  - "工場長へ直接追加実装指示しない"
  - "G-009〜G-012 慎重"
  - "W7 自前採番禁止"
  - "DP-001 C-2/C-3/C-4 と混ぜない"
ticket_type: governance_device_design
---

# 司令官側 observability 装置設計 v1(Hook/Skill Proposal Policy v1 §3 適用)

## 0. Trigger 発火確認(本 Policy v1 §2)

| Trigger | 該当 |
|---|---|
| T1 構造課題検出 | ✅ EVT-121 第 4 例(司令官側 completion_reports 流入不全) |
| T2 再発 | ✅ EVT-120 累積 9 例 + EVT-121 累積 4 例 |
| T3 認知ズレ | ✅ 司令官 SSOT vs 工場長実装実態 大規模乖離継続 |
| T4 物理確認漏れ | ✅ HQ staging/completion_reports/ ディレクトリ不在(本サイクル発見)|
| T5 監督官規律違反 | ⚪ 該当外(司令官側装置の問題) |
| T6 ヤス手動 trigger 依存検出 | ✅ ヤス指摘経由でのみ発見 |

= **5/6 trigger 発火 → 本 Policy 必須適用**

---

## 1. 5 区分必須分類提案(本 Policy v1 §3 適用)

### 1-A. A 区分 — 文書ルール(commander CLAUDE.md / AGENTS.md 改訂)

```yaml
A_document_rule:
  applicable: yes(部分)
  rationale: SSOT 整合 + completion_reports パイプライン規律明記は基礎、ただし単独では再発(EVT-118 同型)
  proposed_change:
    - record-x-commander/CLAUDE.md: "completion_reports パイプライン規律 + SSOT vs 実装実態整合確認規律 追記"
    - record-x-commander/AGENTS.md(新規 or 既存):"司令官 α 完了処理規律 + verification-before-completion 標準起動 明記"
  device_count_delta: ±0
  recommendation: ❌ 不採用(単独)/ ✅ B+C+D+E と併用
```

### 1-B. B 区分 — Skill 起動(verification-before-completion 標準起動)

```yaml
B_skill_invocation:
  applicable: yes
  rationale: 司令官 α 側 superpowers:verification-before-completion 標準起動 = 完了処理前 5 項目検証
  proposed_skill: superpowers:verification-before-completion
  verification_items:
    1. completion_reports 未処理ゼロか(commander side count ≥ factory side count か)
    2. pull-completion-reports.ps1 実行結果(成功 + pull 件数 + HQ staging 存在確認)
    3. process-completion-reports.ps1 実行結果(成功 + 処理件数 + 移動済 ID 列挙)
    4. active 残に merged 済みが残っていないか(4 点照合 script 流用、supervisor の Phase 1 設計)
    5. ticket_id_mapping.md 更新漏れ(改番 / 二重採番事象)
  device_count_delta: ±0(既存 Skill 活用)
  recommendation: ✅ 採用(supervisor 同型展開)
```

### 1-C. C 区分 — Hook(SessionStart + PostToolUse、supervisor 同型展開)

```yaml
C_hook:
  applicable: yes
  rationale: SessionStart で起動時 6 項目自動表示 + PostToolUse で sync/process/move/WAVE 後の自動差分確認
  proposed_hooks:
    - hook_1_sessionstart:
        target_runtime: Claude Code (SessionStart hook)
        config_path: C:\RX_Dev\record-x-commander\.claude\settings.json
        hook_script_path: C:\RX_Dev\record-x-commander\.claude\hooks\sessionstart_observability_check.ps1
        display_items_6:
          1. active 件数(全系列 + DO-COMMON / DO-CP / DO-FACTORY 等内訳)
          2. completed 件数
          3. 未処理 completion_reports 件数(commander side count - factory side count 差分)
          4. HQ staging からpull 可能な completion_reports 件数(HQ ディレクトリ存在 + JSON 件数)
          5. active_already_merged 疑い件数(supervisor 4 点照合 script 流用)
          6. P0 housekeeping 対象件数
        fail_open_policy:
          - script error → display warning + continue(起動阻害しない)
          - HQ unreachable → display "HQ staging absent" + continue
        cwd_assumption: irrelevant(script-local + 絶対パス併用)

    - hook_2_posttooluse:
        target_runtime: Claude Code (PostToolUse hook)
        matcher: Bash
        condition: command match `sync-tickets.ps1 | pull-completion-reports.ps1 | process-completion-reports.ps1 | git mv tickets_completed`
        hook_script_path: C:\RX_Dev\record-x-commander\.claude\hooks\posttooluse_diff_check.ps1
        actions: 自動差分確認 + 結果 log + alert(差分 > 5 で stderr 警告)
  device_count_delta: +2(SessionStart + PostToolUse hooks)
  hook_ticket_template_v1_applied: yes(F1+F2+F3+F4 全反映、self-modification block + fail open + log + pwsh fallback)
  recommendation: ✅ 採用(段階起動 = SessionStart 先行 + PostToolUse 検証後)
```

### 1-D. D 区分 — Script(pull 強化 + 司令官側 cross_repo_diff_check)

```yaml
D_script:
  applicable: yes
  rationale: pull-completion-reports.ps1 強化(HQ staging 不在検出 + alert)+ 司令官側 cross_repo_diff_check(supervisor 同型)
  proposed_scripts:
    - script_1_pull_strengthen:
        path: record-x-commander/sync/sync_script/pull-completion-reports.ps1(既存改修)
        additions:
          - HQ staging/completion_reports/ ディレクトリ存在確認
          - 不在時 = alert + factory 経路 fallback(`find ../ProjectRX_HQ/wt_common -path "*completion_reports*" -name "DO-*"`)
          - pull 結果ログ + 件数比較
    - script_2_diff_check:
        path: record-x-commander/sync/sync_script/cross_repo_diff_check.ps1(新規)
        rationale: supervisor `staging/cross_repo_diff_check_design_v1.md` 同型展開、司令官側で 4 点照合実行
  device_count_delta: +1(新規 cross_repo_diff_check)+ 既存改修 1 件
  recommendation: ✅ 採用
```

### 1-E. E 区分 — CI/PR Gate(factory PR merge 時 completion_report 自動生成、根本治療)

```yaml
E_ci_pr_gate:
  applicable: yes(根本治療最重要)
  rationale: |
    手動依頼ベース(工場長に「PR 番号付き完了リスト出してください」)= 構造的脆弱性。
    factory PR merge 時に GitHub Actions が completion_report JSON を自動生成 + HQ staging へ自動配置
    = ヤス指示「手動依頼ではなく構造化」物理装置化
  proposed_workflow:
    path: ProjectRX/.github/workflows/auto_completion_report.yml(新規)
    trigger: pull_request closed (merged: true)
    actions:
      1. extract DO-XXX-NNN from PR title regex `\[DO-[A-Z]+(?:-[A-Z]+)*-\d+\]`
      2. generate completion_report JSON(ticket_id + PR number + merged_at + commit hash + verifying_actor)
      3. push to HQ staging/completion_reports/ via separate PR or commit
      4. alert if mismatch(自前採番疑い検出 = EVT-120 系列)
    fail_open_policy:
      - workflow failure → log + continue(merge 阻害しない)
  device_count_delta: +1(GHA workflow)
  scope_note: 工場長 repo への直接実装指示にならない(GHA workflow = ProjectRX repo .github/、司令官 α 経由 DO-FACTORY 起案)
  recommendation: ✅ 採用(根本治療、本サイクルで最優先候補)
```

---

## 2. Recommendation(統合採否推奨)

### 2-A. 採用優先順

| 優先 | 区分 | 内容 | 効果 |
|---|---|---|---|
| 🔴 P0 | E | factory PR merge 時 completion_report 自動生成 GHA | **根本治療**(供給経路構造化) |
| 🔴 P0 | C(Hook 1) | 司令官 SessionStart hook(6 項目) | **起動時可視化** = 認知ラグ最小化 |
| 🟡 P1 | B | verification-before-completion Skill 標準起動 | **完了処理前検証** = 流出防止 |
| 🟡 P1 | D(Script 1) | pull-completion-reports.ps1 強化 | 暫定整流(根本治療 E が稼働するまで) |
| 🟡 P1 | C(Hook 2) | 司令官 PostToolUse hook | 操作後自動差分確認 |
| 🟢 P2 | D(Script 2) | 司令官側 cross_repo_diff_check | supervisor 同型展開、Phase 1 完了後 |
| 🟢 P3 | A | 文書規律改訂 | B+C+D+E 採択時に同伴 |

### 2-B. 装置数合計

```
+1 GHA workflow(E、根本治療)
+2 司令官 hooks(C、SessionStart + PostToolUse)
+1 司令官 script(D、cross_repo_diff_check 新規)
+1 司令官 script 既存改修(D、pull 強化)
+0 Skill(B、既存活用)
+0 文書(A、commander CLAUDE.md / AGENTS.md 改訂)

total: +4 件 / 既存 Skill + 既存 script 改修 + 既存文書改訂
```

### 2-C. ガレージ §1.5 整合

| 観点 | 評価 |
|---|---|
| 装置 vs 機能 | E 区分(GHA)= 根本治療(機能補完)= ガレージ §1.5 例外 (iii) 物理装置化必須 |
| 既存活用 | B Skill(既存)+ D pull 改修(既存)+ A 文書(既存)= 3 区分既存活用 |
| 簡素化原則期間 | ヤス採否経路必須(構造方針見直し該当) |

---

## 3. Anti-pattern 検出(本 Policy v1 §4 適用)

| AP | 該当判定 | 対応 |
|---|---|---|
| AP1 自己批判で完結 | ❌ 装置提案出した | OK |
| AP2 文書ルールのみ | ❌ B+C+D+E 提示 | OK |
| AP3 hook 提案で Hook Ticket Template 未適用 | ❌ §1-C で F1+F2+F3+F4 反映 | OK |
| AP4 ヤス指摘経由でのみ提案 | 🟡 一部該当(本サイクルはヤス指摘契機)| 本 Policy 採択で再発防止 |
| AP5 ガレージ §1.5 対比なし | ❌ §2-C で対比実施 | OK |

---

## 4. ヤス制約遵守確認

| 制約 | 状態 |
|---|---|
| 工場長へ直接追加実装指示しない | ✅(E 区分 GHA = ProjectRX `.github/`、司令官 α 経由 DO-FACTORY 起案、工場長への発令は司令官 α 主管)|
| G-009〜G-012 慎重 | ✅(本案は G 系と独立) |
| W7 自前採番禁止 | ✅(本案は W7 と独立、ただし B/C 採択で W7 起案時の自前採番防止経路成立) |
| DP-001 C-2/C-3/C-4 と混ぜない | ✅(本案は EVT-121 構造課題対応、DP-001 とは独立) |
| 実装はしない、staging まで | ✅(本ファイル staging のみ) |

---

## 5. ヤス採否要請

| 採否選択肢 | 内容 |
|---|---|
| (S) 採択 | E + C + B + D 段階実装(優先順 P0 → P1 → P2 → P3) |
| (P) 部分採択 | (a) E のみ先行(根本治療)/ (b) C(SessionStart)のみ先行 / (c) B + D 文書/script のみ先行 |
| (R) 整流要請 | 区分内仕様修正案 / 別の装置設計案 |

---

## 6. 改訂履歴

- v1.0(2026-05-08 朝中盤後末):初版起案、ヤス指示「司令官側にも hooks/skills/scripts による運用強制」+ DO-COMMON Reconciliation Report + EVT-121 補強 4 契機。Hook/Skill Proposal Policy v1 §3 必須 5 区分分類提案 = A 文書 / B Skill / C Hook(SessionStart + PostToolUse、Hook Ticket Template v1 適用) / D Script(pull 強化 + cross_repo_diff_check) / E CI/PR Gate(factory PR merge 自動 completion_report 生成、根本治療) + ガレージ §1.5 整合 + ヤス制約 5 件遵守 + 段階採択経路 P0-P3 統合。

---

*監督官 A 司令官側 observability 装置設計 v1(staging、ヤス採否対象、Hook/Skill Proposal Policy v1 §6 適用例 第 2 例)*
*「5 区分必須分類 + 装置数 +4 件 / 既存活用 3 区分 + 根本治療 E 区分 GHA workflow(factory PR merge 時 completion_report 自動生成)+ 段階採択 P0-P3」*
