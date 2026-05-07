# Supervisor Codex boot — SUP-CODEX-BOOT-001

## Purpose

監督官リポジトリに **Codex 監督官モード**（workspace-write / approval never）を導入し、Common / Factory 半自律ラインの検収に使う **固定の入口**（`AGENTS.md`、Codex 設定、起動スクリプト、レビュー用テンプレ）を用意する。

## Role

運用上の監督官 Codex は、証跡付きでの完了確認、CI トリアージ、PASS/PARTIAL/BLOCKED 判定、司令官フィードバックに責務を限定する。他リポジトリは編集しない。

## Boundaries

- 変更対象は本ブートで追加した **許可リスト内ファイル**のみ（`runtime application`・`package.json`・GitHub workflow・他 repo への書き込みは対象外）。
- `git clean` / `reset` / `stash pop` 等の破壊的 git および `proceed` ゲートに依存しない Plan-First 運用。
- Factory / Commander / Strategy Lab への編集禁止。

## Added Files

| Path | 役割 |
|------|------|
| `AGENTS.md` | Codex 監督官モードの役割・規律 |
| `.codex/config.toml` | model / approval / sandbox |
| `scripts/codex/start-supervisor-nonstop.ps1` | 非対話起動スクリプト |
| `docs/templates/supervisor_review_report_template.md` | 検収レポート雛形 |
| `docs/codex_runs/20260507_supervisor_codex_boot.md` | 本ブート証跡（本ファイル） |

## Verification

手元での確認例（worktree ルートで）:

- `Select-String 'Supervisor Codex Mode' AGENTS.md`
- `Select-String 'Evidence-First Completion Rule' AGENTS.md`
- `Get-Content .\.codex\config.toml`
- `git diff --name-only origin/main...HEAD` が上表 5 ファイルのみ

## Risk

- Codex CLI（`codex`）が PATH にない環境では起動スクリプトが失敗する。
- `config.toml` の Windows elevated sandbox はローカルポリシーと整合させる必要がある。
- 監督官用と Claude 用（`CLAUDE.md`）の二系統があり、**どちらのエントリで起動したか**で参照する規律が異なる。

## 非エンジニア向け：達成できたこと

- Codex を **監督官として**起動するための **説明書（AGENTS）**と **ワンコマンド起動手順**をリポジトリに置いた。
- 工場・司令官側のコードは触らず、**このリポジトリ内だけ**で監督官の検収スタイルを固定した。

## 次の2ステップ：達成予定

1. Wave C（Commander repo）で **Codex 司令官モード**を同様にブートし、司令官–監督官の役割分担を揃える。
2. 実際の完了報告 1 件について、本テンプレで **PASS/PARTIAL/BLOCKED** の試運転レビューを行い、テンプレの不足があれば follow-up チケットで追記する。
