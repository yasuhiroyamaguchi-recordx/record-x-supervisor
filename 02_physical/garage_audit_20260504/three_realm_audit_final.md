# 三者統合 Garage Doctrine 監査 v0.5(Skeleton、段階 2 受け皿)

**配置先**: `02_physical/garage_audit_20260504/three_realm_audit_final.md`
**起案日**: 2026-05-01(Day 129、Phase A 末、本セッション内 skeleton 起案)
**起案者**: 監督官 A(Argus、Clear 後新 instance、Chairman 役)
**位置づけ**: DO-AUDIT-001 段階 2 統合レポート受け皿、司令官 α + 工場長 Castor 棚卸し受領後に v1.0 統合完遂予定
**期限**: 2026-05-04(Phase B-α 起動 Day 132、第 5 回円卓開催前日)
**用途**: 三社円卓 第 5-8 回(2026-05-04~07)構造判断素材

---

## §0. ステータス

### 0-A. 段階別進行状況

| 段階 | 担当 | 状態 |
|---|---|---|
| 段階 1 supervisor 一次棚卸し | 監督官 A | ✅ 完遂(2026-05-01、`supervisor_audit_v0.5.md` 71 装置 L1 + 注目 10 装置 L2)|
| 段階 1 commander 一次棚卸し | 司令官 α | 🟡 自律進行待機(第 65/66 次発令到達後着手)|
| 段階 1 factory 一次棚卸し | 工場長 Castor(司令官 α 経由依頼)| 🟡 自律進行待機 |
| 段階 2 監督官 A 二次解釈統合 | 監督官 A | 🟡 段階 1 完遂後(skeleton 本起案で受け皿確保) |
| 段階 3 三社円卓 第 5-8 回検証 | 三者合議 | 🟡 段階 2 完遂後 |

### 0-B. 期限管理

| 日付 | マイルストーン |
|---|---|
| 2026-05-01(本日)| supervisor 一次棚卸し ✅ + skeleton 起案 ✅ |
| 2026-05-02-03 | commander/factory 一次棚卸し受領 |
| 2026-05-03 | 監督官 A 二次解釈統合 v1.0 完遂 |
| 2026-05-04 | 第 5 回円卓(supervisor 議題)開催 |
| 2026-05-05 | 第 6 回円卓(commander 議題)|
| 2026-05-06 | 第 7 回円卓(factory 議題)|
| 2026-05-07 | 第 8 回円卓(三者統合)|

---

## §1. supervisor リポジトリ棚卸し統合(段階 1 完遂分転載)

`record-x-supervisor/02_physical/garage_audit_20260504/supervisor_audit_v0.5.md` v0.5 から要点転載。

### 1-A. supervisor L1 装置数集計(71 装置)

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

接続率: **約 46%**(第 1 回監査 40% から +6pt 改善)

### 1-B. supervisor 注目 10 装置(L2 深掘り完遂)

詳細は `supervisor_audit_v0.5.md` §3 参照。要点のみ:

| # | 装置 | L8 該当 | 推奨 |
|---|---|---|---|
| 1 | starter_checklist_v0.2 | 🔴 | §1.5-B 統合化 |
| 2 | pipeline-bottleneck-probe v0.2 | 🔴 | 必要性再判定 |
| 3 | invoke-board-council.ps1 | - | 三社円卓前 稼働確認 |
| 4 | cockpit/ | 🔴 | archive 移動 |
| 5 | ADR-010 | - | superseded 維持 |
| 6 | three_realm_capability_catalog v0.1-draft | 🟡 | 第 5 回再判定 |
| 7 | capability_catalog v0.1 | - | 整合性確認 |
| 8 | role_and_conduct.md | 🟡 | 短縮検討(第 5 回円卓)|
| 9 | policy_v1.2 | - | v1.3 候補 |
| 10 | dream_crystallize_history | - | 自動稼働確証(EVT-073 訂正で達成済)|

### 1-C. supervisor 削除/統合/短縮候補

