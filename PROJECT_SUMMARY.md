# Banter - Social Networking App

## 📱 Project Overview

Banter is a **social networking mobile application** designed for real-time communication through voice, video, and text. It enables users to connect with friends through various communication channels with a focus on high-quality audio and video calls.

### Key Features
- 📞 Voice & video calls (LiveKit + COTURN)
- 💬 Real-time messaging (Socket.IO)
- 🎤 Public voice chat rooms
- 👥 Friend system
- 💰 In-app payments (Razorpay)
- 🔐 Phone OTP authentication (Firebase)
- 💎 Host earnings system

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js 20 LTS + Express.js 4.x + TypeScript 5.0+
- PostgreSQL 15+ (Prisma ORM 5.x)
- Redis 7.x (caching)
- Socket.IO v4 (real-time messaging)
- Firebase Admin SDK (authentication)
- LiveKit Server SDK (WebRTC voice/video)
- COTURN (TURN/STUN server)
- Azure Blob Storage (media)
- Razorpay (payments)

**Mobile:**
- React Native 0.72+ + Expo SDK 50+
- Expo Router (file-based navigation)
- React Native Paper (UI components)
- Zustand (state management)
- Firebase Auth (phone OTP)
- LiveKit React Native SDK (@livekit/react-native-webrtc)
- Socket.IO client (real-time events)

**Infrastructure:**
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure App Service
- Azure Blob Storage
- LiveKit Server (self-hosted or cloud)
- COTURN Server (NAT traversal)
- Region: Central India

## 📂 Project Structure

```
/home/user/Banter/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── database.ts    # Prisma client
│   │   │   ├── redis.ts       # Redis client
│   │   │   ├── firebase.ts    # Firebase Admin
│   │   │   ├── livekit.ts     # LiveKit configuration
│   │   │   ├── coturn.ts      # COTURN configuration
│   │   │   ├── logger.ts      # Winston logger
│   │   │   └── env.ts         # Environment validation
│   │   ├── controllers/       # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── friend.controller.ts
│   │   │   ├── message.controller.ts
│   │   │   ├── call.controller.ts
│   │   │   └── room.controller.ts
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.ts        # JWT authentication
│   │   │   ├── validation.ts  # Request validation
│   │   │   └── rateLimiter.ts # Rate limiting
│   │   ├── routes/            # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── friend.routes.ts
│   │   │   ├── message.routes.ts
│   │   │   ├── call.routes.ts
│   │   │   └── room.routes.ts
│   │   ├── services/          # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── friend.service.ts
│   │   │   ├── message.service.ts
│   │   │   ├── call.service.ts
│   │   │   ├── room.service.ts
│   │   │   └── livekit.service.ts  # LiveKit integration
│   │   ├── socket/            # Socket.IO handlers
│   │   │   ├── index.ts
│   │   │   └── events/
│   │   │       ├── messageEvents.ts
│   │   │       ├── callEvents.ts
│   │   │       └── roomEvents.ts
│   │   ├── utils/             # Utilities
│   │   ├── types/             # TypeScript types
│   │   ├── app.ts             # Express app
│   │   └── server.ts          # Entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
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
│   │   │   ├── wallet.tsx
│   │   │   └── settings.tsx
│   │   ├── calls/            # Call screens
│   │   │   ├── incoming.tsx
│   │   │   ├── outgoing.tsx
│   │   │   └── active.tsx
│   │   └── _layout.tsx       # Root layout
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── hooks/            # Custom hooks
│   │   │   └── useLiveKit.ts # LiveKit hook
│   │   ├── services/         # API & business logic
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── calls.ts
│   │   │   ├── socket.ts
│   │   │   └── livekit.ts    # LiveKit service
│   │   ├── stores/           # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── callsStore.ts
│   │   │   ├── messagesStore.ts
│   │   │   └── roomsStore.ts
│   │   ├── constants/        # Constants and config
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   ├── assets/               # Images, fonts, sounds
│   ├── package.json
│   └── README.md
│
├── .claude/                   # Claude AI subagents
│   ├── subagents.yaml        # Main subagents config
│   ├── rtc-specialist.yaml   # LiveKit/WebRTC specialist
│   ├── backend-developer.yaml
│   ├── mobile-developer.yaml
│   └── ...                   # Other specialists
│
└── Documentation
    ├── README.md
    ├── REQUIREMENTS.md
    ├── PROJECT_SUMMARY.md (this file)
    ├── QUICK_START.md
    ├── TESTING_GUIDE.md
    ├── SECURITY_AUDIT_REPORT.md
    ├── BACKEND_VERIFICATION.md
    ├── LIVEKIT_MIGRATION.md
    └── MOBILE_MIGRATION_COMPLETE.md
```

## 🔐 Authentication & Security

### Authentication Flow
1. **Phone Number Input** - User enters phone number
2. **OTP Verification** - Firebase sends OTP via SMS
3. **Token Generation** - Backend generates JWT access/refresh tokens
4. **Authenticated Sessions** - Tokens stored securely on device

