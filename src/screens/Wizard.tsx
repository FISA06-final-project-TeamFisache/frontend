import { Routes, Route, Navigate } from 'react-router-dom';
import GoalType from './wizard/GoalType';
import Budget from './wizard/Budget';
import InitialFunding from './wizard/InitialFunding';
import Distribution from './wizard/Distribution';
import AiAnalysis from './wizard/AiAnalysis';

// 위저드 레이아웃 + 내부 라우트
// 각 단계는 src/screens/wizard/ 안의 별도 파일이고 useWizard()로 state를 공유함
export default function Wizard() {
  return (
    <div className="p-5 space-y-6 min-h-full flex flex-col bg-white animate-in slide-in-from-right pb-24">
      <Routes>
        <Route path="/" element={<Navigate to="/wizard/goal-type" replace />} />
        <Route path="/wizard" element={<Navigate to="/wizard/goal-type" replace />} />
        <Route path="/wizard/goal-type" element={<GoalType />} />
        <Route path="/wizard/budget" element={<Budget />} />
        <Route path="/wizard/initial-funding" element={<InitialFunding />} />
        <Route path="/wizard/distribution" element={<Distribution />} />
        <Route path="/wizard/ai-analysis" element={<AiAnalysis />} />
      </Routes>
    </div>
  );
}
