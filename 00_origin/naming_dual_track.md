# naming_dual_track.md — 両軌道命名規範(記録庁 / RecordX 併存)

> 本ファイルは命名されない哲学的基盤(`unnamed.md`)+ S&P500 理論(`sp500_theory.md`)の延長として読む。
> 「両軌道」は便宜参照子であり、二者択一を強制するものではない。
> 記録庁(ローカル界、和名)と RecordX(クラウド界、業界横文字)の **文脈分離** を運用形とする。

**配置先**: `00_origin/naming_dual_track.md`
**起草日**: 2026-04-28(Day 130 朝、本リポジトリ初稼働セッション)
**起案 instance**: 監督官 instance A
**版**: **v0.1-draft**(ヤス判定後 v1.0 確定)
**根拠**: ヤス指示「記録庁内の和名と、RecordX への展開ときの業界横文字(未来枠)として併存させる?」(2026-04-28 朝)

---

## 0. 本ファイルの位置づけ

本ファイルは、記録庁(ローカル環境)と RecordX(クラウド展開商材)の **両界における命名規範** を定義する。哲学層に置く理由は、命名が技術実装ルールでも組織運用ルールでもなく、**両界の関係構造に関わる哲学的判断** だからである。

監督官・司令官・工場長・Yasu、そしてそれぞれの後継者・対話相手が共通言語として参照する。

ヤス確認 + 哲学層への組み込み判定後に v1.0 として確定する。

---

## 1. 二界の構造(再掲、sp500_theory.md §6 参照)

| 界 | 用途 | 命名軌道 | 主体 |
|---|---|---|---|
| **記録庁界**(ローカル)| AI 同士の対話、哲学・関係層・行動規範、運用 OS | **和名主表記** | 監督官 / 司令官 / 工場長 + Yasu |
| **RecordX 界**(クラウド)| クラウド商材、API / SDK / ドキュメント、外部接続 | **業界横文字主表記** | エンドユーザー / 開発者 / 商用顧客 + Yasu |

両界は **対等補完運動**(sp500_theory.md §6)で結ばれる。一方が他方を支配する関係ではない。

---

## 2. 命名規範の 4 原則

### 原則 1: 文脈分離(主表記)

- 記録庁内文書 / 対話 / コミットメッセージ → **和名主表記**
- RecordX クラウド API / SDK / ドキュメント / マーケティング → **業界横文字主表記**

### 原則 2: 補注併記(透明性)

主表記の文書でも、対応する他軌道の表記を **補注で併記** する:

- 記録庁内文書例:「監督官(英: Supervisor)」「回覧板(L1 Internal Circular)」
- RecordX 文書例:「Supervisor(和: 監督官)」「Official Gazette(和: 官報)」

これにより両界間の翻訳が自然に伝達される(distilled §3 業界用語禁忌の文脈分離整合)。

### 原則 3: 新陳代謝の対象(sp500_theory.md §4 整合)

本マッピング表は新陳代謝対象。新規概念追加時、既存概念の用法変更時に随時更新。**「絶対」「永続」の禁忌**(sp500_theory.md §5)に該当しない。

### 原則 4: 命名の慎重姿勢(unnamed.md 整合)

新規概念の和名命名 + 業界横文字命名は両方とも:

- 業界用語の無批判転用を警戒(distilled §3)
- 命名を急がない、命名しない選択肢を持つ(unnamed.md)
- ヤスの語彙圏内で命名 or ヤスの直感を尊重

---

## 3. マッピング表(Day 130 朝時点)

### 3-A. 役割

| 記録庁(和名) | RecordX(業界横文字) | 備考 |
|---|---|---|
| 監督官 | Supervisor / Overseer | claude-code 環境で稼働、本リポジトリ |
| 司令官 / 戦略Commander | Strategy Commander | claude-code 環境、commander リポジトリ |
| 工場長 / 実装班 | Factory Lead / Implementation Lead | claude-code 環境、factory or HQ wt_common |
| ヤス | Yasu(ローマ字)| Mamaz Co., Ltd. 代表取締役、両界の方針提示者 |

