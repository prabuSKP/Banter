# Banter - Architecture Analysis & Findings

## Analysis Date: 2025-10-11

## Executive Summary

Overall, the Banter project shows **good architectural patterns** with a clean MVC structure, proper separation of concerns, and consistent patterns. However, there are several **missing files**, **inconsistencies**, and **opportunities for improvement** identified during this analysis.

**Overall Architecture Grade: B+ (Good, with room for improvement)**

---

## 1. CRITICAL ISSUES (High Priority)

### 1.1 Missing Service Layer
**Issue**: No dedicated `call.service.ts` file
- `call.controller.ts` exists and calls `agora.service.ts` directly
- Business logic for calls is mixed between controller and agora service
- **Impact**: Violates separation of concerns, makes testing harder

**Recommendation**: Create `backend/src/services/call.service.ts`
- Move call-specific business logic from `call.controller.ts`
- Keep agora.service.ts focused on Agora-specific operations only
- Controller should only call call.service, not agora.service directly

### 1.2 Missing Mobile Service
**Issue**: No `rooms.service.ts` in mobile app
- Backend has room.controller.ts and room.service.ts
- Mobile has room screens (app/(tabs)/rooms.tsx) but no corresponding service
- Other features (friends, messages, calls) have mobile services

**Recommendation**: Create `mobile/src/services/rooms.ts`
- Add API calls for room operations
- Create corresponding Zustand store (`mobile/src/stores/roomsStore.ts`)
- Ensure consistency with other mobile services

### 1.3 Missing Zustand Store
**Issue**: No `roomsStore.ts` in mobile stores
- Other features have stores (authStore, friendsStore, messagesStore, callsStore, hostStore, walletStore)
- Rooms feature incomplete without state management

**Recommendation**: Create `mobile/src/stores/roomsStore.ts`
- Follow pattern from other stores
- Manage room state, active room, members, speaking status

---

## 2. ARCHITECTURAL PATTERNS (Observed)

### 2.1 Backend Architecture ✅ GOOD

**Pattern**: Clean MVC with Service Layer
```
Routes → Controllers → Services → Database (Prisma)
         ↓           ↓
    Middleware   Business Logic
```

**Strengths**:
- Clear separation of concerns
- Controllers handle HTTP, Services handle business logic
- Consistent class-based approach
- Singleton pattern for services (`export default new ServiceName()`)
- Centralized error handling with custom error classes

**Consistency Check**:
- ✅ All controllers follow same pattern (class-based)
- ✅ All services follow same pattern (class-based with singleton)
- ✅ All routes follow same pattern (Express Router)
- ⚠️ **EXCEPTION**: Call feature missing service layer

### 2.2 Mobile Architecture ✅ GOOD

**Pattern**: Component-Service-Store Architecture
```
Screens → Services → API
   ↓         ↓
Stores   Business Logic
```

**Strengths**:
- File-based routing with Expo Router
- Centralized API client with interceptors
- Zustand for state management
- Separation between services (API calls) and stores (state)

**Consistency Check**:
- ✅ Most features have service + store
- ⚠️ **EXCEPTION**: Rooms feature incomplete (missing service + store)

### 2.3 Error Handling ✅ EXCELLENT

**Custom Error Classes** (backend/src/utils/errors.ts):
- AppError (base class)
- BadRequestError (400)
- UnauthorizedError (401)
- ForbiddenError (403)
- NotFoundError (404)
- ConflictError (409)
- ValidationError (422)
- InternalServerError (500)

**Strengths**:
- Comprehensive HTTP status code coverage
- isOperational flag for distinguishing errors
- Centralized error handler in app.ts

### 2.4 Validation ✅ GOOD

**Pattern**: Zod schemas for validation
- Environment variables validated in `config/env.ts`
- Request validation middleware using Zod schemas
- Type safety throughout

**Observation**: Zod used consistently across backend

---

## 3. INCONSISTENCIES & ANTI-PATTERNS

### 3.1 Service Layer Inconsistency ⚠️ MEDIUM PRIORITY

**Issue**: Call controller bypasses service layer

**Current Pattern**:
```typescript
// call.controller.ts
const callData = await agoraService.generateCallToken(...); // Direct call
```

**Expected Pattern**:
```typescript
// call.controller.ts
const callData = await callService.initiateCall(...); // Should call call.service

// call.service.ts (NEW FILE)
async initiateCall(...) {
  // Business logic
  const token = await agoraService.generateCallToken(...);
  // More business logic
  return callData;
}
```

