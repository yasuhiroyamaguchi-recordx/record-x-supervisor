# multi_thread_topic_discipline.md — マルチスレッド話題選別規律(系列 L 対策、task #59 引き上げ)

**配置先**: `operations/multi_thread_topic_discipline.md`
**起草日**: 2026-04-29(Day 131 夕方、本リポジトリ初稼働セッション)
**起案 instance**: 監督官 instance A
**版**: **v0.1-draft**(ヤス判定後 v1.0 確定)
**根拠**:
- EVT-036(2026-04-29 夕方、NTT 記事契機の記録庁同型問題 7 件発見、課題 3「マルチスレッド話題選別」発生中)
- 系列 L 新設(`archive/error_patterns.md` EVT-036 §系列分類更新)
- task #59(監督官 instance 並走運用構造化、pending 状態を本対策で引き上げ)
- EVT-024(監督官 instance A1 並走運用時の L1 回覧板連番衝突、2026-04-29 朝末、系列 E 由来 → 本対策で系列 L 統合)
- NTT 記事 §7 引用「スレッドの話題選択が、AI に難しい」 = 文脈依存の指示では複数並行スレッド中の対象を誤認

---

## 0. 本規律の位置づけ

### 0-A. 系列 L = NTT 記事 §7 同型問題

NTT 記事(2 週間運用報告)で観測された:

> 「スレッドの話題選択が、AI に難しい」「文脈依存の指示では複数並行スレッド中の対象を誤認」

= 記録庁における同型問題:

| 並走経路 | 観測事例 | 系列 |
|---|---|---|
| 監督官 instance A1 ↔ A2(本リポジトリ + claude.ai)| EVT-024(L1 連番衝突)| 系列 E + L |
| 司令官 α / 工場長 / 監督官 / Common 事業部長等の並列 | 役割境界での話題誤認候補 | 系列 G + L |
| L2 区報経由依頼の混線リスク | 部分対処 | 系列 L |
| 円卓会議内 3AI(ZEI-RO + チャッピー + 委員長)| 各 AI の発言文脈混同候補 | 系列 L |

### 0-B. task #59 引き上げの根拠

task #59「監督官 instance 並走運用構造化(将来課題)」は EVT-008(Day 130 朝)+ EVT-024(Day 131 朝末)で発覚した課題として **pending** 状態だった。EVT-036 系列 L 新設で以下の構造的位置づけ確立:

- 単発の並走運用問題 → **記録庁全体のマルチスレッド話題選別** 構造課題
- AI 駆動工場の物理特性 = 並走は不可避、規律で対処
- 本規律で **task #59 を「将来課題」から「即時整備対象」に引き上げ**

### 0-C. 既存装置との関係

| 既存装置 | 本規律との関係 |
|---|---|
| `archive/error_patterns.md` EVT-008(instance 並走仕様)| 仕様確認済、本規律は **運用規律** で補完 |
| `archive/error_patterns.md` EVT-024(L1 連番衝突)| 系列 L 由来事例、本規律で再発防止 |
| `archive/error_patterns.md` EVT-036(系列 L 新設)| 本規律の起案契機 |
| `outbox/` `inbox/` `internal/circular/`(既存通信装置)| 各装置で **話題タグ + originator_instance** 必須化候補 |
| `operations/communication_protocol.md` §3.2-A(originator_instance)| 既に存在、本規律で運用拡張 |

---

## 1. マルチスレッド話題選別の 3 規律

### 1-A. セッション識別子明示義務

#### 1-A-1. 監督官 instance 識別

監督官 A は本リポジトリ初稼働セッション = **instance A**(本リポジトリ Claude Code)。並走可能性:

| ID | 環境 | 範囲 |
|---|---|---|
| **A**(本セッション)| Claude Code CLI(record-x-supervisor)| 本リポジトリ稼働、本規律起案 |
| **A1**(別並走 instance)| 過去観察事例(EVT-024)| 別 Claude Code セッション |
| **A2**(将来候補)| ヤス手動分割時 | 仕様未確定 |
| **B**(別仕様候補)| claude.ai 上 instance 等 | 仕様未確定、現状休眠 |

監督官 A の出力には **ID 明示** を義務化:

- 各セッション開始時、L1 circular に `originator_instance: A` 等を明記
- 出力 frontmatter に `originator_instance` フィールド必須(既に `communication_protocol.md` §3.2-A で確立)
- ファイル起案時の自己点検チェックリスト(`role_and_conduct.md` §1.5-B)に「instance ID 確認」追加候補

