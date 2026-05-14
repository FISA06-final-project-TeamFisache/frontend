import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-900 to-gray-900 h-screen overflow-hidden flex flex-col items-center justify-center font-sans border shadow-xl relative text-white">
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 text-center space-y-6 px-8 w-full">
        <div className="w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center mx-auto mb-8 border border-white/20">
          <ShieldCheck className="w-10 h-10 text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">WooriPort</h1>
        <p className="text-blue-200 text-sm leading-relaxed">
          나의 모든 자산을 한곳에 모으고,<br/>AI가 제안하는 완벽한 미래를 만나보세요.
        </p>
        <div className="pt-12 space-y-4 w-full">
          <button onClick={() => navigate('/login')} className="w-full bg-white hover:bg-gray-100 text-blue-900 py-4 rounded-xl font-bold transition shadow-lg active:scale-95">
            로그인
          </button>
          <div className="pt-4">
            <button onClick={() => navigate('/signup')} className="text-sm text-blue-300 hover:text-white underline underline-offset-4 transition">
              아직 계정이 없으신가요? 회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
