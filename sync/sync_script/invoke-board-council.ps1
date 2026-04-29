#Requires -Version 5.1
<#
.SYNOPSIS
    invoke-board-council.ps1 v0.1 - 3AI Board Council invocation skeleton [Day 131 朝末 drafted]

.DESCRIPTION
    Skeleton for monitor-side 3AI Board Council (Chairman = Claude / Devil = Gemini / Convergence = ChatGPT).
    Inspired by factory#tools/lib/teams_council.ts + board_meeting_prompt_round_chairman.ts.

    v0.1 (this skeleton):
    - Generates agenda template
    - Outputs Yasu-mediated invocation prompts for Gemini + ChatGPT
    - Reserves council_id and B-number
    - Manual minutes recording (Yasu pastes Gemini/ChatGPT responses)

    v0.2 (future, Phase B-alpha post-launch):
    - Direct Gemini API call (notify-yasu-email type credential setup)
    - Direct ChatGPT API call
    - Auto minutes generation

    v0.3 (future, Phase B-gamma post-transition):
    - Layer 0 cycle integration (auto T1 trigger from auto-evt-recorder R5/R6/R8)
    - Auto council convening on EVT severity red

.PARAMETER Topic
    Council topic slug (e.g., "evt025_response", "phase_b_alpha_review")

.PARAMETER Trigger
    Trigger code: T1 / T2 / T3 / T4 / T5 / T6 (per board_council_protocol.md section 2)

.PARAMETER RelatedEvts
    Comma-separated EVT IDs (e.g., "EVT-20260429-025,EVT-20260429-026")

.PARAMETER DryRun
    Skeleton mode only, no minutes file generation
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Topic,

    [Parameter(Mandatory=$true)]
    [ValidateSet("T1","T2","T3","T4","T5","T6")]
    [string]$Trigger,

    [string]$RelatedEvts = "",

    [switch]$DryRun,

    # v0.3: factory CLI 直接呼び出しモード(段階的実装、Yasu setup 後利用可)
    [switch]$LiveCli,

    # v0.3: Mock モード(API credential なしでも動作確認可、factory --mock 経由)
    [switch]$Mock
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

$logDir = Join-Path $repoRoot "logs\board_council"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
}
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $logDir "$timestamp.log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [$Level] $Message"
    Write-Host $line
    Add-Content -Path $logFile -Value $line -Encoding UTF8
}

# === Council ID generation ===
$dateStr = Get-Date -Format "yyyyMMdd"
$minutesDir = Join-Path $repoRoot "archive\board_council_minutes"
if (-not (Test-Path $minutesDir)) {
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $minutesDir | Out-Null
    }
}

# Find next council number for this date+topic
$pattern = "council_${dateStr}_${Topic}_*.md"
$existingArr = @()
$found = Get-ChildItem -Path $minutesDir -Filter $pattern -File -ErrorAction SilentlyContinue
if ($found) { $existingArr = @($found) }
$existingCount = [int]$existingArr.Length
$nextNum = ($existingCount + 1).ToString("000")
$councilId = "council_${dateStr}_${Topic}_${nextNum}"
$minutesFile = Join-Path $minutesDir "$councilId.md"

Write-Log "=== invoke-board-council v0.1 start ==="
Write-Log "Council ID: $councilId"
Write-Log "Topic: $Topic"
Write-Log "Trigger: $Trigger"

# === B-number reservation ===
$bRegistryFile = Join-Path $PSScriptRoot "_helpers\b_number_registry.json"
$nextBNumber = "B-001"
# Note: b_number_registry.json not yet created (Day 131 morning end), default B-001 used.
# Future: parse registry when introduced.
Write-Log "Reserved B-number (tentative): $nextBNumber"

