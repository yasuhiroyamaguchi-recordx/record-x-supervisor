# Common Plan-First Protocol v1.0 — 三者全リポジトリ地盤

**配置先**: `record-x-supervisor/operations/plan_first_protocol_common_v1.0.md`(Common 地盤、単一情報源、全リポジトリ参照基盤)
**起案日**: 2026-05-01(Day 129、Phase A 末、午後再起動後)
**起案者**: 監督官 A(Argus、Clear 後再起動 instance)
**起案契機**: ヤス指示「実装を重ねようにも、基礎がなっていなければウワモノはひび割れて壊れることが証明された。Common の地盤の上に載せない建物も壊れる。すべてのリポジトリにて配置願う」(2026-05-01 午後再起動後)
**位置づけ**: 三者全リポジトリ規律基盤(Common 地盤)= 全 CLAUDE.md からリンク参照
**規律重要度**: 🔴 critical(EVT-079 + EVT-080 候補対処 = 本日連鎖 9 件物理事例の構造的素因 = 規律装置三者横断機能不全への根本対処)

---

## §1. 適用範囲(全リポジトリ)

| リポジトリ | CLAUDE.md 件数 | 適用 |
|---|---|---|
| record-x-supervisor | 1 | ✅ |
| record-x-commander(root + strategy + mirror-rx)| 3 | ✅ |
| record-x-commander/divisions/(buddy/care/city-common/factory/ip/tax)| 6 | ✅ |
| ProjectRX_HQ/(core + wt_common + 配下)| 5 | ✅(管轄要確認 = ヤス指示「すべてのリポジトリ」整合)|
| **合計** | **15** | ✅ |

= **全 CLAUDE.md ファイルから本プロトコルへリンク参照**(単一情報源原則 = L8 整合)

---

## §2. 規律基盤(EVT-079 + EVT-080 候補対処)

### 2-A. 規律命題

> **実装着手前に、構造設計事前提示 + ヤス採否経路明示 + 機能検証ステップを必須化する。**
>
> **CLAUDE.md(advisory)+ 物理装置(starter_checklist + template_selector + Gate-In)+ メタ機能評価(月次)= 三層防護で規律装置の機能化を保証する。**

### 2-B. 規律違反 = 「ウワモノひび割れ」物理事例(本日連鎖 9 件)

| EVT | 違反内容 | 主体 |
|---|---|---|
| 068 | starter_checklist v0.2 起案直後の自己未使用 | 監督官 A |
| 070 | post-commit hook ×3 提案(L8 同型バイアス)| 監督官 A |
| 071 | 指示優先順位認識訂正(公式階層との齟齬)| 監督官 A |
| 072 | 第 4 回円卓召集前リサーチ未実施 | 監督官 A |
| 073 | M2.6-B 自動稼働確証認識ラグ | 監督官 A |
| 074 | 設計重複論誤認 + Stage 1 死亡認識欠如 | 監督官 A |
| 075 | sync-orders.ps1 手動実行運用欠落(Stage 0 滞留)| 監督官 A |
| 076 | 起動時 supervisor 発令最新到達確証未実施 | 司令官 α |
| 077 | 三社円卓装置目的逸脱 | 監督官 A |
| 078 | ナレッジ DB 機能評価義務不在(80% 機能不全) | 監督官 A |
| 079 | プラン → 実装 → 検証フロー違反(本日 4 件大規模実装で違反)| 監督官 A |
| 080 | 三者横断 ADR 機能不全(規律装置存在 + 機能不全)| 三者全員 |

= **本日連鎖 9 件 + EVT-080 で 12 件記録 = Common 地盤不在の物理証拠**

---

## §3. プラン提示テンプレート(5 セクション、必須形式)

