// backend/src/socket/events/messageEvents.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketHelper } from '../helpers';
import logger from '../../config/logger';

export const registerMessageEvents = (socket: Socket, io: SocketIOServer, userId: string) => {
  // Message sent
  socket.on('message:sent', (data: {
    receiverId?: string;
    roomId?: string;
    messageId: string;
  }) => {
    if (data.receiverId) {
      const receiverSocketId = socketHelper.getUserSocketId(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:new', {
          messageId: data.messageId,
          senderId: userId,
        });
      }
    } else if (data.roomId) {
      socket.to(`room:${data.roomId}`).emit('message:new', {
        messageId: data.messageId,
        senderId: userId,
        roomId: data.roomId,
      });
    }
  });

  // Message read
  socket.on('message:read', (data: { messageIds: string[] }) => {
    // Notify sender that messages were read
    data.messageIds.forEach(messageId => {
      socket.broadcast.emit('message:read_receipt', {
        messageId,
        readBy: userId,
      });
    });
  });
};
