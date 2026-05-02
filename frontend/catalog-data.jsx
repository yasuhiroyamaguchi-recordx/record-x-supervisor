// ─────────────────────────────────────────────────────
// 機能カタログ データ定義
// 三官棚卸し：supervisor v0.5/v0.6 + commander 0edd976 + factory PR #1020
// ─────────────────────────────────────────────────────

// 軸定義（5軸）
const CAT_OWNERS = {
  kantoku: { label: '監督官・甲号', short: '監督官' },
  shirei:  { label: '司令官・乙号', short: '司令官' },
  kojo:    { label: '工場長・丙号', short: '工場長' },
  joint:   { label: '三官共同',     short: '三官' },
};

const CAT_KINDS = {
  governance: { label: '統制',     desc: '規範・採否・境界制御' },
  routing:    { label: '経路',     desc: '指揮系統・委譲・伝達' },
  context:    { label: '文脈',     desc: 'ハンドオフ・圧縮・記憶' },
  exec:       { label: '実行',     desc: 'ビルド・CI・処務遂行' },
  observe:    { label: '観測',     desc: '監視・計測・通報' },
  archive:    { label: '記録',     desc: '記録庫・史実・追跡' },
};

const CAT_ORIGINS = {
  charter:   { label: '機関憲章',   desc: '創設時に規定された基幹機能' },
  decree:    { label: '指令導出',   desc: '上位機関の指令により実装' },
  fieldfix:  { label: '現場改修',   desc: '実務上の必要から派生' },
  emerg:     { label: '非常派生',   desc: '事故対応から正規化' },
};

const CAT_PHASES = {
  A: { label: 'Phase A', desc: '基盤期（憲章定立・三官分立）',     weight: 0.85 },
  B: { label: 'Phase B', desc: '実装期（自動化・連動装置）',       weight: 1.00 },
  C: { label: 'Phase C', desc: '熟成期（自律運用・新陳代謝）',     weight: 0.75 },
  D: { label: 'Phase D', desc: '展望期（外部連携・異種機関）',     weight: 0.50 },
};

const CAT_STATES = {
  active:     { label: '稼働中',     mark: '🟢', c: 'var(--ok)',     bg: 'var(--ok-soft)' },
  warn:       { label: '警告',       mark: '🟡', c: 'var(--warn)',   bg: 'var(--warn-soft)' },
  error:      { label: 'エラー',     mark: '🔴', c: 'var(--crit)',   bg: 'var(--crit-soft)' },
  halted:     { label: '停止',       mark: '⚫', c: 'var(--ink-3)',  bg: 'var(--bg-soft)' },
  superseded: { label: 'SUPERSEDED', mark: '📦', c: 'var(--ink-4)',  bg: 'var(--bg-sunken)' },
};