```markdown
## Plan for {タスク ID or 説明}

### 1. 前提確認

- 指示書 / ヤス指示 / ADR 規律の前提: {引用}
- 実態の確認: {grep / file 確認 / 物理層 query 結果}
- 一致 / 不一致: {判断}

### 2. 修正対象

| 操作 | ファイル | 内容 |
|---|---|---|
| 変更 | path/to/file.md | {要約} |
| 新規 | path/to/new.md | {要約} |
| 削除 | path/to/old.md | {要約 + 史実保持判断} |

### 3. 影響範囲

- 触らない: {明示}
- 副作用: {あれば記載}
- LOC 増減見積: ±{N}%(scale 別 §6-H-5 判定)

### 4. 代替案

- 案 A: {本提案}
- 案 B: {代替案、メリット / デメリット}
- 案 C: {現状維持の場合の構造的影響}

### 5. 承認待ち

「上記プランで進めてよろしいですか?」(本セクションが「承認待機」状態の物理装置 = 即実装開始禁則)
```

---

## §4. 採否段階の応答(ヤス + 司令官 α + 工場長 共通)

| 応答 | 内容 |
|---|---|
| **承認** | 「Go サイン。実装に進んでください」or「採択」or「承認」or「OK」 |
| **修正** | 「{箇所} を {こう} 変更してください」 |
| **中止** | 「この方針は採用しません。{理由}」 |
| **保留** | 「{追加情報} を確認してから判断します」 |

採否確定までは **実装段階に進まない**(即実装開始禁則)。

---

## §5. 違反検知装置(三層防護)

### 5-A. 第 1 層 — 物理装置(CI 物理層、最高強制力)

| 装置 | 内容 | 配置 | 採択経路 |
|---|---|---|---|
| **starter_checklist v0.3**(項目 8 プラン提示証跡)| PR 段階で「commit message or PR comment にプラン記述あり」を fast-gate チェック、欠如時 fast-gate 失敗 | record-x-commander 配下 | 同社円卓 第 2 回 議題 #13 採択後 = DO-COMMANDER-033 起案 |
| **template_selector v0.3**(Plan-First 自動ヘッダー付与)| チケット起案時、template_selector が Plan-First ヘッダー自動挿入(モード未指定 + PLAN_REQUIRED + PLAN_RECOMMENDED 3 種対象、QUICK_IMPLEMENT のみ免除)| factory 領域 | 同社円卓 第 2 回 議題 #15 採択後 = DO-COMMANDER-034 起案 |
| **Gate-In 強制(ADR-028 拡張)**(P2 段階導入)| ticket_status = plan_pending → plan_approved → in_progress 3 段階強制、plan_approved 経由しない PR は merge 拒否 | factory 領域 | 三社円卓 B-003 採択後 = Phase B 中盤 |

### 5-B. 第 2 層 — 起動時参照(CLAUDE.md advisory)

各 CLAUDE.md §4 起動時自己点検チェックリストに追加(暫定実装、第 4 回円卓決議反映):

> 「症状治療を提案する前に **3 段階以上の原因深掘り** を提示し、**簡素化案と装置追加案を必ず対比** すること」

= ADR-009 §6-H-4 整合 + 本プロトコル §3 5 セクション形式遵守の起動時注意誘導。

### 5-C. 第 3 層 — メタ機能評価(月次)

