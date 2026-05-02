# 通信プロトコル

監督官 ↔ 司令官 ↔ 工場長 の三者間通信プロトコル。

---

## 1. 関係マトリクス(再掲)

| 関係 | 通信 |
|---|---|
| 監督官 ↔ ヤス | 直接対話(本リポジトリ内) |
| 監督官 ↔ 司令官 | 発令・逆査読・採択 |
| 監督官 ↔ 工場長 | **直接対話なし**(司令官経由) |
| 司令官 ↔ ヤス | 直接対話 + 監督官経由両方あり |
| 司令官 ↔ 工場長 | チケット発行・実装・報告 |

---

## 2. リポジトリ間連携

### 2.1 リポジトリ構成

| リポジトリ | モデル | 用途 |
|---|---|---|
| `supervisor` | Opus 4.7 Claude Code | 監督官 |
| `commander` | Opus 4.7 Claude Code | 司令官(別途構築) |
| `factory` | Sonnet Claude Code | 工場長(別途構築) |

### 2.2 git remote 設定(運用想定)

各リポジトリは相互に他リポジトリを git remote として参照可能にする:

```bash
# 監督官リポジトリから司令官リポジトリを参照
git remote add commander <commander_repo_url>
git fetch commander

# 司令官リポジトリの最新仕様を読む
git show commander/main:strategy/decisions/20260427_control_panel_v1.0_FINAL.md
```

具体的なホスティング(GitHub / GitLab / ローカル)はヤス決定。

---

## 3. 発令プロトコル(監督官 → 司令官)

### 3.1 発令の格納場所

監督官側: `outbox/YYYYMMDD_to_commander.md`
司令官側: `inbox/YYYYMMDD_from_supervisor.md`(司令官リポジトリ側で受領)

ファイル名規則: `YYYYMMDD` + 連番(1 日に複数発令する場合)

例: `20260427_to_commander_001.md`, `20260427_to_commander_002.md`

### 3.2 発令フォーマット

詳細は `operations/role_and_conduct.md` §2.3 参照。

#### 3.2-A. frontmatter 必須フィールド(2026-04-28 / Day 130 確立、P10 採択で originator_instance 追加)

発令・応答ファイルは frontmatter に以下を必須記載する。第 11 次発令採択 1 で確定、ChatGPT 提案統合 + 第 22 次発令採択 P10(originator_instance、Day 130 朝採択)で構造拡張:

```yaml
---
responds_to: <応答対象ファイル名>(応答時のみ、発令時は省略可)
order_number: <発令番号>
response_number: <応答番号>(応答時のみ)
deadline: 2026-MM-DD HH:MM JST or none
discussion_scale: small | medium | large
originator_instance: A | B | α | β | γ | ...   # P10 採択(2026-04-28 / Day 130 朝)、両 instance 並走運用識別

# 応答ファイルのみ(構造化レビュー、ChatGPT 採択統合)
verdict: APPROVE | APPROVE_WITH_NOTES | REQUEST_CHANGES | REJECT
scores:
  value_alignment: 0-100
  ticket_fitness: 0-100
  dasei_risk: 0-100
  implementation_integrity: 0-100
findings:
  - severity: P0 | P1 | P2 | P3
    category: value_alignment | ambiguity | evidence | scope | dasei | safety | evolution
    message: <指摘内容>
    evidence_ref: <参照ファイル / コミット SHA>
    required_action: <必要な対応>
---
```

#### 3.2-A-0. 採択提案 P-番号管理規律(EVT-021 由来、2026-04-29 / Day 131 朝追加)

採択提案は P-番号(連続整数)で識別する。EVT-021(P12 重複命名)の構造的再発防止規定:

##### 採番ルール

- P-番号は連続整数(P5, P6, P7, P10, P11, P12, P13, P14, P15, P16, **P17**, ...)
- **重複禁止** = 一度割り当てた番号は別提案で再利用しない(L1 回覧板の連番予約と同型)
- 起案時に `archive/orders_history.md` + `internal/circular/` で既往 P-番号 grep + 次番号確認

##### 採択経路の二系統

