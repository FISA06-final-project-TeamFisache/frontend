# Wooriport Frontend

마이데이터 기반 급여 포트폴리오 자동화 서비스의 웹 프론트엔드입니다.
마이데이터 연동부터 AI 투자 성향 진단, 자산 처방전, 급여 쪼개기, 미니 챌린지까지 전체 사용자 여정을 단일 SPA로 제공합니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Language | TypeScript 6 |
| UI | React 19 |
| 빌드 / 개발서버 | Vite 8 |
| 라우팅 | React Router 7 |
| 스타일 | TailwindCSS 3.4 + tailwindcss-animate |
| 아이콘 | lucide-react |
| 전역 상태 | React Context API |
| 실시간 | SSE (EventSource) |
| API 통신 | fetch 래퍼 (JWT 자동 첨부) |
| 배포 | S3 + CloudFront (정적 호스팅) |

---

## 시스템 아키텍처

```
                         Browser (React SPA, :5173)
                                  │
          ┌───────────────────────┼───────────────────────────┐
          │ src/api/client.ts     │ src/api/poriApi.ts         │ EventSource
          │ (JWT fetch wrapper)    │ (AI 직접 호출)             │ (SSE 구독)
          ▼                        ▼                            ▼
  Spring Boot API (:8080)    FastAPI ML 서버 (:8000)    GET /notifications/subscribe
   ├── /auth, /assets         └── POST /propose            └── 챌린지·급여 실시간 알림
   ├── /agent (AI 처방)            (Pori 대화형 제안)
   ├── /portfolios, /portfolio-flows
   ├── /transfer-plans, /dashboard
   ├── /challenges, /reports
   └── /notifications, /users

배포: S3(정적 빌드) + CloudFront — 프론트와 API가 동일 origin이라
     운영에서는 상대경로(/api/v1)로 요청 (CORS·mixed-content 없음)
```

- **인증**: 로그인 시 받은 JWT를 `localStorage`에 저장, 모든 인증 API에 자동 첨부. 401/403 응답 시 자동 로그아웃.
- **이중 백엔드**: 대부분의 API는 Spring Boot, Pori 대화형 자산 제안만 FastAPI를 직접 호출한 뒤 결과를 백엔드(`/dashboard/apply`)로 반영.

---

## 핵심 기능

### 1. 온보딩 & 마이데이터 연동
- 회원가입 / 로그인 (JWT)
- 마이데이터 기관 선택 → 계좌 미리보기 → 자산 연동 (`/assets/sync`)
- 급여 통장 지정 및 타행→우리은행 자동이체 설정

### 2. AI 투자 성향 진단 (porTI)
- 설문 응답 → porTI 유형 계산·저장
- 관심 투자 테마 / 자산 형성 목표 선택
- AI 에이전트 프로필 생성 (`/agent/profile`)

### 3. AI 자산 처방전
- 처방 인트로 → 로딩(월급 리밸런싱 추천 `/agent/rebalance` 병렬 호출) → 처방 화면
- 급여통장 기준 지출/투자 분배를 트리 UI로 시각화, 사용자 직접 조정
- 처방 확정 시 AI 포트폴리오 생성 (`/agent/prescriptions`)

### 4. 자산 포트폴리오
- "모으기 → 넣기 → 불리기" 단계별 자산 흐름(portfolio-flows) 시각화
- 상품 카탈로그 기반 추천 계좌 개설 흐름 (동의 → 개설 완료 오버레이)

### 5. 통합 대시보드
- 총자산 날씨 위젯, 소비/투자/세금절약/또래비교/포트폴리오 수익률 위젯
- **Pori 위젯**: 자연어로 목표를 말하면 AI 서버가 자산 재배분안을 제안, 확인 후 적용
- **SSE 실시간 알림**: 챌린지 진행·급여 입금 알림을 EventSource로 수신

### 6. 급여 관리
- 급여 쪼개기(지출/투자 계획) 조회 및 조정
- 월급 변동 시 AI 리밸런싱 코멘트 표시
- 급여 계좌 변경

### 7. 미니 챌린지 & 월간 리포트
- 미션 위젯 + 진행도 알림 모달 (50/80/90% 마일스톤, 성공/실패 결과)
- 월간 소비 리포트 + AI 코멘트

---

## 화면 흐름

```
Welcome (/)
   ↓ 로그인/회원가입
Login (/login) · Signup (/signup)
   ↓
Linking (/linking)              — 마이데이터 자산 연동
   ↓
SalarySelect (/salary-select)   — 급여 통장 지정
   ↓
PortiSurvey (/porti-survey)     — AI 투자 성향 설문
   ↓
PrescriptionIntro → PrescriptionLoading → AssetPrescription → PrescriptionComplete
   (/prescription-intro)  (/prescription-loading)  (/asset-prescription)  (/prescription-complete)
   ↓
AssetPortfolio (/asset-portfolio)  — 포트폴리오 구성/개설
   ↓
Dashboard (/dashboard)             — 메인 허브
   ├── SalaryManagement (/salary-management)
   ├── SalaryAccountChange (/salary-account-change)
   └── MonthlyReport (/monthly-report)
```

---

## 구현 포인트

