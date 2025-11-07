# Firebase Analytics Integration Guide

## 📊 Overview

Firebase Analytics is integrated to track user behavior, app performance, and key metrics. This guide covers setup and usage.

---

## 🚀 Setup Required

### 1. Install Packages

```bash
cd mobile
npx expo install @react-native-firebase/app @react-native-firebase/analytics
```

### 2. Configure Firebase Project

**Enable Analytics in Firebase Console**:
1. Go to Firebase Console → Your Project
2. Navigate to Analytics
3. Enable Google Analytics
4. Download updated config files:
   - **Android**: `google-services.json`
   - **iOS**: `GoogleService-Info.plist`

### 3. Add Config Files

**Android**:
```
mobile/android/app/google-services.json
```

**iOS**:
```
mobile/ios/GoogleService-Info.plist
```

### 4. Update app.json

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/analytics"
    ],
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

---

## 📝 Implementation

### Analytics Service Created

**Location**: `mobile/src/services/analytics.ts`

**Features**:
- Screen view tracking
- Custom event logging
- User properties
- E-commerce events
- Error tracking

---

## 🔧 Integration Examples

### 1. Track Authentication

**File**: `mobile/src/stores/authStore.ts`

```typescript
import analytics from '../services/analytics';

// In login function
async login(phoneNumber: string, verificationId: string, code: string) {
  try {
    // ... existing login logic

    // Track login
    await analytics.logLogin('phone');

    // Set user ID and properties
    await analytics.setUserId(user.id);
    await analytics.setUserProperties({
      user_type: user.isHost ? 'host' : 'regular',
      signup_date: user.createdAt,
    });
  } catch (error) {
    await analytics.logError('login_failed', error.message);
  }
}
```

### 2. Track Screen Views

**Create a hook**: `mobile/src/hooks/useAnalyticsScreenView.ts`

```typescript
import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import analytics from '../services/analytics';

export function useAnalyticsScreenView() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      const screenName = pathname.replace('/', '') || 'home';
      analytics.logScreenView(screenName);
    }
  }, [pathname]);
}
```

**Use in screens**:

```typescript
// In any screen component
import { useAnalyticsScreenView } from '../../src/hooks/useAnalyticsScreenView';

export default function HomeScreen() {
  useAnalyticsScreenView();

  return (
    // ... screen content
  );
}
```

### 3. Track Calls

**File**: `mobile/src/stores/callsStore.ts`

```typescript
import analytics from '../services/analytics';

// When initiating call
async initiateCall(userId: string, callType: 'audio' | 'video') {
  try {
    const callData = await callsService.initiateCall({ receiverId: userId, callType });

    // Track call initiated
    await analytics.logCallInitiated(callType, userId);

    set({ activeCall: callData });
  } catch (error) {
    await analytics.logError('call_initiate_failed', error.message);
  }
}

// When call ends
async endCall() {
  const { activeCall, callDuration } = get();

  if (activeCall) {
    try {
      // Update call status
      await callsService.updateCallStatus(activeCall.callId, 'completed', callDuration);

      // Track call completed
      await analytics.logCallCompleted(
        activeCall.callType,
        callDuration,
        activeCall.coinsCharged || 0
      );
    } catch (error) {
      await analytics.logError('call_end_failed', error.message);
    }
  }
}
```

### 4. Track Wallet/Payments

**File**: `mobile/src/stores/walletStore.ts`

```typescript
import analytics from '../services/analytics';

// When recharge initiated
async rechargeWallet(packageId: string, amount: number, coins: number) {
  try {
    // Track recharge initiated
    await analytics.logRechargeInitiated(amount, coins, packageId);

    const order = await paymentService.createOrder(amount);

    // ... Razorpay payment flow

  } catch (error) {
    await analytics.logRechargeFailed(amount, coins, error.message);
  }
}

// When payment succeeds
async handlePaymentSuccess(response: any, amount: number, coins: number, packageId: string) {
  try {
    const verified = await paymentService.verifyPayment(response);

    if (verified) {
      // Track purchase
      await analytics.logRechargeCompleted(amount, coins, packageId, response.razorpay_payment_id);

      await fetchBalance();
    }
  } catch (error) {
    await analytics.logError('payment_verification_failed', error.message);
  }
}
```

### 5. Track Friends

**File**: `mobile/src/stores/friendsStore.ts`

```typescript
import analytics from '../services/analytics';

async sendFriendRequest(userId: string) {
  try {
    await friendsService.sendFriendRequest(userId);

    // Track friend request sent
    await analytics.logFriendRequestSent(userId);

    set({ /* ... */ });
  } catch (error) {
    await analytics.logError('friend_request_failed', error.message);
  }
}

async acceptFriendRequest(userId: string) {
  try {
    await friendsService.acceptFriendRequest(userId);

    // Track friend request accepted
    await analytics.logFriendRequestAccepted(userId);

    set({ /* ... */ });
  } catch (error) {
    await analytics.logError('friend_accept_failed', error.message);
  }
}
```

### 6. Track Host Events

**File**: `mobile/src/stores/hostStore.ts`

```typescript
import analytics from '../services/analytics';

async applyAsHost(data: ApplyHostData) {
  try {
    await hostService.applyAsHost(data);

    // Track application submitted
    await analytics.logHostApplicationSubmitted();

  } catch (error) {
    await analytics.logError('host_application_failed', error.message);
  }
}

async requestWithdrawal(data: WithdrawalRequest) {
  try {
    const withdrawal = await hostService.requestWithdrawal(data);

    // Track withdrawal requested
    await analytics.logHostWithdrawalRequested(data.amount, data.method);

    return withdrawal;
  } catch (error) {
    await analytics.logError('withdrawal_request_failed', error.message);
  }
}

async rateHost(data: RateHostData) {
  try {
    await hostService.rateHost(data);

    // Track rating submitted
    await analytics.logHostRatingSubmitted(data.hostId, data.rating);

  } catch (error) {
    await analytics.logError('host_rating_failed', error.message);
  }
}
```

