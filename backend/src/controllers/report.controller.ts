// backend/src/controllers/report.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import reportService from '../services/report.service';

export class ReportController {
  // POST /api/v1/reports
  async submitReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reporterId = req.user!.id;
      const { reportedUserId, reportType, reason, description } = req.body;

      const result = await reportService.submitReport({
        reporterId,
        reportedUserId,
        reportType,
        reason,
        description,
      });

      res.status(201).json({
        success: true,
        message: result.message,
        data: { reportId: result.reportId },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/reports/my-reports
  async getMyReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = req.query as any;

      const result = await reportService.getUserReports(
        userId,
        parseInt(page) || 1,
        parseInt(limit) || 20
      );

      res.status(200).json({
        success: true,
        data: result.reports,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/reports/:id
  async deleteReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await reportService.deleteReport(id, userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoints

  // GET /api/v1/reports/pending
  async getPendingReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query as any;

      const result = await reportService.getPendingReports(
        parseInt(page) || 1,
        parseInt(limit) || 50
      );

      res.status(200).json({
        success: true,
        data: result.reports,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/reports/against/:userId
  async getReportsAgainstUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query as any;

      const result = await reportService.getReportsAgainstUser(
        userId,
        parseInt(page) || 1,
        parseInt(limit) || 20
      );

      res.status(200).json({
        success: true,
        data: result.reports,
        statistics: result.statistics,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/reports/:id/status
  async updateReportStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const { id } = req.params;
      const { status, notes } = req.body;

      const result = await reportService.updateReportStatus(
        id,
        status,
        adminId,
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Report status updated',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/reports/statistics
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await reportService.getReportStatistics();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportController();