# === Generate agenda template ===
$evtList = @()
if ($RelatedEvts) {
    $evtList = @($RelatedEvts.Split(",") | ForEach-Object { $_.Trim() })
}
$evtListJson = ""
if ($evtList.Length -gt 0) {
    $evtListJson = (($evtList | ForEach-Object { "`"$_`"" }) -join ",")
}

$agendaTemplate = @"
---
council_id: $councilId
date: $(Get-Date -Format 'yyyy-MM-dd')
chairman: claude_supervisor_A
gemini_called: false
chatgpt_called: false
agenda_topic: $Topic
trigger: $Trigger
related_evts: [$evtListJson]
related_orders: []
discussion_scale: medium
decision_count: 0
b_numbers: []
status: skeleton
---

# Council $councilId : $Topic

## §1. 起案趣旨(Chairman)

(監督官 instance A による起案趣旨。EVT 系列との関係 + 議論の必要性を構造的に記述)

## §2. アジェンダ(Chairman 起案)

### 2-A. 議題

(具体的議題)

### 2-B. 検討事項

1. (項目 1)
2. (項目 2)
3. (項目 3)

### 2-C. 想定される選択肢

- (a) (案 a)
- (b) (案 b)
- (c) (案 c)

## §3. Gemini 発散 + Devil's Advocate

> Yasu 経由 or API 直接で Gemini に投入するプロンプト:

\`\`\`
あなたは Record X 監督官 3AI 役員会の発散役 / Devil's Advocate です。
以下のアジェンダに対して構造的反論 + 偵察結果 + 「絶対禁忌」抵触チェックを行ってください。

【アジェンダ】
$Topic

【関連 EVT】
$($evtList -join ", ")

【期待出力】
1. 構造的反論(Chairman 起案 / 想定選択肢への反論)
2. 偵察結果(他リポジトリ + 関連 path 観察での発見)
3. 「絶対禁忌」抵触チェック(sp500_theory §5 + value_alignment_rubric anti_values 参照)
4. 追加すべき選択肢候補
\`\`\`

> Gemini 出力(後で Yasu 経由 or API 経由で取得 + 貼付):

(Gemini 発言を記録)

## §4. ChatGPT 収束

> Yasu 経由 or API 直接で ChatGPT に投入するプロンプト:

\`\`\`
あなたは Record X 監督官 3AI 役員会の収束役です。
Chairman + Gemini の意見を統合 + 矛盾点抽出 + 各案の trade-off を整理してください。

【Chairman アジェンダ】
$Topic

【Chairman 想定選択肢】
(a) / (b) / (c)

【Gemini 発散結果】
(§3 から転記)

【期待出力】
1. 統合案(Chairman + Gemini の意見統合)
2. 矛盾点抽出(両者意見の構造的対立点)
3. 各案 trade-off(コスト / 効果 / リスク)
4. 推奨案 + 構造的根拠
\`\`\`

> ChatGPT 出力:

(ChatGPT 発言を記録)

## §5. Chairman 最終決裁(B-番号付き JSON 出力)

\`\`\`json
{
  "decisions": [
    {
      "b_number": "$nextBNumber",
      "title": "(決裁タイトル)",
      "domain": "supervisor",
      "priority": "P0-P3",
      "effort": "S/M/L",
      "description": "(...)",
      "dod": ["(...)"],
      "guardrails": ["(...)"],
      "adopted_from": ["gemini:(...)", "chatgpt:(...)"],
      "assignee": "claude_supervisor_A",
      "estimate_min": 15,
      "acceptance_criteria": ["(...)"]
    }
  ]
}
\`\`\`

## §6. 構造的根拠

- (sp500_theory / 関係性ポリシー / ガレージドクトリン §1.5 / 各 rubric 等)

## §7. 実装計画

1. (規範層改訂)
2. (物理装置起案)
3. (発令 / L2 区報経由通知)
4. (B-番号台帳追記)

## §8. 関連参照

- `operations/board_council_protocol.md` v0.1
- 関連 EVT: $($evtList -join ", ")
- 起案契機: $Trigger trigger

## §9. 改訂履歴

- v0.1(skeleton): $councilId 初版起案、Chairman = 監督官 instance A、Gemini + ChatGPT 召集待ち
"@

if ($DryRun) {
    Write-Log "DryRun: agenda template generated but not written"
    Write-Log "Template preview (first 30 lines):"
    $agendaTemplate.Split("`n") | Select-Object -First 30 | ForEach-Object { Write-Log "  $_" }
} else {
    # v0.2 fix: write as UTF-8 with explicit byte-order to avoid CP932 corruption
    # Series A 8th occurrence prevention (EVT-002/015/023/026 type encoding chain)
    [System.IO.File]::WriteAllText($minutesFile, $agendaTemplate, (New-Object System.Text.UTF8Encoding($false)))
    Write-Log "Agenda template saved (UTF-8 explicit): $minutesFile"
    Write-Log "Note: Template is initial draft. Chairman should manually edit sections 1-2 with rich context."
}

Write-Log ""

# === v0.3: LiveCli mode = factory CLI 直接呼び出し(段階的実装) ===
if ($LiveCli) {
    Write-Log ""
    Write-Log "=== LiveCli mode (v0.3, factory CLI direct invocation) ==="
    $factoryRepo = Join-Path (Split-Path $repoRoot -Parent) "ProjectRX_HQ\wt_common"
    # v0.3.1 fix: orchestrator.ts is the dispatcher entry point (not commands/board_meeting_cli.ts)
    $factoryOrchestrator = Join-Path $factoryRepo "record-x\factory\tools\orchestrator.ts"
    if (-not (Test-Path $factoryOrchestrator)) {
        Write-Log "Factory orchestrator not found at $factoryOrchestrator" "ERROR"
        Write-Log "Falling back to Yasu-mediated mode" "WARN"
    } else {
        Write-Log "Factory orchestrator found: $factoryOrchestrator"
        Write-Log "Topic: $Topic"
        $mockFlag = if ($Mock) { "--mock" } else { "" }
        Write-Log ""
        Write-Log "Invocation command (manual run by Yasu, Node.js + tsx required):"
        Write-Log "  cd $factoryRepo"
        Write-Log "  npx tsx record-x/factory/tools/orchestrator.ts board-meeting --agenda `"$Topic agenda from $minutesFile`" $mockFlag --json"
        Write-Log ""
        Write-Log "Note: Direct invocation from supervisor PS1 requires:"
        Write-Log "  - Node.js v20+ (confirmed: $(node --version))"
        Write-Log "  - tsx package installed in factory repo"
        Write-Log "  - GEMINI_API_KEY + OPENAI_API_KEY env vars (or --mock for dry test)"
        Write-Log "  - factory CLI dispatcher implementation (registerCommand pattern)"
        Write-Log ""
        Write-Log "v0.3 status: LiveCli command guidance generated, manual run required"
        Write-Log "v0.4 (future): direct PowerShell -> Node.js subprocess + minutes auto-import"
    }
}

Write-Log "=== Yasu-mediated invocation guidance ==="
Write-Log "1. Open: $minutesFile"
Write-Log "2. Fill section 1-2 (Chairman agenda)"
Write-Log "3. Copy section 3 prompt -> Gemini -> paste output back"
Write-Log "4. Copy section 4 prompt -> ChatGPT -> paste output back"
Write-Log "5. Chairman writes section 5-9 (final decision + plan)"
Write-Log "6. Update b_number_registry.json + archive/board_council_decisions.md"
Write-Log ""
Write-Log "v0.2 (future): Direct API call for Gemini + ChatGPT"
Write-Log "v0.3 (future): Layer 0 cycle integration with auto T1 trigger"

Write-Log "=== invoke-board-council end ==="
exit 0
