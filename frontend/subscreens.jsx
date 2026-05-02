// タブ先のサブスクリーン (監督官 / 司令官 / 工場長 / 記録庫 / 機関設定)
// 詳細画面ダミー実装。トップ画面ほど作り込まないが、空ではない。

const { useState, useMemo, useEffect } = React;

function SubScreen({ tabs, activeTab, setActiveTab, divisions, divisionPreset, setDivisionPreset }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AppHeader />
      <PhaseProgressBar />
      <TabBar tabs={tabs} active={activeTab} onSelect={setActiveTab} />
      {activeTab === 'kantoku' && <NodeDetail nodeId="kantoku" />}
      {activeTab === 'shirei'  && <CommanderDetail divisions={divisions} divisionPreset={divisionPreset} setDivisionPreset={setDivisionPreset} />}
      {activeTab === 'kojo'    && <NodeDetail nodeId="kojo" />}
      {activeTab === 'kiroku'  && <KirokuScreen />}
      {activeTab === 'settings'&& <SettingsScreen divisionPreset={divisionPreset} setDivisionPreset={setDivisionPreset} />}
      {activeTab === 'catalog' && <CatalogScreen />}
    </div>
  );
}

function NodeDetail({ nodeId }) {
  const node = NODE_BY_ID[nodeId];
  const spark = useMemo(() => makeSpark(node.id.charCodeAt(0)*3, 60, node.health, 16), [nodeId]);
  const cpuSpark = useMemo(() => makeSpark(node.id.charCodeAt(0)*5+1, 60, 50, 30), [nodeId]);
  const ctxSpark = useMemo(() => makeSpark(node.id.charCodeAt(0)*7+2, 60, node.contextUse*100, 20), [nodeId]);

  const myTodos = TODOS.filter(t => t.owner === nodeId);
  const myAlerts = ALERTS.filter(a => a.target === nodeId);
  const myLogs = TIMELINE.filter(e => e.node === nodeId);

  // 操作モーダル群
  const [issueOpen, setIssueOpen] = useState(false);
  const [rtKind, setRtKind] = useState(null); // 'same' | 'different' | null
  const [gitSync, setGitSync] = useState(GIT_SYNC[nodeId]);
  const [boards, setBoards] = useState(CI_BOARDS);
  const [contextUse, setContextUse] = useState(node.contextUse);
  const [dreamOpen, setDreamOpen] = useState(false);
  const [dreamLayer, setDreamLayer] = useState('short');
  const [checkupOpen, setCheckupOpen] = useState(false);

  const handleManualClear = () => {
    setContextUse(0.18); // クリア後の文脈使用率（圧縮後）
  };

  return (
    <div style={{ padding: '20px 24px 60px', maxWidth: 1440, margin: '0 auto' }}>
      {/* 1. クリア推奨バナー（最上部） */}
      <ClearRecommendBanner ctx={contextUse} nodeName={node.fullname} onManualClear={handleManualClear} />

      {/* ── ヘッダー ────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16,
        padding: '18px 20px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)',
      }}>
        <RoleGlyph role={node.role} status={node.status} size={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="kira-serif" style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--ink-1)', letterSpacing: '0.06em' }}>
              {node.fullname}
            </h1>
            <StatusBadge status={node.status} />
            {contextUse > CONTEXT_THRESHOLDS.autoEvac && (
              <AutoEvacChip ctx={contextUse} />
            )}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4 }}>{node.description}</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: 'var(--ink-4)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span><span className="kira-mono" style={{ color: 'var(--ink-2)' }}>{node.cmd}</span></span>
            <span>·</span>
            <span>稼働 {Math.floor(node.uptimeHours)}時間</span>
            <span>·</span>
            <span>最終応答 {node.lastResponseAt}</span>
            {/* 5. Git push 同期 */}
            <span style={{ flex: 1 }} />
            <GitPushChip nodeId={nodeId} onChange={setGitSync} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          {/* 3. 円卓ボタン */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <RoundTableButtons onOpenSame={() => setRtKind('same')} onOpenDifferent={() => setRtKind('different')} />
            <DreamCheckupButtons nodeId={nodeId}
                                 onDreamOpen={() => { setDreamLayer('short'); setDreamOpen(true); }}
                                 onCheckupOpen={() => setCheckupOpen(true)} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={btnSecondary}>記録閲覧</button>
            <InterventionButton nodeId={nodeId} />
            {/* 4. 指令発出（モーダル） */}
            <button style={btnPrimary} onClick={() => setIssueOpen(true)}>指令発出</button>
          </div>
        </div>
      </div>

      {/* ── メーター行 ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <BigMetric label="健康度" value={node.health} unit="" spark={spark} color={node.status === 'crit' ? 'var(--crit)' : 'var(--ok)'} />
        <BigMetric label="文脈使用率" value={Math.round(contextUse*100)} unit="%" spark={ctxSpark} color={contextUse > 0.85 ? 'var(--crit)' : 'var(--accent)'} warn={contextUse > 0.85}
                   footnote={
                     <ContextThresholdLink ctx={contextUse} />
                   } />
        <BigMetric label="成功率" value={(node.successRate*100).toFixed(1)} unit="%" spark={makeSpark(node.id.charCodeAt(0)+9, 60, 95, 8)} color="var(--ok)" />
        <BigMetric label="実行中タスク" value={node.activeTasks} unit="件" spark={cpuSpark} color="var(--accent)" />
      </div>

      {/* ── 三列: タスク / アラート / ログ ────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Panel title="担当処務" subtitle={`${myTodos.length}件`} padding={0}>
          {myTodos.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--ink-4)', fontSize: 12, textAlign: 'center' }}>担当処務はありません。</div>
          ) : myTodos.map((t, i) => (
            <div key={t.id} style={{
              padding: '10px 14px',
              borderBottom: i < myTodos.length - 1 ? '1px solid var(--line)' : 'none',
              opacity: t.done ? 0.5 : 1,
            }}>
              <div style={{ fontSize: 12, color: 'var(--ink-1)', fontWeight: 500, lineHeight: 1.4, textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 3 }}>期限 {t.due}</div>
            </div>
          ))}
        </Panel>

        <Panel title="本機関のアラート" subtitle={`${myAlerts.length}件`} padding={0}>
          {myAlerts.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--ink-4)', fontSize: 12, textAlign: 'center' }}>アラートはありません。</div>
          ) : myAlerts.map((a, i) => (
            <div key={a.id} style={{
              padding: '10px 14px',
              borderBottom: i < myAlerts.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                <SeverityPill sev={a.severity} />
                <span className="kira-mono" style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>{a.id}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-1)', fontWeight: 500, lineHeight: 1.4 }}>{a.title}</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 3 }}>{a.detail}</div>
            </div>
          ))}
        </Panel>

        <Panel title="活動誌" subtitle={`直近 ${myLogs.length}件`} padding={0}>
          {myLogs.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--ink-4)', fontSize: 12, textAlign: 'center' }}>記録なし。</div>
          ) : myLogs.map((e, i) => (
            <div key={i} style={{
              padding: '10px 14px',
              borderBottom: i < myLogs.length - 1 ? '1px solid var(--line)' : 'none',
              display: 'flex', gap: 10,
            }}>
              <span className="kira-mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', flex: 'none' }}>{e.t.slice(0,5)}</span>
              <span style={{ fontSize: 11.5, color: 'var(--ink-1)' }}>{e.text}</span>
            </div>
          ))}
        </Panel>
      </div>

      {/* 2. ハンドオフ最適化（全文 + 結晶化） */}
      <HandoffSection nodeId={nodeId} />

      {/* 6. CI 状態看板（工場長のみ） */}
      {nodeId === 'kojo' && <CIBoards boards={boards} setBoards={setBoards} />}

      {/* サブエージェント並列実証（工場長のみ） */}
      {nodeId === 'kojo' && <SubagentParallelSection />}

      {/* 階層化メモリ */}
      <MemoryLayerSection nodeId={nodeId} onDreamRun={(l) => { setDreamLayer(l); setDreamOpen(true); }} />

      {/* ── 会話プレビュー ─────────────────────── */}
      <Panel title="直近の会話" subtitle="Claude Code 出力（抜粋）" style={{ marginTop: 16 }}>
        <ConversationPreview node={node} />
      </Panel>

      {/* モーダル群 */}
      <CommandIssueModal open={issueOpen} fromNodeId={nodeId} onClose={() => setIssueOpen(false)} />
      <RoundTableModal open={!!rtKind} kind={rtKind} onClose={() => setRtKind(null)} />
      <DreamModal open={dreamOpen} nodeId={nodeId} focusLayer={dreamLayer} onClose={() => setDreamOpen(false)} />
      <CheckupModal open={checkupOpen} nodeId={nodeId} onClose={() => setCheckupOpen(false)} />
    </div>
  );
}

function CommanderDetail({ divisions, divisionPreset, setDivisionPreset }) {
  const node = NODE_BY_ID['shirei'];
  const [issueOpen, setIssueOpen] = useState(false);
  const [rtKind, setRtKind] = useState(null);
  const [contextUse, setContextUse] = useState(node.contextUse);
  const [dreamOpen, setDreamOpen] = useState(false);
  const [dreamLayer, setDreamLayer] = useState('short');
  const [checkupOpen, setCheckupOpen] = useState(false);
  const handleManualClear = () => setContextUse(0.18);

  return (
    <div style={{ padding: '20px 24px 60px', maxWidth: 1440, margin: '0 auto' }}>
      <ClearRecommendBanner ctx={contextUse} nodeName={node.fullname} onManualClear={handleManualClear} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16,
        padding: '18px 20px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)',
      }}>
        <RoleGlyph role={node.role} status={node.status} size={64} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="kira-serif" style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--ink-1)', letterSpacing: '0.06em' }}>
              {node.fullname}
            </h1>
            <StatusBadge status={node.status} />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4 }}>{node.description}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span>配下事業部門 <span className="kira-mono" style={{ color: 'var(--ink-2)' }}>{divisions.length}体</span></span>
            <span>·</span>
            <span>文脈 <span className="kira-mono" style={{ color: contextUse > 0.85 ? 'var(--crit)' : 'var(--ink-2)' }}>{Math.round(contextUse*100)}%</span></span>
            <span style={{ flex: 1 }} />
            <GitPushChip nodeId="shirei" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <RoundTableButtons onOpenSame={() => setRtKind('same')} onOpenDifferent={() => setRtKind('different')} />
            <DreamCheckupButtons nodeId="shirei"
                                 onDreamOpen={() => { setDreamLayer('short'); setDreamOpen(true); }}
                                 onCheckupOpen={() => setCheckupOpen(true)} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={btnSecondary}>記録閲覧</button>
            <button style={btnPrimary} onClick={() => setIssueOpen(true)}>指令発出</button>
          </div>
        </div>
      </div>

      <Panel title="配下事業部門" subtitle={`${divisions.length}体`} style={{ marginBottom: 16 }}
             right={
               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                 <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>構成:</span>
                 {Object.entries(DIVISION_PRESETS).map(([k, p]) => (
                   <button key={k} onClick={() => setDivisionPreset(k)} style={{
                     all: 'unset', cursor: 'pointer',
                     fontSize: 10, padding: '2px 8px', borderRadius: 99,
                     background: divisionPreset === k ? 'var(--accent-soft)' : 'transparent',
                     color: divisionPreset === k ? 'var(--accent-ink)' : 'var(--ink-4)',
                     border: `1px solid ${divisionPreset === k ? 'color-mix(in oklab, var(--accent) 25%, var(--line))' : 'var(--line)'}`,
                     fontWeight: 600,
                   }}>{p.label}</button>
                 ))}
               </div>
             }>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {divisions.map(d => (
            <div key={d.id} style={{
              padding: 14,
              background: 'var(--bg-panel)',
              border: `1px solid ${d.status === 'crit' ? 'color-mix(in oklab, var(--crit) 35%, var(--line))' : 'var(--line)'}`,
              borderRadius: 'var(--r-md)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <RoleGlyph role={d.role} status={d.status} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="kira-serif" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-1)', letterSpacing: '0.04em' }}>
                    {d.fullname}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 1 }}>{d.description}</div>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 10.5 }}>
                <KV label="健康度" v={d.health} />
                <KV label="タスク" v={d.activeTasks} />
                <KV label="文脈" v={`${Math.round(d.contextUse*100)}%`} warn={d.contextUse > 0.85} />
                <KV label="成功率" v={`${(d.successRate*100).toFixed(1)}%`} />
              </div>
              <div style={{ marginTop: 10 }}>
                <HBar value={d.health} color={d.status === 'crit' ? 'var(--crit)' : d.status === 'warn' ? 'var(--warn)' : 'var(--ok)'} />
              </div>
              <div className="kira-mono" style={{ fontSize: 9.5, color: 'var(--ink-4)', marginTop: 8 }}>{d.cmd}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="直近の指令履歴">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { t: '15:41:48', to: 'div-eigyo',   text: '案件 #2391 を委譲。納期は本日 18:00。' },
            { t: '15:38:15', to: 'div-kaihatsu', text: 'コンテキスト圧縮を実施せよ。閾値超過。' },
            { t: '15:24:02', to: 'div-kikaku',  text: '仕様書 SPEC-118 第3章を改訂のうえ提出せよ。' },
            { t: '15:11:30', to: 'div-soumu',   text: '稼働時間台帳の月次締めを起案。' },
            { t: '14:48:18', to: 'div-eigyo',   text: 'K社案件の返信草稿を本日中に提出。' },
          ].map((c, i, arr) => {
            const tn = NODE_BY_ID[c.to];
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '70px 140px 1fr', gap: 12,
                padding: '10px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                alignItems: 'center',
              }}>
                <span className="kira-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{c.t}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RoleGlyph role={tn?.role} status={tn?.status} size={20} />
                  <span style={{ fontSize: 11.5, color: 'var(--ink-2)', fontWeight: 600 }}>{tn?.codename}</span>
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-1)' }}>{c.text}</span>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ハンドオフ最適化 */}
      <HandoffSection nodeId="shirei" />

      {/* 階層化メモリ */}
      <MemoryLayerSection nodeId="shirei" onDreamRun={(l) => { setDreamLayer(l); setDreamOpen(true); }} />

      {/* ── 会話プレビュー ─────────────────────── */}
      <Panel title="直近の会話" subtitle="Claude Code 出力（抜粋）" style={{ marginTop: 16 }}>
        <ConversationPreview node={node} />
      </Panel>

      <CommandIssueModal open={issueOpen} fromNodeId="shirei" onClose={() => setIssueOpen(false)} />
      <RoundTableModal open={!!rtKind} kind={rtKind} onClose={() => setRtKind(null)} />
      <DreamModal open={dreamOpen} nodeId="shirei" focusLayer={dreamLayer} onClose={() => setDreamOpen(false)} />
      <CheckupModal open={checkupOpen} nodeId="shirei" onClose={() => setCheckupOpen(false)} />
    </div>
  );
}

