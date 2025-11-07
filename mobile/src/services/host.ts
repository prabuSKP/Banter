// mobile/src/services/host.ts

import api from './api';
import { API_ENDPOINTS } from '../constants';

export interface HostDashboard {
  totalEarnings: number;
  availableBalance: number;
  totalWithdrawn: number;
  totalCallsAsHost: number;
  totalMinutesAsHost: number;
  hostRating: number;
  pendingWithdrawals: number;
}

export interface Earning {
  id: string;
  callType: 'audio' | 'video';
  callDuration: number;
  totalRevenue: number;
  hostShare: number;
  hostEarning: number;
  status: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  method: string;
  status: string;
  upiId?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  transactionId?: string;
  remarks?: string;
  createdAt: string;
  processedAt?: string;
}

export interface ApplyHostData {
  documents: string[];
}

export interface WithdrawalRequest {
  amount: number;
  method: 'upi' | 'bank_transfer' | 'wallet';
  paymentDetails: {
    upiId?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
}

export interface RateHostData {
  hostId: string;
  callId: string;
  rating: number;
  feedback?: string;
}

class HostService {
  // Apply to become a host
  async applyAsHost(data: ApplyHostData): Promise<{ message: string }> {
    const response = await api.post(API_ENDPOINTS.APPLY_AS_HOST, data);
    return response.data;
  }

  // Get host dashboard
  async getHostDashboard(): Promise<HostDashboard> {
    const response = await api.get(API_ENDPOINTS.GET_HOST_DASHBOARD);
    return response.data.data;
  }

  // Get earnings history
  async getEarningsHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    earnings: Earning[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const response = await api.get(API_ENDPOINTS.GET_HOST_EARNINGS, {
      params: { page, limit },
    });
    return {
      earnings: response.data.data,
      pagination: response.data.pagination,
    };
  }

  // Request withdrawal
  async requestWithdrawal(data: WithdrawalRequest): Promise<Withdrawal> {
    const response = await api.post(API_ENDPOINTS.REQUEST_WITHDRAWAL, data);
    return response.data.data;
  }

  // Rate a host after call
  async rateHost(data: RateHostData): Promise<{ message: string }> {
    const response = await api.post(API_ENDPOINTS.RATE_HOST, data);
    return response.data;
  }
}

export default new HostService();
