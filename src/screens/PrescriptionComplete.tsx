import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import doctorImg from '../assets/doctor.png';

const DISPLAY_MS = 4000;
const FADE_MS = 500;

export default function PrescriptionComplete() {
  const { userName: USER_NAME } = useAuth();
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
    <div className="min-h-screen bg-white flex justify-center font-sans overflow-hidden">
      <div
        className={`w-full max-w-[390px] min-h-screen flex flex-col items-center justify-center px-10 gap-8 transition-opacity duration-500 ${exiting ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* 제목 */}
        <h1
          className="text-2xl font-bold text-blue-500 text-center animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          통장 나누기 완료
        </h1>

        {/* 마스코트 — 진입 후 위아래 float 애니메이션 */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <img
            src={doctorImg}
            alt="Pori 의사"
            className="w-52 h-52 object-contain animate-floating"
          />
        </div>

        {/* 메인 텍스트 */}
        <div className="space-y-4 text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-xl font-semibold text-slate-800 leading-snug">
            {USER_NAME} 님의 자산을<br />
            <span className="text-blue-500">어떻게 불릴지 고민중이에요</span>
          </p>

          <p className="text-base text-slate-500 leading-relaxed">
            Pori가 종합적으로 분석하여<br />
            전략을 제시해드릴게요.
          </p>

          <p className="text-base font-bold text-slate-800">
            복잡한 건 <span className="text-blue-500">Pori</span>한테 맡기세요.
          </p>
        </div>
      </div>
    </div>
  );
}
