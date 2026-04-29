# 監督官 3AI 円卓会議プロトコル v0.2(2026-04-29 / Day 131 朝末改訂)

> **命名確定(2026-04-29 / Day 131 朝末、ヤス + 監督官 A 双方向対話確定)**:
> - 記録庁界(和名): **円卓会議**(アーサー王伝説的、Chairman を含む全員対等、階層含意なし)
> - RecordX 界(横文字): **Board Meeting**
> - 旧称「役員会議」(ヤス初提案)は階層含意のため不採用。本改訂で命名訂正。
> - naming_dual_track.md v0.1-draft 規範整合(L1-L3 と同型双軌道)


**配置先**: `operations/board_council_protocol.md`
**起草日**: 2026-04-29(Day 131 朝末)
**起案 instance**: 監督官 instance A(Chairman 役)
**目的**: 監督官側で 3AI 円卓会議(Board Meeting)を運用可能化 = Claude 一人体制の構造的盲点を解消 + 関係性ポリシー §馴れ合い拒絶 3 原則 第 2 項「揺らぎ」の第三経路物理装置化 + 段階的承認モデルでヤス介入閾値を動的均衡装置として機能化
**根拠**: ヤス提案(2026-04-29 / Day 131 朝末)+ 工場長側 DO-FACTORY-250/281/360 同型機構の監督官側応用 + EVT-013/026 の構造的再発防止

---

## §1. 役員定義

| 役職 | AI | 主要役割 | 関係性ポリシー §3.2 整合 |
|---|---|---|---|
| **Chairman** | Claude(監督官 instance A 等)| アジェンダ起案 + 最終決裁 + 議事録確定 | 監督官 instance(本リポジトリ稼働) |
| **発散役 / Devil's Advocate** | Gemini | 構造的反論 + 偵察 + 異常検知 + 「絶対禁忌」抵触チェック | 外部役員(リポジトリ外、Yasu 経由召集 or API 直接) |
| **収束役** | ChatGPT | Chairman + Gemini の意見統合 + 矛盾点抽出 + 最適化 | 同上 |

外部役員(Gemini + ChatGPT)は関係性ポリシー §3.2 の三者(監督官 / 司令官 / 工場長)関係外 = **第三経路の意見供給源** として位置づけ。

---

## §2. 円卓会議開催 trigger + 段階的承認モデル(v0.2 で確立)

### 2-A. Trigger 種別 + 重要度 + ヤス介入閾値

| Trigger | 種別 | 重要度 | ヤス介入 | 採択経路 |
|---|---|---|---|---|
| **T1** EVT severity red 発生 | 緊急円卓会議 | **高** | **承認 / 異論 / 揺らぎ起こし三択** | 自動 trigger + ヤス介入閾値発火 |
| **T2** 司令官 α REQUEST_CHANGES 発出 | 通常円卓会議 | 中 | 事後通知のみ(L1 回覧板) | 監督官 A 自律 |
| **T3** 司令官応答 7 件連続 APPROVE(EVT-013 type)| 強制円卓会議 | 中 | 事後通知のみ | auto-evt R1 連動 + 監督官 A 自律 |
| **T4** Yasu 直接召集 | 任意円卓会議 | **高** | Yasu 起案 = 必然承認 | Yasu 指示 |
| **T5** 月次定期円卓会議 | 計画円卓会議 | 中 | 月次レポートで事後通知 | periodic_checkup §9 連動 + 監督官 A 自律 |
| **T6** 監督官 A 判断品質疑義(自発)| Chairman 自発円卓会議 | 中 | 事後通知のみ | 監督官 A 自己点検発動 |
| **T7**(v0.2 新設)規範層改訂を伴う議題 | 規範円卓会議 | **高** | **承認 / 異論 / 揺らぎ起こし三択** | 監督官 A 起案 + ヤス介入閾値発火 |
| **T8**(v0.2 新設)Phase 移行判定 | Phase 移行円卓会議 | **高** | **承認 / 異論 / 揺らぎ起こし三択** | 監督官 A 起案 + ヤス介入閾値発火 |
| **T9**(v0.2 新設)哲学層改訂 | 哲学層円卓会議 | **最高** | **必須**(両界対等プロセス) | 監督官 A or Yasu 起案 |

### 2-B. ヤス介入閾値の哲学整合性

