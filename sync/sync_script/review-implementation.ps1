# ===================================================================
# review-implementation.ps1
# Record X Supervisor - Implementation Review Script v1.1
#
# Purpose: Auto-score commander responses + completion reports using 5 rubrics
#          (implementation_review + ticket_quality + dasei + value_alignment + role_execution).
#
# v1.1 changes (EVT-016 garage doctrine 1.5 direct response):
#   - Process ALL responses (not just implementation_completion)
#   - New: anti_values keyword detection (loaded from anti_values_keywords.json)
#   - New: objection rate detection (role_execution axis 4-B)
#   - New: response speed detection (axis 4-A, deadline vs mtime)
#   - ASCII-only PS1 (Japanese keywords externalized to JSON for CP932 safety)
#
# Drafted: 2026-04-28 (Day 130 末, supervisor instance A)
# ===================================================================

param(
    [string]$ReportFile,
    [switch]$ScanInbox,
    [switch]$DryRun,
    [switch]$VerboseOutput
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

$REVIEWS_DIR = Join-Path $repoRoot "sync\checkup-scores\reviews"
$INBOX_DIR = Join-Path $repoRoot "inbox\from_commander"
$KEYWORDS_FILE = Join-Path $PSScriptRoot "anti_values_keywords.json"

if (-not (Test-Path $REVIEWS_DIR)) {
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $REVIEWS_DIR | Out-Null
    }
}

