// 記録庁 — 共通プリミティブ
// 3案すべてで使うバッジ・ヘルスメーター・SVGスパークライン・タブヘッダ等

const { useState, useEffect, useMemo, useRef } = React;

// ── 印章っぽいロゴ ────────────────────────────────────
function KiraSeal({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'block' }}>
      <rect x="1" y="1" width="30" height="30" rx="3"
            fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="4" width="24" height="24" rx="1"
            fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <text x="16" y="20" textAnchor="middle"
            fontFamily='"Noto Serif JP", serif'
            fontWeight="700" fontSize="14" fill="currentColor">記</text>
    </svg>
  );
}

// ── ステータスバッジ ─────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    ok:   { label: '稼働中', color: 'var(--ok)',   bg: 'var(--ok-soft)' },
    warn: { label: '警告',   color: 'var(--warn)', bg: 'var(--warn-soft)' },
    crit: { label: 'エラー', color: 'var(--crit)', bg: 'var(--crit-soft)' },
    idle: { label: '待機',   color: 'var(--idle)', bg: 'var(--idle-soft)' },
  };
  const m = map[status] || map.idle;
  return (
    <span className="kira-tag" style={{ color: m.color, background: m.bg }}>
      <span className={`kira-dot ${status}`} />
      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, letterSpacing: 0 }}>
        {m.label}
      </span>
    </span>
  );
}

// ── 重要度バッジ ─────────────────────────────────────
function SeverityPill({ sev }) {
  const map = {
    critical: { color: 'var(--crit)', bg: 'var(--crit-soft)', label: '緊急' },
    high:     { color: 'oklch(0.55 0.16 40)', bg: 'oklch(0.96 0.04 50)', label: '重要' },
    medium:   { color: 'var(--warn)', bg: 'var(--warn-soft)', label: '注意' },
    low:      { color: 'var(--ink-3)', bg: 'var(--bg-sunken)', label: '情報' },
  };
  const m = map[sev] || map.low;
  return (
    <span className="kira-tag" style={{ color: m.color, background: m.bg }}>
      {m.label}
    </span>
  );
}

