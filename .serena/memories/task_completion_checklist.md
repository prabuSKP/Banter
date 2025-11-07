# Banter - Task Completion Checklist

## When a Development Task is Completed

Follow this checklist to ensure code quality and proper integration:

### 1. Code Quality Checks

#### Type Checking
```bash
# Backend
cd backend
npx tsc --noEmit

# Mobile
cd mobile
npx tsc --noEmit
```

#### Manual Code Review
- Check for TypeScript errors
- Ensure proper error handling (try-catch blocks)
- Verify logging statements are in place
- Confirm proper use of async/await
- Check for code consistency with existing patterns

### 2. Testing

#### Backend Testing
```bash
cd backend

# Run all tests
npm test

# Run with coverage (should maintain 70-80% coverage)
npm run test:coverage

# Run specific test suite if you added new tests
npx jest tests/integration/your-feature.test.ts
```

#### Mobile Testing
```bash
cd mobile

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

**Test Requirements:**
- Add unit tests for new utility functions
- Add integration tests for new API endpoints
- Ensure tests pass locally before committing
- Coverage should not decrease
- Test both success and error cases

### 3. Database Changes

If you modified `prisma/schema.prisma`:

```bash
cd backend

# Create migration
npx prisma migrate dev --name describe_your_changes

# Regenerate Prisma client
npx prisma generate

# Verify migration worked
npx prisma studio
```

### 4. Environment Variables

If you added new environment variables:

1. **Update `.env.example`** with new variables and descriptions
2. **Document in README** or relevant docs
3. **Update validation** in `backend/src/config/env.ts` if backend
4. **Notify team** if this requires configuration changes

### 5. API Changes

If you added/modified API endpoints:

1. **Test endpoints** with curl or Postman:
   ```bash
   curl http://localhost:5000/api/v1/your-endpoint
   ```

2. **Update documentation** (backend/README.md or relevant API docs)

3. **Verify authentication** if endpoint is protected

4. **Check rate limiting** behavior

5. **Update mobile service** if mobile app needs to call this endpoint

### 6. Mobile Changes

If you modified mobile screens or components:

1. **Test on Expo Go** (real device preferred)
   ```bash
   cd mobile
   npm start
   # Scan QR code with Expo Go app
   ```

2. **Test on both platforms** (iOS and Android if possible)

3. **Verify navigation** works correctly

4. **Check error states** and loading states

5. **Verify API integration** with backend

### 7. Real-time Features (Socket.IO)

If you added/modified Socket.IO events:

1. **Update socket handlers** in both backend and mobile
2. **Test real-time updates** with multiple clients
3. **Document events** in relevant documentation
4. **Verify authentication** for socket connections

### 8. Local Testing

#### Backend Health Check
```bash
# Start backend
cd backend
npm run dev

# Check health endpoint
curl http://localhost:5000/health
```

#### Full Stack Testing
1. Start backend in one terminal
2. Start mobile in another terminal
3. Test the complete user flow
4. Verify data flows correctly between frontend and backend

### 9. Documentation

Update relevant documentation:

- **CODE COMMENTS**: Add/update inline comments for complex logic
- **README files**: Update if you changed setup/commands
- **API documentation**: Update if you changed endpoints
- **DEVELOPMENT_STATUS.md**: Update progress if completing a major feature
- **Memory files**: Update if architecture or patterns changed significantly

### 10. Git Workflow

#### Before Committing
```bash
# Check status
git status

# Review your changes
git diff

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: describe what you did"
```

#### Commit Message Conventions
Use conventional commit format:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks

### 11. Code Review Checklist

Before submitting for review (or self-review):

- [ ] Code follows existing patterns and conventions
- [ ] TypeScript types are properly defined
- [ ] Error handling is comprehensive
- [ ] Logging is appropriate (info for important events, error for failures)
- [ ] No console.log statements (use logger instead)
- [ ] No hardcoded values (use env vars or constants)
- [ ] No sensitive data in code or logs
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No commented-out code (remove or document why)
- [ ] Imports are organized properly
- [ ] No TypeScript `any` types (unless absolutely necessary)

### 12. Performance Considerations

- [ ] Database queries are optimized (use indexes, pagination)
- [ ] No N+1 query problems
- [ ] Redis caching used where appropriate
- [ ] Large datasets are paginated
- [ ] File uploads have size limits
- [ ] API responses are not too large

### 13. Security Checklist

- [ ] Input validation is implemented (Zod schemas)
- [ ] Authentication is required where needed
- [ ] Authorization checks are in place
- [ ] No SQL injection vulnerabilities (Prisma handles this)
- [ ] No XSS vulnerabilities
- [ ] Sensitive data is not logged
- [ ] Rate limiting is applied
- [ ] CORS is properly configured

### 14. Special Cases

#### Adding New Dependencies
```bash
# Backend
cd backend
npm install package-name

# Mobile
cd mobile
npm install --legacy-peer-deps package-name
```

**After installing:**
- Document why the dependency is needed
- Check license compatibility
- Verify bundle size impact (especially mobile)

#### Database Schema Changes
```bash
# Create migration
cd backend
npx prisma migrate dev --name your_migration_name

# In production (when ready)
npx prisma migrate deploy
```

#### Firebase Configuration Changes
- Update Firebase console settings
- Regenerate config files if needed (google-services.json, GoogleService-Info.plist)
- Update .env files with new keys

### 15. Pre-Deployment Checklist

Before deploying to staging/production:

- [ ] All tests pass
- [ ] No console errors in development
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] API endpoints tested
- [ ] Mobile app tested on physical devices
- [ ] Performance is acceptable
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Logs are appropriate (not too verbose in production)

### 16. Known Limitations

**Current State:**
- No automated linting (ESLint installed but not configured)
- No automated formatting (Prettier not configured)
- Code style maintained through manual consistency
- TypeScript strict mode provides primary code quality checks

**Recommended Future Additions:**
- Configure ESLint with rules
- Add Prettier for consistent formatting
- Set up pre-commit hooks (husky + lint-staged)
- Add E2E tests for critical paths

## Quick Reference

**Most Common Post-Development Commands:**

```bash
# Type check
npx tsc --noEmit

# Run tests
npm test

# Check coverage
npm run test:coverage

# Database migration
npx prisma migrate dev --name your_change

# Start development
npm run dev
```

Remember: Quality over speed. Take time to test thoroughly!