| 種別 | 件数 | 候補 |
|---|---|---|
| 削除候補 | 2 | cockpit/ + no_stasis_doctrine 史実保持選択肢 |
| 統合候補 | 3 | starter_checklist v0.2 → §1.5-B / capability_catalog 統合 / pipeline-bottleneck-probe → sync-schtasks-state 統合 |
| 短縮候補 | 2 | role_and_conduct.md 60-100 行核化 / CLAUDE.md 60-100 行核化 |

---

## §2. commander リポジトリ棚卸し統合(受領待機 = 受け皿のみ)

### 2-A. commander L1 装置数集計

```
[司令官 α 棚卸しレポート受領後、ここに転載]

配置先想定: record-x-commander/strategy/proposals/20260504_commander_audit.md

| 配下 | ✅ active | 🟡 partial | ❌ dormant | 📚 reference | 合計 |
|---|---|---|---|---|---|
| strategy/ | TBD | TBD | TBD | TBD | TBD |
| scripts/ | TBD | TBD | TBD | TBD | TBD |
| sync/ | TBD | TBD | TBD | TBD | TBD |
| outbox/_templates/ | TBD | TBD | TBD | TBD | TBD |
| **合計** | **TBD** | **TBD** | **TBD** | **TBD** | **TBD** |

接続率: TBD%
```

### 2-B. commander 注目装置(受領後深掘り)

```
[司令官 α 棚卸しレポート受領後、ここに転載]

主要観点(第 65 次発令 §2-E より):
- commander_judgment_starter_checklist v0.2(7 項目)= 工場長 PR #1005 同型運用整合
- DO-COMMANDER-029 実装結果 + DoD 達成状況
- capability_log_202604.jsonl 最終 entry(2026-04-29)以降の漏れ点検
- ADR-009 §6 改訂素材整合性
```

### 2-C. commander 削除/統合/短縮候補

```
[司令官 α 棚卸しレポート受領後、ここに転載]
```

---

## §3. factory リポジトリ棚卸し統合(受領待機 = 受け皿のみ)

### 3-A. factory L1 装置数集計

```
[工場長 Castor 棚卸しレポート受領後、司令官 α 経由提出 → ここに転載]

配置先想定: record-x/factory/docs/decisions/20260504_factory_audit.md(または同等)

| 配下 | ✅ active | 🟡 partial | ❌ dormant | 📚 reference | 合計 |
|---|---|---|---|---|---|
| tools/ | TBD | TBD | TBD | TBD | TBD |
| scripts/ | TBD | TBD | TBD | TBD | TBD |
| docs/decisions/ | TBD | TBD | TBD | TBD | TBD |
| .github/workflows/ | TBD | TBD | TBD | TBD | TBD |
| **合計** | **TBD** | **TBD** | **TBD** | **TBD** | **TBD** |

接続率: TBD%
```

### 3-B. factory 注目装置(受領後深掘り)

```
[工場長 Castor 棚卸しレポート受領後、ここに転載]

主要観点(第 65 次発令 §4-D より):
- 既存 invoke-board-council メカニズム = ChatGPT/Gemini API 接続経路 = 三社円卓運用前提
- ChatGPT API キー稼働状態
- Gemini API キー稼働状態
- PR #1005 starter_checklist 工場長側装置運用実績
- dream-crystallize --domain factory 既存稼働
- fast_gate.yml paths(PR #1013 BLOCKED 構造分析、案 A 採択 = paths 拡張要)
```

### 3-C. factory 削除/統合/短縮候補

```
[工場長 Castor 棚卸しレポート受領後、ここに転載]
```

---

## §4. 三者統合観点(監督官 A 二次解釈、段階 2)

### 4-A. 三者跨ぎ装置候補

