import type { Asset, PreviewAccount, AssetSummary } from '../api/assetApi';
import type { DashboardData } from '../api/dashboardApi';

// 계좌 연동 → 대시보드 전 화면에서 일관되게 사용하는 mock 데이터

export const MOCK_PREVIEW_ACCOUNTS: PreviewAccount[] = [
  { institution: '우리은행', assetType: 'CHECKING', assetNumber: '1002-123-456789', accountName: '우리은행 급여통장', accountPurpose: '급여', balance: 4000000, bankType: 'BANK', isSalary: true },
  { institution: '우리은행', assetType: 'CHECKING', assetNumber: '1002-234-567890', accountName: '우리은행 생활비통장', accountPurpose: '생활비', balance: 1200000, bankType: 'BANK', isSalary: false },
  { institution: '카카오뱅크', assetType: 'SAVINGS', assetNumber: '3333-12-1234567', accountName: '카카오뱅크 비상금', accountPurpose: '비상금', balance: 1500000, bankType: 'BANK', isSalary: false },
  { institution: '신한은행', assetType: 'DEPOSIT', assetNumber: '110-123-456789', accountName: '신한은행 저축통장', accountPurpose: '저축', balance: 3000000, bankType: 'BANK', isSalary: false },
  { institution: 'KB국민은행', assetType: 'DEPOSIT', assetNumber: '044-12-1234567', accountName: 'KB국민 정기예금', accountPurpose: '투자', balance: 1500000, bankType: 'BANK', isSalary: false },
  { institution: '삼성증권', assetType: 'STOCK', assetNumber: '2180-1234-5678', accountName: '삼성증권 주식계좌', accountPurpose: '투자', balance: 5200000, bankType: 'SECURITIES', isSalary: false },
  { institution: '미래에셋증권', assetType: 'STOCK', assetNumber: '4085-2345-6789', accountName: '미래에셋 채권펀드', accountPurpose: '투자', balance: 2300000, bankType: 'SECURITIES', isSalary: false },
];

export const MOCK_ASSETS: Asset[] = MOCK_PREVIEW_ACCOUNTS.map((p, i) => ({
  id: `mock-asset-${i + 1}`,
  institution: p.institution,
  assetType: p.assetType,
  assetNumber: p.assetNumber,
  accountPurpose: p.accountPurpose,
  accountName: p.accountName,
  isSalary: p.isSalary,
  balance: p.balance,
  bankType: p.bankType,
  syncedAt: '2026-06-01T00:00:00Z',
}));

export const MOCK_ASSET_SUMMARY: AssetSummary = {
  totalBalance: 18700000,
  savingsBalance: 9700000,
  investBalance: 9000000,
  linkedAccountCount: 7,
  linkedCardCount: 0,
};

export const MOCK_DASHBOARD: DashboardData = {
  user: { id: 'mock-user', name: '테스트' },
  assetsSummary: {
    totalBalance: 18700000,
    investmentBalance: 9000000,
    cashBalance: 9700000,
  },
  salaryPlan: {
    monthlyIncome: 4000000,
    investmentAmount: 1700000,
    surplus: 500000,
    allocations: [
      { purpose: '생활비', plannedAmount: 1200000 },
      { purpose: '비상금', plannedAmount: 300000 },
      { purpose: '저축', plannedAmount: 300000 },
    ],
  },
  events: [],
  consumption: {
    referenceMonth: 5,
    totalExpense: 1850000,
    lastMonthExpense: 2100000,
    isBudgetExceeded: false,
    budgetExceedRate: 0,
    weeklyExpenses: [45000, 62000, 31000, 88000, 55000],
    categories: [
      { categoryName: '식비', expenseAmount: 620000, percentage: 33, sub: null },
      { categoryName: '쇼핑', expenseAmount: 450000, percentage: 24, sub: null },
      { categoryName: '교통', expenseAmount: 180000, percentage: 10, sub: null },
      { categoryName: '카페', expenseAmount: 150000, percentage: 8, sub: null },
      { categoryName: '의료', expenseAmount: 120000, percentage: 6, sub: null },
      { categoryName: '기타', expenseAmount: 330000, percentage: 18, sub: null },
    ],
  },
  portfolio: [
    {
      categoryLabel: '국내주식',
      ratio: 28,
      assetAmount: 5200000,
      rate: '+2.4%',
      items: [
        { name: '삼성전자', ratio: 15, rate: '+1.2%' },
        { name: 'KODEX 200', ratio: 13, rate: '+3.1%' },
      ],
    },
    {
      categoryLabel: 'ETF',
      ratio: 30,
      assetAmount: 2300000,
      rate: '+5.2%',
      items: [
        { name: 'TIGER 미국S&P500', ratio: 18, rate: '+6.1%' },
        { name: 'TIGER 나스닥100', ratio: 12, rate: '+4.0%' },
      ],
    },
    {
      categoryLabel: '채권',
      ratio: 22,
      assetAmount: 2000000,
      rate: '+1.2%',
      items: [{ name: '미래에셋 채권펀드', ratio: 22, rate: '+1.2%' }],
    },
    {
      categoryLabel: '현금성',
      ratio: 20,
      assetAmount: 1500000,
      rate: '+3.8%',
      items: [{ name: 'KB국민 정기예금', ratio: 20, rate: '+3.8%' }],
    },
  ],
  taxSaving: {
    deductionRate: 16.5,
    totalTaxDeduction: 148500,
    remaining: 1900000,
    bars: [
      { label: 'IRP', contribution: 500000, deductible: 500000, limit: 9000000 },
      { label: '연금저축', contribution: 400000, deductible: 400000, limit: 6000000 },
    ],
  },
};
