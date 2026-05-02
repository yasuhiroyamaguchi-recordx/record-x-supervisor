// ─────────────────────────────────────────────────────
// Dream機能 + 定期検診 データ定義
// ─────────────────────────────────────────────────────

// Dream モード設定
const DREAM_MODE = {
  default: 'manual',           // manual | auto
  defaultPolicy: 'warn-recommend',  // warn-recommend | aggressive
  // KB 閾値
  thresholds: {
    handoff:  { warn: 50, autoCandidate: 100 },   // KB
    metaMemo: { warn: 30, autoCandidate: 60 },
    adr:      { warn: 40, autoCandidate: 80 },
    philosophy: { warn: 35, autoCandidate: 70 },
  },
};

// 各機関の階層化メモリ状態
const MEMORY_LAYERS = {
  kantoku: {
    short: {
      label: '短期記憶',
      sizeKB: 12.4, items: 38, lastDream: '本日 08:30', state: 'active',
      desc: '直近24時間の会話・判断の生記録',
    },
    mid: {
      label: '中期記憶',
      sizeKB: 28.1, items: 142, lastDream: '昨日 09:00', state: 'active',
      desc: '7日分のハンドオフ要約・周期パターン',
    },
    long: {
      label: '長期記憶',
      sizeKB: 86.7, items: 524, lastDream: '4日前 09:00', state: 'active',
      desc: '機関憲章準拠の永続的判断指針・ADR連動',
    },
    meta:    { label: 'メタ',         sizeKB: 8.2,  items: 24, desc: '記憶の参照頻度・有効性メタ情報' },
    metameta:{ label: 'メタメタ',     sizeKB: 3.1,  items: 9,  desc: 'メタ層の再構成戦略・剪定方針' },
    metameta3:{label: 'メタメタメタ', sizeKB: 0.8,  items: 3,  desc: '記憶アーキテクチャ自体の評価指標', expanded: false },
  },
  shirei: {
    short: { label: '短期記憶', sizeKB: 18.6, items: 64, lastDream: '本日 09:30', state: 'active', desc: '指令経路・委譲先の直近判断履歴' },
    mid:   { label: '中期記憶', sizeKB: 41.2, items: 198, lastDream: '昨日 09:00', state: 'warn',   desc: '部門別の業績パターン・委譲傾向' },
    long:  { label: '長期記憶', sizeKB: 112.3, items: 681, lastDream: '5日前 09:00', state: 'crit',   desc: '事業全体の戦略指針・ADR-009連動' },
    meta:    { label: 'メタ',         sizeKB: 14.7, items: 41, desc: '指令の成功率・部門相性メタ' },
    metameta:{ label: 'メタメタ',     sizeKB: 4.9,  items: 13, desc: '指揮系統再編戦略' },
    metameta3:{label: 'メタメタメタ', sizeKB: 1.2,  items: 4,  desc: '指揮哲学そのものの評価', expanded: true },
  },
  kojo: {
    short: { label: '短期記憶', sizeKB: 22.8, items: 89, lastDream: '本日 09:30', state: 'active', desc: 'CI履歴・ビルド失敗パターン' },
    mid:   { label: '中期記憶', sizeKB: 35.4, items: 167, lastDream: '昨日 09:00', state: 'active', desc: '工区別の安定性・玉詰まり傾向' },
    long:  { label: '長期記憶', sizeKB: 73.9, items: 412, lastDream: '3日前 09:00', state: 'active', desc: '工場運用憲章・PR#1020 等の重要史実' },
    meta:    { label: 'メタ',         sizeKB: 9.6,  items: 28, desc: 'ハンドオフ再生成タイミング・有効性' },
    metameta:{ label: 'メタメタ',     sizeKB: 2.8,  items: 7,  desc: '結晶化アルゴリズム自身の評価' },
    metameta3:{label: 'メタメタメタ', sizeKB: 0.6,  items: 2,  desc: '記憶圧縮の根拠そのもの', expanded: false },
  },
};

