# ===================================================================
# responds_to_normalize.ps1
# Common helper for responds_to field normalization (EVT-017 fix)
# v0.1 - Drafted 2026-04-29 (Day 131 朝, supervisor instance A)
#
# Purpose: Normalize responds_to field across sync scripts.
#          Address EVT-017 (responds_to representation drift) +
#          stale-alert + archive-order matching failures.
#
# Usage from caller script:
#   . (Join-Path $PSScriptRoot "_helpers\responds_to_normalize.ps1")
#   $candidates = Get-RespondsToCandidates -Value $rawValue
#   foreach ($c in $candidates) { ... }
# ===================================================================

function Normalize-RespondsTo {
    <#
    .SYNOPSIS
        Normalize a single responds_to value to canonical filename form.
    .OUTPUTS
        Hashtable with: canonical, has_extension, is_natural_language, original
    #>
    param([string]$Value)
    if (-not $Value) {
        return @{ canonical = ""; has_extension = $false; is_natural_language = $false; original = "" }
    }
    $trimmed = $Value.Trim()
    $hasExt = $trimmed -match '\.md$'
    # Natural language detection: contains Kanji/Hiragana/Katakana (CJK Unicode ranges)
    $isNL = $trimmed -match '[぀-ゟ゠-ヿ一-鿿]'
    $canonical = if ($hasExt) { $trimmed } else { "$trimmed.md" }
    return @{
        canonical = $canonical
        has_extension = $hasExt
        is_natural_language = $isNL
        original = $trimmed
    }
}

function Get-RespondsToCandidates {
    <#
    .SYNOPSIS
        Return candidate filename list for matching (handles RETRACTED suffix).
    .OUTPUTS
        Array of candidate filenames to try in order.
    #>
    param([string]$Value)
    $norm = Normalize-RespondsTo -Value $Value
    if ($norm.is_natural_language -or -not $norm.canonical) {
        return @()
    }
    $candidates = @($norm.canonical)
    # Add _RETRACTED.md variant
    $base = $norm.canonical -replace '\.md$', ''
    if ($base -notmatch '_RETRACTED$') {
        $candidates += "${base}_RETRACTED.md"
    }
    return $candidates
}
