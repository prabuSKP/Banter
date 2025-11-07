# Testing Guide - Banter Application

## 🧪 Testing Strategy

### Test Pyramid
1. **Unit Tests (60%)** - Individual functions and utilities
2. **Integration Tests (30%)** - API endpoints and services
3. **E2E Tests (10%)** - Full user flows (planned)

### Coverage Goals
- **Minimum**: 70% code coverage
- **Target**: 80% code coverage
- **Critical paths**: 100% coverage (auth, payments)

## 🛠️ Setup

### Backend Testing

**Install dependencies:**
```bash
cd backend
npm install
```

**Dependencies are already in package.json:**
- `jest` - Test framework
- `ts-jest` - TypeScript support
- `supertest` - HTTP testing
- `@types/jest` - TypeScript types

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npx jest tests/integration/auth.test.ts

# Run in watch mode
npx jest --watch

# Run with verbose output
npx jest --verbose
```

## 📁 Test Structure

```
backend/tests/
├── setup.ts                    # Global test setup
├── utils/
│   └── testHelpers.ts         # Test utilities
├── unit/
│   └── utils/
│       ├── jwt.test.ts        # JWT utilities tests
│       └── validators.test.ts # Validator tests
└── integration/
    ├── auth.test.ts           # Auth API tests
    └── user.test.ts           # User API tests
```

## ✅ Existing Tests

### Unit Tests

#### JWT Utilities (`tests/unit/utils/jwt.test.ts`)
- ✅ Generate access token
- ✅ Generate refresh token
- ✅ Verify access token
- ✅ Verify refresh token
- ✅ Decode token
- ✅ Handle invalid tokens

#### Validators (`tests/unit/utils/validators.test.ts`)
- ✅ Phone number validation
- ✅ Firebase token validation
- ✅ User update validation
- ✅ Message schema validation
- ✅ Call initiation validation
- ✅ Error handling

### Integration Tests

#### Auth API (`tests/integration/auth.test.ts`)
- ✅ Login with Firebase token
- ✅ Create new user on first login
- ✅ Refresh access token
- ✅ Logout
- ✅ Delete account
- ✅ Error handling for invalid tokens
- ✅ Validation errors

#### User API (`tests/integration/user.test.ts`)
- ✅ Get current user profile
- ✅ Update user profile
- ✅ Update avatar
- ✅ Search users
- ✅ Get user by ID
- ✅ Block/unblock users
- ✅ Get blocked users
- ✅ Authentication checks
- ✅ Validation errors

## 📝 Writing New Tests

### Unit Test Template

```typescript
// tests/unit/services/example.test.ts
import { exampleFunction } from '../../../src/services/example';

describe('Example Service', () => {
  describe('exampleFunction', () => {
    it('should return expected result', () => {
      const result = exampleFunction('input');
      expect(result).toBe('expected');
    });

    it('should throw error for invalid input', () => {
      expect(() => exampleFunction('')).toThrow();
    });
  });
});
```

### Integration Test Template

```typescript
// tests/integration/example.test.ts
import request from 'supertest';
import app from '../../src/app';
import { generateTestToken } from '../utils/testHelpers';
import prisma from '../../src/config/database';

