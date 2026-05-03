---
name: 記録庁ダッシュボード v1.0 稼働ロードマップ v1.0(Phase F0〜F5、フロントエンド本格運用までの全体計画)
type: ロードマップ素材(staging/ 配下、ヤス採否 + 司令官 α チケット起案経路)
date_authored: 2026-05-04 早朝(Day 132 早朝)
authored_by: 監督官 A (Argus / supervisor A-line)
trigger: ヤス指示「リポジトリを確認し、claudeデザインで作成したフロントエンドのコントロールパネルが稼働のための全体ロードマップを司令官に共有し、司令官がフロントエンドの構築のためのチケット発行ができる環境を整えて」
status: v1.0 起案(staging/ 配下)= ヤス採否後 司令官 α チケット起案経路解錠
priority: 🔴 critical(フロントエンド本格運用 = Phase B 中盤本質課題 = 検収側スループット向上経路)
related_orders: [110(記録庁ダッシュボード v1.0 物理配置完遂報告)]
related_evts: ["EVT 候補 = handoff bundle 受領 → 物理配置 → 稼働ロードマップ起案(系列 N 健全側 第 N+M 例候補)"]
---

# 記録庁ダッシュボード v1.0 稼働ロードマップ v1.0

## 0. 結論先出し

| 項目 | 状態 |
|---|---|
| 現状(Phase F0)| ✅ プロトタイプ受領 + 物理配置完遂(`supervisor/frontend/`、22 files / 7816 LOC、本セッション末末末)|
| 性質 | JSX + Babel browser-mode + モックデータ = production 化未完了 |
| ゴール | **動的データ接続 + 認証 + デプロイ = 三者(監督官 / 司令官 / 工場長)実運用ダッシュボード** |
| フェーズ数 | **F0〜F5(6 段階)、目標完遂 = 2026-05-XX**(MCP 第 1 弾配備同期、Phase B 中盤連携) |
| 主管領域分配 | 監督官 A(全体方針 + 哲学整合)+ 司令官 α(チケット起案 + 配信)+ 工場長 Castor(実装 + テスト + デプロイ) |

---

## 1. 現状(Phase F0)分析

### 1-A. リポジトリ実態

| 項目 | 内容 |
|---|---|
| 配置先 | `record-x-supervisor/frontend/` |
| ファイル | 22 files(`*.jsx` × 14 + `*.html` × 3 + `*.css` × 1 + `*.md` × 2 + `chats/chat1.md` × 1 + `.gitignore` + `.design-canvas.state.json`) |
| LOC | 7816(本セッション末末末配置時) |
| エントリ | `記録庁ダッシュボード.html`(JSX 群 `<script type="text/babel">` で読込) |
| データ層 | `data.jsx` + `catalog-data.jsx` + `dream-data.jsx` = **モック/ハードコード** |
| トップ画面 | `variant-a` / `variant-b` / `variant-c` 3 案比較中(ヤス採否未完) |
| 動作確認 | ローカル `start frontend/記録庁ダッシュボード.html` or `python -m http.server 8000` |

### 1-B. 制約・課題

| 課題 | 内容 |
|---|---|
| production 化未完 | Babel browser-mode = 性能 + メンテ性で限界、ビルドパイプライン未整備 |
| データ層モック | 実データ未接続 = ダッシュボードの本質機能未稼働 |
| トップ画面 3 案 | variant-a/b/c 選定未完 = 単一エントリに絞込必要 |
| 認証なし | 公開時 Mamaz 内部限定アクセス必要(secret + 個人情報) |
| デプロイ先未定 | Vercel / Cloudflare / GitHub Pages / 自社 server / etc. |
| CI 統合なし | フロントエンド変更時の品質保証経路未整備 |
| TypeScript 化未完 | 全 JSX = props 型なし = リファクタリング危険 |

---

## 2. ロードマップ全体(Phase F0〜F5)

### 2-A. フェーズ俯瞰

| Phase | 名称 | 目標期間 | 主要ゴール |
|---|---|---|---|
| F0 | プロトタイプ受領 + 配置 | ✅ 完遂(2026-05-03)| Claude Design handoff bundle 物理配置 |
| **F1** | **基盤整備**(production codebase 化)| 2026-05-04〜05-08 | target repository 選定 + ビルドパイプライン + TypeScript |
| **F2** | **静的稼働**(pixel-perfect recreate)| 2026-05-09〜05-11 | variant 選定 + 静的 production build + ローカル稼働 |
| **F3** | **データ層接続**(モック → 実データ)| 2026-05-12〜05-15 | MCP 第 1 弾連携 + 三者 repository 統計集約 + ヘルス/アラート動的化 |
| **F4** | **デプロイ + 認証** | 2026-05-16〜05-20 | デプロイ先選定 + 認証経路 + 環境変数管理 + ログ集約 |
| **F5** | **本格運用 + 拡張** | 2026-05-21〜 | リアルタイム更新 + 操作機能 + 履歴閲覧 + 監査機能 |

