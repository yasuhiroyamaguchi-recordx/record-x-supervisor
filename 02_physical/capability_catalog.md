# 機能カタログ v0.1

**配置先**: `02_physical/capability_catalog.md`
**起案日**: 2026-04-29(Day 131 午後)
**起案者**: 監督官 instance A1
**目的**: **記録庁全機能のカタログ化** + 自動化パイプライン接続状態の明示(active / paused / dormant)+ 状態遷移ログ管理
**根拠**:
- ヤス指示「全機能をカタログに乗せつつ、自動化パイプラインに接続しているのか、保留にしているのか、意図的に眠らせているのかも分かるようにしながら、ログに残す」(2026-04-29 午後)
- ガレージドクトリン §1.5「装置の存在 ≠ 機能」(EVT-016 由来、運転されない装置は機能していない)
- SITREP_20260429.md v1.1 §1-A 装置存在率 67% との統合(本カタログが装置運転状態を可視化)
- Factory 側カタログ機能の対称運用(司令官経由ミラーで参照、後日 Day 145+)

---

## 0. 位置づけ

### 0-A. カタログ化の目的

全機能を以下の 3 状態で明示することで、**機能の運転状況を一覧把握** + **意図的眠り vs 死蔵 vs 失効** を区別:

| 状態 | 定義 | 例 |
|---|---|---|
| **active** | 自動化パイプライン(Layer 0/1/2 自律巡回 + sync スクリプト等)に接続 + 直近 7 日内に稼働実績あり | layer0_entry_point.ps1 v1.6、Phase B-α 起動後 |
| **paused** | 一時停止中(技術的問題 / 運用判断 / 待機)、復旧予定あり | 22 分起動騒動で disable した 6 タスク(2026-04-29 午後) |
| **dormant** | 意図的に眠らせている(未稼働だが必要時起動可能、撤退ではない)| Phase B-γ 移行後の機能 / 月次以上の低頻度装置 |

加えて補助状態:

| 状態 | 定義 |
|---|---|
| **draft** | 起案済だが未着地(commit 前 or テスト中)|
| **archived** | 撤退・廃止(史実保持で残るが運転対象外)|

### 0-B. ガレージドクトリン §1.5 整合

「装置の存在 ≠ 機能」= カタログに **存在記録** だけでは不十分、**運転状態 + 直近稼働実績** を併記する物理装置として本カタログを位置付け。

---

## 1. カタログ範囲(機能 4 区分)

| 区分 | 実体 |
|---|---|
| **I. スクリプト**(自動化機構)| `sync/sync_script/*.ps1` + `scripts/scheduler_templates/*.ps1` + `scripts/scheduler_templates/*.xml` |
| **II. ルーブリック**(評価層)| `rubrics/*.yaml` |
| **III. プロトコル**(行動規範層)| `operations/*.md` |
| **IV. テンプレート**(鋳型)| `outbox/_templates/*.md` + `commander#strategy/tickets_*` 標準フォーマット(後日 Factory 経由で記録)|

### 1-A. 範囲外(本カタログでは管理しない)

- 哲学層(`00_origin/`): 規範ではなく運動の起点、カタログ管理不要
- 関係層(`01_relationship/`): 同上
- 記録層(`archive/` + `adrs/` + `outbox/` + `inbox/`): 履歴的存在、運転対象ではない

---

## 2. 機能一覧(2026-04-29 / Day 131 午後 起点、A1 認知範囲)

### 2-A. 区分 I:スクリプト(自動化機構)

