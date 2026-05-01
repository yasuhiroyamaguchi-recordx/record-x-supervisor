# Supervisor 側 Garage Doctrine 監査 v0.1(進行中、2026-05-04 期限)

**配置先**: `02_physical/garage_audit_20260504/supervisor_audit_20260501_inprogress.md`
**起案日**: 2026-05-01(Day 129、Phase A 末)
**起案者**: 監督官 A(Argus、Clear 後新 instance)
**期限**: 2026-05-04(Phase B-α 起動 Day 132)
**位置づけ**: 第 4 回円卓決議 議題 #6 既存装置棚卸しの supervisor 側分担(commander/factory 側は司令官 α + 工場長 Castor 並行実施)
**用途**: 第 5 回円卓会議(2026-05-04 棚卸し完遂後開催予定)の素材
**監査基準**: 第 4 回円卓決議 議題 #2「装置」定義 = (iv) single source 主 + (ii) schtask 数 副 + ガレージドクトリン §1.5 接続率(✅/🟡/❌/📚 4 分類)

---

## 0. 監査範囲

| 配下 | 内容 |
|---|---|
| `operations/` | 運用文書 + 規律装置 |
| `sync/sync_script/` | 同期スクリプト群 |
| `02_physical/` | 物理層仕様(本フォルダ含む)|
| `adrs/` | ADR 群 |
| `archive/` | 履歴 + EVT 台帳 |
| `rubrics/` | 採点基準 |
| `01_relationship/` | 関係層 |
| `00_origin/` | 哲学層 |
| `.git/hooks/` | active hook 状態 |

---

## 1. operations/ 配下棚卸し(初回着手分)

| ファイル | 装置目的 | 接続状態 | single source 違反? | L8 該当? | 推奨 |
|---|---|---|---|---|---|
| `role_and_conduct.md` | 行動規範詳細(CLAUDE.md 拡張)| 📚 参照層 | - | - | 維持(短縮検討候補、第 5 回円卓 議題)|
| `communication_protocol.md` | 三者間通信プロトコル | ✅ active | - | - | 維持 |
| `escalation_and_rollback.md` | エスカレーション規律 | ✅ active | - | - | 維持 |
| `board_council_protocol.md` v0.2 | 円卓会議プロトコル | ✅ active | - | - | 維持(第 5 回流用)|
| `periodic_checkup_protocol.md` v0.2 | 定期検診 | 🟡 部分稼働 | - | - | 検診結果 EVT-065 反映済 |
| `implementation_review_pipeline.md` | 実装レビュー pipeline | 🟡 部分稼働 | - | - | 棚卸し継続 |
| `multi_thread_topic_discipline.md` | マルチスレッド規律 | 🟡 | - | - | 棚卸し継続 |
| `post_build_gate_checklist.md` v0.2 | 必達項目漏れ確認(実装後)| 🟡 部分稼働 | starter_checklist v0.2 と用途は別 | - | 維持 |
| **`starter_checklist_v0.2.md` v1.0**(本日起案)| 起案前議題前提検証 | ❌ ガレージ完全停車(自動発火経路未実装、self-test 1 回のみ) | 🟡 §1.5-B 既存規律と二重?| 🔴 該当(EVT-070 候補)| **§1.5-B 内統合化検討**(第 5 回円卓決議)|
| `supervisor_self_checkup_prompt.md` | 自己点検プロンプト | 🟡 | - | - | 棚卸し継続 |
| `template_metabolism_checkup.md` | テンプレート新陳代謝 | 🟡 | - | - | 棚卸し継続 |
| `ticket_quality_independent_review.md` | チケット品質独立レビュー | 🟡 | - | - | 棚卸し継続 |

### 1-A. 監査ハイライト

- **starter_checklist_v0.2.md** = 本日起案 + 自己違反第 1 例 + L8 同型候補 = **第 5 回円卓で §1.5-B 内統合化検討**
- 残装置は 2026-05-02-04 で順次精査

---

## 2. 第 1 回監査(2026-04-28 / Day 130 末)からの差分

### 2-A. 第 1 回監査結果(EVT-016 由来)

- 32 装置中: ✅4 / 🟡9 / ❌8 / 📚11
- 接続率: 約 40%

### 2-B. 第 2 回監査(本監査)期待値

- 接続率改善検証
- L8 観点新規追加(single source 違反 + 拙速追加候補検出)
- 第 5 回円卓素材化

### 2-C. 進捗状況(本ファイル起案時点)

- operations/ 配下: 13 装置中 ✅3 / 🟡8 / ❌1 / 📚1(初回着手分のみ)
- 残: sync/sync_script/ + 02_physical/ + adrs/ + archive/ + rubrics/ + 01_relationship/ + 00_origin/
- 期限: 2026-05-04(残 3 日)

---

## 3. 残作業

| # | 作業 | 期限 |
|---|---|---|
| 1 | sync/sync_script/ 配下棚卸し | 2026-05-02 |
| 2 | 02_physical/ 配下棚卸し | 2026-05-02 |
| 3 | adrs/ 配下棚卸し | 2026-05-03 |
| 4 | archive/ + rubrics/ + 01_relationship/ + 00_origin/ 配下棚卸し | 2026-05-03 |
| 5 | 三者統合(commander + factory 側棚卸し受領 + 統合)| 2026-05-04 |
| 6 | `02_physical/garage_audit_20260504/three_realm_audit_final.md` 完成 | 2026-05-04 |

---

## 4. 改訂履歴

- v0.1(2026-05-01 / Day 129、Phase A 末): 初版起案、operations/ 配下初回着手分のみ精査、第 4 回円卓決議 暫定降格契機の即時着手、第 5 回円卓素材化目的、L8 観点新規追加。
