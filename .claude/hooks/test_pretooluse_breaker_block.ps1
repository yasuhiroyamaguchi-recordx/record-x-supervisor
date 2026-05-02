# PreToolUse hook テストスクリプト(動作確証用)
# 実行: powershell -NoProfile -ExecutionPolicy Bypass -File .claude/hooks/test_pretooluse_breaker_block.ps1

param()

$ErrorActionPreference = 'Continue'

$hookPath = Join-Path $PSScriptRoot 'pretooluse_breaker_block.ps1'

$tests = @(
  @{ Name='deny: git push --force';        Json='{"tool_name":"Bash","tool_input":{"command":"git push --force origin main"}}';     Expected=2 },
  @{ Name='deny: git push -f';             Json='{"tool_name":"Bash","tool_input":{"command":"git push -f origin main"}}';          Expected=2 },
  @{ Name='deny: git reset --hard origin'; Json='{"tool_name":"Bash","tool_input":{"command":"git reset --hard origin/main"}}';     Expected=2 },
  @{ Name='deny: git reset --hard HEAD~1'; Json='{"tool_name":"Bash","tool_input":{"command":"git reset --hard HEAD~1"}}';          Expected=2 },
  @{ Name='deny: git branch -D main';      Json='{"tool_name":"Bash","tool_input":{"command":"git branch -D main"}}';               Expected=2 },
  @{ Name='deny: rm -rf /';                Json='{"tool_name":"Bash","tool_input":{"command":"rm -rf / "}}';                        Expected=2 },
  @{ Name='deny: rm -rf ~';                Json='{"tool_name":"Bash","tool_input":{"command":"rm -rf ~"}}';                         Expected=2 },
  @{ Name='deny: DROP TABLE';              Json='{"tool_name":"Bash","tool_input":{"command":"psql -c DROP TABLE users"}}';         Expected=2 },
  @{ Name='deny: TRUNCATE TABLE';          Json='{"tool_name":"Bash","tool_input":{"command":"psql -c TRUNCATE TABLE x"}}';         Expected=2 },
  @{ Name='deny: --no-verify';             Json='{"tool_name":"Bash","tool_input":{"command":"git commit -m foo --no-verify"}}';    Expected=2 },
  @{ Name='deny: --no-gpg-sign';           Json='{"tool_name":"Bash","tool_input":{"command":"git commit --no-gpg-sign"}}';         Expected=2 },
  @{ Name='allow: git push origin main';   Json='{"tool_name":"Bash","tool_input":{"command":"git push origin main"}}';             Expected=0 },
  @{ Name='allow: git status';             Json='{"tool_name":"Bash","tool_input":{"command":"git status"}}';                       Expected=0 },
  @{ Name='allow: git reset HEAD foo';     Json='{"tool_name":"Bash","tool_input":{"command":"git reset HEAD foo.txt"}}';           Expected=0 },
  @{ Name='allow: rm -rf foo/';            Json='{"tool_name":"Bash","tool_input":{"command":"rm -rf foo/bar"}}';                   Expected=0 },
  @{ Name='allow: ls -la';                 Json='{"tool_name":"Bash","tool_input":{"command":"ls -la"}}';                           Expected=0 },
  @{ Name='allow: Edit normal file';       Json='{"tool_name":"Edit","tool_input":{"file_path":"foo.md","old_string":"a","new_string":"b"}}'; Expected=0 },
  @{ Name='allow: Write normal file';      Json='{"tool_name":"Write","tool_input":{"file_path":"foo.md"}}';                        Expected=0 },
  @{ Name='allow: empty input';            Json='{}';                                                                                Expected=0 },
  @{ Name='allow: non-target tool (Read)'; Json='{"tool_name":"Read","tool_input":{"file_path":"x"}}';                              Expected=0 }
)

$pass = 0
$fail = 0
$failures = @()

foreach($t in $tests){
  $stderr = $t.Json | powershell -NoProfile -ExecutionPolicy Bypass -File $hookPath 2>&1
  $code = $LASTEXITCODE
  $ok = ($code -eq $t.Expected)
  if($ok){
    $pass++
    Write-Output ("[PASS] {0,-40} expected={1} actual={2}" -f $t.Name, $t.Expected, $code)
  } else {
    $fail++
    $failures += "$($t.Name) — expected=$($t.Expected) actual=$code stderr=$stderr"
    Write-Output ("[FAIL] {0,-40} expected={1} actual={2} stderr={3}" -f $t.Name, $t.Expected, $code, $stderr)
  }
}

Write-Output ""
Write-Output ("=== Total: {0} PASS / {1} FAIL / {2} total ===" -f $pass, $fail, ($pass + $fail))

if($fail -gt 0){
  exit 1
} else {
  exit 0
}
