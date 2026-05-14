import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { formatAmount, getDynamicMetaphor } from '../../utils/helpers';

// /wizard/budget
// 목표 달성 기간과 목표 금액 설정
export default function Budget() {
  const navigate = useNavigate();
  const { goalAmount, setGoalAmount, goalPeriod, setGoalPeriod } = useWizard();

  return (
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
      <button onClick={() => navigate('/wizard/initial-funding')} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 mt-auto active:scale-95">
        다음 단계로 <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
