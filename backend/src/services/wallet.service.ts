// backend/src/services/wallet.service.ts

import prisma from '../config/database';
import { BadRequestError, InternalServerError } from '../utils/errors';
import logger from '../config/logger';

// Call rates per minute
export const CALL_RATES = {
  AUDIO_PER_MINUTE: 10, // 10 coins per minute
  VIDEO_PER_MINUTE: 60, // 60 coins per minute
} as const;

// Recharge packages - Similar to Dostt/FRND pricing (₹700 ≈ 2500 coins)
export const RECHARGE_PACKAGES = [
  { coins: 200, amount: 49, bonus: 0 },        // ₹49 = 200 coins (Starter pack)
  { coins: 500, amount: 99, bonus: 100 },      // ₹99 = 600 coins (20% bonus)
  { coins: 1000, amount: 199, bonus: 300 },    // ₹199 = 1300 coins (30% bonus)
  { coins: 1500, amount: 299, bonus: 500 },    // ₹299 = 2000 coins (33% bonus)
  { coins: 2000, amount: 399, bonus: 800 },    // ₹399 = 2800 coins (40% bonus)
  { coins: 3000, amount: 599, bonus: 1500 },   // ₹599 = 4500 coins (50% bonus)
  { coins: 4000, amount: 799, bonus: 2400 },   // ₹799 = 6400 coins (60% bonus)
  { coins: 6000, amount: 999, bonus: 4000 },   // ₹999 = 10000 coins (66% bonus)
];