### Security Features
- JWT-based authentication
- Phone OTP verification (Firebase)
- Rate limiting on sensitive endpoints
- Input validation with Zod
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration
- Environment variable security

## 📞 Real-Time Communication

### LiveKit WebRTC Integration
- **1-on-1 Voice Calls** - High-quality audio calls
- **1-on-1 Video Calls** - HD video calls with camera controls
- **Group Voice Rooms** - Multi-user voice chat rooms
- **Automatic Reconnection** - Network resilience
- **Adaptive Bitrate** - Quality optimization
- **TURN/STUN Support** - NAT traversal with COTURN

### Socket.IO Real-Time Events
- **Messaging** - Real-time message delivery
- **Presence** - Online/offline status
- **Typing Indicators** - Live typing status
- **Call Signaling** - Call initiation and control
- **Room Events** - Join/leave notifications

## 💾 Database Schema

### Core Entities
- **User** - User profiles, authentication
- **FriendRequest** - Friend request management
- **Friendship** - Friend relationships
- **Message** - Direct and room messages
- **ChatRoom** - Voice chat rooms
- **ChatRoomMember** - Room membership
- **CallLog** - Call history and metrics
- **Transaction** - Payment transactions
- **Wallet** - User coin balance
- **HostProfile** - Host verification and earnings

## 🚀 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /login` - Phone OTP login
- `POST /refresh` - Refresh JWT token
- `POST /logout` - Logout
- `DELETE /account` - Delete account

### Users (`/api/v1/users`)
- `GET /me` - Get current user profile
- `PUT /me` - Update profile
- `POST /me/avatar` - Upload avatar
- `GET /search` - Search users
- `POST /:id/block` - Block user
- `DELETE /:id/block` - Unblock user

### Friends (`/api/v1/friends`)
- `GET /` - Get friends list
- `POST /request` - Send friend request
- `GET /requests` - Get pending requests
- `POST /requests/:id/accept` - Accept request
- `POST /requests/:id/reject` - Reject request
- `DELETE /:id` - Remove friend

### Calls (`/api/v1/calls`)
- `POST /initiate` - Initiate call
- `POST /:id/status` - Update call status
- `GET /logs` - Get call history
- `GET /livekit-token` - Get LiveKit token

### Messages (`/api/v1/messages`)
- `POST /` - Send message
- `GET /conversations` - Get conversations
- `GET /conversation/:userId` - Get conversation
- `POST /read` - Mark messages as read

### Rooms (`/api/v1/rooms`)
- `GET /` - Get public rooms
- `POST /` - Create room
- `GET /:id` - Get room details
- `POST /:id/join` - Join room
- `POST /:id/leave` - Leave room

## 🧪 Testing

### Backend Tests
- Unit tests with Jest
- Integration tests with Supertest
- Database operation tests
- API endpoint tests
- Mock external services

### Mobile Tests
- Component tests with React Native Testing Library
- Hook tests
- Service layer tests
- Integration tests

## 📦 Deployment

### Backend Deployment (Azure App Service)
- Node.js 20 LTS runtime
- Environment variables configured
- Database connection pooling
- Redis caching enabled
- Logging with Winston
- Monitoring with Application Insights

### Mobile Deployment
- iOS - Apple App Store
- Android - Google Play Store
- EAS Build for app compilation
- EAS Submit for store submission
- OTA updates with Expo Updates

## 🔄 Current Status

**Backend: ✅ 100% Complete**
- All APIs implemented and tested
- LiveKit migration complete
- Production-ready code quality

**Mobile: ✅ 100% Complete**
- All screens and services implemented
- LiveKit migration complete
- Core functionality ready

**Documentation: ✅ Complete**
- Comprehensive guides
- API documentation
- Migration reports
- Testing guides

## 📝 Recent Updates

### LiveKit Migration (January 2025)
- ✅ Migrated from Agora.io to LiveKit
- ✅ Implemented COTURN for NAT traversal
- ✅ Updated all backend services
- ✅ Updated all mobile components
- ✅ Production-grade error handling
- ✅ Comprehensive documentation

## 👥 Development Team

**Backend Specialist**
- API development
- Database design
- Third-party integrations

**Mobile Specialist**
- React Native development
- UI/UX implementation
- State management

**RTC Specialist**
- LiveKit integration
- WebRTC optimization
- Real-time communication

**Claude AI Subagents**
- Automated code generation
- Testing and quality assurance
- Documentation maintenance

## 📚 Additional Resources

- [REQUIREMENTS.md](REQUIREMENTS.md) - Complete specifications
- [QUICK_START.md](QUICK_START.md) - Developer setup guide
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing documentation
- [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) - Security review
- [LIVEKIT_MIGRATION.md](LIVEKIT_MIGRATION.md) - Migration guide
- [MOBILE_MIGRATION_COMPLETE.md](MOBILE_MIGRATION_COMPLETE.md) - Mobile migration status

---

**Last Updated:** January 2025
**Version:** 2.0.0 (LiveKit)
**Status:** Production-Ready
