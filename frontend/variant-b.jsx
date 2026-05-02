// 案B: 指令室ビュー
// 中央に組織系統図、周囲にメーター・アラート・ToDo配置。「中枢」感。

function VariantB({ activeTab, setActiveTab, todos, setTodos, alerts, setAlerts }) {
  const tabs = [
    { id: 'top',     label: '指令室', glyph: '中' },
    { id: 'kantoku', label: '監督官', glyph: '監' },
    { id: 'shirei',  label: '司令官', glyph: '司' },
    { id: 'kojo',    label: '工場長', glyph: '工' },
    { id: 'kiroku',  label: '記録庫', glyph: '庫' },
    { id: 'settings',label: '機関設定', glyph: '設' },
  ];

  if (activeTab !== 'top') {
    return <SubScreen tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />;
  }

  const criticals = alerts.filter(a => a.severity === 'critical' && !a.acked);
  const remaining = todos.filter(t => !t.done).length;
  const top3 = NODES.filter(n => !n.parent);
  const divisions = NODES.filter(n => n.parent === 'shirei');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AppHeader />
      <TabBar tabs={tabs} active={activeTab} onSelect={setActiveTab} />

      <div style={{
        display: 'grid', gridTemplateColumns: '300px 1fr 320px',
        gap: 0, minHeight: 'calc(100vh - 110px)',
      }}>
        {/* ── 左ペイン: アラート ───────────────────── */}
        <aside style={{
          background: 'var(--bg-panel)',
          borderRight: '1px solid var(--line)',
          padding: '16px 14px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            paddingBottom: 8, borderBottom: '1px solid var(--line)',
          }}>
            <h3 className="kira-serif" style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>
              喫緊事項
            </h3>
            <span className="kira-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>
              未対応 {alerts.filter(a => !a.acked).length}
            </span>
          </div>

          {criticals.length > 0 && (
            <div style={{
              padding: 12,
              background: 'color-mix(in oklab, var(--crit) 8%, var(--bg-panel))',
              border: '1px solid color-mix(in oklab, var(--crit) 35%, var(--line))',
              borderRadius: 'var(--r-md)',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 3,
                  background: 'var(--crit)', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                }}>急</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--crit)', letterSpacing: '0.04em' }}>
                  至急対応 {criticals.length}件
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-1)', fontWeight: 600, lineHeight: 1.4 }}>
                {criticals[0].title}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>
                対象 {NODE_BY_ID[criticals[0].target]?.fullname}
              </div>
            </div>
          )}

          <div className="kira-scroll" style={{ flex: 1, marginRight: -8, paddingRight: 4 }}>
            {alerts.filter(a => !a.acked && a.severity !== 'critical').map(a => (
              <button key={a.id}
                onClick={() => setActiveTab(a.target.startsWith('div-') ? 'shirei' : a.target)}
                style={{
                  all: 'unset', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 4,
                  padding: '10px 8px',
                  borderTop: '1px solid var(--line)',
                  width: 'calc(100% - 12px)',
                }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <SeverityPill sev={a.severity} />
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>{relTime(a.raisedAt)}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-1)', fontWeight: 600, lineHeight: 1.4 }}>{a.title}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{NODE_BY_ID[a.target]?.codename}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* ── 中央: 組織系統図 ──────────────────────── */}
        <main style={{
          padding: '24px 32px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h1 className="kira-serif" style={{
              margin: 0, fontSize: 22, fontWeight: 700,
              color: 'var(--ink-1)', letterSpacing: '0.08em',
            }}>機関統制盤</h1>
            <div className="kira-mono" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>
              系統健全度 {Math.round(NODES.reduce((s, n) => s + n.health, 0) / NODES.length)}%
            </div>
          </div>

          <OrgChart nodes={NODES} onSelect={setActiveTab} />

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 8,
          }}>
            {top3.map(n => (
              <SummaryCard key={n.id} node={n} onClick={() => setActiveTab(n.id)} />
            ))}
          </div>
        </main>

        {/* ── 右ペイン: ToDo ────────────────────────── */}
        <aside style={{
          background: 'var(--bg-panel)',
          borderLeft: '1px solid var(--line)',
          padding: '16px 14px',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            paddingBottom: 8, borderBottom: '1px solid var(--line)', marginBottom: 6,
          }}>
            <h3 className="kira-serif" style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>
              処務予定
            </h3>
            <span className="kira-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>
              未処理 {remaining}
            </span>
          </div>
          <div className="kira-scroll" style={{ flex: 1 }}>
            {todos.map(t => (
              <CompactTodoRow key={t.id} todo={t} onToggle={() => {
                setTodos(prev => prev.map(x => x.id === t.id ? { ...x, done: !x.done } : x));
              }} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── 組織系統図 ───────────────────────────────────────
function OrgChart({ nodes, onSelect }) {
  const top3 = nodes.filter(n => !n.parent);
  const divisions = nodes.filter(n => n.parent === 'shirei');

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)',
      padding: '24px 20px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 12, right: 14,
        fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.08em',
        fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
      }}>系統図 / Hierarchy</div>

      {/* 上段: 三体 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {top3.map(n => <OrgNode key={n.id} node={n} onClick={() => onSelect(n.id)} large />)}
      </div>

      {/* 司令官 → 事業部門の接続線 */}
      <div style={{
        position: 'relative', height: 28, margin: '6px 0',
      }}>
        <svg width="100%" height="28" style={{ position: 'absolute', inset: 0 }}>
          {/* 司令官のカードは中央列。中央列の中央から下に伸びる */}
          <line x1="50%" y1="0" x2="50%" y2="14" stroke="var(--line-strong)" strokeWidth="1" />
          <line x1="12.5%" y1="14" x2="87.5%" y2="14" stroke="var(--line-strong)" strokeWidth="1" />
          {[12.5, 37.5, 62.5, 87.5].map((p, i) => (
            <line key={i} x1={`${p}%`} y1="14" x2={`${p}%`} y2="28" stroke="var(--line-strong)" strokeWidth="1" />
          ))}
        </svg>
      </div>

      {/* 下段: 事業部門 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {divisions.map(n => <OrgNode key={n.id} node={n} onClick={() => onSelect('shirei')} />)}
      </div>

      <div style={{
        marginTop: 18, paddingTop: 14, borderTop: '1px dashed var(--line)',
        display: 'flex', alignItems: 'center', gap: 16, fontSize: 10.5, color: 'var(--ink-4)',
      }}>
        <LegendItem status="ok" label="稼働中" />
        <LegendItem status="warn" label="警告" />
        <LegendItem status="crit" label="エラー" />
        <LegendItem status="idle" label="待機" />
      </div>
    </div>
  );
}

function LegendItem({ status, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span className={`kira-dot ${status}`} />
      <span>{label}</span>
    </div>
  );
}

function OrgNode({ node, onClick, large }) {
  const isCrit = node.status === 'crit';
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer',
      padding: large ? '14px 14px' : '10px 12px',
      background: isCrit ? 'color-mix(in oklab, var(--crit) 4%, var(--bg-panel))' : 'var(--bg-panel)',
      border: `1px solid ${isCrit ? 'color-mix(in oklab, var(--crit) 35%, var(--line))' : 'var(--line)'}`,
      borderRadius: 'var(--r-md)',
      transition: 'all 0.15s',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = isCrit ? 'color-mix(in oklab, var(--crit) 35%, var(--line))' : 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <RoleGlyph role={node.role} status={node.status} size={large ? 36 : 26} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kira-serif" style={{
            fontSize: large ? 14 : 12, fontWeight: 700, color: 'var(--ink-1)',
            letterSpacing: '0.04em',
          }}>{large ? node.fullname : node.codename}</div>
          {large && (
            <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 1 }}>{node.role}・{node.codename}</div>
          )}
        </div>
        <span className={`kira-dot ${node.status}`} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <HBar value={node.health} color={node.status === 'crit' ? 'var(--crit)' : node.status === 'warn' ? 'var(--warn)' : 'var(--ok)'} />
        </div>
        <span className="kira-mono" style={{ fontSize: 10.5, color: 'var(--ink-2)', fontWeight: 600, minWidth: 26, textAlign: 'right' }}>
          {node.health}
        </span>
      </div>
      {large && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--ink-3)' }}>
          <span>タスク <span className="kira-mono" style={{ color: 'var(--ink-1)', fontWeight: 600 }}>{node.activeTasks}</span></span>
          <span>文脈 <span className="kira-mono" style={{ color: node.contextUse > 0.85 ? 'var(--crit)' : 'var(--ink-1)', fontWeight: 600 }}>{Math.round(node.contextUse*100)}%</span></span>
          <span>応答 <span className="kira-mono">{node.lastResponseAt.slice(0,5)}</span></span>
        </div>
      )}
    </button>
  );
}

function SummaryCard({ node, onClick }) {
  const spark = useMemo(() => makeSpark(node.id.charCodeAt(1) + 7, 24, node.health, 14), [node.id]);
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer',
      padding: 14,
      background: 'var(--bg-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.06em' }}>{node.role}</span>
        <StatusBadge status={node.status} />
      </div>
      <Spark data={spark} w={260} h={36} color={node.status === 'crit' ? 'var(--crit)' : node.status === 'warn' ? 'var(--warn)' : 'var(--ok)'} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)' }}>
        <span>成功率 <span className="kira-mono" style={{ color: 'var(--ink-1)', fontWeight: 600 }}>{(node.successRate*100).toFixed(1)}%</span></span>
        <span>文脈 <span className="kira-mono" style={{ color: node.contextUse > 0.85 ? 'var(--crit)' : 'var(--ink-1)', fontWeight: 600 }}>{Math.round(node.contextUse*100)}%</span></span>
      </div>
    </button>
  );
}

function CompactTodoRow({ todo, onToggle }) {
  const node = NODE_BY_ID[todo.owner];
  const prio = {
    high: 'var(--crit)',
    med:  'var(--warn)',
    low:  'var(--ink-4)',
  }[todo.priority];
  return (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: 8,
      padding: '8px 4px',
      borderBottom: '1px solid var(--line)',
      cursor: 'pointer',
      opacity: todo.done ? 0.45 : 1,
    }}>
      <input type="checkbox" checked={todo.done} onChange={onToggle}
             style={{ marginTop: 2, accentColor: 'var(--accent)' }} />
      <div style={{ width: 3, alignSelf: 'stretch', background: prio, borderRadius: 2, marginTop: 2, marginBottom: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11.5, color: 'var(--ink-1)', fontWeight: 500, lineHeight: 1.4,
          textDecoration: todo.done ? 'line-through' : 'none',
        }}>{todo.title}</div>
        <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2, display: 'flex', gap: 6 }}>
          <span>{node?.codename}</span>
          <span>·</span>
          <span>{todo.due}</span>
        </div>
      </div>
    </label>
  );
}

window.VariantB = VariantB;