### 3.2 Mobile Service Gaps ⚠️ MEDIUM PRIORITY

**Missing Services/Stores**:
1. `mobile/src/services/rooms.ts` - MISSING
2. `mobile/src/stores/roomsStore.ts` - MISSING

**Existing Services**: auth, user, wallet, payment, friends, messages, calls, host, analytics, socket, firebase

**Pattern Break**: All other features have both service + store, except rooms

### 3.3 Socket.IO Helper Functions 🎯 GOOD PATTERN

**Strengths** (backend/src/socket/index.ts):
- `getUserSocketId()` - Get user's socket
- `emitToUser()` - Emit to specific user
- `isUserOnline()` - Check online status
- In-memory user connection tracking

**Recommendation**: Consider moving to separate module
- Create `backend/src/socket/helpers.ts` for utilities
- Keep `backend/src/socket/index.ts` focused on event handlers
- Improves testability and reusability

---

## 4. MISSING FILES SUMMARY

### Backend Missing Files:
1. ❌ `backend/src/services/call.service.ts` - **CRITICAL**
   - Should handle call business logic
   - Currently logic split between controller and agora.service

2. ⚠️ `backend/src/socket/helpers.ts` - **NICE TO HAVE**
   - Extract socket helper functions
   - Improve code organization

3. ⚠️ `backend/src/types/index.ts` or `common.ts` - **NICE TO HAVE**
   - Currently types defined in individual files
   - Could benefit from shared type definitions

### Mobile Missing Files:
1. ❌ `mobile/src/services/rooms.ts` - **CRITICAL**
   - API calls for room operations
   - Matches backend room.service.ts

2. ❌ `mobile/src/stores/roomsStore.ts` - **CRITICAL**
   - State management for rooms
   - Matches pattern from other stores

3. ⚠️ `mobile/src/types/index.ts` - **NICE TO HAVE**
   - Centralized type definitions
   - Currently types scattered across services/stores

---

## 5. CODE QUALITY OBSERVATIONS

### 5.1 Strengths ✅

1. **TypeScript Strict Mode**: Enabled in both backend and mobile
2. **Comprehensive Testing**: Unit + integration tests with good coverage targets (70-80%)
3. **Security Best Practices**:
   - JWT authentication with refresh tokens
   - Rate limiting middleware
   - Input validation with Zod
   - Firebase Admin SDK for secure auth
4. **Logging**: Winston logger used consistently
5. **Environment Validation**: Zod schema ensures all required env vars present
6. **Database Design**: Well-normalized schema with proper relationships
7. **Documentation**: Extensive markdown documentation

### 5.2 Areas for Improvement ⚠️

1. **No ESLint Configuration**:
   - ESLint packages installed in package.json
   - No `.eslintrc` file found
   - Code style maintained manually

2. **No Prettier Configuration**:
   - No automated formatting
   - Potential for inconsistent formatting

3. **Mixed Responsibility** in agora.service.ts:
   - Handles both Agora SDK operations AND call business logic
   - Should be split: agora.service (SDK) + call.service (business logic)

4. **No Centralized Constants**:
   - Magic numbers in code (e.g., earning rates in host.service)
   - Should be extracted to constants file

---

## 6. REFACTORING OPPORTUNITIES (By Module)

### 6.1 Call Module (HIGH PRIORITY)

**Current Issues**:
- No call.service.ts
- Business logic in controller and agora.service

**Proposed Refactor**:

```typescript
// NEW FILE: backend/src/services/call.service.ts
export class CallService {
  async initiateCall(callerId: string, receiverId: string, callType: string) {
    // 1. Validate users exist and are not blocked
    // 2. Check receiver availability
    // 3. Generate Agora token via agora.service
    // 4. Create call log in database
    // 5. Return call data
  }

  async updateCallStatus(callId: string, status: string, duration?: number) {
    // 1. Update call log
    // 2. If completed and host, trigger earnings via host.service
    // 3. Update user statistics
  }

  async getCallLogs(userId: string, page: number, limit: number) {
    // 1. Fetch paginated call logs
    // 2. Include user details
    // 3. Return formatted data
  }
}

// REFACTOR: backend/src/services/agora.service.ts
export class AgoraService {
  // Keep only Agora SDK-specific methods
  generateToken(channelName: string, uid: number) { }
  generateRTMToken(userId: string) { }
  // Remove business logic methods
}

// REFACTOR: backend/src/controllers/call.controller.ts
export class CallController {
  async initiateCall(req, res, next) {
    // Call callService instead of agoraService
    const callData = await callService.initiateCall(...);
  }
}
```