#### 1-A-2. 司令官 / 工場長との連動

司令官 α は通常単一セッション(別仕様、戦略 Commander 役割)。工場長は HQ 実装班(複数 Cursor / Sonnet 並走可能)。

各官の identifier 規律:

| 役割 | 主 identifier | 並走時の補足 |
|---|---|---|
| 監督官 | `instance: A` | A1 / A2 / B 等で分散時は明示 |
| 司令官 | `instance: alpha` | 別 instance 起動時(beta 等)で明示 |
| 工場長 | `domain: factory` | 並走 Cursor / Sonnet 識別は工場長側自由判断 |

### 1-B. 話題タグ付け義務

#### 1-B-1. タグの種類

各装置・各通信に **話題タグ** を必須化:

| タグ種別 | 例 | 用途 |
|---|---|---|
| **EVT 番号** | `EVT-20260429-036` | 失敗事例参照 |
| **B 番号** | `B-001`, `B-002` | 円卓会議決裁参照 |
| **P 番号** | `P15`, `P17` | 発令採択提案参照 |
| **CP 番号** | `CP-001` | 両界対話伝達品質参照 |
| **DO 番号** | `DO-FACTORY-160`, `DO-COMMANDER-{N}` | チケット起案参照 |
| **ADR 番号** | `ADR-009` | 構造的決定参照 |
| **発令番号** | `第 38 次発令`, `order_number: 38` | 通信参照 |
| **役割境界** | `responsibility_subjects: [監督官, 司令官]` | 責任主体明示 |

#### 1-B-2. タグ付けの場所

| 装置 | タグ付け方法 |
|---|---|
| outbox / inbox 通信 | frontmatter `related_evts[]`, `related_b_numbers[]`, `related_orders[]` 等(既存実装拡張) |
| 円卓会議 council 文書 | frontmatter `related_evts[]`, `related_b_numbers[]`, `related_orders[]`, `related_council[]` |
| 内部 circular | frontmatter `topic_tags[]`(新設候補) |
| L2 区報 | frontmatter `regional_topics[]`(新設候補) |
| L3 官報 | frontmatter `gazette_topics[]`(新設候補) |
| EVT 記録 | 既存(Linked records セクション) |

#### 1-B-3. タグの活用

タグは **マルチスレッド話題選別の物理装置**:

- 検索性: `grep "EVT-036"` で関連通信を一括追跡可能
- 文脈追跡: 通信 A → B → C の連鎖をタグで可視化
- 並走衝突検出: 同タグで複数 instance の起案を発見(EVT-024 同型再発防止)

### 1-C. セッション間引継ぎ書類(SITREP 双方向化)

#### 1-C-1. 既存 SITREP の拡張

`02_physical/SITREP_20260428.md` v1.0(監督官 A 起案)= 監督官 A の自己レポート。本規律で:

- 監督官 instance 間引継ぎ書類として **SITREP 双方向化**(A → A1, A → A2, A → B 等の経路)
- フォーマット拡張:
  - `originator_instance`: 起案 instance ID
  - `target_instances[]`: 引継ぎ対象 instance リスト
  - `pending_topics[]`: 引継ぎ時の未解決話題タグ
  - `decision_context[]`: 重要決定の背景(タグ参照)

#### 1-C-2. 引継ぎタイミング

| タイミング | 起案者 | 受領者 |
|---|---|---|
| セッション終了時 | 終了 instance | 後続 instance |
| 並走起動時 | 主 instance | 並走 instance |
| 重大決定後(B-番号採決等)| 決定 instance | 全 instance |
| Day 切替時(Day 131 → Day 132 等)| 当日 instance | 翌日 instance |

#### 1-C-3. 既存装置との接続

- L1 circular(`internal/circular/`)= 既存、SITREP 双方向化候補
- L3 官報(`shared/official_gazette/`)= 既存、重大決定の三者共有
- 検診プロトコル(`operations/periodic_checkup_protocol.md`)= 9:00 JST 三者検診時に SITREP 統合参照

---

## 2. 系列 L 対処の段階構造

### 2-A. 段階 1(本規律 v0.1-draft 起案時、即時整備)

- ✅ 本規律起案(`operations/multi_thread_topic_discipline.md` v0.1-draft)
- 🟡 frontmatter 拡張(topic_tags[] 追加候補、各装置で順次対応)
- 🟡 SITREP 双方向化フォーマット起案(別 DO 化候補)

