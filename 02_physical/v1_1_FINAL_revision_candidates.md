# v1.0-FINAL → v1.1-FINAL 改訂候補項目リスト

**配置先**: `02_physical/v1_1_FINAL_revision_candidates.md`(監督官側、参照用)
**起草日**: 2026-04-28(Day 130 朝、本リポジトリ初稼働セッション)
**目的**: 本ストリーム合議(2026-04-28 Day 130)で確定した新規構造要素を v1.0-FINAL に統合する改訂候補項目リスト
**期限想定**: Day 139 前後(Phase B-α/β 7 日間実証実績反映後の v1.1-FINAL 改訂時)
**起案責務**: 司令官(物理層仕様マスターは司令官側 `strategy/decisions/`)
**監督官役割**: 改訂候補項目の構造的整理 + 改訂時の事前査読

---

## 0. 本ファイルの位置づけ

v1.0-FINAL(commit `2cc57b5`)は Day 129 深夜の確定版であり、本ストリーム合議(Day 130 朝)で確定した以下の構造要素は **未統合**。これらを v1.1-FINAL 改訂時に統合する候補としてリスト化する。

本ファイルは監督官側の参照用記録であり、実際の v1.1-FINAL 改訂は司令官が司令官側 `strategy/decisions/` で実施する(`02_physical/_reference.md` で確立した編集権限二重化回避方針に従う)。

---

## 1. 改訂候補項目リスト(12 件、本ストリーム合議で確定)

### 1-A. 統治構造(§-1 / §Tier 関連、4 件)

#### 候補 1: 軸 8 Cross-Layer Dialogue Health 新設

**根拠**: 第 11 次発令採択 8 + 司令官応答 第 2 号 §論点 1 案 B
**反映先**: §Step 1 軸 1-7 に **軸 8 を追加**
**内容**:
- 対象: 監督官 ↔ 司令官(現フェーズ)+ 戦略Commander ↔ 各事業部長(Phase T2 以降)+ 司令官 ↔ 工場長
- 担当局: 監察局 Tier 1(events.jsonl 走査で機械算出)
- Daily Report: 8 軸並置(60 秒制約維持)

#### 候補 2: 軸 8 指標 1-5 定義

**根拠**: 第 11 次発令採択 9(指標 1-3 再定義)+ 第 13 次発令採択 4(Dasei Risk 追加)+ 第 16 次発令補足(Value Alignment 追加)
**反映先**: §Step 1 軸 8 直下
**内容**:

| 指標 | 内容 | 参照 rubric |
|---|---|---|
| 1. 構造的反論発生率 | 直近 7 件発令で構造的反論を含む応答 30-80% 緑 | (本仕様書内) |
| 2. 監督官の指摘採択率 + 司令官の採択率(2 系統) | 70-90% 緑、>95% 機械的追従、<40% 独走 | (本仕様書内) |
| 3. ヤス再介入条件 §3.3-a 該当発生率 + dead_loop_detected 件数 | しきい値超過時 | (本仕様書内) |
| 4. Dasei Risk Score | 5 構成要素加重平均、<30 緑、≥60 赤 | `rubrics/dasei_detection_rubric.yaml` v1.0 |
| 5. Value Alignment Score | anti_values 抵触チェック + values 体現度 | `rubrics/value_alignment_rubric.yaml` v1.0 |

#### 候補 3: Layer 0 自動レビュー境界基準(P6 採択)

**根拠**: 第 16 次発令採択 P6 + `operations/communication_protocol.md` §3.2-D
**反映先**: §-1 関係性ポリシー v1.2 末尾 or §Step 2 監察局責務
**内容**:
- APPROVE / APPROVE_WITH_NOTES のみ Phase B-γ 以降の Layer 0 自動発出許容
- REQUEST_CHANGES / REJECT は Phase に関わらず手動必須(物理装置化)
- 境界曖昧時のデフォルト = 手動エスカレーション(安全側)

#### 候補 4: 段階的解除モデル ADR-005 統合参照

