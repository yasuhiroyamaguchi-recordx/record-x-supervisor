---
id: SUPERVISOR-HOOK-SKILL-PROPOSAL-POLICY-v1
title: Supervisor Hook/Skill Proposal Policy v1(構造課題発生時の自発装置提案規律)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-08
created_by: 監督官 A (Argus / supervisor A-line)
yasu_decision_history:
  - "2026-05-08 朝中盤後: 監督官運用ルール追加要請(構造リスク検出時の装置提案必須化)"
related_evt: EVT-20260508-121 §6-J 補強 2(軸 C6 監督官の自発装置提案能力不在)
related_orders: [128-138]
ticket_type: governance_policy
philosophical_basis:
  - "ヤス哲学「ルールで縛れ」(文書規律は AI に守られない、物理装置化必須)"
  - "ヤス仮説「AI 判断鈍化 = 観測装置不在」物理証拠 9 例累積 → 装置提案能力も同型欠陥"
  - "CLAUDE.md §4 起動時自己点検 拡張(問題発覚後の自己批判で完結しない)"
  - "ガレージドクトリン §1.5(装置 vs パイプライン接続)"
---

# Supervisor Hook/Skill Proposal Policy v1

## 1. Goal(規律目的)

監督官運用において、**構造課題・再発・認知ズレ・物理確認漏れ発生時**に、自己批判で完結せず **装置層への提案を必ず出す** 規律装置化。

ヤス指摘契機:「問題発覚後の自己批判」ではなく「**構造リスク検出時に hooks / skills / automation 候補を必ず提示する**」を運用ルールに入れる(2026-05-08 朝中盤後)。

= **CLAUDE.md §4 起動時自己点検 拡張**(第 6 項追加候補)

---

## 2. Trigger(発火条件、必ず装置提案を出す状況)

| Trigger | 例 |
|---|---|
| **T1 構造課題検出** | EVT-117/118/119/120/121 系列、複数サイクル横断 |
| **T2 再発** | 同型 EVT 第 N 例累積(EVT-120 累積 9 例 等) |
| **T3 認知ズレ** | 監督官 ↔ ヤス / 司令官 / 工場長 の状態認識相違 |
| **T4 物理確認漏れ** | 文書認知に依存し物理 query 未実行(本サイクル push-state 誤認、handoff §1-A 旧認知継続) |
| **T5 監督官自身の規律違反** | 役割境界 / 自己点検 / 対症療法癖 違反候補 |
| **T6 ヤス手動 trigger 依存検出** | 構造的に AI で検出すべき事項を ヤスが指摘した時 |

= 上記 6 trigger の **いずれかが発火** したら、本 Policy 必須適用

---

## 3. Mandatory Proposal Classification(必須分類提案、5 区分)

監督官は trigger 発火時、以下 5 区分を **必ず分類提示**:

| # | 装置層 | 適用条件 | 装置数影響 | 採否経路 |
|---|---|---|---|---|
| **A** | **文書ルール**(CLAUDE.md / handoff / AGENTS.md / 関係性ポリシー / 規律 README 改訂)| 知識/規律レベルで足りる場合 | ±0 | 監督官 staging + ヤス採否 |
| **B** | **Skill 起動**(superpowers:* / claude-api / verification-before-completion 等)| 既存 skill で対応可、起動規律で済む | ±0(既存活用) | 運用規律改訂 |
| **C** | **Hook**(PreToolUse / PostToolUse / SessionStart / Stop)| 物理 block / 自動表示 / 自動添付 | +1〜N(Hook Ticket Template v1 適用) | 司令官 α 経由発令 + ヤス採否 |
| **D** | **Script**(supervisor `scripts/` / commander `sync/sync_script/` / factory `tools/`)| 観測 / 整流 / 報告生成 | +1〜N | 司令官 α 経由発令 + ヤス採否 |
| **E** | **CI/PR Gate**(GitHub Actions workflow)| PR / branch / commit 時の自動検証 | +1〜N(GHA workflow 必須) | 三者合議 + ヤス採否(三社円卓 X-4 候補) |

