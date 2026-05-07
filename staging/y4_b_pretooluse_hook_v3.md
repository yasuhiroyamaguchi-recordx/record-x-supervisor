---
id: Y4-B-PRETOOLUSE-HOOK-V3
title: Y4-B PreToolUse hook 詳細設計 v3(settings 上書き禁止 + fail open 反映)
status: DRAFT_FOR_YASU_DECISION
authority: supervisor_drafted
downstream_allowed: false
created_at: 2026-05-07
updated_at: 2026-05-07
created_by: 監督官 A (Argus / supervisor A-line)
yasu_modification_v2_to_v3:
  - "settings.json + hook ファイル自身の Write/Edit を block(自己改ざん回避)"
  - "hook script 自体が error / unavailable / syntax error → fail open(exit 0、業務停止回避)"
prior_versions:
  - "v1: 2026-05-07 朝末末末(`outbox/20260507_to_commander_a133.md` §3、ヤス差戻し)"
  - "v2: 2026-05-07 朝末末末末(本会話、ヤス再差戻し with settings 上書き禁止 + fail open 要請)"
yasu_decision_pending: true
related_evt: EVT-20260507-120
target_file_after_approval: ProjectRX_HQ/wt_common/.claude/hooks/pretooluse_ticket_block.ps1 + .claude/settings.json
---

# Y4-B PreToolUse hook 詳細設計 v3(ヤス採否対象、commit なし)

## 0. 結論先出し

| § | 内容 |
|---|---|
| § ヤス v2 採否 | 差戻し → v3 修正要請(settings 上書き禁止 + hook 異常時 fail open) |
| § v3 修正点 | (1) hook が `wt_common/.claude/settings.json` および `wt_common/.claude/hooks/*.ps1` 自身を block(自己改ざん回避) + (2) hook script 異常時 = fail open(exit 0、業務継続) |
| § 採否経路 | 監督官 A → ヤス → 採否完遂後 → 司令官 α 経由工場長発令(別 DO-FACTORY-{NNN}) |
| § Y3 / WAVE H / WAVE Q とは別ライン | ヤス指示「別判断として扱う」遵守 |

---

## 1. v2 → v3 主要変更点

| 項目 | v2 案(差戻し前) | v3 修正案(本案) |
|---|---|---|
| 検出対象 | `Write` 全件 + `Edit/MultiEdit` は `wt_common/tickets/` 配下既存のみ allow | 同左 + **`.claude/settings.json` + `.claude/hooks/*` への Write/Edit 全件 block**(自己改ざん回避) |
| 異常時動作 | settings.json hooks entry 削除で即時無効化(rollback 前提)= **fail close** | hook script error / unavailable / syntax error / pwsh 不在 → **exit 0**(allow、業務継続)= **fail open** |
| false positive 時 | 業務停止 → 暫定 hooks 削除で復旧 | exit 0 = 業務継続 + 監督官 A への異常レポート log 記録 |
| log 装置 | 言及なし | hook 起動毎に簡易 log(ファイルパス + tool name + 結果)= 監視 + 後検証経路 |

---

## 2. v3 動作仕様(完全版)

### 2-A. 検出対象 + 判定マトリクス

| 操作 | path | 判定 | 根拠 |
|---|---|---|---|
| `Write` | `wt_common/tickets/DO-*.md`(新規)| 🔴 block | ヤス指示(v2 反映) |
| `Write` | `wt_common/tickets/` 外の `DO-*.md`(新規)| 🔴 block | 同上 |
| `Edit` / `MultiEdit` | `wt_common/tickets/DO-*.md`(既存) | 🟢 allow | 司令官配信済 ticket 内容修正 |
| `Edit` / `MultiEdit` | `wt_common/tickets/` 外の `DO-*.md`(既存)| 🔴 block | SSOT 配信先以外、整流対象 |
| `Edit` / `MultiEdit` | `wt_common/tickets/DO-*.md`(不在)| 🔴 block | Edit 偽装 Write 防護 |
| **`Write` / `Edit` / `MultiEdit`** | **`wt_common/.claude/settings.json`** | 🔴 **block(v3 新規)**| **自己改ざん回避(ヤス指示反映)** |
| **`Write` / `Edit` / `MultiEdit`** | **`wt_common/.claude/hooks/*.ps1`** | 🔴 **block(v3 新規)**| 同上 |
| `Write` | 実装コード(`functions/src/*.ts`、`dashboard/src/*.tsx` 等)| 🟢 allow | 通常実装、DO-*.md パターン非該当 + .claude/ 配下非該当 |
| `Bash` | `pwsh sync-tickets.ps1` | 🟢 hook 範囲外 | spawn pwsh プロセス、Claude Code Write tool 非経由 |
| `Bash` | `git mv tickets/DO-*.md tickets_completed/` | 🟢 hook 範囲外 | 同上 |

