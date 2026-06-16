import { useState } from 'react';
import WooriSplash from './WooriSplash';

interface Props {
  stockName: string;   // 종목명 (예: SamsungElec)
  shares: string;      // 적립/매수 주수 (예: 0.14주)
  price?: number;      // 현재가 (선택)
  onDone: () => void;  // 매수성공 화면 "확인" 시
}

const fmt = (n: number) => n.toLocaleString('ko-KR');

export default function WooriBuyJourney({ stockName, shares, price, onDone }: Props) {
  const [phase, setPhase] = useState<'loading' | 'success'>('loading');

  // ── 로딩 스플래시 (우리투자증권 앱 진입 연출) ──
  if (phase === 'loading') {
    return <WooriSplash onDone={() => setPhase('success')} />;
  }

  // ── 매수성공 화면 ──
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(15,23,42,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'wbjFade 0.2s ease-out',
    }}>
      <style>{`
        @keyframes wbjFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wbjPop { 0% { transform: scale(0.6); opacity: 0; } 55% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes wbjCheck { 0% { stroke-dashoffset: 48; } 100% { stroke-dashoffset: 0; } }
      `}</style>

      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 330,
        padding: '32px 24px 24px', textAlign: 'center',
        boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
      }}>
        {/* 체크 배지 */}
        <div style={{
          width: 76, height: 76, borderRadius: '50%', margin: '0 auto 18px',
          background: 'linear-gradient(135deg, #2563EB, #173F9E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 22px rgba(37,99,235,0.4)',
          animation: 'wbjPop 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5l4.5 4.5L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: 48, strokeDashoffset: 0, animation: 'wbjCheck 0.45s 0.2s ease-out both' }} />
          </svg>
        </div>

        <p style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#0F172A', fontFamily: "'Wooridaum', sans-serif" }}>
          매수 완료!
        </p>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
          우리투자증권 계좌에<br />주식이 정상 매수되었어요
        </p>

        {/* 매수 내역 카드 */}
        <div style={{
          background: '#F4F8FF', border: '1px solid #DBEAFE', borderRadius: 16,
          padding: '16px 18px', marginBottom: 20,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>종목</span>
            <span style={{ fontSize: 14, color: '#0F172A', fontWeight: 800 }}>{stockName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>매수 수량</span>
            <span style={{ fontSize: 14, color: '#1E40AF', fontWeight: 800 }}>{shares}</span>
          </div>
          {price != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>체결가</span>
              <span style={{ fontSize: 14, color: '#0F172A', fontWeight: 800 }}>{fmt(price)}원</span>
            </div>
          )}
        </div>

        <button
          onClick={onDone}
          style={{
            width: '100%', padding: '15px 0', fontSize: 15, fontWeight: 700,
            background: '#004EA2', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,78,162,0.28)',
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
}