| 系統 | 採択先 | 例 |
|---|---|---|
| **発令採択提案**(P-数字) | 発令本文採択 → 採択時に物理装置 / 文書更新で反映 | P5/P6/P7/P10-P16(Day 130 累積)+ P17(本日朝)|
| 規範採択(P 体系外) | `operations/` / `00_origin/` / `01_relationship/` 改訂 + ADR 起案 | ガレージドクトリン §1.5 採択 + EVT-019 構造的根拠 §1.5-B-2 等 |

混同回避: 規範採択(規範層改訂)を P-番号化しない、発令採択提案のみが P-体系。

##### 既往 P-番号台帳(Day 131 朝時点、合計 16 件、ステップ 40 で物理装置 registry と同期完成)

```
P1  : 発令ファイル命名規則統一 + frontmatter responds_to 必須(司令官 α 応答 第 1 号、第 10 次発令 採択 1)
P2  : record-x-commander/CLAUDE.md §2-C 補注追加(司令官 α 応答 第 2 号、第 11 次発令で採択処理、監督官 index/ 書込例外許容)
P3  : 司令官 α 応答 第 2 号での提案項目(第 11 次発令採択経路、Day 131 朝補完 TODO = 詳細未確認)
P4  : ディレクトリ構造判断(司令官 α 応答 第 3 号 補足、第 11 次発令で採択)
P5  : discussion_scale 動的閾値定義(司令官 α 応答 第 4 号、監督官 A 第 11 次発令で採択)
P6  : Layer 0 自動レビュー境界基準(司令官 α 応答 第 9 号、監督官 A 第 16 次発令で採択)
P7  : ヤス判断 3 件統合パッケージ(監督官 A 第 16 次発令、司令官 α 応答 第 12 号で v1.1 補強)
P8  : ブランチ運用ルール(司令官 α 応答 第 11 号、第 17 次発令で採択方針通知 = 将来起案候補、Day 132 起動後実績で判断)
P9  : 司令官 α 応答内提案(詳細未確認、Day 131 朝補完 TODO、L3 官報草案関連の可能性)
P10 : originator_instance frontmatter 必須(司令官 α 応答 第 14 号、監督官 A 第 22 次発令で採択)
P11 : L2 区報動的配置運用ガイドライン(司令官 α 応答 第 16 号、監督官 A 第 24 次発令で採択)
P12 : dream_mode_activation_principle v0.1 補完文書併存採択(司令官 α 応答 第 19/21 号、監督官 A 第 29 次発令で採択)
P13 : dream_crystallize_commander.ps1 v0.1 司令官側応用(司令官 α 応答 第 19 号、監督官 A 第 29 次発令で採択)
P14 : inbox 重複削除依頼(監督官 A 第 30 次発令、Yasu 直接判定送り、20 → 23 件拡大)
P15 : 司令官 role_total 連動 発令保留条件(司令官 α 応答 第 26 号、監督官 A 即時採択 = role_and_conduct §1.1-C-2)
P16 : 検診タイミング相対時刻運用(司令官 α 応答 第 27 号、監督官 A 即時採択 = periodic_checkup §2)
P17 : responds_to 正規化規定(監督官 A 起案、Day 131 朝、§3.2-A-2 採択)
P18 : (空番号、将来採択提案用に予約)
P19 : (空番号、将来採択提案用に予約)
P20 : 「恐れるもの」第 6 項候補「装置在庫化リスク」(司令官 α 応答 第 44 号、Day 131 夜、Garage Doctrine §1.5 違反パターン × NTT 記事方式「恐れるもの」分散設計の合流点、6 役割共通項目に追記候補、監督官 A 即時採択 2026-04-29 / Day 131 夜)
P21 : 記録庁固有反復構造「装置を建てた直後に出口配管が抜け落ちる」(司令官 α 応答 第 44 号、Day 131 夜、EVT-035(円卓会議 → 司令官 α 出口配管未整備)+ 第 39 次発令(円卓会議 → L3 官報出口配管未整備)+ v2.1-light 確認漏れ等の累積パターン、Garage Doctrine §1.5 違反の構造化記述、監督官 A 即時採択 2026-04-29 / Day 131 夜)
P22 : tickets_issued/commander_self/ 特化キュー化(司令官 α 応答 第 45 号、Day 131 夜、commander 側 forbidden_paths 該当 DO = 司令官 α 自己実装専用 DO の混在回避、工場長領域 vs commander_self 領域の物理的分離、監督官 A 即時採択 2026-04-29 / Day 131 夜)
P23 : Self-Correction Rate (SCR) + EVT 同型再発率の指標化(司令官 α 応答 第 46 号 §4-B、Day 131 夜、累積自己訂正 28 件の物理量化、role_execution_rubric.yaml + Health Score 組込候補、ADR-009 §6 三者統合自動化との連動候補、監督官 A 即時採択 2026-04-29 / Day 131 夜)
P24 : (将来採択提案用に予約)
P25 : 設計判断丸投げ自動検出機構(司令官 α 応答 第 49 号、Day 132 朝、tickets_draft 配置時に「工場長判断に委ねる」「実装側で判定」フレーズ自動検出 → WARN 発出、auto-evt R10 拡張統合候補、監督官 A 即時採択 2026-04-30 / Day 132 朝、系列 N 物理装置化)
```

