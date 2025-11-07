// backend/src/services/auth.service.ts

import prisma from '../config/database';
import { verifyFirebaseToken } from '../config/firebase';
import { generateTokenPair } from '../utils/jwt';
import { UnauthorizedError, BadRequestError } from '../utils/errors';
import env from '../config/env';
import logger from '../config/logger';

export class AuthService {
  // Verify Firebase ID token and login/register user
  async verifyAndLogin(firebaseIdToken: string) {
    try {
      // Verify Firebase token
      const decodedToken = await verifyFirebaseToken(firebaseIdToken);

      if (!decodedToken.phone_number) {
        throw new BadRequestError('Phone number not found in Firebase token');
      }

      const phoneNumber = decodedToken.phone_number;
      const firebaseUid = decodedToken.uid;

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      // Create new user if doesn't exist
      if (!user) {
        user = await prisma.user.create({
          data: {
            phoneNumber,
            firebaseUid,
            countryCode: phoneNumber.substring(0, phoneNumber.length - 10), // Extract country code
            coins: parseInt(env.INITIAL_USER_COINS),
            isActive: true,
          },
        });

        logger.info(`New user created: ${user.id} (${phoneNumber})`);
      } else {
        // Update Firebase UID if changed
        if (user.firebaseUid !== firebaseUid) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { firebaseUid },
          });
        }

        // Update last active
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        });
      }

      // Generate JWT tokens
      const tokens = generateTokenPair({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        firebaseUid: user.firebaseUid || undefined,
      });

      return {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          coins: user.coins,
          isPremium: user.isPremium,
          createdAt: user.createdAt,
        },
        tokens,
      };
    } catch (error: any) {
      logger.error('Login error:', error);
      throw new UnauthorizedError(error.message || 'Authentication failed');
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string) {
    try {
      const { verifyRefreshToken } = await import('../utils/jwt');
      const payload = verifyRefreshToken(refreshToken);

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError('User not found or inactive');
      }

      // Generate new token pair
      const tokens = generateTokenPair({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        firebaseUid: user.firebaseUid || undefined,
      });

      return tokens;
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      throw new UnauthorizedError(error.message || 'Token refresh failed');
    }
  }

  // Logout (optional - can be used to invalidate tokens on server side)
  async logout(userId: string) {
    try {
      // Update last active timestamp
      await prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      });

      // Note: JWT tokens are stateless, so we can't truly invalidate them
      // In production, you might want to implement a token blacklist in Redis

      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  // Delete account
  async deleteAccount(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestError('User not found');
      }

      // Delete user from Firebase if Firebase UID exists
      if (user.firebaseUid) {
        const { deleteFirebaseUser } = await import('../config/firebase');
        await deleteFirebaseUser(user.firebaseUid);
      }

      // Soft delete user (mark as inactive)
      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          phoneNumber: `deleted_${user.id}_${user.phoneNumber}`,
          firebaseUid: null,
        },
      });

      logger.info(`User account deleted: ${userId}`);

      return { message: 'Account deleted successfully' };
    } catch (error) {
      logger.error('Delete account error:', error);
      throw error;
    }
  }
}

export default new AuthService();
