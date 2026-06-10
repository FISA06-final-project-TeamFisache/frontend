import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { getAssets, setSalaryAccount, connectAutoTransfer, type Asset } from '../api/assetApi';
import { getBankImgSrc, isWooriBank } from '../constants/banks';
import heroImg from '../assets/hero.png';

type Step = 'account-select' | 'transfer-setup';

interface Account {
  id: string;
  bank: string;
  logo?: string;
  name: string;
  balance: number;
  isSalary: boolean;
  isWoori: boolean;
}

const assetToAccount = (asset: Asset): Account => {
  const institution = asset.institution ?? '';
  return {
    id: asset.id,
    bank: institution,
    logo: getBankImgSrc(institution),
    name: asset.accountName ?? '',
    balance: asset.balance ?? 0,
    isSalary: asset.isSalary,
    isWoori: isWooriBank(institution) || asset.bankType === 'WOORI',
  };
};

export default function SalaryAccountChange() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [wooriAccounts, setWooriAccounts] = useState<Account[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);   // 기존 급여통장
  const [selectedId, setSelectedId] = useState<string | null>(null); // 선택한 통장

  const [step, setStep] = useState<Step>('account-select');
  const [transferAccount, setTransferAccount] = useState<Account | null>(null);
  const [transferDate, setTransferDate] = useState(25);

  const [salaryLoading, setSalaryLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET /assets — 입출금·예적금만 급여통장 후보로 표시, 현재 급여통장 표시/선택
  useEffect(() => {
    (async () => {
      try {
        const fetched = await getAssets();
        const candidates = fetched
          .filter(a => !['INVESTMENT', 'CARD'].includes(a.assetType))
          .map(assetToAccount);
        setAccounts(candidates);

        const salary = candidates.find(a => a.isSalary) ?? null;
        setCurrentId(salary?.id ?? null);
        setSelectedId(salary?.id ?? null);

        // 자동이체 수취 대상: 우리은행 계좌만
        const woori = candidates.filter(a => a.isWoori);
        setWooriAccounts(woori);
        if (woori.length > 0) setTransferAccount(woori[0]);
      } catch {
        setError('계좌 목록을 불러오지 못했어요.');
      }
    })();
  }, []);

  const selectedAccount = accounts.find(a => a.id === selectedId) ?? null;
  const isUnchanged = !selectedId || selectedId === currentId;

  // Step 1 → 급여 계좌 설정. 우리은행이면 바로 완료, 타행이면 자동이체 설정으로
  const handleSelectSalary = async () => {
    if (!selectedAccount || isUnchanged) return;
    setSalaryLoading(true);
    setError(null);
    try {
      // PATCH /assets/{assetId}/salary
      const result = await setSalaryAccount(selectedAccount.id);
      if (result.isWooriBank) {
        navigate('/dashboard');
      } else {
        setStep('transfer-setup');
      }
    } catch {
      // 에러 시에도 isWoori 여부로 fallback
      if (selectedAccount.isWoori) {
        navigate('/dashboard');
      } else {
        setStep('transfer-setup');
      }
    } finally {
      setSalaryLoading(false);
    }
  };

  // Step 2 → 우리은행 자동이체 연결 후 완료
  const handleConnectTransfer = async () => {
    if (!transferAccount) return;
    setTransferLoading(true);
    setError(null);
    try {
      // POST /assets/auto-transfer/connect
      await connectAutoTransfer(transferAccount.id, transferDate);
      navigate('/dashboard');
    } catch {
      // 실패해도 급여계좌는 이미 변경됨 → 대시보드로 복귀
      navigate('/dashboard');
    } finally {
      setTransferLoading(false);
    }
  };

  // ── Step 1: 급여 계좌 선택 ───────────────────────────────
  if (step === 'account-select') return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          <button className="p-2 -ml-2" onClick={() => navigate(-1)} aria-label="뒤로">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="font-semibold text-lg text-gray-800">급여 통장 변경</h1>
          <div className="w-10" />
        </header>

        <div className="flex-1 px-6 pt-4 flex flex-col overflow-y-auto">
          {/* 타이틀 */}
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 leading-snug mt-1">
              급여를 받을<br />통장을 선택해 주세요
            </h2>
            <img src={heroImg} alt="마스코트" className="w-20 h-20 object-contain" />
          </div>

          {/* 계좌 리스트 */}
          <div className="space-y-3 flex-1">
            {accounts.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">
                {error ?? '연결된 계좌가 없습니다'}
              </p>
            ) : (
              accounts.map(acc => {
                const selected = selectedId === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedId(acc.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between transition active:scale-[0.98] ${
                      selected
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {acc.logo
                          ? <img src={acc.logo} alt={acc.bank} className="w-8 h-8 object-contain" />
                          : <span className="text-xs font-bold text-gray-600">{(acc.bank ?? '??').slice(0, 2)}</span>
                        }
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-[10px] text-gray-400 font-medium">{acc.bank}</p>
                          {acc.id === currentId && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                              현재 급여통장
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-gray-800 truncate">{acc.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{acc.balance.toLocaleString()}원</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 ml-2 ${
                      selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {error && accounts.length > 0 && (
            <p className="text-center text-xs text-red-500 mt-3">{error}</p>
          )}
        </div>

        {/* Bottom Button */}
        <div className="px-6 pb-8 pt-4 shrink-0">
          <button
            disabled={isUnchanged || salaryLoading}
            onClick={handleSelectSalary}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-1 transition active:scale-95"
          >
            {salaryLoading
              ? '설정 중...'
              : selectedAccount && !selectedAccount.isWoori
                ? <>계속 · 자동이체 연결 <ChevronRight className="w-5 h-5" /></>
                : <><Check className="w-5 h-5" /> 변경 완료</>}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step 2: 자동이체 설정 (타행 전용) ───────────────────────
  return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          <button className="p-2 -ml-2" onClick={() => setStep('account-select')} aria-label="뒤로">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="font-semibold text-lg text-gray-800">자동이체 설정</h1>
          <div className="w-10" />
        </header>

        <div className="flex-1 px-6 pt-4 flex flex-col overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-1">우리은행으로<br />자동이체를 연결할게요</h2>
          <p className="text-sm text-gray-400 mb-6">
            월급이 들어오면 지정일에 아래 계좌로 자동 이체됩니다
          </p>

          {/* 이체 경로 */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-5">
            <p className="text-xs text-gray-500 mb-3 font-medium">이체 경로</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-xl p-3 border border-gray-200">
                <p className="text-[10px] text-gray-400 mb-0.5">{selectedAccount?.bank}</p>
                <p className="text-xs font-bold text-gray-700">{selectedAccount?.name}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="flex-1 bg-blue-50 rounded-xl p-3 border border-blue-200">
                <p className="text-[10px] text-blue-400 mb-0.5">우리은행</p>
                <p className="text-xs font-bold text-blue-700">{transferAccount?.name ?? '-'}</p>
              </div>
            </div>
          </div>

          {/* 입금받을 우리은행 계좌 선택 */}
          <div className="mb-5">
            <p className="text-sm font-bold text-gray-600 mb-3">입금 받을 우리은행 계좌</p>
            {wooriAccounts.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">우리은행 계좌가 없습니다</p>
            ) : (
              <div className="space-y-2">
                {wooriAccounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => setTransferAccount(acc)}
                    className={`w-full text-left px-4 py-3 rounded-2xl border-2 flex items-center justify-between transition active:scale-[0.98] ${
                      transferAccount?.id === acc.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={getBankImgSrc('우리은행')} alt="우리은행" className="w-6 h-6 object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{acc.name}</p>
                        <p className="text-xs text-gray-500">{acc.balance.toLocaleString()}원</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                      transferAccount?.id === acc.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {transferAccount?.id === acc.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 자동이체일 선택 */}
          <div className="mb-5">
            <p className="text-sm font-bold text-gray-600 mb-3">자동이체일</p>
            <div className="grid grid-cols-7 gap-2">
              {[1, 5, 10, 15, 20, 25, 28].map(d => (
                <button
                  key={d}
                  onClick={() => setTransferDate(d)}
                  className={`py-2 rounded-xl text-sm font-bold transition active:scale-95 ${
                    transferDate === d
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d}일
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              매월 <span className="font-bold text-red-500">{transferDate}일</span>에 자동이체가 진행됩니다
            </p>
          </div>

          {/* 확인 요약 */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">출금 계좌</span>
                <span className="font-bold text-gray-800">{selectedAccount?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">이체 계좌</span>
                <span className="font-bold text-blue-700">{transferAccount?.name ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">이체일</span>
                <span className="font-bold text-gray-800">매월 {transferDate}일</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-8 pt-4 shrink-0">
          <button
            disabled={!transferAccount || transferLoading}
            onClick={handleConnectTransfer}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-1 transition active:scale-95"
          >
            {transferLoading ? '연결 중...' : <><Check className="w-5 h-5" /> 완료</>}
          </button>
        </div>
      </div>
    </div>
  );
}
