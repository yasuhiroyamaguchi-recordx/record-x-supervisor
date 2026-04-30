# three_realm_capability_catalog.md — 三者統合機能カタログ仕様 v0.1

**配置先**: `02_physical/three_realm_capability_catalog.md`
**起案日**: 2026-04-30(Day 132 夕方)
**起案者**: 監督官 instance A(`Argus`)
**版**: **v0.1-draft**
**根拠**:
- M2.1 段階 2 P2 マイルストーン(ADR-009 §6-A 三者統合自動化)
- 検診プロトコル v0.2 §7 機能カタログ整合性チェック + §8 コックピット連動
- EVT-038 三重盲点(既存 capability_catalog v0.1 = 監督官側のみ、三者統合不在)
- ヤス Q1 (2026-04-30 朝):「各官の搭載機能はカタログとして一覧化されているの?」= 三者統合カタログ不在確証への構造的応答

---

## 0. 設計目標

### 0-A. 三者統合 + 自動更新 + 即時判断装置

NTT 記事 §3 2 層ナレッジ基盤 + ヤス Q1-Q7 への正面応答:

| 観点 | 目標 |
|---|---|
| 三者統合 | 監督官 / 司令官 / 工場長 機能を 1 ファイルで俯瞰 |
| 自動更新 | 各官 post-commit hook で カタログ自動更新 |
| 即時判断 | コックピット連動(`generate-cockpit.ps1` 入力源)|
| 整合性検証 | カタログ ↔ 物理層実態の乖離検出(auto-evt R10 連動)|

### 0-B. 既存資源との関係

| 既存 | 本 v0.1 での位置づけ |
|---|---|
| `02_physical/capability_catalog.md` v0.1(監督官側 220 行)| **本 v0.1 の supervisor 部に統合移行**(段階 2 P2 中で実施)|
| `record-x-commander/` (capability_catalog 不在)| 本 v0.1 commander 部に新規 stub 配置依頼(第 57 次発令)|
| `factory/docs/decisions/ADR-008B-guard-capability-catalog.md`(部分的)| factory 部に統合参照 |

---

## 1. ファイル構造(v0.1 仕様)

### 1-A. 配置先

```
record-x-supervisor/02_physical/
├ three_realm_capability_catalog.md(本ファイル、ヘッダ + 索引)
└ capability_log.jsonl(機械可読、各官 post-commit hook 出力先)
```

### 1-B. Markdown ヘッダ + 索引構造

```markdown
# 三者統合機能カタログ v0.1

## 三者統合健全性メトリクス(自動更新)
- supervisor: active=N, paused=N, dormant=N
- commander:  active=N, paused=N, dormant=N
- factory:    active=N, paused=N, dormant=N

## §1. supervisor (Argus) — 監督官側機能
| FUNC ID | ファイル | 状態 | 直近稼働 | 起案者 |
|---|---|---|---|---|
| FUNC-S-NNN | path | active/paused/dormant | YYYY-MM-DD | A/A1/A2 |

## §2. commander (Beacon) — 司令官側機能
(司令官側 stub から自動同期)

## §3. factory (Castor) — 工場長側機能
(工場長側 stub から自動同期)
```

---

## 2. 自動更新機構(各官 post-commit hook)

### 2-A. 共通テンプレート(三者展開)

各官 git hooks/post-commit で以下を実施:

| Step | 動作 |
|---|---|
| 1 | git diff で機能ファイル変更検出(scripts/, sync_script/, tools/commands/, operations/, rubrics/)|
| 2 | 機能 ID + 状態を `capability_log.jsonl` に追記(JSONL、機械可読)|
| 3 | 監督官側 `three_realm_capability_catalog.md` に sync(sync-regional 経路)|
| 4 | カタログ ↔ 物理層乖離 = auto-evt R10(M2.5)で検出 + EVT 候補化 |

### 2-B. 各官独自実装

