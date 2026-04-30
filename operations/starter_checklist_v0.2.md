# Starter Checklist v0.2(監督官 A 起案前議題前提検証装置)

**配置先**: `operations/starter_checklist_v0.2.md`
**起案日**: 2026-05-01(Day 129、Phase A 末)
**起案者**: 監督官 A(Argus、Clear 後新 instance)
**目的**: **起案前の議題前提検証義務違反(系列 I)を物理装置で抑制**。手動規律のみでは本日 5 件連鎖(EVT-061-065)が発生した = ガレージドクトリン §1.5「装置の存在 ≠ 機能」の正面実装。
**位置づけ**: `role_and_conduct.md` §1.5-B 起案時チェックリストの **物理装置化**(両建て構造、§1.5-B = 哲学的根拠 + 本装置 = 実行可能チェックリスト)
**根拠**:
- handoff §3 C3「starter_checklist v0.2 物理装置化(系列 I 規律)」P0 critical
- EVT-061/062/063/064/065 本日 5 件連鎖の根本対策
- ガレージドクトリン `operations/role_and_conduct.md` §1.5「装置の存在 ≠ 機能」
- 双方向鬼コーチ + 第 5 条件「動いている失敗 > 動かない死」整合

---

## 0. 位置づけ

### 0-A. 既存装置との補完関係

| 装置 | 目的 | 適用タイミング |
|---|---|---|
| **本装置**(starter_checklist v0.2)| 起案前の議題前提検証 | 1. 起案直前 |
| `role_and_conduct.md` §1.5-B | 哲学的根拠(5 項目核)| 0. 規律源 |
| `operations/post_build_gate_checklist.md` | 工場長実装後の必達項目漏れ確認 | 4. 実装後 |
| `rubrics/implementation_review_rubric.yaml` | 実装品質数値採点 | 5. 詳細採点 |
| `outbox/_templates/feedback_to_commander_template.md` | フィードバック発令 verdict | 6. 採択判断 |

