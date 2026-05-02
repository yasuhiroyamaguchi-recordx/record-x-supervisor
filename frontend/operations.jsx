// 運用機能モジュール (第2弾微調整 +6機能 / +1ポップアップ整理)
// 1. クリア推奨バナー + 手動clearボタン
// 2. ハンドオフ最適化 (全文 / 結晶化)
// 3. 円卓会議ボタン + アジェンダモーダル
// 4. 指令発出モーダル (発出先/種別/期限/Plan-First)
// 5. Git push 同期 (機関設定で auto/manual 切替)
// 6. CI 状態看板 + 玉詰まり再稼働
// 7. ポップアップは円卓・指令発出のみ。他はインライン。

const { useState: useStateOp, useEffect: useEffectOp } = React;

// ─────────────────────────────────────────────────────
// 1. クリア推奨バナー + 手動 clear ボタン（ヤス権限維持）
// ─────────────────────────────────────────────────────
function ClearRecommendBanner({ ctx, nodeName, onManualClear }) {
  const state = ctx >= CONTEXT_THRESHOLDS.crit ? 'crit'
              : ctx >= CONTEXT_THRESHOLDS.autoEvac ? 'evac'
              : ctx >= CONTEXT_THRESHOLDS.warn ? 'warn'
              : 'ok';
  if (state === 'ok') return null;

  const palette = {
    warn: { c: 'var(--warn)', bg: 'color-mix(in oklab, var(--warn) 8%, var(--bg-panel))', label: 'クリア推奨', detail: `文脈使用率 ${Math.round(ctx*100)}% — 警告閾値（80%）を超過。` },
    evac: { c: 'var(--crit)', bg: 'color-mix(in oklab, var(--crit) 6%, var(--bg-panel))', label: 'クリア強く推奨', detail: `文脈使用率 ${Math.round(ctx*100)}% — 自動退避閾値（85%）を超過。次回チェックポイントで結晶化処理が走る予定。` },
    crit: { c: 'var(--crit)', bg: 'color-mix(in oklab, var(--crit) 9%, var(--bg-panel))', label: '即時クリア要請', detail: `文脈使用率 ${Math.round(ctx*100)}% — 上限閾値（90%）逼迫。次の長文タスクで切断のおそれ。` },
  }[state];

  return (
    <div style={{
      marginBottom: 12,
      background: palette.bg,
      border: `1px solid color-mix(in oklab, ${palette.c} 30%, var(--line))`,
      borderRadius: 'var(--r-md)',
      padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: palette.c, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 13, flex: 'none',
      }}>清</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: palette.c, letterSpacing: '0.04em' }}>
          {palette.label} — {nodeName}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 2 }}>
          {palette.detail} <span style={{ color: 'var(--ink-4)' }}>※ 自動 clear は行わず、ヤスの採否を待ちます。</span>
        </div>
      </div>
      <button onClick={onManualClear} style={{
        all: 'unset', cursor: 'pointer',
        padding: '6px 14px',
        background: palette.c, color: '#fff',
        fontSize: 12, fontWeight: 700,
        borderRadius: 'var(--r-sm)',
      }}>手動 clear</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 2. ハンドオフ最適化セクション (全文 + 結晶化)
