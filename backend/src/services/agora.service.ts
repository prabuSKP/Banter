// backend/src/services/agora.service.ts

import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import env from '../config/env';
import logger from '../config/logger';
import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AGORA } from '../constants';


export class AgoraService {
  private appId: string;
  private appCertificate: string;
  private tokenExpiry: number;

  constructor() {
    this.appId = env.AGORA_APP_ID;
    this.appCertificate = env.AGORA_APP_CERTIFICATE;
    this.tokenExpiry = parseInt(env.AGORA_TOKEN_EXPIRY);
  }

  // Generate RTC token for voice/video call
  generateRtcToken(channelName: string, uid: number, role: 'publisher' | 'subscriber' = 'publisher') {
    try {
      const privilegeExpireTime = Math.floor(Date.now() / 1000) + this.tokenExpiry;

      const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

      const token = RtcTokenBuilder.buildTokenWithUid(
        this.appId,
        this.appCertificate,
        channelName,
        uid,
        agoraRole,
        privilegeExpireTime,
        privilegeExpireTime
      );

      logger.info(`Generated Agora RTC token for channel: ${channelName}, uid: ${uid}`);

      return {
        token,
        channel: channelName,
        uid,
        expiresAt: privilegeExpireTime,
        appId: this.appId,
      };
    } catch (error) {
      logger.error('Generate Agora token error:', error);
      throw error;
    }
  }

  // Generate token for room
  async generateRoomToken(userId: string, roomId: string) {
    try {
      // Verify user is member of room
      const membership = await prisma.chatRoomMember.findFirst({
        where: {
          roomId,
          userId,
          leftAt: null, // User hasn't left
        },
      });

      if (!membership) {
        throw new BadRequestError('You are not a member of this room');
      }

      // Get room
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        throw new NotFoundError('Room not found');
      }

      // Use existing channel or create new one
      let channelName = room.agoraChannelName;
      if (!channelName) {
        channelName = `room_${roomId.substring(0, 8)}_${Date.now()}`;

        // Update room with channel name
        await prisma.chatRoom.update({
          where: { id: roomId },
          data: { agoraChannelName: channelName },
        });
      }

      const uid = this.generateUid(userId);
      const tokenData = this.generateRtcToken(channelName, uid, 'publisher');

      logger.info(`Room token generated: ${userId} for room ${roomId}`);

      return tokenData;
    } catch (error) {
      logger.error('Generate room token error:', error);
      throw error;
    }
  }

  // Generate deterministic UID from user ID
  generateUid(userId: string): number {
    // Simple hash function to convert UUID to number
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % AGORA.UID_MAX_VALUE; // Ensure positive and within int32 range
  }
}

export default new AgoraService();
