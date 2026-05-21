import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, PieChart, ShieldCheck, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import fencingPotiImg from '../assets/FencingPoti.png';
import heroImg from '../assets/hero.png';


const TOTAL_QUESTIONS = 10;

// 카테고리별 지출 도넛 차트 데이터
const SPENDING_CATEGORIES = [
  { color: '#ef4444', label: '식비 (배달 등)', pct: 42 },
  { color: '#3b82f6', label: '문화/여가',       pct: 15 },
  { color: '#8b5cf6', label: '온라인 쇼핑',     pct: 17 },
  { color: '#10b981', label: '교통',            pct: 8  },
  { color: '#e5e7eb', label: '기타',            pct: 18 },
];

// 도넛 segment SVG path 생성기 (백분율 기준, 12시 방향에서 시작)
function donutArcPath(startPct: number, endPct: number, outerR: number, innerR: number, cx: number, cy: number): string {
  const toXY = (pct: number, r: number) => {
    const a = (pct / 100) * 2 * Math.PI - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const [x1, y1] = toXY(startPct, outerR);
  const [x2, y2] = toXY(endPct, outerR);
  const [x3, y3] = toXY(endPct, innerR);
  const [x4, y4] = toXY(startPct, innerR);
  const large = endPct - startPct > 50 ? 1 : 0;
  return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4} Z`;
}

interface Question {
  id: number;
  context: string;
  bubble?: string;
  optionA: string;
  optionB: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    context: '친구한테서 카톡이 왔어요',
    bubble: '나 이번에 ETF 샀는데 -10% 됐잖아ㅠ 어떡하지',
    optionA: '에고 나는 그래서 그런 거 안해',
    optionB: '어떤 종목이야? 나도 알아볼래',
  },
  {
    id: 2,
    context: '이상적인 월급날 상황을 골라봐요',
    optionA: '월급 들어오면 자동으로 딱딱 빠져나가고, 남은 돈을 씀',
    optionB: '월급 들어오면 내가 직접 확인하고 쪼개서 보냄',
  },
  {
    id: 3,
    context: '종잣돈 1000만원이 생겼어요!',
    optionA: '이걸로 1~2년 안에 이루고 싶은 게 있어 (여행, 차, 이사 등)',
    optionB: '딱히 쓸 계획은 없어, 그냥 더 크게 불리고 싶어',
  },
  {
    id: 4,
    context: '투자 앱을 켰더니 보유 중인 상품이 -5%가 됐어요',
    optionA: '뭔가 해야 할 것 같아, 일단 확인부터',
    optionB: '일단 지켜보자, 원래 오르내리는 거잖아',
  },
  {
    id: 5,
    context: '유튜브 알고리즘에 영상이 떴어요\n더 끌리는 영상은?',
    optionA: '"월급쟁이가 적금으로 3000만원 모은 법"',
    optionB: '"MZ가 ETF로 1000만원 만든 1년 기록"',
  },
  {
    id: 6,
    context: '지금 돈 모으는 이유가 뭐에 더 가까워?',
    optionA: '하고 싶은 게 있어서 (목표가 명확해)',
    optionB: '딱히 없지만, 있으면 든든하니까',
  },
  {
    id: 7,
    context: '두 가지 적금 상품이 있어요',
    optionA: '연 4% 원금 보장 적금',
    optionB: '조건부지만 최대 연 8% 가능한 상품',
  },
  {
    id: 8,
    context: '내 돈 현황 체크, 얼마나 자주 해?',
    optionA: '가끔 한 번씩 — 잘 모이고 있으면 됨',
    optionB: '자주 들여다봄 — 알고 있어야 안심 돼',
  },
  {
    id: 9,
    context: '솔직히, 내 취미 생활은?',
    optionA: '돈이 좀 들어가는 취미가 있어 (골프, 여행 등)',
    optionB: '취미는 있지만 크게 돈 들진 않아',
  },
  {
    id: 10,
    context: '앞으로 5년 안에 결혼 계획이 있어?',
    optionA: '있어 (또는 진지하게 고려 중이야)',
    optionB: '없거나, 아직 생각 안 해봤어',
  },
];

interface ResultType {
  typeName: string;
  subtitle: string;
  spending: string;
  investment: string;
  saving: string;
}

const RESULT_TYPES: ResultType[] = [
  {
    typeName: '수영하는 Pori',
    subtitle: '기본기에 충실한, 레인을 벗어나지 않는 타입',
    spending:
      '지출을 보면 식비, 교통·외출비의 비중이 높고, 충동 소비 흔적이 거의 없어요.',
    investment:
      '원금에서도 평균 손실보다 목표 미달성을 더 두려워하는 성향이 나타나는데, 그 말은 작더라도 확실한 성과를 얻는 방식이 가장 잘 맞는다는 뜻이에요.',
    saving: '주택청약과 하나의 적금으로 굴려있어요.',
  },
  {
    typeName: '달리는 Pori',
    subtitle: '성장을 즐기는, 목표를 향해 달리는 타입',
    spending:
      '소비는 자기계발과 경험에 집중되고, 불필요한 지출을 적극적으로 줄이는 편이에요.',
    investment:
      'ETF·주식 등 성장형 자산에 관심이 높고, 수익률을 자주 모니터링하는 적극적인 투자자예요.',
    saving: '여러 목적의 통장을 분산 운영하며 목표별로 저축을 관리해요.',
  },
];

function calcResult(answers: Record<number, 'A' | 'B'>): ResultType {
  const bCount = Object.values(answers).filter(v => v === 'B').length;
  return bCount >= 5 ? RESULT_TYPES[1] : RESULT_TYPES[0];
}

type Step = 'intro' | 'question' | 'loading' | 'result';

const USER_NAME = '회원'; // TODO: 인증 컨텍스트에서 실제 이름 가져오기

export default function PortiSurvey() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [completing, setCompleting] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);
  const [openDetail, setOpenDetail] = useState<Record<'spending' | 'investment' | 'saving', boolean>>({
    spending: false,
    investment: false,
    saving: false,
  });
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);

  const toggleDetail = (key: 'spending' | 'investment' | 'saving') =>
    setOpenDetail(prev => ({ ...prev, [key]: !prev[key] }));

  const currentQ = QUESTIONS[currentIndex];
  const progress = completing ? 100 : (currentIndex / TOTAL_QUESTIONS) * 100;

  // 로딩 → 결과 자동 전환
  useEffect(() => {
    if (step !== 'loading') return;
    const timer = setTimeout(() => setStep('result'), 2800);
    return () => clearTimeout(timer);
  }, [step]);

  const handleAnswer = (choice: 'A' | 'B') => {
    const newAnswers = { ...answers, [currentQ.id]: choice };
    setAnswers(newAnswers);

    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      // 마지막 문항: 게이지 100% 채우고 로딩으로 이동
      setCompleting(true);
      setResult(calcResult(newAnswers));
      setTimeout(() => setStep('loading'), 700);
    }
  };

  // ── 인트로 ────────────────────────────────────────────────
  if (step === 'intro') return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col items-center justify-center shadow-2xl px-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-3">PorTI 검사</h1>
        <p className="text-sm text-blue-400 mb-20">10개의 질문으로 당신을 파악할게요!</p>
        <button
          onClick={() => setStep('question')}
          className="w-full bg-gray-100 hover:bg-gray-200 text-blue-500 font-bold py-4 rounded-2xl text-lg transition active:scale-95"
        >
          시작하기
        </button>
      </div>
    </div>
  );

  // ── 로딩 ─────────────────────────────────────────────────
  if (step === 'loading') return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col items-center justify-center shadow-2xl px-10 gap-8">
        <p className="text-sm text-blue-500 text-center leading-relaxed">
          마이데이터와 PorTI 검사를 기반으로<br />
          <span className="font-bold">{USER_NAME}</span>님을 그리고 있어요.
        </p>

        {/* 점선 원 + 마스코트 */}
        <div className="relative flex items-center justify-center w-44 h-44">
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-blue-300 animate-spin [animation-duration:6s]" />
          <img src={heroImg} alt="Pori" className="w-28 h-28 object-contain relative z-10" />
        </div>
      </div>
    </div>
  );

  // ── 결과 카드 ─────────────────────────────────────────────
  if (step === 'result' && result) return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col shadow-2xl">

        {/* 헤더 */}
        <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10 border-b border-gray-100 shrink-0">
          <div className="w-10" />
          <h1 className="font-semibold text-base">AI 진단 리포트</h1>
          <div className="w-10" />
        </header>

        {/* 스크롤 컨텐츠 */}
        <main className="flex-1 px-5 py-6 space-y-8 overflow-y-auto pb-32">

          {/* 프로필 */}
          <section className="text-center space-y-4 pt-2">
            <h2 className="text-xl font-bold">
              {USER_NAME} 님은{' '}
              <span className="text-blue-500">{result.typeName}</span> 🏊
            </h2>
            <div className="w-40 h-40 mx-auto bg-blue-100 rounded-full flex items-center justify-center relative overflow-hidden border-4 border-white shadow-lg">
              <div className="absolute bottom-0 w-full h-1/2 bg-blue-300 opacity-50" />
              <img src={fencingPotiImg} alt={result.typeName} className="w-28 h-28 object-contain relative z-10" />
            </div>
            <p className="text-gray-600 font-medium bg-gray-100 inline-block px-4 py-2 rounded-full text-sm">
              {result.subtitle}
            </p>
          </section>

          <hr className="border-gray-100 border-2" />

          {/* 소비 팩트 체크 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-red-100 p-2 rounded-lg text-red-500">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">카테고리별 지출</h3>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-center my-4">
                <div
                  className="relative w-36 h-36"
                  onMouseLeave={() => setHoveredCat(null)}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                    {(() => {
                      let acc = 0;
                      return SPENDING_CATEGORIES.map((c, i) => {
                        const start = acc;
                        const end = acc + c.pct;
                        acc = end;
                        const path = donutArcPath(start, end, 50, 28, 50, 50);
                        const dim = hoveredCat !== null && hoveredCat !== i;
                        return (
                          <path
                            key={c.label}
                            d={path}
                            fill={c.color}
                            opacity={dim ? 0.35 : 1}
                            style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                            onMouseEnter={() => setHoveredCat(i)}
                            onClick={() => setHoveredCat(prev => prev === i ? null : i)}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-inner px-1 text-center">
                      {hoveredCat !== null ? (
                        <>
                          <span className="text-[10px] text-gray-500 leading-tight truncate max-w-[68px]">
                            {SPENDING_CATEGORIES[hoveredCat].label}
                          </span>
                          <span
                            className="font-bold text-sm leading-tight mt-0.5"
                            style={{ color: SPENDING_CATEGORIES[hoveredCat].color }}
                          >
                            {SPENDING_CATEGORIES[hoveredCat].pct}%
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] text-gray-500">월 평균 소비</span>
                          <span className="font-bold text-gray-800 text-sm">98.5만</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { color: 'bg-red-500',     label: '식비 (배달 등)', pct: '42%', amount: '413,210원', bold: true },
                  { color: 'bg-blue-500',    label: '문화/여가',       pct: '15%', amount: '180,800원' },
                  { color: 'bg-purple-500',  label: '온라인 쇼핑',     pct: '17%', amount: '116,300원' },
                  { color: 'bg-emerald-500', label: '교통',            pct: '8%',  amount: '80,000원'  },
                ].map(({ color, label, pct, amount, bold }) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      {label} <span className="text-xs text-gray-400">{pct}</span>
                    </span>
                    <span className={bold ? 'font-semibold text-gray-800' : 'text-gray-600'}>{amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-sm text-gray-700">매월 나가는 고정 지출</span>
                <span className="font-bold text-gray-800">월 245,000원</span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label: '보장성 보험료',    amount: '150,000원' },
                  { label: '통신비',          amount: '65,000원'  },
                  { label: 'OTT 및 정기구독', amount: '30,000원'  },
                ].map(({ label, amount }) => (
                  <div key={label} className="flex justify-between text-gray-600">
                    <span>{label}</span>
                    <span>{amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleDetail('spending')}
              className="w-full flex justify-between items-center px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition active:scale-[0.98]"
            >
              <span>자세한 설명 보기</span>
              {openDetail.spending ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openDetail.spending && (
              <div className="relative bg-blue-50 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed text-blue-900 speech-bubble animate-in fade-in slide-in-from-top-1">
                매월 고정적으로 나가는 지출(24.5만 원) 외의 변동 지출 통제를 잘하고 계세요! 다만, 변동 지출 중 가장 큰 비중을 차지하는 <strong>식비(특히 배달앱)</strong>가 유독 눈에 띄네요. 규칙적인 수영 페이스처럼 배달 횟수도 일주일에 1번으로 규칙을 정해보는 건 어떨까요?
              </div>
            )}
          </section>

          {/* 투자 성향 매칭 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">투자 성향 매칭</h3>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-3 text-center">설문(안전 추구) vs 실제 계좌 내역</p>
              <div className="h-8 w-full bg-gray-100 rounded-lg overflow-hidden flex mb-2">
                <div className="bg-blue-400 h-full flex items-center justify-center text-white text-xs font-bold animate-fill-bar" style={{ width: '25%' }}>
                  안전 25%
                </div>
                <div className="bg-purple-500 h-full flex items-center justify-center text-white text-xs font-bold animate-fill-bar" style={{ width: '75%' }}>
                  위험 75%
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>예적금, 채권</span>
                <span>국내외 주식, 코인</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleDetail('investment')}
              className="w-full flex justify-between items-center px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition active:scale-[0.98]"
            >
              <span>자세한 설명 보기</span>
              {openDetail.investment ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openDetail.investment && (
              <div className="relative bg-blue-50 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed text-blue-900 speech-bubble animate-in fade-in slide-in-from-top-1">
                설문에서는 <strong>'원금 손실을 두려워하는 성향'</strong>이셨는데, 현재 마이데이터를 보면 주식 비중이 75%로 변동성이 다소 큰 상태예요. 수영 타입답게 예적금이나 배당 ETF 비중을 늘려 레인을 튼튼하게 만들어볼까요?
              </div>
            )}
          </section>

          {/* 저축 안전망 체크 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">저축 목록 체크</h3>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-gray-500 mb-4 text-center">내 저축은 얼마나 자유로울까?</p>
              <div className="flex justify-between text-xs font-semibold mb-2 px-1">
                <span className="text-blue-500">입출금/CMA</span>
                <span className="text-emerald-600">예금/적금</span>
                <span className="text-gray-500">주택청약</span>
              </div>
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-blue-400 h-full animate-fill-bar" style={{ width: '8%' }} />
                <div className="bg-emerald-400 h-full animate-fill-bar border-l border-white/30" style={{ width: '72%' }} />
                <div className="bg-gray-300 h-full animate-fill-bar border-l border-white/30" style={{ width: '20%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1">
                <span>8% (언제든 뺌)</span>
                <span>72% (만기 필요)</span>
                <span>20% (절대 못 뺌)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleDetail('saving')}
              className="w-full flex justify-between items-center px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition active:scale-[0.98]"
            >
              <span>자세한 설명 보기</span>
              {openDetail.saving ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openDetail.saving && (
              <div className="relative bg-blue-50 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed text-blue-900 speech-bubble animate-in fade-in slide-in-from-top-1">
                설문에서 나타난 <strong>'안전 지향'</strong> 성향이 실제 계좌에도 뚜렷하게 보이고 있어요. 전체 저축의 92%가 예적금과 청약에 단단히 묶여 있어 기본기가 매우 탄탄합니다.<br />
                반면, 언제든 쓸 수 있는 유동성 자산(비상금)은 8%로, 단기적인 유연성보다는 돈을 확실하게 묶어두는 방식을 선호하고 계시네요.
              </div>
            )}
          </section>

        </main>

        {/* 하단 고정 버튼 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 pt-4 pb-6 z-20 shrink-0">
          <button
            onClick={() => navigate('/prescription-intro')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2 active:scale-95"
          >
           AI 자산 처방전 받기 <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );

  // ── 질문 ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col shadow-2xl">

        {/* 진행 게이지 */}
        <div className="w-full h-2 bg-gray-100 shrink-0">
          <div
            className="h-full bg-red-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
          {/* 문항 번호 */}
          <p className="text-xs text-gray-400 text-right mb-2">
            {currentIndex + 1} / {TOTAL_QUESTIONS}
          </p>

          {/* 질문 영역 */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {currentQ.bubble ? (
              <>
                <p className="text-xs text-gray-400 text-center">{currentQ.context}</p>
                <div className="flex justify-start w-full max-w-[280px]">
                  <div className="bg-yellow-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <p className="text-sm text-gray-800 leading-relaxed">{currentQ.bubble}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-lg font-bold text-gray-800 text-center leading-snug whitespace-pre-line">
                {currentQ.context}
              </p>
            )}
          </div>

          {/* A / B 선택지 */}
          <div className="space-y-3 shrink-0">
            <button
              onClick={() => handleAnswer('A')}
              className="w-full text-left px-5 py-4 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border-2 border-gray-100 transition active:scale-[0.98]"
            >
              <span className="text-xs font-bold text-blue-400 mr-2">A.</span>
              <span className="text-sm text-gray-700">{currentQ.optionA}</span>
            </button>
            <button
              onClick={() => handleAnswer('B')}
              className="w-full text-left px-5 py-4 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border-2 border-gray-100 transition active:scale-[0.98]"
            >
              <span className="text-xs font-bold text-blue-400 mr-2">B.</span>
              <span className="text-sm text-gray-700">{currentQ.optionB}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
