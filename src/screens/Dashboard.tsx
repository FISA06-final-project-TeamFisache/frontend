import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import SalaryManagement from './SalaryManagement';
import MonthlyReport from './MonthlyReport';
import { useAuth } from '../contexts/AuthContext';
import { withdrawAccount } from '../api/userApi';

import wooriLogo   from '../assets/banks/woori.png';
import kakaoLogo   from '../assets/banks/kakao.png';
import tossLogo    from '../assets/banks/toss.png';
import shinhanLogo from '../assets/banks/shinhan.png';
import hanaLogo    from '../assets/banks/hana.png';
import kbLogo      from '../assets/banks/kb.png';
import miraeLogo   from '../assets/banks/mirae.png';
import { getDashboard, type DashboardData, type DashboardCategoryExpense } from '../api/dashboardApi';
import {
  getNotifications,
  readNotification,
  readAllNotifications,
  subscribeToNotifications,
  type Notification as ApiNotification,
} from '../api/notificationApi';
import {
  getAssets,
  getMyDataPreview,
  syncAssets,
  type Asset,
  type PreviewAccount
} from '../api/assetApi';


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
interface NotiItem { id: string; icon: string; iconBg: string; title: string; body: string; time: string; read: boolean; type?: string; }

const NOTI_META: Record<string, { icon: string; iconBg: string }> = {
  SALARY_REBALANCING: { icon: '💳', iconBg: '#E6F1FB' },
  SPENDING_TREND: { icon: '📉', iconBg: '#FCEBEB' },
  REPORT_READY: { icon: '📋', iconBg: '#E1F5EE' },
  CONCERT_INFO: { icon: '🎵', iconBg: '#F3E8FF' },
  GOVT_POLICY: { icon: '🏛️', iconBg: '#E1F5EE' },
};

function toNotiItem(n: ApiNotification): NotiItem {
  const meta = NOTI_META[n.type] ?? { icon: '🔔', iconBg: '#f1f5f9' };
  const diff = Date.now() - new Date(n.sentAt).getTime();
  const mins = Math.floor(diff / 60000);
  const time =
    mins < 1 ? '방금 전' :
      mins < 60 ? `${mins}분 전` :
        mins < 1440 ? `${Math.floor(mins / 60)}시간 전` :
          `${Math.floor(mins / 1440)}일 전`;
  return { id: n.id, icon: meta.icon, iconBg: meta.iconBg, title: n.title, body: n.content, time, read: n.isRead, type: n.type };
}

const GOAL_COLORS: Goal['color'][] = [
  { bg: '#EEEDFE', bar: '#7F77DD', text: '#534AB7', badge: '#EEEDFE', badgeText: '#534AB7' },
  { bg: '#E1F5EE', bar: '#1D9E75', text: '#0F6E56', badge: '#E1F5EE', badgeText: '#0F6E56' },
  { bg: '#FAEEDA', bar: '#EF9F27', text: '#854F0B', badge: '#FAEEDA', badgeText: '#854F0B' },
  { bg: '#FCEBEB', bar: '#E24B4A', text: '#A32D2D', badge: '#FCEBEB', badgeText: '#A32D2D' },
];

function pickGoalIcon(text: string): string {
  if (/여행|해외|비행|유럽|제주|일본/.test(text)) return '✈';
  if (/집|주택|전세|매매|부동산/.test(text)) return '🏠';
  if (/차|자동차/.test(text)) return '🚗';
  if (/결혼|웨딩/.test(text)) return '💍';
  if (/공부|학위|자격증|교육/.test(text)) return '📚';
  return '🎯';
}

// (하드) 또래비교 인기상품 — API 미제공
const POPULAR_PRODUCTS: PopularProduct[] = [
  { rank: 1, name: 'TIGER 미국S&P500', sub: 'ETF · 가입률 68%', pct: 68 },
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
            <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1.4 }}>급여</div>
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

const BANK_LOGOS: Record<string, string> = {
  woori: wooriLogo,
  kakao: kakaoLogo,
  toss: tossLogo,
  shinhan: shinhanLogo,
  hana: hanaLogo,
  kb: kbLogo,
  mirae: miraeLogo,
};

