import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getPortfolioFlows, getAvailableAssets, updatePortfolioFlow,
  type PortfolioFlow, type AvailableAsset, type PortfolioFlowUpdateRequest,
} from '../api/portfolioFlowApi';
import { getProducts } from '../api/productApi';
import pillImg from '../assets/etc/money1.png';
import poriLoadingVideo from '../assets/pori/pori_loading.mov';
import poriImg from '../assets/pori/point_pori.png';
import missionPoriImg from '../assets/pori/mirror_missionpori.jpg';
import {
  type HubItem, type ProductItem, type FlowProduct, type FlowTerm, type Flow,
  STEP_COLORS, BAR_COLORS, HUB_ASSET_TYPES,
  dynamicHubs, dynamicProducts, productApiTypeById,
  lookupHub, lookupProduct,
  isInvestableHub, assetToHubItem, productToCatalogItem,
  apiToFlow, buildFlowTabLabels, formatKrw, formatMonths, futureValueMonthly, withProjection,
} from '../components/assetPortfolio/portfolioRegistry';
import {
  Logo, ProductIcon,
  HubPickerModal, ProductPickerModal,
} from '../components/assetPortfolio/PortfolioModals';

// ─── 탭 타입 ─────────────────────────────────────────────
type TermTab = 'all' | FlowTerm;

const TERM_COLORS: Record<string, { bg: string; text: string }> = {
  all: { bg: '#ffffff', text: '#0f172a' },
  단기: { bg: '#FECACA', text: '#991B1B' },
  중기: { bg: '#FDE68A', text: '#92400E' },
  장기: { bg: '#BBF7D0', text: '#166534' },
};

const PIE_TERM_COLORS: Record<FlowTerm, string> = { 단기: '#FECACA', 중기: '#FDE68A', 장기: '#BBF7D0' };

// term별 막대 색상 — 같은 흐름의 상품끼리는 명암으로 구분 (단기=빨강, 중기=노랑, 장기=초록 계열)
const TERM_BAR_SHADES: Record<FlowTerm, string[]> = {
  단기: ['#FECACA', '#F87171', '#DC2626', '#991B1B', '#7F1D1D'],
  중기: ['#FDE68A', '#FBBF24', '#D97706', '#92400E', '#78350F'],
  장기: ['#BBF7D0', '#4ADE80', '#16A34A', '#166534', '#14532D'],
};
const termBarColor = (term: FlowTerm, idx: number): string => {
  const shades = TERM_BAR_SHADES[term] ?? TERM_BAR_SHADES.단기;
  return shades[idx % shades.length];
};

const parseRatePct = (s: string) => parseFloat(s.replace(/[^0-9.\-]/g, '')) || 0;

// AI 설명 텍스트 내 핵심 토큰(금액·비율·기간·혜택)을 굵게+파란색으로 강조
const HL_SPLIT = /([+\-]?\d[\d,]*(?:\.\d+)?\s?(?:만\s?원|원|%|개월|년)|비과세|세액공제|복리)/g;
const HL_TOKEN = /^(?:[+\-]?\d[\d,]*(?:\.\d+)?\s?(?:만\s?원|원|%|개월|년)|비과세|세액공제|복리)$/;
function highlightReasoning(text: string): ReactNode[] {
  return text.split(HL_SPLIT).filter(Boolean).map((part, i) =>
    HL_TOKEN.test(part)
      ? <span key={i} style={{ fontWeight: 700, color: '#1d4ed8' }}>{part}</span>
      : <span key={i}>{part}</span>,
  );
}

// flow의 구조화된 필드에서 핵심 정보 칩 추출 (prose 파싱 아님)
function flowChips(flow: Flow): { icon: string; label: string }[] {
  const chips: { icon: string; label: string }[] = [{ icon: '🗂️', label: flow.term }];
  if (flow.projectedMonths > 0) chips.push({ icon: '📅', label: formatMonths(flow.projectedMonths) });
  if (flow.kind && flow.kind !== '일반') chips.push({ icon: '🏦', label: flow.kind });
  const r = flow.rate?.trim();
  if (r && r !== '+0%' && r !== '0%') chips.push({ icon: '📈', label: `예상 ${r}` });
  return chips;
}

const ASSET_TYPE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  IRP: { label: 'IRP', bg: '#FFF4E6', color: '#9A4D00' },
  ISA: { label: 'ISA', bg: '#FEF3C7', color: '#92400E' },
  PENSION_SAVINGS: { label: '연금저축', bg: '#EEEDFE', color: '#534AB7' },
};

// 흐름 정렬 — 단기 → 중기 → 장기 (같은 term 내 순서는 API 순서 유지: 안정 정렬)
const TERM_ORDER: Record<FlowTerm, number> = { 단기: 0, 중기: 1, 장기: 2 };
const sortFlowsByTerm = (flows: Flow[]): Flow[] =>
  [...flows].sort((a, b) => TERM_ORDER[a.term] - TERM_ORDER[b.term]);

// ─── 편집 모달 상태 타입 ──────────────────────────────────
type EditorMode =
  | null
  | { type: 'hub-pick'; flowId: string }
  | { type: 'product-pick'; flowId: string; productIdx: number | 'new' };

// ─── 공통 서브컴포넌트 ─────────────────────────────────────

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

function StepCard({ num, title, sub, children, action }: { num: number; title: string; sub: ReactNode; children: ReactNode; action?: ReactNode }) {
  const c = STEP_COLORS[num - 1];
  return (
    <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 14, padding: '14px 14px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <span style={{ width: 20, height: 20, borderRadius: '50%', background: c.bg, color: c.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>{num}</span>
        <span style={{ fontSize: 15, fontWeight: 500, color: '#0f172a' }}>{title}</span>
        <span style={{ marginLeft: 'auto' }}>{action}</span>
      </div>
      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px', paddingLeft: 28 }}>{sub}</p>
      <div>{children}</div>
    </div>
  );
}

