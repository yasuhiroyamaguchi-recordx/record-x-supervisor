# 三者統合棚卸しテンプレート v1.0(レベル 2 粒度、案 Z 中間案準拠)

**配置先**: `02_physical/garage_audit_20260504/template.md`
**起案日**: 2026-05-01(Day 129、Phase A 末)
**起案者**: 監督官 A(Argus、Clear 後新 instance)
**目的**: 三社円卓 第 5-8 回(2026-05-04~07)構造判断素材化のための共通棚卸しフォーマット
**粒度**: **レベル 2**(L1 在庫リスト + 構造判断用情報)、L3 哲学統合は本テンプレート明示的除外
**根拠**: ヤス指摘「粒度設計 = 棚卸しチケット品質 = 円卓決議品質連鎖」+ レストラン在庫レポート比喩(2026-05-01)
**出力先**: 各 AI 自リポジトリ → 監督官 A 統合(`02_physical/garage_audit_20260504/three_realm_audit_final.md`)

---

## 0. 使用方法

### 0-A. 各 AI 担当範囲(案 Z 中間案)

| AI | 担当リポジトリ | 配下スコープ |
|---|---|---|
| 監督官 A(Argus、Opus 4.7)| `record-x-supervisor` | operations/ + sync/ + 02_physical/ + adrs/ + archive/ + rubrics/ + 01_relationship/ + 00_origin/ |
| 司令官 α(Beacon、Opus 4.7)| `record-x-commander` | strategy/ + scripts/ + sync/ + outbox/_templates/ |
| 工場長(Castor、Sonnet 4.6、司令官 α 経由依頼)| `record-x/factory/` | tools/ + scripts/ + docs/decisions/ + .github/workflows/ |

### 0-B. 段階運用

| 段階 | 担当 | 期限 |
|---|---|---|
| 段階 1: 一次棚卸し(自己実施)| 各 AI | 2026-05-03 |
| 段階 2: 構造的レビュー(二次解釈)| 監督官 A 統合 | 2026-05-04 |
| 段階 3: 三社円卓検証 | 第 5-8 回円卓内 | 2026-05-04~07 |

---

## 1. 装置別出力フォーマット(必須項目 9 + 推奨 1)

各装置について以下を記述。1 装置あたり 5-10 分目安。

```
## 装置 N: <装置名>

| 項目 | 内容 |
|---|---|
| 1. ファイル path | <relative path> |
| 2. 種別 | operations / scripts / ADR / archive / rubrics / 哲学層 / etc. |
| 3. 装置目的 | <1-2 行> |
| 4. LOC | <number、行数> |
| 5. 接続状態 | ✅ active / 🟡 partial / ❌ dormant / 📚 reference |
| 6. 担当 AI | supervisor / commander / factory / 跨ぎ(複数 AI 影響)|
| 7. 直近使用実績 | 過去 7 日の commit/log 有無 + trigger 内容(なければ「なし」)|
| 8. 依存関係 | 前提装置(リスト) / 連携装置(リスト)|
| 9. single source 違反候補 | 同機能の別装置あり?(リポジトリ内 + 他リポジトリ)、有 → 該当装置名列挙 |
| 10. L8 該当候補 | 症状治療装置 / 監視装置の上の監視装置 / 既存統合より新規追加か? Yes/No + 理由 |
| 11. 改訂履歴 | 直近 30 日の主要改訂(箇条書き 3-5 件)|
| 12. 推奨アクション | 維持 / 統合候補(統合先明示) / 削除候補(理由) / 移管候補(移管先 AI) |
```

### 1-A. 推奨追加項目(時間余力ある時のみ、必須ではない)

```
| 13. 哲学層整合性メモ | 0-1 行(L3 領域の入口、深堀りは別チケット)|
```

---

## 2. リポジトリ別追加観点

### 2-A. supervisor 側(監督官 A 担当)

| 観点 | 内容 |
|---|---|
| starter_checklist v0.2 自己違反第 1 例(本日起案) | 統合化検討対象として明示 |
| post-commit hook ×3 提案(凍結中)| 凍結状態確認 |
| 第 4 回円卓関連装置 | 議事録 + ADR-009 §6 v1.4 改訂分の整合性 |

