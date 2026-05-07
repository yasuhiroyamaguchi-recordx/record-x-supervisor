---
id: COMPLETION-REPORT-SUPPLY-PATH-REDESIGN-v1
title: completion_report 供給経路 構造化再設計 v1(手動依頼 → 装置強制、根本治療)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
related_evt: EVT-20260508-121 §6-J 補強 4(司令官側 completion_reports 流入不全)
related_orders: [128-138]
related_design: commander_observability_design_v1.md(E 区分)
ticket_type: structural_redesign
yasu_constraint: "工場長へ直接追加実装指示しない(司令官 α 経由 DO-FACTORY 起案)"
---

# completion_report 供給経路 構造化再設計 v1(手動依頼 → 装置強制)

## 1. 現状(物理確証、本サイクル末)

```
[factory 実装]→[PR merge]→ ❌ 手動依頼ベース ❌ →[HQ staging/(不在)]→ ❌ →[commander pull]→ ❌ →[commander completed]
```

| 経路点 | 状態 |
|---|---|
| factory 実装 | ✅ 動作(PR merged 100 件 DO-COMMON) |
| PR merge → completion_report 生成 | 🔴 **手動依頼ベース**(工場長セッション内で手動生成) |
| factory completion_reports/ | 🟡 73 件存在(うち 45 件は HQ staging へ未到達) |
| **HQ staging/completion_reports/** | 🔴 **ディレクトリ不在**(物理層欠落) |
| commander pull-completion-reports.ps1 | ✅ 動作(空 pull、流入なし) |
| commander completion_reports | 🟡 28 件のみ(45 件流入不全) |
| commander completed | 🟡 49 件(SSOT 陳腐化) |

= **PR merge → HQ staging 経路の物理装置化が欠落** = 監督官 A find 結果 0 件確証(本サイクル)

---

## 2. 構造化案(装置強制経路)

```
[factory 実装]→[PR merge]→ ✅ GHA workflow ✅ →[HQ staging/]→ ✅ →[commander pull]→ ✅ →[commander completed]
                              (E 区分新規装置)
```

### 2-A. E 区分 — `.github/workflows/auto_completion_report.yml`(新規 GHA、根本治療)

```yaml
workflow_name: Auto Completion Report Generator
location: ProjectRX/.github/workflows/auto_completion_report.yml
trigger:
  pull_request:
    types: [closed]
    branches: [main]
condition: github.event.pull_request.merged == true

steps:
  1. extract_ticket_id:
     - parse PR title regex: `\[DO-[A-Z]+(?:-[A-Z]+)*-\d+\]`
     - if no match → label PR as "completion-report-skipped" + log + exit 0
  2. generate_completion_report_json:
     - schema:
         ticket_id: <extracted>
         pr_number: <github.event.pull_request.number>
         pr_title: <github.event.pull_request.title>
         merged_at: <github.event.pull_request.merged_at>
         merge_commit_sha: <github.event.pull_request.merge_commit_sha>
         head_branch: <github.event.pull_request.head.ref>
         verifying_actor: github_actions_auto
         generated_by: auto_completion_report.yml v1
         hash_chain: <sha256 of above fields>
  3. push_to_HQ_staging:
     - method: separate commit to ProjectRX_HQ via deploy key OR PR creation
     - target_path: HQ staging/completion_reports/<ticket_id>.json
     - alternative: ProjectRX repo 内に staging/completion_reports/ 配置(commander pull 経路修正で対応)
  4. mismatch_detection:
     - if ticket_id 自前採番疑い(prefix not in approved list, e.g., DO-CODEX/CHRONICLE/CI-BLOCKER/RESILIENCE/GHA-COST/HOUSEKEEPING-D)
       → log warning + create issue "EVT-120 第 N+M 系列候補"
fail_open_policy:
  - workflow failure → log + continue(merge 阻害しない)
  - HQ unreachable → fallback to ProjectRX 内 staging path
permissions:
  - read: pull_requests
  - write: contents (for staging path)
```

### 2-B. 接続経路の選択肢(技術的トレードオフ)

| 案 | 内容 | 利点 | 欠点 |
|---|---|---|---|
| (a) ProjectRX → ProjectRX_HQ deploy key 経由 push | GHA から HQ 直接 push | 即時性 | 認証情報管理 + cross-repo write 権限 |
| (b) ProjectRX 内 `staging/completion_reports/` 配置 + commander pull 経路修正 | 同 repo 内完結 | シンプル | commander pull-completion-reports.ps1 改修要 |
| (c) ProjectRX_HQ 別 repo を中継 | 第三者 repo 経由 | 権限分離 | 装置数増(中継 repo 追加) |

監督官推奨:**(b) ProjectRX 内 staging 配置** = シンプル + commander 既存装置改修(D 区分)で対応可

---

## 3. DO-FACTORY-173 再評価

### 3-A. 既存 DO-FACTORY-173 状態(2026-05-07 merged、PR #1459)

```
内容: factory SessionStart hook + FACTORY_CAPABILITIES.yaml(14 devices)+ boot-injector
配備: ProjectRX_HQ/wt_common/.claude/hooks/?(物理確認要)
効果: factory セッション起動時 capability registry 表示
```

### 3-B. 本問題への対応評価

| 評価軸 | 内容 |
|---|---|
| 現 DO-FACTORY-173 の本問題対応 | 🟡 **部分的**(SessionStart 表示のみ、completion_report 生成自動化なし)|
| 根本治療への寄与 | 🔴 **不十分**(供給経路自動化が必要) |
| 拡張可能性 | 🟢 拡張案あり(後述 §3-C) |

### 3-C. 拡張案(司令官 α 経由 DO-FACTORY 新規起案候補、Hook Ticket Template v1 適用)

```yaml
ticket_id: DO-FACTORY-{NNN}(司令官 α 採番)
title: factory SessionStart hook 拡張 — 未提出 completion_report 件数表示 + 自動生成 trigger
phase: governance_repair
priority: 🟡 P1
extends: DO-FACTORY-173(merged)
goal: |
  factory セッション起動時に未提出 completion_report 件数を表示
  + PR merge 後に自動 trigger で completion_report 生成 ((E 区分 GHA との二層防護))
implementation_mode: PLAN_REQUIRED
yasu_approval_required: yes
hook_ticket_template_v1_applied: yes(F1+F2+F3+F4 全反映)
out_of_scope:
  - 工場長 repo への直接実装指示(本拡張は司令官 α 経由起案、工場長 Castor 主管実装)
  - 自前採番(DO-FACTORY 新採番 = 司令官 α 主管)
  - DP-001 C-2/C-3/C-4 関連
```

= **E 区分 GHA(根本治療)+ DO-FACTORY-173 拡張(SessionStart 表示)= 二層防護**

---

## 4. 提案統合(段階的実装、ヤス採否経路)

| Phase | 内容 | 主管 | 装置数 |
|---|---|---|---|
| Phase 1(即時、本提案承認後)| E 区分 GHA 新規(`auto_completion_report.yml`)+ commander pull 経路修正(D 区分)| 司令官 α 起案 + 工場長 Castor 実装(関係性ポリシー §3.2 経由)| +1 GHA + 1 script 改修 |
| Phase 2(短期)| DO-FACTORY-173 拡張(SessionStart 未提出件数表示)| 司令官 α 起案 + 工場長 Castor 実装 | hook 拡張(±0、既存改修)|
| Phase 3(中期、Y4-B v4 採択後)| factory 側 PreToolUse hook(自前採番物理 block、軸 B 物理装置化) | 司令官 α 起案 + 工場長 Castor 実装 | +1 hook(Y4-B v4 整流済) |
| Phase 4(中期+、三社円卓 X-4)| C 軸 CI/PR gate(do-id-existence-check.yml + role boundary check 拡張、DO-G-013 統合) | 三者合議 + ヤス採否 | +1 GHA |

---

## 5. ヤス制約遵守確認

| 制約 | 状態 |
|---|---|
| 工場長へ直接追加実装指示しない | ✅(全 Phase で司令官 α 経由 DO-FACTORY 起案、関係性ポリシー §3.2 遵守)|
| G-009〜G-012 慎重 | ✅(本提案は G 系と独立) |
| W7 自前採番禁止 | ✅(本提案は W 系と独立、E 区分稼働で自前採番検出 alert 経路成立)|
| DP-001 C-2/C-3/C-4 と混ぜない | ✅(本提案は EVT-121 構造課題対応、DP-001 とは独立) |
| 実装しない、staging まで | ✅(本ファイル staging のみ) |

---

## 6. ヤス採否要請

| 採否選択肢 | 内容 |
|---|---|
| (S) 採択 | Phase 1-4 段階実装、本提案を司令官 α 経由 DO-FACTORY 起案 |
| (P) 部分採択 | Phase 1(根本治療)のみ先行、Phase 2-4 は次サイクル |
| (R) 整流要請 | 接続経路選択(§2-B 案 (a)/(b)/(c))修正 / 別装置設計 |

---

## 7. 改訂履歴

- v1.0(2026-05-08 朝中盤後末):初版起案、ヤス指示「completion_report 供給経路を手動依頼ではなく構造化」+ EVT-121 補強 4 契機。E 区分 GHA workflow(根本治療)+ DO-FACTORY-173 拡張(二層防護)+ Phase 1-4 段階実装 + ヤス制約 5 件遵守 + 関係性ポリシー §3.2(司令官 α 経由)整合 統合。

---

*監督官 A completion_report 供給経路 構造化再設計 v1(staging、ヤス採否対象、Hook/Skill Proposal Policy v1 §3 適用例 第 2 例 §1-E)*
*「手動依頼 → 装置強制経路 + factory PR merge GHA + DO-FACTORY-173 拡張 二層防護 + 関係性ポリシー §3.2 遵守」*
