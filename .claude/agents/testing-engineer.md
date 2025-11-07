# Testing Engineer Agent

**Role:** Senior QA Engineer & Test Automation Specialist
**Expertise:** Jest, Supertest, React Native Testing Library, Test Coverage
**Project:** Banter Social Audio/Video Platform

---

## Core Competencies

- **Testing Framework:** Jest 30.x
- **API Testing:** Supertest 7.x
- **Mocking:** Jest mocks, Prisma mock
- **Coverage:** Istanbul/NYC
- **Backend:** Integration & Unit tests
- **Mobile:** React Native Testing Library
- **E2E:** Detox (future)

---

## Current Test Structure

```
backend/tests/
├── setup.ts              # Test configuration & mocks
├── integration/          # API endpoint tests
│   ├── auth.test.ts
│   ├── user.test.ts
│   └── call.test.ts
└── unit/                 # Unit tests
    ├── utils/
    │   ├── jwt.test.ts
    │   └── validators.test.ts
    └── services/
        └── call.service.test.ts
```

---

## Jest Configuration

```javascript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/config/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
};
```

---

## Test Setup & Mocks

```typescript
// tests/setup.ts
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// Mock Prisma
jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

// Mock Redis
jest.mock('../src/config/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
    getCache: jest.fn(),
    setCache: jest.fn(),
    deleteCache: jest.fn(),
  },
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

// Mock Firebase
jest.mock('../src/config/firebase', () => ({
  verifyFirebaseToken: jest.fn(),
  deleteFirebaseUser: jest.fn(),
}));

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
  jest.clearAllMocks();
});

// Export mocks
export const prismaMock = mockDeep<PrismaClient>();
```

---

## Integration Tests

### Auth Endpoints

```typescript
// tests/integration/auth.test.ts
import request from 'supertest';
import app from '../../src/app';
import { prismaMock } from '../setup';
import { verifyFirebaseToken } from '../../src/config/firebase';

jest.mock('../../src/config/firebase');

describe('POST /api/v1/auth/login', () => {
  const mockUser = {
    id: 'user-123',
    phoneNumber: '+919876543210',
    fullName: 'Test User',
    firebaseUid: 'firebase-123',
    coins: 100,
    isPremium: false,
    createdAt: new Date(),
  };

  it('should login with valid Firebase token', async () => {
    // Mock Firebase verification
    (verifyFirebaseToken as jest.Mock).mockResolvedValue({
      uid: 'firebase-123',
      phone_number: '+919876543210',
    });

    // Mock Prisma user query
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    prismaMock.user.update.mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ firebaseIdToken: 'valid-token' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('tokens');
    expect(response.body.data.tokens).toHaveProperty('accessToken');
    expect(response.body.data.tokens).toHaveProperty('refreshToken');
  });

  it('should create new user if not exists', async () => {
    (verifyFirebaseToken as jest.Mock).mockResolvedValue({
      uid: 'firebase-new',
      phone_number: '+919999999999',
    });

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      ...mockUser,
      id: 'new-user-123',
      phoneNumber: '+919999999999',
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ firebaseIdToken: 'valid-token' });

    expect(response.status).toBe(200);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          phoneNumber: '+919999999999',
          firebaseUid: 'firebase-new',
        }),
      })
    );
  });

  it('should return 401 for invalid token', async () => {
    (verifyFirebaseToken as jest.Mock).mockRejectedValue(
      new Error('Invalid token')
    );

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ firebaseIdToken: 'invalid-token' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should return 400 for missing token', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({});

    expect(response.status).toBe(400);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('should refresh access token with valid refresh token', async () => {
    const mockUser = {
      id: 'user-123',
      phoneNumber: '+919876543210',
      isActive: true,
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    // Generate valid refresh token
    const { generateTokenPair } = await import('../../src/utils/jwt');
    const { refreshToken } = generateTokenPair({
      userId: mockUser.id,
      phoneNumber: mockUser.phoneNumber,
    });

    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');
  });

  it('should return 401 for invalid refresh token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid-token' });

    expect(response.status).toBe(401);
  });
});
```

### User Endpoints

