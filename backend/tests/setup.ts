// backend/tests/setup.ts

import { PrismaClient } from '@prisma/client';

// Mock Prisma client for tests
jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: new PrismaClient(),
  connectDatabase: jest.fn().mockResolvedValue(undefined),
  disconnectDatabase: jest.fn().mockResolvedValue(undefined),
}));

// Mock Redis
jest.mock('../src/config/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
  },
  setCache: jest.fn(),
  getCache: jest.fn(),
  deleteCache: jest.fn(),
  deleteCachePattern: jest.fn(),
}));

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    getUserByPhoneNumber: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
  })),
}));

// Mock Logger
jest.mock('../src/config/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-chars-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_PRIVATE_KEY = 'test-private-key';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
process.env.AGORA_APP_ID = 'test-agora-app-id';
process.env.AGORA_APP_CERTIFICATE = 'test-agora-certificate';
process.env.RAZORPAY_KEY_ID = 'test-razorpay-key';
process.env.RAZORPAY_KEY_SECRET = 'test-razorpay-secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.AZURE_STORAGE_CONNECTION_STRING = 'test-connection-string';
process.env.AZURE_STORAGE_CONTAINER_NAME = 'test-container';
process.env.CORS_ORIGIN = 'http://localhost:8081';

// Global test setup
beforeAll(async () => {
  // Setup code that runs once before all tests
});

// Global test teardown
afterAll(async () => {
  // Cleanup code that runs once after all tests
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