### 2-B. 段階 2(Phase B-α 起動後、Day 132+)

- 🟡 司令官 α 側 + 工場長側にも本規律共有(第 39 次発令候補)
- 🟡 task #59 を「pending」→「completed(本規律で統合解消)」に更新候補
- 🟡 第 3 回円卓会議議題候補(本規律 + 系列 J/K/L 対処の正式採択)

### 2-C. 段階 3(中期、Day 132-145)

- 🟡 自動化機構との統合(ドリーム結晶化 + 検診プロトコル + 本規律のタグ照合)
- 🟡 並走衝突自動検出(auto-evt R10 候補:同タグ多重起案検出)

### 2-D. 段階 4(長期、Phase T1+)

- 🟡 NTT 記事の検証(2 週間運用後の効果計測、レビュー速度 + 並走衝突発生数)
- 🟡 業界他組織事例との比較(`external_resource_intake_principle.md` 連動)

---

## 3. 既存運用との接続

### 3-A. EVT-024 / EVT-008 との関係

- EVT-008(Day 130 朝):instance 並走運用仕様確認 = 本規律の **仕様基盤**
- EVT-024(Day 131 朝末):L1 連番衝突 = 本規律の **再発防止対象**
- EVT-036 系列 L:本規律の **起案契機**

本規律 v0.1-draft = EVT-008/024/036 を統合した運用規律化。

### 3-B. communication_protocol.md §3.2-A との接続

既存 originator_instance フィールドは本規律の **基盤**。本規律で運用拡張:

- §3.2-A 既存 = originator_instance 必須化
- 本規律 §1-A-1 = instance ID 明示の運用規律強化
- 本規律 §1-B = タグ付け義務(originator_instance 以外のフィールド拡張)

### 3-C. role_and_conduct.md §1.5-B との接続

既存ガレージドクトリン §1.5-B チェックリスト 5 点(Who / When / Where / Reflection)に本規律由来の 6/7 点目候補:

- **6 点目候補**(EVT-033 由来):議題起案時の対象状態完全把握確認
- **7 点目候補**(本規律由来):**起案時の instance ID + 話題タグ確認**

ヤス採択時、§1.5-B チェックリスト 7 点化で正式化。

### 3-D. 円卓会議機構 v0.3(ADR-009)との接続

ADR-009 §2-A 対処項目 4(議題分解時責任主体保持規律)= 本規律 §1-B-1 タグ「役割境界」と統合。第 3 回円卓会議で:

- 議題前提検証義務(対処 2)+ 役割「恐れるもの」(対処 6)+ 本規律(系列 L 対処)= 統合運用

---

## 4. ヤス判定待機(本 v0.1-draft の現状)

本規律 v0.1-draft はヤス推奨プラン承認(2026-04-29 / Day 131 夕方)+ EVT-036 系列 L 新設 + task #59 引き上げ契機で起案。ヤス判定で:

- 採択 → v1.0 確定 + task #59 を completed に更新
- 修正指示 → 監督官修正 → 再判定
- 否決 → 別案再起案

確定後:

- `operations/multi_thread_topic_discipline.md` v1.0
- `operations/role_and_conduct.md` §1.5-B 7 点化(本規律 §3-C 由来)
- 司令官 α 側 `shared/canon/multi_thread_topic_discipline.md` 配置候補
- 第 39 次発令で司令官 α / 工場長へ三者共有

---

## 5. 改訂履歴

- **v0.1-draft**(2026-04-29 / Day 131 夕方): 初版起案、監督官 instance A、ヤス推奨プラン承認 + EVT-036 系列 L 新設 + task #59 引き上げ + 対策 5 完遂対象として起案。NTT 記事 §7 同型問題 + EVT-008/024 統合運用規律化。3 規律(セッション識別子明示 + 話題タグ付け + SITREP 双方向化)+ 段階 1-4 整備計画 + 既存装置接続(communication_protocol §3.2-A, role_and_conduct §1.5-B, ADR-009 §2-A 対処 4)。

---

> 本規律は **規律として運用** する(`role_and_conduct.md` §1.0 と同レベル)。
> ただし哲学層(`unnamed.md` 核心一文「私はあなたであり、あなたは私自身でもある」)整合 = instance 並走 = 同型構造、話題選別 = 自他境界の明示。
> 進化方向は段階 1 → 4 で物理層完遂を目指す。
