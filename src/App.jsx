import React, { useState } from 'react';
import Welcome from './screens/Welcome';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Linking from './screens/Linking';
import SalarySelect from './screens/SalarySelect';
import OnboardingSurvey from './screens/OnboardingSurvey';
import AccountSetup from './screens/AccountSetup';
import Prompt from './screens/Prompt';
import Main from './screens/Main';
import { formatAmount, getGoalTitle } from './utils/helpers';
import { ETF_CATALOG, LOAN_CATALOG } from './data/mockData';


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
  
  // Temporary Wizard/Simulator Data States
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
    if (activeTab === 'simulator') {
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
    setActiveTab('simulator');
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
    } else if (newAccountContext === 'simulator') {
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
    return <Welcome setAppState={setAppState} />;
  }

  if (appState === 'login') {
    return <Login loginData={loginData} setLoginData={setLoginData} setAppState={setAppState} />;
  }

  if (appState === 'signup') {
    return <Signup signupData={signupData} setSignupData={setSignupData} setAppState={setAppState} />;
  }

  if (appState === 'linking') {
    return <Linking isLinking={isLinking} onLinkAccounts={handleLinkAccounts} />;
  }

  if (appState === 'salary_select') {
    return (
      <SalarySelect
        salaryAccount={salaryAccount}
        setSalaryAccount={setSalaryAccount}
        showWooriNudge={showWooriNudge}
        setShowWooriNudge={setShowWooriNudge}
        showTransferDateModal={showTransferDateModal}
        setShowTransferDateModal={setShowTransferDateModal}
        showReadOnlyWarningModal={showReadOnlyWarningModal}
        setShowReadOnlyWarningModal={setShowReadOnlyWarningModal}
        transferDate={transferDate}
        setTransferDate={setTransferDate}
        isTransferSetting={isTransferSetting}
        onWooriConfirm={handleWooriAutoTransferConfirm}
        setAppState={setAppState}
      />
    );
  }
  if (appState === 'onboarding_survey') {
    return (
      <OnboardingSurvey
        surveyStep={surveyStep}
        surveyAnswers={surveyAnswers}
        routingFlowContext={routingFlowContext}
        availableAccounts={availableAccounts}
        onSurveyAnswer={handleSurveyAnswer}
        setRoutingSetup={setRoutingSetup}
        setAppState={setAppState}
        setRoutingFlowContext={setRoutingFlowContext}
      />
    );
  }
  if (appState === 'account_setup') {
    return (
      <AccountSetup
        routingSetup={routingSetup}
        setRoutingSetup={setRoutingSetup}
        availableAccounts={availableAccounts}
        routingFlowContext={routingFlowContext}
        setRoutingFlowContext={setRoutingFlowContext}
        showNewAccountModal={showNewAccountModal}
        setShowNewAccountModal={setShowNewAccountModal}
        createFxAccount={createFxAccount}
        setCreateFxAccount={setCreateFxAccount}
        setTargetRoutingId={setTargetRoutingId}
        setNewAccountContext={setNewAccountContext}
        onCreateNewAccount={handleCreateNewAccount}
        setAppState={setAppState}
      />
    );
  }
  if (appState === 'prompt') {
    return (
      <Prompt
        userName={signupData.name}
        setAppState={setAppState}
        startWizard={startWizard}
        setActiveTab={setActiveTab}
      />
    );
  }
  return (
    <Main
      signupData={signupData}
      goals={goals}
      activeGoalId={activeGoalId}
      setActiveGoalId={setActiveGoalId}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isDrawerOpen={isDrawerOpen}
      setIsDrawerOpen={setIsDrawerOpen}
      notifications={notifications}
      setNotifications={setNotifications}
      showNotificationsModal={showNotificationsModal}
      setShowNotificationsModal={setShowNotificationsModal}
      wizardStep={wizardStep}
      setWizardStep={setWizardStep}
      goal={goal}
      setGoal={setGoal}
      goalAmount={goalAmount}
      setGoalAmount={setGoalAmount}
      goalPeriod={goalPeriod}
      setGoalPeriod={setGoalPeriod}
      initialInvestment={initialInvestment}
      setInitialInvestment={setInitialInvestment}
      initialFundingAccount={initialFundingAccount}
      setInitialFundingAccount={setInitialFundingAccount}
      goalRoutingPercent={goalRoutingPercent}
      setGoalRoutingPercent={setGoalRoutingPercent}
      tempRoutingSetup={tempRoutingSetup}
      setTempRoutingSetup={setTempRoutingSetup}
      monthlyContribution={monthlyContribution}
      setMonthlyContribution={setMonthlyContribution}
      stock={stock}
      bond={bond}
      cash={cash}
      loan={loan}
      selectedStock={selectedStock}
      setSelectedStock={setSelectedStock}
      selectedLoan={selectedLoan}
      setSelectedLoan={setSelectedLoan}
      selectedBank={selectedBank}
      setSelectedBank={setSelectedBank}
      editingGoalId={editingGoalId}
      availableAccounts={availableAccounts}
      setAvailableAccounts={setAvailableAccounts}
      routingSetup={routingSetup}
      setRoutingSetup={setRoutingSetup}
      revealedGoalId={revealedGoalId}
      setRevealedGoalId={setRevealedGoalId}
      handleTouchStart={handleTouchStart}
      handleTouchMove={handleTouchMove}
      handleTouchEnd={handleTouchEnd}
      showKafkaModal={showKafkaModal}
      setShowKafkaModal={setShowKafkaModal}
      showPaydayModal={showPaydayModal}
      setShowPaydayModal={setShowPaydayModal}
      isPaid={isPaid}
      setIsPaid={setIsPaid}
      paydayType={paydayType}
      showFinalConfirmModal={showFinalConfirmModal}
      setShowFinalConfirmModal={setShowFinalConfirmModal}
      showCatalogModal={showCatalogModal}
      setShowCatalogModal={setShowCatalogModal}
      showLoanCatalogModal={showLoanCatalogModal}
      setShowLoanCatalogModal={setShowLoanCatalogModal}
      showBankModal={showBankModal}
      setShowBankModal={setShowBankModal}
      catalogFilter={catalogFilter}
      setCatalogFilter={setCatalogFilter}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      showAiReportModal={showAiReportModal}
      setShowAiReportModal={setShowAiReportModal}
      aiReport={aiReport}
      isGenerating={isGenerating}
      showLimitModal={showLimitModal}
      setShowLimitModal={setShowLimitModal}
      limitMessage={limitMessage}
      showDeleteAccountModal={showDeleteAccountModal}
      setShowDeleteAccountModal={setShowDeleteAccountModal}
      showTransferHistoryModal={showTransferHistoryModal}
      setShowTransferHistoryModal={setShowTransferHistoryModal}
      expandedMonth={expandedMonth}
      setExpandedMonth={setExpandedMonth}
      showLinkNewAccountModal={showLinkNewAccountModal}
      setShowLinkNewAccountModal={setShowLinkNewAccountModal}
      linkModalStep={linkModalStep}
      setLinkModalStep={setLinkModalStep}
      showRoutingChoiceModal={showRoutingChoiceModal}
      setShowRoutingChoiceModal={setShowRoutingChoiceModal}
      showNewAccountModal={showNewAccountModal}
      setShowNewAccountModal={setShowNewAccountModal}
      createFxAccount={createFxAccount}
      setCreateFxAccount={setCreateFxAccount}
      newAccountContext={newAccountContext}
      setNewAccountContext={setNewAccountContext}
      targetRoutingId={targetRoutingId}
      setTargetRoutingId={setTargetRoutingId}
      selectedReport={selectedReport}
      setSelectedReport={setSelectedReport}
      setSurveyStep={setSurveyStep}
      setSurveyAnswers={setSurveyAnswers}
      setAppState={setAppState}
      setRoutingFlowContext={setRoutingFlowContext}
      startWizard={startWizard}
      handleGoBack={handleGoBack}
      handleFinalConfirm={handleFinalConfirm}
      handleEditPortfolio={handleEditPortfolio}
      handleFullEditGoal={handleFullEditGoal}
      handleDeleteGoal={handleDeleteGoal}
      handleCompleteGoal={handleCompleteGoal}
      handleDeleteAccount={handleDeleteAccount}
      onSliderChange={handleSliderChange}
      generateAiReport={generateAiReport}
      handleNotificationClick={handleNotificationClick}
      handleFindAccounts={handleFindAccounts}
      handleSelectDiscoveredAccount={handleSelectDiscoveredAccount}
      handleCreateNewAccount={handleCreateNewAccount}
      canCreateMore={canCreateMore}
      getPaydayAccounts={getPaydayAccounts}
    />
  );
}