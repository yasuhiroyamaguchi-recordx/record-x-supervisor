// 記録庁 — ダミーデータ
// 監督官1・司令官1（事業部門長3〜4）・工場長1 の構成

const KIRA_NOW = new Date('2026-05-02T15:42:00+09:00');

// ── 命名 ───────────────────────────────────────────────
// 重厚な機関っぽい命名。漢字多め、整然と。

const NODES = [
  {
    id: 'kantoku',
    role: '監督官',
    roleEn: 'Inspector',
    codename: '甲号',
    fullname: '監督官・甲号',
    description: '全機関の挙動監査・規範遵守・記録改竄検知',
    status: 'ok',
    health: 96,
    contextUse: 0.41,
    activeTasks: 3,
    errorRate: 0.012,
    successRate: 0.988,
    lastResponseAt: '15:41:52',
    uptimeHours: 312.4,
    cmd: 'claude --role inspector',
    parent: null,
  },
  {
    id: 'shirei',
    role: '司令官',
    roleEn: 'Commander',
    codename: '乙号',
    fullname: '司令官・乙号',
    description: '事業部門の統制・優先度配分・対外調整',
    status: 'warn',
    health: 78,
    contextUse: 0.73,
    activeTasks: 7,
    errorRate: 0.034,
    successRate: 0.966,
    lastResponseAt: '15:41:48',
    uptimeHours: 312.4,
    cmd: 'claude --role commander',
    parent: null,
  },
  {
    id: 'kojo',
    role: '工場長',
    roleEn: 'Foreman',
    codename: '丙号',
    fullname: '工場長・丙号',
    description: '実装作業の遂行・成果物検収・資材管理',
    status: 'ok',
    health: 88,
    contextUse: 0.55,
    activeTasks: 12,
    errorRate: 0.021,
    successRate: 0.979,
    lastResponseAt: '15:41:55',
    uptimeHours: 287.1,
    cmd: 'claude --role foreman',
    parent: null,
  },
  // 司令官配下の事業部門長
  {
    id: 'div-kikaku',
    role: '事業部門長',
    roleEn: 'Division Lead',
    codename: '企画部',
    fullname: '企画部門長',
    description: '製品要件の策定・市場調査・仕様書起草',
    status: 'ok',
    health: 91,
    contextUse: 0.38,
    activeTasks: 4,
    errorRate: 0.008,
    successRate: 0.992,
    lastResponseAt: '15:41:39',
    uptimeHours: 168.2,
    cmd: 'claude --division kikaku',
    parent: 'shirei',
  },
  {
    id: 'div-eigyo',
    role: '事業部門長',
    roleEn: 'Division Lead',
    codename: '営業部',
    fullname: '営業部門長',
    description: '顧客対応・契約手続・案件進捗管理',
    status: 'ok',
    health: 84,
    contextUse: 0.62,
    activeTasks: 6,
    errorRate: 0.019,
    successRate: 0.981,
    lastResponseAt: '15:41:44',
    uptimeHours: 168.2,
    cmd: 'claude --division eigyo',
    parent: 'shirei',
  },
  {
    id: 'div-kaihatsu',
    role: '事業部門長',
    roleEn: 'Division Lead',
    codename: '開発部',
    fullname: '開発部門長',
    description: '技術選定・設計監修・コードレビュー',
    status: 'crit',
    health: 42,
    contextUse: 0.94,
    activeTasks: 11,
    errorRate: 0.087,
    successRate: 0.913,
    lastResponseAt: '15:39:11',
    uptimeHours: 168.2,
    cmd: 'claude --division kaihatsu',
    parent: 'shirei',
  },
  {
    id: 'div-soumu',
    role: '事業部門長',
    roleEn: 'Division Lead',
    codename: '総務部',
    fullname: '総務部門長',
    description: '内部統制・記録保管・人事処遇',
    status: 'idle',
    health: 70,
    contextUse: 0.18,
    activeTasks: 1,
    errorRate: 0.004,
    successRate: 0.996,
    lastResponseAt: '15:30:02',
    uptimeHours: 168.2,
    cmd: 'claude --division soumu',
    parent: 'shirei',
  },
];

const STATUS_LABEL = {
  ok:   '稼働中',
  warn: '警告',
  crit: 'エラー',
  idle: '待機',
};