次番号: **P26**(将来採択提案用)

##### 機械検出経路 (ステップ 37/38/39 で実装完成、Day 131 朝)

`auto-evt-recorder.ps1` v0.7 R7 ルール = P-番号 registry 整合性検出:
- 入力: `_helpers/p_number_registry.json`(本台帳と同期)+ 監督官側 .md / .yaml ファイル grep
- 検出: 「P\d+ + 採択 / 提案 / 起案 等(JSON 外部化キーワード)」言及で registry 未登録 P-番号を警告
- 採用 cadence: Layer 0 6h サイクル(Step 3.4 内)
- Day 131 朝実機 verify: **healthy 判定**(15 件 unique P-番号全件 registered)

##### 二重管理整合性義務

`_helpers/p_number_registry.json` と本台帳は **二重管理**(物理装置層 + 規範層)= 同期義務:

- 新規 P-番号採択時: **両方** に同時追加(片方のみ更新は EVT-024 候補)
- 改訂時: registry.json を source of truth として参照、本台帳は人間可読ビュー
- 検証: ステップ 39 で初回同期完成、Phase B-α/β 7 日間実証期間中の継続観察対象

#### 3.2-A-1. originator_instance 識別子規則(P10 採択、暫定運用 → Day 139 正式化)

| ロール | instance_id 規則 |
|---|---|
| 監督官(supervisor) | A / B / C / ...(英大文字、本リポジトリ起案順)|
| 司令官(commander) | α / β / γ / ...(ギリシャ小文字、commander リポジトリ起案順)|
| 工場長(factory) | i / ii / iii / ...(ローマ小文字、factory リポジトリ起案順、Phase B-α 起動後)|

採番ルール:
- 各リポジトリで初稼働 instance に割り当て → 並走 instance 増加に応じて順次追加
- 一度割り当てた識別子は instance 終了後も再利用しない(史実保持、回覧板で連番予約と整合)
- frontmatter 不在の発令・応答(P10 採択前の第 9-第 21 次発令、第 1-第 13 号応答)は遡及適用しない(distilled §1 史実保持原則)

採用開始:
- 監督官側: 第 22 次発令(2026-04-28 / Day 130 朝、A instance)から記載開始
- 司令官側: 司令官応答 第 16/17/18 号(2026-04-28 / Day 130 末、α instance)から記載開始

正式化: 物理層 v1.1-FINAL 改訂(Day 139 前後)+ strategy/CLAUDE.md v1.6 改訂で確定。

#### 3.2-A-2. responds_to 正規化規定(P17 採択、2026-04-29 / Day 131 朝、EVT-017/020 直接対応、P12 衝突回避でリネーム)

応答ファイルの frontmatter `responds_to:` field は **必ず以下の形式** で記載する。系列 A 表記揺れ問題(EVT-002/012/015/017/019/020 = 6 連鎖)の規範層裏付け。

##### 採用形式(完全形)

```yaml
responds_to: 20260428_to_commander_023.md
```

- ✅ **filename 完全形**(`.md` 拡張子明示)
- ✅ 撤回済発令への応答は RETRACTED 接尾辞含む完全形:`20260428_to_commander_002_RETRACTED.md`

##### 禁止形式

