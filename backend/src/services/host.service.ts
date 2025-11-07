// backend/src/services/host.service.ts

import { prisma } from '../utils/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

import { EARNING_RATES, WITHDRAWAL } from '../constants';

// Bonus thresholds
const BONUS_THRESHOLDS = {
  HIGH_RATING: 4.5, // Min rating for bonus
  HIGH_RATING_BONUS: 500, // ₹500 bonus
  LONG_HOURS_DAILY: 180, // 3 hours in minutes
  LONG_HOURS_WEEKLY: 1260, // 21 hours in minutes
  MILESTONE_BONUS_50_CALLS: 1000, // ₹1000 for 50 calls
  MILESTONE_BONUS_100_CALLS: 2500, // ₹2500 for 100 calls
};



class HostService {
  // Apply to become a host
  async applyAsHost(userId: string, documents: string[]) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isHost) {
      throw new BadRequestError('You are already a verified host');
    }

    if (user.hostVerificationStatus === 'pending') {
      throw new BadRequestError('Your application is already pending review');
    }

    // Update user with host application
    await prisma.user.update({
      where: { id: userId },
      data: {
        hostVerificationStatus: 'pending',
        hostAppliedAt: new Date(),
        hostDocuments: documents,
      },
    });

    return {
      message: 'Host application submitted successfully. We will review it within 24-48 hours.',
    };
  }

  // Admin: Approve host application
  async approveHost(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.hostVerificationStatus !== 'pending') {
      throw new BadRequestError('No pending host application found');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isHost: true,
        hostVerificationStatus: 'approved',
        hostVerifiedAt: new Date(),
      },
    });

    // TODO: Send notification to user

    return { message: 'Host application approved successfully' };
  }

  // Admin: Reject host application
  async rejectHost(userId: string, reason: string, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.hostVerificationStatus !== 'pending') {
      throw new BadRequestError('No pending host application found');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isHost: false,
        hostVerificationStatus: 'rejected',
        hostRejectedAt: new Date(),
        hostRejectionReason: reason,
      },
    });

    // TODO: Send notification to user

    return { message: 'Host application rejected' };
  }

  // Calculate and record earnings from a call
  async recordEarning(callId: string, hostId: string, callType: 'audio' | 'video', durationSeconds: number, coinsCharged: number) {
    // Check if host is verified
    const host = await prisma.user.findUnique({
      where: { id: hostId },
      select: { isHost: true },
    });

    if (!host || !host.isHost) {
      return null; // Not a verified host, no earnings
    }

    // Calculate earnings
    const percentage = callType === 'video'
      ? EARNING_RATES.VIDEO_CALL_PERCENTAGE
      : EARNING_RATES.AUDIO_CALL_PERCENTAGE;

    const totalRevenue = coinsCharged * EARNING_RATES.COIN_TO_INR_RATE;
    const hostEarning = totalRevenue * percentage;

    // Record earning
    const earning = await prisma.earning.create({
      data: {
        hostId,
        callId,
        callType,
        callDuration: durationSeconds,
        totalRevenue,
        hostShare: percentage * 100, // Store as percentage
        hostEarning,
        status: 'completed',
        processedAt: new Date(),
      },
    });

    // Update host's total earnings and balance
    await prisma.user.update({
      where: { id: hostId },
      data: {
        totalEarnings: { increment: hostEarning },
        availableBalance: { increment: hostEarning },
        totalCallsAsHost: { increment: 1 },
        totalMinutesAsHost: { increment: Math.floor(durationSeconds / 60) },
      },
    });

    // Check for bonuses
    await this.checkAndAwardBonuses(hostId);

    return earning;
  }

  // Check and award performance bonuses
  async checkAndAwardBonuses(hostId: string) {
    const host = await prisma.user.findUnique({
      where: { id: hostId },
      select: {
        hostRating: true,
        totalCallsAsHost: true,
        totalMinutesAsHost: true,
      },
    });

    if (!host) return;

    // High rating bonus
    if (host.hostRating && host.hostRating >= BONUS_THRESHOLDS.HIGH_RATING) {
      const existingBonus = await prisma.hostBonus.findFirst({
        where: {
          hostId,
          bonusType: 'high_rating',
          creditedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      });

      if (!existingBonus) {
        await this.awardBonus(hostId, 'high_rating', BONUS_THRESHOLDS.HIGH_RATING_BONUS,
          `High rating bonus for maintaining ${host.hostRating}+ stars`);
      }
    }

    // Milestone bonuses
    if (host.totalCallsAsHost === 50) {
      await this.awardBonus(hostId, 'milestone', BONUS_THRESHOLDS.MILESTONE_BONUS_50_CALLS,
        'Milestone bonus for completing 50 calls');
    } else if (host.totalCallsAsHost === 100) {
      await this.awardBonus(hostId, 'milestone', BONUS_THRESHOLDS.MILESTONE_BONUS_100_CALLS,
        'Milestone bonus for completing 100 calls');
    }
  }

  // Award bonus to host
  private async awardBonus(hostId: string, bonusType: string, amount: number, description: string, metadata?: any) {
    await prisma.hostBonus.create({
      data: {
        hostId,
        bonusType,
        amount,
        description,
        metadata,
      },
    });

    await prisma.user.update({
      where: { id: hostId },
      data: {
        totalEarnings: { increment: amount },
        availableBalance: { increment: amount },
      },
    });
  }

  // Request withdrawal
  async requestWithdrawal(userId: string, amount: number, method: string, paymentDetails: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isHost: true, availableBalance: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.isHost) {
      throw new ForbiddenError('Only verified hosts can request withdrawals');
    }

    if (amount < WITHDRAWAL.MIN_AMOUNT) {
      throw new BadRequestError(`Minimum withdrawal amount is ₹${WITHDRAWAL.MIN_AMOUNT}`);
    }

    if (amount > user.availableBalance) {
      throw new BadRequestError('Insufficient balance');
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        method,
        status: 'pending',
        upiId: paymentDetails.upiId,
        accountNumber: paymentDetails.accountNumber,
        ifscCode: paymentDetails.ifscCode,
        accountHolderName: paymentDetails.accountHolderName,
      },
    });

    // Deduct from available balance (will be refunded if request is cancelled/failed)
    await prisma.user.update({
      where: { id: userId },
      data: {
        availableBalance: { decrement: amount },
      },
    });

    return withdrawal;
  }

  // Get host dashboard stats
  async getHostDashboard(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isHost: true,
        hostRating: true,
        totalEarnings: true,
        availableBalance: true,
        totalWithdrawn: true,
        totalCallsAsHost: true,
        totalMinutesAsHost: true,
      },
    });

    if (!user || !user.isHost) {
      throw new ForbiddenError('Only verified hosts can access this dashboard');
    }

    // Get earnings breakdown
    const earnings = await prisma.earning.groupBy({
      by: ['callType'],
      where: { hostId: userId, status: 'completed' },
      _sum: {
        hostEarning: true,
        callDuration: true,
      },
      _count: true,
    });

    // Get recent earnings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEarnings = await prisma.earning.aggregate({
      where: {
        hostId: userId,
        status: 'completed',
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { hostEarning: true },
    });

    // Get pending withdrawals
    const pendingWithdrawals = await prisma.withdrawal.findMany({
      where: { userId, status: { in: ['pending', 'processing'] } },
      select: { id: true, amount: true, method: true, status: true, requestedAt: true },
    });

    return {
      stats: {
        rating: user.hostRating || 0,
        totalEarnings: user.totalEarnings,
        availableBalance: user.availableBalance,
        totalWithdrawn: user.totalWithdrawn,
        totalCalls: user.totalCallsAsHost,
        totalMinutes: user.totalMinutesAsHost,
        last30DaysEarnings: recentEarnings._sum.hostEarning || 0,
      },
      earningsBreakdown: earnings.map(e => ({
        callType: e.callType,
        totalCalls: e._count,
        totalEarnings: e._sum.hostEarning || 0,
        totalMinutes: Math.floor((e._sum.callDuration || 0) / 60),
      })),
      pendingWithdrawals,
    };
  }

  // Get earnings history
  async getEarningsHistory(userId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [earnings, total] = await Promise.all([
      prisma.earning.findMany({
        where: { hostId: userId, status: 'completed' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.earning.count({
        where: { hostId: userId, status: 'completed' },
      }),
    ]);

    return {
      earnings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Submit rating for host
  async rateHost(hostId: string, callId: string, callerId: string, rating: number, feedback?: string) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestError('Rating must be between 1 and 5');
    }

    // Check if already rated
    const existingRating = await prisma.hostRating.findUnique({
      where: { callId },
    });

    if (existingRating) {
      throw new BadRequestError('You have already rated this call');
    }

    // Create rating
    await prisma.hostRating.create({
      data: {
        hostId,
        callerId,
        callId,
        rating,
        feedback,
      },
    });

    // Recalculate average rating
    const ratings = await prisma.hostRating.aggregate({
      where: { hostId },
      _avg: { rating: true },
    });

    await prisma.user.update({
      where: { id: hostId },
      data: {
        hostRating: ratings._avg.rating || 0,
      },
    });

    return { message: 'Rating submitted successfully' };
  }
}

export default new HostService();
