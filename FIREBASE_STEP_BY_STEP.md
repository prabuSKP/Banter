# Firebase OTP Setup - Visual Step-by-Step Guide

## 🎯 Complete Walkthrough with Detailed Instructions

This is a beginner-friendly guide with detailed steps and what you'll see at each stage.

---

## 📌 Part 1: Firebase Console Setup (15 minutes)

### Step 1: Go to Firebase Console

1. Open your browser
2. Go to: **https://console.firebase.google.com**
3. Sign in with your Google account
4. You'll see the Firebase Console dashboard

**What you'll see**:
- List of projects (or empty if first time)
- "Add project" or "Create a project" button

---

### Step 2: Create New Project

**Click**: "Add project" button

**Screen 1 - Project Name**:
- Enter name: `Banter`
- You'll see: "Your project ID will be: banter-xxxxx"
- Click "Continue"

**Screen 2 - Google Analytics** (optional):
- Toggle: "Enable Google Analytics for this project"
- Recommended: **Turn ON** (you can use it later)
- Click "Continue"

**Screen 3 - Analytics Account** (if enabled):
- Select: "Default Account for Firebase" (or create new)
- Accept terms
- Click "Create project"

**Wait**: 30-60 seconds while Firebase creates your project

**Screen 4 - Success**:
- You'll see: "Your new project is ready"
- Click "Continue"

---

### Step 3: Add Android App

**You'll see**: Firebase project dashboard

**Click**: Android icon (looks like Android robot)
*OR* Click "Add app" → Select Android

**Screen 1 - Register App**:

**Android package name**:
```
com.yourcompany.banter
```
⚠️ **Important**: This MUST match your app.json later!

**App nickname** (optional):
```
Banter Android
```

**Debug signing certificate SHA-1** (optional):
- Leave blank for now
- You can add later

**Click**: "Register app"

**Screen 2 - Download Config**:

You'll see a download button for `google-services.json`

**Click**: "Download google-services.json"

**Save** the file to your computer (Desktop or Downloads)

⚠️ **Important**: Keep this file safe! You'll need it later.

**Click**: "Next" → "Next" → "Continue to console"

---

### Step 4: Add iOS App

**In Project Dashboard**:

**Click**: iOS icon (Apple logo)
*OR* Click "Add app" → Select iOS

**Screen 1 - Register App**:

**iOS bundle ID**:
```
com.yourcompany.banter
```
⚠️ **Important**: This MUST match your app.json later!
⚠️ **Note**: Can be same as Android package name

**App nickname** (optional):
```
Banter iOS
```

**App Store ID**:
- Leave blank (app not published yet)

**Click**: "Register app"

**Screen 2 - Download Config**:

You'll see a download button for `GoogleService-Info.plist`

**Click**: "Download GoogleService-Info.plist"

**Save** the file to your computer

⚠️ **Important**: Keep this file safe!

**Click**: "Next" → "Next" → "Next" → "Continue to console"

---

### Step 5: Enable Phone Authentication

**In Firebase Console Dashboard**:

**Left Sidebar → Click**: "Authentication"

**First time?** Click "Get started" button

**You'll see**: Authentication dashboard

**Top Menu → Click**: "Sign-in method" tab

**You'll see**: List of sign-in providers

**Find**: "Phone" in the list

**Click**: On the "Phone" row

**Toggle**: Switch to "Enable"

You'll see: "Phone authentication is enabled"

**Click**: "Save"

**Success!** ✅ Phone auth is now enabled

---

### Step 6: Add Test Phone Numbers (For Development)

**Still in Authentication → Sign-in method**:

**Scroll down** to see "Phone numbers for testing"

**Click**: "Phone numbers for testing" (expand section)

**Click**: "Add phone number" button

**Add Test Number 1**:
- Phone number: `+15555555555`
- Verification code: `123456`
- Click "Add"

**Add Test Number 2** (optional):
- Phone number: `+19999999999`
- Verification code: `999999`
- Click "Add"

**Success!** ✅ Test numbers added

Now you can test OTP without real SMS!

---

### Step 7: Get Firebase Config Values

**Click**: ⚙️ Gear icon (Settings) at top left

**Click**: "Project settings"

**Scroll down** to "Your apps" section

**Click**: On your Android or Web app

**You'll see**: Firebase configuration object

