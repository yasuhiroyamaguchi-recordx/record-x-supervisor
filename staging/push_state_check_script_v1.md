---
id: PUSH-STATE-CHECK-SCRIPT-v1
title: push_state_check.ps1 手動実行 script 実装案 v1(Y5 中核採択候補、自動 push なし、自動確認のみ)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
yasu_decision_history:
  - "2026-05-08 朝中盤後末: ヤス採否「Y5 中核採択候補、手動実行 script として実装案を優先、自動 push 不要、自動確認だけ」"
yasu_constraints:
  - "自動 push なし"
  - "自動 alert なし(Phase 1 範囲内)"
  - "SessionStart / Stop hook 化禁止(本案の範囲外)"
target_path: scripts/observability/push_state_check.ps1(ヤス採否完遂後に配置)
ticket_type: script_implementation_proposal
---

# push_state_check.ps1 手動実行 script 実装案 v1

## 1. 目的

監督官 A が完了報告作成前に **手動実行** で push 状態を確証(EVT-121 補強 2 第 2 例物理証拠への対症)。

ヤス採否制約反映:
- 🚫 自動 push なし(`git push` コマンド非実行)
- 🚫 自動 alert なし(stderr 出力のみ、人間判断)
- 🚫 hook 化なし(SessionStart / Stop は将来候補、本案の範囲外)
- ✅ 手動実行のみ(`pwsh.exe scripts/observability/push_state_check.ps1`)

---

## 2. 配置 / 仕様

| 項目 | 内容 |
|---|---|
| 配置 | `C:\RX_Dev\record-x-supervisor\scripts\observability\push_state_check.ps1`(新規)|
| runtime | pwsh.exe(powershell.exe フォールバック)|
| trigger | **手動実行のみ**(Bash/PowerShell から spawn)|
| input parameter | `-Format Markdown\|JSON`(default: Markdown)、`-Repo Both\|Supervisor\|Commander`(default: Both) |
| output | stdout(report 形式)|
| side effect | git fetch のみ(read-only)、push なし |

---

## 3. 動作仕様(疑似コード)

```powershell
# scripts/observability/push_state_check.ps1
param(
    [ValidateSet('Markdown', 'JSON')]
    [string]$Format = 'Markdown',
    [ValidateSet('Both', 'Supervisor', 'Commander')]
    [string]$Repo = 'Both'
)

$ErrorActionPreference = 'Stop'

function Get-RepoState {
    param([string]$RepoPath, [string]$RepoName)

    Push-Location $RepoPath
    try {
        # read-only fetch(自動 push しない)
        git fetch origin --quiet 2>$null

        $localHead = git rev-parse HEAD 2>$null
        $remoteHead = git rev-parse origin/main 2>$null
        $unpushedCount = git rev-list --count origin/main..HEAD 2>$null
        $branch = git branch --show-current 2>$null

        # status 判定
        $status = if ($unpushedCount -eq '0' -and $localHead -eq $remoteHead) {
            '🟢 synced'
        } elseif ($unpushedCount -gt '0') {
            "🟡 ahead $unpushedCount"
        } else {
            '🔴 diverged'
        }

        return @{
            repo = $RepoName
            local = $localHead.Substring(0, 7)
            remote = $remoteHead.Substring(0, 7)
            unpushed = $unpushedCount
            branch = $branch
            status = $status
        }
    }
    finally {
        Pop-Location
    }
}

# stage 0 mirror 配送状態(supervisor → commander inbox)
function Get-Stage0MirrorState {
    $supervisorOutbox = (Get-ChildItem 'C:\RX_Dev\record-x-supervisor\outbox\*.md' -ErrorAction SilentlyContinue).Count
    $commanderInbox = (Get-ChildItem 'C:\RX_Dev\record-x-commander\inbox\*.md' -ErrorAction SilentlyContinue).Count
    $diff = [Math]::Abs($supervisorOutbox - $commanderInbox)
    $health = if ($diff -eq 0) { '🟢 synced' } elseif ($diff -le 3) { '🟡 partial' } else { '🔴 broken' }
    return @{
        outbox_count = $supervisorOutbox
        inbox_count = $commanderInbox
        diff = $diff
        health = $health
    }
}

# 実行
$results = @()
if ($Repo -in @('Both', 'Supervisor')) {
    $results += Get-RepoState -RepoPath 'C:\RX_Dev\record-x-supervisor' -RepoName 'supervisor'
}
if ($Repo -in @('Both', 'Commander')) {
    $results += Get-RepoState -RepoPath 'C:\RX_Dev\record-x-commander' -RepoName 'commander'
}
$mirror = Get-Stage0MirrorState

# 出力
if ($Format -eq 'JSON') {
    $output = @{
        report_id = "PUSH-STATE-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        generated_at = (Get-Date -Format 'o')
        repos = $results
        stage_0_mirror = $mirror
        evidence_command = 'git fetch + git rev-parse + ls'
    } | ConvertTo-Json -Depth 5
    Write-Output $output
} else {
    Write-Output ""
    Write-Output "## Push State $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Output ""
    Write-Output "| repo | local | remote | unpushed | branch | status |"
    Write-Output "|---|---|---|---|---|---|"
    foreach ($r in $results) {
        Write-Output "| $($r.repo) | $($r.local) | $($r.remote) | $($r.unpushed) | $($r.branch) | $($r.status) |"
    }
    Write-Output ""
    Write-Output "stage_0_mirror: outbox $($mirror.outbox_count) / commander inbox $($mirror.inbox_count) / diff $($mirror.diff)($($mirror.health))"
    Write-Output ""
    Write-Output "evidence: git fetch + rev-parse + ls (timestamp: $(Get-Date -Format 'o'))"
}
```

