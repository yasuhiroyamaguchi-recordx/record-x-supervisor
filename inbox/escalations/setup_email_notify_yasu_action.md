# Y1-Y6 メール通知機構 Yasu セットアップ手順 v1.0

**配置先**: `inbox/escalations/setup_email_notify_yasu_action.md`
**起草日**: 2026-04-28(Day 130 末)
**起案 instance**: 監督官 instance A
**目的**: Yasu Day 131 朝に 1 回実施するセットアップ手順(以後自動稼働)
**所要時間**: 5 分

---

## §0. なぜ Yasu 直接実施が必要か

監督官 A は **app password を取得 / 保存できない構造**(セキュリティ確保)。Yasu PC ローカルに DPAPI 暗号化で保存し、監督官 A スクリプトが実行時のみ取得する設計。

これにより:
- 認証情報は git に乗らない(`.gitignore` で除外済)
- Yasu PC 外部へ流出しない(DPAPI = Yasu Windows ユーザー固有暗号化)
- 監督官 A は password 平文を見ない(`Get-Credential` プロンプト経由のみ Yasu が入力)

---

## §1. Step 1: Google Workspace でアカウント作成 + app password 生成

### 1-A. アカウント作成

Google Workspace 管理コンソール(`admin.google.com`)で:
- メールアドレス: `recordx-noreply@mam-s.info`
- 表示名: `Record X Supervisor`
- パスワード: 任意(後で app password を別途生成)

### 1-B. 2 段階認証を有効化

該当アカウントで 2 段階認証を ON にする(app password 生成の前提条件)。

### 1-C. app password 生成

1. `recordx-noreply@mam-s.info` でログイン
2. アカウント設定 → セキュリティ → 「アプリ パスワード」
3. アプリ名: `Record X Supervisor PowerShell`
4. **16 桁のパスワード(スペース無し)を生成 + 控える**
5. ※ Google は生成時に 1 回しか表示しないので、必ず控える

---

## §2. Step 2: Windows Credential を作成(Yasu PC で 1 回実行)

PowerShell を **管理者権限不要**で起動 + 以下を実行:

```powershell
$cred = Get-Credential -Message "Record X SMTP credential entry"
# プロンプト:
# User name: recordx-noreply@mam-s.info
# Password:  <Step 1-C で生成した 16 桁の app password>

$cred | Export-Clixml -Path "C:\RX_Dev\record-x-supervisor\sync\sync_script\.smtp.cred"
```

確認:
```powershell
Test-Path "C:\RX_Dev\record-x-supervisor\sync\sync_script\.smtp.cred"
# True なら成功
```

---

## §3. Step 3: 動作テスト(DryRun)

```powershell
cd C:\RX_Dev\record-x-supervisor
.\sync\sync_script\notify-yasu-email.ps1 -Trigger Y1 -Summary "setup test" -Body "test body" -DryRun
```

期待出力(抜粋):
```
[INFO] === DryRun mode ===
[INFO] From:    recordx-noreply@mam-s.info
[INFO] To:      yasuhiro.yamaguchi@mam-s.info
[INFO] Subject: [Record X] Y1 setup test - 2026-04-29 09:15 JST
[INFO] === DryRun complete (no actual send) ===
```

---

## §4. Step 4: 実送信テスト(本番送信、1 通)

```powershell
.\sync\sync_script\notify-yasu-email.ps1 -Trigger Y1 -Summary "setup verify" -Body "Y1-Y6 email notify mechanism setup complete. This is a one-time verification email from Record X Supervisor."
```

成功時:
- `yasuhiro.yamaguchi@mam-s.info` に件名 `[Record X] Y1 setup verify - 2026-04-29 09:XX JST` で着信
- `logs/email_notify/{timestamp}.log` に `Email sent` 記録
- `sync/sync_script/email_notify_state.json` に cooldown / daily count 記録

失敗時のトラブルシューティング:
- `SMTP send failed: The SMTP server requires a secure connection` → app password が間違っている、再生成
- `Credential file not found` → Step 2 が完了していない
- `No such host is known` → ファイアウォール / プロキシ問題

---

## §5. Step 5: Layer 0 統合確認(Day 131 朝の 5 分)

セットアップ完了後、Layer 0 entry point は自動的に Y1/Y3/Y5 trigger でメールを送信する。Yasu は 24h 以内に最初の auto-evt-recorder 検出 → メール着信を確認することで稼働確認可。

---

## §6. 運用後の管理

### 6-A. cooldown / daily count リセット

```powershell
Remove-Item "C:\RX_Dev\record-x-supervisor\sync\sync_script\email_notify_state.json"
# 次回送信時に自動再生成
```

### 6-B. credential 更新(app password 再生成時)

```powershell
$cred = Get-Credential -Message "Record X SMTP credential entry"
$cred | Export-Clixml -Path "C:\RX_Dev\record-x-supervisor\sync\sync_script\.smtp.cred"
# 既存ファイルは上書きされる
```

### 6-C. 通知停止(緊急時)

```powershell
# 即時 cooldown 上限を仮想満杯に
$state = @{
    last_sent_per_trigger = @{}
    daily_count = @{ Y1 = 999; Y3 = 999; Y5 = 999 }
    daily_count_date = (Get-Date -Format "yyyy-MM-dd")
}
$state | ConvertTo-Json | Set-Content -Path "C:\RX_Dev\record-x-supervisor\sync\sync_script\email_notify_state.json" -Encoding UTF8
```

---

## §7. セキュリティ確認

- ✅ `.smtp.cred` は DPAPI 暗号化(Yasu Windows ユーザー固有)
- ✅ `.gitignore` に `sync/sync_script/.smtp.cred` 登録済(本日末)
- ✅ 監督官 A スクリプトは password 平文を扱わない(`GetNetworkCredential()` 経由のみ)
- ✅ `email_config.json` は secrets を含まない(SMTP host / from / to のみ、git にコミット可)
- ✅ `email_notify_state.json` は git ignored(state は volatile)

---

## §8. 関連参照

- `sync/sync_script/notify-yasu-email.ps1` v0.1
- `sync/sync_script/email_config.json`
- `.gitignore`(本日末新設)
- `operations/escalation_and_rollback.md` §2 Y1-Y6 trigger 定義
- `sync/sync_script/auto-evt-recorder.ps1` v0.1(R1-R5 検出 → notify-yasu-email 呼出経路、Layer 0 統合)

---

## §9. 改訂履歴

- v1.0(2026-04-28 / Day 130 末): 初版起案、監督官 instance A 起案。Yasu 5 分セットアップ手順 + 動作確認 + 運用管理 + セキュリティ確認。
