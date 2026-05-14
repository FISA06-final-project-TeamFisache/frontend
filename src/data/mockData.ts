export const ETF_CATALOG = [
  { id: 'div1', category: 'dividend', name: 'TIGER 미국배당+7%프리미엄', type: '안정형 월배당', tag: '연 배당 7.2%', color: 'text-blue-600', bg: 'bg-blue-50', returnRate: 0.07, mddRisk: 0.12, rank: 1 },
  { id: 'div2', category: 'dividend', name: 'KODEX 배당성장', type: '국내 배당주', tag: '연 배당 4.5%', color: 'text-blue-600', bg: 'bg-blue-50', returnRate: 0.05, mddRisk: 0.10, rank: 4 },
  { id: 'tech1', category: 'growth', name: 'KODEX 미국나스닥100TR', type: '성장형 기술주', tag: '수익률 중심', color: 'text-red-600', bg: 'bg-red-50', returnRate: 0.15, mddRisk: 0.35, rank: 2 },
  { id: 'tech2', category: 'growth', name: 'TIGER 미국테크TOP10', type: '초대형 기술주', tag: 'AI/반도체', color: 'text-red-600', bg: 'bg-red-50', returnRate: 0.18, mddRisk: 0.40, rank: 5 },
  { id: 'market1', category: 'market', name: 'TIGER 미국S&P500', type: '시장평균 지수추종', tag: '안정적 성장', color: 'text-green-600', bg: 'bg-green-50', returnRate: 0.10, mddRisk: 0.20, rank: 3 },
  { id: 'market2', category: 'market', name: 'KODEX 200', type: '국내 코스피 추종', tag: '국내 대표', color: 'text-green-600', bg: 'bg-green-50', returnRate: 0.06, mddRisk: 0.25, rank: 6 }
];

export const LOAN_CATALOG = [
  { id: 'loan1', category: 'policy', name: '신생아 특례 디딤돌 대출', type: '정부지원 주택담보대출', tag: '최저 연 1.6%', color: 'text-yellow-700', bg: 'bg-yellow-100', interestRate: 0.016, rank: 1 },
  { id: 'loan2', category: 'policy', name: '청년 전용 버팀목 대출', type: '정부지원 전세자금대출', tag: '최저 연 1.5%', color: 'text-yellow-700', bg: 'bg-yellow-100', interestRate: 0.015, rank: 2 },
  { id: 'loan3', category: 'commercial', name: '우리WON 주택담보대출', type: '시중은행 1금융권', tag: '고정 연 3.8%', color: 'text-gray-700', bg: 'bg-gray-100', interestRate: 0.038, rank: 3 },
  { id: 'loan4', category: 'commercial', name: '카카오뱅크 전월세보증금 대출', type: '인터넷전문은행', tag: '변동 연 3.5%', color: 'text-gray-700', bg: 'bg-gray-100', interestRate: 0.035, rank: 4 }
];

export const MOCK_DISCOVERED_ACCOUNTS = [
  { id: 'disc1', name: 'NH농협 (직장인 우대 통장)', type: '현금', balance: 5200000, bank: 'NH농협', color: 'text-green-600', bg: 'bg-green-100' },
  { id: 'disc2', name: '하나은행 (주택청약종합저축)', type: '현금', balance: 1800000, bank: '하나은행', color: 'text-teal-600', bg: 'bg-teal-100' },
  { id: 'disc3', name: 'KB국민 (KB 스타 파킹통장)', type: '현금', balance: 950000, bank: 'KB국민', color: 'text-yellow-600', bg: 'bg-yellow-100' }
];

export const TRANSFER_HISTORY = [
  { id: 1, month: '2026년 4월', date: '2026.04.25', totalAmt: 1350000, details: [
    { name: '한국투자증권 [공격 투자형]', amount: 540000, type: '주식' },
    { name: 'KB증권 [안전 방어형]', amount: 540000, type: '채권' },
    { name: '우리은행 [비상금 파킹]', amount: 270000, type: '현금' }
  ]},
  { id: 2, month: '2026년 3월', date: '2026.03.25', totalAmt: 1350000, details: [
    { name: '한국투자증권 [공격 투자형]', amount: 540000, type: '주식' },
    { name: 'KB증권 [안전 방어형]', amount: 540000, type: '채권' },
    { name: '우리은행 [비상금 파킹]', amount: 270000, type: '현금' }
  ]},
  { id: 3, month: '2026년 2월', date: '2026.02.25', totalAmt: 1000000, details: [
    { name: '한국투자증권 [공격 투자형]', amount: 400000, type: '주식' },
    { name: 'KB증권 [안전 방어형]', amount: 400000, type: '채권' },
    { name: '우리은행 [비상금 파킹]', amount: 200000, type: '현금' }
  ]},
];
