---
id: CROSS-REPO-DIFF-CHECK-DESIGN-v1
title: 4 点照合 script 設計 v1(Y5 Phase 1、設計 staging のみ、実装はヤス採否後)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
yasu_decision_history:
  - "2026-05-08 朝中盤: Y5 部分 GO(設計 staging まで、実装はサンプル出力承認後)"
yasu_questions_to_address:
  - "1. 入力 4 点の正確な取得元"
  - "2. 照合キー(どれを正とするか)"
  - "3. false positive の扱い(自前採番 + 改番済み + 重複 ID + completion_report 欠落)"
  - "4. 出力形式(daily diff report + alert threshold + commander 通知要否)"
  - "5. 実装前のサンプル出力"
related_evt: EVT-20260508-121
related_orders: [128-139(構造課題系列)]
ticket_type: observation_script_design
---

# 4 点照合 script 設計 v1(Phase 1、ヤス Y5 5 観点提示)

## 1. 入力 4 点の正確な取得元

### 1-A. ProjectRX merged PR

| 項目 | 内容 |
|---|---|
| 取得コマンド | `gh pr list --repo <owner>/ProjectRX --state merged --search "DO- in:title" --json number,title,mergedAt,mergeCommit,headRefName --limit 500` |
| 抽出フィールド | `number` / `title`(`[DO-XXX-NNN]` パターン抽出) / `mergedAt`(UTC)/ `mergeCommit.oid`(40-char hash)/ `headRefName`(branch 名) |
| 正規表現 | `\[DO-[A-Z]+(?:-[A-Z]+)*-\d+\]`(複合 prefix 対応、Hook Ticket Template v1 適用) |
| 取得頻度(設計値) | daily(JST 06:00)、または手動 trigger |
| キャッシュ場所 | `sync/observability_cache/projectrx_merged_YYYYMMDD.json` |

### 1-B. factory completion_reports

| 項目 | 内容 |
|---|---|
| 取得コマンド | `find C:\RX_Dev\ProjectRX_HQ\wt_common\completion_reports -name "DO-*.json" -o -name "DO-*.md"` |
| 抽出フィールド | filename(DO-XXX-NNN extraction)+ frontmatter(mergedAt + commit hash + verifying_actor) |
| 取得頻度 | daily |
| キャッシュ場所 | `sync/observability_cache/factory_completion_reports_YYYYMMDD.json` |

### 1-C. commander active

| 項目 | 内容 |
|---|---|
| 取得コマンド | `ls ../record-x-commander/strategy/tickets_issued/active/DO-*.md` |
| 抽出フィールド | filename(DO-XXX-NNN extraction)+ frontmatter(ticket_id + period + priority) |
| 取得頻度 | daily + commander commit 時(GitHub Actions 連動候補、Phase 4) |
| キャッシュ場所 | `sync/observability_cache/commander_active_YYYYMMDD.json` |

### 1-D. commander completed

| 項目 | 内容 |
|---|---|
| 取得コマンド | `find ../record-x-commander/strategy/tickets_completed -name "DO-*.md"` |
| 抽出フィールド | filename + 配置 path(YYYY/MM/DD/01-05/06-10/11-20/21-25/26-31 等)+ frontmatter |
| 取得頻度 | daily |
| キャッシュ場所 | `sync/observability_cache/commander_completed_YYYYMMDD.json` |

---

## 2. 照合キー(どれを正とするか)

### 2-A. SSOT 階層(優先順)

| 順 | キー | 役割 | SSOT 性 |
|---|---|---|---|
| **1 位** | `ticket_id`(`DO-{PREFIX}-{NNN}` 完全一致) | 主キー | ✅ 全点照合の SSOT |
| 2 位 | PR 番号(`#NNN`) | ProjectRX 物理証跡 | merged 確証 |
| 3 位 | branch 名(`feat/.../<ticket_id>` 等) | 補助 | 慣用 prefix 違反検出 |
| 4 位 | completion_report 内 ID | factory 側照合 | パイプライン整合確証 |

### 2-B. 照合ルール

```
matching_rule:
  primary_key: ticket_id (regex `^DO-[A-Z]+(?:-[A-Z]+)*-\d+$`)
  secondary_check: PR title `[DO-XXX-NNN]` extraction
  tertiary_check: branch name extraction (DO-XXX-NNN suffix)
  quaternary_check: completion_report filename / frontmatter id

cross_repo_truth_table:
  ticket_id 全件で 4 点照合
  - present_in_all_4: 健全(commander completed 移動済 = 完遂)
  - merged_but_not_completed: 司令官 SSOT 同期未達(P1 alert 候補)
  - completion_report_orphan: パイプライン未処理(P0 alert 候補)
  - active_already_merged: 司令官 active 陳腐化(P1 alert 候補)
  - completed_no_pr: 別経路完遂(housekeeping batch、low alert)
  - pr_no_commander_no_factory: 工場長自前採番疑い(EVT-120 系列、P0 alert)
```

### 2-C. SSOT 衝突時