const ALL_AVAILABLE_BANKS = [
  { id: 'woori', name: '우리은행', short: '우리', badgeBg: '#DBEAFE', badgeColor: '#1E40AF', logo: wooriLogo },
  { id: 'kakao', name: '카카오뱅크', short: '카카', badgeBg: '#FEF3C7', badgeColor: '#854D0E', logo: kakaoLogo },
  { id: 'toss', name: '토스뱅크', short: '토스', badgeBg: '#DBEAFE', badgeColor: '#1D4ED8', logo: tossLogo },
  { id: 'shinhan', name: '신한은행', short: '신한', badgeBg: '#DBEAFE', badgeColor: '#1E40AF', logo: shinhanLogo },
  { id: 'hana', name: '하나은행', short: '하나', badgeBg: '#E0F2FE', badgeColor: '#0369A1', logo: hanaLogo },
  { id: 'kb', name: 'KB국민은행', short: '국민', badgeBg: '#FEF3C7', badgeColor: '#B45309', logo: kbLogo },
  { id: 'mirae', name: '미래에셋', short: '미래', badgeBg: '#FFEDD5', badgeColor: '#C2410C', logo: miraeLogo },
];

const UNLINKED_BANKS_DEFAULT_ACCOUNTS: Record<string, LinkedAccount[]> = {
  hana: [
    { id: 'hana-1', name: '하나 주거래 통장', number: '123-***-789012', type: '입출금', balance: 1_250_000 },
  ],
  kb: [
    { id: 'kb-1', name: 'KB마이핏 통장', number: '456-***-123456', type: '입출금', balance: 800_000 },
    { id: 'kb-2', name: 'KB국민 만능적금', number: '789-***-654321', type: '예·적금', balance: 5_000_000 },
  ],
  mirae: [
    { id: 'mirae-1', name: '미래에셋 CMA 계좌', number: '321-***-987654', type: '증권', balance: 3_500_000 },
  ],
};

// (하드) 계좌 연결 관리 — 별도 API 연동 전까지 mock 사용
const LINKED_BANKS_MOCK: LinkedBank[] = [
  {
    id: 'woori', name: '우리은행', short: '우리', badgeBg: '#DBEAFE', badgeColor: '#1E40AF',
    accounts: [
      { id: 'woori-1', name: 'WON 우월한 월급 통장', number: '1002-***-345678', type: '입출금', balance: 3_850_000 },
      { id: 'woori-2', name: 'WON 적금', number: '1002-***-998877', type: '예·적금', balance: 12_000_000 },
    ],
  },
  {
    id: 'kakao', name: '카카오뱅크', short: '카카', badgeBg: '#FEF3C7', badgeColor: '#854D0E',
    accounts: [
      { id: 'kakao-1', name: '입출금통장', number: '3333-01-****567', type: '입출금', balance: 1_500_000 },
      { id: 'kakao-2', name: '26주 적금', number: '3333-04-****092', type: '예·적금', balance: 2_400_000 },
    ],
  },
  {
    id: 'toss', name: '토스뱅크', short: '토스', badgeBg: '#DBEAFE', badgeColor: '#1D4ED8',
    accounts: [
      { id: 'toss-1', name: '파킹통장', number: '1000-12-****345', type: '입출금', balance: 2_300_000 },
      { id: 'toss-2', name: '나눠모으기', number: '1000-24-****221', type: '입출금', balance: 500_000 },
      { id: 'toss-3', name: '토스증권 계좌', number: '5601-01-****234', type: '증권', balance: 4_120_000 },
    ],
  },
  {
    id: 'shinhan', name: '신한은행', short: '신한', badgeBg: '#DBEAFE', badgeColor: '#1E40AF',
    accounts: [
      { id: 'shinhan-1', name: 'Tops 직장인 플랜 통장', number: '110-***-456789', type: '입출금', balance: 3_200_000 },
    ],
  },
];

const INST_TO_BANK_ID: Record<string, string> = {
  '우리은행': 'woori',
  '카카오뱅크': 'kakao',
  '토스뱅크': 'toss',
  '신한은행': 'shinhan',
  '하나은행': 'hana',
  'KB국민은행': 'kb',
  '국민은행': 'kb',
  '미래에셋': 'mirae',
};

const groupAssetsToBanks = (assets: Asset[]): LinkedBank[] => {
  const groups: Record<string, LinkedAccount[]> = {};
  assets.forEach(a => {
    const instName = a.institution;
    if (!groups[instName]) {
      groups[instName] = [];
    }
    let typeStr: LinkedAccount['type'] = '입출금';
    if (a.assetType === 'SAVINGS') {
      typeStr = a.accountName.includes('적금') ? '예·적금' : '입출금';
    } else if (a.assetType === 'INVESTMENT') {
      typeStr = '증권';
    }
    
    groups[instName].push({
      id: a.id,
      name: a.accountName,
      number: a.assetNumber,
      type: typeStr,
      balance: a.balance
    });
  });

  return Object.entries(groups).map(([inst, accounts]) => {
    const bankId = INST_TO_BANK_ID[inst] ?? 'woori';
    const meta = ALL_AVAILABLE_BANKS.find(b => b.id === bankId) ?? ALL_AVAILABLE_BANKS[0];
    return {
      id: bankId,
      name: inst,
      short: meta.short,
      badgeBg: meta.badgeBg,
      badgeColor: meta.badgeColor,
      accounts
    };
  });
};