| 機能 ID | ファイル | 状態 | 直近稼働 | 起案者 | メモ |
|---|---|---|---|---|---|
| FUNC-S-001 | `sync/sync_script/sync-orders.ps1` v1.2 | **active** | 2026-04-29 朝(本日朝 011/012 転送)| 監督官側 / A2 改修 | EVT-015 fix 済 |
| FUNC-S-002 | `sync/sync_script/pull-replies.ps1` v1.0 | **active** | 2026-04-29(司令官応答 Pull)| 監督官側 | - |
| FUNC-S-003 | `sync/sync_script/order-stale-alert.ps1` v1.1 | **active** | Layer 0 巡回内稼働 | 監督官側 / A2 改修 | 冪等性 + 自動 cleanup |
| FUNC-S-004 | `sync/sync_script/archive-order.ps1` v1.2 | **active** | sync-orders v1.2 連動 | 監督官側 / A2 改修 | AutoFromInbox |
| FUNC-S-005 | `sync/sync_script/review-implementation.ps1` v1.1 | **active** | Layer 0 Step-AutoReview | 監督官側 / A2 改修 | 5 rubrics 統合 |
| FUNC-S-006 | `sync/sync_script/sync-factory-pipeline.ps1` v0.1 | **active** | Layer 0 Step 3.3 | A2 起案 | factory_pipeline ミラー |
| FUNC-S-007 | `sync/sync_script/auto-evt-recorder.ps1` v0.7 | **active** | Layer 0 Step 3.4 | A2 起案 | R1-R7 drift 検出 |
| FUNC-S-008 | `sync/sync_script/check-internal-links.ps1` v0.2 | **active**(週次)| 2026-04-29 朝 | A2 起案 | EVT-018/019 で実証 |
| FUNC-S-009 | `sync/sync_script/sync-regional.ps1` v1.0 | **active** | Layer 0 Step 6 | A2 起案 | 双方向同期 |
| FUNC-S-010 | `sync/sync_script/notify-yasu-email.ps1` v0.1 | **paused**(SMTP 設定待ち)| 未稼働 | A2 起案 | Yasu setup 未完了 |
| FUNC-S-011 | `sync/sync_script/snapshot-supervisor.ps1` v0.1 | **active** | 2026-04-29 朝(初回 T+0)| A1 起案(本日) | 監督官自己採点 |
| FUNC-S-012 | `scripts/scheduler_templates/layer0_entry_point.ps1` v1.6 | **paused**(XML Enabled=false)| 未稼働、Yasu 承認待ち | A1 起案 | Yasu 帰還時 Enabled=true 化候補 |
| FUNC-S-013 | `scripts/scheduler_templates/layer0_supervisor_template.xml` v1.0 | **paused** | 未稼働 | A1 起案 | 上記と一体 |
| FUNC-S-014 | `commander#scripts/scheduler_templates/layer2_entry_point.ps1` v2 | **paused**(本日 disable)| 2026-04-29 14:10 起動が最終 | 司令官 α 起案 | 22 分起動騒動で停止、再有効化前に Pre-Build Gate 必達 |
| FUNC-S-015 | `\Record-X-Layer2-Strategy` schtasks | **paused**(Yasu disable)| 2026-04-29 13:47 | 司令官 α 起案 | 6 時間サイクル正規 |
| FUNC-S-016 | `\RX-Layer2-Strategy` schtasks | **paused**(Yasu disable)| 2026-04-29 12:50 | Yasu 自身登録 | 起案者多元化、要整理 |
| FUNC-S-017 | `\RX-Layer1-Implementation` schtasks | **paused**(Yasu disable)| 2026-04-29 15:10 | 司令官 α 起案 | 22 分起動の真犯人、Layer 2 表記不一致 |
| FUNC-S-018 | `\RX-Layer3-News` schtasks | **paused**(Yasu disable)| 未確認 | 司令官 α 起案 | 12 時間サイクル |
| FUNC-S-019 | `\RX-Layer4-Checkup` schtasks | **paused**(Yasu disable)| 12:50:01 | 司令官 α 起案 | 12 時間サイクル |
| FUNC-S-020 | `\RecordX_NightlyFlight` schtasks | **paused**(Yasu disable)| 02:10:01 | A1 認知外 | **A1 事前査読外、要起案者確認** |

### 2-B. 区分 II:ルーブリック(評価層)

| 機能 ID | ファイル | 状態 | 直近稼働 | 起案者 |
|---|---|---|---|---|
| FUNC-R-001 | `rubrics/dasei_detection_rubric.yaml` v1.0 | **active** | review-implementation 経由 | A2 起案 |
| FUNC-R-002 | `rubrics/ticket_quality_rubric.yaml` v1.0 | **active** | 司令官 α 自己採点 | A2 起案 |
| FUNC-R-003 | `rubrics/implementation_review_rubric.yaml` v1.0 | **active** | review-implementation 経由 | A2 起案 |
| FUNC-R-004 | `rubrics/value_alignment_rubric.yaml` v1.0 | **active** | review-implementation 経由 | A2 起案 |
| FUNC-R-005 | `rubrics/role_execution_rubric.yaml` v0.1 | **active** | 司令官 α 5 時点撮影 | A2 起案 |

