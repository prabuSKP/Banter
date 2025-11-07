// backend/src/middleware/auth.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import logger from '../config/logger';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyAccessToken(token);

    // Attach user to request
    req.user = {
      id: payload.userId,
      phoneNumber: payload.phoneNumber,
      firebaseUid: payload.firebaseUid,
    };

    next();
  } catch (error: any) {
    logger.error('Authentication error:', error);
    next(new UnauthorizedError(error.message || 'Authentication failed'));
  }
};

// Optional authentication (doesn't throw error if no token)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      req.user = {
        id: payload.userId,
        phoneNumber: payload.phoneNumber,
        firebaseUid: payload.firebaseUid,
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
