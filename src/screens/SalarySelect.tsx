import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Check, ChevronRight, X } from 'lucide-react';
import heroImg from '../assets/hero.png';
import shinhanLogo from '../assets/banks/shinhan.png';
import kakaoLogo   from '../assets/banks/kakao.png';
import wooriLogo   from '../assets/banks/woori.png';
import kbLogo      from '../assets/banks/kb.png';
import tossLogo    from '../assets/banks/toss.png';
import hanaLogo    from '../assets/banks/hana.png';

type Step = 'account-select' | 'transfer-setup';

interface LinkedAccount {
  id: string;
  bankId: string;
  name: string;
  type: string;
  balance: number;
}

interface Account {
  id: string;
  bank: string;
  logo?: string;
  name: string;
  balance: number;
  isWoori: boolean;
}

const BANK_INFO: Record<string, { name: string; logo?: string; isWoori: boolean }> = {
  woori:   { name: '우리은행',   logo: wooriLogo,   isWoori: true  },
  kakao:   { name: '카카오뱅크', logo: kakaoLogo,   isWoori: false },
  shinhan: { name: '신한은행',   logo: shinhanLogo, isWoori: false },
  kb:      { name: '국민은행',   logo: kbLogo,      isWoori: false },
  toss:    { name: '토스뱅크',   logo: tossLogo,    isWoori: false },
  hana:    { name: '하나은행',   logo: hanaLogo,    isWoori: false },
};

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'woori-1',   bank: '우리은행', logo: wooriLogo,   name: '우월한 월급 통장',     balance: 3_850_000, isWoori: true  },
  { id: 'shinhan-1', bank: '신한은행', logo: shinhanLogo, name: '쏠편한 입출금통장',    balance: 3_200_000, isWoori: false },
  { id: 'hana-2',    bank: '하나은행', logo: hanaLogo,    name: '급여하나 월복리 적금', balance: 3_600_000, isWoori: false },
];

const toAccount = (acc: LinkedAccount): Account => {
  const info = BANK_INFO[acc.bankId] ?? { name: acc.bankId, isWoori: false };
  return { id: acc.id, bank: info.name, logo: info.logo, name: acc.name, balance: acc.balance, isWoori: info.isWoori };
};

// 자동이체 입금받을 우리은행 계좌 후보 (TODO: 실제 사용자 보유 계좌 API 연동)
interface WooriDestination {
  id: string;
  name: string;
  number: string;
  description: string;
}

const WOORI_DESTINATIONS: WooriDestination[] = [
  { id: 'woori-salary', name: '우월한 월급 통장', number: '1002-***-345678', description: '주거래 우대 · 수수료 면제' },
  { id: 'woori-park',   name: '우리WON 파킹 통장',       number: '1002-***-998877', description: '연 2.0% · 수시입출금'  },
  { id: 'woori-saving', name: 'WON 적금',        number: '1002-***-234567', description: '연 4.1% · 12개월 적금' },
];

