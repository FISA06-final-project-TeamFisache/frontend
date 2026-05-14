import { createContext, useContext, useState, type ReactNode } from 'react';
import { ETF_CATALOG, LOAN_CATALOG } from '../data/mockData';

export type Account = { id: string; name: string; type: string };
export type ETF = { id: string; category: string; name: string; type: string; tag: string; color: string; bg: string; returnRate: number; mddRisk: number; rank: number };
export type Loan = { id: string; category: string; name: string; type: string; tag: string; color: string; bg: string; interestRate: number; rank: number };
export type RoutingItem = { id: number | string; accountId: string; tag: string; percent: number };

type WizardContextValue = {
  // 목표 정보
  goal: string;
  setGoal: (g: string) => void;
  goalAmount: number;
  setGoalAmount: (v: number) => void;
  goalPeriod: number;
  setGoalPeriod: (v: number) => void;

  // 자금 설정
  initialInvestment: number;
  setInitialInvestment: (v: number) => void;
  initialFundingAccount: Account | null;
  setInitialFundingAccount: (acc: Account) => void;
  goalRoutingPercent: number;
  setGoalRoutingPercent: (v: number) => void;
  tempRoutingSetup: RoutingItem[];
  setTempRoutingSetup: (s: RoutingItem[]) => void;
  monthlyContribution: number;
  setMonthlyContribution: (v: number) => void;

  // 포트폴리오 비율
  stock: number;
  setStock: (v: number) => void;
  bond: number;
  setBond: (v: number) => void;
  cash: number;
  setCash: (v: number) => void;
  loan: number;
  setLoan: (v: number) => void;

  // 선택된 상품
  selectedStock: ETF;
  setSelectedStock: (e: ETF) => void;
  selectedLoan: Loan;
  setSelectedLoan: (l: Loan) => void;
  selectedBank: Account | null;
  setSelectedBank: (a: Account) => void;

  // 편집 모드
  editingGoalId: number | null;
  setEditingGoalId: (id: number | null) => void;

  // 위저드 초기화 (Prompt에서 시작 시 호출)
  resetWizard: () => void;
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [goal, setGoal] = useState('');
  const [goalAmount, setGoalAmount] = useState(10000);
  const [goalPeriod, setGoalPeriod] = useState(4);

  const [initialInvestment, setInitialInvestment] = useState(0);
  const [initialFundingAccount, setInitialFundingAccount] = useState<Account | null>(null);
  const [goalRoutingPercent, setGoalRoutingPercent] = useState(0);
  const [tempRoutingSetup, setTempRoutingSetup] = useState<RoutingItem[]>([]);
  const [monthlyContribution, setMonthlyContribution] = useState(0);

  const [stock, setStock] = useState(40);
  const [bond, setBond] = useState(40);
  const [cash, setCash] = useState(20);
  const [loan, setLoan] = useState(0);

  const [selectedStock, setSelectedStock] = useState<ETF>(ETF_CATALOG[4]);
  const [selectedLoan, setSelectedLoan] = useState<Loan>(LOAN_CATALOG[0]);
  const [selectedBank, setSelectedBank] = useState<Account | null>(null);

  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);

  const resetWizard = () => {
    setGoal('');
    setGoalAmount(10000);
    setGoalPeriod(4);
    setInitialInvestment(0);
    setInitialFundingAccount(null);
    setGoalRoutingPercent(0);
    setMonthlyContribution(0);
    setStock(40); setBond(40); setCash(20); setLoan(0);
    setSelectedStock(ETF_CATALOG[4]);
    setSelectedLoan(LOAN_CATALOG[0]);
    setSelectedBank(null);
    setEditingGoalId(null);
  };

  return (
    <WizardContext.Provider
      value={{
        goal, setGoal, goalAmount, setGoalAmount, goalPeriod, setGoalPeriod,
        initialInvestment, setInitialInvestment, initialFundingAccount, setInitialFundingAccount,
        goalRoutingPercent, setGoalRoutingPercent, tempRoutingSetup, setTempRoutingSetup,
        monthlyContribution, setMonthlyContribution,
        stock, setStock, bond, setBond, cash, setCash, loan, setLoan,
        selectedStock, setSelectedStock, selectedLoan, setSelectedLoan, selectedBank, setSelectedBank,
        editingGoalId, setEditingGoalId,
        resetWizard,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard는 WizardProvider 안에서만 사용 가능');
  return ctx;
}
