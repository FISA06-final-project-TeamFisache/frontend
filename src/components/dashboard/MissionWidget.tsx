// 미니챌린지 위젯 — AI 추천 챌린지 표시 + 난이도/주제 조정 + 시작
import type { ChallengeProposal } from '../../api/challengeApi';
import { getChallengeIcon } from '../../api/challengeApi';

const THREE_COLOR_BAR_BG = 'linear-gradient(to right, #10B981 33%, #FBBF24 33% 66%, #EF4444 66%)';

const fmt = (n: number) => n.toLocaleString('ko-KR');

interface Props {
  proposal: ChallengeProposal | null;  // AI 제안 (null = 로딩 중)
  loading: boolean;
  adjusting: boolean;                   // 조정 API 호출 중
  progress: number;                     // 0 = 미시작, >0 = 진행중
  onStart: () => void;
  onEasier: () => void;
  onHarder: () => void;
  onChangeTopic: () => void;
}

export default function MissionWidget({ proposal, loading, adjusting, progress, onStart, onEasier, onHarder, onChangeTopic }: Props) {
  const isProgressing = progress > 0;
  const isBusy = loading || adjusting;
  const icon = proposal ? getChallengeIcon(proposal) : '💡';

  // ── 진행중 ───────────────────────────────────────────────────
  if (isProgressing && proposal) {
    return (
      <div style={{
        background: '#FFFFFF', border: '1px solid #E0F2FE', borderRadius: 22,
        padding: '16px', boxShadow: '0 2px 12px rgba(0,149,219,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>미니챌린지</span>
          <div style={{ background: '#FFD700', borderRadius: 8, padding: '3px 8px' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#713F12' }}>
              🏆 성공 시 {proposal.tickerName} {fmt(Math.round(proposal.estimatedSaving / 78500 * 100) / 100)}주
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
          <span style={{ fontSize: 24 }}>{icon}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{proposal.title}</span>
        </div>

        {/* 삼색 진행바 + 🟡 이모지 */}
        <div style={{ position: 'relative', height: 10, background: THREE_COLOR_BAR_BG, borderRadius: 99, margin: '8px 0 4px' }}>
          <div style={{
            position: 'absolute',
            left: `${Math.min(100, progress)}%`,
            top: '50%',
            transform: 'translate(-50%, -75%)',
            fontSize: 18, lineHeight: 1, pointerEvents: 'none',
            filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.2))',
            transition: 'left 0.3s ease',
          }}>🟡</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>0%</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0095DB' }}>
            벌써 미션에 {progress}%나 도달했어요...
          </span>
          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>100%</span>
        </div>
      </div>
    );
  }

  // ── 로딩 중 ───────────────────────────────────────────────────
  if (isBusy || !proposal) {
    return (
      <div style={{
        background: '#FFFFFF', border: '1px solid #E0F2FE', borderRadius: 22,
        padding: '16px', boxShadow: '0 2px 12px rgba(0,149,219,0.06)',
        display: 'flex', alignItems: 'center', gap: 12, minHeight: 80,
      }}>
        <img src="/src/assets/missionpori.png" alt="Pori" style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '0 0 4px' }}>미니챌린지 정하는 중...</p>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: '#0095DB',
                animation: `dot 1.2s ${i * 0.2}s ease-in-out infinite`,
              }} />
            ))}
          </div>
        </div>
        <style>{`@keyframes dot { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }`}</style>
      </div>
    );
  }

  // ── 미시작: AI 제안 표시 ──────────────────────────────────────
  const savingsLabel = `${proposal.tickerName} ~${fmt(proposal.estimatedSaving)}원 절약`;

  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E0F2FE', borderRadius: 22,
      padding: '16px', boxShadow: '0 2px 12px rgba(0,149,219,0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>⚓ 이번주 추천 미션</span>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Pori의 추천</span>
      </div>

      {/* AI 제안 카드 */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        background: '#F0F9FF', padding: '10px 12px', borderRadius: 12, marginTop: 10,
      }}>
        <img src="/src/assets/missionpori.png" alt="Pori" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            {icon} {proposal.title}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 11, color: '#475569', fontWeight: 500, lineHeight: 1.5 }}>
            {proposal.description}
          </p>
        </div>
      </div>

      {/* 삼색 바 + 끝에 목표 금액 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <div style={{ flex: 1, height: 10, background: THREE_COLOR_BAR_BG, borderRadius: 99 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', whiteSpace: 'nowrap' }}>
          목표 {fmt(proposal.target)}원
        </span>
      </div>

      {/* 보상 + 변경 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <div style={{ background: '#FFD700', borderRadius: 8, padding: '4px 10px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#713F12' }}>🏆 {savingsLabel}</span>
        </div>
        <button
          onClick={onChangeTopic}
          disabled={adjusting}
          style={{
            border: 'none', background: '#F1F5F9', borderRadius: 8, padding: '5px 10px',
            fontSize: 10, color: '#475569', fontWeight: 600, cursor: 'pointer', opacity: adjusting ? 0.5 : 1,
          }}
        >
          🔄 다른 미션
        </button>
      </div>

      {/* [쉽게 ▲] [▶ 시작] [어렵게 ▼] */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          onClick={onEasier}
          disabled={adjusting}
          style={{
            flex: 1, padding: '10px 0', border: '1px solid #E0F2FE', background: '#FFFFFF',
            borderRadius: 12, fontSize: 11, fontWeight: 700, color: '#64748b',
            cursor: 'pointer', opacity: adjusting ? 0.5 : 1,
          }}
        >
          쉽게
        </button>
        <button
          onClick={onStart}
          disabled={adjusting}
          style={{
            flex: 2, padding: '10px 0', border: 'none',
            background: adjusting ? '#CBD5E1' : 'linear-gradient(135deg, #0095DB, #00BFFF)',
            borderRadius: 12, fontSize: 12, fontWeight: 800, color: '#FFFFFF',
            cursor: adjusting ? 'not-allowed' : 'pointer',
            boxShadow: adjusting ? 'none' : '0 2px 10px rgba(0,149,219,0.2)',
          }}
        >
          ▶ 시작
        </button>
        <button
          onClick={onHarder}
          disabled={adjusting}
          style={{
            flex: 1, padding: '10px 0', border: '1px solid #E0F2FE', background: '#FFFFFF',
            borderRadius: 12, fontSize: 11, fontWeight: 700, color: '#64748b',
            cursor: 'pointer', opacity: adjusting ? 0.5 : 1,
          }}
        >
          어렵게
        </button>
      </div>
    </div>
  );
}