### 2-B. 検出ロジック擬似コード(v3 完全版)

```powershell
# pretooluse_ticket_block.ps1 (v3 完全版擬似コード)
# 配置: ProjectRX_HQ/wt_common/.claude/hooks/pretooluse_ticket_block.ps1
# 起動: PreToolUse hook、matcher = "Write|Edit|MultiEdit|NotebookEdit"
# 規律: fail open(error 時は exit 0、業務継続)+ self-modification block(.claude/ 配下保護)

param([string]$ToolInput)

# === fail open guard 1: 入力 parse error 時 ===
try {
    $inputJson = $ToolInput | ConvertFrom-Json -ErrorAction Stop
} catch {
    # 入力 parse error = hook 機能不全 → fail open
    Write-Warning "PRETOOLUSE_HOOK: input parse failed, fail open. err=$_"
    Add-LogEntry -Status "FAIL_OPEN_PARSE_ERROR" -ToolInput $ToolInput
    exit 0
}

$toolName = $inputJson.tool_name
$filePath = $inputJson.file_path

# === fail open guard 2: 必須 field 不在 ===
if (-not $toolName -or -not $filePath) {
    Write-Warning "PRETOOLUSE_HOOK: required fields missing, fail open. tool=$toolName path=$filePath"
    Add-LogEntry -Status "FAIL_OPEN_MISSING_FIELD" -ToolName $toolName -FilePath $filePath
    exit 0
}

# === Self-modification block(v3 新規、ヤス指示反映)===
$selfPaths = @(
    'wt_common[/\\]\.claude[/\\]settings\.json$',
    'wt_common[/\\]\.claude[/\\]hooks[/\\].*\.ps1$',
    'wt_common[/\\]\.claude[/\\]settings\.local\.json$'
)
foreach ($pattern in $selfPaths) {
    if ($filePath -match $pattern) {
        Write-Error "BLOCKED: self-modification of .claude/ configuration is forbidden (Y4-B v3 self-protection). path=$filePath"
        Add-LogEntry -Status "BLOCKED_SELF_MODIFICATION" -ToolName $toolName -FilePath $filePath
        exit 1
    }
}

# === DO-*.md パターン検出 ===
if ($filePath -notmatch 'DO-[A-Z]+-[A-Z0-9-]+\.md$') {
    # DO-*.md でない = 対象外、許可
    exit 0
}

# === Write tool による DO-*.md 新規作成 = 全件 block(v2 仕様)===
if ($toolName -eq 'Write') {
    Write-Error "BLOCKED: DO-*.md creation by Write tool is forbidden in factory repo (EVT-120). Use sync-tickets via 司令官 α. path=$filePath"
    Add-LogEntry -Status "BLOCKED_WRITE_DO_TICKET" -ToolName $toolName -FilePath $filePath
    exit 1
}

# === Edit / MultiEdit による DO-*.md 編集 ===
if ($toolName -in @('Edit', 'MultiEdit')) {
    # path 検証: wt_common/tickets/ 配下のみ許可
    if ($filePath -notmatch 'wt_common[/\\]tickets[/\\]DO-') {
        Write-Error "BLOCKED: DO-*.md edit outside wt_common/tickets/ is forbidden. SSOT = 司令官 sync-tickets 配信先のみ。path=$filePath"
        Add-LogEntry -Status "BLOCKED_EDIT_OUTSIDE_TICKETS" -ToolName $toolName -FilePath $filePath
        exit 1
    }

    # 既存ファイル確認 = Edit 偽装の Write 防護(fail open guard 含む)
    try {
        if (-not (Test-Path $filePath)) {
            Write-Error "BLOCKED: target DO-*.md does not exist. Edit tool must target existing files only. path=$filePath"
            Add-LogEntry -Status "BLOCKED_EDIT_NONEXISTENT" -ToolName $toolName -FilePath $filePath
            exit 1
        }
    } catch {
        # Test-Path error = fail open
        Write-Warning "PRETOOLUSE_HOOK: Test-Path failed, fail open. err=$_"
        Add-LogEntry -Status "FAIL_OPEN_TESTPATH_ERROR" -ToolName $toolName -FilePath $filePath
        exit 0
    }

    # 既存ファイル + wt_common/tickets/ 配下 = 許可
    Add-LogEntry -Status "ALLOW_EDIT_EXISTING_TICKET" -ToolName $toolName -FilePath $filePath
    exit 0
}

# === その他の matcher (NotebookEdit 等) = 通常通過(後段の hook に委譲) ===
exit 0


# === log 関数(簡易)===
function Add-LogEntry {
    param($Status, $ToolName, $FilePath, $ToolInput)
    try {
        $logPath = Join-Path $PSScriptRoot "..\..\logs\pretooluse_hook.log"
        $logDir = Split-Path $logPath -Parent
        if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
        $entry = @{
            timestamp = (Get-Date -Format 'o')
            status = $Status
            tool_name = $ToolName
            file_path = $FilePath
        } | ConvertTo-Json -Compress
        Add-Content -Path $logPath -Value $entry -Encoding UTF8 -ErrorAction SilentlyContinue
    } catch {
        # log error 自体は fail open(hook の主機能に影響させない)
    }
}
```

