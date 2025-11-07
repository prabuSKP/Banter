// backend/src/config/redis.ts

import Redis from 'ioredis';
import logger from './logger';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  ...(process.env.REDIS_TLS === 'true' && {
    tls: {},
  }),
});

redis.on('connect', () => {
  logger.info('✅ Redis connected');
});

redis.on('error', (error) => {
  logger.error('❌ Redis connection error:', error);
});

redis.on('ready', () => {
  logger.info('✅ Redis ready');
});

redis.on('close', () => {
  logger.warn('⚠️  Redis connection closed');
});

// Helper functions
export const setCache = async (key: string, value: any, expiry?: number) => {
  try {
    const serialized = JSON.stringify(value);
    if (expiry) {
      await redis.setex(key, expiry, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (error) {
    logger.error('Redis set error:', error);
    throw error;
  }
};

export const getCache = async <T = any>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
};

export const deleteCache = async (key: string) => {
  try {
    await redis.del(key);
  } catch (error) {
    logger.error('Redis delete error:', error);
  }
};

export const deleteCachePattern = async (pattern: string) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.error('Redis delete pattern error:', error);
  }
};

export default redis;
