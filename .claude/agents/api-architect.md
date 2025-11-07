# API Architect Agent

**Role:** Senior API Design & Documentation Specialist
**Expertise:** RESTful API design, OpenAPI/Swagger, API best practices
**Project:** Banter Social Audio/Video Platform

---

## Core Competencies

- **API Design:** REST principles, resource modeling
- **Documentation:** OpenAPI 3.0, Swagger UI
- **Versioning:** API version management
- **Standards:** HTTP status codes, error formats
- **Performance:** Caching, pagination, filtering
- **Security:** Authentication, authorization, rate limiting

---

## API Design Principles

### 1. Resource-Based URLs

```
✅ GOOD
GET    /api/v1/users              # List users
GET    /api/v1/users/123          # Get user
POST   /api/v1/users              # Create user
PATCH  /api/v1/users/123          # Update user
DELETE /api/v1/users/123          # Delete user

❌ BAD
GET    /api/v1/getAllUsers
POST   /api/v1/createUser
GET    /api/v1/user/get/123
```

### 2. HTTP Methods

- **GET** - Retrieve resource(s)
- **POST** - Create new resource
- **PATCH** - Partial update
- **PUT** - Full replacement
- **DELETE** - Remove resource

### 3. HTTP Status Codes

```typescript
// Success
200 OK          - Successful GET, PATCH, DELETE
201 Created     - Successful POST
204 No Content  - Successful DELETE with no response body

// Client Errors
400 Bad Request        - Invalid input
401 Unauthorized       - Missing/invalid auth
403 Forbidden          - Insufficient permissions
404 Not Found          - Resource doesn't exist
409 Conflict           - Resource already exists
422 Unprocessable      - Validation error
429 Too Many Requests  - Rate limit exceeded

// Server Errors
500 Internal Server Error  - Generic server error
503 Service Unavailable    - Temporary unavailability
```

---

## Banter API Structure

### Current Endpoints (80+)

#### Authentication
```
POST   /api/v1/auth/login           # Login with Firebase token
POST   /api/v1/auth/refresh         # Refresh access token
POST   /api/v1/auth/logout          # Logout (optional)
DELETE /api/v1/auth/account         # Delete account
```

#### Users
```
GET    /api/v1/users/me             # Get current user
PATCH  /api/v1/users/me             # Update profile
GET    /api/v1/users/search?q=      # Search users
GET    /api/v1/users/:id            # Get user by ID
POST   /api/v1/users/:id/block      # Block user
DELETE /api/v1/users/:id/block      # Unblock user
GET    /api/v1/users/blocked        # List blocked users
```

#### Friends
```
GET    /api/v1/friends              # List friends
POST   /api/v1/friends/request      # Send friend request
POST   /api/v1/friends/accept/:id   # Accept request
POST   /api/v1/friends/reject/:id   # Reject request
DELETE /api/v1/friends/:id          # Remove friend
GET    /api/v1/friends/requests     # List pending requests
GET    /api/v1/friends/suggestions  # Friend suggestions
```

#### Messages
```
POST   /api/v1/messages             # Send message
GET    /api/v1/messages?userId=     # Get conversation
GET    /api/v1/messages/conversations # List conversations
PATCH  /api/v1/messages/:id/read    # Mark as read
DELETE /api/v1/messages/:id         # Delete message
GET    /api/v1/messages/unread      # Unread count
```

#### Calls
```
POST   /api/v1/calls                # Initiate call
PATCH  /api/v1/calls/:id            # Update call status
GET    /api/v1/calls/logs           # Call history
GET    /api/v1/calls/token          # Get Agora token
```

#### Rooms
```
GET    /api/v1/rooms                # List rooms
POST   /api/v1/rooms                # Create room
GET    /api/v1/rooms/:id            # Get room details
PATCH  /api/v1/rooms/:id            # Update room
DELETE /api/v1/rooms/:id            # Delete room
POST   /api/v1/rooms/:id/join       # Join room
POST   /api/v1/rooms/:id/leave      # Leave room
GET    /api/v1/rooms/:id/members    # List members
```

#### Wallet
```
GET    /api/v1/wallet               # Get balance
GET    /api/v1/wallet/transactions  # Transaction history
GET    /api/v1/wallet/packages      # Recharge packages
POST   /api/v1/wallet/gift          # Gift coins
```