### 6.2 Room Module (MEDIUM PRIORITY)

**Current Issues**:
- Mobile app missing service and store
- Backend implementation exists but mobile is incomplete

**Proposed Addition**:

```typescript
// NEW FILE: mobile/src/services/rooms.ts
import api from './api';

export const roomsService = {
  async getRooms(limit?: number, offset?: number) { },
  async getRoom(roomId: string) { },
  async createRoom(data: CreateRoomDTO) { },
  async joinRoom(roomId: string) { },
  async leaveRoom(roomId: string) { },
  async getRoomMembers(roomId: string) { },
};

// NEW FILE: mobile/src/stores/roomsStore.ts
import { create } from 'zustand';

interface RoomsState {
  rooms: Room[];
  activeRoom: Room | null;
  members: User[];
  loading: boolean;
  error: string | null;
  
  fetchRooms: () => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  setActiveRoom: (room: Room | null) => void;
}

export const useRoomsStore = create<RoomsState>((set, get) => ({
  // Implementation following pattern from other stores
}));
```

### 6.3 Socket Module (LOW PRIORITY)

**Current State**: All code in single file (socket/index.ts)

**Proposed Refactor**:

```typescript
// backend/src/socket/index.ts - Main initialization
export const initializeSocket = (io: SocketIOServer) => {
  // Keep authentication and main connection handler
}

// NEW FILE: backend/src/socket/helpers.ts
export class SocketHelper {
  private userConnections = new Map<string, string>();
  
  getUserSocketId(userId: string): string | undefined { }
  emitToUser(io, userId, event, data): boolean { }
  isUserOnline(userId: string): boolean { }
  addConnection(userId, socketId) { }
  removeConnection(userId) { }
}

// NEW FILE: backend/src/socket/events/callEvents.ts
export const registerCallEvents = (socket, io, socketHelper) => {
  socket.on('call:initiate', (data) => { });
  socket.on('call:accept', (data) => { });
  socket.on('call:reject', (data) => { });
  socket.on('call:end', (data) => { });
}

// NEW FILE: backend/src/socket/events/messageEvents.ts
// NEW FILE: backend/src/socket/events/roomEvents.ts
```

**Benefits**:
- Easier to test individual event handlers
- Better code organization
- Easier to add new features

### 6.4 Constants Extraction (MEDIUM PRIORITY)

**Current Issue**: Magic numbers scattered in code

**Proposed Structure**:

```typescript
// NEW FILE: backend/src/constants/index.ts
export const APP_CONSTANTS = {
  EARNINGS: {
    VIDEO_CALL_PERCENTAGE: 0.30,
    AUDIO_CALL_PERCENTAGE: 0.15,
    COIN_TO_INR_RATE: 0.1,
  },
  WITHDRAWAL: {
    MIN_AMOUNT: 500,
    PROCESSING_TIME_DAYS: 5,
  },
  CALL: {
    MAX_DURATION_HOURS: 24,
    RING_TIMEOUT_SECONDS: 60,
  },
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100,
  },
};

// NEW FILE: mobile/src/constants/index.ts
export const CONSTANTS = {
  // Mirror backend constants where needed
  // Add mobile-specific constants
};
```

### 6.5 Error Handling Enhancement (LOW PRIORITY)

**Current State**: Good, but could be better

**Proposed Enhancement**:

```typescript
// ENHANCE: backend/src/utils/errors.ts

// Add error codes for better client handling
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code: string; // NEW: Error code like 'USER_NOT_FOUND'
  
  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found', code: string = 'RESOURCE_NOT_FOUND') {
    super(message, 404, code);
  }
}

// Usage:
throw new NotFoundError('User not found', 'USER_NOT_FOUND');
throw new NotFoundError('Call not found', 'CALL_NOT_FOUND');

// Client can handle specific error codes
```

---

## 7. SECURITY RECOMMENDATIONS

### 7.1 Current Security Measures ✅

1. JWT authentication with refresh tokens
2. Rate limiting (100 req/15min general, 5 req/min auth)
3. Input validation with Zod
4. CORS configuration
5. Prisma (SQL injection protection)
6. Firebase Admin SDK for auth
7. User blocking system

### 7.2 Additional Recommendations ⚠️

1. **Add Helmet.js** for security headers:
   ```bash
   npm install helmet
   ```
   ```typescript
   // app.ts
   import helmet from 'helmet';
   app.use(helmet());
   ```

2. **Request Size Limiting** (already partially done):
   - Current: 10mb limit
   - Consider: Separate limits for different endpoints