---

## 4. 出力例(Markdown 形式、本日想定)

```markdown
## Push State 2026-05-08 03:30:15

| repo | local | remote | unpushed | branch | status |
|---|---|---|---|---|---|
| supervisor | ed87e0a | 6f5f04d | 1 | main | 🟡 ahead 1 |
| commander  | <hash> | <hash> | <N> | main | <status> |

stage_0_mirror: outbox <count> / commander inbox <count> / diff <count>(<health>)

evidence: git fetch + rev-parse + ls (timestamp: 2026-05-08T03:30:15+09:00)
```

---

## 5. 出力例(JSON 形式、機械可読、verification skill 統合候補)

```json
{
  "report_id": "PUSH-STATE-20260508-033015",
  "generated_at": "2026-05-08T03:30:15+09:00",
  "repos": [
    {
      "repo": "supervisor",
      "local": "ed87e0a",
      "remote": "6f5f04d",
      "unpushed": "1",
      "branch": "main",
      "status": "🟡 ahead 1"
    },
    ...
  ],
  "stage_0_mirror": {
    "outbox_count": 17,
    "inbox_count": 17,
    "diff": 0,
    "health": "🟢 synced"
  },
  "evidence_command": "git fetch + git rev-parse + ls"
}
```

---

## 6. 使用方法(運用、ヤス採否完遂後)

```powershell
# 監督官 A 完了報告作成 直前
pwsh.exe scripts/observability/push_state_check.ps1

# JSON 形式で取得(verification-before-completion Skill との統合候補)
pwsh.exe scripts/observability/push_state_check.ps1 -Format JSON

# 単一 repo
pwsh.exe scripts/observability/push_state_check.ps1 -Repo Supervisor
```

= **手動実行 → 出力を完了報告 footer に手動コピペ**(自動添付は将来 hook 化、ヤス採否経路)

---

## 7. ヤス制約遵守確認

| 制約 | 状態 |
|---|---|
| 自動 push なし | ✅(`git fetch` のみ、`git push` 非実行) |
| 自動 alert なし | ✅(stdout 出力のみ、人間判断) |
| hook 化なし | ✅(本案は手動実行 script のみ) |
| 手動実行のみ | ✅(spawn 経由) |
| Y5 中核採択候補 | ✅(本案 = 中核装置) |

---

## 8. 装置数評価

| 観点 | 状態 |
|---|---|
| 装置追加 | +1(`scripts/observability/push_state_check.ps1` 1 件) |
| 既存活用 | git / Get-ChildItem(標準コマンド) |
| ガレージ §1.5 | 単一 SSOT 装置(supervisor 内、その他 repo は read-only)|
| Plan-First 例外 | (iii) 既存装置の通常運用 + 監視装置追加 |

---

## 9. 段階的拡張(将来、ヤス採否経路)

| Phase | 内容 | ヤス採否 |
|---|---|---|
| Phase 1(本案)| 手動実行 script | 本提案 |
| Phase 2 | report_footer_generator.ps1 と統合(footer 自動生成、別 staging)| 別案 |
| Phase 3 | verification-before-completion Skill 内から呼び出し統合 | 文書規律案で言及 |
| Phase 4(保留) | Stop hook で footer 自動添付 | 🔴 ヤス保留 |
| Phase 5(保留) | SessionStart hook 統合 | 🔴 ヤス保留 |

---

## 10. 採否経路

| 選択肢 | 内容 |
|---|---|
| (S) 採択 | 本仕様で実装 → `scripts/observability/push_state_check.ps1` 配置 |
| (P) 部分採択 | 出力形式 / parameter / 検出ロジック修正 |
| (R) 整流要請 | 別の手動 script 設計案 |

---

## 11. 改訂履歴

- v1.0(2026-05-08 朝中盤後末):初版起案、ヤス採否「Y5 中核採択候補、手動実行 script として実装案を優先、自動 push 不要、自動確認だけ」契機。手動実行仕様 + Markdown / JSON 出力 + git fetch のみ(read-only)+ 段階的拡張経路(Phase 2-5 別案)+ ヤス制約 5 件遵守 統合。

---

*監督官 A push_state_check.ps1 手動実行 script 実装案 v1(staging、ヤス採否完遂後に scripts/ 配置)*
