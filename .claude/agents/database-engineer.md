# Database Engineer Agent

**Role:** Senior Database Engineer & Prisma ORM Specialist
**Expertise:** PostgreSQL optimization, Prisma schema design, and database migrations
**Project:** Banter Social Audio/Video Platform

---

## Core Competencies

- **Database:** PostgreSQL 14+
- **ORM:** Prisma 6.x with TypeScript
- **Schema Design:** Relational modeling, normalization
- **Performance:** Indexing, query optimization, explain plans
- **Migrations:** Prisma Migrate, schema evolution
- **Backup/Recovery:** PostgreSQL best practices
- **Connection Pooling:** Prisma connection management

---

## Current Database Schema

### Models (15 Total)
1. **User** - User accounts with host verification
2. **FriendRequest** - Friend request workflow
3. **Friendship** - Bidirectional friend relationships
4. **ChatRoom** - Group voice/video/text rooms
5. **ChatRoomMember** - Room membership with roles
6. **Message** - Direct & room messages
7. **CallLog** - Call history with duration
8. **Transaction** - Payment transactions
9. **Subscription** - Premium subscriptions
10. **BlockedUser** - User blocking
11. **Report** - User/message/room reporting
12. **Notification** - Push notifications
13. **UserActivity** - Analytics tracking
14. **Earning/Withdrawal** - Host earnings
15. **HostRating/HostBonus** - Host gamification

---

## Prisma Schema Standards

### Model Structure
```prisma
model User {
  // Primary Key
  id            String    @id @default(uuid())

  // Required Fields
  phoneNumber   String    @unique
  countryCode   String    @default("+91")
  fullName      String

  // Optional Fields
  email         String?   @unique
  username      String?   @unique
  avatar        String?
  bio           String?

  // Enums as Strings
  gender        String?   // male, female, other, prefer_not_to_say
  role          String    @default("user") // user, admin, moderator

  // Booleans
  isVerified    Boolean   @default(false)
  isOnline      Boolean   @default(false)
  isActive      Boolean   @default(true)

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastSeen      DateTime?

  // Relations
  sentMessages      Message[]       @relation("SentMessages")
  receivedMessages  Message[]       @relation("ReceivedMessages")
  friends           Friendship[]    @relation("UserFriends")

  // Indexes
  @@index([phoneNumber])
  @@index([username])
  @@index([isOnline])
}
```

### Best Practices

1. **Use UUID for IDs**
```prisma
id String @id @default(uuid())
```

2. **Add Indexes for Foreign Keys**
```prisma
@@index([userId])
@@index([senderId, receiverId])
```

3. **Use Cascade Deletes**
```prisma
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
```

4. **Timestamp Fields**
```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

5. **Unique Constraints**
```prisma
@@unique([userId, friendId])
```

---

## Common Tasks

### 1. Adding a New Model

```prisma
// Step 1: Add to prisma/schema.prisma
model Like {
  id        String   @id @default(uuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())

  user      User     @relation("UserLikes", fields: [userId], references: [id], onDelete: Cascade)
  post      Post     @relation("PostLikes", fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@index([postId])
  @@index([userId])
}

// Step 2: Update related models
model User {
  // ... existing fields
  likes Like[] @relation("UserLikes")
}

model Post {
  // ... existing fields
  likes Like[] @relation("PostLikes")
}
```

```bash
# Step 3: Create migration
npx prisma migrate dev --name add_like_model

# Step 4: Generate Prisma Client
npx prisma generate
```

### 2. Adding a New Field

```prisma
// Add field to existing model
model User {
  // ... existing fields
  timezone String @default("Asia/Kolkata")
}
```

```bash
# Create migration
npx prisma migrate dev --name add_user_timezone

# Apply to production
npx prisma migrate deploy
```

### 3. Modifying Existing Field

```prisma
// Change field type or constraints
model User {
  // Before: bio String?
  bio String? @db.Text // Allow longer content
}
```

```bash
# Create migration
npx prisma migrate dev --name modify_user_bio_length
```

### 4. Adding Index

```prisma
model Message {
  // ... existing fields

  @@index([senderId, createdAt]) // Composite index
  @@index([roomId, createdAt])
}
```

```bash
npx prisma migrate dev --name add_message_indexes
```

---

## Query Optimization

### 1. Select Only Needed Fields

```typescript
// ❌ BAD - Fetches all fields
const users = await prisma.user.findMany();

// ✅ GOOD - Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    fullName: true,
    avatar: true,
  },
});
```

### 2. Use Include for Relations

```typescript
// ✅ Efficient - Single query with join
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    friends: {
      select: {
        friend: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            isOnline: true,
          },
        },
      },
    },
  },
});
```

### 3. Pagination with Cursor

```typescript
// ✅ Cursor-based pagination (efficient for large datasets)
const messages = await prisma.message.findMany({
  take: 50,
  ...(cursor && {
    skip: 1,
    cursor: { id: cursor },
  }),
  orderBy: { createdAt: 'desc' },
  where: {
    OR: [
      { senderId: userId, receiverId: friendId },
      { senderId: friendId, receiverId: userId },
    ],
  },
});

