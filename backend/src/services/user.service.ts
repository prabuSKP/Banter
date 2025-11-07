// backend/src/services/user.service.ts

import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { setCache, getCache, deleteCache } from '../config/redis';
import logger from '../config/logger';

export class UserService {
  private CACHE_TTL = 3600; // 1 hour

  // Get user by ID
  async getUserById(userId: string, requesterId?: string) {
    try {
      // Try cache first
      const cacheKey = `user:${userId}`;
      const cachedUser = await getCache(cacheKey);

      if (cachedUser) {
        return cachedUser;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          phoneNumber: requesterId === userId, // Only show phone to self
          displayName: true,
          avatarUrl: true,
          bio: true,
          dateOfBirth: true,
          gender: true,
          interests: true,
          coins: requesterId === userId, // Only show coins to self
          isPremium: true,
          isOnline: true,
          lastActiveAt: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Cache the result
      await setCache(cacheKey, user, this.CACHE_TTL);

      return user;
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId: string, data: {
    displayName?: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    interests?: string[];
  }) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        },
        select: {
          id: true,
          phoneNumber: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          dateOfBirth: true,
          gender: true,
          interests: true,
          coins: true,
          isPremium: true,
          createdAt: true,
        },
      });

      // Invalidate cache
      await deleteCache(`user:${userId}`);

      logger.info(`User profile updated: ${userId}`);

      return user;
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  // Update avatar URL
  async updateAvatar(userId: string, avatarUrl: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: {
          id: true,
          avatarUrl: true,
        },
      });

      // Invalidate cache
      await deleteCache(`user:${userId}`);

      logger.info(`User avatar updated: ${userId}`);

      return user;
    } catch (error) {
      logger.error('Update avatar error:', error);
      throw error;
    }
  }

  // Search users by display name or phone
  async searchUsers(query: string, requesterId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const users = await prisma.user.findMany({
        where: {
          AND: [
            { isActive: true },
            { id: { not: requesterId } },
            {
              OR: [
                { displayName: { contains: query, mode: 'insensitive' } },
                { phoneNumber: { contains: query } },
              ],
            },
          ],
        },
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          isPremium: true,
          isOnline: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.user.count({
        where: {
          AND: [
            { isActive: true },
            { id: { not: requesterId } },
            {
              OR: [
                { displayName: { contains: query, mode: 'insensitive' } },
                { phoneNumber: { contains: query } },
              ],
            },
          ],
        },
      });

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Search users error:', error);
      throw error;
    }
  }

  // Update online status
  async updateOnlineStatus(userId: string, isOnline: boolean) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline,
          lastActiveAt: new Date(),
        },
      });

      // Invalidate cache
      await deleteCache(`user:${userId}`);

      logger.debug(`User online status updated: ${userId} - ${isOnline}`);
    } catch (error) {
      logger.error('Update online status error:', error);
    }
  }

  // Block user
  async blockUser(blockerId: string, blockedId: string) {
    try {
      if (blockerId === blockedId) {
        throw new BadRequestError('Cannot block yourself');
      }

      // Check if already blocked
      const existing = await prisma.blockedUser.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId,
          },
        },
      });

      if (existing) {
        throw new BadRequestError('User already blocked');
      }

      await prisma.blockedUser.create({
        data: {
          blockerId,
          blockedId,
        },
      });

      logger.info(`User blocked: ${blockerId} blocked ${blockedId}`);

      return { message: 'User blocked successfully' };
    } catch (error) {
      logger.error('Block user error:', error);
      throw error;
    }
  }

  // Unblock user
  async unblockUser(blockerId: string, blockedId: string) {
    try {
      await prisma.blockedUser.delete({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId,
          },
        },
      });

      logger.info(`User unblocked: ${blockerId} unblocked ${blockedId}`);

      return { message: 'User unblocked successfully' };
    } catch (error) {
      logger.error('Unblock user error:', error);
      throw new NotFoundError('Block relationship not found');
    }
  }

  // Get blocked users
  async getBlockedUsers(userId: string) {
    try {
      const blockedUsers = await prisma.blockedUser.findMany({
        where: { blockerId: userId },
        include: {
          blocked: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return blockedUsers.map(b => ({
        ...b.blocked,
        blockedAt: b.createdAt,
      }));
    } catch (error) {
      logger.error('Get blocked users error:', error);
      throw error;
    }
  }
}

export default new UserService();
