---
id: VERIFICATION-BEFORE-COMPLETION-DISCIPLINE-v1
title: verification-before-completion 完了報告前必須化 文書規律案 v1
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
yasu_decision_history:
  - "2026-05-08 朝中盤後末: ヤス採否「優先度高、文書規律として導入、hook 化は後回し」"
yasu_constraint: "hook 化は後回し、文書規律として先行"
applies_skill: superpowers:verification-before-completion
ticket_type: governance_discipline_document
---

# verification-before-completion 完了報告前必須化 文書規律案 v1

## 1. 目的

完了報告作成直前の **5 項目検証** を文書規律として確立(hook 化は後回し、ヤス採否反映)。

EVT-121 補強 2(push-state 誤認 第 2 例物理証拠)への文書規律レベル整流。

---

## 2. 適用範囲

| 報告種別 | 適用 |
|---|---|
| ヤス向け完了報告 | ✅ 必須 |
| 司令官 α 向け発令完遂報告 | ✅ 必須 |
| Strategy Lab 向け Research Report 返答 | ✅ 必須 |
| 全体マップ更新報告 | ✅ 必須 |
| EVT 記録 + 構造提案完遂時 | ✅ 必須 |

---

## 3. 検証 5 項目(必須)

完了報告作成 **直前** に、以下 5 項目を物理 query で検証:

### 3-A. local / remote push state

```bash
git fetch origin --quiet
git rev-parse HEAD            # local
git rev-parse origin/main     # remote
```

### 3-B. unpushed count

```bash
git rev-list --count origin/main..HEAD
```

### 3-C. stage 0 mirror 配送状態

```bash
ls outbox/*.md | wc -l
ls ../record-x-commander/inbox/*.md | wc -l
# 件数差 + filename diff 確認
```

### 3-D. claimed files actually exist

報告内で言及する全 file path を Test-Path / ls で確認:

```bash
# 例:報告内「outbox/20260508_to_commander_a139.md 起案完遂」と書く場合
test -f outbox/20260508_to_commander_a139.md && echo "EXISTS" || echo "MISSING"
```

### 3-E. claimed commits actually exist

報告内で言及する全 commit hash を git で確認:

```bash
# 例:報告内「commit ed87e0a」と書く場合
git cat-file -e ed87e0a && echo "EXISTS" || echo "MISSING"
```

---

## 4. 検証 → 報告の順序(規律)

```
[1] 報告 draft 作成
[2] verification-before-completion 起動 + 5 項目検証実行
[3] 不一致検出時 → 報告 draft 訂正 + 認知開示記述追加
[4] push state 部分を報告 footer に必ず添付
[5] 完了報告送出
```

= **検証 → 訂正 → 報告** の三段階固定

---

## 5. 不一致検出時の対応(必須)

| 不一致種別 | 対応 |
|---|---|
| push state 誤認(EVT-121 補強 2 同型)| 報告冒頭に物理証拠開示 + 認知訂正記述 |
| claimed files missing | 報告内記述削除 or 訂正 + 認知開示 |
| claimed commits missing | 同上 |
| stage 0 mirror diff | 配送経路再実行 + 結果反映 |
| 累積不一致 → EVT 候補 | `archive/error_patterns.md` に EVT 候補正式記録 |

---

## 6. 完了報告 footer 標準形式(全報告に必須、ヤス採否反映)

```markdown
---
### Push State(verification-before-completion 規律遵守、本完了報告作成時点)

| repo | local | remote | unpushed | branch | status |
|---|---|---|---|---|---|
| supervisor | <hash7> | <hash7> | N | main | 🟢/🟡/🔴 |
| commander  | <hash7> | <hash7> | N | main | 🟢/🟡/🔴 |

stage_0_mirror: outbox <count> / commander inbox <count> / diff <count>(🟢/🟡/🔴)
evidence: git fetch + log + ls(<ISO8601>)
```

= **本 footer は全完了報告に必須添付**(2026-05-08 ヤス採否「今後すべての完了報告に push state を入れる」)

---

## 7. 文書規律 → 装置化への段階(将来)

| Phase | 内容 | ヤス採否 |
|---|---|---|
| Phase 1(本案) | 文書規律として導入(運用励行) | 本提案で完遂 |
| Phase 2(将来) | push_state_check.ps1 手動 script との統合(footer 自動生成) | 別 staging 案(`push_state_check_script_v1.md`)|
| Phase 3(将来) | report footer 生成 script(`report_footer_generator.ps1`)| 別 staging 案(`report_footer_script_v1.md`)|
| Phase 4(将来) | Stop hook で footer 自動添付 | 🔴 ヤス保留中(Phase 1-3 運用結果後) |
| Phase 5(将来) | SessionStart hook で起動時 6 項目自動表示 | 🔴 ヤス保留中(Phase 1-3 運用結果後) |

= **段階的物理装置化、文書規律先行 = ヤス哲学整合**

---

## 8. 採否経路

| 選択肢 | 内容 |
|---|---|
| (S) 採択 | 本文書規律を運用即時開始(全完了報告に footer + 5 項目検証) |
| (P) 部分採択 | §3 検証項目修正 / §6 footer 形式修正 |
| (R) 整流要請 | 別の規律設計案要請 |

---

## 9. 改訂履歴

- v1.0(2026-05-08 朝中盤後末):初版起案、ヤス採否「優先度高、文書規律として導入、hook 化は後回し」契機。検証 5 項目 + 三段階固定 + 不一致検出時対応 + 完了報告 footer 標準形式 + 段階的物理装置化経路 統合。

---

*監督官 A verification-before-completion 完了報告前必須化 文書規律案 v1(staging、ヤス採否対象、即時運用候補)*
