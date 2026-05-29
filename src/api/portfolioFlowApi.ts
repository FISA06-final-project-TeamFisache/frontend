import { api } from './client';
import type { CommonResponse } from './userApi';

export interface PortfolioFlowGatheringAsset {
  id: string;
  institution: string | null;
  accountName: string | null;
  assetNumber: string | null;
  assetType: string | null;   // CHECKING / PARKING / IRP / ISA / STOCK ...
  balance: number | null;
}

export interface PortfolioFlowSourceItem {
  id: string;
  amount: number | null;       // 원 단위
  assetId: string | null;
  institution: string | null;
  accountName: string | null;
  assetNumber: string | null;
  assetType: string | null;
}

export interface PortfolioFlowProductItem {
  id: string;
  productRatio: number | null;  // %
  productType: string | null;   // STOCK / BOND / DEPOSIT / SAVING / IRP
  productId: string | null;
  productName: string | null;
  productInstitution: string | null;
  interestRate: number | null;
}

export interface PortfolioFlow {
  id: string;
  eventId: string | null;       // null = 기본 흐름
  title: string;
  summary: string | null;
  term: string | null;          // '단' / '중' / '장'
  amount: number | null;        // 모을 통장 월 납입 금액 (원)
  isActive: boolean;
  gatheringAsset: PortfolioFlowGatheringAsset | null;
  sources: PortfolioFlowSourceItem[];
  products: PortfolioFlowProductItem[];
}

export interface PortfolioFlowListResponse {
  monthlyInvestAmount: number | null;   // users.monthly_invest_amount — 월 총 투자액 (원)
  flows: PortfolioFlow[];
}

/**
 * GET /portfolio-flows — 사용자의 전체 포트폴리오 흐름 (기본 + 이벤트)
 */
export async function getPortfolioFlows(): Promise<PortfolioFlowListResponse> {
  const res = await api.get<CommonResponse>('/portfolio-flows');
  if (!res.success) {
    throw new Error(res.message || '포트폴리오 흐름 조회 중 오류가 발생했습니다.');
  }
  return res.data as PortfolioFlowListResponse;
}

export interface AvailableAsset {
  id: string;
  institution: string | null;
  accountName: string | null;
  assetNumber: string | null;
  assetType: string | null;
  balance: number | null;
}

export interface AvailableAssetListResponse {
  assets: AvailableAsset[];
}

/**
 * GET /portfolio-flows/available-assets — 끌어오기/모으기 통장 후보
 *   카드/soft-delete 만 제외 — 중복 제거는 클라이언트에서
 */
export async function getAvailableAssets(): Promise<AvailableAssetListResponse> {
  const res = await api.get<CommonResponse>('/portfolio-flows/available-assets');
  if (!res.success) {
    throw new Error(res.message || '사용 가능한 통장 조회 중 오류가 발생했습니다.');
  }
  return res.data as AvailableAssetListResponse;
}

export interface PortfolioFlowUpdateRequest {
  gatheringAssetId?: string | null;
  sources: Array<{ assetId: string; amount: number }>;          // amount = 원 단위
  products: Array<{
    productId?: string | null;
    productType: string;
    productRatio: number;
    assetId?: string | null;
  }>;
}

/**
 * PATCH /portfolio-flows/{flowId} — 흐름 일괄 수정
 *   gathering + items(PULL/PUT) 전체 교체. 응답은 갱신된 FlowDto
 */
export async function updatePortfolioFlow(
  flowId: string,
  request: PortfolioFlowUpdateRequest,
): Promise<PortfolioFlow> {
  const res = await api.patch<CommonResponse>(`/portfolio-flows/${flowId}`, request);
  if (!res.success) {
    throw new Error(res.message || '흐름 수정 중 오류가 발생했습니다.');
  }
  return res.data as PortfolioFlow;
}
