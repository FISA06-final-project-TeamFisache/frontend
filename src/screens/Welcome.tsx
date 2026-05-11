import { useState, useEffect } from 'react';
import porty from '../assets/porty.png';

type WelcomeProps = {
  setAppState: (s: string) => void;
};

export default function Welcome({ setAppState }: WelcomeProps) {
  const [isSplash, setIsSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setIsSplash(false), 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // 스플래시 화면
  if (isSplash) {
    return (
      <div
        className={`max-w-md mx-auto bg-white h-screen flex flex-col items-center justify-center transition-opacity duration-500 ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <img src={porty} alt="WooriPort 마스코트" className="w-48 h-48 object-contain mb-6" />
        <h1
          className="text-4xl font-bold text-blue-500 mb-2"
          style={{ fontFamily: 'WooriDaum', fontWeight: 700 }}
        >
          WooriPort
        </h1>
        <p
          className="text-blue-400 text-sm"
          style={{ fontFamily: 'WooriDaum', fontWeight: 400 }}
        >
          나의 첫 자산관리 매니저
        </p>
      </div>
    );
  }

  // 로그인/회원가입 화면
  return (
    <div className="max-w-md mx-auto bg-white h-screen flex flex-col items-center justify-center animate-in fade-in duration-500">
      <h1
        className="text-4xl font-bold text-blue-500 mb-16"
        style={{ fontFamily: 'WooriDaum', fontWeight: 700 }}
      >
        WooriPort
      </h1>

      <div className="w-full px-12 space-y-5">
        <button
          onClick={() => setAppState('login')}
          className="w-full border-2 border-blue-400 text-blue-500 py-3 rounded-lg font-semibold text-base transition hover:bg-blue-50 active:scale-95"
          style={{ fontFamily: 'WooriDaum' }}
        >
          로그인
        </button>

        <div className="flex justify-center">
          <button
            onClick={() => setAppState('signup')}
            className="text-blue-400 text-sm underline underline-offset-4 hover:text-blue-600 transition"
            style={{ fontFamily: 'WooriDaum' }}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}