// ADR / 哲学層の Dream 状態
const ADR_DREAM = {
  adr: {
    label: 'ADR層',
    files: [
      { id: 'ADR-001', title: '三官分立の基本原則',           sizeKB: 4.2, lastDream: '本日 08:30', state: 'active', metaLevel: 1 },
      { id: 'ADR-005', title: '役割境界 §5 の制定',          sizeKB: 6.8, lastDream: '本日 08:30', state: 'active', metaLevel: 1 },
      { id: 'ADR-009', title: '記憶階層 §6 拡張(MetaADR適用)', sizeKB: 11.4, lastDream: '昨日 09:00', state: 'warn',   metaLevel: 2, isProposal: true },
      { id: 'ADR-012', title: 'Dream機能 序盤実装方針',       sizeKB: 8.7, lastDream: '本日 09:30', state: 'active', metaLevel: 2 },
    ],
  },
  philosophy: {
    label: '哲学層',
    files: [
      { id: 'PHI-001', title: '記録庁の存在理由',                 sizeKB: 3.6, lastDream: '7日前',     state: 'active', metaLevel: 1 },
      { id: 'PHI-003', title: 'ヤス権限の不可侵性について',        sizeKB: 5.2, lastDream: '本日 08:30', state: 'active', metaLevel: 1 },
      { id: 'PHI-007', title: '機関依存度の自己観察',              sizeKB: 9.1, lastDream: '昨日 09:00', state: 'active', metaLevel: 2 },
      { id: 'PHI-009', title: '依存度観察の観察(MetaMetaPhilo)',   sizeKB: 4.4, lastDream: '4日前',     state: 'warn',   metaLevel: 3 },
    ],
  },
};

// Dream 履歴 (記録庫タブで参照)
const DREAM_HISTORY = [
  { id: 'DRM-2025-1102', t: '本日 09:30', node: 'shirei',  layer: 'short→mid', mode: 'manual', sizeBefore: 21.4, sizeAfter: 18.6, items: 12, summary: '営業部委譲判断 8件を圧縮要約' },
  { id: 'DRM-2025-1101', t: '本日 09:30', node: 'kojo',    layer: 'short→mid', mode: 'manual', sizeBefore: 25.1, sizeAfter: 22.8, items: 9,  summary: 'CI停止対応の処方を結晶化' },
  { id: 'DRM-2025-1100', t: '本日 08:30', node: 'kantoku', layer: 'short→mid', mode: 'auto',   sizeBefore: 14.6, sizeAfter: 12.4, items: 6,  summary: '違反検知ログを規範ファミリ別に再編' },
  { id: 'DRM-2025-1099', t: '昨日 09:00', node: 'shirei',  layer: 'mid→long',  mode: 'auto',   sizeBefore: 47.3, sizeAfter: 41.2, items: 18, summary: '部門別判断パターンの長期化' },
  { id: 'DRM-2025-1098', t: '昨日 09:00', node: 'kojo',    layer: 'mid→long',  mode: 'auto',   sizeBefore: 38.0, sizeAfter: 35.4, items: 11, summary: '玉詰まり予兆パターンを長期記憶へ' },
];

// ─────────────────────────────────────────────────────
// 定期検診
const CHECKUP_MODE = {
  default: 'manual',  // manual | auto
  schedule: '09:00 daily',
  taskName: 'RX-Layer4-Checkup',
  scoresDir: 'checkup-scores/',
};

// 各機関の最新検診スコア
const LATEST_CHECKUPS = {
  kantoku: { score: 92, runAt: '本日 09:00', mode: 'auto',   delta: +1, snapPath: 'checkup-scores/2025-11-02-kantoku.json' },
  shirei:  { score: 78, runAt: '本日 09:00', mode: 'auto',   delta: -3, snapPath: 'checkup-scores/2025-11-02-shirei.json' },
  kojo:    { score: 85, runAt: '本日 09:00', mode: 'auto',   delta: 0,  snapPath: 'checkup-scores/2025-11-02-kojo.json' },
};

// 検診履歴 (記録庫タブで参照)
const CHECKUP_HISTORY = [
  { id: 'CHK-2025-1102-K', t: '本日 09:00', node: 'kantoku', score: 92, mode: 'auto',   notes: '規範違反検知の応答性 良好' },
  { id: 'CHK-2025-1102-S', t: '本日 09:00', node: 'shirei',  score: 78, mode: 'auto',   notes: '長期記憶 112KB 超過。Dream 推奨' },
  { id: 'CHK-2025-1102-F', t: '本日 09:00', node: 'kojo',    score: 85, mode: 'auto',   notes: 'CI 玉詰まり再稼働の所要時間 短縮' },
  { id: 'CHK-2025-1101-K', t: '昨日 09:00', node: 'kantoku', score: 91, mode: 'auto',   notes: '─' },
  { id: 'CHK-2025-1101-S', t: '昨日 09:00', node: 'shirei',  score: 81, mode: 'auto',   notes: '中期記憶 警告水準' },
  { id: 'CHK-2025-1101-F', t: '昨日 09:00', node: 'kojo',    score: 85, mode: 'auto',   notes: '─' },
  { id: 'CHK-2025-1031-K', t: '2日前 09:00', node: 'kantoku', score: 88, mode: 'manual', notes: '監督官 自己点検' },
];

Object.assign(window, {
  DREAM_MODE, MEMORY_LAYERS, ADR_DREAM, DREAM_HISTORY,
  CHECKUP_MODE, LATEST_CHECKUPS, CHECKUP_HISTORY,
});
