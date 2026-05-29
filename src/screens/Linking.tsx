import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check } from 'lucide-react';
import wooriLogo   from '../assets/banks/woori.png';
import kbLogo      from '../assets/banks/kb.png';
import kakaoLogo   from '../assets/banks/kakao.png';
import tossLogo    from '../assets/banks/toss.png';
import shinhanLogo from '../assets/banks/shinhan.png';
import hanaLogo    from '../assets/banks/hana.png';
import { getMyDataPreview, syncAssets } from '../api/assetApi';
import type { PreviewAccount } from '../api/assetApi';

type Step = 'consent' | 'select' | 'linking' | 'account-pick';
type LinkStatus = 'waiting' | 'linking' | 'done';

const BANK_LIST = [
  { id: 'woori',   name: '우리은행',   logo: wooriLogo   },
  { id: 'kb',      name: '국민은행',   logo: kbLogo      },
  { id: 'kakao',   name: '카카오뱅크', logo: kakaoLogo   },
  { id: 'toss',    name: '토스뱅크',   logo: tossLogo    },
  { id: 'shinhan', name: '신한은행',   logo: shinhanLogo },
  { id: 'hana',    name: '하나은행',   logo: hanaLogo    },
];

const BANK_NAME_MAP: Record<string, string> = {
  woori:   '우리은행',
  kb:      '국민은행',
  kakao:   '카카오뱅크',
  toss:    '토스뱅크',
  shinhan: '신한은행',
  hana:    '하나은행',
};