function AccountManagePanel({ onClose }: { onClose: () => void }) {
  const [banks, setBanks] = useState<LinkedBank[]>([]);
  const [expandedBanks, setExpandedBanks] = useState<Record<string, boolean>>({ woori: true });
  const [view, setView] = useState<'manage' | 'link'>('manage');
  const [pendingRemoval, setPendingRemoval] = useState<{ bankId: string; accountId: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    // 💡 실제 백엔드 API로부터 연동된 전체 자산 목록을 조회하여 화면에 바인딩
    getAssets()
      .then(assets => {
        if (assets.length > 0) {
          setBanks(groupAssetsToBanks(assets));
        } else {
          // 조회 결과가 비어 있을 경우 목업 데이터를 기본 바인딩
          setBanks(LINKED_BANKS_MOCK);
        }
      })
      .catch(err => {
        console.error('실제 자산 목록 조회 실패, 목업 데이터를 기본 바인딩합니다:', err);
        setBanks(LINKED_BANKS_MOCK);
      });
  }, []);

  const toggleBank = (id: string) =>
    setExpandedBanks(prev => ({ ...prev, [id]: !prev[id] }));

  const totalAccounts = banks.reduce((sum, b) => sum + b.accounts.length, 0);

  const removeAccount = (bankId: string, accountId: string) => {
    setBanks(prev => prev
      .map(b => b.id === bankId ? { ...b, accounts: b.accounts.filter(a => a.id !== accountId) } : b)
      .filter(b => b.accounts.length > 0));
  };

  const handleLinkBank = async (bank: typeof ALL_AVAILABLE_BANKS[0]) => {
    try {
      // 1. 💡 마이데이터 미리보기 API를 통해 금융기관의 연동 가능한 실시간 계좌 정보 조회
      const previewAccounts = await getMyDataPreview([bank.name]);
      if (previewAccounts.length > 0) {
        // 2. 💡 찾은 계좌 번호 목록을 실제 데이터베이스 자산 목록과 마이데이터 연동(동기화)
        const assetNums = previewAccounts.map(a => a.assetNumber);
        await syncAssets(assetNums);
        
        // 3. 💡 동기화 성공 후, 최신 자산 전체 목록을 재조회하여 화면에 갱신 바인딩
        const updatedAssets = await getAssets();
        setBanks(groupAssetsToBanks(updatedAssets));
        setToastMsg(`${bank.name} 실시간 연동이 완료되었습니다.`);
      } else {
        // 백엔드 미리보기 결과가 비어있을 경우 고대비 모사(MOCK) 데이터로 안전 바인딩
        const newAccounts = UNLINKED_BANKS_DEFAULT_ACCOUNTS[bank.id] ?? [
          { id: `${bank.id}-default`, name: `${bank.name} 입출금 통장`, number: '123-***-999999', type: '입출금', balance: 1_000_000 }
        ];
        setBanks(prev => {
          if (prev.some(b => b.id === bank.id)) return prev;
          return [
            ...prev,
            {
              id: bank.id,
              name: bank.name,
              short: bank.short,
              badgeBg: bank.badgeBg,
              badgeColor: bank.badgeColor,
              accounts: newAccounts
            }
          ];
        });
        setToastMsg(`${bank.name} 계좌를 불러왔어요!`);
      }
    } catch (err) {
      console.error('MyData 백엔드 연동 API 호출 실패, 목업 시뮬레이션을 실행합니다:', err);
      const newAccounts = UNLINKED_BANKS_DEFAULT_ACCOUNTS[bank.id] ?? [
        { id: `${bank.id}-default`, name: `${bank.name} 입출금 통장`, number: '123-***-999999', type: '입출금', balance: 1_000_000 }
      ];
      setBanks(prev => {
        if (prev.some(b => b.id === bank.id)) return prev;
        return [
          ...prev,
          {
            id: bank.id,
            name: bank.name,
            short: bank.short,
            badgeBg: bank.badgeBg,
            badgeColor: bank.badgeColor,
            accounts: newAccounts
          }
        ];
      });
      setToastMsg(`${bank.name} 계좌를 불러왔어요!`);
    }
    setView('manage');
  };

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  return (
    <div style={{
      background: '#fff', borderRadius: '20px 20px 0 0',
      maxWidth: 375, width: '100%', maxHeight: '85vh',
      overflowY: 'auto',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      position: 'relative',
    }}>
      {view === 'manage' ? (
        <>
          {/* 헤더 */}
          <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🔗</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>내 계좌 연결 관리</span>
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
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                      {BANK_LOGOS[bank.id] ? (
                        <img src={BANK_LOGOS[bank.id]} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: bank.badgeBg, color: bank.badgeColor, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {bank.short}
                        </div>
                      )}
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
                        <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px 12px 60px', borderBottom: '0.5px solid #f1f5f9' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontSize: 9, fontWeight: 700, background: '#fff', color: '#475569', padding: '1px 6px', borderRadius: 99, border: '0.5px solid #e2e8f0', whiteSpace: 'nowrap' }}>{acc.type}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{acc.name}</span>
                            </div>
                            <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{acc.number}</div>
                            <div style={{ fontSize: 11, color: '#0f172a', marginTop: 2, fontWeight: 600 }}>{acc.balance.toLocaleString()}원</div>
                          </div>
                          <button
                            onClick={() => setPendingRemoval({ bankId: bank.id, accountId: acc.id })}
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
              onClick={() => setView('link')}
              style={{ width: '100%', padding: '12px 0', fontSize: 13, fontWeight: 700, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}
            >
              + 새 기관 연동하기
            </button>
          </div>
        </>
      ) : (
        <>
          {/* 새 기관 연동 헤더 */}
          <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setView('manage')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0f172a', fontSize: 18, display: 'flex', alignItems: 'center', padding: '4px 8px 4px 0' }} aria-label="뒤로가기">
                ←
              </button>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>새 기관 연동하기</span>
            </div>
            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="닫기">✕</button>
          </div>

          {/* 연동 가능한 전체 리스트 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 16px 30px', overflowY: 'auto' }}>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px', fontWeight: 500 }}>연동할 금융기관을 선택해 주세요</p>
            {ALL_AVAILABLE_BANKS.map(bank => {
              const isConnected = banks.some(b => b.id === bank.id);
              return (
                <div
                  key={bank.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', background: '#fff', border: '0.5px solid #e2e8f0',
                    borderRadius: 16, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                    <img src={bank.logo} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{bank.name}</div>
                    <div style={{ fontSize: 11, color: isConnected ? '#3b82f6' : '#94a3b8', marginTop: 2, fontWeight: 500 }}>
                      {isConnected ? '연결 완료' : '미연결'}
                    </div>
                  </div>
                  {isConnected ? (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', background: '#f8fafc', padding: '6px 12px', borderRadius: 10, border: '0.5px solid #e2e8f0' }}>
                      연동됨
                    </span>
                  ) : (
                    <button
                      onClick={() => handleLinkBank(bank)}
                      style={{
                        fontSize: 12, fontWeight: 700, color: '#fff', background: '#1e3a8a',
                        border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer',
                        boxShadow: '0 1px 2px 0 rgba(30,58,138,0.2)'
                      }}
                    >
                      연동하기
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ⚠️ 계좌 제거 팝업 */}
      {pendingRemoval && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#fff', borderRadius: 20,
            width: '85%', maxWidth: 300, padding: '24px 20px 20px',
            textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>계좌 연결 해제</h4>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 20px' }}>
              해제하시면 자산 목록에서 제외되어 자산이 없어집니다. 정말 해제하시겠습니까?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setPendingRemoval(null)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  removeAccount(pendingRemoval.bankId, pendingRemoval.accountId);
                  setPendingRemoval(null);
                }}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, border: 'none',
                  background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}
              >
                해제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 성공 토스트 */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', padding: '12px 24px', borderRadius: 99,
          fontSize: 13, fontWeight: 600, zIndex: 1100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toastMsg}
        </div>
      )}
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
  { id: 'salary-split', icon: '💰', title: '월급 나눈 비율 재설정', desc: '각 계좌별 분배 비율을 다시 정해요', to: '/asset-prescription' },
  { id: 'portfolio', icon: '📊', title: '포트폴리오 재설정', desc: '흐름·상품 구성을 수정해요', to: '/asset-portfolio' },
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