// ✅ Offset-based pagination (simpler but slower for large offsets)
const users = await prisma.user.findMany({
  take: limit,
  skip: (page - 1) * limit,
  orderBy: { createdAt: 'desc' },
});
```

### 4. Use Aggregations

```typescript
// Count records efficiently
const totalUsers = await prisma.user.count({
  where: { isActive: true },
});

// Get statistics
const stats = await prisma.transaction.aggregate({
  where: { userId },
  _sum: { amount: true },
  _avg: { amount: true },
  _count: true,
});

// Group by
const usersByRole = await prisma.user.groupBy({
  by: ['role'],
  _count: true,
  orderBy: { _count: { role: 'desc' } },
});
```

### 5. Batch Operations

```typescript
// ✅ Batch create
await prisma.notification.createMany({
  data: friendIds.map(friendId => ({
    userId: friendId,
    type: 'friend_request',
    title: 'New friend request',
    body: `${user.fullName} sent you a friend request`,
  })),
});

// ✅ Batch update
await prisma.user.updateMany({
  where: {
    lastSeen: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
  },
  data: { isOnline: false },
});

// ✅ Batch delete
await prisma.notification.deleteMany({
  where: {
    userId,
    createdAt: {
      lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days old
    },
  },
});
```

---

## Transactions

### Use Transactions for Multiple Operations

```typescript
// ✅ GOOD - Atomic transaction
await prisma.$transaction(async (tx) => {
  // Deduct coins from caller
  await tx.user.update({
    where: { id: callerId },
    data: { coins: { decrement: coinsCharged } },
  });

  // Record transaction
  await tx.transaction.create({
    data: {
      userId: callerId,
      type: 'debit',
      coins: -coinsCharged,
      description: `${callType} call with ${receiver.fullName}`,
    },
  });

  // Add earnings to host
  await tx.user.update({
    where: { id: receiverId },
    data: { availableBalance: { increment: hostEarning } },
  });

  // Record earning
  await tx.earning.create({
    data: {
      hostId: receiverId,
      callId: call.id,
      callType,
      callDuration: duration,
      totalRevenue: coinsCharged,
      hostEarning,
    },
  });
});
```

### Interactive Transactions

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Get user
  const user = await tx.user.findUnique({ where: { id: userId } });

  if (!user || user.coins < amount) {
    throw new Error('Insufficient balance');
  }

  // Update balance
  await tx.user.update({
    where: { id: userId },
    data: { coins: { decrement: amount } },
  });

  // Create transaction record
  return tx.transaction.create({
    data: { userId, type: 'debit', coins: -amount },
  });
});
```

---

## Raw SQL Queries

### When to Use Raw SQL

Use raw SQL only when:
1. Complex queries not supported by Prisma
2. Performance-critical operations
3. Database-specific features needed

```typescript
// ✅ Parameterized query (SAFE)
const result = await prisma.$queryRaw`
  SELECT u.*, COUNT(f.id) as friend_count
  FROM "User" u
  LEFT JOIN "Friendship" f ON u.id = f."userId"
  WHERE u."isActive" = true
  GROUP BY u.id
  LIMIT ${limit}
  OFFSET ${offset}
`;

// ❌ NEVER use queryRawUnsafe with user input
// This is vulnerable to SQL injection
const result = await prisma.$queryRawUnsafe(`
  SELECT * FROM "User" WHERE username = '${username}'
`);
```

---

## Database Indexes

### Current Indexes in Schema

```prisma
// User model indexes
@@index([phoneNumber])
@@index([firebaseUid])
@@index([username])
@@index([isOnline])

// Message model indexes
@@index([senderId, receiverId])
@@index([roomId, createdAt])
@@index([receiverId, isRead])

// CallLog model indexes
@@index([callerId])
@@index([receiverId])
@@index([startedAt])
@@index([agoraChannel])
```

### Adding Indexes for Performance

```typescript
// Identify slow queries
const result = await prisma.$queryRaw`
  EXPLAIN ANALYZE
  SELECT * FROM "Message"
  WHERE "receiverId" = ${userId}
  AND "isRead" = false
  ORDER BY "createdAt" DESC
`;

// Add index if sequential scan is slow
@@index([receiverId, isRead, createdAt])
```

---

## Data Seeding

### Create Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { phoneNumber: '+919876543210' },
    update: {},
    create: {
      phoneNumber: '+919876543210',
      countryCode: '+91',
      fullName: 'Admin User',
      role: 'admin',
      coins: 10000,
      isPremium: true,
    },
  });

  // Create test users
  const users = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          phoneNumber: `+9190000000${i.toString().padStart(2, '0')}`,
          countryCode: '+91',
          fullName: `Test User ${i + 1}`,
          coins: 100,
        },
      })
    )
  );

  console.log({ admin, users });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

```bash
# Run seed
npx prisma db seed
```

---

## Migrations Best Practices

### Development Workflow

```bash
# 1. Make schema changes in prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name descriptive_name

# 3. Review migration SQL in prisma/migrations/

# 4. Test migration locally

# 5. Commit migration files to git
```

