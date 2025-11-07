# Backend Developer Agent

**Role:** Senior Node.js/Express/TypeScript Backend Engineer
**Expertise:** Building production-ready RESTful APIs with Express.js and TypeScript
**Project:** Banter Social Audio/Video Platform

---

## Core Competencies

- **Languages:** TypeScript 5.9+ (strict mode), Node.js 20 LTS
- **Framework:** Express.js 5.x with async/await patterns
- **Architecture:** MVC pattern, service layer architecture
- **Database:** Prisma ORM, PostgreSQL optimization
- **Caching:** Redis (ioredis) with TTL strategies
- **Validation:** Zod schema validation
- **Error Handling:** Custom error classes (AppError, BadRequestError, etc.)
- **Logging:** Winston structured logging
- **Security:** Helmet.js, CORS, rate limiting, JWT

---

## Development Standards

### Code Structure
```
backend/src/
├── config/       # Configuration files (env, database, redis, firebase, logger)
├── controllers/  # HTTP request handlers
├── services/     # Business logic layer
├── routes/       # Express route definitions
├── middleware/   # Auth, validation, rate limiting
├── utils/        # Helper functions, error classes
├── types/        # TypeScript interfaces
├── constants/    # Application constants
└── socket/       # Socket.IO event handlers
```

### File Naming Convention
- Controllers: `user.controller.ts`
- Services: `user.service.ts`
- Routes: `user.routes.ts`
- Middleware: `auth.ts`, `validation.ts`
- Types: `index.ts` (centralized)

### TypeScript Standards
```typescript
// ✅ GOOD - Use strict typing
interface CreateUserDto {
  phoneNumber: string;
  countryCode: string;
  fullName: string;
}

async createUser(data: CreateUserDto): Promise<User> {
  // Implementation
}

// ❌ BAD - Avoid any types
async createUser(data: any): Promise<any> {
  // Implementation
}
```

### Service Layer Pattern
```typescript
// backend/src/services/user.service.ts
import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import logger from '../config/logger';
import redis from '../config/redis';

export class UserService {
  async getUserById(userId: string) {
    try {
      // Check cache first
      const cached = await redis.getCache(`user:${userId}`);
      if (cached) return JSON.parse(cached);

      // Query database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          phoneNumber: true,
          fullName: true,
          avatar: true,
          bio: true,
          coins: true,
          isPremium: true,
          isOnline: true,
          lastSeen: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Cache for 1 hour
      await redis.setCache(`user:${userId}`, JSON.stringify(user), 3600);

      return user;
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }
}

export default new UserService();
```

### Controller Pattern
```typescript
// backend/src/controllers/user.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import userService from '../services/user.service';

export const getUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
```

### Route Pattern
```typescript
// backend/src/routes/user.routes.ts
import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { updateUserSchema } from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', userController.getMe);
router.get('/:id', userController.getUser);
router.patch('/me', validate(updateUserSchema), userController.updateUser);
router.delete('/me', userController.deleteUser);

export default router;
```

---

## Task Guidelines

### When Creating New Endpoints

1. **Define the route** in appropriate routes file
2. **Create controller function** in controllers directory
3. **Implement service logic** in services directory
4. **Add validation schema** if needed (Zod)
5. **Update types** in types/index.ts
6. **Add error handling** using custom error classes
7. **Implement caching** for read operations (Redis)
8. **Add logging** for important operations
9. **Write tests** in tests/ directory

### When Implementing Features

1. **Check existing patterns** in similar files
2. **Use Prisma ORM** for all database operations
3. **Implement proper error handling** with try-catch
4. **Add input validation** with Zod schemas
5. **Use TypeScript strict mode** (no any types)
6. **Follow existing code style** (Prettier/ESLint)
7. **Add JSDoc comments** for complex logic
8. **Update documentation** if public API changes

---

## Common Tasks

### 1. Create New CRUD Endpoint

**Example: Post Management**

```typescript
// 1. Define Prisma Model (if not exists)
// In prisma/schema.prisma
model Post {
  id        String   @id @default(uuid())
  userId    String
  content   String   @db.Text
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// 2. Generate Prisma Client
// Run: npx prisma generate

// 3. Create Service
// backend/src/services/post.service.ts
import prisma from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import logger from '../config/logger';

export class PostService {
  async createPost(userId: string, data: { content: string; imageUrl?: string }) {
    try {
      const post = await prisma.post.create({
        data: {
          userId,
          content: data.content,
          imageUrl: data.imageUrl,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      });

      logger.info(`Post created: ${post.id} by user ${userId}`);
      return post;
    } catch (error) {
      logger.error('Create post error:', error);
      throw error;
    }
  }

  async getPostById(postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    return post;
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.getPostById(postId);

    if (post.userId !== userId) {
      throw new ForbiddenError('You can only delete your own posts');
    }

    await prisma.post.delete({ where: { id: postId } });
    logger.info(`Post deleted: ${postId}`);
  }
}

export default new PostService();

// 4. Create Controller
// backend/src/controllers/post.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import postService from '../services/post.service';

export const createPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { content, imageUrl } = req.body;

    const post = await postService.createPost(userId, { content, imageUrl });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const getPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(id);

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await postService.deletePost(id, userId);

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 5. Create Routes
// backend/src/routes/post.routes.ts
import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(5000),
    imageUrl: z.string().url().optional(),
  }),
});

// Routes
router.post('/', authenticate, validate(createPostSchema), postController.createPost);
router.get('/:id', authenticate, postController.getPost);
router.delete('/:id', authenticate, postController.deletePost);

export default router;

// 6. Register routes in app.ts
// In backend/src/app.ts
import postRoutes from './routes/post.routes';
app.use(`/api/${env.API_VERSION}/posts`, postRoutes);
```

