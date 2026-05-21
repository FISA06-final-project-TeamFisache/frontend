import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wallet, Info, Pin, Check, HelpCircle, Trash2, Plus, X } from 'lucide-react';

const TOTAL_SALARY = 3_200_000;
const USER_NAME = '서태형'; // TODO: 인증 컨텍스트에서 실제 이름 가져오기

interface Account {
  id: number;
  bank: string;
  tag: string;
  amount: number;
  percent: number;
  isPinned: boolean;
  color: string;
}

const TAG_COLORS = [
  'bg-red-100 text-red-600',
  'bg-emerald-100 text-emerald-600',
  'bg-purple-100 text-purple-600',
  'bg-blue-100 text-blue-600',
  'bg-amber-100 text-amber-600',
  'bg-pink-100 text-pink-600',
  'bg-indigo-100 text-indigo-600',
  'bg-teal-100 text-teal-600',
];

// 마이데이터 연동으로 가져온 내 계좌 목록 (TODO: 추후 API 연동)
interface LinkedAccount {
  id: string;
  bank: string;
  name: string;
  short: string;
  badgeBg: string;
  badgeColor: string;
}

const MY_ACCOUNTS: LinkedAccount[] = [
  { id: 'kakao-1',   bank: '카카오뱅크',    name: '입출금통장',         short: '카카', badgeBg: 'bg-yellow-100', badgeColor: 'text-yellow-700' },
  { id: 'kakao-2',   bank: '카카오뱅크',    name: '26주 적금',          short: '카카', badgeBg: 'bg-yellow-100', badgeColor: 'text-yellow-700' },
  { id: 'toss-1',    bank: '토스뱅크',      name: '파킹통장',           short: '토스', badgeBg: 'bg-blue-50',    badgeColor: 'text-blue-500'   },
  { id: 'toss-2',    bank: '토스뱅크',      name: '나눠모으기 통장',     short: '토스', badgeBg: 'bg-blue-50',    badgeColor: 'text-blue-500'   },
  { id: 'shinhan-1', bank: '신한은행',      name: 'Tops 직장인 플랜',   short: '신한', badgeBg: 'bg-blue-50',    badgeColor: 'text-blue-600'   },
  { id: 'woori-1',   bank: '우리은행',      name: 'WON 파킹 통장',      short: '우리', badgeBg: 'bg-blue-100',   badgeColor: 'text-blue-800'   },
  { id: 'woori-2',   bank: '우리은행',      name: 'WON 적금',           short: '우리', badgeBg: 'bg-blue-100',   badgeColor: 'text-blue-800'   },
  { id: 'kb-1',      bank: '국민은행',      name: 'Star 입출금통장',    short: '국민', badgeBg: 'bg-amber-100',  badgeColor: 'text-amber-700'  },
  { id: 'hana-1',    bank: '하나은행',      name: '하나원큐 적금',      short: '하나', badgeBg: 'bg-emerald-100',badgeColor: 'text-emerald-700'},
  { id: 'mirae-1',   bank: '미래에셋증권',  name: '종합매매계좌',       short: '미래', badgeBg: 'bg-orange-100', badgeColor: 'text-orange-700' },
];

const INITIAL_ACCOUNTS: Account[] = [
  { id: 0, bank: '입출금통장',   tag: '생활비',     amount: 1_500_000, percent: 47, isPinned: true,  color: TAG_COLORS[0] },
  { id: 1, bank: 'WON 적금',     tag: '나의 저축',  amount: 600_000,   percent: 19, isPinned: false, color: TAG_COLORS[1] },
  { id: 2, bank: '종합매매계좌', tag: '증권',       amount: 600_000,   percent: 19, isPinned: false, color: TAG_COLORS[2] },
  { id: 3, bank: '파킹통장',     tag: '비상금',     amount: 300_000,   percent: 9,  isPinned: false, color: TAG_COLORS[3] },
];

const formatNumber = (n: number) => n.toLocaleString('ko-KR');
const parseDigits = (s: string) => parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;

