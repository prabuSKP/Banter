# 🎙️ Banter - Social Voice & Video App

A modern social networking application for real-time voice, video, and text communication. Built with React Native (Expo) and Node.js.

## 📱 Features

- 🔐 **Phone Authentication** - Secure OTP login via Firebase
- 👥 **Friends System** - Send and manage friend requests
- 💬 **Real-time Messaging** - Text, images, audio, video, GIFs
- 📞 **Voice & Video Calls** - HD quality with Agora.io
- 🎤 **Voice Chat Rooms** - Public and private group rooms
- 💰 **In-app Payments** - Razorpay for coins and premium
- 🔔 **Push Notifications** - Firebase Cloud Messaging

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run prisma:generate
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install --legacy-peer-deps
# Create .env file
npm start
```

## 📖 Documentation

- [REQUIREMENTS.md](REQUIREMENTS.md) - Complete development specification
- [backend/README.md](backend/README.md) - Backend API documentation
- [mobile/README.md](mobile/README.md) - Mobile app setup guide
- [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) - Progress tracking
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Architecture overview
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing documentation

## 📊 Progress

**Overall: ~47% Complete**

✅ Backend (60%) - Core infrastructure, Auth, Users, Friends, Messages, Calls
✅ Mobile (35%) - Setup, Navigation, Auth, Services
🚧 In Progress - Chat rooms, File upload, UI screens

## 🧪 Testing

```bash
cd backend
npm test
npm run test:coverage
```

## 📝 License

Private - All rights reserved

---

**Built with ❤️ using React Native, Node.js, and Claude AI**
