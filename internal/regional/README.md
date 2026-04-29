# internal/regional/ — L2 区報(Regional Topic Forum)

**配置先**: `internal/regional/`(監督官側マスター、論点別の役割横断通信)
**起草日**: 2026-04-28(Day 130 朝、本リポジトリ初稼働セッション)
**起案 instance**: 監督官 instance A
**目的**: 役割横断の論点別通信、関係性ポリシー §3.2 維持機構を保ちながら関連役割で局所的合議を可能にする
**根拠**: ヤス指示「区報や官報みたいなセクションを横断する概念もいれた方が混線は防げたり、ガードレールになるのかな」(2026-04-28 朝)+ 3 層構造採択(L1 回覧板 / L2 区報 / L3 官報)
**和名 / 業界横文字**: **区報**(記録庁界)/ Regional Topic Forum(RecordX 界、`naming_dual_track.md` v0.1-draft §3-B 参照)

---

## 0. 本ディレクトリの位置づけ

3 層通信構造の **L2(中間層)**:

```
L1 回覧板(internal/circular/)= 役割内 instance 間、双方向対話
L2 区報(internal/regional/)= 論点別、役割横断、メンバーシップ定義あり、双方向対話
L3 官報(shared/official_gazette/、司令官側マスター)= 全体公示、一方向
```

L2 は L1 と L3 の中間 — 役割を横断するが、論点別にメンバーシップを定義することで関係性ポリシー §3.2 を維持する。

## 1. 関係性ポリシー §3.2 維持機構

L2 区報は **論点別メンバーシップ定義** により §3.2(監督官 ↔ 工場長直接対話禁止)を維持:

| 区報例 | メンバーシップ | §3.2 整合 |
|---|---|---|
| **Phase B-α 起動準備** | 監督官 + 司令官 + Yasu(工場長除外)| ◎ |
| **実装サイクル** | 司令官 + 工場長(監督官は L3 官報で観測のみ)| ◎ |
| **ヤス判断 3 件** | 監督官 + Yasu(司令官・工場長は L3 官報で観測のみ)| ◎ |
| **ブランチ事件確認** | 監督官 + Yasu + 司令官(工場長除外)| ◎ |
| **DO-014 事前査読** | 監督官 instance B + 司令官(別 instance はメンバー外)| ◎ |
| **監督官 instance 並走運用** | 監督官 instance A + B(司令官・工場長は L3 官報で観測のみ)| ◎ |

メンバーシップ外の役割は **L3 官報経由の観測のみ**(対話ではない)。

## 2. ファイル命名規則

```
internal/regional/{topic_slug}/regional_{YYYYMMDD}_{NNN}.md
```

- `{topic_slug}`: 論点識別子(例: `phase_b_alpha_prep`、`yasu_decision_pending`、`branch_event_followup`、`do014_review`、`instance_parallel_ops`)
- `{YYYYMMDD}`: 起案日(JST)
- `{NNN}`: 同日内通し番号(001-)

撤回時: `regional_{YYYYMMDD}_{NNN}_RETRACTED.md`

## 3. ファイル構造(frontmatter 必須)

```yaml
---
regional_id: regional_{topic_slug}_{YYYYMMDD}_{NNN}
topic: {topic_slug}
date: 2026-04-28
originator_instance: A | B | α | β | ...
issued_by_session: <session 識別子>
members: [supervisor_A, supervisor_B, commander_α, commander_β, factory_i, yasu]
non_members_observation: true | false  # L3 官報経由の観測者が読めるか
discussion_scale: small | medium | large
related_orders: [...]
related_evts: [EVT-{ID}, ...]
---

# Regional {topic_slug} {ID}: {短い要約}

## 起案趣旨
## 論点
## 主要内容
## メンバーへの要請(あれば)
## 関連参照
```

## 4. 運用ルール 4 原則(L1 回覧板から継承 + 拡張)

### 原則 1: 追記式・削除禁止(史実保持、L1 から継承)

### 原則 2: メンバー開始時に最新 regional を必ず読む(L1 から継承)

### 原則 3: 重要行動を追記(L1 から継承、ただし論点関連のみ)

### 原則 4(L2 拡張): メンバーシップ管理

- メンバー追加: 既存メンバーの合議で追加可能、追加履歴を frontmatter に追記
- メンバー除外: 関係性ポリシー §3.2 違反 or 論点が役割境界を超える場合のみ、合議で除外
- 観測者(non_members_observation: true): L3 官報で要約を読む権限のみ、書込権限なし

