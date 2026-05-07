---
id: EVT-121-REVISED-STAGING-PACK-v2
title: EVT-121 Revised Staging Pack v2(supervisor 13 フィールド + commander 10 フィールド + sample outputs + risk section、ヤス改訂要件統合)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
yasu_decision_history:
  - "2026-05-08 朝中盤後末末: 2 件 REVIEWED_NOT_APPROVED + revised staging pack 要請"
ticket_type: integrated_revised_staging_pack
yasu_constraint_summary:
  - "Bundle approval 禁止(各装置個別採否)"
  - "P0 / root treatment / Phase 1 immediate は priority labels のみ"
  - "DP-001 C-2/C-3/C-4 関連禁止"
  - "DO-FACTORY-233 別 block 継続"
  - "G-009〜G-012 EVT-121 から分離"
  - "工場長直接指示禁止"
  - "Auto push / alert / enforcement 禁止"
applied_yasu_required_fields:
  supervisor_13: [target_repo, target_path, execution_mode, required_permissions, command_invocation, expected_normal_output, expected_warning_output, expected_failure_output, exit_code_contract, false_positive_handling, operator_burden, rollback_method, approval_owner]
  commander_10: [observation_evidence, countermeasure_candidate, target_repository, trigger_condition, expected_output, failure_mode, false_positive_handling, operator_burden, approval_owner, rollback_method]
---

# EVT-121 Revised Staging Pack v2(supervisor + commander 統合改訂)

## 1. 用語(再確認)

priority labels(P0 / root treatment / Phase 1 immediate)= 提案上の優先度マーキング、**ヤス採否ラベルではない**。各装置は段階個別ヤス採否(staging → sample → pilot → enforce、`adoption_matrix_v1.md` 参照)。

---

## 2. Supervisor-Side 4 staging 改訂(13 フィールド構造化)

### 2-A. claude_md_section4_revision(§4-D + §4-E)

| field | value |
|---|---|
| target_repo | record-x-supervisor |
| target_path | CLAUDE.md(本体、§4-A 後に §4-D + §4-E 追加) |
| execution_mode | document edit(human-readable, AI 起動時必読) |
| required_permissions | Edit on CLAUDE.md(ヤス採否完遂後のみ) |
| command_invocation | N/A(文書改訂、コマンド実行なし) |
| expected_normal_output | §4-D + §4-E がチェックリストとして表示、各 instance 起動時に自己点検 |
| expected_warning_output | N/A(文書、output なし) |
| expected_failure_output | 違反検出時 = EVT 候補正式記録(系列 X) |
| exit_code_contract | N/A |
| false_positive_handling | チェックリスト項目誤答 → 自己訂正経路 + EVT 候補(対症療法癖検出) |
| operator_burden | 起動時 +30 秒(自己点検 7 項目)、運用継続 |
| rollback_method | git revert + handoff §1 必読リスト戻し |
| approval_owner | ヤス(CLAUDE.md 本体改訂は ヤス採否必須) |

### 2-B. verification-before-completion discipline

| field | value |
|---|---|
| target_repo | record-x-supervisor |
| target_path | 文書規律(`operations/role_and_conduct.md` または CLAUDE.md §4-E、本体反映前は staging) |
| execution_mode | manual skill invocation(完了報告作成 直前) |
| required_permissions | superpowers:verification-before-completion 起動権限 |
| command_invocation | Skill `superpowers:verification-before-completion`(手動起動) |
| expected_normal_output | 5 項目検証(local/remote push state + unpushed count + stage 0 mirror + claimed files exist + claimed commits exist)結果 = ALL PASS / Issues found |
| expected_warning_output | 1-3 項目不一致 = warning + 報告 draft 訂正経路 |
| expected_failure_output | claimed item missing = report 内記述削除 / 訂正 / 認知開示記述追加 |
| exit_code_contract | N/A(skill 出力、人間判断) |
| false_positive_handling | 既知 false positive(改番済 ID / EVT-120 documented / duplicate ID)= mapping 適用 |
| operator_burden | 完了報告作成毎 +1-2 分(skill 起動時間)|
| rollback_method | 規律違反時 = EVT 候補正式記録(規律装置不在物理証拠累積) |
| approval_owner | ヤス(規律即時運用採否) |

### 2-C. push_state_check.ps1(手動 script)

