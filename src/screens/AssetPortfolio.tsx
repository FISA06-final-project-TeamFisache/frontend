import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const STEP_COLORS = [
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#EEEDFE', color: '#534AB7' },
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#EAF3DE', color: '#3B6D11' },
];

// ─── 카탈로그 ───────────────────────────────────────

interface AccountItem {
  id: string;
  bank: string;        // 기관명 (예: 카카오뱅크)
  name: string;        // 통장 이름 (예: 입출금통장)
  number: string;      // 계좌번호 (마스킹된 형태)
  logo: string;
  bg: string;
  color: string;
}

const SOURCE_CATALOG: AccountItem[] = [
  { id: 'kakao-1',   bank: '카카오뱅크', name: '입출금통장',          number: '3333-01-****567',  logo: 'K', bg: '#FEE500', color: '#3C1E1E' },
  { id: 'kakao-2',   bank: '카카오뱅크', name: '세이프박스',          number: '3333-02-****890',  logo: 'K', bg: '#FEE500', color: '#3C1E1E' },
  { id: 'toss-1',    bank: '토스증권',   name: '종합매매계좌',        number: '5601-01-****234',  logo: 'T', bg: '#3182F6', color: '#fff'    },
  { id: 'shinhan-1', bank: '신한은행',   name: 'Tops 직장인 플랜',    number: '110-***-456789',   logo: 'S', bg: '#0046FF', color: '#fff'    },
  { id: 'hana-1',    bank: '하나은행',   name: '하나원큐 입출금',     number: '623-******-501',   logo: 'H', bg: '#009F6B', color: '#fff'    },
  { id: 'woori-1',   bank: '우리은행',   name: 'WON 우월한 월급통장', number: '1002-***-345678',  logo: 'W', bg: '#0067AC', color: '#fff'    },
  { id: 'nh-1',      bank: 'NH농협',     name: '주거래 통장',         number: '352-****-1122-99', logo: 'N', bg: '#19CE60', color: '#fff'    },
  { id: 'kb-1',      bank: '국민은행',   name: 'Star 입출금통장',     number: '004-**-7788-12',   logo: 'K', bg: '#FFCD00', color: '#3C1E1E' },
  { id: 'ibk-1',     bank: '기업은행',   name: '급여 자동이체',       number: '202-******-001',   logo: 'I', bg: '#005BAC', color: '#fff'    },
];

interface HubItem {
  id: string;
  logo: string;
  logoBg: string;
  logoColor: string;
  name: string;          // 통장 이름
  number: string;        // 계좌번호 (마스킹)
  sub: string;
  cardBg: string;
  border: string;
  nameColor: string;
  subColor: string;
  kind: '일반' | 'IRP' | 'ISA';
  hubLabel: string;
}

const HUB_CATALOG: HubItem[] = [
  { id: 'toss-park',   logo: 'T',   logoBg: '#3182F6', logoColor: '#fff',    name: '토스뱅크 파킹통장',     number: '1000-12-****345', sub: '연 2.5% · 수시입출금',         cardBg: '#EEEDFE', border: '#AFA9EC', nameColor: '#3C3489', subColor: '#534AB7', kind: '일반', hubLabel: '토스뱅크' },
  { id: 'shinhan-cma', logo: '증권', logoBg: '#085041', logoColor: '#9FE1CB', name: '투자증권 CMA',          number: '8001-77-****092', sub: '연 3.1% · 수시입출금',         cardBg: '#E1F5EE', border: '#5DCAA5', nameColor: '#085041', subColor: '#0F6E56', kind: '일반', hubLabel: '투자증권' },
  { id: 'kakao-park',  logo: 'K',   logoBg: '#FEE500', logoColor: '#3C1E1E', name: '카카오뱅크 세이프박스',  number: '3333-09-****123', sub: '연 2.2% · 수시입출금',         cardBg: '#FEF9C3', border: '#FCD34D', nameColor: '#854D0E', subColor: '#A16207', kind: '일반', hubLabel: '카카오뱅크' },
  { id: 'mirae-irp',   logo: '미래', logoBg: '#FF8200', logoColor: '#fff',    name: '미래에셋증권 IRP',     number: '910-22-****678',  sub: '연 16.5% 세액공제 · 노후 대비', cardBg: '#FFF4E6', border: '#FFB873', nameColor: '#9A4D00', subColor: '#C45500', kind: 'IRP',  hubLabel: '미래에셋 IRP' },
  { id: 'samsung-irp', logo: '삼성', logoBg: '#1428A0', logoColor: '#fff',    name: '삼성증권 IRP',         number: '550-15-****321',  sub: '연 16.5% 세액공제 · 안정형',   cardBg: '#E0E7FF', border: '#818CF8', nameColor: '#3730A3', subColor: '#4338CA', kind: 'IRP',  hubLabel: '삼성 IRP' },
  { id: 'ki-isa',      logo: 'ISA', logoBg: '#1F2937', logoColor: '#FBBF24', name: '한국투자 중개형 ISA',   number: '720-88-****456',  sub: '비과세 200만원 한도 · 절세',   cardBg: '#FEF3C7', border: '#F59E0B', nameColor: '#92400E', subColor: '#B45309', kind: 'ISA',  hubLabel: '중개형 ISA' },
  { id: 'kiwoom-isa',  logo: 'ISA', logoBg: '#FF2C2C', logoColor: '#fff',    name: '키움증권 중개형 ISA',   number: '630-44-****789',  sub: '비과세 한도 활용 · 절세',      cardBg: '#FEE2E2', border: '#FCA5A5', nameColor: '#991B1B', subColor: '#B91C1C', kind: 'ISA',  hubLabel: '키움 ISA' },
];