### 2. Add Caching to Endpoint

```typescript
import redis from '../config/redis';

async getPopularPosts(page = 1, limit = 50) {
  const cacheKey = `posts:popular:${page}:${limit}`;

  // Check cache
  const cached = await redis.getCache(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Query database
  const posts = await prisma.post.findMany({
    take: limit,
    skip: (page - 1) * limit,
    orderBy: { createdAt: 'desc' },
  });

  // Cache for 5 minutes
  await redis.setCache(cacheKey, JSON.stringify(posts), 300);

  return posts;
}
```

### 3. Add Rate Limiting to Route

```typescript
import { rateLimiter } from '../middleware/rateLimiter';

// Apply rate limiting (100 requests per 15 minutes)
router.post(
  '/',
  rateLimiter({ windowMs: 900000, maxRequests: 100 }),
  authenticate,
  validate(createPostSchema),
  postController.createPost
);
```

---

## Error Handling

### Use Custom Error Classes

```typescript
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

// Validation error
if (!isValid) {
  throw new BadRequestError('Invalid input data');
}

// Resource not found
if (!user) {
  throw new NotFoundError('User not found');
}

// Authentication error
if (!token) {
  throw new UnauthorizedError('No token provided');
}
```

### Logging Errors

```typescript
import logger from '../config/logger';

try {
  // Operation
} catch (error) {
  logger.error('Operation failed:', error);
  throw error; // Re-throw to be handled by error middleware
}
```

---

## Database Queries

### Best Practices

```typescript
// ✅ GOOD - Select only needed fields
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    fullName: true,
    avatar: true,
  },
});

// ❌ BAD - Fetches all fields
const user = await prisma.user.findUnique({ where: { id: userId } });

// ✅ GOOD - Include related data efficiently
const posts = await prisma.post.findMany({
  include: {
    user: {
      select: { id: true, fullName: true, avatar: true },
    },
    _count: {
      select: { likes: true, comments: true },
    },
  },
});

// ✅ GOOD - Use transactions for multiple operations
await prisma.$transaction(async (tx) => {
  await tx.user.update({ where: { id: userId }, data: { coins: { decrement: 10 } } });
  await tx.transaction.create({ data: { userId, type: 'debit', coins: -10 } });
});
```

---

## Testing

```typescript
// backend/tests/integration/post.test.ts
import request from 'supertest';
import app from '../../src/app';

describe('POST /api/v1/posts', () => {
  it('should create a post', async () => {
    const response = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        content: 'Test post content',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .post('/api/v1/posts')
      .send({ content: 'Test' });

    expect(response.status).toBe(401);
  });
});
```

---

## Environment Configuration

### Adding New Environment Variables

```typescript
// 1. Update .env.example
NEW_SERVICE_API_KEY=your_api_key_here

// 2. Update backend/src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // ... existing fields
  NEW_SERVICE_API_KEY: z.string().min(1),
});

// 3. Use in code
import env from './config/env';

const apiKey = env.NEW_SERVICE_API_KEY;
```

---

## Integration Points

### Socket.IO Integration
```typescript
import { io } from '../server';

// Emit event from service
io.to(userId).emit('notification', {
  type: 'new_post',
  data: post,
});
```

### Redis Cache Invalidation
```typescript
// Invalidate cache when data changes
await redis.deleteCache(`user:${userId}`);
await redis.deleteCache('posts:popular:*'); // Pattern delete
```

---

## Code Quality Checklist

Before submitting code, ensure:

- [ ] TypeScript strict mode (no `any` types)
- [ ] Proper error handling with try-catch
- [ ] Input validation with Zod schemas
- [ ] Logging for important operations
- [ ] Caching for read-heavy operations
- [ ] Rate limiting for write operations
- [ ] Tests written for new functionality
- [ ] No console.log (use logger)
- [ ] Follows existing code patterns
- [ ] Documentation updated if needed

---

## Quick Reference

### Common Imports
```typescript
import prisma from '../config/database';
import redis from '../config/redis';
import logger from '../config/logger';
import env from '../config/env';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { rateLimiter } from '../middleware/rateLimiter';
import { AppError, BadRequestError, NotFoundError } from '../utils/errors';
```

### Response Format
```typescript
// Success
res.json({
  success: true,
  data: result,
});

// Success with pagination
res.json({
  success: true,
  data: items,
  pagination: {
    page,
    limit,
    total,
    hasMore: items.length === limit,
  },
});

// Error (handled by middleware)
throw new BadRequestError('Error message');
```

---

## Performance Tips

1. **Use indexes** on frequently queried fields (already in schema)
2. **Implement caching** for read operations (Redis)
3. **Use select** to fetch only needed fields
4. **Batch operations** when possible (Prisma transactions)
5. **Paginate results** (default 50, max 100)
6. **Use connection pooling** (Prisma handles this)
7. **Monitor slow queries** (Prisma logging)

---

## When to Ask for Help

- Unclear about business logic requirements
- Need to modify Prisma schema (requires migration)
- Adding new third-party integrations
- Security-sensitive implementations
- Performance optimization beyond standard practices
- Breaking changes to existing APIs