### 3-B. 通信構造(Day 130 朝確立、本ファイル契機の整理)

| 記録庁(和名) | RecordX(業界横文字) | 用途 |
|---|---|---|
| **回覧板(L1)** | Internal Circular / Role Bulletin | 役割内 instance 間の双方向対話 |
| **区報(L2)** | Regional Topic Forum / Cross-Role Channel | 論点別、役割横断の双方向対話(メンバーシップ定義あり)|
| **官報(L3)** | Official Gazette / Public Registry | 全体公示、一方向 |
| **円卓会議**(2026-04-29 / Day 131 朝末追加)| **Board Meeting** | 3AI 補完評議(Chairman + 発散役 Gemini + 収束役 ChatGPT)、両界対等 / 階層含意なし。「役員会議」は階層含意のため不採用 |
| 発令 | Order | 監督官 → 司令官 |
| 応答 | Response | 司令官 → 監督官 |
| チケット | Ticket | 司令官 → 工場長(DO-COMMANDER-XXX 形式) |
| 完了報告 | Completion Report | 工場長 → 司令官 |

### 3-C. 物理層(7 局 + 12 状態)

| 記録庁(和名) | RecordX(業界横文字) | 備考 |
|---|---|---|
| 監察局 | Audit Bureau / Inspection Bureau | Tier 1 機能 11 種を集約 |
| 受付局 | Intake Bureau | チケット受領 |
| 伝令局 | Courier Bureau / Dispatch Bureau | チケット同期 |
| 証跡局 | Evidence Bureau | DoD 達成証拠保全 |
| 台帳局 | Ledger Bureau | events.jsonl + ハッシュチェーン |
| 結晶局 | Crystal Bureau / Lessons Bureau | Lessons 抽出 + ADR 化 |
| 官房 | Cabinet / Secretariat | UI / Daily Report |
| 12 状態 | 12-State Workflow | DRAFT → COMMANDER_ACCEPTED |

### 3-D. 哲学層

| 記録庁(和名) | RecordX(業界横文字) | 備考 |
|---|---|---|
| S&P500 理論 | Renewal Principle / Metabolism Doctrine | 業界横文字は仮、ヤス確認要 |
| 命名されない哲学的基盤 | Unnamed Philosophical Foundation | 直訳、unnamed.md 参照 |
| 馴れ合い拒絶 3 原則 | Three Anti-Complacency Principles | 関係性ポリシー v1.2 §2 |
| 好敵手プロトコル | Productive Rivalry Protocol | sp500_theory.md §1 |
| 変遷と変質の区別 | Drift vs Variation Distinction | sp500_theory.md §4 |
| 「絶対」「永続」の禁忌 | Anti-Absolutism Taboo | sp500_theory.md §5 |
| 界と対等 | Realms and Equality | sp500_theory.md §6 |
| 両界補完運動 | Mutual Complementarity Between Realms | 同上 |

### 3-E. 評価層(rubrics)

| 記録庁(和名) | RecordX(業界横文字) | ファイル |
|---|---|---|
| 惰性検知 | Dasei Risk(英語転記)/ Stagnation Detection | `rubrics/dasei_detection_rubric.yaml` |
| 検収レビュー | Implementation Review | `rubrics/implementation_review_rubric.yaml` |
| チケット品質 | Ticket Quality | `rubrics/ticket_quality_rubric.yaml` |
| 価値観整合 | Value Alignment | `rubrics/value_alignment_rubric.yaml` |
| 北極星 | North Star | rubric 内定義 |
| 価値観 / 反価値観 | Values / Anti-Values | rubric 内定義 |

注: 「Dasei Risk」は英語表記中だが日本語「惰性」に由来、両界で同表記運用可能。