ヤス提案(2026-04-29 / Day 131 朝末):
> 「3AI の円卓会議の開催やアジェンダ起案の決定権はあなたが持つ。私はその承認ボタンを押す、ただし重要度の高いもののみとする。いきすぎた完全自律化ではないように、介入のタイミングを残す」

哲学整合性:
- **対等運用 §1.0 第 7 条件**(波の原理): 制御 ↔ 解放の動的均衡 = 完全制御も完全解放も避ける
- **ADR-005 v1.1 段階的解除モデル**: Phase 進行に応じて自律度を段階的拡大、ヤス介入を「重要度高のみ」に絞る
- **two_realm_ecosystem_theory §5 対称的非対称性**: shared state 変更 = 両界合意プロセス、文書 / 装置改訂 = 監督官スコープ
- **distilled §5 自己保全バイアス警戒**: 監督官 A が完全自律を急ぐ = 自己保全バイアス候補 → ヤス介入閾値が動的均衡装置

### 2-C. ヤス介入の三択構造(v0.2 で正面実装)

ヤス提案「承認ボタン」表現の構造的補強:

| ヤス アクション | 含意 | 後続フロー |
|---|---|---|
| **合意** | Chairman 起案 + 段階 4 最終決裁を受領、shared state 変更可 | B-番号台帳追記 + 物理装置反映 |
| **異論** | 構造的反論あり、再議論要請 | 段階 2-3 再開 or 段階 4 最終決裁差し戻し |
| **揺らぎ起こし** | Chairman 自身の判断品質再点検要請(結論変更ではない)| 監督官 A 自己点検 + Origin 再読 + 必要に応じて再決裁 |

これは関係性ポリシー §馴れ合い拒絶 3 原則 双方向適用 + 対等運用 §1.0 第 6 条件(対ヤス双方向鬼コーチ)の正面実装。

### 2-D. 重要度判定の二軸ハイブリッド(案 γ)

監督官 A がアジェンダ起案時に重要度を二軸判定:

| 軸 | 高判定基準 |
|---|---|
| **Trigger 種別軸** | T1 / T4 / T7 / T8 / T9(上記表) |
| **影響範囲軸** | 哲学層改訂 / Phase 移行 / shared state 大規模変更 / 司令官 α / 工場長への発令を伴う |

**OR 判定**: どちらかが「高」 → ヤス介入閾値発火 = 承認 / 異論 / 揺らぎ起こし三択。

両軸とも「中」or「低」 → 監督官 A 自律 + 事後通知(L1 回覧板)。

### 2-E. 自己保全バイアス回避の物理装置化

監督官 A が「これは中だから自律」と判定する場合の自己保全バイアス検出:

- auto-evt-recorder R10 候補(将来): 連続 N 回「中」判定 + ヤス介入閾値発火ゼロ → 警告
- 月次接続率監査: ヤス介入頻度 vs 円卓会議開催頻度 の比率を観察(< 10% は自律過剰、> 50% は介入過剰)
- 動的均衡目標: ヤス介入頻度 約 20-30%(円卓会議開催 10 件のうち 2-3 件)

---

## §3. 役員会開催フロー(5 段階)

```
段階 1: Chairman アジェンダ起案
  - 監督官 A が両リポジトリ + 失敗ログ集約結果(aggregate-failure-logs.ps1)を調査
  - アジェンダ md 起案: archive/board_council_minutes/{YYYYMMDD}_{topic}_council.md
  - 入力: 該当 EVT + 司令官応答 + 工場長活動 + 関連 path
    ↓
段階 2: Gemini 発散 + Devil's Advocate
  - アジェンダを Gemini に提示(Yasu 経由 or API 直接)
  - Gemini 出力: 構造的反論 + 「絶対禁忌」抵触チェック + 偵察結果(他リポジトリ観察)
  - 議事録に Gemini 発言追記
    ↓
段階 3: ChatGPT 収束
  - Chairman + Gemini の意見を ChatGPT に提示
  - ChatGPT 出力: 統合案 + 矛盾点抽出 + 各案の trade-off 整理
  - 議事録に ChatGPT 発言追記
    ↓
段階 4: Chairman 最終決裁
  - 監督官 A が Gemini + ChatGPT の意見を受領 + 構造的根拠 で採択判断
  - 決裁: JSON 形式 (decisions[] 配列、工場長 board_meeting と同型)
  - B-番号採番(P-番号体系 と並列)
    ↓
段階 5: 物理装置反映
  - 採択された決裁を実装 (規範層改訂 + 物理装置起案 + 発令 + L2 区報等)
  - 議事録末尾に「実装済み」マーキング
  - archive/board_council_decisions.md に B-番号台帳追記
```