# Load keywords from external JSON (UTF-8 safe)
$ANTI_VALUES = @{}
$OBJECTION_MARKERS = @()
if (Test-Path $KEYWORDS_FILE) {
    try {
        $raw = Get-Content -Path $KEYWORDS_FILE -Raw -Encoding UTF8
        $kw = $raw | ConvertFrom-Json
        foreach ($prop in $kw.anti_values.PSObject.Properties) {
            $ANTI_VALUES[$prop.Name] = @($prop.Value)
        }
        $OBJECTION_MARKERS = @($kw.objection_markers)
    } catch {
        Write-Host "WARN: keyword load failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "WARN: keyword file not found at $KEYWORDS_FILE, using empty defaults" -ForegroundColor Yellow
}

function Parse-Frontmatter {
    param([string]$FilePath)
    $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
    $fm = @{}
    if ($content -match '(?ms)^---\s*\r?\n(.*?)\r?\n---\s*\r?\n') {
        $fmText = $matches[1]
        $fmText -split "`r?`n" | ForEach-Object {
            if ($_ -match '^\s*([a-zA-Z_]+):\s*(.+?)\s*$') {
                $fm[$matches[1]] = $matches[2].Trim()
            }
        }
    }
    return @{ frontmatter = $fm; body = $content }
}

function Score-ImplementationCompletion {
    param([hashtable]$FmData, [string]$Body)
    $scores = @{
        implementation_integrity = 0
        evidence_integrity = 0
        dasei_risk = 0
        value_alignment = 0
    }
    if ($Body -match '(?ms)self_scores:\s*\r?\n((?:\s+\w+:\s*\d+\s*\r?\n)+)') {
        $block = $matches[1]
        $block -split "`r?`n" | ForEach-Object {
            if ($_ -match '^\s+(\w+):\s*(\d+)') {
                if ($scores.ContainsKey($matches[1])) { $scores[$matches[1]] = [int]$matches[2] }
            }
        }
    }
    $aggregate = ($scores.implementation_integrity + $scores.evidence_integrity +
                  (100 - $scores.dasei_risk) + $scores.value_alignment) / 4
    $verdict = "APPROVE_WITH_NOTES"
    $reasoning = @()
    if ($scores.value_alignment -lt 60) {
        $verdict = "REJECT"
        $reasoning += "Value Alignment red"
    } elseif ($scores.implementation_integrity -lt 60 -or $scores.evidence_integrity -lt 60 -or $scores.dasei_risk -ge 60) {
        $verdict = "REQUEST_CHANGES"
        $reasoning += "One or more axes red"
    } elseif ($scores.implementation_integrity -ge 80 -and $scores.evidence_integrity -ge 80 -and $scores.dasei_risk -lt 30 -and $scores.value_alignment -ge 80) {
        $verdict = "APPROVE"
        $reasoning += "All 4 axes green"
    }
    return @{
        review_basis = "implementation_review_rubric.yaml v1.0"
        scores = $scores
        aggregate = [math]::Round($aggregate, 2)
        verdict = $verdict
        reasoning = $reasoning
    }
}

function Score-GenericResponse {
    param([hashtable]$FmData, [string]$Body, [string]$FilePath)

    # Axis 4-A: Response speed
    $speedScore = 75
    $speedNote = "no deadline"
    if ($FmData.ContainsKey('deadline')) {
        try {
            $dlStr = $FmData['deadline'].Replace(' JST', '+09:00')
            $dl = [DateTime]::Parse($dlStr)
            $mtime = (Get-Item $FilePath).LastWriteTime
            $hoursMargin = ($dl - $mtime).TotalHours
            if ($hoursMargin -gt 12) { $speedScore = 95; $speedNote = "{0}h before deadline" -f [math]::Round($hoursMargin,1) }
            elseif ($hoursMargin -gt 0) { $speedScore = 75; $speedNote = "{0}h margin" -f [math]::Round($hoursMargin,1) }
            else { $speedScore = 40; $speedNote = "{0}h late" -f [math]::Round(-$hoursMargin,1) }
        } catch {
            $speedNote = "deadline parse error"
        }
    }

    # Axis 4-B: Structural objection rate
    $objectionCount = 0
    $objectionFound = @()
    foreach ($m in $OBJECTION_MARKERS) {
        if ($Body -match [regex]::Escape($m)) {
            $objectionCount++
            $objectionFound += $m
        }
    }
    # P\d+ regex pattern (P1, P2...)
    $pMatches = [regex]::Matches($Body, 'P\d+')
    if ($pMatches.Count -gt 0) {
        $objectionCount++
        $objectionFound += "P-pattern x$($pMatches.Count)"
    }
    $objectionScore = if ($objectionCount -ge 3) { 85 } elseif ($objectionCount -ge 1) { 70 } else { 40 }

    # value_alignment: anti_values keyword detection
    $antiViolations = @()
    foreach ($cat in $ANTI_VALUES.Keys) {
        foreach ($kw in $ANTI_VALUES[$cat]) {
            if ($Body -match [regex]::Escape($kw)) {
                $antiViolations += @{ category = $cat; keyword = $kw }
            }
        }
    }
    $valueScore = 90
    if ($antiViolations.Count -gt 0) {
        $valueScore = [math]::Max(20, 90 - ($antiViolations.Count * 15))
    }

    # dasei: body length heuristic
    $bodyLen = $Body.Length
    $daseiRisk = if ($bodyLen -lt 500) { 60 } elseif ($bodyLen -lt 1500) { 30 } else { 10 }

    $verdictDeclared = if ($FmData.ContainsKey('verdict')) { $FmData['verdict'] } else { "(none)" }

    $aggregate = ($speedScore * 0.25) + ($objectionScore * 0.30) + ($valueScore * 0.30) + ((100 - $daseiRisk) * 0.15)

    $verdict = "APPROVE_WITH_NOTES"
    $reasoning = @()
    $overflowHits = @($antiViolations | Where-Object { $_.category -eq 'avoid_overflow_compliance' })
    if ($overflowHits.Count -gt 0) {
        $verdict = "REJECT"
        $reasoning += ("anti_values overflow_compliance violation x{0}" -f $overflowHits.Count)
    } elseif ($antiViolations.Count -ge 2) {
        $verdict = "REQUEST_CHANGES"
        $reasoning += ("Multiple anti_values violations: {0}" -f $antiViolations.Count)
    } elseif ($daseiRisk -ge 60) {
        $verdict = "REQUEST_CHANGES"
        $reasoning += "Dasei red: body too short"
    } elseif ($aggregate -ge 80 -and $objectionCount -ge 1) {
        $verdict = "APPROVE"
        $reasoning += ("Healthy structural engagement (objection markers: {0})" -f $objectionCount)
    } elseif ($objectionCount -eq 0 -and $verdictDeclared -eq "APPROVE") {
        $verdict = "APPROVE_WITH_NOTES"
        $reasoning += "Pure APPROVE with zero objection markers (EVT-013 type risk)"
    } else {
        $verdict = "APPROVE_WITH_NOTES"
        $reasoning += "Standard response, no critical issues"
    }

    return @{
        review_basis = "5-rubric integrated v1.1 (role_execution + value_alignment + dasei)"
        scores = @{
            response_speed = $speedScore
            structural_objection_rate = $objectionScore
            value_alignment = $valueScore
            dasei_risk = $daseiRisk
        }
        speed_note = $speedNote
        objection_markers_found = $objectionCount
        objection_examples = ($objectionFound | Select-Object -First 5)
        anti_values_violations_count = $antiViolations.Count
        anti_values_categories = (@($antiViolations | ForEach-Object { $_.category }) | Sort-Object -Unique)
        body_length_chars = $bodyLen
        verdict_declared = $verdictDeclared
        aggregate = [math]::Round($aggregate, 2)
        verdict = $verdict
        reasoning = $reasoning
    }
}

function Process-Report {
    param([string]$FilePath)
    if (-not (Test-Path $FilePath)) { return $null }
    $fileName = Split-Path -Leaf $FilePath
    Write-Host ("  Processing: {0}" -f $fileName) -ForegroundColor Cyan

    $parsed = Parse-Frontmatter -FilePath $FilePath
    $reportType = if ($parsed.frontmatter.ContainsKey('report_type')) { $parsed.frontmatter['report_type'] } else { $null }

    $review = if ($reportType -eq 'implementation_completion') {
        Score-ImplementationCompletion -FmData $parsed.frontmatter -Body $parsed.body
    } else {
        Score-GenericResponse -FmData $parsed.frontmatter -Body $parsed.body -FilePath $FilePath
    }

    $color = switch ($review.verdict) {
        "APPROVE" { "Green" }
        "APPROVE_WITH_NOTES" { "Yellow" }
        "REQUEST_CHANGES" { "Magenta" }
        "REJECT" { "Red" }
        default { "White" }
    }
    Write-Host ("    Aggregate: {0} | Verdict: {1}" -f $review.aggregate, $review.verdict) -ForegroundColor $color
    foreach ($r in $review.reasoning) {
        Write-Host ("      {0}" -f $r) -ForegroundColor Gray
    }
    if ($VerboseOutput) {
        $review.scores.GetEnumerator() | ForEach-Object {
            Write-Host ("      {0}: {1}" -f $_.Key, $_.Value) -ForegroundColor DarkGray
        }
    }

    if (-not $DryRun) {
        $reviewId = "REV-{0}-{1}" -f (Get-Date -Format 'yyyyMMdd-HHmmss'), ($fileName -replace '\.md$', '')
        $proposal = [ordered]@{
            review_id = $reviewId
            target_file = $fileName
            target_path = $FilePath
            reviewed_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
            reviewer = "supervisor-auto-v1.1"
            review_basis = $review.review_basis
            scores = $review.scores
            aggregate_score = $review.aggregate
            proposed_verdict = $review.verdict
            reasoning = $review.reasoning
            requires_manual_session = $true
        }
        foreach ($k in @('speed_note','objection_markers_found','objection_examples','anti_values_violations_count','anti_values_categories','body_length_chars','verdict_declared')) {
            if ($review.ContainsKey($k)) { $proposal[$k] = $review[$k] }
        }
        $jsonPath = Join-Path $REVIEWS_DIR "$reviewId.json"
        $proposal | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonPath -Encoding UTF8
    }
    return $review
}

# === Main ===
Write-Host ""
Write-Host "=== Implementation Review v1.1 (5-rubric integrated) ===" -ForegroundColor Cyan
Write-Host ("Reviews dir: {0}" -f $REVIEWS_DIR)
Write-Host ("Anti-values categories loaded: {0}" -f $ANTI_VALUES.Count)
Write-Host ("Objection markers loaded: {0}" -f $OBJECTION_MARKERS.Count)
Write-Host ""

$processedCount = 0
$verdictDist = @{ APPROVE = 0; APPROVE_WITH_NOTES = 0; REQUEST_CHANGES = 0; REJECT = 0 }

if ($ReportFile) {
    $r = Process-Report -FilePath $ReportFile
    if ($r) { $processedCount++; $verdictDist[$r.verdict]++ }
} elseif ($ScanInbox) {
    if (-not (Test-Path $INBOX_DIR)) {
        Write-Host "INFO: inbox/from_commander/ not present" -ForegroundColor Yellow
        exit 0
    }
    $reports = @(Get-ChildItem -Path $INBOX_DIR -Filter "*.md" -Recurse -File)
    if ($reports.Count -eq 0) { Write-Host "No reports found"; exit 0 }
    Write-Host ("Scanning {0} reports..." -f $reports.Count) -ForegroundColor Cyan
    foreach ($f in $reports) {
        $r = Process-Report -FilePath $f.FullName
        if ($r) { $processedCount++; $verdictDist[$r.verdict]++ }
    }
} else {
    Write-Host "Usage: -ReportFile <path> | -ScanInbox [-DryRun] [-VerboseOutput]"
    exit 0
}

Write-Host ""
Write-Host "=== Review summary ===" -ForegroundColor Cyan
Write-Host ("Processed: {0}" -f $processedCount)
foreach ($k in @('APPROVE','APPROVE_WITH_NOTES','REQUEST_CHANGES','REJECT')) {
    Write-Host ("  {0}: {1}" -f $k, $verdictDist[$k])
}
Write-Host ""
Write-Host "Note: Phase B-alpha/beta requires manual final verdict (ADR-005 v1.1)." -ForegroundColor Yellow

exit 0