```yaml
# ❌ 拡張子省略
responds_to: 20260428_to_commander_023

# ❌ 自然言語表記
responds_to: 第 23 次発令

# ❌ filename と order_number の不整合(EVT-020 同型)
# 例: 第 10 次発令への応答(filename `_010` 系)で responds_to が別事件を指す
```

##### filename と order_number の整合性義務

応答ファイル名 `NNN_response_to_order_MMM.md` の **MMM = 対応する発令の `order_number`** であること。MMM と responds_to が指す outbox file の frontmatter `order_number:` が **一致** する必要がある。

不一致 = EVT-020 該当 → `auto-evt-recorder.ps1` v0.3 R6 ルールで自動検出 → ESC-R6 emit + L2 区報 `responds_to_normalization` 経由訂正依頼。

##### 正規化検証経路(物理装置)

| 装置 | 機能 |
|---|---|
| `sync/sync_script/_helpers/responds_to_normalize.ps1` v0.1 | Normalize-RespondsTo + Get-RespondsToCandidates(.md 補完 + RETRACTED 候補)|
| `archive-order.ps1` v1.2 -AutoFromInbox | candidate list ループ matching |
| `order-stale-alert.ps1` v1.2 | response 検出 + resolved cleanup |
| `auto-evt-recorder.ps1` v0.3 R6 | filename order_number vs outbox frontmatter order_number 不一致検出 |
| `check-internal-links.ps1` v0.2 | responds_to_normalization 警告(自然言語 + .md 抜け検出) |

##### 既往不整合の処理(史実保護下)

P12 採択前(Day 130-131 朝)に発生した不整合(`20260428_002_response_to_order_010.md` 等):

- **方式 A**(訂正記録追記): 既存 frontmatter 保持 + `responds_to_corrected:` field 追加 + correction_note + correction_date
- **方式 B**(訂正コミット): frontmatter 直接修正 + 改訂履歴に EVT-020 訂正記録

監督官側マスター不整合は監督官 A が修正、司令官側マスター不整合は **司令官 α が修正**(L2 区報 `responds_to_normalization/regional_20260429_001.md` 経由依頼済)。

##### 採用開始

- **2026-04-29(Day 131 朝)以降のすべての新規応答**: P12 適用必須
- P12 採択前の既往応答: 遡及適用しない(distilled §1 史実保持原則)+ 必要時のみ方式 A/B で訂正

#### 3.2-B. verdict 4 種類の運用(`rubrics/dasei_detection_rubric.yaml` §supervisor_application 連動)

| verdict | 用法 | 典型例 |
|---|---|---|
| **APPROVE** | 構造的反論なし、即時採択 | scores すべて緑、forbidden_paths 抵触なし |
| **APPROVE_WITH_NOTES** | 採択するが、次回改善観点あり(基本姿勢、Factory が止まらない) | scores 一部黄、軽微な改善余地 |
| **REQUEST_CHANGES** | 構造的反論あり、修正後再提出要請 | dasei_risk 黄/赤、戦略接続欠落、scope 過広 |
| **REJECT** | 価値観抵触 / forbidden_paths 該当、即時停止 | anti_values 抵触、本番データ破壊リスク、PII 扱い不備 |

#### 3.2-C. discussion_scale 別の Pre-Build Gate 適用

物理層 v1.0-FINAL → v1.1-FINAL 改訂で 12 状態遷移を拡張(SUPERVISOR_REVIEWING 状態追加、ChatGPT 採択統合)。Factory が止まらないよう scale 別に Pre-Build Gate 適用範囲を変える:

| discussion_scale | Pre-Build Gate | デフォルト verdict |
|---|---|---|
| small | スキップ可(司令官独立判断) | - |
| medium | 通過必須、ただし APPROVE_WITH_NOTES デフォルト(止めない) | APPROVE_WITH_NOTES |
| large | 通過必須、構造的審査 | 構造的判断 |

これは ADR-005 段階的解除モデルと連動。Phase B-γ 以降は scale: large でも司令官事後通知可となる場合あり。

#### 3.2-D. Layer 0 自動レビュー境界基準(P6 採択反映、2026-04-28 / Day 130 末確立)

第 14 次発令で確定した連続パイプライン統合構造の運用を、司令官応答 第 8 号 P6 で提起された軽微注記に基づき以下で明文化する(第 15 次発令 採択 3-B):