// ─────────────────────────────────────────────────────
function HandoffSection({ nodeId }) {
  const ho = HANDOFFS[nodeId];
  if (!ho) return null;

  return (
    <Panel title="ハンドオフ最適化" subtitle="全文ログと結晶化要約は分離管理"
           style={{ marginTop: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12 }}>
        {/* 全文 .md ハンドオフ */}
        <div style={{
          padding: 12,
          background: 'var(--bg-soft)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 3,
              background: 'var(--bg-panel)', color: 'var(--ink-3)',
              border: '1px solid var(--line)', letterSpacing: '0.06em',
            }}>FULL · MD</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-1)' }}>現ハンドオフ（全文）</span>
          </div>
          <div className="kira-mono" style={{
            fontSize: 11, color: 'var(--ink-2)',
            padding: '6px 8px', background: 'var(--bg-panel)',
            borderRadius: 'var(--r-sm)', border: '1px solid var(--line)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{ho.fullPath}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 10.5, color: 'var(--ink-4)' }}>
            <span>{ho.fullSize}</span>
            <span>·</span>
            <span>更新 {ho.fullUpdatedAt}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button style={btnSecondaryOp}>開く</button>
            <button style={btnSecondaryOp}>差分確認</button>
            <button style={btnSecondaryOp}>記録庫保存</button>
          </div>
        </div>

        {/* 結晶化 */}
        <div style={{
          padding: 12,
          background: 'color-mix(in oklab, var(--accent) 4%, var(--bg-panel))',
          border: '1px solid color-mix(in oklab, var(--accent) 25%, var(--line))',
          borderRadius: 'var(--r-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 3,
              background: 'var(--accent)', color: '#fff',
              letterSpacing: '0.06em',
            }}>CRYSTAL · LLM</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-1)' }}>結晶化要約</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>{ho.crystal.generatedAt}</span>
          </div>
          <ul style={{
            margin: 0, paddingLeft: 18,
            fontSize: 11.5, lineHeight: 1.65, color: 'var(--ink-1)',
          }}>
            {ho.crystal.lines.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--ink-4)' }}>
            生成契機：{ho.crystal.reason} ／ 24時間 周期 or 文脈閾値超で再生成
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button style={btnPrimaryOp}>再生成</button>
            <button style={btnSecondaryOp}>結晶化基準を編集</button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ─────────────────────────────────────────────────────
// 5. Git push 同期セクション (インライン表示・ヘッダ用)
// ─────────────────────────────────────────────────────
function GitPushChip({ nodeId, onChange }) {
  const sync = GIT_SYNC[nodeId];
  if (!sync) return null;
  const auto = sync.mode === 'auto';
  const has = sync.pendingCommits > 0;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '4px 8px 4px 4px',
      background: 'var(--bg-soft)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      fontSize: 11,
    }}>
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
        padding: '2px 6px', borderRadius: 3,
        background: auto ? 'var(--accent-soft)' : 'var(--bg-panel)',
        color: auto ? 'var(--accent-ink)' : 'var(--ink-3)',
        border: `1px solid ${auto ? 'color-mix(in oklab, var(--accent) 25%, var(--line))' : 'var(--line)'}`,
      }}>{auto ? 'AUTO' : 'MANUAL'}</span>
      <span style={{ color: 'var(--ink-3)' }}>未push</span>
      <span className="kira-mono" style={{
        fontWeight: 700, fontSize: 12,
        color: has ? 'var(--warn)' : 'var(--ok)',
        fontVariantNumeric: 'tabular-nums',
      }}>{sync.pendingCommits}</span>
      {auto ? (
        <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>
          同期 {sync.lastSyncedAt}
        </span>
      ) : (
        <button disabled={!has} onClick={() => onChange?.({ ...sync, pendingCommits: 0, lastSyncedAt: new Date().toLocaleTimeString('ja-JP', { hour:'2-digit', minute:'2-digit', second:'2-digit' }) })}
          style={{
            all: 'unset', cursor: has ? 'pointer' : 'not-allowed',
            padding: '3px 10px',
            background: has ? 'var(--ink-1)' : 'var(--bg-sunken)',
            color: has ? 'var(--bg-panel)' : 'var(--ink-4)',
            fontSize: 11, fontWeight: 700,
            borderRadius: 'var(--r-sm)',
          }}>Push</button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 6. CI 状態看板 (工場長タブ専用 / インライン)
// ─────────────────────────────────────────────────────
function CIBoards({ boards, setBoards }) {
  const STATE_CONF = {
    running: { label: '進行中',   c: 'var(--accent)', bg: 'var(--accent-soft)' },
    pass:    { label: 'PASS',     c: 'var(--ok)',     bg: 'var(--ok-soft)' },
    stalled: { label: '停止',     c: 'var(--warn)',   bg: 'var(--warn-soft)' },
    fail:    { label: 'FAIL',     c: 'var(--crit)',   bg: 'var(--crit-soft)' },
  };
  const counts = boards.reduce((acc, b) => { acc[b.state] = (acc[b.state]||0)+1; return acc; }, {});
  const stalledIds = boards.filter(b => b.state === 'stalled').map(b => b.id);

  const restartOne = (id) => setBoards(prev => prev.map(b => b.id === id ? { ...b, state: 'running', elapsed: '0m05s' } : b));
  const restartAll = () => setBoards(prev => prev.map(b => b.state === 'stalled' ? { ...b, state: 'running', elapsed: '0m05s' } : b));

  return (
    <Panel title="CI 状態看板" subtitle="第n工区ごとの稼働状況"
           style={{ marginTop: 16 }}
           right={
             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               {Object.entries(STATE_CONF).map(([k, c]) => (
                 <span key={k} style={{
                   display: 'inline-flex', alignItems: 'center', gap: 4,
                   fontSize: 10.5, padding: '2px 7px', borderRadius: 99,
                   background: c.bg, color: c.c, fontWeight: 700,
                 }}>
                   <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.c }} />
                   {c.label} <span className="kira-mono">{counts[k]||0}</span>
                 </span>
               ))}
               {stalledIds.length > 0 && (
                 <button onClick={restartAll} style={{
                   all: 'unset', cursor: 'pointer',
                   padding: '4px 10px',
                   background: 'var(--warn)', color: '#fff',
                   fontSize: 11, fontWeight: 700,
                   borderRadius: 'var(--r-sm)',
                 }}>玉詰まり一括再稼働 ({stalledIds.length})</button>
               )}
             </div>
           }>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {boards.map(b => {
          const conf = STATE_CONF[b.state];
          return (
            <div key={b.id} style={{
              padding: '10px 12px',
              background: 'var(--bg-panel)',
              border: `1px solid ${b.state === 'stalled' || b.state === 'fail' ? `color-mix(in oklab, ${conf.c} 30%, var(--line))` : 'var(--line)'}`,
              borderLeft: `3px solid ${conf.c}`,
              borderRadius: 'var(--r-sm)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="kira-mono" style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>{b.id}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                    background: conf.bg, color: conf.c, letterSpacing: '0.06em',
                  }}>{conf.label}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-1)', marginTop: 2, fontWeight: 600 }}>{b.title}</div>
                <div className="kira-mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>
                  {b.branch} · {b.elapsed} · {b.updatedAt}
                </div>
              </div>
              {b.state === 'stalled' && (
                <button onClick={() => restartOne(b.id)} style={{
                  all: 'unset', cursor: 'pointer',
                  padding: '4px 10px',
                  background: 'var(--warn)', color: '#fff',
                  fontSize: 10.5, fontWeight: 700,
                  borderRadius: 'var(--r-sm)', flex: 'none',
                }}>マージまで再稼働</button>
              )}
              {b.state === 'fail' && (
                <button onClick={() => restartOne(b.id)} style={{
                  all: 'unset', cursor: 'pointer',
                  padding: '4px 10px',
                  background: 'var(--bg-panel)', color: 'var(--crit)',
                  border: '1px solid var(--crit)',
                  fontSize: 10.5, fontWeight: 700,
                  borderRadius: 'var(--r-sm)', flex: 'none',
                }}>再試行</button>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ─────────────────────────────────────────────────────
// 3. 円卓会議モーダル (アジェンダ作成 → プラン → GO)
// ─────────────────────────────────────────────────────
function RoundTableModal({ open, kind, onClose }) {
  const [step, setStep] = useStateOp('agenda'); // agenda → plan → confirmed
  const [topic, setTopic] = useStateOp('開発部のコンテキスト圧縮戦略');
  const [urgency, setUrgency] = useStateOp('high');
  const [maxTurns, setMaxTurns] = useStateOp(6);
  const [planFirst, setPlanFirst] = useStateOp(true);

  useEffectOp(() => { if (open) setStep('agenda'); }, [open, kind]);

  if (!open) return null;

  const isDifferent = kind === 'different';   // ChatGPT + Gemini + Claude
  const title = isDifferent ? '三者円卓開催（異社系）' : '同者円卓開催（Anthropic 系）';
  const cli = isDifferent
    ? 'factory board_meeting --members chatgpt,gemini,claude'
    : 'factory board_meeting --members supervisor,commander,factory';
  const members = isDifferent
    ? [{ k:'ChatGPT', c:'oklch(0.55 0.15 165)' }, { k:'Gemini', c:'oklch(0.55 0.13 250)' }, { k:'Claude', c:'oklch(0.55 0.13 30)' }]
    : [{ k:'監督官・甲号', c:'var(--ok)' }, { k:'司令官・乙号', c:'var(--accent)' }, { k:'工場長・丙号', c:'oklch(0.55 0.10 60)' }];

  return (
    <ModalShell onClose={onClose} title={title}>
      {/* ステップインジケータ */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[
          { id: 'agenda',    label: '1. アジェンダ作成' },
          { id: 'plan',      label: '2. プラン提示' },
          { id: 'confirmed', label: '3. ヤス GO 後 実行' },
        ].map((s, i) => (
          <div key={s.id} style={{
            flex: 1, padding: '6px 10px',
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
            background: step === s.id ? 'var(--ink-1)' : 'var(--bg-sunken)',
            color: step === s.id ? 'var(--bg-panel)' : 'var(--ink-3)',
            borderRadius: 'var(--r-sm)',
            textAlign: 'center',
          }}>{s.label}</div>
        ))}
      </div>

      {/* 召集メンバー */}
      <div style={{ marginBottom: 12, fontSize: 11.5, color: 'var(--ink-3)' }}>
        召集メンバー：
        {members.map((m, i) => (
          <span key={m.k} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            marginLeft: i === 0 ? 6 : 8,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.c }} />
            <span style={{ color: 'var(--ink-1)', fontWeight: 600 }}>{m.k}</span>
          </span>
        ))}
      </div>

      {step === 'agenda' && (
        <>
          <FieldLabel>議題</FieldLabel>
          <input value={topic} onChange={e => setTopic(e.target.value)} style={inpOp} />

          <FieldLabel>緊急度</FieldLabel>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{id:'low',l:'低'},{id:'med',l:'中'},{id:'high',l:'高'}].map(u => (
              <button key={u.id} onClick={() => setUrgency(u.id)} style={{
                ...chipOp, background: urgency === u.id ? 'var(--ink-1)' : 'transparent',
                color: urgency === u.id ? 'var(--bg-panel)' : 'var(--ink-3)',
              }}>{u.l}</button>
            ))}
          </div>

          <FieldLabel>最大議論ターン数</FieldLabel>
          <input type="number" min={2} max={20} value={maxTurns} onChange={e => setMaxTurns(+e.target.value)} style={{ ...inpOp, width: 100 }} />

          <FieldLabel>Plan-First</FieldLabel>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={planFirst} onChange={e => setPlanFirst(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
            実行前にプラン提示を必須とする（推奨）
          </label>

          <ModalActions>
            <button onClick={onClose} style={btnSecondaryOp}>取消</button>
            <button onClick={() => setStep('plan')} style={btnPrimaryOp}>プラン作成 →</button>
          </ModalActions>
        </>
      )}

      {step === 'plan' && (
        <>
          <div style={{
            padding: 12,
            background: 'var(--bg-sunken)',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--line)',
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginBottom: 6, letterSpacing: '0.06em', fontWeight: 700 }}>提示プラン</div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--ink-1)', lineHeight: 1.7 }}>
              <li>各員から議題「{topic}」に対する初期所見を1ターンずつ提示。</li>
              <li>差分が大きい論点を司令官が抽出（最大3点）。</li>
              <li>各論点ごとに反対意見・代替案を1ターンずつ。</li>
              <li>最終ターンで合意形成。賛否が割れた場合は記録庫に併記。</li>
              <li>結果を要約し、記録庫タブに収蔵（系列 J · 司令）。</li>
            </ol>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 10 }}>
            起動コマンド：<span className="kira-mono" style={{ color: 'var(--ink-1)', background: 'var(--bg-panel)', padding: '2px 6px', borderRadius: 3, border: '1px solid var(--line)' }}>{cli}</span>
          </div>
          <ModalActions>
            <button onClick={() => setStep('agenda')} style={btnSecondaryOp}>← 議題編集</button>
            <button onClick={() => setStep('confirmed')} style={btnPrimaryOp}>ヤス GO（実行）</button>
          </ModalActions>
        </>
      )}

      {step === 'confirmed' && (
        <>
          <div style={{
            padding: 16, textAlign: 'center',
            background: 'var(--ok-soft)',
            borderRadius: 'var(--r-md)',
            border: '1px solid color-mix(in oklab, var(--ok) 30%, var(--line))',
          }}>
            <div style={{ fontSize: 22, color: 'var(--ok)', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>開催を発令</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 6 }}>
              円卓は別 process で進行します。結果は<strong>記録庫タブ</strong>に収蔵されます。
            </div>
          </div>
          <ModalActions>
            <button onClick={onClose} style={btnPrimaryOp}>閉じる</button>
          </ModalActions>
        </>
      )}
    </ModalShell>
  );
}

// 円卓ボタン (ヘッダ右側に配置)
function RoundTableButtons({ onOpenSame, onOpenDifferent }) {
  return (
    <div style={{ display: 'inline-flex', gap: 6 }}>
      <button onClick={onOpenSame} style={{
        ...btnSecondaryOp,
        display: 'inline-flex', alignItems: 'center', gap: 5,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'oklch(0.55 0.13 30)',
          boxShadow: '8px 0 0 oklch(0.55 0.13 30), 16px 0 0 oklch(0.55 0.13 30)',
        }} />
        <span style={{ marginLeft: 14 }}>同者円卓</span>
      </button>
      <button onClick={onOpenDifferent} style={{
        ...btnSecondaryOp,
        display: 'inline-flex', alignItems: 'center', gap: 5,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'oklch(0.55 0.15 165)',
          boxShadow: '8px 0 0 oklch(0.55 0.13 250), 16px 0 0 oklch(0.55 0.13 30)',
        }} />
        <span style={{ marginLeft: 14 }}>三者円卓</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 4. 指令発出モーダル
// ─────────────────────────────────────────────────────
function CommandIssueModal({ open, fromNodeId, onClose }) {
  // 役割境界 §5 に整合した発出先候補を生成
  const allowedTargets = (() => {
    if (!fromNodeId) return [];
    if (fromNodeId === 'kantoku') return ['shirei', 'kojo'];
    if (fromNodeId === 'shirei') {
      return ['kojo', ...DIVISION_PRESETS.current.divisions];
    }
    if (fromNodeId === 'kojo') return ['kojo:sub-1', 'kojo:sub-2', 'kojo:sub-3'];
    if (fromNodeId?.startsWith('div-')) return ['shirei']; // 上申のみ
    return [];
  })();

  const [target, setTarget] = useStateOp(allowedTargets[0] || '');
  const [kind, setKind] = useStateOp('share');  // share | approve | implement
  const [due, setDue] = useStateOp('本日 18:00');
  const [planFirst, setPlanFirst] = useStateOp(true);
  const [body, setBody] = useStateOp('');

  useEffectOp(() => {
    if (open) {
      setTarget(allowedTargets[0] || '');
      setKind('share');
      setBody('');
      setPlanFirst(true);
    }
  }, [open, fromNodeId]);

  if (!open) return null;

  const fromNode = NODE_BY_ID[fromNodeId];
  const targetLabel = (id) => {
    if (id?.startsWith('kojo:sub-')) return `工場長配下サブエージェント #${id.slice(-1)}`;
    return NODE_BY_ID[id]?.fullname || id;
  };

  return (
    <ModalShell onClose={onClose} title="指令発出">
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
        padding: '8px 12px', background: 'var(--bg-sunken)',
        borderRadius: 'var(--r-sm)', fontSize: 11.5,
      }}>
        <span style={{ color: 'var(--ink-4)' }}>発出元</span>
        <RoleGlyph role={fromNode?.role} status={fromNode?.status} size={20} />
        <span style={{ color: 'var(--ink-1)', fontWeight: 700 }}>{fromNode?.fullname || fromNodeId}</span>
      </div>

      <FieldLabel>発出先（役割境界 §5 に従う）</FieldLabel>
      <select value={target} onChange={e => setTarget(e.target.value)} className="kira-mono"
              style={{ ...inpOp, width: '100%' }}>
        {allowedTargets.length === 0 ? (
          <option>（発出可能な対象なし）</option>
        ) : allowedTargets.map(id => (
          <option key={id} value={id}>{targetLabel(id)}</option>
        ))}
      </select>

      <FieldLabel>発令種別</FieldLabel>
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          {id:'share',     l:'認識共有', d:'状況の周知のみ。応答任意。'},
          {id:'approve',   l:'採否依頼', d:'プランの賛否をヤス採否で確定。'},
          {id:'implement', l:'実装依頼', d:'実装作業を委託。Plan-First推奨。'},
        ].map(k => (
          <button key={k.id} onClick={() => setKind(k.id)} title={k.d} style={{
            ...chipOp, flex: 1, padding: '8px 10px',
            background: kind === k.id ? 'var(--ink-1)' : 'transparent',
            color: kind === k.id ? 'var(--bg-panel)' : 'var(--ink-2)',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
          }}>
            <span style={{ fontWeight: 700 }}>{k.l}</span>
            <span style={{ fontSize: 9.5, opacity: 0.75 }}>{k.d}</span>
          </button>
        ))}
      </div>

      <FieldLabel>本文</FieldLabel>
      <textarea value={body} onChange={e => setBody(e.target.value)} rows={4}
        placeholder="発令内容を記述…"
        style={{ ...inpOp, width: '100%', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6, resize: 'vertical' }} />

      <FieldLabel>期限</FieldLabel>
      <input value={due} onChange={e => setDue(e.target.value)} style={{ ...inpOp, width: 200 }} />

      <FieldLabel>Plan-First</FieldLabel>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer' }}>
        <input type="checkbox" checked={planFirst} onChange={e => setPlanFirst(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
        実行前にプラン提示を必須とする（実装依頼では強く推奨）
      </label>

      <ModalActions>
        <button onClick={onClose} style={btnSecondaryOp}>取消</button>
        <button onClick={onClose} style={btnPrimaryOp} disabled={!target || !body.trim()}>発出</button>
      </ModalActions>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────
// モーダル共通シェル + フォーム原型
// ─────────────────────────────────────────────────────
function ModalShell({ onClose, title, children }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'color-mix(in oklab, var(--ink-1) 40%, transparent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 'min(640px, 92vw)',
        maxHeight: '88vh', overflowY: 'auto',
        background: 'var(--bg-panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)',
        padding: '20px 22px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
          marginBottom: 14, paddingBottom: 10,
          borderBottom: '1px solid var(--line)',
        }}>
          <KiraSeal size={22} />
          <h2 className="kira-serif" style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-1)' }}>{title}</h2>
          <span style={{ flex: 1 }} />
          <button onClick={onClose} aria-label="閉じる" style={{
            all: 'unset', cursor: 'pointer',
            fontSize: 14, color: 'var(--ink-4)',
            padding: '4px 10px', borderRadius: 'var(--r-sm)',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-3)', marginTop: 12, marginBottom: 4 }}>{children}</div>;
}
function ModalActions({ children }) {
  return <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--line)' }}>{children}</div>;
}

