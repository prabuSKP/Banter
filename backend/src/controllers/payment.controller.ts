// backend/src/controllers/payment.controller.ts

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import paymentService from '../services/payment.service';

export class PaymentController {
  // POST /api/v1/payments/order
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const orderData = await paymentService.createOrder(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: orderData,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/payments/verify
  async verifyPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.verifyPayment(req.body);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          transactionId: result.transactionId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/payments/transactions
  async getTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = req.query as any;

      const result = await paymentService.getUserTransactions(
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

  // GET /api/v1/payments/subscription
  async getSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const subscription = await paymentService.getUserSubscription(userId);

      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/payments/subscription/cancel
  async cancelSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await paymentService.cancelSubscription(userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/payments/webhook
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const result = await paymentService.handleWebhook(req.body, signature);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
