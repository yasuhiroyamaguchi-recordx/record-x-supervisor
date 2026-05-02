// ─────────────────────────────────────────────────────
// Dream機能 + 定期検診 コンポーネント
// 三官タブ右上ボタン群、階層化メモリセクション、ADR/哲学層、設定パネル
// ─────────────────────────────────────────────────────

const { useState: useStateDR } = React;

// ─────────────────────────────────────────────────────
// ヘッダ右側ボタン群: Dream + 定期検診
// 円卓会議ボタン横に配置
// ─────────────────────────────────────────────────────
function DreamCheckupButtons({ nodeId, onDreamOpen, onCheckupOpen }) {
  const checkup = LATEST_CHECKUPS[nodeId];
  return (
    <div style={{ display: 'inline-flex', gap: 6 }}>
      <button onClick={onCheckupOpen} title="定期検診を実行" style={{
        all: 'unset', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '5px 11px',
        background: 'var(--bg-soft)', color: 'var(--ink-1)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)',
        fontSize: 11, fontWeight: 600,
      }}>
        <span style={{ fontSize: 12 }}>診</span>
        <span>定期検診</span>
        {checkup && (
          <span className="kira-mono" style={{
            fontSize: 9.5, fontWeight: 700,
            padding: '1px 5px', borderRadius: 3,
            background: checkup.score >= 90 ? 'var(--ok-soft)' : checkup.score >= 75 ? 'var(--accent-soft)' : 'var(--warn-soft)',
            color: checkup.score >= 90 ? 'var(--ok)' : checkup.score >= 75 ? 'var(--accent-ink)' : 'var(--warn)',
            marginLeft: 2,
          }}>{checkup.score}</span>
        )}
      </button>
      <button onClick={onDreamOpen} title="Dream化を実行（記憶圧縮）" style={{
        all: 'unset', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '5px 11px',
        background: 'color-mix(in oklab, var(--accent) 8%, var(--bg-soft))',
        color: 'var(--accent-ink)',
        border: '1px solid color-mix(in oklab, var(--accent) 30%, var(--line))',
        borderRadius: 'var(--r-md)',
        fontSize: 11, fontWeight: 700,
      }}>
        <span style={{ fontSize: 12 }}>夢</span>
        <span>Dream化</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 階層化メモリ セクション (各機関詳細画面に配置)
// ─────────────────────────────────────────────────────
function MemoryLayerSection({ nodeId, onDreamRun }) {
  const mem = MEMORY_LAYERS[nodeId];
  if (!mem) return null;
  const [showMeta3, setShowMeta3] = useStateDR(mem.metameta3.expanded);

  const layers = [
    { key: 'short', flow: '直近24h',    arrow: '→' },
    { key: 'mid',   flow: '7日',         arrow: '→' },
    { key: 'long',  flow: '永続',        arrow: '' },
  ];

  return (
    <Panel title="階層化メモリ" subtitle="短期 → 中期 → 長期 / Dream による圧縮"
           right={
             <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>
               最終Dream <span className="kira-mono" style={{ color: 'var(--ink-2)' }}>{mem.short.lastDream}</span>
             </span>
           }
           style={{ marginTop: 16 }}>
      {/* 主3層 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 14px 1fr 14px 1fr', gap: 8, alignItems: 'stretch' }}>
        {layers.map((L, i) => {
          const m = mem[L.key];
          const isLast = i === layers.length - 1;
          return (
            <React.Fragment key={L.key}>
              <MemoryCell layer={m} flow={L.flow} onDream={() => onDreamRun(L.key)} />
              {!isLast && <FlowArrow />}
            </React.Fragment>
          );
        })}
      </div>

      {/* メタ階層 */}
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.06em' }}>メタ記憶階層</span>
          <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>(記憶を記憶する層)</span>
          <span style={{ flex: 1 }} />
          <button onClick={() => setShowMeta3(!showMeta3)} style={{
            all: 'unset', cursor: 'pointer',
            fontSize: 10, padding: '2px 8px', borderRadius: 99,
            background: showMeta3 ? 'var(--accent-soft)' : 'transparent',
            color: showMeta3 ? 'var(--accent-ink)' : 'var(--ink-3)',
            border: `1px solid ${showMeta3 ? 'color-mix(in oklab, var(--accent) 25%, var(--line))' : 'var(--line)'}`,
            fontWeight: 600,
          }}>{showMeta3 ? '第3階層を畳む' : '第3階層を展開'}</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: showMeta3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 8 }}>
          <MetaCell m={mem.meta} level={1} />
          <MetaCell m={mem.metameta} level={2} />
          {showMeta3 && <MetaCell m={mem.metameta3} level={3} />}
        </div>
      </div>
    </Panel>
  );
}