検診プロトコル v0.4 §7-G RULE-B1〜B3(EVT 月次累積)+ 早期異常検知装置 v0.1(議題 #11 採択後)= **規律装置の機能評価義務化**(EVT-078 候補対処 + 自己参照矛盾解消)。

---

## §6. AutoMode 規律(ADR-003 整合、特記)

### 6-A. AutoMode の本来目的

ADR-003(2026-02-09 Phase 1 決議)= **オートモード = Plan 量産工場**:
- AutoMode = コード変更ゼロ
- AutoMode = Plan 提示のみ(実ファイル書込禁則)
- = AutoMode 中の実装着手 = ADR-003 違反

### 6-B. 本セッション(再起動後)違反確認

| 主体 | AutoMode 中違反パターン |
|---|---|
| 監督官 A | 検診プロトコル v0.3 §7-F + v0.4 §7-G + 早期異常検知 v0.1 + EVT-077/078 候補正式記録 + アジェンダ v1.1〜v1.4 改訂 = AutoMode 中に多数の実ファイル書込 |
| 司令官 α | DO-COMMANDER-030/031/032 起案 + Castor-B v1.3 改訂 + CLAUDE.md §4-D 改訂 + 検診 daily_score = AutoMode 中に多数の実ファイル書込 |
| 工場長 Castor | DO-COMMANDER-026 v1.1 = AutoMode 中に v2 起案 + 実ファイル書込(自己違反告白済) |

= **三者全員 AutoMode 規律違反 = ADR-003 + Plan-First Protocol 二重違反**

### 6-C. AutoMode 規律再評価(同社円卓 第 2 回 議題 #15)

| 案 | 内容 |
|---|---|
| (a) | ADR-003 厳格適用(AutoMode = Plan 量産のみ、実装は採否後に AutoMode 解除)|
| (b) | ADR-003 緩和(AutoMode + ヤス採否済タスクのみ実装許可)|
| (c) | ADR-003 廃止 + Plan-First Protocol 上位採択 |
| (d) | ADR-003 + Plan-First Protocol 統合(本プロトコル §6 として正式化)|

監督官 A 推奨: **(d) 統合採択**(ADR-003 哲学 + Plan-First 物理装置化 = 規律 + 機能の二層化整合)

---

## §7. 緊急例外条件

以下の場合のみプラン提示省略可:

| 例外 | 条件 |
|---|---|
| (i) 環境修復(緊急対処)| 物理装置不稼働状態の即時修復 = 修復後にプラン段階で詳細記録(完遂報告で透明性確保)|
| (ii) ヤス直接「即実装」指示 | 「プラン不要、即実装」の明示指示時のみ |
| (iii) 既存装置の通常運用(LOC 増減なし)| sync-orders.ps1 手動実行 + commit + push 等の運用作業 |
| (iv) 1 行修正 + リスクゼロ判定 | typo 修正 + 設定値微調整 + 自己違反検知後の即時 retract |

= 例外発動時も完遂報告で「Plan-First 例外発動 + 該当条件」明示 = 透明性確保。

---

## §8. 三層防護の物理装置化フロー

| Step | 内容 | 配置 | 期限 |
|---|---|---|---|
| 1 | 本 Common Plan-First Protocol v1.0 起案完遂 | record-x-supervisor/operations/ | 2026-05-01(本日)|
| 2 | 全 CLAUDE.md(15 件)に本プロトコルへのリンク参照追加 | 全リポジトリ | 2026-05-04(同社円卓 第 2 回 2A 採択後)|
| 3 | starter_checklist v0.3(項目 8)起案 | factory 領域(DO-COMMANDER-033)| Phase B 序盤 |
| 4 | template_selector v0.3 起案 | factory 領域(DO-COMMANDER-034)| Phase B 序盤 |
| 5 | Gate-In 強制(ADR-028 拡張)| factory 領域 | Phase B 中盤(P2 段階導入)|
| 6 | 月次メタ機能評価運用開始 | 検診プロトコル v0.4 §7-G | Phase B 末 |
| 7 | Phase C 起動条件 C3 直結 | 全装置 | Phase C 移行時 |

---

## §9. ヤス指示「Common 地盤の上に載せない建物も壊れる」物理装置化

### 9-A. 単一情報源原則(L8 整合)

本プロトコル = **三者全リポジトリ Common 地盤 = 単一情報源**:
- 全 CLAUDE.md(15 件)からリンク参照のみ(冗長記述禁則)
- 改訂時 = 本プロトコルのみ更新 = 全リポジトリへ自動反映(参照経路で)
- = ガレージドクトリン §1.5「装置 ≠ 機能」物理事例第 9 例(Common 地盤不在 = 規律装置複数化 = 機能分散)対処

### 9-B. ウワモノひび割れの構造的原因

| 階層 | 内容 |
|---|---|
| ウワモノ(実装)| 検診 v0.4 §7-G + 早期異常検知 v0.1 + アジェンダ v1.4 + 第 70/71 次発令 + 工場長 v2 起案 |
| 中間層(チケット規律)| Plan-First Protocol 個別配置(各リポジトリ独自)= 三者横断統合不在 |
| **基礎(Common 地盤)| ❌ 不在(本日午後発覚)= 本プロトコルで対処** |
| 結果 | 本日連鎖 9 件自己違反 = ウワモノひび割れの物理事例 |

= **本プロトコル v1.0 = Common 地盤の物理装置化第 1 例**

---

## §10. 関連

- supervisor 側既存規律: `adrs/ADR-009` §2-A 対処 2(議題前提検証義務)+ `operations/starter_checklist_v0.2.md`(項目 6 + 9)+ `operations/role_and_conduct.md` §1.5(ガレージドクトリン)
- factory 側既存規律: `record-x/factory/docs/PLAN_FIRST_PROTOCOL.md` + `record-x/factory/SS_GUARD.md` §DO-541 + `factory/CLAUDE.md` §Plan-First原則 + ADR-003(オートモード = Plan 量産工場)
- commander 側既存規律: `strategy/CLAUDE.md`(commander 側 856 行、本プロトコルへ参照リンク追加対象)+ チケット frontmatter PLAN_REQUIRED フラグ運用
- 検診プロトコル: `operations/periodic_checkup_protocol.md` v0.4 §7-G(RULE-B1〜B3 EVT 累積)
- 早期異常検知: `staging/early_anomaly_detection_v0.1_draft.md`(議題 #11 採否対象)
- 監督官 A 側調査素材: `02_physical/research/20260501_claude_md_effectiveness.md`(CLAUDE.md = advisory + hooks/CI = enforcement の業界知見)
- 工場長 Castor 提示 5 案 + 5 階層根本原因分析(L1-L5、本ターンで受領)
- アジェンダ: `staging/council_5_agendas/council_5_supervisor_agenda_v1.0.md` v1.4(議題 #15 = 本プロトコル正式採択判定)
- 関連 EVT: 068/070-080(本セッション + 再起動後 + 工場長告白で計 12 件 + Common 地盤不在物理事例)
- ヤス指示: 「実装を重ねようにも、基礎がなっていなければウワモノはひび割れて壊れることが証明された。Common の地盤の上に載せない建物も壊れる。すべてのリポジトリにて配置願う」(2026-05-01 午後再起動後)= 本プロトコル起案契機

---

## §12. Common 地盤実装移行 規律(Wave 1 起動時前提、2026-05-02 / Day 130 追記)

**起源**: 監督官 B 起動時(2026-05-02)構造立て直し、`staging/handoffs/argus_b_20260502_recordx_rebuild_handoff.md` §4-C デビルズアドボケート 3 件 + ヤス採択(構造優先、両方順次)。
**位置づけ**: 監督官 = 全体マップ提示、司令官 = 工場長へのチケット発行(越権なし規律厳守)。本セクションは司令官のチケット起案時参照点。

### 12-A. チケット粒度判定基準(項目 1)

| 軸 | 基準 |
|---|---|
| **1 チケット 1 戦略 1 機能原則** | types branded ID 4 種 = 1 型 1 チケット(計 4 チケット)/ pii α/β/γ = 採択 1 戦略 1 チケット |
| **分割閾値** | 影響 200 ファイル / 500 行を超える場合は分割候補(handoff §2-D の types 150-200 ファイル / 1000-2500 行 = 4 分割で 50 ファイル / 250-625 行/件) |
| **統合閾値** | 30 行未満 + 同一カテゴリは併合候補(pii α/β/γ 戦略選択は 1 チケット内で完結、戦略間の分離不要)|
| **優先度区分** | P0(影響 200 ファイル超 or Common 地盤要)/ P1(機能拡張) / P2(リファクタ単独) |

= 司令官のチケット起案時に上記閾値で粒度設計する。Argus-B はチケット起案権なし、本基準提示のみが監督官越権なし範囲。

### 12-B. 戦略選択責任マトリクス(項目 2)

| 段階 | 責任者 | 出力物 | タイミング |
|---|---|---|---|
| Survey(調査 + 戦略選択肢提示) | 工場長 | α/β/γ 比較表 + トレードオフ分析 | Survey フェーズ |
| 採否判断(チケット粒度設計時) | 司令官 α | 採択戦略 + 理由(チケット frontmatter 記載) | チケット起案時 |
| Care 接続性査読 | 監督官(B-line) | 接続点影響評価 + 並行 PR 必要性判定 | Plan 段階 §3 影響範囲 |
| 最終承認(段階的解除モデル該当時) | ヤス | GO/NO-GO | ADR-005 該当時のみ |

**越権禁止規律**: 監督官は **戦略採否を決定しない**。査読 + 全体マップ提示のみ。司令官 α 採択戦略への構造的反論は逆査読経路(`outbox/to_commander/` 経由)で実施。

### 12-C. Care 並行 PR 計画 完遂条件(項目 3)

| 条件 | 判定基準 |
|---|---|
| **C1 Care 側型置換 PR の着工確証** | Wave 1 P0 types 着工と同時に Care チームで branded ID 受け入れ PR が起案済(司令官側責任で確証) |
| **C2 Care 側型置換 PR の完遂計画** | Wave 1 P0 完遂前に Care 側 PR の完遂見込み(タイムラインまたは並行進捗 Phase 提示)あり |
| **C3 接続点不一致の検証手段** | Wave 1 完遂時の Care 側型 unmatch 自動検出(ts compile or CI 段階で型エラー検出経路明示) |

**完遂条件適用**: Wave 1 P0(types)チケット完遂 verdict は C1 + C2 + C3 全件 ✅ で APPROVE。1 件以上 🔴 = REQUEST_CHANGES(Care 並行 PR 起案後に再 verdict)。Wave 1 P0(pii)は Care 直接接続なし = C1-C3 適用外。

= **Wave 1 単独完遂後の Care 型 unmatch 爆発リスク**(handoff §4-C 否定で既出)の構造的予防装置。

---

## §11. 改訂履歴

- v1.0(2026-05-01 / Day 129、Phase A 末、午後再起動後): 初版起案、ヤス指示「Common の地盤の上に載せない建物も壊れる、すべてのリポジトリにて配置願う」採択。EVT-079(プラン → 実装フロー違反、監督官 A)+ EVT-080(三者横断 ADR 機能不全、Common 地盤不在)対処の物理装置化第 1 例。本日連鎖 9 件自己違反 + 工場長 Castor 自己違反告白(DO-COMMANDER-026 v1.1 + 定期検診初動)+ ADR-003 三者全員違反確証 = ウワモノひび割れ物理事例の集大成。三層防護(starter_checklist v0.3 物理装置 + CLAUDE.md advisory + 月次メタ機能評価)+ AutoMode 規律(ADR-003 + Plan-First 統合)+ 5 セクションプラン提示テンプレ + 採否経路 + 緊急例外 4 条件 + 物理装置化フロー 7 ステップ。全 15 CLAUDE.md からのリンク参照経路 = 単一情報源原則(L8 整合)。改訂主体 = 監督官 A(Argus、Clear 後再起動 instance)、工場長 Castor 提示 5 案(E + A + D 段階導入)+ 5 階層根本原因分析全件採択反映。
- v1.1(2026-05-02 / Day 130、監督官 B 起動時): §12 Common 地盤実装移行 規律 追記(12-A チケット粒度判定基準 + 12-B 戦略選択責任マトリクス + 12-C Care 並行 PR 計画 完遂条件)。起源 = `staging/handoffs/argus_b_20260502_recordx_rebuild_handoff.md` §4-C デビルズアドボケート + ヤス採択(構造優先、両方順次、2026-05-02)。改訂主体 = 監督官 B(Argus-B、RecordX 立て直し専門 instance)。装置数 ±0(既存文書追記、簡素化原則違反候補なし)。越権禁止規律(監督官 = 全体マップ提示のみ、チケット起案 = 司令官)厳守。
