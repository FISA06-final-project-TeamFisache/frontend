import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const USER_NAME = '서태형'; // TODO: 인증 컨텍스트에서 실제 이름 가져오기
const DISPLAY_MS = 4000;
const FADE_MS = 500;

export default function PrescriptionComplete() {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setExiting(true), DISPLAY_MS);
    const navTimer = setTimeout(() => navigate('/asset-portfolio', { replace: true }), DISPLAY_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans overflow-hidden">
      <main className={`px-6 text-center w-full max-w-md mx-auto relative flex flex-col items-center ${exiting ? 'page-exit' : ''}`}>

        {/* 메인 타이틀 및 이모지 */}
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-8 animate-slide-up text-slate-800 flex items-center gap-2" style={{ animationDelay: '0.1s' }}>
          통장 나누기 완료! <span className="text-4xl animate-bounce-subtle">🎉</span>
        </h1>

        {/* 서브 텍스트 영역 */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-[1.1rem] sm:text-lg text-slate-600 leading-relaxed font-medium">
            이제 그 돈을 어떻게 불릴지 고민해봐요<br />
            {USER_NAME} 님 대신 <span className="text-blue-600 font-bold">Pori</span>가<br />
            전체 자산을 보고 전략을 제시해드릴게요.
          </p>

          <p className="text-[1.1rem] sm:text-lg text-slate-800 font-semibold animate-slide-up" style={{ animationDelay: '0.7s' }}>
            복잡한 건 <span className="text-blue-600">Pori</span>한테 맡기세요.
          </p>
        </div>

        {/* 로딩 스피너 */}
        <div className="mt-14 animate-slide-up" style={{ animationDelay: '1s' }}>
          <div className="w-8 h-8 border-[3px] border-slate-100 border-t-blue-500 rounded-full animate-spin" />
        </div>

      </main>
    </div>
  );
}
