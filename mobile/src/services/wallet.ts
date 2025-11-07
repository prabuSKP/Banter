// mobile/src/services/wallet.ts

import api from './api';

export interface WalletBalance {
  coins: number;
  formatted: string;
}

export interface Transaction {
  id: string;
  type: string;
  coins: number;
  amount: number;
  description: string;
  status: string;
  metadata?: any;
  createdAt: string;
  isCredit: boolean;
  isDebit: boolean;
}

export interface RechargePackage {
  id: number;
  coins: number;
  amount: number;
  bonus: number;
  totalCoins: number;
  perCoinCost: number;
  savings: string | null;
}

export interface CoinStatistics {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  netBalance: number;
}

class WalletService {
  // Get wallet balance
  async getBalance(): Promise<WalletBalance> {
    const response = await api.get('/wallet/balance');
    return response.data.data;
  }

  // Get transaction history
  async getTransactions(page: number = 1, limit: number = 50) {
    const response = await api.get('/wallet/transactions', {
      params: { page, limit },
    });
    return {
      transactions: response.data.data as Transaction[],
      pagination: response.data.pagination,
    };
  }

  // Get available recharge packages
  async getRechargePackages(): Promise<RechargePackage[]> {
    const response = await api.get('/wallet/packages');
    return response.data.data;
  }

  // Transfer coins to another user
  async transferCoins(data: {
    toUserId: string;
    amount: number;
    message?: string;
  }) {
    const response = await api.post('/wallet/transfer', data);
    return response.data;
  }

  // Get coin usage statistics
  async getStatistics(): Promise<CoinStatistics> {
    const response = await api.get('/wallet/statistics');
    return response.data.data;
  }

  // Charge for call (called by backend automatically, but can be used for verification)
  async chargeForCall(data: {
    callId: string;
    callType: 'audio' | 'video';
    duration: number;
  }) {
    const response = await api.post('/wallet/charge-call', data);
    return response.data;
  }
}

export default new WalletService();
