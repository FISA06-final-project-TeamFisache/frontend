import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Link2, X } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { useAccounts, type Account } from '../../contexts/AccountsContext';
import { formatAmount } from '../../utils/helpers';

// /wizard/initial-funding
// 초기 자본금 + 출처 계좌 선택
type HiddenAccount = Account & { bank: string; balance: number };

const HIDDEN_ACCOUNTS: HiddenAccount[] = [
  { id: 'hidden_nh', bank: 'NH농협', name: 'NH농협 (직장인 우대 통장)', type: '현금', balance: 5200000 },
  { id: 'hidden_hana', bank: '하나은행', name: '하나은행 (주택청약종합저축)', type: '현금', balance: 1800000 },
  { id: 'hidden_kb', bank: 'KB국민', name: 'KB국민 (KB 스타 파킹통장)', type: '현금', balance: 950000 },
];

const BANK_BADGE_COLORS: Record<string, string> = {
  'NH농협': 'bg-green-100 text-green-700',
  '하나은행': 'bg-teal-100 text-teal-700',
  'KB국민': 'bg-yellow-100 text-yellow-700',
};

export default function InitialFunding() {
  const navigate = useNavigate();
  const { availableAccounts, setAvailableAccounts } = useAccounts();
  const { goalAmount, initialInvestment, setInitialInvestment, initialFundingAccount, setInitialFundingAccount } = useWizard();

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkStep, setLinkStep] = useState<'intro' | 'list'>('intro');

  const closeLinkModal = () => {
    setShowLinkModal(false);
    setLinkStep('intro');
  };

  const handleSelectHiddenAccount = (acc: HiddenAccount) => {
    const linked: Account = { id: acc.id, name: acc.name, type: acc.type };
    if (!availableAccounts.find(a => a.id === acc.id)) {
      setAvailableAccounts([...availableAccounts, linked]);
    }
    setInitialFundingAccount(linked);
    closeLinkModal();
  };

  const unlinkedAccounts = HIDDEN_ACCOUNTS.filter(h => !availableAccounts.find(a => a.id === h.id));

  return (
    <div className="space-y-6 flex-1 pt-4 animate-in slide-in-from-right flex flex-col">
      <h2 className="text-2xl font-bold text-gray-900 mt-4 leading-tight">목표를 향한 첫 걸음,<br/>초기 자본금을 설정해주세요</h2>
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 mb-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="font-bold text-gray-700">시작 금액</span>
            <span className="text-2xl font-bold text-blue-600">{initialInvestment > 0 ? `${initialInvestment}만 원` : '0원'}</span>
          </div>
          <input type="range" min="0" max={goalAmount} step="10" value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-2"><span>0원</span><span>{formatAmount(goalAmount)}</span></div>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <span className="font-bold text-gray-700 block mb-3">어느 계좌에서 가져올까요?</span>
          <div className="space-y-2">
            {availableAccounts.filter(acc => acc.type === '현금').map(acc => (
              <button
                key={acc.id}
                onClick={() => setInitialFundingAccount(acc)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${initialFundingAccount?.id === acc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
              >
                <span className="text-sm font-bold text-gray-800">{acc.name}</span>
                {initialFundingAccount?.id === acc.id && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
              </button>
            ))}
            <button
              onClick={() => { setLinkStep('intro'); setShowLinkModal(true); }}
              className="w-full p-3 border border-dashed border-gray-300 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-1 mt-2"
            >
              <Link2 className="w-4 h-4" /> 새로운 통장 연결
            </button>
          </div>
        </div>
      </div>
      <button onClick={() => navigate('/wizard/distribution')} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 mt-auto active:scale-95">
        다음 단계로 <ArrowRight className="w-5 h-5" />
      </button>

      {showLinkModal && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col shadow-2xl max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-xl text-gray-900">새로운 통장 연결</h3>
              <button onClick={closeLinkModal}><X className="text-gray-400 w-6 h-6" /></button>
            </div>

            {linkStep === 'intro' && (
              <div className="p-6 flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mt-4">
                  <Link2 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-gray-900 leading-tight">아직 연결되지 않은<br/>계좌를 찾아올까요?</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">마이데이터를 통해 다른 금융기관에 흩어져 있는<br/>예적금 계좌를 한 번에 불러올 수 있습니다.</p>
                </div>
                <button
                  onClick={() => setLinkStep('list')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-md transition mt-4 active:scale-95"
                >
                  내 숨은 계좌 찾아보기
                </button>
              </div>
            )}

            {linkStep === 'list' && (
              <div className="p-6 space-y-3 overflow-y-auto">
                {unlinkedAccounts.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-10">연결 가능한 숨은 계좌가 없습니다.</p>
                ) : (
                  unlinkedAccounts.map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => handleSelectHiddenAccount(acc)}
                      className="group relative w-full p-4 border border-gray-200 rounded-2xl text-left hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all duration-200 active:scale-95"
                    >
                      <span className="absolute top-4 right-4 text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                        선택 연결
                      </span>
                      <div className="space-y-1.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${BANK_BADGE_COLORS[acc.bank] ?? 'bg-gray-100 text-gray-700'}`}>
                          {acc.bank}
                        </span>
                        <p className="font-bold text-gray-900 text-sm">{acc.name}</p>
                        <p className="text-xs text-gray-500">잔액: {acc.balance.toLocaleString()}원</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