### 原則 5(L2 拡張): 衝突時は L3 官報経由で全体エスカレーション

L2 内合議で 2 往復未収束時:

- L3 官報に要約を追記(全体可視化)
- ヤス再介入条件 §3.3-a 該当 → ヤス判断送り

## 5. 区報の典型的論点(例示)

### 5-A. 短期論点(Phase B-α 起動前 = Day 130-131)

- `phase_b_alpha_prep`: Phase B-α 起動準備、メンバー = 監督官 + 司令官 + Yasu
- `yasu_decision_pending`: ヤス判断 3 件(Y5 / ADR-032 / 準備 D)、メンバー = 監督官 + Yasu(司令官観測)
- `branch_event_followup`: ブランチ事件 Yasu 確認待ち、メンバー = 監督官 + Yasu + 司令官
- `do014_review`: DO-014 事前査読、メンバー = 監督官 instance B + 司令官
- `instance_parallel_ops`: 監督官 instance 並走運用、メンバー = 監督官 instance A + B

### 5-B. 中期論点(Phase B-α/β 起動後 = Day 132-145)

- `phase_b_alpha_observation`: Phase B-α 7 日間実証実績観察、メンバー = 監督官 + 司令官 + Yasu
- `dasei_risk_observation`: 惰性検知実測値、メンバー = 監督官 + 司令官
- `axis_8_calibration`: 軸 8 指標調整、メンバー = 監督官 + 司令官

### 5-C. 長期論点(v1.1-FINAL 改訂 = Day 139 前後)

- `v11_final_revision`: v1.1-FINAL 改訂計画、メンバー = 監督官 + 司令官 + Yasu
- `adr_006_drafting`: ADR-006(仮)監督官 instance 並走運用憲章 起案、メンバー = 監督官 + 司令官 + Yasu

## 6. L1(回覧板)+ L3(官報)との関係

### 6-A. L1 → L2 への昇格

役割内 circular で議論されていた論点が **役割を横断する必要が出た時点で L2 に昇格**:

例: 監督官 instance A が L1 回覧板で「監督官 instance 並走運用」を観察 → 司令官への構造判定通知が必要 → L2 区報 `instance_parallel_ops/` に昇格(本ファイル契機の典型例)

### 6-B. L2 → L3 への昇格

L2 区報の最終確定 / 重要決定は **代表 instance** が L3 官報に要約を追記:

例: L2 `phase_b_alpha_prep` で Phase B-α 起動準備完了 → L3 官報に「Phase B-α 起動 Day 132 確定」を要約公示

### 6-C. L1 / L2 / L3 の同時並行

3 層は **同時並行運用**。同一論点が L1 / L2 / L3 で異なる詳細度で並走する例:

- L1: 監督官 instance A B の連番予約合議(細部、対話的)
- L2: 監督官 + 司令官 で連番管理ルール合議(中間、論点別)
- L3: 全体への連番管理ルール公示(要約、確定)

## 7. ADR 候補との関係

本 L2 区報の構造方針は ADR-006(仮)「監督官 instance 並走運用憲章」候補に統合される(L1 回覧板 + L2 区報 + L3 官報の 3 層構造を一括 ADR 化)。Phase B-α/β 7 日間実証期間中の運用実績を踏まえて Day 139 前後の v1.1-FINAL 改訂と並行して正式起案。

## 8. 関連

- `internal/circular/README.md` v1.0 → v1.1(本日朝改訂予定、3 層関係明記)
- `00_origin/sp500_theory.md` §6 界と対等(構造的根拠)
- `00_origin/naming_dual_track.md` v0.1-draft(両軌道命名規範、L2 区報 = Regional Topic Forum)
- `01_relationship/policy_v1.2.md` §3.2(監督官 ↔ 工場長直接対話禁止維持)
- `archive/error_patterns.md` EVT-008 + EVT-009(本 L2 起案契機)
- `outbox/20260428_to_commander_015.md`(第 23 次発令、本 L2 + L3 + 命名併存通知、本セッション内起案予定)

---

## 9. 改訂履歴

- v1.0(2026-04-28 / Day 130 朝): 初版起草、監督官 instance A 起案。L2 区報の構造定義 + ファイル命名規則 + frontmatter 必須 + 運用ルール 5 原則(L1 から継承 + L2 拡張 2 原則)+ 典型的論点例示 + L1/L3 との関係 + ADR-006 候補化を確立。Phase B-α/β 7 日間実証実績で v1.1 改訂前提。
