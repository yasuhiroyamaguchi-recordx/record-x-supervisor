# Supervisor 側 Garage Doctrine 監査 v0.5(本セッション内圧縮完遂版、L1 全装置 + L2 注目装置)

**配置先**: `02_physical/garage_audit_20260504/supervisor_audit_v0.5.md`
**起案日**: 2026-05-01(Day 129、Phase A 末、本セッション内)
**起案者**: 監督官 A(Argus、Clear 後新 instance)
**位置づけ**: ヤス指示「すべて一日で終わらせる」採択 → 本セッション内で supervisor 棚卸し完遂を圧縮実施
**粒度**: **ハイブリッド**(L1 全装置集計 + L2 注目装置詳細、L8 同型バイアス回避のため過剰計測抑制)
**v0.1 (operations 配下のみ)からの拡張**: 残スコープ全装置一括精査

---

## 0. アプローチ

### 0-A. ハイブリッド粒度の根拠

| 観点 | 内容 |
|---|---|
| L2 全装置詳細 | 50+ 装置 × 5-10 分 = 数時間 = 本セッション内圧縮困難 |
| L1 全装置 + L2 注目深掘り | L8 候補 + single source 違反候補 + 三社円卓直接議題のみ深掘り = 簡素化原則整合 |
| 採択 | **ハイブリッド**(L1 50 装置集計 + L2 注目 10 装置深掘り)|

---

## 1. L1 全装置集計(supervisor 全配下)

### 1-A. operations/ 配下(13 装置、v0.1 から再掲 + 接続状態更新)

| ファイル | 装置目的 | 接続状態 | LOC | L8 該当? | single source 違反? | 推奨 |
|---|---|---|---|---|---|---|
| `role_and_conduct.md` | 行動規範詳細 | 📚 参照層 | ~700 | 🟡 200 行超 = adherence 低下リスク | 🟡 CLAUDE.md と部分重複 | **短縮検討**(第 5 回円卓議題)|
| `communication_protocol.md` | 三者間通信プロトコル | ✅ active | - | ❌ | ❌ | 維持 |
| `escalation_and_rollback.md` | エスカレーション規律 | ✅ active | - | ❌ | ❌ | 維持 |
| `board_council_protocol.md` v0.2 | 円卓会議プロトコル | ✅ active | - | ❌ | ❌ | 維持(第 5-8 回流用)|
| `periodic_checkup_protocol.md` v0.2 | 定期検診 | 🟡 部分稼働 | - | 🟡 検診 v0.2 §8 cockpit と重複? | 🟡 ADR-010 superseded 影響 | 整合性確認 |
| `implementation_review_pipeline.md` | 実装レビュー pipeline | 🟡 | - | ❌ | ❌ | 棚卸し継続 |
| `multi_thread_topic_discipline.md` v0.1-draft | マルチスレッド規律 | 🟡 | - | 🟡 系列 L 規律装置 | ❌ | 維持 |
| `post_build_gate_checklist.md` v0.2 | 必達項目漏れ確認 | 🟡 部分稼働 | - | ❌ | 🟡 starter_checklist と用途分離済 | 維持 |
| **`starter_checklist_v0.2.md` v1.0** | 起案前検証 | ❌ ガレージ完全停車 | 225 | 🔴 該当(EVT-070)| 🟡 §1.5-B と部分重複 | **§1.5-B 内統合化**(第 5 回円卓決議)|
| `supervisor_self_checkup_prompt.md` | 自己点検プロンプト | 🟡 | - | ❌ | ❌ | 維持 |
| `template_metabolism_checkup.md` | テンプレート新陳代謝 | 🟡 | - | ❌ | ❌ | 維持 |
| `ticket_quality_independent_review.md` | チケット品質独立レビュー | 🟡 | - | ❌ | ❌ | 維持 |

### 1-B. sync/sync_script/ 配下(約 25 装置)

