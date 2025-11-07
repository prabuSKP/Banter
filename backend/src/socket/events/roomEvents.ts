// backend/src/socket/events/roomEvents.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '../../config/logger';

export const registerRoomEvents = (socket: Socket, io: SocketIOServer, userId: string) => {
  // Join room
  socket.on('room:join', (data: { roomId: string }) => {
    socket.join(`room:${data.roomId}`);
    socket.to(`room:${data.roomId}`).emit('room:user_joined', {
      userId,
      roomId: data.roomId,
    });
    logger.info(`User ${userId} joined room ${data.roomId}`);
  });

  // Leave room
  socket.on('room:leave', (data: { roomId: string }) => {
    socket.leave(`room:${data.roomId}`);
    socket.to(`room:${data.roomId}`).emit('room:user_left', {
      userId,
      roomId: data.roomId,
    });
    logger.info(`User ${userId} left room ${data.roomId}`);
  });

  // Speaking status
  socket.on('room:speaking', (data: { roomId: string; isSpeaking: boolean }) => {
    socket.to(`room:${data.roomId}`).emit('room:user_speaking', {
      userId,
      roomId: data.roomId,
      isSpeaking: data.isSpeaking,
    });
  });
};
