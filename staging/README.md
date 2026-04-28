# staging/ — 一時的状態保持ディレクトリ

**用途**: 一時 lock + 自己点検ログ + 監督官個別検診の物理装置

## ファイル一覧

| ファイル | 用途 | 仕様根拠 |
|---|---|---|
| `.three_party_halt.lock` | 三者(監督官 / 司令官 / 工場長)同時停止 lock | DO-COMMANDER-014 仕様(司令官側起案中)|
| `.layer0_running.lock` | Layer 0 自律巡回 lock(監督官側)| DO-008 整合(LayerN_running.lock 系列)|
| `.layer2_running.lock` | Layer 2 自律巡回 lock(司令官側ミラー)| DO-COMMANDER-008(commit `9916a95`)|
| `self_check_log.jsonl` | 監督官個別検診 自己点検ログ(append-only、削除禁止)| 検診仕様書 v1.0 §5-Stage 2-B + supervisor_self_checkup_prompt.md v0.1 |

## self_check_log.jsonl スキーマ(暫定 v0.1)

各 JSONL エントリは:

```json
{
  "timestamp": "ISO 8601 UTC",
  "instance_id": "supervisor_a1 | supervisor_a2 | strategy_commander | factory_executor",
  "session_start_iso": "ISO 8601 UTC",
  "session_end_iso": "ISO 8601 UTC | null",
  "event_type": "session_start | session_end | self_check | devil_advocate | self_correction",
  "self_check": {
    "yasu_pleasing_mode": false,
    "anticipating_commander_response": false,
    "concealing_blindspot": false,
    "philosophical_grounding_check": "passed | partial | skipped",
    "modes_active": ["oni_coach", "ehshin_jinpachi"]
  },
  "devil_advocate_round": {
    "applicable": true,
    "performed": true,
    "trigger_context": "self_decree | yasu_decision_point | other",
    "weakness_count": 3,
    "weaknesses": [
      {
        "weakness": "...",
        "validity": "valid",
        "importance": "P3",
        "structural_grounding": "structural",
        "immediate_adoption_decision": "retain_with_grounding"
      }
    ]
  },
  "self_correction": {
    "trigger": "commander_pointed_out | yasu_pointed_out | self_discovered",
    "correction_summary": "...",
    "evt_id": "EVT-YYYYMMDD-NNN | null"
  },
  "hash_prev": "SHA256 of previous entry(ハッシュチェーン v0.1)",
  "hash_self": "SHA256 of current entry"
}
```

## 計測対象

- M3 起動時自己点検 5 項目実施率(検診仕様書 v1.0 §2-A)
- M11 Devil's Advocate 起動率
- M12 Devil's Advocate 本気度

`snapshot-supervisor.ps1` v0.1 + `supervisor_self_checkup_prompt.md` v0.1 で計測対象として参照される。

## 削除禁止

`self_check_log.jsonl` は史実保持原則 + ハッシュチェーン v0.1 整合。誤記訂正は **追記** で対応(過去エントリは残す)。

## 関連

- 検診仕様書: `02_physical/recording_office_health_check_v1_0.md` v1.0
- 自己採点プロンプト: `operations/supervisor_self_checkup_prompt.md` v0.1
- snapshot 撮影スクリプト: `sync/sync_script/snapshot-supervisor.ps1` v0.1
- error_patterns.md: `archive/error_patterns.md`(EVT 連携)
