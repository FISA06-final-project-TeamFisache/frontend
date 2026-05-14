import { BarChart3, Search, CheckCircle2 } from 'lucide-react';

type ETF = {
  id: string;
  category: string;
  name: string;
  type: string;
  tag: string;
  color: string;
  bg: string;
  returnRate: number;
  mddRisk: number;
  rank: number;
};

type Loan = {
  id: string;
  category: string;
  name: string;
  type: string;
  tag: string;
  color: string;
  bg: string;
  interestRate: number;
  rank: number;
};

type Account = {
  id: string;
  name: string;
  type: string;
};

type SimulatorProps = {
  stock: number;
  bond: number;
  cash: number;
  loan: number;
  goal: string;
  goalPeriod: number;
  editingGoalId: number | string | null;
  selectedStock: ETF;
  selectedLoan: Loan;
  selectedBank: Account;
  onSliderChange: (type: string, value: number) => void;
  setCatalogFilter: (filter: string) => void;
  setSearchQuery: (q: string) => void;
  setShowCatalogModal: (v: boolean) => void;
  setShowLoanCatalogModal: (v: boolean) => void;
  setShowBankModal: (v: boolean) => void;
  setShowFinalConfirmModal: (v: boolean) => void;
  onGenerateAiReport: () => void;
};

