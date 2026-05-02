// ─────────────────────────────────────────────────────
// 機能カタログ画面 (8つ目のタブ)
// 検索・5軸フィルタ・最近変更・ランキング・新陳代謝候補・トレンド
// ─────────────────────────────────────────────────────

const { useState: useStateCat, useMemo: useMemoCat } = React;

function CatalogScreen() {
  const [q, setQ] = useStateCat('');
  const [fOwner, setFOwner] = useStateCat('all');
  const [fKind, setFKind]   = useStateCat('all');
  const [fOrigin, setFOrigin] = useStateCat('all');
  const [fPhase, setFPhase]   = useStateCat('all');
  const [fState, setFState]   = useStateCat('all');
  const [recentOnly, setRecentOnly] = useStateCat(false);
  const [sortBy, setSortBy] = useStateCat('score'); // score | usage | quality | linkages | updated
  const [selected, setSelected] = useStateCat(null);

  // スコア付与 + ソート + フィルタ
  const scored = useMemoCat(() =>
    CAT_FEATURES.map(f => ({ ...f, _score: catalogScore(f), _trend: catalogTrend(f) })),
  []);

  const filtered = useMemoCat(() => {
    const ql = q.trim().toLowerCase();
    return scored.filter(f => {
      if (fOwner !== 'all' && f.owner !== fOwner) return false;
      if (fKind !== 'all' && f.kind !== fKind) return false;
      if (fOrigin !== 'all' && f.origin !== fOrigin) return false;
      if (fPhase !== 'all' && f.phase !== fPhase) return false;
      if (fState !== 'all' && f.state !== fState) return false;
      if (recentOnly && !f.changedToday) return false;
      if (ql) {
        const blob = `${f.id} ${f.name} ${f.desc} ${f.version}`.toLowerCase();
        if (!blob.includes(ql)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'score')    return b._score - a._score;
      if (sortBy === 'usage')    return b.usage - a.usage;
      if (sortBy === 'quality')  return b.quality - a.quality;
      if (sortBy === 'linkages') return b.linkages - a.linkages;
      if (sortBy === 'updated')  return (b.changedToday ? 1 : 0) - (a.changedToday ? 1 : 0);
      return 0;
    });
  }, [scored, q, fOwner, fKind, fOrigin, fPhase, fState, recentOnly, sortBy]);

  // ランキング・新陳代謝候補
  const activeOnly = scored.filter(f => f.state !== 'superseded' && f.state !== 'halted');
  const topRank = [...activeOnly].sort((a, b) => b._score - a._score).slice(0, 5);
  const bottomRank = [...activeOnly].sort((a, b) => a._score - b._score).slice(0, 4);
  const supersededList = scored.filter(f => f.state === 'superseded');

  return (
    <div style={{ padding: '20px 24px 60px', maxWidth: 1440, margin: '0 auto' }}>
      {/* ヘッダ */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <h1 className="kira-serif" style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '0.08em' }}>機能カタログ</h1>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
            記録庁の機能群を5軸で分類、重要度を S&P500 同型で可視化。本日棚卸し: <span className="kira-mono" style={{ color: 'var(--ink-2)' }}>supervisor v0.6 + commander 0edd976 + factory PR #1020</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <CatBigStat label="登録機能" value={CAT_FEATURES.length} />
          <CatBigStat label="本日変更" value={CAT_FEATURES.filter(f => f.changedToday).length} tone="accent" />
          <CatBigStat label="SUPERSEDED" value={supersededList.length} tone="muted" />
        </div>
      </div>

      {/* SUPERSEDED 削除禁則 通告バー */}
      <div style={{
        marginBottom: 14,
        padding: '8px 14px',
        background: 'var(--bg-soft)',
        border: '1px dashed var(--line-strong)',
        borderRadius: 'var(--r-md)',
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 11.5, color: 'var(--ink-3)',
      }}>
        <span style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em',
          padding: '2px 7px', borderRadius: 3,
          background: 'var(--ink-1)', color: 'var(--bg-panel)',
        }}>禁則</span>
        <span><span className="kira-mono" style={{ color: 'var(--ink-1)', fontWeight: 700 }}>SUPERSEDED</span> 機能の自動削除は禁則。史実保持のため記録庫に常駐させ、削除はヤス採否権限の明示承認を要する。</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>capability_registry 自動反映: <span className="kira-mono">Phase B 中盤予定</span></span>
      </div>

      {/* 上段: ランキング・新陳代謝候補 (S&P500同型) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, marginBottom: 14 }}>
        <Panel title="重要度ランキング" subtitle="総合スコア上位 5件" padding={0}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {topRank.map((f, i) => (
              <RankRow key={f.id} idx={i+1} f={f} onClick={() => setSelected(f.id)} />
            ))}
          </div>
        </Panel>
        <Panel title="新陳代謝 候補" subtitle="低スコア / 廃止検討" padding={0}
               right={<span style={{ fontSize: 10, color: 'var(--ink-4)' }}>SUPERSEDED 候補警告</span>}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {bottomRank.map((f, i) => (
              <BottomRow key={f.id} f={f} onClick={() => setSelected(f.id)} last={i === bottomRank.length-1} />
            ))}
          </div>
        </Panel>
      </div>

      {/* フィルタ + 検索 */}
      <Panel padding={0} style={{ marginBottom: 14 }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{
            fontSize: 12, color: 'var(--ink-4)',
          }}>🔎</span>
          <input value={q} onChange={e => setQ(e.target.value)}
                 placeholder="機能名・記録番号・説明文で検索"
                 style={{
                   flex: 1, all: 'unset', fontSize: 13,
                   color: 'var(--ink-1)', fontFamily: 'inherit',
                 }} />
          {q && (
            <button onClick={() => setQ('')} style={{
              all: 'unset', cursor: 'pointer', fontSize: 11, color: 'var(--ink-4)',
            }}>クリア</button>
          )}
          <span style={{ width: 1, height: 18, background: 'var(--line)' }} />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-3)', cursor: 'pointer' }}>
            <input type="checkbox" checked={recentOnly} onChange={e => setRecentOnly(e.target.checked)}
                   style={{ accentColor: 'var(--accent)' }} />
            <span>本日変更のみ</span>
          </label>
        </div>
        <div style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
          <FilterRow label="主体" value={fOwner} setValue={setFOwner}
                     opts={[['all','全て'], ...Object.entries(CAT_OWNERS).map(([k,v]) => [k, v.short])]} />
          <FilterRow label="種別" value={fKind} setValue={setFKind}
                     opts={[['all','全て'], ...Object.entries(CAT_KINDS).map(([k,v]) => [k, v.label])]} />
          <FilterRow label="起源" value={fOrigin} setValue={setFOrigin}
                     opts={[['all','全て'], ...Object.entries(CAT_ORIGINS).map(([k,v]) => [k, v.label])]} />
          <FilterRow label="Phase" value={fPhase} setValue={setFPhase}
                     opts={[['all','全て'], ...Object.entries(CAT_PHASES).map(([k,v]) => [k, v.label])]} />
          <FilterRow label="状態" value={fState} setValue={setFState}
                     opts={[['all','全て'], ...Object.entries(CAT_STATES).map(([k,v]) => [k, `${v.mark} ${v.label}`])]} />
          <span style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>並替:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
              fontSize: 11, padding: '3px 6px', background: 'var(--bg-soft)',
              border: '1px solid var(--line)', borderRadius: 3, color: 'var(--ink-1)',
            }}>
              <option value="score">総合スコア</option>
              <option value="usage">使用頻度</option>
              <option value="quality">品質スコア</option>
              <option value="linkages">連動装置数</option>
              <option value="updated">最近変更</option>
            </select>
          </div>
        </div>
      </Panel>

      {/* 一覧テーブル */}
      <Panel title={`機能一覧`} subtitle={`${filtered.length}件 / 全${CAT_FEATURES.length}件`} padding={0}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '90px 1fr 80px 70px 72px 70px 60px 70px 90px 26px',
          gap: 0,
          fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.04em',
          padding: '8px 14px',
          background: 'var(--bg-sunken)',
          borderBottom: '1px solid var(--line)',
          fontWeight: 700,
        }}>
          <span>記号</span>
          <span>機能 / 説明</span>
          <span>主体</span>
          <span style={{ textAlign: 'center' }}>状態</span>
          <span style={{ textAlign: 'center' }}>使用</span>
          <span style={{ textAlign: 'center' }}>品質</span>
          <span style={{ textAlign: 'center' }}>連動</span>
          <span style={{ textAlign: 'center' }}>総合</span>
          <span>更新</span>
          <span></span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: 'var(--ink-4)' }}>該当する機能はありません。</div>
        ) : filtered.map((f, i) => (
          <CatalogRow key={f.id} f={f} last={i === filtered.length - 1} onClick={() => setSelected(f.id)} />
        ))}
      </Panel>

      {/* 詳細モーダル */}
      {selected && (
        <CatalogDetailModal f={scored.find(x => x.id === selected)} all={scored} onClose={() => setSelected(null)} onJump={(id) => setSelected(id)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 大きな統計値
function CatBigStat({ label, value, tone }) {
  const c = tone === 'accent' ? 'var(--accent-ink)' : tone === 'muted' ? 'var(--ink-3)' : 'var(--ink-1)';
  const bg = tone === 'accent' ? 'var(--accent-soft)' : tone === 'muted' ? 'var(--bg-soft)' : 'var(--bg-panel)';
  return (
    <div style={{
      padding: '8px 14px',
      background: bg,
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      minWidth: 90,
    }}>
      <div style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.06em' }}>{label}</div>
      <div className="kira-mono" style={{ fontSize: 22, fontWeight: 700, color: c, lineHeight: 1, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function FilterRow({ label, value, setValue, opts }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 10, color: 'var(--ink-4)', marginRight: 2, letterSpacing: '0.06em' }}>{label}</span>
      {opts.map(([k, v]) => {
        const sel = value === k;
        return (
          <button key={k} onClick={() => setValue(k)} style={{
            all: 'unset', cursor: 'pointer',
            fontSize: 10.5, padding: '2px 8px', borderRadius: 99,
            background: sel ? 'var(--ink-1)' : 'transparent',
            color: sel ? 'var(--bg-panel)' : 'var(--ink-3)',
            border: `1px solid ${sel ? 'var(--ink-1)' : 'var(--line)'}`,
            fontWeight: sel ? 700 : 500,
          }}>{v}</button>
        );
      })}
    </div>
  );
}

// ランキング行 (上位)
function RankRow({ idx, f, onClick }) {
  const owner = CAT_OWNERS[f.owner];
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer',
      display: 'grid', gridTemplateColumns: '32px 1fr 70px 60px 90px',
      gap: 10, alignItems: 'center',
      padding: '11px 14px',
      borderBottom: '1px solid var(--line)',
    }}>
      <span className="kira-mono" style={{
        fontSize: 18, fontWeight: 700, color: idx <= 3 ? 'var(--accent-ink)' : 'var(--ink-3)',
        fontVariantNumeric: 'tabular-nums',
      }}>{String(idx).padStart(2,'0')}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-1)' }}>{f.name}</div>
        <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>
          <span className="kira-mono">{f.id}</span> · {owner.short} · {CAT_KINDS[f.kind].label}
        </div>
      </div>
      <CatStateBadge state={f.state} small />
      <Sparkline values={f._trend} />
      <ScoreBar score={f._score} />
    </button>
  );
}

