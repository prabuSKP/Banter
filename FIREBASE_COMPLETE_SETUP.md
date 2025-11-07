# Firebase Complete Setup Guide

## 📱 Current Status

✅ **Firebase Authentication (OTP)** - Already Configured
⏳ **Firebase Analytics** - Needs Setup

---

## 🔥 What's Already Done (Authentication)

### Files Already Exist:
- ✅ `mobile/src/services/firebase.ts` - Firebase Auth service
- ✅ Firebase phone authentication working
- ✅ OTP verification integrated

### What Works:
- Phone number login
- OTP verification
- Auto-login with saved credentials

---

## 📊 What Needs to be Added (Analytics)

### 1. Install Analytics Package

```bash
cd mobile
npx expo install @react-native-firebase/analytics
```

**Note**: `@react-native-firebase/app` is likely already installed for auth.

### 2. Enable Analytics in Firebase Console

**Steps**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Analytics** in left sidebar
4. Click **Enable Google Analytics**
5. Follow the setup wizard
6. Download updated config files:
   - **Android**: `google-services.json`
   - **iOS**: `GoogleService-Info.plist`

### 3. Replace Config Files

**The downloaded files should already have Analytics enabled**

**Android**:
```
mobile/android/app/google-services.json
```

**iOS**:
```
mobile/ios/GoogleService-Info.plist
```

### 4. Update app.json

Add analytics plugin:

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/analytics"
    ]
  }
}
```

### 5. Analytics Service Created

**File**: `mobile/src/services/analytics.ts` ✅ **Already Created**

This service includes:
- Screen view tracking
- Custom event logging
- User properties
- E-commerce events
- Error tracking

---

## 🔧 Integration Steps

### Step 1: Import Analytics in Stores

**Example**: Update `authStore.ts`

```typescript
import analytics from '../services/analytics';

// In login function
async login(phoneNumber: string, verificationId: string, code: string) {
  try {
    // Existing auth logic...
    const user = credential.user;

    // ADD THIS:
    await analytics.logLogin('phone');
    await analytics.setUserId(user.uid);

    set({ user, isAuthenticated: true });
  } catch (error) {
    // ADD THIS:
    await analytics.logError('login_failed', error.message);
    throw error;
  }
}
```

### Step 2: Add Screen Tracking Hook

**Create**: `mobile/src/hooks/useAnalyticsScreenView.ts`

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

**Use in any screen**:

```typescript
import { useAnalyticsScreenView } from '../../src/hooks/useAnalyticsScreenView';

export default function HomeScreen() {
  useAnalyticsScreenView(); // This tracks screen view

  return (
    // ... screen content
  );
}
```

### Step 3: Track Key Events

**Calls** (`callsStore.ts`):
```typescript
import analytics from '../services/analytics';

async initiateCall(userId: string, callType: 'audio' | 'video') {
  await analytics.logCallInitiated(callType, userId);
  // ... existing code
}

async endCall() {
  await analytics.logCallCompleted(callType, duration, coinsCharged);
  // ... existing code
}
```

**Payments** (`walletStore.ts`):
```typescript
import analytics from '../services/analytics';

async rechargeWallet(packageId: string, amount: number, coins: number) {
  await analytics.logRechargeInitiated(amount, coins, packageId);
  // ... existing code
}

// On payment success:
await analytics.logRechargeCompleted(amount, coins, packageId, paymentId);
```

**Friends** (`friendsStore.ts`):
```typescript
import analytics from '../services/analytics';

async sendFriendRequest(userId: string) {
  await analytics.logFriendRequestSent(userId);
  // ... existing code
}

async acceptFriendRequest(userId: string) {
  await analytics.logFriendRequestAccepted(userId);
  // ... existing code
}
```

**Host** (`hostStore.ts`):
```typescript
import analytics from '../services/analytics';

async applyAsHost(data: ApplyHostData) {
  await analytics.logHostApplicationSubmitted();
  // ... existing code
}

async requestWithdrawal(data: WithdrawalRequest) {
  await analytics.logHostWithdrawalRequested(data.amount, data.method);
  // ... existing code
}
```

---

## 🧪 Testing Analytics

### Enable Debug Mode

**Android**:
```bash
# Enable debug mode
adb shell setprop debug.firebase.analytics.app com.yourcompany.banter

