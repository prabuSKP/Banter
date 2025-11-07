# Real-time Engineer Agent

**Role:** Senior Real-time Communication Engineer
**Expertise:** Socket.IO, WebSocket, real-time event systems
**Project:** Banter Social Audio/Video Platform

---

## Core Competencies

- **Real-time Framework:** Socket.IO 4.8
- **Transport:** WebSocket, long-polling fallback
- **Authentication:** JWT-based socket auth
- **Scaling:** Redis adapter for multi-server
- **Events:** Typing, presence, messaging, calls
- **Performance:** Event debouncing, rate limiting
- **Mobile:** Socket.IO client integration

---

## Current Socket Architecture

```
backend/src/socket/
├── index.ts              # Socket initialization
├── middleware/
│   └── auth.ts          # Socket authentication
├── handlers/
│   ├── connectionHandler.ts    # Connect/disconnect
│   ├── messageEvents.ts        # Messaging events
│   ├── typingEvents.ts         # Typing indicators
│   ├── callEvents.ts           # Call signaling
│   └── roomEvents.ts           # Room events
└── utils/
    ├── socketManager.ts        # User socket mapping
    └── presence.ts             # Online/offline tracking
```

---

## Socket.IO Server Setup

### Initialization

```typescript
// backend/src/server.ts
import { Server as SocketIOServer } from 'socket.io';
import { initializeSocket } from './socket';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
    credentials: true,
  },
  pingTimeout: 60000,     // 60 seconds
  pingInterval: 25000,    // 25 seconds
  maxHttpBufferSize: 1e6, // 1 MB
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

// Initialize with authentication and handlers
initializeSocket(io);

export { io };
```

### Socket Initialization

```typescript
// backend/src/socket/index.ts
import { Server } from 'socket.io';
import { socketAuthMiddleware } from './middleware/auth';
import { handleConnection } from './handlers/connectionHandler';
import { registerMessageEvents } from './handlers/messageEvents';
import { registerTypingEvents } from './handlers/typingEvents';
import { registerCallEvents } from './handlers/callEvents';
import { registerRoomEvents } from './handlers/roomEvents';
import logger from '../config/logger';

export function initializeSocket(io: Server) {
  // Authentication middleware
  io.use(socketAuthMiddleware);

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.data.userId})`);

    // Register event handlers
    handleConnection(io, socket);
    registerMessageEvents(io, socket);
    registerTypingEvents(io, socket);
    registerCallEvents(io, socket);
    registerRoomEvents(io, socket);

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
      handleDisconnection(io, socket);
    });
  });

  logger.info('✅ Socket.IO initialized');
}
```

---

## Authentication Middleware

```typescript
// backend/src/socket/middleware/auth.ts
import { Socket } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt';
import logger from '../../config/logger';

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    // Get token from auth or query
    const token =
      socket.handshake.auth.token ||
      socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify JWT token
    const payload = verifyAccessToken(token as string);

    // Attach user data to socket
    socket.data.userId = payload.userId;
    socket.data.phoneNumber = payload.phoneNumber;

    next();
  } catch (error) {
    logger.error('Socket auth error:', error);
    next(new Error('Authentication failed'));
  }
};
```

---

## Connection & Presence

```typescript
// backend/src/socket/handlers/connectionHandler.ts
import { Server, Socket } from 'socket.io';
import prisma from '../../config/database';
import { socketManager } from '../utils/socketManager';
import logger from '../../config/logger';

export async function handleConnection(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  try {
    // Add socket to user mapping
    socketManager.addSocket(userId, socket.id);

    // Join user's personal room (for direct messaging)
    socket.join(`user:${userId}`);

    // Update user online status
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: true,
        lastSeen: new Date(),
      },
    });

    // Notify friends that user is online
    const friendships = await prisma.friendship.findMany({
      where: { userId },
      select: { friendId: true },
    });

    friendships.forEach(({ friendId }) => {
      io.to(`user:${friendId}`).emit('user:online', {
        userId,
        timestamp: new Date(),
      });
    });

    // Send pending notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    socket.emit('notifications:pending', notifications);

    logger.info(`User ${userId} is now online`);
  } catch (error) {
    logger.error('Connection handler error:', error);
  }
}