// ── ToDo ───────────────────────────────────────────────
// state: 'pending'(採否待) | 'approved'(承認・実行中) | 'done'(完了) | 'rejected'(差戻し)
const TODOS = [
  { id: 'T-2041', title: '開発部のコンテキスト圧縮処理を再起動', owner: 'div-kaihatsu', priority: 'high', due: '本日 16:00', state: 'pending' },
  { id: 'T-2039', title: '営業部からの新規案件3件の起票確認', owner: 'div-eigyo', priority: 'med', due: '本日 18:00', state: 'approved' },
  { id: 'T-2038', title: '司令官の長期記憶ストアの整合性検査', owner: 'shirei', priority: 'high', due: '本日 17:00', state: 'pending' },
  { id: 'T-2036', title: '工場長：第七工区のビルド再試行', owner: 'kojo', priority: 'med', due: '本日 17:30', state: 'approved' },
  { id: 'T-2034', title: '監督官による週次監査レポートの承認', owner: 'kantoku', priority: 'low', due: '明日 10:00', state: 'pending' },
  { id: 'T-2030', title: '企画部の市場調査メモを記録庫へ収蔵', owner: 'div-kikaku', priority: 'low', due: '明日 12:00', state: 'done' },
  { id: 'T-2028', title: '総務部：稼働時間台帳の月次締め', owner: 'div-soumu', priority: 'low', due: '5/5 17:00', state: 'pending' },
  { id: 'T-2025', title: 'CLAUDE.md（工場長）の規範条項 第12項 改訂', owner: 'kojo', priority: 'med', due: '5/4 12:00', state: 'pending' },
];

// 文脈使用率の閾値
const CONTEXT_THRESHOLDS = {
  warn: 0.80,
  crit: 0.90,
  autoEvac: 0.85,  // 自動退避閾値
};

// 会話介入頻度（ヤス＝管理者の介入回数。依存度自己評価）
const INTERVENTION_STATS = {
  kantoku: { d1: 2, d7: 11, d30: 38 },
  shirei:  { d1: 7, d7: 41, d30: 162 },
  kojo:    { d1: 3, d7: 18, d30: 71 },
  'div-kaihatsu': { d1: 5, d7: 22, d30: 84 },
  'div-eigyo':    { d1: 1, d7: 6,  d30: 24 },
  'div-kikaku':   { d1: 0, d7: 4,  d30: 19 },
  'div-soumu':    { d1: 0, d7: 2,  d30: 11 },
};

// 記録庫データ（拡充）
const ARCHIVE_RECORDS = [
  { id: 'REC-04821', title: '監督官・甲号 / 監査巡回 #312', size: '12.4 KB', when: '15:38', date: '2026-05-02', node: 'kantoku',      series: 'M' },
  { id: 'REC-04820', title: '司令官・乙号 / 指令発出 #2391', size: '8.1 KB',  when: '15:41', date: '2026-05-02', node: 'shirei',       series: 'J' },
  { id: 'REC-04819', title: '工場長・丙号 / build #4821 完了報告', size: '34.2 KB', when: '15:41', date: '2026-05-02', node: 'kojo',     series: 'B' },
  { id: 'REC-04818', title: '開発部門長 / エラー詳細記録 (E-871)', size: '5.7 KB',  when: '15:24', date: '2026-05-02', node: 'div-kaihatsu', series: 'E' },
  { id: 'REC-04817', title: '企画部門長 / 仕様書 SPEC-118 草稿', size: '22.0 KB', when: '15:18', date: '2026-05-02', node: 'div-kikaku', series: 'K' },
  { id: 'REC-04812', title: '工場長・丙号 / pkg 取得再試行ログ', size: '3.2 KB',  when: '15:11', date: '2026-05-02', node: 'kojo',     series: 'B' },
  { id: 'REC-04805', title: '監督官・甲号 / 監査ログ +24% 観測票', size: '6.4 KB',  when: '14:48', date: '2026-05-02', node: 'kantoku',  series: 'M' },
  { id: 'REC-04798', title: '営業部門長 / K社 返信草稿', size: '4.8 KB',  when: '14:32', date: '2026-05-02', node: 'div-eigyo',  series: 'J' },
  { id: 'REC-04752', title: '司令官・乙号 / 週次監査総括', size: '18.9 KB', when: '17:00', date: '2026-05-01', node: 'shirei',  series: 'M' },
  { id: 'REC-04733', title: '総務部門長 / 稼働時間台帳 (4月)', size: '42.1 KB', when: '11:30', date: '2026-05-01', node: 'div-soumu', series: 'K' },
];

