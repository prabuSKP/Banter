// backend/src/controllers/host.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import hostService from '../services/host.service';

export class HostController {
  // POST /api/v1/host/apply
  async applyAsHost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { documents } = req.body; // Array of document URLs

      const result = await hostService.applyAsHost(userId, documents);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/host/approve/:userId (Admin only)
  async approveHost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const adminId = req.user!.id;

      const result = await hostService.approveHost(userId, adminId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/host/reject/:userId (Admin only)
  async rejectHost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const adminId = req.user!.id;

      const result = await hostService.rejectHost(userId, reason, adminId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/host/dashboard
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const dashboard = await hostService.getHostDashboard(userId);

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/host/earnings
  async getEarningsHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = req.query as any;

      const result = await hostService.getEarningsHistory(
        userId,
        parseInt(page) || 1,
        parseInt(limit) || 50
      );

      res.status(200).json({
        success: true,
        data: result.earnings,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/host/withdrawal
  async requestWithdrawal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { amount, method, paymentDetails } = req.body;

      const withdrawal = await hostService.requestWithdrawal(
        userId,
        amount,
        method,
        paymentDetails
      );

      res.status(201).json({
        success: true,
        message: 'Withdrawal request submitted successfully',
        data: withdrawal,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/host/rate
  async rateHost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const callerId = req.user!.id;
      const { hostId, callId, rating, feedback } = req.body;

      const result = await hostService.rateHost(hostId, callId, callerId, rating, feedback);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new HostController();
