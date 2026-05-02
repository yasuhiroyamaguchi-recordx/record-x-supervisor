// ─────────────────────────────────────────────────────
// Phase 進捗バー + 検証期間進捗バー (ヘッダー直下に配置)
// + サブエージェント並列カード(工場長 Castor + Pollux 双子展開)
// ─────────────────────────────────────────────────────

const { useState: useStatePH } = React;

// ─────────────────────────────────────────────────────
// データ
// ─────────────────────────────────────────────────────
const PHASE_DATA = {
  current: 'B',  // 起動候補
  phases: [
    { id: 'A',  label: 'Phase A',  sub: '基盤構築',   state: 'done',     progress: 1.0,  evtCount: 38 },
    { id: 'B',  label: 'Phase B',  sub: '本格運用',   state: 'starting', progress: 0.32, evtCount: 14 },
    { id: 'C',  label: 'Phase C',  sub: '安定化',     state: 'pending',  progress: 0,    evtCount: 0 },
    { id: 'T1', label: 'Phase T1', sub: 'Care/Tax/Edu-RX 展開', state: 'pending', progress: 0, evtCount: 0 },
    { id: 'T2', label: 'Phase T2', sub: 'ファクトリー本格', state: 'pending', progress: 0, evtCount: 0 },
  ],
};

// 検証期間 14日 (2026-05-02 〜 2026-05-15)
const VERIFICATION_PERIOD = {
  startISO: '2026-05-02',
  endISO:   '2026-05-15',
  todayISO: '2026-05-02',     // 本日
  startLabel:  '令和八年 五月二日',
  endLabel:    '令和八年 五月十五日',
  todayLabel:  '本日 五月二日',
  midpointISO: '2026-05-09',
  midpointLabel: '中間評価 五月九日',
  finalLabel:    '最終評価 五月十五日',
  totalDays: 14,
  elapsedDays: 0.65,         // 当日進行
  evtCumulative: 14,
  evtAtMidExpected: 28,
  evtAtFinalExpected: 60,
};

// サブエージェント並列(現状 6 並列、本日実証)
const SUBAGENTS = [
  { id: 'A', codename: 'C-001', branch: 'B-003',  topic: 'L8 候補処理',
    state: 'completed', commit: '4a2c81f',
    chat: [
      { who: 'Castor', text: 'L8 候補の検出ロジックを更新せよ。閾値は 0.82 → 0.86。' },
      { who: 'A',      text: '了解。新閾値で再走査開始。サンプル 1,204 件、検出 38 → 27 に減。誤検知率は▼12%。' },
      { who: 'A',      text: 'tests/l8-candidates 通過 (84/84)。マージ準備完了。' },
    ],
  },
  { id: 'B', codename: 'C-002', branch: 'B-005',  topic: 'care 系',
    state: 'merged', commit: 'b7e3128',
    chat: [
      { who: 'Castor', text: 'Care 系 RX-Layer3 の同型適用を進めよ。' },
      { who: 'B',      text: 'PHI-007 を base に同型化。RX-Care-L3 の 7 規則を生成、4 規則は MetaADR と整合。' },
      { who: 'B',      text: 'merge 完了 (b7e3128)。残 3 規則は要 ADR 起案。' },
    ],
  },
  { id: 'C', codename: 'C-003', branch: 'B-004',  topic: 'single source',
    state: 'advanced', commit: 'advanced_v1.1',
    chat: [
      { who: 'Castor', text: 'single source of truth 規約 v1.0 → v1.1 へ昇格。' },
      { who: 'C',      text: '差分 6 箇所適用済。CLAUDE.md・ADR-009・PHI-009 への参照リンクを追加。' },
      { who: 'C',      text: 'advanced_v1.1 タグ打刻完了。Pollux 起動時に同規約を継承予定。' },
    ],
  },
  { id: 'D', codename: 'C-004', branch: 'B-007',  topic: 'docs/audits',
    state: 'merged', commit: '5dfab87',
    chat: [
      { who: 'Castor', text: '監査文書の Markdown lint と用語整合を一括処理。' },
      { who: 'D',      text: '対象 23 文書、警告 47 件 → 0 件。用語 unify は ADR-005 §3 と整合確認済。' },
      { who: 'D',      text: 'merge 5dfab87 完了。' },
    ],
  },
  { id: 'E', codename: 'C-005', branch: 'B-006',  topic: '警告 2 件 + tests',
    state: 'merged', commit: 'e546287',
    chat: [
      { who: 'Castor', text: '警告 W-021/W-022 を解消し、回帰テストを追加せよ。' },
      { who: 'E',      text: 'W-021: 起源 charter 重複参照を解消。W-022: 文脈閾値の数値ハードコード除去。' },
      { who: 'E',      text: 'tests/regression に 11 件追加、全 PASS。merge e546287 完了。' },
    ],
  },
  { id: 'F', codename: 'C-006/C-007', branch: 'B-008',  topic: 'ADVANCED_DRAFT',
    state: 'draft', commit: 'v0.2-draft',
    chat: [
      { who: 'Castor', text: 'C-006 (Tax 系基層) と C-007 (Edu-RX 雛形) を並走起案せよ。' },
      { who: 'F',      text: 'C-006: 既存税務規約 18 件を構造化、ADR 起案候補 5 件。' },
      { who: 'F',      text: 'C-007: Edu-RX 雛形 v0.2 をドラフト中。Phase T1 起動時に正式化予定。' },
    ],
  },
];