### 2-B. commander 側(司令官 α 自己実施)

| 観点 | 内容 |
|---|---|
| commander_judgment_starter_checklist v0.2(7 項目) | 工場長 PR #1005 同型運用整合確認 |
| DO-COMMANDER-029(本日昇格、実装結果) | 自己実装 log 確認 + DoD 達成状況 |
| capability_log_202604.jsonl 最終 entry(2026-04-29)以降の漏れ | 自己点検 |
| ADR-009 §6 改訂素材(本日起案、155 行)| 監督官 A 採用済確認 |

### 2-C. factory 側(工場長 Castor 自己実施、司令官 α 経由依頼)

| 観点 | 内容 |
|---|---|
| 既存 invoke-board-council メカニズム(ChatGPT/Gemini API 接続経路) | 三社円卓運用前提確認、稼働状態 + API キー有効性 |
| PR #1005 starter_checklist 工場長側装置 | 運用実績 + 7 項目運用ログ |
| dream-crystallize --domain factory | 既存稼働状態 |

---

## 3. 装置数集計フォーマット(各 AI 棚卸し末尾)

```
### 装置数集計

| 種別 | ✅ active | 🟡 partial | ❌ dormant | 📚 reference | 合計 |
|---|---|---|---|---|---|
| operations/ | N | N | N | N | N |
| scripts/ | N | N | N | N | N |
| ADR/ | N | N | N | N | N |
| ... | | | | | |
| **合計** | **N** | **N** | **N** | **N** | **N** |

接続率: (✅ + 🟡×0.5)/ 合計 = N%

### single source 違反候補数: N 件

### L8 該当候補数: N 件

### 推奨アクション集計

| アクション | 件数 |
|---|---|
| 維持 | N |
| 統合候補 | N |
| 削除候補 | N |
| 移管候補 | N |
```

---

## 4. 監督官 A 二次解釈フォーマット(段階 2)

監督官 A が三者統合時に追加する観点(本テンプレート §1 の上に layer する):

```
### 二次解釈 N: <装置名>

| 観点 | 監督官 A 評価 |
|---|---|
| L8 該当判定 | ✅ 該当 / 🟡 グレー / ❌ 非該当 + 理由 |
| 三者跨ぎ統合可能性 | 同機能装置の三者統合候補有無 + 統合先案 |
| 簡素化原則整合 | 維持 / 統合 / 削除のいずれが第 4 回円卓決議 §6-H 整合か |
| 第 5-8 回円卓提案 | 該当議題 + 採否提案 |
```

---

## 5. スコープ外(明示的除外)

| 除外項目 | 理由 + 別経路 |
|---|---|
| 哲学層整合性詳細評価 | L3 領域、別チケット候補(DO-AUDIT-002、後日)|
| EVT 連動詳細分析 | 既存 error_patterns.md 参照で代替 |
| 商用展開時の観点 | Phase T1 段階 |

---

## 6. DoD(Definition of Done)

| # | 基準 |
|---|---|
| 1 | 各 AI 自リポジトリ全装置を §1 フォーマットで記述 |
| 2 | §3 装置数集計完遂 |
| 3 | 出力ファイル配置(supervisor: `02_physical/garage_audit_20260504/supervisor_audit.md` / commander: `record-x-commander/strategy/proposals/20260504_commander_audit.md` / factory: 同等) |
| 4 | 期限 2026-05-03 まで |
| 5 | 監督官 A 統合(段階 2)= `02_physical/garage_audit_20260504/three_realm_audit_final.md` |
| 6 | 第 5 回円卓開催(2026-05-04)前に三社全員配布 |

---

## 7. 改訂履歴

- v1.0(2026-05-01 / Day 129、Phase A 末): 初版起案、ヤス指摘「粒度設計の重要性」採択、レベル 2 粒度確定、L3 明示的除外、案 Z 中間案準拠、第 5-8 回円卓素材化目的。