```
[段階 1 全完遂後、監督官 A が以下観点で二次解釈追加]

| 跨ぎ候補 | supervisor 装置 | commander 装置 | factory 装置 | 統合可能性 |
|---|---|---|---|---|
| starter_checklist 系 | starter_checklist v0.2 | commander_judgment_starter_checklist v0.2 | PR #1005 starter_checklist | TBD(各 AI 独自装置 vs 統合)|
| capability catalog | capability_catalog.md + three_realm_capability_catalog v0.1-draft | capability_log_202604.jsonl | TBD | 議題 #8 連動 |
| dream-crystallize | dream-crystallize-supervisor v0.2 | dream-crystallize-commander(未起案)| dream-crystallize --domain factory | ADR-009 §6-A 統合方針 |
| post-commit hook(本セッション凍結中)| 未実装 | 未実装 | 未実装 | 議題 #8 連動 |
| 円卓召集メカニズム | invoke-board-council.ps1 | - | invoke-board-council 本体 | factory 主管 |
```

### 4-B. L8 該当判定(三者横断)

```
[段階 1 全完遂後、監督官 A が L8 該当装置を三者統合視点で判定]

候補:
- 装置追加偏向(各 AI 独自で starter_checklist を起案 = single source 違反候補)
- 監視装置の上の監視装置(probe → meta-meter 連鎖)
- superseded 装置残置(cockpit/ + ADR-010)
- 類似機能の三者分散(dream-crystallize, capability_log, etc.)
```

### 4-C. 簡素化原則整合(2026-05-01〜05-10)

```
[段階 1 全完遂後、各装置の維持/統合/削除判定を整合]

優先順位:
1. 削除候補 = 不可逆性低い順から実行(archive 移動推奨)
2. 統合候補 = 単一統合スクリプト方向(L8 整合)
3. 短縮候補 = LOC 50% 以内なら単独可、超過は三者合議
4. 新規追加候補 = 議題 #6 で必要性確証された場合のみ
```

### 4-D. 第 5-8 回円卓 議題提案統合

```
[段階 1 全完遂後、各円卓スコープ別の議題提案統合]

第 5 回(supervisor、Chairman = Argus): supervisor 議題 7 件(別ファイル council_5_supervisor_agenda_v1.0.md 参照)
第 6 回(commander、Chairman = Beacon): TBD(司令官 α 議題起案)
第 7 回(factory、Chairman = Castor): TBD(工場長 Castor 議題起案、司令官 α 経由)
第 8 回(統合、Chairman = Argus): TBD(三者跨ぎ統合議題、本 §4-A/B/C 由来)
```

---

## §5. 装置数集計サマリ(三者合計、受領後完遂)

```
[段階 1 全完遂後、ここに転載]

| AI | 装置数 | 接続率 | L8 該当 | 削除候補 | 統合候補 |
|---|---|---|---|---|---|
| supervisor | 71 | 46% | 5 | 2 | 3 |
| commander | TBD | TBD | TBD | TBD | TBD |
| factory | TBD | TBD | TBD | TBD | TBD |
| **三者合計** | **TBD** | **TBD** | **TBD** | **TBD** | **TBD** |
```

---

## §6. ステータス指標(三社円卓開催可否判断)

| 条件 | 状態 | 備考 |
|---|---|---|
| supervisor 棚卸し v0.5 | ✅ | 2026-05-01 完遂 |
| commander 棚卸し受領 | 🟡 | 自律進行待機 |
| factory 棚卸し受領 | 🟡 | 自律進行待機 |
| 監督官 A 二次解釈統合 | 🟡 | skeleton ✅、本格統合 = 段階 1 完遂後 |
| invoke-board-council.ps1 稼働確認 | 🟡 | 工場長 Castor 領域 |
| ChatGPT API キー稼働 | 🟡 | 工場長 Castor 確認待機 |
| Gemini API キー稼働 | 🟡 | 工場長 Castor 確認待機 |
| Phase B-α 起動条件 M2.6 | ✅ | EVT-073 訂正で達成済確証(本日 02:55/03:00 自動稼働実績)|

---

## §7. 改訂履歴

- v0.5 skeleton(2026-05-01 / Day 129、Phase A 末、本セッション内): 段階 2 受け皿起案、supervisor 棚卸し v0.5 統合 + commander/factory 受領待機 + 三者統合観点フォーマット確定。司令官 α + 工場長 Castor 棚卸し受領後 v1.0 統合完遂予定(2026-05-03 期限)。