### 3-A. 提案テンプレ(必須形式)

```yaml
proposal_id: <unique>
trigger: <T1-T6 のいずれか>
problem_summary: <1 段落>

classification:
  A_document_rule:
    applicable: yes/no
    rationale: <1 文>
    proposed_change: <if applicable>
  B_skill_invocation:
    applicable: yes/no
    rationale: <1 文>
    proposed_skill: <if applicable, e.g., superpowers:verification-before-completion>
  C_hook:
    applicable: yes/no
    rationale: <1 文>
    proposed_hook: <if applicable, type + matcher + script path>
  D_script:
    applicable: yes/no
    rationale: <1 文>
    proposed_script: <if applicable, path + trigger + output>
  E_ci_pr_gate:
    applicable: yes/no
    rationale: <1 文>
    proposed_workflow: <if applicable, .github/workflows/<name>.yml>

recommendation:
  primary: <A/B/C/D/E>
  rationale: <gardening §1.5 + 簡素化原則 + ヤス哲学整合>
  device_count_delta: <+N / ±0>
  yasu_approval_required: yes/no
  estimated_effort: <high/medium/low>
```

---

## 4. Anti-pattern(本 Policy 違反パターン、検出時即座 EVT)

| # | アンチパターン | 検出経路 |
|-]|---|---|
| AP1 | 構造課題検出後、自己批判で完結し装置提案なし | EVT-121 補強 2 同型 |
| AP2 | 装置提案を出すが文書ルール(A)のみ提示し、skill/hook/script/CI 検討なし | 部分対応疑い |
| AP3 | hook 提案を出すが Hook Ticket Template v1 未適用(F1-F4 欠落) | EVT-120 系列再発リスク |
| AP4 | ヤス指摘経由でのみ装置提案が出る(自発的に出ない) | EVT-121 §6-J 補強 2 同型 |
| AP5 | 装置追加で複雑性増、ガレージ §1.5「既存活用 vs 新規追加」対比なし | 装置数増加リスク |

---

## 5. Integration with Existing Discipline(既存規律との統合)

### 5-A. CLAUDE.md §4 起動時自己点検 拡張(第 6 項追加候補)

```markdown
## 4. 起動時の自己点検チェックリスト(既存)

- [ ] 「ヤスに気に入られる返答」モードに入っていないか
- [ ] 「司令官の答えを先回りして書く」モードに入っていないか
- [ ] 「自分の盲点を開示せず取り繕う」モードに入っていないか
- [ ] 哲学層の核となる一文(`00_origin/unnamed.md`)に立ち戻っているか
- [ ] 鬼コーチモード + 絵心甚八モードが起動しているか

## 4-D. 自発装置提案点検(本 Policy v1、第 6 項候補)

- [ ] 構造課題 / 再発 / 認知ズレ / 物理確認漏れ 検出時、§3 の 5 区分(A/B/C/D/E)を必ず分類提案したか
- [ ] 装置提案を出す前に、ガレージ §1.5「既存活用 vs 新規追加」対比を実施したか
- [ ] ヤス指摘経由ではなく自発的に提案を出せたか
```

### 5-B. ガレージ §1.5 統合

| 観点 | Policy v1 適用 |
|---|---|
| 装置 vs 機能 | 各区分(A-E)で **既存装置の機能拡張** を最優先 |
| 既存活用 | 区分 B(Skill 既存)+ 区分 A(文書改訂)= 装置数 ±0 を優先検討 |
| 新規装置追加禁止令(簡素化原則期間中)| 区分 C/D/E は ヤス採否経路必須 |

### 5-C. Plan-First Protocol との関係