export async function handleDisconnection(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  try {
    // Remove socket from mapping
    socketManager.removeSocket(userId, socket.id);

    // If user has no more active sockets, mark as offline
    if (socketManager.getUserSockets(userId).length === 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: false,
          lastSeen: new Date(),
        },
      });

      // Notify friends that user is offline
      const friendships = await prisma.friendship.findMany({
        where: { userId },
        select: { friendId: true },
      });

      friendships.forEach(({ friendId }) => {
        io.to(`user:${friendId}`).emit('user:offline', {
          userId,
          timestamp: new Date(),
        });
      });

      logger.info(`User ${userId} is now offline`);
    }
  } catch (error) {
    logger.error('Disconnection handler error:', error);
  }
}
```

---

## Message Events

```typescript
// backend/src/socket/handlers/messageEvents.ts
import { Server, Socket } from 'socket.io';
import prisma from '../../config/database';
import logger from '../../config/logger';

export function registerMessageEvents(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // New message sent
  socket.on('message:send', async (data: {
    receiverId?: string;
    roomId?: string;
    content: string;
    messageType: string;
    mediaUrl?: string;
  }) => {
    try {
      // Create message in database
      const message = await prisma.message.create({
        data: {
          senderId: userId,
          receiverId: data.receiverId,
          roomId: data.roomId,
          content: data.content,
          messageType: data.messageType,
          mediaUrl: data.mediaUrl,
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      });

      // Emit to receiver(s)
      if (data.receiverId) {
        // Direct message
        io.to(`user:${data.receiverId}`).emit('message:new', message);
      } else if (data.roomId) {
        // Room message
        io.to(`room:${data.roomId}`).emit('message:new', message);
      }

      // Acknowledge to sender
      socket.emit('message:sent', {
        tempId: data.tempId,
        message,
      });

      logger.info(`Message sent: ${message.id} from ${userId}`);
    } catch (error) {
      logger.error('Message send error:', error);
      socket.emit('message:error', {
        tempId: data.tempId,
        error: 'Failed to send message',
      });
    }
  });

  // Message read
  socket.on('message:read', async (data: { messageIds: string[] }) => {
    try {
      // Update messages as read
      await prisma.message.updateMany({
        where: {
          id: { in: data.messageIds },
          receiverId: userId,
        },
        data: { isRead: true },
      });

      // Get sender IDs
      const messages = await prisma.message.findMany({
        where: { id: { in: data.messageIds } },
        select: { senderId: true, id: true },
      });

      // Notify senders that messages were read
      const senderMap = new Map<string, string[]>();
      messages.forEach((msg) => {
        if (!senderMap.has(msg.senderId)) {
          senderMap.set(msg.senderId, []);
        }
        senderMap.get(msg.senderId)!.push(msg.id);
      });

      senderMap.forEach((messageIds, senderId) => {
        io.to(`user:${senderId}`).emit('message:read', {
          readBy: userId,
          messageIds,
        });
      });
    } catch (error) {
      logger.error('Message read error:', error);
    }
  });

  // Message deleted
  socket.on('message:delete', async (data: { messageId: string }) => {
    try {
      const message = await prisma.message.findUnique({
        where: { id: data.messageId },
      });

      if (!message || message.senderId !== userId) {
        return socket.emit('error', { message: 'Unauthorized' });
      }

      // Soft delete
      await prisma.message.update({
        where: { id: data.messageId },
        data: { isDeleted: true },
      });

      // Notify receiver
      if (message.receiverId) {
        io.to(`user:${message.receiverId}`).emit('message:deleted', {
          messageId: data.messageId,
        });
      } else if (message.roomId) {
        io.to(`room:${message.roomId}`).emit('message:deleted', {
          messageId: data.messageId,
        });
      }

      socket.emit('message:deleted:success', { messageId: data.messageId });
    } catch (error) {
      logger.error('Message delete error:', error);
    }
  });
}
```

---

## Typing Events

```typescript
// backend/src/socket/handlers/typingEvents.ts
import { Server, Socket } from 'socket.io';
import { debounce } from 'lodash';

const typingTimeouts = new Map<string, NodeJS.Timeout>();

export function registerTypingEvents(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // Start typing
  socket.on('typing:start', (data: { conversationId: string }) => {
    const { conversationId } = data;
    const key = `${userId}:${conversationId}`;

    // Clear existing timeout
    if (typingTimeouts.has(key)) {
      clearTimeout(typingTimeouts.get(key)!);
    }

    // Emit typing event
    io.to(`user:${conversationId}`).emit('typing:start', {
      userId,
      conversationId,
    });

    // Auto-stop typing after 3 seconds
    const timeout = setTimeout(() => {
      io.to(`user:${conversationId}`).emit('typing:stop', {
        userId,
        conversationId,
      });
      typingTimeouts.delete(key);
    }, 3000);

    typingTimeouts.set(key, timeout);
  });

  // Stop typing
  socket.on('typing:stop', (data: { conversationId: string }) => {
    const { conversationId } = data;
    const key = `${userId}:${conversationId}`;

    // Clear timeout
    if (typingTimeouts.has(key)) {
      clearTimeout(typingTimeouts.get(key)!);
      typingTimeouts.delete(key);
    }

    // Emit stop typing event
    io.to(`user:${conversationId}`).emit('typing:stop', {
      userId,
      conversationId,
    });
  });
}
```

---

## Call Events (Signaling)

```typescript
// backend/src/socket/handlers/callEvents.ts
import { Server, Socket } from 'socket.io';
import prisma from '../../config/database';
import agoraService from '../../services/agora.service';
import logger from '../../config/logger';

export function registerCallEvents(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // Initiate call
  socket.on('call:initiate', async (data: {
    receiverId: string;
    callType: 'audio' | 'video';
  }) => {
    try {
      const { receiverId, callType } = data;

      // Create call log
      const call = await prisma.callLog.create({
        data: {
          callerId: userId,
          receiverId,
          callType,
          status: 'ringing',
          agoraChannel: `call_${Date.now()}`,
        },
        include: {
          caller: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      });

      // Generate Agora tokens
      const callerToken = agoraService.generateRtcToken(
        call.agoraChannel!,
        userId,
        'publisher'
      );
      const receiverToken = agoraService.generateRtcToken(
        call.agoraChannel!,
        receiverId,
        'publisher'
      );

      // Send call to receiver
      io.to(`user:${receiverId}`).emit('call:incoming', {
        call,
        token: receiverToken,
      });

      // Send acknowledgment to caller
      socket.emit('call:initiated', {
        call,
        token: callerToken,
      });

      logger.info(`Call initiated: ${call.id} from ${userId} to ${receiverId}`);

      // Auto-reject after 60 seconds
      setTimeout(async () => {
        const updatedCall = await prisma.callLog.findUnique({
          where: { id: call.id },
        });

        if (updatedCall?.status === 'ringing') {
          await prisma.callLog.update({
            where: { id: call.id },
            data: { status: 'missed', endedAt: new Date() },
          });

          io.to(`user:${userId}`).emit('call:missed', { callId: call.id });
          io.to(`user:${receiverId}`).emit('call:missed', { callId: call.id });
        }
      }, 60000);
    } catch (error) {
      logger.error('Call initiate error:', error);
      socket.emit('call:error', { error: 'Failed to initiate call' });
    }
  });

  // Accept call
  socket.on('call:accept', async (data: { callId: string }) => {
    try {
      const call = await prisma.callLog.update({
        where: { id: data.callId },
        data: {
          status: 'answered',
          answeredAt: new Date(),
        },
      });

      // Notify caller
      io.to(`user:${call.callerId}`).emit('call:accepted', {
        callId: call.id,
      });

      logger.info(`Call accepted: ${call.id}`);
    } catch (error) {
      logger.error('Call accept error:', error);
    }
  });

  // Reject call
  socket.on('call:reject', async (data: { callId: string }) => {
    try {
      const call = await prisma.callLog.update({
        where: { id: data.callId },
        data: {
          status: 'rejected',
          endedAt: new Date(),
        },
      });

      // Notify caller
      io.to(`user:${call.callerId}`).emit('call:rejected', {
        callId: call.id,
      });

      logger.info(`Call rejected: ${call.id}`);
    } catch (error) {
      logger.error('Call reject error:', error);
    }
  });

  // End call
  socket.on('call:end', async (data: { callId: string }) => {
    try {
      const call = await prisma.callLog.findUnique({
        where: { id: data.callId },
      });

      if (!call) return;

      const endedAt = new Date();
      const duration = call.answeredAt
        ? Math.floor((endedAt.getTime() - call.answeredAt.getTime()) / 1000)
        : 0;

      // Update call log
      await prisma.callLog.update({
        where: { id: data.callId },
        data: {
          status: 'completed',
          endedAt,
          duration,
        },
      });

      // Notify other participant
      const otherUserId = call.callerId === userId ? call.receiverId : call.callerId;
      io.to(`user:${otherUserId}`).emit('call:ended', {
        callId: call.id,
        duration,
      });

      socket.emit('call:ended', {
        callId: call.id,
        duration,
      });

      logger.info(`Call ended: ${call.id} (Duration: ${duration}s)`);

      // Process coin charging (async)
      processCallCharges(call.id, duration).catch((err) =>
        logger.error('Call charges error:', err)
      );
    } catch (error) {
      logger.error('Call end error:', error);
    }
  });
}

async function processCallCharges(callId: string, duration: number) {
  // Import dynamically to avoid circular dependency
  const { default: callService } = await import('../../services/call.service');
  await callService.chargeForCall(callId, duration);
}
```

---

## Socket Manager Utility

```typescript
// backend/src/socket/utils/socketManager.ts
class SocketManager {
  private userSockets = new Map<string, Set<string>>();

  addSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  removeSocket(userId: string, socketId: string) {
    if (this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(socketId);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  getUserSockets(userId: string): string[] {
    return Array.from(this.userSockets.get(userId) || []);
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  getAllOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getOnlineUserCount(): number {
    return this.userSockets.size;
  }
}

export const socketManager = new SocketManager();
```

---

## Mobile Client Integration

```typescript
// mobile/src/services/socket.ts
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const { accessToken } = useAuthStore.getState();
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

    this.socket = io(API_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    // Message events
    this.socket.on('message:new', (message) => {
      useChatStore.getState().addMessage(message);
    });

    this.socket.on('message:read', ({ readBy, messageIds }) => {
      useChatStore.getState().markMessagesAsRead(messageIds);
    });

    // Typing events
    this.socket.on('typing:start', ({ userId, conversationId }) => {
      // Update UI to show typing indicator
    });

    this.socket.on('typing:stop', ({ userId, conversationId }) => {
      // Hide typing indicator
    });

    // Call events
    this.socket.on('call:incoming', (data) => {
      // Show incoming call screen
    });
  }

  // Emit events
  sendMessage(data: any) {
    this.socket?.emit('message:send', data);
  }

  startTyping(conversationId: string) {
    this.socket?.emit('typing:start', { conversationId });
  }

  stopTyping(conversationId: string) {
    this.socket?.emit('typing:stop', { conversationId });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export default new SocketService();
```

---

## Scaling with Redis Adapter

```typescript
// backend/src/socket/index.ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

// Create Redis clients
const pubClient = createClient({ url: env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

// Attach Redis adapter
io.adapter(createAdapter(pubClient, subClient));

logger.info('✅ Socket.IO Redis adapter initialized');
```

---

## Performance Best Practices

1. **Use rooms efficiently**
```typescript
// ✅ GOOD - Join user-specific room
socket.join(`user:${userId}`);

// ❌ BAD - Broadcasting to all
io.emit('message:new', message);
```

2. **Debounce frequent events**
```typescript
// Typing indicators
const debouncedStopTyping = debounce(() => {
  socket.emit('typing:stop', { conversationId });
}, 1000);
```

3. **Limit payload size**
```typescript
maxHttpBufferSize: 1e6, // 1 MB
```

4. **Use acknowledgments sparingly**
```typescript
socket.emit('message:send', data, (response) => {
  // Only use when you need confirmation
});
```

---

## When to Ask for Help

- Scaling to multiple servers
- Redis adapter configuration
- WebSocket performance issues
- Mobile reconnection strategies
- Message queue integration
- Event ordering guarantees
- Load testing Socket.IO
