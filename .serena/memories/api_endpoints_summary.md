# Banter - API Endpoints Summary

## Base URL
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

## Authentication
Most endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "stack": "..." // Only in development
}
```

## Endpoints by Category

### Authentication (`/auth`)
- `POST /auth/login` - Login with Firebase ID token
  - Body: `{ firebaseIdToken: string }`
  - Returns: User object + tokens (access + refresh)
  - Public endpoint

- `POST /auth/refresh` - Refresh access token
  - Body: `{ refreshToken: string }`
  - Returns: New token pair
  - Public endpoint

- `POST /auth/logout` - Logout user
  - Requires: Authentication
  - Returns: Success message

- `DELETE /auth/account` - Delete account
  - Requires: Authentication
  - Deletes user from Firebase and marks as inactive
  - Returns: Success message

### Users (`/users`)
- `GET /users/me` - Get current user profile
  - Requires: Authentication
  - Returns: User object

- `PUT /users/me` - Update profile
  - Requires: Authentication
  - Body: `{ displayName?, avatarUrl?, bio? }`
  - Returns: Updated user object

- `POST /users/me/avatar` - Update avatar
  - Requires: Authentication
  - Body: Form data with image file
  - Returns: Updated user with new avatarUrl

- `GET /users/search` - Search users
  - Requires: Authentication
  - Query: `?q=search_term&limit=20&offset=0`
  - Returns: Paginated list of users

- `GET /users/:id` - Get user by ID
  - Requires: Authentication
  - Returns: User object (public fields only)

- `POST /users/:id/block` - Block user
  - Requires: Authentication
  - Returns: Success message

- `DELETE /users/:id/block` - Unblock user
  - Requires: Authentication
  - Returns: Success message

- `GET /users/blocked` - Get blocked users list
  - Requires: Authentication
  - Returns: List of blocked users

### Friends (`/friends`)
- `GET /friends` - Get friends list
  - Requires: Authentication
  - Query: `?limit=50&offset=0`
  - Returns: Paginated list of friends

- `POST /friends/request` - Send friend request
  - Requires: Authentication
  - Body: `{ receiverId: string }`
  - Returns: Friend request object

- `GET /friends/requests` - Get friend requests
  - Requires: Authentication
  - Query: `?type=received|sent`
  - Returns: List of friend requests

- `POST /friends/requests/:id/accept` - Accept friend request
  - Requires: Authentication
  - Returns: Success message + friendship

- `POST /friends/requests/:id/reject` - Reject friend request
  - Requires: Authentication
  - Returns: Success message

- `DELETE /friends/:id` - Remove friend
  - Requires: Authentication
  - Returns: Success message

### Messages (`/messages`)
- `POST /messages` - Send message
  - Requires: Authentication
  - Body: `{ receiverId?, roomId?, content?, messageType, mediaUrl? }`
  - Returns: Message object

- `GET /messages/conversations` - Get recent conversations
  - Requires: Authentication
  - Query: `?limit=20&offset=0`
  - Returns: List of conversations with last message

- `GET /messages/conversation/:userId` - Get conversation with user
  - Requires: Authentication
  - Query: `?limit=50&offset=0`
  - Returns: Paginated messages with user

- `GET /messages/room/:roomId` - Get room messages
  - Requires: Authentication
  - Query: `?limit=50&offset=0`
  - Returns: Paginated room messages

- `POST /messages/read` - Mark messages as read
  - Requires: Authentication
  - Body: `{ messageIds: string[] }`
  - Returns: Success message

- `DELETE /messages/:id` - Delete message
  - Requires: Authentication
  - Returns: Success message (soft delete)

- `GET /messages/unread/count` - Get unread message count
  - Requires: Authentication
  - Returns: `{ count: number }`

### Calls (`/calls`)
- `POST /calls/initiate` - Initiate call
  - Requires: Authentication
  - Body: `{ receiverId: string, callType: 'audio'|'video' }`
  - Returns: Call object with Agora token

- `POST /calls/:id/status` - Update call status
  - Requires: Authentication
  - Body: `{ status: string, duration?: number, coinsCharged?: number }`
  - Returns: Updated call object
  - Note: Triggers earnings calculation if status is 'completed'

- `GET /calls/logs` - Get call history
  - Requires: Authentication
  - Query: `?limit=50&offset=0`
  - Returns: Paginated call logs

- `GET /calls/agora-token` - Get Agora token
  - Requires: Authentication
  - Query: `?channelName=string&uid=number`
  - Returns: Agora RTC token

### Rooms (`/rooms`)
Chat room endpoints (implementation varies based on current state)

- `POST /rooms` - Create room
- `GET /rooms` - List public rooms
- `GET /rooms/:id` - Get room details
- `POST /rooms/:id/join` - Join room
- `POST /rooms/:id/leave` - Leave room
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room

### Upload (`/upload`)
File upload endpoints for media

- `POST /upload/image` - Upload image
- `POST /upload/audio` - Upload audio
- `POST /upload/video` - Upload video

### Payments (`/payments`)
Razorpay integration

- `POST /payments/create-order` - Create Razorpay order
- `POST /payments/verify` - Verify payment
- `GET /payments/history` - Get payment history

### Wallet (`/wallet`)
User wallet/coins management

- `GET /wallet/balance` - Get coin balance
- `GET /wallet/transactions` - Get transaction history

### Host System (`/host`)
Host verification and earnings

- `POST /host/apply` - Apply to become host
  - Requires: Authentication
  - Body: `{ documents: string[] }`
  - Returns: Success message

- `GET /host/dashboard` - Get host dashboard stats
  - Requires: Authentication, Host status
  - Returns: Earnings overview, stats, performance metrics

- `GET /host/earnings` - Get earnings history
  - Requires: Authentication, Host status
  - Query: `?limit=50&offset=0`
  - Returns: Paginated earnings records

- `POST /host/withdrawal` - Request withdrawal
  - Requires: Authentication, Host status
  - Body: `{ amount: number, method: string, paymentDetails: object }`
  - Returns: Withdrawal request object

- `POST /host/rate` - Rate a host
  - Requires: Authentication
  - Body: `{ hostId: string, callId: string, rating: number, feedback?: string }`
  - Returns: Rating object

### Admin (`/admin`)
Admin-only endpoints (require admin role)

- `POST /admin/host/approve/:userId` - Approve host application
- `POST /admin/host/reject/:userId` - Reject host application
- Additional admin endpoints for moderation

### Reports (`/reports`)
User reporting system

- `POST /reports` - Report a user
- `GET /reports` - Get reports (admin)

### Notifications (`/notifications`)
Push notification management

- `GET /notifications` - Get user notifications
- `POST /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