| 規律 | 適用範囲 |
|---|---|
| Plan-First Protocol | 実装前のプラン提示(構造設計事前提示 + ヤス採否経路明示)|
| **Hook/Skill Proposal Policy(本 v1)** | **構造課題発生時の装置提案**(発見 → 自己批判 → 装置提案 三段階の最終フェーズを規律化)|

= **補完関係**(Plan-First は前向き、Proposal Policy は後ろ向き整流)

---

## 6. 適用例(本サイクル即時適用)

### 6-A. push-state 誤認(本サイクル発生)への装置提案分類

```yaml
proposal_id: PUSH-STATE-MISIDENT-20260508
trigger: T4 物理確認漏れ + T5 監督官自身の規律違反 + T6 ヤス手動 trigger 依存
problem_summary: 監督官 A が累積 12 commit を「push 待機継続」と誤報告。handoff §1-A 旧認知の継続使用、git fetch / log 物理確証未実行。EVT-121 §6-J 補強 2 第 2 例物理証拠。

classification:
  A_document_rule:
    applicable: yes
    rationale: handoff §1-A 旧記述更新 + CLAUDE.md §4-D(本 Policy 統合)で再発防止
    proposed_change: handoff §1-A の "supervisor remote push 0 件、構造制約二重発動" 記述を update + 新規 instance handoff 起案規律拡張
  B_skill_invocation:
    applicable: yes
    rationale: superpowers:verification-before-completion 標準起動で完了報告前 5 項目検証
    proposed_skill: superpowers:verification-before-completion(完了報告前必須起動)
  C_hook:
    applicable: yes
    rationale: SessionStart hook で起動時 push state 自動表示 + Stop hook で報告 footer 自動添付
    proposed_hook: |
      SessionStart: scripts/observability/push_state_check.ps1 → 環境変数 / 一時ファイル
      Stop: scripts/observability/append_report_footer.ps1 → 報告 footer 自動添付
  D_script:
    applicable: yes
    rationale: push-state check script + 4 点照合 script 統合(Observability v2 Phase 1A)
    proposed_script: scripts/observability/push_state_check.ps1 + cross_repo_diff_check.ps1
  E_ci_pr_gate:
    applicable: no
    rationale: PR/CI 段階ではなく監督官セッション内整流が主、CI gate は不要

recommendation:
  primary: B + C + D 統合(三層防護)
  rationale: |
    A 単独では本件再発(handoff 認知継続使用)
    B Skill 起動で完了報告前検証
    C Hook で起動時 + 完了時自動表示(誤認構造的防止)
    D Script で 4 点照合と統合(観測装置 v2 主軸)
    = 装置数 +1〜2(script 1 件 + hook 2 種統合)、既存 Skill + 既存 sync/ 拡張
  device_count_delta: +1(push_state_check.ps1)〜+2(+ append_report_footer.ps1)
  yasu_approval_required: yes(Y5 + Y6 採否経路)
  estimated_effort: medium(設計 staging 既完遂、実装はヤス採否後)
```

---

## 7. 改訂履歴

- v1.0(2026-05-08 朝中盤後、Day 136 朝中盤後):初版起案、ヤス指示「監督官運用ルール追加 = 構造リスク検出時の装置提案必須化、文書規律だけでは弱い、忘れる前提で hooks/skills/scripts に落とす」契機。Trigger 6 件(T1-T6)+ 必須分類 5 区分(A/B/C/D/E)+ アンチパターン 5 件(AP1-AP5)+ CLAUDE.md §4 拡張 + ガレージ §1.5 統合 + Plan-First Protocol 補完関係 + 本サイクル適用例(push-state 誤認)統合。

---

*監督官 A Supervisor Hook/Skill Proposal Policy v1(staging、ヤス採否対象、commit 配置のみ)*
*「構造課題 / 再発 / 認知ズレ / 物理確認漏れ → 必ず A/B/C/D/E 5 区分分類提案 = 自発装置提案能力の規律装置化」*
