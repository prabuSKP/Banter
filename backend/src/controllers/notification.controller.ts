// backend/src/controllers/notification.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import notificationService from '../services/notification.service';

export class NotificationController {
  // GET /api/v1/notifications
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = req.query as any;

      const result = await notificationService.getUserNotifications(
        userId,
        parseInt(page) || 1,
        parseInt(limit) || 50
      );

      res.status(200).json({
        success: true,
        data: result.notifications,
        unreadCount: result.unreadCount,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/notifications/:id/read
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await notificationService.markAsRead(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/notifications/read-all
  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const result = await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: `${result.count} notifications marked as read`,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/notifications/:id
  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await notificationService.deleteNotification(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/notifications/fcm-token
  async updateFcmToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { fcmToken } = req.body;

      await notificationService.updateFcmToken(userId, fcmToken);

      res.status(200).json({
        success: true,
        message: 'FCM token updated',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
