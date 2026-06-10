// 월급 가이드 위젯 — 월급 분배 도넛 + 상위 2개 범례
import { SalaryDonutChart } from './charts';
import { fmtManwon, type PortfolioSlice } from './shared';

export default function SalaryGuideWidget({ income, slices, active, onClick }: {
  income: number;
  slices: PortfolioSlice[];
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${active ? '#0095DB' : '#E0F2FE'}`,
        borderRadius: 22,
        padding: '16px',
        boxShadow: '0 2px 12px rgba(0,149,219,0.06)',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 180,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* 상단 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>월급</span>
      </div>

      {/* 중앙 SalaryDonutChart */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <SalaryDonutChart
          data={slices}
          total={fmtManwon(income)}
          totalAmt={income}
          size={130}
        />
      </div>

      {/* 우측 하단 화살표 */}
      {onClick && (
        <span style={{ position: 'absolute', bottom: 12, right: 16, fontSize: 14, color: '#94a3b8', fontWeight: 700 }}>›</span>
      )}
    </div>
  );
}
