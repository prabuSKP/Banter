// backend/src/controllers/admin.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import logger from '../config/logger';
import analyticsService from '../services/analytics.service';
import exportService from '../services/export.service';

export class AdminController {
  // GET /api/v1/admin/dashboard - Get admin dashboard statistics
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [
        totalUsers,
        activeUsers,
        totalCalls,
        totalTransactions,
        totalReports,
        pendingReports,
        totalRooms,
        activeRooms,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.callLog.count(),
        prisma.transaction.count({ where: { status: 'completed' } }),
        prisma.report.count(),
        prisma.report.count({ where: { status: 'pending' } }),
        prisma.chatRoom.count(),
        prisma.chatRoom.count({ where: { isActive: true } }),
      ]);

      // Get recent revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRevenue = await prisma.transaction.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      });

      // Get top users by coins
      const topUsers = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          username: true,
          coins: true,
          isPremium: true,
        },
        orderBy: { coins: 'desc' },
        take: 10,
      });

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalUsers,
            activeUsers,
            totalCalls,
            totalTransactions,
            totalReports,
            pendingReports,
            totalRooms,
            activeRooms,
          },
          revenue: {
            last30Days: (recentRevenue._sum.amount || 0) / 100, // Convert paisa to rupees
          },
          topUsers,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/admin/users - Get all users with filters
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 50, search, role, isPremium, isActive } = req.query as any;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where: any = {};

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search } },
        ];
      }

      if (role) where.role = role;
      if (isPremium !== undefined) where.isPremium = isPremium === 'true';
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            phoneNumber: true,
            fullName: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
            coins: true,
            isPremium: true,
            isActive: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.user.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/admin/users/:userId/role - Update user role
  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['user', 'admin', 'moderator'].includes(role)) {
        throw new BadRequestError('Invalid role');
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          fullName: true,
          username: true,
          role: true,
        },
      });

      logger.info(`User ${userId} role updated to ${role} by admin ${req.user!.id}`);

      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/admin/users/:userId/suspend - Suspend/activate user
  async toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { isActive, reason } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
        select: {
          id: true,
          fullName: true,
          username: true,
          isActive: true,
        },
      });

      const action = isActive ? 'activated' : 'suspended';
      logger.info(`User ${userId} ${action} by admin ${req.user!.id}. Reason: ${reason || 'N/A'}`);

      res.status(200).json({
        success: true,
        message: `User ${action} successfully`,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/admin/users/:userId/coins - Add/deduct coins (admin action)
  async adjustUserCoins(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { amount, action, reason } = req.body; // action: 'add' or 'deduct'

      if (!['add', 'deduct'].includes(action)) {
        throw new BadRequestError('Invalid action. Use "add" or "deduct"');
      }

      if (amount <= 0) {
        throw new BadRequestError('Amount must be positive');
      }

      const user = await prisma.$transaction(async (tx) => {
        // Get current balance
        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { coins: true, fullName: true },
        });

        if (!currentUser) {
          throw new NotFoundError('User not found');
        }

        if (action === 'deduct' && currentUser.coins < amount) {
          throw new BadRequestError('Insufficient coins balance');
        }

        // Update coins
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            coins: action === 'add' ? { increment: amount } : { decrement: amount },
          },
          select: { id: true, fullName: true, coins: true },
        });

        // Create transaction record
        await tx.transaction.create({
          data: {
            userId,
            type: 'admin',
            amount: 0,
            coins: action === 'add' ? amount : -amount,
            status: 'completed',
            description: `Admin ${action}: ${reason || 'No reason provided'}`,
            metadata: {
              adminId: req.user!.id,
              action,
              reason: reason || 'No reason provided',
            },
          },
        });

        return updatedUser;
      });

      logger.info(
        `Admin ${req.user!.id} ${action}ed ${amount} coins for user ${userId}. Reason: ${reason || 'N/A'}`
      );

      res.status(200).json({
        success: true,
        message: `Coins ${action}ed successfully`,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/admin/analytics - Get system analytics
  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { period = '7', type = 'all' } = req.query as any;

      if (type === 'all') {
        const analytics = await analyticsService.getDashboardAnalytics(parseInt(period));
        return res.status(200).json({
          success: true,
          data: analytics,
        });
      }

      // Get specific analytics
      let data;
      switch (type) {
        case 'users':
          data = await analyticsService.getUserGrowthAnalytics(parseInt(period));
          break;
        case 'revenue':
          data = await analyticsService.getRevenueAnalytics(parseInt(period));
          break;
        case 'calls':
          data = await analyticsService.getCallAnalytics(parseInt(period));
          break;
        case 'engagement':
          data = await analyticsService.getEngagementAnalytics(parseInt(period));
          break;
        case 'retention':
          data = await analyticsService.getRetentionAnalytics();
          break;
        default:
          throw new BadRequestError('Invalid analytics type');
      }

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/admin/export/:type - Export data to CSV
  async exportData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const filters = req.query;

      let csv: string;
      let filename: string;

      switch (type) {
        case 'users':
          csv = await exportService.exportUsers(filters);
          filename = `users_${Date.now()}.csv`;
          break;
        case 'transactions':
          csv = await exportService.exportTransactions(filters);
          filename = `transactions_${Date.now()}.csv`;
          break;
        case 'calls':
          csv = await exportService.exportCallLogs(filters);
          filename = `calls_${Date.now()}.csv`;
          break;
        case 'reports':
          csv = await exportService.exportReports(filters);
          filename = `reports_${Date.now()}.csv`;
          break;
        default:
          throw new BadRequestError('Invalid export type');
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/admin/bulk/suspend - Bulk suspend users
  async bulkSuspendUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userIds, reason } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new BadRequestError('User IDs array is required');
      }

      const result = await prisma.user.updateMany({
        where: {
          id: { in: userIds },
          role: 'user', // Only suspend regular users
        },
        data: { isActive: false },
      });

      logger.warn(
        `Bulk suspended ${result.count} users by admin ${req.user!.id}. Reason: ${reason || 'N/A'}`
      );

      res.status(200).json({
        success: true,
        message: `${result.count} users suspended`,
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/admin/bulk/activate - Bulk activate users
  async bulkActivateUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new BadRequestError('User IDs array is required');
      }

      const result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { isActive: true },
      });

      logger.info(`Bulk activated ${result.count} users by admin ${req.user!.id}`);

      res.status(200).json({
        success: true,
        message: `${result.count} users activated`,
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/admin/users/:userId - Permanently delete user (careful!)
  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { confirmDelete } = req.body;

      if (!confirmDelete) {
        throw new BadRequestError('Confirmation required to delete user');
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, role: true },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Prevent deleting other admins
      if (user.role === 'admin') {
        throw new BadRequestError('Cannot delete admin users');
      }

      // Delete user (cascading will handle related records)
      await prisma.user.delete({
        where: { id: userId },
      });

      logger.warn(`User ${userId} (${user.fullName}) permanently deleted by admin ${req.user!.id}`);

      res.status(200).json({
        success: true,
        message: 'User deleted permanently',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/admin/system - Get system health and info
  async getSystemInfo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dbStatus = await prisma.$queryRaw`SELECT 1` ? 'connected' : 'disconnected';

      const systemInfo = {
        database: {
          status: dbStatus,
          type: 'PostgreSQL',
        },
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      };

      res.status(200).json({
        success: true,
        data: systemInfo,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