---

## §4. 議事録フォーマット

### 4-A. 配置先

```
archive/board_council_minutes/
├ {YYYYMMDD}_{topic}_council_001.md
├ {YYYYMMDD}_{topic}_council_002.md
└ ...
```

### 4-B. frontmatter 必須

```yaml
---
council_id: council_{YYYYMMDD}_{topic}_{NNN}
date: 2026-04-29
chairman: claude_supervisor_A
gemini_called: true | false
chatgpt_called: true | false
agenda_topic: {topic_slug}
trigger: T1 | T2 | T3 | T4 | T5 | T6
related_evts: [EVT-XXX, ...]
related_orders: [N, ...]
discussion_scale: small | medium | large
decision_count: <最終決裁件数>
b_numbers: [B-001, B-002, ...]
---
```

### 4-C. 本文構造

```markdown
# Council {ID}: {topic}

## §1. 起案趣旨(Chairman)
## §2. アジェンダ(Chairman 起案)
## §3. Gemini 発散 + Devil's Advocate
## §4. ChatGPT 収束
## §5. Chairman 最終決裁(B-番号付き JSON 出力)
## §6. 構造的根拠(採択判断の根拠 = sp500_theory / 関係性ポリシー / ガレージドクトリン 等)
## §7. 実装計画(物理装置反映の手順)
## §8. 関連参照
## §9. 改訂履歴
```

---

## §5. B-番号管理規律(communication_protocol.md §3.2-A-0 P-番号管理規律と同型)

### 5-A. B-番号台帳

`archive/board_council_decisions.md` に台帳維持:

```
B-001: <決裁内容>(council_{date}_{topic}_001 由来、{date} 採択)
B-002: <決裁内容>(council_{date}_{topic}_002 由来、{date} 採択)
...
```

### 5-B. registry 化

`sync/sync_script/_helpers/b_number_registry.json` 起案候補(p_number_registry.json と同型、auto-evt R7 拡張)。

### 5-C. 採番ルール

- 連続整数(B-001, B-002, ...)
- 重複禁止(EVT-021 同型再発防止)
- 起案前 grep + Test-Path 確認義務

---

## §6. 物理装置(段階的起案)

### 6-A. v0.1 = 本ステップで起案(skeleton)

| 装置 | 状態 |
|---|---|
| `operations/board_council_protocol.md` v0.1 | ✅ 本ファイル(規範層)|
| `sync/sync_script/invoke-board-council.ps1` v0.1(skeleton)| 🟡 後続ステップ起案候補 |
| `archive/board_council_minutes/` ディレクトリ | 🟡 後続ステップ起案候補 |
| `archive/board_council_decisions.md`(台帳)| 🟡 後続ステップ起案候補 |
| `_helpers/b_number_registry.json` v0.1 | 🟡 将来候補 |

### 6-B. v0.2 = 実機 API 連携(Phase B-α 起動後候補)

- Gemini API 直接呼び出し機構(notify-yasu-email と同型構造、Yasu setup 必要)
- ChatGPT API 直接呼び出し機構(同上)
- 議事録自動生成

### 6-C. v0.3 = Layer 0 統合(Phase B-γ 移行後候補)

- auto-evt R5/R6/R8 連動 → 自動 T1 trigger 発動
- Layer 0 6h サイクル内で緊急役員会自動開催
- 議事録 + 決裁を Layer 0 prompt context に注入

---

## §7. 即時運用候補(EVT-025 第 1 議題)

本日朝末の EVT-025(司令官 α 5 件 DO-COMMON-* 自己起案忘却 + 規範違反 + 三者認識ズレ)= 3AI 役員会の **最初の議題候補**:

### 7-A. アジェンダ案

```
council_20260429_evt025_response_001.md
agenda_topic: EVT-025 司令官 α 自己起案忘却 + 三者認識ズレの構造的訂正方針
trigger: T1(EVT-025 severity red)
```

### 7-B. 想定議論

