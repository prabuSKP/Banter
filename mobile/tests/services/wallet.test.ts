// mobile/tests/services/wallet.test.ts

import walletService from '../../src/services/wallet';
import api from '../../src/services/api';

// Mock the api module
jest.mock('../../src/services/api');

describe('WalletService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should fetch wallet balance successfully', async () => {
      const mockBalance = {
        coins: 1000,
        formatted: '1000 coins',
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: { data: mockBalance },
      });

      const result = await walletService.getBalance();

      expect(api.get).toHaveBeenCalledWith('/wallet/balance');
      expect(result).toEqual(mockBalance);
    });

    it('should throw error when API call fails', async () => {
      const errorMessage = 'Network error';
      (api.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(walletService.getBalance()).rejects.toThrow(errorMessage);
    });
  });

  describe('getTransactions', () => {
    it('should fetch transactions with default pagination', async () => {
      const mockTransactions = [
        {
          id: '1',
          type: 'purchase',
          coins: 100,
          amount: 9900,
          description: 'Coin purchase',
          status: 'completed',
          createdAt: '2025-01-07T00:00:00Z',
          isCredit: true,
          isDebit: false,
        },
      ];

      const mockPagination = {
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1,
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: {
          data: mockTransactions,
          pagination: mockPagination,
        },
      });

      const result = await walletService.getTransactions();

      expect(api.get).toHaveBeenCalledWith('/wallet/transactions', {
        params: { page: 1, limit: 50 },
      });
      expect(result.transactions).toEqual(mockTransactions);
      expect(result.pagination).toEqual(mockPagination);
    });

    it('should fetch transactions with custom pagination', async () => {
      const mockTransactions = [];
      const mockPagination = {
        page: 2,
        limit: 20,
        total: 0,
        totalPages: 0,
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: {
          data: mockTransactions,
          pagination: mockPagination,
        },
      });

      await walletService.getTransactions(2, 20);

      expect(api.get).toHaveBeenCalledWith('/wallet/transactions', {
        params: { page: 2, limit: 20 },
      });
    });
  });

  describe('getRechargePackages', () => {
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
        {
          id: 1,
          coins: 500,
          amount: 99,
          bonus: 100,
          totalCoins: 600,
          perCoinCost: 0.165,
          savings: '20% bonus',
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: { data: mockPackages },
      });

      const result = await walletService.getRechargePackages();

      expect(api.get).toHaveBeenCalledWith('/wallet/packages');
      expect(result).toEqual(mockPackages);
      expect(result).toHaveLength(2);
      expect(result[1].bonus).toBe(100);
    });
  });

  describe('getStatistics', () => {
    it('should fetch coin statistics successfully', async () => {
      const mockStats = {
        currentBalance: 1000,
        totalEarned: 5000,
        totalSpent: 4000,
        netBalance: 1000,
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: { data: mockStats },
      });

      const result = await walletService.getStatistics();

      expect(api.get).toHaveBeenCalledWith('/wallet/statistics');
      expect(result).toEqual(mockStats);
      expect(result.currentBalance).toBe(1000);
      expect(result.totalEarned).toBe(5000);
    });
  });

  describe('chargeForCall', () => {
    it('should charge coins for a call successfully', async () => {
      const mockData = {
        callId: 'call123',
        callType: 'audio' as const,
        duration: 120,
      };

      const mockResponse = {
        success: true,
        message: 'Call charged successfully',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await walletService.chargeForCall(mockData);

      expect(api.post).toHaveBeenCalledWith('/wallet/charge-call', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle charging for video call', async () => {
      const mockData = {
        callId: 'call456',
        callType: 'video' as const,
        duration: 60,
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      await walletService.chargeForCall(mockData);

      expect(api.post).toHaveBeenCalledWith('/wallet/charge-call', mockData);
    });
  });
});
