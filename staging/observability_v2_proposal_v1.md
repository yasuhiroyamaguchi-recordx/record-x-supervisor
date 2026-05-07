---
id: OBSERVABILITY-V2-PROPOSAL-v1
title: Observability v2 構造アップデート提案 v1(EVT-121 起動 trigger、4 点照合 + ダッシュボード統合)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
yasu_decision_history:
  - "2026-05-08 朝中盤: Y5 部分 GO(Phase 1 設計 staging まで)、Y6 保留、Y7 EVT-121 GO"
related_evt: EVT-20260508-121(正式)
related_orders: [128-139(構造課題系列)]
target_solving:
  - "司令官 SSOT vs 工場長実装実態 大規模乖離"
  - "監督官の横断観測装置不在"
  - "completion_reports パイプライン停止"
  - "工場長実態確認 trigger 依存"
yasu_hypothesis_addressed: "AI 判断鈍化 = 観測装置不在(累積物理証拠 8 例)"
ticket_type: structural_proposal
---

# Observability v2 構造アップデート提案 v1

## 1. Goal(目的)

EVT-20260508-121(正式)で確証した 4 軸構造課題:

- C1 completion_reports パイプライン停止
- C2 司令官 active 台帳陳腐化
- C3 監督官の横断差分検出不足
- C4 工場長実態確認 trigger 依存

への **物理装置による根本治療**。ヤス推奨「ダッシュボード接続早期化 = 観測装置の物理装置化」と整合。

= **観測装置 v2 アーキテクチャ**(4 点照合 + ダッシュボード統合 + 既存装置最大活用)

---

## 2. 4 段階 Phase 別実装計画

### Phase 1(2026-05-09 〜 12、Y5 採択経路、設計 staging → 実装 → サンプル出力承認)

| 内容 | 主管 | 装置数 |
|---|---|---|
| supervisor `scripts/observability/cross_repo_diff_check.ps1` 配備(`staging/cross_repo_diff_check_design_v1.md` 設計適用)| 監督官 A | +1 |
| 4 点取得(ProjectRX merged + factory completion_reports + commander active + commander completed) | 監督官 A 主管 | ±0(既存 git/gh/find 経由) |
| daily diff report 生成(`sync/observability_reports/cross_repo_diff_YYYYMMDD.md`)| 監督官 A | ±0(既存 sync/ 拡張)|
| 既知 false positive 除外 list 適用(EVT-120 documented + ticket_id_mapping)| 監督官 A | ±0 |
| 初回手動実行 + サンプル出力検証 | 監督官 A → ヤス Y5 検証 | ±0 |

### Phase 2(2026-05-12 〜 16、Y6 採否経路、Phase 1 サンプル承認後)

| 内容 | 主管 | 装置数 |
|---|---|---|
| 監督官 A SessionStart hook 拡張(`pretooluse_breaker_block.ps1` 同型 + 差分 report 必読) | 監督官 A | ±0(既存 hook 拡張) |
| 起動時負荷評価(Y6 採否前提)| 監督官 A | ±0 |
| daily diff report の handoff §1 必読リスト統合(EVT-118 真因治療同型)| 監督官 A | ±0 |

### Phase 3(2026-05-15 〜、DP-001 C-3 ヤス採否経路 + Strategy Lab 連動)

| 内容 | 主管 | 装置数 |
|---|---|---|
| DP-001 C-3(Collector + AI Brief + Snapshot Sync)= **4 点照合 script 出力 → dashboard 統合** | 司令官 α + 工場長 + Strategy Lab | ±0(既存 MCP / dashboard 拡張)|
| MCP capability_registry server(DO-CP-101 既配備)= 4 点照合結果 = capability snapshot 登録 | 工場長 | ±0 |
| MCP evt_search server(DO-CP-102 既配備)= 差分 report 検索可能化 | 工場長 | ±0 |
| MCP handoff_summary server(DO-CP-103 既配備)= handoff §1 自動添付 | 工場長 | ±0 |
| dashboard MCP integration(DO-CP-038 既 merged)= C-3 Collector 統合の物理経路 | 工場長 | ±0 |

= **Phase 3 装置数 ±0**(既存 MCP 5 装置 + dashboard 統合)

### Phase 4(三社円卓 X-4 + 5 軸ガード C 軸採否後、不確定時期)

| 内容 | 主管 | 装置数 |
|---|---|---|
| 自動 alert(差分閾値超過時 = 監督官 inbox 自動投函) | 三者 + ヤス採否 | +1(GitHub Actions workflow)|
| commander/factory への自動通知連動(Phase 4 後段) | 三者 + ヤス採否 | ±0 |

---

## 3. 既存装置との統合(ガレージ §1.5)

### 3-A. 既配備済装置の統合(新規装置追加なし)