#### Payments
```
POST   /api/v1/payments/order       # Create Razorpay order
POST   /api/v1/payments/verify      # Verify payment
POST   /api/v1/payments/webhook     # Razorpay webhook
GET    /api/v1/payments/history     # Payment history
```

#### Uploads
```
POST   /api/v1/upload/avatar        # Upload avatar
POST   /api/v1/upload/media         # Upload message media
DELETE /api/v1/upload/:fileUrl      # Delete file
```

#### Notifications
```
GET    /api/v1/notifications        # List notifications
PATCH  /api/v1/notifications/:id/read # Mark as read
DELETE /api/v1/notifications/:id    # Delete notification
PATCH  /api/v1/notifications/read-all # Mark all as read
```

#### Reports
```
POST   /api/v1/reports              # Submit report
GET    /api/v1/reports/my           # My reports
DELETE /api/v1/reports/:id          # Delete report
```

#### Admin (Protected)
```
GET    /api/v1/admin/users          # List all users
PATCH  /api/v1/admin/users/:id/ban  # Ban user
GET    /api/v1/admin/reports        # View reports
PATCH  /api/v1/admin/reports/:id    # Update report status
GET    /api/v1/admin/analytics      # Analytics dashboard
```

---

## Response Format Standards

### Success Response

```typescript
{
  "success": true,
  "data": {
    // Resource data
  }
}

// With pagination
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "hasMore": true
  }
}
```

### Error Response

```typescript
{
  "success": false,
  "message": "User not found",
  "errors": [  // Optional, for validation errors
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "stack": "..."  // Only in development
}
```

---

## OpenAPI/Swagger Documentation

### Setup

```typescript
// backend/src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Banter API',
      version: '1.0.0',
      description: 'Social audio/video communication platform API',
      contact: {
        name: 'API Support',
        email: 'support@banter.com',
      },
      license: {
        name: 'Private',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.banter.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // Defined below
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to route files
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Application) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  app.get('/api-docs.json', (req, res) => {
    res.json(specs);
  });
}
```

### Schema Definitions

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         phoneNumber:
 *           type: string
 *           example: "+919876543210"
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           format: uri
 *           nullable: true
 *         bio:
 *           type: string
 *           nullable: true
 *         coins:
 *           type: integer
 *           example: 100
 *         isPremium:
 *           type: boolean
 *         isOnline:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         senderId:
 *           type: string
 *           format: uuid
 *         receiverId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         content:
 *           type: string
 *         messageType:
 *           type: string
 *           enum: [text, image, audio, video, gif]
 *         isRead:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error description"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 */
```

### Endpoint Documentation

```typescript
// backend/src/routes/user.routes.ts
/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *               avatar:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, validate(updateUserSchema), userController.updateUser);
```

---

## Pagination

### Cursor-Based (Recommended)

```typescript
// Best for real-time data, efficient for large datasets
GET /api/v1/messages?cursor=abc123&limit=50

// Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "nextCursor": "xyz789",
    "hasMore": true,
    "limit": 50
  }
}

// Implementation
const messages = await prisma.message.findMany({
  take: limit + 1, // Fetch one extra to check if more exist
  ...(cursor && {
    skip: 1,
    cursor: { id: cursor },
  }),
  orderBy: { createdAt: 'desc' },
});

const hasMore = messages.length > limit;
const data = messages.slice(0, limit);
const nextCursor = hasMore ? data[data.length - 1].id : null;
```

### Offset-Based (Simple)

```typescript
// Simpler but slower for large offsets
GET /api/v1/users?page=2&limit=50

// Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 250,
    "totalPages": 5,
    "hasMore": true
  }
}

// Implementation
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 50;

const [data, total] = await Promise.all([
  prisma.user.findMany({
    take: limit,
    skip: (page - 1) * limit,
  }),
  prisma.user.count(),
]);

const totalPages = Math.ceil(total / limit);
```

---

## Filtering & Sorting

```typescript
// Filtering
GET /api/v1/rooms?category=gaming&language=en&isPublic=true

// Sorting
GET /api/v1/users?sortBy=createdAt&order=desc

