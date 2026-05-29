import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, PieChart, ShieldCheck, ArrowRight, ChevronDown, ChevronUp, Download } from 'lucide-react';
import heroImg    from '../assets/hero.png';
import portiImg   from '../assets/porti.png';
import swimporiImg    from '../assets/Swimpori.png';
import golfporiImg    from '../assets/Golfpori.png';
import cycleporiImg   from '../assets/CyclePori.png';
import judoporiImg    from '../assets/JudoPori.png';
import fencingporiImg from '../assets/FencingPori.png';
import archeryporiImg from '../assets/Archerypori.png';
import { useAuth } from '../contexts/AuthContext';
import { savePortiType, type PortiType } from '../api/userApi';


const TOTAL_QUESTIONS = 10;

// 카테고리별 지출 도넛 차트 데이터
const SPENDING_CATEGORIES = [
  { color: '#ef4444', label: '식비 (배달 등)', pct: 42 },
  { color: '#3b82f6', label: '문화/여가',       pct: 15 },
  { color: '#8b5cf6', label: '온라인 쇼핑',     pct: 17 },
  { color: '#10b981', label: '교통',            pct: 8  },
  { color: '#e5e7eb', label: '기타',            pct: 18 },
];

// 도넛 segment SVG path 생성기
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
    context: '기다리던 보너스가 통장에 찍혔어!' + '\n' +'제일 먼저 드는 생각은?',
    optionA: '"드디어 이거 살 수 있겠다!" 쓸 곳이 바로 떠올라',
    optionB: '"일단 넣어두자." 보기만 해도 든든해',
  },
  {
    id: 2,
    context: '매달 저축할 때 내 스타일에 가까운 건?',
    optionA: '월 얼마씩 모을지 세운 계획이 있어',
    optionB: '생활비 쓰고 남은 돈 전부 저축해',
  },
  {
    id: 3,
    context: '친구의 "너 왜 돈 모아?" 라는 질문에' + '\n' + '내 대답은?',
    optionA: '사고 싶은 거, 하고 싶은 거 - 원하는 걸 위해서',
    optionB: '갑자기 아프거나 급전 필요할 때를 대비하려고',
  },
  {
    id: 4,
    context: '앞으로 3년 안에 해당되는 게 있어?',
    optionA: '결혼, 이사, 독립, 차 구매 — 목돈 나갈 일',
    optionB: '딱히 없어, 아직은 먼 일 같아',
  },
  {
    id: 5,
    context: '큰맘 먹고 산 주식이 다음 날 -15% 됐어.' + '\n' + '어떡해?',
    optionA: '스트레스!!! 일단 팔거나, 앱 지우고 안 보려고 해',
    optionB: '오히려 기회! 여유 자금으로 더 살까 고민해',
  },
  {
    id: 6,
    context: '은행원이 두 가지 상품을 추천해줬어.' + '\n' + '둘 중에 고른다면?',
    optionA: '연 4%, 원금 100% 보장 안전한 예적금',
    optionB: '원금 손실 가능성 있지만 연 12% 예상 투자 상품',
  },
  {
    id: 7,
    context: '요즘 핫하다는 그 주식' + '\n' + '내 스타일은?',
    optionA: '유튜브, 블로그 찾아보고 리스크 이해한 다음 시작',
    optionB: '일단 5만 원이라도 넣어보고 직접 움직임 지켜봐',
  },
  {
    id: 8,
    context: '나도 모르게 클릭할 것 같은 유튜브 영상은?',
    optionA: '"월 200 직장인, 적금만으로 2년 만에 전세 보증금 모은 비법"',
    optionB: '"28살 사회초년생, 주식 300만 원으로 시작해서 1년 수익 공개"',
  },
  {
    id: 9,
    context: '내가 바라는 이상적인 돈 관리는?',
    optionA: '월급 누가 관리해줬으면... 나는 신경 끄고 살래',
    optionB: '매주 자산 체크하고, 직접 굴리고 컨트롤하고 싶어',
  },
  {
    id: 10,
    context: '내 재테크 슬로건을 고른다면?',
    optionA: '"쓸 땐 쓰고 모을 땐 모은다" 누릴 건 누리면서',
    optionB: '"젊을 때 바짝 모아야지" 지금 참고 시드머니 먼저',
  },
];