const inpOp = {
  all: 'unset', display: 'block', boxSizing: 'border-box',
  padding: '8px 12px',
  background: 'var(--bg-sunken)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-sm)',
  fontSize: 12.5, color: 'var(--ink-1)',
};
const chipOp = {
  all: 'unset', cursor: 'pointer',
  fontSize: 11.5, padding: '5px 12px', borderRadius: 'var(--r-sm)',
  border: '1px solid var(--line)', fontWeight: 600,
};
const btnPrimaryOp = {
  all: 'unset', cursor: 'pointer',
  padding: '8px 16px',
  background: 'var(--ink-1)', color: 'var(--bg-panel)',
  fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
  borderRadius: 'var(--r-sm)',
};
const btnSecondaryOp = {
  all: 'unset', cursor: 'pointer',
  padding: '8px 14px',
  background: 'var(--bg-panel)', color: 'var(--ink-2)',
  fontSize: 12, fontWeight: 600,
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-sm)',
};

// ─────────────────────────────────────────────────────
// 5b. Git push 同期 設定（機関設定タブ）
//     全機関の自動/手動切替＋既定方針
// ─────────────────────────────────────────────────────
function GitSyncSettings() {
  const [policy, setPolicy] = useStateOp('checkpoint'); // checkpoint | session-end | manual
  const [syncs, setSyncs] = useStateOp(GIT_SYNC);
  const ids = ['kantoku', 'shirei', 'kojo', 'div-eigyo', 'div-kaihatsu', 'div-kikaku', 'div-soumu'];

  const POLICIES = [
    { v: 'checkpoint',  label: 'チェックポイント毎に自動 push',  hint: '推奨。タスク区切りごとに作業を退避' },
    { v: 'session-end', label: 'セッション終了時のみ自動 push', hint: '長時間タスク向け。途中状態は失われる可能性' },
    { v: 'manual',      label: '常に手動 push',                hint: '機関ごとに任意のタイミングで実施' },
  ];

  return (
    <div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 10, lineHeight: 1.6 }}>
        既定方針を切替えると、AUTO 機関の挙動が一括で変化します。個別機関の AUTO/MANUAL は下表で個別に切替可能。
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {POLICIES.map(p => {
          const sel = policy === p.v;
          return (
            <label key={p.v} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: 10,
              background: sel ? 'var(--accent-soft)' : 'var(--bg-soft)',
              border: `1px solid ${sel ? 'color-mix(in oklab, var(--accent) 30%, var(--line))' : 'var(--line)'}`,
              borderRadius: 'var(--r-md)',
              cursor: 'pointer',
            }}>
              <input type="radio" name="git-policy" checked={sel} onChange={() => setPolicy(p.v)}
                     style={{ accentColor: 'var(--accent)', marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-1)' }}>{p.label}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 2 }}>{p.hint}</div>
              </div>
            </label>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.06em', marginBottom: 8 }}>機関別 設定</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ids.map((id, i, arr) => {
            const s = syncs[id]; if (!s) return null;
            const node = window.NODE_BY_ID?.[id]; // safe lookup
            const auto = s.mode === 'auto';
            const flip = () => setSyncs({ ...syncs, [id]: { ...s, mode: auto ? 'manual' : 'auto' } });
            return (
              <div key={id} style={{
                display: 'grid', gridTemplateColumns: '180px 1fr 90px 90px',
                gap: 12, padding: '10px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                alignItems: 'center', fontSize: 12,
              }}>
                <span className="kira-mono" style={{ color: 'var(--ink-2)' }}>{node?.codename || id}</span>
                <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>
                  リポジトリ <span className="kira-mono" style={{ color: 'var(--ink-3)' }}>{s.repo}</span>
                </span>
                <span className="kira-mono" style={{
                  fontSize: 11, fontWeight: 700, textAlign: 'center',
                  color: s.pendingCommits > 0 ? 'var(--warn)' : 'var(--ok)',
                  fontVariantNumeric: 'tabular-nums',
                }}>未push {s.pendingCommits}</span>
                <button onClick={flip} style={{
                  all: 'unset', cursor: 'pointer',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                  padding: '4px 10px', borderRadius: 3, textAlign: 'center',
                  background: auto ? 'var(--accent-soft)' : 'var(--bg-soft)',
                  color: auto ? 'var(--accent-ink)' : 'var(--ink-3)',
                  border: `1px solid ${auto ? 'color-mix(in oklab, var(--accent) 25%, var(--line))' : 'var(--line)'}`,
                }}>{auto ? 'AUTO' : 'MANUAL'}</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ClearRecommendBanner,
  HandoffSection,
  GitPushChip,
  GitSyncSettings,
  CIBoards,
  RoundTableModal, RoundTableButtons,
  CommandIssueModal,
  ModalShell, FieldLabel, ModalActions,
  inpOp, chipOp, btnPrimaryOp, btnSecondaryOp,
});
