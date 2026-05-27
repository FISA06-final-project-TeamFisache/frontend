import { api } from './client';

// ── 공통 응답 ──────────────────────────────────────────────────
interface CommonResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

// ── 타입 정의 ──────────────────────────────────────────────────

/** 연결된 자산 계좌 */
export interface Asset {
  id: string;
  institution: string;       // 금융기관명 (e.g. "우리은행")
  assetType: string;         // 자산 유형 (e.g. "SAVINGS", "INVESTMENT")
  assetNumber: string;       // 계좌번호
  accountPurpose: string;    // 계좌 용도
  accountName: string;       // 상품명
  isSalary: boolean;         // 급여 계좌 여부
  balance: number;           // 잔액
  bankType: string;          // 은행 코드 (e.g. "WOORI", "OTHER")
  syncedAt: string;          // 마지막 동기화 시각 (ISO 8601)
}

/** 자산 요약 */
export interface AssetSummary {
  totalBalance: number;         // 총 자산
  savingsBalance: number;       // 저축 잔액
  investBalance: number;        // 투자 잔액
  linkedAccountCount: number;   // 연결된 계좌 수
  linkedCardCount: number;      // 연결된 카드 수
}

/** MyData 기관 미리보기 항목 */
export interface PreviewAccount {
  institution: string;
  assetType: string;
  assetNumber: string;
  accountName: string;
  accountPurpose: string;
  balance: number;
  bankType: string;
  isSalary: boolean;
}

/** 급여 계좌 설정 결과 */
export interface SalarySetResult {
  assetId: string;
  institution: string;
  isWooriBank: boolean;         // true → 다음 단계, false → 자동이체 연결
}

/** 자동이체 연결 상태 */
export interface AutoTransferStatus {
  isConnected: boolean;
  restrictedFeatures: string[];
  fromAssetId: string;
  fromInstitution: string;
}

// ── API 함수 ───────────────────────────────────────────────────

/**
 * GET /assets
 * 연동된 전체 자산(계좌) 목록 조회
 */
export async function getAssets(): Promise<Asset[]> {
  const response = await api.get<CommonResponse<Asset[]>>('/assets');
  if (!response.success) throw new Error(response.message || '자산 목록 조회 중 오류가 발생했습니다.');
  return response.data;
}

/**
 * GET /assets/summary
 * 자산 카테고리별 요약 조회
 */
export async function getAssetSummary(): Promise<AssetSummary> {
  const response = await api.get<CommonResponse<AssetSummary>>('/assets/summary');
  if (!response.success) throw new Error(response.message || '자산 요약 조회 중 오류가 발생했습니다.');
  return response.data;
}

/**
 * GET /assets/mydata/preview
 * 연결할 기관의 계좌 목록 미리보기
 * @param institutions 조회할 기관명 배열 (e.g. ["우리은행","국민은행"])
 */
export async function getMyDataPreview(institutions: string[]): Promise<PreviewAccount[]> {
  const params = institutions.map((i) => `institutions=${encodeURIComponent(i)}`).join('&');
  const response = await api.get<CommonResponse<{ accounts: PreviewAccount[]; totalCount: number }>>(`/assets/mydata/preview?${params}`);
  if (!response.success) throw new Error(response.message || 'MyData 조회 중 오류가 발생했습니다.');
  return response.data.accounts;
}

/**
 * POST /assets/sync
 * 선택한 계좌번호 목록을 동기화(연결)
 * @param selectedAssetNumbers 연결할 계좌번호 배열
 */
export async function syncAssets(selectedAssetNumbers: string[]): Promise<Asset[]> {
  const response = await api.post<CommonResponse<{ assets: Asset[]; totalCount: number }>>('/assets/sync', { selectedAssetNumbers });
  if (!response.success) throw new Error(response.message || '자산 동기화 중 오류가 발생했습니다.');
  return response.data.assets;
}

/**
 * PATCH /assets/{assetId}/salary
 * 급여 계좌로 설정
 */
export async function setSalaryAccount(assetId: string): Promise<SalarySetResult> {
  const response = await api.patch<CommonResponse<SalarySetResult>>(`/assets/${assetId}/salary`, {});
  if (!response.success) throw new Error(response.message || '급여 계좌 설정 중 오류가 발생했습니다.');
  return response.data;
}

/**
 * POST /assets/auto-transfer/connect
 * 타행 급여 계좌 → 우리은행 계좌 자동이체 연결
 * @param toAssetId  입금받을 우리은행 계좌 UUID
 * @param salaryDate 이체일 (1~31)
 */
export async function connectAutoTransfer(toAssetId: string, salaryDate: number): Promise<void> {
  const response = await api.post<CommonResponse>('/assets/auto-transfer/connect', { toAssetId, salaryDate });
  if (!response.success) throw new Error(response.message || '자동이체 연결 중 오류가 발생했습니다.');
}

/**
 * GET /assets/auto-transfer/status
 * 자동이체 연결 상태 조회
 */
export async function getAutoTransferStatus(): Promise<AutoTransferStatus> {
  const response = await api.get<CommonResponse<AutoTransferStatus>>('/assets/auto-transfer/status');
  if (!response.success) throw new Error(response.message || '자동이체 상태 조회 중 오류가 발생했습니다.');
  return response.data;
}