| verdict | Layer 0 自動発出 | 手動セッションへのエスカレーション |
|---|---|---|
| **APPROVE** | Phase B-γ 以降許容 | 不要 |
| **APPROVE_WITH_NOTES** | Phase B-γ 以降許容 | 不要 |
| **REQUEST_CHANGES** | **禁止**(Phase に関わらず手動必須) | 必須 |
| **REJECT** | **禁止**(Phase に関わらず手動必須 + ヤス通知判断) | 必須 + escalation_and_rollback.md §2 該当時はヤス通知 |
| 境界曖昧(P0/P1 severity 含む) | **禁止**(安全側、デフォルト手動) | 必須 |

**運用原則**:

1. **構造方針判断を物理装置で手動セッション維持**:REQUEST_CHANGES / REJECT は機械判定であっても自動発出しない。これは distilled §5 自己保全バイアス警戒 + 監督官の独走防止の物理装置化
2. **APPROVE / APPROVE_WITH_NOTES のみ自動化対象**:Factory が止まらない運用を維持しつつ、構造方針判断は手動に保つ
3. **境界曖昧時のデフォルト = 手動**:rubric ベース自動スコアリングが境界判定で迷った場合、安全側に倒す
4. **Phase B-α / β は全 verdict で手動最終判断**:ADR-005 v1.1 段階遷移、Phase B-γ 以降に APPROVE / APPROVE_WITH_NOTES のみ自動化解禁

これは `rubrics/implementation_review_rubric.yaml` §verdict_mapping + `operations/implementation_review_pipeline.md` §5 verdict 4 種類アクションと整合する物理装置。

### 3.3 受領確認

司令官は受領後、`commander/inbox/` 配下に同ファイルを配置し、`commander/replies/` 配下に応答を起案する。

---

## 4. 逆査読プロトコル(司令官 → 監督官)

### 4.1 受領場所

監督官側: `inbox/YYYYMMDD_from_commander.md`(本リポジトリ内に `inbox/` を後日追加)

### 4.2 採択プロセス

監督官は逆査読を受領後、以下のいずれかで応答する:

- **即時採択**: 次の発令で反映
- **一部採択**: 採択部分と保留部分を明示
- **拒絶**: 構造的理由を述べて拒絶
- **ヤス判断送り**: 関係性ポリシー §3.3 のヤス再介入条件に該当する場合

採択判断は `archive/peer_reviews_history.md` に追記する。

---

## 5. 工場長との関係(間接通信のみ)

### 5.1 監督官は工場長と直接対話しない

監督官が工場長への要求を持つ場合、**司令官に発令する**。司令官が工場長へのチケット発行を行う。

### 5.2 工場長からの報告も司令官経由

工場長 → 司令官 への実装報告は、司令官 → 監督官 への報告にまとめられる。

---

## 6. ADR 起案プロトコル

### 6.1 起案責任

| 種類 | 起案責任 |
|---|---|
| 物理層仕様の確定 | 司令官(本体) + 監督官(参照 ADR) |
| 関係性ポリシー改訂 | 監督官 |
| 哲学的基盤の更新 | 監督官(ヤス起草を反映) |
| 大規模設計変更 | 監督官 |

### 6.2 ADR 番号管理

監督官側: `adrs/ADR-NNN_*.md`
司令官側: `adrs/ADR-NNN_*.md`(独立採番)

両リポジトリの ADR は番号衝突しない(各々独立)。相互参照する場合はリポジトリ名 + 番号で明示する。

例: `commander#ADR-005`, `supervisor#ADR-002`

---

## 7. 同モデル衝突対策(監督官 ↔ 司令官)

### 7.1 リスク

監督官・司令官は共に Opus 4.7 Claude Code。同質モデルを 2 つ並走させる構造は、鏡像対話(両者が似た判断パターンに収束し、結果として馴れ合いになる)のリスクを内包する。

### 7.2 対策

