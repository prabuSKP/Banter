# Firebase OTP Authentication Setup Guide

## 🔥 Complete Step-by-Step Guide

This guide will help you set up Firebase Phone Authentication (OTP) for the Banter app.

---

## 📋 Prerequisites

- Node.js installed
- Expo CLI installed
- Google account
- Mobile app project ready

---

## 🚀 Part 1: Firebase Console Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `Banter` (or your preferred name)
4. Click **Continue**
5. **Google Analytics**: Choose "Enable" or "Not now" (recommended: Enable)
6. Click **Create project**
7. Wait for project creation (~30 seconds)
8. Click **Continue**

### Step 2: Add Android App

1. In Firebase Console, click **Android icon** (or Project Overview → Add app → Android)
2. **Register app**:
   - **Android package name**: `com.yourcompany.banter` (must match app.json)
   - **App nickname**: `Banter Android` (optional)
   - **Debug signing certificate SHA-1**: Leave blank for now (optional)
3. Click **Register app**
4. **Download config file**:
   - Click **Download google-services.json**
   - Save it to your computer
5. Click **Next** → **Next** → **Continue to console**

### Step 3: Add iOS App

1. In Firebase Console, click **iOS icon** (or Add app → iOS)
2. **Register app**:
   - **iOS bundle ID**: `com.yourcompany.banter` (must match app.json)
   - **App nickname**: `Banter iOS` (optional)
   - **App Store ID**: Leave blank (not published yet)
3. Click **Register app**
4. **Download config file**:
   - Click **Download GoogleService-Info.plist**
   - Save it to your computer
5. Click **Next** → **Next** → **Next** → **Continue to console**

### Step 4: Enable Phone Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Get started** (if first time)
3. Go to **Sign-in method** tab
4. Click on **Phone** in the list
5. Toggle **Enable**
6. Click **Save**

**That's it for Firebase Console!** ✅

---

## 📱 Part 2: Mobile App Setup

### Step 1: Install Required Packages

Open terminal and run:

```bash
cd mobile

# Install Firebase packages
npm install firebase
npm install @react-native-firebase/app
npm install @react-native-firebase/auth

# Or use Expo install (recommended)
npx expo install firebase
npx expo install @react-native-firebase/app
npx expo install @react-native-firebase/auth
```

### Step 2: Place Config Files

#### **Option A: Place in Root (Recommended)**

Place the downloaded files in the `mobile/` folder:

```
mobile/
├── google-services.json          ← Android config
├── GoogleService-Info.plist      ← iOS config
├── app.json
├── package.json
└── ...
```

#### **Option B: Place in Platform Folders**

```
mobile/
├── android/
│   └── app/
│       └── google-services.json
├── ios/
│   └── GoogleService-Info.plist
└── ...
```

### Step 3: Update app.json

**File**: `mobile/app.json`

Add your package/bundle IDs and Firebase config:

```json
{
  "expo": {
    "name": "Banter",
    "slug": "banter",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.banter",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.banter",
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth"
    ],
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

**Important**: Replace `com.yourcompany.banter` with your actual package name!

### Step 4: Create Firebase Config File

**File**: `mobile/src/config/firebase.config.ts`

```typescript
// mobile/src/config/firebase.config.ts

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional for Analytics
};
```

**Where to find these values?**

1. Go to Firebase Console
2. Click **Project Settings** (gear icon)
3. Scroll down to **"Your apps"**
4. Select your Android or iOS app
5. You'll see the config object with all values
6. Copy and paste into the file above

### Step 5: Update Firebase Service

The firebase service is already created at `mobile/src/services/firebase.ts`, but let's verify it's correct:

**File**: `mobile/src/services/firebase.ts`

```typescript
// mobile/src/services/firebase.ts

import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { firebaseConfig } from '../config/firebase.config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

class FirebaseService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string): Promise<string> {
    try {
      // For web testing (Expo Go), you might need to set up reCAPTCHA
      // For native builds, this works directly

      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        this.recaptchaVerifier!
      );

      console.log('OTP sent successfully');
      return verificationId;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(verificationId: string, code: string) {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);

