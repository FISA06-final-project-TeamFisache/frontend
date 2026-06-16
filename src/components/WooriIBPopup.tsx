import wooriibLogo from '../assets/banks/wooriib.svg';

const WOORI_IB_URL = 'https://m.wooriib.com';

interface Props {
  title: string;
  message: string;
  ctaLabel?: string;
  dismissLabel?: string;
  onClose: () => void;
  onNavigate?: () => void;   // 제공되면 외부 링크 대신 이 콜백 실행 (UX 연출용)
}

export default function WooriIBPopup({ title, message, ctaLabel = '우리투자증권으로 이동', dismissLabel = '나중에', onClose, onNavigate }: Props) {
  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
      return;
    }
    window.open(WOORI_IB_URL, '_blank');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(15,23,42,0.5)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <style>{`
        @keyframes slideUpWoori { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: 390,
          padding: '24px 20px 40px',
          animation: 'slideUpWoori 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* 핸들 */}
        <div style={{ width: 36, height: 4, background: '#e2e8f0', borderRadius: 99, margin: '0 auto 22px' }} />

        {/* 로고 + 제목 + 메시지 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: '#f0f6ff', border: '1px solid #dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12,
          }}>
            <img src={wooriibLogo} alt="우리투자증권" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 8px', fontFamily: "'Wooridaum', sans-serif" }}>{title}</p>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.65 }}>{message}</p>
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleNavigate}
            style={{
              width: '100%', padding: '15px 0', fontSize: 15, fontWeight: 700,
              background: '#004EA2', color: '#fff',
              border: 'none', borderRadius: 14, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,78,162,0.28)',
            }}
          >
            {ctaLabel}
          </button>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '13px 0', fontSize: 14, fontWeight: 600,
              background: '#f1f5f9', color: '#64748b',
              border: 'none', borderRadius: 14, cursor: 'pointer',
            }}
          >
            {dismissLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