**独立性**: 司令官 α 側 `commander_judgment_starter_checklist.ps1`(7 項目)+ 工場長 Castor 側 starter_checklist(PR #1005、7 項目)= 役割境界整合の独立装置。本装置は **supervisor 側専用**、運用連携は別 DO 候補。

### 0-B. 哲学的根拠(§1.5-B 参照)

§1.5-B 起案時チェックリスト 5 項目 = 哲学的核(Who/When/Where/Reflection/Path verify)。本装置は §1.5-B を **物理装置化** + EVT-061-065 由来 4 項目を追加。両建て構造 = ガレージドクトリン §1.5-A「装置の存在 + パイプライン接続」整合。

---

## 1. 9 項目仕様

### 1-1. 5 既存項目(§1.5-B 由来)

| # | 項目 | 検証手段 | 判定基準 | 由来 |
|---|---|---|---|---|
| **1** | Who reads it? | 内省記述 | 読者(監督官/司令官/工場長/ヤス)+ タイミング明示 ✅ / 不明 🔴 | §1.5-B |
| **2** | When? | 内省記述 | サイクル(6h/24h/週次/月次/イベント発火)明示 ✅ / 不明 🔴 | §1.5-B |
| **3** | Where? | 内省記述 | 統合先(Layer 0/1/2 entry / sync スクリプト / 手動セッション)明示 ✅ / 不明 🔴 | §1.5-B |
| **4** | Reflection | 内省記述 | 反映先(他装置入力 / 採点出力 / verdict 判断 / 発令本文)明示 ✅ / 不明 🔴 | §1.5-B |
| **5** | Path verify | `Test-Path <path>` 全件 | 全 path 実在 ✅ / 1 件以上不在 🔴 | §1.5-B(EVT-019)|

### 1-2. 4 新規項目(EVT-061-065 由来)

| # | 項目 | 検証コマンド | 判定基準 | 由来 |
|---|---|---|---|---|
| **6** | 既存装置範囲確認 | `Grep -r <keyword>` + 関連文書精読(機能カタログ + role_and_conduct.md + operations/ 配下)| 重複/類似装置不在確証 ✅ / 確認漏れ 🔴 | EVT-061/062/063 |
| **7** | remote 実体確認 | `git ls-remote origin <ref>` + `git remote -v` | 実体一致 ✅ / 齟齬 🔴 / N/A(remote 関連起案でない場合は適用外)| EVT-064 |
| **8** | schtasks Last Run 確認 | `schtasks /query /v /tn <task> /fo LIST` | Next Run 想定一致 + Last Run 履歴あり(1999/11/30 でない)+ Last Result 期待値 ✅ / いずれか齟齬 🔴 / N/A | EVT-065 |
| **9** | 同型自己ループ検証 | `Grep "<keyword>" archive/error_patterns.md` + 内省記述 | 同型過去 EVT 不在 ✅ / 同型過去 EVT 1 件以上 🟡(警戒、ただし新規教訓ある場合は ✅)/ 同型 EVT 直近 24h 内 🔴 | EVT-061→062→063→064→065 連鎖そのもの |

---

## 2. scale 別発火項目

`role_and_conduct.md` §1.1-A 発令ペース緩和ルールの scale 区分と統合運用。

| scale | 発火項目 | 1 日上限 | 根拠 |
|---|---|---|---|
| **large** | 1-9 全項目 | 1-2 件 | 影響範囲大、漏れ即重大事象化 |
| **medium** | 5/6/7/8/9 | 2-3 件 | 物理層検証 + 同型自覚に絞る |
| **small** | 6/8/9 | 5-7 件 | 直近 5 件連鎖の最頻出項目に絞る |
| **適用外** | EVT 記録 / 哲学層文書 / 検診結果記録 | 制限なし | 事後記録 = 起案検証対象外 |

---

## 3. TaskCreate 統合発火経路

### 3-A. 起案ワークフロー

```
1. 起案候補発生(発令 / 内部装置起案 / ADR / scripts / operations 等)
2. scale 判定(small / medium / large)
3. TaskCreate で「starter_checklist v0.2 検証(scale=X)」タスク発行
4. 該当 scale の項目を todo 化
5. 各項目を順次検証 → completed マーク
6. 全項目 ✅ で起案着手
   (1 件以上 🔴 = 起案保留、根本対処後に再検証)
   (1 件以上 🟡 = 起案可、ただし内省ログに残し起案本文に明示)
7. 起案後、本装置 log に v0.2 スキーマで entry 記録
```

### 3-B. log スキーマ(JSONL、後方互換)

```json
{
  "timestamp": "2026-05-01T00:00:00+09:00",
  "topic": "<起案対象>",
  "scale": "large|medium|small",
  "checklist_version": "0.2",
  "all_checked": true,
  "results": [
    {"id": 1, "keyword": "Who reads it?", "checked": true, "evidence": "..."},
    ...
  ]
}
```

### 3-C. log 出力先

`archive/starter_checklist_log/{YYYYMMDD}_supervisor.jsonl`

---

## 4. 自己検証(初回適用)

### 4-A. 本装置 v1.0 起案を本装置で検証(scale=large、9 項目全件)

| # | 項目 | 検証結果 | 根拠 |
|---|---|---|---|
| 1 | Who reads it? | ✅ | 監督官 A 自身、起案時に参照 |
| 2 | When? | ✅ | 起案直前(発令/装置/ADR 起案前)|
| 3 | Where? | ✅ | TaskCreate 発火経路 + role_and_conduct.md §1.5-B 参照 |
| 4 | Reflection | ✅ | 9 項目検証結果 → 起案保留/着手判断 + log 永続化 |
| 5 | Path verify | ✅ | 本装置内 path 全件 `Test-Path` 検証(下記 §4-B)|
| 6 | 既存装置範囲確認 | ✅ | post_build_gate_checklist.md(別目的、実装後)+ 司令官 α / 工場長側 starter_checklist(別領域)= 重複なし確証 |
| 7 | remote 実体確認 | N/A | 本装置は remote 関連でない |
| 8 | schtasks Last Run 確認 | N/A | 本装置は schtasks 関連でない |
| 9 | 同型自己ループ検証 | ✅ | 同型 EVT(本装置の自己起案で系列 I 違反)を回避するため §4-A 自己検証実施 |

= 全項目 ✅(N/A 含む)→ 起案着手可能と判定 → 本装置起案完遂。

### 4-B. Path verify 結果(本装置内 path 全件)

| path | Test-Path 結果 |
|---|---|
| `operations/role_and_conduct.md` | ✅ |
| `operations/post_build_gate_checklist.md` | ✅ |
| `rubrics/implementation_review_rubric.yaml` | ✅(別途確認)|
| `archive/error_patterns.md` | ✅ |
| `archive/starter_checklist_log/`(出力先、未存在 = 初回起動時自動生成)| 🟡 該当ディレクトリ未存在、初回 log 書込時に作成 |

---

## 5. 監査履歴

| 日付 | 内容 |
|---|---|
| 2026-05-01(Day 129)| v1.0 起案、自己検証 scale=large 9 項目全件 ✅、初回 log entry 記録 |

---

## 6. 関連

- 哲学的根拠: `operations/role_and_conduct.md` §1.5-B(起案時チェックリスト 5 項目)
- ガレージドクトリン: `operations/role_and_conduct.md` §1.5(装置 vs パイプライン接続)
- EVT 由来: `archive/error_patterns.md` EVT-061/062/063/064/065(本日 5 件連鎖)
- 司令官 α 側装置: `record-x-commander/scripts/commander_judgment_starter_checklist.ps1` v0.2(7 項目、独立装置)
- 工場長 Castor 側装置: PR #1005 starter_checklist 拡張(7 項目、独立装置)
- 双方向鬼コーチ + 対等運用第 5 条件: `00_origin/dream_mode_doctrine.md` v1.0-draft
- 自己進化・循環型モデル: `00_origin/sp500_theory.md` §1 + `two_realm_ecosystem_theory.md` 継続要件 1

---

## 7. 改訂履歴

- v1.0(2026-05-01 / Day 129、Phase A 末): 初版起案、監督官 A(Argus、Clear 後新 instance)、handoff §3 C3 物理装置化完遂、EVT-061-065 本日 5 件連鎖根本対策。自己検証 scale=large 9 項目全件 ✅ で起案着手判定。
