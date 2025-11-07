// backend/src/middleware/rateLimiter.ts

import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';
import env from '../config/env';
import { AppError } from '../utils/errors';

interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: Request) => string;
}

export const rateLimiter = (options: RateLimiterOptions = {}) => {
  const windowMs = options.windowMs || parseInt(env.RATE_LIMIT_WINDOW_MS);
  const maxRequests = options.maxRequests || parseInt(env.RATE_LIMIT_MAX_REQUESTS);
  const keyGenerator = options.keyGenerator || ((req: Request) => req.ip || 'unknown');

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `rate_limit:${keyGenerator(req)}`;
      const currentCount = await redis.incr(key);

      // Set expiry on first request
      if (currentCount === 1) {
        await redis.pexpire(key, windowMs);
      }

      // Set headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - currentCount));

      // Check if limit exceeded
      if (currentCount > maxRequests) {
        const ttl = await redis.pttl(key);
        res.setHeader('X-RateLimit-Reset', Date.now() + ttl);
        throw new AppError('Too many requests, please try again later', 429);
      }

      next();
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 429) {
        next(error);
      } else {
        // If Redis fails, allow the request (fail open)
        next();
      }
    }
  };
};

// Auth-specific rate limiter (more strict)
export const authRateLimiter = rateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 5,
  keyGenerator: (req) => {
    const phoneNumber = req.body?.phoneNumber;
    return phoneNumber ? `auth:${phoneNumber}` : req.ip || 'unknown';
  },
});
