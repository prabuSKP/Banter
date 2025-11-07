# Banter - Database Schema Overview

## Database System
- **Type**: PostgreSQL 14+
- **ORM**: Prisma
- **Location**: `backend/prisma/schema.prisma`
- **Migrations**: `backend/prisma/migrations/`

## Models Overview (13 Total)

### 1. User
Primary user account model with Firebase authentication.

**Key Fields:**
- `id` (UUID, primary key)
- `phoneNumber` (unique, indexed)
- `firebaseUid` (unique, nullable)
- `displayName`, `avatarUrl`, `bio`
- `coins` (integer, for in-app purchases)
- `isPremium` (boolean)
- `isActive` (boolean, for soft delete)
- `countryCode`
- `lastActiveAt`, `createdAt`, `updatedAt`

**Host System Fields:**
- `isHost` - Whether user is a verified host
- `hostVerificationStatus` - pending, approved, rejected
- `hostAppliedAt`, `hostVerifiedAt`, `hostRejectedAt`
- `hostRejectionReason`
- `hostDocuments` (array of URLs)
- `hostRating` (float, average rating)
- `totalEarnings`, `availableBalance`, `totalWithdrawn`
- `totalCallsAsHost`, `totalMinutesAsHost`

**Relations:**
- Multiple friendships, messages, calls
- Sent and received friend requests
- Chat room memberships
- Transactions, subscriptions
- Host earnings, withdrawals, ratings, bonuses

### 2. FriendRequest
Friend request tracking.

**Key Fields:**
- `id` (UUID)
- `senderId`, `receiverId` (foreign keys to User)
- `status` - pending, accepted, rejected
- `createdAt`, `respondedAt`

**Relations:**
- Belongs to sender (User)
- Belongs to receiver (User)

### 3. Friendship
Bidirectional friend relationships.

**Key Fields:**
- `id` (UUID)
- `userId`, `friendId` (foreign keys to User)
- `createdAt`

**Relations:**
- Belongs to user (User)
- Belongs to friend (User)

### 4. ChatRoom
Group chat rooms (public or private).

**Key Fields:**
- `id` (UUID)
- `name`, `description`, `imageUrl`
- `isPublic` (boolean)
- `maxMembers` (integer)
- `creatorId` (foreign key to User)
- `createdAt`, `updatedAt`

**Relations:**
- Created by user (User)
- Has many members (ChatRoomMember)
- Has many messages (Message)

### 5. ChatRoomMember
Room membership tracking.

**Key Fields:**
- `id` (UUID)
- `roomId`, `userId` (foreign keys)
- `role` - member, moderator, admin
- `joinedAt`, `leftAt`

**Relations:**
- Belongs to room (ChatRoom)
- Belongs to user (User)

### 6. Message
Text and media messages.

**Key Fields:**
- `id` (UUID)
- `senderId`, `receiverId` (foreign keys to User, both nullable)
- `roomId` (foreign key to ChatRoom, nullable)
- `content` (text, nullable)
- `messageType` - text, image, audio, video, gif
- `mediaUrl` (nullable)
- `isRead` (boolean)
- `readAt`, `createdAt`, `updatedAt`, `deletedAt`

**Relations:**
- Belongs to sender (User)
- Belongs to receiver (User, nullable for group messages)
- Belongs to room (ChatRoom, nullable for direct messages)

**Note:** Messages can be either direct (sender + receiver) or room-based (sender + roomId)

### 7. CallLog
Voice and video call history.

**Key Fields:**
- `id` (UUID)
- `callerId`, `receiverId` (foreign keys to User)
- `callType` - audio, video
- `status` - initiated, ringing, answered, missed, ended, declined, failed
- `duration` (integer, seconds)
- `agoraChannelName` (unique)
- `agoraToken`
- `startedAt`, `endedAt`, `createdAt`
- `coinsCharged` (integer, nullable)

**Relations:**
- Belongs to caller (User)
- Belongs to receiver (User)
- Has one earning record (Earning, optional)

**Integration:** Agora.io for RTC, automatic earnings calculation for hosts

### 8. Transaction
Payment transaction records.

**Key Fields:**
- `id` (UUID)
- `userId` (foreign key to User)
- `type` - purchase, earning, refund, withdrawal
- `amount` (float, in INR)
- `coins` (integer, nullable)
- `status` - pending, completed, failed
- `razorpayOrderId`, `razorpayPaymentId`
- `createdAt`, `completedAt`

**Relations:**
- Belongs to user (User)

### 9. Subscription
Premium subscription tracking.

**Key Fields:**
- `id` (UUID)
- `userId` (foreign key to User)
- `plan` - monthly, yearly
- `status` - active, cancelled, expired
- `startDate`, `endDate`
- `autoRenew` (boolean)
- `razorpaySubscriptionId`
- `createdAt`, `updatedAt`

