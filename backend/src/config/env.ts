// backend/src/config/env.ts

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  API_VERSION: z.string().default('v1'),

  DATABASE_URL: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS: z.string().optional(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),

  LIVEKIT_API_KEY: z.string(),
  LIVEKIT_API_SECRET: z.string(),
  LIVEKIT_SERVER_URL: z.string().url(),
  LIVEKIT_TOKEN_EXPIRY: z.string().default('3600'),

  COTURN_HOST: z.string().optional(),
  COTURN_PORT: z.string().optional(),
  COTURN_TLS_PORT: z.string().optional(),
  COTURN_SECRET: z.string().optional(),

  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  RAZORPAY_WEBHOOK_SECRET: z.string(),

  AZURE_STORAGE_CONNECTION_STRING: z.string(),
  AZURE_STORAGE_CONTAINER_NAME: z.string(),

  CORS_ORIGIN: z.string(),

  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  LOG_LEVEL: z.string().default('info'),

  DEFAULT_COUNTRY_CODE: z.string().default('+91'),
  INITIAL_USER_COINS: z.string().default('100'),
  MAX_ROOM_MEMBERS: z.string().default('10'),
  MESSAGE_RETENTION_DAYS: z.string().default('90'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  process.exit(1);
}

export default env;
