import { useEffect } from 'react';

interface Props {
  caption?: string;     // 하단 로딩 문구 (기본: 업데이트 확인중...)
  duration?: number;    // 표시 시간(ms), 기본 2400
  onDone: () => void;   // duration 경과 후 호출
}

// ── WON 스플래시 로고 ─────────────────────────────────────────
function WonMark() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: 132, height: 84 }}>
        <div style={{
          position: 'absolute', left: 6, top: 8, width: 70, height: 70, borderRadius: '50%',
          background: 'linear-gradient(135deg, #BFE3FF, #E5F1FF)',
        }} />
        <div style={{
          position: 'absolute', right: 6, top: 8, width: 70, height: 70, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #2563EB, #173F9E)',
        }} />
        <span style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, fontWeight: 900, letterSpacing: -1, color: '#1E40AF',
          fontFamily: "'Wooridaum', sans-serif", paddingLeft: 6,
        }}>WON</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#1E40AF', letterSpacing: 2, fontFamily: "'Wooridaum', sans-serif" }}>WON</p>
        <p style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 800, color: '#475569', fontFamily: "'Wooridaum', sans-serif" }}>우리투자증권</p>
      </div>
    </div>
  );
}

export default function WooriSplash({ caption = '업데이트 확인중...', duration = 2400, onDone }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [duration, onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F8FF 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'wbjFade 0.25s ease-out',
    }}>
      <style>{`
        @keyframes wbjFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wbjPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.04); opacity: 0.85; } }
      `}</style>

      <div style={{ animation: 'wbjPulse 1.4s ease-in-out infinite' }}>
        <WonMark />
      </div>

      <p style={{ position: 'absolute', bottom: 140, margin: 0, fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>
        {caption}
      </p>
      <p style={{
        position: 'absolute', bottom: 48, margin: 0,
        fontSize: 15, color: '#CBD5E1', fontWeight: 700, letterSpacing: 1,
        fontFamily: "'Wooridaum', sans-serif",
      }}>
        우리투자증권
      </p>
    </div>
  );
}
