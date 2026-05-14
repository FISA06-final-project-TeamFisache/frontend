import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Trash2, Plus, X, CheckCircle2 } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { useAccounts } from '../../contexts/AccountsContext';
import { getGoalTitle } from '../../utils/helpers';

// /wizard/distribution
// 새 목표 + 분배 계좌별로 월급 비율 설정. 통장 개설 모달 포함.
export default function Distribution() {
  const navigate = useNavigate();
  const { availableAccounts, setAvailableAccounts } = useAccounts();
  const {
    goal, goalAmount, goalPeriod, goalRoutingPercent, setGoalRoutingPercent,
    tempRoutingSetup, setTempRoutingSetup, setMonthlyContribution,
  } = useWizard();

  // 새 통장 개설 모달 (페이지 내부 상태)
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [createFxAccount, setCreateFxAccount] = useState(false);
  const [targetRoutingId, setTargetRoutingId] = useState<number | string | null>(null);

  const handleAddRoutingItem = () => {
    setTempRoutingSetup([...tempRoutingSetup, { id: Date.now(), accountId: availableAccounts[0].id, tag: '', percent: 0 }]);
  };

  const handleUpdateRoutingItem = (id: number | string, field: 'accountId' | 'tag' | 'percent', value: string | number) => {
    setTempRoutingSetup(tempRoutingSetup.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveRoutingItem = (id: number | string) => {
    setTempRoutingSetup(tempRoutingSetup.filter(item => item.id !== id));
  };

  const handleCreateNewAccount = () => {
    const newBaseAcc = { id: `toss_divide_${Date.now()}`, name: '토스뱅크 (나눠모으기)', type: '현금' };
    const updatedAccounts = [...availableAccounts, newBaseAcc];
    if (createFxAccount) {
      updatedAccounts.push({ id: `toss_fx_${Date.now()}`, name: '토스뱅크 (외환)', type: '외환' });
    }
    setAvailableAccounts(updatedAccounts);

    if (targetRoutingId !== null) {
      setTempRoutingSetup(tempRoutingSetup.map(item => item.id === targetRoutingId ? { ...item, accountId: newBaseAcc.id } : item));
    }

    setShowNewAccountModal(false);
    setCreateFxAccount(false);
    setTargetRoutingId(null);
  };

  const totalPercent = goalRoutingPercent + tempRoutingSetup.reduce((sum, item) => sum + Number(item.percent || 0), 0);

  return (
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

        {tempRoutingSetup.map((item, index) => (
          <div key={item.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 relative">
            {tempRoutingSetup.length > 1 && (
              <button onClick={() => handleRemoveRoutingItem(item.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-3 pr-6">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                {index + 1}
              </div>
              <select
                value={item.accountId}
                onChange={(e) => {
                  if (e.target.value === 'ADD_NEW') {
                    setTargetRoutingId(item.id);
                    setShowNewAccountModal(true);
                  } else {
                    handleUpdateRoutingItem(item.id, 'accountId', e.target.value);
                  }
                }}
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
              >
                {availableAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
                <option value="ADD_NEW" className="text-blue-600 font-extrabold">+ 새 통장 개설하기</option>
              </select>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded">별명</div>
                <input
                  type="text"
                  placeholder="예: 비상금 파킹"
                  value={item.tag}
                  onChange={(e) => handleUpdateRoutingItem(item.id, 'tag', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-24 relative shrink-0">
                <input
                  type="number" min="0" max="100"
                  value={item.percent}
                  onChange={(e) => handleUpdateRoutingItem(item.id, 'percent', Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pr-7 pl-3 text-sm text-right font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                이체액: {(3000000 * Number(item.percent || 0) / 100).toLocaleString()}원
              </span>
            </div>
          </div>
        ))}

        <button onClick={handleAddRoutingItem} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition flex items-center justify-center gap-1 active:scale-95">
          <Plus className="w-4 h-4" /> 분배할 계좌 추가하기
        </button>
      </div>

      <div className="shrink-0 pt-4 border-t border-gray-100">
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
            navigate('/wizard/ai-analysis');
          }}
          className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 text-white py-4 rounded-xl font-bold flex justify-center items-center transition shadow-lg active:scale-95"
        >
          월급 분배 저장하고 다음으로 <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {showNewAccountModal && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-xl text-gray-900">새 통장 개설하기</h3>
              <button onClick={() => setShowNewAccountModal(false)}><X className="text-gray-400 w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-gray-600 leading-relaxed font-medium">목적별 자금 관리에 최적화된 통장을 1초만에 만들어보세요.</p>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded mb-1.5 inline-block">기본 개설</span>
                    <p className="font-bold text-gray-900">[토스뱅크] 나눠모으기 통장</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <button
                  onClick={() => setCreateFxAccount(!createFxAccount)}
                  className={`w-full p-4 border rounded-2xl flex items-center justify-between transition-all ${createFxAccount ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                >
                  <div className="text-left">
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded mb-1.5 inline-block">선택 추가</span>
                    <p className="font-bold text-gray-900">글로벌 투자를 위한 외환 통장</p>
                    <p className="text-xs text-gray-500 mt-1">환전 수수료 평생 무료</p>
                  </div>
                  {createFxAccount ? <CheckCircle2 className="w-6 h-6 text-purple-600" /> : <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>}
                </button>
              </div>
              <button onClick={handleCreateNewAccount} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold shadow-md transition mt-4 active:scale-95">
                동의 및 1초만에 개설하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
