# Banter - Social Networking App

## 📱 Project Overview

Banter is a **social networking mobile application** designed for real-time communication through voice, video, and text. Similar to apps like Dostt and FRND, it enables users to connect with friends through various communication channels.

### Key Features
- 📞 Voice & video calls (Agora.io)
- 💬 Real-time messaging
- 🎤 Public voice chat rooms
- 👥 Friend system
- 💰 In-app payments (Razorpay)
- 🔐 Phone OTP authentication (Firebase)

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js 20 LTS + Express.js + TypeScript
- PostgreSQL (Prisma ORM)
- Redis (caching)
- Socket.IO (real-time)
- Firebase Admin SDK (authentication)
- Agora.io (voice/video)
- Azure Blob Storage (media)
- Razorpay (payments)

**Mobile:**
- React Native + Expo
- Expo Router (navigation)
- React Native Paper (UI)
- Zustand (state management)
- Firebase Auth
- Agora React Native SDK
- Socket.IO client

**Infrastructure:**
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure App Service
- Azure Blob Storage
- Region: Central India

## 📂 Project Structure

```
w:\Application\Banter/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── database.ts    # Prisma client
│   │   │   ├── redis.ts       # Redis client
│   │   │   ├── firebase.ts    # Firebase Admin
│   │   │   ├── logger.ts      # Winston logger
│   │   │   └── env.ts         # Environment validation
│   │   ├── controllers/       # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── friend.controller.ts
│   │   │   ├── message.controller.ts
│   │   │   └── call.controller.ts
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.ts        # JWT authentication
│   │   │   ├── validation.ts  # Request validation
│   │   │   └── rateLimiter.ts # Rate limiting
│   │   ├── routes/            # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── friend.routes.ts
│   │   │   ├── message.routes.ts
│   │   │   └── call.routes.ts
│   │   ├── services/          # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── friend.service.ts
│   │   │   ├── message.service.ts
│   │   │   └── agora.service.ts
│   │   ├── socket/            # Socket.IO handlers
│   │   │   └── index.ts
│   │   ├── utils/             # Utilities
│   │   ├── types/             # TypeScript types
│   │   ├── app.ts             # Express app
│   │   └── server.ts          # Entry point
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── tests/                 # Jest tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── setup.ts
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── README.md
│
├── mobile/                     # React Native app
│   ├── app/                   # Expo Router screens
│   │   ├── (auth)/           # Auth screens
│   │   │   ├── phone.tsx
│   │   │   └── verify.tsx
│   │   ├── (tabs)/           # Main tabs
│   │   │   ├── home.tsx
│   │   │   ├── friends.tsx
│   │   │   ├── messages.tsx
│   │   │   ├── rooms.tsx
│   │   │   └── profile.tsx
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── constants/        # App constants
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── firebase.ts
│   │   │   ├── socket.ts
│   │   │   └── user.ts
│   │   ├── stores/           # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utilities
│   ├── .env
│   ├── app.json
│   ├── package.json
│   └── README.md
│
├── REQUIREMENTS.md            # Full development plan
├── DEVELOPMENT_STATUS.md      # Current status
└── PROJECT_SUMMARY.md         # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login with Firebase ID token
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `DELETE /api/v1/auth/account` - Delete account

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update profile
- `POST /api/v1/users/me/avatar` - Update avatar
- `GET /api/v1/users/search` - Search users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users/:id/block` - Block user
- `DELETE /api/v1/users/:id/block` - Unblock user
- `GET /api/v1/users/blocked` - Get blocked users

### Friends
- `GET /api/v1/friends` - Get friends list
- `POST /api/v1/friends/request` - Send friend request
- `GET /api/v1/friends/requests` - Get friend requests
- `POST /api/v1/friends/requests/:id/accept` - Accept request
- `POST /api/v1/friends/requests/:id/reject` - Reject request
- `DELETE /api/v1/friends/:id` - Remove friend

### Messages
- `POST /api/v1/messages` - Send message
- `GET /api/v1/messages/conversations` - Get recent conversations
- `GET /api/v1/messages/conversation/:userId` - Get conversation
- `GET /api/v1/messages/room/:roomId` - Get room messages
- `POST /api/v1/messages/read` - Mark as read
- `DELETE /api/v1/messages/:id` - Delete message
- `GET /api/v1/messages/unread/count` - Get unread count

### Calls
- `POST /api/v1/calls/initiate` - Initiate call
- `POST /api/v1/calls/:id/status` - Update call status
- `GET /api/v1/calls/logs` - Get call history
- `GET /api/v1/calls/agora-token` - Get Agora token

## 🔄 Real-time Events (Socket.IO)

### Client → Server
- `typing:start` / `typing:stop` - Typing indicators
- `message:sent` - Message sent
- `message:read` - Messages read
- `call:initiate` / `call:accept` / `call:reject` / `call:end` - Call signaling
- `room:join` / `room:leave` / `room:speaking` - Room events

### Server → Client
- `user:online` / `user:offline` - Presence
- `message:new` / `message:read_receipt` - Messages
- `call:incoming` / `call:accepted` / `call:rejected` / `call:ended` - Calls
- `room:user_joined` / `room:user_left` / `room:user_speaking` - Rooms

## 💾 Database Schema

**12 Models:**
1. **User** - User accounts with Firebase UID
2. **FriendRequest** - Friend request tracking
3. **Friendship** - Friend relationships (bidirectional)
4. **ChatRoom** - Group chat rooms
5. **ChatRoomMember** - Room memberships
6. **Message** - Text/media messages
7. **CallLog** - Call history with Agora channels
8. **Transaction** - Payment transactions
9. **Subscription** - Premium subscriptions
10. **BlockedUser** - Blocked relationships
11. **Report** - User reports
12. **Notification** - Push notifications
13. **UserActivity** - Analytics data