### 2-C. 区分 III:プロトコル(行動規範層)

| 機能 ID | ファイル | 状態 | 直近稼働 | 起案者 |
|---|---|---|---|---|
| FUNC-P-001 | `operations/role_and_conduct.md` §1.5 ガレージドクトリン | **active** | 全装置で参照 | 共有 |
| FUNC-P-002 | `operations/communication_protocol.md` §3.2-A 系列 | **active** | 全発令で適用 | 共有 |
| FUNC-P-003 | `operations/escalation_and_rollback.md` v1.0 | **active**(待機状態)| 未発火 | A2 起案 |
| FUNC-P-004 | `operations/implementation_review_pipeline.md` v1.0 | **active** | review-implementation 経由 | A2 起案 |
| FUNC-P-005 | `operations/periodic_checkup_protocol.md` v0.1 | **active** | 司令官 α 5 時点撮影で稼働 | A2 起案 |
| FUNC-P-006 | `operations/post_build_gate_checklist.md` v0.2 | **active**(本日朝起案)| 起案直後で稼働実績ゼロ | A1 起案 |
| FUNC-P-007 | `operations/supervisor_self_checkup_prompt.md` v0.1 | **active** | 2026-04-29 朝(初回 T+0)| A1 起案 |
| FUNC-P-008 | `operations/ticket_quality_independent_review.md` v0.1 | **active**(本日午後起案)| 稼働実績ゼロ | A1 起案 |
| FUNC-P-009 | `operations/template_metabolism_checkup.md` v0.1 | **active**(本日午後起案)| 稼働実績ゼロ、Day 162 初回 | A1 起案 |

### 2-D. 区分 IV:テンプレート(鋳型)

| 機能 ID | ファイル | 状態 | 直近稼働 | 起案者 |
|---|---|---|---|---|
| FUNC-T-001 | `outbox/_templates/feedback_to_commander_template.md` v1.0 | **active**(v1.1 改訂要請中)| 全 outbox 発令で参照 | A2 起案 |
| FUNC-T-002 | `commander#strategy/tickets_*` 標準フォーマット | **active**(司令官側マスター)| 全チケット発行で参照 | 司令官 α 起案 |

### 2-E. 仕様書(物理層)

| 機能 ID | ファイル | 状態 | 起案者 |
|---|---|---|---|
| FUNC-D-001 | `02_physical/recording_office_health_check_v1_0.md` v1.0 | **active**(本日朝起案、運用は Day 132 起動後)| A1 起案 |
| FUNC-D-002 | `02_physical/v1_1_FINAL_revision_candidates.md` | **active**(改訂候補リスト)| A2 起案 |
| FUNC-D-003 | `02_physical/_reference.md` | **active** | 共有 |
| FUNC-D-004 | `02_physical/capability_catalog.md` v0.1 | **active**(本ファイル、本日午後起案)| A1 起案 |
| FUNC-D-005 | 司令官側 v1.0-FINAL `commander#strategy/decisions/20260427_control_panel_v1.0_FINAL.md` | **active** | 司令官 α 起案 |

---

## 3. 状態遷移ログ(append-only、本カタログの本体)

各機能の状態遷移は以下に append-only 記録:

```
sync/checkup-scores/capability_log/
└ capability_log_{YYYYMM}.jsonl
```

各 JSONL エントリ:

```json
{
  "timestamp": "2026-04-29T15:30:00+09:00",
  "function_id": "FUNC-S-014",
  "function_name": "commander#scripts/scheduler_templates/layer2_entry_point.ps1",
  "previous_state": "active",
  "new_state": "paused",
  "reason": "22 分起動騒動 + Yasu 手動 disable + 司令官 α への構造的指摘発令予定",
  "transitioned_by": "Yasu via schtasks /change /disable",
  "evt_reference": "EVT-候補-20260429-Layer2-22min-misregistration",
  "circular_reference": "internal/circular/circular_20260429_006.md v1.1",
  "expected_recovery": "司令官 α による再起案 + Pre-Build Gate 査読 + Yasu 再有効化"
}
```