// ─────────────────────────────────────────────────────
// Phase 進捗バー (ヘッダ直下、横長)
// ─────────────────────────────────────────────────────
function PhaseProgressBar() {
  const stateColor = (s) => ({
    done:     'var(--ok)',
    starting: 'var(--accent)',
    pending:  'var(--ink-4)',
  })[s] || 'var(--ink-4)';

  return (
    <div style={{
      padding: '11px 24px 12px',
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--line)',
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
      gap: 24,
      alignItems: 'center',
    }}>
      {/* 左: Phase 段階バー */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <span className="kira-serif" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', letterSpacing: '0.08em' }}>段階推移</span>
          <span style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>A → B → C → T1 → T2</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>現在地 <span className="kira-mono" style={{ color: 'var(--accent-ink)', fontWeight: 700 }}>Phase B 起動候補</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 4 }}>
          {PHASE_DATA.phases.map((p, i, arr) => {
            const c = stateColor(p.state);
            const isCurrent = p.id === PHASE_DATA.current;
            return (
              <React.Fragment key={p.id}>
                <div style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column', gap: 3,
                  padding: '5px 8px',
                  background: isCurrent ? 'color-mix(in oklab, var(--accent) 8%, var(--bg-soft))'
                                        : p.state === 'done' ? 'color-mix(in oklab, var(--ok) 5%, var(--bg-soft))'
                                                              : 'var(--bg-soft)',
                  border: `1px solid ${isCurrent ? 'color-mix(in oklab, var(--accent) 30%, var(--line))' : 'var(--line)'}`,
                  borderRadius: 'var(--r-sm)',
                  position: 'relative',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span className="kira-serif" style={{
                      fontSize: 11.5, fontWeight: 700,
                      color: isCurrent ? 'var(--accent-ink)' : p.state === 'done' ? 'var(--ok)' : 'var(--ink-3)',
                      letterSpacing: '0.04em',
                    }}>{p.label}</span>
                    <span style={{ fontSize: 9, color: 'var(--ink-4)', flex: 1 }}>{p.sub}</span>
                    {p.state === 'done' && <span style={{ fontSize: 9, color: 'var(--ok)', fontWeight: 700 }}>完遂</span>}
                    {p.state === 'starting' && <span style={{ fontSize: 9, color: 'var(--accent-ink)', fontWeight: 700 }}>起動候補</span>}
                    {p.state === 'pending' && <span style={{ fontSize: 9, color: 'var(--ink-4)' }}>未起動</span>}
                  </div>
                  {/* セグメントバー(4分割) */}
                  <div style={{ display: 'flex', gap: 2, height: 5 }}>
                    {[0,1,2,3].map(seg => {
                      const filled = p.progress >= (seg + 1) / 4;
                      const partial = !filled && p.progress > seg / 4;
                      return (
                        <div key={seg} style={{
                          flex: 1,
                          background: filled ? c : partial ? `color-mix(in oklab, ${c} 50%, var(--bg-panel))` : 'var(--bg-panel)',
                          border: `1px solid ${filled || partial ? c : 'var(--line)'}`,
                          borderRadius: 1,
                        }} />
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--ink-4)' }}>
                    <span>EVT <span className="kira-mono" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{p.evtCount}</span></span>
                    <span className="kira-mono">{Math.round(p.progress * 100)}%</span>
                  </div>
                </div>
                {i < arr.length-1 && <div style={{ display: 'flex', alignItems: 'center', color: 'var(--ink-4)', fontSize: 11 }}>›</div>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 右: 検証期間 14日 */}
      <VerificationPeriodBar />
    </div>
  );
}

function VerificationPeriodBar() {
  const v = VERIFICATION_PERIOD;
  const todayPct  = (v.elapsedDays / v.totalDays) * 100;
  const midPct    = (7 / v.totalDays) * 100;
  const finalPct  = 100;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span className="kira-serif" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', letterSpacing: '0.08em' }}>検証期間</span>
        <span style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>{v.startLabel} 〜 {v.endLabel}（14日）</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>
          経過 <span className="kira-mono" style={{ color: 'var(--ink-1)', fontWeight: 700 }}>{v.elapsedDays.toFixed(1)}</span> /
          <span className="kira-mono" style={{ color: 'var(--ink-2)' }}> {v.totalDays}</span>日
        </span>
      </div>

      {/* バー本体 */}
      <div style={{ position: 'relative', paddingTop: 8 }}>
        {/* 中間・最終マーカー(ラベル) */}
        <div style={{ position: 'absolute', top: 0, left: `${midPct}%`, transform: 'translateX(-50%)', fontSize: 8.5, color: 'var(--warn)', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
          ◆ 中間評価
        </div>
        <div style={{ position: 'absolute', top: 0, left: `calc(${finalPct}% - 4px)`, transform: 'translateX(-100%)', fontSize: 8.5, color: 'var(--crit)', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
          ◆ 最終評価
        </div>
        {/* ベース */}
        <div style={{
          position: 'relative',
          height: 18,
          background: 'var(--bg-soft)',
          border: '1px solid var(--line)',
          borderRadius: 99,
          overflow: 'hidden',
        }}>
          {/* 進捗(本日まで) */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${todayPct}%`,
            background: 'linear-gradient(90deg, color-mix(in oklab, var(--accent) 35%, var(--bg-panel)), color-mix(in oklab, var(--accent) 60%, var(--bg-panel)))',
          }} />
          {/* 中間マーカー */}
          <div style={{
            position: 'absolute', top: -2, bottom: -2, left: `${midPct}%`,
            width: 2, background: 'var(--warn)',
          }} />
          {/* 最終マーカー */}
          <div style={{
            position: 'absolute', top: -2, bottom: -2, right: 0,
            width: 2, background: 'var(--crit)',
          }} />
          {/* 本日アンカー */}
          <div style={{
            position: 'absolute', top: -3, bottom: -3, left: `${todayPct}%`,
            width: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '7px solid var(--ink-1)',
            transform: 'translateX(-50%)',
          }} />
        </div>
        {/* 軸ラベル */}
        <div style={{ position: 'relative', marginTop: 4, height: 12 }}>
          <span style={{ position: 'absolute', left: 0, fontSize: 9, color: 'var(--ink-4)' }}>{v.startLabel.replace('令和八年 ', '')}</span>
          <span style={{ position: 'absolute', left: `${midPct}%`, transform: 'translateX(-50%)', fontSize: 9, color: 'var(--warn)' }}>五月九日</span>
          <span style={{ position: 'absolute', right: 0, fontSize: 9, color: 'var(--crit)' }}>{v.endLabel.replace('令和八年 ', '')}</span>
        </div>
      </div>

      {/* EVT 累積 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 10, color: 'var(--ink-4)' }}>
        <span>関連 EVT 累積:</span>
        <span className="kira-mono" style={{ color: 'var(--ink-1)', fontSize: 11.5, fontWeight: 700 }}>{v.evtCumulative}</span>
        <span>件</span>
        <span style={{ flex: 1 }} />
        <span>中間到達目安 <span className="kira-mono" style={{ color: 'var(--warn)' }}>{v.evtAtMidExpected}</span></span>
        <span>·</span>
        <span>最終到達目安 <span className="kira-mono" style={{ color: 'var(--crit)' }}>{v.evtAtFinalExpected}</span></span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// サブエージェント並列セクション (工場長タブで使用)
// ─────────────────────────────────────────────────────
function SubagentParallelSection() {
  const [polluxOpen, setPolluxOpen] = useStatePH(false);
  const [polluxLaunched, setPolluxLaunched] = useStatePH(false);

  return (
    <Panel title="サブエージェント並列実証" subtitle={`本日 6並列｜親 = 工場長・丙号 (Castor)`}
           style={{ marginTop: 16 }}
           right={
             <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
               <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>双子展開:</span>
               {polluxLaunched ? (
                 <span style={{
                   fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
                   background: 'var(--ok-soft)', color: 'var(--ok)',
                   border: '1px solid color-mix(in oklab, var(--ok) 30%, var(--line))',
                 }}>Pollux 起動済</span>
               ) : (
                 <button onClick={() => setPolluxOpen(true)} style={{
                   all: 'unset', cursor: 'pointer',
                   fontSize: 10.5, fontWeight: 700,
                   padding: '4px 10px', borderRadius: 99,
                   background: 'color-mix(in oklab, var(--accent) 12%, var(--bg-soft))',
                   color: 'var(--accent-ink)',
                   border: '1px solid color-mix(in oklab, var(--accent) 35%, var(--line))',
                   letterSpacing: '0.04em',
                 }}>双 Pollux 正式起動…</button>
               )}
             </div>
           }>
      {/* 双子図 */}
      <TwinDiagram polluxLaunched={polluxLaunched} />

      {/* サブエージェント6体 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 14 }}>
        {SUBAGENTS.map(sa => <SubagentCard key={sa.id} sa={sa} />)}
      </div>

      {/* Phase B 中盤コメント */}
      <div style={{
        marginTop: 14, padding: '10px 12px',
        background: 'color-mix(in oklab, var(--accent) 5%, var(--bg-soft))',
        border: '1px dashed color-mix(in oklab, var(--accent) 30%, var(--line))',
        borderRadius: 'var(--r-md)',
        fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.7,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 2,
            background: 'var(--accent-ink)', color: 'var(--bg-panel)', letterSpacing: '0.06em',
          }}>PHASE B 中盤</span>
          <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>2026-05-10 〜 2026-05-15 候補</span>
        </div>
        <div>・<span style={{ fontWeight: 700 }}>Pollux 正式起動</span> = 双子構造物理装置化 第1例（工場長 Castor + Pollux 対等並列）</div>
        <div>・<span style={{ fontWeight: 700 }}>Phase T1（Care/Tax/Edu-RX）展開時</span> = 別 codename サブエージェント追加候補</div>
      </div>

      <PolluxLaunchModal open={polluxOpen}
                         onClose={() => setPolluxOpen(false)}
                         onLaunch={() => { setPolluxLaunched(true); setPolluxOpen(false); }} />
    </Panel>
  );
}

function TwinDiagram({ polluxLaunched }) {
  return (
    <div style={{
      padding: 16,
      background: 'var(--bg-soft)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      display: 'grid',
      gridTemplateColumns: '1fr 60px 1fr',
      alignItems: 'center',
      gap: 8,
    }}>
      {/* Castor */}
      <TwinNode label="Castor" sub="工場長・丙号" status="active"
                desc="現行親プロセス｜本日6並列を統括" detail="ADVANCED v0.2 現行" active />
      {/* 接続 */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {polluxLaunched ? (
          <>
            <div style={{ fontSize: 10, color: 'var(--ok)', fontWeight: 700, letterSpacing: '0.08em' }}>双子対等</div>
            <div style={{ width: '100%', height: 2, background: 'var(--ok)' }} />
            <div style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>並列同期</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.08em' }}>未起動</div>
            <div style={{ width: '100%', height: 2, background: 'var(--ink-4)', opacity: 0.3, borderTop: '1px dashed var(--line-strong)', borderTopWidth: 2 }} />
            <div style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>Phase B 中盤候補</div>
          </>
        )}
      </div>
      {/* Pollux */}
      <TwinNode label="Pollux" sub="工場長・丙号 第二相"
                status={polluxLaunched ? 'active' : 'pending'}
                desc={polluxLaunched ? "双子相方｜Castor と対等並列" : "未起動 — 起動準備中"}
                detail={polluxLaunched ? "起動: 本日 15:42" : "Phase B 中盤候補"}
                active={polluxLaunched} />
    </div>
  );
}

function TwinNode({ label, sub, status, desc, detail, active }) {
  return (
    <div style={{
      padding: 12,
      background: active ? 'var(--bg-panel)' : 'color-mix(in oklab, var(--ink-4) 4%, var(--bg-panel))',
      border: `1px solid ${active ? 'color-mix(in oklab, var(--accent) 30%, var(--line))' : 'var(--line)'}`,
      borderRadius: 'var(--r-md)',
      opacity: active ? 1 : 0.65,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: status === 'active' ? 'var(--ok)' : 'var(--ink-4)',
        }} />
        <span className="kira-serif" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-1)', letterSpacing: '0.08em' }}>{label}</span>
        <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>{sub}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.5 }}>{desc}</div>
      <div className="kira-mono" style={{ fontSize: 9.5, color: 'var(--ink-4)', marginTop: 4 }}>{detail}</div>
    </div>
  );
}

function SubagentCard({ sa }) {
  const [open, setOpen] = useStatePH(false);
  const STATE = {
    completed: { label: 'completed', c: 'var(--ok)' },
    merged:    { label: 'merged',    c: 'var(--ok)' },
    advanced:  { label: 'advanced',  c: 'var(--accent-ink)' },
    draft:     { label: 'DRAFT',     c: 'var(--warn)' },
  };
  const st = STATE[sa.state] || STATE.draft;

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      overflow: 'hidden',
    }}>
      {/* ヘッダ */}
      <div style={{
        padding: '9px 12px',
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg-soft)',
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: 4,
          background: 'color-mix(in oklab, var(--accent) 12%, var(--bg-panel))',
          color: 'var(--accent-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-serif)',
          border: '1px solid color-mix(in oklab, var(--accent) 25%, var(--line))',
        }}>{sa.id}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-1)' }}>サブエージェント {sa.id}</span>
            <span className="kira-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{sa.codename}</span>
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 1 }}>{sa.branch} · {sa.topic}</div>
        </div>
        <span style={{
          fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 2,
          background: 'color-mix(in oklab, ' + st.c + ' 12%, var(--bg-panel))',
          color: st.c,
          letterSpacing: '0.04em',
          border: '1px solid color-mix(in oklab, ' + st.c + ' 30%, var(--line))',
        }}>{st.label}</span>
      </div>

      {/* チャット欄(常時表示・折畳可) */}
      <div style={{ padding: '8px 12px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 9.5, color: 'var(--ink-4)', letterSpacing: '0.06em' }}>親 → 子 会話</span>
          <span className="kira-mono" style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>commit {sa.commit}</span>
          <span style={{ flex: 1 }} />
          <button onClick={() => setOpen(!open)} style={{
            all: 'unset', cursor: 'pointer',
            fontSize: 9.5, fontWeight: 600,
            padding: '1px 6px', borderRadius: 2,
            color: 'var(--ink-3)',
            border: '1px solid var(--line)',
          }}>{open ? '畳む' : '全文'}</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(open ? sa.chat : sa.chat.slice(0, 2)).map((m, i) => {
            const isParent = m.who === 'Castor';
            return (
              <div key={i} style={{
                display: 'flex', gap: 6, alignItems: 'flex-start',
                fontSize: 11, lineHeight: 1.45,
              }}>
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  padding: '1px 5px', borderRadius: 2,
                  flex: 'none',
                  background: isParent ? 'var(--ink-1)' : 'color-mix(in oklab, var(--accent) 15%, var(--bg-soft))',
                  color: isParent ? 'var(--bg-panel)' : 'var(--accent-ink)',
                  letterSpacing: '0.04em',
                }}>{isParent ? '親 Castor' : `子 ${sa.id}`}</span>
                <span style={{ color: 'var(--ink-2)' }}>{m.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Pollux 正式起動 モーダル
// ─────────────────────────────────────────────────────
function PolluxLaunchModal({ open, onClose, onLaunch }) {
  if (!open) return null;
  const [step, setStep] = useStatePH('confirm');

  const launch = () => {
    setStep('launching');
    setTimeout(() => { setStep('done'); }, 1400);
    setTimeout(() => { onLaunch(); setStep('confirm'); }, 2200);
  };

  return (
    <ModalShell title="Pollux 正式起動" sub="双子構造物理装置化 第1例｜工場長 Castor + Pollux 対等並列" onClose={onClose}>
      {step === 'confirm' && (
        <>
          <div style={{
            padding: 12,
            background: 'color-mix(in oklab, var(--accent) 5%, var(--bg-soft))',
            border: '1px solid color-mix(in oklab, var(--accent) 25%, var(--line))',
            borderRadius: 'var(--r-md)',
            fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 14,
          }}>
            <div style={{ fontWeight: 700, color: 'var(--ink-1)', marginBottom: 4 }}>本起動の意義</div>
            <div>・サブエージェント並列方式の「子」を、Castor と対等な「双子相方」へ昇格させます。</div>
            <div>・以後 Pollux は独立した親プロセスとして 6並列を持ちうる立場になります。</div>
            <div>・指揮系統は司令官・乙号配下の二相並列となり、規約 §5 の改訂が要件です。</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <KV label="Phase 推奨" v="Phase B 中盤 (05-10〜05-15)" />
            <KV label="先行条件" v="検証期間 中間評価 通過" />
            <KV label="影響規約" v="ADR-009 / PHI-009 / §5" />
            <KV label="記録番号" v="DCR-2026-0510-T (予定)" />
          </div>

          <div style={{
            padding: 10,
            background: 'color-mix(in oklab, var(--warn) 6%, var(--bg-panel))',
            border: '1px dashed color-mix(in oklab, var(--warn) 35%, var(--line))',
            borderRadius: 'var(--r-md)',
            fontSize: 11, color: 'var(--ink-2)', marginBottom: 14,
          }}>
            ⚠ 本起動はヤス採否権限事項です。本画面では <span style={{ fontWeight: 700 }}>仮起動（プレビュー）</span> のみ可能。正式起動は中間評価通過後に再申請してください。
          </div>

          <ModalActions>
            <button onClick={onClose} style={btnSecondaryOp}>取消</button>
            <button onClick={launch} style={btnPrimaryOp}>仮起動（プレビュー）</button>
          </ModalActions>
        </>
      )}
      {step === 'launching' && (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <div className="kira-serif" style={{ fontSize: 18, color: 'var(--accent-ink)', letterSpacing: '0.12em', marginBottom: 8 }}>Pollux を相起動中…</div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>双子並列の確立を試行</div>
        </div>
      )}
      {step === 'done' && (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <div className="kira-serif" style={{ fontSize: 18, color: 'var(--ok)', letterSpacing: '0.12em', marginBottom: 8 }}>仮起動 完了</div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>記録 DCR-2026-0502-PV へ保存</div>
        </div>
      )}
    </ModalShell>
  );
}

Object.assign(window, {
  PHASE_DATA, VERIFICATION_PERIOD, SUBAGENTS,
  PhaseProgressBar, SubagentParallelSection,
});