// 役割境界 §5（直接対話禁則・起動CLI）
const ROLE_BOUNDARIES = {
  rules: [
    { from: 'kantoku',      to: 'div-*',         allowed: false, note: '監督官は事業部門長と直接対話せず、必ず司令官を経由する' },
    { from: 'kojo',         to: 'div-*',         allowed: false, note: '工場長は事業部門長と直接対話しない（成果物受領は記録庫経由）' },
    { from: 'div-*',        to: 'div-*',         allowed: false, note: '事業部門長同士は直接対話せず、司令官を経由する' },
    { from: 'kantoku',      to: 'shirei',        allowed: true,  note: '監督官は司令官に通報・是正勧告できる' },
    { from: 'kantoku',      to: 'kojo',          allowed: true,  note: '監督官は工場長に監査要請できる' },
    { from: 'shirei',       to: 'div-*',         allowed: true,  note: '司令官は事業部門長へ指令を発出できる' },
    { from: 'shirei',       to: 'kojo',          allowed: true,  note: '司令官は工場長に作業発注できる' },
  ],
};

// ── ハンドオフ（全文 + 結晶化） ─────────────────────────
// 各機関ごとに「全文 .md ハンドオフ」と「結晶化要約（24h or 閾値超で再生成）」を持つ
const HANDOFFS = {
  kantoku: {
    fullPath: 'handoffs/kantoku/HANDOFF.md',
    fullSize: '38.2 KB',
    fullUpdatedAt: '本日 15:00',
    crystal: {
      generatedAt: '本日 15:00',
      reason: '24h 周期更新',
      lines: [
        '監査巡回 #310〜#312 を完了。改竄検知ヒット 0。',
        '司令官の長期記憶ストアに整合性逸脱の兆候なし。',
        '開発部門長のコンテキスト使用率が継続上昇中（74→94%）。司令官への通報を起案済。',
        '次回優先：司令官の発出キュー滞留と開発部の関連分析。',
      ],
    },
  },
  shirei: {
    fullPath: 'handoffs/shirei/HANDOFF.md',
    fullSize: '64.8 KB',
    fullUpdatedAt: '本日 15:38',
    crystal: {
      generatedAt: '本日 15:38',
      reason: '文脈使用率 70% 超過による再生成',
      lines: [
        '案件 #2391（K社）を営業部に委譲。納期 18:00、Plan-First 実施済。',
        '開発部にコンテキスト圧縮を指示。応答遅延が継続する場合は工場長へ作業再配分。',
        '発出キュー 18件 滞留中。原因は開発部の応答遅延。',
        '次回優先：開発部の状況確認と仕様書 SPEC-118 第3章のレビュー。',
      ],
    },
  },
  kojo: {
    fullPath: 'handoffs/kojo/HANDOFF.md',
    fullSize: '47.6 KB',
    fullUpdatedAt: '本日 15:41',
    crystal: {
      generatedAt: '本日 15:41',
      reason: '24h 周期更新',
      lines: [
        '第三工区 build #4821 完了。tests/integration 412/412 通過。',
        '第七工区 pkg 取得が失敗。再試行 2/5、ミラー切替で復旧見込。',
        'CI 看板：進行中 3 / PASS 5 / 停止 2 / FAIL 1。',
        '次回優先：停止2件の再稼働と FAIL 1 件の原因切り分け。',
      ],
    },
  },
};

// ── Git push 同期状態 ──────────────────────────────────
// mode: 'auto' | 'manual'
// pendingCommits: 未push のコミット数
// lastSyncedAt: 最後の同期時刻
const GIT_SYNC = {
  kantoku: { mode: 'auto',   pendingCommits: 0, lastSyncedAt: '15:41:02', branch: 'inspector/main' },
  shirei:  { mode: 'manual', pendingCommits: 4, lastSyncedAt: '14:22:11', branch: 'commander/main' },
  kojo:    { mode: 'auto',   pendingCommits: 0, lastSyncedAt: '15:41:55', branch: 'foreman/main' },
};

