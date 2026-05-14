import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { ETF_CATALOG } from '../../data/mockData';
import { formatAmount } from '../../utils/helpers';

// /wizard/ai-analysis
// AI 분석 결과 + 추천 포트폴리오 템플릿 적용 → 시뮬레이터로 이동
export default function AiAnalysis() {
  const navigate = useNavigate();
  const { goal, goalAmount, goalPeriod, initialInvestment, monthlyContribution, setStock, setBond, setCash, setLoan, setSelectedStock } = useWizard();

  const handleApplyTemplate = () => {
    if (goal === 'real_estate') {
      setStock(30); setBond(20); setCash(10); setLoan(40);
    } else {
      setStock(40); setBond(40); setCash(20); setLoan(0);
    }
    const marketEtf = ETF_CATALOG.find(e => e.id === 'market1');
    if (marketEtf) setSelectedStock(marketEtf);
    navigate('/simulator');
  };

  return (
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
      <button onClick={handleApplyTemplate} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 mt-auto active:scale-95">
        포트폴리오 설계하기 <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
