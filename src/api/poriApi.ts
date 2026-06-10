import { api } from './client';

interface CommonResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

// ── 분석 ──────────────────────────────────────────────────────

export interface AnalyzeResult {
  action: 'salary' | 'portfolio';
  reasoning: string;
  hasInvestmentFlows: boolean;
}

export async function analyzeGoal(userGoal: string): Promise<AnalyzeResult> {
  const res = await api.post<CommonResponse<AnalyzeResult>>('/consultant/analyze', { userGoal });
  return res.data;
}

// ── 제안 ──────────────────────────────────────────────────────

export interface SalaryAllocation {
  purpose: string;
  plannedAmount: number;
  ratio: number;
}

export interface PortfolioItem {
  assetType: string;
  ratio: number;
}

export interface FlowProductItem {
  productId: string;
  productName?: string;
  productRatio: number;
}

export interface FlowUpdate {
  flowId: string;
  flowTitle?: string;
  amount?: number;
  products: FlowProductItem[];
}

export interface ProposeResult {
  summary: string;
  explanation: string;
  salaryAllocations: SalaryAllocation[];
  portfolio: PortfolioItem[];
  flows: FlowUpdate[];
}

export async function proposeReset(userGoal: string, action: 'salary' | 'portfolio'): Promise<ProposeResult> {
  const res = await api.post<CommonResponse<ProposeResult>>('/consultant/propose', { userGoal, action });
  return res.data;
}

// ── 적용 ──────────────────────────────────────────────────────

export interface ApplyRequest {
  action: 'salary' | 'portfolio';
  salaryAllocations?: SalaryAllocation[];
  portfolio?: PortfolioItem[];
  flows?: FlowUpdate[];
}

export async function applyProposal(request: ApplyRequest): Promise<void> {
  await api.post<CommonResponse<null>>('/consultant/apply', request);
}
