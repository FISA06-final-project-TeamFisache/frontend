import { api } from './client';

interface CommonResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PortfolioFlowGatheringAsset {
  id: string;
  institution: string | null;
  accountName: string | null;
  assetNumber: string | null;
  assetType: string | null;
  balance: number | null;
}

export interface PortfolioFlowSourceItem {
  id: string;
  amount: number | null;
  assetId: string | null;
  institution: string | null;
  accountName: string | null;
  assetNumber: string | null;
  assetType: string | null;
}

export interface PortfolioFlowProductItem {
  id: string;
  productRatio: number | null;
  productType: string | null;
  productId: string | null;
  productName: string | null;
  productInstitution: string | null;
  interestRate: number | null;
}

export interface PortfolioFlow {
  id: string;
  eventId: string | null;
  title: string;
  summary: string | null;
  term: string | null;
  amount: number | null;
  isActive: boolean;
  gatheringAsset: PortfolioFlowGatheringAsset | null;
  sources: PortfolioFlowSourceItem[];
  products: PortfolioFlowProductItem[];
}

export interface PortfolioFlowListResponse {
  monthlyInvestAmount: number;
  flows: PortfolioFlow[];
}

export interface AvailableAsset {
  id: string;
  institution: string | null;
  accountName: string | null;
  assetNumber: string | null;
  assetType: string | null;
  balance: number | null;
}

export interface PortfolioFlowUpdateRequest {
  gatheringAssetId?: string | null;
  sources: Array<{ assetId: string; amount: number }>;
  products: Array<{ productId?: string | null; productType: string; productRatio: number; assetId?: string | null }>;
}

/**
 * GET /portfolio-flows — 전체 포트폴리오 흐름 조회
 */
export async function getPortfolioFlows(): Promise<PortfolioFlowListResponse> {
  const res = await api.get<CommonResponse>('/portfolio-flows');
  if (!res.success) throw new Error(res.message || '포트폴리오 흐름 조회 중 오류가 발생했습니다.');
  return res.data as PortfolioFlowListResponse;
}

/**
 * GET /portfolio-flows/available-assets — 끌어오기/모으기 후보 계좌
 */
export async function getAvailableAssets(): Promise<AvailableAsset[]> {
  const res = await api.get<CommonResponse<{ assets: AvailableAsset[] }>>('/portfolio-flows/available-assets');
  if (!res.success) throw new Error(res.message || '사용 가능한 통장 조회 중 오류가 발생했습니다.');
  return res.data.assets;
}

/**
 * PATCH /portfolio-flows/{flowId} — 흐름 일괄 수정
 */
export async function updatePortfolioFlow(flowId: string, request: PortfolioFlowUpdateRequest): Promise<PortfolioFlow> {
  const res = await api.patch<CommonResponse>(`/portfolio-flows/${flowId}`, request);
  if (!res.success) throw new Error(res.message || '흐름 수정 중 오류가 발생했습니다.');
  return res.data as PortfolioFlow;
}