export default function AssetPrescription() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLinkedId, setSelectedLinkedId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [deleteTargetIdx, setDeleteTargetIdx] = useState<number | null>(null);
  const [bankPickerForIdx, setBankPickerForIdx] = useState<number | null>(null);
  const [customLinkedAccounts, setCustomLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isCreatingNewWoori, setIsCreatingNewWoori] = useState(false);
  const [newWooriName, setNewWooriName] = useState('');

  const allLinkedAccounts = [...MY_ACCOUNTS, ...customLinkedAccounts];
  const [toast, setToast] = useState<{ top: number; left: number } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const totalPct = accounts.reduce((sum, a) => sum + a.percent, 0);
  const totalAmount = accounts.reduce((sum, a) => sum + a.amount, 0);
  const remain = TOTAL_SALARY - totalAmount;
  const isOver = totalPct > 100;

  const updateAmount = (idx: number, amount: number) => {
    setAccounts(prev => prev.map((a, i) => i === idx
      ? { ...a, amount, percent: Math.round((amount / TOTAL_SALARY) * 100) }
      : a));
  };

  const updatePercent = (idx: number, percent: number) => {
    setAccounts(prev => prev.map((a, i) => i === idx
      ? { ...a, percent, amount: Math.round((percent / 100) * TOTAL_SALARY) }
      : a));
  };

  const updateTag = (idx: number, tag: string) => {
    setAccounts(prev => prev.map((a, i) => i === idx ? { ...a, tag } : a));
  };

  const pickBankFor = (linked: LinkedAccount) => {
    if (bankPickerForIdx === null) return;
    setAccounts(prev => prev.map((a, i) => i === bankPickerForIdx ? { ...a, bank: linked.name } : a));
    setBankPickerForIdx(null);
  };

  const confirmDelete = () => {
    if (deleteTargetIdx === null) return;
    setAccounts(prev => prev.filter((_, i) => i !== deleteTargetIdx));
    setDeleteTargetIdx(null);
  };

  const openAddModal = () => {
    setSelectedLinkedId(null);
    setNewTag('');
    setIsCreatingNewWoori(false);
    setNewWooriName('');
    setShowAddModal(true);
  };

  const createNewWooriAccount = () => {
    const name = newWooriName.trim();
    if (!name) return;
    if (allLinkedAccounts.some(a => a.name === name)) return;
    const newAcc: LinkedAccount = {
      id: `woori-new-${Date.now()}`,
      bank: '우리은행',
      name,
      short: '우리',
      badgeBg: 'bg-blue-100',
      badgeColor: 'text-blue-800',
    };
    setCustomLinkedAccounts(prev => [...prev, newAcc]);
    setSelectedLinkedId(newAcc.id);
    setIsCreatingNewWoori(false);
    setNewWooriName('');
  };

  const addAccount = () => {
    const linked = allLinkedAccounts.find(a => a.id === selectedLinkedId);
    const tag = newTag.trim();
    if (!linked || !tag) return;
    const nextId = accounts.reduce((max, a) => Math.max(max, a.id), -1) + 1;
    const color = TAG_COLORS[accounts.length % TAG_COLORS.length];
    setAccounts(prev => [
      ...prev,
      { id: nextId, bank: linked.name, tag, amount: 0, percent: 0, isPinned: false, color },
    ]);
    setShowAddModal(false);
  };

  const togglePin = (idx: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const willPin = !accounts[idx].isPinned;
    setAccounts(prev => prev.map((a, i) => i === idx ? { ...a, isPinned: willPin } : a));

    if (willPin) {
      const rect = e.currentTarget.getBoundingClientRect();
      setToast({ top: rect.top - 45, left: rect.right - 230 });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    }
  };

  const handleComplete = () => {
    if (isOver) return;
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    navigate('/prescription-complete');
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <div className="w-full max-w-[390px] min-h-screen bg-white relative shadow-2xl pb-32">

        {/* 상단 네비게이션 */}
        <header className="flex items-center justify-between p-4 bg-white sticky top-0 z-20">
          <button className="p-2" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-semibold text-lg">자산 재설계</h1>
          <div className="w-10" />
        </header>

        <main className="p-5 pt-2">
          {/* 헤더 텍스트 */}
          <h2 className="text-2xl font-bold leading-tight mb-8 text-slate-800">
            <span className="text-blue-600">Pori</span>가 {USER_NAME} 님의<br />
            소비·저축 패턴을 보고<br />
            이번 월급을 나눠봤어요.
          </h2>

          {/* 최상단: 급여 통장 */}
          <div className="relative z-10 mb-4">
            <p className="text-sm font-semibold text-slate-500 ml-2 mb-1 flex items-center gap-1">
              <Wallet className="w-4 h-4" /> 우리은행 급여통장
            </p>
            <div className="inline-block border-2 border-slate-700 rounded-2xl px-5 py-3 shadow-sm bg-white">
              <span className="text-2xl font-extrabold tracking-tight">
                {formatNumber(TOTAL_SALARY)}<span className="text-lg font-bold text-slate-600 ml-1">원</span>
              </span>
            </div>
          </div>

          {/* 계좌 리스트 트리 영역 */}
          <div className="relative mt-2">
            {/* 세로 줄 */}
            <div className="absolute left-5 top-0 bottom-8 w-[3px] bg-slate-700 rounded-sm" />

            <div className="space-y-5 relative">
              {accounts.map((acc, index) => (
                <div key={acc.id} className="relative pl-12 pr-1 pt-2">
                  {/* 트리를 잇는 꺾인 선 (SVG 화살표) */}
                  <svg className="absolute left-5 top-11 w-7 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" preserveAspectRatio="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M0 12h20M16 6l6 6-6 6" />
                  </svg>

                  <div className={`bg-white border ${acc.isPinned ? 'border-rose-200 shadow-sm' : 'border-slate-200'} rounded-2xl p-4 transition-all duration-300`}>
                    <div className="flex justify-between items-center mb-3 gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => setBankPickerForIdx(index)}
                          className="font-bold text-slate-700 bg-transparent border-b border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-50 outline-none rounded px-1 py-0.5 text-sm transition-colors truncate max-w-[140px] text-left"
                        >
                          {acc.bank}
                        </button>
                        <input
                          type="text"
                          value={acc.tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder="태그"
                          className={`${acc.color} px-2 py-0.5 rounded-md text-xs font-bold outline-none focus:ring-2 focus:ring-blue-300 w-20`}
                        />
                      </div>
                      {/* 핀 버튼 */}
                      <button
                        onClick={(e) => togglePin(index, e)}
                        className={`p-1.5 rounded-full transition-colors shrink-0 ${acc.isPinned ? 'bg-rose-50' : 'hover:bg-slate-100'}`}
                        aria-label="핀 고정"
                      >
                        <Pin
                          className={`w-5 h-5 ${acc.isPinned ? 'text-rose-500' : 'text-slate-400'}`}
                          fill={acc.isPinned ? 'currentColor' : 'none'}
                        />
                      </button>
                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => setDeleteTargetIdx(index)}
                        className="p-1.5 rounded-full hover:bg-rose-50 transition-colors shrink-0"
                        aria-label="계좌 삭제"
                      >
                        <Trash2 className="w-5 h-5 text-slate-400 hover:text-rose-500 transition-colors" />
                      </button>
                    </div>

                    <div className="flex gap-2 items-center">
                      {/* 금액 입력란 */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumber(acc.amount)}
                          onChange={(e) => updateAmount(index, parseDigits(e.target.value))}
                          className={`w-full bg-slate-50 border ${acc.isPinned ? 'border-rose-100' : 'border-slate-200'} rounded-xl py-3 pr-8 pl-3 text-right font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-lg`}
                        />
                        <span className="absolute right-3 top-3.5 text-slate-400 text-sm font-semibold">원</span>
                      </div>
                      {/* 퍼센트 입력란 */}
                      <div className="relative w-24">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={acc.percent}
                          onChange={(e) => updatePercent(index, parseDigits(e.target.value))}
                          className={`w-full bg-slate-50 border ${acc.isPinned ? 'border-rose-100' : 'border-slate-200'} rounded-xl py-3 pr-7 pl-3 text-right font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-lg`}
                        />
                        <span className="absolute right-3 top-3.5 text-slate-400 text-sm font-semibold">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* + 계좌 추가 버튼 (트리에 이어붙임) */}
              <div className="relative pl-12 pr-1 pt-2">
                <svg className="absolute left-5 top-7 w-7 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" preserveAspectRatio="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M0 12h20M16 6l6 6-6 6" />
                </svg>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors font-semibold text-sm active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  계좌 추가
                </button>
              </div>
            </div>
          </div>

          {/* 고정 지출 안내 문구 */}
          <div className="mt-8 bg-slate-100 p-4 rounded-xl text-sm text-slate-600 leading-relaxed">
            <Info className="w-4 h-4 inline-block mb-1 mr-1 text-slate-400" />
            고정 지출(월세, 보험, 통신비) <span className="font-bold text-slate-700">245,000원</span>은 신한 고정지출 통장에 먼저 빼놨어요. 변동을 원하시면 수동 조정이 가능해요.
          </div>
        </main>

        {/* 하단 고정 바 (진행률 및 완료 버튼) */}
        <div className="fixed bottom-0 max-w-[390px] w-full bg-white border-t border-slate-200 p-4 pb-6 z-20 flex justify-between items-center shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 mb-0.5">총 배분 비율</span>
            <div className="text-2xl font-extrabold flex items-baseline gap-1">
              <span className={isOver ? 'text-red-500' : 'text-blue-600'}>{totalPct}</span>
              <span className="text-lg text-slate-400">%</span>
            </div>
            <span className={`text-[10px] text-red-500 font-medium h-3 mt-0.5 transition-opacity ${isOver ? 'opacity-100' : 'opacity-0'}`}>
              100%를 초과할 수 없습니다
            </span>
          </div>
          <button
            disabled={isOver}
            onClick={handleComplete}
            className={`${isOver ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-colors shadow-md flex items-center gap-2`}
          >
            완료 <Check className="w-5 h-5" />
          </button>
        </div>

        {/* 핀 안내 툴팁 */}
        {toast && (
          <div
            className="fixed z-50 bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg pointer-events-none animate-in fade-in"
            style={{ top: toast.top, left: toast.left }}
          >
            다음에는 이 계좌에 들어가는 금액은 변하지 않아요
            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-slate-800 transform rotate-45" />
          </div>
        )}
      </div>

      {/* 팝업 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-11/12 max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            <div className="p-7 text-center pt-8">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-slate-800 text-lg font-medium leading-relaxed">
                급여 통장에 남는{' '}
                <span className="text-blue-600 font-bold text-xl">{formatNumber(remain)}원</span>은<br />
                <span className="font-semibold bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block">[우리은행 계좌]</span>
                에 남겨놓을까요?
              </p>
            </div>
            <div className="flex border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 text-slate-500 font-semibold hover:bg-slate-100 transition-colors border-r border-slate-200"
              >
                재설정
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-4 text-blue-600 font-bold hover:bg-blue-50 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 계좌 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-11/12 max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-base font-bold text-slate-800">계좌 추가</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="px-6 pb-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">내 계좌에서 선택</label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 -mr-1">
                  {allLinkedAccounts.map(acc => {
                    const alreadyAdded = accounts.some(a => a.bank === acc.name);
                    const isSelected = selectedLinkedId === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => setSelectedLinkedId(isSelected ? null : acc.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border-2 flex items-center justify-between transition active:scale-[0.98] ${
                          alreadyAdded
                            ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                            : isSelected
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${acc.badgeBg} ${acc.badgeColor}`}>
                            {acc.short}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-medium">{acc.bank}</p>
                            <p className="text-sm font-bold text-slate-800 truncate">{acc.name}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                          alreadyAdded
                            ? 'border-slate-200 bg-slate-100'
                            : isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          {alreadyAdded && <Check className="w-3 h-3 text-slate-400" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 우리은행 새 통장 만들기 */}
                <div className="mt-3">
                  {!isCreatingNewWoori ? (
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewWoori(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-colors font-semibold text-sm active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4" />
                      우리은행 새 통장 만들기
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl border-2 border-blue-300 bg-blue-50/60 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
                          우리
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-500 font-medium">우리은행 · 신규 통장</p>
                          <p className="text-xs text-slate-600">월급을 나눠 담을 통장을 만들어요</p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={newWooriName}
                        onChange={(e) => setNewWooriName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') createNewWooriAccount(); }}
                        placeholder="새 통장 이름 (예: 여행 자금 통장)"
                        autoFocus
                        className="w-full bg-white border border-blue-200 rounded-lg py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setIsCreatingNewWoori(false); setNewWooriName(''); }}
                          className="flex-1 py-2 rounded-lg bg-white border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={createNewWooriAccount}
                          disabled={!newWooriName.trim() || allLinkedAccounts.some(a => a.name === newWooriName.trim())}
                          className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          개설하기
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">태그</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="예: 여행 자금"
                  onKeyDown={(e) => { if (e.key === 'Enter') addAccount(); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 text-slate-500 font-semibold hover:bg-slate-100 transition-colors border-r border-slate-200"
              >
                취소
              </button>
              <button
                onClick={addAccount}
                disabled={!selectedLinkedId || !newTag.trim()}
                className="flex-1 py-4 text-blue-600 font-bold hover:bg-blue-50 transition-colors disabled:text-slate-300 disabled:hover:bg-slate-50"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 계좌 변경 picker 모달 */}
      {bankPickerForIdx !== null && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-11/12 max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-base font-bold text-slate-800">계좌 변경</h3>
              <button onClick={() => setBankPickerForIdx(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <p className="px-6 -mt-1 mb-3 text-xs text-slate-500">내 계좌 중 하나를 선택해주세요.</p>
            <div className="px-6 pb-4">
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 -mr-1">
                {allLinkedAccounts.map(acc => {
                  const currentBank = accounts[bankPickerForIdx]?.bank;
                  const isCurrent = currentBank === acc.name;
                  const usedByOther = accounts.some((a, i) => a.bank === acc.name && i !== bankPickerForIdx);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      disabled={usedByOther}
                      onClick={() => pickBankFor(acc)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border-2 flex items-center justify-between transition active:scale-[0.98] ${
                        usedByOther
                          ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                          : isCurrent
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${acc.badgeBg} ${acc.badgeColor}`}>
                          {acc.short}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 font-medium">{acc.bank}</p>
                          <p className="text-sm font-bold text-slate-800 truncate">{acc.name}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                        usedByOther
                          ? 'border-slate-200 bg-slate-100'
                          : isCurrent
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-slate-300'
                      }`}>
                        {isCurrent && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        {usedByOther && <Check className="w-3 h-3 text-slate-400" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 계좌 삭제 확인 모달 */}
      {deleteTargetIdx !== null && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-11/12 max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            <div className="p-7 text-center pt-8">
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-rose-500" />
              </div>
              <p className="text-slate-800 text-lg font-medium leading-relaxed">
                <span className="font-bold text-slate-900">{accounts[deleteTargetIdx]?.bank}</span> 계좌를<br />
                삭제할까요?
              </p>
              <p className="text-xs text-slate-400 mt-2">삭제한 배분은 다른 계좌로 다시 나눠야 해요.</p>
            </div>
            <div className="flex border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setDeleteTargetIdx(null)}
                className="flex-1 py-4 text-slate-500 font-semibold hover:bg-slate-100 transition-colors border-r border-slate-200"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-4 text-rose-600 font-bold hover:bg-rose-50 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
