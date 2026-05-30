import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPortfolioFlows, getAvailableAssets, updatePortfolioFlow } from '../api/portfolioFlowApi';
import type { AvailableAsset, PortfolioFlow } from '../api/portfolioFlowApi';
import pillImg from '../assets/pill.png';
import kakaoImg  from '../assets/banks/kakao.png';
import tossImg   from '../assets/banks/toss.png';
import shinhanImg from '../assets/banks/shinhan.png';
import hanaImg   from '../assets/banks/hana.png';
import wooriImg  from '../assets/banks/woori.png';
import kbImg     from '../assets/banks/kb.png';
import miraeImg  from '../assets/banks/mirae.png';


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
  imgSrc?: string;
}

const SOURCE_CATALOG: AccountItem[] = [
  { id: 'kakao-1',   bank: '카카오뱅크', name: '입출금통장',          number: '3333-01-****567',  logo: 'K', bg: '#FEE500', color: '#3C1E1E', imgSrc: kakaoImg  },
  { id: 'kakao-2',   bank: '카카오뱅크', name: '세이프박스',          number: '3333-02-****890',  logo: 'K', bg: '#FEE500', color: '#3C1E1E', imgSrc: kakaoImg  },
  { id: 'toss-1',    bank: '토스증권',   name: '종합매매계좌',        number: '5601-01-****234',  logo: 'T', bg: '#3182F6', color: '#fff',    imgSrc: tossImg   },
  { id: 'shinhan-1', bank: '신한은행',   name: 'Tops 직장인 플랜',    number: '110-***-456789',   logo: 'S', bg: '#0046FF', color: '#fff',    imgSrc: shinhanImg },
  { id: 'hana-1',    bank: '하나은행',   name: '하나원큐 입출금',     number: '623-******-501',   logo: 'H', bg: '#009F6B', color: '#fff',    imgSrc: hanaImg   },
  { id: 'woori-1',   bank: '우리은행',   name: 'WON 우월한 월급통장', number: '1002-***-345678',  logo: 'W', bg: '#0067AC', color: '#fff',    imgSrc: wooriImg  },
  { id: 'nh-1',      bank: 'NH농협',     name: '주거래 통장',         number: '352-****-1122-99', logo: 'N', bg: '#19CE60', color: '#fff'    },
  { id: 'kb-1',      bank: '국민은행',   name: 'Star 입출금통장',     number: '004-**-7788-12',   logo: 'K', bg: '#FFCD00', color: '#3C1E1E', imgSrc: kbImg     },
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
  imgSrc?: string;
}