### 2-B. Phase B 中盤連携

- **F3(データ層接続)= MCP 第 1 弾配備同期**(`staging/mcp_v0.1_design_material.md` v0.2 改訂後、Phase B 中盤起動 2026-05-12 以降と重なる)
- **F4(デプロイ + 認証)= 速度ブースト 3 装置の延長**(プロシード壁クリア + CI 並走化 + MCP の上にダッシュボードが乗る経路)
- **F5(本格運用)= Phase B 完遂判定接近 + Phase C 起動候補成立判定の物理装置**(2026-05-15 周辺判定)

---

## 3. Phase F1: 基盤整備(2026-05-04〜05-08)

### 3-A. 主要決定事項(司令官 α 採否)

| 決定 | 選択肢 | 監督官 A 推奨 |
|---|---|---|
| target repository | (a) `supervisor/frontend/` 維持 / (b) **ProjectRX 配下移植**(工場長主管インフラ活用)/ (c) 新リポジトリ `record-x-dashboard` | **(b) ProjectRX 配下** = CI 統合済 + 工場長スループット最大、`/` または `/dashboard/` 配下 |
| build framework | (a) Vite + React / (b) Next.js / (c) Remix | **(a) Vite + React** = 軽量 + 既存 JSX 移植容易 + SSR 不要(内部ダッシュボード) |
| package manager | (a) npm / (b) **pnpm**(ProjectRX 既存)| **(b) pnpm**(ProjectRX 整合)|
| TypeScript | 必須? | **必須**(JSX → TSX、props 型化、ProjectRX 整合) |
| styling | (a) styles.css 維持 / (b) Tailwind / (c) styled-components / (d) CSS Modules | **(d) CSS Modules** または **(b) Tailwind**(既存 styles.css 移植容易性で判定) |

### 3-B. F1 チケット候補(司令官 α 起案推奨)

| チケット ID 候補 | 内容 | 工数見積 | 受入条件 |
|---|---|---|---|
| **F1-001** | target repository 選定 + 移植実施(supervisor/frontend → ProjectRX/dashboard/)| 0.5 日 | 移植先で `git mv` 完遂 + CI 統合スケルトン |
| **F1-002** | Vite + React + TypeScript ビルドパイプライン整備 | 1 日 | `pnpm dev` ローカル稼働 + `pnpm build` 完遂 + bundle 出力確認 |
| **F1-003** | JSX → TSX 移行(props 型化、any 撲滅)| 1.5 日 | 全 14 ファイル `*.tsx` 化 + `tsc --noEmit` 0 error |
| **F1-004** | CI 統合(arch-gate 整合 + lint + typecheck + build)| 0.5 日 | PR 経由で `dashboard/` 変更時 fast-gate 通過 |
| **F1-005** | styling 戦略採択(Tailwind or CSS Modules)+ styles.css 移植 | 1 日 | pixel-perfect 維持 + design-canvas 動作確認 |

= **F1 計 4.5 日見積**(工場長 Castor 並走で 2-3 日完遂見込み = CI 並走化効果含)

---

## 4. Phase F2: 静的稼働(2026-05-09〜05-11)

### 4-A. 主要決定事項

| 決定 | 内容 |
|---|---|
| variant 採択(top page) | a / b / c のいずれか単一採択 = ヤス採否(必須) |
| screen lifecycle | 全画面マウント = 単一 SPA 維持(現状) |
| pixel-perfect | Claude Design HANDOFF_README 整合 = 視覚再現優先、内部構造変更可 |

### 4-B. F2 チケット候補

| チケット ID 候補 | 内容 | 工数見積 | 受入条件 |
|---|---|---|---|
| **F2-001** | variant 採択結果反映(variant-a/b/c → 単一トップ画面)| 0.5 日 | 不採択 variant 削除 + ルーティング整合 |
| **F2-002** | primitives.jsx → primitives.tsx + Storybook 候補導入 | 1 日 | 全プリミティブ単体動作確認 |
| **F2-003** | operations + subscreens + catalog/dream/phase-subagents 画面群 production build | 1 日 | `pnpm build` 出力 = HTML/CSS/JS bundle 動作確認 |
| **F2-004** | E2E テストスケルトン(Playwright + ヘルス画面 1 件)| 0.5 日 | CI 統合 + 1 シナリオ pass |