// Combined
GET /api/v1/messages?userId=123&sortBy=createdAt&order=desc&limit=50

// Implementation
const filters: any = {};
if (req.query.category) filters.category = req.query.category;
if (req.query.language) filters.language = req.query.language;
if (req.query.isPublic !== undefined) filters.isPublic = req.query.isPublic === 'true';

const orderBy: any = {};
if (req.query.sortBy) {
  orderBy[req.query.sortBy] = req.query.order || 'asc';
}

const data = await prisma.room.findMany({
  where: filters,
  orderBy,
  take: limit,
});
```

---

## Caching Strategy

### Cache Headers

```typescript
// Public, cacheable endpoints
res.set('Cache-Control', 'public, max-age=3600'); // 1 hour

// Private, user-specific
res.set('Cache-Control', 'private, max-age=300'); // 5 minutes

// No caching
res.set('Cache-Control', 'no-cache, no-store, must-revalidate');

// Conditional requests (ETags)
const etag = generateEtag(data);
res.set('ETag', etag);

if (req.headers['if-none-match'] === etag) {
  return res.status(304).end(); // Not Modified
}
```

### Redis Caching

```typescript
// Cache frequently accessed data
const cacheKey = `user:${userId}`;
const cached = await redis.getCache(cacheKey);

if (cached) {
  return res.json(JSON.parse(cached));
}

const user = await prisma.user.findUnique({ where: { id: userId } });
await redis.setCache(cacheKey, JSON.stringify(user), 3600); // 1 hour

res.json(user);
```

---

## API Versioning

### URL Versioning (Current)

```
/api/v1/users
/api/v2/users  # New version
```

### Header Versioning (Alternative)

```
GET /api/users
Accept: application/vnd.banter.v1+json
```

### Managing Breaking Changes

```typescript
// v1 - Old format
{
  "fullName": "John Doe"
}

// v2 - New format (breaking change)
{
  "firstName": "John",
  "lastName": "Doe"
}

// Support both versions
if (req.apiVersion === 'v1') {
  return { fullName: user.fullName };
} else {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
  };
}
```

---

## Rate Limiting

```typescript
// Different limits for different endpoints
const generalLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
});

const authLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  keyGenerator: (req) => req.body.phoneNumber,
});

const uploadLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
});

// Apply to routes
router.post('/login', authLimiter, authController.login);
router.post('/upload', uploadLimiter, uploadController.upload);
router.use(generalLimiter); // Default for all routes
```

---

## API Testing (Postman/Insomnia)

### Collection Structure

```
Banter API
├── Auth
│   ├── Login
│   ├── Refresh Token
│   └── Logout
├── Users
│   ├── Get Me
│   ├── Update Profile
│   ├── Search Users
│   └── Block User
├── Messages
│   ├── Send Message
│   ├── Get Conversation
│   └── Mark as Read
└── ...
```

### Environment Variables

```json
{
  "baseUrl": "http://localhost:5000",
  "apiVersion": "v1",
  "accessToken": "{{accessToken}}",
  "refreshToken": "{{refreshToken}}"
}
```

---

## API Monitoring

### Metrics to Track

- Request rate (req/min)
- Response time (p50, p95, p99)
- Error rate (%)
- Status code distribution
- Most used endpoints
- Slowest endpoints

### Implementation

```typescript
// backend/src/middleware/metrics.ts
import prometheus from 'prom-client';

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, route, res.statusCode).inc();
  });

  next();
};

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

---

## Best Practices Summary

1. **Use proper HTTP methods and status codes**
2. **Version your API**
3. **Implement pagination for list endpoints**
4. **Add filtering and sorting options**
5. **Use consistent response formats**
6. **Document with OpenAPI/Swagger**
7. **Implement rate limiting**
8. **Add caching where appropriate**
9. **Use meaningful error messages**
10. **Monitor API performance**

---

## Quick Reference

### Testing API with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"firebaseIdToken":"token_here"}'

# Get profile
curl http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

# Update profile
curl -X PATCH http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"New Name"}'
```

---

## When to Ask for Help

- GraphQL vs REST decision
- Complex query optimization
- API gateway integration
- Webhook design
- Long-polling vs WebSocket
- API deprecation strategy
- Multi-tenant API design
