# Host Verification & Earnings System

## Overview

The Host Verification & Earnings System allows verified users to earn money from receiving video and audio calls on the Banter platform. Only verified hosts can start earning, and the system includes a complete onboarding process, earnings tracking, withdrawal management, and performance bonuses.

## Key Features

### 1. Host Verification Process

- **Application Submission**: Users can apply to become hosts by submitting verification documents
- **Admin Review**: Admins can approve or reject host applications
- **Verification Status**: Tracks application status (pending, approved, rejected)
- **Document Verification**: Requires submission of verification documents (ID proof, address proof, etc.)

### 2. Earning System

#### Earning Rates
- **Video Calls**: 30% of total call revenue
- **Audio Calls**: 15% of total call revenue
- **Currency Conversion**: 10 coins = ₹1 (COIN_TO_INR_RATE = 0.1)

#### Automatic Earnings
- Earnings are automatically calculated and credited when a call is completed
- Only applies to verified hosts (isHost = true)
- Requires successful call completion with duration > 0
- Earnings are recorded in the database with full audit trail

#### Example Calculation
```
Video Call: 100 coins charged
- Total Revenue: 100 × 0.1 = ₹10
- Host Share: 30%
- Host Earning: ₹10 × 0.30 = ₹3

Audio Call: 100 coins charged
- Total Revenue: 100 × 0.1 = ₹10
- Host Share: 15%
- Host Earning: ₹10 × 0.15 = ₹1.5
```

### 3. Performance Bonuses

The system supports automatic bonus awards for:
- **High Rating Bonus**: For maintaining excellent ratings
- **Long Hours Bonus**: For completing many call hours
- **Milestone Bonus**: For reaching specific achievements
- **Referral Bonus**: For referring new hosts

### 4. Withdrawal System

#### Withdrawal Options
- **UPI**: Instant transfer to UPI ID
- **Bank Transfer**: Direct bank account transfer
- **Wallet**: Credit to in-app wallet

#### Withdrawal Rules
- **Minimum Amount**: ₹500
- **Processing Time**: 3-5 business days
- **Workflow**: Request → Pending → Processing → Completed
- **Security**: Balance is deducted immediately upon request

### 5. Rating & Feedback System

- Callers can rate hosts after completed calls (1-5 stars)
- Optional feedback text
- Average rating is automatically calculated and updated
- Ratings are tied to specific calls to prevent duplicates

## Database Schema

### User Model Extensions
```prisma
isHost                Boolean   @default(false)
hostVerificationStatus String?  // pending, approved, rejected, null
hostAppliedAt         DateTime?
hostVerifiedAt        DateTime?
hostRejectedAt        DateTime?
hostRejectionReason   String?
hostDocuments         String[]  @default([])
hostRating            Float?    @default(0)
totalEarnings         Float     @default(0)
availableBalance      Float     @default(0)
totalWithdrawn        Float     @default(0)
totalCallsAsHost      Int       @default(0)
totalMinutesAsHost    Int       @default(0)
```

### New Models

#### Earning Model
```prisma
model Earning {
  id              String   @id @default(uuid())
  hostId          String
  callId          String   @unique
  callType        String   // audio, video
  callDuration    Int      // in seconds
  totalRevenue    Float    // in INR
  hostShare       Float    // percentage (15 or 30)
  hostEarning     Float    // in INR
  status          String   @default("pending")
  processedAt     DateTime?
  createdAt       DateTime @default(now())
}
```

#### Withdrawal Model
```prisma
model Withdrawal {
  id                String   @id @default(uuid())
  userId            String
  amount            Float
  method            String   // upi, bank_transfer, wallet
  status            String   @default("pending")
  upiId             String?
  accountNumber     String?
  ifscCode          String?
  accountHolderName String?
  transactionId     String?  @unique
  processedBy       String?
  remarks           String?
  createdAt         DateTime @default(now())
  processedAt       DateTime?
}
```

#### HostRating Model
```prisma
model HostRating {
  id          String   @id @default(uuid())
  hostId      String
  callerId    String
  callId      String   @unique
  rating      Int      // 1-5 stars
  feedback    String?
  createdAt   DateTime @default(now())
}
```

#### HostBonus Model
```prisma
model HostBonus {
  id          String   @id @default(uuid())
  hostId      String
  bonusType   String   // high_rating, long_hours, milestone, referral
  amount      Float
  description String
  metadata    Json?
  creditedAt  DateTime @default(now())
}
```

## Backend Implementation

### API Endpoints

#### User Endpoints (Authenticated)
- `POST /api/v1/host/apply` - Submit host application
- `GET /api/v1/host/dashboard` - Get host dashboard stats
- `GET /api/v1/host/earnings` - Get earnings history (paginated)
- `POST /api/v1/host/withdrawal` - Request withdrawal
- `POST /api/v1/host/rate` - Rate a host after call

#### Admin Endpoints (Admin Only)
- `POST /api/v1/host/approve/:userId` - Approve host application
- `POST /api/v1/host/reject/:userId` - Reject host application with reason

### Services

#### host.service.ts
- `applyAsHost()` - Handle host application submission
- `approveHost()` - Approve host application (admin)
- `rejectHost()` - Reject host application (admin)
- `recordEarning()` - Calculate and record earnings from calls
- `checkAndAwardBonuses()` - Check and award performance bonuses
- `requestWithdrawal()` - Handle withdrawal requests
- `getHostDashboard()` - Get dashboard statistics
- `getEarningsHistory()` - Get paginated earnings history
- `rateHost()` - Submit host rating