## 🧪 Testing

**Framework:** Jest + Supertest

**Test Coverage:**
- ✅ Unit tests for JWT utilities
- ✅ Unit tests for validators
- ✅ Integration tests for auth endpoints
- ✅ Integration tests for user endpoints
- 🚧 Friends endpoint tests (to be added)
- 🚧 Messages endpoint tests (to be added)
- 🚧 Calls endpoint tests (to be added)

**Run tests:**
```bash
cd backend
npm test
npm run test:coverage
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20 LTS
- PostgreSQL 14+
- Redis 7+
- Firebase project
- Agora.io account
- Razorpay account (for India)
- Azure account (optional for production)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Setup database:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start server:**
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```

### Mobile Setup

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install --legacy-peer-deps
   ```

2. **Configure environment:**
   ```bash
   # Create .env file
   EXPO_PUBLIC_API_URL=http://your-backend-url:5000
   EXPO_PUBLIC_FIREBASE_API_KEY=your_key
   EXPO_PUBLIC_AGORA_APP_ID=your_app_id
   # ... other vars
   ```

3. **Start Expo:**
   ```bash
   npm start
   ```

4. **Test on device:**
   - Install Expo Go app
   - Scan QR code
   - Ensure device and backend are on same network

## 📊 Development Progress

**Overall: ~47% Complete**

### Backend: ~60% ✅
- Core infrastructure: 100%
- Authentication: 100%
- User management: 100%
- Friends system: 100%
- Messaging: 100%
- Calls (Agora): 100%
- Socket.IO: 100%
- Testing: 50%

### Mobile: ~35% ✅
- Core setup: 100%
- Navigation: 100%
- Authentication: 100%
- Services: 80%
- UI screens: 30%

### Pending Features
- Chat rooms backend & UI
- File upload (Azure Blob)
- Razorpay payments
- Premium features
- Push notifications
- Complete UI implementation

## 🎯 Roadmap

### MVP (2-3 weeks)
- Complete chat rooms
- Complete file upload
- Complete friends UI
- Complete messaging UI
- Basic call functionality
- Deploy to Azure
- Publish to Expo

### Beta (4-6 weeks from MVP)
- Payment integration
- All UI screens
- Comprehensive testing
- Performance optimization
- App Store submission

### Production (2-3 weeks from Beta)
- Final QA
- Monitoring setup
- Marketing
- Public launch

## 💡 Key Decisions

1. **Firebase over Azure SMS** - 70% cost savings for Indian market
2. **Agora.io for RTC** - Better quality than DIY WebRTC
3. **Razorpay over Stripe** - Better UPI/Indian payment support
4. **Expo over bare React Native** - Faster development, easy testing
5. **PostgreSQL over MongoDB** - Better for relational data (friends, messages)
6. **Prisma over TypeORM** - Better TypeScript support
7. **Zustand over Redux** - Simpler state management

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Firebase Admin SDK for secure OTP verification
- Rate limiting on all endpoints (100 req/15min general, 5 req/min auth)
- Request validation with Zod
- CORS configuration
- SQL injection protection (Prisma)
- Password-less authentication (more secure)
- Friend-only messaging
- User blocking system

## 📈 Scalability Considerations

- Redis caching for frequently accessed data
- Database indexing on foreign keys and search fields
- Pagination on all list endpoints
- Message retention policy (90 days configurable)
- Socket.IO horizontal scaling ready
- Azure App Service auto-scaling
- CDN for static assets (Azure Blob)

## 💰 Cost Estimates (Indian Market, 10K Users)

**Third-party Services:**
- Firebase Auth: FREE (10K users)
- Agora.io: FREE (10K minutes/month)
- Razorpay: 2% per transaction
- **Total: ~₹500/month**

**Azure Infrastructure:**
- PostgreSQL (B1ms): ₹1,500/month
- Redis (C0): ₹1,000/month
- App Service (B1): ₹1,500/month
- Blob Storage: ₹500/month
- **Total: ~₹4,500/month**

**Grand Total: ~₹5,000/month for 10K users**

## 📝 Important Files

- `REQUIREMENTS.md` - Complete 3000+ line development plan
- `DEVELOPMENT_STATUS.md` - Current progress tracking
- `backend/README.md` - Backend API documentation
- `mobile/README.md` - Mobile app setup guide
- `backend/.env.example` - Backend environment template
- `mobile/.env` - Mobile environment config
- `backend/prisma/schema.prisma` - Database schema

## 🤝 Contributing

This is a private project. For team members:

1. Follow the architecture in REQUIREMENTS.md
2. Write tests for new features
3. Update DEVELOPMENT_STATUS.md
4. Follow TypeScript best practices
5. Use conventional commits

## 📞 Support

For development questions:
- Check REQUIREMENTS.md for specifications
- Check backend/README.md for API docs
- Check mobile/README.md for app setup

## 🏆 Credits

**Tech Stack:**
- Backend: Node.js, Express, PostgreSQL, Prisma, Redis, Socket.IO
- Mobile: React Native, Expo, Firebase, Agora, Razorpay
- Infrastructure: Microsoft Azure
- AI Assistant: Claude (Anthropic) for development guidance

---

**Status:** Active Development
**Version:** 0.5.0 (MVP in progress)
**Last Updated:** 2025-10-07
