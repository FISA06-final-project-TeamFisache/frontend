import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero.png';
import { useAuth } from '../contexts/AuthContext';

const DISPLAY_MS = 3500;
const FADE_MS = 500;

export default function PrescriptionIntro() {
  const { userName: USER_NAME } = useAuth();
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
    <div className="min-h-screen bg-white flex justify-center font-sans overflow-hidden">
      <div
        className={`w-full max-w-[390px] min-h-screen flex flex-col items-center justify-center px-10 gap-6 transition-opacity duration-500 ${exiting ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* 제목 */}
        <h1
          className="text-2xl font-bold text-slate-800 text-center animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          {USER_NAME}님을&nbsp; 파악했어요
        </h1>

        {/* 서브 텍스트 */}
        <p
          className="text-base text-slate-500 text-center leading-relaxed animate-slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          매달 월급이 들어올 때<br />
          어느 통장에 얼마씩 넣으면 좋을지
        </p>

        {/* 점선 원 + 마스코트 */}
        <div
          className="relative flex items-center justify-center w-52 h-52 animate-slide-up"
          style={{ animationDelay: '0.6s' }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-blue-300 animate-spin [animation-duration:6s]" />
          <img src={heroImg} alt="Pori" className="w-36 h-36 object-contain relative z-10" />
        </div>

        {/* 하단 텍스트 */}
        <p
          className="text-lg font-semibold text-slate-700 text-center animate-slide-up"
          style={{ animationDelay: '0.9s' }}
        >
          <span className="text-blue-600 font-bold">Pori</span>가 먼저 나눠드릴게요.
        </p>
      </div>
    </div>
  );
}
