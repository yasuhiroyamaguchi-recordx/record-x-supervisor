---
id: ADOPTION-MATRIX-v1
title: EVT-121 Countermeasure Adoption Matrix v1(staging / sample / pilot / enforce 分離一頁)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
yasu_decision_history:
  - "2026-05-08 朝中盤後末末: ヤス指示「one-page adoption matrix separating staging/sample/pilot/enforce + 採用順序遵守」"
yasu_constraints:
  - "Do not bundle as one approval"
  - "P0 / root treatment / Phase 1 immediate are priority labels only, NOT approval labels"
  - "Each item requires separate Yasu approval"
ticket_type: governance_adoption_matrix
---

# EVT-121 Countermeasure Adoption Matrix v1

## 1. 用語定義(ヤス指示反映)

| 段階 | 定義 |
|---|---|
| **staging** | 設計案 staging 配置のみ、レビュー対象、実装 / 配備 / 運用なし |
| **sample** | サンプル出力生成 + 評価(scripts 実装は許可、本番経路には載せない) |
| **pilot** | 限定的 pilot 運用(運用結果取得、廃止可、ヤス採否経路で正式採用判断) |
| **enforce** | 正式採用 + 強制運用(全 instance / 全 session で適用、廃止には別途 ヤス採否) |

= 各段階は **個別 ヤス採否**(bundle 禁止、ヤス指示)

---

## 2. Supervisor-Side 4 staging(本サイクル v2 改訂対象)

| # | 件名 | 段階(2026-05-08 末末末) | 次推奨段階 | 主管 | ヤス採否要 |
|---|---|---|---|---|---|
| 1 | `claude_md_section4_revision_v0.1_draft.md`(§4-D + §4-E 追加) | staging | (Adoption review 後)pilot を経由せず enforce 候補 | 監督官 A 起案 + ヤス | 🔴 yes(CLAUDE.md 本体反映)|
| 2 | `verification_before_completion_discipline_v1.md` | staging | sample(運用試行) → pilot | 監督官 A | 🟡 yes(規律即時運用)|
| 3 | `push_state_check_script_v1.md`(手動 script) | staging | sample(scripts/ 配置 + 出力レビュー)→ pilot | 監督官 A | 🟡 yes(scripts/ 配置)|
| 4 | `report_footer_script_v1.md`(手動 script) | staging | sample(出力レビュー)→ pilot | 監督官 A | 🟡 yes(scripts/ 配置)|

### 2-A. ヤス推奨次決定 scope(supervisor-side)

「approve only sample review preparation for `verification-before-completion` and `push_state_check`」

= **#2 + #3** の sample 段階移行のみ次採否対象、#1 #4 は staging 継続

---

## 3. Commander-Side 5 区分(本サイクル v2 改訂対象)

| # | 区分 | 内容 | 段階(2026-05-08 末末末) | 次推奨段階 | 主管 | ヤス採否要 |
|---|---|---|---|---|---|---|
| 1 | **A** 文書 | commander CLAUDE.md / AGENTS.md 改訂 | staging | (B-E 採否次第)pilot 検討 | 司令官 α + ヤス | 🟢 yes(本体反映)|
| 2 | **B** Skill | 司令官 α `verification-before-completion` 標準起動 | staging | sample → pilot | 司令官 α + ヤス | 🟡 yes(規律運用)|
| 3 | **C** Hook(SessionStart) | 司令官 SessionStart 6 項目自動表示 | staging | sample(出力レビュー)→ pilot | 司令官 α + ヤス | 🔴 yes(hook 配備)|
| 4 | **C** Hook(PostToolUse) | sync/process/move/WAVE 後 自動差分確認 | staging | (SessionStart pilot 後)sample → pilot | 司令官 α + ヤス | 🔴 yes |
| 5 | **D** Script(pull 強化) | pull-completion-reports.ps1 改修 | staging | sample → pilot | 司令官 α + ヤス | 🟡 yes(既存改修)|
| 6 | **D** Script(cross_repo_diff_check) | 司令官側 4 点照合 script | staging | sample → pilot | 司令官 α + ヤス | 🟡 yes(新規配置)|
| 7 | **E** CI/PR Gate | factory PR merge → completion_report 自動生成 GHA | staging | **sample(GHA dry-run + sample artifacts)** → pilot → enforce | 司令官 α + 工場長 + ヤス | 🔴 yes(三者合議) |

### 3-A. ヤス推奨次決定 scope(commander-side)

「approve only the creation of sample outputs and adoption matrix for E category GHA and C category SessionStart hook」

= **#7(E GHA)+ #3(C SessionStart)** の **sample artifacts 作成のみ** 次採否対象、他は staging 継続

---

## 4. 統合採用順序(ヤス指示「review order」反映)

### 4-A. Supervisor-Side(ヤス指定 5 段階)

```
[1] verification-before-completion discipline as document-only operating rule
    ↓ (sample / pilot 完了後)
[2] push_state_check manual script sample review
    ↓
[3] report footer generator sample review
    ↓
[4] CLAUDE.md §4-D / §4-E live edit
    ↓ (repeated manual output review 後)
[5] hooks only after repeated manual output review
```

### 4-B. Commander-Side(ヤス指定 5 段階)

