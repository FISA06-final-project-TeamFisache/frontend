import { api } from './client';

export interface PortiSurveyResult {
  portiType: 'SWIMMING' | 'ARCHERY' | 'JUDO' | 'RHYTHMIC' | 'FENCING' | 'CYCLING';
  typeName: string;
  description: string;
  investScore: number;
  activeScore: number;
  longTermScore: number;
  investTendency: string;
  managementStyle: string;
  timePerspective: string;
}

export interface PortiSurveyResponse {
  status: number;
  success: boolean;
  message: string;
  data: PortiSurveyResult;
}

export interface CommonResponse {
  status: number;
  success: boolean;
  message: string;
  data: unknown;
}

/**
 * porTI 설문 제출 및 유형 계산
 */
export async function submitSurvey(answers: string[]): Promise<PortiSurveyResult> {
  const response = await api.post<PortiSurveyResponse>('/users/porti-survey', { answers });
  if (!response.success) {
    throw new Error(response.message || '설문 제출 중 오류가 발생했습니다.');
  }
  return response.data;
}

/**
 * 회원 탈퇴 (soft delete)
 */
export async function withdrawAccount(): Promise<void> {
  const response = await api.delete<CommonResponse>('/users/me');
  if (!response.success) {
    throw new Error(response.message || '회원 탈퇴 중 오류가 발생했습니다.');
  }
}
