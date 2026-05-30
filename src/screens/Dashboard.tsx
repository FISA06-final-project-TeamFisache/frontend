import { useEffect, useState, type CSSProperties, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { withdrawAccount } from '../api/userApi';
import { getDashboard, type DashboardData } from '../api/dashboardApi';
import SalaryManagement from './SalaryManagement';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notificationApi';
import { getAssets, type Asset } from '../api/assetApi';


interface Goal {
  id: number | string;
  icon: string;
  label: string;
  target: string;
  progress: number;
  dday: number;
  color: { bg: string; bar: string; text: string; badge: string; badgeText: string };
}

interface SpendingItem { label: string; pct: number; color: string; }
interface PopularProduct { rank: number; name: string; sub: string; pct: number; }
interface PortfolioSlice { label: string; pct: number; color: string; rate?: string; }
interface NotiItem { id: string; icon: string; iconBg: string; title: string; body: string; time: string; read: boolean; }

const GOAL_COLORS: Goal['color'][] = [
  { bg: '#EEEDFE', bar: '#7F77DD', text: '#534AB7', badge: '#EEEDFE', badgeText: '#534AB7' },
  { bg: '#E1F5EE', bar: '#1D9E75', text: '#0F6E56', badge: '#E1F5EE', badgeText: '#0F6E56' },
  { bg: '#FAEEDA', bar: '#EF9F27', text: '#854F0B', badge: '#FAEEDA', badgeText: '#854F0B' },
  { bg: '#FCEBEB', bar: '#E24B4A', text: '#A32D2D', badge: '#FCEBEB', badgeText: '#A32D2D' },
];

function pickGoalIcon(text: string): string {
  if (/여행|해외|비행|유럽|제주|일본/.test(text)) return '✈';
  if (/집|주택|전세|매매|부동산/.test(text))      return '🏠';
  if (/차|자동차/.test(text))                     return '🚗';
  if (/결혼|웨딩/.test(text))                     return '💍';
  if (/공부|학위|자격증|교육/.test(text))          return '📚';
  return '🎯';
}

// (하드) 또래비교 인기상품 — API 미제공
const POPULAR_PRODUCTS: PopularProduct[] = [
  { rank: 1, name: 'TIGER 미국S&P500',  sub: 'ETF · 가입률 68%',  pct: 68 },
  { rank: 2, name: '우리은행 정기적금', sub: '적금 · 가입률 54%', pct: 54 },
  { rank: 3, name: '토스뱅크 파킹통장', sub: '파킹 · 가입률 47%', pct: 47 },
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

function pctToXY(cx: number, cy: number, r: number, pct: number) {
  const rad = (pct / 100) * 2 * Math.PI - Math.PI / 2;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function SalaryDonutChart({ data, total, totalAmt }: {
  data: PortfolioSlice[];
  total: string;
  totalAmt: number;
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
  const fmtAmt = (n: number) => `${Math.round(n / 10000)}만 원`;

  return (
    <div style={{ position: 'relative', width: 128, height: 128, flexShrink: 0 }}>
      <svg width="128" height="128" viewBox="0 0 128 128">
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
        {segments.map((seg, i) => (
          <text
            key={`l${i}`}
            x={seg.labelPos.x} y={seg.labelPos.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fontWeight={700} fill="white"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {data[i].pct}
          </text>
        ))}
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none', width: 64,
      }}>
        {active ? (
          <>
            <div style={{ fontSize: 9, fontWeight: 700, color: active.color, lineHeight: 1.4 }}>{active.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{fmtAmt(totalAmt * active.pct / 100)}</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1.4 }}>이 급여</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{total}</div>
          </>
        )}
      </div>
    </div>
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

const BANK_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  '우리은행':    { bg: '#DBEAFE', color: '#1E40AF' },
  '카카오뱅크':  { bg: '#FEF3C7', color: '#854D0E' },
  '토스뱅크':   { bg: '#DBEAFE', color: '#1D4ED8' },
  '신한은행':   { bg: '#DBEAFE', color: '#1E40AF' },
  '국민은행':   { bg: '#FEF3C7', color: '#92400E' },
  '하나은행':   { bg: '#D1FAE5', color: '#065F46' },
  '미래에셋증권': { bg: '#FFEDD5', color: '#9A3412' },
};

function assetTypeToLabel(type: string): '입출금' | '예·적금' | '증권' | '카드' {
  if (['CHECKING', 'PARKING', 'CMA'].includes(type)) return '입출금';
  if (['SAVINGS', 'DEPOSIT'].includes(type)) return '예·적금';
  if (['STOCK', 'IRP', 'ISA'].includes(type)) return '증권';
  return '카드';
}

function assetsToLinkedBanks(assets: Asset[]): LinkedBank[] {
  const map = new Map<string, LinkedBank>();
  assets
    .filter(a => a.assetType !== 'CREDIT_CARD' && a.assetType !== 'DEBIT_CARD')
    .forEach(a => {
      if (!map.has(a.institution)) {
        const badge = BANK_BADGE_COLORS[a.institution] ?? { bg: '#F1F5F9', color: '#475569' };
        map.set(a.institution, {
          id: a.institution,
          name: a.institution,
          short: a.institution.slice(0, 2),
          badgeBg: badge.bg,
          badgeColor: badge.color,
          accounts: [],
        });
      }
      map.get(a.institution)!.accounts.push({
        id: a.id,
        name: a.accountName,
        number: a.assetNumber,
        type: assetTypeToLabel(a.assetType),
        balance: a.balance,
      });
    });
  return Array.from(map.values());
}

function AccountManagePanel({ onClose }: { onClose: () => void }) {
  const [banks, setBanks] = useState<LinkedBank[]>([]);
  const [expandedBanks, setExpandedBanks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getAssets()
      .then(assets => setBanks(assetsToLinkedBanks(assets)))
      .catch(() => {});
  }, []);

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
  const markRead = (id: string) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    markNotificationRead(id).catch(() => {});
  };
  const markAll = () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    markAllNotificationsRead().catch(() => {});
  };
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
  const { userName: USER_NAME, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleWithdraw = async () => {
    if (window.confirm('정말로 회원 탈퇴를 하시겠습니까?\n탈퇴 시 모든 자산 정보 및 설정이 영구 삭제되며 복구할 수 없습니다.')) {
      try {
        await withdrawAccount();
        alert('회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.');
        logout();
        navigate('/login');
      } catch (err) {
        alert(err instanceof Error ? err.message : '회원 탈퇴 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // 알림 타입 → 아이콘/색상 매핑
  function notiTypeToIcon(type: string): { icon: string; iconBg: string } {
    const map: Record<string, { icon: string; iconBg: string }> = {
      SALARY:         { icon: '💳', iconBg: '#E6F1FB' },
      SPENDING_TREND: { icon: '📉', iconBg: '#FCEBEB' },
      REPORT:         { icon: '📋', iconBg: '#E1F5EE' },
      EVENT:          { icon: '🎯', iconBg: '#EEEDFE' },
      POLICY:         { icon: '🏦', iconBg: '#E1F5EE' },
    };
    return map[type] ?? { icon: '🔔', iconBg: '#F1F5F9' };
  }

  function formatRelativeTime(createdAt: string): string {
    const diff = Date.now() - new Date(createdAt).getTime();
    const min  = Math.floor(diff / 60000);
    if (min < 1)   return '방금 전';
    if (min < 60)  return `${min}분 전`;
    const hr = Math.floor(min / 60);
    if (hr < 24)   return `${hr}시간 전`;
    return `${Math.floor(hr / 24)}일 전`;
  }

  // ── 대시보드 API 상태 ────────────────────────────────────
  const [dashboard,           setDashboard]           = useState<DashboardData | null>(null);
  const [loadError,           setLoadError]           = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    getDashboard()
      .then(d => { if (!cancelled) setDashboard(d); })
      .catch(e => { if (!cancelled) setLoadError(e instanceof Error ? e.message : '대시보드 조회 실패'); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    getNotifications()
      .then(notifications => setNotiItems(notifications.map(n => {
        const { icon, iconBg } = notiTypeToIcon(n.type);
        return { id: n.id, icon, iconBg, title: n.title, body: n.content, time: formatRelativeTime(n.sentAt), read: n.isRead };
      })))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── UI 상태 ──────────────────────────────────────────────
  const [bannerVisible,       setBannerVisible]       = useState(true);
  const [anomalyOpen,         setAnomalyOpen]         = useState(false);
  const [recapOpen,           setRecapOpen]           = useState(false);
  const [portfolioDetailOpen, setPortfolioDetailOpen] = useState(false);
  const [notiOpen,            setNotiOpen]            = useState(false);
  const [notiItems,           setNotiItems]           = useState<NotiItem[]>([]);
  const [accountMgmtOpen,     setAccountMgmtOpen]     = useState(false);
  const [settingsOpen,        setSettingsOpen]        = useState(false);
  const [sidebarOpen,         setSidebarOpen]         = useState(false);
  const [salaryMgmtOpen,      setSalaryMgmtOpen]      = useState(false);
  const [peerTab,             setPeerTab]             = useState<'asset' | 'product'>('asset');
  const [goals,               setGoals]               = useState<Goal[]>(() => {
    try { return JSON.parse(sessionStorage.getItem('user:goals') ?? '[]'); } catch { return []; }
  });
  const [goalModalOpen,       setGoalModalOpen]       = useState(false);
  const [goalText,            setGoalText]            = useState('');

  // 대시보드 fetch 결과로 목표 카드 채우기 (events[0] 우선)
  useEffect(() => {
    if (!dashboard || dashboard.events.length === 0) return;
    const e = dashboard.events[0];
    setGoals([{
      id: e.id,
      icon: pickGoalIcon(e.title),
      label: e.title,
      target: `${e.currentAmount.toLocaleString()} / ${e.targetAmount.toLocaleString()}원`,
      progress: e.progressRate,
      dday: e.dday,
      color: GOAL_COLORS[0],
    }]);
  }, [dashboard]);

  // ── 표시용 헬퍼 ─────────────────────────────────────────
  const fmtManwon = (n: number) => `${Math.round(n / 10000).toLocaleString()}만 원`;

  // 월급 분배 도넛 데이터 (API allocations → SalaryDonutChart 슬라이스)
  const SALARY_PALETTE = ['#EF9F27', '#7F77DD', '#378ADD', '#1D9E75', '#94a3b8'];
  const salarySlices: PortfolioSlice[] = dashboard
    ? (() => {
        const income = dashboard.salaryPlan.monthlyIncome;
        if (income <= 0) return [];

        const slices: PortfolioSlice[] = dashboard.salaryPlan.allocations.map((a, i) => ({
          label: a.purpose ?? '기타',
          pct: Math.round(a.plannedAmount / income * 100),
          color: SALARY_PALETTE[i % (SALARY_PALETTE.length - 2)],
        }));

        const investAmt = dashboard.salaryPlan.investmentAmount ?? 0;
        if (investAmt > 0) {
          slices.push({ label: '투자', pct: Math.round(investAmt / income * 100), color: '#1D9E75' });
        }

        const surplus = dashboard.salaryPlan.surplus ?? 0;
        if (surplus > 0) {
          slices.push({ label: '잔여', pct: Math.round(surplus / income * 100), color: '#94a3b8' });
        }

        return slices;
      })()
    : [];

  // 소비 카테고리 색상 (API 카테고리명 → 표시 색상 매핑, (하드))
  const SPENDING_COLOR: Record<string, string> = {
    '식비':       '#D85A30',
    '문화/여가':  '#D85A30',
    '온라인쇼핑': '#A32D2D',
    '교통':       '#D85A30',
    '기타':       '#D85A30',
  };
  const spendingItems: SpendingItem[] = dashboard
    ? dashboard.consumption.categories.map(c => ({
        label: c.categoryName,
        pct: c.percentage,
        color: SPENDING_COLOR[c.categoryName] ?? '#D85A30',
      }))
    : [];

  // 포트폴리오 카테고리별 색상 (categoryLabel → 색상)
  const PORTFOLIO_COLOR: Record<string, string> = {
    'ETF':    '#1D9E75',
    '현금성': '#5DCAA5',
    '적금':   '#9FE1CB',
    'IRP':    '#085041',
  };
  const portfolioSlices: PortfolioSlice[] = dashboard
    ? dashboard.portfolio.map(p => ({
        label: p.categoryLabel,
        pct: p.ratio,
        color: PORTFOLIO_COLOR[p.categoryLabel] ?? '#94a3b8',
        rate: p.rate,
      }))
    : [];

  const handleGoalSubmit = () => {
    const text = goalText.trim();
    if (!text) return;
    const newGoal: Goal = {
      id: Date.now(),
      icon: pickGoalIcon(text),
      label: text,
      target: '목표 설정 중',
      progress: 0,
      dday: 365,
      color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
    };
    const updated = [newGoal]; // 단일 목표
    setGoals(updated);
    sessionStorage.setItem('user:goals', JSON.stringify(updated));
    sessionStorage.setItem('user:goal', text);
    setGoalText('');
    setGoalModalOpen(false);
    navigate('/prescription-loading');
  };

  const unreadCount = notiItems.filter(n => !n.read).length;

  // ── 로딩 / 에러 화면 ────────────────────────────────────
  if (loadError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#f8fafc', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" }}>
        <p style={{ fontSize: 14, color: '#A32D2D', margin: 0 }}>{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ fontSize: 12, fontWeight: 600, padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >다시 시도</button>
      </div>
    );
  }
  if (!dashboard) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid #e2e8f0', borderTopColor: '#0f172a',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

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

        {/* 월급 알림 배너 (하드) — 별도 API 미제공 */}
        {bannerVisible && (
          <div style={{ padding: '0 16px', marginBottom: 10 }}>
            <div style={{ background: '#FAEEDA', border: '0.5px solid #EF9F27', borderRadius: 14, padding: '12px 14px', position: 'relative' }}>
              {/* 1. 닫기 버튼 - 우측 상단 모서리에 절대 위치로 배치 */}
              <button
                onClick={() => setBannerVisible(false)}
                style={{ position: 'absolute', right: 12, top: 12, border: 'none', background: 'none', cursor: 'pointer', color: '#BA7517', fontSize: 16, lineHeight: 1, padding: 0 }}
                aria-label="닫기"
              >✕</button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingRight: 8 }}>
                {/* 2. 좌측: 타이틀 및 설명 텍스트 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>🔔</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#854F0B' }}>
                      월급이 들어왔어요
                    </span>
                    <span style={{ fontSize: 10, color: '#BA7517' }}>방금 전</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#633806', margin: 0, lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                    Pori가 자동으로 이번 달 분배 계획을 세웠어요.{'\n'}확인하고 자동이체를 시작해볼까요?
                  </p>
                </div>
                
                {/* 3. 우측: 확인 버튼 - 우측 끝 테두리에서 살짝 왼쪽으로 당겨지도록 여백 설정 */}
                <div style={{ flexShrink: 0, marginRight: 8, marginTop: 4 }}>
                  <button
                    onClick={() => setSalaryMgmtOpen(true)}
                    style={{ fontSize: 11, fontWeight: 600, padding: '6px 12px', background: '#854F0B', color: '#FAEEDA', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                  >
                    확인 →
                  </button>
                </div>
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
              <span style={{ fontSize: 26, fontWeight: 500, color: '#0f172a' }}>{fmtManwon(dashboard.assetsSummary.totalBalance)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 7 }}>
              {[
                { label: '투자 자산',   value: fmtManwon(dashboard.assetsSummary.investmentBalance) },
                { label: '현금성 자산', value: fmtManwon(dashboard.assetsSummary.cashBalance) },
              ].map(item => (
                <div key={item.label} style={{ background: '#fff', borderRadius: 8, padding: '8px 10px' }}>
                  <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 1. 월급 + 목표 (2-column) */}
        <div style={{ padding: '0 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'stretch' }}>
          {/* 월급 */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader icon="💸" title="월급" />
            <Card style={{ flex: 1, padding: '12px 10px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SalaryDonutChart
                data={salarySlices}
                total={fmtManwon(dashboard.salaryPlan.monthlyIncome)}
                totalAmt={dashboard.salaryPlan.monthlyIncome}
              />
            </Card>
          </div>

          {/* 목표 */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader
              icon="🎯" title="목표"
              right={!goals[0] ? <SmallBtn onClick={() => { setGoalText(''); setGoalModalOpen(true); }}>+ 추가</SmallBtn> : undefined}
            />
            {goals[0] ? (
              <Card style={{ flex: 1, padding: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{goals[0].icon}</span>
                  <Pill bg={goals[0].color.badge} color={goals[0].color.badgeText}>D-{goals[0].dday}</Pill>
                </div>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#0f172a', margin: '0 0 2px' }}>{goals[0].label}</p>
                <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 7px' }}>{goals[0].target}</p>
                <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${goals[0].progress}%`, height: '100%', background: goals[0].color.bar, borderRadius: 99 }} />
                </div>
                <p style={{ fontSize: 10, color: goals[0].color.text, margin: '3px 0 0', fontWeight: 500 }}>{goals[0].progress}% 달성</p>
              </Card>
            ) : (
              <Card style={{ flex: 1, padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>아직 목표가<br />없어요</p>
              </Card>
            )}
          </div>
        </div>

        {/* 2. 소비 */}
        <div style={{ padding: '0 16px', marginBottom: recapOpen ? 0 : 16 }}>
          <SectionHeader
            icon="🧾" title="소비"
            right={dashboard.consumption.isBudgetExceeded
              ? <Pill bg="#FCEBEB" color="#A32D2D">예산 초과 +{dashboard.consumption.budgetExceedRate}%</Pill>
              : undefined}
          />
          <div
            onClick={() => setRecapOpen(v => !v)}
            style={{ background: '#fff', border: `0.5px solid ${recapOpen ? '#378ADD' : '#e2e8f0'}`, borderRadius: 14, padding: '12px 14px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <p style={{ fontSize: 9, color: '#64748b', margin: 0 }}>{dashboard.consumption.referenceMonth}월 총 지출</p>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>{recapOpen ? '↑' : '↓'}</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>{fmtManwon(dashboard.consumption.totalExpense)}</p>
          </div>
        </div>

        {/* 소비 펼침 */}
        {recapOpen && (
          <div style={{ padding: '0 16px', marginBottom: 16 }}>
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
                {spendingItems.map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b', width: 60, flexShrink: 0 }}>{s.label}</span>
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', flex: 1 }}>
                      <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#0f172a', width: 32, textAlign: 'right', flexShrink: 0 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>상세 지출 내역</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dashboard.consumption.categories.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 500, color: '#0f172a', margin: 0 }}>{item.categoryName}</p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{item.sub ?? '-'}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{item.expenseAmount.toLocaleString()}원</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 4. 자산 포트폴리오 */}
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <SectionHeader icon="📊" title="투자 포트폴리오" right={<SmallBtn onClick={() => setPortfolioDetailOpen(!portfolioDetailOpen)}>현황보기 {portfolioDetailOpen ? '↑' : '↓'}</SmallBtn>} />
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <DonutChart data={portfolioSlices} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {portfolioSlices.map(p => (
                  <div key={p.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0, display: 'inline-block' }} />
                      <span style={{ fontSize: 12, color: '#0f172a' }}>{p.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {p.rate && p.rate !== '-' && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: p.rate.startsWith('+') ? '#A32D2D' : '#64748b' }}>{p.rate}</span>
                      )}
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#0f172a' }}>{p.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 상품별 비중 상세 — API portfolio[].items */}
            {portfolioDetailOpen && (
              <div style={{ marginTop: 16, borderTop: '1px dashed #e2e8f0', paddingTop: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>상품별 비중 상세</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {dashboard.portfolio.map((cat, idx) => {
                    const catColor = PORTFOLIO_COLOR[cat.categoryLabel] ?? '#94a3b8';
                    const showRate = cat.rate && cat.rate !== '-';
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: catColor }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{cat.categoryLabel} (총 {cat.ratio}%)</span>
                          {showRate && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: cat.rate.startsWith('+') ? '#A32D2D' : '#94a3b8', marginLeft: 2 }}>{cat.rate}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {cat.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 10px', borderRadius: 8 }}>
                              <span style={{ fontSize: 12, color: '#0f172a' }}>{item.name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {item.rate && item.rate !== '-' && (
                                  <span style={{ fontSize: 11, fontWeight: 600, color: item.rate.startsWith('+') ? '#A32D2D' : '#94a3b8' }}>{item.rate}</span>
                                )}
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{item.ratio}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* 5. 또래 비교 (하드) — API 미제공, 화면 전체 mock 값 */}
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

      {/* 목표 추가 모달 */}
      {goalModalOpen && (
        <div
          onClick={() => setGoalModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 375, background: '#fff',
              borderRadius: '20px 20px 0 0', padding: '20px 20px 36px',
              animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>새 목표 추가</span>
              <button onClick={() => setGoalModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px' }}>어떤 목표를 이루고 싶으세요?</p>
            <input
              value={goalText}
              onChange={e => setGoalText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleGoalSubmit(); }}
              placeholder="예: 내년 5월에 유럽 여행 가고 싶어요"
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box', marginBottom: 12,
                fontSize: 14, padding: '12px 14px',
                border: '1px solid #e2e8f0', borderRadius: 12,
                background: '#f8fafc', color: '#0f172a', outline: 'none',
              }}
            />
            <button
              onClick={handleGoalSubmit}
              disabled={!goalText.trim()}
              style={{
                width: '100%', padding: '14px 0', fontSize: 14, fontWeight: 700,
                background: goalText.trim() ? '#0f172a' : '#cbd5e1',
                color: '#fff', border: 'none', borderRadius: 12,
                cursor: goalText.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Pori가 목표 설정해드릴게요 →
            </button>
          </div>
        </div>
      )}

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
                <button
                  onClick={() => { setSidebarOpen(false); navigate('/monthly-report'); }}
                  style={{ fontSize: 15, color: '#0f172a', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                >
                  월간 리포트
                </button>
                <span style={{ fontSize: 15, color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>관심사 재설정</span>
                <button
                  onClick={() => { setSidebarOpen(false); setSettingsOpen(true); }}
                  style={{ fontSize: 15, color: '#0f172a', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                >
                  내 포트폴리오 변경하기
                </button>
              </div>
            </div>

            <div style={{ padding: '20px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 16, flexShrink: 0 }}>
              <button
                onClick={handleLogout}
                style={{ fontSize: 13, color: '#64748b', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              >
                로그아웃
              </button>
              <button
                onClick={handleWithdraw}
                style={{ fontSize: 13, color: '#ef4444', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              >
                회원탈퇴
              </button>
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

      {/* 월급 관리 모달 */}
      {salaryMgmtOpen && (
        <SalaryManagement onClose={() => setSalaryMgmtOpen(false)} />
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