**Relations:**
- Belongs to user (User)

### 10. BlockedUser
User blocking relationships.

**Key Fields:**
- `id` (UUID)
- `blockerId`, `blockedId` (foreign keys to User)
- `createdAt`

**Relations:**
- Belongs to blocker (User)
- Belongs to blocked user (User)

### 11. Report
User report tracking.

**Key Fields:**
- `id` (UUID)
- `reporterId`, `reportedId` (foreign keys to User)
- `reason`, `details`
- `status` - pending, reviewed, resolved
- `createdAt`, `resolvedAt`

**Relations:**
- Belongs to reporter (User)
- Belongs to reported user (User)

### 12. Notification
Push notification records.

**Key Fields:**
- `id` (UUID)
- `userId` (foreign key to User)
- `title`, `body`
- `type` - friend_request, message, call, system
- `data` (JSON)
- `isRead` (boolean)
- `createdAt`, `readAt`

**Relations:**
- Belongs to user (User)

### 13. UserActivity
Analytics and user activity tracking.

**Key Fields:**
- `id` (UUID)
- `userId` (foreign key to User)
- `activityType` - login, logout, call, message, purchase
- `metadata` (JSON)
- `createdAt`

**Relations:**
- Belongs to user (User)

## Host Earnings System Models

### 14. Earning
Host earnings from calls.

**Key Fields:**
- `id` (UUID)
- `hostId` (foreign key to User)
- `callId` (foreign key to CallLog, unique)
- `callType` - audio, video
- `callDuration` (integer, seconds)
- `totalRevenue` (float, in INR)
- `hostShare` (float, percentage 15% or 30%)
- `hostEarning` (float, in INR)
- `status` - pending, processed
- `processedAt`, `createdAt`

**Relations:**
- Belongs to host (User)
- Belongs to call (CallLog)

**Earning Rates:**
- Video calls: 30% of revenue
- Audio calls: 15% of revenue
- Conversion: 10 coins = ₹1

### 15. Withdrawal
Host withdrawal requests.

**Key Fields:**
- `id` (UUID)
- `userId` (foreign key to User)
- `amount` (float, minimum ₹500)
- `method` - upi, bank_transfer, wallet
- `status` - pending, processing, completed, rejected
- `upiId`, `accountNumber`, `ifscCode`, `accountHolderName`
- `transactionId` (unique, nullable)
- `processedBy` (foreign key to User, nullable)
- `remarks`
- `createdAt`, `processedAt`

**Relations:**
- Belongs to user (User)
- Processed by admin (User, nullable)

### 16. HostRating
Host ratings from callers.

**Key Fields:**
- `id` (UUID)
- `hostId`, `callerId` (foreign keys to User)
- `callId` (foreign key to CallLog, unique)
- `rating` (integer, 1-5 stars)
- `feedback` (text, nullable)
- `createdAt`

**Relations:**
- Belongs to host (User)
- Belongs to caller (User)
- Belongs to call (CallLog)

### 17. HostBonus
Performance bonuses for hosts.

**Key Fields:**
- `id` (UUID)
- `hostId` (foreign key to User)
- `bonusType` - high_rating, long_hours, milestone, referral
- `amount` (float, in INR)
- `description`
- `metadata` (JSON)
- `creditedAt`

**Relations:**
- Belongs to host (User)

## Important Indexes

The schema includes indexes on frequently queried fields:
- User: `phoneNumber`, `firebaseUid`
- Message: `senderId`, `receiverId`, `roomId`
- CallLog: `callerId`, `receiverId`, `agoraChannelName`
- Friendship: `userId`, `friendId`
- And others for foreign keys

## Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Schema Location
Full schema definition: `backend/prisma/schema.prisma`

## Key Relationships

1. **User ↔ User**: Friendships (bidirectional via Friendship)
2. **User ↔ User**: Friend Requests (via FriendRequest)
3. **User ↔ User**: Direct Messages (via Message)
4. **User ↔ ChatRoom**: Room Membership (via ChatRoomMember)
5. **User ↔ User**: Voice/Video Calls (via CallLog)
6. **User ↔ Transaction**: Payments and Earnings
7. **Host (User) ↔ Earning**: Call earnings
8. **Host (User) ↔ Withdrawal**: Withdrawal requests
9. **Host (User) ↔ HostRating**: Ratings from callers
10. **CallLog ↔ Earning**: One-to-one (one earning per call)

## Soft Deletes

The User model uses soft deletes:
- `isActive` field marks active/deleted status
- `phoneNumber` is prefixed with `deleted_` on deletion
- `firebaseUid` is set to null on deletion