// ─── 흐름 상세 ────────────────────────────────────────────

interface FlowDetailProps {
  flow: Flow;
  onEdit: (mode: EditorMode) => void;
  onPct: (productIdx: number, pct: number) => void;
  onFlowAmount: (amount: number) => void;
  onRemoveProduct: (productIdx: number) => void;
}

function FlowDetail({ flow, onEdit, onPct, onFlowAmount, onRemoveProduct }: FlowDetailProps) {
  const hub = lookupHub(flow.hubId);
  const total = flow.amount;
  const investable = isInvestableHub(flow.hubAssetType);
  // 막대는 허브 금액 대비가 아니라 담긴 상품들끼리의 상대 비중으로 표시 (항상 100% 채움)
  const ratioSum = flow.products.reduce((s, p) => s + p.pct, 0);
  const pctSum = ratioSum || 1;
  // 상품 비중 합이 100%를 넘으면 허브 금액(45만 원)보다 많이 배분된 상태 → 경고
  const allocatedTotal = flow.products.reduce((s, p) => s + Math.round(total * p.pct / 100), 0);
  const isOverAllocated = flow.products.length > 0 && ratioSum > 100;

  return (
    <div>
      {flow.reasoning && (
        <div className="relative flex items-center gap-4 mb-4 rounded-2xl p-4 border border-sky-200 shadow-md overflow-hidden" style={{ background: 'linear-gradient(150deg, #f0faff 0%, #e0f2fe 55%, #bae6fd 100%)' }}>
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 390 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,24 C65,8 130,38 195,24 C260,10 325,38 390,24 L390,48 L0,48 Z" fill="rgba(186,230,253,0.4)" />
            <path d="M0,32 C80,18 160,44 240,30 C305,20 355,38 390,32 L390,48 L0,48 Z" fill="rgba(147,197,253,0.35)" />
            <path d="M0,40 C55,28 125,48 195,38 C255,30 325,44 390,40 L390,48 L0,48 Z" fill="rgba(125,211,252,0.45)" />
          </svg>
          <img src={poriImg} alt="Pori" className="w-20 h-20 object-contain shrink-0 z-10" />
          <div className="flex-1 min-w-0 z-10">
            <div className="inline-flex items-center gap-1 bg-sky-200 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full mb-2">
              🤖 AI Pori의 설명
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {flowChips(flow).map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-white/70 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
                  <span>{c.icon}</span>{c.label}
                </span>
              ))}
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{highlightReasoning(flow.reasoning)}</p>
          </div>
        </div>
      )}

      {/* 1. 모으기 */}
      <StepCard
        num={1}
        title="모으기"
        sub={
          <>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{flow.title}</span>
            <br />
            {flow.summary}
          </>
        }
        action={
          <button
            onClick={() => onEdit({ type: 'hub-pick', flowId: flow.id })}
            style={{ fontSize: 11, fontWeight: 600, color: '#3182F6', background: '#EFF6FF', border: 'none', borderRadius: 99, padding: '4px 10px', cursor: 'pointer' }}
          >
            변경
          </button>
        }
      >
        {flow.isRecommendation && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 8, padding: '8px 11px', background: '#EFF6FF', borderRadius: 8 }}>
            <span style={{ fontSize: 12, flexShrink: 0 }}>✨</span>
            <span style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 500, lineHeight: 1.5 }}>
              포리가 추천한 <strong>아직 개설 전</strong>인 계좌예요. 저장하면 자동으로 새로 개설돼요.
            </span>
          </div>
        )}
        <button
          onClick={() => onEdit({ type: 'hub-pick', flowId: flow.id })}
          style={{
            width: '100%', cursor: 'pointer', borderRadius: 10, padding: '12px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', gap: 12,
            background: flow.isRecommendation ? '#F8FAFF' : hub.cardBg,
            border: flow.isRecommendation ? '1.5px dashed #60A5FA' : `1px solid ${hub.border}`,
          }}
        >
          <Logo letter={hub.logo} bg={hub.logoBg} color={hub.logoColor} size={36} imgSrc={hub.imgSrc} />
          <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: flow.isRecommendation ? '#1E40AF' : hub.nameColor }}>{hub.name}</div>
            <div style={{ fontSize: 10, color: hub.subColor, fontFamily: 'monospace', marginTop: 1 }}>{hub.number}</div>
            <div style={{ fontSize: 11, color: hub.subColor, marginTop: 2 }}>{hub.sub}</div>
          </div>
          {flow.isRecommendation && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#3182F6', background: '#DBEAFE', padding: '3px 8px', borderRadius: 99, flexShrink: 0 }}>개설 전</span>
          )}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>매월 들어가는 금액</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="number"
              value={flow.amount}
              onChange={(e) => onFlowAmount(Math.max(0, parseInt(e.target.value || '0', 10)))}
              style={{ width: 76, textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#0f172a', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', outline: 'none' }}
            />
            <span style={{ fontSize: 12, color: '#64748b' }}>만 원</span>
          </div>
        </div>
      </StepCard>
      <Connector />

      {/* 2. 넣기 */}
      <StepCard
        num={2}
        title="넣기"
        sub={investable ? '탭하면 상품을 변경할 수 있어요' : '예·적금/파킹 통장은 상품 없이 그대로 모아요'}
        action={investable ? (
          <button
            onClick={() => onEdit({ type: 'product-pick', flowId: flow.id, productIdx: 'new' })}
            style={{ fontSize: 11, fontWeight: 600, color: '#3182F6', background: '#EFF6FF', border: 'none', borderRadius: 99, padding: '4px 10px', cursor: 'pointer' }}
          >
            + 상품 추가
          </button>
        ) : undefined}
      >
        {flow.products.length > 0 ? (
          <div style={{ display: 'flex', height: 6, borderRadius: 99, overflow: 'hidden', gap: 2, marginBottom: 10 }}>
            {flow.products.map((p, i) => <div key={i} style={{ width: `${(p.pct / pctSum) * 100}%`, background: termBarColor(flow.term, i) }} />)}
          </div>
        ) : investable ? (
          <div style={{ padding: '10px 0 4px', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
            아직 담은 상품이 없어요. <span style={{ color: '#3182F6', fontWeight: 600 }}>+ 상품 추가</span>로 시작해보세요.
          </div>
        ) : (
          <div style={{ padding: '12px 0 4px', fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
            예·적금/파킹 통장은 상품 없이 그대로 모아요.<br />증권·ISA·IRP·연금저축 계좌일 때만 상품을 넣을 수 있어요.
          </div>
        )}
        {isOverAllocated && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 10, padding: '7px 10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8 }}>
            <span style={{ fontSize: 11, flexShrink: 0 }}>⚠️</span>
            <span style={{ fontSize: 10, color: '#B91C1C', lineHeight: 1.5 }}>
              담은 상품 합이 월 {formatKrw(total)}을 넘었어요 (합 {formatKrw(allocatedTotal)} · {ratioSum}%). 비중을 줄여 주세요.
            </span>
          </div>
        )}
        {flow.products.map((p, i, arr) => {
          const prod = lookupProduct(p.productId);
          const amt = Math.round(total * p.pct / 100);
          return (
            <div key={i} style={{ padding: '7px 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              {/* 상품명 행 + 인풋 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <button
                  onClick={() => onEdit({ type: 'product-pick', flowId: flow.id, productIdx: i })}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <input
                    type="number"
                    step={5}
                    value={p.pct}
                    onChange={(e) => onPct(i, Math.max(0, Math.min(100, parseInt(e.target.value || '0', 10))))}
                    style={{ width: 44, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#0f172a', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 6px', outline: 'none' }}
                  />
                  <span style={{ fontSize: 11, color: '#64748b' }}>%</span>
                  <input
                    type="number"
                    value={amt}
                    onChange={(e) => onPct(i, total > 0 ? Math.round(Math.max(0, parseInt(e.target.value || '0', 10)) / total * 100) : 0)}
                    style={{ width: 52, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#0f172a', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 6px', outline: 'none', marginLeft: 6 }}
                  />
                  <span style={{ fontSize: 11, color: '#64748b' }}>만</span>
                  <button
                    onClick={() => onRemoveProduct(i)}
                    aria-label="상품 제거"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, marginLeft: 2 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
                  </button>
                </div>
              </div>
              {/* 코멘트: 상품명 행 아래 별도 행, 아이콘 너비만큼 들여쓰기 */}
              {p.comment && (
                <div style={{ marginTop: 3, paddingLeft: 23, fontSize: 9, color: '#94a3b8', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  💬 {p.comment}
                </div>
              )}
            </div>
          );
        })}
      </StepCard>
      <Connector />

      {/* 3. 불리기 */}
      <StepCard num={3} title="불리기" sub={
        flow.kind === 'IRP' ? 'IRP 세액공제 + 복리 수익이 쌓여요' :
          flow.kind === 'ISA' ? 'ISA 비과세 혜택으로 더 많이 남아요' :
            flow.kind === '연금저축' ? '연금저축 세액공제 + 복리 수익이 쌓여요' :
              !investable ? '납입 방식 복리로 이자가 쌓여요' :
                '시장 수익률에 따라 자산이 불어나요'
      }>
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

        {/* 타입별 추가 정보 */}
        {!investable && (() => {
          const months = flow.projectedMonths || 6;
          const principal = flow.amount * months; // 만원
          const annualRate = parseRatePct(flow.rate) / 100;
          // 정기적립식 단리 이자: 매월 납입액 × 잔여기간 합산
          const grossInterest = Math.round((flow.amount * 10000) * (annualRate / 12) * (months * (months - 1) / 2));
          const netInterest = Math.round(grossInterest * (1 - 0.154));
          const netTotal = principal * 10000 + netInterest;
          const fmt = (n: number) => n.toLocaleString('ko-KR');
          const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: highlight ? 700 : 600, color: highlight ? '#0f172a' : '#374151' }}>{value}</span>
            </div>
          );
          return (
            <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              {/* 가입 정보 */}
              <div style={{ background: '#f8fafc', padding: '6px 12px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>가입 정보</span>
              </div>
              <div style={{ padding: '4px 12px 6px' }}>
                <Row label="납입 방식" value="정기적립식" />
                <Row label="월 납입액" value={formatKrw(flow.amount)} />
                <Row label="납입 기간" value={flow.projectedPeriod} />
                <Row label="적용 금리" value={`연 ${flow.rate}`} />
              </div>
              {/* 예상 수익 */}
              <div style={{ background: '#f8fafc', padding: '6px 12px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>예상 수익</span>
              </div>
              <div style={{ padding: '4px 12px 6px' }}>
                <Row label="납입 원금" value={formatKrw(principal)} />
                <Row label="세전 이자" value={`${fmt(grossInterest)}원`} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>세후 이자 <span style={{ fontSize: 9, color: '#94a3b8' }}>(이자소득세 15.4%)</span></span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{fmt(netInterest)}원</span>
                </div>
                <div style={{ borderTop: '1px dashed #e2e8f0', marginTop: 4, paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>만기 수령액</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>{fmt(netTotal)}원</span>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '5px 12px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 9, color: '#94a3b8' }}>※ 세전 단리 계산 기준이며 실제 수령액과 다를 수 있어요</span>
              </div>
            </div>
          );
        })()}
        {flow.kind === 'IRP' && (() => {
          const months = flow.projectedMonths || 48;
          const annualPayment = flow.amount * 12; // 만원/년
          // 세액공제: 연 900만 한도, 16.5%(종소세 5500만 이하) or 13.2%(초과)
          const deductibleBase = Math.min(annualPayment, 900); // 만원
          const taxSaving = Math.round(deductibleBase * 0.165); // 16.5% 적용
          const totalYears = Math.floor(months / 12);
          const totalTaxSaving = taxSaving * totalYears;
          const fmt = (n: number) => n.toLocaleString('ko-KR');
          const Row = ({ label, value }: { label: string; value: string }) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{value}</span>
            </div>
          );
          return (
            <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#f8fafc', padding: '6px 12px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>가입 정보</span>
              </div>
              <div style={{ padding: '4px 12px 6px' }}>
                <Row label="상품 유형" value="개인형 퇴직연금 (IRP)" />
                <Row label="월 납입액" value={formatKrw(flow.amount)} />
                <Row label="운용 기간" value={flow.projectedPeriod} />
                <Row label="예상 수익률" value={`연 ${flow.rate}`} />
              </div>
              <div style={{ background: '#f8fafc', padding: '6px 12px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>세제 혜택 (연간)</span>
              </div>
              <div style={{ padding: '4px 12px 6px' }}>
                <Row label="세액공제 대상" value={`연 ${fmt(deductibleBase)}만원`} />
                <Row label="세액공제율" value="16.5% (총급여 5,500만원 이하)" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderTop: '1px dashed #e2e8f0', marginTop: 4, paddingTop: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>연간 환급 예상액</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>약 {fmt(taxSaving)}만원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{totalYears}년 누적 절세액</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>약 {fmt(totalTaxSaving)}만원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{flow.projectedPeriod} 후 예상액</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{flow.projected}</span>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '5px 12px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 9, color: '#94a3b8' }}>※ 55세 이후 연금 수령 시 3.3~5.5% 낮은 세율 적용</span>
              </div>
            </div>
          );
        })()}
        {flow.kind === 'ISA' && (() => {
          const months = flow.projectedMonths || 48;
          const totalYears = Math.floor(months / 12);
          const annualPayment = flow.amount * 12; // 만원/년
          // 비과세 한도: 일반형 200만원/년, 서민형 400만원/년
          const taxFreeLimit = 200; // 일반형 기준 만원
          const annualReturn = Math.round(annualPayment * (parseRatePct(flow.rate) / 100));
          const taxFreeReturn = Math.min(annualReturn * totalYears, taxFreeLimit * totalYears);
          const taxSaved = Math.round(taxFreeReturn * 0.154); // 일반 계좌였다면 냈을 세금
          const fmt = (n: number) => n.toLocaleString('ko-KR');
          const Row = ({ label, value }: { label: string; value: string }) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{value}</span>
            </div>
          );
          return (
            <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#f8fafc', padding: '6px 12px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>가입 정보</span>
              </div>
              <div style={{ padding: '4px 12px 6px' }}>
                <Row label="상품 유형" value="개인종합자산관리계좌 (ISA)" />
                <Row label="월 납입액" value={formatKrw(flow.amount)} />
                <Row label="의무 가입 기간" value="3년" />
                <Row label="예상 수익률" value={`연 ${flow.rate}`} />
              </div>
              <div style={{ background: '#f8fafc', padding: '6px 12px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>절세 혜택</span>
              </div>
              <div style={{ padding: '4px 12px 6px' }}>
                <Row label="비과세 한도" value="연 200만원 (서민형 400만원)" />
                <Row label="초과 수익 세율" value="9.9% 분리과세" />
                <Row label="일반 계좌 세율" value="15.4% (비교)" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderTop: '1px dashed #e2e8f0', marginTop: 4, paddingTop: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>절세 예상액 ({totalYears}년)</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>약 {fmt(taxSaved)}만원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{flow.projectedPeriod} 후 예상액</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{flow.projected}</span>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '5px 12px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 9, color: '#94a3b8' }}>※ 계좌 내 손익 통산 후 수익에 과세 · 실제 절세액은 다를 수 있어요</span>
              </div>
            </div>
          );
        })()}
        {flow.kind === '연금저축' && (() => {
          const months = flow.projectedMonths || 48;
          const annualPayment = flow.amount * 12; // 만원/년
          const principal = flow.amount * months; // 납입 원금(만원)
          const fv = Math.round(futureValueMonthly(flow.amount, months, parseRatePct(flow.rate))); // 예상액(만원)
          const gains = Math.max(0, fv - principal); // 불어난 금액(만원)
          // 연금저축 세액공제: 연 600만 한도, 16.5%(종소세 5500만 이하)
          const deductibleBase = Math.min(annualPayment, 600); // 만원
          const taxSaving = Math.round(deductibleBase * 0.165); // 16.5% 적용
          const totalYears = Math.floor(months / 12);
          const totalTaxSaving = taxSaving * totalYears;
          const fmt = (n: number) => n.toLocaleString('ko-KR');
          const Row = ({ label, value }: { label: string; value: string }) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{value}</span>
            </div>
          );
          return (
            <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#f8fafc', padding: '6px 12px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>가입 정보</span>
              </div>
              <div style={{ padding: '4px 12px 6px' }}>
                <Row label="상품 유형" value="연금저축펀드" />
                <Row label="월 납입액" value={formatKrw(flow.amount)} />
                <Row label="운용 기간" value={flow.projectedPeriod} />
                <Row label="예상 수익률" value={`연 ${flow.rate}`} />
              </div>
              <div style={{ background: '#f8fafc', padding: '6px 12px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>운용 예상 ({flow.projectedPeriod})</span>
              </div>
              <div style={{ padding: '4px 12px 6px' }}>
                <Row label="납입 원금" value={formatKrw(principal)} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>불어난 금액 (운용 수익)</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>+{formatKrw(gains)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderTop: '1px dashed #e2e8f0', marginTop: 4, paddingTop: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{flow.projectedPeriod} 후 예상액</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{formatKrw(fv)}</span>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '6px 12px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>세제 혜택 (연간)</span>
              </div>
              <div style={{ padding: '4px 12px 6px' }}>
                <Row label="세액공제 대상" value={`연 ${fmt(deductibleBase)}만원`} />
                <Row label="세액공제율" value="16.5% (총급여 5,500만원 이하)" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderTop: '1px dashed #e2e8f0', marginTop: 4, paddingTop: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>연간 환급 예상액</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>약 {fmt(taxSaving)}만원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{totalYears}년 누적 절세액</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>약 {fmt(totalTaxSaving)}만원</span>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '5px 12px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 9, color: '#94a3b8' }}>※ IRP 합산 연 900만원 한도 · 55세 이후 연금 수령 시 3.3~5.5% 낮은 세율 적용</span>
              </div>
            </div>
          );
        })()}

        {flow.rrComment && (
          <div style={{ marginTop: 8, padding: '6px 9px', background: '#f1f5f9', borderRadius: 6, fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>
            💬 {flow.rrComment}
          </div>
        )}
      </StepCard>
    </div>
  );
}

// ─── 전체 한눈에 ──────────────────────────────────────────

function PieChart({ data }: { data: { pct: number; color: string; label: string; amt: number }[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const cx = 50, cy = 50, R = 44, r = 21;

  const toXY = (pct: number, radius: number) => {
    const a = (pct / 100) * 2 * Math.PI - Math.PI / 2;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)] as const;
  };

  let cum = 0;
  const hovered = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <svg width="72" height="72" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
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
            opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.3}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ cursor: 'default', transition: 'opacity 0.15s' }}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r} fill="white" />
      {hovered ? (
        <>
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">{hovered.label}</text>
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9" fontWeight="600" fill="#64748b">{hovered.pct.toFixed(0)}%</text>
        </>
      ) : null}
    </svg>
  );
}

function ProductBar({ products, term }: { products: FlowProduct[]; term: FlowTerm }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hoveredName = hoveredIdx !== null ? lookupProduct(products[hoveredIdx].productId).name : null;
  // 담긴 상품들끼리의 상대 비중으로 표시 (허브 금액 대비가 아니라 항상 100% 채움)
  const pctSum = products.reduce((s, p) => s + p.pct, 0) || 1;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', height: 6, borderRadius: 99, overflow: 'hidden', gap: 2, marginBottom: 4 }}>
        {products.map((p, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ width: `${(p.pct / pctSum) * 100}%`, background: termBarColor(term, i), cursor: 'default' }}
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

function AllOverview({ flows, flowLabels, onSelectFlow }: { flows: Flow[]; flowLabels: Record<string, string>; onSelectFlow: (id: string) => void }) {
  const totalFlowAmount = flows.reduce((sum, f) => sum + f.amount, 0);
  const weightedRate = totalFlowAmount > 0
    ? flows.reduce((sum, f) => sum + parseRatePct(f.rate) * f.amount, 0) / totalFlowAmount
    : 0;

  const termAmounts: Record<FlowTerm, number> = { 단기: 0, 중기: 0, 장기: 0 };
  flows.forEach(f => { termAmounts[f.term] += f.amount; });
  const pieData = (['단기', '중기', '장기'] as FlowTerm[])
    .filter(t => termAmounts[t] > 0)
    .map(t => ({ pct: totalFlowAmount > 0 ? (termAmounts[t] / totalFlowAmount) * 100 : 0, color: PIE_TERM_COLORS[t], label: t, amt: termAmounts[t] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 14, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PieChart data={pieData} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 72 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 1 }}>월 총 투자액</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{formatKrw(totalFlowAmount)}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 1 }}>예상 1년 수익</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#16a34a', lineHeight: 1.2 }}>+{weightedRate.toFixed(1)}%</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#16a34a' }}>약 {formatKrw(Math.round(totalFlowAmount * weightedRate / 100))}</div>
              </div>
            </div>
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

      {flows.map(f => {
        const hub = lookupHub(f.hubId);
        const termLabel = flowLabels[f.id] ?? f.term;
        const tc = TERM_COLORS[f.term] ?? TERM_COLORS.all;

        // 추천(미보유) 흐름은 일반 카드 대신 프로모션 배너 스타일 — "새로 만들어 주는 계좌"임을 강조
        if (f.isRecommendation) {
          return (
            <button
              key={f.id}
              onClick={() => onSelectFlow(f.id)}
              style={{
                width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', borderRadius: 18,
                padding: '16px 16px 14px',
                background: 'linear-gradient(150deg, #EFF6FF 0%, #E3EEFF 55%, #DBEAFE 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: tc.bg, color: tc.text, padding: '3px 9px', borderRadius: 99 }}>{termLabel}</span>
                {(() => {
                  const badge = ASSET_TYPE_BADGE[f.hubAssetType ?? ''];
                  return badge ? (
                    <span style={{ fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color, padding: '2px 7px', borderRadius: 99 }}>
                      {badge.label}
                    </span>
                  ) : null;
                })()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, color: '#64748b' }}>{f.title}</p>
                  <p style={{ margin: '0 0 7px', fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
                    아직 없는 계좌는 Pori가 새로 만들어 드려요!
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: 12.5, fontWeight: 700, color: '#3182F6' }}>
                    {hub.hubLabel} {hub.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>
                    월 {formatKrw(f.amount)} · {f.projectedPeriod} 후 <strong style={{ color: '#0f172a' }}>{f.projected}</strong>
                  </p>
                </div>
                <img src={missionPoriImg} alt="Pori" style={{ width: 92, height: 92, objectFit: 'contain', flexShrink: 0 }} />
              </div>
              <div style={{ marginTop: 12, padding: '11px 0', textAlign: 'center', fontSize: 13, fontWeight: 700, background: '#3182F6', color: '#fff', borderRadius: 12, boxShadow: '0 4px 10px rgba(49,130,246,0.25)' }}>
                자세히 보고 개설하기
              </div>
            </button>
          );
        }

        return (
          <button
            key={f.id}
            onClick={() => onSelectFlow(f.id)}
            style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 16, padding: '12px 14px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: tc.bg, color: tc.text, padding: '3px 9px', borderRadius: 99 }}>
                  {termLabel}
                </span>
                {(() => {
                  const badge = ASSET_TYPE_BADGE[f.hubAssetType ?? ''];
                  return badge ? (
                    <span style={{ fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color, padding: '2px 7px', borderRadius: 99 }}>
                      {badge.label}
                    </span>
                  ) : null;
                })()}
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>자세히 보기 ›</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Logo letter={hub.logo} bg={hub.logoBg} color={hub.logoColor} size={20} imgSrc={hub.imgSrc} />
                <span style={{ fontSize: 11, color: '#64748b' }}>{hub.hubLabel}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>월 {formatKrw(f.amount)}</span>
            </div>

            {f.products.length === 0 ? (
              <>
                {/* 적금 계좌명 칩 */}
                <div style={{ marginBottom: 7 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, background: '#EFF6FF', color: '#3182F6', padding: '5px 14px', borderRadius: 99, display: 'inline-block' }}>
                    {hub.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#94a3b8', background: '#f1f5f9', padding: '2px 7px', borderRadius: 99 }}>{f.projectedPeriod}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>{f.rate}</span>
                    <span style={{ fontSize: 10, color: '#cbd5e1' }}>·</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      만기 <strong style={{ color: '#0f172a' }}>{f.projected}</strong>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <ProductBar products={f.products} term={f.term} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>{f.rate}</span>
                  <span style={{ fontSize: 10, color: '#cbd5e1' }}>·</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    {f.projectedPeriod} 후 <strong style={{ color: '#0f172a' }}>{f.projected}</strong>
                  </span>
                </div>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── 계좌 개설 동의 모달 ──────────────────────────────────
// 추천(미보유) 계좌를 저장으로 개설하기 전, 은행 앱처럼 약관 동의를 받는 UX. 동의 내용은 서버로 보내지 않는다

const CONSENT_TERMS = [
  '예금거래 기본약관',
  '비대면 계좌 개설 서비스 이용약관',
  '개인(신용)정보 수집·이용 동의',
  '불법·탈법 차명거래 금지 설명 확인',
];

function CheckCircle({ on }: { on: boolean }) {
  return (
    <span style={{
      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: on ? '#3182F6' : '#fff',
      border: on ? 'none' : '1.5px solid #cbd5e1',
      transition: 'all .12s',
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={on ? '#fff' : '#cbd5e1'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  );
}

function AccountOpenConsentModal({ hubs, onClose, onAgree }: { hubs: HubItem[]; onClose: () => void; onAgree: () => void }) {
  const [checked, setChecked] = useState<boolean[]>(() => CONSENT_TERMS.map(() => false));
  const allChecked = checked.every(Boolean);
  const toggle = (i: number) => setChecked(prev => prev.map((c, j) => j === i ? !c : c));
  const toggleAll = () => setChecked(CONSENT_TERMS.map(() => !allChecked));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 390, padding: '20px 18px 16px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>계좌 개설 동의</h3>
          <button onClick={onClose} aria-label="닫기" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
          </button>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
          아래 {hubs.length}개 계좌를 새로 개설하려면 약관 동의가 필요해요
        </p>

        {/* 개설할 계좌 목록 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {hubs.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#F8FAFF', border: '1px dashed #93C5FD', borderRadius: 12 }}>
              <Logo letter={h.logo} bg={h.logoBg} color={h.logoColor} size={30} imgSrc={h.imgSrc} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{h.name}</div>
                <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1 }}>{h.hubLabel}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#3182F6', background: '#DBEAFE', padding: '2px 7px', borderRadius: 99, flexShrink: 0 }}>개설 전</span>
            </div>
          ))}
        </div>

        {/* 전체 동의 */}
        <button
          onClick={toggleAll}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px',
            background: allChecked ? '#EFF6FF' : '#f8fafc',
            border: `1.5px solid ${allChecked ? '#3182F6' : '#e2e8f0'}`,
            borderRadius: 12, cursor: 'pointer', marginBottom: 8,
          }}
        >
          <CheckCircle on={allChecked} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>전체 동의</span>
        </button>

        {/* 개별 약관 */}
        <div style={{ marginBottom: 16 }}>
          {CONSENT_TERMS.map((term, i) => (
            <div key={term} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px' }}>
              <button onClick={() => toggle(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, textAlign: 'left' }}>
                <CheckCircle on={checked[i]} />
                <span style={{ fontSize: 12.5, color: '#334155' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#3182F6', marginRight: 5 }}>[필수]</span>
                  {term}
                </span>
              </button>
              <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>보기 ›</span>
            </div>
          ))}
        </div>

        <button
          onClick={onAgree}
          disabled={!allChecked}
          style={{
            width: '100%', padding: '15px 0', fontSize: 15, fontWeight: 700,
            background: allChecked ? '#3182F6' : '#E2E8F0', color: allChecked ? '#fff' : '#94a3b8',
            border: 'none', borderRadius: 14, cursor: allChecked ? 'pointer' : 'not-allowed',
            boxShadow: allChecked ? '0 4px 12px rgba(49,130,246,0.2)' : 'none',
          }}
        >
          동의하고 개설하기
        </button>
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────

export default function AssetPortfolio() {
  const { userName: USER_NAME } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = (location.state as { mode?: string } | null)?.mode === 'edit';
  const [termTab, setTermTab] = useState<TermTab>('all');
  const [detailFlowId, setDetailFlowId] = useState<string | null>(null);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [monthlyInvestAmount, setMonthlyInvestAmount] = useState<number>(0);
  const [availableAssets, setAvailableAssets] = useState<AvailableAsset[]>([]);
  const [productCatalog, setProductCatalog] = useState<ProductItem[]>([]);
  const [editor, setEditor] = useState<EditorMode>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // 저장 시 새로 개설된 추천 계좌 — 개설 완료 오버레이 표시용
  const [openedAccounts, setOpenedAccounts] = useState<HubItem[] | null>(null);
  // 추천 계좌 개설 동의 모달 (저장 직전 1회)
  const [consentOpen, setConsentOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([getPortfolioFlows(), getAvailableAssets(), getProducts()])
      .then(([flowsRes, assetsRes, productsRes]) => {
        if (cancelled) return;
        setFlows(sortFlowsByTerm(flowsRes.flows.map(apiToFlow).map(withProjection)));
        setMonthlyInvestAmount(Math.round((flowsRes.monthlyInvestAmount ?? 0) / 10000));
        setAvailableAssets(assetsRes.assets);
        assetsRes.assets.forEach(assetToHubItem);
        setProductCatalog(productsRes.products.map(productToCatalogItem));
      })
      .catch(e => {
        if (cancelled) return;
        console.error('포트폴리오 조회 실패:', e);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const flowLabels = useMemo(() => buildFlowTabLabels(flows), [flows]);

  const tabs = useMemo<{ key: TermTab; label: string }[]>(() => {
    const seen = new Set<FlowTerm>();
    const termTabs: { key: TermTab; label: string }[] = [];
    flows.forEach(f => {
      if (!seen.has(f.term)) {
        seen.add(f.term);
        termTabs.push({ key: f.term, label: f.term });
      }
    });
    return [{ key: 'all', label: '전체' }, ...termTabs];
  }, [flows]);

  const updateFlow = (id: string, patch: (prev: Flow) => Flow) => {
    setFlows(prev => prev.map(f => f.id === id ? withProjection(patch(f)) : f));
  };

  const handlePct = (id: string, productIdx: number, pct: number) => {
    updateFlow(id, f => ({ ...f, products: f.products.map((p, i) => i === productIdx ? { ...p, pct } : p) }));
  };

  const handleFlowAmount = (id: string, amount: number) => {
    updateFlow(id, f => ({ ...f, amount }));
  };

  const handleHubPick = (h: HubItem) => {
    if (!editor || editor.type !== 'hub-pick') return;
    const investable = isInvestableHub(h.sub);
    updateFlow(editor.flowId, f => ({
      ...f,
      hubId: h.id,
      kind: h.kind,
      hubAssetType: h.sub,
      products: investable ? f.products : [],
    }));
    setEditor(null);
  };

  const handleProductPick = (p: ProductItem) => {
    if (!editor || editor.type !== 'product-pick') return;
    const { flowId, productIdx } = editor;
    const apiType = productApiTypeById.get(p.id) ?? 'STOCK';
    updateFlow(flowId, f => {
      if (productIdx === 'new') {
        const barColor = BAR_COLORS[f.products.length % BAR_COLORS.length];
        return { ...f, products: [...f.products, { productId: p.id, pct: 0, barColor, productType: apiType, rate: p.rate }] };
      }
      return {
        ...f,
        products: f.products.map((prod, i) => i === productIdx ? { ...prod, productId: p.id, productType: apiType, rate: p.rate } : prod),
      };
    });
    setEditor(null);
  };

  const handleRemoveProduct = (id: string, productIdx: number) => {
    updateFlow(id, f => ({ ...f, products: f.products.filter((_, i) => i !== productIdx) }));
  };

  const buildRequest = (f: Flow): PortfolioFlowUpdateRequest => ({
    amount: f.amount * 10000,
    gatheringAssetId: f.hubId && !f.hubId.startsWith('dyn-') ? f.hubId : null,
    products: f.products.map(p => ({
      productId: p.productId.startsWith('dyn-') ? null : p.productId,
      productType: p.productType,
      productRatio: p.pct,
      assetId: null,
    })),
  });

  // 추천(미보유) 계좌가 있으면 실제 저장 전에 은행처럼 개설 동의를 먼저 받는다 (UX용 — 동의 내용은 전송하지 않음)
  const handleSaveAll = () => {
    if (flows.some(f => f.isRecommendation)) setConsentOpen(true);
    else void doSave();
  };

  const doSave = async () => {
    setSaving(true);
    // 저장 전에 추천(미보유) 흐름의 모을 통장을 캡처 — 저장 후엔 보유 계좌로 바뀌어 식별 불가
    const opened = flows.filter(f => f.isRecommendation).map(f => lookupHub(f.hubId));
    try {
      const updatedList = await Promise.all(
        flows.map(f => updatePortfolioFlow(f.id, buildRequest(f))),
      );
      setFlows(sortFlowsByTerm(updatedList.map(apiToFlow).map(withProjection)));
      if (opened.length > 0) {
        setOpenedAccounts(opened);   // 개설 완료 오버레이 → 대시보드 이동은 오버레이 버튼에서
        setSaving(false);
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : '저장 실패');
      setSaving(false);
    }
  };

  // 탭 → AllOverview 필터링만 담당 (FlowDetail 진입 X)
  // FlowDetail는 "자세히 보기" 클릭(detailFlowId)으로만 진입
  const activeFlow = detailFlowId ? flows.find(f => f.id === detailFlowId) ?? null : null;
  const showDetail = activeFlow != null;
  const filteredFlows = termTab === 'all' ? flows : flows.filter(f => f.term === termTab);

  const editorFlow = editor && 'flowId' in editor ? flows.find(f => f.id === editor.flowId) ?? null : null;

  const usedAssetIds = useMemo(() => {
    const s = new Set<string>();
    flows.forEach(f => { if (f.hubId) s.add(f.hubId); });
    return s;
  }, [flows]);

  const exceptionAssetId: string | null = useMemo(() => {
    if (!editor || !editorFlow) return null;
    if (editor.type === 'hub-pick') return editorFlow.hubId || null;
    return null;
  }, [editor, editorFlow]);

  const hubCatalog = useMemo(() =>
    availableAssets
      .filter(a => HUB_ASSET_TYPES.has(a.assetType ?? ''))
      .filter(a => !usedAssetIds.has(a.id) || a.id === exceptionAssetId)
      .map(assetToHubItem),
    [availableAssets, usedAssetIds, exceptionAssetId]);

  const handleBack = () => {
    if (detailFlowId) setDetailFlowId(null);
    else if (termTab !== 'all') setTermTab('all');
    else navigate(-1);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <video src={poriLoadingVideo} autoPlay loop muted playsInline style={{ width: 280, height: 280, objectFit: 'contain', display: 'block', background: 'transparent' }} />
      </div>
    );
  }
  if (flows.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, background: '#f8fafc', fontFamily: "'Pretendard', sans-serif" }}>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>아직 만들어진 포트폴리오 흐름이 없어요.</p>
        <button onClick={() => navigate(-1)} style={{ fontSize: 12, fontWeight: 600, padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>뒤로가기</button>
      </div>
    );
  }

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
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isEditMode ? '포트폴리오 재설정' : '투자 가이드'}
          </h1>
        </div>

        <div style={{ padding: '12px 16px 0' }}>
          {!showDetail && (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 0 }}>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', lineHeight: 1.4, margin: 0 }}>
                {isEditMode
                  ? <>흐름과 상품 구성을<br />원하는 대로 수정해보세요</>
                  : <>{USER_NAME}님의 자산<br />이렇게 설계되었어요</>}
              </p>
              <img src={pillImg} alt={isEditMode ? '재설정' : '처방전'} style={{ width: 100, height: 100, objectFit: 'contain', flexShrink: 0, marginTop: -24 }} />
            </div>
          )}

          {!showDetail && (
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 14, marginBottom: 16, gap: 2 }}>
              {tabs.map(({ key, label }) => {
                const isActive = termTab === key;
                const c = key === 'all' ? TERM_COLORS.all : (TERM_COLORS[key as FlowTerm] ?? TERM_COLORS.all);
                return (
                  <button
                    key={key}
                    onClick={() => { setTermTab(key); setDetailFlowId(null); }}
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

          {!showDetail && (
            <AllOverview flows={filteredFlows} flowLabels={flowLabels} onSelectFlow={setDetailFlowId} />
          )}

          {showDetail && activeFlow && (
            <FlowDetail
              flow={activeFlow}
              onEdit={setEditor}
              onPct={(idx, pct) => handlePct(activeFlow.id, idx, pct)}
              onFlowAmount={(amt) => handleFlowAmount(activeFlow.id, amt)}
              onRemoveProduct={(idx) => handleRemoveProduct(activeFlow.id, idx)}
            />
          )}

          {!showDetail && (
            <div style={{ marginTop: 24 }}>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                style={{
                  width: '100%', padding: '16px 0', fontSize: 15, fontWeight: 700,
                  background: saving ? '#94a3b8' : '#3182F6', color: '#fff',
                  border: 'none', borderRadius: 14,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(49,130,246,0.2)',
                }}
              >
                {saving ? '저장 중…' : '이대로 하기'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 편집 모달들 */}
      {editor?.type === 'hub-pick' && editorFlow && (
        <HubPickerModal
          catalog={hubCatalog}
          currentId={editorFlow.hubId}
          onClose={() => setEditor(null)}
          onPick={handleHubPick}
        />
      )}
      {editor?.type === 'product-pick' && (
        <ProductPickerModal
          catalog={productCatalog.filter(p => p.type !== '적금')}
          mode={editor.productIdx === 'new' ? 'add' : 'replace'}
          currentId={editor.productIdx === 'new' ? undefined : editorFlow?.products[editor.productIdx as number]?.productId}
          onClose={() => setEditor(null)}
          onPick={handleProductPick}
        />
      )}

      {/* 추천 계좌 개설 동의 (저장 직전) */}
      {consentOpen && (
        <AccountOpenConsentModal
          hubs={flows.filter(f => f.isRecommendation).map(f => lookupHub(f.hubId))}
          onClose={() => setConsentOpen(false)}
          onAgree={() => { setConsentOpen(false); void doSave(); }}
        />
      )}

      {/* 추천 계좌 개설 완료 오버레이 */}
      {openedAccounts && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <style>{`@keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }`}</style>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 340, padding: '28px 22px 22px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 44, marginBottom: 8, animation: 'pop 0.4s ease-out' }}>✨</div>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
              추천 계좌 {openedAccounts.length}개를<br />새로 개설했어요
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
              이제 이 계좌로 매달 자동으로 모을 수 있어요
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {openedAccounts.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#F8FAFC', border: '1px solid #e2e8f0', borderRadius: 12, textAlign: 'left' }}>
                  <Logo letter={h.logo} bg={h.logoBg} color={h.logoColor} size={34} imgSrc={h.imgSrc} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{h.hubLabel}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: 99, flexShrink: 0 }}>개설 완료</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700, background: '#3182F6', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(49,130,246,0.2)' }}
            >
              대시보드로 가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