= **F2 計 3 日見積**

---

## 5. Phase F3: データ層接続(2026-05-12〜05-15、Phase B 中盤連携)

### 5-A. データソース設計

| 指標 | データソース | 取得経路 |
|---|---|---|
| 稼働状態 | schtasks 状態 + プロセス活動ログ | API endpoint(集約 server)|
| エラー率 / 成功率 | archive/error_patterns.md + EVT 集計 | MCP `evt_search` |
| 実行中タスク数 | outbox / inbox / staging/ファイル数 + git status | API endpoint |
| 最終応答時刻 | git log 最新 commit + outbox 最新 file | git log |
| コンテキスト使用率 | session-level metric(取得方法要設計)| 別途設計 |
| アラート 4 段階 | EVT critical_red 件数 + handoff 緊急度集計 | MCP `evt_search` + `handoff_summary` |

### 5-B. F3 チケット候補

| チケット ID 候補 | 内容 | 工数見積 | 受入条件 |
|---|---|---|---|
| **F3-001** | データ集約 server(API endpoint)設計 + 実装(Node.js + Express or Fastify)| 1.5 日 | 5 endpoint(health / errors / tasks / latest / alerts)動作確認 |
| **F3-002** | MCP 第 1 弾連携(capability_registry + evt_search + handoff_summary)| 1 日 | MCP server 起動 + 3 endpoint 経由でダッシュボード動作 |
| **F3-003** | data.jsx + catalog-data.jsx + dream-data.jsx → 実データ切替(モック削除)| 1 日 | ヘルス指標 5 項目 + アラート 4 段階 = 全実データ反映 |
| **F3-004** | 三者 repository git log/outbox/inbox 統計集約スクリプト | 0.5 日 | 1 分 1 回実行で snapshot 更新 |
| **F3-005** | キャッシュ戦略(SWR or React Query 導入)| 0.5 日 | 5 秒間 stale-while-revalidate 動作確認 |

= **F3 計 4.5 日見積**(MCP 第 1 弾配備と並走可)

---

## 6. Phase F4: デプロイ + 認証(2026-05-16〜05-20)

### 6-A. 主要決定事項

| 決定 | 選択肢 | 監督官 A 推奨 |
|---|---|---|
| デプロイ先 | (a) Vercel / (b) Cloudflare Pages / (c) GitHub Pages(internal)/ (d) 自社 server | **(b) Cloudflare Pages**(無料 + 認証統合容易 + Mamaz 既存 Cloudflare 利用想定)or **(d) 自社 server**(完全 internal)|
| 認証 | (a) GitHub OAuth / (b) Cloudflare Access(Zero Trust)/ (c) Basic Auth / (d) magic link | **(b) Cloudflare Access** = 4 アカウント(ヤス + 監督官 + 司令官 + 工場長)制限容易 |
| 環境変数管理 | (a) GitHub Secrets / (b) Cloudflare 環境変数 / (c) `.env.local` | **(b) Cloudflare 環境変数**(デプロイ整合) |

### 6-B. F4 チケット候補

| チケット ID 候補 | 内容 | 工数見積 | 受入条件 |
|---|---|---|---|
| **F4-001** | Cloudflare Pages デプロイパイプライン構築(GitHub Actions 統合)| 1 日 | main merge → 自動デプロイ + プレビュー URL 動作確認 |
| **F4-002** | Cloudflare Access 認証経路(4 アカウント限定)| 0.5 日 | 認証なしアクセス = 拒否、認証済 = 許可 |
| **F4-003** | 環境変数管理 + secret 取扱規律 | 0.5 日 | API endpoint URL + token 暗号化保管 |
| **F4-004** | 監視 + ログ集約(Cloudflare Analytics + 自社 logging)| 0.5 日 | アクセスログ + エラーログ閲覧可 |
| **F4-005** | デプロイ後 smoke test(自動化)| 0.5 日 | デプロイ直後 5 endpoint 自動疎通確認 |

= **F4 計 3 日見積**

---

## 7. Phase F5: 本格運用 + 拡張(2026-05-21〜)

### 7-A. 拡張機能候補

| 機能 | 内容 | 優先度 |
|---|---|---|
| リアルタイム更新 | WebSocket or SSE or polling(5-10 秒間隔)| 🔴 高 |
| 操作機能 | ダッシュボードから発令送信 / チケット起案 / 検診起動 | 🟡 中(security 配慮要) |
| 履歴閲覧 | EVT / archive / handoff 検索 + 表示 | 🟡 中 |
| 監査機能 | 第 13 回監査ライク自動スコア + トレンド | 🟢 低(後段)|
| Phase 進捗 | Wave 1/2/3 進捗 + 加重進捗 + Phase B/C 状態 | 🔴 高(Phase B 完遂判定経路)|
| 双子並走効率 | A-line / B-line 並走効率自動計測 | 🔴 高 |

