import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check } from 'lucide-react';

type Step = 'consent' | 'select' | 'linking' | 'account-pick';
type LinkStatus = 'waiting' | 'linking' | 'done';

const BANK_LIST = [
  { id: 'woori',   name: '우리은행' },
  { id: 'kb',      name: '국민은행' },
  { id: 'kakao',   name: '카카오뱅크' },
  { id: 'toss',    name: '토스뱅크' },
  { id: 'shinhan', name: '신한은행' },
  { id: 'hana',    name: '하나은행' },
];

interface LinkedAccount {
  id: string;
  bankId: string;
  name: string;
  type: '입출금' | '예·적금' | '증권' | '카드';
  balance: number;
}

// 각 은행에서 마이데이터 연동 시 가져오는 계좌 목록 (mock)
const BANK_ACCOUNTS: Record<string, LinkedAccount[]> = {
  woori: [
    { id: 'woori-1', bankId: 'woori', name: 'WON 파킹 통장',    type: '입출금',   balance: 3_850_000 },
    { id: 'woori-2', bankId: 'woori', name: 'WON 적금',         type: '예·적금', balance: 12_000_000 },
  ],
  kb: [
    { id: 'kb-1',    bankId: 'kb',    name: 'Star 입출금통장',  type: '입출금',   balance: 1_200_000 },
    { id: 'kb-2',    bankId: 'kb',    name: 'KB 정기예금',       type: '예·적금', balance: 8_000_000 },
  ],
  kakao: [
    { id: 'kakao-1', bankId: 'kakao', name: '입출금통장',        type: '입출금',   balance: 1_500_000 },
    { id: 'kakao-2', bankId: 'kakao', name: '26주 적금',         type: '예·적금', balance: 2_400_000 },
  ],
  toss: [
    { id: 'toss-1',  bankId: 'toss',  name: '파킹통장',          type: '입출금',   balance: 2_300_000 },
    { id: 'toss-2',  bankId: 'toss',  name: '나눠모으기 통장',   type: '입출금',   balance: 500_000 },
    { id: 'toss-3',  bankId: 'toss',  name: '토스증권 계좌',     type: '증권',     balance: 4_120_000 },
  ],
  shinhan: [
    { id: 'shinhan-1', bankId: 'shinhan', name: 'Tops 직장인 플랜 통장', type: '입출금',   balance: 3_200_000 },
    { id: 'shinhan-2', bankId: 'shinhan', name: '쏠편한 적금',            type: '예·적금', balance: 6_540_000 },
  ],
  hana: [
    { id: 'hana-1',  bankId: 'hana',  name: '하나원큐 입출금',   type: '입출금',   balance: 950_000 },
    { id: 'hana-2',  bankId: 'hana',  name: '하나원큐 적금',     type: '예·적금', balance: 3_600_000 },
  ],
};

const CONSENT_ITEMS = [
  { key: 'personal'  as const, label: '필수 개인정보 수집·이용 (필수)' },
  { key: 'financial' as const, label: '금융정보 조회·전송 동의 (필수)' },
  { key: 'terms'     as const, label: '서비스 이용약관 (필수)' },
  { key: 'marketing' as const, label: '마케팅 수신 동의 (선택)' },
];