function NotificationPanel({ onClose, items, onMarkRead, onMarkAll }: {
  onClose: () => void;
  items: NotiItem[];
  onMarkRead: (id: string) => void;
  onMarkAll: () => void;
}) {
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
            <button onClick={onMarkAll} style={{ fontSize: 12, fontWeight: 500, color: '#64748b', border: 'none', background: 'none', cursor: 'pointer' }}>모두 읽음</button>
          )}
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="닫기">✕</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '8px 12px 20px', overflowY: 'auto' }}>
        {items.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            아직 알림이 없어요
          </div>
        )}
        {items.map(n => (
          <div key={n.id} onClick={() => onMarkRead(n.id)}
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

interface SpendingAlarmPanelProps {
  onClose: () => void;
  totalExpense: number;
  categories: DashboardCategoryExpense[];
}

function SpendingAlarmPanel({ onClose, totalExpense, categories }: SpendingAlarmPanelProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const ALARM_EXPENSE_COLORS = ['#D85A30', '#EF9F27', '#7F77DD', '#378ADD', '#1D9E75', '#94a3b8'];

  const ALARM_EXPENSE_HINTS: Record<string, string> = {
    '식비': '식비 지출이 크게 늘었어요.\n지난달 대비 +42% 증가하여 예산 초과의 가장 큰 원인입니다.',
    '쇼핑': '온라인 쇼핑몰 결제가 잦았어요.\n지난달 대비 +21% 증가했습니다.',
    '문화/여가': '뮤지컬 등 여가 비용으로 지난달 대비 +18% 증가했습니다.',
    '기타': '카페 및 소액 지출 위주로 지출액의 11%를 차지하고 있습니다.',
    '교통': '택시 호출 서비스 이용이 소폭 늘어났습니다.',
  };

  // Cumulative spending up to Week 3 alert point = 85만 원 (850,000 KRW)
  const alarmCategories = [
    { category: '식비', value: 357000 },
    { category: '쇼핑', value: 178500 },
    { category: '문화/여가', value: 153000 },
    { category: '기타', value: 93500 },
    { category: '교통', value: 68000 },
  ];

  const total = alarmCategories.reduce((s, c) => s + c.value, 0);

  const formatKRWMan = (val: number) => {
    return `${Math.round(val / 10000).toLocaleString()}만 원`;
  };

  const cx = 64, cy = 64, outerR = 56, innerR = 36;
  let cum = 0;

  const slices = alarmCategories.map((c, i) => {
    const pct = (c.value / total) * 100;
    const start = cum;
    cum += pct;
    const o1 = pctToXY(cx, cy, outerR, start);
    const o2 = pctToXY(cx, cy, outerR, cum);
    const i2 = pctToXY(cx, cy, innerR, cum);
    const i1 = pctToXY(cx, cy, innerR, start);
    const large = pct > 50 ? 1 : 0;
    return {
      path: `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y} L ${i2.x} ${i2.y} A ${innerR} ${innerR} 0 ${large} 0 ${i1.x} ${i1.y} Z`,
      pct,
      color: ALARM_EXPENSE_COLORS[i % ALARM_EXPENSE_COLORS.length],
      label: c.category,
      value: c.value
    };
  });

  const active = activeIdx !== null ? slices[activeIdx] : null;
  const hint = activeIdx !== null ? ALARM_EXPENSE_HINTS[alarmCategories[activeIdx].category] : null;

  return (
    <div style={{
      background: '#fff', borderRadius: '20px 20px 0 0',
      display: 'flex', flexDirection: 'column',
      maxWidth: 375, width: '100%', maxHeight: '92vh',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      overflowY: 'auto',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>소비 알람</span>
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontSize: 16, display: 'flex', alignItems: 'center' }} aria-label="닫기">✕</button>
      </div>

      <div style={{ padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Title */}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, textAlign: 'center' }}>
          지난달 소비 추세에서 벗어나요
        </h3>

        {/* 1. Line Chart comparing total spending with last month */}
        <div style={{ background: '#f8fafc', borderRadius: 16, padding: '16px 12px 12px', border: '0.5px solid #e2e8f0', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>총 지출을 지난달과 비교</span>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 10, fontSize: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 2, borderBottom: '2px dashed #EF9F27', display: 'inline-block' }} />
                <span style={{ color: '#64748b' }}>지난달</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 2, background: '#0f172a', display: 'inline-block' }} />
                <span style={{ color: '#0f172a', fontWeight: 600 }}>이번달</span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div style={{ position: 'relative', width: '100%', height: 160 }}>
            <svg width="100%" height="100%" viewBox="0 0 340 160" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              {/* Grid Lines & Y-axis Labels */}
              {[300000, 600000, 900000].map((val, idx) => {
                const y = 130 - (val / 900000) * 110;
                return (
                  <g key={idx}>
                    <line x1="45" y1={y} x2="320" y2={y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2 2" />
                    <text x="5" y={y + 4} fontSize="9" fontWeight="500" fill="#94a3b8">{val / 10000}만</text>
                  </g>
                );
              })}
              {/* Baseline */}
              <line x1="45" y1="130" x2="320" y2="130" stroke="#cbd5e1" strokeWidth="1" />

              {/* X-axis Labels */}
              {['1주', '2주', '3주', '4주'].map((label, idx) => {
                const x = 55 + idx * 80;
                return (
                  <text key={idx} x={x} y="150" textAnchor="middle" fontSize="10" fontWeight="600" fill="#64748b">{label}</text>
                );
              })}

              {/* Last Month (Orange dashed line) */}
              <path
                d="M 55 101.9 L 135 75 L 215 46.9 L 295 20"
                fill="none"
                stroke="#EF9F27"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {/* Last Month dots */}
              {[
                { x: 55, y: 101.9 },
                { x: 135, y: 75 },
                { x: 215, y: 46.9 },
                { x: 295, y: 20 },
              ].map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#EF9F27" strokeWidth="1.5" />
              ))}

              {/* This Month (Black solid line) */}
              <path
                d="M 55 108 L 135 78.7 L 215 26.1"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* This Month dots */}
              {[
                { x: 55, y: 108, highlight: false },
                { x: 135, y: 78.7, highlight: false },
                { x: 215, y: 26.1, highlight: true },
              ].map((p, idx) => (
                <g key={idx}>
                  {p.highlight ? (
                    <>
                      {/* Pulse effect */}
                      <circle cx={p.x} cy={p.y} r="8" fill="#E24B4A" opacity="0.2">
                        <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={p.x} cy={p.y} r="4.5" fill="#E24B4A" stroke="#fff" strokeWidth="1.5" />
                      {/* Siren Icon above point */}
                      <foreignObject x={p.x - 12} y={p.y - 32} width="24" height="24">
                        <div style={{ fontSize: '18px', textAlign: 'center', animation: 'bounce 1s infinite alternate' }}>🚨</div>
                      </foreignObject>
                    </>
                  ) : (
                    <circle cx={p.x} cy={p.y} r="4" fill="#0f172a" stroke="#fff" strokeWidth="1.5" />
                  )}
                </g>
              ))}
            </svg>
            <style>{`
              @keyframes bounce {
                from { transform: translateY(0); }
                to { transform: translateY(-4px); }
              }
            `}</style>
          </div>
        </div>

        {/* 2. Category Analysis (Agent commentary) */}
        <div style={{
          background: '#FEFCE8',
          border: '1px solid #EF9F27',
          borderRadius: 16,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          boxShadow: '0 2px 4px rgba(239, 159, 39, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>🐳</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#854F0B' }}>Pori의 분석</span>
          </div>
          <p style={{ fontSize: 13, color: '#451a03', margin: 0, lineHeight: 1.5 }}>
            <span style={{ color: '#E24B4A', fontWeight: 800 }}>식비</span> 지출이 지난달에 비해 많은 것 같아요!
          </p>
          <p style={{ fontSize: 12, color: '#78350f', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            이번 달 3주 차에 식비 지출이 급증했어요. 배달앱 이용 빈도가 지난달 동기 대비 높은 흐름을 보이고 있으니, 남은 기간 동안 지출 조절이 필요합니다.
          </p>
        </div>

        {/* 3. This Month's Accumulated Spending Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>이번달 누적 소비</h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 128, height: 128, flexShrink: 0 }}>
              <svg width="128" height="128" viewBox="0 0 128 128">
                {slices.map((s, i) => (
                  <path key={i} d={s.path} fill={s.color}
                    opacity={activeIdx === null || activeIdx === i ? 1 : 0.25}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseLeave={() => setActiveIdx(null)}
                    style={{ cursor: 'default', transition: 'opacity 0.15s' }}
                  />
                ))}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none', width: 70 }}>
                {active ? (
                  <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: active.color, lineHeight: 1.4 }}>{active.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{active.pct.toFixed(0)}%</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1.4 }}>누적 소비</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{formatKRWMan(total)}</div>
                  </>
                )}
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {slices.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: activeIdx === i ? s.color : '#475569', fontWeight: activeIdx === i ? 600 : 400, flex: 1, transition: 'color 0.15s' }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{s.pct.toFixed(0)}% ({Math.round(s.value / 10000)}만)</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 4, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '0.5px solid #e2e8f0', minHeight: 48, fontSize: 12, color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-line', transition: 'all 0.2s' }}>
            {hint ?? <span style={{ color: '#94a3b8', fontSize: 11 }}>항목에 마우스를 올려 상세 분석을 확인해 보세요</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 대시보드 ───

export default function Dashboard() {
  const { token, userName: USER_NAME, logout, setUserName } = useAuth();
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

  // ── 대시보드 API 상태 ────────────────────────────────────
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    let cancelled = false;
    setLoadError(null);
    getDashboard()
      .then(d => {
        if (cancelled) return;
        setDashboard(d);
        if (d.user?.name) setUserName(d.user.name);
      })
      .catch(e => { if (!cancelled) setLoadError(e instanceof Error ? e.message : '대시보드 조회 실패'); });
    return () => { cancelled = true; };
  }, [token, navigate, setUserName]);

  // ── UI 상태 ──────────────────────────────────────────────
  const [bannerVisible, setBannerVisible] = useState(true);
  const [salaryMgmtOpen, setSalaryMgmtOpen] = useState(false);
  const [monthlyReportOpen, setMonthlyReportOpen] = useState(false);
  const [anomalyOpen, setAnomalyOpen] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);
  const [portfolioDetailOpen, setPortfolioDetailOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notiItems, setNotiItems] = useState<NotiItem[]>([]);
  const [accountMgmtOpen, setAccountMgmtOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [peerTab, setPeerTab] = useState<'asset' | 'product'>('asset');
  const [goals, setGoals] = useState<Goal[]>(() => {
    try { return JSON.parse(sessionStorage.getItem('user:goals') ?? '[]'); } catch { return []; }
  });
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [spendingAlarmOpen, setSpendingAlarmOpen] = useState(false);

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

  // ── 알림 로드 + SSE 구독 ─────────────────────────────────
  useEffect(() => {
    getNotifications()
      .then(list => {
        const mockList: ApiNotification[] = [
          {
            id: 'mock-1',
            type: 'SALARY_REBALANCING',
            title: '월급이 들어왔네요!',
            content: '새로 나눴어요! 확인하고 자동이체할게요.',
            isRead: false,
            sentAt: new Date(Date.now() - 60000).toISOString(),
          },
          {
            id: 'mock-2',
            type: 'SPENDING_TREND',
            title: '밸런싱 붕괴 조짐이 보여요',
            content: '이번 달 소비 속도가 빠르게 올라가고 있어요...',
            isRead: false,
            sentAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          },
          {
            id: 'mock-3',
            type: 'REPORT_READY',
            title: '2026년 5월 월간 리포트가 도착했어요!',
            content: '이주형님만을 위한 5월 종합 리포트...',
            isRead: false,
            sentAt: new Date(Date.now() - 24 * 3600000).toISOString(),
          },
          {
            id: 'mock-4',
            type: 'CONCERT_INFO',
            title: '이번 달 관심받고 있는 공연 소식이에요!',
            content: '이주형님의 취향을 기반으로...',
            isRead: false,
            sentAt: new Date(Date.now() - 24 * 3600000).toISOString(),
          },
          {
            id: 'mock-5',
            type: 'GOVT_POLICY',
            title: '이주형님만을 위한 정부 정책을 가져왔어요',
            content: '자격증 지원금을 신청해보세요! 최대 50만 원을 돌려받을 수 있어요.',
            isRead: true,
            sentAt: new Date(Date.now() - 48 * 3600000).toISOString(),
          }
        ];

        const combined = [...mockList, ...list.filter(n => !mockList.some(m => m.title === n.title))];
        const items = combined.map(toNotiItem);
        setNotiItems(items);
        if (items.some(n => !n.read && n.icon === '💳')) {
          setBannerVisible(true);
        }
      })
      .catch(err => console.error('[Dashboard] 알림 조회 실패:', err));

    const ctrl = subscribeToNotifications({
      onNotification: (n) => {
        setNotiItems(prev => [toNotiItem(n), ...prev]);
      },
      onSalaryArrived: () => setBannerVisible(true),
    });

    return () => ctrl.abort();
  }, []);

  const handleMarkRead = (id: string) => {
    const clicked = notiItems.find(n => n.id === id);
    setNotiItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (!id.startsWith('mock-')) {
      readNotification(id).catch(err => console.error('[Dashboard] 읽음 처리 실패:', err));
    }
    if (clicked && clicked.type === 'SPENDING_TREND') {
      setNotiOpen(false);
      setSpendingAlarmOpen(true);
    }
    if (clicked && clicked.type === 'REPORT_READY') {
      setNotiOpen(false);
      setMonthlyReportOpen(true);
    }
    if (clicked && (clicked.type === 'SALARY_REBALANCING' || clicked.type === 'SALARY_ARRIVED')) {
      setNotiOpen(false);
      setSalaryMgmtOpen(true);
    }
  };

  const handleMarkAll = () => {
    setNotiItems(prev => prev.map(n => ({ ...n, read: true })));
    readAllNotifications().catch(err => console.error('[Dashboard] 전체 읽음 실패:', err));
  };

  // ── 표시용 헬퍼 ─────────────────────────────────────────
  const fmtManwon = (n: number) => `${Math.round(n / 10000).toLocaleString()}만 원`;

  // 월급 분배 도넛 데이터 (allocations + 투자 + 잉여금 → SalaryDonutChart 슬라이스)
  const SALARY_PALETTE = ['#EF9F27', '#7F77DD', '#378ADD', '#1D9E75', '#e2e8f0'];
  const INVEST_COLOR = '#1D9E75';
  const SURPLUS_COLOR = '#cbd5e1';
  const salarySlices: PortfolioSlice[] = dashboard
    ? (() => {
      const income = dashboard.salaryPlan.monthlyIncome;
      const toPct = (amt: number) => income > 0 ? Math.round(amt / income * 100) : 0;

      const allocSlices = dashboard.salaryPlan.allocations.map((a, i) => ({
        label: a.purpose ?? '기타',
        pct: toPct(a.plannedAmount),
        color: SALARY_PALETTE[i % SALARY_PALETTE.length],
      }));

      const slices: PortfolioSlice[] = [...allocSlices];
      if (dashboard.salaryPlan.investmentAmount > 0) {
        slices.push({ label: '투자', pct: toPct(dashboard.salaryPlan.investmentAmount), color: INVEST_COLOR });
      }
      if (dashboard.salaryPlan.surplus > 0) {
        slices.push({ label: '잉여금', pct: toPct(dashboard.salaryPlan.surplus), color: SURPLUS_COLOR });
      }
      return slices;
    })()
    : [];

  // 소비 카테고리 색상 (API 카테고리명 → 표시 색상 매핑)
  const SPENDING_COLOR: Record<string, string> = {
    '식비': '#D85A30',
    '문화/여가': '#D85A30',
    '온라인쇼핑': '#A32D2D',
    '교통': '#D85A30',
    '기타': '#D85A30',
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
    'ETF': '#1D9E75',
    '현금성': '#5DCAA5',
    '적금': '#9FE1CB',
    'IRP': '#085041',
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
                  <line x1="3" y1="6" x2="21" y2="6" />
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
                { label: '투자 자산', value: fmtManwon(dashboard.assetsSummary.investmentBalance) },
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
                <button onClick={e => { e.stopPropagation(); setSpendingAlarmOpen(true); }} style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 99, background: '#F7C1C1', color: '#791F1F', border: 'none', cursor: 'pointer' }}>⚠ 이상 소비 감지</button>
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
            <NotificationPanel onClose={() => setNotiOpen(false)} items={notiItems} onMarkRead={handleMarkRead} onMarkAll={handleMarkAll} />
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
              onNavigate={(to) => { setSettingsOpen(false); navigate(to, { state: { mode: 'edit' } }); }}
            />
          </div>
        </div>
      )}

      {/* 월급 관리 overlay */}
      {salaryMgmtOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <SalaryManagement onClose={() => setSalaryMgmtOpen(false)} />
        </div>
      )}

      {/* 소비 알람 overlay */}
      {spendingAlarmOpen && (
        <div
          onClick={() => setSpendingAlarmOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', zIndex: 999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ width: '100%', maxWidth: 375, display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
            <SpendingAlarmPanel
              onClose={() => setSpendingAlarmOpen(false)}
              totalExpense={dashboard.consumption.totalExpense}
              categories={dashboard.consumption.categories}
            />
          </div>
        </div>
      )}

      {/* 월간 리포트 overlay */}
      {monthlyReportOpen && (
        <div
          onClick={() => setMonthlyReportOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', zIndex: 999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              width: '100%', maxWidth: 375, display: 'flex', justifyContent: 'center',
              background: '#fff', borderRadius: '20px 20px 0 0',
              maxHeight: '92vh', overflowY: 'auto',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <MonthlyReport onClose={() => setMonthlyReportOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
