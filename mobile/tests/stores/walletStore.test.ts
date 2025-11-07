// mobile/tests/stores/walletStore.test.ts

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useWalletStore } from '../../src/stores/walletStore';
import walletService from '../../src/services/wallet';

jest.mock('../../src/services/wallet');

describe('WalletStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useWalletStore.setState({
      balance: null,
      transactions: [],
      packages: [],
      statistics: null,
      isLoading: false,
      error: null,
    });
  });

  describe('fetchBalance', () => {
    it('should fetch and set balance successfully', async () => {
      const mockBalance = {
        coins: 1500,
        formatted: '1500 coins',
      };

      (walletService.getBalance as jest.Mock).mockResolvedValue(mockBalance);

      const { result } = renderHook(() => useWalletStore());

      await act(async () => {
        await result.current.fetchBalance();
      });

      expect(walletService.getBalance).toHaveBeenCalled();
      expect(result.current.balance).toEqual(mockBalance);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set error when fetch fails', async () => {
      const errorMessage = 'Failed to fetch balance';
      (walletService.getBalance as jest.Mock).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      const { result } = renderHook(() => useWalletStore());

      await act(async () => {
        await result.current.fetchBalance();
      });

      expect(result.current.balance).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('fetchTransactions', () => {
    it('should fetch and replace transactions for page 1', async () => {
      const mockTransactions = [
        {
          id: '1',
          type: 'purchase',
          coins: 100,
          amount: 9900,
          description: 'Test transaction',
          status: 'completed',
          createdAt: '2025-01-07',
          isCredit: true,
          isDebit: false,
        },
      ];

      (walletService.getTransactions as jest.Mock).mockResolvedValue({
        transactions: mockTransactions,
        pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
      });

      const { result } = renderHook(() => useWalletStore());

      await act(async () => {
        await result.current.fetchTransactions(1);
      });

      expect(walletService.getTransactions).toHaveBeenCalledWith(1);
      expect(result.current.transactions).toEqual(mockTransactions);
      expect(result.current.transactions).toHaveLength(1);
    });

    it('should append transactions for page > 1', async () => {
      const page1Transactions = [{ id: '1', coins: 100 } as any];
      const page2Transactions = [{ id: '2', coins: 200 } as any];

      const { result } = renderHook(() => useWalletStore());

      // Set initial transactions
      act(() => {
        useWalletStore.setState({ transactions: page1Transactions });
      });

      (walletService.getTransactions as jest.Mock).mockResolvedValue({
        transactions: page2Transactions,
        pagination: { page: 2, limit: 50, total: 2, totalPages: 1 },
      });

      await act(async () => {
        await result.current.fetchTransactions(2);
      });

      expect(result.current.transactions).toHaveLength(2);
      expect(result.current.transactions[0].id).toBe('1');
      expect(result.current.transactions[1].id).toBe('2');
    });
  });

  describe('fetchPackages', () => {
    it('should fetch recharge packages successfully', async () => {
      const mockPackages = [
        {
          id: 0,
          coins: 200,
          amount: 49,
          bonus: 0,
          totalCoins: 200,
          perCoinCost: 0.245,
          savings: null,
        },
      ];

      (walletService.getRechargePackages as jest.Mock).mockResolvedValue(mockPackages);

      const { result } = renderHook(() => useWalletStore());

      await act(async () => {
        await result.current.fetchPackages();
      });

      expect(walletService.getRechargePackages).toHaveBeenCalled();
      expect(result.current.packages).toEqual(mockPackages);
    });
  });

  describe('fetchStatistics', () => {
    it('should fetch statistics successfully', async () => {
      const mockStats = {
        currentBalance: 1000,
        totalEarned: 5000,
        totalSpent: 4000,
        netBalance: 1000,
      };

      (walletService.getStatistics as jest.Mock).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useWalletStore());

      await act(async () => {
        await result.current.fetchStatistics();
      });

      expect(walletService.getStatistics).toHaveBeenCalled();
      expect(result.current.statistics).toEqual(mockStats);
    });
  });

  describe('refreshWallet', () => {
    it('should refresh all wallet data', async () => {
      const mockBalance = { coins: 1000, formatted: '1000 coins' };
      const mockTransactions = [{ id: '1', coins: 100 } as any];
      const mockStats = {
        currentBalance: 1000,
        totalEarned: 5000,
        totalSpent: 4000,
        netBalance: 1000,
      };

      (walletService.getBalance as jest.Mock).mockResolvedValue(mockBalance);
      (walletService.getTransactions as jest.Mock).mockResolvedValue({
        transactions: mockTransactions,
        pagination: {},
      });
      (walletService.getStatistics as jest.Mock).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useWalletStore());

      await act(async () => {
        await result.current.refreshWallet();
      });

      expect(walletService.getBalance).toHaveBeenCalled();
      expect(walletService.getTransactions).toHaveBeenCalledWith(1);
      expect(walletService.getStatistics).toHaveBeenCalled();
      expect(result.current.balance).toEqual(mockBalance);
      expect(result.current.transactions).toEqual(mockTransactions);
      expect(result.current.statistics).toEqual(mockStats);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useWalletStore());

      act(() => {
        useWalletStore.setState({ error: 'Some error' });
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
