// backend/src/services/analytics.service.ts

import prisma from '../config/database';
import logger from '../config/logger';

export class AnalyticsService {
  // Get user growth analytics
  async getUserGrowthAnalytics(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Daily user registrations
      const dailyRegistrations = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM "User"
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;

      // Active users (logged in last 7 days)
      const activeUsers = await prisma.user.count({
        where: {
          lastSeen: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      // Premium users growth
      const premiumUsers = await prisma.user.count({
        where: { isPremium: true },
      });

      return {
        dailyRegistrations: dailyRegistrations.map(d => ({
          date: d.date,
          count: Number(d.count),
        })),
        activeUsers,
        premiumUsers,
        totalUsers: await prisma.user.count(),
      };
    } catch (error) {
      logger.error('Get user growth analytics error:', error);
      throw error;
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Daily revenue
      const dailyRevenue = await prisma.$queryRaw<Array<{ date: Date; revenue: bigint; transactions: bigint }>>`
        SELECT
          DATE(created_at) as date,
          SUM(amount) as revenue,
          COUNT(*) as transactions
        FROM "Transaction"
        WHERE status = 'completed' AND created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;

      // Revenue by product type
      const revenueByType = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
          status: 'completed',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      });

      // Total coins purchased vs spent
      const coinsPurchased = await prisma.transaction.aggregate({
        where: {
          type: 'purchase',
          status: 'completed',
          createdAt: { gte: startDate },
        },
        _sum: { coins: true },
      });

      const coinsSpent = await prisma.transaction.aggregate({
        where: {
          type: 'debit',
          createdAt: { gte: startDate },
        },
        _sum: { coins: true },
      });

      return {
        dailyRevenue: dailyRevenue.map(d => ({
          date: d.date,
          revenue: Number(d.revenue) / 100, // Convert paisa to rupees
          transactions: Number(d.transactions),
        })),
        revenueByType: revenueByType.map(r => ({
          type: r.type,
          revenue: (r._sum.amount || 0) / 100,
          count: r._count,
        })),
        totalRevenue: revenueByType.reduce((sum, r) => sum + (r._sum.amount || 0), 0) / 100,
        coinsPurchased: coinsPurchased._sum.coins || 0,
        coinsSpent: Math.abs(coinsSpent._sum.coins || 0),
      };
    } catch (error) {
      logger.error('Get revenue analytics error:', error);
      throw error;
    }
  }

  // Get call analytics
  async getCallAnalytics(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Call statistics by type and status
      const callStats = await prisma.callLog.groupBy({
        by: ['callType', 'status'],
        where: { startedAt: { gte: startDate } },
        _count: true,
        _sum: { duration: true, coinsCharged: true },
      });

      // Daily call volume
      const dailyCalls = await prisma.$queryRaw<Array<{ date: Date; audio: bigint; video: bigint }>>`
        SELECT
          DATE(started_at) as date,
          SUM(CASE WHEN call_type = 'audio' THEN 1 ELSE 0 END) as audio,
          SUM(CASE WHEN call_type = 'video' THEN 1 ELSE 0 END) as video
        FROM "CallLog"
        WHERE started_at >= ${startDate}
        GROUP BY DATE(started_at)
        ORDER BY date ASC
      `;

      // Average call duration
      const avgDuration = await prisma.callLog.aggregate({
        where: {
          status: 'completed',
          startedAt: { gte: startDate },
        },
        _avg: { duration: true },
      });

      // Peak calling hours
      const peakHours = await prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
        SELECT
          EXTRACT(HOUR FROM started_at) as hour,
          COUNT(*) as count
        FROM "CallLog"
        WHERE started_at >= ${startDate}
        GROUP BY hour
        ORDER BY count DESC
        LIMIT 5
      `;

      return {
        callStats: callStats.map(s => ({
          callType: s.callType,
          status: s.status,
          count: s._count,
          totalDuration: s._sum.duration || 0,
          totalCoinsCharged: s._sum.coinsCharged || 0,
        })),
        dailyCalls: dailyCalls.map(d => ({
          date: d.date,
          audio: Number(d.audio),
          video: Number(d.video),
        })),
        averageDuration: Math.round(avgDuration._avg.duration || 0),
        peakHours: peakHours.map(h => ({
          hour: Number(h.hour),
          count: Number(h.count),
        })),
      };
    } catch (error) {
      logger.error('Get call analytics error:', error);
      throw error;
    }
  }

  // Get engagement analytics
  async getEngagementAnalytics(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Message statistics
      const messageStats = await prisma.message.groupBy({
        by: ['messageType'],
        where: { createdAt: { gte: startDate } },
        _count: true,
      });

      // Daily messages
      const dailyMessages = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM "Message"
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;

      // Active rooms
      const activeRooms = await prisma.chatRoom.count({
        where: { isActive: true },
      });

      // Friend requests
      const friendRequests = await prisma.friendRequest.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate } },
        _count: true,
      });

      // Most active users (by messages sent)
      const mostActiveUsers = await prisma.message.groupBy({
        by: ['senderId'],
        where: { createdAt: { gte: startDate } },
        _count: true,
        orderBy: { _count: { senderId: 'desc' } },
        take: 10,
      });

      return {
        messageStats: messageStats.map(s => ({
          type: s.messageType,
          count: s._count,
        })),
        dailyMessages: dailyMessages.map(d => ({
          date: d.date,
          count: Number(d.count),
        })),
        totalMessages: messageStats.reduce((sum, s) => sum + s._count, 0),
        activeRooms,
        friendRequests: friendRequests.map(r => ({
          status: r.status,
          count: r._count,
        })),
        mostActiveUserIds: mostActiveUsers.map(u => ({
          userId: u.senderId,
          messageCount: u._count,
        })),
      };
    } catch (error) {
      logger.error('Get engagement analytics error:', error);
      throw error;
    }
  }

  // Get retention analytics
  async getRetentionAnalytics() {
    try {
      // Users registered in last 30 days still active
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const newUsers = await prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      });

      const activeNewUsers = await prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          lastSeen: { gte: sevenDaysAgo },
        },
      });

      const retentionRate = newUsers > 0 ? (activeNewUsers / newUsers) * 100 : 0;

      // Daily active users (DAU)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const dau = await prisma.user.count({
        where: { lastSeen: { gte: oneDayAgo } },
      });

      // Weekly active users (WAU)
      const wau = await prisma.user.count({
        where: { lastSeen: { gte: sevenDaysAgo } },
      });

      // Monthly active users (MAU)
      const mau = await prisma.user.count({
        where: { lastSeen: { gte: thirtyDaysAgo } },
      });

      return {
        retentionRate: Math.round(retentionRate * 100) / 100,
        newUsers,
        activeNewUsers,
        dau,
        wau,
        mau,
        dauWauRatio: wau > 0 ? Math.round((dau / wau) * 100) / 100 : 0,
        wauMauRatio: mau > 0 ? Math.round((wau / mau) * 100) / 100 : 0,
      };
    } catch (error) {
      logger.error('Get retention analytics error:', error);
      throw error;
    }
  }

  // Get comprehensive dashboard data
  async getDashboardAnalytics(days: number = 7) {
    try {
      const [userGrowth, revenue, calls, engagement, retention] = await Promise.all([
        this.getUserGrowthAnalytics(days),
        this.getRevenueAnalytics(days),
        this.getCallAnalytics(days),
        this.getEngagementAnalytics(days),
        this.getRetentionAnalytics(),
      ]);

      return {
        period: `${days} days`,
        userGrowth,
        revenue,
        calls,
        engagement,
        retention,
      };
    } catch (error) {
      logger.error('Get dashboard analytics error:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();