`ticket_id_mapping.md`(commander 主管、DO-COMMANDER-051 起案済)を **再採番マッピング SSOT** として参照。
例:DO-CP-043(MCP) ↔ DO-CP-043(ProjectRX globals.d.ts)= 旧 ID は新 ID(DO-CP-101)へ rewrite。

---

## 3. false positive の扱い

| パターン | 検出経路 | 対応 |
|---|---|---|
| 自前採番(EVT-120 系列、commander 不在 + ProjectRX merged)| `ticket_id` ProjectRX merged 出現 + commander active/completed 不在 + factory completion_reports 出現 | 🔴 alert(EVT-120 系列、新規 instance 自動カウント) |
| 改番済み(DO-CP-043→101 等)| `ticket_id_mapping.md` 参照 + 旧 ID rewrite | 🟢 false positive 除外(マッピング適用後再照合) |
| 重複 ID(DO-CP-032 active = `app_tsx_routing` / completed = `process_completion_reports_v1_2` 等) | active と completed 両方に同 ID 存在 | 🟡 alert(タイトル相違確認、ticket_id_mapping.md §3 で記録) |
| completion_report 欠落(ProjectRX merged + factory completion_report 不在) | merged にあり completion_reports/ なし | 🔴 alert(パイプライン未処理 + 自前採番疑い区別要) |

### 3-A. 既知 false positive(初版除外リスト)

```yaml
known_false_positives:
  ticket_id_mapping_applied:  # 改番済み(マッピング適用後再照合)
    - DO-CP-043 (MCP) -> DO-CP-101
    - DO-CP-044 (MCP) -> DO-CP-102
    - DO-CP-045 (MCP) -> DO-CP-103
    - DO-CP-046 (CI parallel) -> DO-CP-104
    - DO-CP-047 (twin PR) -> DO-CP-105
  evt_120_documented:  # 違反記録済 = alert 対象だが既知
    - DO-CODEX-MIG-001 〜 DO-CODEX-MIG-008
    - DO-CODEX-OPS-001 〜 DO-CODEX-OPS-003
    - DO-FACTORY-CHRONICLE-001
    - DO-CI-BLOCKER-001 / DO-CI-BLOCKER-002
    - DO-COMMON-RESILIENCE-001
    - DO-GHA-COST-001 (DO-GHA-COST 系列)
    - DO-COMMON-HOUSEKEEPING-D
  duplicate_id:  # 二重採番(DO-COMMANDER-051 で整流要請)
    - DO-CP-032 (app_tsx_routing vs process_completion_reports_v1_2)
```

---

## 4. 出力形式

### 4-A. daily diff report 構造

配置:`sync/observability_reports/cross_repo_diff_YYYYMMDD.md`

```markdown
---
report_id: CROSS-REPO-DIFF-YYYYMMDD
generated_at: <ISO8601>
generated_by: cross_repo_diff_check.ps1 v1
total_tickets_observed: N
divergence_count: M
alert_level: 🔴 / 🟡 / 🟢
---

# Cross-repo Divergence Report YYYY-MM-DD

## Summary
- ProjectRX merged: N1
- factory completion_reports: N2
- commander active: N3
- commander completed: N4

## 5 区分内訳

### A. healthy(全 4 点一致): N
### B. merged_but_not_completed(P1): N
### C. completion_report_orphan(P0): N
### D. active_already_merged(P1): N
### E. self_authored_suspect(P0、EVT-120 系列): N

## P0 alert 詳細
| ticket_id | 種別 | 検出経路 |
|---|---|---|

## P1 alert 詳細
| ticket_id | 種別 | 検出経路 |
|---|---|---|

## 既知 false positive 除外件数
| 種別 | 件数 |
|---|---|
| ticket_id_mapping_applied | M1 |
| evt_120_documented | M2 |
| duplicate_id | M3 |

## 監督官への推奨アクション
- <指針(自動生成、Phase 1 では手動)>
```

### 4-B. alert threshold(設計値、ヤス採否対象)

| level | 閾値(差分件数) | 通知経路(初版) |
|---|---|---|
| 🟢 green | 0-5 | report 配置のみ(配送なし) |
| 🟡 yellow | 6-15 | 監督官 A SessionStart 必読(Phase 2 採否後) |
| 🔴 red | 16+ | 監督官 A inbox 自動投函(Phase 4 採否後) |

### 4-C. commander への通知要否(初版設計)

| Phase | 通知 |
|---|---|
| Phase 1(本設計) | ❌ なし(supervisor 内 report 配置のみ)|
| Phase 2 | ❌ なし(SessionStart 必読化のみ、commander 通知なし) |
| Phase 3(DP-001 C-3 連動)| 🟡 dashboard 表示(commander が dashboard 経由で確認) |
| Phase 4(三社円卓 X-4 採否後)| 🔴 自動 alert(差分閾値超過時に commander inbox 自動投函)|

= **Phase 1 では commander 通知なし**(supervisor 内のみ、ヤス Y6 採否前提)

---

## 5. 実装前のサンプル出力(本日 2026-05-08 朝中盤の数値で擬似生成)

