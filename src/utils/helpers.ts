export const formatAmount = (amt: number): string => {
  if (amt >= 10000) return `${Math.floor(amt / 10000)}억 ${amt % 10000 > 0 ? (amt % 10000) + '만 ' : ''}원`;
  return `${amt}만 원`;
};

export const getDynamicMetaphor = (amt: number): string => {
  if (amt >= 100000) return '서울 한강뷰 아파트 매매 가치 🏙️';
  if (amt >= 50000) return '서울 주요 도심 아파트 전세 가치 🏢';
  if (amt >= 10000) return '테슬라 모델X 1대 가치 🚗';
  if (amt >= 5000) return '제네시스 G80 1대 가치 🚘';
  if (amt >= 3000) return '몰디브 최고급 신혼여행 3번 가치 ✈️';
  if (amt >= 1000) return '매일 스타벅스 커피 6년 치 가치 ☕';
  if (amt >= 500) return '유럽 한 달 살기 가치 🎒';
  if (amt >= 150) return '아이패드 프로 풀옵션 가치 📱';
  return '소중한 나의 첫 씨앗 자금 🌱';
};

export const getGoalTitle = (id: string): string => {
  const map: Record<string, string> = {
    real_estate: '부동산 자금 마련',
    savings: '종잣돈 모으기',
    wedding: '결혼 준비',
    travel: '해외 여행',
    policy: '정부 지원 정책 매칭',
    ipad: '기타 (사고 싶은 물건)',
  };
  return map[id] || '나의 목표';
};
