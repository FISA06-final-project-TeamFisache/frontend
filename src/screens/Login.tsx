import { ChevronLeft } from 'lucide-react';

type LoginProps = {
  loginData: { id: string; password: string };
  setLoginData: (data: { id: string; password: string }) => void;
  setAppState: (s: string) => void;
};

export default function Login({ loginData, setLoginData, setAppState }: LoginProps) {
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-900 to-gray-900 h-screen overflow-hidden flex flex-col font-sans border shadow-xl relative text-white">
      <div className="px-6 py-8 animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
        <button onClick={() => setAppState('welcome')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition mb-6 active:scale-95">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold mb-2">로그인</h2>
        <p className="text-blue-200 text-sm mb-10">등록하신 아이디와 비밀번호를 입력해주세요.</p>

        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">아이디</label>
            <input type="text" placeholder="아이디 입력" value={loginData.id} onChange={(e) => setLoginData({ ...loginData, id: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-300 mb-2 ml-1">비밀번호</label>
            <input type="password" placeholder="••••••••" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-4 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        <button onClick={() => setAppState('linking')} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 mt-6 transition shadow-lg disabled:opacity-50 active:scale-95" disabled={!loginData.id || !loginData.password}>
          로그인하고 자산 연결하기
        </button>
      </div>
    </div>
  );
}