// ─────────────────────────────────────────────────────
// 機能項目定義
// id: FN-機関-番号
// scores: usage 0-100 / quality 0-100 / linkages 連動装置数 / phaseWeight
// 総合 = (usage*0.35 + quality*0.30 + min(linkages*8,40)*0.20 + phaseWeight*100*0.15)
// ─────────────────────────────────────────────────────
const CAT_FEATURES = [
  // 監督官・甲号（v0.5 → v0.6）
  { id: 'FN-K-001', name: '規範違反 自動検知', owner: 'kantoku', kind: 'governance', origin: 'charter', phase: 'B',
    state: 'active', version: 'v0.6.0', updatedAt: '本日 15:00', changedToday: true,
    usage: 92, quality: 88, linkages: 6, deps: ['FN-J-002', 'FN-K-003'],
    desc: '役割境界§5の違反を全機関の通信から検出し、是正勧告を発出する。' },
  { id: 'FN-K-002', name: '採否権限 ガード', owner: 'kantoku', kind: 'governance', origin: 'charter', phase: 'A',
    state: 'active', version: 'v0.6.0', updatedAt: '本日 15:00', changedToday: true,
    usage: 78, quality: 95, linkages: 5, deps: [],
    desc: 'ヤス採否権限の自動代行を禁則化。SUPERSEDED 削除も本ガードに委ねる。' },
  { id: 'FN-K-003', name: '介入頻度 観測', owner: 'kantoku', kind: 'observe', origin: 'fieldfix', phase: 'B',
    state: 'active', version: 'v0.5.2', updatedAt: '昨日 11:42',
    usage: 65, quality: 82, linkages: 3, deps: ['FN-K-001'],
    desc: '管理者の介入頻度を時系列で観測。依存度の自己観察として常時露出。' },
  { id: 'FN-K-004', name: '監督会話 抜粋表示', owner: 'kantoku', kind: 'archive', origin: 'fieldfix', phase: 'B',
    state: 'active', version: 'v0.6.0', updatedAt: '本日 15:00', changedToday: true,
    usage: 71, quality: 76, linkages: 2, deps: [],
    desc: '監督官の Claude Code 出力を直近の会話プレビューで露出。' },
  { id: 'FN-K-901', name: '即時介入 直接指示', owner: 'kantoku', kind: 'governance', origin: 'fieldfix', phase: 'A',
    state: 'superseded', version: 'v0.4.x', updatedAt: '14日前', supersededBy: 'FN-K-001',
    usage: 8, quality: 40, linkages: 0, deps: [],
    desc: '監督官が部門長に直接介入する旧経路。役割境界§5により禁則化、規範違反検知に統合。' },

  // 司令官・乙号（commit 0edd976）
  { id: 'FN-J-001', name: '指令発出 経路', owner: 'shirei', kind: 'routing', origin: 'charter', phase: 'A',
    state: 'active', version: '0edd976', updatedAt: '本日 15:38', changedToday: true,
    usage: 96, quality: 91, linkages: 7, deps: ['FN-J-002'],
    desc: '指揮系統に整合した発出先候補のみを呈示。Plan-First チェック標準装備。' },
  { id: 'FN-J-002', name: '部門委譲 振分', owner: 'shirei', kind: 'routing', origin: 'charter', phase: 'A',
    state: 'active', version: '0edd976', updatedAt: '本日 15:38', changedToday: true,
    usage: 89, quality: 87, linkages: 5, deps: ['FN-J-001'],
    desc: '案件を所掌に応じて4部門長へ振分。文脈逼迫機関は自動退避経路へ。' },
  { id: 'FN-J-003', name: '円卓会議 アジェンダ', owner: 'shirei', kind: 'routing', origin: 'decree', phase: 'B',
    state: 'active', version: '0edd976', updatedAt: '本日 15:38', changedToday: true,
    usage: 54, quality: 80, linkages: 4, deps: ['FN-J-001'],
    desc: '同型機/異型機円卓のアジェンダ→プラン→GO の三段フロー。' },
  { id: 'FN-J-004', name: '介入頻度 自己露出', owner: 'shirei', kind: 'observe', origin: 'fieldfix', phase: 'B',
    state: 'warn', version: '0edd976', updatedAt: '本日 15:38', changedToday: true,
    usage: 62, quality: 68, linkages: 2, deps: ['FN-K-003'],
    desc: '司令官介入頻度を週41回として露出。長期推移グラフは未実装。' },
  { id: 'FN-J-005', name: '部門編成 切替', owner: 'shirei', kind: 'governance', origin: 'decree', phase: 'C',
    state: 'active', version: '0edd976', updatedAt: '本日 15:38', changedToday: true,
    usage: 31, quality: 74, linkages: 3, deps: [],
    desc: '現行構成 / Care・Tax・Edu-RX 拡張の二系統を運用上で切替可能。' },
  { id: 'FN-J-902', name: '部門長 直接対話', owner: 'shirei', kind: 'routing', origin: 'fieldfix', phase: 'A',
    state: 'superseded', version: 'pre-0edd976', updatedAt: '21日前', supersededBy: 'FN-J-002',
    usage: 4, quality: 30, linkages: 0, deps: [],
    desc: '部門長同士を司令官経由せず連絡させる旧経路。役割境界§5禁則により廃止。' },

  // 工場長・丙号（PR #1020）
  { id: 'FN-F-001', name: 'CI 看板', owner: 'kojo', kind: 'observe', origin: 'decree', phase: 'B',
    state: 'active', version: 'PR #1020', updatedAt: '本日 15:41', changedToday: true,
    usage: 88, quality: 84, linkages: 5, deps: ['FN-F-002'],
    desc: '進行中/PASS/停止/FAIL の状態カード。停止案件には再稼働ボタン。' },
  { id: 'FN-F-002', name: '玉詰まり 再稼働', owner: 'kojo', kind: 'exec', origin: 'fieldfix', phase: 'B',
    state: 'active', version: 'PR #1020', updatedAt: '本日 15:41', changedToday: true,
    usage: 73, quality: 79, linkages: 3, deps: ['FN-F-001'],
    desc: 'CI 停止時に依存解決のうえ単一ステップで再稼働。' },
  { id: 'FN-F-003', name: 'Git push 同期', owner: 'kojo', kind: 'context', origin: 'decree', phase: 'B',
    state: 'active', version: 'PR #1020', updatedAt: '本日 15:41', changedToday: true,
    usage: 81, quality: 86, linkages: 4, deps: [],
    desc: 'AUTO/MANUAL 切替。チェックポイント毎/セッション終了時/手動の3方針。' },
  { id: 'FN-F-004', name: 'ハンドオフ 結晶化', owner: 'kojo', kind: 'context', origin: 'decree', phase: 'B',
    state: 'active', version: 'PR #1020', updatedAt: '本日 15:41', changedToday: true,
    usage: 76, quality: 82, linkages: 4, deps: ['FN-F-003'],
    desc: '全文 .md と結晶化要約の二段構成。24h or 閾値超で自動再生成。' },
  { id: 'FN-F-005', name: 'コンテキスト 自動退避', owner: 'kojo', kind: 'context', origin: 'emerg', phase: 'B',
    state: 'active', version: 'PR #1020', updatedAt: '本日 15:41', changedToday: true,
    usage: 69, quality: 77, linkages: 3, deps: ['FN-F-004'],
    desc: '文脈使用率 85% 超で次回チェックポイントに圧縮処置を予約。' },
  { id: 'FN-F-006', name: 'クリア推奨 バナー', owner: 'kojo', kind: 'context', origin: 'fieldfix', phase: 'B',
    state: 'active', version: 'PR #1020', updatedAt: '本日 15:41', changedToday: true,
    usage: 58, quality: 71, linkages: 2, deps: ['FN-F-005'],
    desc: '80%超で詳細画面の最上部に常駐。手動 clear ボタンを提示（ヤス権限維持）。' },
  { id: 'FN-F-903', name: 'ビルド 即時破棄', owner: 'kojo', kind: 'exec', origin: 'fieldfix', phase: 'A',
    state: 'superseded', version: 'pre-#1020', updatedAt: '9日前', supersededBy: 'FN-F-002',
    usage: 2, quality: 25, linkages: 0, deps: [],
    desc: '停止 CI を即時破棄する旧手順。史実保持のため削除禁則。' },

  // 三官共同
  { id: 'FN-X-001', name: '記録庫 全文検索', owner: 'joint', kind: 'archive', origin: 'charter', phase: 'B',
    state: 'active', version: 'v0.6.0', updatedAt: '本日 15:00', changedToday: true,
    usage: 83, quality: 85, linkages: 6, deps: ['FN-K-001', 'FN-J-001', 'FN-F-001'],
    desc: '記録番号・表題で全文検索。機関別・系列別フィルタ。本文検索は未実装。' },
  { id: 'FN-X-002', name: 'EVT 系列分類', owner: 'joint', kind: 'archive', origin: 'fieldfix', phase: 'B',
    state: 'active', version: 'v0.6.0', updatedAt: '本日 15:00', changedToday: true,
    usage: 77, quality: 81, linkages: 5, deps: ['FN-X-001'],
    desc: 'J/M/B/K/E の5系列で活動誌を色分け。' },
  { id: 'FN-X-003', name: '因果連動表示', owner: 'joint', kind: 'observe', origin: 'fieldfix', phase: 'B',
    state: 'active', version: 'v0.6.0', updatedAt: '本日 15:00', changedToday: true,
    usage: 64, quality: 79, linkages: 4, deps: [],
    desc: 'アラートに上流原因（↑）と下流影響（↓）を展開。' },
  { id: 'FN-X-004', name: 'capability_registry 連動', owner: 'joint', kind: 'governance', origin: 'decree', phase: 'C',
    state: 'halted', version: '計画', updatedAt: '未着手',
    usage: 0, quality: 0, linkages: 0, deps: [],
    desc: 'MCP 経由で機能カタログを自動反映。Phase B 中盤の実装候補（将来課題）。' },

  // Dream / 定期検診（v0.6.1）
  { id: 'FN-X-010', name: 'Dream化 手動圧縮', owner: 'joint', kind: 'context', origin: 'decree', phase: 'B',
    state: 'active', version: 'v0.6.1', updatedAt: '本日 15:42', changedToday: true,
    usage: 71, quality: 84, linkages: 5, deps: ['FN-F-004', 'FN-F-005'],
    desc: '短期→中期→長期の階層化メモリを手動 Dream で圧縮。発動はヤス採否権限を維持。' },
  { id: 'FN-X-011', name: '階層化メモリ メタ3層', owner: 'joint', kind: 'context', origin: 'decree', phase: 'B',
    state: 'active', version: 'v0.6.1', updatedAt: '本日 15:42', changedToday: true,
    usage: 58, quality: 78, linkages: 4, deps: ['FN-X-010'],
    desc: '基層 / Meta（メタ記憶）/ MetaMeta（剪定方針）の3階層を併設。L3 は畳込で表示。' },
  { id: 'FN-X-012', name: 'MetaADR 同型適用', owner: 'joint', kind: 'governance', origin: 'decree', phase: 'B',
    state: 'warn', version: 'v0.6.1', updatedAt: '本日 15:42', changedToday: true,
    usage: 42, quality: 72, linkages: 3, deps: ['FN-X-011'],
    desc: 'ADR/哲学層に同じ階層構造を適用。PHI-009 警告状態（Dream 候補）。' },
  { id: 'FN-X-013', name: '定期検診 schtasks', owner: 'joint', kind: 'observe', origin: 'fieldfix', phase: 'B',
    state: 'active', version: 'v0.6.1', updatedAt: '本日 15:42', changedToday: true,
    usage: 88, quality: 86, linkages: 4, deps: ['FN-K-003'],
    desc: '09:00 自動検診（手動切替可）。checkup-scores へ JSON 保存。RX-Layer4 と整合。' },
];

// 総合スコア算出
function catalogScore(f) {
  if (f.state === 'halted' || f.state === 'superseded') return Math.round(f.usage * 0.35 + f.quality * 0.30);
  const phaseW = (CAT_PHASES[f.phase]?.weight || 0.5) * 100;
  const linkW = Math.min(f.linkages * 8, 40);
  return Math.round(f.usage * 0.35 + f.quality * 0.30 + linkW * 0.20 + phaseW * 0.15);
}

// 履歴：各機能の使用頻度トレンド（簡易7点）
function catalogTrend(f) {
  const seed = f.id.charCodeAt(3) * 7 + f.id.charCodeAt(4);
  const out = [];
  let v = Math.max(20, f.usage - 25);
  for (let i = 0; i < 7; i++) {
    v += ((Math.sin(seed + i * 1.3) + Math.sin(seed * 0.7 + i)) * 4);
    v = Math.max(0, Math.min(100, v));
    out.push(v);
  }
  out[6] = f.usage;
  return out;
}

Object.assign(window, {
  CAT_OWNERS, CAT_KINDS, CAT_ORIGINS, CAT_PHASES, CAT_STATES,
  CAT_FEATURES, catalogScore, catalogTrend,
});
