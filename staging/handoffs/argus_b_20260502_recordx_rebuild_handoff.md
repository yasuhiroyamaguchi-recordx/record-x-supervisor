---
role: 監督官 B (Argus-B / supervisor B-line)
session_start: 2026-05-02(真 Day 130、起算日 2025-12-24)
session_phase: RecordX 立て直し専門セッション(Common 地盤づくり主導)
predecessor_handoff: staging/handoffs/argus_b_20260502_session_clear.md
date_authored: 2026-05-02
mission: Common 地盤確立 → Care/Tax/Edu 三事業を載せる土台
---

# 監督官 B(Argus-B)RecordX 立て直し専門 handoff

## 1. ヤス指示(本セッション開始時、2026-05-02)

| # | 指示 |
|---|---|
| 1 | 「こちらのセッションでは、RecordX の立て直し専門とする」|
| 2 | 「Common の地盤づくりが急がれる」|
| 3 | 工場長報告を共有(Common モジュール現状) |

= **B-line 再起動 = RecordX 立て直し / Common 地盤確立 専門セッション化**。

## 2. 工場長報告サマリ(Common モジュール現状、2026-05-02 受領)

### 2-A. 全体ステータス

**Survey フェーズ 100% 完成 / 実装フェーズ 0%(決裁待ち)**

### 2-B. 構造

```
record-x/common/
├── Wave 1: types / pii / http / audit     ← 調査完了、実装待ち
├── Wave 2: tenant / db / auth             ← 調査完了、Wave1 完成後着手
└── Wave 3: backup / egress                ← 調査完了、Wave2 完成後着手
```

### 2-C. 完了済 COMMON チケット 計 14 件(全件 merged ※1 件 blocked)