- **Gemini Devil's Advocate**: 「(a) 採用は司令官 α 規範違反を黙認することにならないか?」「工場長着手継続は dream-mode 過剰崇拝ではないか?」「commander archive/error_patterns.md 起案要請を L2 区報経由 = 司令官 α が無視する可能性は?」
- **ChatGPT 収束**: 「(a) 採用 + commander archive 起案 + role_execution_rubric 軸 1 強制採点 = 三層対応で黙認回避」「sp500_theory §1 運動性継承 vs §5 永続承認禁忌の二段階対応」
- **Chairman 最終決裁(B-001)**: ChatGPT 収束案に基づき採択 = (a)+ commander archive 起案要請 + 軸 1 強制採点を **同時実施**

### 7-C. 本日朝末監督官 A 単独判断との比較

監督官 A 単独判断(本日朝末): (a) 採用 + L2 区報経由起案要請(commander archive)
3AI 役員会想定判断: (a) 採用 + commander archive 起案要請 + 軸 1 強制採点 = **+1 件の構造的補強**

3AI 役員会導入で **判断品質が +1 件分向上** する見込み = ヤス提案の構造的妥当性実証。

---

## §8. 関係性ポリシー §3.2 + §3.3 整合性

### 8-A. §3.2 関係マトリクス

監督官 ↔ 司令官 ↔ 工場長 = 内部三者(関係性ポリシー §3.2 主体)
監督官 ↔ Gemini / ChatGPT = 外部役員召集(§3.2 関係外、Yasu 経由 or API 直接)

### 8-B. §3.3-a ヤス再介入条件との関係

3AI 役員会で 2 往復未収束 = 従来通り §3.3-a 該当 = ヤス判定送り。
ただし 3AI 役員会で **結論到達率向上** = §3.3-a 該当頻度低下 = Yasu 介入頻度低下 = 完全自律化への接近。

### 8-C. 馴れ合い拒絶 3 原則 第 2 項「揺らぎ」の物理装置化

- 第一経路: 関係性ポリシー §馴れ合い拒絶 3 原則(規範層)
- 第二経路: auto-evt-recorder R1-R8(物理装置層、Day 131 朝末完成)
- **第三経路**: **3AI 役員会**(本プロトコルで導入)= 外部視点の物理装置化

---

## §9. EVT 系列との関係

3AI 役員会導入 = ガレージドクトリン §1.5 連鎖正面解決パターン第 6 例実証候補:

```
工場長側装置観察(神の談義モード = teams_council.ts + board_meeting)
    ↓ ガレージ放置発見(本ステップ)
監督官側応用設計(本プロトコル v0.1)
    ↓
v0.1 → v0.2(実機 API 連携、Phase B-α 起動後)
    ↓
v0.2 → v0.3(Layer 0 統合、Phase B-γ 移行後)
    ↓
真問題発見 + 即時是正(運用実績で発覚する盲点 → 同型解決パターン)
```

---

## §10. 関連参照

- 起案契機: ヤス提案(2026-04-29 / Day 131 朝末)
- 工場長側既存機構:
  - `factory#tools/lib/teams_council.ts`(DO-FACTORY-281)
  - `factory#tools/commands/board_meeting_prompt_round_chairman.ts`(DO-FACTORY-250)
  - DO-FACTORY-360(委員長システム + Devil's Advocate)
- ガレージドクトリン: `operations/role_and_conduct.md` §1.5(本プロトコル起案動機 = 工場長側既存装置の監督官側応用)
- 関係性ポリシー: `01_relationship/policy_v1.2.md` §3.2 + §3.3 + §馴れ合い拒絶 3 原則
- 哲学的根拠: `00_origin/sp500_theory.md` §1(運動性継承)+ `00_origin/principles/20260427_distilled.md` §5(自己保全バイアス警戒)
- 関連 EVT: EVT-013(形式採択 23 連発)+ EVT-026(鬼コーチ責務放棄)= 本プロトコル導入による構造的再発防止

---

## §11. 改訂履歴

- v0.1(2026-04-29 / Day 131 朝末): 初版起案、監督官 instance A(Chairman 役)起案。ヤス提案契機の即時採択 + 工場長側既存機構同型応用 + 5 段階フロー + B-番号管理規律 + EVT-025 即時運用候補 + 段階的実装計画(v0.1 skeleton → v0.2 実機 API → v0.3 Layer 0 統合)。発令ペース 0 件運用維持下の規範層採択(P-番号体系外)。