// ランキング行 (下位 / 新陳代謝候補)
function BottomRow({ f, onClick, last }) {
  const owner = CAT_OWNERS[f.owner];
  const phaseW = CAT_PHASES[f.phase].weight;
  const flag = f._score < 55;
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer',
      display: 'grid', gridTemplateColumns: '1fr 56px 70px',
      gap: 8, alignItems: 'center',
      padding: '10px 14px',
      borderBottom: !last ? '1px solid var(--line)' : 'none',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {flag && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--warn)', letterSpacing: '0.06em' }}>⚠ 候補</span>}
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-1)' }}>{f.name}</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>
          <span className="kira-mono">{f.id}</span> · {owner.short} · 使用 {f.usage} · 連動 {f.linkages}
        </div>
      </div>
      <CatStateBadge state={f.state} small />
      <ScoreBar score={f._score} />
    </button>
  );
}

// 一覧テーブル行
function CatalogRow({ f, last, onClick }) {
  const owner = CAT_OWNERS[f.owner];
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer',
      display: 'grid',
      gridTemplateColumns: '90px 1fr 80px 70px 72px 70px 60px 70px 90px 26px',
      gap: 0, alignItems: 'center',
      padding: '10px 14px',
      borderBottom: !last ? '1px solid var(--line)' : 'none',
      transition: 'background 0.1s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-soft)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span className="kira-mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{f.id}</span>
      <div style={{ minWidth: 0, paddingRight: 8 }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink-1)', fontWeight: 600, lineHeight: 1.4,
                      textDecoration: f.state === 'superseded' ? 'line-through' : 'none',
                      opacity: f.state === 'superseded' ? 0.65 : 1,
        }}>{f.name}</div>
        <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.desc}</div>
      </div>
      <span style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 600 }}>{owner.short}</span>
      <span style={{ textAlign: 'center' }}><CatStateBadge state={f.state} small /></span>
      <span className="kira-mono" style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>{f.usage}</span>
      <span className="kira-mono" style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>{f.quality}</span>
      <span className="kira-mono" style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>{f.linkages}</span>
      <span style={{ textAlign: 'center' }}>
        <span className="kira-mono" style={{ fontSize: 13, fontWeight: 700, color: f._score >= 80 ? 'var(--ok)' : f._score >= 60 ? 'var(--ink-1)' : 'var(--warn)' }}>{f._score}</span>
      </span>
      <span style={{ fontSize: 10.5, color: f.changedToday ? 'var(--accent-ink)' : 'var(--ink-4)', fontWeight: f.changedToday ? 700 : 400 }}>{f.updatedAt}</span>
      <span style={{ fontSize: 11, color: 'var(--ink-4)', textAlign: 'right' }}>›</span>
    </button>
  );
}

