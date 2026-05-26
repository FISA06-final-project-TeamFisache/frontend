import { useState, type CSSProperties, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


interface Goal {
  id: number;
  icon: string;
  label: string;
  target: string;
  progress: number;
  dday: number;
  color: { bg: string; bar: string; text: string; badge: string; badgeText: string };
}

interface SpendingItem { label: string; pct: number; color: string; anomaly?: boolean; opacity?: number; }
interface SpendingDetail { category: string; amount: string; sub: string; alert?: boolean; }
interface PopularProduct { rank: number; name: string; sub: string; pct: number; }
interface PortfolioSlice { label: string; pct: number; color: string; rate?: string; }
interface PortfolioDetail { category: string; pct: number; color: string; rate?: string; items: { name: string; pct: number; rate?: string }[]; }
interface NotiItem { id: string; icon: string; iconBg: string; title: string; body: string; time: string; read: boolean; }

const GOALS: Goal[] = [
  { id: 1, icon: '✈', label: '제주 여행', target: '50만 원', progress: 67, dday: 45, color: { bg: '#EEEDFE', bar: '#7F77DD', text: '#534AB7', badge: '#EEEDFE', badgeText: '#534AB7' } },
];

const SPENDING: SpendingItem[] = [
  { label: '식비',       pct: 42, color: '#D85A30' },
  { label: '문화/여가',  pct: 18, color: '#D85A30', opacity: 0.7 },
  { label: '온라인쇼핑', pct: 21, color: '#A32D2D', anomaly: true },
  { label: '교통',       pct: 8,  color: '#D85A30', opacity: 0.5 },
  { label: '기타',       pct: 11, color: '#D85A30', opacity: 0.35 },
];

const SPENDING_DETAILS: SpendingDetail[] = [
  { category: '식비',       amount: '1,029,000원', sub: '배달의민족 외 24건' },
  { category: '온라인쇼핑', amount: '514,500원',   sub: '쿠팡 외 12건', alert: true },
  { category: '문화/여가',  amount: '441,000원',   sub: 'CGV 외 5건' },
  { category: '기타',       amount: '269,500원',   sub: '편의점 외 18건' },
  { category: '교통',       amount: '196,000원',   sub: '티머니 외 1건' },
];

const POPULAR_PRODUCTS: PopularProduct[] = [
  { rank: 1, name: 'TIGER 미국S&P500',  sub: 'ETF · 가입률 68%',  pct: 68 },
  { rank: 2, name: '우리은행 정기적금', sub: '적금 · 가입률 54%', pct: 54 },
  { rank: 3, name: '토스뱅크 파킹통장', sub: '파킹 · 가입률 47%', pct: 47 },
];

const PORTFOLIO: PortfolioSlice[] = [
  { label: 'ETF',    pct: 40, color: '#1D9E75', rate: '+4%' },
  { label: '현금성', pct: 35, color: '#5DCAA5', rate: '+2%' },
  { label: '적금',   pct: 15, color: '#9FE1CB' },
  { label: 'IRP',    pct: 10, color: '#085041' },
];

const PORTFOLIO_DETAILS: PortfolioDetail[] = [
  { category: 'ETF',    pct: 40, color: '#1D9E75', rate: '+4%', items: [{ name: 'TIGER 미국S&P500', pct: 25, rate: '+4%' }, { name: 'KODEX 나스닥100', pct: 15, rate: '-' }] },
  { category: '현금성', pct: 35, color: '#5DCAA5', rate: '+2%', items: [{ name: '토스뱅크 파킹통장', pct: 20, rate: '+2%' }, { name: '신한은행 입출금', pct: 15, rate: '+2%' }] },
  { category: '적금',   pct: 15, color: '#9FE1CB',              items: [{ name: '우리 Super 정기적금', pct: 15, rate: '-' }] },
  { category: 'IRP',    pct: 10, color: '#085041',              items: [{ name: '미래에셋 퇴직연금', pct: 10, rate: '-' }] },
];


const DONUT_R = 28;
const CIRC = 2 * Math.PI * DONUT_R;

function DonutChart({ data }: { data: PortfolioSlice[] }) {
  let offset = 0;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
      {data.map((d, i) => {
        const dash = (d.pct / 100) * CIRC;
        const el = (
          <circle key={i} cx="40" cy="40" r={DONUT_R} fill="none" stroke={d.color} strokeWidth="14" strokeDasharray={`${dash} ${CIRC - dash}`} strokeDashoffset={-offset} />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

function SectionHeader({ icon, title, right }: { icon: string; title: string; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 0 0 2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 17, lineHeight: 1 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{title}</span>
      </div>
      {right}
    </div>
  );
}

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 14, padding: '14px 14px 12px', ...style }}>
      {children}
    </div>
  );
}

function Pill({ children, bg, color }: { children: ReactNode; bg: string; color: string }) {
  return <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 99, background: bg, color }}>{children}</span>;
}

function SmallBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} style={{ border: '0.5px solid #e2e8f0', background: 'none', borderRadius: 8, padding: '4px 9px', fontSize: 11, fontWeight: 500, color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}>
      {children}
    </button>
  );
}

// ─── 알림 패널 ───

// ─── 내 계좌 연결 관리 ────────────────────────────

interface LinkedAccount {
  id: string;
  name: string;
  number: string;
  type: '입출금' | '예·적금' | '증권' | '카드';
  balance: number;
}

interface LinkedBank {
  id: string;
  name: string;
  short: string;
  badgeBg: string;
  badgeColor: string;
  accounts: LinkedAccount[];
}

// TODO: 백엔드 연동 시 fetch로 교체
const LINKED_BANKS_MOCK: LinkedBank[] = [
  {
    id: 'woori', name: '우리은행', short: '우리', badgeBg: '#DBEAFE', badgeColor: '#1E40AF',
    accounts: [
      { id: 'woori-1', name: 'WON 우월한 월급 통장', number: '1002-***-345678', type: '입출금', balance: 3_850_000 },
      { id: 'woori-2', name: 'WON 적금',             number: '1002-***-998877', type: '예·적금', balance: 12_000_000 },
    ],
  },
  {
    id: 'kakao', name: '카카오뱅크', short: '카카', badgeBg: '#FEF3C7', badgeColor: '#854D0E',
    accounts: [
      { id: 'kakao-1', name: '입출금통장', number: '3333-01-****567', type: '입출금', balance: 1_500_000 },
      { id: 'kakao-2', name: '26주 적금',   number: '3333-04-****092', type: '예·적금', balance: 2_400_000 },
    ],
  },
  {
    id: 'toss', name: '토스뱅크', short: '토스', badgeBg: '#DBEAFE', badgeColor: '#1D4ED8',
    accounts: [
      { id: 'toss-1', name: '파킹통장',      number: '1000-12-****345', type: '입출금', balance: 2_300_000 },
      { id: 'toss-2', name: '나눠모으기',     number: '1000-24-****221', type: '입출금', balance: 500_000   },
      { id: 'toss-3', name: '토스증권 계좌', number: '5601-01-****234', type: '증권',   balance: 4_120_000 },
    ],
  },
  {
    id: 'shinhan', name: '신한은행', short: '신한', badgeBg: '#DBEAFE', badgeColor: '#1E40AF',
    accounts: [
      { id: 'shinhan-1', name: 'Tops 직장인 플랜 통장', number: '110-***-456789', type: '입출금',   balance: 3_200_000 },
    ],
  },
];

