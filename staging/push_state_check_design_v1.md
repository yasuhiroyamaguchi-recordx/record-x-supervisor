---
id: PUSH-STATE-CHECK-DESIGN-v1
title: push-state check 設計 v1(Y5/Y6 統合判断材料、3 装置統合 = script + Skill + Hook)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
yasu_decision_history:
  - "2026-05-08 朝中盤後: ヤス追加要求 = push-state check + verification-before-completion skill + SessionStart hook + Report Footer 統合判断材料"
related_evt: EVT-20260508-121 §6-J 補強 2(第 2 例物理証拠)
related_orders: [128-138]
related_policies: [SUPERVISOR-HOOK-SKILL-PROPOSAL-POLICY-v1]
ticket_type: integrated_observability_design
applied_proposal_classification: B + C + D(統合三層防護、Hook/Skill Proposal Policy v1 §6-A 適用例)
---

# push-state check 設計 v1(3 装置統合、Y5/Y6 統合判断材料)

## 1. Goal(統合目的)

ヤス指示「push 済みかどうかを監督官が誤認しない仕組み」+ 「文書規律ではなく hooks / skills / scripts に落とす」+ 「verification-before-completion skill 標準起動」を 3 装置で物理装置化:

- 装置 1(D 区分):script(push-state check + 4 点照合統合)
- 装置 2(B 区分):Skill 標準起動(verification-before-completion + 5 項目検証)
- 装置 3(C 区分):Hook(SessionStart 自動表示 + Stop 報告 footer 自動添付)

= **三層防護**(誤認構造的防止 = 監督官が忘れても表示される)

---

## 2. 装置 1(D)— Script: push-state check + 4 点照合統合

### 2-A. 配置 / 仕様

| 項目 | 内容 |
|---|---|
| script_path | `scripts/observability/push_state_check.ps1` |
| runtime | pwsh.exe(powershell.exe フォールバック)|
| trigger | (a) 手動実行 + (b) 4 点照合 script から呼び出し + (c) Hook 経由(後述 §4)|
| input | git repo path(supervisor + commander、参照のみ) |
| output | JSON or Markdown(format パラメータ)|

### 2-B. 出力 schema(JSON 形式、機械可読)

```json
{
  "report_id": "PUSH-STATE-YYYYMMDD-HHMMSS",
  "generated_at": "<ISO8601>",
  "supervisor": {
    "local_head": "<sha>",
    "remote_head": "<sha>",
    "unpushed_count": 0,
    "current_branch": "main",
    "push_status": "synced | ahead_N | behind_N | diverged",
    "fetch_freshness_sec": 30
  },
  "commander": {
    "local_head": "<sha>",
    "remote_head": "<sha>",
    "unpushed_count": 0,
    "current_branch": "main",
    "push_status": "synced | ahead_N | behind_N | diverged"
  },
  "stage_0_mirror": {
    "supervisor_outbox_count": N,
    "commander_inbox_count": M,
    "diff": [<filenames present in outbox but absent in commander_inbox>],
    "mirror_health": "synced | partial | broken"
  },
  "evidence_command": "git fetch + git log + ls",
  "alert_level": "🟢 | 🟡 | 🔴"
}
```

### 2-C. Markdown 出力(人間可読、報告 footer 用)

```markdown
## Push State YYYY-MM-DD HH:MM:SS

| repo | local | remote | unpushed | branch | status |
|---|---|---|---|---|---|
| supervisor | <hash7> | <hash7> | 0 | main | 🟢 synced |
| commander | <hash7> | <hash7> | 0 | main | 🟢 synced |

| stage 0 mirror | outbox | commander inbox | diff |
|---|---|---|---|
| count | 15 | 15 | 0(🟢 synced) |

evidence: `git fetch + git log` (timestamp: <ISO8601>)
```

---

## 3. 装置 2(B)— Skill 標準起動: verification-before-completion(完了報告前必須)

### 3-A. 起動規律(運用、CLAUDE.md §4-D 候補統合)