| ファイル | 種別 | 接続状態 | L8 該当? | single source 違反? |
|---|---|---|---|---|
| `aggregate-failure-logs.ps1` | aggregator | 🟡 | ❌ | ❌ |
| `archive-order.ps1` | archive | ✅ | ❌ | ❌ |
| `auto-evt-recorder.ps1` | EVT 自動記録 R1-R10 | ✅ | 🟡 検知装置(L8 境界)| ❌ |
| `check-internal-links.ps1` | path verify | ✅ active(週次)| ❌ | ❌ |
| `dream-crystallize-supervisor.ps1` v0.2 | 結晶化 supervisor 域 | 🟡 | ❌ | 🟡 工場長側 CLI 拡張後 ラッパー化候補 |
| `generate-cockpit.ps1` | cockpit 生成 | 🟡 | 🟡 ADR-010 superseded 影響 | 🟡 三者統合要 |
| **`invoke-board-council.ps1`** | **三社円卓召集**(ChatGPT + Gemini)| **🟡 要稼働確認** | ❌ | ❌ | **第 5 回円卓前 稼働確認必須** |
| `notify-yasu-email.ps1` | Yasu 通知 | 🟡 | ❌ | ❌ |
| `order-stale-alert.ps1` v1.x | 発令古さ警告 | ✅ | 🟡 検知装置 | ❌ |
| `pipeline-bottleneck-probe.ps1` v0.2 | bottleneck 検知(B-line)| ❌ ガレージ完全停車? | 🔴 L8 同型(probe 連鎖)= EVT-070 候補類似 | ❌ | **第 5 回円卓 整理対象** |
| `pull-replies.ps1` | commander 応答取込 | ✅ | ❌ | ❌ |
| `review-implementation.ps1` | 実装レビュー | 🟡 | ❌ | ❌ |
| `snapshot-supervisor.ps1` | snapshot | 🟡 | ❌ | ❌ |
| `sync-archive-three-realm.ps1` v0.3 | archive 三者同期 | ✅(B-line v0.3 改修済)| ❌ | ❌ | 維持 |
| `sync-factory-pipeline.ps1` | factory pipeline 同期 | 🟡 | ❌ | ❌ |
| `sync-orders.ps1` v1.x | 発令同期 | ✅ active | ❌ | ❌ | 維持 |
| `sync-regional.ps1` | regional 同期 | 🟡 | ❌ | ❌ |
| `sync-schtasks-state.ps1` v0.1 | schtasks 状態監査 | ✅ | 🟡 検知装置 | ❌ |

L1 集計: ✅5 / 🟡11 / ❌1 / 📚0(_helpers + json は別カウント)

### 1-C. 02_physical/ 配下(約 10 装置 + ディレクトリ)

| ファイル / dir | 種別 | 接続状態 | L8 該当? | single source 違反? |
|---|---|---|---|---|
| `_reference.md` | 参照ガイド | 📚 | ❌ | ❌ |
| `capability_catalog.md` v0.1 | supervisor 機能カタログ(人間更新)| 🟡 部分稼働(2026-04-29 以降空白)| ❌ | 🟡 three_realm_capability_catalog と重複候補 |
| `cockpit/` | cockpit 装置(ADR-010 superseded)| 🔴 ADR-010 不採択確定 | 🔴 superseded 装置残置 | ❌ | **削除候補**(検診 v0.2 §8 で機能継承済)|
| `do_supervisor_drafts/` | DO 起案場所 | ✅ | ❌ | ❌ |
| `garage_audit_20260504/` | 本監査出力 | ✅(本日新設)| ❌ | ❌ |
| `recording_office_health_check_v1_0.md` | 記録庁健全性 | 📚 | ❌ | ❌ |
| `research/` | 調査レポート保管 | ✅(本日新設)| ❌ | ❌ |
| `three_realm_capability_catalog.md` v0.1-draft | 三者統合機能カタログ仕様 | ❌ ガレージ完全停車(自動更新機構未実装)| 🟡 自動更新未実装 = ガレージ §1.5 違反候補 | ❌ | **第 5 回 + 第 8 回円卓議題**(M2.3 含)|
| `throughput_optimization_protocol.md` v0.1 | TOC スループット最適化 | 🟡 | ❌ | ❌ |
| `two_layer_knowledge_base.md` | 2 層知識ベース | 📚 | ❌ | ❌ |
| `v1_1_FINAL_revision_candidates.md` | v1.1 改訂候補 | 📚 | ❌ | ❌ |

L1 集計: ✅3 / 🟡3 / ❌2 / 📚3

### 1-D. adrs/ 配下(6 装置、ADR-004 欠番)