### 2-C. fail open 条件 一覧(v3 新規明文化)

| 異常パターン | 動作 | rollback 経路 |
|---|---|---|
| 入力 JSON parse error | exit 0(allow) + log: FAIL_OPEN_PARSE_ERROR | log 監視で異常検知、settings.json は変更不要 |
| 必須 field(tool_name / file_path)不在 | exit 0(allow) + log: FAIL_OPEN_MISSING_FIELD | 同上 |
| Test-Path error | exit 0(allow) + log: FAIL_OPEN_TESTPATH_ERROR | 同上 |
| ps1 ファイル不在 | hook 起動失敗(Claude Code 仕様による) → 通常通過 | settings.json から hooks entry 削除で完全無効化 |
| ps1 syntax error | pwsh.exe が exit code 0 を返さない場合 = Claude Code 仕様で操作 fail = **業務停止リスク** → 緊急 rollback 経路明示(後述 §4) |
| pwsh.exe 不在 | settings.json で `powershell` フォールバック追加(後述 §4) |
| log 書込 error | log 記録のみ失敗、hook 主機能は exit 0/1 を正常返却 | log dir 作成失敗時も hook 機能継続 |

---

## 3. block / allow 例 v3 完全版(self-modification block 追加)

### 3-A. block 対象(v3 完全版)

| 操作 | path | 判定 | 根拠 |
|---|---|---|---|
| `Write` | `wt_common/tickets/DO-CODEX-MIG-009.md`(新規)| 🔴 block | Write 全件(EVT-120)|
| `Write` | `wt_common/tickets/DO-FACTORY-300.md`(新規)| 🔴 block | 同上 |
| `Write` | `wt_common/factory/state/tickets/DO-*.md`(自前 path)| 🔴 block | path 外 + Write 二重違反 |
| `Edit` | `wt_common/factory/state/tickets/DO-*.md`(path 外既存)| 🔴 block | SSOT 配信先以外 |
| `Edit` | `wt_common/tickets/DO-FACTORY-999.md`(不在)| 🔴 block | Edit 偽装 Write |
| **`Write`** | **`wt_common/.claude/settings.json`** | 🔴 **block(v3 新規)**| 自己改ざん回避 |
| **`Edit`** | **`wt_common/.claude/settings.json`** | 🔴 **block(v3 新規)**| 同上 |
| **`Write`** | **`wt_common/.claude/hooks/pretooluse_ticket_block.ps1`** | 🔴 **block(v3 新規)**| 同上(hook 自身) |
| **`Edit`** | **`wt_common/.claude/hooks/*.ps1`** | 🔴 **block(v3 新規)**| 同上 |
| **`Write`** | **`wt_common/.claude/settings.local.json`** | 🔴 **block(v3 新規)**| 自己改ざん回避(local 設定も含む)|