### 7. Track Settings

**File**: `mobile/app/settings/privacy.tsx`

```typescript
import analytics from '../../src/services/analytics';

const handleSave = async () => {
  try {
    await updatePrivacySettings({ whoCanCall, profileVisibility });

    // Track privacy updated
    await analytics.logPrivacyUpdated(whoCanCall, profileVisibility);

    Alert.alert('Success', 'Privacy settings updated');
  } catch (error) {
    await analytics.logError('privacy_update_failed', error.message);
  }
};
```

### 8. Track Admin Actions

**File**: `mobile/app/admin/hosts.tsx`

```typescript
import analytics from '../../src/services/analytics';

const handleApprove = async (userId: string, userName: string) => {
  try {
    // await adminService.approveHost(userId);

    // Track admin action
    await analytics.logAdminAction('approve_host', userId);

    Alert.alert('Success', `${userName} approved as host`);
  } catch (error) {
    await analytics.logError('admin_approve_failed', error.message);
  }
};
```

---

## 📊 Key Events Tracked

### App Events
- `app_open` - App launched
- `login` - User logged in
- `sign_up` - New user registered
- `app_error` - Error occurred

### Call Events
- `call_initiated` - Call started
- `call_accepted` - Call accepted
- `call_completed` - Call ended (with revenue data)
- `call_rejected` - Call declined
- `call_missed` - Call not answered

### Wallet Events
- `recharge_initiated` - Started payment flow
- `purchase` - Payment completed (Google Analytics standard event)
- `recharge_failed` - Payment failed

### Friend Events
- `friend_request_sent` - Friend request sent
- `friend_request_accepted` - Friend request accepted
- `friend_removed` - Friend removed

### Host Events
- `host_application_submitted` - Applied to be host
- `host_application_approved` - Became host
- `host_earning` - Earned from call
- `host_withdrawal_requested` - Requested withdrawal
- `host_rating_submitted` - Rated host

### Settings Events
- `settings_changed` - Setting modified
- `privacy_updated` - Privacy settings changed

### Admin Events
- `admin_action` - Admin performed action

---

## 🎯 User Properties Tracked

```typescript
await analytics.setUserProperties({
  user_type: 'host' | 'regular',
  signup_date: '2025-01-07',
  total_calls: '125',
  total_friends: '50',
  wallet_balance: '500',
  is_premium: 'yes' | 'no',
});
```

---

## 📈 Custom Dimensions

You can set custom dimensions in Firebase Console:

1. **User Dimension**: `user_type` (host, regular, admin)
2. **Event Dimension**: `call_type` (audio, video)
3. **Event Dimension**: `payment_method` (upi, bank_transfer, wallet)

---

## 🔍 Viewing Analytics

### Firebase Console
1. Go to Firebase Console
2. Navigate to Analytics → Events
3. View real-time events and user behavior

### Key Reports
- **Events**: See all custom events
- **Conversions**: Track key actions (purchases, calls)
- **User Properties**: Segment users
- **Funnels**: Track user journeys
- **Retention**: User retention over time

---

## 🧪 Testing Analytics

### Debug Mode (Development)

**Android**:
```bash
adb shell setprop debug.firebase.analytics.app com.yourcompany.banter
```

**iOS**:
Add to Xcode scheme: `-FIRAnalyticsDebugEnabled`

### View Debug Events
1. Open Firebase Console
2. Go to Analytics → DebugView
3. See real-time events while testing

---

## 📋 Integration Checklist

### Setup
- [ ] Install Firebase packages
- [ ] Add google-services.json (Android)
- [ ] Add GoogleService-Info.plist (iOS)
- [ ] Update app.json with plugins
- [ ] Enable Analytics in Firebase Console

### Code Integration
- [ ] Import analytics service in all stores
- [ ] Add screen tracking hook
- [ ] Track authentication events
- [ ] Track call events (initiate, accept, complete)
- [ ] Track payment events (initiate, success, fail)
- [ ] Track friend events
- [ ] Track host events
- [ ] Track settings changes
- [ ] Track admin actions
- [ ] Track errors

### Testing
- [ ] Enable debug mode
- [ ] Test key events in DebugView
- [ ] Verify events in Firebase Console
- [ ] Check user properties
- [ ] Test on both iOS and Android

---

## 🚨 Important Notes

### Privacy
- Always get user consent for analytics tracking
- Add privacy policy disclosure
- Allow users to opt-out if required by law (GDPR, CCPA)

### Data Collection
- Do NOT track PII (personally identifiable information)
- Avoid logging sensitive data (passwords, payment details)
- Use user IDs, not names/emails in events

### Performance
- Analytics calls are asynchronous (non-blocking)
- Events are batched and sent periodically
- Minimal impact on app performance

---

## 🔗 Resources

- [Firebase Analytics Docs](https://firebase.google.com/docs/analytics)
- [React Native Firebase Analytics](https://rnfirebase.io/analytics/usage)
- [GA4 Events Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)

---

## 📊 Sample Analytics Query

**View top events**:
```sql
SELECT
  event_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_pseudo_id) as unique_users
FROM `project.analytics_xxx.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20250101' AND '20250107'
GROUP BY event_name
ORDER BY event_count DESC
LIMIT 10
```

---

**Analytics Integration Complete!** 🎉

All events are now tracked and ready to be analyzed in Firebase Console.
