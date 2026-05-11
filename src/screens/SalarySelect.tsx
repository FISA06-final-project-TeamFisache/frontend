import { Wallet, ArrowRight, CheckCircle2, Sparkles, AlertCircle, X, Loader2 } from 'lucide-react';

const LINKED_ACCOUNTS = [
  { id: 'acc1', bank: '신한은행', name: 'Tops 직장인 플랜 통장', balance: 3200000, isWoori: false, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'acc2', bank: '카카오뱅크', name: '입출금통장', balance: 1500000, isWoori: false, color: 'text-yellow-700', bg: 'bg-yellow-100' },
  { id: 'acc3', bank: '우리은행', name: '우리 WON 파킹 통장', balance: 450000, isWoori: true, color: 'text-blue-800', bg: 'bg-blue-200' },
];

type LinkedAccount = typeof LINKED_ACCOUNTS[number];

type SalarySelectProps = {
  salaryAccount: LinkedAccount | null;
  setSalaryAccount: (acc: LinkedAccount) => void;
  showWooriNudge: boolean;
  setShowWooriNudge: (v: boolean) => void;
  showTransferDateModal: boolean;
  setShowTransferDateModal: (v: boolean) => void;
  showReadOnlyWarningModal: boolean;
  setShowReadOnlyWarningModal: (v: boolean) => void;
  transferDate: number;
  setTransferDate: (v: number) => void;
  isTransferSetting: boolean;
  onWooriConfirm: () => void;
  setAppState: (s: string) => void;
};

export default function SalarySelect({
  salaryAccount, setSalaryAccount,
  showWooriNudge, setShowWooriNudge,
  showTransferDateModal, setShowTransferDateModal,
  showReadOnlyWarningModal, setShowReadOnlyWarningModal,
  transferDate, setTransferDate,
  isTransferSetting, onWooriConfirm,
  setAppState,
}: SalarySelectProps) {
  return (
    <div className="max-w-md mx-auto bg-gray-50 h-screen overflow-hidden flex flex-col font-sans border shadow-xl relative">
      <div className="px-6 py-8 flex flex-col h-full animate-in slide-in-from-right duration-300">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <Wallet className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">급여가 들어오는<br/>주거래 통장을 선택해주세요</h2>
        <p className="text-sm text-gray-500 mb-8">선택하신 계좌의 입금 내역을 바탕으로 매월 가용 자산을 분석합니다.</p>

        <div className="space-y-3 flex-1 overflow-y-auto">
          {LINKED_ACCOUNTS.map(acc => (
            <button
              key={acc.id}
              onClick={() => setSalaryAccount(acc)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between shadow-sm ${salaryAccount?.id === acc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border ${acc.bg} ${acc.color} ${salaryAccount?.id === acc.id ? 'border-blue-200' : 'border-transparent'}`}>
                  {acc.bank.substring(0, 2)}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 mb-0.5">{acc.bank}</p>
                  <p className="text-sm font-bold text-gray-900">{acc.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{acc.balance.toLocaleString()}원</p>
                </div>
              </div>
              {salaryAccount?.id === acc.id ? (
                <CheckCircle2 className="text-blue-500 w-6 h-6" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>
              )}
            </button>
          ))}
        </div>

        <button
          disabled={!salaryAccount}
          onClick={() => {
            if (salaryAccount!.isWoori) {
              setShowTransferDateModal(true);
            } else {
              setShowWooriNudge(true);
            }
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-4 rounded-xl font-bold transition shadow-lg mt-4 shrink-0 flex justify-center items-center gap-2 active:scale-95"
        >
          선택 완료 <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {showWooriNudge && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col shadow-2xl">
            <div className="p-6 pb-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">우리은행 자동이체로<br/>AI 포트폴리오를 100% 활용하세요!</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mt-2">
                    타행 계좌를 급여 통장으로 선택하셨네요. 급여가 들어오면 <strong>우리은행 계좌로 자동이체</strong>되도록 설정해두시면, 매월 번거로움 없이 AI가 자동으로 포트폴리오를 분배하고 매수까지 완료해 드립니다.
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <button onClick={() => { setShowWooriNudge(false); setShowTransferDateModal(true); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 active:scale-95">
                  보유한 [우리 WON 파킹 통장]으로 자동이체 연결
                </button>
                <button onClick={() => { setShowWooriNudge(false); setShowTransferDateModal(true); }} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-4 rounded-xl text-sm font-bold transition active:scale-95">
                  우리은행 급여통장 1분 만에 새로 만들기
                </button>
                <button onClick={() => { setShowWooriNudge(false); setShowReadOnlyWarningModal(true); }} className="w-full py-4 text-gray-400 hover:text-gray-600 text-sm font-bold transition underline underline-offset-4 active:scale-95">
                  다음에 설정할게요
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTransferDateModal && (
        <div className="absolute inset-0 bg-black/60 z-[60] flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">자동이체일 설정</h3>
              <button onClick={() => setShowTransferDateModal(false)}><X className="text-gray-400 w-6 h-6" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">매월 지정하신 날짜에 맞춰 타행 급여통장에서<br/>우리은행 계좌로 가용 자금을 가져옵니다.</p>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between mb-8">
              <span className="font-bold text-gray-700">이체 지정일</span>
              <div className="flex items-center gap-2">
                <select
                  value={transferDate}
                  onChange={(e) => setTransferDate(Number(e.target.value))}
                  className="bg-white border border-gray-300 rounded-lg p-2 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}일</option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={onWooriConfirm} disabled={isTransferSetting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl text-lg font-bold shadow-md transition flex items-center justify-center gap-2 active:scale-95">
              {isTransferSetting ? <><Loader2 className="w-5 h-5 animate-spin" /> 설정 중...</> : '이 날짜로 설정 완료'}
            </button>
          </div>
        </div>
      )}

      {showReadOnlyWarningModal && (
        <div className="absolute inset-0 bg-black/60 z-[70] flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">조회 기능만 제공됩니다</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              우리은행 계좌를 연결하지 않으시면,<br/>매월 AI가 제안하는 <strong>자동 분배(리밸런싱) 및 매수 기능이 제한</strong>되며, 단순 잔액 조회만 가능합니다.
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setShowReadOnlyWarningModal(false); setShowWooriNudge(true); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition shadow-md active:scale-95">
                우리은행 계좌 연결하기
              </button>
              <button onClick={() => { setShowReadOnlyWarningModal(false); setAppState('onboarding_survey'); }} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold transition active:scale-95">
                조회 전용으로 계속하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
