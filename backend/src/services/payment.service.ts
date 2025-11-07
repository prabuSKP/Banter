// backend/src/services/payment.service.ts

import Razorpay from 'razorpay';
import crypto from 'crypto';
import env from '../config/env';
import prisma from '../config/database';
import { BadRequestError, InternalServerError } from '../utils/errors';
import logger from '../config/logger';
import { RECHARGE_PACKAGES } from './wallet.service';

export class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  // Create Razorpay order
  async createOrder(
    userId: string,
    data: {
      productType: 'coins' | 'premium_monthly' | 'premium_yearly';
      amount: number;
      packageIndex?: number; // For coin packages
    }
  ) {
    try {
      const { productType, amount, packageIndex } = data;

      let coinsToAdd = 0;

      // Validate amount based on product type
      if (productType === 'coins') {
        // Validate coin package
        if (packageIndex !== undefined && packageIndex >= 0 && packageIndex < RECHARGE_PACKAGES.length) {
          const pkg = RECHARGE_PACKAGES[packageIndex];
          if (amount !== pkg.amount) {
            throw new BadRequestError('Invalid amount for selected package');
          }
          coinsToAdd = pkg.coins + pkg.bonus;
        } else {
          throw new BadRequestError('Invalid coin package selected');
        }
      } else {
        const pricing = this.getPricing(productType);
        if (amount !== pricing.amount) {
          throw new BadRequestError('Invalid amount for this product');
        }
      }

      // Create Razorpay order
      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `order_${userId}_${Date.now()}`,
        notes: {
          userId,
          productType,
          ...(coinsToAdd > 0 && { coins: coinsToAdd }),
        },
      });

      // Save transaction to database
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: productType === 'coins' ? 'purchase' : 'purchase',
          amount: amount * 100, // Store in paisa
          coins: coinsToAdd > 0 ? coinsToAdd : null,
          status: 'pending',
          description: productType === 'coins'
            ? `Coin recharge - ${coinsToAdd} coins`
            : `Premium subscription - ${productType}`,
          razorpayOrderId: order.id,
        },
      });

      logger.info(`Order created: ${order.id} for user ${userId}`);

      return {
        orderId: order.id,
        amount: amount,
        currency: 'INR',
        transactionId: transaction.id,
        ...(coinsToAdd > 0 && { coins: coinsToAdd }),
      };
    } catch (error) {
      logger.error('Create order error:', error);
      throw error;
    }
  }

  // Verify Razorpay payment
  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

      // Verify signature
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        throw new BadRequestError('Invalid payment signature');
      }

      // Find transaction
      const transaction = await prisma.transaction.findFirst({
        where: { razorpayOrderId },
      });

      if (!transaction) {
        throw new BadRequestError('Transaction not found');
      }

      if (transaction.status === 'completed') {
        throw new BadRequestError('Transaction already completed');
      }

      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          razorpayPaymentId,
        },
      });

      // Process based on product type
      await this.processPayment(transaction);

      logger.info(`Payment verified: ${razorpayPaymentId}`);

      return {
        message: 'Payment verified successfully',
        transactionId: transaction.id,
      };
    } catch (error) {
      logger.error('Verify payment error:', error);
      throw error;
    }
  }

  // Process payment (add coins or activate premium)
  private async processPayment(transaction: any) {
    try {
      const { userId, coins, description } = transaction;

      // Check if this is a coin purchase
      if (coins && coins > 0) {
        // Add coins to user wallet
        await prisma.user.update({
          where: { id: userId },
          data: {
            coins: { increment: coins },
          },
        });

        logger.info(`Added ${coins} coins to user ${userId}`);
      } else if (description && description.includes('Premium')) {
        // Activate premium subscription
        const isPremiumMonthly = description.includes('premium_monthly');
        const duration = isPremiumMonthly ? 30 : 365;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        await prisma.subscription.create({
          data: {
            userId,
            plan: isPremiumMonthly ? 'premium' : 'premium',
            status: 'active',
            amount: transaction.amount,
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: {
            isPremium: true,
            premiumUntil: endDate,
          },
        });

        logger.info(`Activated premium for user ${userId}`);
      }
    } catch (error) {
      logger.error('Process payment error:', error);
      throw new InternalServerError('Failed to process payment');
    }
  }

  // Get pricing for product type
  private getPricing(productType: string) {
    const pricing = {
      premium_monthly: { amount: 299, duration: 30 },
      premium_yearly: { amount: 2499, duration: 365 },
    };

    return pricing[productType as keyof typeof pricing];
  }

  // Get available coin packages
  getRechargePackages() {
    return RECHARGE_PACKAGES.map((pkg, index) => ({
      id: index,
      coins: pkg.coins,
      amount: pkg.amount,
      bonus: pkg.bonus,
      totalCoins: pkg.coins + pkg.bonus,
      perCoinCost: pkg.amount / (pkg.coins + pkg.bonus),
      savings: pkg.bonus > 0 ? `${Math.round((pkg.bonus / pkg.coins) * 100)}% bonus` : null,
    }));
  }

  // Get user transactions
  async getUserTransactions(userId: string, page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.transaction.count({
        where: { userId },
      });

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get transactions error:', error);
      throw error;
    }
  }

  // Get user subscription
  async getUserSubscription(userId: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'active',
          currentPeriodEnd: { gt: new Date() },
        },
        orderBy: { currentPeriodEnd: 'desc' },
      });

      return subscription;
    } catch (error) {
      logger.error('Get subscription error:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'active',
        },
        orderBy: { currentPeriodEnd: 'desc' },
      });

      if (!subscription) {
        throw new BadRequestError('No active subscription found');
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: false, premiumUntil: null },
      });

      logger.info(`Subscription cancelled for user ${userId}`);

      return { message: 'Subscription cancelled successfully' };
    } catch (error) {
      logger.error('Cancel subscription error:', error);
      throw error;
    }
  }

  // Handle Razorpay webhook
  async handleWebhook(payload: any, signature: string) {
    try {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new BadRequestError('Invalid webhook signature');
      }

      const { event, payload: eventPayload } = payload;

      // Handle different webhook events
      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(eventPayload.payment.entity);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(eventPayload.payment.entity);
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(eventPayload.subscription.entity);
          break;
        default:
          logger.info(`Unhandled webhook event: ${event}`);
      }

      return { message: 'Webhook processed successfully' };
    } catch (error) {
      logger.error('Webhook error:', error);
      throw error;
    }
  }

  private async handlePaymentCaptured(payment: any) {
    logger.info(`Payment captured: ${payment.id}`);
    // Additional processing if needed
  }

  private async handlePaymentFailed(payment: any) {
    try {
      await prisma.transaction.updateMany({
        where: { razorpayPaymentId: payment.id },
        data: { status: 'failed' },
      });

      logger.info(`Payment failed: ${payment.id}`);
    } catch (error) {
      logger.error('Handle payment failed error:', error);
    }
  }

  private async handleSubscriptionCancelled(subscription: any) {
    logger.info(`Subscription cancelled via webhook: ${subscription.id}`);
    // Additional processing if needed
  }
}

export default new PaymentService();
