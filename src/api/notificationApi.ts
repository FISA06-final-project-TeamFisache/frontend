import { api } from './client';

interface CommonResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationList {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
}

/**
 * GET /notifications — 알림 목록 조회
 */
export async function getNotifications(): Promise<NotificationList> {
  const res = await api.get<CommonResponse<NotificationList>>('/notifications');
  if (!res.success) throw new Error(res.message || '알림 조회 중 오류가 발생했습니다.');
  return res.data;
}

/**
 * PATCH /notifications/{id}/read — 단건 읽음 처리
 */
export async function markNotificationRead(id: string): Promise<void> {
  const res = await api.patch<CommonResponse>(`/notifications/${id}/read`);
  if (!res.success) throw new Error(res.message || '알림 읽음 처리 중 오류가 발생했습니다.');
}

/**
 * PATCH /notifications/read-all — 전체 읽음 처리
 */
export async function markAllNotificationsRead(): Promise<void> {
  const res = await api.patch<CommonResponse>('/notifications/read-all');
  if (!res.success) throw new Error(res.message || '알림 전체 읽음 처리 중 오류가 발생했습니다.');
}
