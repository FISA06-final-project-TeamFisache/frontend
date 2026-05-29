import { api } from './client';

interface CommonResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export interface CategoryExpenseItem {
  name: string;
  amount: number;
  ratio: number;
}

export interface FixedExpenseItem {
  name: string;
  amount: number;
}

export interface InvestTendency {
  safeRatio: number;
  riskRatio: number;
  safeAssets: string;
  riskAssets: string;
}

export interface SavingsItem {
  type: string;
  amount: number;
  ratio: number;
}

export interface AgentProfile {
  portiType: string;
  portiTypeName: string;
  portiDescription: string;
  monthlyAvgExpense: number;
  categoryExpense: CategoryExpenseItem[];
  fixedExpense: FixedExpenseItem[];
  totalFixedExpense: number;
  investTendency: InvestTendency;
  savingsList: SavingsItem[];
  expenseComment: string;
  investComment: string;
  savingsComment: string;
}

/**
 * POST /agent/profile
 * porTI 설문 답변 전송 → 유형 계산·저장 + AI 진단 리포트 생성
 * @param answers 10개 문항 답변 배열 (e.g. ["A","B","A",...])
 */
export async function generateAgentProfile(answers: string[]): Promise<AgentProfile> {
  const response = await api.post<CommonResponse<AgentProfile>>('/agent/profile', { answers });
  if (!response.success) throw new Error(response.message || 'AI 진단 리포트 생성 중 오류가 발생했습니다.');
  return response.data;
}

export interface RebalancingPlan {
  assetId: string;
  institution: string;
  assetType: string;
  assetNumber: string;
  amount: number;
  nickname: string;
}

export interface AgentRecommend {
  salary: number;
  investAmount: number;
  totalFixedExpense: number;
  fixedExpenseComment: string;
  rebalancingPlans: RebalancingPlan[];
  remainingAmount: number;
}

/**
 * POST /agent/rebalance
 * 월급 리밸런싱 추천 (요청 바디 없음)
 */
export async function getAgentRecommend(): Promise<AgentRecommend> {
  const response = await api.post<CommonResponse<AgentRecommend>>('/agent/rebalance', {});
  if (!response.success) throw new Error(response.message || '리밸런싱 추천 중 오류가 발생했습니다.');
  return response.data;
}

/**
 * POST /agent/prescriptions
 * PrescriptionComplete 화면 진입 시 호출 — FastAPI /asset-portfolio 로
 * AI 포트폴리오를 생성받아 백엔드 DB(portfolio_flows + items)에 저장
 */
export async function generatePrescriptions(): Promise<void> {
  const response = await api.post<CommonResponse>('/agent/prescriptions', {});
  if (!response.success) {
    throw new Error(response.message || 'AI 포트폴리오 생성 중 오류가 발생했습니다.');
  }
}