| field | value |
|---|---|
| target_repo | record-x-supervisor(supervisor + commander の git state を read-only で query) |
| target_path | scripts/observability/push_state_check.ps1(ヤス採否完遂後配置) |
| execution_mode | manual(spawn pwsh.exe、自動起動なし) |
| required_permissions | git read(fetch + log + rev-parse + branch)、ls / Get-ChildItem |
| command_invocation | `pwsh.exe scripts/observability/push_state_check.ps1 [-Format Markdown\|JSON] [-Repo Both\|Supervisor\|Commander]` |
| expected_normal_output | (synced) Markdown table + status 🟢 |
| expected_warning_output | (ahead/behind) Markdown table + status 🟡 |
| expected_failure_output | (diverged/no-remote/fetch-failure) Markdown table + status 🔴 |
| exit_code_contract | 0 always(read-only、failure は表示のみ、exit 1 なし)|
| false_positive_handling | dirty worktree / detached HEAD = 警告表示 + 続行(operator 判断) |
| operator_burden | 1 回実行 ≈ 5 秒(git fetch 含む)|
| rollback_method | script 削除(ファイル単体、依存なし)|
| approval_owner | ヤス(scripts/ 配置採否) |
| **明示禁止** | **never executes:** git push / branch mutation / reset / checkout / merge / rebase / file edits |

#### 2-C-i. Sample outputs(10 種、Markdown 簡略形式)

```markdown
# 1. synced sample(両 repo 同期、stage_0_mirror 健全)
| repo | local | remote | unpushed | branch | status |
|---|---|---|---|---|---|
| supervisor | abc1234 | abc1234 | 0 | main | 🟢 synced |
| commander  | def5678 | def5678 | 0 | main | 🟢 synced |
stage_0_mirror: outbox 147 / commander 141(直下 21 + 完了 120)/ diff 6(🟡 verify needed)
evidence: git fetch + rev-parse + ls (timestamp: <ISO8601>)

# 2. ahead sample(unpushed 1 件)
| supervisor | xyz9999 | abc1234 | 1 | main | 🟡 ahead 1 |

# 3. behind sample(remote が先行)
| supervisor | abc1234 | xyz9999 | 0 | main | 🔴 behind N |
note: remote ahead by N commits, suggests external push

# 4. diverged sample(両方 ahead/behind)
| supervisor | <hash> | <hash> | N | main | 🔴 diverged |
note: ヤス採否経由で merge / rebase 経路、auto resolution なし

# 5. no-remote sample
| supervisor | abc1234 | -- | -- | main | 🔴 no-remote |
note: origin not configured, evidence_command output: "fatal: 'origin' does not appear..."

# 6. dirty-worktree sample
| supervisor | abc1234 | abc1234 | 0 | main | 🟢 synced |
warning: dirty worktree detected (M: 3 files, ?? : 5 files), operator review required

# 7. fetch-failure sample
| supervisor | abc1234 | (last known) abc0000 | (stale) | main | 🟡 fetch failed |
note: git fetch failed (network/permission), reporting last known remote state

# 8. Markdown format(default、§2-C 全例)
# 9. JSON format(機械可読、verification skill 統合用)
{ "report_id": "...", "repos": [...], "stage_0_mirror": {...}, "evidence_command": "..." }

# 10. 最終報告必須文言(footer 標準形式、ヤス採否「全完了報告に push state を入れる」)
---
### Push State(verification-before-completion 規律遵守、本完了報告作成時点)
| repo | local | remote | unpushed | branch | status |
|---|---|---|---|---|---|
...
```

### 2-D. report_footer_generator.ps1