3. **API Versioning Headers**:
   - Add deprecation warnings for old API versions
   - Better client migration support

4. **HTTPS Enforcement** in production:
   ```typescript
   if (env.NODE_ENV === 'production') {
     app.use((req, res, next) => {
       if (!req.secure) {
         return res.redirect('https://' + req.headers.host + req.url);
       }
       next();
     });
   }
   ```

---

## 8. PERFORMANCE RECOMMENDATIONS

### 8.1 Database Optimization ✅ GOOD

**Current State**:
- Indexes on foreign keys
- Pagination implemented
- Redis caching configured

**Recommendations**:
1. **Add Database Query Logging** in development:
   ```typescript
   // prisma/schema.prisma
   generator client {
     provider = "prisma-client-js"
     log      = ["query"] // Add in development
   }
   ```

2. **Implement Query Result Caching**:
   - Cache user profiles (low change frequency)
   - Cache public room lists
   - Cache friend lists with TTL

### 8.2 Mobile Optimization

**Recommendations**:
1. **Image Optimization**:
   - Use Expo's image caching
   - Implement lazy loading for lists

2. **Bundle Size**:
   - Review dependencies
   - Consider code splitting

---

## 9. TESTING GAPS

### 9.1 Backend Testing ✅ GOOD

**Current Coverage**:
- Auth endpoints (integration)
- User endpoints (integration)
- JWT utilities (unit)
- Validators (unit)

**Missing Tests**:
- ❌ Friend endpoints
- ❌ Message endpoints
- ❌ Call endpoints
- ❌ Room endpoints
- ❌ Socket.IO events
- ❌ Host service tests (mentioned in docs, verify existence)

**Recommendation**: Add integration tests for remaining endpoints

### 9.2 Mobile Testing ⚠️ NEEDS WORK

**Current State**: Jest configured but unclear coverage

**Recommendation**:
- Add tests for stores (Zustand)
- Add tests for services
- Add component tests with React Testing Library
- Add E2E tests with Detox (future)

---

## 10. DOCUMENTATION QUALITY ✅ EXCELLENT

**Strengths**:
- Comprehensive README files
- Detailed API documentation
- Architecture documentation (PROJECT_SUMMARY.md)
- Requirements documentation
- Testing guide
- Host system documentation
- Firebase setup guides

**Minor Improvements**:
- Add JSDoc comments to public API methods
- Generate API docs with Swagger/OpenAPI
- Add architecture diagrams (consider Mermaid)

---

## 11. PRIORITY RECOMMENDATIONS SUMMARY

### CRITICAL (Do Immediately) 🔴

1. **Create `backend/src/services/call.service.ts`**
   - Refactor call business logic from controller and agora.service
   - Maintain separation of concerns

2. **Create `mobile/src/services/rooms.ts`**
   - Complete the rooms feature
   - Match backend implementation

3. **Create `mobile/src/stores/roomsStore.ts`**
   - State management for rooms
   - Follow pattern from other stores

### HIGH PRIORITY (Do Soon) 🟡

4. **Add ESLint Configuration**
   - Create `.eslintrc.js` for backend and mobile
   - Enable linting scripts

5. **Add Prettier Configuration**
   - Create `.prettierrc` for consistent formatting
   - Add format scripts

6. **Extract Constants**
   - Create `backend/src/constants/index.ts`
   - Move magic numbers to constants

### MEDIUM PRIORITY (Do When Possible) 🟢

7. **Complete Testing Coverage**
   - Add missing integration tests for endpoints
   - Add mobile tests for stores and services

8. **Refactor Socket Module**
   - Split into helpers and event handlers
   - Improve testability

9. **Add Security Headers**
   - Install and configure Helmet.js
   - Add security middleware

### LOW PRIORITY (Nice to Have) 🔵

10. **Add API Documentation**
    - Implement Swagger/OpenAPI
    - Auto-generate API docs

11. **Enhance Error Handling**
    - Add error codes
    - Improve client-side error handling

12. **Performance Monitoring**
    - Add APM tool (NewRelic, DataDog)
    - Monitor database query performance

---

## 12. NEXT STEPS

Would you like me to:

1. **Implement the critical fixes** (create missing service files)?
2. **Set up ESLint and Prettier** configurations?
3. **Create constant files** and extract magic numbers?
4. **Refactor specific modules** in detail?
5. **Generate detailed implementation plans** for any of the recommendations?

Please let me know which improvements you'd like me to implement first, and I'll create the files and apply the changes after your confirmation.