function PhoneFrame({ children, bottomLabel }: { children: React.ReactNode; bottomLabel?: string }) {
  return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col shadow-2xl">
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
        {bottomLabel && (
          <div className="border-t border-gray-200 py-4 flex justify-center shrink-0">
            <span className="text-gray-400 text-sm font-medium">{bottomLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SalarySelect() {
  const navigate = useNavigate();
  const location = useLocation();

  const linkedAccounts: LinkedAccount[] = location.state?.linkedAccounts ?? [];

  const [accounts, setAccounts] = useState<Account[]>(
    linkedAccounts.length > 0
      ? linkedAccounts.filter(a => a.name.includes('급여') || a.name.includes('월급')).map(toAccount)
      : DEFAULT_ACCOUNTS
  );
  const [step, setStep] = useState<Step>('account-select');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transferAccount, setTransferAccount] = useState<WooriDestination>(WOORI_DESTINATIONS[0]);
  const [transferDate, setTransferDate] = useState(25);
  const [showModal, setShowModal] = useState(false);

  const otherAccounts = linkedAccounts.filter(l => !accounts.some(a => a.id === l.id));

  const handleAddFromModal = (linked: LinkedAccount) => {
    const newAcc = toAccount(linked);
    setAccounts(prev => [...prev, newAcc]);
    setSelectedAccount(newAcc);
    setShowModal(false);
  };

  // ── Step 1: 계좌 선택 ────────────────────────────────────
  if (step === 'account-select') return (
    <PhoneFrame>
      <div className="flex-1 px-6 pt-8 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 leading-snug mt-1">
            급여가 들어오는<br />주거래 통장을<br />선택해 주세요
          </h2>
          <img src={heroImg} alt="마스코트" className="w-24 h-24 object-contain -mt-0.1 -mr-0.1" />
        </div>

        {/* Account List */}
        <div className="space-y-3 flex-1">
          {accounts.map(acc => (
            <button
              key={acc.id}
              onClick={() => setSelectedAccount(acc)}
              className={`w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between transition active:scale-[0.98] ${
                selectedAccount?.id === acc.id
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  {acc.logo
                    ? <img src={acc.logo} alt={acc.bank} className="w-8 h-8 object-contain" />
                    : <span className="text-xs font-bold text-gray-600">{acc.bank.slice(0, 2)}</span>
                  }
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium mb-0.5">{acc.bank}</p>
                  <p className="text-sm font-bold text-gray-800">{acc.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{acc.balance.toLocaleString()}원</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                selectedAccount?.id === acc.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {selectedAccount?.id === acc.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          ))}

          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3 text-sm text-blue-400 hover:text-blue-600 transition"
          >
            다른 계좌 추가
          </button>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-8 pt-4 shrink-0">
        <button
          disabled={!selectedAccount}
          onClick={() => {
            if (selectedAccount?.isWoori) {
              navigate('/porti-survey');
            } else {
              setStep('transfer-setup');
            }
          }}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-1 transition active:scale-95"
        >
          {selectedAccount?.isWoori ? '완료' : '계속 · 자동이체 연결'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 계좌 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />

          {/* 바텀시트 */}
          <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl max-h-[70vh] flex flex-col shadow-2xl">
            {/* 핸들 바 */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* 헤더 */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
              <h3 className="text-base font-bold text-gray-800">다른 계좌 선택</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-gray-100 transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* 계좌 목록 */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {otherAccounts.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">연결된 추가 계좌가 없습니다</p>
              ) : (
                <div className="space-y-5">
                  {Object.entries(
                    otherAccounts.reduce((groups, linked) => {
                      if (!groups[linked.bankId]) groups[linked.bankId] = [];
                      groups[linked.bankId].push(linked);
                      return groups;
                    }, {} as Record<string, LinkedAccount[]>)
                  ).map(([bankId, accs]) => {
                    const info = BANK_INFO[bankId] ?? { name: bankId, isWoori: false };
                    return (
                      <div key={bankId}>
                        <p className="text-xs font-bold text-gray-400 mb-2 px-1">{info.name}</p>
                        <div className="space-y-2">
                          {accs.map(linked => (
                            <button
                              key={linked.id}
                              onClick={() => handleAddFromModal(linked)}
                              className="w-full text-left px-4 py-3 rounded-2xl border-2 border-gray-100 bg-white hover:border-blue-300 active:scale-[0.98] flex items-center gap-3 transition"
                            >
                              <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                {info.logo
                                  ? <img src={info.logo} alt={info.name} className="w-7 h-7 object-contain" />
                                  : <span className="text-xs font-bold text-gray-600">{info.name.slice(0, 2)}</span>
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{linked.type}</span>
                                  <span className="text-sm font-bold text-gray-800 truncate">{linked.name}</span>
                                </div>
                                <p className="text-xs text-gray-500">{linked.balance.toLocaleString()}원</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  );

  // ── Step 2: 자동이체 설정 (타행 전용) ───────────────────
  return (
    <PhoneFrame bottomLabel="자동이체 설정">
      <div className="flex-1 px-6 pt-6 flex flex-col overflow-y-auto">
        {/* Back */}
        <button onClick={() => setStep('account-select')} className="flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-6 -ml-1">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">뒤로</span>
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-1">우리은행으로<br />자동이체를 연결할게요</h2>
        <p className="text-sm text-gray-400 mb-6">
          월급이 들어오면 지정일에 아래 계좌로 자동 이체됩니다
        </p>

        {/* 출금 계좌 → 입금 계좌 */}
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
              <p className="text-xs font-bold text-blue-700">{transferAccount.name}</p>
            </div>
          </div>
        </div>

        {/* 입금 계좌 선택 */}
        <div className="mb-5">
          <p className="text-sm font-bold text-gray-600 mb-3">입금 받을 우리은행 계좌</p>
          <div className="space-y-2">
            {WOORI_DESTINATIONS.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => setTransferAccount(acc)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border-2 flex items-center justify-between transition active:scale-[0.98] ${
                    transferAccount.id === acc.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800">{acc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{acc.description}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{acc.number}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                    transferAccount.id === acc.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {transferAccount.id === acc.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
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
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex-1">
          <div className="space-y-1.5 text-sm text-blue-700">
            <div className="flex justify-between">
              <span className="text-gray-500">출금 계좌</span>
              <span className="font-bold">{selectedAccount?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">이체 계좌</span>
              <span className="font-bold">{transferAccount.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">이체일</span>
              <span className="font-bold">매월 {transferDate}일</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 pt-4 shrink-0">
        <button
          onClick={() => navigate('/porti-survey')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-1 transition active:scale-95"
        >
          <Check className="w-5 h-5" />
          완료
        </button>
      </div>
    </PhoneFrame>
  );
}
