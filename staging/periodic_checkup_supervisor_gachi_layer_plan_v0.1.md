# 定期検診への「監督官二次検証レイヤー」組込み実装プラン

> **For agentic workers:** 実装時は `superpowers:subagent-driven-development` または `superpowers:executing-plans` でタスク単位実行推奨。チェックボックスで進捗管理。

**Goal:** 司令官自己採点 JSON の「読み上げ」から脱却し、ルーブリック機械算出・一次証拠・三者対称を同じ検診イベントに束ね、**再現可能なガチ診断**として定期検診の出力を固定する。

**Architecture:** (1) `role_execution_rubric.yaml` に記載の **formula 対象コンポーネント**だけを、設定された commander リポジトリルートから **決定的に再計算**し、ミラー済み `snapshot_*.json` の同項目と差分比較する。(2) 比較結果はスナップショットに **`supervisor_verification` ブロック**として追記するか、並列 JSON (`*_verification.json`) で保存し、人間可読レポートは **出典ラベル付き**にする。(3) 既存 `operations/periodic_checkup_protocol.md` に § を追加し、**09:00 JST 三者検診**（§7-F-3）と合成可能な手順に接続する。

**Tech Stack:** PowerShell 5.1+（既存 `sync/sync_script/*.ps1` と整合）、YAML パース（`powershell-yaml` または最小手動マッピング）、JSON（スナップショット I/O）。

---

## ファイルマップ（新規 / 変更）

| 責務 | パス |
|------|------|
| プロトコル追記 | `operations/periodic_checkup_protocol.md` — 新設 **§7-H 監督官二次検証レイヤー（ガチ層）** |
| 機械検証スクリプト | `sync/sync_script/verify-role-snapshot-vs-rubric.ps1`（新規） |
| 設定 | `sync/sync_script/checkup-verification.config.json` または既存 config へのキー追加（ commander ルート / rubric パス） |
| スキーマ例 | `sync/checkup-scores/_schema/snapshot_supervisor_verification_v0.1.json`（新規、任意） |
| 配線 | `sync/sync_script/pipeline-bottleneck-probe.ps1` または三者検診呼び出し元から **verify スクリプトを 1 段挟む**（変更） |
| 自己改善ループ | `operations/supervisor_self_checkup_prompt.md` — 手動セクションに「検証結果の未解決差分」チェックを 1 ブロック追加（変更） |

---

## Task 1: プロトコル §7-H 起案（仕様のみ）

**Files:**
- Modify: `operations/periodic_checkup_protocol.md`

- [ ] **Step 1:** §7-H の目的・非目的を書く（**目的** = 機械一致検証 + 証拠ロック。**非目的** = ルーブリック全文の主観軸の自動採点代替ではない）。
- [ ] **Step 2:** 入力を定義: `COMMANDER_REPO_ROOT`（または `factory_pipeline` JSON 内の `commander_repo_path`）、`RUBRIC_PATH`、`SNAPSHOT_JSON`（監督官ミラー上の最新司令官スナップショット）。
- [ ] **Step 3:** 出力を定義: `supervisor_verification` の必須フィールド — `captured_at_utc`、`mechanical_scores{}`、`snapshot_scores{}`、`delta_by_component{}`、`overall_status`（`aligned` / `drift_warning` / `unavailable_path`）、`evidence_paths[]`。
- [ ] **Step 4:** 閾値: コンポーネント差分 **≥ 15 点** または **緑/黄/赤帯を跨ぐ**場合は `drift_warning`（数値は PR レビューで調整可）。
- [ ] **Step 5:** 三者対称: 同一検診イベントで **司令官スナップショット + factory_pipeline 最新 1 件 + 監督官 snapshot_supervisor_*（存在すれば）** を表に並べることを §7-H で必須化。

---

## Task 2: 機械算出の実装範囲 v0.1（コマンダー軸）

**Files:**
- Create: `sync/sync_script/verify-role-snapshot-vs-rubric.ps1`
- Read-only参照: `rubrics/role_execution_rubric.yaml`（`commander_role` 配下のみ）

- [ ] **Step 1:** Rubric から **確実に機械化できる**項目だけ v0.1 スコープに入れる:
  - `advance_map_freshness`（`strategy/advance_map.md` の mtime → rubric の式）
  - `ticket_issuance_velocity`（`tickets_issued` + `tickets_draft` の 24h カウント → rubric の式）
  - （任意 v0.1.1）`verdict_distribution` — 入力パスが **commander リポの inbox** 前提。ミラー未取得時は `unavailable_path`。
