import { api } from './client';
import type { CommonResponse } from './userApi';

export interface AssetSnapshot {
  snapshotDate: string;
  totalAmount: number;
}

export interface WeeklyExpense {
  week: number;
  currCumulative: number;
  prevCumulative: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  prevAmount: number;
  ratio: number;
  hoverComment: string;
}

export interface PortfolioBreakdownItem {
  productName: string;
  productType: string;
  ticker: string;
  monthlyChangeRate: number;
}

export interface TaxBenefitSummary {
  irpContribution: number;
  irpCumulativeDeduction: number;
  pensionContribution: number;
  pensionCumulativeDeduction: number;
  totalTaxSavings: number;
}

export interface MiniChallenge {
  title: string;
  challengeSubType: string;
  startedAt: string;
  completedAt: string | null;
  status: string;
  rewardStockTicker: string | null;
}

export interface MonthlyReportData {
  id: string;
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  surplus: number;
  trendComment: string;
  eventComment: string;
  marketCondition: string;
  guideline: string;
  assetChangeRate: number;
  assetSnapshots: AssetSnapshot[];
  weeklyExpenses: WeeklyExpense[];
  categoryExpenses: CategoryExpense[];
  portfolioBreakdown: PortfolioBreakdownItem[];
  taxBenefitSummary: TaxBenefitSummary;
  miniChallenges: MiniChallenge[];
  createdAt: string;
}

export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReportData> {
  const res = await api.get<CommonResponse>(`/reports/${year}/${month}`);
  if (!res.success) {
    throw new Error(res.message || '리포트 조회 중 오류가 발생했습니다.');
  }
  return res.data as MonthlyReportData;
}
