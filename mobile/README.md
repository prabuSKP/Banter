# Banter Mobile App

Social networking mobile application built with React Native and Expo.

## Features

- 📱 **Phone Authentication** - Firebase OTP-based login
- 💬 **Real-time Messaging** - Direct messages and group chats
- 📞 **Voice/Video Calls** - Powered by Agora.io
- 🎤 **Voice Chat Rooms** - Public and private rooms
- 👥 **Friend System** - Send and accept friend requests
- 💰 **In-app Payments** - Razorpay integration for coins and premium

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **UI Library**: React Native Paper
- **State Management**: Zustand
- **API Client**: Axios
- **Real-time**: Socket.IO
- **Authentication**: Firebase Auth
- **Voice/Video**: Agora React Native SDK
- **Payments**: Razorpay

## Prerequisites

- Node.js 20 LTS or higher
- Expo Go app on your mobile device
- Firebase project configured
- Agora.io account
- Razorpay account

## Setup

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure environment variables**:

   Create a `.env` file in the root directory with:
   ```env
   EXPO_PUBLIC_API_URL=http://your-backend-url:5000
   EXPO_PUBLIC_API_VERSION=v1
   EXPO_PUBLIC_WS_URL=ws://your-backend-url:5000

   # Firebase
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Agora
   EXPO_PUBLIC_AGORA_APP_ID=your_agora_app_id

   # Razorpay
   EXPO_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

   # App
   EXPO_PUBLIC_DEFAULT_COUNTRY_CODE=+91
   EXPO_PUBLIC_APP_NAME=Banter
   ```

3. **Firebase Setup**:
   - Add `google-services.json` (Android) to project root
   - Add `GoogleService-Info.plist` (iOS) to project root

## Running the App

### Start Development Server
```bash
npm start
```

### Run on Android
```bash
npm run android
```

### Run on iOS
```bash
npm run ios
```

### Test with Expo Go
1. Install Expo Go app on your device
2. Scan the QR code from the terminal
3. Make sure your device and computer are on the same network

## Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   │   ├── phone.tsx      # Phone number input
│   │   └── verify.tsx     # OTP verification
│   ├── (tabs)/            # Main app tabs
│   │   ├── home.tsx       # Home screen
│   │   ├── friends.tsx    # Friends list
│   │   ├── messages.tsx   # Messages/chats
│   │   ├── rooms.tsx      # Chat rooms
│   │   └── profile.tsx    # User profile
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Splash/loading
├── src/
│   ├── components/        # Reusable components
│   ├── constants/         # App constants
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   │   ├── api.ts         # Axios instance
│   │   ├── auth.ts        # Auth service
│   │   ├── firebase.ts    # Firebase service
│   │   ├── socket.ts      # Socket.IO service
│   │   └── user.ts        # User service
│   ├── stores/            # Zustand stores
│   │   └── authStore.ts   # Auth state
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── assets/                # Images, fonts, etc.
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── .env                  # Environment variables
```

## API Integration

The app connects to the backend API at the URL specified in `EXPO_PUBLIC_API_URL`.

**Endpoints**:
- `POST /api/v1/auth/login` - Login with Firebase token
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update profile
- And more... (see `src/constants/index.ts`)

## Socket.IO Events

The app uses Socket.IO for real-time features:
- User presence (online/offline)
- Typing indicators
- New messages
- Incoming calls
- Room events

## Development

### Adding New Screens

Use Expo Router file-based routing:
```bash
# Create new screen
touch app/(tabs)/new-screen.tsx
```

### Adding New Services

Create service files in `src/services/`:
```typescript
// src/services/example.ts
import api from './api';

class ExampleService {
  async getData() {
    const response = await api.get('/endpoint');
    return response.data;
  }
}

export default new ExampleService();
```

## Troubleshooting

### Dependency Conflicts
If you encounter peer dependency issues, use:
```bash
npm install --legacy-peer-deps
```

### Firebase Not Working
- Ensure Firebase config files are in the correct location
- Check that Firebase project has Phone Auth enabled

### Socket Connection Issues
- Verify backend WebSocket URL is correct
- Check that backend server is running
- Ensure device and backend are on the same network (development)

## Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## License

Private - All rights reserved
