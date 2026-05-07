---
id: EVT-121-MVP-WAVE-DRAFT-v1
title: EVT-121 MVP WAVE draft v1(dashboard/inventory-first、Research v1.1 §4.5 / §8 / §9 由来)
status: DRAFT_STAGING_FOR_YASU_PLANNING
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Cursor agent)
ticket_type: wave_draft_planning_only
research_basis: staging/dashboard_build_state_inventory_research_v1.md (v1.1)
related_evt: EVT-121
note: Commander へのチケット発行・Factory 実装指示・DP-001 C-2/C-3/C-4 承認は本 draft の範囲外
---

# EVT-121 MVP WAVE draft v1

## Scope constraints（本 WAVE 草案の固定境界）

- **dashboard / inventory-first**（hook/skill-first に置換しない）。
- **既存装置接続のみ**（新規 repo の常駐デーモンや認証本番構成は含めない）。
- **チケット数見積 5〜7**（本稿は §4.5 に沿い **7 件**列挙。最小 MVP は「必須 3 + 推奨 2」= **5 件**、任意 2 は落とせる）。
- **新規 hook / 新規 skill 追加なし**（既存 `.claude/hooks/` 装置の「読み取り参照」のみ可）。
- **新規 CI / GHA ワークフローなし**。
- **司令官へのチケット発行なし**（起案は監督官 staging のみ。実運用の起案経路はResearch §7-D に従いヤス採否後）。
- **Factory への直接実装指示なし**。
- **DP-001 C-2 / C-3 / C-4 承認なし**（本 MVP は EVT-121 観測・可視化スコープ）。

---

## WAVE 票一覧（7 件、Research v1.1 §4.5 仮 ID）

仮チケット ID は Research の `DO-CP-MVP-EVT121-00x` を維持。実番・起案はヤス採否後。

