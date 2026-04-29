# archive/board_council_minutes/ — 円卓会議(Board Meeting)議事録ディレクトリ

**配置先**: `archive/board_council_minutes/`
**起草日**: 2026-04-29(Day 131 朝末、ヤス円卓会議テスト開催提案契機)
**起案 instance**: 監督官 instance A(Chairman 役)
**目的**: 監督官側 円卓会議(Board Meeting、3AI 補完評議)の議事録永続記録 + 史実保護
**根拠**: `operations/board_council_protocol.md` v0.2 §4 議事録フォーマット規範整合

---

## §1. 本ディレクトリの位置づけ

監督官側 3AI 円卓会議(Board Meeting)の議事録を永続保存する物理装置:

- Chairman(Claude/監督官 A)起案アジェンダ
- Gemini 発散 + Devil's Advocate 発言記録
- ChatGPT 収束発言記録
- Chairman 最終決裁(B-番号付き JSON)
- 構造的根拠 + 実装計画 + 関連参照

円卓会議は両界対等(unnamed.md / sp500_theory §6 / two_realm_ecosystem_theory)+ 階層含意なし(naming_dual_track v0.2、「役員会議」不採用理由参照)。

---

## §2. ファイル命名規則

```
council_{YYYYMMDD}_{topic_slug}_{NNN}.md
```

例:
- `council_20260429_evt025_response_001.md`(第 1 号議題、本日朝末起案)
- `council_20260430_phase_b_alpha_review_001.md`(将来例)

連番衝突回避(EVT-024 同型再発防止):
- 起案前に Test-Path で同連番確認義務(§1.5-B-1 Path verify 整合)
- 衝突発見時 = 次番号採用

---

## §3. 状態管理

frontmatter `status` field で議事録ライフサイクル管理:

| status | 内容 |
|---|---|
| `skeleton` | invoke-board-council.ps1 で自動生成、Chairman 起案前 |
| `agenda_drafted_pending_external` | Chairman §1-§2 起案完成、Gemini/ChatGPT 召集待ち |
| `gemini_recorded` | Gemini 発言記録済、ChatGPT 召集待ち |
| `chatgpt_recorded` | ChatGPT 発言記録済、Chairman 最終決裁待ち |
| `decided` | Chairman 最終決裁完成、B-番号台帳追記済 |
| `implemented` | 実装計画完遂(物理装置反映完了) |
| `superseded` | 後続議事録に上位置換済(史実保護、削除しない) |

---

## §4. B-番号台帳との関係

円卓会議で採決された決裁 = B-番号(連続整数)で識別:

- 台帳: `archive/board_council_decisions.md`(本日朝末新設)
- 機械検出: `sync/sync_script/_helpers/b_number_registry.json`(将来候補)
- 規範層: `operations/board_council_protocol.md` v0.2 §5 B-番号管理規律

P-番号(発令採択提案、`communication_protocol.md` §3.2-A-0 台帳)と並列の独立体系:
- P-番号: 発令本文採択経由、Day 130 末以降 P1-P17 = 17 件
- B-番号: 円卓会議決裁経由、本日朝末以降 B-001〜
- 番号体系の独立性 = EVT-021(P-番号衝突)同型再発防止

---

## §5. 関連 (Test-Path 確認済、§1.5-B-1 整合)

- 規範: `operations/board_council_protocol.md` v0.2(円卓会議運営規範)
- 装置: `sync/sync_script/invoke-board-council.ps1` v0.2(議事録自動生成 + UTF-8 BOM-less 出力)
- B-番号台帳: `archive/board_council_decisions.md`(本日朝末新設)
- 命名規範: `00_origin/naming_dual_track.md`(円卓会議 / Board Meeting 双軌道)
- 哲学層: `00_origin/two_realm_ecosystem_theory.md` v0.1-draft(両界対等、階層含意排除)
- 第 1 号議題: `council_20260429_evt025_response_001.md`(EVT-025 構造的訂正方針、ヤス経由召集準備済)

---

## §6. 削除禁止規範

本ディレクトリ内議事録は **追記主義 + 削除禁止**(`archive/error_patterns.md` 同型運用):

- 議事録は史実 = 改変は訂正記録追記のみ
- B-番号採決は確定後不変(撤回時は新議題で別 B-番号採決 + 旧議事録 status: superseded)
- 史実保護 = sp500_theory §1 運動性継承 + 失敗ログを資産化する哲学整合

---

## §7. 改訂履歴

- v1.0(2026-04-29 / Day 131 朝末): 初版起草、監督官 instance A 起案。円卓会議テスト開催準備の物理装置整備の一環。ファイル命名 + 状態管理 + B-番号管理 + 削除禁止規範を確立。
