// backend/src/socket/index.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import logger from '../config/logger';
import userService from '../services/user.service';
import { socketHelper } from './helpers';
import { registerTypingEvents } from './events/typingEvents';
import { registerCallEvents } from './events/callEvents';
import { registerRoomEvents } from './events/roomEvents';
import { registerMessageEvents } from './events/messageEvents';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  phoneNumber?: string;
}

// Export helper functions for use in other modules
export { socketHelper };