const HUB_CATALOG: HubItem[] = [
  { id: 'toss-park',   logo: 'T',   logoBg: '#3182F6', logoColor: '#fff',    name: '토스뱅크 파킹통장',     number: '1000-12-****345', sub: '연 2.5% · 수시입출금',         cardBg: '#EEEDFE', border: '#AFA9EC', nameColor: '#3C3489', subColor: '#534AB7', kind: '일반', hubLabel: '토스뱅크',    imgSrc: tossImg   },
  { id: 'shinhan-cma', logo: '증권', logoBg: '#085041', logoColor: '#9FE1CB', name: '투자증권 CMA',          number: '8001-77-****092', sub: '연 3.1% · 수시입출금',         cardBg: '#E1F5EE', border: '#5DCAA5', nameColor: '#085041', subColor: '#0F6E56', kind: '일반', hubLabel: '투자증권',  imgSrc: shinhanImg },
  { id: 'kakao-park',  logo: 'K',   logoBg: '#FEE500', logoColor: '#3C1E1E', name: '카카오뱅크 세이프박스',  number: '3333-09-****123', sub: '연 2.2% · 수시입출금',         cardBg: '#FEF9C3', border: '#FCD34D', nameColor: '#854D0E', subColor: '#A16207', kind: '일반', hubLabel: '카카오뱅크',  imgSrc: kakaoImg  },
  { id: 'mirae-irp',   logo: '미래', logoBg: '#FF8200', logoColor: '#fff',    name: '미래에셋증권 IRP',     number: '910-22-****678',  sub: '연 16.5% 세액공제 · 노후 대비', cardBg: '#FFF4E6', border: '#FFB873', nameColor: '#9A4D00', subColor: '#C45500', kind: 'IRP',  hubLabel: '미래에셋 IRP', imgSrc: miraeImg  },
  { id: 'samsung-irp', logo: '삼성', logoBg: '#1428A0', logoColor: '#fff',    name: '삼성증권 IRP',         number: '550-15-****321',  sub: '연 16.5% 세액공제 · 안정형',   cardBg: '#E0E7FF', border: '#818CF8', nameColor: '#3730A3', subColor: '#4338CA', kind: 'IRP',  hubLabel: '삼성 IRP' },
  { id: 'ki-isa',      logo: 'ISA', logoBg: '#1F2937', logoColor: '#FBBF24', name: '한국투자 중개형 ISA',   number: '720-88-****456',  sub: '비과세 200만 원 한도 · 절세',   cardBg: '#FEF3C7', border: '#F59E0B', nameColor: '#92400E', subColor: '#B45309', kind: 'ISA',  hubLabel: '중개형 ISA' },
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
  // ETF — DB명: 'TIGER 미국S&P500', 'KODEX 나스닥100'
  { id: 'etf-tiger-snp',  type: 'ETF',  name: 'TIGER 미국S&P500',     description: '미국 대표 500개 기업에 분산 투자. 장기 우상향 기대 1순위.',      recommended: true,  icon: 'trending-up', iconColor: '#A32D2D', badgeBg: '#FCEBEB', badgeColor: '#A32D2D' },
  { id: 'etf-kodex-nas',  type: 'ETF',  name: 'KODEX 나스닥100',      description: '미국 빅테크 100종목 추종. 변동성은 크지만 성장성 매력.',         recommended: true,  icon: 'trending-up', iconColor: '#A32D2D', badgeBg: '#FCEBEB', badgeColor: '#A32D2D' },
  { id: 'etf-kodex-200',  type: 'ETF',  name: 'KODEX 200',            description: '코스피200 추종, 국내 시장 대표 ETF. 환율 영향이 적어요.',      recommended: false, icon: 'trending-up', iconColor: '#A32D2D', badgeBg: '#FCEBEB', badgeColor: '#A32D2D' },
  { id: 'etf-tiger-divi', type: 'ETF',  name: 'TIGER 미국배당다우존스', description: '꾸준한 배당 받기 좋은 미국 배당주 ETF. 안정 지향에 적합.',     recommended: false, icon: 'trending-up', iconColor: '#A32D2D', badgeBg: '#FCEBEB', badgeColor: '#A32D2D' },
  // 적금 — DB명: 'WON 정기예금', '26주 적금', '토스 자유적금'
  { id: 'sav-woori',      type: '적금', name: 'WON 정기예금',          description: '연 3.5% (12개월) · 우리은행 대표 정기예금 상품.',               recommended: true,  icon: 'piggy-bank',  iconColor: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#185FA5' },
  { id: 'sav-kakao-26',   type: '적금', name: '26주 적금',             description: '연 7.0%(최고) · 매주 늘려 모으는 26주 단기 적금.',             recommended: true,  icon: 'piggy-bank',  iconColor: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#185FA5' },
  { id: 'sav-toss',       type: '적금', name: '토스 자유적금',          description: '연 4.5% · 자유롭게 입금 가능한 적금.',                          recommended: false, icon: 'piggy-bank',  iconColor: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#185FA5' },
  { id: 'sav-shinhan',    type: '적금', name: '신한 쏠편한 적금',       description: '연 3.8% · 자동이체 우대 제공.',                                 recommended: false, icon: 'piggy-bank',  iconColor: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#185FA5' },
  // TDF / 채권 / 리츠 — DB명: '미래에셋 TDF2045'
  { id: 'tdf-mirae-2045', type: 'TDF',  name: '미래에셋 TDF2045',     description: '은퇴시점(2045)에 맞춰 자동 자산배분. IRP 대표 상품.',          recommended: true,  icon: 'trending-up', iconColor: '#534AB7', badgeBg: '#EEEDFE', badgeColor: '#534AB7' },
  { id: 'tdf-samsung',    type: 'TDF',  name: '삼성 한국형TDF2050',   description: '국내 자산 비중을 늘린 한국형 TDF. 환위험 완화.',                recommended: false, icon: 'trending-up', iconColor: '#534AB7', badgeBg: '#EEEDFE', badgeColor: '#534AB7' },
  { id: 'bnd-tiger-10y',  type: '채권', name: 'TIGER 국채10년',       description: '국채 10년물 추종. 안정적 이자 수익 기대.',                      recommended: true,  icon: 'piggy-bank',  iconColor: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#185FA5' },
  { id: 'bnd-kodex-corp', type: '채권', name: 'KODEX 단기채권',       description: '단기 회사채/국공채 추종. 변동성 낮음.',                          recommended: false, icon: 'piggy-bank',  iconColor: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#185FA5' },
  { id: 'reit-macq',      type: '리츠', name: '맥쿼리인프라',         description: '국내 인프라 리츠. 분기배당으로 현금흐름 확보.',                  recommended: true,  icon: 'trending-up', iconColor: '#0F6E56', badgeBg: '#E1F5EE', badgeColor: '#0F6E56' },
  { id: 'reit-shinhan',   type: '리츠', name: '신한알파리츠',         description: '오피스/물류센터 리츠. 안정적 임대수익.',                          recommended: false, icon: 'trending-up', iconColor: '#0F6E56', badgeBg: '#E1F5EE', badgeColor: '#0F6E56' },
];

// ─── Flow 타입 ───────────────────────────────────────

interface FlowSource { logo: string; bg: string; color: string; bank: string; name: string; number: string; amt: number; imgSrc?: string; assetId?: string; }
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
  projectedPeriod: string;   // '6개월' | '1년' | '4년'
  badgeBg: string;
  badgeColor: string;
  sources: FlowSource[];
  products: FlowProduct[];
  apiId?: string; // 백엔드 flow UUID
  gatheringAssetId?: string; // 백엔드 gathering asset UUID
}

const TERM_STYLE: Record<FlowTerm, { bg: string; color: string }> = {
  단기: { bg: '#FECACA', color: '#991B1B' },
  중기: { bg: '#FDE68A', color: '#92400E' },
  장기: { bg: '#BBF7D0', color: '#166534' },
};

type FlowKey = 'a' | 'b' | 'c' | 'd';
type TermTab = 'all' | '단기' | '중기' | '장기1' | '장기2';

const FLOW_TERM_LABELS: Record<FlowKey, string> = { a: '단기', b: '중기', c: '장기1', d: '장기2' };

const INITIAL_FLOWS: Record<FlowKey, Flow> = {
  a: {
    label: '알약 A', shortLabel: '알약A',
    title: '당장 쓸 돈 든든히 모으기',
    summary: '비상금·생활비 베이스를 단단히 다져요',
    term: '단기',
    kind: '일반', hubId: 'toss-park',
    rate: '+8.4%', projected: '1.1억', projectedPeriod: '6개월', badgeBg: '#EEEDFE', badgeColor: '#534AB7',
    sources: [
      { logo: 'K', bg: '#FEE500', color: '#3C1E1E', bank: '카카오뱅크', name: '입출금통장',   number: '3333-01-****567', amt: 150, imgSrc: kakaoImg },
      { logo: 'T', bg: '#3182F6', color: '#fff',    bank: '토스증권',   name: '종합매매계좌', number: '5601-01-****234', amt: 60,  imgSrc: tossImg  },
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
    rate: '+7.1%', projected: '7,200만', projectedPeriod: '1년', badgeBg: '#E1F5EE', badgeColor: '#0F6E56',
    sources: [
      { logo: 'S', bg: '#0046FF', color: '#fff', bank: '신한은행', name: 'Tops 직장인 플랜',  number: '110-***-456789', amt: 60, imgSrc: shinhanImg },
      { logo: 'H', bg: '#009F6B', color: '#fff', bank: '하나은행', name: '하나원큐 입출금',   number: '623-******-501', amt: 40, imgSrc: hanaImg    },
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
    rate: '+6.2%', projected: '4,500만', projectedPeriod: '4년', badgeBg: '#FFF4E6', badgeColor: '#C45500',
    sources: [
      { logo: 'K', bg: '#FEE500', color: '#3C1E1E', bank: '카카오뱅크', name: '입출금통장', number: '3333-01-****567', amt: 50, imgSrc: kakaoImg },
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
    term: '장기',
    kind: 'ISA', hubId: 'ki-isa',
    rate: '+9.1%', projected: '6,800만', projectedPeriod: '4년', badgeBg: '#FEF3C7', badgeColor: '#B45309',
    sources: [
      { logo: 'S', bg: '#0046FF', color: '#fff', bank: '신한은행', name: 'Tops 직장인 플랜', number: '110-***-456789',   amt: 50, imgSrc: shinhanImg },
      { logo: 'N', bg: '#19CE60', color: '#fff', bank: 'NH농협',   name: '주거래 통장',      number: '352-****-1122-99', amt: 30 },
    ],
    products: [
      { productId: 'etf-kodex-200', pct: 60, barColor: '#E24B4A' },
      { productId: 'reit-macq',     pct: 40, barColor: '#639922' },
    ],
  },
};

const TERM_TABS: { key: TermTab; label: string }[] = [
  { key: 'all',  label: '전체' },
  { key: '단기', label: '단기' },
  { key: '중기', label: '중기' },
  { key: '장기1', label: '장기1' },
  { key: '장기2', label: '장기2' },
];

const sourceTotal = (flow: Flow) => flow.sources.reduce((s, x) => s + x.amt, 0);
const lookupHub = (id: string) => HUB_CATALOG.find(h => h.id === id) ?? HUB_CATALOG[0];
const lookupProduct = (id: string) => PRODUCT_CATALOG.find(p => p.id === id) ?? PRODUCT_CATALOG[0];

// PRODUCT_CATALOG type → 백엔드 ProductType 변환
const CATALOG_TYPE_TO_BACKEND: Record<string, string> = {
  'ETF':  'STOCK',
  '적금': 'SAVING',
  '주식': 'STOCK',
  'TDF':  'IRP',
  '채권': 'STOCK',
  '리츠': 'STOCK',
};

// ─── 공통 서브컴포넌트 ─────────────────────────────

function Logo({ letter, bg, color, size = 20, imgSrc }: { letter: string; bg: string; color: string; size?: number; imgSrc?: string }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: Math.round(size * 0.28),
      background: imgSrc ? '#fff' : bg, color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.44, fontWeight: 500, flexShrink: 0, overflow: 'hidden',
      border: imgSrc ? '0.5px solid #e2e8f0' : 'none',
    }}>
      {imgSrc
        ? <img src={imgSrc} alt={letter} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
        : letter}
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
          <span style={{ fontSize: 10, fontWeight: 700, background: TERM_STYLE[flow.term].bg, color: TERM_STYLE[flow.term].color, padding: '3px 8px', borderRadius: 99 }}>{FLOW_TERM_LABELS[flowKey]}</span>
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
                <Logo letter={s.logo} bg={s.bg} color={s.color} size={26} imgSrc={s.imgSrc} />
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
        <MiniCard label="소계" value={`${total}만 원`} />
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
          <Logo letter={hub.logo} bg={hub.logoBg} color={hub.logoColor} size={30} imgSrc={hub.imgSrc} />
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
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>{flow.projectedPeriod} 후 예상</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#0f172a' }}>{flow.projected}</div>
          </div>
        </div>
      </StepCard>
    </div>
  );
}

// ─── 전체 한눈에 ─────────────────────────────

const parseRatePct = (s: string) => parseFloat(s.replace(/[^0-9.\-]/g, '')) || 0;

// 파스텔 톤
const PIE_TERM_COLORS: Record<FlowTerm, string> = { 단기: '#FECACA', 중기: '#FDE68A', 장기: '#BBF7D0' };

// 탭·배지 색상
const TERM_COLORS: Record<string, { bg: string; text: string }> = {
  all:   { bg: '#ffffff', text: '#0f172a' },
  단기:  { bg: '#FECACA', text: '#991B1B' },
  중기:  { bg: '#FDE68A', text: '#92400E' },
  장기1: { bg: '#BBF7D0', text: '#166534' },
  장기2: { bg: '#BBF7D0', text: '#166534' },
};

function PieChart({ data }: { data: { pct: number; color: string; label: string; amt: number }[] }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const cx = 50, cy = 50, R = 44, r = 21;

  const toXY = (pct: number, radius: number) => {
    const a = (pct / 100) * 2 * Math.PI - Math.PI / 2;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)] as const;
  };

  let cum = 0;
  const selected = selectedIdx !== null ? data[selectedIdx] : null;

  return (
    <svg width="72" height="72" viewBox="0 0 100 100" style={{ flexShrink: 0, cursor: 'pointer' }}>
      {data.map((d, i) => {
        const start = cum;
        cum += d.pct;
        const [ox1, oy1] = toXY(start, R);
        const [ox2, oy2] = toXY(cum, R);
        const [ix2, iy2] = toXY(cum, r);
        const [ix1, iy1] = toXY(start, r);
        const large = d.pct > 50 ? 1 : 0;
        const path = `M ${ox1} ${oy1} A ${R} ${R} 0 ${large} 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${r} ${r} 0 ${large} 0 ${ix1} ${iy1} Z`;
        return (
          <path
            key={i}
            d={path}
            fill={d.color}
            opacity={selectedIdx === null || selectedIdx === i ? 1 : 0.3}
            onClick={() => setSelectedIdx(prev => prev === i ? null : i)}
          />
        );
      })}
      {/* 도넛 중앙 원 */}
      <circle cx={cx} cy={cy} r={r} fill="white" onClick={() => setSelectedIdx(null)} />
      {/* 중앙 텍스트 */}
      {selected ? (
        <>
          <text x={cx} y={cy - 7} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">{selected.label}</text>
          <text x={cx} y={cy + 3} textAnchor="middle" fontSize="8" fill="#64748b">{selected.pct.toFixed(0)}%</text>
          <text x={cx} y={cy + 13} textAnchor="middle" fontSize="8" fontWeight="600" fill="#0f172a">{selected.amt}만</text>
        </>
      ) : null}
    </svg>
  );
}

function ProductBar({ products }: { products: FlowProduct[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hoveredName = hoveredIdx !== null ? lookupProduct(products[hoveredIdx].productId).name : null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', height: 6, borderRadius: 99, overflow: 'hidden', gap: 2, marginBottom: 4 }}>
        {products.map((p, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ width: `${p.pct}%`, background: p.barColor, cursor: 'default' }}
          />
        ))}
      </div>
      <div style={{ fontSize: 10, minHeight: 14, color: '#64748b' }}>
        {hoveredName && (
          <span style={{ background: '#f1f5f9', padding: '1px 7px', borderRadius: 4 }}>
            {hoveredName}
          </span>
        )}
      </div>
    </div>
  );
}

function AllOverview({ flows, onSelectFlow }: { flows: Record<FlowKey, Flow>; onSelectFlow: (k: FlowKey) => void }) {
  const allEntries = Object.entries(flows) as [FlowKey, Flow][];

  // 항상 전체 기준으로 요약 계산
  const totalMonthly = allEntries.reduce((sum, [, f]) => sum + sourceTotal(f), 0);
  // 투자액 가중 평균 수익률 — 각 플로우의 연 수익률을 투자 비중으로 가중
  const weightedRate = totalMonthly > 0
    ? allEntries.reduce((sum, [, f]) => sum + parseRatePct(f.rate) * sourceTotal(f), 0) / totalMonthly
    : 0;
  // 예상 1년 수익: 월 납입 연금 FV 공식 기준
  const monthlyRate = weightedRate / 100 / 12;
  const annualFV = monthlyRate > 0
    ? totalMonthly * (Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate
    : totalMonthly * 12;
  const annualReturn = Math.round(annualFV - totalMonthly * 12);

  // 파이 차트 — 기간별 비중
  const termAmounts: Record<FlowTerm, number> = { 단기: 0, 중기: 0, 장기: 0 };
  allEntries.forEach(([, f]) => { termAmounts[f.term] += sourceTotal(f); });
  const pieData = (['단기', '중기', '장기'] as FlowTerm[])
    .filter(t => termAmounts[t] > 0)
    .map(t => ({ pct: (termAmounts[t] / totalMonthly) * 100, color: PIE_TERM_COLORS[t], label: t, amt: termAmounts[t] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* 요약 카드 */}
      <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 14, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PieChart data={pieData} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 72 }}>
            {/* 통계: 2열 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 1 }}>월 총 투자액</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{totalMonthly}만 원</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 1 }}>예상 1년 수익</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#16a34a', lineHeight: 1.2 }}>+{weightedRate.toFixed(1)}%</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#16a34a' }}>약 {annualReturn}만 원</div>
              </div>
            </div>
            {/* 범례 */}
            <div style={{ display: 'flex', gap: 8 }}>
              {pieData.map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.color }} />
                  <span style={{ fontSize: 9, color: '#94a3b8' }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 흐름 카드 목록 */}
      {allEntries.map(([key, f]) => {
        const hub = lookupHub(f.hubId);
        const total = sourceTotal(f);
        const termLabel = FLOW_TERM_LABELS[key];
        const tc = TERM_COLORS[termLabel] ?? TERM_COLORS.all;
        return (
          <button
            key={key}
            onClick={() => onSelectFlow(key)}
            style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 16, padding: '12px 14px' }}
          >
            {/* Row 1: 기간 배지 + kind 배지 | 자세히 보기 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: tc.bg, color: tc.text, padding: '3px 9px', borderRadius: 99 }}>
                  {termLabel}
                </span>
                {f.kind !== '일반' && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: f.badgeBg, color: f.badgeColor, padding: '2px 7px', borderRadius: 99 }}>
                    {f.kind}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>자세히 보기 ›</span>
            </div>

            {/* Row 2: 소스 → 허브 | 월 금액 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {f.sources.map((s, i) => <Logo key={i} letter={s.logo} bg={s.bg} color={s.color} size={20} imgSrc={s.imgSrc} />)}
                <svg width="12" height="9" viewBox="0 0 14 10" fill="none" style={{ margin: '0 2px', flexShrink: 0 }}>
                  <path d="M1 5h10M8 2l3 3-3 3" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <Logo letter={hub.logo} bg={hub.logoBg} color={hub.logoColor} size={20} imgSrc={hub.imgSrc} />
                <span style={{ fontSize: 11, color: '#64748b', marginLeft: 3 }}>{hub.hubLabel}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>월 {total}만 원</span>
            </div>

            {/* Row 3: 상품 바 */}
            <ProductBar products={f.products} />

            {/* Row 4: 수익률 | 기간 후 금액 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>{f.rate}</span>
              <span style={{ fontSize: 10, color: '#cbd5e1' }}>·</span>
              <span style={{ fontSize: 11, color: '#64748b' }}>
                {f.projectedPeriod} 후 <strong style={{ color: '#0f172a' }}>{f.projected}</strong>
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

function SourcePickerModal({ currentName, availableAssets, onClose, onPick }: { currentName?: string; availableAssets: AvailableAsset[]; onClose: () => void; onPick: (a: AccountItem) => void }) {
  const items: AccountItem[] = availableAssets.length > 0
    ? availableAssets.map(a => ({
        id: a.id,
        bank: a.institution ?? '',
        name: a.accountName ?? '',
        number: a.assetNumber ?? '',
        logo: (a.institution ?? '?').slice(0, 1),
        bg: '#E2E8F0',
        color: '#0F172A',
      }))
    : SOURCE_CATALOG;

  return (
    <ModalShell title="통장 선택" onClose={onClose}>
      <div style={{ padding: 14, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '24px 0' }}>연동된 계좌가 없습니다</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map(a => {
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
                  <Logo letter={a.logo} bg={a.bg} color={a.color} size={32} imgSrc={a.imgSrc} />
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
        )}
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
                <Logo letter={h.logo} bg={h.logoBg} color={h.logoColor} size={36} imgSrc={h.imgSrc} />
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

function apiFlowToFrontend(apiFlow: PortfolioFlow, key: FlowKey): Flow {
  const FLOW_LABELS: Record<FlowKey, { label: string; shortLabel: string }> = {
    a: { label: '알약 A', shortLabel: '알약A' },
    b: { label: '알약 B', shortLabel: '알약B' },
    c: { label: '알약 C', shortLabel: '알약C' },
    d: { label: '알약 D', shortLabel: '알약D' },
  };

  const termMap: Record<string, FlowTerm> = {
    단기: '단기', 단: '단기',
    중기: '중기', 중: '중기',
    장기: '장기', 장: '장기',
  };
  const term: FlowTerm = termMap[apiFlow.term ?? ''] ?? '중기';

  // term → 목표 기간(년)
  const termToYears = (t: FlowTerm): number => {
    if (t === '단기') return 0.5;
    if (t === '장기') return 4.0;
    return 1.0;
  };
  const targetYears = termToYears(term);
  const projectedPeriod = targetYears === 0.5 ? '6개월' : `${targetYears}년`;

  let kind: '일반' | 'IRP' | 'ISA' = '일반';
  const gType = apiFlow.gatheringAsset?.assetType?.toUpperCase() ?? '';
  if (gType === 'IRP') kind = 'IRP';
  else if (gType === 'ISA') kind = 'ISA';

  // hubId 매핑: gathering asset institution → HUB_CATALOG
  const gInstitution = apiFlow.gatheringAsset?.institution ?? '';
  const matchedHub = HUB_CATALOG.find(h => h.hubLabel.includes(gInstitution) || gInstitution.includes(h.hubLabel.split(' ')[0]));
  const hubId = matchedHub?.id ?? HUB_CATALOG[0].id;

  // 가중 평균 수익률
  const weightedRate = apiFlow.products.length > 0
    ? apiFlow.products.reduce((sum, p) => sum + (p.interestRate ?? 0) * ((p.productRatio ?? 0) / 100), 0)
    : 0;

  // 월 투자금 (원 단위) → 미래가치 계산
  const monthlyAmtWon = apiFlow.sources.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const monthlyRate = weightedRate / 100 / 12;
  const months = Math.round(targetYears * 12);
  const fvWon = monthlyRate > 0 && months > 0
    ? Math.round(monthlyAmtWon * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    : monthlyAmtWon * months;
  const projected = fvWon >= 100_000_000
    ? `${(fvWon / 100_000_000).toFixed(1)}억`
    : fvWon >= 10_000
    ? `${Math.round(fvWon / 10_000)}만`
    : '-';

  const sources: FlowSource[] = apiFlow.sources.map((s, i) => ({
    logo: (s.institution ?? '?').slice(0, 1),
    bg: '#E2E8F0',
    color: '#0F172A',
    bank: s.institution ?? '',
    name: s.accountName ?? '',
    number: s.assetNumber ?? '',
    amt: Math.round((s.amount ?? 0) / 10000),
    assetId: s.assetId ?? undefined,
    imgSrc: undefined,
  }));

  const products: FlowProduct[] = apiFlow.products.map((p, i) => {
    // productName으로 카탈로그 매칭 시도 (UUID가 카탈로그 ID와 다를 수 있음)
    const catalogMatch = p.productName
      ? PRODUCT_CATALOG.find(c =>
          c.name === p.productName ||
          c.name.includes(p.productName!) ||
          p.productName!.includes(c.name)
        )
      : null;
    return {
      productId: catalogMatch?.id ?? (p.productId ?? `api-${p.id}`),
      pct: p.productRatio ?? 0,
      barColor: BAR_COLORS[i % BAR_COLORS.length],
    };
  });

  return {
    ...FLOW_LABELS[key],
    title: apiFlow.title,
    summary: apiFlow.summary ?? '',
    term,
    kind,
    hubId,
    rate: `+${weightedRate.toFixed(1)}%`,
    projected,
    projectedPeriod,
    badgeBg: '#EEEDFE',
    badgeColor: '#534AB7',
    sources,
    products,
    apiId: apiFlow.id,
    gatheringAssetId: apiFlow.gatheringAsset?.id ?? undefined,
  };
}

export default function AssetPortfolio() {
  const { userName: USER_NAME } = useAuth();
  const navigate = useNavigate();
  const [termTab, setTermTab] = useState<TermTab>('all');
  const [detailFlowKey, setDetailFlowKey] = useState<FlowKey | null>(null);
  const [flows, setFlows] = useState<Record<FlowKey, Flow>>(INITIAL_FLOWS);
  const [editor, setEditor] = useState<EditorMode>(null);
  const [availableAssets, setAvailableAssets] = useState<AvailableAsset[]>([]);

  useEffect(() => {
    // 포트폴리오 흐름 로드
    getPortfolioFlows()
      .then(res => {
        const keys: FlowKey[] = ['a', 'b', 'c', 'd'];
        const loaded: Partial<Record<FlowKey, Flow>> = {};
        res.flows.forEach((apiFlow, i) => {
          if (i < keys.length) {
            loaded[keys[i]] = apiFlowToFrontend(apiFlow, keys[i]);
          }
        });
        if (Object.keys(loaded).length > 0) {
          setFlows(prev => ({ ...prev, ...loaded }));
        }
      })
      .catch(err => console.error('[AssetPortfolio] 흐름 로드 실패:', err));

    // 사용 가능한 계좌 로드 (source picker용)
    getAvailableAssets()
      .then(assets => setAvailableAssets(assets))
      .catch(err => console.error('[AssetPortfolio] 계좌 로드 실패:', err));
  }, []);

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
        return { ...f, sources: [...f.sources, { logo: a.logo, bg: a.bg, color: a.color, bank: a.bank, name: a.name, number: a.number, amt: 0, imgSrc: a.imgSrc, assetId: a.id }] };
      }
      return {
        ...f,
        sources: f.sources.map((s, i) => i === sourceIdx ? { ...s, logo: a.logo, bg: a.bg, color: a.color, bank: a.bank, name: a.name, number: a.number, imgSrc: a.imgSrc, assetId: a.id } : s),
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

  // 단기/중기/장기1/장기2 모두 단일 flow — 탭 클릭 시 바로 FlowDetail 진입
  const TERM_DIRECT: Partial<Record<string, FlowKey>> = { 단기: 'a', 중기: 'b', 장기1: 'c', 장기2: 'd' };
  const directKey = termTab !== 'all' ? (TERM_DIRECT[termTab] ?? null) : null;
  const activeFlowKey = directKey ?? detailFlowKey;
  const showDetail = activeFlowKey !== null;

  const handleBack = () => {
    if (directKey) {
      // 단기/중기 직접 탭 → 전체 탭으로
      setTermTab('all');
    } else if (detailFlowKey) {
      // 장기 또는 전체 탭의 상세 → 목록으로
      setDetailFlowKey(null);
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{ fontFamily: "'Pretendard', sans-serif", background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '0 0 48px' }}>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div style={{ width: '100%', maxWidth: 390 }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '16px 16px 0' }}>
          <button
            onClick={handleBack}
            style={{ position: 'absolute', left: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#64748b', display: 'flex', alignItems: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>자산 처방전</h1>
        </div>

        <div style={{ padding: '12px 16px 0' }}>
          {!showDetail && (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', lineHeight: 1.4, margin: 0 }}>
                {USER_NAME}님의 자산<br />이렇게 불려드릴게요
              </p>
              <img src={pillImg} alt="처방전" style={{ width: 72, height: 72, objectFit: 'contain', flexShrink: 0, marginTop: -24 }} />
            </div>
          )}

          {/* 탭 — 상세 뷰일 때 숨김 */}
          {!showDetail && (
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 14, marginBottom: 16, gap: 2 }}>
              {TERM_TABS.map(({ key, label }) => {
                const isActive = termTab === key;
                const c = TERM_COLORS[key] ?? TERM_COLORS.all;
                return (
                  <button
                    key={key}
                    onClick={() => { setTermTab(key); setDetailFlowKey(null); }}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
                      fontSize: 11, fontWeight: 700, transition: 'all .15s',
                      background: key === 'all'
                        ? (isActive ? '#fff' : 'transparent')
                        : (isActive ? c.bg : 'transparent'),
                      color: key === 'all'
                        ? (isActive ? '#0f172a' : '#94a3b8')
                        : (isActive ? c.text : '#b0b8c4'),
                      boxShadow: isActive ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* 개요 — 전체·장기 탭에서 상세 미선택 */}
          {!showDetail && (
            <AllOverview flows={flows} onSelectFlow={setDetailFlowKey} />
          )}

          {/* 상세 — 단기/중기 직접 진입 or 카드 클릭 진입 */}
          {showDetail && activeFlowKey && (
            <FlowDetail
              flowKey={activeFlowKey}
              flow={flows[activeFlowKey]}
              onEdit={setEditor}
              onAmount={(idx, amt) => handleAmount(activeFlowKey, idx, amt)}
              onRemoveSource={(idx) => handleRemoveSource(activeFlowKey, idx)}
              onPct={(idx, pct) => handlePct(activeFlowKey, idx, pct)}
              onRemoveProduct={(idx) => handleRemoveProduct(activeFlowKey, idx)}
            />
          )}

          {/* 하단 버튼 — overview일 때만 */}
          {!showDetail && (
            <div style={{ marginTop: 24 }}>
              <button onClick={async () => {
                // 변경된 흐름 저장
                const entries = Object.entries(flows) as [FlowKey, Flow][];
                await Promise.allSettled(
                  entries
                    .filter(([, f]) => f.apiId)
                    .map(([, f]) => updatePortfolioFlow(f.apiId!, {
                      gatheringAssetId: f.gatheringAssetId ?? null,
                      sources: f.sources
                        .filter(s => s.assetId)
                        .map(s => ({ assetId: s.assetId!, amount: s.amt * 10000 })),
                      products: f.products.map(p => {
                        const prod = lookupProduct(p.productId);
                        return {
                          productId: p.productId.startsWith('api-') ? null : p.productId,
                          productType: CATALOG_TYPE_TO_BACKEND[prod.type] ?? 'STOCK',
                          productRatio: p.pct,
                        };
                      }),
                    }))
                );
                navigate('/dashboard');
              }}
                style={{ width: '100%', padding: '16px 0', fontSize: 15, fontWeight: 700, background: '#3182F6', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(49,130,246,0.2)' }}>
                관리 시작하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 편집 모달들 */}
      {editor?.type === 'source-pick' && (
        <SourcePickerModal
          currentName={editor.sourceIdx !== 'new' ? flows[editor.flowKey].sources[editor.sourceIdx]?.name : undefined}
          availableAssets={availableAssets}
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