| field | value |
|---|---|
| target_repo | record-x-supervisor |
| target_path | scripts/observability/report_footer_generator.ps1 |
| execution_mode | manual(spawn pwsh、`Set-Clipboard` 任意統合) |
| required_permissions | push_state_check.ps1 呼び出し権限 |
| command_invocation | `pwsh.exe scripts/observability/report_footer_generator.ps1 [-IncludePushState] [-IncludeStage0Mirror] [-IncludeEvidence]` |
| expected_normal_output | Markdown footer(§2-C-i #10)= 報告末尾コピペ用 |
| expected_warning_output | dirty worktree warning footer 内記述 |
| expected_failure_output | push_state_check 失敗時 = "fetch failed" footer 表示 + operator 判断 |
| exit_code_contract | 0 always |
| false_positive_handling | stale footer 再利用防止 = 必ず実行毎の timestamp 添付 + 古い footer 識別可能化 |
| operator_burden | 1 回 ≈ 5 秒 + 手動コピペ |
| rollback_method | script 削除 |
| approval_owner | ヤス(scripts/ 配置採否)|
| **明示禁止** | hook ではない、自動添付しない、手動コピペ運用のみ |

#### 2-D-i. Sample footers(8 種)

```markdown
# F1. synced state footer
---
### Push State
| supervisor | abc1234 | abc1234 | 0 | main | 🟢 synced |
| commander  | def5678 | def5678 | 0 | main | 🟢 synced |
stage_0_mirror: outbox 147 / commander 141 / diff 6(🟡 verify needed)
evidence: git fetch + log + ls (timestamp: 2026-05-08T...)

# F2. unpushed state footer
| supervisor | xyz9999 | abc1234 | 1 | main | 🟡 ahead 1 |

# F3. dirty-worktree footer(warning 添付)
| supervisor | abc1234 | abc1234 | 0 | main | 🟢 synced |
warning: dirty worktree(M:3, ??:5)、状態反映前を含む可能性

# F4. fetch-failure footer
| supervisor | abc1234 | (stale, fetch failed) | (unknown) | main | 🟡 fetch failed |
note: 最終 fetch 成功時刻 + 失敗理由 footer 内表示

# F5. how stale footer reuse is prevented
- 必ず実行毎の `Get-Date -Format 'o'` timestamp + git rev-parse 結果埋め込み
- 古い footer は timestamp で識別可能 = 5 分以上前は stale 扱い

# F6. timestamp + repo path 表示形式
- timestamp = ISO8601(`2026-05-08T03:30:15+09:00`)
- repo path = `cwd: <PWD>` を footer に併記

# F7. stage_0_mirror status without overclaiming
- diff = 数値表示のみ、🟡 verify needed(🔴 broken と即断しない、Reconciliation Note 経由判定)
- 「broken」label 自動付与禁止(counting mismatch 候補時は verify needed)

# F8. 手動 vs 自動添付
- 本案 = 手動コピペ
- 自動添付 = Stop hook 化(将来候補、ヤス保留中)
```

---

## 3. Commander-Side 5 区分 改訂(10 フィールド構造化)

### 3-A. A 区分 文書ルール

| field | value |
|---|---|
| observation_evidence | EVT-121 §6-J 補強 4(司令官 SSOT 陳腐化、active 53 / completed 49 / 流入不全 45)|
| countermeasure_candidate | commander CLAUDE.md / AGENTS.md に SSOT 整合 + completion_reports パイプライン規律明記 |
| target_repository | record-x-commander |
| trigger_condition | 司令官 α セッション起動時、必読 |
| expected_output | チェックリスト形式の規律(処理前確認 + 処理後確認) |
| failure_mode | 文書規律のみ = AI に守られない再発リスク(EVT-118 同型) |
| false_positive_handling | N/A(文書、検出装置なし) |
| operator_burden | 起動時 +30 秒(必読) |
| approval_owner | ヤス(CLAUDE.md 本体改訂)|
| rollback_method | git revert |

### 3-B. B 区分 Skill 起動

| field | value |
|---|---|
| observation_evidence | 同上 + 司令官 α 完了処理時の 5 項目未検証履歴 |
| countermeasure_candidate | superpowers:verification-before-completion 標準起動(完了処理前 5 項目検証) |
| target_repository | record-x-commander(司令官 α セッション内) |
| trigger_condition | 司令官 α が「処理完了」declarations 直前 |
| expected_output | 5 項目検証結果(completion_reports 未処理ゼロ / pull 結果 / process 結果 / active 残 merged 残存 / ticket_id_mapping 更新)|
| failure_mode | skill 起動忘却 → 規律違反継続(B 区分単独では再発)|
| false_positive_handling | active 残 merged 残存 = ticket_id_mapping(改番)+ EVT-120 documented(自前採番)で除外 |
| operator_burden | 完了処理毎 +1-2 分 |
| approval_owner | 司令官 α + ヤス(運用採否)|
| rollback_method | 規律違反時 = EVT 候補正式記録 |

### 3-C. C 区分 SessionStart hook(display-only)

| field | value |
|---|---|
| observation_evidence | 司令官 α 起動時に SSOT 状態認識ラグ(commander vs factory completion_reports)|
| countermeasure_candidate | SessionStart hook 6 項目自動表示(active / completed / 未処理 reports / HQ pull 可能 / active_already_merged 疑い / P0 housekeeping)|
| target_repository | record-x-commander |
| trigger_condition | 司令官 α Claude Code session 起動時 |
| expected_output | banner display 6 項目(数値 + status icon)= **display-only、enforcement なし** |
| failure_mode | hook script error = fail open(起動阻害しない、警告表示 + 続行) |
| false_positive_handling | active_already_merged 疑い件数 = 4 点照合 script 出力流用、既知 mapping 除外 |
| operator_burden | 起動時 +5-10 秒(script 実行)、表示のみ + 認知負荷増 |
| approval_owner | 司令官 α + ヤス + Hook Ticket Template v1 適用 |
| rollback_method | settings.json hooks entry 削除 |

#### 3-C-i. Sample outputs

```
# Sample 1: normal output(全件健全)
╔══════════════════════════════════════════╗
║ 司令官 α SessionStart Observability Check ║
╠══════════════════════════════════════════╣
║ active: 108 (DO-COMMON 53 / DO-CP 4 / ...)║
║ completed: 49                              ║
║ 未処理 completion_reports: 28              ║
║ HQ pull 可能: 0(staging 不在)             ║
║ active_already_merged 疑い: 推定 23         ║
║ P0 housekeeping 対象: 35+ 件               ║
╚══════════════════════════════════════════╝

# Sample 2: warning output(差分大)
🟡 WARNING: active_already_merged 疑い 23 件超過、housekeeping 推奨

# Sample 3: blocking output
N/A(display-only、enforcement なし、blocking しない)

# Sample 4: display-only vs enforcement
- 本案 = display-only
- enforcement = false-positive review 後の Phase 5(将来 ヤス採否)

# Sample 5: false-positive examples
- ticket_id_mapping(DO-CP-043→101)= mapping 適用後 false positive 解消
- EVT-120 documented(DO-CODEX-MIG-*)= 既知 alert 除外候補
- duplicate ID(DO-CP-032)= mapping §3 拡張対象
```

### 3-D. C 区分 PostToolUse hook(operation-conditional)

| field | value |
|---|---|
| observation_evidence | sync / process / move / WAVE 後の差分検出ラグ |
| countermeasure_candidate | PostToolUse hook(matcher: Bash + 特定 command 一致時)で自動差分確認 |
| target_repository | record-x-commander |
| trigger_condition | `sync-tickets.ps1` / `pull-completion-reports.ps1` / `process-completion-reports.ps1` / `git mv tickets_completed/` 実行直後 |
| expected_output | 差分 report stderr or log + display(差分 > 5 で警告)|
| failure_mode | hook script error = fail open + log |
| false_positive_handling | 既知 mapping + EVT-120 documented 除外 |
| operator_burden | 操作毎 +2-3 秒 |
| approval_owner | 司令官 α + ヤス + Hook Ticket Template v1 適用 |
| rollback_method | settings.json hooks entry 削除 |

### 3-E. D 区分 pull-completion-reports.ps1 強化 + cross_repo_diff_check

(構造化 10 フィールドは §3-A〜D と同型、紙幅省略、commander_observability_design_v2 で完全版)

### 3-F. E 区分 GHA workflow(根本治療候補、要 sample artifacts)

| field | value |
|---|---|
| observation_evidence | HQ staging/completion_reports/ ディレクトリ不在(本サイクル物理確証)= 上流装置欠落 |
| countermeasure_candidate | factory PR merge → completion_report JSON 自動生成 GHA |
| target_repository | ProjectRX(`.github/workflows/auto_completion_report.yml`)|
| trigger_condition | `pull_request` event, `closed`, `merged: true` |
| expected_output | completion_report JSON(ticket_id + PR# + merged_at + commit hash + verifying_actor + hash_chain) |
| failure_mode | workflow 失敗 = log + continue(merge 阻害しない、fail open) |
| false_positive_handling | 自前採番疑い検出 = workflow log warning + EVT-120 第 N 例候補 issue 起票 |
| operator_burden | merge 毎 +30 秒(workflow 実行時間)|
| approval_owner | 司令官 α + 工場長 + ヤス(三者合議、三社円卓 X-4 候補)|
| rollback_method | workflow ファイル削除 + revert |

#### 3-F-i. Sample artifacts(ヤス指示 10 項目反映)

```
1. target repository: ProjectRX
2. exact trigger event: pull_request, types: [closed], condition: github.event.pull_request.merged == true
3. generated artifact path: 案 (a) ProjectRX/staging/completion_reports/<ticket_id>.json / 案 (b) HQ deploy key 経由 push
4. sample generated completion_report JSON:
   {
     "ticket_id": "DO-COMMON-W2-007",
     "pr_number": 1465,
     "pr_title": "feat(common): tenant Care 施設境界型 [DO-COMMON-W2-007]",
     "merged_at": "2026-05-07T15:56:33Z",
     "merge_commit_sha": "abc1234...",
     "head_branch": "feat/factory-common-tenant-care-do-w2-007",
     "verifying_actor": "github_actions_auto",
     "generated_by": "auto_completion_report.yml v1",
     "hash_chain": "sha256_of_above"
   }
5. sample failure output:
   - "skipped: PR title regex no match" → label PR "completion-report-skipped"
   - "warning: self-numbering suspect (DO-CODEX-* prefix)" → issue auto-create
6. duplicate report prevention logic:
   - 既存 file 存在チェック → 上書き禁止 + warning log
   - hash_chain verify(改竄検出)
7. behavior on partial merge: 本 workflow は完全 merge のみ trigger(partial merge は GitHub 仕様外)
8. behavior on reverted PR:
   - revert PR (新 PR for revert) merge 時 = 別 ticket_id mapping 経路、completion_report は revert 用 separate JSON
   - 元 ticket の completion_report は削除しない(史実保持原則)+ revert 関連付けメタデータ追加
9. required secrets/permissions:
   - 案 (a) ProjectRX 内 staging: contents: write
   - 案 (b) HQ deploy key: deploy_key with write access to HQ staging path
10. rollback procedure: workflow 削除 + commit revert + 既生成 completion_reports 残存(史実保持)
```

---

## 4. Risk Section(ヤス指示 8 項目必須)

| # | リスク | 緩和策 | 状態 |
|---|---|---|---|
| 1 | over-automation | 各装置 manual / display-only 先行、enforcement は最終段階 | mitigated |
| 2 | alert fatigue | threshold 段階(🟢🟡🔴)+ FP 除外 mapping | mitigated |
| 3 | false confidence | sample review 段階で FP 評価必須 | mitigated |
| 4 | cross-repo authority confusion | 司令官 α 経由 関係性ポリシー §3.2 遵守 + Strategy Lab 経路分離 | mitigated |
| 5 | Factory/Commander boundary | C 区分 hook = commander side のみ、factory hook は別 ライン(DO-FACTORY-233 後) | mitigated |
| 6 | completion_report duplication | 既存 file 存在チェック + hash_chain verify(§3-F-i 6) | mitigated |
| 7 | stale SSOT correction | reconciliation note(本案 + Stage 0 Mirror Note v1)経由人間確証必須 | mitigated |
| 8 | human approval bypass | 各段階個別 ヤス採否(adoption_matrix_v1.md)+ enforcement 最終段階のみ | mitigated |

= **全リスク mitigation 経路明示、unresolved なし**

---

## 5. ヤス採否要件(本サイクル次決定 scope)

### 5-A. Supervisor-side(ヤス指定)

「approve only sample review preparation for `verification-before-completion` and `push_state_check`」

= **§2-B + §2-C** の **sample 段階移行のみ** 採否対象

### 5-B. Commander-side(ヤス指定)

「approve only the creation of sample outputs and adoption matrix for E category GHA and C category SessionStart hook」

= **§3-C(SessionStart)+ §3-F(E GHA)** の **sample artifacts 作成のみ** 採否対象

### 5-C. 不採否対象(本サイクルでは ヤス採否要請しない)

- §2-A(CLAUDE.md §4-D/§4-E 本体反映)
- §2-D(report footer generator 配置)
- §3-A(commander 文書改訂本体)
- §3-B(commander Skill 標準起動運用)
- §3-D(PostToolUse hook)
- §3-E(D 区分 script)
- 全 enforcement / pilot / live edit

---

## 6. 改訂履歴

- v2.0(2026-05-08 朝中盤後末末):2 件 REVIEWED_NOT_APPROVED + revised staging pack 要請契機。supervisor 4 staging を 13 フィールド構造化 + push_state_check sample 10 種 + report_footer sample 8 種 + commander 5 区分を 10 フィールド構造化 + E GHA sample artifacts 10 項目 + Risk section 8 項目 mitigation + ヤス採否次決定 scope 限定(supervisor: §2-B/§2-C sample / commander: §3-C/§3-F sample artifacts のみ)統合。

---

*監督官 A EVT-121 Revised Staging Pack v2(staging、ヤス採否対象、bundle 禁止 + 段階個別採否 + sample 段階のみ次決定 scope)*
