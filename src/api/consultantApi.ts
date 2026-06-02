import type { DashboardData } from './dashboardApi';
import { updatePortfolios, type PortfolioItem } from './portfolioApi';

const AI_BASE = 'http://localhost:8001';

export interface AnalyzeResponse {
  action: 'salary' | 'portfolio';
  reasoning: string;
}

export interface ResetAllocation {
  purpose: string;
  plannedAmount: number;
  ratio: number;
}

export interface ResetPortfolioItem {
  assetType: string;
  ratio: number;
}

export interface ProposeResponse {
  summary: string;
  explanation: string;
  salary_allocations: ResetAllocation[];
  portfolio: ResetPortfolioItem[];
}

// AI 자산 유형 → 백엔드 enum 매핑
const ASSET_TYPE_MAP: Record<string, string> = {
  'ETF':    'STOCK',  '주식':   'STOCK',  '투자':   'STOCK',
  '해외주식': 'STOCK', '국내주식': 'STOCK',
  '채권':   'BOND',
  '적금':   'FIXED',  '예금':   'FIXED',  '저축':   'FIXED',
  '현금성': 'CASH',   '파킹':   'CASH',   'CMA':    'CASH',
  'IRP':    'IRP',    '연금저축': 'IRP',   '연금':   'IRP',
  '비상금': 'EMERGENCY',
};

function toBackendAssetType(label: string): string | null {
  for (const [key, type] of Object.entries(ASSET_TYPE_MAP)) {
    if (label.includes(key)) return type;
  }
  return null; // 생활비·식비 등 비투자 항목
}

export async function applyReset(
  proposal: ProposeResponse,
  action: 'salary' | 'portfolio',
  dashboard: DashboardData,
): Promise<void> {
  const investAmount = dashboard.salaryPlan.investmentAmount ?? 0;

  let portfolios: PortfolioItem[];
  let monthlyInvestAmount: number;

  if (action === 'portfolio') {
    // AI 비율 × 월 투자금 → assetAmount
    portfolios = proposal.portfolio
      .map(p => ({
        assetType: toBackendAssetType(p.assetType) ?? 'STOCK',
        assetAmount: Math.round(investAmount * p.ratio / 100),
      }))
      .filter(p => p.assetAmount > 0);
    monthlyInvestAmount = investAmount;
  } else {
    // salary: 투자성 항목만 추출 (생활비 등 제외)
    const investItems = proposal.salary_allocations
      .map(a => ({ type: toBackendAssetType(a.purpose), amount: a.plannedAmount }))
      .filter((x): x is { type: string; amount: number } => x.type !== null && x.amount > 0);

    portfolios = investItems.map(x => ({ assetType: x.type, assetAmount: x.amount }));
    monthlyInvestAmount = investItems.reduce((s, x) => s + x.amount, 0);
  }

  if (portfolios.length === 0) throw new Error('적용할 투자 항목이 없어요');
  await updatePortfolios(portfolios, monthlyInvestAmount);
}

export async function analyzeGoal(goal: string, dashboard: DashboardData): Promise<AnalyzeResponse> {
  const res = await fetch(`${AI_BASE}/consultant/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_goal: goal, dashboard_snapshot: dashboard }),
  });
  if (!res.ok) throw new Error(`AI 서버 오류 (${res.status})`);
  return res.json();
}

export async function proposeReset(
  goal: string,
  action: 'salary' | 'portfolio',
  dashboard: DashboardData,
): Promise<ProposeResponse> {
  const res = await fetch(`${AI_BASE}/consultant/propose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_goal: goal, action, dashboard_snapshot: dashboard }),
  });
  if (!res.ok) throw new Error(`AI 서버 오류 (${res.status})`);
  return res.json();
}