```
[1] Manual script or report-format sample
    ↓
[2] SessionStart display-only hook sample
    ↓
[3] Skill standard
    ↓
[4] CI/GHA candidate with generated sample artifacts
    ↓ (false-positive review 後)
[5] Enforcement hook only after false-positive review
```

### 4-C. ヤス指定「first adoption review scope」

| Side | 第 1 採否 scope |
|---|---|
| supervisor | verification-before-completion + push_state_check の **sample 段階移行のみ** |
| commander | E GHA + C SessionStart の **sample artifacts 作成のみ** |

---

## 5. ヤス採否要 件目一覧(staging → sample → pilot → enforce、各遷移で個別採否)

| # | 装置 | 現段階 | sample 採否 | pilot 採否 | enforce 採否 |
|---|---|---|---|---|---|
| Sup-1 §4-D/§4-E | staging | - | - | 🔴 yes(CLAUDE.md 本体)|
| Sup-2 verification skill | staging | 🟡 yes(運用) | 🟡 yes(全完了報告必須化) | 🔴 yes(規律違反 EVT 化)|
| Sup-3 push_state_check.ps1 | staging | 🟡 yes(scripts 配置)| 🟡 yes(footer 統合) | 🔴 yes(全報告必須)|
| Sup-4 report_footer_generator.ps1 | staging | 🟡 yes(scripts 配置)| 🟡 yes(全報告コピペ運用) | 🔴 yes(全報告自動添付 = hook 化)|
| Cmd-A 文書改訂 | staging | - | - | 🟢 yes(commander 本体)|
| Cmd-B Skill 標準起動 | staging | 🟡 yes | 🟡 yes | 🔴 yes |
| Cmd-C SessionStart hook | staging | 🔴 yes(sample artifacts)| 🔴 yes(pilot 配備)| 🔴 yes(enforce + FP review)|
| Cmd-C PostToolUse hook | staging | 🔴 yes | 🔴 yes | 🔴 yes |
| Cmd-D pull 強化 | staging | 🟡 yes | 🟡 yes | 🟡 yes |
| Cmd-D cross_repo_diff_check | staging | 🟡 yes | 🟡 yes | 🟡 yes |
| Cmd-E GHA workflow | staging | 🔴 yes(sample artifacts)| 🔴 yes(三者合議 + 工場長配信) | 🔴 yes(三社円卓 + FP review)|

凡例:🔴 critical(構造方針見直し)/ 🟡 high(運用変更)/ 🟢 medium(文書改訂)

---

## 6. 各段階で求められる成果物(本 Matrix で要件化)

### 6-A. staging → sample 採否 で必要な成果物

- 構造化フィールド表(supervisor 13 + commander 10 フィールド、本サイクル v2 改訂対象)
- 設計内容詳細(本 Matrix と分離、各 staging 改訂版で記述)
- リスク section(over-automation / alert fatigue / FP / cross-repo authority / etc、本サイクル v2 で追加)

### 6-B. sample → pilot 採否 で必要な成果物

- sample 出力(synced / ahead / behind / diverged / no-remote / dirty-worktree / fetch-failure / Markdown / JSON、push_state_check 10 種)
- sample 出力(synced / unpushed / dirty / fetch-failure、report_footer 4-8 種)
- E GHA sample artifacts(generated completion_report sample + failure output + duplicate detection + revert behavior + secrets / permissions)
- 運用負荷評価
- false-positive 例 + 抑制規律

### 6-C. pilot → enforce 採否 で必要な成果物

- pilot 期間運用結果
- false-positive 件数 / 真陽性件数 / 業務影響
- rollback 成功事例(または rollback 経路確証)
- 三者(三社円卓)合議結果(C/E 区分のみ)

---

## 7. ヤス制約遵守一覧(本 Matrix 全体)

| 制約 | 遵守 |
|---|---|
| Do not bundle as one approval | ✅ 各段階個別採否、Matrix で分離 |
| P0 / root treatment / Phase 1 immediate are priority labels only | ✅ 採否ラベルとは分離(本 Matrix では「priority」記載なし、各装置「ヤス採否要」明示) |
| 各装置 個別ヤス採否 | ✅ §5 に各 staging → sample → pilot → enforce 採否要列挙 |
| Strategy Lab はチケット発行禁止 | ✅(本 Matrix は監督官主管、Strategy Lab 関与なし)|
| 工場長直接指示禁止 | ✅(全装置 司令官 α 経由、関係性ポリシー §3.2)|
| DP-001 C-2/C-3/C-4 関連禁止 | ✅(本 Matrix は EVT-121 構造課題対応のみ)|
| DO-FACTORY-233 別途 block | ✅(本 Matrix とは別ライン)|
| G-009〜G-012 EVT-121 から分離 | ✅(本 Matrix に G 関連なし)|

---

## 8. 改訂履歴

- v1.0(2026-05-08 朝中盤後末末):初版起案、ヤス指示「one-page adoption matrix separating staging/sample/pilot/enforce + 採用順序遵守 + 各装置個別ヤス採否」契機。supervisor 4 + commander 7 = 計 11 装置 を staging/sample/pilot/enforce 4 段階で分離 + 各遷移ヤス採否要件明示 + ヤス指定 first adoption scope(supervisor: verification + push_state_check / commander: E GHA + C SessionStart sample artifacts)+ 各段階成果物要件 統合。

---

*監督官 A Adoption Matrix v1(staging、ヤス明示要請、bundle 禁止 + 段階個別採否)*
