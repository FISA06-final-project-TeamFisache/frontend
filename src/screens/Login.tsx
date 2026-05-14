import { useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuthToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const token = await login(email, password);
      setAuthToken(token);
      navigate('/linking');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-900 to-gray-900 h-screen overflow-hidden flex flex-col font-sans border shadow-xl relative text-white">
      <div className="px-6 py-8 animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
        <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition mb-6 active:scale-95">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold mb-2">로그인</h2>
        <p className="text-blue-200 text-sm mb-10">등록하신 이메일과 비밀번호를 입력해주세요.</p>

        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">이메일</label>
            <input type="email" placeholder="이메일 입력" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">비밀번호</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} onKeyDown={(e) => e.key === 'Enter' && !isLoading && email && password && handleLogin()} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </div>

        <button onClick={handleLogin} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 mt-6 transition shadow-lg disabled:opacity-50 active:scale-95" disabled={!email || !password || isLoading}>
          {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> 로그인 중...</> : '로그인하고 자산 연결하기'}
        </button>
      </div>
    </div>
  );
}
