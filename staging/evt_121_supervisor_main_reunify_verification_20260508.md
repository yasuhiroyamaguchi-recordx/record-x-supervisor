---
id: EVT-121-SUPERVISOR-MAIN-REUNIFY-VERIFICATION-20260508
title: Supervisor main reunified — post-merge physical verification + EVT-121 multi-supervisor evidence
status: PHYSICAL_EVIDENCE_RECORDED
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Cursor agent, evidence capture)
ticket_type: physical_evidence
related_evt: EVT-119(c) + EVT-121 multi-supervisor coordination
merge_commit: 50346c668bd94d62fc50310eb9f25be6f67f1648
refs:
  - staging/divergence_preflight_report_v1.md
  - staging/multi_supervisor_coordination_proposal_v1.md
  - staging/evt_121_dashboard_inventory_observability_model_v0.2.md
---

# Supervisor `main` reunify — post-merge verification (2026-05-08)

## 1. Verification checklist (requested)

| # | Check | Result |
|---|--------|--------|
| 1 | `main` と `origin/main` 同期 | **PASS** — `git rev-parse HEAD main origin/main` が同一 |
| 2 | 最終 HEAD = `50346c6` | **PASS** — 完全 SHA 一致（下記抜粋） |
| 3 | マージコミットが ClaudeCode 系 + Codex 系の両親を含む | **PASS** — parent `4acb536` + parent `b9ba490`（`git cat-file -p`） |
| 4 | staging ファイル欠落なし（preflight §7 列挙） | **PASS** — 8 ファイルいずれも `HEAD` 樹上に存在（下記） |
| 5 | Codex Supervisor コミット列が残存 | **PASS** — `da09323` / `5691495` / `b9ba490` がいずれも `50346c6` の祖先 |
| 6 | working tree clean | **PARTIAL** — **追跡ファイル**について `git diff` / `git diff --cached` は空。**未追跡** `sync/*`・`archive/*` 多数（本検証ではコミット対象外） |
| 7 | push-state / Decision-Gate Footer | **本書 §3** に記録 |
| 8 | EVT-121 多監督官協調の証跡 | **本書 §4** |

---

## 2. Command excerpts (Evidence-First)

実行環境: `C:\RX_Dev\record-x-supervisor`、検証時 `git fetch origin` + `git pull origin main` 済み。

```text
50346c668bd94d62fc50310eb9f25be6f67f1648
50346c668bd94d62fc50310eb9f25be6f67f1648
50346c668bd94d62fc50310eb9f25be6f67f1648
## main...origin/main
```

`50346c6` のオブジェクト（親 2 個）:

```text
parent 4acb536ee3ff7d155353038c60d66d1fa46d19ee
parent b9ba490cd2d74d0480b903c42544f9b98f02b679
```

祖先関係（`git merge-base --is-ancestor <commit> 50346c6`、exit 0 = 含有）:

| commit | role | exit |
|--------|------|------|
| 4acb536 | local / ClaudeCode 側 first-parent 直前 | 0 |
| b9ba490 | Codex / review / feedback line tip | 0 |
| da09323 | Codex boot (#3) | 0 |
| 5691495 | Codex review (#4) | 0 |

Preflight §7 — 存在確認（`Test-Path` すべて OK）:

- `staging/claude_md_section4_revision_v0.1_draft.md`
- `staging/push_state_check_script_v1.md`
- `staging/report_footer_script_v1.md`
- `staging/verification_before_completion_discipline_v1.md`
- `staging/adoption_matrix_v1.md`
- `staging/evt_121_revised_staging_pack_v2.md`
- `staging/stage_0_mirror_reconciliation_note_v1.md`
- `staging/evt_121_dashboard_inventory_observability_model_v0.1.md`

追跡ファイルの変更有無: `git status --porcelain=v1 | Select-String -Pattern '^[^?]'` → **一致なし**（`M` / `A` / `D` なし）。

---

### 3. Decision-Gate Footer（本完了報告作成時点）

テンプレート整合: `staging/evt_121_dashboard_inventory_observability_model_v0.2.md` §4-A。

### Decision-Gate Footer(本完了報告作成時点)

- [x] **最新 回覧板 確認**: 本 repo 樹上で最新ファイル名を確認 `internal/circular/circular_20260429_006.md`（番号最大、2026-05-08 検証時点）。本文の詳細読了は本タスク範囲外。
- [ ] **最新 区報 確認**: 未実施（本タスク = git merge 物理検証中心）。
- [ ] **関連 官報 確認**: 未実施（該当タスクが supervisor merge 検証に限定）。
- [ ] **関連 ticket state 確認**: commander `tickets_*` の再カウント未実施（Research v1.1 の引用値に依存せず、未再計測と明記）。
- [ ] **関連 completion_report 確認**: factory/commander 両辺の件数再整合は未実施。
- [x] **push-state 確認**: `HEAD` = `main` = `origin/main` = `50346c668bd94d62fc50310eb9f25be6f67f1648`、ahead/behind なし（§2 抜粋）。
- [ ] **dashboard mismatch flags 確認**: N/A（アプリ層ダッシュボードではなく repo 合流検証）。

---

## 4. EVT-121 — multi-supervisor coordination evidence

- **事象**: 同一 `record-x-supervisor` / `main` 上で ClaudeCode 監督官系コミット列と Codex 監督官系コミット列が分岐（non-fast-forward）。
- **方針**: `rebase` ではなく **`git merge origin/main`**（ヤス preflight 整合）。
- **結果**: merge commit **`50346c6`**。first parent **`4acb536`**（ローカル整備列）、second parent **`b9ba490`**（Codex / Commander feedback 列）。
- **設計上の関連文書**: `staging/multi_supervisor_coordination_proposal_v1.md`、事前調査 `staging/divergence_preflight_report_v1.md`。

---

## 5. working tree 注記（要件 6 の厳密化）

- **索引（index）**: 追跡パスに対する未ステージ / ステージ済み差分なし。
- **未追跡**: `sync/checkup-scores/`、`sync/completion_reports/b_line/`、`sync/sync_script/` ほか（本証跡では集計のみ、コミットしない）。

---

*本証跡は EVT-121 観測・多監督官並走の物理記録として staging に保持する。*