// ── CI 看板（工場長配下） ──────────────────────────────
// state: 'running' | 'pass' | 'stalled' | 'fail'
const CI_BOARDS = [
  { id: 'CI-4821', title: '第三工区 / build #4821',           branch: 'feature/spec-118',   state: 'pass',     elapsed: '4m12s', updatedAt: '15:41' },
  { id: 'CI-4820', title: '第七工区 / pkg 取得 再試行',        branch: 'fix/pkg-mirror',     state: 'stalled',  elapsed: '8m05s', updatedAt: '15:33' },
  { id: 'CI-4819', title: '第二工区 / lint + typecheck',       branch: 'main',                state: 'pass',     elapsed: '1m48s', updatedAt: '15:30' },
  { id: 'CI-4818', title: '第五工区 / e2e regression',         branch: 'release/v2.4',       state: 'running',  elapsed: '2m31s', updatedAt: '15:39' },
  { id: 'CI-4817', title: '第八工区 / docker image build',     branch: 'feature/care-svc',   state: 'fail',     elapsed: '3m02s', updatedAt: '15:18' },
  { id: 'CI-4815', title: '第四工区 / unit (kaihatsu)',        branch: 'feature/spec-118',   state: 'stalled',  elapsed: '12m14s',updatedAt: '15:11' },
  { id: 'CI-4812', title: '第六工区 / pkg publish',            branch: 'release/v2.4',       state: 'running',  elapsed: '0m48s', updatedAt: '15:41' },
];

// ── アラート ───────────────────────────────────────────
// causes: このアラートを引き起こした上流要因（id配列）
// effects: このアラートが原因で派生した下流影響（id配列）
const ALERTS = [
  {
    id: 'A-9821',
    severity: 'critical',
    target: 'div-kaihatsu',
    title: 'コンテキスト使用率 94% — 自動退避閾値超過',
    detail: '開発部門長のコンテキスト使用率が94%に達しました。次の長文タスクで切断の恐れがあります。',
    raisedAt: '15:39:11',
    ackable: true,
    causes: ['A-9817'],
    effects: ['A-9819'],
  },
  {
    id: 'A-9819',
    severity: 'high',
    target: 'shirei',
    title: '司令官 — 部門間メッセージキュー滞留',
    detail: '司令官の発出キューに18件の未処理指令が滞留しています。配下の開発部門長の応答遅延が主因。',
    raisedAt: '15:33:02',
    ackable: true,
    causes: ['A-9821', 'A-9817'],
    effects: [],
  },
  {
    id: 'A-9817',
    severity: 'high',
    target: 'div-kaihatsu',
    title: '開発部 — エラー率 8.7%（基準値 5%超過）',
    detail: '直近30分でのエラー率が基準値を超過。原因の特定中。',
    raisedAt: '15:24:40',
    ackable: true,
    causes: [],
    effects: ['A-9821', 'A-9819'],
  },
  {
    id: 'A-9812',
    severity: 'medium',
    target: 'kojo',
    title: '工場長 — 第七工区の依存解決に遅延',
    detail: 'パッケージ取得が再試行中（2/5）。',
    raisedAt: '15:11:08',
    ackable: true,
    causes: [],
    effects: [],
  },
  {
    id: 'A-9805',
    severity: 'low',
    target: 'kantoku',
    title: '監督官 — 監査ログ記録量が前日比+24%',
    detail: '通常範囲内。情報のみ。',
    raisedAt: '14:48:51',
    ackable: false,
  },
];

const SEVERITY_LABEL = {
  critical: 'CRITICAL',
  high:     'HIGH',
  medium:   'MEDIUM',
  low:      'LOW',
};

const SEVERITY_JA = {
  critical: '緊急',
  high:     '重要',
  medium:   '注意',
  low:      '情報',
};

// ── タイムライン（活動ログ） ────────────────────────────
// kind: info / warn / crit (重要度)
// series: 系列分類タグ
//   J = 司令系（指令発出・委譲・優先度判断）
//   M = 監査系（巡回・整合性・改竄検知）
//   B = 構築系（build/test/pkg）
//   K = 記録系（収蔵・改訂・台帳）
//   E = 例外系（エラー・閾値超過）
const SERIES = {
  J: { label: '司令', color: 'oklch(0.55 0.12 250)', bg: 'oklch(0.95 0.03 250)' },
  M: { label: '監査', color: 'oklch(0.55 0.10 290)', bg: 'oklch(0.95 0.025 290)' },
  B: { label: '構築', color: 'oklch(0.55 0.11 165)', bg: 'oklch(0.95 0.025 165)' },
  K: { label: '記録', color: 'oklch(0.55 0.07 80)',  bg: 'oklch(0.95 0.02 80)' },
  E: { label: '例外', color: 'var(--crit)',          bg: 'var(--crit-soft)' },
};