interface ProductItem {
  id: string;
  type: 'ETF' | '적금' | 'TDF' | '채권' | '리츠' | '주식';
  name: string;
  description: string;
  recommended?: boolean;
  icon: 'trending-up' | 'piggy-bank';
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
}

const PRODUCT_CATALOG: ProductItem[] = [
  // ETF
  { id: 'etf-tiger-snp',  type: 'ETF',  name: 'TIGER S&P500',         description: '미국 대표 500개 기업에 분산 투자. 장기 우상향 기대 1순위.',          recommended: true,  icon: 'trending-up', iconColor: '#A32D2D', badgeBg: '#FCEBEB', badgeColor: '#A32D2D' },
  { id: 'etf-kodex-nas',  type: 'ETF',  name: 'KODEX 나스닥100',      description: '미국 빅테크 100종목 추종. 변동성은 크지만 성장성 매력.',             recommended: true,  icon: 'trending-up', iconColor: '#A32D2D', badgeBg: '#FCEBEB', badgeColor: '#A32D2D' },
  { id: 'etf-kodex-200',  type: 'ETF',  name: 'KODEX 200',            description: '코스피200 추종, 국내 시장 대표 ETF. 환율 영향이 적어요.',          recommended: false, icon: 'trending-up', iconColor: '#A32D2D', badgeBg: '#FCEBEB', badgeColor: '#A32D2D' },
  { id: 'etf-tiger-divi', type: 'ETF',  name: 'TIGER 미국배당다우존스', description: '꾸준한 배당 받기 좋은 미국 배당주 ETF. 안정 지향에 적합.',         recommended: false, icon: 'trending-up', iconColor: '#A32D2D', badgeBg: '#FCEBEB', badgeColor: '#A32D2D' },
  // 적금
  { id: 'sav-woori',      type: '적금', name: '우리 정기적금',         description: '연 4.1% (12개월) · 우리은행 대표 정기적금 상품.',                   recommended: true,  icon: 'piggy-bank',  iconColor: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#185FA5' },
  { id: 'sav-kakao-26',   type: '적금', name: '카카오뱅크 26주 적금',   description: '연 7.0%(최고) · 매주 늘려 모으는 26주 단기 적금.',                 recommended: true,  icon: 'piggy-bank',  iconColor: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#185FA5' },
  { id: 'sav-toss',       type: '적금', name: '토스뱅크 자유적금',      description: '연 4.5% · 자유롭게 입금 가능한 적금.',                              recommended: false, icon: 'piggy-bank',  iconColor: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#185FA5' },
  { id: 'sav-shinhan',    type: '적금', name: '신한 쏠편한 적금',       description: '연 3.8% · 자동이체 우대 제공.',                                     recommended: false, icon: 'piggy-bank',  iconColor: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#185FA5' },
  // TDF / 채권 / 리츠
  { id: 'tdf-mirae-2045', type: 'TDF',  name: '미래에셋 TDF2045',     description: '은퇴시점(2045)에 맞춰 자동 자산배분. IRP 대표 상품.',              recommended: true,  icon: 'trending-up', iconColor: '#534AB7', badgeBg: '#EEEDFE', badgeColor: '#534AB7' },
  { id: 'tdf-samsung',    type: 'TDF',  name: '삼성 한국형TDF2050',   description: '국내 자산 비중을 늘린 한국형 TDF. 환위험 완화.',                    recommended: false, icon: 'trending-up', iconColor: '#534AB7', badgeBg: '#EEEDFE', badgeColor: '#534AB7' },
  { id: 'bnd-tiger-10y',  type: '채권', name: 'TIGER 국채10년',       description: '국채 10년물 추종. 안정적 이자 수익 기대.',                          recommended: true,  icon: 'piggy-bank',  iconColor: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#185FA5' },
  { id: 'bnd-kodex-corp', type: '채권', name: 'KODEX 단기채권',       description: '단기 회사채/국공채 추종. 변동성 낮음.',                              recommended: false, icon: 'piggy-bank',  iconColor: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#185FA5' },
  { id: 'reit-macq',      type: '리츠', name: '맥쿼리인프라',         description: '국내 인프라 리츠. 분기배당으로 현금흐름 확보.',                      recommended: true,  icon: 'trending-up', iconColor: '#0F6E56', badgeBg: '#E1F5EE', badgeColor: '#0F6E56' },
  { id: 'reit-shinhan',   type: '리츠', name: '신한알파리츠',         description: '오피스/물류센터 리츠. 안정적 임대수익.',                              recommended: false, icon: 'trending-up', iconColor: '#0F6E56', badgeBg: '#E1F5EE', badgeColor: '#0F6E56' },
];

// ─── Flow 타입 ───────────────────────────────────────

interface FlowSource { logo: string; bg: string; color: string; bank: string; name: string; number: string; amt: number; }
interface FlowProduct { productId: string; pct: number; barColor: string; }

type FlowTerm = '단기' | '중기' | '장기';

interface Flow {
  label: string;
  shortLabel: string;
  title: string;
  summary: string;
  term: FlowTerm;
  kind: '일반' | 'IRP' | 'ISA';
  hubId: string;
  rate: string;
  projected: string;
  badgeBg: string;
  badgeColor: string;
  sources: FlowSource[];
  products: FlowProduct[];
}

const TERM_STYLE: Record<FlowTerm, { bg: string; color: string }> = {
  단기: { bg: '#FEF3C7', color: '#92400E' },
  중기: { bg: '#DBEAFE', color: '#1D4ED8' },
  장기: { bg: '#E0E7FF', color: '#4338CA' },
};

type FlowKey = 'a' | 'b' | 'c' | 'd';
type TabKey = 'all' | FlowKey;

const INITIAL_FLOWS: Record<FlowKey, Flow> = {
  a: {
    label: '알약 A', shortLabel: '알약A',
    title: '당장 쓸 돈 든든히 모으기',
    summary: '비상금·생활비 베이스를 단단히 다져요',
    term: '단기',
    kind: '일반', hubId: 'toss-park',
    rate: '+8.4%', projected: '1.1억', badgeBg: '#EEEDFE', badgeColor: '#534AB7',
    sources: [
      { logo: 'K', bg: '#FEE500', color: '#3C1E1E', bank: '카카오뱅크', name: '입출금통장',   number: '3333-01-****567', amt: 150 },
      { logo: 'T', bg: '#3182F6', color: '#fff',    bank: '토스증권',   name: '종합매매계좌', number: '5601-01-****234', amt: 60  },
    ],
    products: [
      { productId: 'etf-tiger-snp', pct: 70, barColor: '#E24B4A' },
      { productId: 'sav-woori',     pct: 30, barColor: '#378ADD' },
    ],
  },
  b: {
    label: '알약 B', shortLabel: '알약B',
    title: '5년 안 목돈 만들기',
    summary: '중기 목표를 위한 균형 성장 전략',
    term: '중기',
    kind: '일반', hubId: 'shinhan-cma',
    rate: '+7.1%', projected: '7,200만', badgeBg: '#E1F5EE', badgeColor: '#0F6E56',
    sources: [
      { logo: 'S', bg: '#0046FF', color: '#fff', bank: '신한은행', name: 'Tops 직장인 플랜',  number: '110-***-456789', amt: 60 },
      { logo: 'H', bg: '#009F6B', color: '#fff', bank: '하나은행', name: '하나원큐 입출금',   number: '623-******-501', amt: 40 },
    ],
    products: [
      { productId: 'etf-kodex-nas', pct: 60, barColor: '#E24B4A' },
      { productId: 'sav-kakao-26',  pct: 40, barColor: '#378ADD' },
    ],
  },
  c: {
    label: '알약 C', shortLabel: '알약C',
    title: '노후 대비하며 세금 환급 받기',
    summary: 'IRP로 매년 연말정산 환급까지 챙겨요',
    term: '장기',
    kind: 'IRP', hubId: 'mirae-irp',
    rate: '+6.2%', projected: '4,500만', badgeBg: '#FFF4E6', badgeColor: '#C45500',
    sources: [
      { logo: 'K', bg: '#FEE500', color: '#3C1E1E', bank: '카카오뱅크', name: '입출금통장', number: '3333-01-****567', amt: 50 },
    ],
    products: [
      { productId: 'tdf-mirae-2045', pct: 50, barColor: '#534AB7' },
      { productId: 'bnd-tiger-10y',  pct: 50, barColor: '#378ADD' },
    ],
  },
  d: {
    label: '알약 D', shortLabel: '알약D',
    title: '절세하며 공격적으로 불리기',
    summary: 'ISA 비과세 한도로 수익률을 더 챙겨요',
    term: '중기',
    kind: 'ISA', hubId: 'ki-isa',
    rate: '+9.1%', projected: '6,800만', badgeBg: '#FEF3C7', badgeColor: '#B45309',
    sources: [
      { logo: 'S', bg: '#0046FF', color: '#fff', bank: '신한은행', name: 'Tops 직장인 플랜', number: '110-***-456789',   amt: 50 },
      { logo: 'N', bg: '#19CE60', color: '#fff', bank: 'NH농협',   name: '주거래 통장',      number: '352-****-1122-99', amt: 30 },
    ],
    products: [
      { productId: 'etf-kodex-200', pct: 60, barColor: '#E24B4A' },
      { productId: 'reit-macq',     pct: 40, barColor: '#639922' },
    ],
  },
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'a',   label: '알약A' },
  { key: 'b',   label: '알약B' },
  { key: 'c',   label: '알약C' },
  { key: 'd',   label: '알약D' },
];

const sourceTotal = (flow: Flow) => flow.sources.reduce((s, x) => s + x.amt, 0);
const lookupHub = (id: string) => HUB_CATALOG.find(h => h.id === id) ?? HUB_CATALOG[0];
const lookupProduct = (id: string) => PRODUCT_CATALOG.find(p => p.id === id) ?? PRODUCT_CATALOG[0];

// ─── 공통 서브컴포넌트 ─────────────────────────────

function Logo({ letter, bg, color, size = 20 }: { letter: string; bg: string; color: string; size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: Math.round(size * 0.28), background: bg, color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.44, fontWeight: 500, flexShrink: 0,
    }}>
      {letter}
    </span>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px', marginTop: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{value}</span>
    </div>
  );
}

function Connector() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
      <div style={{ width: 1, height: 10, background: '#e2e8f0' }} />
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
        <path d="M1 1l5 6 5-6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function StepCard({ num, title, sub, children, action }: { num: number; title: string; sub: string; children: ReactNode; action?: ReactNode }) {
  const c = STEP_COLORS[num - 1];
  return (
    <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 14, padding: '14px 14px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <span style={{ width: 20, height: 20, borderRadius: '50%', background: c.bg, color: c.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>{num}</span>
        <span style={{ fontSize: 15, fontWeight: 500, color: '#0f172a' }}>{title}</span>
        <span style={{ marginLeft: 'auto' }}>{action}</span>
      </div>
      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px', paddingLeft: 28 }}>{sub}</p>
      <div style={{ paddingLeft: 28 }}>{children}</div>
    </div>
  );
}

function ProductIcon({ icon, color, size = 18 }: { icon: 'trending-up' | 'piggy-bank'; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {icon === 'trending-up' ? (
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      ) : (
        <>
          <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z" />
          <path d="M2 9v1c0 1.1.9 2 2 2h1" />
        </>
      )}
    </svg>
  );
}

// ─── 편집 모달 상태 ─────────────────────────────────

type EditorMode =
  | null
  | { type: 'source-pick';  flowKey: FlowKey; sourceIdx: number | 'new' }
  | { type: 'hub-pick';     flowKey: FlowKey }
  | { type: 'product-pick'; flowKey: FlowKey; productIdx: number | 'new' };

const BAR_COLORS = ['#E24B4A', '#378ADD', '#534AB7', '#3B6D11', '#C45500', '#639922', '#0F6E56'];

// ─── 흐름 상세 (A/B/C/D) ─────────────────────────────

interface FlowDetailProps {
  flowKey: FlowKey;
  flow: Flow;
  onEdit: (mode: EditorMode) => void;
  onAmount: (sourceIdx: number, amt: number) => void;
  onRemoveSource: (sourceIdx: number) => void;
  onPct: (productIdx: number, pct: number) => void;
  onRemoveProduct: (productIdx: number) => void;
}

function FlowDetail({ flowKey, flow, onEdit, onAmount, onRemoveSource, onPct, onRemoveProduct }: FlowDetailProps) {
  const hub = lookupHub(flow.hubId);
  const total = sourceTotal(flow);

  return (
    <div>
      {/* 흐름 헤더 */}
      <div style={{ marginBottom: 14, padding: '12px 14px', background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 99 }}>{flow.label}</span>
          <span style={{ fontSize: 10, fontWeight: 700, background: TERM_STYLE[flow.term].bg, color: TERM_STYLE[flow.term].color, padding: '3px 8px', borderRadius: 99 }}>{flow.term}</span>
          {flow.kind !== '일반' && (
            <span style={{ fontSize: 10, background: flow.badgeBg, color: flow.badgeColor, padding: '3px 8px', borderRadius: 99, fontWeight: 700 }}>{flow.kind}</span>
          )}
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 3px', lineHeight: 1.35 }}>{flow.title}</p>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{flow.summary}</p>
      </div>

      {/* 1. 끌어오기 */}
      <StepCard
        num={1}
        title="끌어오기"
        sub="이 통장들에서 가져와요 (금액 직접 수정 가능)"
        action={
          <button
            onClick={() => onEdit({ type: 'source-pick', flowKey, sourceIdx: 'new' })}
            style={{ fontSize: 11, fontWeight: 600, color: '#3182F6', background: '#EFF6FF', border: 'none', borderRadius: 99, padding: '4px 10px', cursor: 'pointer' }}
          >
            + 통장 추가
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {flow.sources.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f8fafc', border: '0.5px solid #e2e8f0', borderRadius: 10 }}>
              <button
                onClick={() => onEdit({ type: 'source-pick', flowKey, sourceIdx: i })}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', minWidth: 0, flex: 1 }}
              >
                <Logo letter={s.logo} bg={s.bg} color={s.color} size={26} />
                <div style={{ minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, lineHeight: 1.2 }}>{s.bank}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', borderBottom: '1px dashed #cbd5e1', display: 'inline-block', lineHeight: 1.3, marginTop: 1 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', marginTop: 1 }}>{s.number}</div>
                </div>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <input
                  type="number"
                  value={s.amt}
                  onChange={(e) => onAmount(i, Math.max(0, parseInt(e.target.value || '0', 10)))}
                  style={{ width: 56, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#0f172a', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 6px', outline: 'none' }}
                />
                <span style={{ fontSize: 11, color: '#64748b' }}>만</span>
                <button
                  onClick={() => onRemoveSource(i)}
                  aria-label="통장 제거"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, marginLeft: 2 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <MiniCard label="소계" value={`${total}만원`} />
      </StepCard>
      <Connector />

      {/* 2. 모으기 */}
      <StepCard
        num={2}
        title="모으기"
        sub={flow.kind === '일반' ? '여기에 한 번 모아둬요' : `${flow.kind} 계좌로 모아둬요`}
        action={
          <button
            onClick={() => onEdit({ type: 'hub-pick', flowKey })}
            style={{ fontSize: 11, fontWeight: 600, color: '#3182F6', background: '#EFF6FF', border: 'none', borderRadius: 99, padding: '4px 10px', cursor: 'pointer' }}
          >
            변경
          </button>
        }
      >
        <button
          onClick={() => onEdit({ type: 'hub-pick', flowKey })}
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: hub.cardBg, border: `1px solid ${hub.border}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <Logo letter={hub.logo} bg={hub.logoBg} color={hub.logoColor} size={30} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: hub.nameColor }}>{hub.name}</div>
            <div style={{ fontSize: 10, color: hub.subColor, fontFamily: 'monospace', marginTop: 1 }}>{hub.number}</div>
            <div style={{ fontSize: 11, color: hub.subColor, marginTop: 2 }}>{hub.sub}</div>
          </div>
        </button>
      </StepCard>
      <Connector />

      {/* 3. 넣기 */}
      <StepCard
        num={3}
        title="넣기"
        sub="상품을 탭하면 변경할 수 있어요"
        action={
          <button
            onClick={() => onEdit({ type: 'product-pick', flowKey, productIdx: 'new' })}
            style={{ fontSize: 11, fontWeight: 600, color: '#3182F6', background: '#EFF6FF', border: 'none', borderRadius: 99, padding: '4px 10px', cursor: 'pointer' }}
          >
            + 상품 추가
          </button>
        }
      >
        {flow.products.length > 0 ? (
          <div style={{ display: 'flex', height: 6, borderRadius: 99, overflow: 'hidden', gap: 2, marginBottom: 10 }}>
            {flow.products.map((p, i) => <div key={i} style={{ width: `${p.pct}%`, background: p.barColor }} />)}
          </div>
        ) : (
          <div style={{ padding: '10px 0 4px', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
            아직 담은 상품이 없어요. <span style={{ color: '#3182F6', fontWeight: 600 }}>+ 상품 추가</span>로 시작해보세요.
          </div>
        )}
        {flow.products.map((p, i, arr) => {
          const prod = lookupProduct(p.productId);
          const amt = Math.round(total * p.pct / 100);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none', gap: 8 }}>
              <button
                onClick={() => onEdit({ type: 'product-pick', flowKey, productIdx: i })}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', minWidth: 0, flex: 1, textAlign: 'left' }}
              >
                <ProductIcon icon={prod.icon} color={prod.iconColor} size={16} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: prod.badgeBg, color: prod.badgeColor, padding: '1px 6px', borderRadius: 99 }}>{prod.type}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', borderBottom: '1px dashed #cbd5e1' }}>{prod.name}</span>
                  </div>
                </div>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="number"
                  value={p.pct}
                  onChange={(e) => onPct(i, Math.max(0, Math.min(100, parseInt(e.target.value || '0', 10))))}
                  style={{ width: 44, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#0f172a', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 6px', outline: 'none' }}
                />
                <span style={{ fontSize: 11, color: '#64748b' }}>%</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginLeft: 6, minWidth: 40, textAlign: 'right' }}>{amt}만</span>
                <button
                  onClick={() => onRemoveProduct(i)}
                  aria-label="상품 제거"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, marginLeft: 2 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
                </button>
              </div>
            </div>
          );
        })}
      </StepCard>
      <Connector />

      {/* 4. 불리기 */}
      <StepCard num={4} title="불리기" sub="이렇게 불어나요">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 7 }}>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 11, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>예상 수익률</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#3B6D11' }}>{flow.rate}</div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 11, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>4년 후 예상</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#0f172a' }}>{flow.projected}</div>
          </div>
        </div>
      </StepCard>
    </div>
  );
}

// ─── 전체 한눈에 ─────────────────────────────

const parseRatePct = (s: string) => parseFloat(s.replace(/[^0-9.\-]/g, '')) || 0;

// TODO: 월급 리밸런싱(AssetPrescription) 결과에서 흐름별 분배액을 받아 교체
const FLOW_MONTHLY_MOCK = 30; // 만원 단위, 임시 고정값

function AllOverview({ flows, onSelectFlow }: { flows: Record<FlowKey, Flow>; onSelectFlow: (k: FlowKey) => void }) {
  const entries = Object.entries(flows) as [FlowKey, Flow][];
  const totalMonthly = entries.length * FLOW_MONTHLY_MOCK;
  const avgRate = entries.reduce((sum, [, f]) => sum + parseRatePct(f.rate), 0) / entries.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 10 }}>한 달 자산 흐름 요약</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 7 }}>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 11, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>월 총 투자액</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{totalMonthly}만원</div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 11, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>평균 수익률(예상)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#3B6D11' }}>+{avgRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {entries.map(([key, f]) => {
        const hub = lookupHub(f.hubId);
        const total = FLOW_MONTHLY_MOCK;
        return (
          <button
            key={key}
            onClick={() => onSelectFlow(key)}
            style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 14, padding: 14 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '2px 7px', borderRadius: 99 }}>{f.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, background: TERM_STYLE[f.term].bg, color: TERM_STYLE[f.term].color, padding: '2px 7px', borderRadius: 99 }}>{f.term}</span>
                  {f.kind !== '일반' && (
                    <span style={{ fontSize: 10, background: f.badgeBg, color: f.badgeColor, padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>{f.kind}</span>
                  )}
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>{f.title}</p>
                <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0', lineHeight: 1.3 }}>{f.summary}</p>
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', paddingTop: 2 }}>자세히 ›</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
              {f.sources.map((s, i) => <Logo key={i} letter={s.logo} bg={s.bg} color={s.color} size={22} />)}
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" style={{ margin: '0 2px', flexShrink: 0 }}>
                <path d="M1 5h10M8 2l3 3-3 3" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <Logo letter={hub.logo} bg={hub.logoBg} color={hub.logoColor} size={22} />
              <span style={{ fontSize: 11, color: '#64748b', marginLeft: 6 }}>{hub.hubLabel}</span>
            </div>

            <div style={{ display: 'flex', height: 5, borderRadius: 99, overflow: 'hidden', gap: 2, marginBottom: 8 }}>
              {f.products.map((p, i) => <div key={i} style={{ width: `${p.pct}%`, background: p.barColor }} />)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>월 <strong style={{ color: '#0f172a', fontWeight: 600 }}>{total}만원</strong></span>
              <span style={{ fontSize: 11, color: '#64748b' }}>
                예상 <span style={{ color: '#3B6D11', fontWeight: 700 }}>{f.rate}</span>
                <span style={{ marginLeft: 6 }}>· 4년 후 <strong style={{ color: '#0f172a', fontWeight: 600 }}>{f.projected}</strong></span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── 모달들 ─────────────────────────────────────────

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 360, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose} aria-label="닫기" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SourcePickerModal({ currentName, onClose, onPick }: { currentName?: string; onClose: () => void; onPick: (a: AccountItem) => void }) {
  return (
    <ModalShell title="통장 선택" onClose={onClose}>
      <div style={{ padding: 14, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SOURCE_CATALOG.map(a => {
            const isCurrent = currentName === a.name;
            return (
              <button
                key={a.id}
                onClick={() => onPick(a)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: isCurrent ? '#EFF6FF' : '#fff',
                  border: `1.5px solid ${isCurrent ? '#3182F6' : '#e2e8f0'}`,
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <Logo letter={a.logo} bg={a.bg} color={a.color} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500 }}>{a.bank}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 1 }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', marginTop: 1 }}>{a.number}</div>
                </div>
                {isCurrent && <span style={{ fontSize: 11, color: '#3182F6', fontWeight: 700 }}>현재</span>}
              </button>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}

function HubPickerModal({ currentId, onClose, onPick }: { currentId: string; onClose: () => void; onPick: (h: HubItem) => void }) {
  const [filter, setFilter] = useState<'전체' | '일반' | 'IRP' | 'ISA'>('전체');
  const filtered = filter === '전체' ? HUB_CATALOG : HUB_CATALOG.filter(h => h.kind === filter);
  return (
    <ModalShell title="모으는 계좌 선택" onClose={onClose}>
      <div style={{ padding: '10px 14px 0' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {(['전체', '일반', 'IRP', 'ISA'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
                border: 'none', cursor: 'pointer',
                background: filter === f ? '#0f172a' : '#f1f5f9',
                color: filter === f ? '#fff' : '#64748b',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 14px 14px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(h => {
            const isCurrent = h.id === currentId;
            return (
              <button
                key={h.id}
                onClick={() => onPick(h)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: isCurrent ? '#EFF6FF' : '#fff',
                  border: `1.5px solid ${isCurrent ? '#3182F6' : '#e2e8f0'}`,
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <Logo letter={h.logo} bg={h.logoBg} color={h.logoColor} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{h.name}</span>
                    {h.kind !== '일반' && (
                      <span style={{ fontSize: 9, fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: 99 }}>{h.kind}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', marginTop: 1 }}>{h.number}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{h.sub}</div>
                </div>
                {isCurrent && <span style={{ fontSize: 11, color: '#3182F6', fontWeight: 700 }}>현재</span>}
              </button>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}

function ProductPickerModal({ currentId, mode, onClose, onPick }: { currentId?: string; mode: 'add' | 'replace'; onClose: () => void; onPick: (p: ProductItem) => void }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'전체' | ProductItem['type']>('전체');
  const [selected, setSelected] = useState<ProductItem | null>(currentId ? lookupProduct(currentId) : null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCT_CATALOG.filter(p => {
      if (typeFilter !== '전체' && p.type !== typeFilter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.type.toLowerCase().includes(q);
    });
  }, [query, typeFilter]);

  const recommended = filtered.filter(p => p.recommended);
  const others = filtered.filter(p => !p.recommended);

  const renderItem = (p: ProductItem) => {
    const isSelected = selected?.id === p.id;
    return (
      <button
        key={p.id}
        onClick={() => setSelected(p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
          background: isSelected ? '#EFF6FF' : '#fff',
          border: `1.5px solid ${isSelected ? '#3182F6' : '#e2e8f0'}`,
          borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%',
        }}
      >
        <ProductIcon icon={p.icon} color={p.iconColor} size={20} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: p.badgeBg, color: p.badgeColor, padding: '1px 6px', borderRadius: 99 }}>{p.type}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{p.name}</span>
          </div>
        </div>
        {p.id === currentId && <span style={{ fontSize: 11, color: '#3182F6', fontWeight: 700 }}>현재</span>}
      </button>
    );
  };

  return (
    <ModalShell title="상품 선택" onClose={onClose}>
      <div style={{ padding: '10px 14px 0' }}>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="상품명·유형·설명으로 검색"
            style={{
              width: '100%', padding: '9px 12px 9px 32px', fontSize: 12, borderRadius: 10,
              border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
          {(['전체', 'ETF', '적금', 'TDF', '채권', '리츠', '주식'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
                border: 'none', cursor: 'pointer',
                background: typeFilter === t ? '#0f172a' : '#f1f5f9',
                color: typeFilter === t ? '#fff' : '#64748b',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px' }}>
        {recommended.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              <span style={{ fontSize: 12 }}>⭐</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>추천 상품</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recommended.map(renderItem)}
            </div>
          </div>
        )}
        {others.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>전체 상품</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {others.map(renderItem)}
            </div>
          </div>
        )}
        {filtered.length === 0 && (
          <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
            검색 결과가 없어요
          </div>
        )}
      </div>

      {/* 선택된 상품 상세 + 확정 버튼 */}
      {selected && (
        <div style={{ borderTop: '1px solid #f1f5f9', padding: 14, background: '#f8fafc' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>선택한 상품</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: selected.badgeBg, color: selected.badgeColor, padding: '1px 6px', borderRadius: 99 }}>{selected.type}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{selected.name}</span>
            {selected.recommended && <span style={{ fontSize: 11 }}>⭐</span>}
          </div>
          <p style={{ fontSize: 11, color: '#475569', margin: '0 0 10px', lineHeight: 1.5 }}>{selected.description}</p>
          <button
            onClick={() => onPick(selected)}
            style={{
              width: '100%', padding: '11px 0', fontSize: 13, fontWeight: 700,
              background: '#3182F6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
            }}
          >
            {mode === 'add' ? '이 상품 추가하기' : '이 상품으로 변경'}
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────

export default function AssetPortfolio() {
  const { userName: USER_NAME } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('all');
  const [flows, setFlows] = useState<Record<FlowKey, Flow>>(INITIAL_FLOWS);
  const [editor, setEditor] = useState<EditorMode>(null);

  const updateFlow = (key: FlowKey, patch: (prev: Flow) => Flow) => {
    setFlows(prev => ({ ...prev, [key]: patch(prev[key]) }));
  };

  const handleAmount = (key: FlowKey, sourceIdx: number, amt: number) => {
    updateFlow(key, f => ({
      ...f,
      sources: f.sources.map((s, i) => i === sourceIdx ? { ...s, amt } : s),
    }));
  };

  const handleRemoveSource = (key: FlowKey, sourceIdx: number) => {
    updateFlow(key, f => ({
      ...f,
      sources: f.sources.filter((_, i) => i !== sourceIdx),
    }));
  };

  const handlePct = (key: FlowKey, productIdx: number, pct: number) => {
    updateFlow(key, f => ({
      ...f,
      products: f.products.map((p, i) => i === productIdx ? { ...p, pct } : p),
    }));
  };

  const handleSourcePick = (a: AccountItem) => {
    if (!editor || editor.type !== 'source-pick') return;
    const { flowKey, sourceIdx } = editor;
    updateFlow(flowKey, f => {
      if (sourceIdx === 'new') {
        return { ...f, sources: [...f.sources, { logo: a.logo, bg: a.bg, color: a.color, bank: a.bank, name: a.name, number: a.number, amt: 0 }] };
      }
      return {
        ...f,
        sources: f.sources.map((s, i) => i === sourceIdx ? { ...s, logo: a.logo, bg: a.bg, color: a.color, bank: a.bank, name: a.name, number: a.number } : s),
      };
    });
    setEditor(null);
  };

  const handleHubPick = (h: HubItem) => {
    if (!editor || editor.type !== 'hub-pick') return;
    updateFlow(editor.flowKey, f => ({ ...f, hubId: h.id, kind: h.kind }));
    setEditor(null);
  };

  const handleProductPick = (p: ProductItem) => {
    if (!editor || editor.type !== 'product-pick') return;
    const { flowKey, productIdx } = editor;
    updateFlow(flowKey, f => {
      if (productIdx === 'new') {
        const barColor = BAR_COLORS[f.products.length % BAR_COLORS.length];
        return { ...f, products: [...f.products, { productId: p.id, pct: 0, barColor }] };
      }
      return {
        ...f,
        products: f.products.map((prod, i) => i === productIdx ? { ...prod, productId: p.id } : prod),
      };
    });
    setEditor(null);
  };

  const handleRemoveProduct = (key: FlowKey, productIdx: number) => {
    updateFlow(key, f => ({
      ...f,
      products: f.products.filter((_, i) => i !== productIdx),
    }));
  };

  return (
    <div style={{ fontFamily: "'Pretendard', sans-serif", background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '24px 16px 48px' }}>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div style={{ width: '100%', maxWidth: 375 }}>

        <p style={{ fontSize: 11, fontWeight: 500, color: '#64748b', margin: '0 0 4px' }}>Pori의 자산 처방전</p>
        <p style={{ fontSize: 20, fontWeight: 500, color: '#0f172a', lineHeight: 1.35, margin: '0 0 18px' }}>
          {USER_NAME} 님의 돈,<br />이렇게 불려드릴게요
        </p>

        {/* 탭 */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 14, marginBottom: 20, gap: 2 }}>
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, transition: 'all .15s',
                background: tab === key ? '#fff' : 'transparent',
                color: tab === key ? '#0f172a' : '#94a3b8',
                boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,.07)' : 'none',
              }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'all' && <AllOverview flows={flows} onSelectFlow={setTab} />}
        {tab !== 'all' && (
          <FlowDetail
            flowKey={tab}
            flow={flows[tab]}
            onEdit={setEditor}
            onAmount={(idx, amt) => handleAmount(tab, idx, amt)}
            onRemoveSource={(idx) => handleRemoveSource(tab, idx)}
            onPct={(idx, pct) => handlePct(tab, idx, pct)}
            onRemoveProduct={(idx) => handleRemoveProduct(tab, idx)}
          />
        )}

        {tab === 'all' && (
          <div style={{ marginTop: 24 }}>
            <button onClick={() => navigate('/dashboard')}
              style={{ width: '100%', padding: '16px 0', fontSize: 15, fontWeight: 700, background: '#3182F6', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(49,130,246,0.2)' }}>
              이 전략으로 관리 시작하기
            </button>
          </div>
        )}

      </div>

      {/* 편집 모달들 */}
      {editor?.type === 'source-pick' && (
        <SourcePickerModal
          currentName={editor.sourceIdx !== 'new' ? flows[editor.flowKey].sources[editor.sourceIdx]?.name : undefined}
          onClose={() => setEditor(null)}
          onPick={handleSourcePick}
        />
      )}
      {editor?.type === 'hub-pick' && (
        <HubPickerModal
          currentId={flows[editor.flowKey].hubId}
          onClose={() => setEditor(null)}
          onPick={handleHubPick}
        />
      )}
      {editor?.type === 'product-pick' && (
        <ProductPickerModal
          mode={editor.productIdx === 'new' ? 'add' : 'replace'}
          currentId={editor.productIdx === 'new' ? undefined : flows[editor.flowKey].products[editor.productIdx].productId}
          onClose={() => setEditor(null)}
          onPick={handleProductPick}
        />
      )}
    </div>
  );
}
