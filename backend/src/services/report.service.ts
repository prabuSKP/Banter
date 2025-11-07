// backend/src/services/report.service.ts

import prisma from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import logger from '../config/logger';

export type ReportType = 'user' | 'message' | 'room';
export type ReportReason = 'harassment' | 'spam' | 'inappropriate' | 'fake' | 'other';

export class ReportService {
  // Submit a report
  async submitReport(data: {
    reporterId: string;
    reportedUserId: string;
    reportType: ReportType;
    reason: ReportReason;
    description?: string;
  }) {
    try {
      const { reporterId, reportedUserId, reportType, reason, description } = data;

      // Validate reporter and reported user exist
      const [reporter, reportedUser] = await Promise.all([
        prisma.user.findUnique({ where: { id: reporterId } }),
        prisma.user.findUnique({ where: { id: reportedUserId } }),
      ]);

      if (!reporter) {
        throw new BadRequestError('Reporter not found');
      }

      if (!reportedUser) {
        throw new NotFoundError('Reported user not found');
      }

      if (reporterId === reportedUserId) {
        throw new BadRequestError('Cannot report yourself');
      }

      // Check if already reported recently (within 24 hours)
      const recentReport = await prisma.report.findFirst({
        where: {
          reporterId,
          reportedUserId,
          reportType,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (recentReport) {
        throw new BadRequestError('You have already reported this user recently');
      }

      // Create report
      const report = await prisma.report.create({
        data: {
          reporterId,
          reportedUserId,
          reportType,
          reason,
          description,
          status: 'pending',
        },
        include: {
          reporter: {
            select: { id: true, fullName: true, username: true },
          },
          reportedUser: {
            select: { id: true, fullName: true, username: true },
          },
        },
      });

      logger.info(`Report submitted: ${report.id} by ${reporterId} against ${reportedUserId}`);

      return {
        reportId: report.id,
        message: 'Report submitted successfully. Our team will review it.',
      };
    } catch (error) {
      logger.error('Submit report error:', error);
      throw error;
    }
  }

  // Get user's submitted reports
  async getUserReports(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const reports = await prisma.report.findMany({
        where: { reporterId: userId },
        include: {
          reportedUser: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.report.count({
        where: { reporterId: userId },
      });

      return {
        reports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get user reports error:', error);
      throw error;
    }
  }

  // Get reports against a user (for admin/moderation)
  async getReportsAgainstUser(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const reports = await prisma.report.findMany({
        where: { reportedUserId: userId },
        include: {
          reporter: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.report.count({
        where: { reportedUserId: userId },
      });

      // Get report statistics
      const stats = await prisma.report.groupBy({
        by: ['reason', 'status'],
        where: { reportedUserId: userId },
        _count: true,
      });

      return {
        reports,
        statistics: stats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get reports against user error:', error);
      throw error;
    }
  }

  // Get all pending reports (for admin/moderation)
  async getPendingReports(page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const reports = await prisma.report.findMany({
        where: { status: 'pending' },
        include: {
          reporter: {
            select: {
              id: true,
              fullName: true,
              username: true,
              phoneNumber: true,
            },
          },
          reportedUser: {
            select: {
              id: true,
              fullName: true,
              username: true,
              phoneNumber: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.report.count({
        where: { status: 'pending' },
      });

      return {
        reports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get pending reports error:', error);
      throw error;
    }
  }

  // Update report status (for admin/moderation)
  async updateReportStatus(
    reportId: string,
    status: 'reviewed' | 'action_taken' | 'dismissed',
    reviewedBy?: string,
    notes?: string
  ) {
    try {
      const report = await prisma.report.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        throw new NotFoundError('Report not found');
      }

      const updatedReport = await prisma.report.update({
        where: { id: reportId },
        data: {
          status,
          reviewedBy,
          reviewedAt: new Date(),
        },
      });

      logger.info(`Report ${reportId} status updated to ${status}`);

      return updatedReport;
    } catch (error) {
      logger.error('Update report status error:', error);
      throw error;
    }
  }

  // Delete a report
  async deleteReport(reportId: string, userId: string) {
    try {
      const report = await prisma.report.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        throw new NotFoundError('Report not found');
      }

      // Only the reporter can delete their own report
      if (report.reporterId !== userId) {
        throw new BadRequestError('You can only delete your own reports');
      }

      await prisma.report.delete({
        where: { id: reportId },
      });

      logger.info(`Report ${reportId} deleted by user ${userId}`);

      return { message: 'Report deleted successfully' };
    } catch (error) {
      logger.error('Delete report error:', error);
      throw error;
    }
  }

  // Get report statistics (for admin dashboard)
  async getReportStatistics() {
    try {
      const totalReports = await prisma.report.count();
      const pendingReports = await prisma.report.count({
        where: { status: 'pending' },
      });

      const byStatus = await prisma.report.groupBy({
        by: ['status'],
        _count: true,
      });

      const byReason = await prisma.report.groupBy({
        by: ['reason'],
        _count: true,
      });

      const byType = await prisma.report.groupBy({
        by: ['reportType'],
        _count: true,
      });

      // Get most reported users
      const mostReportedUsers = await prisma.report.groupBy({
        by: ['reportedUserId'],
        _count: true,
        orderBy: {
          _count: {
            reportedUserId: 'desc',
          },
        },
        take: 10,
      });

      return {
        totalReports,
        pendingReports,
        byStatus,
        byReason,
        byType,
        mostReportedUsers,
      };
    } catch (error) {
      logger.error('Get report statistics error:', error);
      throw error;
    }
  }
}

export default new ReportService();
