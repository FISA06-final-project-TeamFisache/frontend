import React, { useState } from 'react';
import { 
  Home, PieChart, Bell, AlertCircle, Fingerprint, TrendingUp, TrendingDown, 
  ArrowRight, Wallet, CheckCircle2, X, Users, User, Building, Plane, 
  Heart, Landmark, Laptop, ShieldAlert, Sparkles, ShieldCheck, Smartphone, Link2, Loader2, ChevronRight, BarChart3, RefreshCw, Search, Info,
  Activity, CreditCard, Target, ChevronLeft, Menu, FileText, Calendar, ArrowUpRight,
  UserPlus, Copy, MessageCircle, Globe, Lightbulb, Plus, Trash2, Brain, History,
  MoreHorizontal, Edit2
} from 'lucide-react';

// 외부 API나 RAG에서 가져왔다고 가정한 ETF 카탈로그 (Mock Data)
const ETF_CATALOG = [
  { id: 'div1', category: 'dividend', name: 'TIGER 미국배당+7%프리미엄', type: '안정형 월배당', tag: '연 배당 7.2%', color: 'text-blue-600', bg: 'bg-blue-50', returnRate: 0.07, mddRisk: 0.12, rank: 1 },
  { id: 'div2', category: 'dividend', name: 'KODEX 배당성장', type: '국내 배당주', tag: '연 배당 4.5%', color: 'text-blue-600', bg: 'bg-blue-50', returnRate: 0.05, mddRisk: 0.10, rank: 4 },
  { id: 'tech1', category: 'growth', name: 'KODEX 미국나스닥100TR', type: '성장형 기술주', tag: '수익률 중심', color: 'text-red-600', bg: 'bg-red-50', returnRate: 0.15, mddRisk: 0.35, rank: 2 },
  { id: 'tech2', category: 'growth', name: 'TIGER 미국테크TOP10', type: '초대형 기술주', tag: 'AI/반도체', color: 'text-red-600', bg: 'bg-red-50', returnRate: 0.18, mddRisk: 0.40, rank: 5 },
  { id: 'market1', category: 'market', name: 'TIGER 미국S&P500', type: '시장평균 지수추종', tag: '안정적 성장', color: 'text-green-600', bg: 'bg-green-50', returnRate: 0.10, mddRisk: 0.20, rank: 3 },
  { id: 'market2', category: 'market', name: 'KODEX 200', type: '국내 코스피 추종', tag: '국내 대표', color: 'text-green-600', bg: 'bg-green-50', returnRate: 0.06, mddRisk: 0.25, rank: 6 }
];

// 대출 상품 카탈로그 (Mock Data)
const LOAN_CATALOG = [
  { id: 'loan1', category: 'policy', name: '신생아 특례 디딤돌 대출', type: '정부지원 주택담보대출', tag: '최저 연 1.6%', color: 'text-yellow-700', bg: 'bg-yellow-100', interestRate: 0.016, rank: 1 },
  { id: 'loan2', category: 'policy', name: '청년 전용 버팀목 대출', type: '정부지원 전세자금대출', tag: '최저 연 1.5%', color: 'text-yellow-700', bg: 'bg-yellow-100', interestRate: 0.015, rank: 2 },
  { id: 'loan3', category: 'commercial', name: '우리WON 주택담보대출', type: '시중은행 1금융권', tag: '고정 연 3.8%', color: 'text-gray-700', bg: 'bg-gray-100', interestRate: 0.038, rank: 3 },
  { id: 'loan4', category: 'commercial', name: '카카오뱅크 전월세보증금 대출', type: '인터넷전문은행', tag: '변동 연 3.5%', color: 'text-gray-700', bg: 'bg-gray-100', interestRate: 0.035, rank: 4 }
];

// 연동된 계좌 카탈로그 (Mock Data) - 월급 통장 선택용
const LINKED_ACCOUNTS = [
  { id: 'acc1', bank: '신한은행', name: 'Tops 직장인 플랜 통장', balance: 3200000, isWoori: false, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'acc2', bank: '카카오뱅크', name: '입출금통장', balance: 1500000, isWoori: false, color: 'text-yellow-700', bg: 'bg-yellow-100' },
  { id: 'acc3', bank: '우리은행', name: '우리 WON 파킹 통장', balance: 450000, isWoori: true, color: 'text-blue-800', bg: 'bg-blue-200' },
];

// 숨은 계좌 찾기로 발견된 계좌 모의 데이터 (Mock Data)
const MOCK_DISCOVERED_ACCOUNTS = [
  { id: 'disc1', name: 'NH농협 (직장인 우대 통장)', type: '현금', balance: 5200000, bank: 'NH농협', color: 'text-green-600', bg: 'bg-green-100' },
  { id: 'disc2', name: '하나은행 (주택청약종합저축)', type: '현금', balance: 1800000, bank: '하나은행', color: 'text-teal-600', bg: 'bg-teal-100' },
  { id: 'disc3', name: 'KB국민 (KB 스타 파킹통장)', type: '현금', balance: 950000, bank: 'KB국민', color: 'text-yellow-600', bg: 'bg-yellow-100' }
];

// 월별 자동 이체 내역 모의 데이터 (Mock Data)
const TRANSFER_HISTORY = [
  { id: 1, month: '2026년 4월', date: '2026.04.25', totalAmt: 1350000, details: [
    { name: '한국투자증권 [공격 투자형]', amount: 540000, type: '주식' },
    { name: 'KB증권 [안전 방어형]', amount: 540000, type: '채권' },
    { name: '우리은행 [비상금 파킹]', amount: 270000, type: '현금' }
  ]},
  { id: 2, month: '2026년 3월', date: '2026.03.25', totalAmt: 1350000, details: [
    { name: '한국투자증권 [공격 투자형]', amount: 540000, type: '주식' },
    { name: 'KB증권 [안전 방어형]', amount: 540000, type: '채권' },
    { name: '우리은행 [비상금 파킹]', amount: 270000, type: '현금' }
  ]},
  { id: 3, month: '2026년 2월', date: '2026.02.25', totalAmt: 1000000, details: [
    { name: '한국투자증권 [공격 투자형]', amount: 400000, type: '주식' },
    { name: 'KB증권 [안전 방어형]', amount: 400000, type: '채권' },
    { name: '우리은행 [비상금 파킹]', amount: 200000, type: '현금' }
  ]},
];

