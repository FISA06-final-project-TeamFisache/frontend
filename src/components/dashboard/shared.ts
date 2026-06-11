// 메인 대시보드 위젯 공용 모듈
// ─────────────────────────────────────────────────────────────
// 백엔드 API(DashboardData) → 위젯 props 로 바꾸는 "매핑/계산 함수"를 모아둔 곳.
// API 응답 구조가 바뀌면 원칙적으로 이 파일과 각 위젯의 props 만 수정하면 됩니다.

import type {
  DashboardSalaryPlan,
  DashboardCategoryExpense,
  DashboardPortfolioItem,
  DashboardPortfolioSubItem,
  DashboardConsumption,
} from '../../api/dashboardApi';
import { classifyEtf } from '../assetPortfolio/portfolioRegistry';

// ─── 공용 타입 ───────────────────────────────────────────────
export interface SpendingItem { label: string; pct: number; color: string; amount: number; }
export interface PortfolioSlice { label: string; pct: number; color: string; rate?: string; }

// ─── 색상 상수 ───────────────────────────────────────────────
// 소비 카테고리 도넛 팔레트 — 카테고리별로 distinct 하게 인덱스 순환
export const SPENDING_PALETTE = ['#D85A30', '#EF9F27', '#E2B93B', '#1D9E75', '#378ADD', '#7F77DD', '#A32D2D', '#5DCAA5'];

// 포트폴리오 카테고리별 색상 (categoryLabel → 색상)
// ETF 세부 분류 라벨은 portfolioRegistry의 ETF_CATEGORY_RULES barColor와 맞춤
export const PORTFOLIO_COLOR: Record<string, string> = {
  'ETF': '#1D9E75',
  '현금성': '#5DCAA5',
  '적금': '#9FE1CB',
  'IRP': '#085041',
  '국내주식': '#E24B4A',
  '해외주식': '#0EA5E9',
  '채권': '#378ADD',
  '배당': '#22C55E',
  '테마': '#A855F7',
  '금/원자재': '#F59E0B',
  'TDF': '#534AB7',
  '리츠': '#14B8A6',
};

// 월급 분배 도넛 팔레트
export const SALARY_PALETTE = ['#EF9F27', '#7F77DD', '#378ADD', '#1D9E75', '#94a3b8'];

// ─── 표시용 헬퍼 ─────────────────────────────────────────────
export const fmtManwon = (n: number) => `${Math.round(n / 10000).toLocaleString()}만 원`;

// ─── 매핑 함수 (API → 슬라이스/아이템) ───────────────────────
// 월급 분배 도넛 데이터
// 계좌 분배(별명)용 색상 — 투자 녹색(#1D9E75)/여유 회색과 겹치지 않게
const ALLOCATION_PALETTE = ['#378ADD', '#7F77DD', '#EF9F27', '#E2B93B', '#D85A30', '#A32D2D', '#5DCAA5'];

export function buildSalarySlices(salaryPlan: DashboardSalaryPlan): PortfolioSlice[] {
  const income = salaryPlan.monthlyIncome;
  if (income <= 0) return [];

  const investAmt = salaryPlan.investmentAmount ?? 0;

  // 투자(고정 녹색) + 계좌별 분배 별명 + 여유(surplus)로 도넛을 채운다.
  // 백엔드상 투자 + 분배합 + surplus = 월급 이므로 합이 100%가 된다.
  const slices: PortfolioSlice[] = [
    { label: '투자', pct: Math.round(investAmt / income * 100), color: '#1D9E75' },
  ];

  salaryPlan.allocations.forEach((a, i) => {
    if (!a.plannedAmount || a.plannedAmount <= 0) return;
    slices.push({
      label: a.purpose ?? '기타',
      pct: Math.round(a.plannedAmount / income * 100),
      color: ALLOCATION_PALETTE[i % ALLOCATION_PALETTE.length],
    });
  });

  const surplus = salaryPlan.surplus ?? 0;
  if (surplus > 0) {
    slices.push({ label: '여유', pct: Math.round(surplus / income * 100), color: '#CBD5E1' });
  }

  return slices;
}

// 소비 카테고리 비율 아이템
export function buildSpendingItems(categories: DashboardCategoryExpense[]): SpendingItem[] {
  return categories.map((c, i) => ({
    label: c.categoryName,
    pct: c.percentage,
    color: SPENDING_PALETTE[i % SPENDING_PALETTE.length],
    amount: c.expenseAmount,
  }));
}

