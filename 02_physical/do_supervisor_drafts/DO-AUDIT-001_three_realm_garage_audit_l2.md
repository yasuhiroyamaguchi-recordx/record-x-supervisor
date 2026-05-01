# DO-AUDIT-001: 三者統合 Garage Doctrine 棚卸し v1.0(レベル 2 粒度、案 Z 中間案、三社円卓 第 5-8 回素材)

**ID**: DO-AUDIT-001
**起案**: 2026-05-01(Day 129、Phase A 末)
**起案者**: 監督官 A(Argus、Chairman 役)
**種別**: feat / Infrastructure / governance / 棚卸し / 三社円卓素材
**優先度**: **P0 critical**(三社円卓 第 5-8 回 構造判断素材、第 4 回円卓決議議題 #6 物理装置化)
**Wave**: 統治 / 三者統合 / 簡素化原則期間中
**期限**: **2026-05-03**(段階 1 完遂)/ **2026-05-04**(段階 2 統合完遂、第 5 回円卓開催前日)

---

## 1. 背景

### 1-A. 起案契機(三段構造)

1. ヤス指摘(2026-05-01)「機能実装があっても活用されない原因の特定」+ 「カタログ自動登録は守られているか」
2. ヤス追問「第 4 回円卓は調査結果不十分のまま開催 = 空転可能性」(料理提供前のヒアリング + 在庫 + スタッフスキル比喩)
3. ヤス追問「棚卸しの粒度設計が円卓品質を決める」(トリュフ何 g 比喩)
4. ヤス追問「同質モデル衝突リスク = Anthropic 系 3AI = 第 4 回」+「三社円卓化(Claude + ChatGPT + Gemini)」

### 1-B. 第 4 回円卓決議議題 #6 既存装置棚卸し物理装置化

- 第 1 回監査(2026-04-28、EVT-016)= 32 装置中 ✅4 / 🟡9 / ❌8 / 📚11、接続率約 40%(L1 粒度)
- 第 2 回監査(本 DO)= L2 粒度昇格 + 三者統合 + L8 観点新規追加
- 既存装置の質的拡張 = 装置追加ではない = 簡素化原則整合(LOC ±50% 以内の改訂相当)

### 1-C. 案 Z 中間案採択(役割境界保持 + 精度補完 + 当事者性確保 + L8 整合)

| 段階 | 担当 | 期限 |
|---|---|---|
| 1: 一次棚卸し(自己) | 監督官 A(supervisor)/ 司令官 α(commander)/ 工場長 Castor(factory、司令官 α 経由)| 2026-05-03 |
| 2: 構造的レビュー(二次) | 監督官 A 統合 | 2026-05-04 |
| 3: 三社円卓検証 | 第 5-8 回円卓(Claude + ChatGPT + Gemini + ヤス)| 2026-05-04~07 |

---

## 2. 修正対象

### 2-A. 各 AI 自リポジトリ配下出力

| AI | 出力先 | スコープ |
|---|---|---|
| 監督官 A | `record-x-supervisor/02_physical/garage_audit_20260504/supervisor_audit.md` | operations/ + sync/ + 02_physical/ + adrs/ + archive/ + rubrics/ + 01_relationship/ + 00_origin/ |
| 司令官 α | `record-x-commander/strategy/proposals/20260504_commander_audit.md` | strategy/ + scripts/ + sync/ + outbox/_templates/ |
| 工場長 Castor | `record-x/factory/docs/decisions/20260504_factory_audit.md` 等(司令官 α 経由提出)| tools/ + scripts/ + docs/decisions/ + .github/workflows/ |

### 2-B. 監督官 A 統合出力

`record-x-supervisor/02_physical/garage_audit_20260504/three_realm_audit_final.md`(三者統合レポート、第 5-8 回円卓配布素材)

---

## 3. 設計要件(粒度 = レベル 2)

### 3-A. 共通テンプレート遵守

`record-x-supervisor/02_physical/garage_audit_20260504/template.md` v1.0(本 DO と同時起案)を全 AI 共通使用。

### 3-B. 必須記述項目(各装置別、12 項目)

1. ファイル path
2. 種別
3. 装置目的(1-2 行)
4. LOC
5. 接続状態(✅/🟡/❌/📚)
6. 担当 AI
7. 直近使用実績(過去 7 日)
8. 依存関係
9. **single source 違反候補**(L8 観点)
10. **L8 該当候補**(症状治療 / 監視装置の上の監視装置 / 既存統合より新規追加か)
11. 改訂履歴(直近 30 日 主要 3-5 件)
12. 推奨アクション(維持 / 統合候補 / 削除候補 / 移管候補)

### 3-C. 集計フォーマット(各リポジトリ末尾)

- 種別別装置数(✅/🟡/❌/📚 別)
- 接続率
- single source 違反候補数
- L8 該当候補数
- 推奨アクション集計

### 3-D. 監督官 A 二次解釈(段階 2)

各装置に layer する形で:
- L8 該当判定(✅/🟡/❌)
- 三者跨ぎ統合可能性
- 簡素化原則整合
- 第 5-8 回円卓提案

### 3-E. リポジトリ別追加観点

#### supervisor 側
- starter_checklist v0.2(本日起案)= 自己違反第 1 例 = 統合化検討
- post-commit hook ×3 提案 = 凍結確認
- 第 4 回円卓関連装置整合性

#### commander 側
- commander_judgment_starter_checklist v0.2(7 項目)= 工場長 PR #1005 同型運用整合
- DO-COMMANDER-029 実装結果 + DoD 達成状況
- capability_log_202604.jsonl 最終 entry(2026-04-29)以降の漏れ
- ADR-009 §6 改訂素材整合性

#### factory 側
- 既存 invoke-board-council メカニズム = ChatGPT/Gemini API 接続経路 = 三社円卓運用前提
- ChatGPT API キー稼働状態
- Gemini API キー稼働状態
- PR #1005 starter_checklist 運用実績
- dream-crystallize --domain factory 既存稼働

---

## 4. スコープ外(明示的除外、L3 領域)

| 除外項目 | 別経路 |
|---|---|
| 哲学層整合性詳細評価 | DO-AUDIT-002(L3、後日)|
| EVT 連動詳細分析 | 既存 error_patterns.md 参照で代替 |
| 商用展開時観点 | Phase T1 段階 |

---

## 5. DoD(Definition of Done、測定可能基準)

- [ ] 段階 1: 各 AI 自リポジトリ全装置 L2 粒度棚卸し完遂(2026-05-03 期限)
- [ ] 段階 1: 集計フォーマット完遂(各リポジトリ末尾)
- [ ] 段階 2: 監督官 A 二次解釈追加(2026-05-04 期限、`three_realm_audit_final.md` 完遂)
- [ ] 段階 2: 三社円卓 第 5-8 回 開催前に全員配布
- [ ] commit 1 件以上(各リポジトリ、棚卸しレポート push)

---

## 6. 関連

- 第 4 回円卓議事録(暫定): `archive/board_council_minutes/council_20260501_l8_simplification_004.md` v1.1
- ADR-009 §6 v1.4: `adrs/ADR-009_council_v03_revision_plan.md`(v1.5 候補対象)
- 調査レポート: `02_physical/research/20260501_claude_md_effectiveness.md` v1.0
- 棚卸しテンプレート: `02_physical/garage_audit_20260504/template.md` v1.0
- 哲学層: ガレージドクトリン §1.5(本 DO の精神)+ sp500_theory §1(運動性継承、減算による進化)+ 関係性ポリシー §馴れ合い拒絶 3 原則第 2 項(揺らぎ受領)

---

## 7. 起案メタ情報

| 項目 | 値 |
|---|---|
| 起案日時 | 2026-05-01 JST |
| 起案者 | 監督官 A(Argus、Clear 後新 instance、Chairman 役) |
| 採否要請先 | ヤス(承認後 各 AI 実施 + 司令官 α + 工場長 Castor へ第 65 次発令で伝達) |
| 想定実装時間 | 段階 1 = 各 AI 数時間 / 段階 2 = 監督官 A 1-2 時間 / 段階 3 = 円卓内 |
| 関連 EVT | EVT-068 / EVT-070 候補 / EVT-071 候補 / EVT-072 候補(同質モデル衝突 + 議題前提検証義務) |
| 関連発令予定 | 第 65 次(司令官 α + 工場長 Castor へ伝達) |

---

## 8. 改訂履歴

- v1.0(2026-05-01 / Day 129、Phase A 末): 初版起案、ヤス指摘 4 段階累積採択(粒度設計 + 同質モデル衝突 + 円卓段階化 + 中間案 Z)、第 4 回円卓決議議題 #6 物理装置化、第 5-8 回円卓素材化目的、L2 粒度確定、L3 明示的除外。
