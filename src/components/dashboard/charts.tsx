// 대시보드 도넛 차트 컴포넌트
import { useState } from 'react';
import type { PortfolioSlice } from './shared';

const DONUT_R = 28;
const CIRC = 2 * Math.PI * DONUT_R;

export function DonutChart({ data }: { data: PortfolioSlice[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const active = activeIdx !== null ? data[activeIdx] : null;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        {data.map((d, i) => {
          const dash = (d.pct / 100) * CIRC;
          const el = (
            <circle
              key={i}
              cx="40" cy="40" r={DONUT_R}
              fill="none"
              stroke={d.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${CIRC - dash}`}
              strokeDashoffset={-offset}
              opacity={activeIdx === null || activeIdx === i ? 1 : 0.25}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              style={{ cursor: 'default', pointerEvents: 'stroke', transition: 'opacity 0.15s' }}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      {active && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          textAlign: 'center', pointerEvents: 'none', width: 46,
        }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: active.color, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active.label}</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{active.pct}%</div>
        </div>
      )}
    </div>
  );
}

function pctToXY(cx: number, cy: number, r: number, pct: number) {
  const rad = (pct / 100) * 2 * Math.PI - Math.PI / 2;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function SalaryDonutChart({ data, total, totalAmt, size = 128 }: {
  data: PortfolioSlice[];
  total: string;
  totalAmt: number;
  size?: number;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const cx = 64, cy = 64, outerR = 56, innerR = 36, midR = (outerR + innerR) / 2;

  let cum = 0;
  const segments = data.map((d) => {
    const start = cum;
    cum += d.pct;
    const o1 = pctToXY(cx, cy, outerR, start);
    const o2 = pctToXY(cx, cy, outerR, cum);
    const i2 = pctToXY(cx, cy, innerR, cum);
    const i1 = pctToXY(cx, cy, innerR, start);
    const large = d.pct > 50 ? 1 : 0;
    const path = `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y} L ${i2.x} ${i2.y} A ${innerR} ${innerR} 0 ${large} 0 ${i1.x} ${i1.y} Z`;
    const labelPos = pctToXY(cx, cy, midR, start + d.pct / 2);
    return { path, labelPos };
  });

  const active = activeIdx !== null ? data[activeIdx] : null;
  const fmtAmt = (n: number) => `${Math.round(n / 10000)}만`;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 128 128">
        {segments.map((seg, i) => (
          <path
            key={i}
            d={seg.path}
            fill={data[i].color}
            opacity={activeIdx === null || activeIdx === i ? 1 : 0.25}
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
            style={{ cursor: 'default', transition: 'opacity 0.15s' }}
          />
        ))}
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none', width: size * 0.6,
      }}>
        {active ? (
          <>
            <div style={{ fontSize: size < 100 ? 8 : 9, fontWeight: 700, color: active.color, lineHeight: 1.4 }}>{active.label} {active.pct}%</div>
            <div style={{ fontSize: size < 100 ? 10 : 12, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{fmtAmt(totalAmt * active.pct / 100)}</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: size < 100 ? 8 : 9, color: '#94a3b8', lineHeight: 1.4 }}>급여</div>
            <div style={{ fontSize: size < 100 ? 10 : 12, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{total}</div>
          </>
        )}
      </div>
    </div>
  );
}