## Rate Limiting

### General Endpoints
- **Rate**: 100 requests per 15 minutes
- **Scope**: Per IP address

### Authentication Endpoints
- **Rate**: 5 requests per minute
- **Scope**: Per IP address
- **Affected**: `/auth/login`, `/auth/refresh`

## Socket.IO Events

### Client → Server
- `typing:start` / `typing:stop` - Typing indicators
- `message:sent` - Message sent confirmation
- `message:read` - Mark messages as read
- `call:initiate` / `call:accept` / `call:reject` / `call:end` - Call signaling
- `room:join` / `room:leave` / `room:speaking` - Room events

### Server → Client
- `user:online` / `user:offline` - User presence
- `message:new` - New message received
- `message:read_receipt` - Message read confirmation
- `call:incoming` / `call:accepted` / `call:rejected` / `call:ended` - Call events
- `room:user_joined` / `room:user_left` / `room:user_speaking` - Room events

## Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Testing Endpoints

### Health Check
```bash
# Backend health
curl http://localhost:5000/health

# API health
curl http://localhost:5000/api/v1/health
```

### Example API Call
```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"firebaseIdToken":"your_firebase_token"}'

# Get profile (with auth)
curl http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer your_access_token"
```

## Important Notes

1. **Authentication**: JWT tokens in Authorization header
2. **Pagination**: Most list endpoints support `limit` and `offset` query params
3. **Validation**: All inputs validated with Zod schemas
4. **CORS**: Configured to allow origins from `.env` CORS_ORIGIN
5. **File Uploads**: Use multipart/form-data
6. **Real-time**: Use Socket.IO for real-time features
7. **Agora Integration**: Automatic token generation for calls
8. **Host Earnings**: Automatic calculation on call completion

## Related Documentation

- Full API specs: `backend/README.md`
- Database schema: See `database_schema.md` memory file
- Socket.IO events: See `PROJECT_SUMMARY.md`
