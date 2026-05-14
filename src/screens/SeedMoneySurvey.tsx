import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, X } from 'lucide-react';
import { useAccounts } from '../contexts/AccountsContext';

// URL: /seed-money-survey
// Wizard에서 '종잣돈 모으기' 선택 시 진입하는 투자 성향 설문
// 완료 시: 추천 라우팅을 AccountsContext에 저장 → /wizard 로 복귀
export default function SeedMoneySurvey() {
  const navigate = useNavigate();
  const { availableAccounts, setRoutingSetup } = useAccounts();

  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<number[]>([]);

  const handleSurveyAnswer = (score: number) => {
    const newAnswers = [...surveyAnswers, score];
    setSurveyAnswers(newAnswers);
    setSurveyStep(surveyStep === 0 ? 1 : 2);
  };

  const getSurveyResult = () => {
    const totalScore = surveyAnswers.reduce((a, b) => a + b, 0);
    if (totalScore === 2) return { title: '야수의 심장 (공격투자형)', stock: 80, bond: 10, cash: 10, desc: '고수익을 위해 변동성을 감내하는 공격적 투자 성향입니다.' };
    if (totalScore === 1) return { title: '신중한 호랑이 (중도형)', stock: 50, bond: 30, cash: 20, desc: '적절한 성장과 안정성을 동시에 추구하는 밸런스형 성향입니다.' };
    return { title: '흔들리지 않는 바위 (안정형)', stock: 20, bond: 60, cash: 20, desc: '원금 보존과 안정적인 수익을 최우선으로 생각하는 성향입니다.' };
  };

  const result = getSurveyResult();

  const handleApplyRecommendation = () => {
    setRoutingSetup([
      { id: Date.now(), accountId: availableAccounts[0].id, tag: '공격 투자형', percent: result.stock },
      { id: Date.now() + 1, accountId: availableAccounts[1].id, tag: '안전 방어형', percent: result.bond },
      { id: Date.now() + 2, accountId: availableAccounts[5].id, tag: '비상금 파킹', percent: result.cash },
    ]);
    navigate('/wizard/budget');
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 h-screen overflow-hidden flex flex-col font-sans border shadow-xl relative">
      <button onClick={() => navigate('/wizard')} className="absolute top-5 right-5 p-2 rounded-full bg-gray-200 text-gray-600 z-10 hover:bg-gray-300 transition">
        <X className="w-5 h-5" />
      </button>
      <div className="px-6 pb-8 pt-16 flex flex-col h-full">
        <div className="shrink-0 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-600" /> 종잣돈 모으기 설문
          </h2>
          <p className="text-sm text-gray-500 mt-2">투자 성향을 진단하고,<br/>맞춤형 월급 분배(리밸런싱) 비율을 추천받아보세요.</p>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          {surveyStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="space-y-2">
                <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">질문 1/2</span>
                <h4 className="text-xl font-bold text-gray-900 leading-tight">투자한 주식이 하루 만에<br/>-15% 폭락했다면?</h4>
              </div>
              <div className="space-y-3 mt-8">
                <button onClick={() => handleSurveyAnswer(1)} className="w-full p-5 border-2 border-gray-200 rounded-2xl text-left hover:border-purple-500 hover:bg-purple-50 transition shadow-sm active:scale-95">
                  <p className="font-bold text-gray-800 text-sm">바겐세일이다! 오히려 추가 매수한다.</p>
                </button>
                <button onClick={() => handleSurveyAnswer(0)} className="w-full p-5 border-2 border-gray-200 rounded-2xl text-left hover:border-purple-500 hover:bg-purple-50 transition shadow-sm active:scale-95">
                  <p className="font-bold text-gray-800 text-sm">더 떨어지기 전에 일단 전량 매도한다.</p>
                </button>
              </div>
            </div>
          )}

          {surveyStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="space-y-2">
                <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">질문 2/2</span>
                <h4 className="text-xl font-bold text-gray-900 leading-tight">당신이 바라는 5년 뒤의<br/>가장 이상적인 자산 상태는?</h4>
              </div>
              <div className="space-y-3 mt-8">
                <button onClick={() => handleSurveyAnswer(1)} className="w-full p-5 border-2 border-gray-200 rounded-2xl text-left hover:border-purple-500 hover:bg-purple-50 transition shadow-sm active:scale-95">
                  <p className="font-bold text-gray-800 text-sm">위험을 감수하더라도 원금 2배 달성</p>
                </button>
                <button onClick={() => handleSurveyAnswer(0)} className="w-full p-5 border-2 border-gray-200 rounded-2xl text-left hover:border-purple-500 hover:bg-purple-50 transition shadow-sm active:scale-95">
                  <p className="font-bold text-gray-800 text-sm">안전하게 이자와 배당으로 현금흐름 창출</p>
                </button>
              </div>
            </div>
          )}

          {surveyStep === 2 && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300 text-center flex flex-col h-full">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 mt-4 shrink-0">
                <Target className="w-10 h-10 text-purple-600" />
              </div>
              <div className="shrink-0">
                <p className="text-xs text-gray-500 font-bold mb-1">분석 완료!</p>
                <h4 className="text-2xl font-extrabold text-gray-900">{result.title}</h4>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                  {result.desc}
                </p>
              </div>
              <div className="border-2 border-purple-100 rounded-2xl p-5 bg-white shadow-sm flex divide-x divide-gray-100 text-center shrink-0">
                <div className="flex-1"><p className="text-xs text-red-500 font-bold mb-1">공격 투자</p><p className="font-extrabold text-lg text-gray-900">{result.stock}%</p></div>
                <div className="flex-1"><p className="text-xs text-blue-500 font-bold mb-1">안전 방어</p><p className="font-extrabold text-lg text-gray-900">{result.bond}%</p></div>
                <div className="flex-1"><p className="text-xs text-green-500 font-bold mb-1">현금 파킹</p><p className="font-extrabold text-lg text-gray-900">{result.cash}%</p></div>
              </div>
              <div className="mt-auto pt-4 shrink-0">
                <button onClick={handleApplyRecommendation} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold shadow-md transition active:scale-95">
                  초기 자본 설정하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
