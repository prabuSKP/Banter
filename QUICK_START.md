# 🚀 Banter - Quick Start Guide

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 20 LTS or higher
- ✅ PostgreSQL 14+
- ✅ Redis 7+
- ✅ Git
- ✅ Code editor (VS Code recommended)
- ✅ Expo Go app on your mobile device

## Accounts Needed

1. **Firebase** - https://console.firebase.google.com
   - Create project
   - Enable Phone Authentication
   - Download service account JSON

2. **Agora.io** - https://console.agora.io
   - Create project
   - Get App ID and App Certificate

3. **Razorpay** - https://dashboard.razorpay.com
   - Create account
   - Get API Key ID and Secret

4. **Azure** (Optional for local dev)
   - Create Storage Account
   - Get connection string

## Backend Setup (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `backend/.env`:
```env
# Application
NODE_ENV=development
PORT=5000

# Database (Local PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/banter_db

# Redis (Local)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (Generate random 32+ char strings)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars

# Firebase (From Firebase Console)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nKey\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Agora (From Agora Console)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# Razorpay (From Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=webhook_secret

# Azure Blob (For file uploads)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=xxx;AccountKey=xxx
AZURE_STORAGE_CONTAINER_NAME=banter-media

# CORS
CORS_ORIGIN=http://localhost:8081,exp://192.168.1.100:8081

# App Config
DEFAULT_COUNTRY_CODE=+91
INITIAL_USER_COINS=100
```

### 3. Setup Database
```bash
# Create database
createdb banter_db

# Run Prisma migrations
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start Backend
```bash
npm run dev
```

Backend should now be running on http://localhost:5000

Test: http://localhost:5000/health

## Mobile Setup (3 minutes)

### 1. Install Dependencies
```bash
cd mobile
npm install --legacy-peer-deps
```

### 2. Configure Environment
Create `mobile/.env`:
```env
# Backend API
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
EXPO_PUBLIC_WS_URL=ws://192.168.1.100:5000

# Firebase (From Firebase Console)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:android:xxxxx

# Agora
EXPO_PUBLIC_AGORA_APP_ID=your_agora_app_id

# Razorpay
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

# App
EXPO_PUBLIC_DEFAULT_COUNTRY_CODE=+91
EXPO_PUBLIC_APP_NAME=Banter
```

**Important**: Replace `192.168.1.100` with your actual local IP address!

### 3. Start Expo
```bash
npm start
```

### 4. Test on Device
1. Install "Expo Go" app on your phone
2. Scan QR code from terminal
3. Ensure phone and computer are on same WiFi

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Kill process on port 5000
npx kill-port 5000
```

**Database connection failed:**
```bash
# Check if PostgreSQL is running
pg_isready

# Restart PostgreSQL
brew services restart postgresql  # macOS
sudo service postgresql restart    # Linux
```

**Redis connection failed:**
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server  # Or brew/systemctl commands
```

### Mobile Issues

**Can't connect to backend:**
1. Check your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `EXPO_PUBLIC_API_URL` in mobile/.env
3. Ensure backend is running
4. Check firewall settings

**Firebase errors:**
1. Verify Firebase is configured for your app
2. Add SHA-1/SHA-256 keys in Firebase Console (Android)
3. Download latest `google-services.json` (Android)
4. Download latest `GoogleService-Info.plist` (iOS)

**Dependency errors:**
```bash
# Clear and reinstall
rm -rf node_modules
npm install --legacy-peer-deps
```

## Testing the App

### 1. Test Authentication
1. Open app on device
2. Enter phone number (+91XXXXXXXXXX)
3. Receive OTP via SMS
4. Enter OTP to login

### 2. Test API Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Login (requires Firebase token)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"firebaseIdToken":"YOUR_TOKEN"}'
```

### 3. Run Tests
```bash
cd backend
npm test
```

## Next Steps

1. **Explore the API**: http://localhost:5000/api/v1/
2. **Read API Docs**: See `backend/README.md`
3. **Check Mobile Screens**: Navigate through tabs
4. **View Logs**: Check `backend/logs/` folder
5. **Test Features**: Try friends, messages, calls

## Common Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run prisma:studio # Open database GUI
```

### Mobile
```bash
npm start            # Start Expo
npm run android      # Run on Android
npm run ios          # Run on iOS
```

## Development Tips

1. **Hot Reload**: Both backend (nodemon) and mobile (Expo) support hot reload
2. **Debugging**: Use Chrome DevTools for React Native
3. **Database GUI**: Run `npm run prisma:studio` to view database
4. **Logs**: Check `backend/logs/combined.log` for all logs
5. **API Testing**: Use Postman or Thunder Client VS Code extension

## Production Deployment

### Backend (Azure)
1. Create Azure App Service
2. Configure environment variables
3. Deploy from Git or CI/CD
4. Run migrations: `npm run prisma:migrate`

### Mobile
1. Configure app signing
2. Build: `eas build`
3. Submit to stores: `eas submit`

## Support

- **Docs**: Check `/docs` folder
- **Issues**: See GitHub Issues
- **API**: `backend/README.md`
- **Mobile**: `mobile/README.md`

---

Happy Coding! 🎉
