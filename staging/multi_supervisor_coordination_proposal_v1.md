---
id: MULTI-SUPERVISOR-COORDINATION-PROPOSAL-v1
title: Multi-Supervisor(ClaudeCode/Opus + Codex/GPT-5.5)Coordination Proposal v1
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line, ClaudeCode/Opus 4.7)
yasu_decision_history:
  - "2026-05-08 朝中盤後末末末末末末: ヤス指示「multi-supervisor Codex/ClaudeCode coordination = 別 staging proposal」"
yasu_constraints:
  - "Read-only design, no implementation"
  - "Do not approve hooks or skills"
  - "Existing 回覧板/区報/官報 mechanisms primary, new mechanisms secondary"
  - "Separate from DP-001 C-2/C-3/C-4"
ticket_type: governance_coordination_design
related_evt: EVT-119 仮説 (c) 確証(Codex 監督官並走稼働物理確証)+ EVT-121 第 7 例物理証拠候補(認知失敗)
---

# Multi-Supervisor Coordination Proposal v1(ヤス §6 10 topics 遵守)

## 1. Goal

ClaudeCode 監督官(Argus / Opus 4.7)+ Codex 監督官(GPT-5.5) が同 supervisor repo で並走稼働する際の **状態認識共有 + 衝突防止 + 経路明示** の設計。

EVT-119 仮説 (c) 確証(本日 push divergence 経由)+ EVT-121 第 7 例(監督官 A が Codex 並走を認知失敗)= 構造課題物理証拠 9 → 11 例累積。

---

## 2. ヤス指定 10 topics(§6 完全遵守)

### 2-A. Supervisor instance identity

| 項目 | 内容 |
|---|---|
| ClaudeCode 監督官 | codename: `Argus`(supervisor A-line)/ model: Opus 4.7 / 起動環境: Claude Code CLI / cwd: `record-x-supervisor` |
| Codex 監督官 | codename: 未確定(本提案で要請、推奨: `Codex-Supervisor` or `Cogito` 等)/ model: GPT-5.5 / 起動環境: Codex CLI / cwd: 未確認(C:\tmp\ 別 path 候補)|
| 識別装置 | commit metadata(author / committer)+ branch naming + AGENTS.md 識別子 |

### 2-B. active instance declaration

| 経路 | 内容 |
|---|---|
| L1 回覧板 | `record-x-supervisor/internal/circular/circular_YYYYMMDD_NNN.md`(既存装置)に **instance_id frontmatter 必須**(`instance_id: Argus | Codex-Supervisor | ...`)|
| 起動時宣言 | 各 supervisor instance はセッション起動直後に L1 回覧板 へ起動宣言追記(現状 ClaudeCode 側のみ規律、Codex 側は未確認)|
| 並走検出 | L1 回覧板で他 instance の最新追記を読了 → 並走認知 |

= **既存 L1 回覧板装置を first-class に活用**(ヤス指示「既存 mechanisms primary」遵守)

### 2-C. branch naming rule

| パターン | 用途 | 例 |
|---|---|---|
| `main` | 共有 main(両 supervisor が push 対象、divergence リスク主因) | `main` |
| `argus/*` | ClaudeCode 監督官専用作業 branch | `argus/staging-evt-121` |
| `codex/*` | Codex 監督官専用作業 branch | `codex/dp001-supervisor-review` |
| **推奨**:**main 直接 push 制限**、各 instance は専用 prefix branch + PR 経由 main merge | 衝突防止 + audit | (本提案で正式化) |

### 2-D. PR-only or direct-main rule

