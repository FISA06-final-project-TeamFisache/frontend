import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getPortfolioFlows, getAvailableAssets, updatePortfolioFlow,
  type PortfolioFlow, type AvailableAsset, type PortfolioFlowUpdateRequest,
} from '../api/portfolioFlowApi';
import { getProducts } from '../api/productApi';
import pillImg from '../assets/pill.png';
import {
  type HubItem, type ProductItem, type FlowProduct, type FlowTerm, type Flow,
  STEP_COLORS, TERM_STYLE, BAR_COLORS, HUB_ASSET_TYPES,
  dynamicHubs, dynamicProducts, productApiTypeById,
  lookupHub, lookupProduct,
  isInvestableHub, assetToHubItem, productToCatalogItem,
  apiToFlow, buildFlowTabLabels,
} from '../components/assetPortfolio/portfolioRegistry';
import {
  Logo, ProductIcon,
  HubPickerModal, ProductPickerModal,
} from '../components/assetPortfolio/PortfolioModals';

// ─── 탭 타입 ─────────────────────────────────────────────
type TermTab = 'all' | string;

const TERM_COLORS: Record<string, { bg: string; text: string }> = {
  all: { bg: '#ffffff', text: '#0f172a' },
  단기: { bg: '#FECACA', text: '#991B1B' },
  중기: { bg: '#FDE68A', text: '#92400E' },
  장기: { bg: '#BBF7D0', text: '#166534' },
};

const PIE_TERM_COLORS: Record<FlowTerm, string> = { 단기: '#FECACA', 중기: '#FDE68A', 장기: '#BBF7D0' };
const parseRatePct = (s: string) => parseFloat(s.replace(/[^0-9.\-]/g, '')) || 0;

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
      <div>{children}</div>
    </div>
  );
}

// ─── 흐름 상세 ────────────────────────────────────────────

interface FlowDetailProps {
  flow: Flow;
  termLabel: string;
  onEdit: (mode: EditorMode) => void;
  onPct: (productIdx: number, pct: number) => void;
  onFlowAmount: (amount: number) => void;
  onRemoveProduct: (productIdx: number) => void;
}

