// 案C: タイムライン中心ビュー
// 左にライブログが流れ、右にタスク・アラート。現場っぽい。

function VariantC({ activeTab, setActiveTab, todos, setTodos, alerts, setAlerts }) {
  const tabs = [
    { id: 'top',     label: '統制台', glyph: '台' },
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
  const top3 = NODES.filter(n => !n.parent);
  const divisions = NODES.filter(n => n.parent === 'shirei');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AppHeader />
      <TabBar tabs={tabs} active={activeTab} onSelect={setActiveTab} />

      {/* 上段: 7体のミニメーター帯 */}
      <div style={{
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--line)',
        padding: '14px 24px',
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0,
      }}>
        {NODES.map((n, i) => (
          <button key={n.id} onClick={() => setActiveTab(n.parent === 'shirei' ? 'shirei' : n.id)}
            style={{
              all: 'unset', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '4px 8px',
              borderLeft: i > 0 ? '1px solid var(--line)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RoleGlyph role={n.role} status={n.status} size={22} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>{n.role}</span>
                <span className="kira-serif" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-1)', letterSpacing: '0.04em' }}>{n.codename}</span>
              </div>
            </div>
            <div style={{ width: '100%' }}>
              <HBar value={n.health} color={n.status === 'crit' ? 'var(--crit)' : n.status === 'warn' ? 'var(--warn)' : 'var(--ok)'} height={3} />
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 9.5, color: 'var(--ink-4)' }}>
              <span>T<span className="kira-mono" style={{ color: 'var(--ink-2)', fontWeight: 600, marginLeft: 2 }}>{n.activeTasks}</span></span>
              <span>C<span className="kira-mono" style={{ color: n.contextUse > 0.85 ? 'var(--crit)' : 'var(--ink-2)', fontWeight: 600, marginLeft: 2 }}>{Math.round(n.contextUse*100)}</span></span>
            </div>
          </button>
        ))}
      </div>

      {/* 緊急バナー */}
      {criticals.length > 0 && (
        <div style={{
          background: 'var(--crit)',
          color: '#fff',
          padding: '8px 24px',
          fontSize: 12,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{
            fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 14,
            letterSpacing: '0.1em',
          }}>急報</span>
          <span style={{ fontWeight: 600 }}>{criticals[0].title}</span>
          <span style={{ opacity: 0.85 }}>({NODE_BY_ID[criticals[0].target]?.fullname})</span>
          <span style={{ flex: 1 }} />
          <button onClick={() => setActiveTab(criticals[0].target.startsWith('div-') ? 'shirei' : criticals[0].target)} style={{
            all: 'unset', cursor: 'pointer',
            padding: '4px 12px', background: 'rgba(255,255,255,0.18)',
            borderRadius: 3, fontSize: 11.5, fontWeight: 600,
          }}>調査開始 →</button>
        </div>
      )}

      {/* メイン: 二列 */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 380px',
        minHeight: 'calc(100vh - 200px)',
      }}>
        {/* 左: タイムライン */}
        <main style={{ padding: '20px 24px', background: 'var(--bg)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 className="kira-serif" style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '0.06em' }}>
              機関活動誌 <span style={{ color: 'var(--ink-4)', fontWeight: 400, fontSize: 11, marginLeft: 8 }}>Live</span>
            </h2>
            <div style={{ display: 'flex', gap: 6 }}>
              <FilterChip label="全て" active />
              <FilterChip label="警告以上" />
              <FilterChip label="エラーのみ" />
            </div>
          </div>

          <Timeline />
        </main>

        {/* 右: アラート + ToDo */}
        <aside style={{
          background: 'var(--bg-panel)',
          borderLeft: '1px solid var(--line)',
          display: 'flex', flexDirection: 'column',
        }}>
          <section style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--line)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 className="kira-serif" style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>
                アラート
              </h3>
              <span className="kira-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>
                未対応 {alerts.filter(a => !a.acked).length}
              </span>
            </div>
            <div className="kira-scroll" style={{ maxHeight: 280, marginRight: -8, paddingRight: 4 }}>
              {alerts.filter(a => !a.acked).slice(0, 4).map(a => (
                <div key={a.id} style={{
                  padding: '8px 0', borderTop: '1px solid var(--line)',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <SeverityPill sev={a.severity} />
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>{relTime(a.raisedAt)}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-1)', fontWeight: 500, lineHeight: 1.4 }}>{a.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{NODE_BY_ID[a.target]?.codename}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{
            padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 className="kira-serif" style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>
                処務予定
              </h3>
              <span className="kira-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>
                {todos.filter(t => !t.done).length} / {todos.length}
              </span>
            </div>
            <div className="kira-scroll" style={{ flex: 1, marginRight: -8, paddingRight: 4 }}>
              {todos.map(t => (
                <CompactTodoRow key={t.id} todo={t} onToggle={() => {
                  setTodos(prev => prev.map(x => x.id === t.id ? { ...x, done: !x.done } : x));
                }} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function FilterChip({ label, active }) {
  return (
    <button style={{
      all: 'unset', cursor: 'pointer',
      fontSize: 10.5, padding: '3px 9px', borderRadius: 99,
      background: active ? 'var(--ink-1)' : 'var(--bg-panel)',
      color: active ? 'var(--bg-panel)' : 'var(--ink-3)',
      border: `1px solid ${active ? 'var(--ink-1)' : 'var(--line)'}`,
      fontWeight: 600,
    }}>{label}</button>
  );
}

function Timeline() {
  // 時刻でグループ
  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)',
      padding: '8px 0',
    }}>
      {TIMELINE.map((e, i) => {
        const node = NODE_BY_ID[e.node];
        const kindMap = {
          info: { c: 'var(--ink-3)', label: 'INFO' },
          warn: { c: 'var(--warn)',  label: 'WARN' },
          crit: { c: 'var(--crit)',  label: 'CRIT' },
        };
        const k = kindMap[e.kind];
        return (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '70px 70px 130px 1fr',
            gap: 12, alignItems: 'center',
            padding: '8px 16px',
            borderBottom: i < TIMELINE.length - 1 ? '1px solid var(--line)' : 'none',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-soft)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span className="kira-mono" style={{ fontSize: 11, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>
              {e.t}
            </span>
            <span style={{
              fontSize: 9.5, fontFamily: 'var(--font-mono)', fontWeight: 700,
              color: k.c, letterSpacing: '0.08em',
              padding: '2px 0',
            }}>{k.label}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RoleGlyph role={node?.role} status={node?.status} size={18} />
              <span style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 600 }}>{node?.codename}</span>
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink-1)' }}>{e.text}</span>
          </div>
        );
      })}
    </div>
  );
}

window.VariantC = VariantC;
