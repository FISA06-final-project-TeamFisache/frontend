import { Activity, User, Wallet, RefreshCw, CheckCircle2, Edit2, Trash2, MoreHorizontal, Building, CreditCard } from 'lucide-react';
import { formatAmount, getGoalTitle } from '../utils/helpers';

type Account = { id: string; name: string; type: string };
type ETF = { id: string; [key: string]: unknown };
type Loan = { id: string; [key: string]: unknown };

type Goal = {
  id: number;
  goalType: string;
  goalAmount: number;
  goalPeriod: number;
  initialInvestment: number;
  initialFundingAccount?: Account;
  monthlyContribution: number;
  goalRoutingPercent: number;
  stock: number; bond: number; cash: number; loan: number;
  selectedStock: ETF; selectedLoan: Loan; selectedBank: Account;
  priority: number;
};

type HomeProps = {
  goals: Goal[];
  availableAccounts: Account[];
  revealedGoalId: number | null;
  setRevealedGoalId: (id: number | null) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent, id: number) => void;
  handleFullEditGoal: (g: Goal) => void;
  handleDeleteGoal: (id: number) => void;
  handleCompleteGoal: (id: number) => void;
  startWizard: () => void;
};

export default function Home({
  goals, availableAccounts,
  revealedGoalId, setRevealedGoalId,
  handleTouchStart, handleTouchMove, handleTouchEnd,
  handleFullEditGoal, handleDeleteGoal, handleCompleteGoal,
  startWizard,
}: HomeProps) {
  const displayGoals = [...goals].sort((a, b) => a.priority - b.priority);

  return (
    <div className="p-5 space-y-6">

      <div className="bg-gray-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-1">
            <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
              👤 1인 개인 총 자산
            </p>
            <div className="bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
              <Activity className="text-green-400 w-3 h-3" />
              <span className="text-xs text-green-400 font-bold">+1.2%</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">
            124,500,000<span className="text-xl font-medium ml-1">원</span>
          </h2>

          <div className="relative h-44 w-full mt-6 -ml-2">
            <svg viewBox="0 0 340 140" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="solidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={displayGoals.length > 1 ? "M 100,90 Q 150,70 200,50 T 310,20" : "M 100,90 Q 190,65 280,40"}
                fill="none" stroke="#6b7280" strokeWidth="2" strokeDasharray="4 4"
              />
              <path d="M 0,140 Q 50,115 100,90" fill="none" stroke="#3b82f6" strokeWidth="3" />
              <path d="M 0,140 Q 50,115 100,90 L 100,140 Z" fill="url(#solidGrad)" />
              <circle cx="100" cy="90" r="5" fill="#3b82f6" className="animate-pulse" />
              <circle cx="100" cy="90" r="2.5" fill="#ffffff" />
              <text x="100" y="112" fill="#9ca3af" fontSize="11" textAnchor="middle" fontWeight="bold">현재</text>
              {displayGoals[0] && (
                <>
                  <circle cx={displayGoals.length > 1 ? "200" : "280"} cy={displayGoals.length > 1 ? "50" : "40"} r="4" fill="#a855f7" />
                  <text x={displayGoals.length > 1 ? "200" : "280"} y={displayGoals.length > 1 ? "35" : "25"} fill="#d8b4fe" fontSize="11" textAnchor="middle" fontWeight="bold">
                    1순위 ({displayGoals[0].goalPeriod}년)
                  </text>
                </>
              )}
              {displayGoals.length > 1 && displayGoals[1] && (
                <>
                  <circle cx="310" cy="20" r="4" fill="#f59e0b" />
                  <text x="310" y="5" fill="#fcd34d" fontSize="11" textAnchor="middle" fontWeight="bold">
                    2순위 ({displayGoals[1].goalPeriod}년)
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>
      </div>

      {displayGoals.length > 0 ? (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="text-sm font-bold text-gray-800">진행 중인 포트폴리오</h3>
            </div>
            {displayGoals.map((g, idx) => {
              const currentMockAsset = 12450;
              const completionRate = Math.min(100, (currentMockAsset / g.goalAmount) * 100);
              return (
                <div key={g.id} className="relative rounded-3xl bg-gray-100 border border-gray-100 overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 h-full w-[140px] flex">
                    <button
                      onClick={() => handleFullEditGoal(g)}
                      className="flex-1 bg-gray-700 text-white flex flex-col items-center justify-center hover:bg-gray-800 transition"
                    >
                      <Edit2 className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold">수정</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="flex-1 bg-red-500 text-white flex flex-col items-center justify-center hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold">삭제</span>
                    </button>
                  </div>

                  <div
                    className={`relative z-10 bg-white p-5 h-full transition-transform duration-300 flex flex-col ${revealedGoalId === g.id ? '-translate-x-[140px]' : 'translate-x-0'}`}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={(e) => handleTouchEnd(e, g.id)}
                  >
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${idx === 0 ? 'bg-purple-500' : 'bg-orange-400'}`}></div>

                    <button
                      onClick={(e) => { e.stopPropagation(); setRevealedGoalId(revealedGoalId === g.id ? null : g.id); }}
                      className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition z-20"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    <div className="flex justify-between items-start mb-4 pl-2 pr-6">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${idx === 0 ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'} mb-1.5 inline-block`}>
                          {idx + 1}순위 목표
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-[15px]">{getGoalTitle(g.goalType)}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 font-bold block mb-0.5">{g.goalPeriod}년 뒤 목표</span>
                        <span className="font-extrabold text-gray-900 text-lg">{formatAmount(g.goalAmount)}</span>
                      </div>
                    </div>

                    <div className="pl-2">
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-gray-500">달성률</span>
                        <span className={idx === 0 ? 'text-purple-600' : 'text-orange-500'}>
                          {completionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden w-full">
                        <div
                          style={{ width: `${completionRate}%` }}
                          className={`h-full rounded-full transition-all duration-700 ${idx === 0 ? 'bg-purple-500' : 'bg-orange-400'}`}
                        ></div>
                      </div>

                      <div className="flex flex-col text-xs mt-4 pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500 flex items-center gap-1 font-bold"><Wallet className="w-3 h-3" /> 초기 자본금</span>
                          <span className="text-gray-900 font-bold">
                            {g.initialFundingAccount?.name ? `${g.initialFundingAccount.name}에서 ` : '미지정, '}
                            <span className="text-blue-600">{g.initialInvestment}만원</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 flex items-center gap-1 font-bold"><RefreshCw className="w-3 h-3" /> 매월 월급 투입</span>
                          <span className="text-gray-900 font-bold">
                            월급의 <span className="text-blue-600">{g.goalRoutingPercent}%</span> ({g.monthlyContribution}만원)
                          </span>
                        </div>
                      </div>

                      {completionRate === 100 && (
                        <button
                          onClick={() => handleCompleteGoal(g.id)}
                          className="mt-4 w-full bg-green-50 hover:bg-green-100 text-green-700 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-1.5 transition border border-green-200 active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" /> 목표 달성 완료! (목록에서 지우기)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800">연동된 금융 자산</h3>
              <span className="text-xs text-gray-400 font-medium">총 {availableAccounts.length}개 계좌</span>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE812] flex items-center justify-center border border-[#E5D010]">
                  <span className="font-extrabold text-[#371D1E] text-xs">TALK</span>
                </div>
                <span className="text-[10px] text-gray-500 font-bold">카카오페이</span>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center border border-blue-200">
                  <span className="font-extrabold text-blue-700 text-xs">toss</span>
                </div>
                <span className="text-[10px] text-gray-500 font-bold">토스뱅크</span>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
                  <Building className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-[10px] text-gray-500 font-bold">한투증권</span>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center border border-gray-800">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-gray-500 font-bold">현대카드</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm mt-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">목표가 없네요!</h3>
            <p className="text-sm text-gray-500">AI 네비게이터가 최적의 포트폴리오를<br/>역산하여 설계해 드립니다.</p>
          </div>
          <button onClick={() => startWizard()} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold mt-4 transition shadow-md active:scale-95">
            자산 설계 시작하기
          </button>
        </div>
      )}
    </div>
  );
}
