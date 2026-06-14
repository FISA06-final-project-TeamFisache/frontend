import { api } from './client';

interface CommonResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface DailyLog {
  day: number;
  achieved: boolean;
  transaction?: {
    date: string;
    time: string;
    name: string;
    amount: number;
  };
}

export interface ChallengeAlarmDetail {
  challengeId: string;
  title: string;
  category: string;
  challengeType: 'FREQUENCY' | 'AMOUNT';
  target: number;
  currentCount: number;
  weeklyBaseline?: number;   // 평소 주간 횟수 (ex: 10잔) → 절약 횟수 = weeklyBaseline - target
  estimatedSaving: number;
  tickerName: string;
  estimatedShares: string;
  dailyLogs: DailyLog[];
  progressPercent: number;
  aiComment: string;
  weeklyStatus: 'ACTIVE' | 'SUCCESS' | 'FAILED';
}

/** 백엔드 GET /notifications/nag/{id} 응답 (NagNotificationResponseDto) */
interface NagNotificationResponse {
  id: string;
  challengeId: string | null;   // 알림이 가리키는 챌린지 (상태 무관) — 리워드 주식 조회용
  type: string;                 // NAG_50 | NAG_80 | NAG_90 | CHALLENGE_COMPLETE | CHALLENGE_FAILED
  challengeTitle: string | null;
  stockName: string | null;
  affordableShares: number | null;
  estimatedSaving: number | null;   // 절약한 금액(원) — DB 저장값
  content: string;              // 잔소리/결과 메시지
  isRead: boolean;
  sentAt: string;
}

export async function getChallengeAlarmDetail(notificationId: string): Promise<ChallengeAlarmDetail> {
  const res = await api.get<CommonResponse<NagNotificationResponse>>(
    `/notifications/nag/${notificationId}`
  );
  const d = res.data;
  // 백엔드는 NAG 알림 단건 정보만 준다. 모달이 쓰는 형태로 매핑하되,
  // 백엔드가 제공하지 않는 필드(dailyLogs·weeklyBaseline·category 등)는 안전 기본값.
  // progressPercent·weeklyStatus 는 호출부(Dashboard)가 알림 타입으로 덮어쓴다.
  return {
    challengeId: d.challengeId ?? '',
    title: d.challengeTitle ?? '미니챌린지',
    category: '',
    challengeType: 'FREQUENCY',
    target: 0,
    currentCount: 0,
    estimatedSaving: d.estimatedSaving ?? 0,
    tickerName: d.stockName ?? '',
    estimatedShares: d.affordableShares != null ? `${d.affordableShares.toFixed(2)}주` : '-',
    dailyLogs: [],
    progressPercent: 0,
    aiComment: d.content,
    weeklyStatus: 'ACTIVE',
  };
}

export async function suggestNewChallenge(): Promise<void> {
  await api.post('/challenges/suggest');
}

// ─── 주식 시세 ────────────────────────────────────────────────

export interface StockInfo {
  ticker: string;
  name: string;
  currentPrice: number;
  changeAmount: number;
  changeRate: number;
  chart: Array<{ date: string; close: number }>;
}

// 삼성전자 fallback (API 장애 시)
const FALLBACK_STOCK: StockInfo = {
  ticker: '005930.KS', name: 'SamsungElec',
  currentPrice: 329000, changeAmount: -22500, changeRate: -6.4,
  chart: [
    { date: '2026-05-06', close: 266000 }, { date: '2026-05-07', close: 271500 },
    { date: '2026-05-08', close: 268500 }, { date: '2026-05-11', close: 285500 },
    { date: '2026-05-12', close: 279000 }, { date: '2026-05-13', close: 284000 },
    { date: '2026-05-14', close: 296000 }, { date: '2026-05-15', close: 270500 },
    { date: '2026-05-18', close: 281000 }, { date: '2026-05-19', close: 275500 },
    { date: '2026-05-20', close: 276000 }, { date: '2026-05-21', close: 299500 },
    { date: '2026-05-22', close: 292500 }, { date: '2026-05-26', close: 299000 },
    { date: '2026-05-27', close: 307000 }, { date: '2026-05-28', close: 299500 },
    { date: '2026-05-29', close: 317000 }, { date: '2026-06-01', close: 349000 },
    { date: '2026-06-02', close: 360500 }, { date: '2026-06-04', close: 351500 },
    { date: '2026-06-05', close: 329000 },
  ],
};

/** GET /stocks — 보상 주식 시세 + 차트. challengeId를 주면 그 챌린지(성공/실패 포함)의 ticker를,
 *  없으면 백엔드가 진행 중인 챌린지에서 ticker를 꺼낸다. */
export async function getStockInfo(challengeId?: string): Promise<StockInfo> {
  try {
    const url = challengeId ? `/stocks?challengeId=${encodeURIComponent(challengeId)}` : '/stocks';
    const res = await api.get<CommonResponse<StockInfo>>(url);
    if (!res.success || !res.data) return FALLBACK_STOCK;   // 챌린지 없음/시세 조회 실패 → 폴백
    return res.data;
  } catch {
    return FALLBACK_STOCK;
  }
}

