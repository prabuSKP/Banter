# Banter Backend API

Backend server for Banter social networking application.

## Features

- 🔐 **Firebase Authentication** - Phone OTP verification
- 💾 **PostgreSQL Database** - Prisma ORM
- ⚡ **Redis Caching** - Fast data access
- 🔌 **Socket.IO** - Real-time communication
- 📞 **Agora Integration** - Voice/video call tokens
- 💳 **Razorpay Integration** - Payment processing
- 📦 **Azure Blob Storage** - Media file storage

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Authentication**: Firebase Admin SDK + JWT
- **File Storage**: Azure Blob Storage
- **Validation**: Zod
- **Logging**: Winston

## Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 14+
- Redis 7+
- Firebase project with Admin SDK credentials
- Agora.io App ID and Certificate
- Razorpay API keys
- Azure Storage Account

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:

   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `REDIS_HOST`, `REDIS_PORT` - Redis connection
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` - JWT signing keys
   - `FIREBASE_*` - Firebase Admin SDK credentials
   - `AGORA_*` - Agora.io credentials
   - `RAZORPAY_*` - Razorpay API keys
   - `AZURE_STORAGE_*` - Azure storage credentials

3. **Setup database**:
   ```bash
   # Run migrations
   npm run prisma:migrate

   # Generate Prisma client
   npm run prisma:generate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Project Structure

```
backend/
├── src/
│   ├── config/            # Configuration files
│   │   ├── database.ts    # Prisma setup
│   │   ├── redis.ts       # Redis setup
│   │   ├── firebase.ts    # Firebase Admin
│   │   ├── logger.ts      # Winston logger
│   │   └── env.ts         # Environment validation
│   ├── controllers/       # Request handlers
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts        # JWT authentication
│   │   ├── validation.ts  # Request validation
│   │   └── rateLimiter.ts # Rate limiting
│   ├── routes/            # API routes
│   │   ├── auth.routes.ts
│   │   └── user.routes.ts
│   ├── services/          # Business logic
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   ├── socket/            # Socket.IO handlers
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── jwt.ts
│   │   ├── errors.ts
│   │   └── validators.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
├── prisma/
│   └── schema.prisma      # Database schema
├── logs/                  # Application logs
├── .env                   # Environment variables
├── .env.example           # Environment template
├── tsconfig.json          # TypeScript config
├── nodemon.json           # Nodemon config
└── package.json           # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login with Firebase ID token
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (authenticated)
- `DELETE /api/v1/auth/account` - Delete account (authenticated)

### User
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update profile
- `POST /api/v1/users/me/avatar` - Update avatar
- `GET /api/v1/users/search` - Search users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users/:id/block` - Block user
- `DELETE /api/v1/users/:id/block` - Unblock user
- `GET /api/v1/users/blocked` - Get blocked users

### More endpoints to be added...

## Socket.IO Events

### Client → Server
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `message:sent` - Message sent
- `message:read` - Messages marked as read
- `call:initiate` - Initiate call
- `call:accept` - Accept call
- `call:reject` - Reject call
- `call:end` - End call
- `room:join` - Join room
- `room:leave` - Leave room
- `room:speaking` - User speaking status

### Server → Client
- `user:online` - User came online
- `user:offline` - User went offline
- `typing:start` - User typing
- `typing:stop` - User stopped typing
- `message:new` - New message received
- `message:read_receipt` - Message read by recipient
- `call:incoming` - Incoming call
- `call:accepted` - Call accepted
- `call:rejected` - Call rejected
- `call:ended` - Call ended
- `call:error` - Call error
- `room:user_joined` - User joined room
- `room:user_left` - User left room
- `room:user_speaking` - User speaking in room

## Database Schema

See `prisma/schema.prisma` for the complete schema.

**Main Models**:
- `User` - User accounts
- `FriendRequest` - Friend requests
- `Friendship` - Friend relationships
- `ChatRoom` - Group chat rooms
- `ChatRoomMember` - Room memberships
- `Message` - Chat messages
- `CallLog` - Call history
- `Transaction` - Payment transactions
- `Subscription` - Premium subscriptions
- `BlockedUser` - Blocked users
- `Report` - User reports
- `Notification` - Push notifications
- `UserActivity` - Analytics

## Authentication Flow

1. Client sends phone number to Firebase
2. Firebase sends OTP to user
3. User enters OTP, Firebase verifies
4. Client gets Firebase ID token
5. Client sends ID token to backend `/api/v1/auth/login`
6. Backend verifies token with Firebase Admin SDK
7. Backend creates/updates user in database
8. Backend returns JWT access + refresh tokens
9. Client uses JWT for subsequent requests

## Redis Caching

Cache keys:
- `user:{userId}` - User profiles (TTL: 1 hour)
- `rate_limit:{ip}` - Rate limiting
- More to be added...

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "stack": "Stack trace (development only)"
}
```

Custom error classes:
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `ValidationError` (422)
- `InternalServerError` (500)

## Logging

Logs are stored in `logs/` directory:
- `error.log` - Error level logs
- `combined.log` - All logs

Log levels: `error`, `warn`, `info`, `debug`

## Rate Limiting

Default limits:
- General: 100 requests per 15 minutes
- Auth endpoints: 5 requests per minute

## Deployment

### Build
```bash
npm run build
```

### Start Production
```bash
npm start
```

### Environment Variables
Ensure all production credentials are set in `.env`:
- Use strong JWT secrets (32+ characters)
- Configure production database
- Set up Redis TLS connection
- Configure Azure Storage
- Set NODE_ENV=production

## Monitoring

The server includes:
- Health check endpoint: `GET /health`
- Winston logging to files and console
- Graceful shutdown handling
- Error tracking

## Security

- JWT-based authentication
- Rate limiting on all endpoints
- Request validation with Zod
- CORS configured for mobile app
- Environment variable validation
- SQL injection protection (Prisma)

## License

Private - All rights reserved
