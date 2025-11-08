// backend/src/socket/events/callEvents.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketHelper } from '../helpers';
import logger from '../../config/logger';

export const registerCallEvents = (socket: Socket, io: SocketIOServer, userId: string) => {
  // Call initiation
  socket.on('call:initiate', (data: {
    receiverId: string;
    callType: 'audio' | 'video';
    livekitRoom: string;
    livekitToken: string;
    callId: string;
  }) => {
    const receiverSocketId = socketHelper.getUserSocketId(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call:incoming', {
        callerId: userId,
        callType: data.callType,
        livekitRoom: data.livekitRoom,
        livekitToken: data.livekitToken,
        callId: data.callId,
      });
      logger.info(`Call initiated: ${userId} -> ${data.receiverId} (LiveKit room: ${data.livekitRoom})`);
    } else {
      socket.emit('call:error', { message: 'User is offline' });
    }
  });

  // Call accepted
  socket.on('call:accept', (data: { callerId: string }) => {
    const callerSocketId = socketHelper.getUserSocketId(data.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:accepted', { receiverId: userId });
      logger.info(`Call accepted: ${data.callerId} <- ${userId}`);
    }
  });

  // Call rejected
  socket.on('call:reject', (data: { callerId: string; reason?: string }) => {
    const callerSocketId = socketHelper.getUserSocketId(data.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:rejected', {
        receiverId: userId,
        reason: data.reason || 'Call declined',
      });
      logger.info(`Call rejected: ${data.callerId} <- ${userId}`);
    }
  });

  // Call ended
  socket.on('call:end', (data: { peerId: string }) => {
    const peerSocketId = socketHelper.getUserSocketId(data.peerId);
    if (peerSocketId) {
      io.to(peerSocketId).emit('call:ended', { peerId: userId });
      logger.info(`Call ended: ${userId} <-> ${data.peerId}`);
    }
  });
};