### 7-B. F5 チケット起案 = Phase B 完遂判定接近後(2026-05-15+)

司令官 α 主管 = 各機能チケット ID 採番(F5-XXX)+ 受入条件設計 + 工場長配信。

---

## 8. 主管領域分配(CLAUDE.md §5 + §5 改訂候補 v0.1 整合)

| 領域 | 監督官 A 主管 | 司令官 α 主管 | 工場長 Castor 主管 |
|---|---|---|---|
| 全体ロードマップ起案 | ✅ | — | — |
| ヤス採否経路提示 | ✅ | — | — |
| 哲学整合確認(unnamed.md / sp500 等)| ✅ | — | — |
| Phase F1〜F5 各チケット ID 採番 | — | ✅ | — |
| Phase F1〜F5 各チケット仕様確定 | — | ✅(監督官 A 提案受領)| — |
| 工場長配信 | — | ✅ | — |
| 実装 | — | — | ✅ |
| テスト + CI 整合 | — | — | ✅ |
| デプロイ + 監視 | — | — | ✅ |
| 検収 | ✅(二者合議経路 + 司令官 α)| ✅ | — |
| 工場長 → 監督官 技術質問 | ✅ 直接回答(§5 改訂候補 v0.1 §5-A 例外条件 (i)〜(iv) 該当時)| — | — |

---

## 9. 採否経路

### 9-A. ヤス採否(本ロードマップ)

| 選択肢 | 内容 |
|---|---|
| **(S) 採択** | commit + push + 第 119 次発令(司令官 α 共有)+ チケット発行環境整備完遂 |
| (P) 部分採択 | フェーズ範囲 / 期間 / 主要決定事項のいずれか修正 → v1.1 再起案 |
| (R) 整流要請 | 監督官 A 自己訂正後 v1.1 再起案 |
| (H) 保留 | 後続セッションで再起案 |

### 9-B. 司令官 α 採否(本ロードマップ受領後)

- (i) Phase F1 チケット起案着手(F1-001〜F1-005 採番 + 配信)
- (ii) target repository 移植先採否(本推奨 (b) ProjectRX 配下、修正可)
- (iii) build framework / package manager / styling 採否(本推奨採用 or 修正)
- (iv) variant 採択(top page)= ヤス採否経由 司令官 α 反映

---

## 10. 監督官 A 自己点検

| 規律 | 点検結果 |
|---|---|
| 鬼コーチモード | ✅(現状の限界 7 件率直開示、production 化未完を直球指摘)|
| 絵心甚八モード | ✅(構造化 + 表優先 + 結論先出し + フェーズ俯瞰)|
| Plan-First 規律 | ✅(staging/ 配下起案 + ヤス採否経路 + 司令官 α 採否経路 = 二段階採否確保)|
| 役割境界(CLAUDE.md §5 + §5 改訂候補) | ✅(監督官 → 工場長 直接発信なし、司令官 α 経由のみ)|
| 装置追加 vs 簡素化対比 | 🟡 装置追加(production codebase 化)= 必要、但し既存 JSX 7816 LOC 活用 = 「既存装置使用」原則整合 |
| デビルズアドボケート | 主要決定事項の選択肢提示(target repo / build framework / styling / デプロイ先 / 認証)= 司令官 α 採否経路明示 + 監督官 A 越権回避 |

---

## 11. 改訂履歴

- v1.0(2026-05-04 早朝、Day 132 早朝): 監督官 A(Argus、Day 131-132 連続稼働 instance)起案、ヤス指示「リポジトリを確認し、claudeデザインで作成したフロントエンドのコントロールパネルが稼働のための全体ロードマップを司令官に共有し、司令官がフロントエンドの構築のためのチケット発行ができる環境を整えて」契機。Phase F0(完遂)〜 F5(2026-05-21〜)の 6 段階フェーズ俯瞰 + Phase F1〜F4 チケット候補 計 19 件提示(F1: 5 + F2: 4 + F3: 5 + F4: 5)+ 主要決定事項(target repository / build framework / package manager / TypeScript / styling / デプロイ先 / 認証)司令官 α 採否経路明示 + 主管領域分配(CLAUDE.md §5 + §5 改訂候補 v0.1 整合)+ Phase B 中盤連携(MCP 第 1 弾配備同期)+ Phase B 完遂判定経路(F4-F5 連携)。
