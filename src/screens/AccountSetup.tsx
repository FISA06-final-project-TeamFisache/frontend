import { Trash2, Plus, X, CheckCircle2 } from 'lucide-react';

type Account = { id: string; name: string; type: string };
type RoutingItem = { id: number | string; accountId: string; tag: string; percent: number };

type AccountSetupProps = {
  routingSetup: RoutingItem[];
  setRoutingSetup: (setup: RoutingItem[]) => void;
  availableAccounts: Account[];
  routingFlowContext: string;
  setRoutingFlowContext: (ctx: string) => void;
  showNewAccountModal: boolean;
  setShowNewAccountModal: (v: boolean) => void;
  createFxAccount: boolean;
  setCreateFxAccount: (v: boolean) => void;
  setTargetRoutingId: (id: number | string) => void;
  setNewAccountContext: (ctx: string) => void;
  onCreateNewAccount: () => void;
  setAppState: (s: string) => void;
};

export default function AccountSetup({
  routingSetup, setRoutingSetup,
  availableAccounts,
  routingFlowContext, setRoutingFlowContext,
  showNewAccountModal, setShowNewAccountModal,
  createFxAccount, setCreateFxAccount,
  setTargetRoutingId, setNewAccountContext,
  onCreateNewAccount,
  setAppState,
}: AccountSetupProps) {
  const totalPercent = routingSetup.reduce((sum, item) => sum + Number(item.percent || 0), 0);

  const handleAddAccount = () => {
    setRoutingSetup([...routingSetup, { id: Date.now(), accountId: availableAccounts[0].id, tag: '', percent: 0 }]);
  };

  const handleUpdateSetup = (id: number | string, field: string, value: string) => {
    setRoutingSetup(routingSetup.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveAccount = (id: number | string) => {
    setRoutingSetup(routingSetup.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 h-screen overflow-hidden flex flex-col font-sans border shadow-xl relative">
      {routingFlowContext === 'edit' && (
        <button onClick={() => { setRoutingFlowContext('onboarding'); setAppState('home'); }} className="absolute top-5 right-5 p-2 rounded-full bg-gray-200 text-gray-600 z-10 hover:bg-gray-300 transition">
          <X className="w-5 h-5" />
        </button>
      )}
      <div className={`px-5 pb-6 flex flex-col h-full animate-in slide-in-from-right duration-300 ${routingFlowContext === 'edit' ? 'pt-16' : 'pt-6'}`}>
        <div className="shrink-0 mb-6 mt-4">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">월급이 들어오면<br/>어떻게 나눌까요?</h2>
          <p className="text-sm text-gray-500">
            선택하신 월급 통장에서 각 목적별 계좌로<br/>입금될 비율과 귀여운 별명을 설정해주세요.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {routingSetup.map((item, index) => (
            <div key={item.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 relative group">
              {routingSetup.length > 1 && (
                <button onClick={() => handleRemoveAccount(item.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition">
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
                      setNewAccountContext('routing');
                      setShowNewAccountModal(true);
                    } else {
                      handleUpdateSetup(item.id, 'accountId', e.target.value);
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
                    onChange={(e) => handleUpdateSetup(item.id, 'tag', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24 relative shrink-0">
                  <input
                    type="number"
                    min="0" max="100"
                    value={item.percent}
                    onChange={(e) => handleUpdateSetup(item.id, 'percent', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pr-7 pl-3 text-sm text-right font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                </div>
              </div>
            </div>
          ))}

          <button onClick={handleAddAccount} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition flex items-center justify-center gap-1 active:scale-95">
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
              if (routingFlowContext === 'edit') {
                setRoutingFlowContext('onboarding');
                setAppState('home');
              } else {
                setAppState('prompt');
              }
            }}
            className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 text-white py-4 rounded-xl font-bold flex justify-center items-center transition shadow-lg active:scale-95"
          >
            {routingFlowContext === 'edit' ? '수정 완료' : '설정 완료 및 연결하기'}
          </button>
        </div>
      </div>

      {showNewAccountModal && (
        <div className="absolute inset-0 bg-black/60 z-[80] flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col shadow-2xl">
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
              <button onClick={onCreateNewAccount} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold shadow-md transition mt-4 active:scale-95">
                동의 및 1초만에 개설하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
