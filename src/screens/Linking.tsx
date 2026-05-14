import { useState } from 'react';
import { Link2, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Linking() {
  const navigate = useNavigate();
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkAccounts = () => {
    setIsLinking(true);
    // TODO: 실제 마이데이터 연동 API로 교체
    setTimeout(() => {
      setIsLinking(false);
      navigate('/salary-select');
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto bg-white h-screen overflow-hidden flex flex-col font-sans border shadow-xl">
      <div className="flex-1 px-6 py-12 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <Link2 className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">흩어진 내 자산을<br/>한 번에 연결할까요?</h2>
        <p className="text-sm text-gray-500 mb-8">마이데이터를 통해 안전하게 불러옵니다.</p>

        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4 flex-1">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <span className="font-bold text-gray-700">전체 동의 및 연결</span>
            <CheckCircle2 className="text-blue-600 w-5 h-5" />
          </div>
          {['은행 계좌 (12개)', '증권/투자 (4개)', '카드/페이 (6개)'].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm text-gray-600">
              <span>{item}</span>
              <CheckCircle2 className="text-gray-300 w-4 h-4" />
            </div>
          ))}
        </div>

        <button onClick={handleLinkAccounts} disabled={isLinking} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 mt-6 transition shadow-lg shadow-blue-200 active:scale-95">
          {isLinking ? <><Loader2 className="w-5 h-5 animate-spin" /> 데이터를 불러오는 중...</> : '1분 만에 모두 연결하기'}
        </button>
      </div>
    </div>
  );
}