### JWT fetch 래퍼 ([src/api/client.ts](src/api/client.ts))
모든 백엔드 호출은 `api` 객체를 통한다. 토큰 자동 첨부 + 401/403 시 토큰 제거 후 `auth:logout` 이벤트 발행 → `AuthContext`가 받아 자동 로그아웃.

```ts
import { api, ApiError } from './client';

await api.get('/users/me');                       // JWT 자동 첨부
await api.post('/auth/login', body, { auth: false }); // 인증 불필요 호출
```

### 이중 백엔드 + AI 직접 호출 ([src/api/poriApi.ts](src/api/poriApi.ts))
Pori 위젯은 대시보드 스냅샷을 FastAPI(`VITE_AI_BASE/propose`)로 보내 재배분안을 받고, 사용자가 확인하면 Spring Boot(`/dashboard/apply`)로 반영한다.

### SSE 실시간 알림 ([src/screens/Dashboard.tsx](src/screens/Dashboard.tsx))
`EventSource`로 `/notifications/subscribe`를 구독해 챌린지·급여 알림을 실시간 수신, 알림 패널에 즉시 반영.

### 환경별 API 베이스
- 개발: `VITE_API_BASE=http://localhost:8080`, `VITE_AI_BASE=http://localhost:8000`
- 운영: 빈 값 → 상대경로 요청 → CloudFront가 경로별로 S3/ALB 라우팅

---

## 주요 라우트 / API

| 화면 | 라우트 | 주요 호출 |
|------|--------|-----------|
| 로그인 | `/login` | `POST /auth/login` |
| 마이데이터 연동 | `/linking` | `POST /assets/sync`, `GET /assets` |
| porTI 설문 | `/porti-survey` | `POST /agent/profile`, `PATCH /users/porti-survey` |
| 자산 처방 | `/asset-prescription` | `POST /agent/rebalance`, `GET /portfolios` |
| 처방 완료 | `/prescription-complete` | `POST /agent/prescriptions` |
| 포트폴리오 | `/asset-portfolio` | `GET /portfolio-flows`, `GET /products` |
| 대시보드 | `/dashboard` | `GET /dashboard`, `POST /propose`(AI), SSE `/notifications/subscribe` |
| 급여 관리 | `/salary-management` | `GET·PATCH /transfer-plans` |
| 월간 리포트 | `/monthly-report` | `GET /reports/{year}/{month}` |

---

## 실행 방법

### Docker (권장)

```bash
docker compose run --rm frontend npm install   # 최초 1회
docker compose up -d
```

- 접속: http://localhost:5173
- 백엔드: http://localhost:8080/api/v1

### 로컬 (npm)

```bash
npm install
npm run dev      # 개발 서버 (:5173)
npm run build    # 운영 빌드
npm run lint     # ESLint
```

### 환경 변수

| 변수 | 개발 | 설명 |
|------|------|------|
| `VITE_API_BASE` | `http://localhost:8080` | Spring Boot API 베이스 (운영은 빈 값=상대경로) |
| `VITE_AI_BASE` | `http://localhost:8000` | FastAPI ML 서버 베이스 |

---

## 프로젝트 구조

```
src/
├── api/                # 백엔드·AI 호출 레이어
│   ├── client.ts       # ⭐ JWT fetch 래퍼 (모든 백엔드 호출 진입점)
│   ├── poriApi.ts      # ⭐ FastAPI 직접 호출 + 결과 적용
│   ├── authApi.ts      # 인증
│   ├── assetApi.ts     # 마이데이터 자산
│   ├── agentApi.ts     # AI 진단·리밸런싱·처방
│   ├── portfolioApi.ts / portfolioFlowApi.ts / productApi.ts
│   ├── transferApi.ts  # 급여 이체 계획
│   ├── dashboardApi.ts / reportApi.ts / notificationApi.ts / challengeApi.ts
│   └── userApi.ts
├── components/
│   ├── dashboard/      # 대시보드 위젯 (소비·투자·세금·날씨·미션·급여가이드 등)
│   ├── assetPortfolio/ # 포트폴리오 모달 + 상품 레지스트리
│   └── ChallengeAlarmModal.tsx
├── contexts/
│   └── AuthContext.tsx # ⭐ JWT 인증 상태 (useAuth)
├── constants/
│   └── banks.ts        # 은행/카드사 메타 + 로고
├── assets/             # 이미지·영상 (pori, weather, guru, banks ...)
├── screens/            # 14개 페이지 컴포넌트
├── App.tsx             # 라우트 정의
└── main.jsx            # 진입점 (AuthProvider)
```

---

## 코드 컨벤션

| 항목 | 규칙 |
|------|------|
| 페이지 | `src/screens/`, PascalCase `.tsx` |
| API 모듈 | `src/api/`, 도메인별 분리 |
| 백엔드 호출 | `src/api/client.ts`의 `api` 객체 사용 (직접 `fetch` 금지) |
| 인증 상태 | `useAuth()` 사용 (localStorage 직접 접근 금지) |
| 페이지 이동 | `useNavigate` 사용 |
| 전역 상태 | `src/contexts/`, `FooContext.tsx` + `useFoo` hook |
