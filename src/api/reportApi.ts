import { api } from './client';

interface CommonResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export interface ReportSummary {
  id: string;
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  surplus: number;
  createdAt: string;
}

export interface AssetSnapshot {
  snapshotDate: string;
  totalAmount: number;
}

export interface WeeklyExpense {
  week: number;
  currCumulative: number;
  prevCumulative: number;
}

export interface CategoryExpenseItem {
  category: string;
  amount: number;
  prevAmount: number | null;
  ratio: number;
  hoverComment: string | null;
}

export interface ReportDetail extends ReportSummary {
  trendComment: string | null;
  eventComment: string | null;
  marketCondition: string | null;
  guideline: string | null;
  performanceStatus: string | null;
  performanceComment: string | null;
  goalProgress: number;
  assetSnapshots: AssetSnapshot[];
  weeklyExpenses: WeeklyExpense[];
  categoryExpenses: CategoryExpenseItem[];
}

/**
 * GET /reports — 리포트 목록 조회
 */
export async function getReports(): Promise<ReportSummary[]> {
  const res = await api.get<CommonResponse<{ reports: ReportSummary[]; totalCount: number }>>('/reports');
  if (!res.success) throw new Error(res.message || '리포트 목록 조회 실패');
  return res.data.reports;
}

/**
 * GET /reports/{year}/{month} — 특정 월 리포트 조회
 */
export async function getReport(year: number, month: number): Promise<ReportDetail> {
  const res = await api.get<CommonResponse<ReportDetail>>(`/reports/${year}/${month}`);
  if (!res.success) throw new Error(res.message || '리포트 조회 실패');
  return res.data;
}

/**
 * POST /reports/generate/{year}/{month} — 리포트 생성 (AI 서버 호출)
 */
export async function generateReport(year: number, month: number): Promise<ReportDetail> {
  const res = await api.post<CommonResponse<ReportDetail>>(`/reports/generate/${year}/${month}`);
  if (!res.success) throw new Error(res.message || '리포트 생성 실패');
  return res.data;
}