#### Integration with agora.service.ts
The `updateCallStatus()` method in agora.service.ts automatically triggers earnings calculation when:
1. Call status is 'completed'
2. Duration > 0
3. Coins were charged
4. Receiver is a verified host

```typescript
if (status === 'completed' && duration && duration > 0 &&
    coinsCharged > 0 && updatedCallLog.receiver?.isHost) {
  try {
    await hostService.recordEarning(
      callId,
      updatedCallLog.receiverId,
      updatedCallLog.callType as 'audio' | 'video',
      duration,
      coinsCharged
    );
  } catch (earningError) {
    logger.error('Failed to record host earnings:', earningError);
  }
}
```

## Mobile Implementation

### Screens

#### /host/apply.tsx
- Host application form
- Document URL submission
- Benefits and guidelines display
- Verification status check

#### /host/dashboard.tsx
- Earnings overview (available balance, total earnings, withdrawn)
- Performance stats (calls, minutes, rating)
- Quick action buttons
- Pending withdrawals notification

#### /host/earnings.tsx
- Paginated earnings history
- Detailed earning information per call
- Call type, duration, revenue breakdown
- Filtering and sorting

#### /host/withdrawal.tsx
- Withdrawal request form
- Payment method selection (UPI, Bank, Wallet)
- Payment details input
- Balance validation

### Components

#### RateHostDialog.tsx
- Post-call rating dialog
- 1-5 star rating selection
- Optional feedback text
- Appears automatically after calls with hosts

### Services & Stores

#### host.ts (Service)
- API communication for host operations
- Type definitions for host data

#### hostStore.ts (Zustand Store)
- Host state management
- Actions for all host operations
- Loading and error states

### Integration

#### Home Screen
- "Become a Host" banner for non-hosts
- "Host Dashboard" banner for verified hosts
- Conditional display based on verification status

#### Active Call Screen
- Rating dialog integration
- Automatic display after call ends with host
- Only shows for calls longer than 30 seconds

## Security & Compliance

### Zero-Tolerance Policy
- No harassment, hate speech, or inappropriate content
- Immediate account suspension for violations
- Professional conduct required at all times

### Privacy & Security
- Personal contact information sharing prohibited
- Payment details encrypted
- Secure withdrawal processing
- Audit trail for all earnings

### Admin Controls
- Manual approval of all host applications
- Document verification required
- Ability to suspend or revoke host status
- Withdrawal processing and monitoring

## Testing

### Backend Tests
- Unit tests for host.service.ts (11 test suites)
- Coverage for all major operations:
  - Application submission
  - Host approval/rejection
  - Earnings calculation (video/audio)
  - Withdrawal requests
  - Rating system
  - Dashboard data retrieval

### Test Files
- `backend/src/tests/services/host.service.test.ts`

## Future Enhancements

1. **Advanced Analytics**
   - Detailed performance insights
   - Earnings trends and forecasts
   - Peak calling hours analysis

2. **Automatic Payouts**
   - Scheduled weekly/monthly payouts
   - Direct bank integration
   - Automated tax documentation

3. **Host Levels**
   - Bronze, Silver, Gold, Platinum tiers
   - Tier-based earning percentages
   - Exclusive benefits per tier

4. **Advanced Bonuses**
   - Streak bonuses for consistent activity
   - Quality bonuses for high satisfaction
   - Seasonal promotions

5. **Host Training**
   - Onboarding tutorials
   - Best practices guides
   - Community support forum

## Migration Guide

To apply the database schema changes:

```bash
cd backend
npx prisma migrate dev --name add_host_earnings_system
```

This will:
1. Create migration files
2. Update the database schema
3. Generate new Prisma Client types

## Configuration

### Environment Variables
No new environment variables required. Uses existing:
- Database connection (DATABASE_URL)
- API keys for payment processing (if applicable)

### Constants

#### Backend (host.service.ts)
```typescript
EARNING_RATES = {
  AUDIO_CALL_PERCENTAGE: 0.15,  // 15%
  VIDEO_CALL_PERCENTAGE: 0.30,  // 30%
  COIN_TO_INR_RATE: 0.1,        // 10 coins = ₹1
}

WITHDRAWAL_MIN_AMOUNT = 500      // ₹500
```

#### Mobile (constants/index.ts)
```typescript
API_ENDPOINTS = {
  APPLY_AS_HOST: '/host/apply',
  GET_HOST_DASHBOARD: '/host/dashboard',
  GET_HOST_EARNINGS: '/host/earnings',
  REQUEST_WITHDRAWAL: '/host/withdrawal',
  RATE_HOST: '/host/rate',
}
```

## Usage Examples

### Apply as Host
```typescript
// Mobile
const { applyAsHost } = useHostStore();
await applyAsHost({
  documents: [
    'https://example.com/id-proof.pdf',
    'https://example.com/address-proof.pdf',
  ],
});
```

### Request Withdrawal
```typescript
// Mobile
const { requestWithdrawal } = useHostStore();
await requestWithdrawal({
  amount: 1000,
  method: 'upi',
  paymentDetails: {
    upiId: 'user@paytm',
  },
});
```

### Rate a Host
```typescript
// Mobile
const { rateHost } = useHostStore();
await rateHost({
  hostId: 'host-123',
  callId: 'call-456',
  rating: 5,
  feedback: 'Great conversation!',
});
```

## Support

For issues or questions:
- Check the documentation
- Review test cases for usage examples
- Contact the development team
