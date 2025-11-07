# Banter - Codebase Structure

## Backend Structure (`backend/`)

### Main Entry Points
- `src/server.ts` - Server startup, Socket.IO initialization, graceful shutdown
- `src/app.ts` - Express app configuration, middleware, routes, error handling

### Directory Organization

#### `/src/config/`
Configuration and initialization files:
- `database.ts` - Prisma client setup
- `redis.ts` - Redis client configuration
- `firebase.ts` - Firebase Admin SDK
- `logger.ts` - Winston logger setup
- `env.ts` - Environment variable validation

#### `/src/controllers/`
Request handlers (controller classes):
- `auth.controller.ts` - Authentication endpoints
- `user.controller.ts` - User management
- `friend.controller.ts` - Friend system
- `message.controller.ts` - Messaging
- `call.controller.ts` - Call management
- Plus: room, upload, payment, wallet, report, notification, admin, host controllers

#### `/src/services/`
Business logic layer:
- `auth.service.ts` - Authentication logic
- `user.service.ts` - User operations
- `friend.service.ts` - Friend management
- `message.service.ts` - Message handling
- `agora.service.ts` - Agora token generation, call management, earnings integration
- `host.service.ts` - Host verification, earnings, withdrawals, ratings

#### `/src/routes/`
Express route definitions:
- One route file per feature area (auth, user, friend, message, call, etc.)
- All routes prefixed with `/api/v1/`

#### `/src/middleware/`
Express middleware:
- `auth.ts` - JWT authentication
- `validation.ts` - Request validation
- `rateLimiter.ts` - Rate limiting

#### `/src/socket/`
Socket.IO event handlers:
- `index.ts` - Socket initialization and event handling

#### `/src/utils/`
Utility functions and helpers

#### `/src/types/`
TypeScript type definitions

#### `/prisma/`
- `schema.prisma` - Database schema (12 models)

#### `/tests/`
- `setup.ts` - Global test setup
- `unit/` - Unit tests
- `integration/` - Integration tests
- `utils/testHelpers.ts` - Test utilities

#### `/dist/`
Compiled JavaScript output (after `npm run build`)

#### `/logs/`
Winston log files

## Mobile Structure (`mobile/`)

### Main Entry Points
- `index.ts` - Expo entry point
- `App.tsx` - Root component
- `app/_layout.tsx` - Root layout with navigation setup

### Directory Organization

#### `/app/`
Expo Router file-based routing:
- `index.tsx` - Initial screen/splash
- `(auth)/` - Authentication screens (phone.tsx, verify.tsx)
- `(tabs)/` - Main tab screens (home, friends, messages, rooms, profile)
- Additional screens for features

#### `/src/components/`
Reusable React Native components

#### `/src/services/`
API communication layer:
- `api.ts` - Axios instance configuration
- `auth.ts` - Auth API calls
- `firebase.ts` - Firebase integration
- `socket.ts` - Socket.IO client
- `user.ts` - User API calls
- Plus: friend, message, call, room, host services

#### `/src/stores/`
Zustand state management stores

#### `/src/hooks/`
Custom React hooks

#### `/src/constants/`
App constants and configuration

#### `/src/types/`
TypeScript type definitions

#### `/src/config/`
Configuration files

#### `/src/utils/`
Utility functions

#### `/tests/`
Jest tests for mobile app

#### `/assets/`
Static assets (images, fonts, etc.)

## Configuration Files

### Backend
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript config (ES2020, strict mode)
- `jest.config.js` - Jest test configuration
- `nodemon.json` - Nodemon config for dev mode
- `.env` - Environment variables (gitignored)
- `.env.example` - Environment template

### Mobile
- `package.json` - Dependencies and scripts
- `tsconfig.json` - Extends expo/tsconfig.base
- `jest.config.js` - Jest configuration
- `babel.config.js` - Babel configuration
- `app.json` - Expo configuration
- `.env` - Environment variables (gitignored)
- Firebase config files (google-services.json, GoogleService-Info.plist)

## Key Design Patterns

### Backend
- **MVC Architecture**: Routes → Controllers → Services → Database
- **Service Layer**: Business logic separated from controllers
- **Dependency Injection**: Services imported and instantiated
- **Error Handling**: Custom error classes, centralized error handler
- **Middleware Chain**: Authentication → Validation → Controller
- **Class-based Controllers**: Controllers as classes with methods

### Mobile
- **File-based Routing**: Expo Router with directory structure
- **Centralized State**: Zustand stores for global state
- **Service Layer**: API communication abstracted in services
- **Component Composition**: Reusable components
- **Hook-based Logic**: Custom hooks for shared logic
