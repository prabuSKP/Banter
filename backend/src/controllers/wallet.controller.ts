// backend/src/controllers/wallet.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import walletService from '../services/wallet.service';

export class WalletController {
  // GET /api/v1/wallet/balance
  async getBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const balance = await walletService.getBalance(userId);

      res.status(200).json({
        success: true,
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/wallet/transactions
  async getTransactionHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = req.query as any;

      const result = await walletService.getTransactionHistory(
        userId,
        parseInt(page) || 1,
        parseInt(limit) || 50
      );

      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/wallet/packages
  async getRechargePackages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const packages = walletService.getRechargePackages();

      res.status(200).json({
        success: true,
        data: packages,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/wallet/transfer
  async transferCoins(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const fromUserId = req.user!.id;
      const { toUserId, amount, message } = req.body;

      await walletService.transferCoins(fromUserId, toUserId, amount, message);

      res.status(200).json({
        success: true,
        message: 'Coins transferred successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/wallet/statistics
  async getCoinStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stats = await walletService.getCoinStatistics(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/wallet/charge-call
  async chargeForCall(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { callId, callType, duration } = req.body;

      const result = await walletService.chargeForCall(
        userId,
        callType,
        duration,
        callId
      );

      res.status(200).json({
        success: true,
        message: 'Call charged successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new WalletController();
