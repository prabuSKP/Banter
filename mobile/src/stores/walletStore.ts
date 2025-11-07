// mobile/src/stores/walletStore.ts

import { create } from 'zustand';
import walletService, { WalletBalance, Transaction, RechargePackage, CoinStatistics } from '../services/wallet';

interface WalletState {
  balance: WalletBalance | null;
  transactions: Transaction[];
  packages: RechargePackage[];
  statistics: CoinStatistics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBalance: () => Promise<void>;
  fetchTransactions: (page?: number) => Promise<void>;
  fetchPackages: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  transferCoins: (toUserId: string, amount: number, message?: string) => Promise<void>;
  refreshWallet: () => Promise<void>;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: null,
  transactions: [],
  packages: [],
  statistics: null,
  isLoading: false,
  error: null,

  fetchBalance: async () => {
    try {
      set({ isLoading: true, error: null });
      const balance = await walletService.getBalance();
      set({ balance, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch balance',
        isLoading: false,
      });
    }
  },

  fetchTransactions: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const { transactions } = await walletService.getTransactions(page);

      // Append if page > 1, replace if page === 1
      set(state => ({
        transactions: page === 1 ? transactions : [...state.transactions, ...transactions],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch transactions',
        isLoading: false,
      });
    }
  },

  fetchPackages: async () => {
    try {
      set({ isLoading: true, error: null });
      const packages = await walletService.getRechargePackages();
      set({ packages, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch packages',
        isLoading: false,
      });
    }
  },

  fetchStatistics: async () => {
    try {
      set({ isLoading: true, error: null });
      const statistics = await walletService.getStatistics();
      set({ statistics, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch statistics',
        isLoading: false,
      });
    }
  },

  transferCoins: async (toUserId: string, amount: number, message?: string) => {
    try {
      set({ isLoading: true, error: null });
      await walletService.transferCoins({ toUserId, amount, message });

      // Refresh balance and transactions
      await get().fetchBalance();
      await get().fetchTransactions(1);

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to transfer coins',
        isLoading: false,
      });
      throw error;
    }
  },

  refreshWallet: async () => {
    await Promise.all([
      get().fetchBalance(),
      get().fetchTransactions(1),
      get().fetchStatistics(),
    ]);
  },

  clearError: () => set({ error: null }),
}));