interface ResultType {
  typeName: string;
  img: string;
  subtitle: string;
  spending: string;
  investment: string;
  saving: string;
}

// 0:수영 1:골프 2:사이클 3:유도 4:펜싱 5:양궁
const RESULT_TYPES: ResultType[] = [
  {
    typeName: '수영하는 Pori',
    img: swimporiImg,
    subtitle: '기본기에 충실한, 레인을 벗어나지 않는 타입',
    spending:  '식비·교통비 위주의 안정적인 지출 패턴이에요. 충동 소비 흔적이 거의 없고, 꼭 필요한 곳에만 쓰는 편이에요.',
    investment: '안전한 예적금을 선호하고, 원금 손실에 예민해요. 작더라도 확실한 수익이 심리적으로 잘 맞아요.',
    saving: '꾸준한 적금 납입을 통해 자산을 착실히 쌓고 있어요. 계획한 금액을 빠짐없이 모으는 타입이에요.',
  },
  {
    typeName: '골프 치는 Pori',
    img: golfporiImg,
    subtitle: '전략적으로 즐기는, 삶의 질을 고려하는 타입',
    spending:  '경험·여가에 아낌없이 쓰는 편이에요. 단, 가치 있다고 판단한 소비에만 집중하는 선택형 지출 스타일이에요.',
    investment: '수익과 리스크 사이에서 전략적으로 접근해요. 무턱대고 뛰어들기보단 타이밍을 잡는 편이에요.',
    saving: '목돈 마련 계획을 세우고, 지출과 저축을 균형 있게 배분하는 포트폴리오형 관리가 잘 맞아요.',
  },
  {
    typeName: '사이클 타는 Pori',
    img: cycleporiImg,
    subtitle: '묵묵히 자신의 페달 밟는, 장거리 레이서 타입',
    spending:  '지금 당장보다 미래를 위해 소비를 절제하는 편이에요. 장기 목표를 향해 꾸준히 달리는 스타일이에요.',
    investment: '성장형 자산에 관심이 높고, 장기 우상향을 믿으며 시장 변동에 흔들리지 않아요.',
    saving: '여러 목적 통장을 분산 운영하며 목표별로 저축을 관리해요. 복리의 힘을 믿는 타입이에요.',
  },
  {
    typeName: '유도하는 Pori',
    img: judoporiImg,
    subtitle: '자산을 안전하게 지킬 줄 아는, 수비형 재테크 타입',
    spending:  '불필요한 지출을 잘 참는 편이에요. 무언가 사기 전에 한 번 더 생각하는 신중한 소비자예요.',
    investment: '리스크보다 안전을 최우선으로 해요. 원금 보장 상품과 예금 위주로 자산을 지키는 타입이에요.',
    saving: '비상금을 두둑이 쌓아두는 걸 좋아하고, 언제든 꺼낼 수 있는 유동성을 중요하게 여겨요.',
  },
  {
    typeName: '펜싱하는 Pori',
    img: fencingporiImg,
    subtitle: '빠른 판단으로 과감하게, 선제 공격형 투자 타입',
    spending:  '소비도 투자도 빠른 결정이 특기예요. 직관을 믿고 행동하는 편이라 가끔 충동 소비도 나타나요.',
    investment: '리스크를 감수하더라도 높은 수익을 추구해요. 시장 기회를 빠르게 포착하는 공격형 투자자예요.',
    saving: '저축보다 투자 비중이 높은 편이에요. 목돈을 만들면 곧바로 굴리고 싶어 하는 타입이에요.',
  },
  {
    typeName: '양궁 쏘는 Pori',
    img: archeryporiImg,
    subtitle: '한 발 한 발 신중하게 겨냥하는, 정밀 조준 타입',
    spending:  '목표에 필요한 것만 정밀하게 소비해요. 즉흥적인 지출은 거의 없고, 가성비와 효율을 중요시해요.',
    investment: '투자 전 철저히 분석하고, 리스크 대비 수익률을 계산한 뒤 결정해요. 감이 아닌 근거로 투자해요.',
    saving: '구체적인 목표 금액과 기간을 정해두고 역산으로 저축 계획을 세워요. 목표 달성률이 높은 타입이에요.',
  },
];

