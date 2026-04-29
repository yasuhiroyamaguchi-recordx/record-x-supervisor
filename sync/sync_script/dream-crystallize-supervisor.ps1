#Requires -Version 5.1
<#
.SYNOPSIS
    Dream Crystallize for Supervisor (manual stub v0.2, refactored to common template)

.DESCRIPTION
    Supervisor-domain adapter for the three-domain dream-crystallize template.
    Dot-sources sync/sync_script/_helpers/dream-crystallize-template.ps1 and provides
    supervisor-specific configuration.

    Three-domain schedule (Yasu approved 2026-04-29):
      00:00 JST factory   (existing factory CLI)
      03:00 JST supervisor (this script)
      06:00 JST commander (dream-crystallize-commander.ps1, to be implemented by commander)
      09:00 JST three-domain checkup (existing periodic_checkup_protocol.md)

.PARAMETER DryRun
    Test mode: aggregate file scan only, skip output writing.

.PARAMETER LookbackHours
    How many hours to look back for changes (default 24).

.NOTES
    Drafted: 2026-04-29 (Day 131 evening, supervisor instance A)
    v0.1: standalone implementation
    v0.2: refactored to use _helpers/dream-crystallize-template.ps1 (Yasu instruction
          "transmit to each domain", three-domain shared template)
#>
param(
    [switch]$DryRun,
    [int]$LookbackHours = 24
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Resolve repo root (this script lives at sync/sync_script/)
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

# Configure supervisor-specific context
$script:DreamDomain = "supervisor"
$script:DreamRepoRoot = $repoRoot
$script:DreamWatchPaths = @(
    @{ Name = "error_patterns"; Path = "archive\error_patterns.md"; Type = "EVT" },
    @{ Name = "board_council_decisions"; Path = "archive\board_council_decisions.md"; Type = "B-number" },
    @{ Name = "board_council_minutes"; Path = "archive\board_council_minutes"; Type = "council_dir" },
    @{ Name = "outbox"; Path = "outbox"; Type = "order_dir" },
    @{ Name = "internal_circular"; Path = "internal\circular"; Type = "circular_dir" }
)

# Load common template
. (Join-Path $PSScriptRoot "_helpers\dream-crystallize-template.ps1")

# Invoke
$result = Invoke-DreamCrystallize -LookbackHours $LookbackHours -DryRun:$DryRun

if ($result.OutputPath) {
    Write-Host ""
    Write-Host "Domain: supervisor / Output: $($result.OutputPath)"
}