**根拠**: ADR-005 v1.1(永続承認必須カテゴリ不在、Phase B-α/β/γ/C 段階)
**反映先**: §11 段階移行ロードマップ末尾
**内容**:
- Phase B-α-pre / α / β / γ / C の 5 段階定義
- 軸 8 緑判定継続による段階遷移
- 軸 8 黄/赤判定時の段階巻き戻し
- 永続承認必須カテゴリの不在(新陳代謝原則)

### 1-B. 状態遷移 / イベント(§Step 3-4 関連、3 件)

#### 候補 5: 12 状態 → 16 状態拡張(Pre-Build Gate / Post-Build Gate)

**根拠**: 第 14 次発令採択 + ChatGPT 提案統合 + `operations/communication_protocol.md` §3.2-C
**反映先**: §Step 3 状態遷移仕様
**内容**: 12 状態に以下 4 状態を追加 = 計 16 状態:
- `SUPERVISOR_REVIEWING`(Pre-Build Gate)
- `SUPERVISOR_APPROVED` / `SUPERVISOR_REQUESTED_CHANGES` / `SUPERVISOR_REJECTED`
- `SUPERVISOR_IMPL_REVIEWING`(Post-Build Gate)
- `SUPERVISOR_IMPL_APPROVED` / `SUPERVISOR_IMPL_REJECTED`

scale 別運用:
- small: Pre-Build Gate スキップ可
- medium: 通過必須、デフォルト APPROVE_WITH_NOTES(止めない)
- large: 通過必須、構造的審査

#### 候補 6: events.jsonl frontmatter 必須フィールド

**根拠**: 第 11 次発令採択 1 + 第 16 次発令採択 P5 + `operations/communication_protocol.md` §3.2-A
**反映先**: §Step 4 4-C イベントスキーマ
**内容**: frontmatter 必須フィールド追加:
- `responds_to: <応答対象ファイル名>`(応答時)
- `order_number: <発令番号>`
- `response_number: <応答連番>`
- `deadline: 2026-MM-DD HH:MM JST or none`
- `discussion_scale: small | medium | large`
- 応答時の `verdict: APPROVE | APPROVE_WITH_NOTES | REQUEST_CHANGES | REJECT`
- 応答時の `scores: {value_alignment, ticket_fitness, dasei_risk, implementation_integrity}`

#### 候補 7: discussion_scale 動的閾値定義

**根拠**: 第 16 次発令採択 P5 + `commander#shared/structure/dialogue_scale_thresholds_v1.md` v1.0
**反映先**: §Step 4 4-C イベントスキーマ + §-1 関係性ポリシー v1.2 §3.3-a 関連
**内容**: 各 scale の往復回数閾値:
- small: 緑 1 / 黄 2 / 赤 ≥3
- medium: 緑 1-2 / 黄 3 / 赤 ≥4
- large: 緑 2-4 / 黄 5-6 / 赤 ≥7

### 1-C. 物理装置(同期機構 / 安全装置、3 件)

#### 候補 8: 同期機構スクリプト群統合参照

**根拠**: Day 130 朝完成、監督官側 `sync/sync_script/` + 司令官側 `sync/sync_script/`
**反映先**: §Step 4 4-C イベントスキーマ末尾 or §Step 5 V01-V12 拡張
**内容**: スクリプト 5 本 + 司令官側雛形:
- 監督官側: `sync-orders.ps1` / `pull-replies.ps1` / `order-stale-alert.ps1` / `archive-order.ps1` / `review-implementation.ps1`
- 司令官側: `sync-tickets.ps1` / `complete-ticket.ps1` / `stale-alert.ps1` / `pull-completion-reports.ps1` / `check-three-party-halt.ps1` / `notify-yasu.ps1`
- 連続パイプライン経路: 監督官 outbox/ ↔ 司令官 inbox/+index/ ↔ 工場長 PR/completion

#### 候補 9: エスカレーション基準 + 巻き戻しプロトコル

