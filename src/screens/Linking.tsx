import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Check, Landmark } from 'lucide-react';
import { getMyDataInstitutions, getMyDataPreview, syncAssets, getAssetSummary, type Asset, type PreviewAccount, type AssetSummary, type MydataInstitution } from '../api/assetApi';
import { getBankImgSrc } from '../constants/banks';

type Step = 'consent' | 'select' | 'linking' | 'account-pick' | 'complete';
type LinkStatus = 'waiting' | 'linking' | 'done';

// 기관명 → 로고. 더미 테이블에 어떤 기관이 들어오든 화면은 동작하고,
// 여기에 매핑이 없는 기관(미래에셋·한국투자 등)은 기본 아이콘으로 표시한다.
function BankLogo({ institution, className }: { institution: string; className?: string }) {
  const logo = getBankImgSrc(institution);
  if (logo) return <img src={logo} alt={institution} className={className} />;
  return <Landmark className={`${className} text-gray-400`} strokeWidth={2} />;
}


const CONSENT_ITEMS = [
  { key: 'personal'  as const, label: '필수 개인정보 수집·이용 (필수)' },
  { key: 'financial' as const, label: '금융정보 조회·전송 동의 (필수)' },
  { key: 'terms'     as const, label: '서비스 이용약관 (필수)' },
  { key: 'marketing' as const, label: '마케팅 수신 동의 (선택)' },
];

