import { api } from './client';

interface CommonResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export interface AgentProfile {
  portiType: string;
  portiTypeName: string;
  portiDescription: string;
  monthlyAvgExpense: number;
  categoryExpense: { name: string; amount: number; ratio: number }[];
  fixedExpense: { name: string; amount: number }[];
  totalFixedExpense: number;
  investTendency: { safeRatio: number; riskRatio: number; safeAssets: string; riskAssets: string };
  savingsList: { type: string; amount: number; ratio: number }[];
  expenseComment: string;
  investComment: string;
  savingsComment: string;
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

export interface PrescriptionFlow {
  flowId: string;
  flowName: string;
  flowBadge: string | null;
  monthlyAmount: number;
  expectedReturnRate: number;
  targetYears: number;
  expectedFutureValue: number;
  agentComment: string;
  steps: {
    pull: { institutionName: string; institutionCode: string; amount: number }[];
    gather: { institutionName: string; productName: string; description: string; isNewAccount: boolean } | null;
    invest: { productId: string; productType: string; productName: string; ratio: number; amount: number }[];
  };
}

export interface AgentPrescriptions {
  summary: { totalMonthlyInvestment: number; averageExpectedReturnRate: number };
  flows: PrescriptionFlow[];
  availableProducts: { productId: string; productType: string; institution: string; productName: string; expectedReturnRate: number }[];
}

/**
 * POST /agent/profile — porTI 설문 + AI 진단 리포트 생성
 */
export async function generateAgentProfile(answers: string[]): Promise<AgentProfile> {
  const res = await api.post<CommonResponse<AgentProfile>>('/agent/profile', { answers });
  if (!res.success) throw new Error(res.message || 'AI 진단 리포트 생성 중 오류가 발생했습니다.');
  return res.data;
}

/**
 * POST /agent/rebalance — 월급 리밸런싱 추천
 */
export async function generateRecommend(): Promise<AgentRecommend> {
  const res = await api.post<CommonResponse<AgentRecommend>>('/agent/rebalance');
  if (!res.success) throw new Error(res.message || '월급 리밸런싱 추천 중 오류가 발생했습니다.');
  return res.data;
}

/**
 * PATCH /portfolios — 월급 배분 계좌 저장 (대시보드 월급 차트용)
 */
export async function savePortfolioAllocations(
  monthlyInvestAmount: number,
  salary: number,
  accounts: Array<{ tag: string; amount: number; assetId?: string }>,
): Promise<void> {
  const tagToCategory = (tag: string): string => {
    if (['생활비', '고정지출', '식비'].some(t => tag.includes(t))) return 'FIXED';
    if (['비상금', '긴급'].some(t => tag.includes(t))) return 'EMERGENCY';
    if (['주식', 'ETF'].some(t => tag.includes(t))) return 'STOCK';
    if (['IRP', '연금'].some(t => tag.includes(t))) return 'IRP';
    return 'CASH';
  };
  const portfolios = accounts.map(a => ({
    assetType: tagToCategory(a.tag),
    assetAmount: a.amount,
    accountPurpose: a.tag,
    ...(a.assetId ? { assetId: a.assetId } : {}),
  }));
  await api.patch<CommonResponse>('/portfolios', { monthlyInvestAmount, salary, portfolios });
}

/**
 * POST /agent/prescriptions — AI 투자 처방전 생성
 */
export async function generatePrescriptions(monthlyInvestAmount?: number): Promise<void> {
  const body = monthlyInvestAmount != null ? { monthlyInvestAmount } : undefined;
  const res = await api.post<CommonResponse<void>>('/agent/prescriptions', body);
  if (!res.success) throw new Error(res.message || '포트폴리오 처방 생성 중 오류가 발생했습니다.');
}

/**
 * POST /agent/event/prescriptions — 이벤트 기반 AI 처방전 생성
 */
export async function generateEventPrescriptions(): Promise<AgentPrescriptions> {
  const res = await api.post<CommonResponse<AgentPrescriptions>>('/agent/event/prescriptions');
  if (!res.success) throw new Error(res.message || '이벤트 포트폴리오 처방 생성 중 오류가 발생했습니다.');
  return res.data;
}
