// backend/src/middleware/admin.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ForbiddenError } from '../utils/errors';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Middleware to check if user is an admin or moderator
 */
export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ForbiddenError('Authentication required');
    }

    // Get user role from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user) {
      throw new ForbiddenError('User not found');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Account is suspended');
    }

    // Check if user is admin or moderator
    if (user.role !== 'admin' && user.role !== 'moderator') {
      logger.warn(`Unauthorized admin access attempt by user: ${userId}`);
      throw new ForbiddenError('Admin or moderator access required');
    }

    // Add role to request object
    req.user = {
      ...req.user,
      role: user.role as 'admin' | 'moderator' | 'user',
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is strictly an admin (not moderator)
 */
export const isStrictAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ForbiddenError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user) {
      throw new ForbiddenError('User not found');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Account is suspended');
    }

    if (user.role !== 'admin') {
      logger.warn(`Unauthorized admin access attempt by user: ${userId}`);
      throw new ForbiddenError('Admin access required');
    }

    req.user = {
      ...req.user,
      role: 'admin',
    };

    next();
  } catch (error) {
    next(error);
  }
};
