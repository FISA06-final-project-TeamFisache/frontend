import { useNavigate } from 'react-router-dom';
import { Wallet, Heart, Plane, Laptop } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';

// /wizard/goal-type
// 어떤 목표를 세울지 선택. 종잣돈은 설문으로 분기, 나머지는 추후 별도 페이지 추가 예정.
export default function GoalType() {
  const navigate = useNavigate();
  const { setGoal, setGoalAmount, setGoalPeriod } = useWizard();

  const goals = [
    { id: 'savings', icon: <Wallet />, title: '종잣돈 모으기', desc: '투자 성향 진단부터 시작', defaultAmt: 10000, defaultPeriod: 4, route: '/seed-money-survey' },
    { id: 'wedding', icon: <Heart />, title: '결혼 준비', desc: '준비 중 (곧 추가 예정)', defaultAmt: 10000, defaultPeriod: 4, route: null },
    { id: 'travel', icon: <Plane />, title: '해외 여행', desc: '준비 중 (곧 추가 예정)', defaultAmt: 500, defaultPeriod: 1, route: null },
    { id: 'ipad', icon: <Laptop />, title: '기타 (사고 싶은 물건)', desc: '준비 중 (곧 추가 예정)', defaultAmt: 150, defaultPeriod: 1, route: null },
  ];

  return (
    <div className="space-y-6 flex-1 animate-in slide-in-from-right">
      <h2 className="text-2xl font-bold text-gray-900 mt-4">어떤 목표를 세워볼까요?</h2>
      <div className="space-y-3">
        {goals.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setGoal(item.id);
              setGoalAmount(item.defaultAmt);
              setGoalPeriod(item.defaultPeriod);
              if (item.route) navigate(item.route);
            }}
            disabled={!item.route}
            className="w-full text-left border border-gray-100 hover:border-blue-500 hover:bg-blue-50 bg-white p-4 rounded-xl flex items-center gap-4 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-100 disabled:hover:bg-white"
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
  );
}
