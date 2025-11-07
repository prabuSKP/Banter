// mobile/src/services/payment.ts

import api from './api';

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  transactionId: string;
  coins?: number;
}

class PaymentService {
  // Create Razorpay order for coin recharge
  async createCoinOrder(packageIndex: number, amount: number): Promise<PaymentOrder> {
    const response = await api.post('/payments/order', {
      productType: 'coins',
      amount,
      packageIndex,
    });
    return response.data.data;
  }

  // Create order for premium subscription
  async createPremiumOrder(plan: 'premium_monthly' | 'premium_yearly', amount: number): Promise<PaymentOrder> {
    const response = await api.post('/payments/order', {
      productType: plan,
      amount,
    });
    return response.data.data;
  }

  // Verify payment after Razorpay success
  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const response = await api.post('/payments/verify', data);
    return response.data;
  }

  // Get user transactions
  async getTransactions(page: number = 1, limit: number = 50) {
    const response = await api.get('/payments/transactions', {
      params: { page, limit },
    });
    return {
      transactions: response.data.data,
      pagination: response.data.pagination,
    };
  }

  // Get subscription status
  async getSubscription() {
    const response = await api.get('/payments/subscription');
    return response.data.data;
  }

  // Cancel subscription
  async cancelSubscription() {
    const response = await api.post('/payments/cancel-subscription');
    return response.data;
  }
}

export default new PaymentService();
