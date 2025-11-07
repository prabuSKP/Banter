// backend/src/routes/notification.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import notificationController from '../controllers/notification.controller';
import { z } from 'zod';
import { validateRequest } from '../middleware/validator';

const router = Router();

// Validation schemas
const updateFcmTokenSchema = z.object({
  body: z.object({
    fcmToken: z.string().min(1),
  }),
});

// Get all notifications
router.get(
  '/',
  authenticate,
  notificationController.getNotifications
);

// Mark notification as read
router.patch(
  '/:id/read',
  authenticate,
  notificationController.markAsRead
);

// Mark all notifications as read
router.patch(
  '/read-all',
  authenticate,
  notificationController.markAllAsRead
);

// Delete notification
router.delete(
  '/:id',
  authenticate,
  notificationController.deleteNotification
);

// Update FCM token
router.post(
  '/fcm-token',
  authenticate,
  validateRequest(updateFcmTokenSchema),
  notificationController.updateFcmToken
);

export default router;