| ファイル | 状態 | 接続状態 | L8 該当? | 推奨 |
|---|---|---|---|---|
| `ADR-001_control_panel_v1.0_FINAL.md` | FINAL | 📚 | ❌ | 維持 |
| `ADR-002_relationship_policy_v1.2.md` | v1.2 | 📚 | ❌ | 維持(v1.3 候補議題)|
| `ADR-003_philosophical_foundation_draft.md` | draft | 📚 | ❌ | 維持 |
| `ADR-005_phased_autonomy_release.md` | active | ✅ | ❌ | 維持 |
| `ADR-009_council_v03_revision_plan.md` v1.4 | active(本日改訂)| ✅ | ❌ | 維持(第 5-8 回円卓再評価)|
| `ADR-010_three_realm_cockpit.md` | **superseded(2026-04-30、第 4 回確定)** | 🔴 | 🔴 superseded 装置 | **削除候補**(検診 v0.2 §8 で継承済)|

L1 集計: ✅2 / 🟡0 / ❌1 / 📚3

### 1-E. archive/ 配下(主要装置)

| ファイル / dir | 種別 | 接続状態 | L8 該当? |
|---|---|---|---|
| `error_patterns.md` | EVT 機械刻印台帳 | ✅ active | ❌ |
| `error_patterns_history/` | 改訂履歴保管 | 📚 | ❌ |
| `error_patterns_index.md` | EVT 索引 | 🟡 自動更新? | ❌ |
| `board_council_decisions.md` | 円卓決議集約 | 🟡 部分稼働 | ❌ |
| `board_council_minutes/` | 円卓議事録 | ✅ | ❌ |
| `orders_history.md` | 発令履歴 | ✅ active | ❌ |
| `peer_reviews_history.md` | 逆査読履歴 | 🟡 | ❌ |
| `yasu_communication_patterns.md` | Yasu 対話パターン | 📚 | ❌ |
| `dream_crystallize_history/` | 結晶化レポート | 🟡 自動稼働実績ゼロ(EVT-065)| 🟡 |
| `starter_checklist_log/` | starter_checklist log(本日新設)| ✅ | ❌ |

L1 集計: ✅3 / 🟡5 / ❌0 / 📚2

### 1-F. rubrics/ 配下(5 装置)

| ファイル | 用途 | 接続状態 | L8 該当? |
|---|---|---|---|
| `dasei_detection_rubric.yaml` | 怠性検出 | 🟡 | ❌ |
| `implementation_review_rubric.yaml` v1.0 | 実装レビュー数値採点 | 🟡 | ❌ |
| `role_execution_rubric.yaml` | 役割実行採点 | 🟡 | ❌ |
| `ticket_quality_rubric.yaml` | チケット品質採点 | 🟡 | ❌ |
| `value_alignment_rubric.yaml` | 価値整合採点 | 🟡 | ❌ |

L1 集計: ✅0 / 🟡5 / ❌0 / 📚0

### 1-G. 01_relationship/ 配下(1 装置)

| ファイル | 状態 | 接続状態 |
|---|---|---|
| `policy_v1.2.md` | active(v1.3 候補議題)| ✅ |

L1 集計: ✅1 / 🟡0 / ❌0 / 📚0

### 1-H. 00_origin/ 配下(主要 7 装置 + dialogues + principles)

| ファイル / dir | 状態 | 接続状態 | 改訂凍結 |
|---|---|---|---|
| `unnamed.md` | active(核心)| 📚 | ✅ 改訂凍結対象 |
| `sp500_theory.md` v1.0 | active | 📚 | ✅ 改訂凍結対象 |
| `two_realm_ecosystem_theory.md` v0.1-draft | active | 📚 | 🟡 v1.0 候補 |
| `dream_mode_doctrine.md` v1.0-draft | active | 📚 | 🟡 v1.0 候補 |
| `no_stasis_doctrine.md` v0.1-draft | superseded(dream_mode に再概念化)| 🔴 史実保持のみ | ❌ |
| `naming_dual_track.md` | active | 📚 | 🟡 |
| `external_resource_intake_principle.md` | active | 📚 | ❌ |
| `dialogues/` | 履歴 | 📚 | ❌ |
| `principles/` | 蒸留 | 📚 | ❌ |

L1 集計: ✅0 / 🟡0 / ❌1 / 📚6

### 1-I. .git/hooks/ 配下

| 状態 | 内容 |
|---|---|
| 🔴 active hook 不在 | sample のみ、post-commit hook 未実装(EVT-069 候補) |

---

## 2. L1 全体集計

