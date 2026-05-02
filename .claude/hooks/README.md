# supervisor `.claude/hooks/`

監督官(`record-x-supervisor`)Claude Code 環境 hooks 配備領域。

## 配備済 hook

### `pretooluse_breaker_block.ps1`

- **目的**: 破壊系操作の deny 強制(force push / hard reset / rm -rf / DB drop / hook bypass 等)
- **配備経路**: `.claude/settings.json` の `hooks.PreToolUse` セクション
- **対象ツール**: `Bash`, `Edit`, `Write`, `PowerShell`
- **動作**: stdin JSON 解析 → 引数検査 → exit code 制御
  - `0` = allow(通常実行)
  - `2` = deny(完全ブロック、stderr に理由出力)
- **起源**: 環境層配備 Step 1(claude.ai 提案 1 番)、第 99 / 105 / 106 / 107 次発令経路、Day 131 朝起動時実装(2026-05-03)
- **規律**: 既存装置拡張 = 新規装置追加禁止令該当外 + Plan-First 例外 (iii) 該当

### `test_pretooluse_breaker_block.ps1`

- **目的**: hook 動作テスト 20 ケース(deny 11 件 + allow 9 件)
- **実行**: `powershell -NoProfile -ExecutionPolicy Bypass -File .claude/hooks/test_pretooluse_breaker_block.ps1`
- **初回テスト結果**(Day 131 朝、2026-05-03): 20 PASS / 0 FAIL

## deny カテゴリ

| Pattern | 理由 |
|---|---|
| `git push --force` / `-f` | force push 禁止(明示承認経路へ) |
| `git reset --hard origin/HEAD~/HEAD^` | hard reset to remote/older 禁止 |
| `git branch -D main/master` | main/master 削除禁止 |
| `git push ... :main` | main remote 削除 push 禁止 |
| `rm -rf /` / `rm -rf ~` / `rm -rf $HOME` | 全消去禁止 |
| `DROP DATABASE/SCHEMA/TABLE` | DB DROP 禁止 |
| `TRUNCATE TABLE` | TRUNCATE 禁止 |
| `--no-verify` / `--no-gpg-sign` | hook bypass / 署名 bypass 禁止 |

## bypass 例外条件

| 条件 | 該当例 |
|---|---|
| (i) ヤス明示「即実行」指示 | 「force push 承認」「即実行」等 |
| (ii) 環境修復(物理装置不稼働) | M2.6-B + Layer1/3 修復継続中の操作 |
| (iii) 既存装置通常運用(LOC 増減なし) | sync-orders.ps1 等の定常実行 |

bypass 発動経路: ヤス明示承認 + 監督官 A → ヤスへ申請 + 完遂後 EVT 候補正式記録(透明性確保)。

## 関連発令

- 第 99 次(claude.ai 提案 6 件 + 設計素材 v0.1)
- 第 105 次(4 件統合整流)
- 第 106 次(バックエンド統合 GO 起動正式宣言 + Step 1 着手宣言)
- 第 107 次(本 hook 配備完遂報告 + 司令官 α 認識共有)

## 関連 EVT

- EVT 候補(系列 N 第 N 例): 配備成功 = 健全運動性継承
- EVT 候補(Bash vs PowerShell 経路非対称性): 本日朝発見、別途記録要
