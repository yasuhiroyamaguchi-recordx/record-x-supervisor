---
id: REPORT-FOOTER-SCRIPT-v1
title: report_footer_generator.ps1 完了報告 footer 生成 script 案 v1(hook ではない、手動実行 script)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
yasu_decision_history:
  - "2026-05-08 朝中盤後末: ヤス採否「条件付き採択候補、hook ではなくまずは report footer 生成 script として staging」"
yasu_constraints:
  - "hook 化なし(本案は script のみ)"
  - "完了報告に push state 自動添付の方向性は妥当"
target_path: scripts/observability/report_footer_generator.ps1(ヤス採否完遂後に配置)
ticket_type: script_implementation_proposal
related: push_state_check_script_v1.md(本案は本 script を呼び出し)
---

# report_footer_generator.ps1 完了報告 footer 生成 script 案 v1

## 1. 目的

完了報告 footer を **手動実行 script** で生成(hook なし、ヤス採否反映)。

監督官 A は完了報告作成時に本 script を実行 → 出力を **手動でコピペ** して報告末尾に添付。

ヤス指示「完了報告に push state を自動添付する方向性は妥当」+ 「hook ではなく script で先行」整合。

---

## 2. 配置 / 仕様

| 項目 | 内容 |
|---|---|
| 配置 | `C:\RX_Dev\record-x-supervisor\scripts\observability\report_footer_generator.ps1`(新規)|
| runtime | pwsh.exe(powershell.exe フォールバック)|
| trigger | **手動実行のみ**(完了報告作成直前)|
| input parameter | `-IncludePushState`(default: true)、`-IncludeStage0Mirror`(default: true)、`-IncludeEvidence`(default: true) |
| output | stdout(Markdown 形式 footer)|
| 依存 | `push_state_check.ps1`(本 script から呼び出し、`-Format JSON`)|
| side effect | git fetch のみ(read-only)|

---

## 3. 動作仕様(疑似コード)

```powershell
# scripts/observability/report_footer_generator.ps1
param(
    [bool]$IncludePushState = $true,
    [bool]$IncludeStage0Mirror = $true,
    [bool]$IncludeEvidence = $true
)

$ErrorActionPreference = 'Stop'

# 1. push_state_check.ps1 を JSON 形式で呼び出し
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pushStatePath = Join-Path $scriptDir 'push_state_check.ps1'
$pushStateJson = & pwsh.exe -NoProfile -File $pushStatePath -Format JSON 2>$null
$pushState = $pushStateJson | ConvertFrom-Json

# 2. footer 生成
$footer = @()
$footer += ""
$footer += "---"
$footer += ""
$footer += "### Push State(verification-before-completion 規律遵守、本完了報告作成時点)"
$footer += ""

if ($IncludePushState) {
    $footer += "| repo | local | remote | unpushed | branch | status |"
    $footer += "|---|---|---|---|---|---|"
    foreach ($r in $pushState.repos) {
        $footer += "| $($r.repo) | $($r.local) | $($r.remote) | $($r.unpushed) | $($r.branch) | $($r.status) |"
    }
    $footer += ""
}

if ($IncludeStage0Mirror) {
    $m = $pushState.stage_0_mirror
    $footer += "stage_0_mirror: outbox $($m.outbox_count) / commander inbox $($m.inbox_count) / diff $($m.diff)($($m.health))"
    $footer += ""
}

if ($IncludeEvidence) {
    $footer += "evidence: $($pushState.evidence_command)(timestamp: $(Get-Date -Format 'o'))"
    $footer += ""
}

# stdout 出力(クリップボード貼付け or 報告末尾コピペ用)
$footer -join "`n" | Write-Output
```

---

## 4. 出力例(本日想定)

```markdown
---

### Push State(verification-before-completion 規律遵守、本完了報告作成時点)

| repo | local | remote | unpushed | branch | status |
|---|---|---|---|---|---|
| supervisor | ed87e0a | 6f5f04d | 1 | main | 🟡 ahead 1 |
| commander  | <hash> | <hash> | <N> | main | <status> |

stage_0_mirror: outbox 17 / commander inbox 17 / diff 0(🟢 synced)

evidence: git fetch + git rev-parse + ls(timestamp: 2026-05-08T03:30:15+09:00)
```

= **本出力を監督官 A が手動コピペで完了報告末尾に貼付**

---

## 5. 使用方法(運用、ヤス採否完遂後)

```powershell
# 監督官 A 完了報告作成 直前(verification-before-completion 規律統合)
pwsh.exe scripts/observability/report_footer_generator.ps1

# クリップボードへ直接コピー(便利オプション)
pwsh.exe scripts/observability/report_footer_generator.ps1 | Set-Clipboard

# 部分出力(push state のみ)
pwsh.exe scripts/observability/report_footer_generator.ps1 -IncludeStage0Mirror $false -IncludeEvidence $false
```

---

## 6. verification-before-completion 規律との統合経路

| 順 | 内容 |
|---|---|
| 1 | 完了報告 draft 作成 |
| 2 | `pwsh report_footer_generator.ps1` 手動実行 |
| 3 | 出力を完了報告末尾に手動コピペ |
| 4 | verification-before-completion Skill 起動 + 5 項目検証 |
| 5 | 完了報告送出 |

= **手動だが規律装置化(忘れにくい)**

---

## 7. ヤス制約遵守確認

| 制約 | 状態 |
|---|---|
| hook 化なし | ✅(本案は script のみ、Stop hook は将来候補)|
| 自動 push なし | ✅(`push_state_check.ps1` 経由 git fetch のみ)|
| 自動 alert なし | ✅(stdout 出力のみ)|
| 完了報告 push state 自動添付の方向性 | ✅(手動コピペで添付、auto は Phase 4 hook 化候補)|

---

## 8. 装置数評価

| 観点 | 状態 |
|---|---|
| 装置追加 | +1(`report_footer_generator.ps1` 1 件) |
| 依存 | `push_state_check.ps1`(別案、Y5 中核)|
| ガレージ §1.5 | 既存活用(`push_state_check.ps1`)+ 軽量 wrapper |
| Plan-First 例外 | (iii) 既存装置の通常運用 |

---

## 9. 段階的拡張(将来、ヤス採否経路)

| Phase | 内容 | ヤス採否 |
|---|---|---|
| Phase 1(本案)| 手動実行 script、stdout 出力 | 本提案 |
| Phase 2 | クリップボード自動コピー(`Set-Clipboard`)| 本案内オプション |
| Phase 3 | claimed files / commits 検証統合(verification 5 項目全件)| 文書規律 + script 統合 |
| Phase 4(保留)| Stop hook で完了報告生成時に自動添付 | 🔴 ヤス保留(手動運用結果後判断)|

---

## 10. 採否経路

| 選択肢 | 内容 |
|---|---|
| (S) 採択 | 本仕様で実装 → `scripts/observability/report_footer_generator.ps1` 配置 |
| (P) 部分採択 | 出力形式 / parameter / 統合範囲修正 |
| (R) 整流要請 | 別の footer 設計案 |

---

## 11. 改訂履歴

- v1.0(2026-05-08 朝中盤後末):初版起案、ヤス採否「条件付き採択候補、hook ではなくまずは report footer 生成 script として staging」契機。手動実行 script 仕様 + push_state_check.ps1 依存 + 5 段階拡張経路 + ヤス制約 4 件遵守 統合。

---

*監督官 A report_footer_generator.ps1 完了報告 footer 生成 script 案 v1(staging、ヤス採否完遂後に scripts/ 配置)*
