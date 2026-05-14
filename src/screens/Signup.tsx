import { useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api/authApi';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (): string | null => {
    if (!EMAIL_REGEX.test(email)) return '올바른 이메일 형식이 아닙니다.';
    if (!PASSWORD_REGEX.test(password)) return '비밀번호는 8~20자의 영문, 숫자, 특수문자 조합이어야 합니다.';
    return null;
  };

  const handleSignup = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await signup({ email, password, name, phone: phone || undefined });
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = name && email && password && !isLoading;

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-900 to-gray-900 h-screen overflow-hidden flex flex-col font-sans border shadow-xl relative text-white">
      <div className="px-6 py-8 animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
        <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition mb-6 active:scale-95">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold mb-2">회원가입</h2>
        <p className="text-blue-200 text-sm mb-10">WooriPort와 함께 자산 관리를 시작하세요.</p>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">이름</label>
            <input type="text" placeholder="홍길동" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">이메일</label>
            <input type="email" placeholder="test@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">비밀번호</label>
            <input type="password" placeholder="8~20자 영문/숫자/특수문자 조합" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">휴대폰 번호 <span className="text-blue-200/60 font-normal">(선택)</span></label>
            <input type="tel" placeholder="010-1234-5678" value={phone} onChange={(e) => { setPhone(e.target.value); setError(''); }} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </div>

        <button onClick={handleSignup} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 mt-6 transition shadow-lg disabled:opacity-50 active:scale-95" disabled={!canSubmit}>
          {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> 가입 중...</> : '가입 완료하고 자산 연결하기'}
        </button>
      </div>
    </div>
  );
}