export default function Simulator({
  stock, bond, cash, loan,
  goal, goalPeriod, editingGoalId,
  selectedStock, selectedLoan, selectedBank,
  onSliderChange,
  setCatalogFilter, setSearchQuery,
  setShowCatalogModal, setShowLoanCatalogModal,
  setShowBankModal, setShowFinalConfirmModal,
  onGenerateAiReport,
}: SimulatorProps) {

  const calculateMetrics = () => {
    const invested = stock + bond + cash;
    const stockRatio = invested > 0 ? stock / invested : 0;
    const bondRatio = invested > 0 ? bond / invested : 0;
    const cashRatio = invested > 0 ? cash / invested : 0;

    const currentMdd = (selectedStock.mddRisk * stockRatio + 0.05 * bondRatio).toFixed(3);
    const mddPercentage = (parseFloat(currentMdd) * 100).toFixed(1);

    const loanImpact = goal === 'real_estate' ? (selectedLoan.interestRate * (loan / 100)) : 0;
    const currentReturn = (selectedStock.returnRate * stockRatio + 0.04 * bondRatio + 0.02 * cashRatio - loanImpact).toFixed(3);
    const returnPercentage = (parseFloat(currentReturn) * 100).toFixed(1);

    let successRate = 50;
    if (parseFloat(currentReturn) >= 0.075 || loan > 30) {
      successRate = parseFloat(currentMdd) > 0.15 && loan > 50 ? 65 : 92;
    } else {
      successRate = 45;
    }
    if (loan > 0) successRate = Math.min(99, successRate + Math.floor(loan / 2));

    return { mddPercentage, returnPercentage, successRate };
  };

  const { mddPercentage, returnPercentage, successRate } = calculateMetrics();

  return (
    <div className="p-5 space-y-5 pb-24 bg-gray-50 animate-in fade-in min-h-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mt-4">
          {editingGoalId ? "포트폴리오 수정하기" : "자산 포트폴리오 설계"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {editingGoalId ? "AI 제안이나 본인의 판단에 따라 비율과 상품을 재조정합니다." : "자금 조달 계획 및 투자 상품에 따라 리스크가 실시간 연산됩니다."}
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border-l-4 border-purple-500 shadow-sm space-y-3 transition-all duration-300">
        <div className="flex gap-2 items-center text-purple-700 font-bold text-sm">
          <BarChart3 className="w-4 h-4" /> 실시간 포트폴리오 연산 브리핑
        </div>
        {goal === 'real_estate' && loan > 50 ? (
          <p className="text-sm text-gray-700 leading-relaxed">
            "현재 <strong>대출 비중이 {loan}%</strong>로 다소 높습니다. 레버리지를 통해 목표 달성 시기를 앞당길 수 있지만, <strong>{selectedLoan.name}({selectedLoan.tag})</strong> 이자 부담 리스크가 <span className="text-red-500 font-bold">전체 수익률을 하락</span>시킵니다."
          </p>
        ) : selectedStock.category === 'growth' && stock > 30 ? (
          <p className="text-sm text-gray-700 leading-relaxed">
            "방금 담으신 <strong>{selectedStock.name}</strong>은 성장성이 높지만 변동성이 매우 큽니다. 투자 자산 내 예상 최대 손실(MDD)이 <span className="text-red-500 font-bold">-{mddPercentage}%로 증가</span>했습니다."
          </p>
        ) : selectedStock.category === 'dividend' ? (
          <p className="text-sm text-gray-700 leading-relaxed">
            "방금 담으신 <strong>{selectedStock.name}</strong>은 상관계수가 낮아 분산 투자 효과가 강력하게 발생합니다. 덕분에 전체적인 리스크가 <span className="text-green-600 font-bold">-{mddPercentage}% 수준으로 크게 희석</span>되었습니다."
          </p>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed">
            "현재 <strong>{selectedStock.name}</strong>이 포함된 조합입니다. 시장 평균 수준의 변동성을 보이며, 과거 데이터 기준 {goalPeriod}년 뒤 목표 달성에 매우 안정적인 구조입니다."
          </p>
        )}
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        {goal === 'real_estate' && (
          <div className="pb-4 border-b border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-yellow-600">대출 (부동산 레버리지)</span>
              <span className="font-bold text-lg">{loan}%</span>
            </div>
            <button
              onClick={() => { setSearchQuery(''); setShowLoanCatalogModal(true); }}
              className="w-full bg-white border border-gray-300 hover:border-yellow-500 p-3 rounded-xl flex items-center justify-between mb-4 transition group shadow-sm"
            >
              <div className="text-left flex-1 truncate pr-3">
                <div className="text-[10px] text-gray-400 font-bold mb-0.5">현재 선택된 대출 상품</div>
                <div className="text-sm font-bold text-gray-800 truncate">{selectedLoan.name}</div>
              </div>
              <div className="bg-yellow-50 text-yellow-700 p-2 rounded-lg group-hover:bg-yellow-100 flex items-center gap-1 shrink-0 text-xs font-bold">
                <Search className="w-3 h-3" /> 변경
              </div>
            </button>
            <input type="range" min="0" max="80" value={loan} onChange={(e) => onSliderChange('loan', Number(e.target.value))} className="w-full accent-yellow-500" />
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-red-500">위험 자산 (주식/ETF)</span>
            <span className="font-bold text-lg">{stock}%</span>
          </div>
          <button
            onClick={() => { setCatalogFilter('popular'); setSearchQuery(''); setShowCatalogModal(true); }}
            className="w-full bg-white border border-gray-300 hover:border-purple-500 p-3 rounded-xl flex items-center justify-between mb-4 transition group shadow-sm"
          >
            <div className="text-left flex-1 truncate pr-3">
              <div className="text-[10px] text-gray-400 font-bold mb-0.5">현재 바구니에 담긴 주식</div>
              <div className="text-sm font-bold text-gray-800 truncate">{selectedStock.name}</div>
            </div>
            <div className="bg-purple-50 text-purple-600 p-2 rounded-lg group-hover:bg-purple-100 flex items-center gap-1 shrink-0 text-xs font-bold">
              <Search className="w-3 h-3" /> 변경
            </div>
          </button>
          <input type="range" min="0" max="100" value={stock} onChange={(e) => onSliderChange('stock', Number(e.target.value))} className="w-full accent-red-500" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2 px-1">
            <span className="font-bold text-blue-500">안전 자산 (채권)</span>
            <span className="font-bold">{bond}%</span>
          </div>
          <input type="range" min="0" max="100" value={bond} onChange={(e) => onSliderChange('bond', Number(e.target.value))} className="w-full accent-blue-500" />
        </div>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-green-500">현금성 자산 (예적금)</span>
            <span className="font-bold text-lg">{cash}%</span>
          </div>
          <button
            onClick={() => setShowBankModal(true)}
            className="w-full bg-white border border-gray-300 hover:border-green-500 p-3 rounded-xl flex items-center justify-between mb-4 transition group shadow-sm"
          >
            <div className="text-left flex-1 truncate pr-3">
              <div className="text-[10px] text-gray-400 font-bold mb-0.5">보관 계좌</div>
              <div className="text-sm font-bold text-gray-800 truncate">{selectedBank?.name}</div>
            </div>
            <div className="bg-green-50 text-green-600 p-2 rounded-lg group-hover:bg-green-100 flex items-center gap-1 shrink-0 text-xs font-bold">
              <Search className="w-3 h-3" /> 변경
            </div>
          </button>
          <input type="range" min="0" max="100" value={cash} onChange={(e) => onSliderChange('cash', Number(e.target.value))} className="w-full accent-green-500" />
        </div>
      </div>

      <div className="bg-gray-900 p-5 rounded-3xl text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 mb-1 font-bold tracking-wide">실시간 시뮬레이션 결과</p>
            <p className="text-sm leading-relaxed mt-2">
              이 조합이라면 {goalPeriod}년 뒤 목표를<br/>달성할 확률이 <strong className={`text-2xl ${successRate > 80 ? 'text-green-400' : successRate > 60 ? 'text-blue-400' : 'text-orange-400'}`}>{successRate}%</strong> 입니다.
            </p>
          </div>
          <div className="w-20 h-20 rounded-full border-[5px] border-gray-700 flex flex-col items-center justify-center relative bg-gray-800">
            <span className="font-bold text-xl leading-none">{returnPercentage}%</span>
            <span className="text-[10px] text-gray-400 mt-1">예상 수익</span>
          </div>
        </div>
      </div>

      <button onClick={onGenerateAiReport} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 mt-6 shadow-lg shadow-purple-200 transition-transform active:scale-95">
        ✨ Gemini AI 포트폴리오 심층 진단받기
      </button>

      <button onClick={() => setShowFinalConfirmModal(true)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-xl font-bold flex justify-center items-center gap-2 mt-3 transition active:scale-95">
        {editingGoalId ? "이대로 리밸런싱 확정하기" : "이 비율로 최종 확정하기"} <CheckCircle2 className="w-5 h-5" />
      </button>
    </div>
  );
}