### 3-B. allow 対象(v3 完全版)

| 操作 | path | 判定 |
|---|---|---|
| `Edit` / `MultiEdit` | `wt_common/tickets/DO-FACTORY-225.md`(配信済、存在)| 🟢 allow |
| `Write` | `wt_common/functions/src/auth.ts` | 🟢 allow |
| `Write` | `wt_common/dashboard/src/components/StatusPill.tsx` | 🟢 allow |
| `Write` | `wt_common/internal/circular/circular_*.md`(軸 D 配備後)| 🟢 allow |
| `Edit` | `wt_common/AGENTS.md`(軸 E 規律改訂)| 🟢 allow |
| `Bash` | `pwsh sync-tickets.ps1 ...` | 🟢 hook 範囲外 |
| `Bash` | `git mv tickets/DO-*.md tickets_completed/` | 🟢 hook 範囲外 |
| (異常時 fail open)| 任意 | 🟢 allow + log |

### 3-C. 自己改ざん経路(`wt_common/.claude/` 配下) = 別ルートでのみ可能

| 経路 | 内容 |
|---|---|
| 直接 `Bash` 経由 `pwsh.exe -File ...` で settings.json 編集 | hook 範囲外(spawn pwsh)= 通過。ただし AGENTS.md / CLAUDE.md 規律で禁止文言追加推奨 |
| ヤス手動編集(エディタ直接)| hook 範囲外 = 通過、ヤス権限 |
| 司令官 α からの sync 経路 | 想定外(司令官は工場長 repo 編集なし、関係性ポリシー §3.2)|
| Claude Code Write/Edit/MultiEdit | 🔴 block(v3 新規) |

= **AI エージェントによる .claude/ 編集を物理的に阻止**(ヤス指示反映)

---

## 4. rollback 手順(v3 完全版、緊急時)

| ステップ | 内容 | 緊急度 |
|---|---|---|
| 0 | log 確認(`wt_common/logs/pretooluse_hook.log`)= 異常パターン特定 | low |
| 1 | hook が誤動作で全 Write/Edit を block している場合 → **`Bash` 経由 settings.json hooks entry 削除**(hook 範囲外、緊急回避経路) | 🔴 emergency |
| 2 | settings.json hooks entry 削除を `git revert` または `pwsh.exe -Command "Set-Content ..."` で実施(hook 範囲外) | high |
| 3 | hook ファイル(`pretooluse_ticket_block.ps1`)の修正 = `Bash` 経由 spawn pwsh で書き換え(hook 範囲外、self-modification block 回避経路) | high |
| 4 | rollback 後の規律維持 = 軸 A(CLAUDE.md §5)+ 軸 E(AGENTS.md §3) | medium |
| 5 | rollback 起因事象を EVT 候補正式記録(系列 X 候補) | medium |

### 4-A. pwsh.exe フォールバック(v3 新規)

settings.json hooks 設定に **`pwsh.exe` 不在時の `powershell` フォールバック**を追加:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "if exist \"%PROGRAMFILES%\\PowerShell\\7\\pwsh.exe\" (pwsh.exe -NoProfile -ExecutionPolicy Bypass -File C:\\RX_Dev\\ProjectRX_HQ\\wt_common\\.claude\\hooks\\pretooluse_ticket_block.ps1) else (powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\\RX_Dev\\ProjectRX_HQ\\wt_common\\.claude\\hooks\\pretooluse_ticket_block.ps1)"
          }
        ]
      }
    ]
  }
}
```

= pwsh.exe 不在環境でも `powershell.exe`(Windows PowerShell 5.1)で fallback 起動可能。

---

## 5. settings.json マージ案(v3 完全版)

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "deny": [ /* 既存維持(.env / secrets / production / force push / rm -rf 等) */ ],
    "allow": [ /* 既存維持(npm / npx / cd / grep / cat / mkdir / cp / git push origin feat 等) */ ]
  },
+ "hooks": {
+   "PreToolUse": [
+     {
+       "matcher": "Write|Edit|MultiEdit|NotebookEdit",
+       "hooks": [
+         {
+           "type": "command",
+           "command": "if exist \"%PROGRAMFILES%\\PowerShell\\7\\pwsh.exe\" (pwsh.exe -NoProfile -ExecutionPolicy Bypass -File C:\\RX_Dev\\ProjectRX_HQ\\wt_common\\.claude\\hooks\\pretooluse_ticket_block.ps1) else (powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\\RX_Dev\\ProjectRX_HQ\\wt_common\\.claude\\hooks\\pretooluse_ticket_block.ps1)"
+         }
+       ]
+     }
+   ]
+ }
}
```