function KirokuScreen() {
  const [q, setQ] = useState('');
  const [nodeFilter, setNodeFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all');

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return ARCHIVE_RECORDS.filter(r => {
      if (nodeFilter !== 'all' && r.node !== nodeFilter) return false;
      if (seriesFilter !== 'all' && r.series !== seriesFilter) return false;
      if (ql && !(r.title.toLowerCase().includes(ql) || r.id.toLowerCase().includes(ql))) return false;
      return true;
    });
  }, [q, nodeFilter, seriesFilter]);

  const allNodes = [
    { id: 'all', label: '全機関' },
    { id: 'kantoku', label: '監督官' },
    { id: 'shirei', label: '司令官' },
    { id: 'kojo', label: '工場長' },
    { id: 'div-kikaku', label: '企画' },
    { id: 'div-eigyo', label: '営業' },
    { id: 'div-kaihatsu', label: '開発' },
    { id: 'div-soumu', label: '総務' },
  ];

  return (
    <div style={{ padding: '20px 24px 60px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 className="kira-serif" style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 700, letterSpacing: '0.08em' }}>記録庫</h1>

      {/* 検索バー */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12,
        padding: 12, background: 'var(--bg-panel)',
        border: '1px solid var(--line)', borderRadius: 'var(--r-lg)',
      }}>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>検索</span>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="記録番号 / 表題で検索…"
          className="kira-mono"
          style={{
            flex: 1, all: 'unset', padding: '8px 12px',
            background: 'var(--bg-sunken)', borderRadius: 'var(--r-md)',
            fontSize: 13, color: 'var(--ink-1)',
            border: '1px solid var(--line)',
          }}
        />
        <select value={nodeFilter} onChange={e => setNodeFilter(e.target.value)} className="kira-mono"
          style={{ padding: '6px 10px', background: 'var(--bg-sunken)', color: 'var(--ink-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', fontSize: 12 }}>
          {allNodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
        </select>
        <select value={seriesFilter} onChange={e => setSeriesFilter(e.target.value)} className="kira-mono"
          style={{ padding: '6px 10px', background: 'var(--bg-sunken)', color: 'var(--ink-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', fontSize: 12 }}>
          <option value="all">全系列</option>
          <option value="J">J 司令</option>
          <option value="M">M 監査</option>
          <option value="B">B 構築</option>
          <option value="K">K 記録</option>
          <option value="E">E 例外</option>
        </select>
      </div>

      <Panel title="蔵書一覧" subtitle={`${filtered.length} / ${ARCHIVE_RECORDS.length} 件 表示中`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 12 }}>
              該当する記録は見当たりません。
            </div>
          ) : filtered.map((r, i, arr) => {
            const node = NODE_BY_ID[r.node];
            const seriesColor = SERIES?.[r.series]?.color || 'var(--ink-3)';
            return (
              <div key={r.id} style={{
                display: 'grid', gridTemplateColumns: '24px 110px 1fr 64px 80px 90px',
                gap: 12, padding: '10px 4px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                alignItems: 'center', fontSize: 12,
              }}>
                <span className="kira-mono" style={{
                  display: 'inline-block', textAlign: 'center', padding: '1px 0',
                  fontSize: 10, fontWeight: 700, color: seriesColor,
                  background: `color-mix(in oklab, ${seriesColor} 12%, transparent)`,
                  borderRadius: 3,
                }}>{r.series}</span>
                <span className="kira-mono" style={{ color: 'var(--ink-3)' }}>{r.id}</span>
                <span style={{ color: 'var(--ink-1)' }}>{r.title}</span>
                <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>{node?.codename || ''}</span>
                <span className="kira-mono" style={{ color: 'var(--ink-4)', textAlign: 'right' }}>{r.size}</span>
                <span style={{ color: 'var(--ink-4)' }}>{r.date.slice(5)} {r.when}</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function SettingsScreen({ divisionPreset, setDivisionPreset }) {
  return (
    <div style={{ padding: '20px 24px 60px', maxWidth: 800, margin: '0 auto' }}>
      <h1 className="kira-serif" style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 700, letterSpacing: '0.08em' }}>機関設定</h1>
      <Panel title="基本" style={{ marginBottom: 16 }}>
        <SettingRow label="機関識別子" value="archive-bureau-001" />
        <SettingRow label="主時刻系" value="JST (UTC+9)" />
        <SettingRow label="記録保管期間" value="180日" />
        <SettingRow label="自動退避閾値（文脈）" value="警告 80% / エラー 90%" />
        <SettingRow label="アラート発出経路" value="内部ログ + 上位機関通報" last />
      </Panel>

      <Panel title="事業部門 構成" subtitle="司令官配下の部門編成を切替">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(DIVISION_PRESETS).map(([k, p]) => {
            const selected = divisionPreset === k;
            return (
              <label key={k} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: 12,
                background: selected ? 'var(--accent-soft)' : 'var(--bg-soft)',
                border: `1px solid ${selected ? 'color-mix(in oklab, var(--accent) 30%, var(--line))' : 'var(--line)'}`,
                borderRadius: 'var(--r-md)',
                cursor: 'pointer',
              }}>
                <input type="radio" name="preset" checked={selected} onChange={() => setDivisionPreset(k)}
                       style={{ accentColor: 'var(--accent)', marginTop: 2 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-1)' }}>{p.label}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {p.divisions.map(id => {
                      const d = NODE_BY_ID[id];
                      return (
                        <span key={id} className="kira-mono" style={{
                          fontSize: 10.5, padding: '2px 7px', borderRadius: 3,
                          background: 'var(--bg-panel)', color: 'var(--ink-2)',
                          border: '1px solid var(--line)',
                        }}>{d?.codename || id}</span>
                      );
                    })}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        <div style={{ marginTop: 12, fontSize: 10.5, color: 'var(--ink-4)', lineHeight: 1.6 }}>
          ※ 部門編成の変更は記録庁全体に反映されます。CLAUDE.md の再配布が必要です。<br/>
          ※ 将来的には任意の部門を追加・並替・削除できる編集器を本欄に開設予定。
        </div>
      </Panel>
      <Panel title="Dream・定期検診" subtitle="記憶圧縮の発動条件と検診スケジュール" style={{ marginBottom: 16 }}>
        <DreamCheckupSettings />
      </Panel>
      <Panel title="ADR / 哲学層 Dream" subtitle="MetaADR 同型適用の対象ファイル一覧" style={{ marginBottom: 16 }}>
        <ADRDreamSection />
      </Panel>
      <Panel title="Git push 同期" subtitle="作業の自動同期方針" style={{ marginBottom: 16 }}>
        <GitSyncSettings />
      </Panel>
      <Panel title="役割境界 §5" subtitle="機関間の直接対話禁則。指揮系統を経由する旨を規定">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ROLE_BOUNDARIES.rules.map((r, i, arr) => {
            const fromName = r.from === 'div-*' ? '事業部門長 全般' : (NODE_BY_ID[r.from]?.codename || r.from);
            const toName   = r.to === 'div-*'   ? '事業部門長 全般' : (NODE_BY_ID[r.to]?.codename || r.to);
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '120px 14px 120px 60px 1fr',
                gap: 10, padding: '10px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                alignItems: 'center', fontSize: 12,
              }}>
                <span className="kira-mono" style={{ color: 'var(--ink-2)' }}>{fromName}</span>
                <span style={{ color: 'var(--ink-4)', textAlign: 'center' }}>→</span>
                <span className="kira-mono" style={{ color: 'var(--ink-2)' }}>{toName}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                  textAlign: 'center', letterSpacing: '0.06em',
                  color: r.allowed ? 'var(--ok)' : 'var(--crit)',
                  background: r.allowed ? 'var(--ok-soft)' : 'var(--crit-soft)',
                }}>{r.allowed ? '許可' : '禁則'}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.note}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, fontSize: 10.5, color: 'var(--ink-4)', lineHeight: 1.6 }}>
          ※ 禁則違反は監督官・甲号により自動検知され、是正勧告を発出します。<br/>
          ※ 緊急時に限り、司令官の許可で一時的に禁則を解除できます（記録庫に痕跡が残ります）。
        </div>
      </Panel>
    </div>
  );
}

function SettingRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0',
      borderBottom: last ? 'none' : '1px solid var(--line)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{label}</span>
      <span className="kira-mono" style={{ fontSize: 12, color: 'var(--ink-1)' }}>{value}</span>
    </div>
  );
}

function BigMetric({ label, value, unit, spark, color, warn, footnote }) {
  return (
    <div style={{
      padding: 16,
      background: 'var(--bg-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span className="kira-mono" style={{
          fontSize: 28, fontWeight: 700,
          color: warn ? 'var(--crit)' : 'var(--ink-1)',
          fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>{value}</span>
        <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{unit}</span>
      </div>
      <div style={{ marginTop: 10 }}>
        <Spark data={spark} w={240} h={32} color={color} />
      </div>
      {footnote && <div style={{ marginTop: 6 }}>{footnote}</div>}
    </div>
  );
}

// 文脈使用率の閾値表記（>85% で自動退避バッジ）
function AutoEvacChip({ ctx }) {
  return (
    <span title="自動退避閾値（85%）を超過。次回チェックポイントで圧縮処置が走ります" style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 3,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
      background: 'var(--crit-soft)', color: 'var(--crit)',
      border: '1px solid color-mix(in oklab, var(--crit) 25%, var(--line))',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--crit)', animation: 'blink 1s steps(2) infinite' }} />
      自動退避予定
    </span>
  );
}

// 文脈閾値リンク（→ 設定タブの該当行へ）
function ContextThresholdLink({ ctx }) {
  const pct = Math.round(ctx * 100);
  const state = ctx >= CONTEXT_THRESHOLDS.crit ? 'crit'
              : ctx >= CONTEXT_THRESHOLDS.autoEvac ? 'auto'
              : ctx >= CONTEXT_THRESHOLDS.warn ? 'warn'
              : 'ok';
  const labelMap = {
    ok:   { text: `閾値内（警告 80% / 退避 85% / 上限 90%）`, c: 'var(--ink-4)' },
    warn: { text: `警告閾値（80%）超過 → 設定で確認`, c: 'var(--warn)' },
    auto: { text: `自動退避閾値（85%）超過 → 設定で確認`, c: 'var(--crit)' },
    crit: { text: `上限閾値（90%）逼迫 → 設定で確認`, c: 'var(--crit)' },
  };
  const { text, c } = labelMap[state];
  const handleClick = () => {
    // 設定タブへジャンプ（親に通知。app.jsx の onJumpToSettings を介して行う想定だが、
    // 単純化のため hash で指示）
    window.dispatchEvent(new CustomEvent('app:jump-tab', { detail: 'settings' }));
  };
  return (
    <button onClick={handleClick} style={{
      all: 'unset', cursor: 'pointer',
      fontSize: 10, color: c, letterSpacing: '0.04em',
      borderBottom: `1px dotted ${c}`,
    }}>{text}</button>
  );
}

// 会話介入ボタン（介入頻度を併記。依存度の自己観察）
function InterventionButton({ nodeId }) {
  const stats = INTERVENTION_STATS[nodeId];
  return (
    <button style={btnSecondary} title={stats ? `直近の管理者介入: 24h ${stats.d1}回 / 7d ${stats.d7}回 / 30d ${stats.d30}回` : ''}>
      会話介入
      {stats && (
        <span className="kira-mono" style={{
          marginLeft: 8, fontSize: 10, color: 'var(--ink-4)',
          padding: '1px 5px', borderRadius: 3,
          background: 'var(--bg-sunken)',
        }}>
          {stats.d7}/週
        </span>
      )}
    </button>
  );
}

function KV({ label, v, warn }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>{label}</span>
      <span className="kira-mono" style={{ fontSize: 12, color: warn ? 'var(--crit)' : 'var(--ink-1)', fontWeight: 600 }}>{v}</span>
    </div>
  );
}

