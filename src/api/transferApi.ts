import { api } from './client';

interface CommonResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export interface TransferPlan {
  id: string;
  assetId: string;
  institution: string;
  assetType: string;
  plannedAmount: number;
  ratio: number | null;
  isConfirmed: boolean;
  scheduledDate: number;
  year: number;
  month: number;
}

export interface TransferPlanList {
  plans: TransferPlan[];
  totalAmount: number;
  salaryAmount: number | null;
}

export interface TransferExecution {
  id: string;
  fromInstitution: string;
  toInstitution: string;
  purpose: string;
  amount: number;
  status: string;
  executedAt: string;
}

export interface TransferExecutionList {
  executions: TransferExecution[];
  totalCount: number;
  totalAmount: number;
}

export interface ConfirmResult {
  successCount: number;
  failCount: number;
  totalCount: number;
}

/**
 * GET /transfer-plans?year={year}&month={month}
 */
export async function getTransferPlans(year: number, month: number): Promise<TransferPlanList> {
  const res = await api.get<CommonResponse<TransferPlanList>>(`/transfer-plans?year=${year}&month=${month}`);
  if (!res.success) throw new Error(res.message || '이체 계획 조회 실패');
  return res.data;
}

/**
 * PATCH /transfer-plans/{id} — 이체 계획 금액 수정
 */
export async function updateTransferPlan(id: string, plannedAmount: number): Promise<void> {
  const res = await api.patch<CommonResponse>(`/transfer-plans/${id}`, { plannedAmount });
  if (!res.success) throw new Error(res.message || '이체 계획 수정 실패');
}

/**
 * POST /transfer-plans/confirm-all — 전체 이체 확정
 */
export async function confirmAllPlans(year: number, month: number): Promise<ConfirmResult> {
  const res = await api.post<CommonResponse<ConfirmResult>>('/transfer-plans/confirm-all', { year, month });
  if (!res.success) throw new Error(res.message || '이체 실행 실패');
  return res.data;
}

/**
 * PATCH /transfer-plans/scheduled-date — 이체 예정일 변경
 */
export async function updateScheduledDate(scheduledDate: number): Promise<void> {
  const res = await api.patch<CommonResponse>('/transfer-plans/scheduled-date', { scheduledDate });
  if (!res.success) throw new Error(res.message || '이체 예정일 수정 실패');
}

/**
 * GET /transfer-executions — 이체 실행 내역 조회
 */
export async function getTransferExecutions(year: number, month: number): Promise<TransferExecutionList> {
  const res = await api.get<CommonResponse<TransferExecutionList>>(`/transfer-executions?year=${year}&month=${month}`);
  if (!res.success) throw new Error(res.message || '이체 내역 조회 실패');
  return res.data;
}