// ── ヘルスメーター（円弧） ───────────────────────────
function HealthArc({ value, size = 64, label, sub }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arc = c * 0.78; // 280度
  const v = Math.max(0, Math.min(100, value));
  const fill = (v / 100) * arc;

  const color = v >= 80 ? 'var(--ok)' : v >= 60 ? 'var(--warn)' : 'var(--crit)';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(130deg)' }}>
        <circle cx={size/2} cy={size/2} r={r}
                fill="none" stroke="var(--bg-sunken)" strokeWidth={stroke}
                strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
        <circle cx={size/2} cy={size/2} r={r}
                fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={`${fill} ${c}`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}>
        <div className="kira-mono" style={{ fontSize: size > 70 ? 18 : 15, fontWeight: 700, color: 'var(--ink-1)', lineHeight: 1 }}>
          {Math.round(v)}
        </div>
        {sub && <div style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── 横棒メーター ─────────────────────────────────────
function HBar({ value, max = 100, color = 'var(--accent)', height = 4, bg = 'var(--bg-sunken)' }) {
  const v = Math.max(0, Math.min(max, value));
  const pct = (v / max) * 100;
  return (
    <div style={{ background: bg, borderRadius: 99, height, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, background: color, height: '100%', transition: 'width 0.6s ease' }} />
    </div>
  );
}

// ── スパークライン ───────────────────────────────────
function Spark({ data, w = 80, h = 22, color = 'var(--accent)' }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * stepX},${h - ((v - min) / range) * h}`).join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polygon points={area} fill={color} fillOpacity="0.10" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// シード付きランダムスパークデータ生成
function makeSpark(seed, n = 24, base = 50, var_ = 30) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const out = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.5) * var_;
    v = Math.max(5, Math.min(95, v));
    out.push(v);
  }
  return out;
}

// ── ロール・グリフ（漢字を印章風に） ──────────────────
function RoleGlyph({ role, size = 36, status = 'ok', dim = false }) {
  // 役職の最初の漢字を抽出
  const map = {
    '監督官': '監',
    '司令官': '司',
    '工場長': '工',
    '事業部門長': '部',
  };
  const ch = map[role] || role[0];
  const colorMap = {
    ok:   'var(--ok)',
    warn: 'var(--warn)',
    crit: 'var(--crit)',
    idle: 'var(--idle)',
  };
  const c = colorMap[status] || 'var(--idle)';
  return (
    <div style={{
      width: size, height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 'var(--r-md)',
      background: dim ? 'var(--bg-sunken)' : `color-mix(in oklab, ${c} 12%, var(--bg-panel))`,
      border: `1px solid color-mix(in oklab, ${c} 30%, var(--line))`,
      color: c,
      fontFamily: 'var(--font-serif)',
      fontWeight: 700,
      fontSize: size * 0.5,
      flex: 'none',
    }}>{ch}</div>
  );
}

// ── パネル（共通カード） ─────────────────────────────
function Panel({ title, subtitle, right, children, padding = 16, style }) {
  return (
    <section style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)',
      ...style,
    }}>
      {title && (
        <header style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          padding: `${padding * 0.85}px ${padding}px`,
          borderBottom: '1px solid var(--line)',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
            <h3 className="kira-serif" style={{
              margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--ink-1)',
              letterSpacing: '0.04em',
            }}>{title}</h3>
            {subtitle && <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{subtitle}</span>}
          </div>
          {right && <div style={{ flex: 'none' }}>{right}</div>}
        </header>
      )}
      <div style={{ padding }}>{children}</div>
    </section>
  );
}

// ── アプリヘッダ（共通） ─────────────────────────────
function AppHeader({ now }) {
  const dateStr = `令和八年五月二日（土）`;
  const timeStr = '15:42:06';
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 24px',
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--line)',
      gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ color: 'var(--ink-1)' }}><KiraSeal size={26} /></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="kira-serif" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ink-1)', lineHeight: 1.1 }}>
            記録庁
          </div>
          <div className="kira-mono" style={{ fontSize: 9.5, color: 'var(--ink-4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ARCHIVE BUREAU · MULTI-AGENT CONTROL
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div className="kira-mono" style={{ fontSize: 12, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
            {timeStr}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{dateStr}</div>
        </div>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'var(--accent-soft)', color: 'var(--accent-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-serif)',
          border: '1px solid color-mix(in oklab, var(--accent) 20%, var(--line))',
        }}>管</div>
      </div>
    </header>
  );
}

// ── タブバー（共通） ────────────────────────────────
function TabBar({ tabs, active, onSelect }) {
  return (
    <nav style={{
      display: 'flex',
      padding: '0 24px',
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--line)',
      gap: 4,
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id} onClick={() => onSelect(t.id)}
            style={{
              all: 'unset',
              cursor: 'pointer',
              padding: '12px 14px',
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--ink-1)' : 'var(--ink-3)',
              borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
              marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 7,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--ink-1)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--ink-3)'; }}
          >
            {t.glyph && (
              <span className="kira-serif" style={{
                fontSize: 11, fontWeight: 700,
                color: isActive ? 'var(--accent)' : 'var(--ink-4)',
                width: 14, textAlign: 'center',
              }}>{t.glyph}</span>
            )}
            <span>{t.label}</span>
            {t.badge && (
              <span style={{
                fontSize: 10, fontFamily: 'var(--font-mono)',
                padding: '1px 6px', borderRadius: 99,
                background: t.badgeColor || 'var(--bg-sunken)',
                color: t.badgeTextColor || 'var(--ink-3)',
                fontWeight: 600,
              }}>{t.badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ── 関係性 ───────────────────────────────────────────
function relTime(timeStr) {
  // 雑な相対時間（'15:41:52' 形式 ⇄ now 15:42:06）
  const [h, m, s] = timeStr.split(':').map(Number);
  const nowSec = 15*3600 + 42*60 + 6;
  const t = h*3600 + m*60 + s;
  const diff = nowSec - t;
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff/60)}分前`;
  return `${Math.floor(diff/3600)}時間前`;
}

Object.assign(window, {
  KiraSeal, StatusBadge, SeverityPill,
  HealthArc, HBar, Spark, makeSpark,
  RoleGlyph, Panel, AppHeader, TabBar, relTime,
});