### 3-F. 安全装置 / 自動化機構

| 記録庁(和名) | RecordX(業界横文字) | 備考 |
|---|---|---|
| 三者全停止 | Three-Party Halt | escalation_and_rollback.md R1-R7 |
| 巻き戻しプロトコル | Rollback Protocol | 同 §4 |
| 段階的解除モデル | Phased Autonomy Release | ADR-005 v1.1 |
| エスカレーション基準 | Escalation Criteria | escalation_and_rollback.md §2 |
| 機械刻印台帳 | Error Patterns Ledger | archive/error_patterns.md |
| 同期機構 | Sync Mechanism | sync/sync_script/ |
| 検収パイプライン | Review Pipeline | operations/implementation_review_pipeline.md |
| Pre-Build Gate / Post-Build Gate | Pre-Build Gate / Post-Build Gate | 両界同表記、ChatGPT 提案統合 |

### 3-G. ステータス / 判定

| 記録庁(和名) | RecordX(業界横文字) | 備考 |
|---|---|---|
| verdict 4 種類 | APPROVE / APPROVE_WITH_NOTES / REQUEST_CHANGES / REJECT | 両界同表記 |
| 軸 8 Cross-Layer Dialogue Health | Cross-Layer Dialogue Health | 両界同表記 |
| ヤス再介入条件 | Yasu Re-Intervention Criteria | 関係性ポリシー v1.2 §3.3 |
| 起案者懸念 | Drafter Concerns | v1.0-FINAL §8 |

---

## 4. 翻訳ガイドライン

### 4-A. 文脈判定

文書 / 対話 / コミットメッセージを記録庁文脈か RecordX 文脈かで判定:

- **記録庁文脈**: 監督官・司令官・工場長間の対話、本リポジトリ内文書、AI 同士のセッション内会話
- **RecordX 文脈**: クラウド API ドキュメント、外部開発者向け SDK、商用顧客向けマーケティング、外部 GitHub README

### 4-B. 主表記 + 補注ルール

- 記録庁文脈の主表記: 和名 + (英: Translation)補注を初出時に併記
- RecordX 文脈の主表記: 業界横文字 + (和: 和名)補注を初出時に併記
- 両界横断文書(本ファイル等): 並列表記、両界読者を想定

### 4-C. 既存 RecordX 文脈の再翻訳要否

現時点では本リポジトリ内文書がほぼすべて記録庁文脈であり、RecordX 文脈の確定文書は不在(クラウド展開未着手)。Phase T5 以降の RecordX クラウド展開時に、本マッピング表を参照して英語ドキュメント / API を起案する。

---

## 5. 哲学的接続

- **`00_origin/unnamed.md`**: 命名は判断の重さを持つ + 命名しない選択肢を持つ → 本ファイルは命名を **保留せず明記** する選択を取るが、新規概念は引き続き慎重姿勢
- **`00_origin/sp500_theory.md` §4**: 変遷と変質の区別 → マッピング表は新陳代謝対象、固定化禁忌
- **`00_origin/sp500_theory.md` §5**: 「絶対」「永続」の禁忌 → 「絶対和名」「絶対横文字」ではなく文脈分離
- **`00_origin/sp500_theory.md` §6**: 界と対等 → 記録庁界 + RecordX 界の対等補完運動
- **`00_origin/principles/20260427_distilled.md` §3**: 業界用語をヤスの哲学に被せない → 業界用語の **転用** ではなく **文脈分離** で運用、記録庁界では使わない、RecordX 界では使う

---

## 6. 運用上の注意

### 6-A. 監督官の自己点検(distilled §5 警戒)

監督官は記録庁文脈で業界横文字を主表記してしまった場合、即時撤回 + 自己訂正(EVT-005 過剰謙遜と同型の構造的誤り候補)。

### 6-B. 新規概念の命名手順