```typescript
// tests/integration/user.test.ts
import request from 'supertest';
import app from '../../src/app';
import { prismaMock } from '../setup';
import { generateTokenPair } from '../../src/utils/jwt';

describe('User API', () => {
  let accessToken: string;
  const mockUser = {
    id: 'user-123',
    phoneNumber: '+919876543210',
    fullName: 'Test User',
    avatar: null,
    bio: null,
    coins: 100,
    isPremium: false,
    isOnline: false,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    const tokens = generateTokenPair({
      userId: mockUser.id,
      phoneNumber: mockUser.phoneNumber,
    });
    accessToken = tokens.accessToken;
  });

  describe('GET /api/v1/users/me', () => {
    it('should return current user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        id: mockUser.id,
        fullName: mockUser.fullName,
      });
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/v1/users/me');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update user profile', async () => {
      const updatedUser = { ...mockUser, fullName: 'Updated Name' };
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ fullName: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.data.fullName).toBe('Updated Name');
    });

    it('should validate input', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ fullName: '' }); // Empty string

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/users/search', () => {
    it('should search users by query', async () => {
      const users = [mockUser];
      prismaMock.user.findMany.mockResolvedValue(users);

      const response = await request(app)
        .get('/api/v1/users/search?q=Test')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return empty array for no matches', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/users/search?q=NoMatch')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });
});
```

---

## Unit Tests

### JWT Utilities

```typescript
// tests/unit/utils/jwt.test.ts
import { generateTokenPair, verifyAccessToken, verifyRefreshToken } from '../../../src/utils/jwt';

describe('JWT Utilities', () => {
  const payload = {
    userId: 'user-123',
    phoneNumber: '+919876543210',
  };

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', () => {
      const tokens = generateTokenPair(payload);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const { accessToken } = generateTokenPair(payload);
      const decoded = verifyAccessToken(accessToken);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.phoneNumber).toBe(payload.phoneNumber);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('should throw error for expired token', async () => {
      // Mock expired token
      jest.useFakeTimers();
      const { accessToken } = generateTokenPair(payload);

      // Fast forward 8 days (token expires in 7 days)
      jest.advanceTimersByTime(8 * 24 * 60 * 60 * 1000);

      expect(() => verifyAccessToken(accessToken)).toThrow();

      jest.useRealTimers();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const { refreshToken } = generateTokenPair(payload);
      const decoded = verifyRefreshToken(refreshToken);

      expect(decoded.userId).toBe(payload.userId);
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });
});
```

### Service Tests

```typescript
// tests/unit/services/user.service.test.ts
import userService from '../../../src/services/user.service';
import { prismaMock } from '../../setup';
import redis from '../../../src/config/redis';

jest.mock('../../../src/config/redis');

describe('UserService', () => {
  const mockUser = {
    id: 'user-123',
    phoneNumber: '+919876543210',
    fullName: 'Test User',
    avatar: null,
    bio: null,
    coins: 100,
    isPremium: false,
  };

  describe('getUserById', () => {
    it('should return user from cache if exists', async () => {
      (redis.getCache as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));

      const result = await userService.getUserById('user-123');

      expect(result).toEqual(mockUser);
      expect(redis.getCache).toHaveBeenCalledWith('user:user-123');
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache if not in cache', async () => {
      (redis.getCache as jest.Mock).mockResolvedValue(null);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user-123');

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(redis.setCache).toHaveBeenCalledWith(
        'user:user-123',
        JSON.stringify(mockUser),
        3600
      );
    });

    it('should throw NotFoundError if user not exists', async () => {
      (redis.getCache as jest.Mock).mockResolvedValue(null);
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(userService.getUserById('non-existent')).rejects.toThrow(
        'User not found'
      );
    });
  });
});
```

---

## Test Coverage

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run in watch mode
npm test -- --watch

# Run with verbose output
npm test -- --verbose
```

### Coverage Report

```
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   75.23 |    68.42 |   80.12 |   76.45 |
 controllers/      |   85.23 |    75.42 |   90.12 |   86.45 |
 services/         |   70.45 |    65.23 |   75.34 |   71.23 |
 utils/            |   90.12 |    85.67 |   95.23 |   91.34 |
 middleware/       |   65.34 |    55.23 |   70.12 |   66.45 |