### 3-A. ログ確認用 PowerShell

```powershell
# 直近 30 日の状態遷移を確認
$logDir = "sync\checkup-scores\capability_log"
Get-ChildItem $logDir -Filter "capability_log_*.jsonl" |
    ForEach-Object { Get-Content $_.FullName -Encoding UTF8 } |
    ForEach-Object { $_ | ConvertFrom-Json } |
    Sort-Object timestamp -Descending |
    Select-Object timestamp, function_id, previous_state, new_state, reason
```

---

## 4. 自動化パイプライン接続状況サマリ(2026-04-29 / Day 131 午後)

| 区分 | active | paused | dormant | 合計 |
|---|---|---|---|---|
| **I. スクリプト** | 11 | 9(本日 22 分起動騒動で 6 + Layer 0 1 + notify-yasu 1 + Layer2 entry 1)| 0 | 20 |
| **II. ルーブリック** | 5 | 0 | 0 | 5 |
| **III. プロトコル** | 9 | 0 | 0 | 9 |
| **IV. テンプレート** | 2 | 0 | 0 | 2 |
| **V. 仕様書** | 5 | 0 | 0 | 5 |
| **合計** | **32** | **9** | **0** | **41** |

active 率: **78%**(32/41)、paused 率: **22%**(9/41)。

**paused 9 件の内訳**(本日 22 分起動騒動 + Yasu 帰還待機):
- schtasks 6 件(両 Layer2 + Layer1 + Layer3 + Layer4 + NightlyFlight)= Yasu 再有効化判断待ち
- layer0_entry_point.ps1 + XML(2 件)= Yasu 承認時 Enabled=true 化候補
- notify-yasu-email.ps1(1 件)= SMTP 設定待ち

---

## 5. 改訂運用

### 5-A. 機能追加時の処理

新規機能起案 → 本カタログに追加(機能 ID 採番)+ 状態 = `draft` または `active` で初期登録 → capability_log に append。

### 5-B. 状態遷移時の処理

active ↔ paused ↔ dormant ↔ archived の遷移時、以下を必達:

1. capability_log に新エントリ append(timestamp + function_id + previous_state + new_state + reason + transitioned_by + evt/circular reference)
2. 本カタログ §2 の状態列を更新
3. 関連する SITREP / 検診仕様書への反映

### 5-C. カタログ自体の検診(再帰)

本カタログは **template_metabolism_checkup.md v0.1 §0-A 区分 D 検診鋳型** に含まれる = 月次新陳代謝検診で **本カタログ自体も検診対象**。

---

## 6. 関連参照

- ガレージドクトリン: `operations/role_and_conduct.md` §1.5
- 鋳型新陳代謝検診: `operations/template_metabolism_checkup.md` v0.1(本日同時起案、本カタログを区分 D で検診)
- 検診仕様書: `02_physical/recording_office_health_check_v1_0.md` v1.0 §1-B 7 機能層
- SITREP: `sync/checkup-scores/supervisor-perspective/SITREP_20260429.md` v1.1 §1-A 装置存在率
- 自動化機構観察: `internal/circular/circular_20260429_006.md` v1.1(22 分起動騒動)
- Factory 側カタログ機能(後日司令官経由ミラーで参照)

---

## 7. 改訂履歴

- v0.1(2026-04-29 / Day 131 午後): 初版起案、監督官 instance A1。ヤス指示「全機能をカタログに乗せつつ、自動化パイプラインに接続しているのか、保留にしているのか、意図的に眠らせているのかも分かるようにしながら、ログに残す」契機。機能 4 区分(I スクリプト / II ルーブリック / III プロトコル / IV テンプレート)+ 仕様書(V)= 計 41 機能を初期登録。状態 3 区分(active / paused / dormant)+ 補助 2 区分(draft / archived)+ append-only ログ機構。本日午後の 22 分起動騒動を契機に **paused 9 件の物理状態** を記録。Phase B-α/β 7 日間実証期間中に capability_log の運用実証 + 月次新陳代謝検診で v0.2 改訂予定。