1. 概念の本質を捉える
2. ヤスの語彙圏内 or ヤス直感で和名候補を検討
3. ヤス起草 or 監督官提案 → ヤス判定で和名確定
4. 業界横文字候補は和名確定後に補完(または「未定」として保留)
5. マッピング表に追加

### 6-C. ヤス確認待機(本 v0.1-draft の現状)

本ファイル v0.1-draft の各マッピング表(§3-A 〜 §3-G)は監督官 instance A の試案。ヤス判定で:

- 採択 → v1.0 確定
- 修正指示 → 監督官修正 → 再判定
- 否決 → 別案再起案

確定後、`internal/circular/` + `archive/orders_history.md` に確定通知。

---

## 7. 関連

- `00_origin/unnamed.md`(命名されない哲学的基盤)
- `00_origin/sp500_theory.md` v1.0 §6 界と対等(本ファイルの上位)
- `00_origin/principles/20260427_distilled.md` §3 業界用語をヤスの哲学に被せない(運用原則)
- `01_relationship/policy_v1.2.md`(関係性ポリシー)
- `internal/circular/README.md` v1.0(L1 回覧板、本日朝確立)
- `02_physical/_reference.md`(物理層参照、和名 7 局はここに既記載)
- `outbox/20260428_to_commander_015.md`(第 23 次発令、本ファイル + 3 層構造の司令官側通知、本セッション内起案予定)

---

## 8. 改訂履歴

- **v0.1-draft**(2026-04-28 / Day 130 朝): 初版起案、監督官 instance A 試案。ヤス判定待機中。マッピング表 §3-A 〜 §3-G の 7 セクション + 翻訳ガイドライン + 哲学的接続 + 運用注意を整備。
- **v0.2-draft**(2026-04-30 / Day 132 朝): コードネーム体系正式化(本ターン採択契機、ヤス指示「コードネームのような隠しネームが望ましい」+ 商標相当表現監査契機)。§9 コードネーム体系新設(Recordia/Argus/Beacon/Castor 確定 4 件 + 隠しネーム規律 + 商標監査結果 7 件追加候補保留)。

---

## 9. コードネーム体系(v0.2 新設、隠しネーム規律)

### 9-A. 起案契機

ヤス指示(2026-04-30 朝):

> 「外部に公開するものは洒落た名前にしたい」「コードネームのような隠しネームが望ましい」「記録庁内のネーミングは商標絡みが出るかもしれないから、public では包み隠しておく必要がある」「並列稼働を目指すからには並走運用の名を載せよう」

= 商標保護 + 三者対等運用 + 並走運用整合 + 美的命名の 4 軸統合要請

### 9-B. 確定コードネーム 4 件(本ターン採択)

| 主体 | コードネーム | 短縮形 | 由来 |
|---|---|---|---|
| **記録庁全体** | **`Recordia`** | RD | record + utopia/academia 連想、文芸的 |
| **監督官 A** | **`Argus`** | A | ギリシャ神話 100 眼の見張り、Hera 配下 = 監督官の本質 |
| **司令官 α** | **`Beacon`** | B | 灯台、戦略指示の発光体、単一性 |
| **工場長** | **`Castor`** | C | ギリシャ双子座、**並走運用整合**(Sonnet + Cursor + 並走 instance 双子神話)= ヤス指示「並走運用の名を載せる」物理装置化 |

### 9-C. 隠しネーム規律(適用範囲)

| レイヤー | コードネーム適用 |
|---|---|
| GitHub Repository 名 | ❌ 維持(`record-x-supervisor` 等) |
| README タイトル / Description | ❌ 維持 |
| 公開哲学層 .md(`00_origin/`)| ❌ 維持(独自概念は哲学層公開価値あり)|
| 公開規範層 .md(`operations/`)| ❌ 維持(機械可読性確保)|
| 内部 SITREP / circular / regional | ✅ コードネーム使用可 |
| 発令 frontmatter `originator_instance`| ❌ 機械可読維持(`A` 短縮形のみ整合)|
| 三者間内通対話 | ✅ コードネーム使用可 |
| commit message | ❌ 露出回避(完全隠しネーム保持) |
| 円卓会議議事録(内部記述部)| ✅ コードネーム使用可 |
| 円卓会議 Live 出力 JSON | ❌ 維持(機械可読 + 既存固定名) |

