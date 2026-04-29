#Requires -Version 5.1
<#
.SYNOPSIS
    notify-yasu-email.ps1 v0.1 - Y1-Y6 trigger -> SMTP email to Yasu [Day 130 末 drafted]

.DESCRIPTION
    Sends email notifications to Yasu when Y-triggers fire.
    Reads config from email_config.json (no secrets).
    Reads credentials from .smtp.cred (DPAPI-encrypted, gitignored).

    Y-triggers (per email_config.json):
    - immediate: Y1 (three-party halt), Y3 (dead loop), Y5 (escalation file 5+ in 24h)
    - daily_digest: Y2 (consistency score <60 24h), Y4 (red streak), Y6 (connection rate <40%)

    Rate limits:
    - same_trigger cooldown 30 min (state in email_notify_state.json)
    - daily max 20 emails

.PARAMETER Trigger
    Y1-Y6 trigger code (required)

.PARAMETER Summary
    One-line summary for subject (required)

.PARAMETER Body
    Email body content (required for non-DryRun)

.PARAMETER DryRun
    Preview only, no actual SMTP send

.NOTES
    Drafted: 2026-04-28 (Day 130 末, supervisor instance A)
    EVT-016 garage doctrine 1.5-B applied at draft (Who/When/Where/Reflection 4 points).
    Garage Doctrine: built device must be driven, not garaged.

    Setup required (Yasu Day 131 morning, one-time):
    1. Create recordx-noreply@mam-s.info in Google Workspace
    2. Generate 16-char app password
    3. Run on supervisor PC:
       Get-Credential -Message "Record X SMTP" | Export-Clixml -Path "C:\RX_Dev\record-x-supervisor\sync\sync_script\.smtp.cred"
       (Username = recordx-noreply@mam-s.info, Password = 16-char app password)
    4. Test: .\notify-yasu-email.ps1 -Trigger Y1 -Summary "test" -Body "test body" -DryRun
#>
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("Y1","Y2","Y3","Y4","Y5","Y6")]
    [string]$Trigger,

    [Parameter(Mandatory=$true)]
    [string]$Summary,

    [string]$Body = "",

    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# === Logging ===
$logDir = Join-Path $repoRoot "logs\email_notify"
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

# === Load config ===
$configFile = Join-Path $PSScriptRoot "email_config.json"
if (-not (Test-Path $configFile)) {
    Write-Log "email_config.json not found at $configFile" "ERROR"
    exit 1
}
$config = Get-Content $configFile -Raw -Encoding UTF8 | ConvertFrom-Json

# === Rate limit state ===
$stateFile = Join-Path $PSScriptRoot "email_notify_state.json"
$state = @{
    last_sent_per_trigger = @{}
    daily_count = @{}
    daily_count_date = (Get-Date -Format "yyyy-MM-dd")
}
if (Test-Path $stateFile) {
    try {
        $loaded = Get-Content $stateFile -Raw -Encoding UTF8 | ConvertFrom-Json
        # Reset daily counter if date changed
        if ($loaded.daily_count_date -ne (Get-Date -Format "yyyy-MM-dd")) {
            $state.daily_count_date = (Get-Date -Format "yyyy-MM-dd")
            $state.daily_count = @{}
        } else {
            $state.daily_count_date = $loaded.daily_count_date
            $state.daily_count = @{}
            foreach ($p in $loaded.daily_count.PSObject.Properties) {
                $state.daily_count[$p.Name] = $p.Value
            }
        }
        $state.last_sent_per_trigger = @{}
        if ($loaded.PSObject.Properties.Name -contains 'last_sent_per_trigger') {
            foreach ($p in $loaded.last_sent_per_trigger.PSObject.Properties) {
                $state.last_sent_per_trigger[$p.Name] = $p.Value
            }
        }
    } catch {
        Write-Log "state file load failed, using defaults: $($_.Exception.Message)" "WARN"
    }
}

# === Determine immediate vs digest ===
$isImmediate = $config.triggers.immediate -contains $Trigger
$isDigest = $config.triggers.daily_digest -contains $Trigger

if (-not ($isImmediate -or $isDigest)) {
    Write-Log "$Trigger not in any trigger group" "WARN"
    exit 1
}

if ($isDigest -and (-not $DryRun)) {
    Write-Log "$Trigger is daily_digest (not immediate). Queue for digest run, exit." "INFO"
    # TODO v0.2: queue to digest_queue.jsonl, send daily by separate cron
    # For now, just log and exit
    exit 0
}

