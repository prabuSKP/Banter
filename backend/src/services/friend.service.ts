// backend/src/services/friend.service.ts

import prisma from '../config/database';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import { deleteCache } from '../config/redis';
import logger from '../config/logger';
import notificationService from './notification.service';

export class FriendService {
  // Send friend request
  async sendFriendRequest(senderId: string, receiverId: string) {
    try {
      if (senderId === receiverId) {
        throw new BadRequestError('Cannot send friend request to yourself');
      }

      // Check if receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId, isActive: true },
      });

      if (!receiver) {
        throw new NotFoundError('User not found');
      }

      // Check if already friends
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: senderId, friendId: receiverId },
            { userId: receiverId, friendId: senderId },
          ],
        },
      });

      if (existingFriendship) {
        throw new ConflictError('Already friends with this user');
      }

      // Check if request already exists
      const existingRequest = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { senderId, receiverId, status: 'pending' },
            { senderId: receiverId, receiverId: senderId, status: 'pending' },
          ],
        },
      });

      if (existingRequest) {
        throw new ConflictError('Friend request already sent');
      }

      // Create friend request
      const friendRequest = await prisma.friendRequest.create({
        data: {
          senderId,
          receiverId,
          status: 'pending',
        },
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              phoneNumber: true,
            },
          },
          receiver: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      logger.info(`Friend request sent: ${senderId} -> ${receiverId}`);

      // Send notification to receiver
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { fullName: true, username: true },
      });

      if (sender) {
        const senderName = sender.username || sender.fullName;
        await notificationService.notifyFriendRequest(receiverId, senderId, senderName);
      }

      return friendRequest;
    } catch (error) {
      logger.error('Send friend request error:', error);
      throw error;
    }
  }

  // Get friend requests (received)
  async getFriendRequests(userId: string) {
    try {
      const requests = await prisma.friendRequest.findMany({
        where: {
          receiverId: userId,
          status: 'pending',
        },
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              bio: true,
              isPremium: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return requests;
    } catch (error) {
      logger.error('Get friend requests error:', error);
      throw error;
    }
  }

  // Accept friend request
  async acceptFriendRequest(requestId: string, userId: string) {
    try {
      // Find request
      const request = await prisma.friendRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new NotFoundError('Friend request not found');
      }

      if (request.receiverId !== userId) {
        throw new BadRequestError('Not authorized to accept this request');
      }

      if (request.status !== 'pending') {
        throw new BadRequestError('Friend request is not pending');
      }

      // Update request status and create friendship in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update request
        await tx.friendRequest.update({
          where: { id: requestId },
          data: { status: 'accepted' },
        });

        // Create bidirectional friendship
        await tx.friendship.createMany({
          data: [
            { userId: request.senderId, friendId: request.receiverId },
            { userId: request.receiverId, friendId: request.senderId },
          ],
        });

        // Get updated friendship info
        const friendship = await tx.friendship.findFirst({
          where: {
            userId: request.receiverId,
            friendId: request.senderId,
          },
          include: {
            friend: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                bio: true,
                isPremium: true,
                isOnline: true,
              },
            },
          },
        });

        return friendship;
      });

      logger.info(`Friend request accepted: ${request.senderId} <-> ${request.receiverId}`);

      // Send notification to sender
      const accepter = await prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, username: true },
      });

      if (accepter) {
        const accepterName = accepter.username || accepter.fullName;
        await notificationService.notifyFriendRequestAccepted(request.senderId, accepterName);
      }

      return result;
    } catch (error) {
      logger.error('Accept friend request error:', error);
      throw error;
    }
  }

  // Reject friend request
  async rejectFriendRequest(requestId: string, userId: string) {
    try {
      const request = await prisma.friendRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new NotFoundError('Friend request not found');
      }

      if (request.receiverId !== userId) {
        throw new BadRequestError('Not authorized to reject this request');
      }

      if (request.status !== 'pending') {
        throw new BadRequestError('Friend request is not pending');
      }

      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });

      logger.info(`Friend request rejected: ${requestId}`);

      return { message: 'Friend request rejected' };
    } catch (error) {
      logger.error('Reject friend request error:', error);
      throw error;
    }
  }

  // Get friends list
  async getFriends(userId: string, page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const friendships = await prisma.friendship.findMany({
        where: { userId },
        include: {
          friend: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              bio: true,
              isPremium: true,
              isOnline: true,
              lastActiveAt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.friendship.count({
        where: { userId },
      });

      return {
        friends: friendships.map(f => ({
          ...f.friend,
          friendsSince: f.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get friends error:', error);
      throw error;
    }
  }

  // Remove friend
  async removeFriend(userId: string, friendId: string) {
    try {
      if (userId === friendId) {
        throw new BadRequestError('Invalid friend ID');
      }

      // Check if friendship exists
      const friendship = await prisma.friendship.findFirst({
        where: {
          userId,
          friendId,
        },
      });

      if (!friendship) {
        throw new NotFoundError('Friendship not found');
      }

      // Remove bidirectional friendship
      await prisma.friendship.deleteMany({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });

      logger.info(`Friendship removed: ${userId} <-> ${friendId}`);

      return { message: 'Friend removed successfully' };
    } catch (error) {
      logger.error('Remove friend error:', error);
      throw error;
    }
  }

  // Check if users are friends
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    try {
      const friendship = await prisma.friendship.findFirst({
        where: {
          userId: userId1,
          friendId: userId2,
        },
      });

      return !!friendship;
    } catch (error) {
      logger.error('Check friendship error:', error);
      return false;
    }
  }
}

export default new FriendService();