**Copy these values** (you'll need them later):
```javascript
{
  apiKey: "AIza...xxxxx",
  authDomain: "banter-xxxxx.firebaseapp.com",
  projectId: "banter-xxxxx",
  storageBucket: "banter-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
}
```

**Save** these values in a text file for now

---

## 📱 Part 2: Mobile App Setup (10 minutes)

### Step 8: Place Config Files in Project

**Open your project folder**: `w:\Application\Banter\mobile`

**Copy files**:

1. **Find** `google-services.json` (downloaded earlier)
2. **Copy** to: `w:\Application\Banter\mobile\google-services.json`

3. **Find** `GoogleService-Info.plist` (downloaded earlier)
4. **Copy** to: `w:\Application\Banter\mobile\GoogleService-Info.plist`

**Your mobile folder should now have**:
```
mobile/
├── google-services.json          ✅ NEW
├── GoogleService-Info.plist      ✅ NEW
├── app.json
├── package.json
└── ...
```

---

### Step 9: Create Firebase Config File

**Create new file**: `mobile/src/config/firebase.config.ts`

**Copy and paste**:

```typescript
// mobile/src/config/firebase.config.ts

export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE",
};
```

**Replace** the placeholder values with the values you copied in Step 7

**Save** the file

---

### Step 10: Update app.json

**Open**: `mobile/app.json`

**Find** the `android` section and add:
```json
"android": {
  "package": "com.yourcompany.banter",
  "googleServicesFile": "./google-services.json"
}
```

**Find** the `ios` section and add:
```json
"ios": {
  "bundleIdentifier": "com.yourcompany.banter",
  "googleServicesFile": "./GoogleService-Info.plist"
}
```

**Add** plugins at root level:
```json
"plugins": [
  "@react-native-firebase/app",
  "@react-native-firebase/auth"
]
```

⚠️ **Important**: Replace `com.yourcompany.banter` with the SAME package name you used in Firebase Console!

**Save** the file

---

### Step 11: Install Firebase Packages

**Open Terminal** in mobile folder:

```bash
cd w:\Application\Banter\mobile
```

**Run**:
```bash
npx expo install firebase @react-native-firebase/app @react-native-firebase/auth
```

**Wait** for installation (1-2 minutes)

**You'll see**: "Package installed successfully" ✅

---

## 🔨 Part 3: Build & Test (20 minutes)

### Step 12: Install EAS CLI

**In terminal**:
```bash
npm install -g eas-cli
```

**Wait** for installation

**Verify**:
```bash
eas --version
```

You should see version number ✅

---

### Step 13: Login to Expo

**Run**:
```bash
eas login
```

**You'll see**: Prompt for Expo account

**Enter**:
- Username/Email
- Password

**Or**: Press Enter to open browser login

**Success**: "Logged in as [your-username]" ✅

---

### Step 14: Configure EAS Build

**Run**:
```bash
eas build:configure
```

**You'll be asked**:
- "Create eas.json?" → Press **Y** (Yes)

**File created**: `mobile/eas.json` ✅

**You'll see**:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {},
    "production": {}
  }
}
```

---

### Step 15: Build for Android

**Run**:
```bash
eas build --profile development --platform android
```

**You'll be asked**:
1. "Generate a new Android Keystore?" → **Y** (Yes)
2. "Create a new project?" → **Y** (Yes, if first time)

**Wait**: 10-20 minutes for build

**You'll see**:
- "Uploading to EAS Build"
- "Build in progress"
- "Build successful!"
- Download link for APK

**Click** the download link

**Download** the APK file to your computer

---

### Step 16: Install on Android Device

**On your Android phone**:

1. **Enable** "Install from unknown sources":
   - Settings → Security → Unknown sources → Enable

2. **Transfer** APK to phone:
   - Via USB cable, or
   - Via email/cloud, or
   - Direct download on phone

3. **Tap** on APK file

4. **Click** "Install"

5. **Open** the app

---

### Step 17: Test OTP Login

**In the app**:

1. **Screen**: Phone number input

2. **Enter**: `+15555555555` (test number)

3. **Click**: "Send OTP"

**You should see**: "OTP Sent" message ✅

4. **Screen**: OTP verification

5. **Enter**: `123456` (test code)

6. **Click**: "Verify"

**Success!** You should be logged in! 🎉

---

## ✅ Setup Complete Checklist

### Firebase Console
- [x] Created Firebase project
- [x] Added Android app
- [x] Downloaded google-services.json
- [x] Added iOS app
- [x] Downloaded GoogleService-Info.plist
- [x] Enabled Phone authentication
- [x] Added test phone numbers
- [x] Copied Firebase config values

### Mobile App
- [x] Placed google-services.json in mobile folder
- [x] Placed GoogleService-Info.plist in mobile folder
- [x] Created firebase.config.ts with values
- [x] Updated app.json with package names
- [x] Installed Firebase packages
- [x] Built development APK

### Testing
- [x] Installed APK on Android device
- [x] Tested with test phone number
- [x] OTP sent successfully
- [x] OTP verified successfully
- [x] Successfully logged in

---

## 🎉 Congratulations!

Your Firebase Phone Authentication is working!

**What you can do now**:
1. ✅ Test login/logout
2. ✅ Add more test numbers
3. ✅ Build for iOS (requires Apple Developer account)
4. ✅ Use real phone numbers (Firebase provides 10,000 free SMS/month)
5. ✅ Deploy to production

**Next Steps**:
- Test all app features
- Add more users
- Enable Analytics (optional)
- Publish to Play Store/App Store

---

## 🆘 Need Help?

**Common Issues**:

**Q**: Build fails with Firebase error
**A**: Check that package names in app.json match Firebase Console

**Q**: OTP not working
**A**: Make sure you're using a development build (not Expo Go)

**Q**: Can't install APK
**A**: Enable "Unknown sources" in Android settings

**Q**: Test number not working
**A**: Verify you added it correctly in Firebase Console

---

## 📚 Reference

- Firebase Console: https://console.firebase.google.com
- Your config files are in: `mobile/` folder
- Your Firebase config: `mobile/src/config/firebase.config.ts`
- Build dashboard: https://expo.dev/accounts/[username]/projects/[project]/builds

---

**Setup Complete!** 🚀