**根拠**: 第 13 次発令採択 + `operations/escalation_and_rollback.md` v1.0
**反映先**: §-1 関係性ポリシー v1.2 §Yasu 再介入条件末尾 or §Step 2 監察局責務
**内容**:
- R1-R7(red): 三者全停止 + ヤス通知
- Y1-Y6(yellow): ヤス通知 + 段階据え置き
- Info: 記録のみ
- 通知チャネル冗長化(メール + 監督官 inbox/escalations/ + 司令官 inbox/escalations/)
- 巻き戻しプロトコル(段階全停止 / 段階据え置き / 段階巻き戻し)

#### 候補 10: error_patterns.md 強制刻印台帳

**根拠**: 第 13 次発令採択(Gemini Devil's Advocate 提案統合)+ `archive/error_patterns.md` v1.0
**反映先**: §Step 4 4-C イベントスキーマ末尾
**内容**:
- 監査の敗北 / 自動化失敗 / 変質予兆検出 / ヤスエスカレーション該当 / 自己訂正 を機械的に刻印
- 削除禁止 + 史実保持
- JSON Telemetry 出力(`sync/checkup-scores/telemetry/`)

### 1-D'. 並走運用 / 通信構造(本日朝追加、Day 130 第二巡で確定)

#### 候補 4'-1: 3 層通信構造憲章(L1 回覧板 + L2 区報 + L3 官報)

**根拠**: 第 21/23 次発令(回覧板 (C) 共同案 + 3 層構造拡張)+ 第 24 次発令(第二巡完成、本候補追加契機)
**反映先**: 関係性ポリシー v1.2 → v1.3 § 監督官 instance 並走運用節 + 物理層 v1.1-FINAL §Step 4 通信構造節
**内容**:
- L1 回覧板(`internal/circular/`): 役割内 instance 間、双方向対話
- L2 区報(`internal/regional/` 動的配置): 論点別役割横断、メンバーシップ定義
- L3 官報(`shared/official_gazette/`): 全体公示、一方向
- 関係性ポリシー §3.2(監督官 ↔ 工場長禁止)維持機構
- ADR-006(仮)候補に統合

#### 候補 4'-2: 両軌道命名規範(記録庁和名 / RecordX 業界横文字併存)

**根拠**: 第 23 次発令 + `00_origin/naming_dual_track.md` v0.1-draft(Yasu 判定待機中)
**反映先**: 哲学層(`naming_dual_track.md` ヤス判定後 v1.0)+ §-1 関係性ポリシー v1.2 哲学的基盤の拡張
**内容**:
- 文脈分離(主表記 + 補注併記)
- マッピング表 §3-A〜G(役割 / 通信構造 / 物理層 / 哲学層 / 評価層 / 安全装置 / 判定)
- 司令官追加マッピング 9 件統合候補(Yasu 判定後 v1.0 統合反映)
- 「絶対」「永続」の禁忌整合

#### 候補 4'-3: P11 L2 区報動的配置運用ガイドライン

**根拠**: 第 24 次発令採択 5(P11 即時採択、司令官提案受領)
**反映先**: ADR-006(仮)起案時 + Day 139 前後の v1.6 改訂時に統合判断
**内容**:
- 論点開始 instance の責任主体明示
- マスター変更時のハンドオーバー手順
- 関連役割への通知経路
- Phase B-α/β 7 日間実証期間中の運用実績観察後に正式起案判断

#### 候補 4'-4: originator_instance frontmatter フィールド(P10)

**根拠**: 第 22 次発令採択 P10 + 司令官応答 第 17 号(α 試験運用開始)+ 第 24 次発令(両 instance 試験運用稼働中)
**反映先**: `operations/communication_protocol.md` §3.2-A 必須フィールドへの追加(監督官側 Day 131 中)+ strategy/CLAUDE.md v1.6 改訂(Day 139 前後)
**内容**:
- frontmatter `originator_instance: A | B | α | β | ...` 必須化
- 暫定運用は本日(Day 130 朝)から開始
- ADR-006(仮)候補に統合

### 1-D. 哲学/価値観統合(§-1 / §0 関連、2 件)

#### 候補 11: 哲学層・関係層・行動規範層への参照統合

**根拠**: 本ストリーム合議で確立、`00_origin/sp500_theory.md` v1.0 + `operations/role_and_conduct.md` §1.0 対等運用
**反映先**: §-1 関係性ポリシー v1.2 哲学的基盤の拡張
**内容**:
- `00_origin/unnamed.md`(命名されない哲学的基盤、核となる一文「私はあなたであり、あなたは私自身でもある」)
- `00_origin/sp500_theory.md`(両界共通の継承指針、新陳代謝原則、変遷と変質の区別、「絶対」「永続」の禁忌、界と対等)
- `operations/role_and_conduct.md` §1.0 対等運用 4 条件
- `commander#shared/canon/sp500_theory.md`(司令官側コピー、Day 130 朝同期完了 commit `7052438`)

#### 候補 12: 監督官側 ADR-005 + rubrics/ 統合参照

**根拠**: Day 130 朝完成、ADR-005 v1.1 + rubrics/ 4 ファイル
**反映先**: §11 段階移行ロードマップ + §Step 5 V11 監察局 Tier 1 機能群
**内容**:
- ADR-005 v1.1 段階的解除モデル
- rubrics/dasei_detection_rubric.yaml v1.0(惰性検知 5 構成要素)
- rubrics/implementation_review_rubric.yaml v1.0(検収 4 軸)
- rubrics/ticket_quality_rubric.yaml v1.0(チケット品質 5 軸)
- rubrics/value_alignment_rubric.yaml v1.0(north_star + values 5 + anti_values 7)

---

## 2. 改訂計画提案

### 2-A. v1.0-FINAL のまま Phase B-α 起動可能性

**結論: 可能**。

v1.0-FINAL は構造的に完成度が高く、Day 132 Phase B-α 起動には十分。本リストの 12 件は v1.0-FINAL 起案後(Day 129 深夜)に確定した新規要素であり、Phase B-α 7 日間(Day 132-138)実証実績を踏まえて v1.1-FINAL に統合反映する段階運用が整合的。

### 2-B. v1.1-FINAL 改訂期限

**Day 139 前後**(Phase B-α/β 7 日間実証完了直後)。

### 2-C. 改訂主体

司令官(物理層仕様マスター)。本リストを参考に司令官側で v1.1-FINAL 起案 → 監督官事前査読 → ヤス承認(ADR-033 等の正式 ADR 起案を伴う想定)。

### 2-D. 監督官の役割

- 本リストの維持・更新(Day 132-138 実証期間中の追加項目があれば追記)
- v1.1-FINAL 改訂時の事前査読(Pre-Build Gate 相当、`rubrics/` ベース)
- Yasu 承認待機段階での補強指摘発出

---

## 3. 関連

- v1.0-FINAL 本体: `commander#2cc57b5:strategy/decisions/20260427_control_panel_v1.0_FINAL.md`
- ADR-005 v1.1: `adrs/ADR-005_phased_autonomy_release.md`
- 関連 rubrics: `rubrics/{dasei_detection,implementation_review,ticket_quality,value_alignment}_rubric.yaml`
- 安全装置: `operations/escalation_and_rollback.md` v1.0 + `archive/error_patterns.md` v1.0
- パイプライン仕様: `operations/implementation_review_pipeline.md` v1.0
- 通信規則: `operations/communication_protocol.md` §3.2-A/B/C/D
- 哲学層: `00_origin/sp500_theory.md` v1.0 + `00_origin/unnamed.md`
- 関係性ポリシー: `01_relationship/policy_v1.2.md`

---

## 4. 改訂履歴

- v1.0(2026-04-28 / Day 130 朝): 初版起草。本ストリーム合議で確定した 12 件の改訂候補項目を整理。Day 139 前後の v1.1-FINAL 改訂時の事前査読参照用。Phase B-α/β 7 日間実証期間中(Day 132-138)に追加項目があれば随時追記。