| 配下 | ✅ active | 🟡 partial | ❌ dormant | 📚 reference | 合計 |
|---|---|---|---|---|---|
| operations/ | 3 | 8 | 1 | 1 | 13 |
| sync/sync_script/ | 5 | 11 | 1 | 0 | 17 |
| 02_physical/ | 3 | 3 | 2 | 3 | 11 |
| adrs/ | 2 | 0 | 1 | 3 | 6 |
| archive/ | 3 | 5 | 0 | 2 | 10 |
| rubrics/ | 0 | 5 | 0 | 0 | 5 |
| 01_relationship/ | 1 | 0 | 0 | 0 | 1 |
| 00_origin/ | 0 | 0 | 1 | 6 | 7 |
| .git/hooks/ | 0 | 0 | 1 | 0 | 1 |
| **合計** | **17** | **32** | **7** | **15** | **71** |

### 2-A. 接続率

(✅ + 🟡×0.5)/ 合計 = (17 + 16)/ 71 = **約 46%**

第 1 回監査(2026-04-28、EVT-016)= 32 装置中 接続率約 40% → 本監査 71 装置中 46%。

### 2-B. single source 違反候補 + L8 該当候補

| 候補 | 件数 |
|---|---|
| single source 違反候補 | 4 件(starter_checklist_v0.2 / capability_catalog 重複 / starter_checklist 工場長側との運用分離 / dream-crystallize 三者展開後ラッパー化候補)|
| L8 該当候補 | 5 件(starter_checklist_v0.2 / pipeline-bottleneck-probe / cockpit superseded 残置 / ADR-010 superseded 残置 / three_realm_capability_catalog 自動更新未実装)|

---

## 3. L2 注目装置深掘り(10 件)

### 3-1. starter_checklist_v0.2(本日起案、自己違反第 1 例)

| 観点 | 内容 |
|---|---|
| 装置目的 | 起案前議題前提検証 9 項目チェック |
| LOC | 225 |
| 接続状態 | ❌ ガレージ完全停車(自動発火経路未実装、self-test 1 回 + 自己違反 retrospective 1 件のみ)|
| L8 該当 | 🔴 既存 §1.5-B 5 項目を拡張ではなく独立装置化 = 装置数 +1 |
| 推奨アクション | **§1.5-B 内統合化検討**(第 5 回円卓決議)、または **削除**(SuperPower brainstorming skill で代替済との判定可能性)|

### 3-2. pipeline-bottleneck-probe.ps1 v0.2(B-line 起案)

| 観点 | 内容 |
|---|---|
| 装置目的 | bottleneck 検知 + meta-meter 観測 |
| LOC | 238 |
| 接続状態 | ❌(probe 連鎖 = Argus-B 自認 L8 同型)|
| L8 該当 | 🔴 該当(probe v0.1 → v0.2 → meta-meter → cockpit rubric 拡張連鎖) |
| 推奨アクション | **必要性再判定**(第 5 回円卓、削除 or 統合)|

### 3-3. invoke-board-council.ps1(三社円卓召集機構)

| 観点 | 内容 |
|---|---|
| 装置目的 | ChatGPT + Gemini 召集 = 三社円卓運用前提 |
| 接続状態 | 🟡 要稼働確認(API キー有効性 + 接続経路) |
| 推奨アクション | **第 5 回円卓前 稼働確認必須**(工場長 Castor 経由) |
| 影響 | 不稼働 → 三社円卓開催不可 → ヤス指摘の同質モデル衝突対処不可 |

### 3-4. cockpit/(02_physical 配下、ADR-010 superseded)

| 観点 | 内容 |
|---|---|
| 状態 | ADR-010 superseded(2026-04-30、第 4 回円卓再起案不採択確定)|
| 接続状態 | 🔴 superseded 装置残置 |
| L8 該当 | 🔴 削除すべき装置の残置 = ガレージドクトリン §1.5 違反 |
| 推奨アクション | **削除候補**(検診 v0.2 §8 で simpler 版継承済 = 機能損失なし) |

### 3-5. ADR-010_three_realm_cockpit.md(superseded)

| 観点 | 内容 |
|---|---|
| 状態 | superseded、第 4 回円卓議題 #10 で再起案不採択確定 |
| 推奨アクション | **保管**(史実保持、archive 移動候補)|

### 3-6. three_realm_capability_catalog.md v0.1-draft