export default function App() {
  // App State
  const [appState, setAppState] = useState('welcome');
  const [loginData, setLoginData] = useState({ id: '', password: '' });
  const [isLinking, setIsLinking] = useState(false);
  const [signupData, setSignupData] = useState({ name: '', id: '', password: '' });
  const [salaryAccount, setSalaryAccount] = useState(null); 
  const [showWooriNudge, setShowWooriNudge] = useState(false); 
  const [isTransferSetting, setIsTransferSetting] = useState(false); 
  const [showTransferDateModal, setShowTransferDateModal] = useState(false);
  const [transferDate, setTransferDate] = useState(25);
  const [showReadOnlyWarningModal, setShowReadOnlyWarningModal] = useState(false);

  // 동적 사용가능 계좌 목록
  const [availableAccounts, setAvailableAccounts] = useState([
    { id: 'acc_inv1', name: '한국투자증권 (종합CMA)', type: '주식' },
    { id: 'acc_inv2', name: 'KB증권 (채권형)', type: '채권' },
    { id: 'acc_inv3', name: '토스증권 (소수점)', type: '주식' },
    { id: 'acc_bank1', name: '카카오뱅크 (입출금)', type: '현금' },
    { id: 'acc_bank2', name: '신한은행 (주택청약)', type: '현금' },
    { id: 'acc_bank3', name: '우리은행 (파킹통장)', type: '현금' }
  ]);

  // 월급 분배 라우팅 설정 State (온보딩 및 글로벌)
  const [routingSetup, setRoutingSetup] = useState([
    { id: 1, accountId: 'acc_inv1', tag: '메인 투자 계좌', percent: 40 },
    { id: 2, accountId: 'acc_inv2', tag: '안전 채권형', percent: 40 },
    { id: 3, accountId: 'acc_bank1', tag: '비상금 파킹', percent: 20 }
  ]);

  // Multiple Goals State
  const [goals, setGoals] = useState([]); 
  const [activeGoalId, setActiveGoalId] = useState(null); 
  const [editingGoalId, setEditingGoalId] = useState(null); 

  // Navigation & Wizard State
  const [activeTab, setActiveTab] = useState('home');
  const [wizardStep, setWizardStep] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
  const [wizardPriority, setWizardPriority] = useState(1); 
  
  // Temporary Wizard/Sandbox Data States
  const [goal, setGoal] = useState('');
  const [goalAmount, setGoalAmount] = useState(10000); 
  const [goalPeriod, setGoalPeriod] = useState(4); 
  
  // 새로 추가된 자금 설정
  const [initialInvestment, setInitialInvestment] = useState(0); 
  const [initialFundingAccount, setInitialFundingAccount] = useState(availableAccounts[3]); 
  const [goalRoutingPercent, setGoalRoutingPercent] = useState(0); 
  const [tempRoutingSetup, setTempRoutingSetup] = useState([]); 
  const [monthlyContribution, setMonthlyContribution] = useState(0); // 금액 자동 계산
  
  const [stock, setStock] = useState(40);
  const [bond, setBond] = useState(40);
  const [cash, setCash] = useState(20);
  const [loan, setLoan] = useState(0); 
  const [selectedStock, setSelectedStock] = useState(ETF_CATALOG[4]); 
  const [selectedLoan, setSelectedLoan] = useState(LOAN_CATALOG[0]); 
  const [selectedBank, setSelectedBank] = useState(availableAccounts[3]); 
  
  // Modal States
  const [showKafkaModal, setShowKafkaModal] = useState(false);
  const [showPaydayModal, setShowPaydayModal] = useState(false);
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showLoanCatalogModal, setShowLoanCatalogModal] = useState(false); 
  const [showBankModal, setShowBankModal] = useState(false); 
  const [catalogFilter, setCatalogFilter] = useState('popular'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [paydayType, setPaydayType] = useState('surplus');
  const [selectedReport, setSelectedReport] = useState(null); 
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showTransferHistoryModal, setShowTransferHistoryModal] = useState(false); 
  const [expandedMonth, setExpandedMonth] = useState('2026년 4월'); 

  // 계좌 추가 연결 Modal (새 통장 연결)
  const [showLinkNewAccountModal, setShowLinkNewAccountModal] = useState(false);
  const [linkModalStep, setLinkModalStep] = useState('intro'); // 'intro', 'loading', 'list'

  // AI Report & Survey States
  const [showAiReportModal, setShowAiReportModal] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Survey States (MBTI)
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyStep, setSurveyStep] = useState(0); 
  const [surveyAnswers, setSurveyAnswers] = useState([]);
  const [pendingEditGoal, setPendingEditGoal] = useState(null); 

  // 리밸런싱 다시 설정 흐름 제어용 State 추가
  const [routingFlowContext, setRoutingFlowContext] = useState('onboarding'); // 'onboarding' 또는 'edit'
  const [showRoutingChoiceModal, setShowRoutingChoiceModal] = useState(false);

  // 계좌 개설 Modal States
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [newAccountContext, setNewAccountContext] = useState(null); 
  const [targetRoutingId, setTargetRoutingId] = useState(null); 
  const [createFxAccount, setCreateFxAccount] = useState(false);

  // 스와이프 액션(수정/삭제)을 위한 State
  const [revealedGoalId, setRevealedGoalId] = useState(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  // 알림(Notifications) State 추가
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'report', title: '이번 달 월간 성과 리포트 도착', desc: '2026년 4월의 자산 변동 및 AI 가이드라인을 확인하세요.', date: '1시간 전', isRead: false },
    { id: 2, type: 'kafka', title: 'Kafka 이상 소비 경고', desc: '방금 전 큰 지출이 감지되었습니다. 월급 리밸런싱을 조정할까요?', date: '3시간 전', isRead: false },
    { id: 3, type: 'payday_surplus', title: '월급 입금! (잉여 자금 발생)', desc: '식비 예산이 15만원 남았습니다. 잉여 자금을 분배할까요?', date: '1일 전', isRead: false },
    { id: 4, type: 'payday_deficit', title: '월급 입금! (지출 초과 발생)', desc: '경조사비 지출로 여유 자금이 20만원 부족합니다. 어떻게 방어할까요?', date: '2일 전', isRead: false }
  ]);

  const displayGoals = [...goals].sort((a,b) => a.priority - b.priority);

  const canCreateMore = () => {
    return goals.length < 1; // 목표 개수 최대 1개로 제한
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e, id) => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 40) {
      setRevealedGoalId(id); // 왼쪽으로 밀 때
    } else if (distance < -40 && revealedGoalId === id) {
      setRevealedGoalId(null); // 오른쪽으로 밀 때
    }
    setTouchStartX(0);
    setTouchEndX(0);
  };

  const handleGoBack = () => {
    if (activeTab === 'sandbox') {
      if (editingGoalId) {
        setActiveTab('home');
        setEditingGoalId(null);
      } else {
        setActiveTab('wizard');
      }
    } else if (activeTab === 'wizard') {
      if (editingGoalId) {
         if (wizardStep === 2) {
           setActiveTab('home');
           setEditingGoalId(null);
         } else if (wizardStep === 3) {
           setWizardStep(2);
         } else if (wizardStep === 4) {
           setWizardStep(3);
         } else if (wizardStep === 6) {
           setWizardStep(4);
         }
      } else {
        if (wizardStep === 6) {
          setWizardStep(4);
        } else if (wizardStep === 5) {
          setWizardStep(4);
        } else if (wizardStep === 4) {
          setWizardStep(3);
        } else if (wizardStep === 3) {
          setWizardStep(2);
        } else if (wizardStep === 2) {
          setWizardStep(1);
        } else if (wizardStep === 1) {
          setActiveTab('home');
        }
      }
    }
  };

  const getGoalTitle = (id) => {
    const map = {
      real_estate: '부동산 자금 마련',
      savings: '종잣돈 모으기',
      wedding: '결혼 준비',
      travel: '해외 여행',
      policy: '정부 지원 정책 매칭',
      ipad: '기타 (사고 싶은 물건)'
    };
    return map[id] || '나의 목표';
  };

  const formatAmount = (amt) => {
    if (amt >= 10000) return `${Math.floor(amt / 10000)}억 ${amt % 10000 > 0 ? (amt % 10000) + '만 ' : ''}원`;
    return `${amt}만 원`;
  };

  const getDynamicMetaphor = (amt) => {
    if (amt >= 100000) return '서울 한강뷰 아파트 매매 가치 🏙️';
    if (amt >= 50000) return '서울 주요 도심 아파트 전세 가치 🏢';
    if (amt >= 10000) return '테슬라 모델X 1대 가치 🚗';
    if (amt >= 5000) return '제네시스 G80 1대 가치 🚘';
    if (amt >= 3000) return '몰디브 최고급 신혼여행 3번 가치 ✈️';
    if (amt >= 1000) return '매일 스타벅스 커피 6년 치 가치 ☕';
    if (amt >= 500) return '유럽 한 달 살기 가치 🎒';
    if (amt >= 150) return '아이패드 프로 풀옵션 가치 📱';
    return '소중한 나의 첫 씨앗 자금 🌱';
  };

  const handleSliderChange = (type, newValue) => {
    const activeTypes = goal === 'real_estate' ? ['stock', 'bond', 'cash', 'loan'] : ['stock', 'bond', 'cash'];
    let values = { stock, bond, cash, loan };
    
    values[type] = newValue;
    let remain = 100 - newValue;
    
    const others = activeTypes.filter(t => t !== type);
    let prevRemain = others.reduce((acc, t) => acc + values[t], 0);
    
    if (prevRemain === 0) {
      let equalShare = Math.floor(remain / others.length);
      others.forEach(t => values[t] = equalShare);
      values[others[0]] += remain - (equalShare * others.length);
    } else {
      let distributed = 0;
      others.forEach((t, i) => {
        if (i === others.length - 1) {
          values[t] = remain - distributed;
        } else {
          let share = Math.round(remain * (values[t] / prevRemain));
          values[t] = share;
          distributed += share;
        }
      });
    }
    
    setStock(values.stock);
    setBond(values.bond);
    setCash(values.cash);
    if (goal === 'real_estate') setLoan(values.loan);
  };

  const calculateMetrics = () => {
    const invested = stock + bond + cash;
    const stockRatio = invested > 0 ? stock / invested : 0;
    const bondRatio = invested > 0 ? bond / invested : 0;
    const cashRatio = invested > 0 ? cash / invested : 0;

    const currentMdd = (selectedStock.mddRisk * stockRatio + 0.05 * bondRatio).toFixed(3);
    const mddPercentage = (currentMdd * 100).toFixed(1);

    const loanImpact = goal === 'real_estate' ? (selectedLoan.interestRate * (loan / 100)) : 0;
    const currentReturn = (selectedStock.returnRate * stockRatio + 0.04 * bondRatio + 0.02 * cashRatio - loanImpact).toFixed(3);
    const returnPercentage = (currentReturn * 100).toFixed(1);

    let successRate = 50;
    if (currentReturn >= 0.075 || loan > 30) {
      successRate = currentMdd > 0.15 && loan > 50 ? 65 : 92; 
    } else {
      successRate = 45;
    }
    if (loan > 0) successRate = Math.min(99, successRate + Math.floor(loan / 2));

    return { mddPercentage, returnPercentage, successRate };
  };

  const { mddPercentage, returnPercentage, successRate } = calculateMetrics();

  const generateAiReport = async () => {
    setIsGenerating(true);
    setAiReport('');
    setShowAiReportModal(true);

    const apiKey = ""; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const prompt = `당신은 대한민국 최고 수준의 자산관리 AI 비서입니다. 
사용자는 ${initialInvestment}만 원을 초기 자금으로, 매월 ${monthlyContribution}만 원씩 추가 투입하여 ${goalPeriod}년 뒤 ${formatAmount(goalAmount)} 모으기 목표를 가지고 있습니다.
현재 구성한 포트폴리오 자금 조달 비중은 위험자산(주식: ${selectedStock.name}) ${stock}%, 안전자산(채권) ${bond}%, 현금성 자산(${selectedBank?.name}) ${cash}%${goal === 'real_estate' ? `, 대출 상품(${selectedLoan.name}, 레버리지) ${loan}%` : ''} 입니다.

이 포트폴리오 구성의 장점, 단점, 그리고 ${goalPeriod}년 안에 목표를 달성하기 위한 구체적인 조언을 3가지 포인트로 짧고 명확하게 작성해주세요. 유저에게 직접 말하듯 친절하고 전문적인 톤을 유지하고, 마크다운 및 이모지를 활용해 가독성 있게 꾸며주세요.`;

    let retries = 5;
    let delay = 1000;
    let success = false;
    let resultText = '';

    while (retries > 0 && !success) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        success = true;
      } catch (error) {
        retries--;
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      }
    }

    if (success) {
      setAiReport(resultText);
    } else {
      setAiReport("⚠️ AI 포트폴리오 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
    setIsGenerating(false);
  };

  const handleEditPortfolio = (goalToEdit, applyAi = false) => {
    setEditingGoalId(goalToEdit.id);
    setGoal(goalToEdit.goalType);
    setGoalAmount(goalToEdit.goalAmount);
    setGoalPeriod(goalToEdit.goalPeriod);
    setInitialInvestment(goalToEdit.initialInvestment || 0);
    setInitialFundingAccount(goalToEdit.initialFundingAccount || availableAccounts[3]);
    setMonthlyContribution(goalToEdit.monthlyContribution || 0);
    setGoalRoutingPercent(goalToEdit.goalRoutingPercent || 0);

    if (applyAi) {
      let currentStock = goalToEdit.stock;
      let newStock = Math.max(0, currentStock - 10);
      let diff = currentStock - newStock;
      
      setStock(newStock);
      setBond(goalToEdit.bond + diff);
      setCash(goalToEdit.cash);
      setLoan(goalToEdit.loan || 0);
    } else {
      setStock(goalToEdit.stock);
      setBond(goalToEdit.bond);
      setCash(goalToEdit.cash);
      setLoan(goalToEdit.loan || 0);
    }
    
    setSelectedStock(goalToEdit.selectedStock);
    setSelectedLoan(goalToEdit.selectedLoan);
    setSelectedBank(goalToEdit.selectedBank || availableAccounts.find(a => a.type === '현금'));
    
    setSelectedReport(null);
    setActiveTab('sandbox');
  };

  const handleFullEditGoal = (goalToEdit) => {
    setEditingGoalId(goalToEdit.id);
    setGoal(goalToEdit.goalType);
    setGoalAmount(goalToEdit.goalAmount);
    setGoalPeriod(goalToEdit.goalPeriod);
    setInitialInvestment(goalToEdit.initialInvestment || 0);
    setInitialFundingAccount(goalToEdit.initialFundingAccount || availableAccounts[3]);
    setMonthlyContribution(goalToEdit.monthlyContribution || 0);
    setGoalRoutingPercent(goalToEdit.goalRoutingPercent || 0);
    setTempRoutingSetup(routingSetup);

    setStock(goalToEdit.stock);
    setBond(goalToEdit.bond);
    setCash(goalToEdit.cash);
    setLoan(goalToEdit.loan || 0);
    setSelectedStock(goalToEdit.selectedStock);
    setSelectedLoan(goalToEdit.selectedLoan);
    setSelectedBank(goalToEdit.selectedBank || availableAccounts[3]);
    
    setRevealedGoalId(null);
    setWizardStep(2);
    setActiveTab('wizard');
  };

  const handleDeleteGoal = (goalId) => {
    let updatedGoals = goals.filter(g => g.id !== goalId);
    let sortedGoals = updatedGoals.sort((a,b) => a.priority - b.priority);
    sortedGoals.forEach((g, index) => {
       g.priority = index + 1; 
    });
    setGoals(sortedGoals);
    setRoutingSetup(routingSetup.filter(r => r.id !== `goal_${goalId}`));
    if (activeGoalId === goalId) {
      setActiveGoalId(null);
    }
    setRevealedGoalId(null);
  };

  const startWizard = () => {
    if (!canCreateMore()) {
      setLimitMessage('목표는 최대 1개까지만 생성할 수 있습니다.');
      setShowLimitModal(true);
      return;
    }

    setGoal('');
    setGoalAmount(10000);
    setGoalPeriod(4);
    
    // 새로 추가된 자금 관련 초기화
    setInitialInvestment(0);
    setInitialFundingAccount(availableAccounts[3]);
    setGoalRoutingPercent(0);
    setTempRoutingSetup(routingSetup); // 현재 라우팅 설정을 임시 변수에 복사
    setMonthlyContribution(0);
    
    setStock(40); setBond(40); setCash(20); setLoan(0);
    setSelectedStock(ETF_CATALOG.find(e => e.id === 'market1'));
    setSelectedLoan(LOAN_CATALOG[0]);
    setSelectedBank(availableAccounts.find(a => a.type === '현금') || availableAccounts[3]);
    setEditingGoalId(null); 
    
    setWizardStep(1); 
    setWizardPriority(1);
    
    setActiveTab('wizard');
  };

  const handleFinalConfirm = () => {
    if (editingGoalId) {
      let newGoals = goals.map(g => {
        if (g.id === editingGoalId) {
          return { 
            ...g, 
            goalType: goal,
            goalAmount,
            goalPeriod,
            initialInvestment,
            initialFundingAccount,
            monthlyContribution,
            goalRoutingPercent,
            stock, bond, cash, loan, 
            selectedStock, selectedLoan, selectedBank 
          };
        }
        return g;
      });
      setGoals(newGoals);

      // 라우팅 셋업 업데이트
      let updatedRouting = routingSetup.map(r => {
        if (r.id === `goal_${editingGoalId}`) {
          return { ...r, tag: `목표: ${getGoalTitle(goal)}`, percent: goalRoutingPercent };
        }
        return r;
      });
      if (!updatedRouting.some(r => r.id === `goal_${editingGoalId}`) && goalRoutingPercent > 0) {
        updatedRouting.push({
          id: `goal_${editingGoalId}`,
          accountId: 'goal',
          tag: `목표: ${getGoalTitle(goal)}`,
          percent: goalRoutingPercent
        });
      }
      setRoutingSetup(updatedRouting.filter(r => r.percent > 0));

      setEditingGoalId(null);
      setShowFinalConfirmModal(false);
      setActiveTab('home');
      return;
    }

    const priorityToSave = 1; // 목표가 1개이므로 항상 1순위 고정

    const newGoalObj = {
      id: Date.now(),
      goalType: goal,
      goalAmount,
      goalPeriod,
      initialInvestment,
      initialFundingAccount,
      monthlyContribution,
      goalRoutingPercent,
      stock, bond, cash, loan,
      selectedStock, selectedLoan, selectedBank,
      priority: priorityToSave
    };
    
    // 라우팅 셋업 글로벌 업데이트 (새 목표 항목 추가)
    const newRoutingItem = {
      id: `goal_${newGoalObj.id}`,
      accountId: 'goal', 
      tag: `목표: ${getGoalTitle(goal)}`,
      percent: goalRoutingPercent
    };
    
    setRoutingSetup([...tempRoutingSetup, newRoutingItem].filter(r => r.percent > 0));

    let newGoals = [...goals];
    newGoals.push(newGoalObj);
    setGoals(newGoals);
    setActiveGoalId(newGoalObj.id);

    setShowFinalConfirmModal(false);
    setActiveTab('home');
  };

  const handleCompleteGoal = (goalId) => {
    let updatedGoals = goals.filter(g => g.id !== goalId);
    let sortedGoals = updatedGoals.sort((a,b) => a.priority - b.priority);
    sortedGoals.forEach((g, index) => {
       g.priority = index + 1; 
    });
    setGoals(sortedGoals);
    
    // 완료 시 라우팅 셋업에서도 제거
    setRoutingSetup(routingSetup.filter(r => r.id !== `goal_${goalId}`));

    if (activeGoalId === goalId) {
      setActiveGoalId(null);
    }
  };

  const handleLinkAccounts = () => {
    setIsLinking(true);
    setTimeout(() => {
      setIsLinking(false);
      setAppState('salary_select'); 
    }, 2000);
  };

  const handleDeleteAccount = () => {
    // 모든 계정 정보 및 목표, 설정 초기화
    setSignupData({ name: '', id: '', password: '' });
    setLoginData({ id: '', password: '' });
    setGoals([]);
    setRoutingSetup([
      { id: 1, accountId: 'acc_inv1', tag: '메인 투자 계좌', percent: 40 },
      { id: 2, accountId: 'acc_inv2', tag: '안전 채권형', percent: 40 },
      { id: 3, accountId: 'acc_bank1', tag: '비상금 파킹', percent: 20 }
    ]);
    setSalaryAccount(null);
    setActiveGoalId(null);
    setEditingGoalId(null);
    
    // 모달 닫기 및 로그인 화면으로 이동
    setShowDeleteAccountModal(false);
    setIsDrawerOpen(false);
    setAppState('welcome');
    setActiveTab('home');
  };

  const handleWooriAutoTransfer = () => {
    setIsTransferSetting(true);
    setTimeout(() => {
      setIsTransferSetting(false);
      setShowWooriNudge(false);
      setAppState('onboarding_survey'); 
    }, 1500);
  };

  const handleWooriAutoTransferConfirm = () => {
    setIsTransferSetting(true);
    setTimeout(() => {
      setIsTransferSetting(false);
      setShowTransferDateModal(false);
      setAppState('onboarding_survey'); 
    }, 1500);
  };

  const handleCreateNewAccount = () => {
    const newBaseAcc = { id: `toss_divide_${Date.now()}`, name: '토스뱅크 (나눠모으기)', type: '현금' };
    let updatedAccounts = [...availableAccounts, newBaseAcc];

    if (createFxAccount) {
      const newFxAcc = { id: `toss_fx_${Date.now()}`, name: '토스뱅크 (외환)', type: '외환' };
      updatedAccounts.push(newFxAcc);
    }

    setAvailableAccounts(updatedAccounts);
    
    if (newAccountContext === 'routing') {
      setTempRoutingSetup(tempRoutingSetup.map(item => item.id === targetRoutingId ? { ...item, accountId: newBaseAcc.id } : item));
      setRoutingSetup(routingSetup.map(item => item.id === targetRoutingId ? { ...item, accountId: newBaseAcc.id } : item));
    } else if (newAccountContext === 'sandbox') {
      setSelectedBank(newBaseAcc);
      setShowBankModal(false);
    } else if (newAccountContext === 'initial_funding') {
      setInitialFundingAccount(newBaseAcc);
    }
    
    setShowNewAccountModal(false);
    setCreateFxAccount(false);
    setNewAccountContext(null);
  };

  const handleFindAccounts = () => {
    setLinkModalStep('loading');
    setTimeout(() => {
      setLinkModalStep('list');
    }, 1500);
  };

  const handleSelectDiscoveredAccount = (acc) => {
    const newAcc = { id: `acc_new_linked_${Date.now()}`, name: acc.name, type: acc.type };
    setAvailableAccounts(prev => [...prev, newAcc]);
    setInitialFundingAccount(newAcc);
    setShowLinkNewAccountModal(false);
    setLinkModalStep('intro'); // 상태 초기화
  };

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

  const getPaydayAccounts = () => {
    const totalAmt = paydayType === 'surplus' ? 3000000 : 2500000; // 급여 총액 300만 원 가정
    return routingSetup
      .filter(setup => setup.percent > 0)
      .map(setup => {
        let name = setup.tag;
        let type = '목표 자동 이체';
        if (setup.accountId !== 'goal') {
          const accInfo = availableAccounts.find(a => a.id === setup.accountId) || availableAccounts[0];
          name = `${accInfo.name} [${setup.tag}]`;
          type = accInfo.type;
        }

        return {
          name, 
          percent: Number(setup.percent),
          type,
          amount: Math.round(totalAmt * (Number(setup.percent) / 100))
        };
      });
  };

  const handleSurveyAnswer = (score) => {
    const newAnswers = [...surveyAnswers, score];
    setSurveyAnswers(newAnswers);

    if (surveyStep === 0) {
      setSurveyStep(1);
    } else {
      setSurveyStep(2); 
    }
  };

  const getSurveyResult = () => {
    const totalScore = surveyAnswers.reduce((a, b) => a + b, 0);
    if (totalScore === 2) return { title: '야수의 심장 (공격투자형)', stock: 80, bond: 10, cash: 10, desc: '고수익을 위해 변동성을 감내하는 공격적 투자 성향입니다.' };
    if (totalScore === 1) return { title: '신중한 호랑이 (중도형)', stock: 50, bond: 30, cash: 20, desc: '적절한 성장과 안정성을 동시에 추구하는 밸런스형 성향입니다.' };
    return { title: '흔들리지 않는 바위 (안정형)', stock: 20, bond: 60, cash: 20, desc: '원금 보존과 안정적인 수익을 최우선으로 생각하는 성향입니다.' };
  };

  const handleNotificationClick = (notif) => {
    // 읽음 처리
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));

    // 각 알림 타입에 맞는 액션 실행
    if (notif.type === 'report') {
      setSelectedReport('2026년 4월');
    } else if (notif.type === 'kafka') {
      setShowKafkaModal(true);
    } else if (notif.type === 'payday_surplus') {
      setPaydayType('surplus');
      setShowPaydayModal(true);
    } else if (notif.type === 'payday_deficit') {
      setPaydayType('deficit');
      setShowPaydayModal(true);
    }
    setShowNotificationsModal(false);
  };

  // ==========================================
  // 온보딩 뷰
  // ==========================================
  if (appState === 'welcome') {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-blue-900 to-gray-900 h-screen overflow-hidden flex flex-col items-center justify-center font-sans border shadow-xl relative text-white">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 text-center space-y-6 px-8 w-full">
          <div className="w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center mx-auto mb-8 border border-white/20">
            <ShieldCheck className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">WooriPort</h1>
          <p className="text-blue-200 text-sm leading-relaxed">
            나의 모든 자산을 한곳에 모으고,<br/>AI가 제안하는 완벽한 미래를 만나보세요.
          </p>
          <div className="pt-12 space-y-4 w-full">
            <button onClick={() => setAppState('login')} className="w-full bg-white hover:bg-gray-100 text-blue-900 py-4 rounded-xl font-bold transition shadow-lg active:scale-95">
              로그인
            </button>
            <div className="pt-4">
              <button onClick={() => setAppState('signup')} className="text-sm text-blue-300 hover:text-white underline underline-offset-4 transition">
                아직 계정이 없으신가요? 회원가입
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'login') {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-blue-900 to-gray-900 h-screen overflow-hidden flex flex-col font-sans border shadow-xl relative text-white">
        <div className="px-6 py-8 animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
          <button onClick={() => setAppState('welcome')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition mb-6 active:scale-95">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold mb-2">로그인</h2>
          <p className="text-blue-200 text-sm mb-10">등록하신 아이디와 비밀번호를 입력해주세요.</p>

          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">아이디</label>
              <input type="text" placeholder="아이디 입력" value={loginData.id} onChange={(e) => setLoginData({...loginData, id: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">비밀번호</label>
              <input type="password" placeholder="••••••••" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          <button onClick={() => setAppState('linking')} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 mt-6 transition shadow-lg disabled:opacity-50 active:scale-95" disabled={!loginData.id || !loginData.password}>
            로그인하고 자산 연결하기
          </button>
        </div>
      </div>
    );
  }

  if (appState === 'signup') {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-blue-900 to-gray-900 h-screen overflow-hidden flex flex-col font-sans border shadow-xl relative text-white">
        <div className="px-6 py-8 animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
          <button onClick={() => setAppState('welcome')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition mb-6 active:scale-95">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold mb-2">회원가입</h2>
          <p className="text-blue-200 text-sm mb-10">WooriPort와 함께 자산 관리를 시작하세요.</p>

          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">이름</label>
              <input type="text" placeholder="홍길동" value={signupData.name} onChange={(e) => setSignupData({...signupData, name: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">아이디</label>
              <input type="text" placeholder="woori_user" value={signupData.id} onChange={(e) => setSignupData({...signupData, id: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">비밀번호</label>
              <input type="password" placeholder="••••••••" value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          <button onClick={() => setAppState('linking')} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 mt-6 transition shadow-lg disabled:opacity-50 active:scale-95" disabled={!signupData.name || !signupData.id || !signupData.password}>
            가입 완료하고 자산 연결하기
          </button>
        </div>
      </div>
    );
  }

  if (appState === 'linking') {
    return (
      <div className="max-w-md mx-auto bg-white h-screen overflow-hidden flex flex-col font-sans border shadow-xl">
        <div className="flex-1 px-6 py-12 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
            <Link2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">흩어진 내 자산을<br/>한 번에 연결할까요?</h2>
          <p className="text-sm text-gray-500 mb-8">마이데이터를 통해 안전하게 불러옵니다.</p>

          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4 flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="font-bold text-gray-700">전체 동의 및 연결</span>
              <CheckCircle2 className="text-blue-600 w-5 h-5" />
            </div>
            {['은행 계좌 (12개)', '증권/투자 (4개)', '카드/페이 (6개)'].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm text-gray-600">
                <span>{item}</span>
                <CheckCircle2 className="text-gray-300 w-4 h-4" />
              </div>
            ))}
          </div>

          <button onClick={handleLinkAccounts} disabled={isLinking} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 mt-6 transition shadow-lg shadow-blue-200 active:scale-95">
            {isLinking ? <><Loader2 className="w-5 h-5 animate-spin" /> 데이터를 불러오는 중...</> : '1분 만에 모두 연결하기'}
          </button>
        </div>
      </div>
    );
  }

  if (appState === 'salary_select') {
    return (
      <div className="max-w-md mx-auto bg-gray-50 h-screen overflow-hidden flex flex-col font-sans border shadow-xl relative">
        <div className="px-6 py-8 flex flex-col h-full animate-in slide-in-from-right duration-300">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">급여가 들어오는<br/>주거래 통장을 선택해주세요</h2>
          <p className="text-sm text-gray-500 mb-8">선택하신 계좌의 입금 내역을 바탕으로 매월 가용 자산을 분석합니다.</p>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {LINKED_ACCOUNTS.map(acc => (
              <button
                key={acc.id}
                onClick={() => setSalaryAccount(acc)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between shadow-sm ${salaryAccount?.id === acc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border ${acc.bg} ${acc.color} ${salaryAccount?.id === acc.id ? 'border-blue-200' : 'border-transparent'}`}>
                    {acc.bank.substring(0,2)}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">{acc.bank}</p>
                    <p className="text-sm font-bold text-gray-900">{acc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{acc.balance.toLocaleString()}원</p>
                  </div>
                </div>
                {salaryAccount?.id === acc.id ? (
                  <CheckCircle2 className="text-blue-500 w-6 h-6" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>
                )}
              </button>
            ))}
          </div>

          <button
            disabled={!salaryAccount}
            onClick={() => {
              if (salaryAccount.isWoori) {
                setShowTransferDateModal(true); 
              } else {
                setShowWooriNudge(true);
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-4 rounded-xl font-bold transition shadow-lg mt-4 shrink-0 flex justify-center items-center gap-2 active:scale-95"
          >
            선택 완료 <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* 우리은행 Nudge Bottom Sheet */}
        {showWooriNudge && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
            <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col shadow-2xl">
              <div className="p-6 pb-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">우리은행 자동이체로<br/>AI 포트폴리오를 100% 활용하세요!</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mt-2">
                      타행 계좌를 급여 통장으로 선택하셨네요. 급여가 들어오면 <strong>우리은행 계좌로 자동이체</strong>되도록 설정해두시면, 매월 번거로움 없이 AI가 자동으로 포트폴리오를 분배하고 매수까지 완료해 드립니다.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button onClick={() => { setShowWooriNudge(false); setShowTransferDateModal(true); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 active:scale-95">
                    보유한 [우리 WON 파킹 통장]으로 자동이체 연결
                  </button>
                  <button onClick={() => { setShowWooriNudge(false); setShowTransferDateModal(true); }} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-4 rounded-xl text-sm font-bold transition active:scale-95">
                    우리은행 급여통장 1분 만에 새로 만들기
                  </button>
                  <button onClick={() => { setShowWooriNudge(false); setShowReadOnlyWarningModal(true); }} className="w-full py-4 text-gray-400 hover:text-gray-600 text-sm font-bold transition underline underline-offset-4 active:scale-95">
                    다음에 설정할게요
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 자동이체일 설정 모달 */}
        {showTransferDateModal && (
          <div className="absolute inset-0 bg-black/60 z-[60] flex items-end justify-center">
            <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">자동이체일 설정</h3>
                <button onClick={() => setShowTransferDateModal(false)}><X className="text-gray-400 w-6 h-6" /></button>
              </div>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">매월 지정하신 날짜에 맞춰 타행 급여통장에서<br/>우리은행 계좌로 가용 자금을 가져옵니다.</p>
              
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between mb-8">
                <span className="font-bold text-gray-700">이체 지정일</span>
                <div className="flex items-center gap-2">
                  <select 
                    value={transferDate} 
                    onChange={(e) => setTransferDate(Number(e.target.value))}
                    className="bg-white border border-gray-300 rounded-lg p-2 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}일</option>
                    ))}
                  </select>
                </div>
              </div>

              <button onClick={handleWooriAutoTransferConfirm} disabled={isTransferSetting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl text-lg font-bold shadow-md transition flex items-center justify-center gap-2 active:scale-95">
                {isTransferSetting ? <><Loader2 className="w-5 h-5 animate-spin"/> 설정 중...</> : '이 날짜로 설정 완료'}
              </button>
            </div>
          </div>
        )}

        {/* 조회 전용 안내(경고) 모달 */}
        {showReadOnlyWarningModal && (
          <div className="absolute inset-0 bg-black/60 z-[70] flex items-center justify-center p-5">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl p-6 text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">조회 기능만 제공됩니다</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                우리은행 계좌를 연결하지 않으시면,<br/>매월 AI가 제안하는 <strong>자동 분배(리밸런싱) 및 매수 기능이 제한</strong>되며, 단순 잔액 조회만 가능합니다.
              </p>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setShowReadOnlyWarningModal(false); setShowWooriNudge(true); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition shadow-md active:scale-95">
                  우리은행 계좌 연결하기
                </button>
                <button onClick={() => { setShowReadOnlyWarningModal(false); setAppState('onboarding_survey'); }} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold transition active:scale-95">
                  조회 전용으로 계속하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (appState === 'onboarding_survey') {
    const result = getSurveyResult();

    const handleApplyRecommendation = () => {
      setRoutingSetup([
        { id: Date.now(), accountId: availableAccounts[0].id, tag: '공격 투자형', percent: result.stock },
        { id: Date.now() + 1, accountId: availableAccounts[1].id, tag: '안전 방어형', percent: result.bond },
        { id: Date.now() + 2, accountId: availableAccounts[5].id, tag: '비상금 파킹', percent: result.cash }
      ]);
      setAppState('account_setup');
    };

    return (
      <div className="max-w-md mx-auto bg-gray-50 h-screen overflow-hidden flex flex-col font-sans border shadow-xl relative">
        {routingFlowContext === 'edit' && (
          <button onClick={() => { setRoutingFlowContext('onboarding'); setAppState('home'); }} className="absolute top-5 right-5 p-2 rounded-full bg-gray-200 text-gray-600 z-10 hover:bg-gray-300 transition">
            <X className="w-5 h-5" />
          </button>
        )}
        <div className={`px-6 pb-8 flex flex-col h-full ${routingFlowContext === 'edit' ? 'pt-16' : 'pt-8'}`}>
          <div className="shrink-0 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-7 h-7 text-purple-600" /> 자산 형성 추구미 찾기
            </h2>
            <p className="text-sm text-gray-500 mt-2">자산을 모아 완성할 나만의 라이프스타일을 진단하고,<br/>맞춤형 월급 분배(리밸런싱) 비율을 추천받아보세요.</p>
          </div>

          <div className="flex-1 overflow-y-auto pb-6">
            {surveyStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">질문 1/2</span>
                  <h4 className="text-xl font-bold text-gray-900 leading-tight">투자한 주식이 하루 만에<br/>-15% 폭락했다면?</h4>
                </div>
                <div className="space-y-3 mt-8">
                  <button onClick={() => handleSurveyAnswer(1)} className="w-full p-5 border-2 border-gray-200 rounded-2xl text-left hover:border-purple-500 hover:bg-purple-50 transition shadow-sm active:scale-95">
                    <p className="font-bold text-gray-800 text-sm">바겐세일이다! 오히려 추가 매수한다.</p>
                  </button>
                  <button onClick={() => handleSurveyAnswer(0)} className="w-full p-5 border-2 border-gray-200 rounded-2xl text-left hover:border-purple-500 hover:bg-purple-50 transition shadow-sm active:scale-95">
                    <p className="font-bold text-gray-800 text-sm">더 떨어지기 전에 일단 전량 매도한다.</p>
                  </button>
                </div>
              </div>
            )}

            {surveyStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">질문 2/2</span>
                  <h4 className="text-xl font-bold text-gray-900 leading-tight">당신이 바라는 5년 뒤의<br/>가장 이상적인 자산 상태는?</h4>
                </div>
                <div className="space-y-3 mt-8">
                  <button onClick={() => handleSurveyAnswer(1)} className="w-full p-5 border-2 border-gray-200 rounded-2xl text-left hover:border-purple-500 hover:bg-purple-50 transition shadow-sm active:scale-95">
                    <p className="font-bold text-gray-800 text-sm">위험을 감수하더라도 원금 2배 달성</p>
                  </button>
                  <button onClick={() => handleSurveyAnswer(0)} className="w-full p-5 border-2 border-gray-200 rounded-2xl text-left hover:border-purple-500 hover:bg-purple-50 transition shadow-sm active:scale-95">
                    <p className="font-bold text-gray-800 text-sm">안전하게 이자와 배당으로 현금흐름 창출</p>
                  </button>
                </div>
              </div>
            )}

            {surveyStep === 2 && (
              <div className="space-y-6 animate-in zoom-in-95 duration-300 text-center flex flex-col h-full">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 mt-4 shrink-0">
                  <Target className="w-10 h-10 text-purple-600" />
                </div>
                <div className="shrink-0">
                  <p className="text-xs text-gray-500 font-bold mb-1">분석 완료!</p>
                  <h4 className="text-2xl font-extrabold text-gray-900">{result.title}</h4>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                    {result.desc}
                  </p>
                </div>
                <div className="border-2 border-purple-100 rounded-2xl p-5 bg-white shadow-sm flex divide-x divide-gray-100 text-center shrink-0">
                  <div className="flex-1"><p className="text-xs text-red-500 font-bold mb-1">공격 투자</p><p className="font-extrabold text-lg text-gray-900">{result.stock}%</p></div>
                  <div className="flex-1"><p className="text-xs text-blue-500 font-bold mb-1">안전 방어</p><p className="font-extrabold text-lg text-gray-900">{result.bond}%</p></div>
                  <div className="flex-1"><p className="text-xs text-green-500 font-bold mb-1">현금 파킹</p><p className="font-extrabold text-lg text-gray-900">{result.cash}%</p></div>
                </div>
                
                <div className="mt-auto pt-4 shrink-0 space-y-3">
                  <button 
                    onClick={handleApplyRecommendation}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold shadow-md transition active:scale-95"
                  >
                    이 비율로 월급 분배 설정하기
                  </button>
                  <button 
                    onClick={() => setAppState('account_setup')}
                    className="w-full py-4 rounded-xl font-bold text-gray-500 hover:text-gray-700 transition underline underline-offset-2 text-sm active:scale-95"
                  >
                    추천 건너뛰고 내가 직접 설정할게요
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'account_setup') {
    const totalPercent = routingSetup.reduce((sum, item) => sum + Number(item.percent || 0), 0);

    const handleAddAccount = () => {
      setRoutingSetup([...routingSetup, { id: Date.now(), accountId: availableAccounts[0].id, tag: '', percent: 0 }]);
    };

    const handleUpdateSetup = (id, field, value) => {
      setRoutingSetup(routingSetup.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleRemoveAccount = (id) => {
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

            <button 
              onClick={handleAddAccount}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition flex items-center justify-center gap-1 active:scale-95"
            >
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
                  setRoutingFlowContext('onboarding'); // 상태 초기화
                  setAppState('home'); // 대시보드로 복귀
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

        {/* 새 통장 개설/연결 모달 (통용) */}
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

  if (appState === 'prompt') {
    return (
      <div className="max-w-md mx-auto bg-white h-screen overflow-hidden flex flex-col font-sans border shadow-xl">
        <div className="flex-1 px-6 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">자산 연결 완료!</h2>
          <p className="text-gray-500 text-sm mb-6">
            {signupData.name ? `${signupData.name}님의 ` : '고객님의 '} 
            총 자산 <strong>124,500,000원</strong>을 확인했습니다.
          </p>
          
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-3xl border border-blue-100 w-full mb-8">
            <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">나만의 자산 설계를 시작해볼까요?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">자산 데이터 분석은 끝났습니다.<br/>AI 네비게이터와 함께 목표에 맞는<br/>첫 자산 설계를 시작해 볼까요?</p>
          </div>

          <div className="w-full space-y-3">
            <button onClick={() => { setAppState('main'); startWizard(); }} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-md active:scale-95">
              네, 자산 설계 시작할게요 <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => { setAppState('main'); setActiveTab('home'); }} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-4 rounded-xl font-bold border border-gray-200 transition active:scale-95">
              아니요, 대시보드만 먼저 볼게요
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 메인 앱 렌더링 (마법사 및 대시보드)
  // ==========================================
  const renderWizard = () => {
    return (
      <div className="p-5 space-y-6 min-h-full flex flex-col bg-white animate-in slide-in-from-right pb-24">
        {/* Step 1: 목표 선택 */}
        {wizardStep === 1 && (
          <div className="space-y-6 flex-1 animate-in slide-in-from-right">
            <h2 className="text-2xl font-bold text-gray-900 mt-4">어떤 목표를 세워볼까요?</h2>
            <div className="space-y-3">
              {[
                { id: 'savings', icon: <Wallet/>, title: '종잣돈 모으기', desc: '세부 기간/금액 설정', defaultAmt: 10000, defaultPeriod: 4 },
                { id: 'wedding', icon: <Heart/>, title: '결혼 준비', desc: '세부 기간/금액 설정', defaultAmt: 10000, defaultPeriod: 4 },
                { id: 'travel', icon: <Plane/>, title: '해외 여행', desc: '단기 자금 마련', defaultAmt: 500, defaultPeriod: 1 },
                { id: 'ipad', icon: <Laptop/>, title: '기타 (사고 싶은 물건)', desc: '아이패드, 명품 백 등', defaultAmt: 150, defaultPeriod: 1 },
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => { 
                    setGoal(item.id); 
                    setGoalAmount(item.defaultAmt); 
                    setGoalPeriod(item.defaultPeriod); 
                    setWizardStep(2); 
                  }}
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

        {/* Step 2: 세부 계획 (기간/금액) */}
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
            <button 
              onClick={() => {
                setWizardStep(3); 
              }} 
              className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 mt-auto active:scale-95"
            >
              다음 단계로 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 3: 초기 자본금 설정 */}
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
            
            <button 
              onClick={() => setWizardStep(4)} 
              className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 mt-auto active:scale-95"
            >
              다음 단계로 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 4: 월급 리밸런싱 (월 투입 금액 설정) */}
        {wizardStep === 4 && (
          <div className="space-y-6 flex-1 pt-4 animate-in slide-in-from-right flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mt-4 leading-tight">새 목표에 맞춰<br/>월급 리밸런싱을 설정할까요?</h2>
            <p className="text-sm text-gray-500">기존에 설정하신 월급 자동 분배 비율에 새 목표를 추가하여 비중을 재조정합니다. (기준 급여: 300만원)</p>
            
            <div className="flex-1 overflow-y-auto space-y-4 pb-4 mt-4">
              {/* 새 목표 슬롯 */}
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

              {/* 기존 라우팅 셋업 */}
              {tempRoutingSetup.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between gap-4">
                   <div className="flex-1 truncate">
                     <p className="text-xs text-gray-400 font-bold mb-0.5">{availableAccounts.find(a=>a.id === item.accountId)?.name}</p>
                     <p className="text-sm font-bold text-gray-800 truncate">{item.tag}</p>
                   </div>
                   <div className="w-20 relative shrink-0">
                    <input 
                      type="number" min="0" max="100" 
                      value={item.percent} 
                      onChange={(e) => {
                        const newTemp = tempRoutingSetup.map(t => t.id === item.id ? {...t, percent: Number(e.target.value)} : t);
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

        {/* Step 6: AI 분석 완료 및 샌드박스 진입 */}
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
                setSelectedStock(ETF_CATALOG.find(e => e.id === 'market1')); 
                setActiveTab('sandbox'); 
              }}
              className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 mt-auto active:scale-95"
            >
              포트폴리오 설계하기 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSandbox = () => {
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
              <input type="range" min="0" max="80" value={loan} onChange={(e) => handleSliderChange('loan', Number(e.target.value))} className="w-full accent-yellow-500" />
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
            <input type="range" min="0" max="100" value={stock} onChange={(e) => handleSliderChange('stock', Number(e.target.value))} className="w-full accent-red-500" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2 px-1">
              <span className="font-bold text-blue-500">안전 자산 (채권)</span>
              <span className="font-bold">{bond}%</span>
            </div>
            <input type="range" min="0" max="100" value={bond} onChange={(e) => handleSliderChange('bond', Number(e.target.value))} className="w-full accent-blue-500" />
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
            <input type="range" min="0" max="100" value={cash} onChange={(e) => handleSliderChange('cash', Number(e.target.value))} className="w-full accent-green-500" />
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
        
        <button onClick={generateAiReport} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 mt-6 shadow-lg shadow-purple-200 transition-transform active:scale-95">
          ✨ Gemini AI 포트폴리오 심층 진단받기
        </button>

        <button onClick={() => setShowFinalConfirmModal(true)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-xl font-bold flex justify-center items-center gap-2 mt-3 transition active:scale-95">
          {editingGoalId ? "이대로 리밸런싱 확정하기" : "이 비율로 최종 확정하기"} <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>
    );
  };

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
          <div className="p-5 space-y-6">

            {/* 1. 포트폴리오 성장 차트 (항상 표시) */}
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
                
                {/* SVG 시뮬레이션 차트 */}
                <div className="relative h-44 w-full mt-6 -ml-2">
                  <svg viewBox="0 0 340 140" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="solidGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* 점선: 미래 예측 경로 */}
                    <path
                      d={displayGoals.length > 1 ? "M 100,90 Q 150,70 200,50 T 310,20" : "M 100,90 Q 190,65 280,40"}
                      fill="none" stroke="#6b7280" strokeWidth="2" strokeDasharray="4 4"
                    />

                    {/* 실선: 과거~현재 경로 */}
                    <path d="M 0,140 Q 50,115 100,90" fill="none" stroke="#3b82f6" strokeWidth="3" />
                    <path d="M 0,140 Q 50,115 100,90 L 100,140 Z" fill="url(#solidGrad)" />

                    {/* 현재 노드 */}
                    <circle cx="100" cy="90" r="5" fill="#3b82f6" className="animate-pulse" />
                    <circle cx="100" cy="90" r="2.5" fill="#ffffff" />
                    <text x="100" y="112" fill="#9ca3af" fontSize="11" textAnchor="middle" fontWeight="bold">현재</text>

                    {/* 1순위 목표 노드 */}
                    {displayGoals[0] && (
                      <>
                        <circle cx={displayGoals.length > 1 ? "200" : "280"} cy={displayGoals.length > 1 ? "50" : "40"} r="4" fill="#a855f7" />
                        <text x={displayGoals.length > 1 ? "200" : "280"} y={displayGoals.length > 1 ? "35" : "25"} fill="#d8b4fe" fontSize="11" textAnchor="middle" fontWeight="bold">
                          1순위 ({displayGoals[0].goalPeriod}년)
                        </text>
                      </>
                    )}

                    {/* 2순위 목표 노드 */}
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
                {/* 2. 다중 목표 달성률 (Progress Cards) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <h3 className="text-sm font-bold text-gray-800">진행 중인 포트폴리오</h3>
                  </div>
                  {displayGoals.map((g, idx) => {
                    const currentMockAsset = 12450;
                    const completionRate = Math.min(100, (currentMockAsset / g.goalAmount) * 100);

                    return (
                    <div key={g.id} className="relative rounded-3xl bg-gray-100 border border-gray-100 overflow-hidden shadow-sm">
                      
                      {/* 뒷배경: 수정/삭제 액션 버튼 */}
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

                      {/* 앞배경: 실제 카드 컨텐츠 (스와이프 시 이동) */}
                      <div 
                        className={`relative z-10 bg-white p-5 h-full transition-transform duration-300 flex flex-col ${revealedGoalId === g.id ? '-translate-x-[140px]' : 'translate-x-0'}`}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={(e) => handleTouchEnd(e, g.id)}
                      >
                        {/* 카드 좌측 컬러 띠 */}
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
                              style={{width: `${completionRate}%`}} 
                              className={`h-full rounded-full transition-all duration-700 ${idx === 0 ? 'bg-purple-500' : 'bg-orange-400'}`}
                            ></div>
                          </div>

                          <div className="flex flex-col text-xs mt-4 pt-3 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500 flex items-center gap-1 font-bold"><Wallet className="w-3 h-3"/> 초기 자본금</span>
                              <span className="text-gray-900 font-bold">
                                {g.initialFundingAccount?.name ? `${g.initialFundingAccount.name}에서 ` : '미지정, '} 
                                <span className="text-blue-600">{g.initialInvestment}만원</span>
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 flex items-center gap-1 font-bold"><RefreshCw className="w-3 h-3"/> 매월 월급 투입</span>
                              <span className="text-gray-900 font-bold">
                                월급의 <span className="text-blue-600">{g.goalRoutingPercent}%</span> ({g.monthlyContribution}만원)
                              </span>
                            </div>
                          </div>
                          
                          {/* 100% 달성 시 완료 버튼 노출 */}
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
                  )})}
                </div>

                {/* 3. 연동된 마이데이터 자산 */}
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
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    목표가 없네요!
                  </h3>
                  <p className="text-sm text-gray-500">AI 네비게이터가 최적의 포트폴리오를<br/>역산하여 설계해 드립니다.</p>
                </div>
                <button onClick={() => startWizard()} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold mt-4 transition shadow-md active:scale-95">
                  자산 설계 시작하기
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wizard' && renderWizard()}
        {activeTab === 'sandbox' && renderSandbox()}
      </main>

      {/* 하단 네비게이션 */}
      <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex justify-around p-3 pb-safe z-10">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 transition ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">홈 (대시보드)</span>
        </button>
        <button 
          onClick={() => { 
            if (!canCreateMore()) {
              setLimitMessage('목표는 최대 1개까지만 생성할 수 있습니다.');
              setShowLimitModal(true);
              return;
            }
            if (activeTab !== 'sandbox') startWizard(); 
          }} 
          className={`flex flex-col items-center p-2 transition ${activeTab !== 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'} ${!canCreateMore() ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
          <PieChart className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">자산 설계</span>
        </button>
      </nav>

      {/* 좌측 슬라이드 메뉴 (Drawer) */}
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
                            <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600">
                              {g.priority}순위
                            </span>
                            <Target className="w-4 h-4" />
                            <span className="text-sm font-bold truncate pr-2">{getGoalTitle(g.goalType)}</span>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-gray-700 mb-2">{g.goalPeriod}년 뒤 {formatAmount(g.goalAmount)}</p>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                          <div style={{width: `${completionRate}%`}} className="h-full bg-blue-500 rounded-full"></div>
                        </div>
                        <p className="text-[10px] text-gray-500 text-right font-medium">
                          {completionRate === 100 ? '✅ 달성 완료' : `${completionRate.toFixed(1)}% 달성 중`}
                        </p>
                      </div>
                    )})}
                    {canCreateMore() && (
                      <button 
                        onClick={() => { setIsDrawerOpen(false); startWizard(); }} 
                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:text-blue-600 hover:border-blue-300 transition flex items-center justify-center gap-1 bg-gray-50 hover:bg-blue-50 active:scale-95"
                      >
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

              {/* 월간 성과 리포트 및 계좌 관리 통합 */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">계좌 및 이체 관리</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setShowRoutingChoiceModal(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition group active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">월급 리밸런싱 설정</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                  </button>

                  <button 
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setShowTransferHistoryModal(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition group active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <History className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">월별 자동 송금 내역</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                  </button>
                </div>
              </section>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-between items-center">
              <button onClick={() => { setIsDrawerOpen(false); setAppState('welcome'); }} className="text-sm font-bold text-gray-400 hover:text-gray-600">
                로그아웃
              </button>
              <button onClick={() => setShowDeleteAccountModal(true)} className="text-xs font-medium text-red-400 hover:text-red-500 transition underline underline-offset-2">
                회원탈퇴
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달: 알림 내역 (종 모양 클릭 시) */}
      {showNotificationsModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 h-[80vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2"><Bell className="w-5 h-5"/> 알림</h3>
              <button onClick={() => setShowNotificationsModal(false)}><X className="text-gray-400 w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50">
              {notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left p-4 rounded-2xl border transition shadow-sm flex items-start gap-4 active:scale-95 ${notif.isRead ? 'bg-gray-100 border-gray-200 opacity-70' : 'bg-white border-blue-100'}`}
                >
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

      {/* 모달: 계좌 추가 연결 */}
      {showLinkNewAccountModal && (
        <div className="absolute inset-0 bg-black/60 z-[80] flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col shadow-2xl max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-xl text-gray-900">새로운 통장 연결</h3>
              <button onClick={() => setShowLinkNewAccountModal(false)}><X className="text-gray-400 w-6 h-6" /></button>
            </div>
            
            {linkModalStep === 'intro' && (
              <div className="p-6 space-y-5 text-center flex-1 overflow-y-auto">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                  <Link2 className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">아직 연결되지 않은<br/>계좌를 찾아올까요?</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  마이데이터를 통해 다른 금융기관에 흩어져 있는<br/>예적금 계좌를 한 번에 불러올 수 있습니다.
                </p>

                <button 
                  onClick={handleFindAccounts} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-md transition mt-4 active:scale-95 flex items-center justify-center gap-2"
                >
                  내 숨은 계좌 찾아보기
                </button>
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
                    <button
                      key={acc.id}
                      onClick={() => handleSelectDiscoveredAccount(acc)}
                      className="w-full text-left p-4 bg-white rounded-2xl border border-gray-200 hover:border-blue-500 shadow-sm transition group active:scale-95"
                    >
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

      {/* 모달: 현금성 자산 계좌 선택 및 개설 */}
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
                <button 
                  key={acc.id}
                  onClick={() => { setSelectedBank(acc); setShowBankModal(false); }} 
                  className={`w-full text-left bg-white border ${selectedBank?.id === acc.id ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'} p-5 rounded-2xl shadow-sm transition relative flex items-center justify-between active:scale-95`}
                >
                  <div className="flex-1 pr-4">
                    <div className="font-bold text-gray-900 text-sm mb-0.5">{acc.name}</div>
                    <div className="text-xs text-gray-500">{acc.type} 계좌</div>
                  </div>
                  {selectedBank?.id === acc.id ? (
                    <CheckCircle2 className="text-green-500 w-6 h-6 shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 shrink-0"></div>
                  )}
                </button>
              ))}
              <button 
                onClick={() => { setNewAccountContext('sandbox'); setShowNewAccountModal(true); }}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:text-blue-600 hover:border-blue-300 transition flex items-center justify-center gap-1 bg-gray-50 hover:bg-blue-50 mt-4 active:scale-95"
              >
                <Plus className="w-4 h-4" /> 새 통장 개설하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달: 월간 성과 리포트 상세 보기 */}
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

              {/* 1. 전체 시장 상황 */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5"><Globe className="w-4 h-4"/> 전체 시장 상황 요약</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  글로벌 증시는 AI 반도체 실적 호조로 주요 지수가 견고한 상승세를 보였습니다. 반면 국내 시장은 박스권 장세를 유지 중이며, 채권 시장은 향후 금리 인하 기대감이 선반영되어 금리가 점진적으로 하향 안정화되는 추세입니다.
                </p>
              </div>

              {/* 2. 보유 자산 현황 */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><PieChart className="w-4 h-4"/> 내 포트폴리오 자산 현황</h4>
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

              {/* 3. 다음 달 가이드라인 */}
              <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Lightbulb className="w-4 h-4"/> AI 다음 달 가이드라인</h4>
                <p className="text-sm text-indigo-900 leading-relaxed font-medium mb-4">
                  현재 포트폴리오의 위험 대비 수익률이 이상적인 궤도에 올랐습니다. 다음 달 투입 시, 최근 단기 상승폭이 컸던 주식 비중을 <strong className="text-red-500">-10%</strong> 줄이고 <strong className="text-blue-600 bg-blue-100 px-1 rounded">안전 자산(채권)</strong> 비중을 <strong className="text-blue-600">+10%</strong> 늘려 포트폴리오를 리밸런싱할 것을 추천합니다.
                </p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { if(displayGoals.length>0) handleEditPortfolio(displayGoals[0], true); else setShowAiReportModal(true); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition flex justify-center items-center gap-2 active:scale-95">
                    ✨ AI 추천 비율로 리밸런싱 적용
                  </button>
                  <button 
                    onClick={() => {
                      if(displayGoals.length>0) {
                        handleEditPortfolio(displayGoals[0], false);
                      } else {
                        setSelectedReport(null);
                        setAppState('account_setup');
                      }
                    }} 
                    className="w-full bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 py-3 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2 active:scale-95"
                  >
                    ⚖️ 내가 직접 비율/상품 수정하기
                  </button>
                </div>
              </div>

              {/* 4. 액션 내역 */}
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
              <button onClick={() => setSelectedReport(null)} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-md hover:bg-black transition active:scale-95">
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달: 월별 자동 이체 내역 */}
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
                  <button
                    onClick={() => setExpandedMonth(expandedMonth === item.month ? null : item.month)}
                    className="w-full p-5 flex items-center justify-between bg-white hover:bg-gray-50 transition"
                  >
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

      {/* 기타 기존 모달 (대출카탈로그, ETF카탈로그, AI진단, Kafka, 월급날 등) */}
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
                <input 
                  type="text" 
                  placeholder="대출 상품명을 검색해보세요" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-gray-50">
              <p className="text-xs text-gray-500 font-bold mb-2 px-1">부동산 자금 마련에 적합한 추천 상품</p>
              {filteredLoanCatalog.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">검색 결과가 없습니다.</div>
              ) : (
                filteredLoanCatalog.map((loanItem) => (
                  <button 
                    key={loanItem.id}
                    onClick={() => { setSelectedLoan(loanItem); setShowLoanCatalogModal(false); }} 
                    className={`w-full text-left bg-white border ${selectedLoan.id === loanItem.id ? 'border-yellow-500 ring-2 ring-yellow-100' : 'border-gray-200 hover:border-gray-300'} p-5 rounded-2xl shadow-sm transition relative flex items-center justify-between active:scale-95`}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${loanItem.bg} ${loanItem.color}`}>{loanItem.tag}</span>
                      </div>
                      <div className="font-bold text-gray-900 text-sm mb-0.5">{loanItem.name}</div>
                      <div className="text-xs text-gray-500">{loanItem.type}</div>
                    </div>
                    {selectedLoan.id === loanItem.id ? (
                      <CheckCircle2 className="text-yellow-500 w-6 h-6 shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-200 shrink-0"></div>
                    )}
                  </button>
                ))
              )}
            </div>
            <div className="p-4 bg-white border-t border-gray-200 shrink-0 flex items-start gap-2 text-gray-500">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                본 정보는 시뮬레이션 목적의 참고용 금리이며, 실제 개인의 신용도 및 소득에 따라 한도와 금리가 달라질 수 있습니다.
              </p>
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
                <input 
                  type="text" 
                  placeholder="ETF 이름이나 티커를 검색해보세요" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-purple-500"
                />
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
                  <button 
                    key={etf.id}
                    onClick={() => { setSelectedStock(etf); setShowCatalogModal(false); }} 
                    className={`w-full text-left bg-white border ${selectedStock.id === etf.id ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-200 hover:border-gray-300'} p-5 rounded-2xl shadow-sm transition relative flex items-center justify-between active:scale-95`}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        {catalogFilter === 'popular' && !searchQuery && <span className="font-bold text-gray-400 w-4">{idx + 1}</span>}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${etf.bg} ${etf.color}`}>{etf.tag}</span>
                      </div>
                      <div className="font-bold text-gray-900 text-sm mb-0.5">{etf.name}</div>
                      <div className="text-xs text-gray-500">{etf.type}</div>
                    </div>
                    {selectedStock.id === etf.id ? (
                      <CheckCircle2 className="text-purple-600 w-6 h-6 shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-200 shrink-0"></div>
                    )}
                  </button>
                ))
              )}
            </div>
            <div className="p-4 bg-white border-t border-gray-200 shrink-0 flex items-start gap-2 text-gray-500">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                본 목록은 고객의 투자 성향, 연령대 등의 통계적 알고리즘에 기반한 정보 제공 목적이며, 투자 권유나 자문을 의미하지 않습니다.
              </p>
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
              <button onClick={() => {setShowPaydayModal(false); setIsPaid(false);}}><X className="text-gray-400 w-6 h-6" /></button>
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

      {/* 목표 생성 제한 알림 모달 */}
      {showLimitModal && (
        <div className="absolute inset-0 bg-black/60 z-[70] flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">생성 한도 초과</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {limitMessage}
            </p>
            <button onClick={() => setShowLimitModal(false)} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold transition">
              확인
            </button>
          </div>
        </div>
      )}

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteAccountModal && (
        <div className="absolute inset-0 bg-black/70 z-[80] flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">정말 탈퇴하시겠습니까?</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              모든 자산 연결 정보와 설정된 목표 데이터가<br/>즉시 삭제되며 복구할 수 없습니다.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteAccountModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold transition active:scale-95">
                취소
              </button>
              <button onClick={handleDeleteAccount} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold transition shadow-md active:scale-95">
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 라우팅 재설정 초이스 모달 (마이페이지에서 접근) */}
      {showRoutingChoiceModal && (
        <div className="absolute inset-0 bg-black/70 z-[80] flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">월급 리밸런싱 설정</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              나만의 라이프스타일(추구미) 진단을 다시 진행하고 비율을 추천받을 수 있습니다.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowRoutingChoiceModal(false);
                  setRoutingFlowContext('edit');
                  setSurveyStep(0);
                  setSurveyAnswers([]);
                  setAppState('onboarding_survey');
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold transition shadow-md active:scale-95"
              >
                진단 다시 받고 추천 비율 적용
              </button>
              <button
                onClick={() => {
                  setShowRoutingChoiceModal(false);
                  setRoutingFlowContext('edit');
                  setAppState('account_setup');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold transition active:scale-95"
              >
                기존 비율에서 직접 수정하기
              </button>
            </div>
            <button onClick={() => setShowRoutingChoiceModal(false)} className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 underline underline-offset-2 p-2 transition">
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}