const TIMELINE = [
  { t: '15:41:55', node: 'kojo',         kind: 'info', series: 'B', text: '第三工区 build #4821 完了' },
  { t: '15:41:48', node: 'shirei',       kind: 'info', series: 'J', text: '営業部へ案件 #2391 を委譲' },
  { t: '15:41:39', node: 'div-kikaku',   kind: 'info', series: 'K', text: '仕様書 SPEC-118 を更新' },
  { t: '15:39:11', node: 'div-kaihatsu', kind: 'crit', series: 'E', text: 'コンテキスト使用率 94% 到達' },
  { t: '15:38:02', node: 'kantoku',      kind: 'info', series: 'M', text: '監査巡回 #312 開始' },
  { t: '15:36:44', node: 'div-eigyo',    kind: 'info', series: 'J', text: '顧客 K社 への返信草稿を提出' },
  { t: '15:33:02', node: 'shirei',       kind: 'warn', series: 'E', text: '発出キュー滞留 18件' },
  { t: '15:31:18', node: 'kojo',         kind: 'info', series: 'B', text: 'tests/integration 通過 (412/412)' },
  { t: '15:24:40', node: 'div-kaihatsu', kind: 'crit', series: 'E', text: 'エラー率 8.7% を計上' },
  { t: '15:18:01', node: 'div-soumu',    kind: 'info', series: 'K', text: '稼働時間台帳を採録' },
  { t: '15:11:08', node: 'kojo',         kind: 'warn', series: 'B', text: 'pkg 取得 再試行 (2/5)' },
  { t: '14:48:51', node: 'kantoku',      kind: 'info', series: 'M', text: '監査ログ +24% を観測' },
];

// node id → node 検索
const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]));

// 拡張可能な事業部門プリセット — 設定画面から将来切替可能にする
const DIVISION_PRESETS = {
  current: {
    label: '現行構成',
    divisions: ['div-kikaku', 'div-eigyo', 'div-kaihatsu', 'div-soumu'],
  },
  carex: {
    label: 'Care/Tax/Edu-RX 拡張',
    divisions: ['div-care', 'div-tax', 'div-edurx', 'div-soumu'],
  },
};

// 拡張用の追加部門候補
const EXTRA_DIVISIONS = [
  {
    id: 'div-care', role: '事業部門長', roleEn: 'Division Lead',
    codename: 'Care部', fullname: 'Care部門長',
    description: '介護・医療連携・在宅支援の調整',
    status: 'ok', health: 86, contextUse: 0.42, activeTasks: 5,
    errorRate: 0.011, successRate: 0.989, lastResponseAt: '15:41:30',
    uptimeHours: 92.4, cmd: 'claude --division care', parent: 'shirei',
  },
  {
    id: 'div-tax', role: '事業部門長', roleEn: 'Division Lead',
    codename: 'Tax部', fullname: 'Tax部門長',
    description: '税務処理・申告書作成・法令遵守',
    status: 'warn', health: 74, contextUse: 0.68, activeTasks: 8,
    errorRate: 0.026, successRate: 0.974, lastResponseAt: '15:41:14',
    uptimeHours: 92.4, cmd: 'claude --division tax', parent: 'shirei',
  },
  {
    id: 'div-edurx', role: '事業部門長', roleEn: 'Division Lead',
    codename: 'Edu-RX部', fullname: 'Edu-RX部門長',
    description: '教育・研修・処方箋連携の運用',
    status: 'ok', health: 92, contextUse: 0.31, activeTasks: 3,
    errorRate: 0.006, successRate: 0.994, lastResponseAt: '15:41:42',
    uptimeHours: 92.4, cmd: 'claude --division edurx', parent: 'shirei',
  },
];

// 拡張部門もNODE_BY_IDに登録
EXTRA_DIVISIONS.forEach(d => { NODE_BY_ID[d.id] = d; });

Object.assign(window, {
  KIRA_NOW, NODES, NODE_BY_ID, STATUS_LABEL,
  TODOS, ALERTS, SEVERITY_LABEL, SEVERITY_JA, TIMELINE,
  CONTEXT_THRESHOLDS, SERIES, DIVISION_PRESETS, EXTRA_DIVISIONS,
  INTERVENTION_STATS, ARCHIVE_RECORDS, ROLE_BOUNDARIES,
  HANDOFFS, GIT_SYNC, CI_BOARDS,
});