function ConversationPreview({ node }) {
  // ロールごとに会話風サンプル
  const samples = {
    kantoku: [
      { who: 'system', text: '監査巡回 #312 を開始。' },
      { who: 'agent',  text: '了解。司令官の長期記憶ストアから調査を開始する。直近24時間の改竄検知ヒット数: 0。' },
      { who: 'agent',  text: '異常はないが、開発部門長のコンテキスト使用率が継続的に上昇している。司令官への通報を起案。' },
    ],
    shirei: [
      { who: 'system', text: '営業部より、新規案件 #2391 の起票要請。' },
      { who: 'agent',  text: '了解。優先度を中とし、営業部門長に委譲する。納期は本日 18:00。' },
      { who: 'system', text: '開発部門長のエラー率が基準値を超過しています。' },
      { who: 'agent',  text: '了解。コンテキスト圧縮を指示。応答が遅延する場合は工場長へ作業の一部を再配分する。' },
    ],
    kojo: [
      { who: 'system', text: '第三工区 build #4821 を実行。' },
      { who: 'agent',  text: 'tests/integration 通過 (412/412)。成果物を検収待ちに登録した。' },
      { who: 'system', text: '第七工区 pkg 取得が失敗。' },
      { who: 'agent',  text: '再試行 (2/5) を実施。ミラーを切替えてリトライする。' },
    ],
  };
  const lines = samples[node.id] || samples.kojo;

  return (
    <div className="kira-mono" style={{
      background: 'var(--bg-sunken)',
      borderRadius: 'var(--r-md)',
      padding: 14,
      fontSize: 12, lineHeight: 1.7,
    }}>
      {lines.map((l, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
          <span style={{
            color: l.who === 'agent' ? 'var(--accent-ink)' : 'var(--ink-4)',
            fontWeight: 600, flex: 'none', width: 64,
          }}>{l.who === 'agent' ? `▸ ${node.codename}` : '◇ system'}</span>
          <span style={{ color: 'var(--ink-1)', flex: 1 }}>{l.text}</span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--ink-4)' }}>
        <span style={{ width: 6, height: 12, background: 'var(--accent)', display: 'inline-block', animation: 'blink 1s steps(2) infinite' }} />
        <span>応答待機中…</span>
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

const btnPrimary = {
  all: 'unset', cursor: 'pointer',
  padding: '7px 14px',
  background: 'var(--ink-1)', color: 'var(--bg-panel)',
  fontSize: 12, fontWeight: 600,
  borderRadius: 'var(--r-md)',
};
const btnSecondary = {
  all: 'unset', cursor: 'pointer',
  padding: '7px 14px',
  background: 'var(--bg-panel)', color: 'var(--ink-2)',
  fontSize: 12, fontWeight: 600,
  borderRadius: 'var(--r-md)',
  border: '1px solid var(--line)',
};

Object.assign(window, { SubScreen, NodeDetail, CommanderDetail, BigMetric, AutoEvacChip, ContextThresholdLink, InterventionButton });
