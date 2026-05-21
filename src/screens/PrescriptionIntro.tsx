import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const USER_NAME = '서태형'; // TODO: 인증 컨텍스트에서 실제 이름 가져오기
const DISPLAY_MS = 3500;
const FADE_MS = 500;

export default function PrescriptionIntro() {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setExiting(true), DISPLAY_MS);
    const navTimer = setTimeout(() => navigate('/asset-prescription', { replace: true }), DISPLAY_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans overflow-hidden">
      <main className={`px-6 text-center w-full max-w-md mx-auto relative flex flex-col items-center ${exiting ? 'page-exit' : ''}`}>

        {/* 고래 아이콘 영역 */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <span className="text-4xl animate-floating">🐳</span>
          </div>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-5 animate-slide-up text-slate-800" style={{ animationDelay: '0.4s' }}>
          "{USER_NAME} 님을 파악했어요!"
        </h1>

        {/* 서브 텍스트 */}
        <p className="text-[1.1rem] sm:text-lg text-slate-600 leading-relaxed animate-slide-up font-medium" style={{ animationDelay: '0.7s' }}>
          매달 월급이 들어올 때<br />
          어느 통장에 얼마씩 넣으면 좋을지<br />
          <span className="text-blue-600 font-bold">Pori</span>가 먼저 나눠드릴게요.
        </p>

        {/* 로딩 스피너 */}
        <div className="mt-14 animate-slide-up" style={{ animationDelay: '1s' }}>
          <div className="w-8 h-8 border-[3px] border-slate-100 border-t-blue-500 rounded-full animate-spin" />
        </div>

      </main>
    </div>
  );
}
