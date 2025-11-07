// backend/src/socket/events/typingEvents.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketHelper } from '../helpers';

export const registerTypingEvents = (socket: Socket, io: SocketIOServer, userId: string) => {
  // Typing started
  socket.on('typing:start', (data: { receiverId: string }) => {
    const receiverSocketId = socketHelper.getUserSocketId(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:start', { senderId: userId });
    }
  });

  // Typing stopped
  socket.on('typing:stop', (data: { receiverId: string }) => {
    const receiverSocketId = socketHelper.getUserSocketId(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:stop', { senderId: userId });
    }
  });
};
