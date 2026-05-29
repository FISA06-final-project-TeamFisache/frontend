import { api } from './client';
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source';

const BASE_URL = 'http://localhost:8080/api/v1';

interface CommonResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export type NotificationType = 'REPORT_READY' | 'SPENDING_TREND' | 'SALARY_REBALANCING';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get<CommonResponse<Notification[]>>('/notifications');
  if (!response.success) throw new Error(response.message || '알림 조회 실패');
  return response.data;
}

export async function readNotification(id: string): Promise<void> {
  const response = await api.patch<CommonResponse<null>>(`/notifications/${id}/read`);
  if (!response.success) throw new Error(response.message || '알림 읽음 처리 실패');
}

export async function readAllNotifications(): Promise<void> {
  const response = await api.patch<CommonResponse<null>>('/notifications/read-all');
  if (!response.success) throw new Error(response.message || '전체 읽음 처리 실패');
}

export function subscribeToNotifications(callbacks: {
  onNotification: (n: Notification) => void;
  onSalaryArrived: () => void;
}): AbortController {
  const ctrl = new AbortController();
  const token = localStorage.getItem('token');

  fetchEventSource(`${BASE_URL}/notifications/subscribe`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token ?? ''}` },
    signal: ctrl.signal,
    async onopen(response) {
      if (response.ok && response.headers.get('content-type')?.startsWith(EventStreamContentType)) return;
      throw new Error(`SSE 연결 실패 (${response.status})`);
    },
    onmessage(event) {
      if (!event.data) return;
      try {
        const notification = JSON.parse(event.data) as Notification;
        callbacks.onNotification(notification);
        if (notification.type === 'SALARY_REBALANCING') {
          callbacks.onSalaryArrived();
        }
      } catch {
        // heartbeat 등 JSON이 아닌 메시지 무시
      }
    },
    onerror(err) {
      console.error('[SSE] 알림 구독 오류:', err);
      throw err;
    },
  });

  return ctrl;
}