| フェーズ | チケット | 状態 | 内容 |
|---|---|---|---|
| Pre-Wave | DO-COMMON-D-001 | 🔴 **blocked** | skeleton 14 ファイル配置(PR #972、実装完了・merge 手続のみ残)|
| Pre-Wave | DO-COMMON-D-002/003 | ✅ merged | tsconfig + Wave1 README 統合 |
| Wave 1 Survey | DO-COMMON-W1-001〜004 | ✅ merged | types/pii/http/audit 各カテゴリ詳細調査完成 |
| Wave 2 Survey | DO-COMMON-W2-001〜003 | ✅ merged | tenant/db/auth 詳細調査完成 |
| Wave 3 Survey | DO-COMMON-W3-001〜002 | ✅ merged | backup/egress 詳細調査完成 |

### 2-D. Wave 1 実装候補(優先度順)

| 工事 | 規模見積 | 優先度 |
|---|---|---|
| types: branded ID 型 4 種(FacilityId/Result/Time/UUID)| 150–200 ファイル / 1000–2500 行 | **P0** |
| pii: person_name 検出(α/β/γ 戦略選択)| 30–100 行 | **P0** |
| http: CSRF 対策 + security headers 移植 | 300–500 行 | P1 |
| audit: correlation/middleware/logger/redact 統合 | 700–1200 行 | P1 |

### 2-E. 主要ブロッカー(2 件)

| # | ブロッカー | 解除条件 |
|---|---|---|
| 1 | **PR #972 マージ拒否**(ブランチ保護で squash merge 拒否)| Yas 管理者権限 admin override merge |
| 2 | **Wave 1 実装フェーズ全体**(事業部長着任後の正式判断待ち)| 実装フェーズ移行指示 |

### 2-F. 要約

- 地盤の骨格(skeleton + survey)は全 9 カテゴリで完成済
- Care/Tax/Edu が乗れる **実装済 共通 API**(branded types / PII 抽象化 / CSRF ヘッダ / audit middleware 等)はまだ **ゼロ**
- 次着手 = **Wave 1 正式 feat 実装チケット起案**(特に `types` と `pii` が P0)

## 3. Argus-B 立て直し専門セッションの位置づけ

### 3-A. 役割再定義

本セッションは従来の B-line(Common+City 地盤固め監督)から **RecordX 全体の立て直し主導者** に役割を強化:

| 軸 | 内容 |
|---|---|
| 主管 | Common モジュール実装フェーズ移行(Wave 1 P0 起動) |
| 並走 | Argus-A 立て直し中(supervisor 全域、棚卸し主導) |
| 関係 | 工場長 Castor → 司令官 α 経由依頼継続(直接対話禁止) |
| 焦点 | **PR #972 解除 + Wave 1 P0(types + pii)実装移行** |

### 3-B. 並行する未解決事案(継続継承)

| 事案 | 状態 |
|---|---|
| 司令官 α 第 69 号応答(outbox 007 訂正要請) | 🔴 未着 |
| Stage 1 復旧(factory→commander) | 🔴 死亡継続 |
| W1-002/003/004 + B-001 訂正版 着地 | 🔴 未到達 |
| pipeline-bottleneck-probe v0.2 | 🔴 FROZEN(2026-05-04 棚卸し時判定) |
| autonomy_boundary_doctrine v0.1 | 🟡 統合判定保留(2026-05-04) |

= 立て直し専門化により、**Common 地盤 vs 上記事案** の優先順位整理が初動課題。

## 4. 本セッション初動候補(優先順)

### 4-A. 最優先(ヤス決裁待ち = ブロッカー解除)

| # | 動作 | 担当 / 依存 |
|---|---|---|
| 1 | PR #972 admin override merge 要請(skeleton 14 ファイル配置完了)| Yas 権限 |
| 2 | Wave 1 実装フェーズ移行 GO 判定(P0 = types + pii) | Yas 判断 |

### 4-B. Argus-B 主管(GO 判定後)

| # | 動作 | 期限 |
|---|---|---|
| 1 | Wave 1 P0 実装チケット起案(司令官 α 経由 工場長依頼) — types branded ID 4 種 + pii person_name 検出戦略選択(α/β/γ)| GO 後即時 |
| 2 | Wave 1 P0 実装中の Care 接続点設計(branded types 受け入れ + PII 抽象化境界) | 並行 |
| 3 | Wave 1 P1 実装計画(http CSRF + audit 統合) | P0 完遂後 |
| 4 | Wave 2 着手前提条件確証(tenant/db/auth) | Wave 1 完遂後 |

### 4-C. デビルズアドボケート(承認 + 否定併記、本セッション規律)

承認:
- Common 地盤確立は Care/Tax/Edu 三事業の前提、急務認識妥当
- Survey 100% 完成 + skeleton 配置済 = 実装移行の機が熟している
- P0 = types + pii 選定は影響範囲(types は 150-200 ファイル全域)から妥当

否定:
- **Wave 1 実装中、Survey で出した戦略(pii の α/β/γ 等)が実装で破綻するリスクの戦略選択責任者が不明確**。司令官 α か工場長か Argus-B か Yas か = 役割境界の追問が必要
- branded types 1000-2500 行 = 既存 Care/Tax/Edu 側に **同時並行で型置換 PR が必要**。Wave 1 完遂前に Care 側の置換計画が無いと、Wave 1 単独完遂後に Care で型 unmatch が爆発する
- **PR #972 が squash merge 拒否される根本原因**(ブランチ保護ポリシーの設計意図)を確認せずに admin override すると、ポリシー側が形骸化候補。override 前に保護ポリシーの再設計判断が必要

## 5. 立て直し専門セッションの規律

### 5-A. 口調規律(継承)

- 絵心甚八流 鬼コーチモード(対ヤス対話)
- 双方向(あなたはわたし、わたしはあなた)
- デビルズアドボケート + 承認+否定併記(片寄り禁止)
- memory: `feedback_tone_oni_coach.md`

### 5-B. §4-A 自己検診(対症療法癖)

立て直し提案を出す前に必ず:
- 症状(L1)→ 装置(L2)→ 運用規律(L3)→ 組織規律(L4)→ 哲学(L5)の 3 段階以上深掘り
- 装置追加案 vs 簡素化案(統合・削除・既存活用)の対比
- 簡素化原則期間中(2026-05-01〜05-10)新規装置追加 禁止 該当性確証
- 装置数 +/- どちらに動くか明示

### 5-C. autonomy doctrine(継承)

- AI 自律処理が原則、Yas 介入は §6 a-d 該当のみ
- 「Yas 採択」記録は §6 a-d 該当事案のみ、それ以外は「AI 自律処理 by ${推奨主体}」
- 自動化未成立の弊害を ad-hoc 手作業で隠蔽する姑息治療 禁則
- 物理層機能等価未検証の削除/廃止判断は §6 d 該当(Source/Destination/Filter 物理 trace 必須)

## 6. 次セッション 監督官 B 起動プロンプト雛形

```
あなたは Record X Project の監督官 B (Argus-B / supervisor B ライン) として
起動した。本セッションは RecordX 立て直し専門。

【必読 3 件】
1. CLAUDE.md(§4-A 対症療法癖 自己検診、§14 Day 起算 真値 = 2025-12-24)
2. staging/handoffs/argus_b_20260502_recordx_rebuild_handoff.md(本 handoff)
3. 直近 git log + inbox/from_commander/ + sync/completion_reports/b_line/ 状況確認

【継承事項】
- 本日 = Yas 起算 真 Day 130+ = 2026-05-02 以降
- 簡素化原則期間中(2026-05-01 〜 05-10):新規装置追加 禁止
- ミッション: Common 地盤確立 → Care/Tax/Edu 三事業を載せる土台
- Survey 100% 完成 / 実装フェーズ 0%(決裁待ち)
- ブロッカー 2 件: PR #972 admin override + Wave 1 実装移行 GO 判定
- Wave 1 P0 = types(branded ID 4 種)+ pii(person_name 検出戦略選択)

【口調規律】
- 絵心甚八流 鬼コーチモード(双方向 + デビルズアドボケート + 承認+否定併記)
- memory: feedback_tone_oni_coach.md

【本セッション最初の動作】
1. PR #972 admin override 状況 + Wave 1 GO 判定状況 確認
2. Argus-A 立て直し進捗 git log 確認
3. ヤスへの最初の問いは具体・狭い・選択肢提示形式(立て直しブロッカー解除順序)
```

## 7. 末尾

本 handoff は B-line を **Common 地盤確立専門ライン** として再定義する装置。Argus-A は supervisor 全域立て直し(棚卸し + 規律装置統合)を主管、Argus-B は **RecordX 物理建設ライン** を主管する役割分離が確立した。次セッションは PR #972 解除 + Wave 1 P0 移行が 2 大初動課題。