// 'ETF' 카테고리를 상품명 키워드(classifyEtf)로 세부 분류해 별도 카테고리로 쪼갠다.
// 키워드에 안 걸린 상품은 'ETF' 라벨로 남고, 나머지 카테고리(현금성/적금/IRP)는 그대로 통과
export function splitEtfPortfolio(portfolio: DashboardPortfolioItem[]): DashboardPortfolioItem[] {
  const result: DashboardPortfolioItem[] = [];
  for (const cat of portfolio) {
    if (cat.categoryLabel !== 'ETF' || cat.items.length === 0) {
      result.push(cat);
      continue;
    }
    const buckets = new Map<string, DashboardPortfolioSubItem[]>();
    for (const item of cat.items) {
      const label = classifyEtf(item.name).type;
      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label)!.push(item);
    }
    const split = Array.from(buckets.entries()).map(([label, items]) => {
      const ratio = items.reduce((s, i) => s + i.ratio, 0);
      return {
        categoryLabel: label,
        ratio,
        // 백엔드는 카테고리 단위 금액만 주므로 비중으로 안분
        assetAmount: cat.ratio > 0 ? Math.round(cat.assetAmount * ratio / cat.ratio) : 0,
        rate: cat.rate,
        items,
      };
    });
    split.sort((a, b) => b.ratio - a.ratio);
    result.push(...split);
  }
  return result;
}

// 포트폴리오 비중 슬라이스
export function buildPortfolioSlices(portfolio: DashboardPortfolioItem[]): PortfolioSlice[] {
  return portfolio.map(p => ({
    label: p.categoryLabel,
    pct: p.ratio,
    color: PORTFOLIO_COLOR[p.categoryLabel] ?? '#94a3b8',
    rate: p.rate,
  }));
}

// ─── 계산 함수 (위젯 표시값 도출) ────────────────────────────
// [소비] 잔여 비율 / 연료게이지 색상
export interface ConsumptionView {
  totalExpense: number;
  remainingPercent: number;
  fillColor: string;
  isBudgetExceeded: boolean;
}
export function computeConsumption(consumption: DashboardConsumption): ConsumptionView {
  const totalExpense = consumption.totalExpense;
  const baseline = consumption.lastMonthExpense;   // 예산 기준 = 저번 달 소비총합

  // 저번 달 데이터가 없으면 비교 불가 → 가득 찬 상태로 표시
  const remainingPercent = baseline > 0
    ? Math.max(0, Math.min(100, Math.round((baseline - totalExpense) / baseline * 100)))
    : 100;

  let fillColor = '#0095DB';
  if (remainingPercent < 20 || consumption.isBudgetExceeded) {
    fillColor = '#EF4444';
  } else if (remainingPercent < 50) {
    fillColor = '#FFD700';
  }

  return { totalExpense, remainingPercent, fillColor, isBudgetExceeded: consumption.isBudgetExceeded };
}

// [미션] 소비 1위 카테고리 기반 추천 챌린지 + 성공 보상
export interface MissionView {
  icon: string;
  title: string;
  step: number;
  savings: string;
}
export function computeMission(categories: DashboardCategoryExpense[]): MissionView {
  const top = [...(categories ?? [])].sort((a, b) => b.percentage - a.percentage)[0];
  const name = top?.categoryName ?? '';

  let ch: { icon: string; title: string; step: number };
  if (/카페|커피/.test(name)) ch = { icon: '☕', title: '이번달 카페 5번 줄이기', step: 20 };
  else if (/배달/.test(name)) ch = { icon: '🍕', title: '이번달 배달음식 5번만 시키기', step: 20 };
  else if (/외식|식비/.test(name)) ch = { icon: '🍽', title: '이번달 외식 3번 줄이기', step: 33 };
  else if (/쇼핑|온라인/.test(name)) ch = { icon: '🛍', title: '이번달 충동구매 0번 도전', step: 25 };
  else if (/편의점/.test(name)) ch = { icon: '🏪', title: '편의점 지출 20% 줄이기', step: 20 };
  else if (/구독/.test(name)) ch = { icon: '📱', title: '불필요한 구독 1개 해지하기', step: 100 };
  else if (/교통/.test(name)) ch = { icon: '🚌', title: '이번달 택시 10번 줄이기', step: 10 };
  else ch = { icon: '💡', title: `이번달 ${name || '지출'} 10% 줄이기`, step: 10 };

  let savings = 'TIGER 미국S&P500 0.03주';
  if (ch.title.includes('카페') || ch.title.includes('커피')) savings = 'TIGER 미국S&P500 0.02주';
  else if (ch.title.includes('배달') || ch.title.includes('외식')) savings = 'TIGER 미국S&P500 0.05주';
  else if (ch.title.includes('쇼핑')) savings = 'TIGER 미국S&P500 0.06주';

  return { ...ch, savings };
}

// [절세] 세액공제 현황은 백엔드 /dashboard 응답(taxSaving)에서 그대로 내려옴.
//   납입 한도/공제율/공제대상은 백엔드 TaxBenefitPolicy 정책 상수가 기준 — 프론트에서 재계산하지 않는다.
export const fmtWon = (n: number) => n >= 10_000 ? `${Math.round(n / 10_000)}만원` : `${n.toLocaleString()}원`;
