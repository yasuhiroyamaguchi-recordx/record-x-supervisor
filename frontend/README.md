# 記録庁ダッシュボード(frontend/)

**配置日**: 2026-05-03(Day 131 朝起動時、本セッション内)
**配置者**: 監督官 A(`Argus`、A-line)
**起源**: ヤス指示「Fetch this design file, read its readme, and implement the relevant aspects of the design. ... Implement: 記録庁ダッシュボード.html」
**Design source**: Claude Design(claude.ai/design)handoff bundle
**Bundle URL**: `https://api.anthropic.com/v1/design/h/iUc-s_AceNKsUtT9csLIRA`(取得日 2026-05-03)

---

## 概要

記録庁(supervisor + commander + factory 三者統合)の **ダッシュボード v1.0 プロトタイプ**。本日 PM(2026-05-02 PM、Day 130 PM)の Phase A 末第 3 マイルストン「フロントエンド v1.0 設計フェーズ完了」の物理装置版受領。

ヤス・Claude Design 対話履歴(`chats/chat1.md` 1292 行)= 設計意図 + 判断記録の完全保管。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `記録庁ダッシュボード.html` | **エントリ HTML**(JSX 群を `<script type="text/babel">` で読込) |
| `記録庁ダッシュボード_for-bundle.html` | bundle 用派生(thumbnail 含む) |
| `記録庁ダッシュボード_standalone.html` | **19MB 単一ファイル**(.gitignore 除外、ローカル直接開く用) |
| `app.jsx` | エントリ(React 描画) |
| `data.jsx` + `catalog-data.jsx` + `dream-data.jsx` | データ層(モック) |
| `primitives.jsx` | 共通 UI プリミティブ(ヘルスメーター、アラートピル、組織アイコン等) |
| `operations.jsx` + `subscreens.jsx` | 画面層(操作 + サブ画面) |
| `catalog-screen.jsx` + `dream-checkup.jsx` + `phase-subagents.jsx` | 画面層(機能カタログ + 検診 + サブエージェント) |
| `variant-a.jsx` / `variant-b.jsx` / `variant-c.jsx` | **トップ画面 3 案比較**(Claude Design canvas) |
| `design-canvas.jsx` | canvas 配置(3 案並列表示) |
| `styles.css` | 共通スタイル |
| `chats/chat1.md` | ヤス・Claude Design 対話履歴 1292 行(意図 + 判断記録) |
| `HANDOFF_README.md` | Claude Design Handoff Bundle 元 README(Coding Agents 向けガイド) |

## 設計仕様(`chats/chat1.md` 由来)

### 全体トーン
- **モダン SaaS 風 × 重厚・機関っぽい**(Linear/Notion 系 + 漢字多め、整然)
- **ライトテーマ**、洗練された余白、明朝 + サンセリフ併用
- 公的機関のトーン(「記録庁 / ARCHIVE BUREAU」)

### 構成範囲
- 監督官 1 + 司令官 1(事業部門長 3〜4)+ 工場長 1
- 言語: 日本語のみ
- 重厚・機関っぽい命名(漢字多め、整然)

### ヘルス指標(5 項目)
1. 稼働状態(稼働中 / 待機 / 停止 / エラー)
2. 直近のエラー率 / 成功率
3. 現在実行中のタスク数
4. 最終応答時刻
5. コンテキスト使用率

### アラート 4 段階
- Critical / High / Medium / Low

### 比較する 3 案(variant-a / b / c)
1. **正統 機関ダッシュボード**(variant-a):整然グリッド + データ密度高 + 装飾控えめ
2. **指令室ビュー**(variant-b):中央組織図 + 周囲メーター
3. **タイムライン中心**(variant-c):左ライブログ + 右タスク・アラート

## 動作確認(ローカル)

エントリ HTML を直接開く:

```bash
# Windows
start frontend/記録庁ダッシュボード.html

# または、ローカルサーバー経由(CORS 回避)
cd frontend && python -m http.server 8000
# → http://localhost:8000/記録庁ダッシュボード.html
```

**注意**: standalone 版(`*_standalone.html`、19MB)= ローカル直接開く用、git 除外。再生成手順は別途検討。

## 実装方針(Claude Design Handoff README 整合)

> "These are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase."

= 本フォルダ = **プロトタイプ受領 + 動作可能化**(本セッション完遂)
= 次フェーズ = production 実装(target codebase で pixel-perfect recreate、Phase B 中盤候補)

## 関連発令

- 監督官 A 第 110 次発令(本配置完遂報告 + 動的データ接続フェーズ計画、本セッション末起案候補)
- handoff §2-A 第 3 マイルストン(2026-05-02 PM、設計フェーズ完了)= **物理装置化完遂**(本配置)
- handoff §3 H5「Claude Code HTML 実装完遂受領 + 動的データ接続フェーズ」= 主管空白解消(監督官 A 主管確定)

## 関連 EVT

- EVT-105 候補 第 3 例 = 本配置直前の認識ズレ(「別 instance 進行中」誤認識、本セッション内 ヤス指摘経由 自己訂正)
- EVT 新候補 = handoff bundle 受領 → 物理配置完遂(系列 N 健全側 第 N 例候補)

## 動的データ接続フェーズ(次段階、Phase B 中盤候補)

現状 = モック(data.jsx + catalog-data.jsx + dream-data.jsx)= ハードコード値。

接続経路候補:
- MCP 第 1 弾(capability_registry + evt_search + handoff_summary、70-90% トークン削減目標)
- 三者 git log + outbox / inbox 統計 + EVT 集計 + schtasks 状態 = リアルタイム取得
- = Phase B 中盤(2026-05-12 以降、新規装置追加禁止令明け)候補

## 哲学整合

| 哲学層 | 整合性 |
|---|---|
| `unnamed.md` 核心一文「私はあなたであり、あなたは私自身でもある」 | ✅ ダッシュボード = 両界共通言語 第 1 例 |
| sp500 §1 運動性継承 | ✅ 設計フェーズ → 実装フェーズ移行 = 健全側継承 |
| ガレージ §1.5 装置 vs パイプライン接続 | ✅ プロトタイプ = 装置、動的データ接続 = パイプライン接続(Phase B 中盤) |
| ヤス哲学「ルールで縛れ」 | ✅ ヘルス指標 5 項目 + アラート 4 段階 = 物理装置化の可視化 |
| dream_mode §1-B コンテキスト溢出予防 | ✅ ダッシュボードで EVT / handoff / schtasks 一元監視 = 溢出予防装置 |
