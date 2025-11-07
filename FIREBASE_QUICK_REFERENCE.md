# Firebase OTP - Quick Reference Card

## 🚀 Super Quick Setup (For Experienced Developers)

### 1️⃣ Firebase Console (5 min)
```
1. https://console.firebase.google.com
2. Create project: "Banter"
3. Add Android app: com.yourcompany.banter
4. Download: google-services.json
5. Add iOS app: com.yourcompany.banter
6. Download: GoogleService-Info.plist
7. Enable: Authentication → Phone
8. Add test number: +15555555555 → 123456
```

### 2️⃣ Get Config Values
```
Settings → Project Settings → Your apps → Config
Copy: apiKey, authDomain, projectId, etc.
```

### 3️⃣ Mobile Setup (5 min)
```bash
cd mobile

# Install
npx expo install firebase @react-native-firebase/app @react-native-firebase/auth

# Place files
# google-services.json → mobile/
# GoogleService-Info.plist → mobile/
```

### 4️⃣ Create Config
**File**: `mobile/src/config/firebase.config.ts`
```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 5️⃣ Update app.json
```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.banter",
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.banter",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth"
    ]
  }
}
```

### 6️⃣ Build & Test
```bash
# Install EAS
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for Android
eas build --profile development --platform android

# Wait 10-15 min → Download APK → Install on device

# Test with: +15555555555 / 123456
```

---

## 📁 File Structure
```
mobile/
├── src/
│   ├── config/
│   │   └── firebase.config.ts         ← CREATE THIS
│   └── services/
│       └── firebase.ts                ← ALREADY EXISTS
├── google-services.json               ← PLACE HERE
├── GoogleService-Info.plist           ← PLACE HERE
├── app.json                           ← UPDATE THIS
└── package.json
```

---

## 🧪 Test Numbers
```
Phone: +15555555555
Code:  123456

Phone: +19999999999
Code:  999999
```

---

## ⚡ Commands Cheat Sheet

```bash
# Install packages
npx expo install firebase @react-native-firebase/app @react-native-firebase/auth

# EAS setup
npm install -g eas-cli
eas login
eas build:configure

# Build
eas build --profile development --platform android
eas build --profile development --platform ios

# View builds
eas build:list
```

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| Firebase Console | https://console.firebase.google.com |
| Expo Builds | https://expo.dev |
| Firebase Docs | https://firebase.google.com/docs/auth/web/phone-auth |
| React Native Firebase | https://rnfirebase.io |

---

## ⚠️ Common Mistakes

❌ **Wrong package name** in app.json vs Firebase
✅ Must match exactly!

❌ **Testing in Expo Go**
✅ Build with EAS (native code required)

❌ **Forgot to place config files**
✅ google-services.json & GoogleService-Info.plist in mobile/

❌ **Wrong Firebase config values**
✅ Copy from Firebase Console → Project Settings

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Firebase not initialized" | Check firebase.config.ts values |
| "reCAPTCHA failed" | Build with EAS (not Expo Go) |
| "SMS not received" | Use test numbers for dev |
| "Build failed" | Check plugins in app.json |
| "Can't install APK" | Enable Unknown Sources on Android |

---

## 📊 Package Names Examples

```
Good ✅
- com.mycompany.banter
- com.yourname.banter
- io.github.username.banter

Bad ❌
- banter (too short)
- com.banter (too short)
- Banter (not lowercase)
```

---

## 🎯 What Package Name to Use?

```javascript
// Pick ONE and use EVERYWHERE:
"com.yourcompany.banter"

// Use in:
// 1. Firebase Console (Android & iOS apps)
// 2. app.json (android.package)
// 3. app.json (ios.bundleIdentifier)
```

---

## 💰 Cost

| Feature | Free Tier | Cost After |
|---------|-----------|------------|
| Phone Auth | 10K verifications/month | ~$0.01 per SMS |
| EAS Build | 30 builds/month (free account) | $29/mo (unlimited) |
| Firebase Hosting | 10 GB/month | Pay as you go |
| Firebase Storage | 5 GB | Pay as you go |

---

## ✅ Final Checklist

- [ ] Firebase project created
- [ ] Android app added to Firebase
- [ ] iOS app added to Firebase
- [ ] Phone auth enabled
- [ ] Test numbers added
- [ ] google-services.json downloaded & placed
- [ ] GoogleService-Info.plist downloaded & placed
- [ ] firebase.config.ts created with values
- [ ] app.json updated
- [ ] Firebase packages installed
- [ ] EAS CLI installed
- [ ] Built APK/IPA
- [ ] Tested on device
- [ ] Login works with test number

---

## 🎉 Done!

**Firebase OTP Authentication is LIVE!**

Test it: Use +15555555555 with code 123456

---

## 📞 Support

Need help? Check:
1. [FIREBASE_OTP_SETUP_GUIDE.md](FIREBASE_OTP_SETUP_GUIDE.md) - Detailed guide
2. [FIREBASE_STEP_BY_STEP.md](FIREBASE_STEP_BY_STEP.md) - Visual walkthrough
3. Firebase Console → Authentication → Usage (check for errors)
4. EAS Build logs (if build fails)
