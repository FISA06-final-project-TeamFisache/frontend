import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, HelpCircle, Plus, Check, X } from 'lucide-react';
import wooriLogo   from '../assets/banks/woori.png';
import kakaoLogo   from '../assets/banks/kakao.png';
import tossLogo    from '../assets/banks/toss.png';
import shinhanLogo from '../assets/banks/shinhan.png';
import hanaLogo    from '../assets/banks/hana.png';
import kbLogo      from '../assets/banks/kb.png';
import miraeLogo   from '../assets/banks/mirae.png';
import heroImg     from '../assets/hero.png';
import { getPortfolioFlows } from '../api/portfolioFlowApi';

type View = 'summary' | 'detail' | 'success';
type Tab  = 'spend' | 'invest';

const fmt = (n: number) => n.toLocaleString('ko-KR');

const SALARY       = 3_200_000;
const SALARY_DELTA = 100_000;
const SPEND        = 2_000_000;
const INVEST       = 1_200_000;

const SPEND_PLANS = [
  { id: '1', name: '입출금통장', tag: '생활비', amount: 1_500_000, delta: 50_000, color: '#F59E0B', logo: kakaoLogo },
  { id: '2', name: '파킹통장',   tag: '비상금', amount:   300_000, delta: 30_000, color: '#6366F1', logo: tossLogo  },
];

const MOCK_INVEST_PLANS = [
  { id: 'mock-i1', name: '토스뱅크', tag: '단기', amount: 1_200_000, delta: 0, editedDelta: 20000, color: '#3b82f6', logo: tossLogo, term: '단', institution: '토스뱅크' },
  { id: 'mock-i2', name: '투자증권', tag: '중기', amount: 1_200_000, delta: 0, editedDelta: 0, color: '#3b82f6', logo: shinhanLogo, term: '중', institution: '신한은행' },
];

const BANK_META: Record<string, { bg: string; imgSrc: string }> = {
  '카카오뱅크': { bg: '#FEE500', imgSrc: kakaoLogo },
  '토스뱅크':   { bg: '#3182F6', imgSrc: tossLogo  },
  '토스증권':   { bg: '#3182F6', imgSrc: tossLogo  },
  '신한은행':   { bg: '#0046FF', imgSrc: shinhanLogo },
  '하나은행':   { bg: '#009F6B', imgSrc: hanaLogo },
  '우리은행':   { bg: '#0067AC', imgSrc: wooriLogo },
  'KB국민은행': { bg: '#FFBC00', imgSrc: kbLogo },
  '미래에셋':   { bg: '#F05928', imgSrc: miraeLogo },
};