- [ ] **Step 2:** 既存スナップショット JSON の `scores.*.components.*.score` をフラットに読み、上記キーと突合。
- [ ] **Step 3:** 標準出力 + `--output-json path` で検証結果を保存（スナップショット改変しない運用をデフォルトにすると安全）。
- [ ] **Step 4:** `-WhatIf` 相当で「パスが存在しない」場合は例外で落とさず `unavailable_path` 集計。

**Test:**
- [ ] 意図的に **mtime を弄った fixture コピー**（テスト用サブディレクトリ）で、機械スコアが期待値になることを確認。

---

## Task 3: 設定とリポジトリ境界

**Files:**
- Create: `sync/sync_script/checkup-verification.config.json`（例: `commanderRepo` を `C:\\RX_Dev\\record-x-commander`）

- [ ] **Step 1:** 監督官リポのみ clone している環境では commander パスが無い → 設定ファイルまたは環境変数 `RX_COMMANDER_REPO` で上書き可能にする。
- [ ] **Step 2:** `periodic_checkup_protocol.md` に「検証不能時は **aligned とみなさない**」を明記（ナラティブ信頼の禁止）。

---

## Task 4: 検診レポート（人間可読）のテンプレ改訂

**Files:**
- Modify: `operations/periodic_checkup_protocol.md` §6-B（growth_report 構造）または別紙テンプレ

- [ ] **Step 1:** 表の先頭行に **出典** 列を追加: `self_score` | `mechanical_recheck` | `supervisor_note`。
- [ ] **Step 2:** ボトルネック節では、JSON の `bottlenecks` 引用に加え **「検証スクリプトが同一事実を見たか」**（例: merged_prs 24h = 0 と pr_merge_tracking の整合）を 1 行チェック。

---

## Task 5: CI / 手動検診への接続

**Files:**
- Modify: `sync/sync_script/pipeline-bottleneck-probe.ps1`（該当すれば）

- [ ] **Step 1:** 既存プローブの後段で `verify-role-snapshot-vs-rubric.ps1` を呼び、結果を `sync/checkup-scores/reviews/` または `factory_pipeline` 隣にログ追記。
- [ ] **Step 2:** `drift_warning` 時のみ **exit code ≠ 0** にするかどうかをプロトコルで決める（CI ノイズ vs 検知）。推奨: **警告は 0、blocked 条件のみ非 0**。

---

## Task 6: 監督官自己改善ループ（運用）

**Files:**
- Modify: `operations/supervisor_self_checkup_prompt.md`

- [ ] **Step 1:** 手動セッション §4 に「**直近検診の supervisor_verification で drift が残っている項目**」を必須記入欄として追加。
- [ ] **Step 2:** ゼロ件続きの場合は `CLAUDE.md` 月次自己点検に接続（既存運用）。

---

## 完了定義（Definition of Done）

1. `verify-role-snapshot-vs-rubric.ps1` が **最低 2 コンポーネント**で機械スコアを出し、代表スナップショットと差分を JSON 出力できる。
2. `periodic_checkup_protocol.md` に §7-H が入り、**三者表 + 出典ラベル**が手順として読める。
3. ドリフト時の **監督官の次アクション**（再採点依頼 / ミラー同期 / パス設定ミス修正）がプロトコルに 1 段落で書かれている。

---

## リスクと意図的後回し

- **主観軸**（SITREP 鮮度、circular_close 等）は v0.1 では機械化しない。代わりに **「未機械 = ナラティブ依存」タグ**のみ付与。
- Rubric の `lessons_extraction` と JSON の `factory_pipeline_health` など **命名不一致**がある場合は、マッピング表を別タスク（v0.2）で整理。v0.1 は突合キーが明確な項目のみ。

---

## 参照（本プランの起源）

- デビルズアドボケート指摘: 自己採点 JSON の信頼移転、ルーブリック公式との未検証、時系列の複数ソース未突合、三者対称欠落。
- 既存: `operations/periodic_checkup_protocol.md` §7-F（経路健全性）、`rubrics/role_execution_rubric.yaml` v0.2 `formula` 節。

**起草:** 2026-05-04 / 監督官 instance（対話起案）  
**採択・実装:** 2026-05-04 Yasu 承認済。`operations/periodic_checkup_protocol.md` §7-H + `verify-role-snapshot-vs-rubric.ps1` + `checkup-verification.config.json` + `supervisor_self_checkup_prompt.md` 追記まで完遂。