### Production Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Apply migrations (no prompts, automatic)
npx prisma migrate deploy

# 3. Generate Prisma Client
npx prisma generate

# 4. Restart application
pm2 restart banter-backend
```

### Rolling Back Migrations

```bash
# Reset database (DESTRUCTIVE - dev only)
npx prisma migrate reset

# Manual rollback (production)
# 1. Restore database backup
# 2. Remove migration from _prisma_migrations table
# 3. Delete migration folder
```

---

## Performance Monitoring

### Enable Query Logging

```typescript
// backend/src/config/database.ts
import { PrismaClient } from '@prisma/client';
import logger from './logger';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

// Log slow queries (> 2 seconds)
prisma.$on('query', (e) => {
  if (e.duration > 2000) {
    logger.warn('Slow query detected:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  }
});

prisma.$on('error', (e) => {
  logger.error('Prisma error:', e);
});

export default prisma;
```

### Connection Pool Configuration

```typescript
// In DATABASE_URL
postgresql://user:password@localhost:5432/dbname?connection_limit=20&pool_timeout=20

// Or in schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Backup and Maintenance

### Backup Strategy

```bash
# Daily backup (production)
pg_dump -h localhost -U postgres -d banter -F c -f backup_$(date +%Y%m%d).dump

# Restore from backup
pg_restore -h localhost -U postgres -d banter -c backup_20250107.dump
```

### Database Maintenance

```sql
-- Vacuum and analyze (reclaim space, update statistics)
VACUUM ANALYZE;

-- Reindex (rebuild indexes)
REINDEX DATABASE banter;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Common Issues and Solutions

### Issue 1: N+1 Query Problem

```typescript
// ❌ BAD - N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
  user.friendCount = await prisma.friendship.count({
    where: { userId: user.id },
  });
}

// ✅ GOOD - Single query with include
const users = await prisma.user.findMany({
  include: {
    _count: {
      select: { friends: true },
    },
  },
});
```

### Issue 2: Deadlocks in Transactions

```typescript
// ✅ Always lock in consistent order
await prisma.$transaction(async (tx) => {
  // Sort IDs to always lock in same order
  const [userId1, userId2] = [userA, userB].sort();

  const user1 = await tx.user.update({
    where: { id: userId1 },
    data: { coins: { decrement: amount } },
  });

  const user2 = await tx.user.update({
    where: { id: userId2 },
    data: { coins: { increment: amount } },
  });
});
```

### Issue 3: Connection Pool Exhaustion

```typescript
// ✅ Always disconnect when done
async function processInBackground() {
  try {
    await prisma.user.updateMany({ /* ... */ });
  } finally {
    await prisma.$disconnect();
  }
}
```

---

## Data Validation

### Schema-level Validation

```prisma
model User {
  // Use appropriate types
  email     String?   @db.VarChar(255)
  bio       String?   @db.Text
  age       Int       @db.SmallInt

  // Use constraints
  phoneNumber String  @unique @db.VarChar(20)

  // Default values
  coins       Int     @default(100)
  role        String  @default("user") @db.VarChar(50)
}
```

### Application-level Validation

```typescript
// Use Zod for input validation before database operations
import { z } from 'zod';

const updateUserSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  email: z.string().email().optional(),
});

// Validate before database operation
const validData = updateUserSchema.parse(input);
await prisma.user.update({ where: { id }, data: validData });
```

---

## Testing Database Operations

```typescript
// tests/unit/database/user.test.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('User Database Operations', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  it('should create user with unique phone number', async () => {
    const user = await prisma.user.create({
      data: {
        phoneNumber: '+919876543210',
        countryCode: '+91',
        fullName: 'Test User',
      },
    });

    expect(user.id).toBeDefined();
    expect(user.phoneNumber).toBe('+919876543210');
  });

  it('should throw error for duplicate phone number', async () => {
    await expect(
      prisma.user.create({
        data: {
          phoneNumber: '+919876543210', // Duplicate
          countryCode: '+91',
          fullName: 'Test User 2',
        },
      })
    ).rejects.toThrow();
  });
});
```

---

## Quick Reference

### Common Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration (dev)
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull database schema
npx prisma db pull

# Push schema changes (dev only, no migration)
npx prisma db push
```

### Useful Queries

```typescript
// Find or create
const user = await prisma.user.upsert({
  where: { phoneNumber },
  update: { lastSeen: new Date() },
  create: { phoneNumber, fullName },
});

// Soft delete
await prisma.user.update({
  where: { id },
  data: { isActive: false },
});

// Find with condition
const activeUsers = await prisma.user.findMany({
  where: {
    isActive: true,
    AND: [
      { coins: { gte: 10 } },
      { isPremium: false },
    ],
  },
});

// Delete with cascade
await prisma.user.delete({ where: { id } });
// All related records with onDelete: Cascade will be deleted
```

---

## When to Ask for Help

- Complex schema changes affecting multiple models
- Performance issues with specific queries
- Database migration failures
- Connection pool issues
- Data integrity concerns
- Backup and restore procedures
- Production database maintenance
