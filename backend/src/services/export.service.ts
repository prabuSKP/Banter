// backend/src/services/export.service.ts

import prisma from '../config/database';
import logger from '../config/logger';

export class ExportService {
  // Convert data to CSV format
  private convertToCSV(data: any[], headers: string[]): string {
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value || '').replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  // Export users to CSV
  async exportUsers(filters?: {
    role?: string;
    isPremium?: boolean;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const where: any = {};

      if (filters?.role) where.role = filters.role;
      if (filters?.isPremium !== undefined) where.isPremium = filters.isPremium;
      if (filters?.isActive !== undefined) where.isActive = filters.isActive;
      if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          phoneNumber: true,
          fullName: true,
          username: true,
          email: true,
          role: true,
          coins: true,
          isPremium: true,
          isActive: true,
          createdAt: true,
        },
      });

      const headers = [
        'id',
        'phoneNumber',
        'fullName',
        'username',
        'email',
        'role',
        'coins',
        'isPremium',
        'isActive',
        'createdAt',
      ];

      const csv = this.convertToCSV(users, headers);

      logger.info(`Exported ${users.length} users to CSV`);
      return csv;
    } catch (error) {
      logger.error('Export users error:', error);
      throw error;
    }
  }

  // Export transactions to CSV
  async exportTransactions(filters?: {
    userId?: string;
    type?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const where: any = {};

      if (filters?.userId) where.userId = filters.userId;
      if (filters?.type) where.type = filters.type;
      if (filters?.status) where.status = filters.status;
      if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              phoneNumber: true,
              fullName: true,
            },
          },
        },
      });

      const formattedData = transactions.map(t => ({
        id: t.id,
        userId: t.userId,
        userPhone: t.user.phoneNumber,
        userName: t.user.fullName,
        type: t.type,
        amount: t.amount / 100, // Convert paisa to rupees
        coins: t.coins || 0,
        status: t.status,
        description: t.description || '',
        razorpayOrderId: t.razorpayOrderId || '',
        razorpayPaymentId: t.razorpayPaymentId || '',
        createdAt: t.createdAt,
      }));

      const headers = [
        'id',
        'userId',
        'userPhone',
        'userName',
        'type',
        'amount',
        'coins',
        'status',
        'description',
        'razorpayOrderId',
        'razorpayPaymentId',
        'createdAt',
      ];

      const csv = this.convertToCSV(formattedData, headers);

      logger.info(`Exported ${transactions.length} transactions to CSV`);
      return csv;
    } catch (error) {
      logger.error('Export transactions error:', error);
      throw error;
    }
  }

  // Export call logs to CSV
  async exportCallLogs(filters?: {
    callType?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const where: any = {};

      if (filters?.callType) where.callType = filters.callType;
      if (filters?.status) where.status = filters.status;
      if (filters?.startDate || filters?.endDate) {
        where.startedAt = {};
        if (filters.startDate) where.startedAt.gte = filters.startDate;
        if (filters.endDate) where.startedAt.lte = filters.endDate;
      }

      const calls = await prisma.callLog.findMany({
        where,
        include: {
          caller: {
            select: {
              phoneNumber: true,
              fullName: true,
            },
          },
          receiver: {
            select: {
              phoneNumber: true,
              fullName: true,
            },
          },
        },
      });

      const formattedData = calls.map(c => ({
        id: c.id,
        callerId: c.callerId,
        callerPhone: c.caller.phoneNumber,
        callerName: c.caller.fullName,
        receiverId: c.receiverId,
        receiverPhone: c.receiver.phoneNumber,
        receiverName: c.receiver.fullName,
        callType: c.callType,
        duration: c.duration || 0,
        status: c.status,
        coinsCharged: c.coinsCharged || 0,
        startedAt: c.startedAt,
        endedAt: c.endedAt || '',
      }));

      const headers = [
        'id',
        'callerId',
        'callerPhone',
        'callerName',
        'receiverId',
        'receiverPhone',
        'receiverName',
        'callType',
        'duration',
        'status',
        'coinsCharged',
        'startedAt',
        'endedAt',
      ];

      const csv = this.convertToCSV(formattedData, headers);

      logger.info(`Exported ${calls.length} call logs to CSV`);
      return csv;
    } catch (error) {
      logger.error('Export call logs error:', error);
      throw error;
    }
  }

  // Export reports to CSV
  async exportReports(filters?: {
    status?: string;
    reason?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const where: any = {};

      if (filters?.status) where.status = filters.status;
      if (filters?.reason) where.reason = filters.reason;
      if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      const reports = await prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              phoneNumber: true,
              fullName: true,
            },
          },
          reportedUser: {
            select: {
              phoneNumber: true,
              fullName: true,
            },
          },
        },
      });

      const formattedData = reports.map(r => ({
        id: r.id,
        reporterId: r.reporterId,
        reporterPhone: r.reporter.phoneNumber,
        reporterName: r.reporter.fullName,
        reportedUserId: r.reportedUserId,
        reportedUserPhone: r.reportedUser.phoneNumber,
        reportedUserName: r.reportedUser.fullName,
        reportType: r.reportType,
        reason: r.reason,
        description: r.description || '',
        status: r.status,
        reviewedBy: r.reviewedBy || '',
        reviewedAt: r.reviewedAt || '',
        createdAt: r.createdAt,
      }));

      const headers = [
        'id',
        'reporterId',
        'reporterPhone',
        'reporterName',
        'reportedUserId',
        'reportedUserPhone',
        'reportedUserName',
        'reportType',
        'reason',
        'description',
        'status',
        'reviewedBy',
        'reviewedAt',
        'createdAt',
      ];

      const csv = this.convertToCSV(formattedData, headers);

      logger.info(`Exported ${reports.length} reports to CSV`);
      return csv;
    } catch (error) {
      logger.error('Export reports error:', error);
      throw error;
    }
  }
}

export default new ExportService();
