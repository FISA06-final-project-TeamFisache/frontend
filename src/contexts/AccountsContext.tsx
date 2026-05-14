import { createContext, useContext, useState, type ReactNode } from 'react';

export type Account = { id: string; name: string; type: string };
export type RoutingItem = { id: number | string; accountId: string; tag: string; percent: number };

type AccountsContextValue = {
  availableAccounts: Account[];
  setAvailableAccounts: (a: Account[] | ((prev: Account[]) => Account[])) => void;
  routingSetup: RoutingItem[];
  setRoutingSetup: (s: RoutingItem[] | ((prev: RoutingItem[]) => RoutingItem[])) => void;
};

const AccountsContext = createContext<AccountsContextValue | null>(null);

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc_inv1', name: '한국투자증권 (종합CMA)', type: '주식' },
  { id: 'acc_inv2', name: 'KB증권 (채권형)', type: '채권' },
  { id: 'acc_inv3', name: '토스증권 (소수점)', type: '주식' },
  { id: 'acc_bank1', name: '카카오뱅크 (입출금)', type: '현금' },
  { id: 'acc_bank2', name: '신한은행 (주택청약)', type: '현금' },
  { id: 'acc_bank3', name: '우리은행 (파킹통장)', type: '현금' },
];

const DEFAULT_ROUTING: RoutingItem[] = [
  { id: 1, accountId: 'acc_inv1', tag: '메인 투자 계좌', percent: 40 },
  { id: 2, accountId: 'acc_inv2', tag: '안전 채권형', percent: 40 },
  { id: 3, accountId: 'acc_bank1', tag: '비상금 파킹', percent: 20 },
];

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [routingSetup, setRoutingSetup] = useState<RoutingItem[]>(DEFAULT_ROUTING);

  return (
    <AccountsContext.Provider
      value={{ availableAccounts, setAvailableAccounts, routingSetup, setRoutingSetup }}
    >
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts(): AccountsContextValue {
  const ctx = useContext(AccountsContext);
  if (!ctx) throw new Error('useAccounts는 AccountsProvider 안에서만 사용 가능');
  return ctx;
}