function calcResult(answers: Record<number, 'A' | 'B'>): ResultType {
  const B = (q: number) => answers[q] === 'B';
  const A = (q: number) => answers[q] === 'A';

  // Risk: Q5B, Q6B, Q8B (높을수록 위험선호)
  const risk = [B(5), B(6), B(8)].filter(Boolean).length;
  // Goal/Discipline: Q2A(계획), Q4A(근접목표), Q9B(적극관리)
  const goal = [A(2), A(4), B(9)].filter(Boolean).length;

  const hiRisk = risk >= 2;
  const hiGoal = goal >= 2;

  if (!hiRisk && !hiGoal) return RESULT_TYPES[3]; // 유도
  if (!hiRisk &&  hiGoal) return RESULT_TYPES[0]; // 수영
  if ( hiRisk && !hiGoal) return RESULT_TYPES[4]; // 펜싱
  // hiRisk + hiGoal → 세 가지 세분화
  if (A(7) && B(10)) return RESULT_TYPES[5];      // 양궁 (분석+공격저축)
  if (A(1) || A(10)) return RESULT_TYPES[1];      // 골프 (소비+균형)
  return RESULT_TYPES[2];                          // 사이클 (장기성장)
}

type Step = 'intro' | 'question' | 'loading' | 'result';