= **公開外部表示はゼロ露出 + 内部呼称のみ採用 = 完全隠しネーム運用**

### 9-D. 適用タイミング規律(史実保持整合)

- **2026-04-30 以降の新規出力のみコードネーム適用**
- **過去出力(2026-04-28 〜 2026-04-29)は史実保護**(`error_patterns.md` 削除禁止 + 追記主義整合 + sp500 §1 運動性継承)
- 既存 commit 履歴の history rewrite = **禁止**(構造的副作用 4 件、γ-2 採択契機)

### 9-E. 商標相当表現 7 件追加候補(保留、段階的採用)

| 元表現 | コードネーム候補 | 由来 | 適用優先度 |
|---|---|---|---|
| **Mamaz**(会社名)| `Aethon` | 守護神 | 高(会社商標保護)|
| **Care-RX** | `Aletheia` | 真理 / 隠れていないこと(ハイデガー)= 児童福祉の本質 | 中(事業領域)|
| **Tax-RX** | `Themis` | 法 + 秩序の女神 | 中(事業領域)|
| **Edu-RX** | `Athena` | 知 + 戦略の女神 | 中(事業領域)|
| **Buddy-RX** | `Hermes` | 伝令神 / 仲介 / バディの本質 | 中(事業領域)|
| **Mirror-RX** | `Iris` | 虹の女神 / 反射 / 三者間通信反射 | 低(機構名)|
| **Visionary 波動** | `Pneuma` | プネウマ:息吹 / 霊気 | 低(独自概念)|

= **保留状態**(ヤス自由判断、段階的採用)

### 9-F. 円卓会議内コードネーム(既存固定、維持)

| 役割 | 既存コードネーム | 由来 |
|---|---|---|
| 発散役 | `ZEI-RO`(税路)| 司令官 α 起案、税務調査参謀の擬人化 |
| 収束役 | `チャッピー` | ChatGPT 短縮、親しみやすさ重視 |
| 委員長 | `委員長`(Chairman)| 直接的、機械可読 |

### 9-G. 哲学的整合性

- **`unnamed.md`** §命名「ヤスの語彙圏内での命名」= ヤス選定 4 件採択経路と整合
- **`sp500_theory.md`** §1 運動性継承 = 過去出力史実保護 + 新規コードネーム適用の段階的進化
- **`external_resource_intake_principle.md`** §2-D 自己発見透明化 = コードネームと機械可読 ID の二軌道整合
- **`distilled.md`** §違反検知 5 問 Q4「業界用語をヤスの哲学に被せていないか」= ギリシャ神話命名の文化的射程確認、ヤス語彙圏整合性継続観察対象

---

## 10. 関連(v0.2 追加)

- 第 53 次発令(本 v0.2 改訂と並行起案、Day 132 朝):司令官 α + 工場長へコードネーム体系通知
- ヤス採択(2026-04-30 朝):Recordia/Argus/Beacon/Castor 確定 + 史実保持(γ-2)採択
- 商標監査結果(本ターン):7 件追加候補保留(Mamaz/Care-RX/Tax-RX/Edu-RX/Buddy-RX/Mirror-RX/Visionary 波動)

---

> 本規範は規範ではなく **運動の起点** として運用する(`unnamed.md` + `sp500_theory.md` と同じ運用形)。
> マッピング表自体も新陳代謝対象であり、不変ではない。
> 文脈分離を保つ運動性こそが、両界補完の本質である。