```markdown
---
report_id: CROSS-REPO-DIFF-20260508
generated_at: 2026-05-08T03:00:00+09:00
generated_by: cross_repo_diff_check.ps1 v1 (sample, not yet implemented)
total_tickets_observed: 100 (DO-COMMON only, 2026-04 以降 ProjectRX merged)
divergence_count: 55
alert_level: 🔴 red
---

# Cross-repo Divergence Report 2026-05-08(サンプル、DO-COMMON 限定)

## Summary
- ProjectRX merged DO-COMMON: 100 件
- factory completion_reports DO-COMMON: 73 件
- commander active DO-COMMON: 57 件
- commander completed DO-COMMON: 45 件

## 5 区分内訳(DO-COMMON 限定)

### A. healthy(全 4 点一致): 推定 17 件(45 - 28 - 0)
### B. merged_but_not_completed(P1): 28 件(factory completion_reports 73 - commander completed 45)
### C. completion_report_orphan(P0): 推定 27 件(ProjectRX merged 100 - factory completion_reports 73)
   = うち 9 件は EVT-120 既知 false positive(DO-CODEX/CHRONICLE/CI-BLOCKER/RESILIENCE/GHA-COST/HOUSEKEEPING-D)
   = 残 18 件は **未認知の自前採番疑い or report 欠落**
### D. active_already_merged(P1): 推定 12 件(commander active 57 - 推定 healthy 45 ≒ 12 件 + 二重採番 1)
### E. self_authored_suspect(P0、EVT-120 系列): 9 件(既知 false positive、§3-A 参照)

## P0 alert 詳細(本サンプル)

| ticket_id | 種別 | 検出経路 |
|---|---|---|
| (28 件 paipeline 未処理 = factory report ↔ commander completed 不一致) | merged_but_not_completed → completion_report_orphan(部分) | DO-COMMANDER-049 P0 対象 |
| (27 件中 18 件 未認知) | completion_report_orphan(自前採番疑い)| 監督官 A 個別検証要 |
| 9 件(DO-CODEX/CHRONICLE/CI-BLOCKER/RESILIENCE/GHA-COST/HOUSEKEEPING-D)| evt_120_documented(既知 alert) | 5 軸ガード採否継続 |

## P1 alert 詳細(本サンプル)

| ticket_id | 種別 | 検出経路 |
|---|---|---|
| (12 件) | active_already_merged | DO-COMMANDER-050 拡張 or DO-COMMANDER-054 起案候補 |

## 既知 false positive 除外件数
| 種別 | 件数 |
|---|---|
| ticket_id_mapping_applied | 5(DO-CP-043〜047 → 101〜105 reroute、DO-COMMON 範囲外なので 0)|
| evt_120_documented | 9 件 |
| duplicate_id | 1 件(DO-CP-032、DO-COMMON 範囲外なので 0)|

## 監督官 A への推奨アクション(サンプル、Phase 1 では手動)

1. 🔴 P0: DO-COMMANDER-049(パイプライン復旧)起案進捗確認、scope 28 件再見積もり
2. 🔴 P0: 27 件 completion_report_orphan のうち 18 件未認知 → 個別検証(本日中)
3. 🟡 P1: DO-COMMANDER-050 拡張 or 新規 DO-COMMANDER-054(Wave 1-3 housekeeping、12 件分離) 起案要請
4. 🔴 P0: EVT-120 第 9 系列発火継続 = Y4-B v4 採否緊急性継続
```

---

## 6. 実装計画(Phase 1、ヤス採否後)

| 順 | 内容 | 主管 | ヤス採否前提 |
|---|---|---|---|
| 1 | `scripts/observability/cross_repo_diff_check.ps1` 配備(設計 staging 内容実装) | 監督官 A | Y5 完全採択 |
| 2 | 初回手動実行 + sample report 生成 + 既知 false positive 除外 list 検証 | 監督官 A | 同上 |
| 3 | サンプル出力をヤスに提示 + 設計適合確認 | 監督官 A → ヤス | Y5 検証 |
| 4 | 検証結果反映 + Phase 1 完遂 | 監督官 A | Y5 完了 |

---

## 7. Plan-First / 装置数評価

| 観点 | 状態 |
|---|---|
| Phase 1 装置数 | +1(`cross_repo_diff_check.ps1` 1 件、supervisor 内 script)|
| 既存運用拡張 | sync/ ディレクトリ拡張(observability_cache + observability_reports = 既存運用拡張)|
| ガレージ §1.5 適合 | ✅(既存 sync/ + scripts/ 構造内) |
| Plan-First 例外 | (iii) 既存装置の通常運用 + 監視装置追加(EVT-121 構造課題対症療法装置) |

---

## 8. 改訂履歴

- v1.0(2026-05-08 朝中盤、Day 136 朝中盤):初版起案、ヤス Y5 部分 GO(設計 staging まで、実装は サンプル出力承認後)契機。Phase 1 4 点照合 script の入力取得元 + 照合キー + false positive + 出力形式 + サンプル出力 5 観点提示完遂。

---

*監督官 A 4 点照合 script 設計 v1(staging、ヤス Y5 サンプル出力承認後に Phase 1 実装、commit 配置のみ)*
