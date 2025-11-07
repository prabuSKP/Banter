# Banter - Code Style and Conventions

## TypeScript Configuration

### Backend
- **Target**: ES2020
- **Module**: CommonJS
- **Strict Mode**: Enabled
- **Notable Settings**:
  - `esModuleInterop: true`
  - `skipLibCheck: true`
  - `forceConsistentCasingInFileNames: true`
  - `resolveJsonModule: true`

### Mobile
- Extends `expo/tsconfig.base`
- **Strict Mode**: Enabled

## Naming Conventions

### Files and Directories
- **Backend**: `kebab-case.ts` for all files
  - Examples: `auth.controller.ts`, `user.service.ts`, `auth.routes.ts`
- **Mobile**: Mix of `kebab-case` and `camelCase`
  - Screens: lowercase (e.g., `home.tsx`, `phone.tsx`)
  - Components: PascalCase (e.g., `RateHostDialog.tsx`)
- **Special Files**: `_layout.tsx` for Expo Router layouts

### Code Naming
- **Classes**: PascalCase (e.g., `AuthController`, `AuthService`)
- **Functions/Methods**: camelCase (e.g., `verifyAndLogin`, `refreshToken`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `EARNING_RATES`, `WITHDRAWAL_MIN_AMOUNT`)
- **Interfaces/Types**: PascalCase (e.g., `User`, `CallLog`)
- **Variables**: camelCase (e.g., `userId`, `phoneNumber`)

## Code Organization Patterns

### Backend Controllers
- Class-based with methods for each endpoint
- Methods typically async and return responses
- Pattern:
  ```typescript
  export class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
      // Implementation
    }
  }
  export default new AuthController();
  ```

### Backend Services
- Class-based with business logic methods
- Export singleton instance: `export default new ServiceName();`
- Pattern:
  ```typescript
  export class AuthService {
    async verifyAndLogin(firebaseIdToken: string) {
      // Business logic
    }
  }
  export default new AuthService();
  ```

### Imports Organization
- Node.js built-ins first
- Third-party packages
- Local imports (config, utils, etc.)
- Example from `server.ts`:
  ```typescript
  import http from 'http';
  import app from './app';
  import env from './config/env';
  import logger from './config/logger';
  ```

### Error Handling
- Custom error classes (e.g., `UnauthorizedError`, `BadRequestError`)
- Try-catch blocks with logger
- Centralized error handler in `app.ts`

## Comments and Documentation

### File Headers
- Files include descriptive comments at the top
- Example: `// backend/src/server.ts`

### Section Comments
- Major sections marked with visual separators:
  ```typescript
  // ==================== SERVER STARTUP ====================
  ```

### Code Comments
- Inline comments for complex logic
- JSDoc-style comments for public APIs (where applicable)

## Response Format

### Backend API Responses
Standard JSON response format:
```typescript
// Success
{
  success: true,
  data: { ... },
  message?: string
}

// Error
{
  success: false,
  message: string,
  stack?: string // Only in development
}
```

## Database Conventions

### Prisma Schema
- Models in PascalCase (e.g., `User`, `CallLog`)
- Fields in camelCase (e.g., `phoneNumber`, `firebaseUid`)
- Relations explicitly defined
- Default values specified where appropriate
- Timestamps: `createdAt`, `updatedAt`

## Environment Variables

### Naming
- UPPER_SNAKE_CASE for all environment variables
- Examples: `DATABASE_URL`, `JWT_SECRET`, `AGORA_APP_ID`

### Organization in .env
- Grouped by category with comments:
  ```
  # Application
  NODE_ENV=development
  
  # Database
  DATABASE_URL=...
  
  # JWT Authentication
  JWT_SECRET=...
  ```

## Testing Conventions

### Test File Naming
- `*.test.ts` suffix
- Mirror source structure: `auth.service.ts` → `auth.service.test.ts`

### Test Structure
- Describe blocks for grouping
- Nested describes for methods
- Clear test names with "should" pattern:
  ```typescript
  describe('AuthService', () => {
    describe('verifyAndLogin', () => {
      it('should create new user on first login', async () => {
        // Test
      });
    });
  });
  ```

## Logging

### Winston Logger
- Structured logging with levels: debug, info, warn, error
- Pattern: `logger.info('Message:', data)`
- Used throughout application for debugging and monitoring

## Git Conventions

### Branch Strategy
- Feature branches (implied from monorepo structure)
- Main/master branch for stable code

### Commit Messages
- Not explicitly defined, follow conventional commits pattern suggested

## Windows-Specific Considerations

### Path Separators
- Code uses forward slashes `/` for cross-platform compatibility
- System returns backslashes on Windows (e.g., `backend\\src\\`)

### Commands
- Standard npm scripts work on Windows
- Use `findstr` instead of `grep` on Windows
- Use `dir` instead of `ls` on Windows (when needed)

## No Explicit Linting/Formatting

### Current State
- ESLint packages installed but no `.eslintrc` file found
- No Prettier configuration
- Code style maintained through manual consistency
- TypeScript strict mode provides type safety

### If Adding Linting
Would need to create:
- `.eslintrc.js` or `.eslintrc.json` in backend and mobile
- Possibly `.prettierrc` for formatting
- Add lint scripts to package.json

## Best Practices Observed

1. **Separation of Concerns**: Clear MVC architecture
2. **Type Safety**: Full TypeScript with strict mode
3. **Error Handling**: Comprehensive try-catch with logging
4. **Security**: JWT authentication, rate limiting, input validation
5. **Scalability**: Redis caching, database indexing, pagination
6. **Testing**: Unit and integration tests with good coverage goals (70-80%)
7. **Documentation**: Extensive markdown documentation in repository
8. **Configuration**: Environment-based configuration with validation
