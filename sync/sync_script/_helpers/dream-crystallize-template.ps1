#Requires -Version 5.1
<#
.SYNOPSIS
    Dream Crystallize Common Template (three-domain shared, manual stub v0.1)

.DESCRIPTION
    Common template for dream-crystallize across three domains:
      - factory   (existing: npx tsx tools/orchestrator.ts dream-crystallize)
      - supervisor (this template adapted)
      - commander (this template adapted)

    Adopters dot-source this file and provide:
      $script:DreamDomain      = "supervisor" | "commander" | "factory"
      $script:DreamRepoRoot    = absolute path to the domain repo root
      $script:DreamWatchPaths  = array of @{ Name; Path; Type } hashtables

    Then call:
      Invoke-DreamCrystallize -LookbackHours 24

    The function aggregates last N hours updates from watch paths and writes
    structured Markdown to:
      $DreamRepoRoot/archive/dream_crystallize_history/{YYYYMMDD}_{domain}_dream.md

    Until factory-side CLI is extended (DO-FACTORY-{N} domain expansion,
    EVT-035 stage 3 / ADR-009 section 6), this stub provides aggregation only
    without LLM ADR-candidate generation.

.NOTES
    Drafted: 2026-04-29 (Day 131 evening, supervisor instance A)
    Basis:
    - Yasu instruction 2026-04-29 evening "transmit to each domain"
    - EVT-035 stage 3 (three-domain dream-crystallize integration)
    - EVT-036 system K context bloat countermeasure
    - ADR-009 section 6-A automation integration
    - dream_mode_doctrine.md v1.0-draft section 2-C (three-domain application)
    - role_and_conduct.md section 1.1-E (verification need marker, low green)
    - external_resource_intake_principle.md v0.1-draft (D-gamma extension)

    Three-domain schedule (Yasu approved 2026-04-29):
      00:00 JST factory   (existing factory CLI)
      03:00 JST supervisor (this template via dream-crystallize-supervisor.ps1)
      06:00 JST commander (this template via dream-crystallize-commander.ps1)
      09:00 JST three-domain checkup (existing periodic_checkup_protocol.md)
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Invoke-DreamCrystallize {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [int]$LookbackHours = 24,

        [Parameter(Mandatory=$false)]
        [switch]$DryRun
    )

    # Validate caller-provided context
    if (-not $script:DreamDomain) {
        throw "Dream Crystallize: caller must set `$script:DreamDomain (supervisor | commander | factory)"
    }
    if (-not $script:DreamRepoRoot -or -not (Test-Path $script:DreamRepoRoot)) {
        throw "Dream Crystallize: caller must set `$script:DreamRepoRoot to a valid path"
    }
    if (-not $script:DreamWatchPaths -or $script:DreamWatchPaths.Count -eq 0) {
        throw "Dream Crystallize: caller must set `$script:DreamWatchPaths array"
    }

    $now = Get-Date
    $cutoff = $now.AddHours(-$LookbackHours)
    $dateStamp = $now.ToString("yyyyMMdd")
    $domain = $script:DreamDomain
    $repoRoot = $script:DreamRepoRoot
    $watchPaths = $script:DreamWatchPaths

    $outputDir = Join-Path $repoRoot "archive\dream_crystallize_history"
    $outputPath = Join-Path $outputDir "${dateStamp}_${domain}_dream.md"

    if (-not (Test-Path $outputDir)) {
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $outputDir | Out-Null
        }
    }

    # Aggregate findings
    $findings = @()
    foreach ($wp in $watchPaths) {
        $fullPath = Join-Path $repoRoot $wp.Path
        if (-not (Test-Path $fullPath)) { continue }

        $item = Get-Item $fullPath
        if ($item.PSIsContainer) {
            $recentFiles = Get-ChildItem $fullPath -File -Recurse |
                Where-Object { $_.LastWriteTime -gt $cutoff }
            foreach ($f in $recentFiles) {
                $findings += [PSCustomObject]@{
                    Source = $wp.Name
                    Type = $wp.Type
                    File = $f.FullName.Replace($repoRoot, "").TrimStart("\")
                    LastWrite = $f.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
                }
            }
        } else {
            if ($item.LastWriteTime -gt $cutoff) {
                $findings += [PSCustomObject]@{
                    Source = $wp.Name
                    Type = $wp.Type
                    File = $wp.Path
                    LastWrite = $item.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
                }
            }
        }
    }

    $findingsCount = ($findings | Measure-Object).Count

    Write-Host "=== Dream Crystallize ($domain domain, manual stub v0.1) ==="
    Write-Host "Cutoff: $($cutoff.ToString('yyyy-MM-dd HH:mm:ss'))"
    Write-Host "Findings: $findingsCount file(s) with recent updates"
    Write-Host ""

    if ($findingsCount -eq 0) {
        Write-Host "No recent updates. Skipping crystallization (per dream_mode_doctrine: act when there is movement)."
        return @{ Domain = $domain; FindingsCount = 0; OutputPath = $null }
    }

    $findings | ForEach-Object {
        Write-Host "  [$($_.Source)] $($_.File) ($($_.LastWrite))"
    }

    if ($DryRun) {
        Write-Host ""
        Write-Host "DryRun mode: skipping output write."
        return @{ Domain = $domain; FindingsCount = $findingsCount; OutputPath = $null }
    }

    # Compose structured output
    $header = @"
---
crystallize_id: ${dateStamp}_${domain}_dream
domain: $domain
generated_at: $($now.ToString('yyyy-MM-ddTHH:mm:sszzz'))
lookback_hours: $LookbackHours
findings_count: $findingsCount
mode: manual_stub_v0_1
factory_cli_extension_pending: DO-FACTORY-{N} (three-domain dream-crystallize integration)
yasu_review_priority: low_green
---

# $domain Dream Crystallize Report ${dateStamp}

Manual stub aggregation. Until factory-side ``dream-crystallize --domain $domain`` is implemented (EVT-035 stage 3, ADR-009 section 6 automation integration), this report provides structured aggregation only without LLM ADR-candidate generation.

## Watch Paths Recent Activity (last ${LookbackHours}h)

| Source | File | Last Write |
|---|---|---|
"@

    $rows = $findings | ForEach-Object {
        "| $($_.Source) | ``$($_.File)`` | $($_.LastWrite) |"
    }

    $footer = @"

## Crystallization Hints (manual review)

Heuristic suggestions per domain, not LLM-generated ADR candidates:

- New EVT entries to be reviewed for series J/K/L pattern matches (per EVT-036)
- New B-number entries to be cross-checked against ADR-009 council v0.3 revision plan
- New outbox/order entries to be checked for verification-need marker compliance (per role_and_conduct section 1.1-E)
- New circular entries indicate cross-instance coordination (potential series L event)

## Next Action

When DO-FACTORY-{N} (three-domain dream-crystallize integration) is implemented:
1. Replace this stub with thin wrapper around factory CLI
2. Add LLM-driven ADR candidate generation
3. Auto-append SITREP entries (low-priority green marker)

## Linked Records

- EVT-035 (council pipeline incomplete, dream-crystallize CLI extension required)
- EVT-036 (NTT external resource catalyst, system K context bloat countermeasure)
- ADR-009 (council mechanism v0.3 revision plan, section 6 three-domain automation)
- dream_mode_doctrine.md v1.0-draft (philosophical basis)
- external_resource_intake_principle.md v0.1-draft (D-gamma extension)
- role_and_conduct.md section 1.1-E (verification gap structuring)

---

Generated by sync/sync_script/_helpers/dream-crystallize-template.ps1 v0.1 (manual stub, three-domain shared)
"@

    $content = $header + "`n" + ($rows -join "`n") + $footer

    [System.IO.File]::WriteAllText($outputPath, $content, [System.Text.UTF8Encoding]::new($false))

    Write-Host ""
    Write-Host "Output written: $outputPath"
    Write-Host "Yasu review priority: LOW (green marker, per role_and_conduct section 1.1-E)"
    Write-Host ""
    Write-Host "=== Dream Crystallize Complete ($domain domain) ==="

    return @{ Domain = $domain; FindingsCount = $findingsCount; OutputPath = $outputPath }
}

# Function Invoke-DreamCrystallize is available via dot-source.
# (Export-ModuleMember only valid when imported as a module; we use dot-source.)