function MemoryCell({ layer, flow, onDream }) {
  const STATE_COLOR = {
    active: 'var(--ok)', warn: 'var(--warn)', crit: 'var(--crit)',
  };
  const c = STATE_COLOR[layer.state] || 'var(--ink-3)';
  return (
    <div style={{
      padding: 12,
      background: 'var(--bg-panel)',
      border: `1px solid ${layer.state === 'crit' ? 'color-mix(in oklab, var(--crit) 30%, var(--line))' : 'var(--line)'}`,
      borderRadius: 'var(--r-md)',
      display: 'flex', flexDirection: 'column', gap: 6,
      borderLeft: `3px solid ${c}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span className="kira-serif" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-1)', letterSpacing: '0.04em' }}>{layer.label}</span>
        <span style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>{flow}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span className="kira-mono" style={{
          fontSize: 18, fontWeight: 700,
          color: layer.state === 'crit' ? 'var(--crit)' : layer.state === 'warn' ? 'var(--warn)' : 'var(--ink-1)',
          fontVariantNumeric: 'tabular-nums',
        }}>{layer.sizeKB}</span>
        <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>KB</span>
        <span style={{ flex: 1 }} />
        <span className="kira-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{layer.items}項</span>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-3)', lineHeight: 1.4 }}>{layer.desc}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
        <span style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>最終Dream {layer.lastDream}</span>
        <span style={{ flex: 1 }} />
        <button onClick={onDream} style={{
          all: 'unset', cursor: 'pointer',
          fontSize: 10, fontWeight: 700,
          padding: '2px 8px', borderRadius: 3,
          background: 'var(--accent-soft)', color: 'var(--accent-ink)',
          border: '1px solid color-mix(in oklab, var(--accent) 25%, var(--line))',
        }}>Dream</button>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)', fontSize: 14 }}>›</div>
  );
}

function MetaCell({ m, level }) {
  return (
    <div style={{
      padding: 10,
      background: 'var(--bg-soft)',
      border: '1px dashed var(--line-strong)',
      borderRadius: 'var(--r-md)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', background: 'var(--ink-1)', color: 'var(--bg-panel)', borderRadius: 2, letterSpacing: '0.04em' }}>L{level}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-1)' }}>{m.label}</span>
        <span style={{ flex: 1 }} />
        <span className="kira-mono" style={{ fontSize: 10.5, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>{m.sizeKB}KB</span>
        <span className="kira-mono" style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>·{m.items}項</span>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>{m.desc}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// ADR / 哲学層 Dream セクション (機関設定タブ or 詳細タブで使用)
// ─────────────────────────────────────────────────────
function ADRDreamSection() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <ADRColumn data={ADR_DREAM.adr} />
      <ADRColumn data={ADR_DREAM.philosophy} />
    </div>
  );
}

function ADRColumn({ data }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.06em', marginBottom: 6 }}>{data.label}</div>
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)',
      }}>
        {data.files.map((f, i, arr) => {
          const stateC = f.state === 'warn' ? 'var(--warn)' : 'var(--ok)';
          return (
            <div key={f.id} style={{
              padding: '9px 12px',
              borderBottom: i < arr.length-1 ? '1px solid var(--line)' : 'none',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span className="kira-mono" style={{ fontSize: 10, color: 'var(--ink-4)', minWidth: 64 }}>{f.id}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-1)' }}>{f.title}</span>
                  {f.isProposal && <span style={{ fontSize: 8.5, fontWeight: 700, padding: '1px 5px', background: 'var(--accent-soft)', color: 'var(--accent-ink)', borderRadius: 2 }}>提案</span>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 1, display: 'flex', gap: 8 }}>
                  <span>L{f.metaLevel}<span style={{ marginLeft: 2 }}>{['', '基層', 'Meta', 'MetaMeta'][f.metaLevel]}</span></span>
                  <span>·</span>
                  <span className="kira-mono">{f.sizeKB}KB</span>
                  <span>·</span>
                  <span>最終Dream {f.lastDream}</span>
                </div>
              </div>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: stateC, flex: 'none',
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Dream モーダル (手動 Dream 化)
// ─────────────────────────────────────────────────────
function DreamModal({ open, nodeId, onClose, focusLayer }) {
  if (!open) return null;
  const node = NODE_BY_ID[nodeId];
  const mem = MEMORY_LAYERS[nodeId];
  const [layer, setLayer] = useStateDR(focusLayer || 'short');
  const [step, setStep] = useStateDR('plan'); // plan | running | done
  const [includeMeta, setIncludeMeta] = useStateDR(false);

  const target = mem?.[layer];

  const run = () => {
    setStep('running');
    setTimeout(() => setStep('done'), 1100);
  };

  return (
    <ModalShell title="Dream化（記憶圧縮）" sub={`${node?.fullname} / 階層化メモリ`} onClose={onClose}>
      {step === 'plan' && (
        <>
          <FieldLabel>対象階層</FieldLabel>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[
              { v: 'short', label: '短期 → 中期', size: mem.short.sizeKB },
              { v: 'mid',   label: '中期 → 長期', size: mem.mid.sizeKB },
              { v: 'long',  label: '長期 内部再構成', size: mem.long.sizeKB },
            ].map(o => {
              const sel = layer === o.v;
              return (
                <button key={o.v} onClick={() => setLayer(o.v)} style={{
                  all: 'unset', cursor: 'pointer',
                  padding: '8px 10px', borderRadius: 'var(--r-sm)',
                  fontSize: 11.5, fontWeight: 600, flex: 1, textAlign: 'center',
                  background: sel ? 'var(--accent-soft)' : 'var(--bg-soft)',
                  color: sel ? 'var(--accent-ink)' : 'var(--ink-3)',
                  border: `1px solid ${sel ? 'color-mix(in oklab, var(--accent) 30%, var(--line))' : 'var(--line)'}`,
                }}>
                  <div>{o.label}</div>
                  <div className="kira-mono" style={{ fontSize: 10, marginTop: 2, color: sel ? 'var(--accent-ink)' : 'var(--ink-4)' }}>{o.size}KB</div>
                </button>
              );
            })}
          </div>

          <FieldLabel>処理内容（プラン）</FieldLabel>
          <div style={{
            padding: 12,
            background: 'var(--bg-soft)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.65,
            marginBottom: 12,
          }}>
            <div>1. {target.label}（{target.sizeKB}KB / {target.items}項）を読込</div>
            <div>2. 自動圧縮 + ベクトル埋め込み生成（Phase B 中盤候補）</div>
            <div>3. 関連長期記憶へリンク作成</div>
            <div>4. メタ層（参照頻度・有効性）を更新</div>
            {includeMeta && <div>5. メタメタ層（剪定方針）も再評価</div>}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={includeMeta} onChange={e => setIncludeMeta(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
            <span>メタ階層も同時に再評価する</span>
          </label>

          <ModalActions>
            <button onClick={onClose} style={btnSecondaryOp}>取消</button>
            <button onClick={run} style={btnPrimaryOp}>Dream を発動</button>
          </ModalActions>
        </>
      )}
      {step === 'running' && (
        <div style={{ padding: '30px 0', textAlign: 'center' }}>
          <div className="kira-serif" style={{ fontSize: 16, color: 'var(--accent-ink)', letterSpacing: '0.08em', marginBottom: 8 }}>夢を見ています…</div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{target.label}を圧縮中</div>
        </div>
      )}
      {step === 'done' && (
        <div style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--ok)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700,
            }}>✓</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-1)' }}>Dream完了</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>結果を記録庫に保存しました（DRM-2025-1103）</div>
            </div>
          </div>
          <div style={{
            padding: 10, fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.7,
            background: 'var(--bg-soft)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)',
          }}>
            <div>圧縮: <span className="kira-mono">{target.sizeKB}KB → {(target.sizeKB * 0.78).toFixed(1)}KB</span></div>
            <div>項目: <span className="kira-mono">{target.items}項 → {Math.round(target.items * 0.62)}項（圧縮 + リンク）</span></div>
          </div>
          <ModalActions>
            <button onClick={onClose} style={btnPrimaryOp}>閉じる</button>
          </ModalActions>
        </div>
      )}
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────
// 定期検診モーダル
// ─────────────────────────────────────────────────────
function CheckupModal({ open, nodeId, onClose }) {
  if (!open) return null;
  const node = NODE_BY_ID[nodeId];
  const prev = LATEST_CHECKUPS[nodeId];
  const [step, setStep] = useStateDR('confirm'); // confirm | running | done

  const run = () => {
    setStep('running');
    setTimeout(() => setStep('done'), 1300);
  };

  // ダミー新スコア
  const newScore = Math.min(100, prev.score + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4));

  return (
    <ModalShell title="定期検診" sub={`${node?.fullname} / 機関健康度のスナップショット取得`} onClose={onClose}>
      {step === 'confirm' && (
        <>
          <div style={{
            padding: 12,
            background: 'var(--bg-soft)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 14,
          }}>
            <div>本検診では以下を実施します:</div>
            <div>1. 機関健康度の即時スナップショット取得</div>
            <div>2. <span className="kira-mono">{CHECKUP_MODE.scoresDir}</span> に結果を保存</div>
            <div>3. トップ画面ヘルスメーターへ即時反映</div>
            <div>4. 記録庫タブの検診履歴に追記</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <KV label="前回スコア" v={`${prev.score}（${prev.runAt}）`} />
            <KV label="保存先" v={prev.snapPath} />
          </div>
          <ModalActions>
            <button onClick={onClose} style={btnSecondaryOp}>取消</button>
            <button onClick={run} style={btnPrimaryOp}>検診を実行</button>
          </ModalActions>
        </>
      )}
      {step === 'running' && (
        <div style={{ padding: '30px 0', textAlign: 'center' }}>
          <div className="kira-serif" style={{ fontSize: 16, color: 'var(--ink-1)', letterSpacing: '0.08em', marginBottom: 8 }}>診察中…</div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>各層を観測しています</div>
        </div>
      )}
      {step === 'done' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--ok)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700,
            }}>✓</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-1)' }}>検診完了</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>新規記録 CHK-2025-1102b-{nodeId.charAt(0).toUpperCase()} を保存</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <KV label="前回" v={prev.score} />
            <KV label="今回" v={newScore} warn={newScore < prev.score} />
          </div>
          <ModalActions>
            <button onClick={onClose} style={btnPrimaryOp}>閉じる</button>
          </ModalActions>
        </div>
      )}
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────
// 機関設定タブ用 自動/手動切替パネル
// ─────────────────────────────────────────────────────
function DreamCheckupSettings() {
  const [dreamMode, setDreamMode] = useStateDR(DREAM_MODE.default);
  const [policy, setPolicy] = useStateDR(DREAM_MODE.defaultPolicy);
  const [thresh, setThresh] = useStateDR(DREAM_MODE.thresholds);
  const [checkupMode, setCheckupMode] = useStateDR(CHECKUP_MODE.default);

  return (
    <div>
      {/* Dream モード */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.06em', marginBottom: 6 }}>Dream モード（記憶圧縮）</div>
        <ModeSwitch value={dreamMode} setValue={setDreamMode}
                    options={[
                      { v: 'manual', label: '手動 Dream', hint: 'ヤス採否権限維持・警告通知のみ（推奨）' },
                      { v: 'auto',   label: '自動 Dream', hint: '閾値超過で自動発動。Phase B 中盤実装候補' },
                    ]} />
      </div>

      {dreamMode === 'auto' && (
        <div style={{
          padding: 10, marginBottom: 14,
          background: 'color-mix(in oklab, var(--warn) 5%, var(--bg-panel))',
          border: '1px dashed color-mix(in oklab, var(--warn) 35%, var(--line))',
          borderRadius: 'var(--r-md)',
          fontSize: 11, color: 'var(--ink-2)',
        }}>
          ⚠ 自動 Dream はヤス採否権限の代行に近い操作です。Phase B 中盤までは手動推奨を維持してください。
        </div>
      )}

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.06em', marginBottom: 6 }}>発動方針</div>
        <ModeSwitch value={policy} setValue={setPolicy}
                    options={[
                      { v: 'warn-recommend', label: '警告通知 + 手動発動推奨', hint: 'デフォルト' },
                      { v: 'aggressive',     label: '積極的 Dream',           hint: '閾値を下げて頻繁に圧縮' },
                    ]} />
      </div>

      {/* 行数閾値 */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.06em', marginBottom: 6 }}>行数閾値（KB）</div>
        <div style={{
          background: 'var(--bg-panel)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)',
        }}>
          {Object.entries({
            handoff:    { label: 'ハンドオフ',  ref: '現行 38.2 / 47.6 KB' },
            metaMemo:   { label: 'メタ記憶',     ref: '階層別に集計' },
            adr:        { label: 'ADR層',        ref: 'ADR-009 §6 拡張候補' },
            philosophy: { label: '哲学層',       ref: 'PHI-009 など' },
          }).map(([k, info], i, arr) => (
            <div key={k} style={{
              display: 'grid', gridTemplateColumns: '120px 1fr 100px 100px',
              gap: 12, padding: '10px 14px', alignItems: 'center',
              borderBottom: i < arr.length-1 ? '1px solid var(--line)' : 'none',
              fontSize: 12,
            }}>
              <span style={{ fontWeight: 600, color: 'var(--ink-1)' }}>{info.label}</span>
              <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>{info.ref}</span>
              <ThreshInput label="警告" v={thresh[k].warn}
                           onChange={n => setThresh({ ...thresh, [k]: { ...thresh[k], warn: n } })}
                           color="var(--warn)" />
              <ThreshInput label="自動候補" v={thresh[k].autoCandidate}
                           onChange={n => setThresh({ ...thresh, [k]: { ...thresh[k], autoCandidate: n } })}
                           color="var(--crit)" />
            </div>
          ))}
        </div>
      </div>

      {/* 定期検診 */}
      <div style={{ marginBottom: 4, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.06em', marginBottom: 6 }}>定期検診</div>
        <ModeSwitch value={checkupMode} setValue={setCheckupMode}
                    options={[
                      { v: 'manual', label: '手動検診のみ',                         hint: '各機関タブのボタンから随時実行' },
                      { v: 'auto',   label: '自動検診（09:00 schtasks 連動）',       hint: 'RX-Layer4-Checkup と整合（Phase B 序盤即実装可）' },
                    ]} />
        <div style={{
          marginTop: 10, padding: 10,
          background: 'var(--bg-soft)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)',
          fontSize: 11, color: 'var(--ink-3)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <span>スケジュール: <span className="kira-mono" style={{ color: 'var(--ink-1)' }}>{CHECKUP_MODE.schedule}</span></span>
          <span>·</span>
          <span>タスク名: <span className="kira-mono" style={{ color: 'var(--ink-1)' }}>{CHECKUP_MODE.taskName}</span></span>
          <span>·</span>
          <span>保存先: <span className="kira-mono" style={{ color: 'var(--ink-1)' }}>{CHECKUP_MODE.scoresDir}</span></span>
        </div>
      </div>
    </div>
  );
}

function ModeSwitch({ value, setValue, options }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {options.map(o => {
        const sel = value === o.v;
        return (
          <label key={o.v} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: 10,
            background: sel ? 'var(--accent-soft)' : 'var(--bg-soft)',
            border: `1px solid ${sel ? 'color-mix(in oklab, var(--accent) 30%, var(--line))' : 'var(--line)'}`,
            borderRadius: 'var(--r-md)',
            cursor: 'pointer',
          }}>
            <input type="radio" checked={sel} onChange={() => setValue(o.v)}
                   style={{ accentColor: 'var(--accent)', marginTop: 2 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-1)' }}>{o.label}</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 2 }}>{o.hint}</div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

function ThreshInput({ label, v, onChange, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 9.5, color: color, fontWeight: 700, letterSpacing: '0.06em' }}>{label}</span>
      <input type="number" value={v} onChange={e => onChange(Number(e.target.value))}
             style={{
               width: 50, padding: '3px 6px',
               background: 'var(--bg-soft)', border: '1px solid var(--line)',
               borderRadius: 3, color: 'var(--ink-1)',
               fontFamily: 'var(--font-mono)', fontSize: 11, textAlign: 'right',
             }} />
      <span style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>KB</span>
    </div>
  );
}

function KV({ label, v, warn }) {
  return (
    <div style={{
      padding: 10, background: 'var(--bg-soft)',
      border: '1px solid var(--line)', borderRadius: 'var(--r-md)',
    }}>
      <div style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.06em' }}>{label}</div>
      <div className="kira-mono" style={{
        fontSize: 18, fontWeight: 700,
        color: warn ? 'var(--warn)' : 'var(--ink-1)',
        marginTop: 3, fontVariantNumeric: 'tabular-nums',
      }}>{v}</div>
    </div>
  );
}

Object.assign(window, {
  DreamCheckupButtons,
  MemoryLayerSection,
  ADRDreamSection,
  DreamModal,
  CheckupModal,
  DreamCheckupSettings,
});
