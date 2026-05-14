import {
  Home as HomeIcon, PieChart, Bell, AlertCircle, Fingerprint, TrendingUp, TrendingDown,
  ArrowRight, Wallet, CheckCircle2, X, Users, User, Building, Plane,
  Heart, Landmark, Laptop, ShieldAlert, Sparkles, ShieldCheck, Smartphone, Link2, Loader2, ChevronRight, BarChart3, RefreshCw, Search, Info,
  Activity, CreditCard, Target, ChevronLeft, Menu, FileText, Calendar, ArrowUpRight,
  UserPlus, Copy, MessageCircle, Globe, Lightbulb, Plus, Trash2, Brain, History,
  MoreHorizontal, Edit2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';
import Wizard from './Wizard';
import Simulator from './Simulator';
import { ETF_CATALOG, LOAN_CATALOG, MOCK_DISCOVERED_ACCOUNTS, TRANSFER_HISTORY } from '../data/mockData';
import { getGoalTitle, formatAmount } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';

type Account = { id: string; name: string; type: string };
type ETF = { id: string; category: string; name: string; type: string; tag: string; color: string; bg: string; returnRate: number; mddRisk: number; rank: number };
type Loan = { id: string; category: string; name: string; type: string; tag: string; color: string; bg: string; interestRate: number; rank: number };
type RoutingItem = { id: number | string; accountId: string; tag: string; percent: number };
type Goal = { id: number; goalType: string; goalAmount: number; goalPeriod: number; initialInvestment: number; initialFundingAccount?: Account; monthlyContribution: number; goalRoutingPercent: number; stock: number; bond: number; cash: number; loan: number; selectedStock: ETF; selectedLoan: Loan; selectedBank: Account; priority: number };
type Notification = { id: number; type: string; title: string; desc: string; date: string; isRead: boolean };

type MainProps = {
  signupData: { name: string; id: string; password: string };
  goals: Goal[];
  activeGoalId: number | null;
  setActiveGoalId: (id: number | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (v: boolean) => void;
  notifications: Notification[];
  setNotifications: (n: Notification[]) => void;
  showNotificationsModal: boolean;
  setShowNotificationsModal: (v: boolean) => void;
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
  tempRoutingSetup: RoutingItem[];
  setTempRoutingSetup: (s: RoutingItem[]) => void;
  monthlyContribution: number;
  setMonthlyContribution: (v: number) => void;
  stock: number;
  bond: number;
  cash: number;
  loan: number;
  selectedStock: ETF;
  setSelectedStock: (e: ETF) => void;
  selectedLoan: Loan;
  setSelectedLoan: (l: Loan) => void;
  selectedBank: Account;
  setSelectedBank: (acc: Account) => void;
  editingGoalId: number | null;
  availableAccounts: Account[];
  setAvailableAccounts: (accs: Account[]) => void;
  routingSetup: RoutingItem[];
  setRoutingSetup: (s: RoutingItem[]) => void;
  revealedGoalId: number | null;
  setRevealedGoalId: (id: number | null) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent, id: number) => void;
  showKafkaModal: boolean;
  setShowKafkaModal: (v: boolean) => void;
  showPaydayModal: boolean;
  setShowPaydayModal: (v: boolean) => void;
  isPaid: boolean;
  setIsPaid: (v: boolean) => void;
  paydayType: string;
  showFinalConfirmModal: boolean;
  setShowFinalConfirmModal: (v: boolean) => void;
  showCatalogModal: boolean;
  setShowCatalogModal: (v: boolean) => void;
  showLoanCatalogModal: boolean;
  setShowLoanCatalogModal: (v: boolean) => void;
  showBankModal: boolean;
  setShowBankModal: (v: boolean) => void;
  catalogFilter: string;
  setCatalogFilter: (f: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showAiReportModal: boolean;
  setShowAiReportModal: (v: boolean) => void;
  aiReport: string;
  isGenerating: boolean;
  showLimitModal: boolean;
  setShowLimitModal: (v: boolean) => void;
  limitMessage: string;
  showDeleteAccountModal: boolean;
  setShowDeleteAccountModal: (v: boolean) => void;
  showTransferHistoryModal: boolean;
  setShowTransferHistoryModal: (v: boolean) => void;
  expandedMonth: string | null;
  setExpandedMonth: (m: string | null) => void;
  showLinkNewAccountModal: boolean;
  setShowLinkNewAccountModal: (v: boolean) => void;
  linkModalStep: string;
  setLinkModalStep: (s: string) => void;
  showRoutingChoiceModal: boolean;
  setShowRoutingChoiceModal: (v: boolean) => void;
  showNewAccountModal: boolean;
  setShowNewAccountModal: (v: boolean) => void;
  createFxAccount: boolean;
  setCreateFxAccount: (v: boolean) => void;
  newAccountContext: string | null;
  setNewAccountContext: (ctx: string | null) => void;
  targetRoutingId: number | string | null;
  setTargetRoutingId: (id: number | string | null) => void;
  selectedReport: string | null;
  setSelectedReport: (r: string | null) => void;
  startWizard: () => void;
  handleGoBack: () => void;
  handleFinalConfirm: () => void;
  handleEditPortfolio: (g: Goal, applyAi: boolean) => void;
  handleFullEditGoal: (g: Goal) => void;
  handleDeleteGoal: (id: number) => void;
  handleCompleteGoal: (id: number) => void;
  handleDeleteAccount: () => void;
  onSliderChange: (type: string, value: number) => void;
  generateAiReport: () => void;
  handleNotificationClick: (notif: Notification) => void;
  handleFindAccounts: () => void;
  handleSelectDiscoveredAccount: (acc: { id: string; name: string; type: string; balance: number; bank: string; color: string; bg: string }) => void;
  handleCreateNewAccount: () => void;
  canCreateMore: () => boolean;
  getPaydayAccounts: () => { name: string; percent: number; type: string; amount: number }[];
};

export default function Main({
  signupData, goals, activeGoalId, setActiveGoalId,
  activeTab, setActiveTab,
  isDrawerOpen, setIsDrawerOpen,
  notifications, setNotifications, showNotificationsModal, setShowNotificationsModal,
  goal, setGoal, goalAmount, setGoalAmount, goalPeriod, setGoalPeriod,
  initialInvestment, setInitialInvestment, initialFundingAccount, setInitialFundingAccount,
  goalRoutingPercent, setGoalRoutingPercent,
  tempRoutingSetup, setTempRoutingSetup,
  monthlyContribution, setMonthlyContribution,
  stock, bond, cash, loan,
  selectedStock, setSelectedStock, selectedLoan, setSelectedLoan, selectedBank, setSelectedBank,
  editingGoalId,
  availableAccounts, setAvailableAccounts,
  routingSetup, setRoutingSetup,
  revealedGoalId, setRevealedGoalId, handleTouchStart, handleTouchMove, handleTouchEnd,
  showKafkaModal, setShowKafkaModal,
  showPaydayModal, setShowPaydayModal, isPaid, setIsPaid, paydayType,
  showFinalConfirmModal, setShowFinalConfirmModal,
  showCatalogModal, setShowCatalogModal,
  showLoanCatalogModal, setShowLoanCatalogModal,
  showBankModal, setShowBankModal,
  catalogFilter, setCatalogFilter, searchQuery, setSearchQuery,
  showAiReportModal, setShowAiReportModal, aiReport, isGenerating,
  showLimitModal, setShowLimitModal, limitMessage,
  showDeleteAccountModal, setShowDeleteAccountModal,
  showTransferHistoryModal, setShowTransferHistoryModal, expandedMonth, setExpandedMonth,
  showLinkNewAccountModal, setShowLinkNewAccountModal, linkModalStep, setLinkModalStep,
  showRoutingChoiceModal, setShowRoutingChoiceModal,
  showNewAccountModal, setShowNewAccountModal, createFxAccount, setCreateFxAccount,
  newAccountContext, setNewAccountContext, targetRoutingId, setTargetRoutingId,
  selectedReport, setSelectedReport,
  startWizard, handleGoBack, handleFinalConfirm, handleEditPortfolio,
  handleFullEditGoal, handleDeleteGoal, handleCompleteGoal, handleDeleteAccount,
  onSliderChange, generateAiReport, handleNotificationClick,
  handleFindAccounts, handleSelectDiscoveredAccount, handleCreateNewAccount,
  canCreateMore, getPaydayAccounts,
}: MainProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const displayGoals = [...goals].sort((a, b) => a.priority - b.priority);

  const filteredCatalog = ETF_CATALOG.filter(etf => {
    if (searchQuery) return etf.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (catalogFilter === 'popular') return true;
    return etf.category === catalogFilter;
  }).sort((a, b) => {
    if (catalogFilter === 'popular' && !searchQuery) return a.rank - b.rank;
    return 0;
  });

  const filteredLoanCatalog = LOAN_CATALOG.filter(loanItem => {
    if (searchQuery) return loanItem.name.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

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

  return (
    <div className="max-w-md mx-auto bg-gray-50 h-screen overflow-hidden flex flex-col font-sans border shadow-xl relative">
      <header className="bg-white px-5 py-4 shadow-sm flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          {activeTab === 'home' ? (
            <button onClick={() => setIsDrawerOpen(true)} className="hover:bg-gray-100 p-1 rounded-md transition active:scale-95">
              <Menu className="text-gray-800 w-6 h-6" />
            </button>
          ) : (
            <button onClick={handleGoBack} className="hover:bg-gray-100 p-1 rounded-md transition active:scale-95">
              <ChevronLeft className="text-gray-800 w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900">WooriPort</h1>
        </div>
        <div className="relative cursor-pointer" onClick={() => setShowNotificationsModal(true)}>
          <Bell className="text-gray-500 w-6 h-6" />
          {notifications.some(n => !n.isRead) && <span className="absolute top-0 right-0 w-2.5 h-2.5 border-2 border-white bg-red-500 rounded-full"></span>}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 relative">
        {activeTab === 'home' && (
          <Home
            goals={goals}
            availableAccounts={availableAccounts}
            revealedGoalId={revealedGoalId}
            setRevealedGoalId={setRevealedGoalId}
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            handleFullEditGoal={handleFullEditGoal}
            handleDeleteGoal={handleDeleteGoal}
            handleCompleteGoal={handleCompleteGoal}
            startWizard={startWizard}
          />
        )}
        {activeTab === 'wizard' && <Wizard />}
        {activeTab === 'simulator' && (
          <Simulator
            stock={stock}
            bond={bond}
            cash={cash}
            loan={loan}
            goal={goal}
            goalPeriod={goalPeriod}
            editingGoalId={editingGoalId}
            selectedStock={selectedStock}
            selectedLoan={selectedLoan}
            selectedBank={selectedBank}
            onSliderChange={onSliderChange}
            setCatalogFilter={setCatalogFilter}
            setSearchQuery={setSearchQuery}
            setShowCatalogModal={setShowCatalogModal}
            setShowLoanCatalogModal={setShowLoanCatalogModal}
            setShowBankModal={setShowBankModal}
            setShowFinalConfirmModal={setShowFinalConfirmModal}
            onGenerateAiReport={generateAiReport}
          />
        )}
      </main>

      <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex justify-around p-3 pb-safe z-10">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 transition ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <HomeIcon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">홈 (대시보드)</span>
        </button>
        <button
          onClick={() => {
            if (!canCreateMore()) {
              setShowLimitModal(true);
              return;
            }
            if (activeTab !== 'simulator') startWizard();
          }}
          className={`flex flex-col items-center p-2 transition ${activeTab !== 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'} ${!canCreateMore() ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
          <PieChart className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">자산 설계</span>
        </button>
      </nav>

      {isDrawerOpen && (
        <div className="absolute inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-4/5 max-w-[300px] bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="p-6 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {signupData.name ? signupData.name[0] : '고'}
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{signupData.name || '고객'} 님</h2>
              <p className="text-sm text-gray-500">{signupData.id || 'woori_user'}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-8">
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">나의 목표 내역</h3>
                {goals.length > 0 ? (
                  <div className="space-y-3">
                    {goals.map((g) => {
                      const mockAsset = 12450;
                      const completionRate = Math.min(100, (mockAsset / g.goalAmount) * 100);
                      return (
                        <div
                          key={g.id}
                          onClick={() => { setActiveGoalId(g.id); setIsDrawerOpen(false); setActiveTab('home'); }}
                          className={`cursor-pointer border rounded-2xl p-4 shadow-sm transition ${activeGoalId === g.id ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2 text-blue-700">
                              <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600">{g.priority}순위</span>
                              <Target className="w-4 h-4" />
                              <span className="text-sm font-bold truncate pr-2">{getGoalTitle(g.goalType)}</span>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-gray-700 mb-2">{g.goalPeriod}년 뒤 {formatAmount(g.goalAmount)}</p>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                            <div style={{ width: `${completionRate}%` }} className="h-full bg-blue-500 rounded-full"></div>
                          </div>
                          <p className="text-[10px] text-gray-500 text-right font-medium">
                            {completionRate === 100 ? '✅ 달성 완료' : `${completionRate.toFixed(1)}% 달성 중`}
                          </p>
                        </div>
                      );
                    })}
                    {canCreateMore() && (
                      <button onClick={() => { setIsDrawerOpen(false); startWizard(); }} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:text-blue-600 hover:border-blue-300 transition flex items-center justify-center gap-1 bg-gray-50 hover:bg-blue-50 active:scale-95">
                        + 자산 설계 시작하기
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-200 border-dashed">
                    <p className="text-sm text-gray-500 mb-2">진행 중인 목표가 없습니다.</p>
                    <button onClick={() => { setIsDrawerOpen(false); startWizard(); }} className="text-xs font-bold text-blue-600 underline underline-offset-2">자산 설계 시작하기</button>
                  </div>
                )}
              </section>
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">계좌 및 이체 관리</h3>
                <div className="space-y-2">
                  <button onClick={() => { setIsDrawerOpen(false); setShowRoutingChoiceModal(true); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition group active:scale-95">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600"><RefreshCw className="w-4 h-4" /></div>
                      <span className="text-sm font-bold text-gray-900">월급 리밸런싱 설정</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                  </button>
                  <button onClick={() => { setIsDrawerOpen(false); setShowTransferHistoryModal(true); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition group active:scale-95">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><History className="w-4 h-4" /></div>
                      <span className="text-sm font-bold text-gray-900">월별 자동 송금 내역</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                  </button>
                </div>
              </section>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-between items-center">
              <button onClick={() => { setIsDrawerOpen(false); logout(); }} className="text-sm font-bold text-gray-400 hover:text-gray-600">로그아웃</button>
              <button onClick={() => setShowDeleteAccountModal(true)} className="text-xs font-medium text-red-400 hover:text-red-500 transition underline underline-offset-2">회원탈퇴</button>
            </div>
          </div>
        </div>
      )}

      {showNotificationsModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 h-[80vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2"><Bell className="w-5 h-5" /> 알림</h3>
              <button onClick={() => setShowNotificationsModal(false)}><X className="text-gray-400 w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50">
              {notifications.map(notif => (
                <button key={notif.id} onClick={() => handleNotificationClick(notif)} className={`w-full text-left p-4 rounded-2xl border transition shadow-sm flex items-start gap-4 active:scale-95 ${notif.isRead ? 'bg-gray-100 border-gray-200 opacity-70' : 'bg-white border-blue-100'}`}>
                  <div className={`p-2 rounded-full mt-1 shrink-0 ${notif.type === 'report' ? 'bg-indigo-100 text-indigo-600' : notif.type === 'kafka' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {notif.type === 'report' && <FileText className="w-5 h-5" />}
                    {notif.type === 'kafka' && <TrendingDown className="w-5 h-5" />}
                    {notif.type.includes('payday') && <Wallet className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 pr-2">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${notif.isRead ? 'font-medium text-gray-600' : 'font-bold text-gray-900'}`}>{notif.title}</h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{notif.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{notif.desc}</p>
                  </div>
                  {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLinkNewAccountModal && (
        <div className="absolute inset-0 bg-black/60 z-[80] flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col shadow-2xl max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-xl text-gray-900">새로운 통장 연결</h3>
              <button onClick={() => setShowLinkNewAccountModal(false)}><X className="text-gray-400 w-6 h-6" /></button>
            </div>
            {linkModalStep === 'intro' && (
              <div className="p-6 space-y-5 text-center flex-1 overflow-y-auto">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto"><Link2 className="w-8 h-8 text-blue-600" /></div>
                <h4 className="text-lg font-bold text-gray-900">아직 연결되지 않은<br/>계좌를 찾아올까요?</h4>
                <p className="text-sm text-gray-500 leading-relaxed">마이데이터를 통해 다른 금융기관에 흩어져 있는<br/>예적금 계좌를 한 번에 불러올 수 있습니다.</p>
                <button onClick={handleFindAccounts} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-md transition mt-4 active:scale-95 flex items-center justify-center gap-2">내 숨은 계좌 찾아보기</button>
              </div>
            )}
            {linkModalStep === 'loading' && (
              <div className="p-10 space-y-5 text-center flex-1 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                <h4 className="text-lg font-bold text-gray-900">숨은 계좌를 찾는 중...</h4>
                <p className="text-sm text-gray-500">마이데이터 망을 통해 안전하게 조회하고 있습니다.</p>
              </div>
            )}
            {linkModalStep === 'list' && (
              <div className="p-6 space-y-4 flex-1 overflow-y-auto bg-gray-50">
                <p className="text-sm font-bold text-gray-700 mb-2">총 {MOCK_DISCOVERED_ACCOUNTS.length}개의 계좌를 찾았습니다.</p>
                <div className="space-y-3">
                  {MOCK_DISCOVERED_ACCOUNTS.map(acc => (
                    <button key={acc.id} onClick={() => handleSelectDiscoveredAccount(acc)} className="w-full text-left p-4 bg-white rounded-2xl border border-gray-200 hover:border-blue-500 shadow-sm transition group active:scale-95">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${acc.bg} ${acc.color}`}>{acc.bank}</span>
                        </div>
                        <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition">선택 연결</span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{acc.name}</p>
                      <p className="text-xs text-gray-500 mt-1">잔액: {acc.balance.toLocaleString()}원</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showBankModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 h-[70vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 shrink-0 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl">현금성 자산 보관 계좌</h3>
                <button onClick={() => setShowBankModal(false)}><X className="text-gray-400 w-6 h-6" /></button>
              </div>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-gray-50">
              {availableAccounts.map((acc) => (
                <button key={acc.id} onClick={() => { setSelectedBank(acc); setShowBankModal(false); }} className={`w-full text-left bg-white border ${selectedBank?.id === acc.id ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'} p-5 rounded-2xl shadow-sm transition relative flex items-center justify-between active:scale-95`}>
                  <div className="flex-1 pr-4">
                    <div className="font-bold text-gray-900 text-sm mb-0.5">{acc.name}</div>
                    <div className="text-xs text-gray-500">{acc.type} 계좌</div>
                  </div>
                  {selectedBank?.id === acc.id ? <CheckCircle2 className="text-green-500 w-6 h-6 shrink-0" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-200 shrink-0"></div>}
                </button>
              ))}
              <button onClick={() => { setNewAccountContext('simulator'); setShowNewAccountModal(true); }} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:text-blue-600 hover:border-blue-300 transition flex items-center justify-center gap-1 bg-gray-50 hover:bg-blue-50 mt-4 active:scale-95">
                <Plus className="w-4 h-4" /> 새 통장 개설하기
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedReport && (
        <div className="absolute inset-0 bg-black/70 z-[60] flex items-end justify-center">
          <div className="bg-gray-50 w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 h-[90vh] flex flex-col shadow-2xl">
            <div className="bg-white p-5 border-b border-gray-200 flex justify-between items-center shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <FileText className="text-indigo-600 w-6 h-6" />
                <h3 className="font-bold text-lg text-gray-900">{selectedReport} 결산 리포트</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"><X className="text-gray-500 w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="text-center space-y-2 mt-4">
                <p className="text-sm font-medium text-gray-500">이번 달 총 자산 변동</p>
                <h2 className="text-3xl font-extrabold text-gray-900">124,500,000 원</h2>
                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  <TrendingUp className="w-4 h-4" /> 전월 대비 +150만 원
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5"><Globe className="w-4 h-4" /> 전체 시장 상황 요약</h4>
                <p className="text-sm text-gray-700 leading-relaxed">글로벌 증시는 AI 반도체 실적 호조로 주요 지수가 견고한 상승세를 보였습니다. 반면 국내 시장은 박스권 장세를 유지 중이며, 채권 시장은 향후 금리 인하 기대감이 선반영되어 금리가 점진적으로 하향 안정화되는 추세입니다.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><PieChart className="w-4 h-4" /> 내 포트폴리오 자산 현황</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-500">위험 자산 (주식/ETF)</p>
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{displayGoals[0]?.selectedStock.name || ETF_CATALOG[4].name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-red-500">+3.2%</p>
                      <p className="text-[10px] text-gray-400">시장 평균 상회</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-500">안전 자산 (채권)</p>
                        <p className="text-sm font-bold text-gray-900">국내 우량 채권형</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-blue-500">+0.4%</p>
                      <p className="text-[10px] text-gray-400">안정적 방어</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Lightbulb className="w-4 h-4" /> AI 다음 달 가이드라인</h4>
                <p className="text-sm text-indigo-900 leading-relaxed font-medium mb-4">
                  현재 포트폴리오의 위험 대비 수익률이 이상적인 궤도에 올랐습니다. 다음 달 투입 시, 최근 단기 상승폭이 컸던 주식 비중을 <strong className="text-red-500">-10%</strong> 줄이고 <strong className="text-blue-600 bg-blue-100 px-1 rounded">안전 자산(채권)</strong> 비중을 <strong className="text-blue-600">+10%</strong> 늘려 포트폴리오를 리밸런싱할 것을 추천합니다.
                </p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { if (displayGoals.length > 0) handleEditPortfolio(displayGoals[0], true); else setShowAiReportModal(true); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition flex justify-center items-center gap-2 active:scale-95">✨ AI 추천 비율로 리밸런싱 적용</button>
                  <button onClick={() => { if (displayGoals.length > 0) { handleEditPortfolio(displayGoals[0], false); } else { setSelectedReport(null); navigate('/wizard'); } }} className="w-full bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 py-3 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2 active:scale-95">⚖️ 내가 직접 비율/상품 수정하기</button>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">이번 달 주요 액션 내역</h4>
                <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <div className="bg-blue-100 p-1.5 rounded-md mt-0.5"><Wallet className="w-4 h-4 text-blue-600" /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">가용 자산 분산 이체 (25일)</p>
                      <p className="text-xs text-gray-500 mt-1">급여 수령 후 포트폴리오 비율에 맞춰 총 135만 원 자동 이체 완료</p>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="bg-red-100 p-1.5 rounded-md mt-0.5"><AlertCircle className="w-4 h-4 text-red-600" /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">소비 경고 방어 성공 (12일)</p>
                      <p className="text-xs text-gray-500 mt-1">고액 결제 감지 시 제안된 타협안을 수락하여 예산 방어</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-200 shrink-0">
              <button onClick={() => setSelectedReport(null)} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-md hover:bg-black transition active:scale-95">확인 완료</button>
            </div>
          </div>
        </div>
      )}

      {showTransferHistoryModal && (
        <div className="absolute inset-0 bg-black/70 z-[60] flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 h-[85vh] flex flex-col shadow-2xl">
            <div className="bg-white p-5 border-b border-gray-200 flex justify-between items-center shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <History className="text-blue-600 w-6 h-6" />
                <h3 className="font-bold text-lg text-gray-900">자동 송금 내역</h3>
              </div>
              <button onClick={() => setShowTransferHistoryModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"><X className="text-gray-500 w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {TRANSFER_HISTORY.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button onClick={() => setExpandedMonth(expandedMonth === item.month ? null : item.month)} className="w-full p-5 flex items-center justify-between bg-white hover:bg-gray-50 transition">
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-gray-400 mb-1 block">{item.date} 이체 완료</span>
                      <span className="text-base font-bold text-gray-900">{item.month} 분배액</span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="text-lg font-extrabold text-blue-600">{item.totalAmt.toLocaleString()}원</span>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedMonth === item.month ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  {expandedMonth === item.month && (
                    <div className="px-5 pb-5 pt-2 border-t border-gray-50 bg-gray-50/50">
                      <p className="text-xs font-bold text-gray-500 mb-3">상세 이체 내역</p>
                      <div className="space-y-3">
                        {item.details.map((detail, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-gray-400">{detail.type} 계좌</span>
                              <span className="text-sm font-medium text-gray-800">{detail.name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{detail.amount.toLocaleString()}원</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLoanCatalogModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 h-[80vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 shrink-0 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl">대출 상품 탐색기</h3>
                <button onClick={() => setShowLoanCatalogModal(false)}><X className="text-gray-400 w-6 h-6" /></button>
              </div>
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="대출 상품명을 검색해보세요" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-yellow-500" />
              </div>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-gray-50">
              <p className="text-xs text-gray-500 font-bold mb-2 px-1">부동산 자금 마련에 적합한 추천 상품</p>
              {filteredLoanCatalog.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">검색 결과가 없습니다.</div>
              ) : (
                filteredLoanCatalog.map((loanItem) => (
                  <button key={loanItem.id} onClick={() => { setSelectedLoan(loanItem); setShowLoanCatalogModal(false); }} className={`w-full text-left bg-white border ${selectedLoan.id === loanItem.id ? 'border-yellow-500 ring-2 ring-yellow-100' : 'border-gray-200 hover:border-gray-300'} p-5 rounded-2xl shadow-sm transition relative flex items-center justify-between active:scale-95`}>
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${loanItem.bg} ${loanItem.color}`}>{loanItem.tag}</span>
                      </div>
                      <div className="font-bold text-gray-900 text-sm mb-0.5">{loanItem.name}</div>
                      <div className="text-xs text-gray-500">{loanItem.type}</div>
                    </div>
                    {selectedLoan.id === loanItem.id ? <CheckCircle2 className="text-yellow-500 w-6 h-6 shrink-0" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-200 shrink-0"></div>}
                  </button>
                ))
              )}
            </div>
            <div className="p-4 bg-white border-t border-gray-200 shrink-0 flex items-start gap-2 text-gray-500">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">본 정보는 시뮬레이션 목적의 참고용 금리이며, 실제 개인의 신용도 및 소득에 따라 한도와 금리가 달라질 수 있습니다.</p>
            </div>
          </div>
        </div>
      )}

      {showCatalogModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 h-[85vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 shrink-0 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl">ETF 탐색기</h3>
                <button onClick={() => setShowCatalogModal(false)}><X className="text-gray-400 w-6 h-6" /></button>
              </div>
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="ETF 이름이나 티커를 검색해보세요" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div className="flex gap-2 px-5 py-3 overflow-x-auto shrink-0 bg-white hide-scrollbar">
              <button onClick={() => setCatalogFilter('popular')} className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition ${catalogFilter === 'popular' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>🔥 30대 인기순</button>
              <button onClick={() => setCatalogFilter('dividend')} className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition ${catalogFilter === 'dividend' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>💰 배당수익률순</button>
              <button onClick={() => setCatalogFilter('growth')} className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition ${catalogFilter === 'growth' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>📈 거래대금순</button>
              <button onClick={() => setCatalogFilter('market')} className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition ${catalogFilter === 'market' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>🌐 시장 지수</button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-gray-50">
              {filteredCatalog.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">검색 결과가 없습니다.</div>
              ) : (
                filteredCatalog.map((etf, idx) => (
                  <button key={etf.id} onClick={() => { setSelectedStock(etf); setShowCatalogModal(false); }} className={`w-full text-left bg-white border ${selectedStock.id === etf.id ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-200 hover:border-gray-300'} p-5 rounded-2xl shadow-sm transition relative flex items-center justify-between active:scale-95`}>
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        {catalogFilter === 'popular' && !searchQuery && <span className="font-bold text-gray-400 w-4">{idx + 1}</span>}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${etf.bg} ${etf.color}`}>{etf.tag}</span>
                      </div>
                      <div className="font-bold text-gray-900 text-sm mb-0.5">{etf.name}</div>
                      <div className="text-xs text-gray-500">{etf.type}</div>
                    </div>
                    {selectedStock.id === etf.id ? <CheckCircle2 className="text-purple-600 w-6 h-6 shrink-0" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-200 shrink-0"></div>}
                  </button>
                ))
              )}
            </div>
            <div className="p-4 bg-white border-t border-gray-200 shrink-0 flex items-start gap-2 text-gray-500">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">본 목록은 고객의 투자 성향, 연령대 등의 통계적 알고리즘에 기반한 정보 제공 목적이며, 투자 권유나 자문을 의미하지 않습니다.</p>
            </div>
          </div>
        </div>
      )}

      {showFinalConfirmModal && (
        <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-purple-600 p-6 text-white text-center relative">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <h3 className="font-bold text-xl">에이전트의 최종 브리핑</h3>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-gray-700 leading-relaxed">
                "고객님이 구성하신 포트폴리오는 제가 처음에 제안한 표준 모델보다 <strong className="text-green-600">수익률은 향상</strong>되었지만, 하락장에서 견뎌야 하는 고통(변동성)은 <strong className="text-red-500">-{mddPercentage}% 로 연산</strong>되었습니다."
              </p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-600">
                특히 <strong>{selectedStock.name}</strong>이 포함되어 있어 <strong>목표 달성 시점이 {successRate < 80 ? '6개월 뒤로 밀릴 수 있는 리스크가 존재합니다.' : '순조로울 것으로 예상됩니다.'}</strong>
              </div>
              <p className="text-center font-bold text-gray-900 text-sm pb-2">
                {editingGoalId ? "이대로 포트폴리오를 변경할까요?" : "이대로 확정하여 자동 관리를 시작할까요?"}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowFinalConfirmModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold text-sm active:scale-95">다시 조절하기</button>
                <button onClick={handleFinalConfirm} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95">
                  {editingGoalId ? "변경 완료" : "관리 시작하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAiReportModal && (
        <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white text-center relative shrink-0">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-200" />
              <h3 className="font-bold text-xl">✨ AI 맞춤형 심층 진단</h3>
              <button onClick={() => setShowAiReportModal(false)} className="absolute top-4 right-4"><X className="text-white/70 w-6 h-6" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-5 animate-pulse">
                  <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                  <p className="text-sm font-bold text-gray-600 text-center leading-relaxed">Gemini가 금융 데이터를 기반으로<br/>고객님의 포트폴리오를 분석 중입니다...</p>
                </div>
              ) : (
                <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{aiReport}</div>
              )}
            </div>
            {!isGenerating && (
              <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <button onClick={() => setShowAiReportModal(false)} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold shadow-md transition active:scale-95">분석 결과 확인 완료</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showKafkaModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
            <div className="bg-red-50 p-5 flex items-start gap-4 border-b border-red-100">
              <div className="bg-red-100 p-2 rounded-full mt-1"><TrendingDown className="text-red-600 w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-red-900 text-lg">결제 내역 경고!</h3>
                <p className="text-sm text-red-700 mt-1">방금 전 큰 지출이 감지되었습니다.</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-gray-800 leading-relaxed font-medium">이 속도라면 이번 달 '포트폴리오'에 투입할 <strong className="text-red-600">여유 자금이 20만원 부족</strong>해집니다.</p>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <p className="text-xs font-bold text-blue-600 mb-2">AI 에이전트의 맞춤형 브리핑</p>
                <p className="text-sm text-gray-700 leading-relaxed">"안전자산 투입액은 유지하고, 이번 달 <span className="font-bold">주식 계좌 이체액만 20만 원 줄여서</span> 실행할까요?"</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowKafkaModal(false)} className="w-1/3 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm active:scale-95">무시</button>
                <button onClick={() => setShowKafkaModal(false)} className="w-2/3 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm active:scale-95">에이전트 제안 수락</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaydayModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] max-h-[90vh] flex flex-col">
            <div className="p-5 flex justify-between items-center border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2"><Wallet className="text-blue-600" /> 월급 입금 확인!</h3>
              <button onClick={() => { setShowPaydayModal(false); setIsPaid(false); }}><X className="text-gray-400 w-6 h-6" /></button>
            </div>
            {!isPaid ? (
              <div className="p-6 space-y-5 overflow-y-auto">
                {paydayType === 'surplus' ? (
                  <div className="bg-blue-50 p-4 rounded-2xl text-sm text-blue-900 leading-relaxed border border-blue-100">
                    "이번 달은 식비 예산이 <strong>15만 원 남았습니다!</strong> 이 잉여 자금을 분배 계좌에 추가해서 목표 달성 시기를 앞당겨 볼까요?"
                  </div>
                ) : (
                  <div className="bg-orange-50 p-4 rounded-2xl text-sm text-orange-900 leading-relaxed border border-orange-100">
                    "이번 달은 경조사비 지출로 <strong>여유 자금이 20만 원 부족</strong>합니다. 소비 방어를 위해 일부 자동 분배 금액을 조절했습니다."
                  </div>
                )}
                <div className="text-center bg-gray-50 py-4 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 font-semibold">이번 달 총 가용 자산</p>
                  <h2 className="text-3xl font-bold text-gray-900">{paydayType === 'surplus' ? '3,000,000 원' : '2,500,000 원'}</h2>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 px-1">설정한 포트폴리오 비율로 자동 분배되었습니다.</p>
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    {getPaydayAccounts().map((acc, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                        <div className="flex flex-col overflow-hidden pr-3">
                          <span className="text-[10px] font-bold text-gray-400 mb-0.5">{acc.type} 계좌</span>
                          <span className="text-sm text-gray-800 font-medium truncate">{acc.name}</span>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-sm font-bold text-gray-900">{acc.amount.toLocaleString()}원</span>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1">{acc.percent}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <button onClick={() => setIsPaid(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 shadow-lg shadow-blue-200 transition-transform active:scale-95">
                    <Fingerprint className="w-6 h-6" /> 승인하고 1초 만에 실행하기
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center space-y-4 bg-white flex-1">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                  <CheckCircle2 className="text-green-500 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">결재 및 이체 완료</h2>
                <p className="text-gray-500 text-sm pb-6 leading-relaxed">백엔드 오픈뱅킹 API를 통해<br/>총 계좌로의 이체 및 매수가<br/>한 번에 처리되었습니다.</p>
                <button onClick={() => { setIsPaid(false); setShowPaydayModal(false); }} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold">확인</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showLimitModal && (
        <div className="absolute inset-0 bg-black/60 z-[70] flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">생성 한도 초과</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">{limitMessage}</p>
            <button onClick={() => setShowLimitModal(false)} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold transition">확인</button>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div className="absolute inset-0 bg-black/70 z-[80] flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">정말 탈퇴하시겠습니까?</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">모든 자산 연결 정보와 설정된 목표 데이터가<br/>즉시 삭제되며 복구할 수 없습니다.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteAccountModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold transition active:scale-95">취소</button>
              <button onClick={handleDeleteAccount} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold transition shadow-md active:scale-95">탈퇴하기</button>
            </div>
          </div>
        </div>
      )}

      {showRoutingChoiceModal && (
        <div className="absolute inset-0 bg-black/70 z-[80] flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">월급 리밸런싱 설정</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">나만의 라이프스타일(추구미) 진단을 다시 진행하고 비율을 추천받을 수 있습니다.</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setShowRoutingChoiceModal(false); navigate('/seed-money-survey'); }} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold transition shadow-md active:scale-95">진단 다시 받고 추천 비율 적용</button>
            </div>
            <button onClick={() => setShowRoutingChoiceModal(false)} className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 underline underline-offset-2 p-2 transition">취소</button>
          </div>
        </div>
      )}

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
                <button onClick={() => setCreateFxAccount(!createFxAccount)} className={`w-full p-4 border rounded-2xl flex items-center justify-between transition-all ${createFxAccount ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                  <div className="text-left">
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded mb-1.5 inline-block">선택 추가</span>
                    <p className="font-bold text-gray-900">글로벌 투자를 위한 외환 통장</p>
                    <p className="text-xs text-gray-500 mt-1">환전 수수료 평생 무료</p>
                  </div>
                  {createFxAccount ? <CheckCircle2 className="w-6 h-6 text-purple-600" /> : <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>}
                </button>
              </div>
              <button onClick={handleCreateNewAccount} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold shadow-md transition mt-4 active:scale-95">동의 및 1초만에 개설하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