```markdown
## 4-E. 完了報告前必須検証(本 Policy v1 統合候補)

完了報告(ヤス向け / 司令官向け / Strategy Lab 向け)作成 **直前** に、以下を **必須起動**:

- superpowers:verification-before-completion(主装置)

検証 5 項目(Skill 内で実行):

1. local/remote push state(`git fetch + git log origin/main..HEAD`)
2. unpushed count(`git rev-list --count`)
3. stage 0 mirror 配送状態(supervisor outbox vs commander inbox)
4. claimed files actually exist(報告内 file path 全件 Test-Path 確認)
5. claimed commits actually exist(報告内 commit hash 全件 git cat-file -e 確認)

不一致検出時 = 報告内容訂正 + 認知開示(EVT 候補正式記録)
```

### 3-B. Skill 起動経路

| 起動 trigger | 経路 |
|---|---|
| 監督官完了報告作成時 | superpowers:verification-before-completion 手動起動(規律遵守) |
| Skill 内部から push_state_check.ps1 呼び出し | 装置 1(D)経由で 5 項目検証実行 |
| 検証結果を報告に統合 | Skill 出力を完了報告 §の前に配置 |

### 3-C. 既存 Skill との関係

| Skill | 用途 |
|---|---|
| superpowers:verification-before-completion | **本 Policy 主装置**(本サイクル統合候補)|
| superpowers:writing-plans | 発令起案前(Plan-First) |
| superpowers:receiving-code-review | 司令官逆査読受領時 |
| superpowers:brainstorming | 構造方針見直し前 |

= **既存 Skill 活用、新規装置追加なし**(B 区分、ガレージ §1.5 整合)

---

## 4. 装置 3(C)— Hook: SessionStart + Stop(自動表示 + 自動添付)

### 4-A. SessionStart Hook(起動時 7 項目自動表示)

```yaml
hook_name: sessionstart_observability_check
script_path: C:\RX_Dev\record-x-supervisor\.claude\hooks\sessionstart_observability_check.ps1
matcher: SessionStart
trigger: 監督官 A セッション起動時
actions:
  - call: scripts/observability/push_state_check.ps1
  - display 起動 banner(7 項目):
      1. current_branch (supervisor + commander)
      2. local HEAD (supervisor)
      3. remote HEAD (supervisor)
      4. unpushed_count (supervisor)
      5. latest handoff timestamp(`handoff/` 最新ファイル mtime)
      6. stale_handoff_warning(latest handoff timestamp > 24h なら警告)
      7. open_evt_count + pending_yasu_decisions_count(`archive/error_patterns.md` + `MEMORY.md` 等から query)

example_output:
  ```
  ╔══════════════════════════════════════════╗
  ║ 監督官 A セッション起動 自動表示          ║
  ╠══════════════════════════════════════════╣
  ║ supervisor: main 45b23ea (synced 🟢)      ║
  ║ commander: main <hash> (synced 🟢)        ║
  ║ unpushed: 0                                ║
  ║ latest handoff: 2026-05-04 (4 days ago ⚠️) ║
  ║ open EVT: 5 (117/118/119/120/121)          ║
  ║ pending Yasu decisions: 4 (Y1/Y2/Y4-B/Y5)  ║
  ╚══════════════════════════════════════════╝
  ```
```

### 4-B. Stop Hook or PostToolUse Hook(報告 footer 自動添付)

```yaml
hook_name: report_footer_auto_attach
script_path: C:\RX_Dev\record-x-supervisor\.claude\hooks\report_footer_auto_attach.ps1
matcher: Stop
trigger: 監督官 A 報告生成時(セッション完了時 or 明示 trigger)
actions:
  - call: scripts/observability/push_state_check.ps1 -Format Markdown
  - 報告本文末尾に自動 footer 添付(7 項目):
      1. push state(supervisor + commander)
      2. cwd (`Get-Location`)
      3. repo (`git remote -v`)
      4. branch (`git branch --show-current`)
      5. local hash (`git rev-parse HEAD`)
      6. remote hash (`git rev-parse origin/main`)
      7. unpushed count (`git rev-list --count`)
  - evidence_timestamp(`Get-Date -Format 'o'`)

footer_template:
  ```markdown
  ---
  ### 監督官 A 自動 footer(verification-before-completion 規律統合)
  - cwd: C:\RX_Dev\record-x-supervisor
  - repo: <remote URL>
  - branch: main
  - local: 45b23ea(2026-05-08T03:15:00+09:00)
  - remote: 45b23ea(synced 🟢)
  - unpushed: 0
  - stage_0_mirror: outbox 15 / inbox 15 / diff 0(🟢)
  - evidence: git fetch + log + ls(timestamp 2026-05-08T03:15:30+09:00)
  ```
```