| 官 | hook 配置 | 担当 |
|---|---|---|
| supervisor | `record-x-supervisor/.git/hooks/post-commit` | 監督官 A 自己実装 |
| commander | `record-x-commander/.git/hooks/post-commit` | 司令官 α(Beacon)自己実装、第 57 次発令で依頼 |
| factory | `ProjectRX/.git/hooks/post-commit` | 工場長(Castor)、司令官 α 経由依頼 |

---

## 3. capability_log.jsonl(機械可読)

### 3-A. レコード形式

```json
{"timestamp":"2026-04-30T15:30:00+09:00","domain":"supervisor","func_id":"FUNC-S-018","operation":"add","file":"sync/sync_script/sync-schtasks-state.ps1","commit":"abc1234","author":"Argus","status":"active"}
```

### 3-B. operation 種別

- `add`: 新規機能追加
- `update`: 既存機能改訂
- `state_change`: active → paused / dormant 等
- `remove`: 機能削除(史実保護のため archive_log として残置)

---

## 4. コックピット連動(検診プロトコル v0.2 §8-A)

`generate-cockpit.ps1`(M2.2 完遂)の入力源拡張:

| 現行入力源 | 追加入力源(本 v0.1)|
|---|---|
| pipeline_state.json | three_realm_capability_catalog.md |
| error_patterns.md | capability_log.jsonl |
| board_council_decisions.md | (commander/factory の sync 後)|
| outbox/ | - |

= daily_cockpit_*.md に「機能カタログ整合性」セクション追加(M2.2 v0.2 改訂候補)

---

## 5. 段階的実装計画

| 段階 | 内容 | 期間 |
|---|---|---|
| **段階 1**(本 v0.1)| 仕様起案(本ファイル)+ 既存 capability_catalog v0.1 の supervisor 部移行設計 | Day 132 夕方完遂 |
| **段階 2**(Day 133-138)| 監督官 A 自己実装(supervisor post-commit hook + capability_log.jsonl 初期化)| Day 133-138 |
| **段階 3**(Day 138-145)| 第 57 次発令経由で司令官 α + 工場長 hook 配置依頼(M2.3 連動)| Day 138-145 |
| **段階 4**(Day 145+)| auto-evt R10(M2.5)+ コックピット v0.2 統合 + 完全自動更新稼働 | Day 145+ |

---

## 6. guardrails

| guardrail | 内容 |
|---|---|
| 史実保護 | `remove` operation は capability_log に「archive 移行」として記録、削除しない(sp500 §1 整合)|
| 三者対等 | 各官が自領域 hook を自由実装可、強制統一なし(naming_dual_track v0.2 §9 隠しネーム規律整合)|
| 機械可読性 | jsonl 形式、各レコード独立、cat / append で破壊耐性 |
| forbidden_paths | 各官 hook は自領域 commit のみ検出、他官領域へ書込なし |

---

## 7. 関連参照

- ADR-009 §6-A 三者統合自動化 + §6-G 検診プロトコル接続
- 検診プロトコル v0.2 §7 機能カタログ整合性 + §8 コックピット連動
- M2.2 generate-cockpit.ps1 v0.1(本 v0.1 の出力先)
- M2.4 sync-schtasks-state.ps1 v0.1(本 v0.1 の同型実装パターン)
- M2.5 auto-evt-recorder R10 拡張(本 v0.1 の整合性検証連動)
- 既存 `02_physical/capability_catalog.md` v0.1(本 v0.1 の supervisor 部移行元)

---

## 8. 改訂履歴

- **v0.1-draft**(2026-04-30 / Day 132 夕方): 初版起案、監督官 instance A(`Argus`)、M2.1 段階 2 P2 マイルストーン物理装置化 + ヤス Q1-Q7 への構造的応答 + capability_log.jsonl 機械可読仕様 + 三者展開段階的実装計画 4 段階。Day 145+ で完全自動更新稼働見込み。
