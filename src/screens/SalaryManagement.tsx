import { useState } from 'react';
import { ChevronLeft, HelpCircle, Lock, LockOpen, Trash2, Plus, Check, X } from 'lucide-react';
import wooriLogo from '../assets/banks/woori.png';
import kakaoLogo from '../assets/banks/kakao.png';
import tossLogo  from '../assets/banks/toss.png';
import heroImg   from '../assets/hero.png';

type View = 'summary' | 'detail' | 'success';
type Tab  = 'spend' | 'invest';

const fmt = (n: number) => n.toLocaleString('ko-KR');

// ── mock 데이터 ───────────────────────────────────────────
const SALARY       = 3_200_000;
const SALARY_DELTA = 100_000;
const SPEND        = 2_000_000;
const INVEST       = 1_200_000;

const SPEND_PLANS = [
  { id: '1', name: '입출금통장', tag: '생활비', amount: 1_500_000, delta: 50_000, color: '#F59E0B', logo: kakaoLogo },
  { id: '2', name: '파킹통장',   tag: '비상금', amount:   300_000, delta: 30_000, color: '#6366F1', logo: tossLogo  },
];

const INVEST_PLANS = [
  { id: '3', name: '자동투자',   tag: '투자',   amount: 1_200_000, delta: 20_000, color: '#10B981', logo: wooriLogo },
];

const ALL_ACCOUNTS = [
  { id: 'a1', name: '입출금통장', bank: '카카오뱅크', logo: kakaoLogo },
  { id: 'a2', name: '파킹통장',  bank: '토스뱅크',  logo: tossLogo  },
  { id: 'a3', name: '급여통장',  bank: '우리은행',  logo: wooriLogo },
];

const REASONS = [
  '생활비 카테고리 지난달 32,000원 초과 → 입출금통장 +50,000원',
  '비상금 목표 달성률 60%, 최근 3개월 미인출 → 파킹통장 +30,000원',
  '투자 비율 20% 유지 기준 충족 → 자동투자 +20,000원',
];
// ─────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

