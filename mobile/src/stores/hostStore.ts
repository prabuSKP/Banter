// mobile/src/stores/hostStore.ts

import { create } from 'zustand';
import hostService, {
  HostDashboard,
  Earning,
  Withdrawal,
  ApplyHostData,
  WithdrawalRequest,
  RateHostData,
} from '../services/host';

interface HostState {
  // State
  dashboard: HostDashboard | null;
  earnings: Earning[];
  earningsPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  applyAsHost: (data: ApplyHostData) => Promise<void>;
  fetchDashboard: () => Promise<void>;
  fetchEarnings: (page?: number, limit?: number) => Promise<void>;
  requestWithdrawal: (data: WithdrawalRequest) => Promise<Withdrawal>;
  rateHost: (data: RateHostData) => Promise<void>;
  clearError: () => void;
}

export const useHostStore = create<HostState>((set, get) => ({
  // Initial state
  dashboard: null,
  earnings: [],
  earningsPagination: null,
  isLoading: false,
  error: null,

  // Apply to become a host
  applyAsHost: async (data: ApplyHostData) => {
    set({ isLoading: true, error: null });
    try {
      await hostService.applyAsHost(data);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Fetch host dashboard
  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const dashboard = await hostService.getHostDashboard();
      set({ dashboard, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load dashboard';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Fetch earnings history
  fetchEarnings: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const { earnings, pagination } = await hostService.getEarningsHistory(page, limit);

      // If page 1, replace earnings; otherwise append
      if (page === 1) {
        set({ earnings, earningsPagination: pagination, isLoading: false });
      } else {
        const currentEarnings = get().earnings;
        set({
          earnings: [...currentEarnings, ...earnings],
          earningsPagination: pagination,
          isLoading: false,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load earnings';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Request withdrawal
  requestWithdrawal: async (data: WithdrawalRequest) => {
    set({ isLoading: true, error: null });
    try {
      const withdrawal = await hostService.requestWithdrawal(data);
      set({ isLoading: false });

      // Refresh dashboard to update available balance
      await get().fetchDashboard();

      return withdrawal;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to request withdrawal';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Rate a host
  rateHost: async (data: RateHostData) => {
    set({ isLoading: true, error: null });
    try {
      await hostService.rateHost(data);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to submit rating';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
