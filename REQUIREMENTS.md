# Banter - Social Voice/Video Chat Application
## Complete Requirements & Development Plan

**Document Version:** 3.0
**Last Updated:** January 7, 2025
**Project Type:** Mobile-First Social Networking Platform
**Similar To:** Dostt, FRND

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technical Architecture](#technical-architecture)
3. [Third-Party Services Configuration](#third-party-services-configuration)
4. [Database Schema](#database-schema)
5. [Development Phases](#development-phases)
6. [API Specifications](#api-specifications)
7. [Component Specifications](#component-specifications)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Plan](#deployment-plan)
10. [Project Timeline](#project-timeline)

---

## 1. Executive Summary

### 1.1 Project Overview
Banter is a mobile-first social networking application that enables users to:
- Make new friends through voice and video interactions
- Join public voice chat rooms
- Send direct messages with text, images, and voice
- Have one-on-one voice and video calls
- Build a verified network of friends
- Purchase premium features via Razorpay

### 1.2 Target Platforms
- **Primary**: iOS and Android (React Native with Expo)
- **Testing**: Expo Go on physical devices
- **Target Market**: India (optimized for Indian users)
- **Future**: Web platform (Expo Web)

### 1.3 Core Features (MVP)
1. Phone OTP authentication (Firebase)
2. User profiles with avatars
3. Friend request system
4. Direct messaging (text + images)
5. One-on-one voice calls (LiveKit + COTURN)
6. One-on-one video calls (LiveKit + COTURN)
7. Public voice chat rooms (LiveKit)
8. Real-time presence system
9. Block/Report functionality
10. Push notifications
11. Payment integration (Razorpay)

### 1.4 Future Features (Phase 4)
1. Friend matching algorithm
2. Group conversations (3-10 people)
3. Group voice/video calls (LiveKit)
4. Location-based suggestions
5. Advanced analytics
6. Premium subscriptions via Razorpay

---

## 2. Technical Architecture

### 2.1 Technology Stack

#### Frontend (Mobile)
```
Platform: React Native with Expo SDK 50+
Language: TypeScript 5.0+
Router: Expo Router (file-based routing)
UI Library: React Native Paper
State Management: Zustand
API Client: Axios
Real-time: Socket.io-client v4
WebRTC: LiveKit + React Native WebRTC
Storage: AsyncStorage
Auth: Firebase Authentication
```

#### Backend
```
Runtime: Node.js 20 LTS
Framework: Express.js 4.x
Language: TypeScript 5.0+
ORM: Prisma 5.x
Real-time: Socket.io v4
WebRTC: LiveKit Server + COTURN
Authentication: Firebase Admin SDK + JWT
Validation: Zod
Testing: Jest + Supertest
Payment: Razorpay Node SDK
```

#### Azure Services (Infrastructure)
```
Hosting: Azure App Service (Linux)
Database: Azure Database for PostgreSQL (Flexible Server)
Cache: Azure Cache for Redis
Storage: Azure Blob Storage
CDN: Azure CDN
Monitoring: Azure Application Insights
```

#### Third-Party Services
```
Authentication: Firebase Authentication (Phone OTP)
Voice/Video: LiveKit (Open Source WebRTC SFU)
COTURN: Open Source TURN Server
Payment: Razorpay (UPI, Cards, Wallets)
Push Notifications: Firebase Cloud Messaging (FCM)
```

### 2.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Clients                            │
│         (iOS & Android - React Native Expo)                  │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│    │  Firebase    │  │  Text Chat   │  │ Voice/Video  │   │
│    │  Auth (OTP)  │  │  (Socket.io) │  │ (LiveKit)    │   │
│    └──────────────┘  └──────────────┘  └──────────────┘   │
└────────────┬────────────────┬────────────────┬─────────────┘
             │                │                │
             ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Azure Front Door                          │
│                    (Load Balancer + CDN)                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              Azure App Service (Backend API)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                    │  │
│  │  - REST API Endpoints                                │  │
│  │  - Socket.io Server (Chat)                           │  │
│  │  - LiveKit Server (WebRTC)                           │  │
│  │  - COTURN Server (TURN/STUN)                         │  │
│  │  - Firebase Admin (OTP Verification)                 │  │
│  │  - Razorpay Webhooks                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────┬──────────┬──────────┬──────────┬──────────┬──────────┘
      │          │          │          │          │
      ▼          ▼          ▼          ▼          ▼
┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐
│ Azure DB ││  Azure   ││  Azure   ││ Firebase ││  Azure   │
│PostgreSQL││  Redis   ││  Blob    ││   Auth   ││ App      │
│          ││  Cache   ││ Storage  ││          ││ Insights │
└──────────┘└──────────┘└──────────┘└──────────┘└──────────┘
      │          │          │          │          │
      ▼          ▼          ▼          ▼          ▼
┌──────────┐┌──────────┐┌──────────┐
│ LiveKit  ││ Razorpay ││   FCM    │
│ WebRTC   ││ Payments ││  Push    │
└──────────┘└──────────┘└──────────┘
```

---

## 3. Third-Party Services Configuration

### 3.1 Firebase Authentication Setup

**Purpose:** Phone OTP Authentication (SMS)

**Why Firebase for Indian Market:**
- ✅ FREE for 10K verifications/month
- ✅ ~₹0.30-0.50 per SMS in India (70% cheaper than Azure)
- ✅ Better delivery rates in India
- ✅ No phone number purchase required
- ✅ Built-in abuse protection

**Setup Steps:**

1. **Create Firebase Project**
```bash
# Go to https://console.firebase.google.com
# Click "Add Project"
# Project Name: "Banter"
# Enable Google Analytics (optional)
```

2. **Enable Phone Authentication**
```
1. Go to Authentication > Sign-in method
2. Enable "Phone" provider
3. Add test phone numbers (for development)
4. Configure SHA-256 certificate for Android
5. Download google-services.json (Android)
6. Download GoogleService-Info.plist (iOS)
```

3. **Get Firebase Config**
```javascript
// Firebase Web Config (for backend)
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "banter-xxxxx.firebaseapp.com",
  projectId: "banter-xxxxx",
  storageBucket: "banter-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

4. **Setup Firebase Admin SDK (Backend)**
```bash
# Go to Project Settings > Service Accounts
# Click "Generate New Private Key"
# Save as backend/config/firebase-admin-key.json
```

**Cost Estimate:**
- 0-10K verifications/month: FREE
- 10K-100K: ₹0.30-0.50 per verification
- For 10K users: ~₹300-500/month (vs ₹5,000-10,000 with Azure SMS)

---

### 3.2 LiveKit WebRTC Setup

**Purpose:** Real-time Voice and Video Communication (Open Source)

**Why LiveKit over Agora.io:**
- ✅ 100% Open Source and Self-Hosted
- ✅ No per-minute usage fees (cost-effective at scale)
- ✅ Full control over infrastructure
- ✅ Advanced WebRTC features (SFU architecture)
- ✅ Better for Indian market (no external dependencies)
- ✅ Scalable and production-ready
- ✅ Active development and community support

**Setup Steps:**

1. **LiveKit Server Deployment**
```bash
# Install LiveKit Server
npm install -g livekit-server

# Configuration
livekit-server --config ./livekit.yaml
```

2. **LiveKit Configuration (`livekit.yaml`)**
```yaml
# LiveKit Server Configuration
port: 7880
rtc:
  udp_port: 7882
  tcp_port: 7881
turn:
  enabled: true
  domain: turn.banter.app
  tls_port: 5349
  udp_port: 3478
  cert_file: /path/to/cert.pem
  key_file: /path/to/key.pem

# Redis for room management
redis:
  address: localhost:6379
  db: 0

# API Keys for authentication
keys:
  - "API_KEY_YOUR_API_SECRET"
```

3. **COTURN Server Setup**
```bash
# Install COTURN
apt-get install coturn

# COTURN Configuration (/etc/turnserver.conf)
listening-port=3478
tls-listening-port=5349
listening-ip=0.0.0.0
total-quota=100
user-quota=12
max-bps=64000
use-auth-secret
static-auth-secret=your-turn-secret
realm=banter

# SSL Certificates
cert=/path/to/cert.pem
pkey=/path/to/key.pem
```

4. **Install LiveKit SDKs**
```bash
# Mobile (Expo)
npm install @livekit/react-native-webrtc

# Backend
npm install @livekit/server-sdk
```

**Features Available:**
- 1-on-1 voice calls
- 1-on-1 video calls
- Voice chat rooms (unlimited participants)
- Group video calls (unlimited participants)
- Screen sharing
- Audio effects (echo cancellation, noise suppression)
- Adaptive bitrate streaming
- Network quality monitoring
- Recording capabilities

**Cost Estimate:**
- LiveKit Server: FREE (self-hosted)
- COTURN Server: FREE (self-hosted)
- Azure hosting costs: Included in existing infrastructure
- Total: ₹0/month (no per-minute charges!)

**Token Generation (Backend):**
```typescript
import { AccessToken } from '@livekit/server-sdk';

function generateLiveKitToken(roomName: string, participantName: string) {
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    name: participantName,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return at.toJwt();
}
```

---

### 3.3 Razorpay Setup

**Purpose:** Payment Gateway for Indian Market

**Why Razorpay:**
- ✅ Most popular in India
- ✅ Supports UPI, Cards, Netbanking, Wallets
- ✅ Instant settlements
- ✅ Great documentation
- ✅ Lower fees: 2% (vs Stripe 2.9% + ₹3)
- ✅ Subscriptions support

**Setup Steps:**

1. **Create Razorpay Account**
```bash
# Go to https://dashboard.razorpay.com
# Sign up with business details
# Complete KYC verification
# Get Test & Live Keys
```

2. **Get API Keys**
```
Test Mode:
Key ID: rzp_test_1234567890abcd
Key Secret: abcdef1234567890abcdef12

Live Mode:
Key ID: rzp_live_1234567890abcd
Key Secret: abcdef1234567890abcdef12
```

3. **Install SDKs**
```bash
# Backend
npm install razorpay

# Mobile
npm install react-native-razorpay
```

4. **Setup Webhooks**
```
Dashboard > Webhooks > Add URL:
https://banter-api.azurewebsites.net/api/webhooks/razorpay

Events to subscribe:
✓ payment.captured
✓ payment.failed
✓ subscription.charged
✓ subscription.cancelled
```

**Features to Implement:**
- Coin purchases (₹49, ₹99, ₹249, ₹499)
- Premium subscriptions (₹99/month, ₹999/year)
- UPI payments (primary)
- Card payments
- Wallets (Paytm, PhonePe, etc.)

**Pricing:**
- Domestic: 2% per transaction (no fixed fee)
- International: 3%
- Subscriptions: 2%
- No setup fees, No annual fees

**Cost Estimate:**
- Revenue ₹1,00,000: Razorpay fees = ₹2,000
- Revenue ₹10,00,000: Razorpay fees = ₹20,000

---

### 3.4 Azure Database for PostgreSQL

**Service Tier:** Flexible Server
**Configuration:**
```yaml
Compute Tier: Burstable
Compute Size: B1ms (1 vCore, 2 GB RAM) # For development
Compute Size: GP_Standard_D2s_v3 (2 vCore, 8 GB RAM) # For production
Storage: 32 GB (auto-grow enabled)
Backup Retention: 7 days
High Availability: Zone-redundant (production only)
PostgreSQL Version: 15
Connection String: postgresql://username:password@server.postgres.database.azure.com:5432/banter?sslmode=require
```

**Setup Tasks:**
```bash
# 1. Create resource group
az group create --name banter-rg --location centralindia

# 2. Create PostgreSQL server
az postgres flexible-server create \
  --resource-group banter-rg \
  --name banter-db-server \
  --location centralindia \
  --admin-user banter_admin \
  --admin-password <SecurePassword> \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15

# 3. Create database
az postgres flexible-server db create \
  --resource-group banter-rg \
  --server-name banter-db-server \
  --database-name banter_production

# 4. Configure firewall (allow Azure services)
az postgres flexible-server firewall-rule create \
  --resource-group banter-rg \
  --name banter-db-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

---

### 3.5 Azure Cache for Redis

**Service Tier:** Basic/Standard
**Configuration:**
```yaml
Cache Tier: Basic C0 (250 MB) # For development
Cache Tier: Standard C1 (1 GB) # For production
Redis Version: 6.x
Port: 6380 (SSL)
Connection String: banter-redis.redis.cache.windows.net:6380,password=<key>,ssl=True,abortConnect=False
```

**Setup Tasks:**
```bash
# Create Redis cache
az redis create \
  --resource-group banter-rg \
  --name banter-redis \
  --location centralindia \
  --sku Basic \
  --vm-size c0 \
  --enable-non-ssl-port false

# Get connection string
az redis list-keys \
  --resource-group banter-rg \
  --name banter-redis
```

**Usage:**
- Session management
- Online user presence tracking
- Rate limiting
- WebSocket room management
- LiveKit token caching
- Message queue for notifications

---

### 3.6 Azure Blob Storage

**Configuration:**
```yaml
Account Type: StorageV2 (General Purpose v2)
Performance: Standard
Replication: LRS (Locally Redundant Storage) # For development
Replication: GRS (Geo-Redundant Storage) # For production
Access Tier: Hot
```

**Containers:**
```
1. avatars/          - User profile pictures
2. chat-media/       - Images shared in chats
3. voice-messages/   - Audio messages
4. room-covers/      - Chat room cover images
5. verification/     - User verification documents
```

**Setup Tasks:**
```bash
# Create storage account
az storage account create \
  --name banterblobstorage \
  --resource-group banter-rg \
  --location centralindia \
  --sku Standard_LRS \
  --kind StorageV2

# Create containers
az storage container create --name avatars --account-name banterblobstorage --public-access blob
az storage container create --name chat-media --account-name banterblobstorage --public-access blob
az storage container create --name voice-messages --account-name banterblobstorage
az storage container create --name room-covers --account-name banterblobstorage --public-access blob

# Get connection string
az storage account show-connection-string \
  --name banterblobstorage \
  --resource-group banter-rg
```

---

### 3.7 Azure App Service

**Configuration:**
```yaml
Plan: Linux App Service Plan
Tier: B1 (Basic) # For development
Tier: P1V2 (Premium) # For production
Runtime: Node 20 LTS
Always On: Enabled (production)
WebSockets: Enabled (required for Socket.io)
```

**Setup Tasks:**
```bash
# Create App Service Plan
az appservice plan create \
  --name banter-app-plan \
  --resource-group banter-rg \
  --location centralindia \
  --is-linux \
  --sku B1

# Create Web App
az webapp create \
  --resource-group banter-rg \
  --plan banter-app-plan \
  --name banter-api \
  --runtime "NODE:20-lts"

# Enable WebSockets
az webapp config set \
  --resource-group banter-rg \
  --name banter-api \
  --web-sockets-enabled true

# Configure environment variables
az webapp config appsettings set \
  --resource-group banter-rg \
  --name banter-api \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="<postgres-connection-string>" \
    REDIS_URL="<redis-connection-string>" \
    JWT_SECRET="<random-secret>" \
    FIREBASE_PROJECT_ID="<firebase-project-id>" \
    LIVEKIT_API_KEY="<livekit-api-key>" \
    LIVEKIT_API_SECRET="<livekit-api-secret>" \
    LIVEKIT_SERVER_URL="wss://livekit.banter.app" \
    RAZORPAY_KEY_ID="<razorpay-key>" \
    RAZORPAY_KEY_SECRET="<razorpay-secret>"
```

---

### 3.8 Azure Application Insights

**Purpose:** Monitoring, logging, error tracking

**Setup Tasks:**
```bash
# Create Application Insights
az monitor app-insights component create \
  --app banter-insights \
  --resource-group banter-rg \
  --location centralindia \
  --application-type Node.JS

# Get instrumentation key
az monitor app-insights component show \
  --app banter-insights \
  --resource-group banter-rg
```

**Metrics Tracked:**
- API response times
- Error rates
- Database query performance
- WebSocket connections
- LiveKit WebRTC metrics
- Payment success/failure rates
- User activity patterns

---

### 3.9 Firebase Cloud Messaging (FCM)

**Purpose:** Push Notifications

**Setup:**
```
1. Firebase Console > Cloud Messaging
2. Get Server Key for backend
3. Configure APNs for iOS (upload .p8 key)
4. Download google-services.json for Android
```

**Notification Types:**
- New message received
- Friend request received
- Friend request accepted
- Incoming call
- Room invitation
- Payment successful
- Coins credited

---

## 4. Database Schema

### 4.1 Complete Prisma Schema

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USER MANAGEMENT ====================

model User {
  id            String    @id @default(uuid())
  phoneNumber   String    @unique
  countryCode   String    @default("+91") // India default
  firebaseUid   String?   @unique // Firebase UID
  email         String?   @unique
  username      String?   @unique
  fullName      String
  avatar        String?
  bio           String?
  gender        String?   // male, female, other, prefer_not_to_say
  dateOfBirth   DateTime?
  language      String    @default("en")
  isVerified    Boolean   @default(false)
  isOnline      Boolean   @default(false)
  lastSeen      DateTime?
  coins         Int       @default(100)
  isPremium     Boolean   @default(false)
  premiumUntil  DateTime?
  fcmToken      String?   // For push notifications

  // Preferences stored as JSON
  interests     String[]  // ["sports", "music", "gaming"]
  lookingFor    String[]  // ["friendship", "chat", "advice"]

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  sentRequests      FriendRequest[] @relation("SentRequests")
  receivedRequests  FriendRequest[] @relation("ReceivedRequests")
  friends           Friendship[]    @relation("UserFriends")
  friendOf          Friendship[]    @relation("FriendOf")
  sentMessages      Message[]       @relation("SentMessages")
  receivedMessages  Message[]       @relation("ReceivedMessages")
  callsMade         CallLog[]       @relation("CallsMade")
  callsReceived     CallLog[]       @relation("CallsReceived")
  chatRoomMembers   ChatRoomMember[]
  hostedRooms       ChatRoom[]      @relation("RoomHost")
  reports           Report[]        @relation("Reporter")
  reportedBy        Report[]        @relation("ReportedUser")
  blockedUsers      BlockedUser[]   @relation("BlockedBy")
  blockedBy         BlockedUser[]   @relation("BlockedUser")
  notifications     Notification[]
  transactions      Transaction[]
  subscriptions     Subscription[]

  @@index([phoneNumber])
  @@index([firebaseUid])
  @@index([username])
  @@index([isOnline])
}

// ==================== FRIENDSHIP SYSTEM ====================

model FriendRequest {
  id          String   @id @default(uuid())
  senderId    String
  receiverId  String
  status      String   @default("pending") // pending, accepted, rejected
  message     String?  // Optional message with request
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  sender      User     @relation("SentRequests", fields: [senderId], references: [id], onDelete: Cascade)
  receiver    User     @relation("ReceivedRequests", fields: [receiverId], references: [id], onDelete: Cascade)

  @@unique([senderId, receiverId])
  @@index([receiverId, status])
}

model Friendship {
  id          String   @id @default(uuid())
  userId      String
  friendId    String
  createdAt   DateTime @default(now())

  user        User     @relation("UserFriends", fields: [userId], references: [id], onDelete: Cascade)
  friend      User     @relation("FriendOf", fields: [friendId], references: [id], onDelete: Cascade)

  @@unique([userId, friendId])
  @@index([userId])
  @@index([friendId])
}

// ==================== CHAT ROOMS ====================

model ChatRoom {
  id          String   @id @default(uuid())
  name        String
  description String?
  coverImage  String?
  roomType    String   @default("voice") // voice, video, text
  category    String?  // relationships, career, casual, gaming, music
  language    String   @default("en")
  maxMembers  Int      @default(10)
  isActive    Boolean  @default(true)
  isPublic    Boolean  @default(true)
  hostId      String
  livekitRoom String? @unique // LiveKit room name

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  host        User     @relation("RoomHost", fields: [hostId], references: [id])
  members     ChatRoomMember[]
  messages    Message[]

  @@index([isActive, isPublic])
  @@index([category, language])
  @@index([livekitRoom])
}

model ChatRoomMember {
  id          String   @id @default(uuid())
  userId      String
  roomId      String
  role        String   @default("member") // member, moderator, host
  isMuted     Boolean  @default(false)
  isSpeaking  Boolean  @default(false)
  livekitSid   String?  // LiveKit participant SID
  joinedAt    DateTime @default(now())
  leftAt      DateTime?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  room        ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@unique([userId, roomId])
  @@index([roomId])
}

// ==================== MESSAGING ====================

model Message {
  id          String   @id @default(uuid())
  senderId    String
  receiverId  String?  // For direct messages
  roomId      String?  // For room messages
  content     String   @db.Text
  messageType String   @default("text") // text, image, audio, video, gif
  mediaUrl    String?
  isRead      Boolean  @default(false)
  isEdited    Boolean  @default(false)
  isDeleted   Boolean  @default(false)
  replyToId   String?  // For message replies
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  sender      User     @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiver    User?    @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  room        ChatRoom? @relation(fields: [roomId], references: [id], onDelete: Cascade)
  replyTo     Message? @relation("MessageReplies", fields: [replyToId], references: [id])
  replies     Message[] @relation("MessageReplies")

  @@index([senderId, receiverId])
  @@index([roomId, createdAt])
  @@index([receiverId, isRead])
}

// ==================== VOICE/VIDEO CALLS ====================

model CallLog {
  id            String   @id @default(uuid())
  callerId      String
  receiverId    String
  callType      String   // audio, video
  duration      Int?     // in seconds
  status        String   // initiated, ringing, answered, completed, missed, rejected, failed
  livekitRoom   String?  // LiveKit room name
  startedAt     DateTime @default(now())
  answeredAt    DateTime?
  endedAt       DateTime?

  caller        User     @relation("CallsMade", fields: [callerId], references: [id], onDelete: Cascade)
  receiver      User     @relation("CallsReceived", fields: [receiverId], references: [id], onDelete: Cascade)

  @@index([callerId])
  @@index([receiverId])
  @@index([startedAt])
  @@index([livekitRoom])
}

// ==================== PAYMENT & TRANSACTIONS ====================

model Transaction {
  id                String   @id @default(uuid())
  userId            String
  type              String   // coin_purchase, subscription, refund
  amount            Int      // in paisa (₹100 = 10000 paisa)
  currency          String   @default("INR")
  coins             Int?     // Coins purchased
  status            String   // pending, success, failed
  razorpayOrderId   String?  @unique
  razorpayPaymentId String?  @unique
  razorpaySignature String?
  paymentMethod     String?  // upi, card, netbanking, wallet
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([razorpayOrderId])
  @@index([razorpayPaymentId])
}

model Subscription {
  id                  String   @id @default(uuid())
  userId              String
  plan                String   // basic, premium, pro
  status              String   // active, cancelled, expired
  amount              Int      // Monthly amount in paisa
  razorpaySubId       String?  @unique
  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime
  cancelledAt         DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
}

// ==================== SAFETY & MODERATION ====================

model BlockedUser {
  id            String   @id @default(uuid())
  userId        String
  blockedUserId String
  reason        String?
  createdAt     DateTime @default(now())

  user          User     @relation("BlockedBy", fields: [userId], references: [id], onDelete: Cascade)
  blockedUser   User     @relation("BlockedUser", fields: [blockedUserId], references: [id], onDelete: Cascade)

  @@unique([userId, blockedUserId])
  @@index([userId])
}

model Report {
  id              String   @id @default(uuid())
  reporterId      String
  reportedUserId  String
  reportType      String   // user, message, room
  reason          String   // harassment, spam, inappropriate, fake
  description     String?  @db.Text
  status          String   @default("pending") // pending, reviewed, action_taken, dismissed
  reviewedBy      String?
  reviewedAt      DateTime?
  createdAt       DateTime @default(now())

  reporter        User     @relation("Reporter", fields: [reporterId], references: [id], onDelete: Cascade)
  reportedUser    User     @relation("ReportedUser", fields: [reportedUserId], references: [id], onDelete: Cascade)

  @@index([reportedUserId, status])
  @@index([status])
}

// ==================== NOTIFICATIONS ====================

model Notification {
  id          String   @id @default(uuid())
  userId      String
  type        String   // friend_request, message, call, room_invite, payment
  title       String
  body        String
  data        Json?    // Additional data as JSON
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([createdAt])
}

// ==================== ANALYTICS ====================

model UserActivity {
  id              String   @id @default(uuid())
  userId          String
  activityType    String   // login, logout, call_made, message_sent, room_joined, payment
  metadata        Json?
  createdAt       DateTime @default(now())

  @@index([userId, createdAt])
  @@index([activityType])
}
```

### 4.2 Database Indexes Rationale

**Critical Indexes:**
1. `User.phoneNumber` - Used for login/authentication
2. `User.firebaseUid` - Firebase integration
3. `User.username` - Search and profile lookup
4. `User.isOnline` - Fetch online users quickly
5. `FriendRequest.receiverId + status` - Pending requests
6. `Message.senderId + receiverId` - Conversation messages
7. `Message.roomId + createdAt` - Room messages chronologically
8. `Message.receiverId + isRead` - Unread message count
9. `CallLog.livekitRoom` - Active call lookup
10. `Transaction.razorpayOrderId` - Payment verification

### 4.3 Database Migration Commands

```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Push schema to database (for quick dev changes)
npx prisma db push

# Open Prisma Studio (GUI for database)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database with test data
npx prisma db seed
```

---

## 5. Development Phases

### PHASE 1: Project Foundation (Days 1-3)

#### Task 1.1: Initialize Expo Project

```bash
# Create Expo app
npx create-expo-app@latest mobile --template expo-template-blank-typescript

cd mobile

# Install core dependencies
npx expo install expo-router react-native-safe-area-context react-native-screens
npm install react-native-paper react-native-vector-icons
npm install zustand axios socket.io-client
npm install @react-native-async-storage/async-storage

# Install Firebase
npm install @react-native-firebase/app @react-native-firebase/auth
npm install firebase # For web compatibility

# Install LiveKit
npm install @livekit/react-native-webrtc react-native-webrtc

# Install Razorpay
npm install react-native-razorpay

# Install media utilities
npm install expo-image-picker expo-av expo-camera expo-notifications
```

**Files to Create:**
- `mobile/app/_layout.tsx` - Root layout
- `mobile/app/index.tsx` - Entry point
- `mobile/app.json` - Expo configuration
- `mobile/tsconfig.json` - TypeScript config
- `mobile/android/app/google-services.json` - Firebase Android config
- `mobile/ios/GoogleService-Info.plist` - Firebase iOS config

#### Task 1.2: Initialize Backend Project

```bash
# Create backend directory
mkdir backend && cd backend
npm init -y

# Install dependencies
npm install express cors dotenv
npm install @prisma/client
npm install socket.io
npm install jsonwebtoken bcrypt
npm install multer
npm install @azure/storage-blob
npm install firebase-admin # Firebase Admin SDK
npm install @livekit/server-sdk # LiveKit Server SDK
npm install razorpay # Razorpay SDK
npm install ioredis
npm install zod
npm install winston

# Install dev dependencies
npm install -D typescript @types/node @types/express @types/cors
npm install -D @types/jsonwebtoken @types/bcrypt @types/multer
npm install -D prisma
npm install -D jest @types/jest ts-jest supertest @types/supertest
npm install -D nodemon ts-node
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Files to Create:**
- `backend/src/server.ts` - Express server
- `backend/tsconfig.json` - TypeScript config
- `backend/package.json` - Scripts configuration
- `backend/.env.example` - Environment variables template
- `backend/prisma/schema.prisma` - Database schema
- `backend/config/firebase-admin-key.json` - Firebase Admin credentials

#### Task 1.3: Setup Azure Resources

```bash
# Login to Azure
az login

# Create resource group (Central India region for Indian users)
az group create --name banter-rg --location centralindia

# Create PostgreSQL database (see section 3.4)
# Create Redis cache (see section 3.5)
# Create Storage account (see section 3.6)
# Create App Service (see section 3.7)
```

#### Task 1.4: Configure Environment Variables

Create `backend/.env`:
```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://user:pass@server.postgres.database.azure.com:5432/banter?sslmode=require"

# Redis
REDIS_HOST=banter-redis.redis.cache.windows.net
REDIS_PORT=6380
REDIS_PASSWORD=<your-redis-key>
REDIS_TLS=true

# JWT
JWT_SECRET=<generate-random-secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<generate-random-secret>
JWT_REFRESH_EXPIRES_IN=30d

# Firebase Admin
FIREBASE_PROJECT_ID=banter-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@banter-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=<your-connection-string>
AZURE_STORAGE_ACCOUNT_NAME=banterblobstorage
AZURE_STORAGE_CONTAINER_AVATARS=avatars
AZURE_STORAGE_CONTAINER_MEDIA=chat-media

# LiveKit
LIVEKIT_API_KEY=API_KEY_your_secret
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_SERVER_URL=wss://livekit.banter.app

# Razorpay
RAZORPAY_KEY_ID=rzp_test_1234567890abcd
RAZORPAY_KEY_SECRET=abcdef1234567890abcdef12
RAZORPAY_WEBHOOK_SECRET=whsec_1234567890

# Azure Application Insights
AZURE_APPINSIGHTS_INSTRUMENTATION_KEY=<your-key>

# CORS
ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Create `mobile/.env`:
```env
# API
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000

# Firebase (Web Config)
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=banter-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=banter-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=banter-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# LiveKit
EXPO_PUBLIC_LIVEKIT_SERVER_URL=wss://livekit.banter.app

# Razorpay
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1234567890abcd

# Azure
EXPO_PUBLIC_AZURE_APPINSIGHTS_KEY=<your-key>
```

#### Task 1.5: Setup Project Structure

Backend structure:
```
backend/
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── azure.ts
│   │   ├── firebase.ts
│   │   ├── livekit.ts
│   │   └── razorpay.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── friendController.ts
│   │   ├── roomController.ts
│   │   ├── messageController.ts
│   │   ├── callController.ts
│   │   ├── paymentController.ts
│   │   └── safetyController.ts
│   ├── services/
│   │   ├── firebaseService.ts
│   │   ├── livekitService.ts
│   │   ├── razorpayService.ts
│   │   ├── jwtService.ts
│   │   ├── uploadService.ts
│   │   └── notificationService.ts
│   ├── routes/
│   ├── middleware/
│   ├── socket/
│   ├── utils/
│   ├── types/
│   └── validators/
├── config/
│   └── firebase-admin-key.json
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
├── .env
├── .env.example
├── tsconfig.json
└── package.json
```

Mobile structure:
```
mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── verify-otp.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── chat.tsx
│   │   ├── friends.tsx
│   │   └── profile.tsx
│   ├── rooms/
│   │   └── [id].tsx
│   ├── chat/
│   │   └── [userId].tsx
│   ├── call/
│   │   └── [userId].tsx
│   ├── payment/
│   │   ├── coins.tsx
│   │   └── premium.tsx
│   ├── _layout.tsx
│   └── index.tsx
├── components/
│   ├── ui/
│   ├── auth/
│   ├── rooms/
│   ├── chat/
│   ├── calls/
│   └── payment/
├── services/
│   ├── api.ts
│   ├── socket.ts
│   ├── firebase.ts
│   ├── livekit.ts
│   └── razorpay.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useLiveKit.ts
│   └── usePayment.ts
├── store/
│   ├── authStore.ts
│   ├── chatStore.ts
│   └── callStore.ts
├── utils/
├── types/
├── assets/
├── android/
│   └── app/
│       └── google-services.json
├── ios/
│   └── GoogleService-Info.plist
├── app.json
├── .env
└── package.json
```

**Deliverables:**
- [ ] Expo project initialized and running on Expo Go
- [ ] Backend server running on localhost:5000
- [ ] Azure resources created and configured
- [ ] Firebase project created with Phone Auth enabled
- [ ] LiveKit server configured with COTURN
- [ ] Razorpay account created with test keys
- [ ] Database schema defined in Prisma
- [ ] Environment variables configured
- [ ] Git repository initialized with .gitignore

---

### PHASE 2: Authentication System with Firebase (Days 3-6)

#### Task 2.1: Backend - Firebase Admin SDK Configuration

**File:** `backend/src/config/firebase.ts`
```typescript
import admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export const firebaseAuth = admin.auth();
export const firebaseAdmin = admin;
```

#### Task 2.2: Backend - Firebase Authentication Service

**File:** `backend/src/services/firebaseService.ts`
```typescript
import { firebaseAuth } from '../config/firebase';
import { prisma } from '../config/database';

export class FirebaseAuthService {
  // Verify Firebase ID token
  async verifyToken(idToken: string) {
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(idToken);
      return {
        success: true,
        firebaseUid: decodedToken.uid,
        phoneNumber: decodedToken.phone_number
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid Firebase token'
      };
    }
  }

  // Get or create user from Firebase UID
  async getOrCreateUser(firebaseUid: string, phoneNumber: string) {
    let user = await prisma.user.findUnique({
      where: { firebaseUid }
    });

    if (!user) {
      // Check if phone number exists (migration case)
      user = await prisma.user.findUnique({
        where: { phoneNumber }
      });

      if (user) {
        // Update existing user with Firebase UID
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid }
        });
      }
    }

    return user;
  }

  // Send custom notification
  async sendPushNotification(fcmToken: string, title: string, body: string, data?: any) {
    try {
      await firebaseAuth.app.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data: data || {}
      });
      return true;
    } catch (error) {
      console.error('Push notification error:', error);
      return false;
    }
  }
}
```

#### Task 2.3: Backend - Auth Controller with Firebase

**File:** `backend/src/controllers/authController.ts`
```typescript
import { Request, Response } from 'express';
import { FirebaseAuthService } from '../services/firebaseService';
import { JWTService } from '../services/jwtService';
import { prisma } from '../config/database';
import { z } from 'zod';

const firebaseService = new FirebaseAuthService();
const jwtService = new JWTService();

// Validation schemas
const verifyFirebaseSchema = z.object({
  firebaseToken: z.string(),
  fcmToken: z.string().optional()
});

const registerSchema = z.object({
  firebaseToken: z.string(),
  fullName: z.string().min(2).max(50),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  dateOfBirth: z.string(), // ISO date string
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  fcmToken: z.string().optional()
});

export class AuthController {
  // POST /api/auth/verify-firebase
  async verifyFirebase(req: Request, res: Response) {
    try {
      const { firebaseToken, fcmToken } = verifyFirebaseSchema.parse(req.body);

      // Verify Firebase token
      const result = await firebaseService.verifyToken(firebaseToken);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Firebase token'
        });
      }

      // Check if user exists
      const user = await firebaseService.getOrCreateUser(
        result.firebaseUid!,
        result.phoneNumber!
      );

      if (!user) {
        // New user - return registration required
        return res.json({
          success: true,
          isNewUser: true,
          firebaseUid: result.firebaseUid,
          phoneNumber: result.phoneNumber,
          message: 'Please complete registration'
        });
      }

      // Update FCM token if provided
      if (fcmToken) {
        await prisma.user.update({
          where: { id: user.id },
          data: { fcmToken }
        });
      }

      // Existing user - generate JWT tokens
      const accessToken = jwtService.generateAccessToken(user.id);
      const refreshToken = jwtService.generateRefreshToken(user.id);

      // Update last seen and online status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastSeen: new Date(),
          isOnline: true
        }
      });

      res.json({
        success: true,
        isNewUser: false,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          avatar: user.avatar,
          username: user.username,
          coins: user.coins,
          isPremium: user.isPremium
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/auth/register
  async register(req: Request, res: Response) {
    try {
      const { firebaseToken, fullName, username, dateOfBirth, gender, fcmToken } =
        registerSchema.parse(req.body);

      // Verify Firebase token
      const result = await firebaseService.verifyToken(firebaseToken);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Firebase token'
        });
      }

      // Check if username is already taken
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }

      // Create new user
      const user = await prisma.user.create({
        data: {
          firebaseUid: result.firebaseUid!,
          phoneNumber: result.phoneNumber!,
          fullName,
          username,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          isVerified: true,
          fcmToken: fcmToken || null
        }
      });

      // Generate JWT tokens
      const accessToken = jwtService.generateAccessToken(user.id);
      const refreshToken = jwtService.generateRefreshToken(user.id);

      res.status(201).json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          username: user.username,
          coins: user.coins
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/auth/refresh
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      const { userId } = jwtService.verifyRefreshToken(refreshToken);

      const accessToken = jwtService.generateAccessToken(userId);

      res.json({
        success: true,
        accessToken
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }

  // GET /api/auth/me
  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user.id; // From auth middleware

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          phoneNumber: true,
          email: true,
          username: true,
          fullName: true,
          avatar: true,
          bio: true,
          gender: true,
          dateOfBirth: true,
          language: true,
          isVerified: true,
          interests: true,
          coins: true,
          isPremium: true,
          premiumUntil: true,
          createdAt: true
        }
      });

      res.json({
        success: true,
        user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/auth/logout
  async logout(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      // Update online status
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: false,
          lastSeen: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
```

#### Task 2.4: Backend - JWT Service (unchanged)

**File:** `backend/src/services/jwtService.ts`
```typescript
import jwt from 'jsonwebtoken';

export class JWTService {
  generateAccessToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
  }

  verifyAccessToken(token: string): { userId: string } {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  }

  verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
  }
}
```

#### Task 2.5: Backend - Auth Middleware

**File:** `backend/src/middleware/authMiddleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwtService';

const jwtService = new JWTService();

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const { userId } = jwtService.verifyAccessToken(token);
    req.user = { id: userId };
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}
```

#### Task 2.6: Backend - Auth Routes

**File:** `backend/src/routes/authRoutes.ts`
```typescript
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const authController = new AuthController();

router.post('/verify-firebase', authController.verifyFirebase);
router.post('/register', authController.register);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;
```

#### Task 2.7: Frontend - Firebase Configuration

**File:** `mobile/services/firebase.ts`
```typescript
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

// Request notification permissions
export async function requestNotificationPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }

  return enabled;
}

// Get FCM token
export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Sign in with phone number
export async function signInWithPhoneNumber(phoneNumber: string) {
  try {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    return confirmation;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
}

// Verify OTP
export async function verifyOTP(confirmation: any, code: string) {
  try {
    const userCredential = await confirmation.confirm(code);
    const firebaseToken = await userCredential.user.getIdToken();
    return {
      success: true,
      firebaseToken,
      user: userCredential.user
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      error: 'Invalid OTP'
    };
  }
}

// Get current Firebase token
export async function getCurrentFirebaseToken() {
  const user = auth().currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

// Sign out
export async function signOut() {
  await auth().signOut();
}
```

#### Task 2.8: Frontend - Auth Store

**File:** `mobile/store/authStore.ts`
```typescript
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  avatar?: string;
  username?: string;
  coins: number;
  isPremium: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  loadTokens: () => Promise<void>;
  updateCoins: (coins: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setTokens: async (accessToken, refreshToken) => {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user });
  },

  logout: async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false
    });
  },

  loadTokens: async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      set({ isLoading: false });
    }
  },

  updateCoins: (coins) => {
    set((state) => ({
      user: state.user ? { ...state.user, coins } : null
    }));
  }
}));
```

#### Task 2.9: Frontend - API Service

**File:** `mobile/services/api.ts`
```typescript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { getCurrentFirebaseToken } from './firebase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken
        });

        const { accessToken } = response.data;
        await useAuthStore.getState().setTokens(accessToken, refreshToken!);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  verifyFirebase: async (firebaseToken: string, fcmToken?: string) =>
    api.post('/auth/verify-firebase', { firebaseToken, fcmToken }),

  register: async (data: any) =>
    api.post('/auth/register', data),

  logout: async () =>
    api.post('/auth/logout'),

  getCurrentUser: () =>
    api.get('/auth/me')
};
```

#### Task 2.10: Frontend - Login Screen

**File:** `mobile/app/(auth)/login.tsx`
```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { signInWithPhoneNumber } from '../../services/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91'); // India default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const fullNumber = `${countryCode}${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(fullNumber);

      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          phoneNumber: fullNumber,
          confirmationId: JSON.stringify(confirmation) // Store confirmation
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome to Banter
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Enter your phone number to get started
      </Text>

      <View style={styles.phoneContainer}>
        <TextInput
          label="Country Code"
          value={countryCode}
          onChangeText={setCountryCode}
          style={styles.countryCode}
          mode="outlined"
        />
        <TextInput
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          style={styles.phoneInput}
          mode="outlined"
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleSendOTP}
        loading={loading}
        disabled={loading || phoneNumber.length < 10}
        style={styles.button}
      >
        Send OTP
      </Button>

      <Text variant="bodySmall" style={styles.disclaimer}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCode: {
    width: 100,
  },
  phoneInput: {
    flex: 1,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  button: {
    marginTop: 20,
  },
  disclaimer: {
    marginTop: 20,
    textAlign: 'center',
    opacity: 0.5,
  },
});
```

#### Task 2.11: Frontend - OTP Verification Screen

**File:** `mobile/app/(auth)/verify-otp.tsx`
```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { verifyOTP } from '../../services/firebase';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { getFCMToken } from '../../services/firebase';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { phoneNumber, confirmationId } = useLocalSearchParams<{
    phoneNumber: string;
    confirmationId: string;
  }>();
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setTokens, setUser } = useAuthStore();

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const confirmation = JSON.parse(confirmationId);

      // Verify OTP with Firebase
      const result = await verifyOTP(confirmation, otp);

      if (!result.success) {
        setError('Invalid OTP');
        return;
      }

      // Get FCM token for push notifications
      const fcmToken = await getFCMToken();

      // Verify with backend
      const response = await authAPI.verifyFirebase(result.firebaseToken, fcmToken);
      const { isNewUser, accessToken, refreshToken, user } = response.data;

      if (isNewUser) {
        // Redirect to registration
        router.push({
          pathname: '/(auth)/register',
          params: {
            phoneNumber,
            firebaseToken: result.firebaseToken,
            fcmToken: fcmToken || ''
          }
        });
      } else {
        // Existing user - save tokens and redirect to app
        await setTokens(accessToken, refreshToken);
        setUser(user);
        router.replace('/(tabs)/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Verify OTP
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Enter the 6-digit code sent to {phoneNumber}
      </Text>

      <TextInput
        label="Enter OTP"
        value={otp}
        onChangeText={setOTP}
        keyboardType="number-pad"
        maxLength={6}
        mode="outlined"
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleVerifyOTP}
        loading={loading}
        disabled={loading || otp.length !== 6}
        style={styles.button}
      >
        Verify
      </Button>

      <Button
        mode="text"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        Change phone number
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  input: {
    fontSize: 24,
    letterSpacing: 10,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  button: {
    marginTop: 20,
  },
  backButton: {
    marginTop: 10,
  },
});
```

**Deliverables:**
- [ ] Firebase project created and configured
- [ ] Firebase Admin SDK integrated in backend
- [ ] Firebase Authentication SDK integrated in mobile app
- [ ] Backend auth endpoints (verify-firebase, register, refresh, me, logout)
- [ ] Frontend Firebase service (OTP sending and verification)
- [ ] Login screen with phone input
- [ ] OTP verification screen with Firebase
- [ ] Token refresh logic
- [ ] FCM push notification setup
- [ ] AsyncStorage persistence

---

### PHASE 3: LiveKit WebRTC Integration (Days 6-10)

#### Task 3.1: Backend - LiveKit Service

**File:** `backend/src/config/livekit.ts`
```typescript
import { AccessToken } from '@livekit/server-sdk';

export class LiveKitService {
  private apiKey: string;
  private apiSecret: string;
  private serverUrl: string;

  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY!;
    this.apiSecret = process.env.LIVEKIT_API_SECRET!;
    this.serverUrl = process.env.LIVEKIT_SERVER_URL || 'ws://localhost:7880';
  }

  // Generate LiveKit token for WebRTC calls
  generateToken(roomName: string, participantName: string, canPublish: boolean = true): string {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: participantName,
      name: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe: true,
    });

    return at.toJwt();
  }

  // Create room for voice/video calls
  async createRoom(roomName: string, participantName: string) {
    const token = this.generateToken(roomName, participantName);

    // Store room metadata in database
    // This would typically involve creating a ChatRoom record

    return {
      roomName,
      participantName,
      token,
      serverUrl: this.serverUrl
    };
  }

  // Delete room when call ends
  async deleteRoom(roomName: string) {
    // Clean up room resources
    // This would typically involve removing ChatRoom record
  }

  // Get room participant count
  async getParticipantCount(roomName: string): Promise<number> {
    // Query LiveKit server for room info
    // This would involve calling LiveKit REST API
    return 0; // Placeholder
  }
}
```

#### Task 3.2: Backend - Call Controller with LiveKit

**File:** `backend/src/controllers/callController.ts`
```typescript
import { Request, Response } from 'express';
import { LiveKitService } from '../config/livekit';
import { prisma } from '../config/database';

const livekitService = new LiveKitService();

export class CallController {
  // POST /api/calls/initiate
  async initiateCall(req: Request, res: Response) {
    try {
      const { receiverId, callType } = req.body; // callType: 'audio' | 'video'
      const callerId = req.user.id;

      // Check if receiver is online
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { isOnline: true, fcmToken: true }
      });

      if (!receiver || !receiver.isOnline) {
        return res.status(400).json({
          success: false,
          message: 'User is not online'
        });
      }

      // Generate unique room name
      const roomName = `call_${callerId}_${receiverId}_${Date.now()}`;
      const callerParticipantName = `user_${callerId}`;
      const receiverParticipantName = `user_${receiverId}`;

      // Generate tokens for both users
      const callerToken = livekitService.generateToken(roomName, callerParticipantName, true);
      const receiverToken = livekitService.generateToken(roomName, receiverParticipantName, true);

      // Create room
      await livekitService.createRoom(roomName, callerParticipantName);

      // Create call log
      const callLog = await prisma.callLog.create({
        data: {
          callerId,
          receiverId,
          callType,
          status: 'initiated',
          livekitRoom: roomName
        },
        include: {
          caller: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              username: true
            }
          }
        }
      });

      // TODO: Send push notification to receiver via FCM

      res.json({
        success: true,
        call: {
          id: callLog.id,
          roomName,
          livekitServerUrl: process.env.LIVEKIT_SERVER_URL,
          callerToken,
          receiverToken,
          participantName: callerParticipantName
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/calls/:id/answer
  async answerCall(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const callLog = await prisma.callLog.update({
        where: { id },
        data: {
          status: 'answered',
          answeredAt: new Date()
        }
      });

      res.json({
        success: true,
        callLog
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/calls/:id/end
  async endCall(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { duration } = req.body;

      const callLog = await prisma.callLog.update({
        where: { id },
        data: {
          status: 'completed',
          duration: duration || 0,
          endedAt: new Date()
        }
      });

      // Clean up LiveKit room
      if (callLog.livekitRoom) {
        await livekitService.deleteRoom(callLog.livekitRoom);
      }

      res.json({
        success: true,
        callLog
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/calls/history
  async getCallHistory(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const calls = await prisma.callLog.findMany({
        where: {
          OR: [
            { callerId: userId },
            { receiverId: userId }
          ]
        },
        include: {
          caller: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              username: true
            }
          },
          receiver: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              username: true
            }
          }
        },
        orderBy: {
          startedAt: 'desc'
        },
        take: 50
      });

      res.json({
        success: true,
        calls
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/rooms/create
  async createVoiceRoom(req: Request, res: Response) {
    try {
      const { name, description, category, maxMembers } = req.body;
      const hostId = req.user.id;

      // Generate unique room name
      const roomName = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create LiveKit room
      const hostParticipantName = `host_${hostId}`;
      const hostToken = livekitService.generateToken(roomName, hostParticipantName, true);

      await livekitService.createRoom(roomName, hostParticipantName);

      // Create chat room record
      const chatRoom = await prisma.chatRoom.create({
        data: {
          name,
          description,
          category,
          maxMembers: maxMembers || 17,
          hostId,
          roomType: 'voice',
          livekitRoom: roomName
        }
      });

      res.json({
        success: true,
        room: {
          id: chatRoom.id,
          name: chatRoom.name,
          livekitRoom: roomName,
          livekitServerUrl: process.env.LIVEKIT_SERVER_URL,
          participantName: hostParticipantName,
          token: hostToken
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/rooms/:id/join
  async joinVoiceRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const participantName = `user_${req.user.id}`;

      // Check if room exists and user is member
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id },
        include: { members: true }
      });

      if (!chatRoom || !chatRoom.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Room not found or inactive'
        });
      }

      // Check if user is already a member
      const existingMember = chatRoom.members.find(
        member => member.userId === req.user.id
      );

      if (!existingMember) {
        // Add user to room
        await prisma.chatRoomMember.create({
          data: {
            userId: req.user.id,
            roomId: chatRoom.id,
            role: 'member'
          }
        });
      }

      // Generate token for participant
      const token = livekitService.generateToken(
        chatRoom.livekitRoom!,
        participantName,
        true
      );

      res.json({
        success: true,
        room: {
          id: chatRoom.id,
          livekitRoom: chatRoom.livekitRoom,
          livekitServerUrl: process.env.LIVEKIT_SERVER_URL,
          participantName,
          token
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
```

#### Task 3.3: Frontend - LiveKit Hook

**File:** `mobile/hooks/useLiveKit.ts`
```typescript
import { useState, useRef, useEffect } from 'react';
import {
  Room,
  RoomEvent,
  RemoteTrack,
  RemoteParticipant,
  LocalVideoTrack,
  LocalAudioTrack,
  ParticipantPermission,
  Participant,
  Track,
} from '@livekit/react-native-webrtc';

export function useLiveKit() {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [remoteTracks, setRemoteTracks] = useState<Map<string, RemoteTrack>>(new Map());
  const [localTracks, setLocalTracks] = useState<{
    video?: LocalVideoTrack;
    audio?: LocalAudioTrack;
  }>({});

  const roomRef = useRef<Room | null>(null);
  const connectRef = useRef<boolean>(false);
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | undefined>();
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | undefined>();

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      connectRef.current = false;
    };
  }, []);

  const connect = async (
    url: string,
    token: string,
    participantName: string
  ) => {
    try {
      console.log('Connecting to LiveKit room:', url);
      setIsConnected(false);
      setParticipants([]);
      setRemoteTracks(new Map());

      // Create room object
      const room = new Room(event => {
        // Handle room events
        event.on('participantConnected', (participant) => {
          console.log('Participant connected:', participant);
          setParticipants(prev => [...prev, participant]);
        });

        event.on('participantDisconnected', (participant) => {
          console.log('Participant disconnected:', participant);
          setParticipants(prev => prev.filter(p => p.sid !== participant.sid));
        });

        event.on('trackSubscribed', (track, publication, participant) => {
          console.log('Track subscribed:', track.source && track.source.trackSid);
          const trackId = track.source?.trackSid || track.sid;
          if (track.kind === 'video' || track.kind === 'audio') {
            setRemoteTracks(prev => new Map(prev).set(trackId, track as RemoteTrack));
          }
        });

        event.on('trackUnsubscribed', (track) => {
          console.log('Track unsubscribed:', track.source?.trackSid);
          const trackId = track.source?.trackSid || track.sid;
          setRemoteTracks(prev => {
            const newTracks = new Map(prev);
            newTracks.delete(trackId);
            return newTracks;
          });
        });

        event.on('activeSpeakersChanged', () => {
          console.log('Active speakers changed');
          // Update speaking indicators
        });

        event.on('roomState', (state) => {
          console.log('Room state changed:', state);
          setIsConnected(state === 'connected');
        });

        event.on('disconnected', () => {
          console.log('Room disconnected');
          setIsConnected(false);
        });
        event.on('reconnecting', () => {
          console.log('Room reconnecting');
        });
        event.on('reconnected', () => {
          console.log('Room reconnected');
          setIsConnected(true);
        });
      });

      await room.connect(url, token);

      roomRef.current = room;
      setRoom(room);
      setIsConnected(true);
      connectRef.current = true;

      // Publish local tracks
      if (audioTrack) {
        await room.localParticipant.publishTrack(audioTrack);
      }
      if (videoTrack) {
        await room.localParticipant.publishTrack(videoTrack);
      }

      console.log('Connected to LiveKit room successfully');
    } catch (error) {
      console.error('Error connecting to LiveKit room:', error);
      setIsConnected(false);
      throw error;
    }
  };

  const disconnect = async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
      setRemoteTracks(new Map());
      connectRef.current = false;
    }
  };

  const toggleAudio = async () => {
    if (audioTrack) {
      await audioTrack.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = async () => {
    if (videoTrack) {
      await videoTrack.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const switchCamera = async () => {
    // Implementation for camera switching
    console.log('Switching camera');
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      setVideoTrack(videoTrack);
      setAudioTrack(audioTrack);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);

      // Publish tracks to room if connected
      if (roomRef.current && isConnected) {
        if (videoTrack) {
          await roomRef.current.localParticipant.publishTrack(videoTrack);
        }
        if (audioTrack) {
          await roomRef.current.localParticipant.publishTrack(audioTrack);
        }
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopVideo = async () => {
    // Stop video tracks
    if (videoTrack) {
      await videoTrack.stop();
      setVideoTrack(undefined);
      setIsVideoEnabled(false);
    }
    if (audioTrack) {
      await audioTrack.stop();
      setAudioTrack(undefined);
      setIsAudioEnabled(false);
    }
  };

  return {
    room,
    isConnected,
    participants,
    isMuted,
    isVideoEnabled,
    isAudioEnabled,
    remoteTracks,
    localTracks: {
      video: videoTrack,
      audio: audioTrack
    },
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    switchCamera,
    startVideo,
    stopVideo
  };
}
```

#### Task 3.4: Frontend - Voice Call Screen

**File:** `mobile/app/call/[userId].tsx`
```typescript
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Avatar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLiveKit } from '../../hooks/useLiveKit';
import { api } from '../../services/api';

export default function CallScreen() {
  const router = useRouter();
  const { userId, callType } = useLocalSearchParams<{
    userId: string;
    callType: 'audio' | 'video';
  }>();

  const [callData, setCallData] = useState<any>(null);
  const [callStatus, setCallStatus] = useState('connecting');
  const [startTime, setStartTime] = useState<Date | null>(null);

  const {
    room,
    isConnected,
    participants,
    isMuted,
    isVideoEnabled,
    isAudioEnabled,
    remoteTracks,
    localTracks,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    startVideo,
    stopVideo
  } = useLiveKit();

  useEffect(() => {
    initiateCall();

    return () => {
      endCall();
    };
  }, []);

  useEffect(() => {
    if (participants.length > 0) {
      setCallStatus('connected');
      setStartTime(new Date());
    }
  }, [participants]);

  const initiateCall = async () => {
    try {
      const response = await api.post('/calls/initiate', {
        receiverId: userId,
        callType
      });

      const { call } = response.data;
      setCallData(call);

      // Join LiveKit room
      if (callType === 'video') {
        await startVideo();
      }

      await connect(
        call.livekitServerUrl,
        call.callerToken,
        call.participantName
      );
    } catch (error) {
      console.error('Error initiating call:', error);
      setCallStatus('failed');
    }
  };

  const endCall = async () => {
    if (callData && startTime) {
      const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);

      try {
        await api.post(`/calls/${callData.id}/end`, { duration });
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }

    // Stop video tracks
    await stopVideo();

    // Disconnect from LiveKit room
    await disconnect();
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image size={100} source={{ uri: 'https://...' }} />
        <Text variant="headlineMedium" style={styles.name}>
          John Doe
        </Text>
        <Text variant="bodyMedium" style={styles.status}>
          {callStatus}
        </Text>
        {isConnected && (
          <Text variant="bodySmall" style={styles.participantCount}>
            {participants.length} participants
          </Text>
        )}
      </View>

      <View style={styles.controls}>
        <Button
          mode="contained"
          onPress={toggleAudio}
          icon={isMuted ? 'microphone-off' : 'microphone'}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </Button>

        <Button
          mode="contained"
          onPress={toggleVideo}
          icon={isVideoEnabled ? 'video' : 'video-off'}
          disabled={callType === 'audio'}
        >
          {isVideoEnabled ? 'Video On' : 'Video Off'}
        </Button>

        <Button
          mode="contained"
          onPress={endCall}
          icon="phone-hangup"
          buttonColor="red"
        >
          End Call
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: 'white',
    marginTop: 20,
  },
  status: {
    color: '#888',
    marginTop: 10,
  },
  participantCount: {
    color: '#aaa',
    marginTop: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 40,
  },
});
```

---

### PHASE 4: Razorpay Payment Integration (Days 10-12)

#### Task 4.1: Backend - Razorpay Service

**File:** `backend/src/config/razorpay.ts`
```typescript
import Razorpay from 'razorpay';
import crypto from 'crypto';

export class RazorpayService {
  private razorpay: Razorpay;
  private keySecret: string;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    this.keySecret = process.env.RAZORPAY_KEY_SECRET!;
  }

  // Create order for coin purchase
  async createOrder(amount: number, currency: string = 'INR') {
    const options = {
      amount: amount * 100, // Convert to paisa
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await this.razorpay.orders.create(options);
    return order;
  }

  // Verify payment signature
  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }

  // Create subscription
  async createSubscription(planId: string, totalCount: number = 12) {
    const subscription = await this.razorpay.subscriptions.create({
      plan_id: planId,
      total_count: totalCount,
      quantity: 1,
    });

    return subscription;
  }

  // Capture payment
  async capturePayment(paymentId: string, amount: number) {
    const payment = await this.razorpay.payments.capture(paymentId, amount * 100, 'INR');
    return payment;
  }
}
```

#### Task 4.2: Backend - Payment Controller

**File:** `backend/src/controllers/paymentController.ts`
```typescript
import { Request, Response } from 'express';
import { RazorpayService } from '../config/razorpay';
import { prisma } from '../config/database';

const razorpayService = new RazorpayService();

// Coin packages
const COIN_PACKAGES = {
  basic: { coins: 100, price: 49 },
  standard: { coins: 250, price: 99 },
  premium: { coins: 600, price: 249 },
  ultimate: { coins: 1500, price: 499 },
};

export class PaymentController {
  // POST /api/payments/create-order
  async createOrder(req: Request, res: Response) {
    try {
      const { packageType } = req.body; // 'basic' | 'standard' | 'premium' | 'ultimate'
      const userId = req.user.id;

      const package = COIN_PACKAGES[packageType as keyof typeof COIN_PACKAGES];
      if (!package) {
        return res.status(400).json({
          success: false,
          message: 'Invalid package type'
        });
      }

      // Create Razorpay order
      const order = await razorpayService.createOrder(package.price);

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'coin_purchase',
          amount: package.price * 100, // Store in paisa
          coins: package.coins,
          status: 'pending',
          razorpayOrderId: order.id,
          currency: 'INR'
        }
      });

      res.json({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID
        },
        transaction: {
          id: transaction.id,
          coins: transaction.coins
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/payments/verify
  async verifyPayment(req: Request, res: Response) {
    try {
      const { orderId, paymentId, signature, transactionId } = req.body;
      const userId = req.user.id;

      // Verify signature
      const isValid = razorpayService.verifyPayment(orderId, paymentId, signature);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      // Update transaction
      const transaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'success',
          razorpayPaymentId: paymentId,
          razorpaySignature: signature
        }
      });

      // Credit coins to user
      await prisma.user.update({
        where: { id: userId },
        data: {
          coins: {
            increment: transaction.coins!
          }
        }
      });

      // Get updated user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { coins: true }
      });

      res.json({
        success: true,
        message: `${transaction.coins} coins credited successfully`,
        coins: user?.coins
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/webhooks/razorpay
  async webhookHandler(req: Request, res: Response) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(400).json({ success: false });
      }

      const event = req.body.event;
      const payload = req.body.payload.payment.entity;

      switch (event) {
        case 'payment.captured':
          // Handle successful payment
          console.log('Payment captured:', payload.id);
          break;

        case 'payment.failed':
          // Handle failed payment
          await prisma.transaction.updateMany({
            where: { razorpayPaymentId: payload.id },
            data: { status: 'failed' }
          });
          break;

        default:
          console.log('Unhandled event:', event);
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/payments/history
  async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      res.json({
        success: true,
        transactions
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
```

#### Task 4.3: Frontend - Razorpay Hook

**File:** `mobile/hooks/usePayment.ts`
```typescript
import { useState } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const { updateCoins } = useAuthStore();

  const purchaseCoins = async (packageType: string) => {
    setLoading(true);

    try {
      // Create order
      const { data } = await api.post('/payments/create-order', { packageType });
      const { order, transaction } = data;

      // Open Razorpay checkout
      const options = {
        description: `Purchase ${transaction.coins} coins`,
        image: 'https://your-logo-url.com/logo.png',
        currency: order.currency,
        key: order.keyId,
        amount: order.amount,
        name: 'Banter',
        order_id: order.id,
        prefill: {
          contact: '',
          name: ''
        },
        theme: { color: '#6200EE' }
      };

      const paymentResult = await RazorpayCheckout.open(options);

      // Verify payment
      const verifyResponse = await api.post('/payments/verify', {
        orderId: order.id,
        paymentId: paymentResult.razorpay_payment_id,
        signature: paymentResult.razorpay_signature,
        transactionId: transaction.id
      });

      // Update coins in store
      updateCoins(verifyResponse.data.coins);

      return {
        success: true,
        coins: verifyResponse.data.coins,
        message: verifyResponse.data.message
      };
    } catch (error: any) {
      console.error('Payment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Payment failed'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    purchaseCoins
  };
}
```

#### Task 4.4: Frontend - Coin Purchase Screen

**File:** `mobile/app/payment/coins.tsx`
```typescript
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { usePayment } from '../../hooks/usePayment';
import { useAuthStore } from '../../store/authStore';

const COIN_PACKAGES = [
  { id: 'basic', coins: 100, price: '₹49', popular: false },
  { id: 'standard', coins: 250, price: '₹99', popular: true },
  { id: 'premium', coins: 600, price: '₹249', popular: false },
  { id: 'ultimate', coins: 1500, price: '₹499', popular: false },
];

export default function CoinsScreen() {
  const { user } = useAuthStore();
  const { loading, purchaseCoins } = usePayment();

  const handlePurchase = async (packageType: string) => {
    const result = await purchaseCoins(packageType);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Buy Coins</Text>
        <Text variant="bodyMedium">Your balance: {user?.coins} coins</Text>
      </View>

      {COIN_PACKAGES.map((pkg) => (
        <Card key={pkg.id} style={styles.card}>
          {pkg.popular && (
            <Card.Title title="MOST POPULAR" titleStyle={styles.badge} />
          )}
          <Card.Content>
            <Text variant="headlineSmall">{pkg.coins} Coins</Text>
            <Text variant="bodyLarge" style={styles.price}>{pkg.price}</Text>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => handlePurchase(pkg.id)}
              loading={loading}
              disabled={loading}
            >
              Purchase
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 15,
  },
  badge: {
    color: '#6200EE',
    fontSize: 12,
  },
  price: {
    marginTop: 10,
    fontWeight: 'bold',
  },
});
```

---

## Appendix A: Environment Setup Checklist

- [ ] Node.js 20 LTS installed
- [ ] Azure CLI installed and logged in
- [ ] Expo CLI installed globally (`npm install -g @expo/cli`)
- [ ] PostgreSQL client installed (for local testing)
- [ ] Redis client installed (for local testing)
- [ ] iOS Simulator / Android Emulator setup
- [ ] Expo Go app installed on physical devices (iOS & Android)
- [ ] Azure account with active subscription
- [ ] Azure resources created (PostgreSQL, Redis, Blob Storage, App Service)
- [ ] Firebase project created with Phone Auth enabled
- [ ] Firebase Admin credentials downloaded
- [ ] LiveKit server and COTURN server configured
- [ ] Razorpay account created with test/live keys
- [ ] Environment variables configured (backend & mobile)
- [ ] `google-services.json` added to Android project
- [ ] `GoogleService-Info.plist` added to iOS project

---

## Appendix B: Cost Estimation (Indian Market)

### Monthly Costs for 10K Active Users

**Azure Services:**
- PostgreSQL (B1ms): ₹1,250 ($15)
- Redis (C0): ₹1,250 ($15)
- App Service (B1): ₹1,100 ($13)
- Blob Storage: ₹200-800 ($2-10)
- Application Insights: FREE (within free tier)
- **Subtotal: ₹3,800-5,200 ($45-62)**

**Third-Party Services:**
- Firebase Auth: FREE-₹500 (FREE for first 10K)
- LiveKit + COTURN: FREE (self-hosted)
- FCM Push: FREE
- **Subtotal: FREE (no additional costs!)**

**Payment Processing:**
- Razorpay: 2% per transaction (variable based on revenue)

**Total Fixed Costs: ₹3,800-5,200/month ($45-62)**

### Cost Comparison with Previous Plan:

| Service | Previous (Agora.io) | Current (LiveKit) | Savings |
|---------|----------------------|-------------------|---------|
| Voice/Video | Agora ₹150/month | LiveKit FREE | ₹150/month |
| WebRTC Quality | Good | Excellent | Better control |
| Infrastructure | Managed | Self-hosted | More control |
| Scalability | Limited | Unlimited | Unlimited |

**Total Monthly Savings: ₹150/month while gaining full control over WebRTC infrastructure!**

---

## Appendix C: Deployment Checklist

### Pre-deployment:
- [ ] All environment variables configured in Azure App Service
- [ ] Database migrations run on production database
- [ ] Firebase project configured for production
- [ ] LiveKit server deployed with COTURN server
- [ ] Razorpay live keys configured
- [ ] SSL certificates configured
- [ ] CORS configured correctly
- [ ] Rate limiting configured
- [ ] Monitoring and logging setup

### Post-deployment:
- [ ] Test OTP flow end-to-end
- [ ] Test voice/video calls with LiveKit
- [ ] Test payment flow with test cards
- [ ] Verify push notifications
- [ ] Check API response times
- [ ] Monitor error rates
- [ ] Test on real devices (iOS & Android)
- [ ] Load test with expected traffic

---

## Appendix D: Quick Start Commands

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Start LiveKit server
livekit-server --config ./livekit.yaml

# Start COTURN server
turnserver -c /etc/turnserver.conf

# Mobile
cd mobile
npm install
npx expo start

# Test on device
# Scan QR code with Expo Go

# Build for production
cd mobile
eas build --profile production --platform all
```

---

**End of Requirements Document v3.0**

**Key Updates:**
1. ✅ Firebase Authentication replaces Azure SMS (70% cost savings)
2. ✅ **LiveKit replaces Agora.io** - Open source WebRTC with full control
3. ✅ COTURN server setup for NAT traversal
4. ✅ Razorpay for Indian payment gateway
5. ✅ Complete code examples for all integrations
6. ✅ Indian market optimizations (₹ pricing, +91 default)
7. ✅ **Major cost savings: ₹150/month while gaining control over WebRTC**

**Infrastructure Ownership:**
- **100% Self-Hosted**: LiveKit + COTURN servers
- **No Third-Party Dependencies** for real-time communication
- **Complete Control**: Scale and optimize as needed
- **No Per-Minute Charges**: Predictable costs at any scale

**WebRTC Quality Benefits:**
- **Open Source**: Community support and customization
- **Full Control**: Optimize for Indian network conditions
- **Scalable**: Handle unlimited participants
- **Advanced Features**: Screen sharing, recording, analytics
- **No Vendor Lock-in**: Migrate or modify as needed