function assetTypeLabel(assetType: string): string {
  switch (assetType) {
    case 'CHECKING': return '입출금';
    case 'SAVINGS':
    case 'SAVING':   return '예·적금';
    case 'STOCK':    return '증권';
    case 'PARKING':  return '입출금';
    case 'IRP':      return 'IRP';
    case 'CREDIT_CARD': return '카드';
    default:         return assetType;
  }
}

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
  const [pickedAccounts, setPickedAccounts] = useState<string[]>([]); // assetNumbers
  const [previewAccounts, setPreviewAccounts] = useState<PreviewAccount[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const accountsByInstitution = previewAccounts.reduce((groups, acc) => {
    if (!groups[acc.institution]) groups[acc.institution] = [];
    groups[acc.institution].push(acc);
    return groups;
  }, {} as Record<string, PreviewAccount[]>);

  const togglePickedAccount = (assetNumber: string) =>
    setPickedAccounts(prev => prev.includes(assetNumber) ? prev.filter(a => a !== assetNumber) : [...prev, assetNumber]);

  const allRequired = consents.personal && consents.financial && consents.terms;

  const toggleConsent = (key: keyof typeof consents) =>
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleBank = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);

  useEffect(() => {
    if (step !== 'linking') return;

    // 마이데이터 미리보기 API 호출 (애니메이션과 병렬)
    const institutionNames = selected.map(id => BANK_NAME_MAP[id] ?? id);
    setLoadingPreview(true);
    getMyDataPreview(institutionNames)
      .then(accounts => setPreviewAccounts(accounts))
      .catch(() => setPreviewAccounts([]))
      .finally(() => setLoadingPreview(false));

    // 애니메이션
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

  const handleConfirm = async () => {
    if (pickedAccounts.length === 0) return;
    setSyncing(true);
    try {
      const assets = await syncAssets(pickedAccounts);
      navigate('/salary-select', { state: { assets } });
    } catch (err) {
      console.error('[Linking] syncAssets 실패:', err);
    } finally {
      setSyncing(false);
    }
  };

  // ── Step 1: 서비스 동의 ──────────────────────────────────
  if (step === 'consent') return (
    <PhoneFrame bottomLabel="서비스 동의">
      <div className="bg-blue-50 rounded-2xl p-6 flex flex-col items-center mb-6">
        <Lock className="w-8 h-8 text-blue-500 mb-2" />
        <p className="font-bold text-gray-800 text-base">마이데이터 서비스</p>
        <p className="text-sm text-blue-500 mt-0.5">안전하게 연결합니다</p>
      </div>

      <p className="font-bold text-gray-800 mb-3">서비스 이용 동의</p>

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
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white py-4 rounded-2xl font-bold mt-6 transition active:scale-95"
      >
        모두 동의하고 시작
      </button>
    </PhoneFrame>
  );

  // ── Step 2: 기관 선택 ────────────────────────────────────
  if (step === 'select') return (
    <PhoneFrame bottomLabel="자산 연결">
      <h2 className="text-xl font-bold text-gray-800 mb-1">연결할 기관을 선택해 주세요</h2>
      <p className="text-sm text-gray-400 mb-4">선택한 기관의 자산이 자동으로 연결됩니다</p>

      <button
        onClick={() => setSelected(
          selected.length === BANK_LIST.length ? [] : BANK_LIST.map(b => b.id)
        )}
        className="flex items-center justify-between w-full bg-blue-50 rounded-2xl px-4 py-3 mb-3 active:scale-[0.99] transition"
      >
        <span className="text-sm font-bold text-blue-700">전체 선택</span>
        <Checkbox checked={selected.length === BANK_LIST.length} />
      </button>

      <div className="space-y-3 flex-1">
        {BANK_LIST.map(bank => (
          <button
            key={bank.id}
            onClick={() => toggleBank(bank.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition active:scale-95 ${
              selected.includes(bank.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                <img src={bank.logo} alt={bank.name} className="w-7 h-7 object-contain" />
              </div>
              <span className="text-sm font-medium text-gray-700">{bank.name}</span>
            </div>
            <Checkbox checked={selected.includes(bank.id)} />
          </button>
        ))}
      </div>

      <button
        onClick={() => setStep('linking')}
        disabled={selected.length === 0}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white py-4 rounded-2xl font-bold mt-6 transition active:scale-95"
      >
        {selected.length > 0 ? `${selected.length}개 기관 연결하기` : '기관을 선택해주세요'}
      </button>
    </PhoneFrame>
  );

  // ── Step 3: 연동 중 ──────────────────────────────────────
  if (step === 'linking') return (
    <PhoneFrame bottomLabel="연결 중">
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
                  {status === 'done' ? '완료' : status === 'linking' ? '연결 중' : '대기 중'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );

  // ── Step 4: 계좌 선택 ───────────────────────────────────
  const allNums = previewAccounts.map(a => a.assetNumber);
  const isAll = allNums.length > 0 && allNums.every(n => pickedAccounts.includes(n));

  return (
    <PhoneFrame bottomLabel="계좌 선택">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
        <h2 className="text-lg font-bold text-gray-800">연결 완료!</h2>
      </div>
      <p className="text-sm text-gray-700 mb-4">
        가져온 계좌 중 사용할 계좌를 선택해주세요
      </p>

      <button
        onClick={() => setPickedAccounts(isAll ? [] : allNums)}
        className="flex items-center justify-between w-full bg-blue-50 rounded-2xl px-4 py-3 mb-4 active:scale-[0.99] transition"
      >
        <span className="text-sm font-bold text-blue-700">전체 선택</span>
        <Checkbox checked={isAll} />
      </button>

      <div className="flex-1 overflow-y-auto space-y-5 -mx-2 px-2">
        {loadingPreview ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : Object.keys(accountsByInstitution).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">선택한 기관에서 가져온 계좌가 없습니다</p>
        ) : (
          Object.entries(accountsByInstitution).map(([institution, accs]) => (
            <div key={institution}>
              <p className="text-xs font-bold text-gray-500 mb-2 px-1">{institution}</p>
              <div className="space-y-2">
                {accs.map(acc => {
                  const checked = pickedAccounts.includes(acc.assetNumber);
                  return (
                    <button
                      key={acc.assetNumber}
                      onClick={() => togglePickedAccount(acc.assetNumber)}
                      className={`w-full text-left px-4 py-3 rounded-2xl border-2 flex items-center justify-between transition active:scale-[0.98] ${
                        checked ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                            {assetTypeLabel(acc.assetType)}
                          </span>
                          <span className="text-sm font-bold text-gray-800 truncate">{acc.accountName}</span>
                        </div>
                        <p className="text-xs text-gray-500">{acc.balance.toLocaleString()}원</p>
                      </div>
                      <Checkbox checked={checked} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleConfirm}
        disabled={pickedAccounts.length === 0 || syncing}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white py-4 rounded-2xl font-bold mt-6 transition active:scale-95"
      >
        {syncing
          ? '연동 중...'
          : pickedAccounts.length > 0
            ? `${pickedAccounts.length}개 계좌 연결하고 급여통장 설정하기 →`
            : '계좌를 선택해주세요'}
      </button>
    </PhoneFrame>
  );
}
