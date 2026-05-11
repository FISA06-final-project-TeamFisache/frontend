import { Wallet, Heart, Plane, Laptop, ArrowRight, Target, CheckCircle2, Link2, ShieldAlert } from 'lucide-react';
import { formatAmount, getDynamicMetaphor, getGoalTitle } from '../utils/helpers';

type Account = { id: string; name: string; type: string };
type ETF = { id: string; category: string; name: string; type: string; tag: string; color: string; bg: string; returnRate: number; mddRisk: number; rank: number };

type WizardProps = {
  wizardStep: number;
  setWizardStep: (step: number) => void;
  goal: string;
  setGoal: (g: string) => void;
  goalAmount: number;
  setGoalAmount: (v: number) => void;
  goalPeriod: number;
  setGoalPeriod: (v: number) => void;
  initialInvestment: number;
  setInitialInvestment: (v: number) => void;
  initialFundingAccount: Account;
  setInitialFundingAccount: (acc: Account) => void;
  goalRoutingPercent: number;
  setGoalRoutingPercent: (v: number) => void;
  tempRoutingSetup: { id: number | string; accountId: string; tag: string; percent: number }[];
  setTempRoutingSetup: (setup: { id: number | string; accountId: string; tag: string; percent: number }[]) => void;
  monthlyContribution: number;
  setMonthlyContribution: (v: number) => void;
  availableAccounts: Account[];
  ETF_CATALOG: ETF[];
  setStock: (v: number) => void;
  setBond: (v: number) => void;
  setCash: (v: number) => void;
  setLoan: (v: number) => void;
  setSelectedStock: (etf: ETF) => void;
  setActiveTab: (tab: string) => void;
  setLinkModalStep: (step: string) => void;
  setShowLinkNewAccountModal: (v: boolean) => void;
};

