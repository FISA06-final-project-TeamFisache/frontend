import { api } from './client';

interface CommonResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

// ─── 새 응답 구조 (백엔드 리뉴얼 버전) ─────────────────────────────

// GET /transfer-plans portfolioItems (지출 계획 항목)
export interface PortfolioItem {
  planId: string | null;   // 생활비(출발 계좌) 표시 전용 항목은 null
  assetId: string;
  institution: string | null;
  accountName: string | null;     // 통장 이름 — 좌측 표시
  accountPurpose: string | null;  // 통장 별명/용도 "생활비/비상금/적금" — 태그 표시
  assetType: string;
  plannedAmount: number;
  baselineAmount: number;   // 기준 금액 (Case1 표시용)
  diff: number;             // 차액 (Case2 표시용)
  isConfirmed: boolean;
}

// GET /transfer-plans flowItems (투자 계획 항목, portfolio_flows 기반)
export interface FlowItem {
  planId: string;
  assetId: string;
  institution: string | null;
  productType: string | null;
  plannedAmount: number;
  baselineAmount: number;
  diff: number;
  isConfirmed: boolean;
}

export interface TransferPlanResponse {
  currentSalary: number | null;
  salaryDiff: number | null;
  portfolioTotal: number;
  portfolioTotalDiff: number | null;
  portfolioItems: PortfolioItem[];  // 지출/저축 계획 (CASH/DEPOSIT/EMERGENCY)
  flowTotal: number;
  flowTotalDiff: number | null;
  flowItems: FlowItem[];            // 투자 계획 (portfolio_flows 기반)
  remaining: number;
  remainingDiff: number | null;
}

/**
 * GET /transfer-plans?year=&month=
 */
export async function getTransferPlans(year: number, month: number): Promise<TransferPlanResponse> {
  const response = await api.get<CommonResponse<TransferPlanResponse>>(`/transfer-plans?year=${year}&month=${month}`);
  if (!response.success) throw new Error(response.message || '이체 계획 조회 실패');
  return response.data;
}

/**
 * POST /transfer-plans/generate — 이번 달 이체 계획 생성 (없을 때 자동 채움용)
 *   응답 구조는 GET 과 다르므로, 생성 후 getTransferPlans 로 다시 조회해 사용한다.
 */
export async function generateTransferPlans(): Promise<void> {
  const response = await api.post<CommonResponse>('/transfer-plans/generate', {});
  if (!response.success) throw new Error(response.message || '이체 계획 생성 실패');
}

/**
 * PATCH /transfer-plans?year=&month=
 * assetId + 금액 쌍 리스트로 해당 월 이체 계획을 일괄 수정
 */
export async function updateTransferPlans(
  year: number,
  month: number,
  items: { assetId: string; amount: number }[],
): Promise<void> {
  const response = await api.patch<CommonResponse<null>>(
    `/transfer-plans?year=${year}&month=${month}`,
    items,
  );
  if (!response.success) throw new Error(response.message || '이체 계획 수정 실패');
}

/**
 * POST /transfer-plans/confirm-all?year=&month=
 */
export async function confirmAllPlans(year: number, month: number): Promise<void> {
  const response = await api.post<CommonResponse<null>>(`/transfer-plans/confirm-all?year=${year}&month=${month}`, {});
  if (!response.success) throw new Error(response.message || '이체 계획 확정 실패');
}