export default function SalaryManagement({ onClose }: Props) {
  const [view,        setView]        = useState<View>('summary');
  const [activeTab,   setActiveTab]   = useState<Tab>('spend');
  const [spendPlans,  setSpendPlans]  = useState(SPEND_PLANS.map(p => ({ ...p, editedDelta: p.delta, locked: false })));
  const [investPlans, setInvestPlans] = useState(INVEST_PLANS.map(p => ({ ...p, editedDelta: p.delta, locked: false })));
  const [tooltip,     setTooltip]     = useState<string | null>(null);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [selectedAccId,  setSelectedAccId]  = useState<string | null>(null);
  const [newTag,         setNewTag]         = useState('');
  const [deleteTarget,   setDeleteTarget]   = useState<{ tab: Tab; idx: number } | null>(null);

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
      locked: false, color: '#94A3B8', logo: acc.logo,
    }]);
    setShowAddModal(false);
  };

  // ── 요약 카드 ─────────────────────────────────────────
  if (view === 'summary') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center font-sans px-5 gap-3 py-10 relative">

        <button
          onClick={onClose}
          className="fixed top-5 right-5 z-50 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-sm px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">이번 달 월급 변동</p>
          <p className="text-3xl font-extrabold text-red-500">+{fmt(SALARY_DELTA)}원</p>
          <p className="text-xs text-slate-400 mt-1">우리은행 급여통장 · 지난달 대비</p>
        </div>

        <div className="w-full max-w-[360px] bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3.5 space-y-1.5">
          {REASONS.map((r, i) => (
            <p key={i} className="text-xs text-amber-800 leading-relaxed">{r}</p>
          ))}
        </div>

        <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 space-y-2">

            <div className="flex items-stretch gap-0 bg-slate-100 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-center flex-shrink-0 px-3 py-4">
                <p className="text-xs font-bold text-slate-600 whitespace-nowrap">지출할 금액</p>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-2 pr-3 py-3">
                {spendPlans.map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        <img src={p.logo} alt={p.name} className="w-5 h-5 object-contain" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 truncate">{p.name}</span>
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0">{p.tag}</span>
                    </div>
                    <span className="text-sm font-bold text-red-500 flex-shrink-0">+{fmt(p.editedDelta)}원</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-stretch gap-0 bg-slate-100 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-center flex-shrink-0 px-3 py-4">
                <p className="text-xs font-bold text-blue-600 whitespace-nowrap">투자할 금액</p>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-2 pr-3 py-3">
                {investPlans.map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        <img src={p.logo} alt={p.name} className="w-5 h-5 object-contain" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 truncate">{p.name}</span>
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0">{p.tag}</span>
                    </div>
                    <span className="text-sm font-bold text-red-500 flex-shrink-0">+{fmt(p.editedDelta)}원</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="flex border-t border-slate-100 mt-3">
            <button
              onClick={() => setView('detail')}
              className="flex-1 py-4 text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors border-r border-slate-100"
            >
              재설정
            </button>
            <button
              onClick={() => setView('success')}
              className="flex-1 py-4 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors"
            >
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
        <button
          onClick={onClose}
          className="mt-2 px-12 py-3 bg-blue-600 text-white font-bold rounded-xl text-base hover:bg-blue-700 transition-colors"
        >
          확인
        </button>
      </div>
    );
  }

  // ── 월급 관리 상세 (재설정) ────────────────────────────
  const bottomLabel = activeTab === 'spend' ? '통장에 남은 금액' : '배분 남은 금액';

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <div className="w-full max-w-[390px] min-h-screen bg-white relative shadow-2xl pb-44">

        <header className="flex items-center justify-between p-4 bg-white sticky top-0 z-20 border-b border-slate-100">
          <button className="p-2" onClick={() => setView('summary')}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-semibold text-lg">월급 관리</h1>
          <button className="p-2 text-slate-400" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="p-5 pt-4">

          {/* 급여통장 노드 */}
          <div className="flex flex-col items-center mb-1">
            <p className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <img src={wooriLogo} alt="우리은행" className="w-4 h-4 rounded-full object-contain" />
              우리은행 급여통장
            </p>
            <div className="border-2 border-slate-700 rounded-2xl px-6 py-2.5 shadow-sm bg-white text-center">
              <p className="text-xs text-slate-400">{fmt(SALARY)}<span className="ml-0.5">원</span></p>
              <p className="text-sm font-bold text-red-500 mt-0.5">+{fmt(SALARY_DELTA)}원</p>
            </div>
          </div>

          {/* T자 분기선 */}
          <div className="relative h-7 pointer-events-none">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[3px] h-[14px] bg-slate-700" />
            <div className="absolute left-[25%] right-[25%] top-[12px] h-[3px] bg-slate-700 rounded-sm" />
            <div className="absolute left-[25%] -translate-x-1/2 top-[12px] w-[3px] h-[16px] bg-slate-700" />
            <div className="absolute right-[25%] translate-x-1/2 top-[12px] w-[3px] h-[16px] bg-slate-700" />
          </div>

          {/* 지출할 금액 / 투자할 금액 노드 — 자동계산 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1 text-center">지출할 금액 ①</p>
              <div className="border-2 border-slate-700 rounded-2xl px-3 py-2.5 bg-white text-center">
                <p className="text-xs text-slate-400">{fmt(SPEND)}<span className="ml-0.5">원</span></p>
                <p className="text-sm font-bold text-red-500">+{fmt(spendDelta)}원</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-400 mb-1 text-center">투자할 금액</p>
              <div className="border-2 border-blue-400 rounded-2xl px-3 py-2.5 bg-blue-50 text-center">
                <p className="text-xs text-slate-400">{fmt(INVEST)}<span className="ml-0.5">원</span></p>
                <p className="text-sm font-bold text-red-500">+{fmt(investDelta)}원</p>
              </div>
            </div>
          </div>

          {/* 탭 */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-4">
            <button
              onClick={() => setActiveTab('spend')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'spend' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              지출할 금액
            </button>
            <button
              onClick={() => setActiveTab('invest')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-l border-slate-200 ${activeTab === 'invest' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              투자할 금액
            </button>
          </div>

          {/* 계좌 트리 */}
          <div className="relative">
            <div className="absolute left-6 top-[-14px] bottom-[3px] w-[3px] bg-slate-700 rounded-sm z-0" />

            <div className="space-y-5 relative">
              {activePlans.map((plan, idx) => (
                <div key={plan.id} className="relative pl-12 pr-1 pt-2">
                  <svg className="absolute left-6 top-11 w-6 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" preserveAspectRatio="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M0 12h20M16 6l6 6-6 6" />
                  </svg>

                  <div className={`bg-white border rounded-2xl p-4 ${plan.locked ? 'border-slate-300 opacity-70' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                          <img src={plan.logo} alt={plan.name} className="w-5 h-5 object-contain" />
                        </div>
                        <span className="font-bold text-slate-700 text-sm">{plan.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-xs font-medium">
                          {plan.tag}
                        </span>
                        <button
                          onClick={() => setActivePlans(prev => prev.map((p, i) => i === idx ? { ...p, locked: !p.locked } : p))}
                          className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                        >
                          {plan.locked
                            ? <Lock className="w-4 h-4 text-red-400" />
                            : <LockOpen className="w-4 h-4 text-blue-400" />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ tab: activeTab, idx })}
                          className="p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-slate-300 hover:text-rose-400" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 text-right mb-1">{fmt(plan.amount)}원</p>

                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-red-500 shrink-0">+</span>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          disabled={plan.locked}
                          value={fmt(plan.editedDelta)}
                          onChange={e => {
                            const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
                            setActivePlans(prev => prev.map((p, i) => i === idx ? { ...p, editedDelta: v } : p));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3 pr-8 text-right font-bold text-red-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="absolute right-3 top-3 text-slate-400 text-xs">원</span>
                      </div>
                      <div className="relative shrink-0">
                        <button
                          onMouseEnter={() => setTooltip(plan.id)}
                          onMouseLeave={() => setTooltip(null)}
                          className="p-1"
                        >
                          <HelpCircle className="w-4 h-4 text-slate-300" />
                        </button>
                        {tooltip === plan.id && (
                          <div className="absolute right-0 bottom-8 w-60 bg-slate-800 text-white text-xs px-3 py-2.5 rounded-xl shadow-xl z-50 leading-relaxed pointer-events-none">
                            <div className="absolute -bottom-1 right-4 w-2 h-2 bg-slate-800 rotate-45" />
                            💡 {REASONS[idx] ?? 'AI 추천 조정 금액이에요'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="relative pl-12 pr-1 pt-2">
                <svg className="absolute left-6 top-7 w-6 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" preserveAspectRatio="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M0 12h20M16 6l6 6-6 6" />
                </svg>
                <button
                  onClick={openAddModal}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors font-semibold text-sm active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  계좌 추가
                </button>
              </div>

              <div className="relative h-10 mt-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="absolute left-[13.5px] bottom-0 text-slate-700">
                  <path d="M6 14l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
        </main>

        {/* 하단 바 — 완료 버튼 가운데 */}
        <div className="fixed bottom-0 max-w-[390px] w-full bg-white border-t border-slate-200 px-4 pt-3 pb-6 z-20 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-semibold text-slate-500">{bottomLabel}</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-extrabold ${isOver ? 'text-red-500' : 'text-blue-600'}`}>{fmt(remain)}</span>
              <span className="text-lg text-slate-400">원</span>
            </div>
          </div>
          <span className={`block text-[10px] text-red-500 font-medium h-3 mb-2 transition-opacity ${isOver ? 'opacity-100' : 'opacity-0'}`}>
            +{fmt(SALARY_DELTA)}원보다 많이 배분했어요
          </span>
          <button
            disabled={isOver}
            onClick={() => setView('success')}
            className={`w-full ${isOver ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3.5 rounded-xl font-bold text-lg transition-colors shadow-md flex items-center justify-center gap-2`}
          >
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
                  {ALL_ACCOUNTS.filter(a => !activePlans.some(p => p.name === a.name)).map(acc => {
                    const isSelected = selectedAccId === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setSelectedAccId(isSelected ? null : acc.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border-2 flex items-center justify-between transition active:scale-[0.98] ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={acc.logo} alt={acc.bank} className="w-8 h-8 rounded-full object-contain border border-slate-100 bg-white shrink-0" />
                          <div>
                            <p className="text-[10px] text-slate-400">{acc.bank}</p>
                            <p className="text-sm font-bold text-slate-800">{acc.name}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">태그</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addAccount(); }}
                  placeholder="예: 여행 자금"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex border-t border-slate-100 bg-slate-50">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-500 font-semibold hover:bg-slate-100 transition-colors border-r border-slate-200">취소</button>
              <button onClick={addAccount} disabled={!selectedAccId || !newTag.trim()} className="flex-1 py-4 text-blue-600 font-bold hover:bg-blue-50 transition-colors disabled:text-slate-300 disabled:hover:bg-slate-50">추가</button>
            </div>
          </div>
        </div>
      )}

      {/* 계좌 삭제 확인 모달 */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-11/12 max-w-sm overflow-hidden shadow-2xl">
            <div className="p-7 text-center pt-8">
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-rose-500" />
              </div>
              <p className="text-slate-800 text-lg font-medium leading-relaxed">
                <span className="font-bold text-slate-900">
                  {deleteTarget.tab === 'spend'
                    ? spendPlans[deleteTarget.idx]?.name
                    : investPlans[deleteTarget.idx]?.name}
                </span> 계좌를<br />삭제할까요?
              </p>
              <p className="text-xs text-slate-400 mt-2">삭제한 배분은 다른 계좌로 다시 나눠야 해요.</p>
            </div>
            <div className="flex border-t border-slate-100 bg-slate-50">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-4 text-slate-500 font-semibold hover:bg-slate-100 transition-colors border-r border-slate-200">취소</button>
              <button
                onClick={() => {
                  if (deleteTarget.tab === 'spend') {
                    setSpendPlans(prev => prev.filter((_, i) => i !== deleteTarget.idx));
                  } else {
                    setInvestPlans(prev => prev.filter((_, i) => i !== deleteTarget.idx));
                  }
                  setDeleteTarget(null);
                }}
                className="flex-1 py-4 text-rose-600 font-bold hover:bg-rose-50 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