function AccountManagePanel({ onClose }: { onClose: () => void }) {
  const [banks, setBanks] = useState<LinkedBank[]>(LINKED_BANKS_MOCK);
  const [expandedBanks, setExpandedBanks] = useState<Record<string, boolean>>({});

  const toggleBank = (id: string) =>
    setExpandedBanks(prev => ({ ...prev, [id]: !prev[id] }));

  const totalAccounts = banks.reduce((sum, b) => sum + b.accounts.length, 0);

  const removeAccount = (bankId: string, accountId: string) => {
    setBanks(prev => prev
      .map(b => b.id === bankId ? { ...b, accounts: b.accounts.filter(a => a.id !== accountId) } : b)
      .filter(b => b.accounts.length > 0));
  };

  return (
    <div style={{
      background: '#fff', borderRadius: '20px 20px 0 0',
      maxWidth: 375, width: '100%', maxHeight: '85vh',
      overflowY: 'auto',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {/* 헤더 */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔗</span>
          <span style={{ fontSize: 17, fontWeight: 500, color: '#0f172a' }}>내 계좌 연결 관리</span>
          <span style={{ fontSize: 11, fontWeight: 500, background: '#E6F1FB', color: '#185FA5', padding: '1px 7px', borderRadius: 99 }}>
            {banks.length}개 기관 · {totalAccounts}개 계좌
          </span>
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="닫기">✕</button>
      </div>

      {/* 은행 아코디언 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 12px 8px' }}>
        {banks.map(bank => {
          const expanded = !!expandedBanks[bank.id];
          return (
            <div key={bank.id} style={{ border: '0.5px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
              {/* 은행 헤더 */}
              <button
                onClick={() => toggleBank(bank.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: bank.badgeBg, color: bank.badgeColor, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {bank.short}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{bank.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{bank.accounts.length}개 계좌 연결</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* 계좌 목록 */}
              {expanded && (
                <div style={{ borderTop: '0.5px solid #f1f5f9', background: '#f8fafc' }}>
                  {bank.accounts.map(acc => (
                    <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px 10px 60px', borderBottom: '0.5px solid #f1f5f9' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, background: '#fff', color: '#475569', padding: '1px 6px', borderRadius: 99, border: '0.5px solid #e2e8f0' }}>{acc.type}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{acc.name}</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{acc.number}</div>
                        <div style={{ fontSize: 11, color: '#0f172a', marginTop: 2, fontWeight: 600 }}>{acc.balance.toLocaleString()}원</div>
                      </div>
                      <button
                        onClick={() => removeAccount(bank.id, acc.id)}
                        style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', background: '#fff', border: '0.5px solid #fecaca', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', flexShrink: 0 }}
                      >
                        해제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {banks.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            연결된 계좌가 없어요.<br />아래 버튼으로 새 기관을 연동해보세요.
          </div>
        )}
      </div>

      {/* 푸터: 추가 연동 */}
      <div style={{ padding: '12px 16px 20px', borderTop: '0.5px solid #e2e8f0' }}>
        <button
          onClick={() => { onClose(); /* 라우터 이동은 부모에서 처리 */ }}
          style={{ width: '100%', padding: '12px 0', fontSize: 13, fontWeight: 700, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}
        >
          + 새 기관 연동하기
        </button>
      </div>
    </div>
  );
}

// ─── 설정 패널 ─────────────────────────────────────

interface SettingsItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
  to: string;
}

const SETTINGS_ITEMS: SettingsItem[] = [
  { id: 'salary-split', icon: '💰', title: '월급 나눈 비율 재설정', desc: '각 계좌별 분배 비율을 다시 정해요',         to: '/asset-prescription' },
  { id: 'portfolio',    icon: '📊', title: '포트폴리오 재설정',     desc: '흐름·상품 구성을 처음부터 다시 짜요',     to: '/asset-portfolio' },
];

function SettingsPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate: (to: string) => void }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '20px 20px 0 0',
      maxWidth: 375, width: '100%', maxHeight: '85vh',
      overflowY: 'auto',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {/* 헤더 */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>⚙️</span>
          <span style={{ fontSize: 17, fontWeight: 500, color: '#0f172a' }}>설정</span>
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="닫기">✕</button>
      </div>

      {/* 항목 리스트 */}
      <div style={{ padding: '12px 12px 8px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', padding: '4px 6px 8px' }}>자산 관리 재설정</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SETTINGS_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.to)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px', background: '#fff', border: '0.5px solid #e2e8f0',
                borderRadius: 14, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.desc}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationPanel({ onClose, items, setItems }: { onClose: () => void; items: NotiItem[]; setItems: Dispatch<SetStateAction<NotiItem[]>> }) {
  const markRead = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAll = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const unreadCount = items.filter(n => !n.read).length;

  return (
    <div style={{
      background: '#fff', borderRadius: '20px 20px 0 0',
      display: 'flex', flexDirection: 'column',
      maxWidth: 375, width: '100%', maxHeight: '85vh',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔔</span>
          <span style={{ fontSize: 17, fontWeight: 500, color: '#0f172a' }}>알림</span>
          {unreadCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 500, background: '#E6F1FB', color: '#185FA5', padding: '1px 7px', borderRadius: 99 }}>{unreadCount}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {unreadCount > 0 && (
            <button onClick={markAll} style={{ fontSize: 12, fontWeight: 500, color: '#64748b', border: 'none', background: 'none', cursor: 'pointer' }}>모두 읽음</button>
          )}
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="닫기">✕</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '8px 12px 20px', overflowY: 'auto' }}>
        {items.map(n => (
          <div key={n.id} onClick={() => markRead(n.id)}
            style={{
              background: '#fff', border: '0.5px solid #f1f5f9', borderRadius: 14, padding: 14,
              display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
              opacity: n.read ? 0.5 : 1, transition: 'opacity .15s',
            }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: n.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
              {n.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: n.read ? 400 : 600, color: n.read ? '#64748b' : '#0f172a', margin: '0 0 4px', lineHeight: 1.35 }}>{n.title}</p>
              <p style={{ fontSize: 12, color: n.read ? '#94a3b8' : '#64748b', margin: 0, lineHeight: 1.55 }}>{n.body}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>{n.time}</span>
              {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#378ADD', display: 'block' }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 메인 대시보드 ───

export default function Dashboard() {
  const { userName: USER_NAME } = useAuth();
  const navigate = useNavigate();

  // ── 알림 데이터 ──────────────────────────────────────────
  const NOTIFICATIONS: NotiItem[] = [
    { id: 'n1', icon: '💳', iconBg: '#E6F1FB', title: '월급이 들어왔네요!', body: '새로 나눴어요! 확인하고 자동이체할게요.', time: '방금 전', read: false },
    { id: 'n2', icon: '📉', iconBg: '#FCEBEB', title: '밸런싱 붕괴 조짐이 보여요', body: '이번 달 소비 속도가 빠르게 올라가고 있어요...', time: '2시간 전', read: false },
    { id: 'n3', icon: '📋', iconBg: '#E1F5EE', title: '2026년 5월 월간 리포트가 도착했어요!', body: `${USER_NAME}님만을 위한 5월 종합 리포트...`, time: '1일 전', read: false },
    { id: 'n4', icon: '🎵', iconBg: '#EEEDFE', title: '이번 달 관심받고 있는 공연 소식이에요!', body: `${USER_NAME}님의 취향을 기반으로...`, time: '1일 전', read: false },
    { id: 'n5', icon: '🏦', iconBg: '#E1F5EE', title: `${USER_NAME}님만을 위한 정부 정책을 가져왔어요`, body: '자격증 지원금을 신청해보세요! 최대 50만 원을 돌려받을 수 있어요.', time: '2일 전', read: true },
  ];

  // ── UI 상태 ──────────────────────────────────────────────
  const [bannerVisible,       setBannerVisible]       = useState(true);
  const [goalInputOpen,       setGoalInputOpen]       = useState(false);
  const [anomalyOpen,         setAnomalyOpen]         = useState(false);
  const [recapOpen,           setRecapOpen]           = useState(false);
  const [portfolioDetailOpen, setPortfolioDetailOpen] = useState(false);
  const [goalText,            setGoalText]            = useState('');
  const [notiOpen,            setNotiOpen]            = useState(false);
  const [notiItems,           setNotiItems]           = useState<NotiItem[]>(NOTIFICATIONS);
  const [accountMgmtOpen,     setAccountMgmtOpen]     = useState(false);
  const [settingsOpen,        setSettingsOpen]        = useState(false);
  const [sidebarOpen,         setSidebarOpen]         = useState(false);
  const [assetTooltip,        setAssetTooltip]        = useState(false);
  const [goalOpen,            setGoalOpen]            = useState(false);
  const [peerTab,             setPeerTab]             = useState<'asset' | 'product'>('asset');

  const unreadCount = notiItems.filter(n => !n.read).length;

  return (
    <div style={{
      fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
      background: '#f8fafc',
      minHeight: '100vh',
      paddingBottom: 48,
      position: 'relative',
      overflowX: 'hidden',
    }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={{ maxWidth: 375, margin: '0 auto' }}>
        <div style={{ height: 8 }} />

        {/* 월급 알림 배너 */}
        {bannerVisible && (
          <div style={{ padding: '0 16px', marginBottom: 10 }}>
            <div style={{ background: '#FAEEDA', border: '0.5px solid #EF9F27', borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>🔔</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#854F0B' }}>
                      월급이 들어왔어요
                    </span>
                    <span style={{ fontSize: 10, color: '#BA7517' }}>방금 전</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#633806', margin: '0 0 10px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    Pori가 자동으로 이번 달 분배 계획을 세웠어요.{'\n'}확인하고 자동이체를 시작해볼까요?
                  </p>
                  <button style={{ fontSize: 12, fontWeight: 500, padding: '6px 12px', background: '#854F0B', color: '#FAEEDA', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                    분배 계획 확인하기 →
                  </button>
                </div>
                <button onClick={() => setBannerVisible(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#BA7517', fontSize: 18, lineHeight: 1, padding: '0 0 0 8px', flexShrink: 0 }} aria-label="닫기">✕</button>
              </div>
            </div>
          </div>
        )}

        {/* 헤더 */}
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center' }} aria-label="메뉴">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6"  x2="21" y2="6"  />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#534AB7' }}>
                {USER_NAME.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>좋은 아침이에요</p>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#0f172a', margin: 0 }}>{USER_NAME} 님</p>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <button onClick={() => setNotiOpen(true)} style={{ border: '0.5px solid #e2e8f0', background: '#fff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="알림">
                🔔
              </button>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, background: '#E24B4A', borderRadius: '50%', border: '1.5px solid #f8fafc' }} />
              )}
            </div>
          </div>

          <div style={{ background: '#f1f5f9', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px' }}>총 자산</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 26, fontWeight: 500, color: '#0f172a' }}>3,245만 원</span>
              <span style={{ fontSize: 12, color: '#3B6D11' }}>+2.4%</span>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <button
                  onClick={() => setAssetTooltip(v => !v)}
                  style={{ width: 15, height: 15, borderRadius: '50%', background: '#e2e8f0', border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}
                  aria-label="증감률 설명"
                >?</button>
                {assetTooltip && (
                  <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#f1f5f9', fontSize: 10, lineHeight: 1.5, padding: '8px 10px', borderRadius: 8, width: 180, zIndex: 10, whiteSpace: 'normal' }}>
                    지난달 대비 총 자산 증감률이에요. 마이데이터 기반 전월 스냅샷과 비교해요.
                    <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '5px 5px 0', borderStyle: 'solid', borderColor: '#1e293b transparent transparent' }} />
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 7 }}>
              {[{ label: '투자 자산', value: '1,980만 원' }, { label: '현금성 자산', value: '1,265만 원' }].map(item => (
                <div key={item.label} style={{ background: '#fff', borderRadius: 8, padding: '8px 10px' }}>
                  <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 1. 월급 */}
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <SectionHeader icon="💸" title="월급" right={<span style={{ fontSize: 11, color: '#64748b' }}>다음 월급 D-14</span>} />
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>이번 달 분배 현황</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#0f172a' }}>320만 원</span>
            </div>
            <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', gap: 1, marginBottom: 8 }}>
              {[
                { pct: 45, barBg: '#BFDBFE', barBorder: '#93C5FD' },
                { pct: 20, barBg: '#BBF7D0', barBorder: '#86EFAC' },
                { pct: 15, barBg: '#FDE68A', barBorder: '#FCD34D' },
              ].map((d, i) => (
                <div key={i} style={{ width: `${d.pct}%`, background: d.barBg, borderLeft: `2px solid ${d.barBorder}` }} />
              ))}
              <div style={{ flex: 1, background: '#f1f5f9' }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              <Pill bg="#DBEAFE" color="#1D4ED8">생활비 45%</Pill>
              <Pill bg="#DCFCE7" color="#15803D">투자 20%</Pill>
              <Pill bg="#FEF9C3" color="#A16207">저축 15%</Pill>
            </div>
          </Card>
        </div>

        {/* 2+3. 소비 + 목표 나란히 */}
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: recapOpen || goalOpen ? 8 : 0 }}>

            {/* 소비 박스 */}
            <div
              onClick={() => setRecapOpen(v => !v)}
              style={{ background: '#fff', border: `0.5px solid ${recapOpen ? '#378ADD' : '#e2e8f0'}`, borderRadius: 14, padding: '12px 12px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>🧾 소비</span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{recapOpen ? '↑' : '↓'}</span>
              </div>
              <p style={{ fontSize: 9, color: '#64748b', margin: '0 0 2px' }}>5월 총 지출</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>245만 원</p>
              <Pill bg="#FCEBEB" color="#A32D2D">예산 초과 +8%</Pill>
            </div>

            {/* 목표 박스 */}
            <div
              onClick={() => setGoalOpen(v => !v)}
              style={{ background: '#fff', border: `0.5px solid ${goalOpen ? '#7F77DD' : '#e2e8f0'}`, borderRadius: 14, padding: '12px 12px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>🎯 목표</span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{goalOpen ? '↑' : '↓'}</span>
              </div>
              {GOALS[0] && (
                <>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#0f172a', margin: '0 0 5px' }}>{GOALS[0].icon} {GOALS[0].label}</p>
                  <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', marginBottom: 3 }}>
                    <div style={{ width: `${GOALS[0].progress}%`, height: '100%', background: GOALS[0].color.bar, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 10, color: GOALS[0].color.text, fontWeight: 500 }}>{GOALS[0].progress}% 달성</span>
                </>
              )}
            </div>
          </div>

          {/* 소비 펼침 */}
          {recapOpen && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', margin: 0 }}>지출 카테고리 비율</p>
                <button onClick={e => { e.stopPropagation(); setAnomalyOpen(!anomalyOpen); }} style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 99, background: '#F7C1C1', color: '#791F1F', border: 'none', cursor: 'pointer' }}>⚠ 이상 소비 감지</button>
              </div>
              {anomalyOpen && (
                <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8, padding: '9px 11px', marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: '#A32D2D', margin: '0 0 3px' }}>온라인 쇼핑 급증 감지</p>
                  <p style={{ fontSize: 11, color: '#791F1F', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>지난달 대비 온라인 쇼핑이 43% 증가했어요.{'\n'}예산 초과로 이어질 수 있으니 주의해요!</p>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
                {SPENDING.map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b', width: 60, flexShrink: 0 }}>{s.label}</span>
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', flex: 1 }}>
                      <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 99, opacity: s.opacity ?? 1 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 500, color: s.anomaly ? '#A32D2D' : '#0f172a', width: 32, textAlign: 'right', flexShrink: 0 }}>{s.pct}%{s.anomaly ? ' ↑' : ''}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>상세 지출 내역</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SPENDING_DETAILS.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: item.alert ? '#A32D2D' : '#cbd5e1' }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 500, color: '#0f172a', margin: 0 }}>{item.category}</p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{item.sub}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: item.alert ? '#A32D2D' : '#0f172a', margin: 0 }}>{item.amount}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 목표 펼침 */}
          {goalOpen && GOALS[0] && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{GOALS[0].icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{GOALS[0].label}</p>
                    <p style={{ fontSize: 10, color: '#64748b', margin: '1px 0 0' }}>목표 {GOALS[0].target}</p>
                  </div>
                </div>
                <Pill bg={GOALS[0].color.badge} color={GOALS[0].color.badgeText}>D-{GOALS[0].dday}</Pill>
              </div>
              <div style={{ height: 7, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ width: `${GOALS[0].progress}%`, height: '100%', background: GOALS[0].color.bar, borderRadius: 99 }} />
              </div>
              <p style={{ fontSize: 11, color: GOALS[0].color.text, fontWeight: 500, margin: '0 0 14px' }}>{GOALS[0].progress}% 달성</p>
              {goalInputOpen ? (
                <div style={{ background: '#f8fafc', border: '0.5px solid #e2e8f0', borderRadius: 14, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 7px' }}>어떤 목표를 이루고 싶으세요?</p>
                  <input value={goalText} onChange={e => setGoalText(e.target.value)} placeholder="예: 내년 5월에 유럽 여행 가고 싶어요" style={{ width: '100%', boxSizing: 'border-box', marginBottom: 7, fontSize: 13, padding: '8px 10px', border: '0.5px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#0f172a' }} />
                  <button
                    onClick={() => navigate('/prescription-loading')}
                    disabled={!goalText.trim()}
                    style={{ width: '100%', padding: '8px 0', fontSize: 12, fontWeight: 500, background: goalText.trim() ? '#0f172a' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: 8, cursor: goalText.trim() ? 'pointer' : 'not-allowed' }}
                  >
                    Pori가 목표 설정해드릴게요 →
                  </button>
                </div>
              ) : (
                <SmallBtn onClick={() => setGoalInputOpen(true)}>+ 목표 변경</SmallBtn>
              )}
            </Card>
          )}
        </div>

        {/* 4. 자산 포트폴리오 */}
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <SectionHeader icon="📊" title="투자 포트폴리오" right={<SmallBtn onClick={() => setPortfolioDetailOpen(!portfolioDetailOpen)}>현황보기 {portfolioDetailOpen ? '↑' : '↓'}</SmallBtn>} />
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <DonutChart data={PORTFOLIO} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PORTFOLIO.map(p => (
                  <div key={p.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0, display: 'inline-block' }} />
                      <span style={{ fontSize: 12, color: '#0f172a' }}>{p.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {p.rate && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: p.rate.startsWith('+') ? '#A32D2D' : '#64748b' }}>{p.rate}</span>
                      )}
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#0f172a' }}>{p.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {portfolioDetailOpen && (
              <div style={{ marginTop: 16, borderTop: '1px dashed #e2e8f0', paddingTop: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>상품별 비중 상세</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {PORTFOLIO_DETAILS.map((cat, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{cat.category} (총 {cat.pct}%)</span>
                        {cat.rate && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: cat.rate.startsWith('+') ? '#A32D2D' : '#94a3b8', marginLeft: 2 }}>{cat.rate}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {cat.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 10px', borderRadius: 8 }}>
                            <span style={{ fontSize: 12, color: '#0f172a' }}>{item.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {item.rate && (
                                <span style={{ fontSize: 11, fontWeight: 600, color: item.rate === '-' ? '#94a3b8' : item.rate.startsWith('+') ? '#A32D2D' : '#94a3b8' }}>{item.rate}</span>
                              )}
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{item.pct}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* 5. 또래 비교 */}
        <div style={{ padding: '0 16px' }}>
          <SectionHeader icon="👥" title="또래 비교" right={<Pill bg="#E6F1FB" color="#185FA5">30대 초반 · 2~4천만 원</Pill>} />
          <Card>
            {/* 탭 바 */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, marginBottom: 16 }}>
              <button
                onClick={() => setPeerTab('asset')}
                style={{ flex: 1, padding: '5px 0', fontSize: 11, fontWeight: 600, background: peerTab === 'asset' ? '#fff' : 'transparent', color: peerTab === 'asset' ? '#0f172a' : '#64748b', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s' }}
              >순자산 비교</button>
              <button
                onClick={() => setPeerTab('product')}
                style={{ flex: 1, padding: '5px 0', fontSize: 11, fontWeight: 600, background: peerTab === 'product' ? '#fff' : 'transparent', color: peerTab === 'product' ? '#0f172a' : '#64748b', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s' }}
              >보유상품 비교</button>
            </div>

            {peerTab === 'asset' && (
              <div>
                {/* 세로 막대 바 차트 */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 40, marginBottom: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#185FA5' }}>3,245만 원</span>
                    <div style={{ width: 44, height: 100, background: 'linear-gradient(180deg, #60a5fa 0%, #1D5FA5 100%)', borderRadius: '6px 6px 0 0' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>나</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>2,800만 원</span>
                    <div style={{ width: 44, height: Math.round(2800 / 3245 * 100), background: '#cbd5e1', borderRadius: '6px 6px 0 0' }} />
                    <span style={{ fontSize: 11, color: '#64748b' }}>또래 평균</span>
                  </div>
                </div>
                <div style={{ background: '#E6F1FB', border: '0.5px solid #B5D4F4', borderRadius: 8, padding: '9px 11px' }}>
                  <p style={{ fontSize: 11, color: '#0C447C', margin: 0, lineHeight: 1.5 }}>
                    또래 평균보다 <strong style={{ fontWeight: 600 }}>445만 원</strong> 더 모았어요. 비슷한 그룹 중 상위 28%예요 🎉
                  </p>
                </div>
              </div>
            )}

            {peerTab === 'product' && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#64748b', margin: '0 0 10px' }}>또래가 많이 가입하는 상품</p>
                {POPULAR_PRODUCTS.map((p, i) => (
                  <div key={p.rank} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < POPULAR_PRODUCTS.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#185FA5', width: 16, flexShrink: 0 }}>{p.rank}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: '#0f172a', margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>{p.sub}</p>
                    </div>
                    <div style={{ width: 60, height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ width: `${p.pct}%`, height: '100%', background: '#378ADD', borderRadius: 99, opacity: 1 - i * 0.2 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* 사이드바 */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 999,
          display: 'flex', animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            width: '80%', maxWidth: 300, background: '#fff', height: '100%',
            display: 'flex', flexDirection: 'column',
            animation: 'slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <div style={{ padding: '20px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: 0 }}>전체 메뉴</h2>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }} aria-label="닫기">✕</button>
            </div>

            <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingLeft: 6, paddingBottom: 20 }}>
                <button
                  onClick={() => { setSidebarOpen(false); setAccountMgmtOpen(true); }}
                  style={{ fontSize: 15, color: '#0f172a', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                >
                  내 계좌 연결 관리
                </button>
                <span style={{ fontSize: 15, color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>목표 이력</span>
                <span style={{ fontSize: 15, color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>월간 리포트</span>
                <span style={{ fontSize: 15, color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>관심사 재설정</span>
                <button
                  onClick={() => { setSidebarOpen(false); setSettingsOpen(true); }}
                  style={{ fontSize: 15, color: '#0f172a', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                >
                  내 포트폴리오 변경하기
                </button>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* 알림 패널 */}
      {notiOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{ width: '100%', maxWidth: 375, display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
            <NotificationPanel onClose={() => setNotiOpen(false)} items={notiItems} setItems={setNotiItems} />
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '85vh', zIndex: -1 }} onClick={() => setNotiOpen(false)} />
        </div>
      )}

      {/* 내 계좌 연결 관리 패널 */}
      {accountMgmtOpen && (
        <div
          onClick={() => setAccountMgmtOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', zIndex: 999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ width: '100%', maxWidth: 375, display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
            <AccountManagePanel onClose={() => setAccountMgmtOpen(false)} />
          </div>
        </div>
      )}

      {/* 설정 패널 */}
      {settingsOpen && (
        <div
          onClick={() => setSettingsOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', zIndex: 999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ width: '100%', maxWidth: 375, display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
            <SettingsPanel
              onClose={() => setSettingsOpen(false)}
              onNavigate={(to) => { setSettingsOpen(false); navigate(to); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