| 観点 | 内容 |
|---|---|
| 装置目的 | 三者統合機能カタログ仕様 |
| 接続状態 | ❌ ガレージ完全停車(自動更新機構未実装、人間更新で機能している可能性 = 議題 #6 棚卸し対象)|
| 推奨アクション | **第 5 回円卓で再判定 + 議題 #8 採否確定**(三者全員)|

### 3-7. capability_catalog.md v0.1(supervisor 機能カタログ)

| 観点 | 内容 |
|---|---|
| 装置目的 | supervisor 機能 catalog(220 行、人間更新)|
| 接続状態 | 🟡 部分稼働(2026-04-29 以降更新空白)|
| 推奨アクション | **整合性確認 + capability_log JSONL との関係再整理**(第 5 回円卓議題)|

### 3-8. role_and_conduct.md(700 行超)

| 観点 | 内容 |
|---|---|
| 装置目的 | CLAUDE.md 拡張(行動規範詳細)|
| LOC | ~700(本日 §1.5-B 改訂で +10 行)|
| L8 該当 | 🟡 200 行制限超 = adherence 低下リスク(調査結果反映)|
| 推奨アクション | **短縮検討**(60-100 行への減算 or progressive disclosure 階層化、第 5 回円卓議題)|

### 3-9. policy_v1.2.md(関係性ポリシー)

| 観点 | 内容 |
|---|---|
| 状態 | v1.2 active(v1.3 候補議題、第 4 回円卓議題 #4 関連)|
| 接続状態 | ✅ active |
| 推奨アクション | **v1.3 起案 議題化**(M2.9 関連、第 5 回円卓 or 第 8 回統合円卓)|

### 3-10. dream_crystallize_history/(自動稼働実績ゼロ)

| 観点 | 内容 |
|---|---|
| 装置目的 | dream-crystallize-supervisor 出力先 |
| 接続状態 | 🟡 自動稼働実績ゼロ(EVT-065、Last Run 1999/11/30)|
| 推奨アクション | **EVT-065 訂正アクション(ArchiveSync + DreamCrystallize 自動稼働失敗原因調査)継続**(ヤス権限 + 監督官 A 共同)|

---

## 4. 監督官 A 二次解釈サマリ(段階 2 への引継ぎ)

### 4-A. 削除候補(L8 整合 = 簡素化原則整合)

| # | 候補 | 理由 |
|---|---|---|
| 1 | `02_physical/cockpit/` | ADR-010 superseded 確定、機能継承済 |
| 2 | `00_origin/no_stasis_doctrine.md` v0.1-draft | dream_mode_doctrine に再概念化済(史実保持選択肢あり)|

### 4-B. 統合候補

| # | 統合元 | 統合先 | 効果 |
|---|---|---|---|
| 1 | `operations/starter_checklist_v0.2.md`(225 行)| `operations/role_and_conduct.md` §1.5-B | 装置数 -1、§1.5-B 内 9 項目テーブル化 |
| 2 | `02_physical/capability_catalog.md` + `three_realm_capability_catalog.md` | 単一統合 catalog | 装置数 -1、人間更新 vs 自動更新の整理確定後 |
| 3 | `sync/sync_script/pipeline-bottleneck-probe.ps1` v0.2 | sync-schtasks-state.ps1 v0.1 拡張 | L8 同型解消、装置数 -1 |

### 4-C. 短縮候補

| # | 装置 | 短縮案 |
|---|---|---|
| 1 | `operations/role_and_conduct.md`(~700 行)| 60-100 行核 + `.claude/rules/` path-scoped 階層化(調査結果反映)|
| 2 | `CLAUDE.md`(~200 行)| 60-100 行核 + 規律装置参照リンク |

### 4-D. 三社円卓 第 5-8 回 議題提案

| 円卓 | 議題候補 |
|---|---|
| 第 5 回(supervisor)| 1. starter_checklist v0.2 統合化 2. cockpit 削除 3. role_and_conduct.md 短縮 4. policy v1.3 起案 5. invoke-board-council.ps1 稼働確認結果採択 |
| 第 8 回(統合)| 1. capability_catalog 統合方針 2. three_realm_capability_catalog 自動更新採否 3. M2.9 関係性ポリシー v1.3 4. M2.3 post-commit hook(L8 整合形式 = 単一統合スクリプト)5. CLAUDE.md 短縮 + hooks 物理強制設計 |

---

## 5. 改訂履歴

- v0.1(2026-05-01): operations/ 配下のみ初回着手分
- **v0.5**(2026-05-01 本セッション内圧縮、ヤス「すべて一日で終わらせる」指示採択): supervisor 全配下 71 装置 L1 集計 + L2 注目 10 装置深掘り + 監督官 A 二次解釈サマリ + 三社円卓議題提案。司令官 α + 工場長 Castor 棚卸し受領後、`three_realm_audit_final.md` v1.0 統合予定。