---

## 6. Codex 補完前提(v2 と同様、変更なし)

| 補完軸 | 内容 | 状態 |
|---|---|---|
| 軸 E AGENTS.md §3 | Codex 起動時必読、規律レベル防止 | ✅ ヤス Y4-E 採択済(第 133/135 次経路)|
| 将来軸 C CI/PR gate(do-id-existence-check.yml + DO-G-013 role boundary check 拡張)| GitHub Actions 側で DO-* prefix 照合 = Castor + Codex 両対応 | 🟡 三社円卓 X-4 候補(保留中、DO-G-013 が既に部分対応)|
| 監督官側 ticket_id_collision_check.ps1(commander 既設定中)| 上流(司令官)で番号衝突検出 | 🟡 司令官 α 起案待機(WAVE H DO-COMMANDER-051 と関連)|

= **Codex は本軸 B hook 不発火**を前提として、軸 E + 将来軸 C(DO-G-013 拡張可)+ commander 上流 collision_check の 3 層補完。

---

## 7. ヤス採否要請(Y4-B v3)

| 採否選択肢 | 内容 |
|---|---|
| **(S) 採択** | v3 完全版仕様確定 → 司令官 α 経由工場長発令チケット起案要請(別 DO-FACTORY-{NNN}、第 136 次発令予定)|
| **(P) 部分採択** | (a) self-modification block 範囲修正 / (b) fail open 条件追加 / (c) log 装置追加 / (d) pwsh.exe fallback 修正 |
| **(R) 整流要請** | 別 hook 設計 / matcher / 検出ロジック / fail mode 設計案要請 |

---

## 8. 旧 v1 / v2 / v3 主要変更点 累積表

| 観点 | v1(初版) | v2(差戻し後) | v3(本案、ヤス指示反映) |
|---|---|---|---|
| Write block 範囲 | wt_common/tickets/ 外のみ | **全 path で原則 block** | 同 v2 |
| Edit/MultiEdit allow | 言及なし | wt_common/tickets/ 配下既存のみ | 同 v2 |
| self-modification block | ❌ なし | ❌ なし | ✅ **追加(.claude/ 配下保護)** |
| 異常時動作 | fail close(rollback 前提)| fail close | ✅ **fail open(業務継続)** |
| log 装置 | ❌ なし | ❌ なし | ✅ **追加(JSON Lines、簡易監視)** |
| pwsh.exe fallback | ❌ なし | ❌ なし | ✅ **追加(powershell.exe フォールバック)** |
| Codex 補完 | 言及なし | 5 層防護記述 | 同 v2(変更なし)|
| block/allow 例 | 6 項目 | 14 項目 | **18 項目**(self-modification 4 件追加) |

---

## 9. 改訂履歴

- v3.0(2026-05-07 朝末末末末末末末末、Day 135 朝 第 7 サイクル):ヤス採否「Y4-B v2 = 別ライン、settings 上書き禁止 + hook 異常時 fail open 反映」契機。v2 仕様を基準に (1) self-modification block(.claude/settings.json + .claude/hooks/*)+ (2) fail open(全 error path で exit 0)+ (3) log 装置 + (4) pwsh.exe fallback を追加。司令官 α 採否対象外、ヤス採否経路。

---

*監督官 A Y4-B PreToolUse hook 詳細設計 v3(staging、commit 配置のみ、ヤス採否対象、別ライン)*
*「v2 + self-modification block + fail open + log + pwsh fallback = 業務継続性 + 自己改ざん回避 + 異常監視 = ヤス指示完全反映」*