describe('Example API', () => {
  const authToken = generateTestToken();

  describe('GET /api/v1/example', () => {
    it('should return data', async () => {
      jest.spyOn(prisma.model, 'findMany').mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/example')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
```

## 🔧 Test Utilities

### Test Helpers (`tests/utils/testHelpers.ts`)

**Available utilities:**

```typescript
// Generate test tokens
const token = generateTestToken(userId);
const refreshToken = generateTestRefreshToken(userId);

// Mock user data
const user = mockUser;
const randomUser = generateRandomUser();

// Mock Firebase token
const firebaseToken = mockFirebaseIdToken;
const decodedToken = mockDecodedFirebaseToken;

// Mock Agora/Razorpay
const agoraToken = mockAgoraToken;
const razorpayOrder = mockRazorpayOrder;

// Utilities
const cleaned = cleanPhoneNumber('+91 98765 43210');
await wait(1000); // Wait 1 second
```

## 🎭 Mocking

### Mocked Services (in `setup.ts`)

```typescript
// Prisma is mocked
jest.mock('../src/config/database');

// Redis is mocked
jest.mock('../src/config/redis');

// Firebase Admin is mocked
jest.mock('firebase-admin');

// Logger is mocked
jest.mock('../src/config/logger');
```

### Using Mocks in Tests

```typescript
import prisma from '../../src/config/database';
import admin from 'firebase-admin';

// Mock Prisma method
jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

// Mock Firebase method
const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
mockVerifyIdToken.mockResolvedValue(mockDecodedFirebaseToken);

// Clear mocks between tests (automatic in setup.ts)
jest.clearAllMocks();
```

## 📊 Coverage Reports

### Generate Coverage

```bash
npm run test:coverage
```

**Output locations:**
- Console: Summary in terminal
- HTML: `coverage/lcov-report/index.html`
- LCOV: `coverage/lcov.info`

### View HTML Report

```bash
# Windows
start coverage/lcov-report/index.html

# Mac
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html
```

## 🚦 CI/CD Integration

### GitHub Actions (Example)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd backend && npm ci
      - run: cd backend && npm test
      - run: cd backend && npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
```

## 🔍 Debugging Tests

### Run Single Test

```bash
# Run specific test file
npx jest tests/integration/auth.test.ts

# Run specific test suite
npx jest -t "Auth API"

# Run specific test case
npx jest -t "should login existing user"
```

### Debug Mode

```bash
# Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# VS Code launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/backend/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

## 📋 Testing Checklist

### Before Committing
- [ ] All tests pass locally
- [ ] No test skipped with `.skip()`
- [ ] New features have tests
- [ ] Coverage doesn't decrease
- [ ] No console errors/warnings

### For New Features
- [ ] Unit tests for utilities/helpers
- [ ] Integration tests for API endpoints
- [ ] Test success cases
- [ ] Test error cases
- [ ] Test edge cases
- [ ] Test authentication/authorization
- [ ] Test input validation

### For Bug Fixes
- [ ] Add test that reproduces the bug
- [ ] Verify test fails before fix
- [ ] Verify test passes after fix
- [ ] Add regression tests

## 🎯 Testing Priorities

### High Priority (Must Test)
1. Authentication flows
2. Payment processing
3. Data validation
4. Security checks
5. Critical user paths

### Medium Priority (Should Test)
1. CRUD operations
2. Search functionality
3. Pagination
4. File uploads
5. Real-time events

### Low Priority (Nice to Test)
1. Formatting functions
2. Helper utilities
3. UI components
4. Analytics tracking

## 📚 Best Practices

### DO ✅
- Write descriptive test names
- Test one thing per test
- Use meaningful assertions
- Mock external dependencies
- Clean up after tests
- Use test helpers
- Follow AAA pattern (Arrange, Act, Assert)

### DON'T ❌
- Test implementation details
- Share state between tests
- Use real database in tests
- Skip error cases
- Write flaky tests
- Use magic numbers
- Leave `.only()` or `.skip()` in code

## 🐛 Common Issues

### Issue: Tests timeout
**Solution:** Increase timeout in jest.config.js or specific test
```typescript
jest.setTimeout(10000); // 10 seconds
```

### Issue: Mock not working
**Solution:** Ensure mock is defined before import
```typescript
jest.mock('../src/service');
import service from '../src/service'; // After mock
```

### Issue: Database errors
**Solution:** Check Prisma mocks in setup.ts

### Issue: Redis connection errors
**Solution:** Redis is mocked, check mock setup

## 📈 Next Steps

### Planned Tests
- [ ] Friends API integration tests
- [ ] Messages API integration tests
- [ ] Calls API integration tests
- [ ] Rooms API integration tests (when implemented)
- [ ] Payments API integration tests (when implemented)
- [ ] Socket.IO event tests
- [ ] Performance tests
- [ ] Load tests

### Mobile Testing (Future)
- [ ] Set up Jest for React Native
- [ ] Component tests with React Testing Library
- [ ] E2E tests with Detox
- [ ] Snapshot tests for UI
- [ ] Integration tests for services

## 🔗 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [TypeScript Jest Setup](https://kulshekhar.github.io/ts-jest/)

---

**Happy Testing! 🎉**