const TERM_META: Record<string, { label: string; bg: string; text: string }> = {
  '단': { label: '단기', bg: 'bg-red-100',     text: 'text-red-700'     },
  '중': { label: '중기', bg: 'bg-amber-100',   text: 'text-amber-700'   },
  '장': { label: '장기', bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

const ALL_ACCOUNTS = [
  { id: 'a1', name: '입출금통장', bank: '카카오뱅크', logo: kakaoLogo },
  { id: 'a2', name: '파킹통장',  bank: '토스뱅크',  logo: tossLogo  },
  { id: 'a3', name: '급여통장',  bank: '우리은행',  logo: wooriLogo },
];

const REASONS = [
  '생활비 카테고리 지난달 32,000원 초과',
  '비상금 최근 3개월 미인출',
  '투자 비율 20% 유지 기준 충족',
];

const SPEND_REASONS = [
  '생활비 카테고리 지난달 32,000원 초과',
  '비상금 최근 3개월 미인출',
];

const INVEST_REASONS = [
  '단기 목적 자산(생활 여유 자금)의 유동성 확보와 우대 금리 혜택을 위해 추천해요',
  '중기 목표 자금 마련 및 안정적 가치 상승을 위한 자산 분산 투자처예요',
];

interface Plan {
  id: string;
  name: string;
  tag: string;
  amount: number;
  delta: number;
  editedDelta: number;
  color: string;
  logo: string;
  term?: string | null;
  institution?: string | null;
  interestRate?: number | null;
}

interface Props {
  onClose: () => void;
}

export default function SalaryManagement({ onClose }: Props) {
  const [view,       setView]       = useState<View>('summary');
  const [activeTab,  setActiveTab]  = useState<Tab>('spend');
  const [spendPlans, setSpendPlans] = useState<Plan[]>(SPEND_PLANS.map(p => ({ ...p, editedDelta: p.delta })));
  const [investPlans, setInvestPlans] = useState<Plan[]>([]);
  const [tooltip,    setTooltip]    = useState<string | null>(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [selectedAccId, setSelectedAccId] = useState<string | null>(null);
  const [newTag,        setNewTag]        = useState('');



  useEffect(() => {
    getPortfolioFlows()
      .then(({ flows }) => {
        const activeFlows = flows.filter(f => f.isActive);
        if (activeFlows.length > 0) {
          setInvestPlans(
            activeFlows.map(f => {
              const inst = f.gatheringAsset?.institution ?? null;
              const rate = f.products.find(p => p.interestRate != null)?.interestRate ?? null;
              return {
                id: f.id,
                name: f.gatheringAsset?.institution ?? '투자계좌',
                tag: f.term ?? '투자',
                amount: f.gatheringAsset?.balance ?? 0,
                delta: 0,
                editedDelta: 20000,
                color: '#3b82f6',
                logo: inst ? (BANK_META[inst]?.imgSrc ?? wooriLogo) : wooriLogo,
                term: f.term,
                institution: inst,
                interestRate: rate,
              };
            }),
          );
        } else {
          // 데이터베이스에 데이터가 없을 때 스크린샷과 동일한 목업 제공
          setInvestPlans(MOCK_INVEST_PLANS);
        }
      })
      .catch(err => {
        console.error('투자 계획 조회 실패:', err);
        // API 에러 시에도 스크린샷 화면이 조절 가능하게 목업 폴백 제공
        setInvestPlans(MOCK_INVEST_PLANS);
      });
  }, []);

  const spendDelta  = spendPlans.reduce((s, p)  => s + p.editedDelta, 0);
  const investDelta = investPlans.reduce((s, p) => s + p.editedDelta, 0);
  const remain      = SALARY_DELTA - spendDelta - investDelta;
  const isOver      = remain < 0;

  const activePlans    = activeTab === 'spend' ? spendPlans    : investPlans;
  const setActivePlans = activeTab === 'spend' ? setSpendPlans : setInvestPlans;

  const openAddModal = () => { setSelectedAccId(null); setNewTag(''); setShowAddModal(true); };

  const addAccount = () => {
    const acc = ALL_ACCOUNTS.find(a => a.id === selectedAccId);
    const tag = newTag.trim();
    if (!acc || !tag) return;
    setActivePlans(prev => [...prev, {
      id: String(Date.now()), name: acc.name, tag,
      amount: 0, delta: 0, editedDelta: 0,
      color: '#94A3B8', logo: acc.logo,
    }]);
    setShowAddModal(false);
  };

  // ── 요약 카드 ─────────────────────────────────────────
  if (view === 'summary') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center font-sans px-5 gap-3 py-10 relative">
        <button onClick={onClose}
          className="fixed top-5 right-5 z-50 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-sm px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">이번 달 월급 변동</p>
          <p className="text-3xl font-extrabold text-red-500">+{fmt(SALARY_DELTA)}원</p>
          <p className="text-xs text-slate-400 mt-1">우리은행 급여통장 · 지난달 대비</p>
        </div>

        <div className="w-full max-w-[360px] bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3.5 space-y-1.5">
          {REASONS.map((r, i) => <p key={i} className="text-xs text-amber-800 leading-relaxed">{r}</p>)}
        </div>

        <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 space-y-2">
            {[
              { label: '지출할 금액', labelColor: 'text-slate-600', plans: spendPlans },
              { label: '투자할 금액', labelColor: 'text-blue-600',  plans: investPlans },
            ].map(({ label, labelColor, plans }) => (
              <div key={label} className="flex items-stretch bg-slate-100 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-center px-3 py-4">
                  <p className={`text-xs font-bold whitespace-nowrap ${labelColor}`}>{label}</p>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-2 pr-3 py-3">
                  {plans.map(p => {
                    const isNeg = p.editedDelta < 0;
                    const termInfo = p.term ? TERM_META[p.term] : null;
                    return (
                      <div key={p.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            <img src={p.logo} alt="" className="w-5 h-5 object-contain" />
                          </div>
                          <span className="text-sm font-semibold text-slate-800 truncate">{p.name}</span>
                          {termInfo ? (
                            <span className={`${termInfo.bg} ${termInfo.text} px-2 py-0.5 rounded-md text-xs font-medium shrink-0`}>{termInfo.label}</span>
                          ) : (
                            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-xs font-medium shrink-0">{p.tag}</span>
                          )}
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${isNeg ? 'text-blue-500' : 'text-red-500'}`}>
                          {isNeg ? '−' : '+'}{fmt(Math.abs(p.editedDelta))}원
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex border-t border-slate-100 mt-3">
            <button onClick={() => setView('detail')}
              className="flex-1 py-4 text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors border-r border-slate-100">
              재설정
            </button>
            <button onClick={() => setView('success')}
              className="flex-1 py-4 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors">
              이대로 하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 완료 화면 ────────────────────────────────────────────
  if (view === 'success') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans gap-4">
        <img src={heroImg} alt="Pori" className="w-32 h-32 object-contain" />
        <h2 className="text-xl font-bold text-slate-800">월급 나누기 완료</h2>
        <button onClick={onClose}
          className="mt-2 px-12 py-3 bg-blue-600 text-white font-bold rounded-xl text-base hover:bg-blue-700 transition-colors">
          확인
        </button>
      </div>
    );
  }

  // ── 상세 (재설정) ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <div className="w-full max-w-[390px] h-screen flex flex-col bg-white relative shadow-2xl overflow-hidden">


        <header className="flex items-center justify-between p-4 bg-white border-b border-slate-100 shrink-0">
          <button className="p-2" onClick={() => setView('summary')}><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="font-semibold text-lg">월급 관리</h1>
          <button className="p-2 text-slate-400" onClick={onClose}><X className="w-5 h-5" /></button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 pt-4 pb-6">

          {/* 급여통장 노드 */}
          <div className="flex flex-col items-center mb-1">
            <p className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <img src={wooriLogo} alt="" className="w-4 h-4 rounded-full object-contain" />
              우리은행 급여통장
            </p>
            <div className="border-2 border-slate-700 rounded-2xl px-6 py-2.5 shadow-sm bg-white text-center">
              <p className="text-xs text-slate-400">{fmt(SALARY)}<span className="ml-0.5">원</span></p>
              <p className="text-sm font-bold text-red-500 mt-0.5">+{fmt(SALARY_DELTA)}원</p>
            </div>
          </div>

          {/* T자 분기선 */}
          <div className="relative h-7 pointer-events-none">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[2px] h-[14px] bg-slate-300" />
            <div className="absolute left-[25%] right-[25%] top-[12px] h-[2px] bg-slate-300 rounded-sm" />
            <div className="absolute left-[25%] -translate-x-1/2 top-[12px] w-[2px] h-[16px] bg-slate-300" />
            <div className="absolute right-[25%] translate-x-1/2 top-[12px] w-[2px] h-[16px] bg-slate-300" />
          </div>

          {/* 탭 노드 */}
          <div className="grid grid-cols-2 gap-4 mb-1">
            <button onClick={() => setActiveTab('spend')} className="text-left w-full">
              <p className={`text-xs font-semibold mb-1 text-center transition-colors ${activeTab === 'spend' ? 'text-slate-600' : 'text-slate-300'}`}>지출할 금액</p>
              <div className={`rounded-2xl px-3 py-2.5 text-center transition-all ${activeTab === 'spend' ? 'border-2 border-slate-700 bg-white' : 'border border-slate-200 bg-white opacity-50'}`}>
                <p className="text-xs text-slate-400">{fmt(SPEND)}<span className="ml-0.5">원</span></p>
                <p className={`text-sm font-bold ${spendDelta < 0 ? 'text-blue-500' : 'text-red-500'}`}>
                  {spendDelta < 0 ? '−' : '+'}{fmt(Math.abs(spendDelta))}원
                </p>
              </div>
            </button>
            <button onClick={() => setActiveTab('invest')} className="text-left w-full">
              <p className={`text-xs font-semibold mb-1 text-center transition-colors ${activeTab === 'invest' ? 'text-blue-400' : 'text-slate-300'}`}>투자할 금액</p>
              <div className={`rounded-2xl px-3 py-2.5 text-center transition-all ${activeTab === 'invest' ? 'border-2 border-blue-400 bg-blue-50' : 'border border-slate-200 bg-white opacity-50'}`}>
                <p className="text-xs text-slate-400">{fmt(INVEST)}<span className="ml-0.5">원</span></p>
                <p className={`text-sm font-bold ${investDelta < 0 ? 'text-blue-500' : 'text-red-500'}`}>
                  {investDelta < 0 ? '−' : '+'}{fmt(Math.abs(investDelta))}원
                </p>
              </div>
            </button>
          </div>

          {/* 계좌 트리 */}
          <div className="relative mt-3">
            {/* 브랜치 연결선 (Symmetrical Dynamic SVG Path - 오버랩 처리로 선 끊김 방지) */}
            <div className="relative h-8 w-full pointer-events-none mb-1">
              <svg className="absolute inset-0 w-full h-full text-slate-300 overflow-visible" fill="none" stroke="currentColor">
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={activeTab === 'spend'
                    ? "M 87.5 -8 L 87.5 16 L 24 16 L 24 40"
                    : "M 262.5 -8 L 262.5 16 L 326 16 L 326 40"
                  }
                />
              </svg>
            </div>

            <div className="space-y-5 relative">
              {activePlans.map((plan, idx) => {
                const isInvest = activeTab === 'invest';
                const isNeg = plan.editedDelta < 0;
                const abs = Math.abs(plan.editedDelta);
                const termInfo = plan.term ? TERM_META[plan.term] : null;
                const meta = isInvest && plan.institution ? BANK_META[plan.institution] : null;
                const isLast = idx === activePlans.length - 1;

                // 💡 동적 안전 조절 한도 계산 (마이너스 차단 & 전체 월급 인상분(10만원) 한도 내 배분 가능)
                const minVal = 0; // 마이너스 불가능
                const safeMax = Math.max(0, plan.editedDelta + remain);

                return (
                  <div key={plan.id} className={`relative pt-2 ${isInvest ? 'pr-12 pl-1' : 'pl-12 pr-1'}`}>
                    {/* 수직선 세그먼트 (top-[-8px] 오버랩을 적용하여 dynamic SVG와 Flawless하게 결합) */}
                    {isInvest ? (
                      /* 투자 탭: 우측 수직선 */
                      <div className={`absolute right-[23px] top-[-8px] w-[2px] bg-slate-300 z-0
                        ${isLast ? 'h-[52px]' : '-bottom-5'}`} />
                    ) : (
                      /* 지출 탭: 좌측 수직선 (항상 뒤에 계좌 추가 버튼이 있으므로 아래로 쭉 연결) */
                      <div className="absolute left-[23px] top-[-8px] w-[2px] bg-slate-300 z-0 -bottom-5" />
                    )}

                    {/* 수평 화살표 */}
                    <svg className={`absolute top-11 w-6 h-4 text-slate-300 ${isInvest ? 'right-6' : 'left-6'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" preserveAspectRatio="none"
                      style={isInvest ? { transform: 'scaleX(-1)' } : undefined}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M0 12h20M16 6l6 6-6 6" />
                    </svg>

                    <div className="bg-white border border-slate-200 rounded-2xl p-4">
                      {/* 카드 헤더 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isInvest ? (
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              <img src={meta?.imgSrc ?? plan.logo} alt="" className="w-5 h-5 object-contain" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              <img src={plan.logo} alt="" className="w-5 h-5 object-contain" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-700 text-sm leading-tight">{plan.name}</p>
                            {isInvest && plan.institution && (
                              <p className="text-[10px] text-slate-400 leading-none mt-0.5">{plan.institution}</p>
                            )}
                          </div>
                        </div>
                        {isInvest && termInfo ? (
                          <span className={`${termInfo.bg} ${termInfo.text} px-2 py-0.5 rounded-md text-xs font-medium`}>{termInfo.label}</span>
                        ) : (
                          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-xs font-medium">{plan.tag}</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 text-right mb-1">{fmt(plan.amount)}원</p>
                      {isInvest && plan.interestRate != null && (
                        <p className="text-xs text-emerald-600 font-medium text-right mb-1">연 {plan.interestRate}%</p>
                      )}

                      {/* 컴팩트 조정 영역 (수동 조절 스크롤 제거, + - 5000원 버튼 및 AI 추천 팁 제공) */}
                      <div className="mt-2.5 flex items-center gap-2">
                        {/* 컴팩트 디스플레이 필 */}
                        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-2 py-1 flex items-center justify-between">
                          {/* 마이너스 버튼 */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = plan.editedDelta - 5000;
                              if (nextVal >= minVal) {
                                setActivePlans(prev => prev.map(p => p.id === plan.id ? { ...p, editedDelta: nextVal } : p));
                              }
                            }}
                            disabled={plan.editedDelta <= minVal}
                            className={`w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center font-extrabold text-xs focus:outline-none transition-all
                              ${plan.editedDelta <= minVal ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-slate-600 active:scale-95'}`}
                          >
                            -
                          </button>

                          {/* 중앙 정합 금액값 */}
                          <div className="flex items-center gap-1 font-extrabold text-sm">
                            <span className={plan.editedDelta > 0 ? 'text-red-500' : 'text-slate-500'}>
                              {plan.editedDelta > 0 ? '+' : ''}{fmt(plan.editedDelta)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">원</span>

                            {/* 미세다이얼 아이콘 */}
                            <svg className={`w-3.5 h-3.5 ml-1 text-slate-300 shrink-0 ${plan.editedDelta !== 0 ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <circle cx={12} cy={12} r={9} strokeDasharray="3 3" />
                              <circle cx={12} cy={12} r={3} />
                            </svg>
                          </div>

                          {/* 플러스 버튼 */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = plan.editedDelta + 5000;
                              if (nextVal <= safeMax) {
                                setActivePlans(prev => prev.map(p => p.id === plan.id ? { ...p, editedDelta: nextVal } : p));
                              }
                            }}
                            disabled={plan.editedDelta >= safeMax}
                            className={`w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center font-extrabold text-xs focus:outline-none transition-all
                              ${plan.editedDelta >= safeMax ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-slate-600 active:scale-95'}`}
                          >
                            +
                          </button>
                        </div>

                        {/* AI 추천 팁 툴팁 */}
                        <div className="relative shrink-0 flex items-center">
                          <button
                            type="button"
                            onMouseEnter={() => setTooltip(plan.id)}
                            onMouseLeave={() => setTooltip(null)}
                            className="p-1.5 focus:outline-none rounded-full bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                          >
                            <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-500 transition-colors" />
                          </button>
                          {tooltip === plan.id && (
                            <div className="absolute right-0 bottom-8 w-60 bg-slate-800 text-white text-[11px] px-3 py-2.5 rounded-xl shadow-xl z-50 leading-relaxed pointer-events-none">
                              <div className="absolute -bottom-1 right-3.5 w-2 h-2 bg-slate-800 rotate-45" />
                              💡 {(isInvest ? INVEST_REASONS : SPEND_REASONS)[idx] ?? 'AI 추천 조정 금액이에요'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 계좌 추가 — spend 탭에서만 */}
              {activeTab === 'spend' && (
                <div className="relative pt-2 pl-12 pr-1">
                  {/* 마지막 계좌 추가 항목으로 이어지는 수직선 (화살표 높이인 h-[28px]까지만 뻗고 정밀하게 종료. top-[-8px] 적용) */}
                  <div className="absolute left-[23px] top-[-8px] w-[2px] bg-slate-300 z-0 h-[36px]" />

                  <svg className="absolute top-7 left-6 w-6 h-4 text-slate-300 pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" preserveAspectRatio="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M0 12h20M16 6l6 6-6 6" />
                  </svg>
                  <button onClick={openAddModal}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors font-semibold text-sm active:scale-[0.98]">
                    <Plus className="w-4 h-4" />계좌 추가
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* 하단 고정 바 (h-screen flex layout으로 완벽 격리 및 고정) */}
        <div className="bg-white border-t border-slate-100 px-5 pt-3 pb-6 shrink-0 shadow-[0_-8px_16px_-8px_rgba(0,0,0,0.06)] z-20">
          <div className="flex justify-between items-baseline mb-0.5">
            <span className="text-xs font-semibold text-slate-500">통장에 남은 금액</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-extrabold ${isOver ? 'text-red-500' : 'text-blue-600'}`}>{fmt(remain)}</span>
              <span className="text-lg text-slate-400">원</span>
            </div>
          </div>
          <span className={`block text-[10px] text-red-500 font-medium h-3 mb-2 transition-opacity ${isOver ? 'opacity-100' : 'opacity-0'}`}>
            +{fmt(SALARY_DELTA)}원보다 많이 배분했어요
          </span>
          <button disabled={isOver} onClick={() => setView('success')}
            className={`w-full ${isOver ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3.5 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2`}>
            완료 <Check className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 계좌 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-11/12 max-w-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-base font-bold text-slate-800">계좌 추가</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="px-6 pb-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">계좌 선택</label>
                <div className="space-y-2">
                  {ALL_ACCOUNTS.map(acc => {
                    const isSel = selectedAccId === acc.id;
                    return (
                      <button key={acc.id} type="button"
                        onClick={() => setSelectedAccId(isSel ? null : acc.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border-2 flex items-center justify-between transition active:scale-[0.98] ${isSel ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <div className="flex items-center gap-2.5">
                          <img src={acc.logo} alt="" className="w-8 h-8 rounded-full object-contain border border-slate-100 bg-white shrink-0" />
                          <div>
                            <p className="text-[10px] text-slate-400">{acc.bank}</p>
                            <p className="text-sm font-bold text-slate-800">{acc.name}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                          {isSel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">태그</label>
                <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addAccount(); }}
                  placeholder="예: 여행 자금"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
              </div>
            </div>
            <div className="flex border-t border-slate-100 bg-slate-50">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-500 font-semibold hover:bg-slate-100 transition-colors border-r border-slate-200">취소</button>
              <button onClick={addAccount} disabled={!selectedAccId || !newTag.trim()}
                className="flex-1 py-4 text-blue-600 font-bold hover:bg-blue-50 transition-colors disabled:text-slate-300 disabled:hover:bg-slate-50">추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