// 状態バッジ
function CatStateBadge({ state, small }) {
  const s = CAT_STATES[state];
  if (!s) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: small ? 9.5 : 11, fontWeight: 700,
      padding: small ? '1px 5px' : '3px 8px', borderRadius: 3,
      color: s.c, background: s.bg,
      border: `1px solid color-mix(in oklab, ${s.c} 20%, transparent)`,
      letterSpacing: '0.04em',
    }}>
      <span style={{ fontSize: small ? 8 : 10 }}>{s.mark}</span>
      <span>{s.label}</span>
    </span>
  );
}

// スコアバー
function ScoreBar({ score }) {
  const color = score >= 80 ? 'var(--ok)' : score >= 60 ? 'var(--accent)' : score >= 45 ? 'var(--warn)' : 'var(--crit)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 5, background: 'var(--bg-sunken)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, transition: 'width 0.4s ease' }} />
      </div>
      <span className="kira-mono" style={{ fontSize: 11, fontWeight: 700, color: color, fontVariantNumeric: 'tabular-nums', minWidth: 22, textAlign: 'right' }}>{score}</span>
    </div>
  );
}

// スパークライン (簡易)
function Sparkline({ values }) {
  const w = 56, h = 18;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = values[values.length - 1];
  const first = values[0];
  const trend = last > first ? 'var(--ok)' : last < first ? 'var(--warn)' : 'var(--ink-3)';
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={trend} strokeWidth="1.3" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────
// 詳細モーダル
function CatalogDetailModal({ f, all, onClose, onJump }) {
  if (!f) return null;
  const owner = CAT_OWNERS[f.owner];
  const kind = CAT_KINDS[f.kind];
  const origin = CAT_ORIGINS[f.origin];
  const phase = CAT_PHASES[f.phase];
  const state = CAT_STATES[f.state];
  const deps = (f.deps || []).map(id => all.find(x => x.id === id)).filter(Boolean);
  const supersededBy = f.supersededBy ? all.find(x => x.id === f.supersededBy) : null;
  const supersedes = all.filter(x => x.supersededBy === f.id);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'color-mix(in oklab, var(--ink-1) 30%, transparent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 30,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)',
        maxWidth: 760, width: '100%',
        maxHeight: '85vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="kira-mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{f.id}</span>
              <CatStateBadge state={f.state} />
              <span className="kira-mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{f.version}</span>
            </div>
            <h2 className="kira-serif" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ink-1)', letterSpacing: '0.04em' }}>{f.name}</h2>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
          <button onClick={onClose} style={{
            all: 'unset', cursor: 'pointer',
            fontSize: 18, color: 'var(--ink-4)',
            padding: '0 6px',
          }}>×</button>
        </div>

        <div style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          <DetailKV label="主体" v={owner.label} />
          <DetailKV label="種別" v={kind.label} sub={kind.desc} />
          <DetailKV label="起源" v={origin.label} sub={origin.desc} />
          <DetailKV label="Phase" v={phase.label} sub={phase.desc} />
          <DetailKV label="更新" v={f.updatedAt} sub={f.changedToday ? '本日変更' : ''} />
        </div>

        <div style={{ padding: '0 22px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.06em', marginBottom: 8 }}>重要度スコア</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <ScoreCell label="使用頻度" v={f.usage} />
            <ScoreCell label="品質" v={f.quality} />
            <ScoreCell label="連動装置" v={f.linkages} unit="装" max={10} />
            <ScoreCell label="総合" v={f._score} big />
          </div>
        </div>

        {/* 連動装置 */}
        {deps.length > 0 && (
          <div style={{ padding: '0 22px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.06em', marginBottom: 8 }}>連動装置 ({deps.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {deps.map(d => (
                <button key={d.id} onClick={() => onJump(d.id)} style={{
                  all: 'unset', cursor: 'pointer',
                  fontSize: 11, padding: '4px 9px',
                  background: 'var(--bg-soft)', border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)', color: 'var(--ink-2)',
                }}>
                  <span className="kira-mono" style={{ color: 'var(--ink-4)', marginRight: 4 }}>{d.id}</span>
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SUPERSEDED 関連 */}
        {(supersededBy || supersedes.length > 0) && (
          <div style={{
            padding: '12px 22px',
            background: 'var(--bg-soft)',
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
          }}>
            {supersededBy && (
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'var(--bg-sunken)', color: 'var(--ink-2)' }}>📦 後継</span>
                <button onClick={() => onJump(supersededBy.id)} style={{ all: 'unset', cursor: 'pointer', color: 'var(--accent-ink)', fontWeight: 600 }}>
                  <span className="kira-mono" style={{ marginRight: 4, color: 'var(--ink-4)' }}>{supersededBy.id}</span>
                  {supersededBy.name}
                </button>
              </div>
            )}
            {supersedes.length > 0 && (
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: supersededBy ? 6 : 0 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'var(--bg-sunken)', color: 'var(--ink-2)', marginRight: 6 }}>本機能が代替</span>
                {supersedes.map((s, i) => (
                  <button key={s.id} onClick={() => onJump(s.id)} style={{
                    all: 'unset', cursor: 'pointer', color: 'var(--ink-2)', marginRight: 8,
                  }}>
                    <span className="kira-mono" style={{ color: 'var(--ink-4)', marginRight: 3 }}>{s.id}</span>{s.name}{i < supersedes.length-1 ? ',' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUPERSEDED 削除禁則 個別表示 */}
        {f.state === 'superseded' && (
          <div style={{
            padding: '12px 22px',
            background: 'color-mix(in oklab, var(--warn) 4%, var(--bg-panel))',
            borderTop: '1px solid color-mix(in oklab, var(--warn) 25%, var(--line))',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3,
              background: 'var(--warn)', color: '#fff', letterSpacing: '0.08em',
            }}>削除禁則</span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>
              本機能は史実保持のため記録庫に常駐します。削除はヤス採否権限の明示承認が必要です。
            </span>
            <span style={{ flex: 1 }} />
            <button disabled style={{
              all: 'unset', padding: '4px 12px',
              background: 'var(--bg-sunken)', color: 'var(--ink-4)',
              fontSize: 11, fontWeight: 600, borderRadius: 'var(--r-sm)',
              cursor: 'not-allowed',
            }}>削除（不可）</button>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailKV({ label, v, sub }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, color: 'var(--ink-4)', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-1)', marginTop: 2 }}>{v}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function ScoreCell({ label, v, unit, max, big }) {
  const M = max || 100;
  const pct = Math.min(100, (v / M) * 100);
  return (
    <div style={{
      padding: 10,
      background: big ? 'var(--accent-soft)' : 'var(--bg-soft)',
      border: `1px solid ${big ? 'color-mix(in oklab, var(--accent) 30%, var(--line))' : 'var(--line)'}`,
      borderRadius: 'var(--r-md)',
    }}>
      <div style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.06em' }}>{label}</div>
      <div className="kira-mono" style={{
        fontSize: big ? 24 : 18, fontWeight: 700,
        color: big ? 'var(--accent-ink)' : 'var(--ink-1)',
        lineHeight: 1, marginTop: 4,
        fontVariantNumeric: 'tabular-nums',
      }}>{v}<span style={{ fontSize: 10, color: 'var(--ink-4)', marginLeft: 2 }}>{unit || (big ? '/100' : '')}</span></div>
      {!unit && (
        <div style={{ marginTop: 6, height: 3, background: 'var(--bg-sunken)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: big ? 'var(--accent)' : 'var(--ink-2)' }} />
        </div>
      )}
    </div>
  );
}

window.CatalogScreen = CatalogScreen;