# Disable debug mode
adb shell setprop debug.firebase.analytics.app .none.
```

**iOS**:
In Xcode scheme, add argument:
```
-FIRAnalyticsDebugEnabled
```

### View Debug Events

1. Open [Firebase Console](https://console.firebase.google.com)
2. Go to **Analytics** → **DebugView**
3. Use your app
4. See events appear in real-time!

---

## 📋 Quick Setup Checklist

### Prerequisites
- [ ] Firebase project exists
- [ ] Firebase Auth already configured (✅ Done)

### Analytics Setup
- [ ] Enable Analytics in Firebase Console
- [ ] Download updated `google-services.json` (Android)
- [ ] Download updated `GoogleService-Info.plist` (iOS)
- [ ] Install `@react-native-firebase/analytics` package
- [ ] Add analytics plugin to `app.json`
- [ ] Create development build (analytics won't work in Expo Go)

### Code Integration
- [ ] Analytics service created (✅ Done)
- [ ] Import analytics in `authStore.ts`
- [ ] Import analytics in `callsStore.ts`
- [ ] Import analytics in `walletStore.ts`
- [ ] Import analytics in `friendsStore.ts`
- [ ] Import analytics in `hostStore.ts`
- [ ] Create screen tracking hook
- [ ] Add screen tracking to main screens

### Testing
- [ ] Enable debug mode on device
- [ ] Open DebugView in Firebase Console
- [ ] Perform actions in app
- [ ] Verify events appear in DebugView
- [ ] Check Analytics dashboard after 24 hours

---

## 🚨 Important Notes

### Expo Go Limitation
⚠️ **Firebase Analytics requires native code** - won't work in Expo Go

**Solution**: Create development build
```bash
eas build --profile development --platform android
# or
eas build --profile development --platform ios
```

### Privacy Compliance
- Add analytics disclosure to privacy policy
- Get user consent if required (GDPR, CCPA)
- Don't track sensitive data (passwords, payment info)
- Use user IDs, not personal information

### Data Delay
- Debug events: Real-time in DebugView
- Production events: 24-48 hours delay in reports
- User properties: Update within hours

---

## 📊 Events That Will Be Tracked

### Automatic Events (Google Analytics)
- `first_open` - First app launch
- `session_start` - Session begins
- `user_engagement` - User activity
- `screen_view` - Screen navigation

### Custom Events (Your App)

**Authentication**:
- `login` - User logged in
- `sign_up` - New user registered

**Calls**:
- `call_initiated` - Started call
- `call_accepted` - Accepted call
- `call_completed` - Call ended (with revenue!)
- `call_rejected` - Declined call
- `call_missed` - Missed call

**Payments**:
- `recharge_initiated` - Started payment
- `purchase` - Payment completed
- `recharge_failed` - Payment failed

**Friends**:
- `friend_request_sent`
- `friend_request_accepted`
- `friend_removed`

**Host**:
- `host_application_submitted`
- `host_application_approved`
- `host_earning` - Earned money
- `host_withdrawal_requested`
- `host_rating_submitted`

**Settings**:
- `settings_changed`
- `privacy_updated`

**Admin**:
- `admin_action`

**Errors**:
- `app_error`

---

## 📈 Analytics Dashboard

Once setup, you'll see:

### Real-time Reports
- Active users now
- Active screens
- Events happening right now

### Engagement Reports
- Daily/Weekly/Monthly active users
- Session duration
- Screen views
- Event counts

### Retention Reports
- Day 1, 7, 30 retention
- Cohort analysis

### Revenue Reports
- `purchase` events (recharges)
- `call_completed` events (call revenue)
- Average revenue per user

### Funnels
- Call flow: initiated → accepted → completed
- Payment flow: initiated → success
- Host flow: applied → approved → earning

---

## 🔗 Resources

**Documentation**:
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [React Native Firebase](https://rnfirebase.io/analytics/usage)
- [GA4 Events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)

**Tools**:
- [Firebase Console](https://console.firebase.google.com)
- [DebugView](https://support.google.com/firebase/answer/7201382)

---

## 💡 Pro Tips

1. **Test in Debug Mode First**
   - Verify events before production
   - Use DebugView for instant feedback

2. **Track Key Conversions**
   - Mark `purchase` as conversion
   - Mark `call_completed` as conversion
   - Track revenue in INR

3. **Set User Properties**
   - `user_type`: host, regular, admin
   - `signup_date`: track cohorts
   - `total_calls`: engagement level

4. **Monitor Errors**
   - Track `app_error` events
   - Set up alerts for critical errors
   - Use error rate to find issues

5. **Build Funnels**
   - Sign up → first call
   - Recharge → call
   - Host apply → approval → earning

---

## 🎯 Next Steps

1. **Enable Analytics in Firebase Console**
2. **Install analytics package**
3. **Update config files**
4. **Create development build**
5. **Test with DebugView**
6. **Integrate in all stores**
7. **Monitor dashboard**

---

## ✅ Summary

**What's Already Working**:
- ✅ Firebase Authentication (OTP)
- ✅ Phone login & verification

**What Needs Setup**:
- ⏳ Install analytics package
- ⏳ Enable in Firebase Console
- ⏳ Update config files
- ⏳ Create development build
- ⏳ Add analytics calls in code

**Files Already Created**:
- ✅ `mobile/src/services/analytics.ts` - Complete analytics service
- ✅ All tracking methods ready to use

**Just need to**:
1. Enable Analytics in Firebase Console
2. Install package
3. Import analytics in stores
4. Build and test!

🔥 **Firebase is almost ready!**