| id | purpose（要約） | existing source function | repo / path（主） | dashboard lane（v0.2 §3） | read-only output | DoD（受入れ条件の縮小定義） | risk if deferred | approval owner | blocked / not blocked |
|----|-----------------|---------------------------|-------------------|---------------------------|------------------|-----------------------------|------------------|----------------|------------------------|
| DO-CP-MVP-EVT121-001 | 7 lanes 分の **読み取り専用** inventory を単一クエリ（又は単一 JSON）に集約し、肉眼確認可能にする | **factory**: `mcp-servers/capability_registry` / `evt_search` / `handoff_summary`；**supervisor**: `sync/sync_script/sync-factory-pipeline.ps1`、`pipeline-bottleneck-probe.ps1`、`pull-replies.ps1`；**commander**: `step8_circular_log.ps1` / `step9_gazette_log.ps1` 等の出力参照（Research §8-A〜C / §9 P0） | **ProjectRX** `wt_common/dashboard/`（表示・既存 SWR 経路）、**supervisor** `sync/sync_script/`（集約スクリプト置き場の候補は Research §10 のみ参照。実配置はヤス採否後） | **全 7 lanes**（回覧板・区報・官報・ticket・completion・push-state・dashboard）に対応する **lane→証跡パス**対応表付き snapshot | **JSON 又は Markdown table**（git/worktree への write なし）。UI は既存 dashboard への read-only パネル追加でも可 | (1) 7 lanes それぞれについて「根拠パス or 装置名」が列挙され、(2) 再実行で同一形式が得られる、(3) write 操作がない | **観測装置不在が継続**し、EVT-120/121 系の認知ラグが再発 | **ヤス**（実装・起案ゲート） | **not blocked**（read-only・既存ログ/MCP の参照のみ。秘匿情報の取り扱いは ProjectRX 側ポリシー順守） |
| DO-CP-MVP-EVT121-002 | mismatch を **taxonomy（v0.1 §6 10 分類）**に載せた **アラート表示**で「どの pipeline が赤か」を一目化 | **DO-CP-038** 由来の dashboard ↔ MCP 統合、`ApiStatusPill` 系。**factory** `mcp-servers/evt_search`、**supervisor** `pipeline-bottleneck-probe.ps1` / `aggregate-failure-logs.ps1`（Research §8） | **ProjectRX** `wt_common/dashboard/`（既存 MCP integration 箇所）、**factory** `wt_common/mcp-servers/evt_search` | **pipeline mismatch**（副: **dashboard** lane の mismatch フラグ表示） | **read-only** panel：lane 別 🟢🟡🔴 + taxonomy ラベル + 根拠 URL/path | (1) 既存 MCP/health endpoint を壊さない、(2) 10 分類のうち「データ不足」は explicit `unknown`、(3) ユーザー操作で remote write しない | **EVT-120/121 検出ラグ**（どの lane が壊れているか判別が遅い） | **ヤス** | **not blocked**（C-2 承認と独立。表示のみ） |
| DO-CP-MVP-EVT121-003 | **回覧板 / 区報 / 官報**の既存ファイル群を dashboard から **閲覧のみ**で辿れる | **commander** `scripts/commander_auto_pipeline/step8_circular_log.ps1`、`step9_gazette_log.ps1`；**supervisor** `internal/circular/`、`internal/regional/`、`shared/official_gazette/`（Research §8） | **ProjectRX** `wt_common/dashboard/`（viewer パネル）+ **supervisor** repo 内上記パス（ミラー経由で読む設計ならその mirror path） | **回覧板 / 区報 / 官報**（3 分割でも 1 panel でも可） | **read-only** viewer：latest id + 抜粋 + フルパス（編集 UI なし） | (1) 少なくとも supervisor 樹上の latest circular ファイル名と一致、(2) 404 は empty state、(3) write API なし | **既存装置が decision workflow から切り離されたまま** | **ヤス** | **not blocked**（ファイル read のみ。アクセス権は deployment 設計で制御） |
| DO-CP-MVP-EVT121-004 | **push-state**（local/remote divergence、unpushed）を dashboard に載せ、multi-supervisor 並走時の **同一 `main` 競合**を早期可視化 | **supervisor** `staging/push_state_check_script_v1.md`（設計）+ **git**（`fetch` / `rev-list` / `merge-base` 相当の read-only コマンド結果を feed 化する案）。**commander** / **supervisor** `pretooluse_breaker_block.ps1` は「認知補助」として文献参照のみ（Research §9） | **ProjectRX** `wt_common/dashboard/` +（データ source が supervisor worktree なら）**readonly mirror** または **手動貼付 API なし**の static snapshot モード | **push-state lane** | **read-only** status card：ahead/behind、両親 merge の有無、last verified timestamp | (1) write なし、(2) 「検証時刻」と「data source（static vs live）」を表示、(3) divergence 時は 🔴 | **divergence 検出ラグ**（本件と同型の再発） | **ヤス** | **partially blocked** — **live git query を dashboard から行う**構成は **deployment + セキュリティ + Yasu 明示承認**が要る。**not blocked** — **static JSON 手動更新**／**CI 外のローカル script 出力を読むだけ**に限定する MVP なら着手可（Research「staging のみ」整合） |
| DO-CP-MVP-EVT121-005 | **ticket lane** で active/completed/draft の **件数・SSOT 乖離**を panel 化（Research の 🔴 / 🟡 表示） | **commander** `step5_5_generate_tickets_index.ps1` / `generate_tickets_index.ps1`、`check-stray-do-tickets.ps1`；**factory** `wt_common/tickets/`（Research §8-C） | **ProjectRX** `wt_common/dashboard/` + **commander** / **factory** の index 出力パス（ミラー経由） | **ticket**（ticket state lane） | **read-only** 件数比較 + mismatch フラグ + 根拠ファイル | (1) SSOT を上書きしない、(2) 「最終同期時刻」表示、(3) commander/factory 両源が取れない場合は `unknown` | **SSOT 陳腐化継続**（司令官・工場長 counting ズレ） | **ヤス** | **partially blocked** — commander/factory **双方の最新 index にアクセスできる read 経路**が無い環境では完了不可。**not blocked** — ProjectRX 側に **既に sync された JSON** があるなら表示のみで可 |
| DO-CP-MVP-EVT121-006（任意） | **completion_report** supply path の **健全性**（空 pull / HQ staging 不在）を **表示のみ**で可視化 | **commander** `step1_pull_completion_reports.ps1`、`process-completion-reports.ps1`；**factory** `scripts/generate-completion-reports-from-prs.ps1`、`write-merged-pr-completion-reports.ps1`（Research §8-C / §9 #2） | **ProjectRX** `wt_common/dashboard/` + **factory** scripts Path（read-only 呼出しは「手動产物の取込」に限定） | **completion**（completion evidence lane） | **read-only** metrics：factory 側件数、commander 側件数、HQ staging empty フラグ | (1) write なし、(2) supply path が欠落している場合は 🔴 + 推奨確認手順（**指示**ではなく **チェックリスト**） | **パイプライン停止検出ラグ** | **ヤス** | **blocked** — 本ユーザー境界「**Factory 指示なし**」「**Commander 発行なし**」のまま **稼働経路を直す**ことはできない。**観測のみ**なら **not blocked**（件数表示と known gap の明示に留める） |
| DO-CP-MVP-EVT121-007（任意） | **Decision-Gate Footer**（v0.2 §4-A）相当の **warning summary** を read-only で生成 | **dashboard** 側の template 文字列化（既存 panel からの合成）／将来的に **server** での read-only compose。hooks/skills による auto-attach はスコープ外 | **ProjectRX** `wt_common/dashboard/` | **dashboard**（footer / export lane） | **read-only** Markdown snippet（コピー用）又は print view | (1) 7 項目すべてが出力に含まる、(2) 欠損は `unchecked` 明示、(3) remote write なし | **完了報告品質のばらつき** | **ヤス** | **partially blocked** — **完全自動 attach** は Observability v0.2 **段階 3**相当＝**別採否**。**not blocked** — 「ワンクリックで snippet を生成」する **UI のみ**（051〜006 の入力が揃う前提） |

---

## 最小 MVP（5 件）への圧縮ルール

| 採択 | 残す id |
|------|---------|
| **must** | 001, 002, 003 |
| **should** | 004（static モード限定）, 005（index feed がある場合） |
| **defer** | 006, 007（任意・観測止まり／UI snippet のみ） |

---

## 参照

- Research v1.1: `staging/dashboard_build_state_inventory_research_v1.md`（§4.5 / §8 / §9 / §10-4）
- 7 lanes / Footer: `staging/evt_121_dashboard_inventory_observability_model_v0.2.md`
- 合流証跡: `staging/evt_121_supervisor_main_reunify_verification_20260508.md`

---

*監督官 A EVT-121 MVP WAVE draft v1（staging、planning のみ、司令官発行・Factory 指示・DP-001 C-2/C-3/C-4 承認なし）*