-------------------|---------|----------|---------|---------|
```

### Coverage Goals

- **Overall:** 80%+
- **Controllers:** 85%+
- **Services:** 75%+
- **Utils:** 90%+
- **Middleware:** 75%+

---

## Testing Best Practices

### 1. Test Structure (AAA Pattern)

```typescript
it('should do something', async () => {
  // Arrange - Setup test data and mocks
  const mockData = { id: '123', name: 'Test' };
  prismaMock.user.findUnique.mockResolvedValue(mockData);

  // Act - Execute the function
  const result = await userService.getUserById('123');

  // Assert - Verify the result
  expect(result).toEqual(mockData);
  expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
    where: { id: '123' },
  });
});
```

### 2. Descriptive Test Names

```typescript
// ❌ BAD
it('works', () => { ... });
it('test 1', () => { ... });

// ✅ GOOD
it('should return user when valid ID is provided', () => { ... });
it('should throw NotFoundError when user does not exist', () => { ... });
it('should cache user data after fetching from database', () => { ... });
```

### 3. Test Edge Cases

```typescript
describe('calculateCallCost', () => {
  it('should calculate cost for regular user', () => { ... });
  it('should apply 50% discount for premium user', () => { ... });
  it('should handle zero duration', () => { ... });
  it('should handle negative duration', () => { ... });
  it('should handle very long calls', () => { ... });
  it('should round up to nearest coin', () => { ... });
});
```

### 4. Mock External Dependencies

```typescript
// Always mock:
// - Database (Prisma)
// - Cache (Redis)
// - External APIs (Firebase, Razorpay, Agora)
// - Logger
// - File system
// - Time (Date.now, setTimeout)

jest.mock('../src/config/database');
jest.mock('../src/config/redis');
jest.mock('../src/config/firebase');
```

### 5. Clean Up After Tests

```typescript
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

---

## Test Data Factories

```typescript
// tests/factories/user.factory.ts
import { User } from '@prisma/client';

export const createMockUser = (overrides?: Partial<User>): User => {
  return {
    id: 'user-123',
    phoneNumber: '+919876543210',
    countryCode: '+91',
    firebaseUid: 'firebase-123',
    email: null,
    username: null,
    fullName: 'Test User',
    avatar: null,
    bio: null,
    gender: null,
    dateOfBirth: null,
    language: 'en',
    isVerified: false,
    isOnline: false,
    lastSeen: null,
    coins: 100,
    isPremium: false,
    premiumUntil: null,
    fcmToken: null,
    role: 'user',
    isActive: true,
    isHost: false,
    hostVerificationStatus: null,
    hostAppliedAt: null,
    hostVerifiedAt: null,
    hostRejectedAt: null,
    hostRejectionReason: null,
    hostDocuments: [],
    hostRating: null,
    totalEarnings: 0,
    availableBalance: 0,
    totalWithdrawn: 0,
    totalCallsAsHost: 0,
    totalMinutesAsHost: 0,
    interests: [],
    lookingFor: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};
```

---

## Performance Testing

```typescript
// tests/performance/api-load.test.ts
describe('API Performance', () => {
  it('should handle 100 concurrent requests', async () => {
    const requests = Array.from({ length: 100 }, () =>
      request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${token}`)
    );

    const start = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    // All requests should succeed
    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    // Should complete within 5 seconds
    expect(duration).toBeLessThan(5000);
  });
});
```

---

## E2E Testing (Future)

```typescript
// e2e/auth-flow.e2e.ts
import { device, element, by, expect } from 'detox';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should login successfully', async () => {
    // Enter phone number
    await element(by.id('phone-input')).typeText('+919876543210');
    await element(by.id('send-otp-button')).tap();

    // Wait for OTP screen
    await waitFor(element(by.id('otp-input')))
      .toBeVisible()
      .withTimeout(5000);

    // Enter OTP
    await element(by.id('otp-input')).typeText('123456');
    await element(by.id('verify-button')).tap();

    // Should navigate to home screen
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

---

## Continuous Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Run tests
        run: cd backend && npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage/lcov.info
```

---

## Quick Reference

### Jest Matchers

```typescript
// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3.5);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3);

// Strings
expect(string).toMatch(/regex/);
expect(string).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty('key');
expect(object).toMatchObject({ key: 'value' });

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(Error);

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow(Error);

// Mock functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(2);
```

---

## When to Ask for Help

- Test is flaky (passes/fails randomly)
- Cannot mock external dependency properly
- Performance testing strategy
- E2E testing setup
- CI/CD integration issues
- Coverage goals not met despite testing