| 既存装置 | 統合形態 | 状態 |
|---|---|---|
| supervisor `pretooluse_breaker_block.ps1` | 同型展開で SessionStart hook 拡張(Phase 2)| ✅ 既配備 |
| supervisor `internal/circular/`(L1)+ `internal/regional/`(L2) | 観測 snapshot 共有 candidate(Phase 2)| ✅ 既配備 |
| MCP capability_registry server(DO-CP-101)| 4 点照合結果 = capability snapshot 登録(Phase 3)| ✅ merged 稼働 |
| MCP evt_search server(DO-CP-102)| 差分 report 検索可能化(Phase 3)| ✅ merged 稼働 |
| MCP handoff_summary server(DO-CP-103)| handoff §1 自動添付(Phase 3)| ✅ merged 稼働 |
| dashboard MCP integration(DO-CP-038)| C-3 Collector 統合の物理経路(Phase 3)| ✅ merged 稼働 |
| three-realm stats collector(DO-CP-040)| 4 点照合 script の補完経路(Phase 3)| ✅ merged 稼働 |
| `sync/` ディレクトリ + checkup-scores | observability_cache / observability_reports 配置(Phase 1)| ✅ 既配備 |

### 3-B. 装置数 増減合計

| Phase | 追加 | 削除 | 既存運用拡張 |
|---|---|---|---|
| Phase 1 | +1(cross_repo_diff_check.ps1) | 0 | sync/ 拡張 |
| Phase 2 | 0 | 0 | hook + handoff §1 |
| Phase 3 | 0 | 0 | MCP 5 装置 + dashboard 統合 |
| Phase 4 | +1(GHA workflow) | 0 | inbox 連動 |
| **合計** | **+2** | **0** | 既存 8+ 装置統合 |

= **新規装置 +2 件**(cross_repo_diff_check.ps1 + 自動 alert GHA)+ **既存装置 8+ 件統合経路** = 簡素化原則整合

---

## 4. ヤス仮説への根本治療経路

> 「AI の判断を鈍らせている = 観測装置不在」(ヤス、2026-05-07 朝)

### 4-A. 治療経路の段階的成立

| Phase | 治療効果 |
|---|---|
| Phase 1 | 監督官 A の **横断差分検出** 自動化 = C3 軸根治 開始 |
| Phase 2 | 監督官 A SessionStart で必読 = 認知失敗(EVT-118 同型)根治 |
| Phase 3 | dashboard 統合 = **三者 + Codex + 戦略研究所 全員可視化** = C2/C4 軸根治 |
| Phase 4 | 自動 alert = ヤス手動 trigger 依存解消 = ヤス哲学「人間介在最小化」整合 |

### 4-B. EVT 系列累積 8 例への効果

| EVT | Observability v2 効果 |
|---|---|
| EVT-118(自リポジトリ既存装置認知失敗) | Phase 2 SessionStart 必読で再発防止 |
| 番号衝突(DO-CP-043〜048)| Phase 1 + ticket_id_mapping 適用で検出 |
| EVT-119(Strategy Lab 物理乖離) | Phase 3 dashboard 統合で双方向確認 |
| EVT-120 第 8/9 系列(役割境界違反)| Phase 1 self_authored_suspect 区分で alert |
| 同期未達 5 件 + 28 件 | Phase 1 5 区分で常時検出 |
| 司令官 α コンテキスト切れ | Phase 3 dashboard 状態盤面で発見容易 |
| EVT-121(本件、横断観測装置不在)| **本提案で根治**(段階的成立)|

---

## 5. ヤス採否経路(段階的)

| 段階 | 採否事項 | 状態 |
|---|---|---|
| Phase 1 設計 | Y5 = 部分 GO(本 staging で 5 観点提示完遂) | ✅ 採択済 |
| Phase 1 実装 | Y5 完全採択(サンプル出力承認後) | 🟡 監督官 A 設計 staging 検証 + ヤス採否 |
| Phase 2 | Y6 = 保留(Phase 1 サンプル出力後判断) | 🟡 |
| Phase 3 | DP-001 C-3 ヤス採否(現状 not_approved) | 🟡 中期 |
| Phase 4 | 三社円卓 X-4 + 5 軸ガード C 軸採否 | 🟡 不確定時期 |

---

## 6. 改訂履歴

- v1.0(2026-05-08 朝中盤):初版起案、ヤス Y5 部分 GO + Y7 EVT-121 GO 契機。4 段階 Phase 別計画 + 既存装置統合 + ヤス仮説根本治療経路 + EVT 系列累積 8 例への効果 統合。

---

*監督官 A Observability v2 提案 v1(staging、ヤス採否経路、commit 配置のみ)*
*「EVT-121 起動 trigger + 4 点照合 + ダッシュボード統合 = ヤス仮説根本治療段階的成立 + 既存装置最大活用 + 装置数 +2 件 / 統合 8+ 件」*