function FlowDetail({ flow, termLabel, onEdit, onPct, onFlowAmount, onRemoveProduct }: FlowDetailProps) {
  const hub = lookupHub(flow.hubId);
  const total = flow.amount;
  const investable = isInvestableHub(flow.hubAssetType);

  return (
    <div>
      <div style={{ marginBottom: 14, padding: '12px 14px', background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, background: TERM_STYLE[flow.term].bg, color: TERM_STYLE[flow.term].color, padding: '3px 8px', borderRadius: 99 }}>{termLabel}</span>
          {flow.kind !== '일반' && (
            <span style={{ fontSize: 10, background: flow.badgeBg, color: flow.badgeColor, padding: '3px 8px', borderRadius: 99, fontWeight: 700 }}>{flow.kind}</span>
          )}
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 3px', lineHeight: 1.35 }}>{flow.title}</p>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{flow.summary}</p>
      </div>

      {/* 1. 모으기 */}
      <StepCard
        num={1}
        title="모으기"
        sub={flow.kind === '일반' ? '여기에 한 번 모아둬요' : `${flow.kind} 계좌로 모아둬요`}
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
          <div style={{ marginBottom: 8, textAlign: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: '#EFF6FF', color: '#3182F6', padding: '3px 8px', borderRadius: 99 }}>✨ 추천 계좌 (아직 미보유)</span>
          </div>
        )}
        <button
          onClick={() => onEdit({ type: 'hub-pick', flowId: flow.id })}
          style={{ width: '100%', cursor: 'pointer', background: hub.cardBg, border: `1px solid ${hub.border}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', gap: 12 }}
        >
          <Logo letter={hub.logo} bg={hub.logoBg} color={hub.logoColor} size={36} imgSrc={hub.imgSrc} />
          <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: hub.nameColor }}>{hub.name}</div>
            <div style={{ fontSize: 10, color: hub.subColor, fontFamily: 'monospace', marginTop: 1 }}>{hub.number}</div>
            <div style={{ fontSize: 11, color: hub.subColor, marginTop: 2 }}>{hub.sub}</div>
          </div>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>월 납입 금액</span>
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
        {flow.accountComment && (
          <p style={{ fontSize: 11, color: '#64748b', margin: '8px 2px 0', lineHeight: 1.5, textAlign: 'center' }}>💬 {flow.accountComment}</p>
        )}
      </StepCard>
      <Connector />

      {/* 2. 넣기 */}
      <StepCard
        num={2}
        title="넣기"
        sub={investable ? '상품을 탭하면 변경할 수 있어요' : '예·적금/파킹 통장은 상품 없이 그대로 모아요'}
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
            {flow.products.map((p, i) => <div key={i} style={{ width: `${p.pct}%`, background: p.barColor }} />)}
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
        {flow.products.map((p, i, arr) => {
          const prod = lookupProduct(p.productId);
          const amt = Math.round(total * p.pct / 100);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none', gap: 8 }}>
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
                  {p.comment && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, lineHeight: 1.4, whiteSpace: 'normal' }}>{p.comment}</div>}
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
          );
        })}
      </StepCard>
      <Connector />

      {/* 3. 불리기 */}
      <StepCard num={3} title="불리기" sub="이렇게 불어나요">
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
        {flow.rrComment && (
          <p style={{ fontSize: 11, color: '#64748b', margin: '10px 2px 0', lineHeight: 1.5, textAlign: 'center' }}>💬 {flow.rrComment}</p>
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

function AllOverview({ flows, flowLabels, monthlyInvestAmount, onSelectFlow }: { flows: Flow[]; flowLabels: Record<string, string>; monthlyInvestAmount: number; onSelectFlow: (id: string) => void }) {
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
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{monthlyInvestAmount}만 원</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 1 }}>예상 1년 수익</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#16a34a', lineHeight: 1.2 }}>+{weightedRate.toFixed(1)}%</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#16a34a' }}>약 {Math.round(monthlyInvestAmount * weightedRate / 100)}만 원</div>
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
                {f.kind !== '일반' && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: f.badgeBg, color: f.badgeColor, padding: '2px 7px', borderRadius: 99 }}>
                    {f.kind}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>자세히 보기 ›</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Logo letter={hub.logo} bg={hub.logoBg} color={hub.logoColor} size={20} imgSrc={hub.imgSrc} />
                <span style={{ fontSize: 11, color: '#64748b' }}>{hub.hubLabel}</span>
                {f.isRecommendation && (
                  <span style={{ fontSize: 9, fontWeight: 700, background: '#EFF6FF', color: '#3182F6', padding: '1px 6px', borderRadius: 99 }}>추천</span>
                )}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>월 {f.amount}만 원</span>
            </div>

            <ProductBar products={f.products} />

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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([getPortfolioFlows(), getAvailableAssets(), getProducts()])
      .then(([flowsRes, assetsRes, productsRes]) => {
        if (cancelled) return;
        setFlows(flowsRes.flows.map(apiToFlow));
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

  const tabs = useMemo<{ key: TermTab; label: string }[]>(() => [
    { key: 'all', label: '전체' },
    ...flows.map(f => ({ key: f.id, label: flowLabels[f.id] ?? f.term })),
  ], [flows, flowLabels]);

  const updateFlow = (id: string, patch: (prev: Flow) => Flow) => {
    setFlows(prev => prev.map(f => f.id === id ? patch(f) : f));
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
        return { ...f, products: [...f.products, { productId: p.id, pct: 0, barColor, productType: apiType }] };
      }
      return {
        ...f,
        products: f.products.map((prod, i) => i === productIdx ? { ...prod, productId: p.id, productType: apiType } : prod),
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

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updatedList = await Promise.all(
        flows.map(f => updatePortfolioFlow(f.id, buildRequest(f))),
      );
      setFlows(updatedList.map(apiToFlow));
      navigate('/dashboard');
    } catch (e) {
      alert(e instanceof Error ? e.message : '저장 실패');
      setSaving(false);
    }
  };

  const activeFlowId = termTab !== 'all' ? termTab : detailFlowId;
  const activeFlow = activeFlowId ? flows.find(f => f.id === activeFlowId) ?? null : null;
  const showDetail = activeFlow != null;

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
    if (termTab !== 'all') setTermTab('all');
    else if (detailFlowId) setDetailFlowId(null);
    else navigate(-1);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#0f172a', animation: 'spin 0.8s linear infinite' }} />
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
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', lineHeight: 1.4, margin: 0 }}>
                {isEditMode
                  ? <>흐름과 상품 구성을<br />원하는 대로 수정해보세요</>
                  : <>{USER_NAME}님의 자산<br />이렇게 설계되었어요</>}
              </p>
              <img src={pillImg} alt={isEditMode ? '재설정' : '처방전'} style={{ width: 72, height: 72, objectFit: 'contain', flexShrink: 0, marginTop: -24 }} />
            </div>
          )}

          {!showDetail && (
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 14, marginBottom: 16, gap: 2 }}>
              {tabs.map(({ key, label }) => {
                const isActive = termTab === key;
                const flowOfTab = key === 'all' ? null : flows.find(f => f.id === key);
                const c = flowOfTab ? (TERM_COLORS[flowOfTab.term] ?? TERM_COLORS.all) : TERM_COLORS.all;
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
            <AllOverview flows={flows} flowLabels={flowLabels} monthlyInvestAmount={monthlyInvestAmount} onSelectFlow={setDetailFlowId} />
          )}

          {showDetail && activeFlow && (
            <FlowDetail
              flow={activeFlow}
              termLabel={flowLabels[activeFlow.id] ?? activeFlow.term}
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
                {saving ? '저장 중…' : '관리 시작하기'}
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
    </div>
  );
}