### 4-C. Hook 設計 = Hook Ticket Template v1 適用

```yaml
hook_contract(SessionStart):
  target_runtime: Claude Code (SessionStart hook)
  config_path: C:\RX_Dev\record-x-supervisor\.claude\settings.json
  hook_key: hooks.SessionStart[]
  hook_script_path: C:\RX_Dev\record-x-supervisor\.claude\hooks\sessionstart_observability_check.ps1
  block_exit_code: N/A(SessionStart は block しない、表示のみ)
  fail_open_policy:
    - script error → display warning + continue(起動阻害しない)
    - git fetch failure → display "remote unreachable" + continue
  cwd_assumption: irrelevant(script-local + 絶対パス併用)
  log_path: $scriptDir/../../logs/sessionstart_hook.log
  log_format: JSON Lines
  rollback_path: settings.json hooks.SessionStart entry 削除

hook_contract(Stop):
  target_runtime: Claude Code (Stop hook)
  ... (同型展開)
```

---

## 5. 統合効果 — ヤス指示「誤認構造的防止」の達成経路

| ヤス指示 | 装置(統合)|
|---|---|
| 「push 済みかどうかを監督官が誤認しない仕組み」 | 装置 1(script)+ 装置 3(Hook、SessionStart 起動時自動表示)|
| 「verification-before-completion skill 標準起動」 | 装置 2(Skill、完了報告前必須) |
| 「SessionStart hook で起動時自動表示」 | 装置 3(Hook、SessionStart 7 項目)|
| 「Report Footer 自動添付」 | 装置 3(Hook、Stop 7 項目)|
| 「文書規律だけでは弱い、忘れる前提」 | 装置 2(Skill 起動規律)+ 装置 3(Hook 自動実行)|
| 「push 自動化はまだ不要」 | 全装置 read-only(`git fetch` のみ、`git push` 自動化なし)|

= **誤認構造的防止 = 監督官が忘れても表示される**

---

## 6. 装置数 / ガレージ §1.5 評価

| 装置 | 区分 | 装置数追加 | 既存活用 |
|---|---|---|---|
| 1(D) push_state_check.ps1 | Script | +1 | 既存 4 点照合 script 統合可 |
| 2(B) verification-before-completion 標準起動 | Skill | ±0 | 既存 superpowers Skill |
| 3(C) SessionStart hook | Hook | +1 | supervisor `pretooluse_breaker_block.ps1` 同型展開 |
| 3(C) Stop hook | Hook | +1 | 同上 |

合計:**+3 件**(script 1 + hook 2)+ Skill 既存活用

簡素化原則整合:**ヤス採否経路必須**(構造方針見直しに該当)

---

## 7. ヤス採否経路(段階)

| 段階 | 内容 | 採否事項 |
|---|---|---|
| Phase 1A | 装置 1(script)= push_state_check.ps1 配備 | Y5 完全採択 |
| Phase 1B | 装置 2(Skill 標準起動規律)= 文書規律改訂(CLAUDE.md §4-E)+ 運用励行 | 文書改訂、軽量採否 |
| Phase 1C | 装置 3(SessionStart + Stop hooks)| Y6 採否(段階起動 = SessionStart 先行 + Stop 検証後)|

= **段階的採否で複雑性管理**

---

## 8. 改訂履歴

- v1.0(2026-05-08 朝中盤後):初版起案、ヤス追加要求(push-state check + verification-before-completion skill + SessionStart hook + Report Footer 統合)契機。3 装置統合(D Script + B Skill + C Hook)+ Hook Ticket Template v1 適用 + Hook/Skill Proposal Policy v1 §6-A 例適用 + 段階採否経路 統合。

---

*監督官 A push-state check 設計 v1(staging、ヤス Y5/Y6 統合判断材料、commit 配置のみ)*
*「3 装置統合(D + B + C)= 誤認構造的防止 + push 自動化なし(read-only)+ Hook Ticket Template v1 適用 + 装置数 +3 件 既存 Skill 活用」*