export class WalletService {
  // Get user wallet balance
  async getBalance(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { coins: true },
      });

      if (!user) {
        throw new BadRequestError('User not found');
      }

      return {
        coins: user.coins,
        formatted: `${user.coins} coins`,
      };
    } catch (error) {
      logger.error('Get balance error:', error);
      throw error;
    }
  }

  // Add coins to wallet (from purchase or bonus)
  async addCoins(
    userId: string,
    amount: number,
    type: 'purchase' | 'bonus' | 'refund' | 'admin',
    description: string,
    transactionId?: string
  ) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Update user coins
        const user = await tx.user.update({
          where: { id: userId },
          data: { coins: { increment: amount } },
          select: { coins: true },
        });

        // Create wallet transaction record
        const walletTx = await tx.transaction.create({
          data: {
            userId,
            type,
            amount: 0, // No money amount for coin transactions
            coins: amount,
            status: 'completed',
            description,
          },
        });

        logger.info(`Added ${amount} coins to user ${userId} (${type})`);

        return {
          newBalance: user.coins,
          transaction: walletTx,
        };
      });

      return result;
    } catch (error) {
      logger.error('Add coins error:', error);
      throw new InternalServerError('Failed to add coins');
    }
  }

  // Deduct coins from wallet (for calls)
  async deductCoins(
    userId: string,
    amount: number,
    type: 'audio_call' | 'video_call' | 'gift' | 'other',
    description: string,
    metadata?: any
  ) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Check current balance
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { coins: true },
        });

        if (!user) {
          throw new BadRequestError('User not found');
        }

        if (user.coins < amount) {
          throw new BadRequestError('Insufficient coins balance');
        }

        // Deduct coins
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { coins: { decrement: amount } },
          select: { coins: true },
        });

        // Create transaction record
        const walletTx = await tx.transaction.create({
          data: {
            userId,
            type: 'debit',
            amount: 0,
            coins: -amount, // Negative for deduction
            status: 'completed',
            description,
            metadata,
          },
        });

        logger.info(`Deducted ${amount} coins from user ${userId} (${type})`);

        return {
          newBalance: updatedUser.coins,
          transaction: walletTx,
        };
      });

      return result;
    } catch (error) {
      logger.error('Deduct coins error:', error);
      throw error;
    }
  }

  // Calculate call cost
  calculateCallCost(callType: 'audio' | 'video', durationInSeconds: number) {
    const durationInMinutes = Math.ceil(durationInSeconds / 60); // Round up to next minute
    const ratePerMinute = callType === 'audio'
      ? CALL_RATES.AUDIO_PER_MINUTE
      : CALL_RATES.VIDEO_PER_MINUTE;

    return {
      duration: durationInSeconds,
      durationMinutes: durationInMinutes,
      ratePerMinute,
      totalCoins: durationInMinutes * ratePerMinute,
    };
  }

  // Charge for call
  async chargeForCall(
    userId: string,
    callType: 'audio' | 'video',
    durationInSeconds: number,
    callId: string
  ) {
    try {
      const cost = this.calculateCallCost(callType, durationInSeconds);

      // Check if user has enough coins
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { coins: true, isPremium: true },
      });

      if (!user) {
        throw new BadRequestError('User not found');
      }

      // Premium users get 50% discount
      const finalCost = user.isPremium
        ? Math.ceil(cost.totalCoins * 0.5)
        : cost.totalCoins;

      if (user.coins < finalCost) {
        throw new BadRequestError('Insufficient coins for this call');
      }

      // Deduct coins
      const result = await this.deductCoins(
        userId,
        finalCost,
        callType === 'audio' ? 'audio_call' : 'video_call',
        `${callType === 'audio' ? 'Audio' : 'Video'} call - ${cost.durationMinutes} min`,
        {
          callId,
          callType,
          duration: durationInSeconds,
          rate: cost.ratePerMinute,
          isPremium: user.isPremium,
          discount: user.isPremium ? '50%' : '0%',
        }
      );

      // Update call log with cost
      await prisma.callLog.update({
        where: { id: callId },
        data: {
          coinsCharged: finalCost,
        },
      });

      logger.info(`Charged ${finalCost} coins for ${callType} call ${callId}`);

      return {
        coinsCharged: finalCost,
        originalCost: cost.totalCoins,
        discount: user.isPremium ? cost.totalCoins - finalCost : 0,
        newBalance: result.newBalance,
      };
    } catch (error) {
      logger.error('Charge for call error:', error);
      throw error;
    }
  }

  // Get wallet transaction history
  async getTransactionHistory(userId: string, page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          OR: [
            { coins: { not: 0 } }, // Coin transactions
            { type: { in: ['purchase', 'bonus', 'refund', 'debit'] } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.transaction.count({
        where: {
          userId,
          OR: [
            { coins: { not: 0 } },
            { type: { in: ['purchase', 'bonus', 'refund', 'debit'] } },
          ],
        },
      });

      // Format transactions
      const formattedTransactions = transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        coins: tx.coins || 0,
        amount: tx.amount,
        description: tx.description,
        status: tx.status,
        metadata: tx.metadata,
        createdAt: tx.createdAt,
        isCredit: (tx.coins || 0) > 0,
        isDebit: (tx.coins || 0) < 0,
      }));

      return {
        transactions: formattedTransactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get transaction history error:', error);
      throw error;
    }
  }

  // Get recharge packages
  getRechargePackages() {
    return RECHARGE_PACKAGES.map(pkg => ({
      coins: pkg.coins,
      amount: pkg.amount,
      bonus: pkg.bonus,
      totalCoins: pkg.coins + pkg.bonus,
      perCoinCost: pkg.amount / (pkg.coins + pkg.bonus),
      savings: pkg.bonus > 0 ? `${Math.round((pkg.bonus / pkg.coins) * 100)}% bonus` : null,
    }));
  }

  // Transfer coins between users (for gifts)
  async transferCoins(
    fromUserId: string,
    toUserId: string,
    amount: number,
    message?: string
  ) {
    try {
      if (fromUserId === toUserId) {
        throw new BadRequestError('Cannot transfer coins to yourself');
      }

      if (amount <= 0) {
        throw new BadRequestError('Invalid transfer amount');
      }

      const result = await prisma.$transaction(async (tx) => {
        // Check sender balance
        const sender = await tx.user.findUnique({
          where: { id: fromUserId },
          select: { coins: true, fullName: true, username: true },
        });

        if (!sender) {
          throw new BadRequestError('Sender not found');
        }

        if (sender.coins < amount) {
          throw new BadRequestError('Insufficient coins balance');
        }

        // Check receiver exists
        const receiver = await tx.user.findUnique({
          where: { id: toUserId },
          select: { fullName: true, username: true },
        });

        if (!receiver) {
          throw new BadRequestError('Receiver not found');
        }

        // Deduct from sender
        await tx.user.update({
          where: { id: fromUserId },
          data: { coins: { decrement: amount } },
        });

        // Add to receiver
        await tx.user.update({
          where: { id: toUserId },
          data: { coins: { increment: amount } },
        });

        // Create transactions
        const senderName = sender.username || sender.fullName || 'user';
        const receiverName = receiver.username || receiver.fullName || 'user';

        await tx.transaction.createMany({
          data: [
            {
              userId: fromUserId,
              type: 'debit',
              coins: -amount,
              amount: 0,
              status: 'completed',
              description: `Gift to ${receiverName}`,
              metadata: { toUserId, message },
            },
            {
              userId: toUserId,
              type: 'bonus',
              coins: amount,
              amount: 0,
              status: 'completed',
              description: `Gift from ${senderName}`,
              metadata: { fromUserId, message },
            },
          ],
        });

        logger.info(`Transferred ${amount} coins from ${fromUserId} to ${toUserId}`);

        return { success: true };
      });

      return result;
    } catch (error) {
      logger.error('Transfer coins error:', error);
      throw error;
    }
  }

  // Get coin statistics
  async getCoinStatistics(userId: string) {
    try {
      const stats = await prisma.transaction.aggregate({
        where: {
          userId,
          coins: { not: 0 },
        },
        _sum: {
          coins: true,
        },
      });

      const totalEarned = await prisma.transaction.aggregate({
        where: {
          userId,
          coins: { gt: 0 },
        },
        _sum: { coins: true },
      });

      const totalSpent = await prisma.transaction.aggregate({
        where: {
          userId,
          coins: { lt: 0 },
        },
        _sum: { coins: true },
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { coins: true },
      });

      return {
        currentBalance: user?.coins || 0,
        totalEarned: totalEarned._sum.coins || 0,
        totalSpent: Math.abs(totalSpent._sum.coins || 0),
        netBalance: stats._sum.coins || 0,
      };
    } catch (error) {
      logger.error('Get coin statistics error:', error);
      throw error;
    }
  }
}

export default new WalletService();