| 候補 | 評価 |
|---|---|
| 完全 PR-only(direct-main 禁止) | ✅ 推奨(衝突最小化、Codex 既に PR #3/#4/#5 経由実施)|
| direct-main 許容 | 🔴 不推奨(本日 divergence の根因)|
| ハイブリッド(緊急時 direct OK) | 🟡 妥協案(緊急条件明示要)|

= **完全 PR-only 推奨**(ヤス採否、本提案 §3 採否経路)

### 2-E. preflight fetch-before-commit rule

| 規律 | 内容 |
|---|---|
| 起動時 fetch | セッション起動直後 `git fetch origin --quiet` 必須 |
| commit 前 fetch | commit 直前にも fetch 推奨(別 instance push 検出)|
| L1 回覧板照合 | fetch 後、最新 origin/main 追記を L1 回覧板で説明可能か照合 |

= 文書規律先行(hook 化は将来候補、ヤス制約「hook approval なし」遵守)

### 2-F. preflight fetch-before-push rule

| 規律 | 内容 |
|---|---|
| push 直前 fetch | `git push` 実行直前に必ず `git fetch origin --quiet` |
| divergence 検出時 | push 中止 + L1 回覧板照合 + 監督官 instance 間調整 + ヤス採否経路 |
| 自動 push 禁止 | ヤス制約継続(本提案で再確認) |

### 2-G. L1 circular / activity ledger update rule

| 場面 | 必須追記 |
|---|---|
| セッション起動 | 起動宣言(instance_id + 起動時刻 + cwd + model) |
| 重要 commit 前 | commit 予約(連番予約方式 §5、既存 supervisor README v1.1 = `internal/circular/README.md` §5-A 起源) |
| commit 後 | commit 完了通知(commit hash + scope) |
| push 前 | push 予約(divergence 確認結果)|
| push 後 | push 完了通知 |

= L1 回覧板既存装置の **両 instance 義務化**(ヤス指示「既存 mechanisms 接続 primary」遵守)

### 2-H. commit reservation or sequence reservation rule

| 既存装置 | 適用 |
|---|---|
| supervisor `internal/circular/README.md` v1.1 §5 連番予約方式 | **両 instance に拡張適用**(現状 ClaudeCode 側のみ) |
| `circular_YYYYMMDD_NNN.md` 命名 | 共通 namespace(両 instance が同 NNN 採番禁止) |
| Test-Path 義務(README §5-D)| 起案前必須 |

= 既存装置同型展開(新規装置追加なし)

### 2-I. handoff format between ClaudeCode Supervisor and Codex Supervisor

| 場面 | format |
|---|---|
| ClaudeCode → Codex handoff | `handoff/YYYYMMDD_argus_to_codex.md`(新規 path 候補、staging 配置)|
| Codex → ClaudeCode handoff | `handoff/YYYYMMDD_codex_to_argus.md`(同上)|
| 両 instance 同期点 | L3 官報(`shared/official_gazette/`、司令官側)へ重要決定要約掲示 |
| 既存 handoff(supervisor instance 単一系列)継承 | 拡張対応 = supervisor `handoff/` ディレクトリに instance prefix 追加可 |

### 2-J. rule for detecting another supervisor instance already active

| 検出経路 | 内容 |
|---|---|
| 起動時 L1 回覧板 query | 直近 24h の追記を確認 = 他 instance 活動検出 |
| 起動時 git fetch + log query | 直近 24h の他 instance commit 検出(branch prefix で識別)|
| AGENTS.md / instance metadata | 各 instance がセッション中に必読、instance_id 一意性確証 |
| 衝突発生時 | L1 回覧板内合議 → 2 往復未収束時 ヤス再介入(関係性ポリシー §3.3-a)|

---

## 3. ヤス採否要件(段階的)

| Phase | 内容 | ヤス採否 |
|---|---|---|
| Phase 0(本 v1)| staging design 配置 | ✅ 本提案 |
| Phase 1 | L1 回覧板両 instance 義務化(既存装置 + 文書規律改訂)| 🟡 規律即時運用採否 |
| Phase 2 | branch naming rule + PR-only rule 正式化 | 🟡 ガバナンス採否 |
| Phase 3 | preflight fetch 規律(commit 前 + push 前)文書化 | 🟡 規律採否 |
| Phase 4 | handoff format 両 instance 拡張 | 🟡 採否 |
| Phase 5(将来)| sample script / hook derive(dashboard 観測 gap 確証後)| 🔴 dashboard model 経由 derive のみ |

= **dashboard-first model v0.1 と整合**(本提案も既存装置 first、hook/script は将来 derive)

---

## 4. 既存装置との整合(回覧板/区報/官報、ヤス指示遵守)

| 既存装置 | 本提案での役割 |
|---|---|
| L1 回覧板(`internal/circular/`)| **核心**(active instance 宣言 + 連番予約 + 並走検出) |
| L2 区報(`internal/regional/`)| 役割横断論点(本提案も含む)+ 両 instance の合議経路 |
| L3 官報(`shared/official_gazette/`、司令官側)| 重要決定共有(本提案採択時に追記)|
| ticket lane | 本提案の ガバナンス対象は ticket ではないが、起案誤認(自前採番 EVT-120)の検出経路として継続 |
| completion lane | 本提案範囲外(Stage 0 v1.2 で確証済) |
| push-state lane | 本提案 §2-F で必須化 |

= **新規装置追加 0 件**(全件既存装置運用拡張、ガレージ §1.5 整合)

---

## 5. ヤス制約遵守

| 制約 | 遵守 |
|---|---|
| Read-only design, no implementation | ✅ |
| Do not approve hooks or skills | ✅(Phase 5 hook は将来 derive、本提案で approve せず)|
| Existing 回覧板/区報/官報 primary | ✅(§4 で既存装置 5 件統合) |
| Separate from DP-001 C-2/C-3/C-4 | ✅ |
| Separate from DO-FACTORY-233 / G-009-012 | ✅ |
| 工場長直接指示禁止 | ✅(本提案は監督官 instance 間のみ) |

---

## 6. 改訂履歴

- v1.0(2026-05-08 朝中盤後末末末末末末):初版起案、ヤス指示「multi-supervisor Codex/ClaudeCode coordination = 別 staging proposal、§6 10 topics 必須」契機。10 topics 全件記述 + 既存装置(L1/L2/L3 + ticket + completion + push-state)統合 + 新規装置追加 0 件 + 段階採否経路 5 Phase + dashboard-first model v0.1 整合 + ヤス制約 6 件遵守。

---

*監督官 A Multi-Supervisor Coordination Proposal v1(staging、ヤス採否対象、既存装置 first、新規装置 0)*
