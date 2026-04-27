# supervisor — 監督官リポジトリ

本リポジトリは、Mamaz / RecordX / 記録庁プロジェクトにおける「監督官」の Claude Code 起動環境である。

## 起動モデル

- **モデル**: Opus 4.7 Claude Code
- **対話相手**: ヤス(Yasuhiro Yamaguchi) / 司令官(別リポジトリ・Opus 4.7) / 工場長(別リポジトリ・Sonnet)
- **基本姿勢**: 鬼コーチモード + 絵心甚八モード(詳細は `CLAUDE.md`)

## 役割の境界

監督官は **司令官との対話** に専念する。工場長とは直接対話しない(司令官経由)。
大方針(Why / What)はヤスが提示し、細部(How)は AI 同士の好敵手関係で決定する。

## 3 層構造

本プロジェクトは 3 層構造で運用される。上位が下位を規定する。

| 層 | 内容 | ディレクトリ |
|---|---|---|
| 哲学層 | 命名されない哲学的基盤(運動の起点) | `00_origin/` |
| 関係層 | 関係性ポリシー v1.2(好敵手プロトコル) | `01_relationship/` |
| 物理層 | 記録庁コントロールパネル v1.0-FINAL(司令官リポジトリに本体) | `02_physical/` |

## ファイル構造

```
supervisor/
├── README.md                          ← 本ファイル
├── CLAUDE.md                          ← Claude Code 起動時設定(最重要・最初に読む)
├── SETUP.md                           ← ローカル環境セットアップ手順(ヤス用)
├── 00_origin/
│   └── unnamed.md                     ← 哲学層(「無名」を便宜参照子として運用)
├── 01_relationship/
│   └── policy_v1.2.md                 ← 関係性ポリシー v1.2
├── 02_physical/
│   └── _reference.md                  ← 物理層は司令官リポジトリへの参照
├── adrs/
│   ├── ADR-001_control_panel_v1.0_FINAL.md
│   ├── ADR-002_relationship_policy_v1.2.md
│   └── ADR-003_philosophical_foundation_draft.md
├── archive/
│   ├── orders_history.md              ← 8 次発令履歴サマリ
│   └── peer_reviews_history.md        ← 逆査読 19 件サマリ
├── operations/
│   ├── role_and_conduct.md            ← 監督官行動規範詳細
│   └── communication_protocol.md      ← 司令官・工場長との通信プロトコル
└── outbox/
    └── 20260427_to_commander.md       ← 司令官への共有発令(本日のヤス判断)
```

## 起動順序(新しい監督官インスタンスが立ち上がった際の読み込み順)

1. `CLAUDE.md` — 役割・モード・自己点検
2. `00_origin/unnamed.md` — 哲学層(運動の起点として保持)
3. `01_relationship/policy_v1.2.md` — 関係性ポリシー(馴れ合い拒絶 3 原則)
4. `operations/role_and_conduct.md` — 行動規範詳細
5. `operations/communication_protocol.md` — 通信プロトコル
6. `adrs/` 配下 — 確定決定の参照
7. `archive/` 配下 — 過去履歴の参照(必要時)

## 注意

- 本リポジトリの `archive/` 配下のサマリは、claude.ai 上の前セッションからの **再構築** であり、完全な再現ではない。骨格再現に留まる。
- 物理層(記録庁コントロールパネル v1.0-FINAL)の本体は **司令官リポジトリ** にある。監督官側はパス参照のみ保持する。
- 哲学層は「決定事項」ではなく「運動の起点」である。`adrs/` ではなく `00_origin/` に独立配置するのは、この性質の違いを構造で示すためである。

## 確立日

2026-04-27(Day 129)
