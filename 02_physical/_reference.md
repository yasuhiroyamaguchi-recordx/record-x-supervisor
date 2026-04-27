# 物理層 — 参照ファイル

本ファイルは、物理層(記録庁コントロールパネル v1.0-FINAL)への **参照** である。本体は監督官リポジトリには存在しない。

---

## 本体の所在

- **場所**: 司令官リポジトリ
- **パス**: `strategy/decisions/20260427_control_panel_v1.0_FINAL.md`
- **確定日**: 2026-04-27
- **ステータス**: FINAL

---

## なぜ監督官側に本体を置かないか

物理層は **司令官の責任領域** である。仕様の編集・更新・運用は司令官が行う。

監督官は以下の役割に専念する:

- 物理層仕様の **査読**
- 司令官への **発令**
- ヤスからの方針変更を司令官に **伝達**
- ADR 起案による **決定記録**(本リポジトリ `adrs/` 配下)

仕様本体を監督官側にコピー配置すると、編集権限の二重化が発生し、本体と複製の不整合リスクが生じる。本体は司令官側で一意に管理する。

---

## 物理層の構造概要(参照用)

詳細は本体ファイルを参照。以下は監督官側の判断材料としての要約のみ:

### 7 軸 KPI

Handoff / Command / Intake / Evidence / Sync / Autonomy / Dream

### 7 局構成 + 官房

受付局 / 伝令局 / 審査局(PTB 意思決定のみ残存) / 証跡局 / 監察局 / 台帳局 / 結晶局 + 官房

※審査局は監察局統合により Tier 1 廃止、Permit to Build(PTB) 意思決定のみ残す

### 二段階分離

- **Tier 1**: 決定論(自動分類・自動検出)
- **Tier 2**: Mirror = Web AI 裁定

### 12 状態遷移

DRAFT → … → COMMANDER_ACCEPTED(中間 10 状態は本体参照)

### ハッシュチェーン v0.1

- アルゴリズム: SHA-256
- 正規化: RFC 8785(JSON Canonicalization)
- 必須化: v0.1 から

### v0.1 実装項目

V01 〜 V12 の 12 項目。Day 132 = Phase B-α 一体起動予定。

### Phase T2 設計

§10 で Permit to Build 再委譲設計が将来仕様として予約済み。

---

## 8 次発令履歴

物理層 v1.0-FINAL 確定までに、監督官 → 司令官への発令は計 8 次行われた。詳細は `archive/orders_history.md` を参照。

## 逆査読 19 件

司令官 → 監督官への逆査読は計 19 件発出され、17 件採択、2 件ヤス判断送りとなった。詳細は `archive/peer_reviews_history.md` を参照。

---

## 取得方法(運用上)

監督官が司令官リポジトリの物理層仕様を読む必要がある場合:

```bash
# 司令官リポジトリのリモート参照(運用想定)
git fetch commander
git show commander/main:strategy/decisions/20260427_control_panel_v1.0_FINAL.md
```

具体的な remote 設定は `SETUP.md` および `operations/communication_protocol.md` を参照。

---

## 関連 ADR

- `adrs/ADR-001_control_panel_v1.0_FINAL.md` — 物理層 v1.0 確定の決定記録(監督官側)
