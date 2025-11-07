# Banter - Project Overview

## Project Purpose
Banter is a social networking mobile application for real-time voice, video, and text communication. Similar to apps like Dostt and FRND, it enables users to connect with friends through various communication channels.

## Key Features
- 📞 Voice & Video Calls (Agora.io integration)
- 💬 Real-time Messaging (Socket.IO)
- 🎤 Public Voice Chat Rooms
- 👥 Friend System (requests, management)
- 💰 In-app Payments (Razorpay for Indian market)
- 🔐 Phone OTP Authentication (Firebase)
- 🎙️ Host Verification & Earnings System

## Tech Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (ioredis)
- **Real-time**: Socket.IO
- **Authentication**: Firebase Admin SDK + JWT
- **RTC**: Agora.io (voice/video)
- **Storage**: Azure Blob Storage
- **Payments**: Razorpay
- **Logging**: Winston

### Mobile
- **Framework**: React Native with Expo (~54.0)
- **Navigation**: Expo Router (~6.0)
- **UI Library**: React Native Paper (~5.14)
- **State Management**: Zustand (~5.0)
- **Authentication**: @react-native-firebase/auth
- **RTC**: react-native-agora + agora-react-native-rtm
- **HTTP**: Axios
- **Real-time**: socket.io-client
- **Language**: TypeScript

### Infrastructure (Azure - Central India)
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure App Service
- Azure Blob Storage

## Project Status
- **Overall Progress**: ~47% Complete
- **Backend**: ~60% Complete
- **Mobile**: ~35% Complete
- **Version**: 0.5.0 (MVP in progress)

## Monorepo Structure
The project is organized as a monorepo with two main directories:
- `backend/` - Node.js/Express backend
- `mobile/` - React Native/Expo mobile app
- Root documentation files (README.md, REQUIREMENTS.md, etc.)
