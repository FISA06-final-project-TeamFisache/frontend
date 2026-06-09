// 소비 위젯 — 세로 연료게이지로 예산 잔여 비율 표시 (+ 펼침 상세)
import { fmtManwon, type ConsumptionView, type SpendingItem } from './shared';
import { DonutChart } from './charts';

export function ConsumptionWidget({ view, active, onClick }: {
  view: ConsumptionView;
  active: boolean;
  onClick: () => void;
}) {
  const { totalExpense, remainingPercent, fillColor, isBudgetExceeded } = view;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${active ? '#0095DB' : '#E0F2FE'}`,
        borderRadius: 22,
        padding: '16px',
        boxShadow: '0 2px 12px rgba(0,149,219,0.06)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 180,
        boxSizing: 'border-box',
      }}
    >
      {/* 상단 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>소비</span>
        {isBudgetExceeded && (
          <span style={{ fontSize: 9, fontWeight: 700, background: '#FCEBEB', color: '#EF4444', padding: '2px 6px', borderRadius: 99 }}>초과</span>
        )}
      </div>

      {/* 중앙 세로 배터리 게이지 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '8px 0' }}>
        {(() => {
          const pct = Math.max(0, Math.min(100, remainingPercent));
          const isLow = pct <= 15;   // 거의 다 씀 → 저전력 연출
          const frameColor = isLow ? '#EF4444' : '#CBD5E1';
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <style>{`@keyframes battPulse { 0%,100%{opacity:.5;transform:scale(.85)} 50%{opacity:1;transform:scale(1.12)} }`}</style>
              {/* 배터리 단자 */}
              <div style={{ width: 11, height: 3, background: frameColor, borderRadius: '2px 2px 0 0', transition: 'background 0.3s' }} />
              {/* 배터리 본체 */}
              <div style={{
                width: 28, height: 58,
                background: '#F8FAFC',
                border: `2px solid ${frameColor}`,
                borderRadius: 7,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isLow ? '0 0 8px rgba(239,68,68,0.35)' : 'none',
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}>
                {/* 채워진 잔량 */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: `${pct}%`,
                  background: fillColor,
                  transition: 'height 0.4s ease, background 0.3s',
                }} />
                {/* 배터리 칸(셀) 구분선 */}
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 12px, rgba(255,255,255,0.55) 12px 14px)',
                }} />
                {/* 저전력일 때 ⚡ (0%여도 허전하지 않게) */}
                {isLow && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, animation: 'battPulse 1.2s ease-in-out infinite' }}>
                    ⚡
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        <div>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: fillColor, lineHeight: 1.2 }}>
            {remainingPercent}%
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>남음</p>
        </div>
      </div>

      {/* 하단 총지출액 */}
      <div>
        <p style={{ margin: 0, fontSize: 10, color: '#64748b' }}>지출액</p>
        <p style={{ margin: '1px 0 0', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
          {fmtManwon(totalExpense)}
        </p>
      </div>
    </div>
  );
}

export function ConsumptionDetail({ spendingItems }: {
  spendingItems: SpendingItem[];
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E0F2FE',
      borderRadius: 22,
      padding: '16px',
      boxShadow: '0 2px 12px rgba(0,149,219,0.06)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', margin: 0 }}>지출 카테고리 비율</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <DonutChart data={spendingItems} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, minWidth: 0 }}>
          {spendingItems.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#64748b', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', flexShrink: 0 }}>{s.amount.toLocaleString()}원</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
