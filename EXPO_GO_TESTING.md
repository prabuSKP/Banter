# Testing Banter with Expo Go

## 🔍 Compatibility Status

### ✅ **Works in Expo Go** (90% of features)
- Authentication (Firebase OTP)
- Navigation & Routing
- UI/UX (all screens)
- Settings & Privacy
- Notifications
- Admin Panel
- Friends Management
- Wallet UI (without payments)
- Host System UI
- State Management
- API Integration
- Socket.IO Real-time

### ❌ **Requires Development Build**
- **Razorpay Payments** (`react-native-razorpay`)
- **Agora Video/Audio Calls** (`react-native-agora`)

---

## 🚀 How to Test with Expo Go

### Step 1: Install Expo Go
Download from:
- **iOS**: App Store
- **Android**: Google Play Store

### Step 2: Start Development Server
```bash
cd mobile
npm start
```

### Step 3: Scan QR Code
- **iOS**: Open Camera app, scan QR code
- **Android**: Open Expo Go app, scan QR code

### Step 4: Test Features
You can test:
- ✅ Login/OTP flow
- ✅ All screens & navigation
- ✅ Settings & privacy controls
- ✅ Admin panel (if admin user)
- ✅ Host application & dashboard UI
- ✅ Friends list & requests
- ✅ Wallet balance display
- ⚠️ Calls will show error (need dev build)
- ⚠️ Payments will show error (need dev build)

---

## 🛠️ Option 1: Create Development Build (Full Functionality)

### Prerequisites
```bash
npm install -g eas-cli
eas login
```

### Build for Android
```bash
cd mobile
eas build:configure
eas build --profile development --platform android
```

Download the APK and install on Android device.

### Build for iOS (requires Apple Developer account)
```bash
eas build --profile development --platform ios
```

Install via TestFlight or direct installation.

### What You Get
- ✅ Everything works (100%)
- ✅ Razorpay payments
- ✅ Agora video/audio calls
- ✅ All native modules
- Similar to Expo Go but with your custom modules

---

## 🧪 Option 2: Mock Mode for Expo Go Testing

If you want to test in Expo Go without development build, you can enable "mock mode" for calls and payments.

### Enable Mock Mode

Create a mock config file:

**mobile/src/config/mock.ts**
```typescript
// Set to true when testing with Expo Go
export const MOCK_MODE = true;

export const mockCallsEnabled = MOCK_MODE;
export const mockPaymentsEnabled = MOCK_MODE;
```

### Mock Calls
When `mockCallsEnabled = true`:
- Show call UI
- Simulate ringtone
- Display fake video/audio
- No actual RTC connection

### Mock Payments
When `mockPaymentsEnabled = true`:
- Show payment UI
- Simulate successful payment
- Update wallet balance
- No actual Razorpay

---

## 📋 Testing Checklist

### ✅ Can Test in Expo Go
- [ ] Login with phone number
- [ ] OTP verification
- [ ] Home screen navigation
- [ ] Friends list
- [ ] Send friend request
- [ ] Accept/reject requests
- [ ] View wallet balance
- [ ] Host application form
- [ ] Host dashboard (if approved)
- [ ] Settings screens
- [ ] Edit profile
- [ ] Privacy settings
- [ ] Notification settings
- [ ] Admin dashboard (if admin)
- [ ] Admin user management
- [ ] Admin host approvals

### ⚠️ Requires Dev Build
- [ ] Initiate video call
- [ ] Initiate audio call
- [ ] Receive incoming call
- [ ] Active call with video/audio
- [ ] Razorpay payment
- [ ] Recharge wallet

---

## 🎯 Recommended Approach

### For Quick UI Testing
→ Use **Expo Go** (90% functional)

### For Full Feature Testing
→ Use **Development Build** (100% functional)

### For Production
→ Use **Production Build** via EAS

---

## 📱 Development Build Commands

### Android (Easier, no account needed)
```bash
# Build
eas build --profile development --platform android

# Install APK on device
# Download from build link and install manually
```

### iOS (Requires Apple Developer account)
```bash
# Build
eas build --profile development --platform ios

# Install via TestFlight or direct
eas submit --platform ios
```

---

## 🔧 EAS Build Configuration

**eas.json** (already should exist):
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

---

## 💡 Pro Tips

### 1. **Best for UI/UX Testing**
Use Expo Go to quickly test:
- Screen layouts
- Navigation flows
- Form validations
- Error states
- Loading states

### 2. **Best for Feature Testing**
Use Development Build to test:
- End-to-end flows
- Payment integration
- Call functionality
- Real-time features

### 3. **Backend Testing**
Both Expo Go and Dev Build can:
- Connect to local backend (`http://192.168.x.x:3000`)
- Connect to production backend
- Test all API endpoints

---

## 🚨 Known Issues with Expo Go

### Error: "Unable to resolve module react-native-agora"
**Solution**: This is expected. Agora requires dev build.

### Error: "NativeModules.RazorpayCheckout is null"
**Solution**: This is expected. Razorpay requires dev build.

### Workaround
Add conditional checks:
```typescript
// In calls service
if (Platform.OS === 'web' || !NativeModules.AgoraRtcEngine) {
  console.warn('Agora not available - using mock mode');
  return;
}
```

---

## 📊 Feature Availability Matrix

| Feature | Expo Go | Dev Build | Production |
|---------|---------|-----------|------------|
| UI/Screens | ✅ | ✅ | ✅ |
| Navigation | ✅ | ✅ | ✅ |
| Authentication | ✅ | ✅ | ✅ |
| API Calls | ✅ | ✅ | ✅ |
| Socket.IO | ✅ | ✅ | ✅ |
| Friends | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ |
| Admin Panel | ✅ | ✅ | ✅ |
| **Video Calls** | ❌ | ✅ | ✅ |
| **Audio Calls** | ❌ | ✅ | ✅ |
| **Payments** | ❌ | ✅ | ✅ |

---

## 🎬 Quick Start (Expo Go)

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Start mobile
cd mobile
npm start

# 3. Scan QR with Expo Go
# iOS: Use Camera app
# Android: Use Expo Go app

# 4. Test available features
# (90% of app works!)
```

---

## 🏁 Conclusion

**Yes, you can test with Expo Go!**

- ✅ **90% of features** work perfectly
- ❌ **Calls & Payments** need development build
- 🚀 **Development build** gives you 100% functionality

**Recommendation**:
- Start with **Expo Go** for quick UI testing
- Switch to **Development Build** for full testing
- Use **Production Build** for final release

---

**Need Help?**
- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
