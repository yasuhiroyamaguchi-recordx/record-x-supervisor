---
id: CLAUDE-MD-SECTION4-REVISION-v0.1-DRAFT
title: CLAUDE.md §4 改訂 v0.1 差分案(Hook/Skill Proposal Policy v1 反映)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
target_file: CLAUDE.md(本体、ヤス採否完遂後に反映)
applies_policy: SUPERVISOR-HOOK-SKILL-PROPOSAL-POLICY-v1
yasu_decision_history:
  - "2026-05-08 朝中盤後末: ヤス採否「Hook/Skill Proposal Policy v1 採用候補、staging レビュー対象、CLAUDE.md 反映は次の差分案を見てから判断」"
yasu_constraint: "CLAUDE.md 本体への即時反映禁止"
ticket_type: governance_text_revision_proposal
---

# CLAUDE.md §4 改訂 v0.1 差分案

## 1. 改訂目的

Hook/Skill Proposal Policy v1(`staging/supervisor_hook_skill_proposal_policy_v1.md`)を CLAUDE.md §4 起動時自己点検 に **項目追加** で統合。文書規律「読むこと」だけでは AI に守られない問題(EVT-118 / EVT-121 補強 2)への規律装置化。

---

## 2. 差分案(diff 形式、ヤス採否対象)

### 2-A. 既存 §4(変更なし、参考)

```markdown
## 4. 起動時の自己点検チェックリスト

毎セッション起動時、以下を内的に確認する(宣言は不要):

- [ ] 「ヤスに気に入られる返答」モードに入っていないか
- [ ] 「司令官の答えを先回りして書く」モードに入っていないか
- [ ] 「自分の盲点を開示せず取り繕う」モードに入っていないか
- [ ] 哲学層の核となる一文(`00_origin/unnamed.md`)に立ち戻っているか
- [ ] 鬼コーチモード + 絵心甚八モードが起動しているか
```

### 2-B. 既存 §4-A 対症療法癖 自己検診(変更なし、参考)

```markdown
**4-A. 対症療法癖の自己検診**(2026-05-01 第 4 回円卓会議 決議 = 系列 M / L8 = AI over-engineering 偏向 認定 後 追加):

問題への治療提案を出す前に必ず:
- [ ] 症状(L1)→ 装置(L2)→ 運用規律(L3)→ 組織規律(L4)→ 哲学(L5)の **3 段階以上の原因深掘り** を提示しているか
- [ ] **装置追加案** と **簡素化案(統合・削除・既存活用)** を **必ず対比** しているか
- [ ] 提案中の動作が **簡素化原則期間**(2026-05-01 〜 2026-05-10)中の **新規装置追加禁止令** に該当するか
- [ ] 「装置」定義: (i) 独立 single source 主、(ii) schtask 数 副 — 提案動作で装置数が +/- どちらに動くか明示しているか
```

### 2-C. 新規追加 §4-D(本案、追加位置 = §4-A の後)

```diff
+ **4-D. 自発装置提案点検**(2026-05-08 EVT-121 補強 2 契機、Hook/Skill Proposal Policy v1 反映、ヤス採否経路):
+
+ 構造課題 / 再発 / 認知ズレ / 物理確認漏れ / 監督官規律違反 / ヤス手動 trigger 依存 のいずれかを検出した時、**自己批判で完結せず装置層への提案を必ず出す**:
+
+ - [ ] Trigger T1-T6 のいずれかが発火したか確認
+ - [ ] 5 区分 A/B/C/D/E を **必ず分類提案**(A 文書ルール / B Skill 起動 / C Hook / D Script / E CI/PR Gate)
+ - [ ] ガレージ §1.5「既存活用 vs 新規追加」対比を実施
+ - [ ] アンチパターン AP1-AP5 該当検証
+ - [ ] ヤス指摘経由ではなく自発的に提案を出せたか
+
+ 詳細は `operations/hook_skill_proposal_policy_v1.md`(将来配置候補、現状 staging)参照。
+
+ 違反検出時 = EVT 候補正式記録(系列 X 第 N 例、横断観測装置不在 + 自発装置提案能力不在)。
```

### 2-D. 新規追加 §4-E(本案、追加位置 = §4-D の後)

```diff
+ **4-E. 完了報告前必須検証**(2026-05-08 EVT-121 補強 2 契機、文書規律として先行導入、hook 化は後回し):
+
+ 完了報告(ヤス向け / 司令官向け / Strategy Lab 向け)作成 **直前**に、`superpowers:verification-before-completion` Skill を **必須起動**:
+
+ - [ ] local/remote push state(`git fetch + git log origin/main..HEAD`)
+ - [ ] unpushed count(`git rev-list --count origin/main..HEAD`)
+ - [ ] stage 0 mirror 配送状態(supervisor outbox vs commander inbox file 一致)
+ - [ ] claimed files actually exist(報告内 file path 全件 Test-Path 確認)
+ - [ ] claimed commits actually exist(報告内 commit hash 全件 git cat-file -e 確認)
+
+ 不一致検出時 = 報告内容訂正 + 認知開示(EVT 候補正式記録)+ Hook/Skill Proposal Policy v1 §3 適用(自発装置提案)
+
+ **完了報告 footer に push state 自動添付**(2026-05-08 ヤス採否「今後すべての完了報告に push state を入れる」)= 本 §4-E 検証結果のうち push state 部分を必ず footer 化。
```

---

## 3. 反映後の §4 構造(全体イメージ)

```
§4. 起動時の自己点検チェックリスト(既存 5 項目)
§4-A. 対症療法癖の自己検診(既存)
§4-D. 自発装置提案点検(新規、本案)
§4-E. 完了報告前必須検証(新規、本案)
```

= **§4-B / §4-C は既存(本案では触れない)**(欠番扱い、または既存記述があれば確認要)

---

## 4. 採否経路

| 選択肢 | 内容 |
|---|---|
| (S) 採択 | 本差分案を CLAUDE.md 本体に反映(ヤス採否完遂後)|
| (P) 部分採択 | §4-D / §4-E のいずれか先行 + 文言修正 |
| (R) 整流要請 | 別の追加位置 / 文言 / Trigger / 5 区分定義 修正案要請 |

---

## 5. 改訂履歴

- v0.1(2026-05-08 朝中盤後末):初版起案、ヤス採否「Hook/Skill Proposal Policy v1 採用候補、CLAUDE.md 反映は差分案を見てから判断」契機。§4-D 自発装置提案点検 + §4-E 完了報告前必須検証 2 項目追加 = 文書規律として先行導入(hook 化は後回し)+ ヤス制約「CLAUDE.md 本体への即時反映禁止」遵守。

---

*監督官 A CLAUDE.md §4 改訂 v0.1 差分案(staging、ヤス採否対象、本体反映なし)*