function PhoneFrame({ children, bottomLabel }: { children: React.ReactNode; bottomLabel: string }) {
  return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col shadow-2xl">
        <div className="flex-1 px-6 pt-10 pb-4 flex flex-col overflow-y-auto">
          {children}
        </div>
        <div className="border-t border-gray-200 py-4 flex justify-center shrink-0">
          <span className="text-gray-400 text-sm font-medium">{bottomLabel}</span>
        </div>
      </div>
    </div>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div className={`w-5 h-5 rounded flex items-center justify-center transition ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}>
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </div>
  );
}

export default function Linking() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('consent');
  const [consents, setConsents] = useState({ personal: false, financial: false, terms: false, marketing: false });
  const [selected, setSelected] = useState<string[]>([]);
  const [linkStatus, setLinkStatus] = useState<Record<string, LinkStatus>>({});
  const [pickedAccounts, setPickedAccounts] = useState<string[]>([]);

  const togglePickedAccount = (id: string) =>
    setPickedAccounts(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  const allRequired = consents.personal && consents.financial && consents.terms;

  const toggleConsent = (key: keyof typeof consents) =>
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleBank = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);

  useEffect(() => {
    if (step !== 'linking') return;

    const initial: Record<string, LinkStatus> = {};
    selected.forEach(id => { initial[id] = 'waiting'; });
    setLinkStatus(initial);

    let delay = 0;
    selected.forEach((id, i) => {
      setTimeout(() => {
        setLinkStatus(prev => ({ ...prev, [id]: 'linking' }));
        setTimeout(() => {
          setLinkStatus(prev => ({ ...prev, [id]: 'done' }));
          if (i === selected.length - 1) {
            setTimeout(() => setStep('account-pick'), 600);
          }
        }, 1200);
      }, delay);
      delay += 1500;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Step 1: 서비스 동의 ──────────────────────────────────
  if (step === 'consent') return (
    <PhoneFrame bottomLabel="서비스 동의">
      <div className="bg-blue-50 rounded-2xl p-6 flex flex-col items-center mb-6">
        <Lock className="w-8 h-8 text-blue-500 mb-2" />
        <p className="font-bold text-gray-800 text-base">마이데이터 서비스</p>
        <p className="text-sm text-blue-500 mt-0.5">안전하게 연결합니다</p>
      </div>

      <p className="font-bold text-gray-800 mb-3">서비스 이용 동의</p>

      {/* 전체 동의 */}
      <button
        onClick={() => {
          const allChecked = CONSENT_ITEMS.every(item => consents[item.key]);
          const next = !allChecked;
          setConsents({ personal: next, financial: next, terms: next, marketing: next });
        }}
        className="flex items-center justify-between w-full bg-blue-50 rounded-2xl px-4 py-3 mb-4 active:scale-[0.99] transition"
      >
        <span className="text-sm font-bold text-blue-700 text-left">전체 동의 (선택 항목 포함)</span>
        <Checkbox checked={CONSENT_ITEMS.every(item => consents[item.key])} />
      </button>

      <div className="space-y-5 flex-1">
        {CONSENT_ITEMS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => toggleConsent(key)}
            className="flex items-center justify-between w-full"
          >
            <span className="text-sm text-gray-700 text-left">{label}</span>
            <Checkbox checked={consents[key]} />
          </button>
        ))}
      </div>

      <button
        onClick={() => setStep('select')}
        disabled={!allRequired}
        className="w-full bg-blue-800 hover:bg-blue-900 disabled:opacity-40 text-white py-4 rounded-2xl font-bold mt-6 transition active:scale-95"
      >
        모두 동의하고 시작
      </button>
    </PhoneFrame>
  );

  // ── Step 2: 계좌 선택 ────────────────────────────────────
  if (step === 'select') return (
    <PhoneFrame bottomLabel="계좌 선택">
      <h2 className="text-xl font-bold text-gray-800 mb-1">연동할 기관을 선택해주세요</h2>
      <p className="text-sm text-gray-400 mb-6">선택한 기관의 자산이 자동으로 연결됩니다</p>

      <div className="space-y-3 flex-1">
        {BANK_LIST.map(bank => (
          <button
            key={bank.id}
            onClick={() => toggleBank(bank.id)}
            className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl border transition active:scale-95 ${
              selected.includes(bank.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <span className="text-sm font-medium text-gray-700">{bank.name}</span>
            <Checkbox checked={selected.includes(bank.id)} />
          </button>
        ))}
      </div>

      <button
        onClick={() => setStep('linking')}
        disabled={selected.length === 0}
        className="w-full bg-blue-800 hover:bg-blue-900 disabled:opacity-40 text-white py-4 rounded-2xl font-bold mt-6 transition active:scale-95"
      >
        {selected.length > 0 ? `${selected.length}개 기관 연동하기` : '기관을 선택해주세요'}
      </button>
    </PhoneFrame>
  );

  // ── Step 3: 연동 중 ──────────────────────────────────────
  if (step === 'linking') return (
    <PhoneFrame bottomLabel="연동 중">
      <div className="flex flex-col items-center w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-6">자산 불러오는 중</h2>

        <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-6" />

        <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed">
          흩어진 자산을<br />한곳에 모으고 있어요
        </p>

        <div className="w-full space-y-3">
          {selected.map(id => {
            const bank = BANK_LIST.find(b => b.id === id)!;
            const status = linkStatus[id] ?? 'waiting';
            return (
              <div
                key={id}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${
                  status === 'done'    ? 'border-green-200 bg-green-50' :
                  status === 'linking' ? 'border-blue-200  bg-blue-50'  :
                                        'border-gray-100  bg-gray-50'
                }`}
              >
                <span className={`w-5 text-center text-sm font-bold leading-none ${
                  status === 'done'    ? 'text-green-500' :
                  status === 'linking' ? 'text-blue-400'  :
                                        'text-gray-300'
                }`}>
                  {status === 'done' ? '✓' : status === 'linking' ? '···' : ''}
                </span>
                <span className={`text-sm font-medium ${
                  status === 'done'    ? 'text-green-700' :
                  status === 'linking' ? 'text-blue-700'  :
                                        'text-gray-400'
                }`}>
                  {bank.name}&nbsp;
                  {status === 'done' ? '완료' : status === 'linking' ? '연동 중' : '대기 중'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );

  // ── Step 4: 계좌 선택 ───────────────────────────────────
  return (
    <PhoneFrame bottomLabel="계좌 선택">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
        <h2 className="text-lg font-bold text-gray-800">연동 완료!</h2>
      </div>
      <p className="text-sm text-gray-400 mb-5">
        가져온 계좌 중 사용할 계좌를 선택해주세요
      </p>

      <div className="flex-1 overflow-y-auto space-y-5 -mx-2 px-2">
        {selected.map(bankId => {
          const bank = BANK_LIST.find(b => b.id === bankId)!;
          const accs = BANK_ACCOUNTS[bankId] ?? [];
          return (
            <div key={bankId}>
              <p className="text-xs font-bold text-gray-500 mb-2 px-1">{bank.name}</p>
              <div className="space-y-2">
                {accs.map(acc => {
                  const checked = pickedAccounts.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      onClick={() => togglePickedAccount(acc.id)}
                      className={`w-full text-left px-4 py-3 rounded-2xl border-2 flex items-center justify-between transition active:scale-[0.98] ${
                        checked ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                            {acc.type}
                          </span>
                          <span className="text-sm font-bold text-gray-800 truncate">{acc.name}</span>
                        </div>
                        <p className="text-xs text-gray-500">{acc.balance.toLocaleString()}원</p>
                      </div>
                      <Checkbox checked={checked} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/salary-select')}
        disabled={pickedAccounts.length === 0}
        className="w-full bg-blue-800 hover:bg-blue-900 disabled:opacity-40 text-white py-4 rounded-2xl font-bold mt-6 transition active:scale-95"
      >
        {pickedAccounts.length > 0
          ? `${pickedAccounts.length}개 계좌 연결하고 급여통장 설정하기 →`
          : '계좌를 선택해주세요'}
      </button>
    </PhoneFrame>
  );
}
