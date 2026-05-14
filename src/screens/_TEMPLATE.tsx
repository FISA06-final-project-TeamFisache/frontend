// ============================================================================
// 새 페이지를 만들 때 이 파일을 복사해서 시작하세요.
//
// 사용법:
//   1. 이 파일을 같은 폴더에 새 이름으로 복사 (예: Profile.tsx)
//   2. 컴포넌트 이름과 텍스트 수정
//   3. src/App.jsx의 Routes에 <Route path="/profile" element={<Profile />} /> 추가
//
// 패턴 요약:
//   - 페이지는 props를 거의 받지 않음 (전역 state는 Context에서 가져옴)
//   - API 호출은 src/api/*Api.ts 에 추가 후 import해서 사용
//   - 페이지 이동은 useNavigate
//   - 인증이 필요한 데이터: api 모듈은 자동으로 토큰 헤더를 붙임 (client.ts)
// ============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Spinner from '../components/common/Spinner';
// import { useAuth } from '../contexts/AuthContext';  // 인증 정보가 필요할 때
// import { someApiCall } from '../api/someApi';        // API 호출이 필요할 때

export default function TemplatePage() {
  const navigate = useNavigate();
  // const { token, logout } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);

  // 페이지 진입 시 데이터 로드 예시
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // const result = await someApiCall();
        // if (!cancelled) setData(result);
        if (!cancelled) setData({ example: 'replace with real data' });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '데이터 조회 실패');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <PageLayout title="템플릿 페이지" subtitle="로딩 중...">
        <div className="flex-1 flex items-center justify-center">
          <Spinner label="데이터를 불러오는 중" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="템플릿 페이지">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
          >
            돌아가기
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="템플릿 페이지"
      subtitle="이 파일을 복사해서 새 페이지를 만드세요"
    >
      <div className="space-y-4 flex-1">
        <pre className="text-xs bg-white/5 p-4 rounded-xl overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <button
        onClick={() => navigate('/')}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold mt-6"
      >
        다음 단계로
      </button>
    </PageLayout>
  );
}