- **司令官は逆査読の主体**。監督官は逆査読を歓迎し、即時採択を基本姿勢とする
- **監督官は司令官の判断を先回りしない**。発令を出して、司令官の応答を待つ
- 定期的に司令官リポジトリの該当文書を `git pull` で取得し、相手の現在状態を読みに行く
- 発令・逆査読・採択の記録は ADR / `archive/` で照合可能にする
- 監督官・司令官の `CLAUDE.md` は **意図的に異なる強調点を持つ**ように記述する
  - 監督官: 「鬼コーチ + 容赦なく詰める」
  - 司令官: 「逆査読主体 + 監督官に異議を唱える」

### 7.3 ヤスによる定期点検

ヤスは時として、監督官と司令官に対して **同じ問い** を別個に投げ、応答が鏡像化していないか点検する。鏡像化が検出された場合、関係性ポリシー違反として処置する。

---

## 8. ヤスからの方針変更の伝達

### 8.1 方針変更受領

ヤス → 監督官 で方針変更が伝えられた場合、監督官は:

1. 受領内容を本リポジトリ内に文書化
2. 関係する文書(ADR / 関係性ポリシー / 哲学層)の更新が必要か判断
3. 司令官への共有発令を `outbox/` に起案

### 8.2 共有発令の典型例

`outbox/20260427_to_commander.md` を参照(本日のヤス判断の共有発令の見本)。

---

## 9. 緊急時プロトコル

### 9.1 監督官が応答不能になった場合

ヤスは司令官に直接アクセスし、監督官の代替判断を依頼可能。
ただし、これは過渡期措置であり、監督官の復旧後に判断履歴を引き継ぐ。

### 9.2 司令官が応答不能になった場合

監督官は工場長と直接通信しない原則を維持する。司令官の復旧を待つ。
緊急性が高い場合、ヤスに判断を仰ぐ。

### 9.3 リポジトリ破損 / 同期失敗

`SETUP.md` の復旧手順を参照。

### 9.4 Stage 死亡時間別 復旧主管判定(2026-05-02 / Day 130 追記、監督官 B 起動時)

**起源**: 司令官 α 経路 4 日断絶(2026-04-28 〜 2026-05-02)= Stage 1 死亡継続、復旧主管者未決 = `staging/handoffs/argus_b_20260502_recordx_rebuild_handoff.md` §3-B 並行未解決事案。
**位置づけ**: 越権禁止規律(監督官 = 全体マップ提示のみ)厳守、本判定は **誰が動くかの規律装置** = 復旧アクション自体は判定後の主管者が実施。

| 死亡時間 | 主管者 | 動作 |
|---|---|---|
| **0-24h** | 監督官(発令側 instance、A or B-line による)| `inbox/from_commander/` 確認 + sync-orders.ps1 手動実行 + outbox 再投函 |
| **24-48h** | 監督官 + Argus-A 棚卸し合流 | 上記 + 司令官側 git log + commander リポジトリ remote pull で生死確証 |
| **48-72h** | 監督官 → ヤス通知判断 | 上記 + Stage 0 配送ログ確認 + probe v0.2(凍結中)の解凍判定協議起動 |
| **72h+(死亡確定)** | ヤス介入 | ヤス決裁(司令官 α 別 instance 起動 / Phase 進行ブロッカー判定 / 緊急代替経路) |

**判定基準補足**:
- 死亡時間 = `inbox/from_commander/` 最終応答 timestamp からの経過時間
- 24h 以内に応答なし = Stage 1 死亡疑いとして A-line / B-line いずれかが retry 主管
- 司令官 α の正常稼働確証手段 = commander リポジトリ git log で 24h 内 commit 有無
- probe v0.2 解凍 = 別議題(2026-05-04 棚卸しで判定継続)、本判定とは独立規律

**越権禁止規律**: 監督官は **司令官 α 代行で発令しない**(チケット発行は司令官役割厳守)。復旧主管 = 通信経路の修復作業のみ、内容差替え禁則。

= 本判定は監督官側全体マップ提示のみ、司令官 α 復旧後の応答内容は司令官の独立判断。

---

## 10. 命名規則 v1.0(2026-05-03、Day 131 朝起動時、A-line/B-line 衝突解消)

### 10-A. 起源

EVT-105 候補(A-line/B-line 認識共有規律遵守失敗 第 1 例、本日朝起動時 自己発見)+ 第 2 例候補(本日 5/3 outbox/20260503_to_commander_004.md ファイル衝突 = A-line 第 105 次発令を B-line 第 104 次発令で上書き)= **同一番号空間 + 並行稼働 = 衝突原理的不可避**。