export default function Wizard({
  wizardStep, setWizardStep,
  goal, setGoal,
  goalAmount, setGoalAmount,
  goalPeriod, setGoalPeriod,
  initialInvestment, setInitialInvestment,
  initialFundingAccount, setInitialFundingAccount,
  goalRoutingPercent, setGoalRoutingPercent,
  tempRoutingSetup, setTempRoutingSetup,
  monthlyContribution, setMonthlyContribution,
  availableAccounts,
  ETF_CATALOG,
  setStock, setBond, setCash, setLoan,
  setSelectedStock, setActiveTab,
  setLinkModalStep, setShowLinkNewAccountModal,
}: WizardProps) {
  return (
    <div className="p-5 space-y-6 min-h-full flex flex-col bg-white animate-in slide-in-from-right pb-24">

      {wizardStep === 1 && (
        <div className="space-y-6 flex-1 animate-in slide-in-from-right">
          <h2 className="text-2xl font-bold text-gray-900 mt-4">어떤 목표를 세워볼까요?</h2>
          <div className="space-y-3">
            {[
              { id: 'savings', icon: <Wallet />, title: '종잣돈 모으기', desc: '세부 기간/금액 설정', defaultAmt: 10000, defaultPeriod: 4 },
              { id: 'wedding', icon: <Heart />, title: '결혼 준비', desc: '세부 기간/금액 설정', defaultAmt: 10000, defaultPeriod: 4 },
              { id: 'travel', icon: <Plane />, title: '해외 여행', desc: '단기 자금 마련', defaultAmt: 500, defaultPeriod: 1 },
              { id: 'ipad', icon: <Laptop />, title: '기타 (사고 싶은 물건)', desc: '아이패드, 명품 백 등', defaultAmt: 150, defaultPeriod: 1 },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setGoal(item.id); setGoalAmount(item.defaultAmt); setGoalPeriod(item.defaultPeriod); setWizardStep(2); }}
                className="w-full text-left border border-gray-100 hover:border-blue-500 hover:bg-blue-50 bg-white p-4 rounded-xl flex items-center gap-4 transition active:scale-95"
              >
                <div className="text-gray-500">{item.icon}</div>
                <div>
                  <div className="font-bold text-gray-800">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {wizardStep === 2 && (
        <div className="space-y-6 flex-1 pt-4 animate-in slide-in-from-right flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 mt-4 leading-tight">목표 달성을 위한<br/>세부 계획을 세워볼까요?</h2>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-8 mb-6">
            <div>
              <div className="flex justify-between items-end mb-4">
                <span className="font-bold text-gray-700">달성 기간</span>
                <span className="text-2xl font-bold text-blue-600">{goalPeriod}년 뒤</span>
              </div>
              <input type="range" min="1" max="20" step="1" value={goalPeriod} onChange={(e) => setGoalPeriod(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-2"><span>1년</span><span>20년</span></div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-gray-700">목표 금액</span>
                <span className="text-2xl font-bold text-blue-600">{formatAmount(goalAmount)}</span>
              </div>
              <div className="bg-blue-50 text-blue-700 text-xs py-1.5 px-3 rounded-lg inline-block mb-4 font-medium transition-all">
                💡 {getDynamicMetaphor(goalAmount)}
              </div>
              <input type="range" min="100" max="100000" step="100" value={goalAmount} onChange={(e) => setGoalAmount(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-2"><span>100만 원</span><span>10억 원</span></div>
            </div>
          </div>
          <button onClick={() => setWizardStep(3)} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 mt-auto active:scale-95">
            다음 단계로 <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {wizardStep === 3 && (
        <div className="space-y-6 flex-1 pt-4 animate-in slide-in-from-right flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 mt-4 leading-tight">목표를 향한 첫 걸음,<br/>초기 자본금을 설정해주세요</h2>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 mb-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-gray-700">시작 금액</span>
                <span className="text-2xl font-bold text-blue-600">{initialInvestment > 0 ? `${initialInvestment}만 원` : '0원'}</span>
              </div>
              <input type="range" min="0" max={goalAmount} step="10" value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-2"><span>0원</span><span>{formatAmount(goalAmount)}</span></div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <span className="font-bold text-gray-700 block mb-3">어느 계좌에서 가져올까요?</span>
              <div className="space-y-2">
                {availableAccounts.filter(acc => acc.type === '현금').map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => setInitialFundingAccount(acc)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${initialFundingAccount?.id === acc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <span className="text-sm font-bold text-gray-800">{acc.name}</span>
                    {initialFundingAccount?.id === acc.id && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                  </button>
                ))}
                <button
                  onClick={() => { setLinkModalStep('intro'); setShowLinkNewAccountModal(true); }}
                  className="w-full p-3 border border-dashed border-gray-300 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-1 mt-2"
                >
                  <Link2 className="w-4 h-4" /> 새로운 통장 연결
                </button>
              </div>
            </div>
          </div>
          <button onClick={() => setWizardStep(4)} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 mt-auto active:scale-95">
            다음 단계로 <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {wizardStep === 4 && (
        <div className="space-y-6 flex-1 pt-4 animate-in slide-in-from-right flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 mt-4 leading-tight">새 목표에 맞춰<br/>월급 리밸런싱을 설정할까요?</h2>
          <p className="text-sm text-gray-500">기존에 설정하신 월급 자동 분배 비율에 새 목표를 추가하여 비중을 재조정합니다. (기준 급여: 300만원)</p>

          <div className="flex-1 overflow-y-auto space-y-4 pb-4 mt-4">
            <div className="bg-blue-50 p-5 rounded-3xl border border-blue-200 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
              <div className="flex items-center justify-between pl-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-900">새 목표: {getGoalTitle(goal)}</span>
                </div>
              </div>
              <div className="flex gap-3 items-center pl-2">
                <span className="text-sm font-bold text-blue-800 flex-1">매월 내 월급의</span>
                <div className="w-24 relative shrink-0">
                  <input
                    type="number" min="0" max="100"
                    value={goalRoutingPercent}
                    onChange={(e) => setGoalRoutingPercent(Number(e.target.value))}
                    className="w-full bg-white border border-blue-200 rounded-xl py-3 pr-7 pl-3 text-sm text-right font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-medium pl-2">
                <span className="text-blue-600">권장 투입: 월 {Math.ceil(goalAmount / (goalPeriod * 12))}만원</span>
                <span className="text-blue-800 font-bold bg-white px-2 py-1 rounded-lg">예상 이체액: {(3000000 * goalRoutingPercent / 100).toLocaleString()}원</span>
              </div>
            </div>

            {tempRoutingSetup.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between gap-4">
                <div className="flex-1 truncate">
                  <p className="text-xs text-gray-400 font-bold mb-0.5">{availableAccounts.find(a => a.id === item.accountId)?.name}</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{item.tag}</p>
                </div>
                <div className="w-20 relative shrink-0">
                  <input
                    type="number" min="0" max="100"
                    value={item.percent}
                    onChange={(e) => {
                      const newTemp = tempRoutingSetup.map(t => t.id === item.id ? { ...t, percent: Number(e.target.value) } : t);
                      setTempRoutingSetup(newTemp);
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pr-6 pl-2 text-sm text-right font-bold focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 pt-4 border-t border-gray-100">
            {(() => {
              const totalPercent = goalRoutingPercent + tempRoutingSetup.reduce((sum, item) => sum + Number(item.percent || 0), 0);
              return (
                <>
                  <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-sm font-bold text-gray-500">총 분배 비율</span>
                    <span className={`text-lg font-extrabold ${totalPercent === 100 ? 'text-blue-600' : 'text-red-500'}`}>
                      {totalPercent}% <span className="text-sm font-medium text-gray-400">/ 100%</span>
                    </span>
                  </div>
                  {totalPercent !== 100 && (
                    <p className="text-xs text-red-500 font-bold mb-3 text-center bg-red-50 py-2 rounded-lg">
                      비율의 합이 100%가 되어야 합니다.
                    </p>
                  )}
                  <button
                    disabled={totalPercent !== 100}
                    onClick={() => {
                      setMonthlyContribution((3000000 * goalRoutingPercent / 100) / 10000);
                      setWizardStep(6);
                    }}
                    className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 text-white py-4 rounded-xl font-bold flex justify-center items-center transition shadow-lg active:scale-95"
                  >
                    월급 분배 저장하고 다음으로 <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {wizardStep === 6 && (
        <div className="space-y-6 flex-1 pt-4 animate-in slide-in-from-right flex flex-col">
          <div className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2 self-start">
            AI 자산 네비게이터 분석 완료
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            목표 달성을 위해서는<br/>연평균 <span className="text-purple-600">7.5%</span> 수익이 필요합니다.
          </h2>
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              설정하신 <strong>'{goalPeriod}년 뒤 {formatAmount(goalAmount)}'</strong> 목표를 달성하려면 초기 자금 {initialInvestment}만 원에 매월 <strong>{monthlyContribution}만 원</strong>씩 투입 시 이 수익률이 반드시 필요합니다.
            </p>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-800 flex gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p>현재 담으신 <strong>[적금 위주 포트폴리오]로는 {goalPeriod}년 뒤 {formatAmount(Math.floor(goalAmount * 0.82))}에 그쳐 목표 달성에 실패</strong>합니다.</p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed font-semibold">
              목표 달성 확률을 90% 이상으로 끌어올렸던 과거 데이터 기반의 <span className="text-blue-600">
                {goal === 'real_estate' ? '[대출 40% + 주식 30% + 채권 20% + 예금 10%]' : '[주식 40% + 채권 40% + 예금 20%]'}
              </span> 템플릿으로 시뮬레이터를 켜볼까요?
            </p>
          </div>
          <button
            onClick={() => {
              if (goal === 'real_estate') {
                setStock(30); setBond(20); setCash(10); setLoan(40);
              } else {
                setStock(40); setBond(40); setCash(20); setLoan(0);
              }
              setSelectedStock(ETF_CATALOG.find(e => e.id === 'market1')!);
              setActiveTab('simulator');
            }}
            className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 mt-auto active:scale-95"
          >
            포트폴리오 설계하기 <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