      console.log('User signed in successfully');
      return userCredential.user;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw new Error(error.message || 'Invalid OTP code');
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      await auth.signOut();
      console.log('User signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }
}

export default new FirebaseService();
```

---

## 🧪 Part 3: Testing Setup

### Step 1: Add Test Phone Numbers (For Development)

To test without sending real SMS:

1. Go to Firebase Console → **Authentication**
2. Click **Sign-in method** tab
3. Scroll down to **Phone** section
4. Click **Phone numbers for testing**
5. Add test numbers:
   - Phone number: `+1 555-555-5555`
   - Verification code: `123456`
6. Click **Add**

Now you can test with these numbers without receiving actual SMS!

### Step 2: Build Development App

⚠️ **Important**: Phone auth won't work in Expo Go. You need a development build.

```bash
# Install EAS CLI (if not already)
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for Android (easier for testing)
eas build --profile development --platform android
```

Wait ~10-15 minutes for build to complete. Download the APK and install on Android device.

### Step 3: Test the Flow

1. Open the app on your device
2. Enter phone number: `+1 555-555-5555` (test number)
3. Click "Send OTP"
4. Enter code: `123456` (test code)
5. Should successfully log in! ✅

---

## 🔧 Part 4: Enable Production SMS

### Step 1: Enable SMS Provider (Firebase)

Firebase provides free SMS for phone auth! It's already enabled when you enable Phone Authentication.

**Free Tier**:
- **10,000 verifications/month** for free
- After that: ~$0.01 per verification

### Step 2: Set Up Billing (Optional)

1. Go to Firebase Console
2. Click **Upgrade** (for higher limits)
3. Choose **Blaze Plan** (pay-as-you-go)
4. Add billing information
5. Set budget alerts

**Note**: You can stay on free tier for testing and initial launch!

### Step 3: Configure App Verification (Android)

For production Android app:

1. Generate SHA-1 fingerprint:

```bash
cd mobile/android

# For debug
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release (when publishing)
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

2. Copy the SHA-1 fingerprint
3. Go to Firebase Console → Project Settings
4. Scroll to your Android app
5. Click **Add fingerprint**
6. Paste SHA-1
7. Click **Save**

### Step 4: Configure App Verification (iOS)

iOS uses Apple Push Notification (APNs):

1. Get APNs certificate from Apple Developer
2. Go to Firebase Console → Project Settings
3. Select iOS app
4. Scroll to **Cloud Messaging**
5. Upload APNs certificate
6. Click **Save**

---

## 🐛 Troubleshooting

### Issue 1: "reCAPTCHA verification failed"

**Solution**: Phone auth requires native build (not Expo Go)

```bash
eas build --profile development --platform android
```

### Issue 2: "Firebase app not initialized"

**Solution**: Check `firebaseConfig` values are correct in `firebase.config.ts`

### Issue 3: SMS not received

**Solutions**:
- Use test phone numbers for development
- Check Firebase billing is enabled for production
- Verify phone number format includes country code (+1, +91, etc.)

### Issue 4: "Network error"

**Solutions**:
- Check internet connection
- Verify Firebase project is active
- Check `google-services.json` is properly placed

### Issue 5: Build fails

**Solution**: Ensure all plugins are in app.json:

```json
"plugins": [
  "@react-native-firebase/app",
  "@react-native-firebase/auth"
]
```

---

## 📋 Setup Checklist

### Firebase Console
- [ ] Created Firebase project
- [ ] Added Android app
- [ ] Downloaded `google-services.json`
- [ ] Added iOS app
- [ ] Downloaded `GoogleService-Info.plist`
- [ ] Enabled Phone authentication
- [ ] Added test phone numbers

### Mobile App
- [ ] Installed Firebase packages
- [ ] Placed `google-services.json` in project
- [ ] Placed `GoogleService-Info.plist` in project
- [ ] Updated `app.json` with package names
- [ ] Created `firebase.config.ts` with correct values
- [ ] Added Firebase plugins to `app.json`
- [ ] Built development build (EAS)

### Testing
- [ ] Tested with test phone number
- [ ] OTP sent successfully
- [ ] OTP verified successfully
- [ ] User logged in
- [ ] Auth state persists

---

## 🎯 Quick Start Commands

```bash
# 1. Install packages
cd mobile
npx expo install firebase @react-native-firebase/app @react-native-firebase/auth

# 2. Configure (add config files manually)

# 3. Build
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android

# 4. Install APK on device and test!
```

---

## 📊 File Structure After Setup

```
mobile/
├── src/
│   ├── config/
│   │   └── firebase.config.ts         ← Firebase config values
│   ├── services/
│   │   └── firebase.ts                ← Firebase service (already exists)
│   └── stores/
│       └── authStore.ts               ← Auth store (already exists)
├── app/
│   └── (auth)/
│       ├── phone.tsx                  ← Phone input screen
│       └── verify.tsx                 ← OTP verification screen
├── google-services.json               ← Android config
├── GoogleService-Info.plist           ← iOS config
├── app.json                           ← Updated with Firebase
└── package.json                       ← Updated dependencies
```

---

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Phone Auth Docs](https://firebase.google.com/docs/auth/web/phone-auth)
- [React Native Firebase](https://rnfirebase.io/)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)

---

## 💡 Pro Tips

1. **Use Test Numbers**: Add multiple test numbers with different codes
2. **Monitor Usage**: Check Firebase Console → Usage tab
3. **Set Alerts**: Set up budget alerts in Firebase Billing
4. **Rate Limiting**: Firebase has built-in abuse prevention
5. **Error Handling**: Always wrap Firebase calls in try-catch

---

## 🎉 You're Done!

Your Firebase Phone Authentication is now set up!

**Next Steps**:
1. Test with test phone numbers
2. Build and test on device
3. Add more users
4. Enable Analytics (optional)
5. Launch! 🚀

Need help? Check the troubleshooting section above.