function assetTypeLabel(assetType: string): string {
  const map: Record<string, string> = {
    CHECKING: '입출금',
    SAVINGS: '예·적금',
    DEPOSIT: '예·적금',
    PARKING: '파킹',
    STOCK: '증권',
    INVESTMENT: '증권',
    IRP: 'IRP',
    ISA: 'ISA',
    PENSION_SAVINGS: '연금저축',
    CREDIT_CARD: '카드',
    CARD: '카드',
  };
  return map[assetType] ?? assetType;
}

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
  const location = useLocation();
  // 대시보드 "+ 새 기관 연동하기"로 진입 시 returnTo가 들어옴 → 약관 스킵 + 완료 후 복귀
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const [step, setStep] = useState<Step>(returnTo ? 'select' : 'consent');
  const [consents, setConsents] = useState({ personal: false, financial: false, terms: false, marketing: false });
  // 더미 테이블에서 받아온 연동 가능 기관 목록
  const [institutions, setInstitutions] = useState<MydataInstitution[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
  // 선택한 기관명(institution) 목록
  const [selected, setSelected] = useState<string[]>([]);
  const [linkStatus, setLinkStatus] = useState<Record<string, LinkStatus>>({});
  const [pickedAccounts, setPickedAccounts] = useState<string[]>([]);
  const [previewAccounts, setPreviewAccounts] = useState<PreviewAccount[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [summary, setSummary] = useState<AssetSummary | null>(null);
  const [syncedAssets, setSyncedAssets] = useState<Asset[]>([]);

  const togglePickedAccount = (id: string) =>
    setPickedAccounts(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  const allRequired = consents.personal && consents.financial && consents.terms;

  const toggleConsent = (key: keyof typeof consents) =>
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleBank = (name: string) =>
    setSelected(prev => prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name]);

  // select 단계 진입 시 더미 테이블의 연동 가능 기관을 한 번 불러온다
  useEffect(() => {
    if (step !== 'select' || institutions.length > 0 || institutionsLoading) return;
    setInstitutionsLoading(true);
    getMyDataInstitutions()
      .then(setInstitutions)
      .catch(() => setInstitutions([]))
      .finally(() => setInstitutionsLoading(false));
  }, [step, institutions.length, institutionsLoading]);

  useEffect(() => {
    if (step !== 'linking') return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // 모든 기관을 '연결 중'으로 두고, 진입과 동시에 실제 백엔드 조회를 시작한다.
    const initial: Record<string, LinkStatus> = {};
    selected.forEach(name => { initial[name] = 'linking'; });
    setLinkStatus(initial);

    // 백엔드 응답이 끝나는 즉시 다음 단계로 넘어간다 (고정 대기 시간 없음).
    getMyDataPreview(selected)
      .then(accounts => { if (!cancelled) setPreviewAccounts(accounts); })
      .catch(() => { if (!cancelled) setPreviewAccounts([]); })
      .finally(() => {
        if (cancelled) return;
        // 완료 표시를 잠깐 보여준 뒤 전환 (체감용 짧은 딜레이)
        setLinkStatus(prev => {
          const done = { ...prev };
          selected.forEach(name => { done[name] = 'done'; });
          return done;
        });
        timers.push(setTimeout(() => { if (!cancelled) setStep('account-pick'); }, 400));
      });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
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
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white py-4 rounded-2xl font-bold mt-6 transition active:scale-95"
      >
        모두 동의하고 시작
      </button>
    </PhoneFrame>
  );

  // ── Step 2: 계좌 선택 ────────────────────────────────────
  if (step === 'select') return (
    <PhoneFrame bottomLabel="자산 연결">
      <h2 className="text-xl font-bold text-gray-800 mb-1">연결할 기관을 선택해 주세요</h2>
      <p className="text-sm text-gray-400 mb-4">선택한 기관의 자산이 자동으로 연결됩니다</p>

      {/* 전체 선택 */}
      <button
        onClick={() => setSelected(
          selected.length === institutions.length ? [] : institutions.map(i => i.institution)
        )}
        disabled={institutions.length === 0}
        className="flex items-center justify-between w-full bg-blue-50 rounded-2xl px-4 py-3 mb-3 active:scale-[0.99] transition disabled:opacity-40"
      >
        <span className="text-sm font-bold text-blue-700">전체 선택</span>
        <Checkbox checked={institutions.length > 0 && selected.length === institutions.length} />
      </button>

      <div className="space-y-3 flex-1">
        {institutionsLoading ? (
          <p className="text-center text-sm text-gray-400 py-10">연동 가능한 기관을 불러오는 중...</p>
        ) : institutions.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">연동 가능한 기관이 없습니다</p>
        ) : (
          institutions.map(inst => (
            <button
              key={inst.institution}
              onClick={() => toggleBank(inst.institution)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition active:scale-95 ${
                selected.includes(inst.institution) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  <BankLogo institution={inst.institution} className="w-7 h-7 object-contain" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium text-gray-700">{inst.institution}</span>
                  <p className="text-xs text-gray-400">계좌 {inst.accountCount}개</p>
                </div>
              </div>
              <Checkbox checked={selected.includes(inst.institution)} />
            </button>
          ))
        )}
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
          {selected.map(name => {
            const status = linkStatus[name] ?? 'waiting';
            return (
              <div
                key={name}
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
                  {name}&nbsp;
                  {status === 'done' ? '완료' : status === 'linking' ? '연결 중' : '대기 중'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );

  // ── Step 5: 연동 완료 ───────────────────────────────────
  if (step === 'complete') return (
    <PhoneFrame bottomLabel="연동 완료">
      <div className="flex flex-col items-center text-center mt-8 mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-500" strokeWidth={3} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">연동 완료!</h2>
        <p className="text-sm text-gray-400">{syncedAssets.length}개 자산이 연결되었어요</p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="bg-gray-50 rounded-2xl px-5 py-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">총 자산</span>
          <span className="text-base font-bold text-gray-800">
            {summary ? `${summary.totalBalance.toLocaleString()}원` : '-'}
          </span>
        </div>
        <div className="bg-gray-50 rounded-2xl px-5 py-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">투자 자산</span>
          <span className="text-base font-bold text-gray-800">
            {summary ? `${summary.investBalance.toLocaleString()}원` : '-'}
          </span>
        </div>
        <div className="bg-gray-50 rounded-2xl px-5 py-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">카드 개수</span>
          <span className="text-base font-bold text-gray-800">
            {summary ? `${summary.linkedCardCount}개 연결됨` : '-'}
          </span>
        </div>
      </div>

      <button
        onClick={() => returnTo
          ? navigate(returnTo)
          : navigate('/salary-select', { state: { linkedAccounts: syncedAssets } })}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold transition active:scale-95"
      >
        {returnTo ? '완료' : '급여통장 설정하기 →'}
      </button>
    </PhoneFrame>
  );

  // ── Step 4: 계좌 선택 ───────────────────────────────────
  const allAssetNumbers = previewAccounts.map(a => a.assetNumber);
  const isAll = allAssetNumbers.length > 0 && allAssetNumbers.every(n => pickedAccounts.includes(n));

  // institution 별로 그룹핑
  const groupedPreview = previewAccounts.reduce<Record<string, PreviewAccount[]>>((acc, pa) => {
    if (!acc[pa.institution]) acc[pa.institution] = [];
    acc[pa.institution].push(pa);
    return acc;
  }, {});

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

      {/* 전체 선택 */}
      <button
        onClick={() => setPickedAccounts(isAll ? [] : allAssetNumbers)}
        className="flex items-center justify-between w-full bg-blue-50 rounded-2xl px-4 py-3 mb-4 active:scale-[0.99] transition"
      >
        <span className="text-sm font-bold text-blue-700">전체 선택</span>
        <Checkbox checked={isAll} />
      </button>

      <div className="flex-1 overflow-y-auto space-y-5 -mx-2 px-2">
        {previewAccounts.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">연결된 계좌가 없습니다</p>
        ) : (
          Object.entries(groupedPreview).map(([institution, accs]) => {
            return (
              <div key={institution}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="w-5 h-5 rounded-full bg-white border border-gray-100 overflow-hidden flex items-center justify-center">
                    <BankLogo institution={institution} className="w-4 h-4 object-contain" />
                  </div>
                  <p className="text-xs font-bold text-gray-500">{institution}</p>
                </div>
                <div className="space-y-2">
                  {accs.map(acc => {
                    const checked = pickedAccounts.includes(acc.assetNumber);
                    return (
                      <button
                        key={acc.assetNumber}
                        onClick={() => togglePickedAccount(acc.assetNumber)}
                        className={`w-full text-left px-4 py-3 rounded-2xl border-2 flex items-center justify-between transition ${
                          checked  ? 'border-blue-400 bg-blue-50 active:scale-[0.98]' :
                                     'border-gray-100 bg-white hover:border-gray-200 active:scale-[0.98]'
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
            );
          })
        )}
      </div>

      <button
        onClick={async () => {
          setSyncLoading(true);
          try {
            const assets = await syncAssets(pickedAccounts);
            setSyncedAssets(assets);
            const s = await getAssetSummary().catch(() => null);
            setSummary(s);
            setStep('complete');
          } catch {
            if (returnTo) navigate(returnTo);
            else navigate('/salary-select', { state: { linkedAccounts: [] } });
          } finally {
            setSyncLoading(false);
          }
        }}
        disabled={pickedAccounts.length === 0 || syncLoading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white py-4 rounded-2xl font-bold mt-6 transition active:scale-95"
      >
        {syncLoading
          ? '연결 중...'
          : pickedAccounts.length > 0
            ? (returnTo
                ? `${pickedAccounts.length}개 계좌 연결하기`
                : `${pickedAccounts.length}개 계좌 연결하고 급여통장 설정하기 →`)
            : '계좌를 선택해주세요'}
      </button>
    </PhoneFrame>
  );
}
