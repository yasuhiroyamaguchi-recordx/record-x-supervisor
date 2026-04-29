---
escalation_id: ESC-Yresp-20260428_to_commander_010
severity: yellow
trigger: Response missing > 6h
detected_at: 2026-04-28T23:48:20+09:00
detected_by: order-stale-alert.ps1 v1.0
---

# Escalation: ESC-Yresp-20260428_to_commander_010

**Severity**: yellow
**Trigger**: Response missing > 6h
**Detected at**: 2026-04-28 23:48:20 JST
**Detected by**: `sync/sync_script/order-stale-alert.ps1` v1.0

## Details

- deadline: none
- placed_at: 2026-04-28 04:52:14
- order_number: 18
- age_hours: 18.9
- order_file: 20260428_to_commander_010.md
- threshold_hours: 6

## Recommended Action (Supervisor view)

See `operations/escalation_and_rollback.md` section 3 for notification channels and section 4 for rollback protocol.

For trigger 'Response missing > 6h', refer to:
- R1-R7 (red): three-party halt + Yasu notification
- Y1-Y6 (yellow): Yasu notification + stage-hold
- Info: record only

## Yasu Decision Required

If severity is red, three-party halt is auto-triggered (commander side `staging/.three_party_halt.lock`).
Yasu decision needed before recovery per section 5 recovery protocol.
