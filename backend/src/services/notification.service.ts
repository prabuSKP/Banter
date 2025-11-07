// backend/src/services/notification.service.ts

import admin from 'firebase-admin';
import prisma from '../config/database';
import logger from '../config/logger';
import { BadRequestError } from '../utils/errors';

export type NotificationType =
  | 'friend_request'
  | 'friend_request_accepted'
  | 'message'
  | 'call_incoming'
  | 'call_missed'
  | 'room_invite'
  | 'payment_success'
  | 'coins_received'
  | 'system';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationService {
  // Send push notification via FCM
  async sendPushNotification(
    fcmToken: string,
    notification: {
      title: string;
      body: string;
      imageUrl?: string;
    },
    data?: Record<string, any>
  ) {
    try {
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'banter_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      logger.info(`Push notification sent: ${response}`);
      return response;
    } catch (error) {
      logger.error('Send push notification error:', error);
      // Don't throw error - notification failure shouldn't break app flow
      return null;
    }
  }

  // Create in-app notification
  async createNotification(notificationData: NotificationData) {
    try {
      const { userId, type, title, body, data } = notificationData;

      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          body,
          data: data || {},
          isRead: false,
        },
      });

      // Get user's FCM token and send push notification
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true },
      });

      if (user?.fcmToken) {
        await this.sendPushNotification(
          user.fcmToken,
          { title, body },
          { notificationId: notification.id, type, ...data }
        );
      }

      logger.info(`Notification created for user ${userId}: ${type}`);
      return notification;
    } catch (error) {
      logger.error('Create notification error:', error);
      throw error;
    }
  }

  // Send friend request notification
  async notifyFriendRequest(receiverId: string, senderId: string, senderName: string) {
    return this.createNotification({
      userId: receiverId,
      type: 'friend_request',
      title: 'New Friend Request',
      body: `${senderName} sent you a friend request`,
      data: { senderId },
    });
  }

  // Send friend request accepted notification
  async notifyFriendRequestAccepted(userId: string, accepterName: string) {
    return this.createNotification({
      userId,
      type: 'friend_request_accepted',
      title: 'Friend Request Accepted',
      body: `${accepterName} accepted your friend request`,
    });
  }

  // Send new message notification
  async notifyNewMessage(receiverId: string, senderId: string, senderName: string, message: string) {
    return this.createNotification({
      userId: receiverId,
      type: 'message',
      title: `New message from ${senderName}`,
      body: message.substring(0, 100),
      data: { senderId },
    });
  }

  // Send incoming call notification
  async notifyIncomingCall(
    receiverId: string,
    callerId: string,
    callerName: string,
    callType: 'audio' | 'video',
    callId: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { fcmToken: true },
    });

    if (user?.fcmToken) {
      await this.sendPushNotification(
        user.fcmToken,
        {
          title: `Incoming ${callType} call`,
          body: `${callerName} is calling you...`,
        },
        {
          type: 'call_incoming',
          callId,
          callerId,
          callType,
          priority: 'high',
        }
      );
    }
  }

  // Send missed call notification
  async notifyMissedCall(userId: string, callerName: string, callType: 'audio' | 'video') {
    return this.createNotification({
      userId,
      type: 'call_missed',
      title: 'Missed Call',
      body: `You missed a ${callType} call from ${callerName}`,
    });
  }

  // Send room invite notification
  async notifyRoomInvite(userId: string, roomName: string, inviterName: string, roomId: string) {
    return this.createNotification({
      userId,
      type: 'room_invite',
      title: 'Room Invitation',
      body: `${inviterName} invited you to join "${roomName}"`,
      data: { roomId },
    });
  }

  // Send payment success notification
  async notifyPaymentSuccess(userId: string, coins: number, amount: number) {
    return this.createNotification({
      userId,
      type: 'payment_success',
      title: 'Payment Successful',
      body: `You have successfully purchased ${coins} coins for ₹${amount}`,
      data: { coins, amount },
    });
  }

  // Send coins received notification (gift)
  async notifyCoinsReceived(userId: string, amount: number, senderName: string) {
    return this.createNotification({
      userId,
      type: 'coins_received',
      title: 'Coins Received',
      body: `${senderName} sent you ${amount} coins!`,
      data: { amount },
    });
  }

  // Get user notifications
  async getUserNotifications(userId: string, page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.notification.count({
        where: { userId },
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
      });

      return {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get user notifications error:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new BadRequestError('Notification not found');
      }

      if (notification.userId !== userId) {
        throw new BadRequestError('Unauthorized');
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      logger.info(`Notification ${notificationId} marked as read`);
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      logger.info(`Marked ${result.count} notifications as read for user ${userId}`);
      return result;
    } catch (error) {
      logger.error('Mark all as read error:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new BadRequestError('Notification not found');
      }

      if (notification.userId !== userId) {
        throw new BadRequestError('Unauthorized');
      }

      await prisma.notification.delete({
        where: { id: notificationId },
      });

      logger.info(`Notification ${notificationId} deleted`);
    } catch (error) {
      logger.error('Delete notification error:', error);
      throw error;
    }
  }

  // Update FCM token
  async updateFcmToken(userId: string, fcmToken: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { fcmToken },
      });

      logger.info(`FCM token updated for user ${userId}`);
    } catch (error) {
      logger.error('Update FCM token error:', error);
      throw error;
    }
  }

  // Clear old notifications (cleanup task)
  async clearOldNotifications(daysOld: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          isRead: true,
        },
      });

      logger.info(`Cleared ${result.count} old notifications`);
      return result;
    } catch (error) {
      logger.error('Clear old notifications error:', error);
      throw error;
    }
  }
}

export default new NotificationService();
