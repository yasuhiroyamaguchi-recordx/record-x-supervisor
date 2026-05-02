// 案A: 正統 機関ダッシュボード（採用案・本実装）
// 上部: ヘルスメーター行 / 中央: アラート + ToDo / 下部: 系統樹
// 改修事項:
//  1. 文脈使用率の閾値ライン (>80% 警告 / >90% エラー)
//  2. 警告/エラーの因果連動表示（クリックで原因と影響を展開）
//  3. 活動誌の EVT 系列分類色分け（J/M/B/K/E）
//  4. 処務予定の採否経路化（承認 → 実行/差戻し）
//  5. 配下事業部門 拡張可能化（プリセット切替）

const { useState: useStateA, useMemo: useMemoA } = React;

function VariantA({ activeTab, setActiveTab, todos, setTodos, alerts, setAlerts,
                    divisionPreset, setDivisionPreset, focusAlert, setFocusAlert }) {
  const top3 = NODES.filter(n => !n.parent);

  // プリセットに応じて事業部門を決定
  const divisionIds = DIVISION_PRESETS[divisionPreset].divisions;
  const divisions = divisionIds.map(id => NODE_BY_ID[id]).filter(Boolean);

  const tabs = [
    { id: 'top',          label: 'トップ', glyph: '本' },
    { id: 'kantoku',      label: '監督官', glyph: '監' },
    { id: 'shirei',       label: '司令官', glyph: '司', badge: divisions.length, badgeColor: 'var(--accent-soft)', badgeTextColor: 'var(--accent-ink)' },
    { id: 'kojo',         label: '工場長', glyph: '工' },
    { id: 'kiroku',       label: '記録庫', glyph: '庫' },
    { id: 'settings',     label: '機関設定', glyph: '設' },
    { id: 'catalog',      label: '機能カタログ', glyph: '帖' },
  ];

  if (activeTab !== 'top') {
    return <SubScreen tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}
                      divisions={divisions}
                      divisionPreset={divisionPreset} setDivisionPreset={setDivisionPreset} />;
  }

  const criticals = alerts.filter(a => a.severity === 'critical' && !a.acked);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AppHeader />
      <PhaseProgressBar />
      <TabBar tabs={tabs} active={activeTab} onSelect={setActiveTab} />

      <div style={{ padding: '20px 24px 60px', maxWidth: 1440, margin: '0 auto' }}>
        {/* ── 概況バナー ─────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div>
            <h1 className="kira-serif" style={{
              margin: 0, fontSize: 22, fontWeight: 700,
              color: 'var(--ink-1)', letterSpacing: '0.06em',
            }}>本日の機関概況</h1>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
              所属{NODES.filter(n => !n.parent).length + divisions.length}体すべての稼働状況・喫緊の処務・記録要請を一覧します。
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <PillStat label="稼働中" value={[...top3, ...divisions].filter(n => n.status === 'ok').length} total={top3.length + divisions.length} tone="ok" />
            <PillStat label="警告"   value={[...top3, ...divisions].filter(n => n.status === 'warn').length} total={top3.length + divisions.length} tone="warn" />
            <PillStat label="エラー" value={[...top3, ...divisions].filter(n => n.status === 'crit').length} total={top3.length + divisions.length} tone="crit" />
          </div>
        </div>

        {/* ── アラート（緊急） ──────────────────────── */}
        {criticals.length > 0 && (
          <div style={{
            marginBottom: 16,
            background: 'color-mix(in oklab, var(--crit) 6%, var(--bg-panel))',
            border: '1px solid color-mix(in oklab, var(--crit) 30%, var(--line))',
            borderRadius: 'var(--r-lg)',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--crit)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 16, flex: 'none',
            }}>急</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--crit)', letterSpacing: '0.04em', marginBottom: 2 }}>
                至急対応 — {criticals.length}件
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-1)', fontWeight: 600 }}>
                {criticals[0].title}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
                対象: {NODE_BY_ID[criticals[0].target]?.fullname} · 発出 {relTime(criticals[0].raisedAt)}
              </div>
            </div>
            <button onClick={() => setFocusAlert(criticals[0].id)} style={{
              all: 'unset', cursor: 'pointer',
              padding: '8px 14px',
              background: 'var(--crit)', color: '#fff',
              fontSize: 12, fontWeight: 600,
              borderRadius: 'var(--r-md)',
            }}>因果展開 →</button>
          </div>
        )}

        {/* ── ヘルスメーター行 ──────────────────────── */}
        <Panel title="機関健康度" subtitle="本日 15:42:06 時点" style={{ marginBottom: 16 }}
               right={
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <ContextLegend />
                   <span className="kira-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>10秒毎更新</span>
                 </div>
               }>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {top3.map(n => <HealthCard key={n.id} node={n} alerts={alerts} onClick={() => setActiveTab(n.id)} onAlertClick={(id) => setFocusAlert(id)} />)}
          </div>
          <div style={{
            marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--line)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{
                fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.08em',
                textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
              }}>司令官 配下 事業部門 ({divisions.length}体)</span>
              <PresetSwitcher current={divisionPreset} onChange={setDivisionPreset} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {divisions.map(n => <DivisionMini key={n.id} node={n} alerts={alerts} onClick={() => setActiveTab('shirei')} onAlertClick={(id) => setFocusAlert(id)} />)}
            </div>
          </div>
        </Panel>

        {/* ── アラート + ToDo + ログ ───────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.1fr 1fr', gap: 16 }}>
          <AlertsPanel alerts={alerts} setAlerts={setAlerts} setActiveTab={setActiveTab}
                       focusAlert={focusAlert} setFocusAlert={setFocusAlert} />
          <TodosPanel todos={todos} setTodos={setTodos} />
          <ActivityPanel />
        </div>
      </div>
    </div>
  );
}

// ── 文脈使用率の凡例 ───────────────────────────────
function ContextLegend() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'var(--ink-4)' }}>
      <span>文脈閾値:</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <span style={{ width: 18, height: 4, background: 'var(--bg-sunken)', borderRadius: 2, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '80%', top: -1, width: 1, height: 6, background: 'var(--warn)' }} />
        </span>
        <span style={{ color: 'var(--warn)' }}>80%警告</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <span style={{ width: 18, height: 4, background: 'var(--bg-sunken)', borderRadius: 2, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '90%', top: -1, width: 1, height: 6, background: 'var(--crit)' }} />
        </span>
        <span style={{ color: 'var(--crit)' }}>90%エラー</span>
      </span>
    </div>
  );
}

// ── プリセット切替 ─────────────────────────────────
function PresetSwitcher({ current, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {Object.entries(DIVISION_PRESETS).map(([k, p]) => (
        <button key={k} onClick={() => onChange(k)} style={{
          all: 'unset', cursor: 'pointer',
          fontSize: 10, padding: '2px 8px', borderRadius: 99,
          background: current === k ? 'var(--accent-soft)' : 'transparent',
          color: current === k ? 'var(--accent-ink)' : 'var(--ink-4)',
          border: `1px solid ${current === k ? 'color-mix(in oklab, var(--accent) 25%, var(--line))' : 'var(--line)'}`,
          fontWeight: 600,
        }}>{p.label}</button>
      ))}
    </div>
  );
}

// ── 文脈使用率バー（閾値ライン付き） ───────────────────
function ContextBar({ value }) {
  const v = Math.max(0, Math.min(1, value));
  const color = v > CONTEXT_THRESHOLDS.crit ? 'var(--crit)' :
                v > CONTEXT_THRESHOLDS.warn ? 'var(--warn)' : 'var(--accent)';
  return (
    <div style={{ position: 'relative', width: '100%', height: 6, background: 'var(--bg-sunken)', borderRadius: 99, overflow: 'visible' }}>
      <div style={{
        width: `${v * 100}%`, height: '100%',
        background: color, borderRadius: 99,
        transition: 'width 0.6s ease, background 0.3s',
      }} />
      {/* 80% 警告ライン */}
      <span style={{
        position: 'absolute', left: '80%', top: -2, width: 1, height: 10,
        background: 'var(--warn)', opacity: 0.7,
      }} />
      {/* 90% エラーライン */}
      <span style={{
        position: 'absolute', left: '90%', top: -2, width: 1, height: 10,
        background: 'var(--crit)', opacity: 0.7,
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────
function PillStat({ label, value, total, tone }) {
  const colors = {
    ok:   { c: 'var(--ok)',   bg: 'var(--ok-soft)' },
    warn: { c: 'var(--warn)', bg: 'var(--warn-soft)' },
    crit: { c: 'var(--crit)', bg: 'var(--crit-soft)' },
  };
  const m = colors[tone];
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 6,
      padding: '6px 12px',
      background: m.bg, color: m.c,
      borderRadius: 'var(--r-md)',
      border: `1px solid color-mix(in oklab, ${m.c} 25%, transparent)`,
    }}>
      <span className="kira-mono" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>/ {total}</span>
      <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function HealthCard({ node, alerts, onClick, onAlertClick }) {
  const spark = useMemoA(() => makeSpark(node.id.charCodeAt(0) + node.id.length, 28, node.health, 18), [node.id]);
  const ctxOver = node.contextUse > CONTEXT_THRESHOLDS.warn;
  const ctxCrit = node.contextUse > CONTEXT_THRESHOLDS.crit;

  // この機関に関連するアラート
  const myAlerts = alerts.filter(a => !a.acked && a.target === node.id);
  const myCrit = myAlerts.find(a => a.severity === 'critical');

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 12,
      padding: '14px 16px',
      background: 'var(--bg-panel)',
      border: `1px solid ${ctxCrit ? 'color-mix(in oklab, var(--crit) 30%, var(--line))' : 'var(--line)'}`,
      borderRadius: 'var(--r-md)',
      transition: 'border-color 0.15s',
      cursor: 'pointer',
    }}
    onClick={onClick}
    onMouseEnter={e => { e.currentTarget.style.borderColor = ctxCrit ? 'var(--crit)' : 'var(--line-strong)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = ctxCrit ? 'color-mix(in oklab, var(--crit) 30%, var(--line))' : 'var(--line)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <RoleGlyph role={node.role} status={node.status} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kira-serif" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-1)', letterSpacing: '0.04em' }}>
            {node.fullname}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{node.description}</div>
        </div>
        <StatusBadge status={node.status} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center' }}>
        <HealthArc value={node.health} size={64} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Metric label="実行中タスク" value={node.activeTasks} unit="件" />
          <Metric label="成功率" value={(node.successRate * 100).toFixed(1)} unit="%" />
          {/* 文脈使用率 行 (閾値バー) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 11.5 }}>
              <span style={{ color: 'var(--ink-3)' }}>文脈使用</span>
              <span className="kira-mono" style={{
                color: ctxCrit ? 'var(--crit)' : ctxOver ? 'var(--warn)' : 'var(--ink-1)',
                fontWeight: ctxCrit ? 700 : 600,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {Math.round(node.contextUse * 100)}<span style={{ color: 'var(--ink-4)', fontWeight: 400, marginLeft: 1 }}>%</span>
              </span>
            </div>
            <ContextBar value={node.contextUse} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <Spark data={spark} w={88} h={28} color={node.status === 'crit' ? 'var(--crit)' : node.status === 'warn' ? 'var(--warn)' : 'var(--ok)'} />
          <div className="kira-mono" style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>応答 {node.lastResponseAt}</div>
        </div>
      </div>
      {/* この機関に紐づくアラート（クリックで因果展開） */}
      {myAlerts.length > 0 && (
        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {myAlerts.slice(0, 2).map(a => (
            <button key={a.id} onClick={() => onAlertClick(a.id)} style={{
              all: 'unset', cursor: 'pointer',
              fontSize: 10.5, padding: '3px 8px',
              background: a.severity === 'critical' ? 'var(--crit-soft)' : 'var(--warn-soft)',
              color: a.severity === 'critical' ? 'var(--crit)' : 'var(--warn)',
              border: `1px dashed ${a.severity === 'critical' ? 'var(--crit)' : 'var(--warn)'}`,
              borderRadius: 'var(--r-sm)',
              fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span className="kira-mono" style={{ fontSize: 9 }}>{a.id}</span>
              <span>因果展開 →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, unit, warn }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 11.5, gap: 8 }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span className="kira-mono" style={{ color: warn ? 'var(--crit)' : 'var(--ink-1)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        {value}<span style={{ color: 'var(--ink-4)', fontWeight: 400, marginLeft: 2 }}>{unit}</span>
      </span>
    </div>
  );
}

function DivisionMini({ node, alerts, onClick, onAlertClick }) {
  const ctxCrit = node.contextUse > CONTEXT_THRESHOLDS.crit;
  const ctxWarn = node.contextUse > CONTEXT_THRESHOLDS.warn;
  const myAlerts = alerts.filter(a => !a.acked && a.target === node.id);
  const myCrit = myAlerts.find(a => a.severity === 'critical');

  return (
    <div onClick={onClick} style={{
      cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 6,
      padding: '10px 12px',
      background: ctxCrit ? 'color-mix(in oklab, var(--crit) 4%, var(--bg-soft))' : 'var(--bg-soft)',
      border: `1px solid ${ctxCrit ? 'color-mix(in oklab, var(--crit) 30%, var(--line))' : 'var(--line)'}`,
      borderRadius: 'var(--r-md)',
      transition: 'background 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <RoleGlyph role={node.role} status={node.status} size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-1)' }}>{node.codename}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 1, display: 'flex', gap: 6 }}>
            <span className="kira-mono">タスク {node.activeTasks}</span>
            <span>·</span>
            <span style={{ color: ctxCrit ? 'var(--crit)' : ctxWarn ? 'var(--warn)' : 'var(--ink-4)', fontWeight: ctxCrit ? 700 : 400 }}>
              文脈 <span className="kira-mono">{Math.round(node.contextUse * 100)}%</span>
            </span>
          </div>
        </div>
        <span className={`kira-dot ${node.status}`} />
      </div>
      <ContextBar value={node.contextUse} />
      {myCrit && (
        <button onClick={e => { e.stopPropagation(); onAlertClick(myCrit.id); }} style={{
          all: 'unset', cursor: 'pointer',
          fontSize: 9.5, padding: '2px 6px',
          background: 'var(--crit-soft)', color: 'var(--crit)',
          border: '1px dashed var(--crit)',
          borderRadius: 3, fontWeight: 700,
          alignSelf: 'flex-start',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <span className="kira-mono">{myCrit.id}</span> 因果展開
        </button>
      )}
    </div>
  );
}

// ── アラートパネル（因果連動・展開対応） ─────────────────
function AlertsPanel({ alerts, setAlerts, setActiveTab, focusAlert, setFocusAlert }) {
  const [filter, setFilter] = useStateA('all');
  const visible = alerts.filter(a => !a.acked && (filter === 'all' || a.severity === filter));

  const ack = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, acked: true } : a));

  const filters = [
    { id: 'all',      label: '全て', count: alerts.filter(a => !a.acked).length },
    { id: 'critical', label: '緊急', count: alerts.filter(a => !a.acked && a.severity === 'critical').length },
    { id: 'high',     label: '重要', count: alerts.filter(a => !a.acked && a.severity === 'high').length },
  ];

  return (
    <Panel title="アラート" subtitle={`未対応 ${alerts.filter(a => !a.acked).length}件`}
           padding={0}
           right={
             <div style={{ display: 'flex', gap: 4 }}>
               {filters.map(f => (
                 <button key={f.id} onClick={() => setFilter(f.id)} style={{
                   all: 'unset', cursor: 'pointer',
                   fontSize: 10.5, padding: '3px 8px',
                   borderRadius: 99,
                   background: filter === f.id ? 'var(--ink-1)' : 'transparent',
                   color: filter === f.id ? 'var(--bg-panel)' : 'var(--ink-3)',
                   fontWeight: 600,
                 }}>{f.label}{f.count > 0 && <span style={{ marginLeft: 3, opacity: 0.7 }}>{f.count}</span>}</button>
               ))}
             </div>
           }
    >
      <div className="kira-scroll" style={{ maxHeight: 460 }}>
        {visible.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12 }}>
            未対応のアラートはありません。
          </div>
        ) : visible.map((a, i) => (
          <AlertRow key={a.id} alert={a} alerts={alerts}
                    expanded={focusAlert === a.id}
                    onExpand={() => setFocusAlert(focusAlert === a.id ? null : a.id)}
                    onJumpAlert={(id) => setFocusAlert(id)}
                    onAck={() => ack(a.id)}
                    onInvestigate={() => setActiveTab(a.target.startsWith('div-') ? 'shirei' : a.target)}
                    last={i === visible.length - 1} />
        ))}
      </div>
    </Panel>
  );
}

// ── アラート行（因果展開可能） ────────────────────────
function AlertRow({ alert: a, alerts, expanded, onExpand, onJumpAlert, onAck, onInvestigate, last }) {
  const causes = (a.causes || []).map(id => alerts.find(x => x.id === id)).filter(Boolean);
  const effects = (a.effects || []).map(id => alerts.find(x => x.id === id)).filter(Boolean);
  const hasCausal = causes.length > 0 || effects.length > 0;

  return (
    <div style={{
      borderBottom: !last ? '1px solid var(--line)' : 'none',
      background: expanded ? 'var(--bg-soft)' : 'transparent',
      transition: 'background 0.15s',
    }}>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SeverityPill sev={a.severity} />
          <span className="kira-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{a.id}</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>{relTime(a.raisedAt)}</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-1)', fontWeight: 600, lineHeight: 1.45 }}>{a.title}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.55 }}>{a.detail}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>
            対象: <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{NODE_BY_ID[a.target]?.fullname}</span>
          </span>
          <span style={{ flex: 1 }} />
          {hasCausal && (
            <button onClick={onExpand} style={{
              all: 'unset', cursor: 'pointer',
              fontSize: 11, fontWeight: 600,
              color: 'var(--accent-ink)',
              padding: '4px 8px',
              borderRadius: 'var(--r-sm)',
              background: expanded ? 'var(--accent-soft)' : 'transparent',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s', fontSize: 9 }}>▶</span>
              因果展開
              <span className="kira-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{causes.length}↑/{effects.length}↓</span>
            </button>
          )}
          <button onClick={onInvestigate} style={{
            all: 'unset', cursor: 'pointer',
            fontSize: 11, fontWeight: 600,
            color: 'var(--ink-2)',
            padding: '4px 8px',
            borderRadius: 'var(--r-sm)',
          }}>調査</button>
          {a.ackable && (
            <button onClick={onAck} style={{
              all: 'unset', cursor: 'pointer',
              fontSize: 11, fontWeight: 600,
              color: 'var(--ink-2)',
              padding: '4px 8px',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--line)',
            }}>了承</button>
          )}
        </div>
      </div>

      {/* 因果展開セクション */}
      {expanded && hasCausal && (
        <div style={{
          padding: '0 16px 12px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {causes.length > 0 && (
            <CausalGroup label="上流原因" arrow="↑" items={causes} onJump={onJumpAlert} />
          )}
          {effects.length > 0 && (
            <CausalGroup label="下流影響" arrow="↓" items={effects} onJump={onJumpAlert} />
          )}
        </div>
      )}
    </div>
  );
}

function CausalGroup({ label, arrow, items, onJump }) {
  return (
    <div style={{
      borderLeft: '2px solid var(--accent)',
      paddingLeft: 10,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: 'var(--accent-ink)',
        letterSpacing: '0.06em', marginBottom: 5,
      }}>
        <span className="kira-mono" style={{ marginRight: 4 }}>{arrow}</span>{label} ({items.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(c => (
          <button key={c.id} onClick={() => onJump(c.id)} style={{
            all: 'unset', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 8px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-sm)',
          }}>
            <SeverityPill sev={c.severity} />
            <span className="kira-mono" style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>{c.id}</span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-1)', flex: 1 }}>{c.title}</span>
            <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>{NODE_BY_ID[c.target]?.codename}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── ToDoパネル（採否経路化） ─────────────────────────
function TodosPanel({ todos, setTodos }) {
  const [view, setView] = useStateA('all');
  // todo.state: 'pending' | 'approved' | 'rejected' | 'done'
  const updateTodo = (id, patch) => setTodos(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));

  const remaining = todos.filter(t => t.state !== 'done' && t.state !== 'rejected').length;
  const pending = todos.filter(t => t.state === 'pending').length;

  return (
    <Panel title="処務予定" subtitle={`未処理 ${remaining}件 (要採否 ${pending})`}
           padding={0}
           right={
             <div style={{ display: 'flex', gap: 4, fontSize: 10.5 }}>
               {[{id:'all',label:'統合'},{id:'byDept',label:'部門別'}].map(v => (
                 <button key={v.id} onClick={() => setView(v.id)} style={{
                   all: 'unset', cursor: 'pointer',
                   padding: '3px 9px', borderRadius: 99,
                   background: view === v.id ? 'var(--ink-1)' : 'transparent',
                   color: view === v.id ? 'var(--bg-panel)' : 'var(--ink-3)',
                   fontWeight: 600,
                 }}>{v.label}</button>
               ))}
             </div>
           }
    >
      <div className="kira-scroll" style={{ maxHeight: 460 }}>
        {view === 'all' ? (
          todos.map((t, i) => <TodoRow key={t.id} todo={t} onUpdate={(p) => updateTodo(t.id, p)} last={i === todos.length - 1} />)
        ) : (
          [...new Set(todos.map(t => t.owner))].map(ownerId => {
            const node = NODE_BY_ID[ownerId];
            const items = todos.filter(t => t.owner === ownerId);
            return (
              <div key={ownerId}>
                <div style={{
                  padding: '8px 16px',
                  fontSize: 10.5, fontWeight: 600,
                  color: 'var(--ink-3)', letterSpacing: '0.04em',
                  background: 'var(--bg-sunken)',
                  borderTop: '1px solid var(--line)',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <RoleGlyph role={node?.role} status="idle" size={18} dim />
                  <span>{node?.fullname}</span>
                  <span style={{ flex: 1 }} />
                  <span className="kira-mono" style={{ color: 'var(--ink-4)' }}>{items.filter(t => t.state !== 'done' && t.state !== 'rejected').length} / {items.length}</span>
                </div>
                {items.map((t, i) => <TodoRow key={t.id} todo={t} onUpdate={(p) => updateTodo(t.id, p)} last={i === items.length - 1} compact />)}
              </div>
            );
          })
        )}
      </div>
    </Panel>
  );
}

function TodoRow({ todo, onUpdate, last, compact }) {
  const node = NODE_BY_ID[todo.owner];
  const prio = {
    high: { color: 'var(--crit)', label: '高' },
    med:  { color: 'var(--warn)', label: '中' },
    low:  { color: 'var(--ink-4)', label: '低' },
  }[todo.priority] || { color: 'var(--ink-4)', label: '低' };

  const state = todo.state || 'pending';
  const isDone = state === 'done';
  const isRej = state === 'rejected';
  const isAppr = state === 'approved';

  const stateBadge = {
    pending:  { color: 'var(--ink-3)',    bg: 'var(--bg-sunken)', label: '採否待' },
    approved: { color: 'var(--accent-ink)', bg: 'var(--accent-soft)', label: '承認・実行' },
    done:     { color: 'var(--ok)',       bg: 'var(--ok-soft)',   label: '完了' },
    rejected: { color: 'var(--ink-4)',    bg: 'var(--bg-sunken)', label: '差戻し' },
  }[state];

  return (
    <div style={{
      padding: '10px 16px',
      borderBottom: !last ? '1px solid var(--line)' : 'none',
      display: 'flex', alignItems: 'flex-start', gap: 10,
      transition: 'background 0.1s',
      opacity: isDone || isRej ? 0.55 : 1,
    }}>
      {/* 状態アイコン */}
      <div style={{ marginTop: 1, flex: 'none' }}>
        {isDone ? (
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--ok)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700,
          }}>✓</div>
        ) : isRej ? (
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--bg-sunken)', color: 'var(--ink-4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700,
            border: '1px solid var(--line)',
          }}>×</div>
        ) : isAppr ? (
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700,
          }}>▶</div>
        ) : (
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--bg-panel)',
            border: '2px solid var(--line-strong)',
          }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 9, fontWeight: 700, color: prio.color,
            border: `1px solid ${prio.color}`, padding: '0 4px', borderRadius: 2,
            letterSpacing: '0.05em',
          }}>{prio.label}</span>
          <span className="kira-mono" style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>{todo.id}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
            color: stateBadge.color, background: stateBadge.bg,
            letterSpacing: '0.04em',
          }}>{stateBadge.label}</span>
        </div>
        <div style={{
          fontSize: 12.5, color: 'var(--ink-1)', fontWeight: 500,
          textDecoration: isDone || isRej ? 'line-through' : 'none',
          lineHeight: 1.45,
        }}>{todo.title}</div>
        {!compact && (
          <div style={{ display: 'flex', gap: 10, fontSize: 10.5, color: 'var(--ink-4)', marginTop: 4 }}>
            <span>{node?.fullname}</span>
            <span>·</span>
            <span>期限 {todo.due}</span>
          </div>
        )}
        {compact && (
          <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 2 }}>期限 {todo.due}</div>
        )}

        {/* 採否経路アクション */}
        <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
          {state === 'pending' && (
            <>
              <button onClick={() => onUpdate({ state: 'approved' })} style={{
                all: 'unset', cursor: 'pointer',
                fontSize: 10.5, fontWeight: 700,
                padding: '3px 10px',
                background: 'var(--accent)', color: '#fff',
                borderRadius: 'var(--r-sm)',
              }}>承認</button>
              <button onClick={() => onUpdate({ state: 'rejected' })} style={{
                all: 'unset', cursor: 'pointer',
                fontSize: 10.5, fontWeight: 600,
                padding: '3px 10px',
                color: 'var(--ink-3)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-sm)',
              }}>差戻し</button>
            </>
          )}
          {state === 'approved' && (
            <>
              <button onClick={() => onUpdate({ state: 'done' })} style={{
                all: 'unset', cursor: 'pointer',
                fontSize: 10.5, fontWeight: 700,
                padding: '3px 10px',
                background: 'var(--ok)', color: '#fff',
                borderRadius: 'var(--r-sm)',
              }}>完了として記録</button>
              <button onClick={() => onUpdate({ state: 'pending' })} style={{
                all: 'unset', cursor: 'pointer',
                fontSize: 10.5, fontWeight: 600,
                padding: '3px 10px',
                color: 'var(--ink-4)',
                borderRadius: 'var(--r-sm)',
              }}>取消</button>
            </>
          )}
          {(state === 'done' || state === 'rejected') && (
            <button onClick={() => onUpdate({ state: 'pending' })} style={{
              all: 'unset', cursor: 'pointer',
              fontSize: 10.5, fontWeight: 600,
              padding: '3px 10px',
              color: 'var(--ink-4)',
              borderRadius: 'var(--r-sm)',
            }}>採否やり直し</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 活動誌（系列分類色分け） ─────────────────────────
function ActivityPanel() {
  const [seriesFilter, setSeriesFilter] = useStateA('all');
  const filtered = TIMELINE.filter(e => seriesFilter === 'all' || e.series === seriesFilter);

  return (
    <Panel title="機関活動誌" subtitle="リアルタイム" padding={0}
           right={
             <div style={{ display: 'flex', gap: 3 }}>
               <SeriesChip active={seriesFilter === 'all'} onClick={() => setSeriesFilter('all')} label="全" />
               {Object.entries(SERIES).map(([k, s]) => (
                 <SeriesChip key={k} active={seriesFilter === k} onClick={() => setSeriesFilter(k)}
                             label={k} color={s.color} bg={s.bg} />
               ))}
             </div>
           }>
      <div className="kira-scroll" style={{ maxHeight: 460 }}>
        {filtered.map((e, i) => {
          const node = NODE_BY_ID[e.node];
          const s = SERIES[e.series] || SERIES.K;
          return (
            <div key={i} style={{
              padding: '10px 16px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none',
              display: 'flex', gap: 10, alignItems: 'flex-start',
              borderLeft: `3px solid ${s.color}`,
            }}>
              <div className="kira-mono" style={{ fontSize: 10, color: 'var(--ink-4)', flex: 'none', width: 50 }}>
                {e.t.slice(0, 5)}
              </div>
              <span style={{
                flex: 'none',
                fontSize: 9, fontWeight: 700,
                color: s.color, background: s.bg,
                padding: '1px 5px', borderRadius: 3,
                letterSpacing: '0.04em',
                fontFamily: 'var(--font-mono)',
                minWidth: 28, textAlign: 'center',
              }}>{e.series}·{s.label}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: 'var(--ink-1)', lineHeight: 1.45 }}>{e.text}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>{node?.codename || node?.fullname}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function SeriesChip({ active, onClick, label, color, bg }) {
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer',
      fontSize: 9.5, padding: '2px 6px', borderRadius: 3,
      fontFamily: 'var(--font-mono)', fontWeight: 700,
      letterSpacing: '0.04em',
      background: active ? (color || 'var(--ink-1)') : (bg || 'transparent'),
      color: active ? '#fff' : (color || 'var(--ink-3)'),
      border: `1px solid ${active ? (color || 'var(--ink-1)') : 'var(--line)'}`,
    }}>{label}</button>
  );
}

window.VariantA = VariantA;