export default function PortiSurvey() {
  const { userName: USER_NAME } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [completing, setCompleting] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [openDetail, setOpenDetail] = useState<Record<'spending' | 'investment' | 'saving', boolean>>({
    spending: false,
    investment: false,
    saving: false,
  });
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);

  const toggleDetail = (key: 'spending' | 'investment' | 'saving') =>
    setOpenDetail(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSaveImage = () => {
    if (!result) return;
    const W = 390;
    const pad = 28;
    const img = new Image();
    img.src = result.img;
    img.onload = () => {
      const imgW = W - pad * 2;
      const imgH = Math.round((img.naturalHeight / img.naturalWidth) * imgW);
      const titleH = 64;
      const subtitleH = 56;
      const H = pad + titleH + imgH + subtitleH + pad;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      // title
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(result.typeName, W / 2, pad + 36);
      // image
      const iy = pad + titleH;
      ctx.save();
      const r = 16;
      ctx.beginPath();
      ctx.moveTo(pad + r, iy);
      ctx.lineTo(pad + imgW - r, iy);
      ctx.quadraticCurveTo(pad + imgW, iy, pad + imgW, iy + r);
      ctx.lineTo(pad + imgW, iy + imgH - r);
      ctx.quadraticCurveTo(pad + imgW, iy + imgH, pad + imgW - r, iy + imgH);
      ctx.lineTo(pad + r, iy + imgH);
      ctx.quadraticCurveTo(pad, iy + imgH, pad, iy + imgH - r);
      ctx.lineTo(pad, iy + r);
      ctx.quadraticCurveTo(pad, iy, pad + r, iy);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, pad, iy, imgW, imgH);
      ctx.restore();
      // subtitle
      ctx.fillStyle = '#abc7fe';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(result.subtitle, W / 2, iy + imgH + 34);
      const link = document.createElement('a');
      link.download = `PorTI_${result.typeName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  const currentQ = QUESTIONS[currentIndex];
  const progress = completing ? 100 : (currentIndex / TOTAL_QUESTIONS) * 100;

  // 로딩 → 결과 자동 전환 및 API 저장
  useEffect(() => {
    if (step !== 'loading') return;

    // 1. 클라이언트에서 결과 계산 (API 의존 없음)
    const localResult = calcResult(answers);

    const PORTI_TYPE_MAP: Record<string, PortiType> = {
      '수영하는 Pori': 'SWIMMING',
      '골프 치는 Pori': 'RHYTHMIC',
      '사이클 타는 Pori': 'CYCLING',
      '유도하는 Pori': 'JUDO',
      '펜싱하는 Pori': 'FENCING',
      '양궁 쏘는 Pori': 'ARCHERY',
    };
    const portiType = PORTI_TYPE_MAP[localResult.typeName] ?? 'SWIMMING';

    // 2. 백엔드에 저장 (PATCH /users/porti-survey) — 실패해도 화면 전환은 진행
    savePortiType(portiType).catch((err) => {
      console.error('[PortiSurvey] portiType 저장 실패:', err);
    });

    // 3. 최소 로딩 시간(2.8초) 후 결과 화면으로 전환
    const timer = setTimeout(() => {
      setResult(localResult);
      setStep('result');
    }, 2800);

    return () => clearTimeout(timer);
  }, [step, answers]);

  const handleAnswer = (choice: 'A' | 'B') => {
    const newAnswers = { ...answers, [currentQ.id]: choice };
    setAnswers(newAnswers);

    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      // 마지막 문항: 게이지 100% 채우고 로딩으로 이동
      setCompleting(true);
      setTimeout(() => setStep('loading'), 700);
    }
  };

  // ── 인트로 ────────────────────────────────────────────────
  if (step === 'intro') return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col shadow-2xl px-8">

        {/* 상단: 텍스트 + 캐릭터 */}
        <div className="flex items-center justify-between pt-16 mb-10">
          <p className="text-xl font-bold text-gray-800 leading-snug">
            10개의 질문으로<br />당신을 파악할게요
          </p>
          <img
            src={portiImg}
            alt="Porti"
            className="w-32 h-32 object-contain animate-floating"
          />
        </div>

        {/* 타이틀 */}
        <div className="flex flex-col items-center gap-3 mb-auto pt-14">
          <h1 className="text-5xl font-bold text-blue-500 tracking-tight font-wooridaum">PorTI</h1>
          <p className="text-sm text-gray-400">나도 모르는 나의 소비·투자 성향 찾기</p>
        </div>

        {/* 시작 버튼 */}
        <div className="pb-12">
          <button
            onClick={() => setStep('question')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-blue-500 font-bold py-4 rounded-2xl text-lg transition active:scale-95"
          >
            검사 시작
          </button>
        </div>

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
        <main className="flex-1 px-5 py-6 space-y-6 overflow-y-auto pb-32">

          {/* 프로필 카드 */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-bold text-center">
              {USER_NAME} 님은{' '}
              <span className="text-blue-500">{result.typeName}</span>
            </h2>

            {/* 이미지 + 다운로드 버튼 */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-md">
              <img
                src={result.img}
                alt={result.typeName}
                className="w-full object-cover"
              />
              <button
                onClick={handleSaveImage}
                className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:bg-white transition active:scale-90"
                title="이미지 저장"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <p className="text-gray-800 font-medium bg-blue-100 inline-block px-4 py-2 rounded-full text-sm w-full text-center">
              {result.subtitle}
            </p>

            <button
              type="button"
              onClick={() => setShowProfile(prev => !prev)}
              className="w-full flex justify-between items-center px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition active:scale-[0.98]"
            >
              <span>자세한 설명 보기</span>
              {showProfile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showProfile && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                {[
                  { label: '소비', text: result.spending },
                  { label: '투자', text: result.investment },
                  { label: '저축', text: result.saving },
                ].map(({ label, text }) => (
                  <div key={label} className="bg-blue-100 rounded-2xl p-4 text-sm leading-relaxed text-blue-800">
                    <span className="font-bold mr-2">{label}</span>{text}
                  </div>
                ))}
              </div>
            )}
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
              // [AI 자동생성 필요] 소비 분석 텍스트 — 사용자 마이데이터 기반 자동 생성
              <div className="bg-blue-50 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed text-blue-900 animate-in fade-in slide-in-from-top-1">
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
              // [AI 자동생성 필요] 투자 성향 분석 텍스트 — 설문 결과 + 마이데이터 비교 기반 자동 생성
              <div className="bg-blue-50 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed text-blue-900 animate-in fade-in slide-in-from-top-1">
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
              // [AI 자동생성 필요] 저축 안전망 분석 텍스트 — 계좌 유동성 비율 기반 자동 생성
              <div className="bg-blue-50 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed text-blue-900 animate-in fade-in slide-in-from-top-1">
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
            맞춤형 월급 관리 받기 <ArrowRight className="w-5 h-5" />
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