# === Cooldown check ===
$now = Get-Date
$cooldownMinutes = $config.rate_limits.same_trigger_cooldown_minutes
if ($state.last_sent_per_trigger.ContainsKey($Trigger)) {
    try {
        $lastSent = [DateTime]::Parse($state.last_sent_per_trigger[$Trigger])
        $minutesSince = ($now - $lastSent).TotalMinutes
        if ($minutesSince -lt $cooldownMinutes) {
            Write-Log ("Cooldown: $Trigger last sent {0:N1} min ago, need {1} min" -f $minutesSince, $cooldownMinutes) "INFO"
            exit 0
        }
    } catch {
        Write-Log "cooldown parse error, proceeding: $($_.Exception.Message)" "WARN"
    }
}

# === Daily limit check ===
$dailyMax = $config.rate_limits.daily_max_emails
$dailyTotal = ($state.daily_count.Values | Measure-Object -Sum).Sum
if (-not $dailyTotal) { $dailyTotal = 0 }
if ($dailyTotal -ge $dailyMax) {
    Write-Log "Daily limit reached: $dailyTotal / $dailyMax" "WARN"
    exit 0
}

# === Compose subject + body ===
$jstNow = $now.ToString("yyyy-MM-dd HH:mm JST")
$subject = "{0} {1} {2} - {3}" -f $config.subject_prefix, $Trigger, $Summary, $jstNow

$mailBody = @"
$Body

---
Trigger: $Trigger
Sent at: $jstNow
Repo: $repoRoot

(This is an automated notification from Record X Supervisor.)
"@

# === Load credentials ===
$credFile = Join-Path $PSScriptRoot $config.credential_file
if (-not (Test-Path $credFile)) {
    Write-Log "Credential file not found at $credFile (run setup first)" "ERROR"
    Write-Log 'Setup: Get-Credential -Message "Record X SMTP" | Export-Clixml -Path .smtp.cred' "INFO"
    exit 1
}

# === DryRun: preview only ===
if ($DryRun) {
    Write-Log "=== DryRun mode ==="
    Write-Log "From:    $($config.from_address)"
    Write-Log "To:      $($config.to_address)"
    Write-Log "Subject: $subject"
    Write-Log "Body length: $($mailBody.Length) chars"
    Write-Log "SMTP: $($config.smtp.host):$($config.smtp.port) (STARTTLS)"
    Write-Log "Cooldown: would record $Trigger -> $($now.ToString('o'))"
    Write-Log "Daily count: $dailyTotal / $dailyMax (would increment)"
    Write-Log "=== DryRun complete (no actual send) ==="
    exit 0
}

# === SMTP send ===
try {
    $cred = Import-Clixml -Path $credFile
    $smtp = New-Object System.Net.Mail.SmtpClient($config.smtp.host, $config.smtp.port)
    $smtp.EnableSsl = $config.smtp.use_starttls
    $smtp.Credentials = $cred.GetNetworkCredential()

    $msg = New-Object System.Net.Mail.MailMessage
    $msg.From = $config.from_address
    $msg.To.Add($config.to_address)
    $msg.Subject = $subject
    $msg.Body = $mailBody
    $msg.IsBodyHtml = $false
    $msg.SubjectEncoding = [System.Text.Encoding]::UTF8
    $msg.BodyEncoding = [System.Text.Encoding]::UTF8

    $smtp.Send($msg)
    Write-Log "Email sent: $subject"

    # Update state
    $state.last_sent_per_trigger[$Trigger] = $now.ToString("o")
    if (-not $state.daily_count.ContainsKey($Trigger)) {
        $state.daily_count[$Trigger] = 0
    }
    $state.daily_count[$Trigger] = [int]$state.daily_count[$Trigger] + 1

    # Persist state
    $statePersist = [ordered]@{
        daily_count_date = $state.daily_count_date
        daily_count = $state.daily_count
        last_sent_per_trigger = $state.last_sent_per_trigger
    }
    $statePersist | ConvertTo-Json -Depth 10 | Set-Content -Path $stateFile -Encoding UTF8

    Write-Log "State updated: cooldown + daily count"
    $msg.Dispose()
    $smtp.Dispose()

} catch {
    Write-Log "SMTP send failed: $($_.Exception.Message)" "ERROR"
    Write-Log "Fallback: escalation file remains at inbox/escalations/" "INFO"
    exit 1
}

exit 0