// ─── 챌린지 추천 / 조정 / 생성 ─────────────────────────────────

export interface ChallengeProposal {
  title: string;
  description: string;
  category: string;
  challengeSubType: string;
  challengeType: 'AMOUNT' | 'COUNT';   // 백엔드 ChallengeType enum 과 일치
  target: number;
  estimatedSaving: number;
  ticker: string;        // 원시 티커 (예: 005930.KS) — 챌린지 생성 시 사용
  tickerName: string;    // 한글 종목명 (예: 삼성전자) — 화면 표시용
}

// 카테고리/서브타입 → 아이콘 이모지
export function getChallengeIcon(proposal: ChallengeProposal): string {
  const sub = (proposal.challengeSubType ?? '').toUpperCase();
  const cat = proposal.category ?? '';
  if (sub === 'COFFEE' || /카페|커피/.test(cat)) return '☕';
  if (sub === 'DELIVERY' || /배달/.test(cat)) return '🛵';
  if (sub === 'NIGHTSNACK' || /야식/.test(cat)) return '🌙';
  if (sub === 'ALCOHOL' || /술/.test(cat)) return '🍺';
  if (sub === 'SHOPPING' || /쇼핑/.test(cat)) return '🛍️';
  if (sub === 'TAXI' || /택시/.test(cat)) return '🚕';
  if (sub === 'LUNCH' || /점심/.test(cat)) return '🍱';
  return '💡';
}

// Fallback 제안 (Flask 장애 시 사용)
const FALLBACK_PROPOSAL: ChallengeProposal = {
  title: '커피 3잔만 마시기',
  description: '이번주 카페 지출을 줄여 절약 습관을 만들어봐요!',
  category: '카페',
  challengeSubType: 'COFFEE',
  challengeType: 'COUNT',
  target: 3,
  estimatedSaving: 24000,
  ticker: '삼성전자',
  tickerName: '삼성전자',
};

// 진행 중(IN_PROGRESS) 챌린지 — GET /challenges/active 응답
export interface ActiveChallenge {
  challengeId: string;
  title: string;
  description: string;
  category: string;
  challengeSubType: string;
  challengeType: 'AMOUNT' | 'COUNT';
  target: number;
  currentValue: number;
  progressPercent: number;   // 0~100
  estimatedSaving: number;
  ticker: string;
}

/** GET /challenges/active — 진행 중인 챌린지 (없으면 null) */
export async function getActiveChallenge(): Promise<ActiveChallenge | null> {
  try {
    const res = await api.get<CommonResponse<ActiveChallenge | null>>('/challenges/active');
    return res.data;
  } catch {
    return null;
  }
}

// 백엔드 ChallengeProposalResponseDto 는 snake_case 로 응답 → 프론트 camelCase 로 정규화
// (서버가 camelCase 로 줘도 동작하도록 둘 다 받음)
function toProposal(raw: Record<string, unknown>): ChallengeProposal {
  return {
    title: raw.title as string,
    description: raw.description as string,
    category: raw.category as string,
    challengeSubType: (raw.challengeSubType ?? raw.challenge_sub_type) as string,
    challengeType: (raw.challengeType ?? raw.challenge_type) as 'FREQUENCY' | 'AMOUNT',
    target: (raw.target ?? 0) as number,
    estimatedSaving: (raw.estimatedSaving ?? raw.estimated_saving ?? 0) as number,
    ticker: raw.ticker as string,
    // 종목명이 null/빈값이면 헷갈리지 않게 '문제있음' 표시 (raw ticker 로 폴백하지 않음)
    tickerName: (() => {
      const tn = (raw.tickerName ?? raw.ticker_name) as string | null | undefined;
      return tn && tn.trim() ? tn : '문제있음';
    })(),
  };
}

/** POST /challenges/recommend — AI가 거래 내역 분석 후 챌린지 제안 */
export async function recommendChallenge(): Promise<ChallengeProposal> {
  try {
    const res = await api.post<CommonResponse<Record<string, unknown>>>('/challenges/recommend', {});
    return toProposal(res.data);
  } catch {
    return FALLBACK_PROPOSAL;
  }
}

/** POST /challenges/adjust?feedback= — 피드백으로 재생성 (백엔드는 feedback 쿼리 파라미터만 사용) */
export async function adjustChallenge(feedback: string): Promise<ChallengeProposal> {
  try {
    const res = await api.post<CommonResponse<Record<string, unknown>>>(
      `/challenges/adjust?feedback=${encodeURIComponent(feedback)}`, {},
    );
    return toProposal(res.data);
  } catch {
    return FALLBACK_PROPOSAL;
  }
}

/** POST /challenges — 확정된 챌린지 저장 → 진행 ID 반환 */
export async function createChallenge(proposal: ChallengeProposal): Promise<string> {
  const res = await api.post<CommonResponse<string>>('/challenges', {
    title: proposal.title,
    description: proposal.description,
    category: proposal.category,
    challengeSubType: proposal.challengeSubType,
    challengeType: proposal.challengeType,
    target: proposal.target,
    estimatedSaving: proposal.estimatedSaving,
    ticker: proposal.ticker,
  });
  return res.data;
}
