import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

type PromptProps = {
  userName: string;
  setAppState: (s: string) => void;
  startWizard: () => void;
  setActiveTab: (tab: string) => void;
};

export default function Prompt({ userName, setAppState, startWizard, setActiveTab }: PromptProps) {
  return (
    <div className="max-w-md mx-auto bg-white h-screen overflow-hidden flex flex-col font-sans border shadow-xl">
      <div className="flex-1 px-6 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">자산 연결 완료!</h2>
        <p className="text-gray-500 text-sm mb-6">
          {userName ? `${userName}님의 ` : '고객님의 '}
          총 자산 <strong>124,500,000원</strong>을 확인했습니다.
        </p>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-3xl border border-blue-100 w-full mb-8">
          <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">나만의 자산 설계를 시작해볼까요?</h3>
          <p className="text-xs text-gray-600 leading-relaxed">자산 데이터 분석은 끝났습니다.<br/>AI 네비게이터와 함께 목표에 맞는<br/>첫 자산 설계를 시작해 볼까요?</p>
        </div>

        <div className="w-full space-y-3">
          <button onClick={() => { setAppState('main'); startWizard(); }} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-md active:scale-95">
            네, 자산 설계 시작할게요 <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => { setAppState('main'); setActiveTab('home'); }} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-4 rounded-xl font-bold border border-gray-200 transition active:scale-95">
            아니요, 대시보드만 먼저 볼게요
          </button>
        </div>
      </div>
    </div>
  );
}
