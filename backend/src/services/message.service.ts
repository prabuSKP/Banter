// backend/src/services/message.service.ts

import prisma from '../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import logger from '../config/logger';
import friendService from './friend.service';

export class MessageService {
  // Send message (direct or room)
  async sendMessage(
    senderId: string,
    data: {
      receiverId?: string;
      roomId?: string;
      content: string;
      messageType: 'text' | 'image' | 'audio' | 'video' | 'gif';
      mediaUrl?: string;
    }
  ) {
    try {
      const { receiverId, roomId, content, messageType, mediaUrl } = data;

      // Validate: must have either receiverId or roomId
      if (!receiverId && !roomId) {
        throw new BadRequestError('Either receiverId or roomId is required');
      }

      // If direct message, check if users are friends
      if (receiverId) {
        if (senderId === receiverId) {
          throw new BadRequestError('Cannot send message to yourself');
        }

        const areFriends = await friendService.areFriends(senderId, receiverId);
        if (!areFriends) {
          throw new ForbiddenError('Can only send messages to friends');
        }
      }

      // If room message, check if user is member
      if (roomId) {
        const membership = await prisma.chatRoomMember.findFirst({
          where: {
            roomId,
            userId: senderId,
          },
        });

        if (!membership) {
          throw new ForbiddenError('You are not a member of this room');
        }
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          roomId,
          content,
          messageType,
          mediaUrl,
          isRead: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      logger.info(`Message sent: ${message.id} by ${senderId}`);

      return message;
    } catch (error) {
      logger.error('Send message error:', error);
      throw error;
    }
  }

  // Get conversation with a friend
  async getConversation(
    userId: string,
    friendId: string,
    page: number = 1,
    limit: number = 50
  ) {
    try {
      // Check if they are friends
      const areFriends = await friendService.areFriends(userId, friendId);
      if (!areFriends) {
        throw new ForbiddenError('Can only view conversations with friends');
      }

      const skip = (page - 1) * limit;

      const messages = await prisma.message.findMany({
        where: {
          AND: [
            { roomId: null },
            {
              OR: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId },
              ],
            },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.message.count({
        where: {
          AND: [
            { roomId: null },
            {
              OR: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId },
              ],
            },
          ],
        },
      });

      return {
        messages: messages.reverse(), // Oldest first
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get conversation error:', error);
      throw error;
    }
  }

  // Get room messages
  async getRoomMessages(
    userId: string,
    roomId: string,
    page: number = 1,
    limit: number = 50
  ) {
    try {
      // Check if user is member
      const membership = await prisma.chatRoomMember.findFirst({
        where: {
          roomId,
          userId,
        },
      });

      if (!membership) {
        throw new ForbiddenError('You are not a member of this room');
      }

      const skip = (page - 1) * limit;

      const messages = await prisma.message.findMany({
        where: { roomId },
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.message.count({
        where: { roomId },
      });

      return {
        messages: messages.reverse(),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get room messages error:', error);
      throw error;
    }
  }

  // Get recent conversations
  async getRecentConversations(userId: string, limit: number = 20) {
    try {
      // Get latest message for each conversation
      const recentMessages = await prisma.message.findMany({
        where: {
          AND: [
            { roomId: null },
            {
              OR: [{ senderId: userId }, { receiverId: userId }],
            },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              isOnline: true,
            },
          },
          receiver: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              isOnline: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Get more to find unique conversations
      });

      // Group by conversation partner
      const conversationsMap = new Map();

      for (const message of recentMessages) {
        const partnerId = message.senderId === userId
          ? message.receiverId
          : message.senderId;

        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            partnerId,
            partner: message.senderId === userId ? message.receiver : message.sender,
            lastMessage: message,
            unreadCount: 0,
          });
        }
      }

      // Get unread counts in a single query (optimized - was N+1)
      const partnerIds = Array.from(conversationsMap.keys());
      const unreadCounts = await prisma.message.groupBy({
        by: ['senderId'],
        where: {
          receiverId: userId,
          isRead: false,
          senderId: { in: partnerIds },
        },
        _count: { id: true },
      });

      // Map results back to conversations
      const unreadMap = new Map(unreadCounts.map(u => [u.senderId, u._count.id]));
      for (const [partnerId, conversation] of conversationsMap.entries()) {
        conversation.unreadCount = unreadMap.get(partnerId) || 0;
      }

      const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime())
        .slice(0, limit);

      return conversations;
    } catch (error) {
      logger.error('Get recent conversations error:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markAsRead(userId: string, messageIds: string[]) {
    try {
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          receiverId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      logger.info(`Messages marked as read: ${messageIds.length} messages by ${userId}`);

      return { message: 'Messages marked as read' };
    } catch (error) {
      logger.error('Mark as read error:', error);
      throw error;
    }
  }

  // Delete message (only own messages)
  async deleteMessage(userId: string, messageId: string) {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new NotFoundError('Message not found');
      }

      if (message.senderId !== userId) {
        throw new ForbiddenError('Can only delete own messages');
      }

      await prisma.message.delete({
        where: { id: messageId },
      });

      logger.info(`Message deleted: ${messageId}`);

      return { message: 'Message deleted' };
    } catch (error) {
      logger.error('Delete message error:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw error;
    }
  }
}

export default new MessageService();