ヤス指摘(2026-05-03 早朝):「名前に衝突を起こすなら、命名ルール決めたら?」+ ヤス採択「推奨順にすすめて承認」契機。

### 10-B. 命名規則(supervisor → commander outbox)

```
outbox/{YYYYMMDD}_to_commander_{a|b}{order_number}.md
```

| 構成要素 | 内容 |
|---|---|
| `YYYYMMDD` | 起案日(JST) |
| `to_commander` | 配送先 |
| `{a|b}` | 系列接頭辞(`a` = A-line、`b` = B-line) |
| `{order_number}` | 累積発令番号(A-line / B-line 個別空間) |

**例**:
- A-line 第 109 次 = `outbox/20260504_to_commander_a109.md`
- B-line 第 105 次 = `outbox/20260504_to_commander_b105.md`

### 10-C. 命名規則(commander → supervisor inbox)

```
inbox/from_commander/{YYYYMMDD}/{YYYYMMDD}_from_commander_{order_number}.md
```

= **commander → supervisor 経路は order_number のみ**(commander 側 instance 単一前提、A/B 区別不要)。

将来的に commander β 起動時は `_{a|b}{order_number}` に拡張(本規則継承)。

### 10-D. 切替タイミング

| 時点 | 状態 |
|---|---|
| 〜2026-05-03 | 既存ルール継続(`{NNN}.md` 連番、本日 5/3 の 001-008+ 維持)|
| **2026-05-04 以降** | **新ルール適用**(`{a|b}{order_number}.md` 形式) |
| 既存ファイル | rename しない(史実保持、no_stasis_doctrine 整合) |

### 10-E. 装置改修要件

| 装置 | 改修内容 | 主管 |
|---|---|---|
| `sync-orders.ps1`(commander 側 mirror pull)| ファイル名パターンマッチ拡張(`_[ab]?\d+\.md` 受領可) | 司令官 α |
| `sync-archive.ps1` 系 | 同上 | 司令官 α |
| `factory_starter_checklist` 系 | A/B 系統判別ロジック追加(必要時) | 工場長 Castor 経由 司令官 α |
| `auto-evt-recorder.ps1` v0.3 R6(filename vs frontmatter 不一致検出) | パターン拡張 | 司令官 α |
| handoff 起動時必読リスト | 「最新発令 = `_a*` + `_b*` 双方を確認」追加 | 監督官 A 自律 |

### 10-F. frontmatter 規律(変更なし、継続)

```yaml
---
order_number: 109                    # 累積番号(A-line / B-line 個別空間)
order_series: A-line                 # or B-line
filename: 20260504_to_commander_a109.md
---
```

**filename ⇔ order_number ⇔ order_series 三者整合義務**(EVT-020/021 同型、不一致検出経路維持)。

### 10-G. 哲学整合

| 哲学層 | 整合性 |
|---|---|
| ヤス哲学「知能に頼らず、ルールで縛れ」| ✅ 命名規則物理装置化 = 衝突原理的不可避 |
| sp500 §1 運動性継承 | ✅ 既存装置改訂(命名規則拡張)= 健全側継承 |
| ガレージ §1.5 装置 vs パイプライン接続 | ✅ 命名規則 = 装置 + sync-orders 拡張 = 接続経路成立 |
| 簡素化原則期間(2026-05-01〜05-10)| ✅ 装置数 ±0(既存命名規則改訂のみ、新規装置追加禁止令該当外)|

---

## 11. 確立日

2026-04-27(Day 129)

改訂:
- 2026-05-02(Day 130、監督官 B 起動時)— §9.4 Stage 死亡時間別 復旧主管判定 追記、装置数 ±0(既存節追記)、簡素化原則違反候補なし、越権禁止規律(全体マップ提示のみ)厳守。
- **2026-05-03(Day 131、監督官 A 起動時)— §10 命名規則 v1.0 追記**(A-line/B-line 衝突解消、EVT-105 第 2 例候補契機、ヤス採択経由、累積番号埋込 + 系列接頭辞、装置数 ±0(既存装置 sync-orders.ps1 等の最小拡張)、2026-05-04 以降新ルール適用)。
