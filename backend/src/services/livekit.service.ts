// backend/src/services/livekit.service.ts
/**
 * LiveKit WebRTC Service
 *
 * Production-grade service for managing LiveKit voice/video calls
 * Replaces Agora.io with open-source LiveKit + COTURN solution
 *
 * Features:
 * - JWT-based token generation for secure room access
 * - Room creation and management
 * - Participant permissions (publish/subscribe)
 * - Integration with call credit system
 * - Error handling and logging
 *
 * @see https://docs.livekit.io/
 */

import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import env from '../config/env';
import logger from '../config/logger';
import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';

/**
 * LiveKit Service Configuration
 */
interface LiveKitConfig {
  apiKey: string;
  apiSecret: string;
  serverUrl: string;
  tokenExpiry: number;
}

/**
 * Token Generation Result
 */
interface TokenResult {
  token: string;
  roomName: string;
  identity: string;
  expiresAt: number;
  serverUrl: string;
  canPublish: boolean;
  canSubscribe: boolean;
}

/**
 * Room Creation Options
 */
interface RoomOptions {
  maxParticipants?: number;
  emptyTimeout?: number;
  metadata?: string;
}

/**
 * LiveKit Service Class
 *
 * Manages LiveKit WebRTC operations including:
 * - Token generation for room access
 * - Room lifecycle management
 * - Participant permissions
 * - Integration with database
 */
export class LiveKitService {
  private config: LiveKitConfig;
  private roomService: RoomServiceClient;

  constructor() {
    // Initialize configuration from environment variables
    this.config = {
      apiKey: env.LIVEKIT_API_KEY,
      apiSecret: env.LIVEKIT_API_SECRET,
      serverUrl: env.LIVEKIT_SERVER_URL,
      tokenExpiry: parseInt(env.LIVEKIT_TOKEN_EXPIRY || '3600'), // Default 1 hour
    };

    // Initialize RoomServiceClient for room management
    this.roomService = new RoomServiceClient(
      this.config.serverUrl,
      this.config.apiKey,
      this.config.apiSecret
    );

    logger.info('LiveKit service initialized', {
      serverUrl: this.config.serverUrl,
      tokenExpiry: this.config.tokenExpiry,
    });
  }

  /**
   * Generate LiveKit Access Token
   *
   * Creates a JWT token that grants access to a LiveKit room
   * with specified permissions
   *
   * @param roomName - Unique room identifier
   * @param identity - User identifier (userId)
   * @param name - Display name for participant
   * @param canPublish - Allow publishing audio/video
   * @param canSubscribe - Allow subscribing to other participants
   * @param metadata - Optional metadata for participant
   * @returns Token result with JWT and room details
   */
  generateToken(
    roomName: string,
    identity: string,
    name: string,
    canPublish: boolean = true,
    canSubscribe: boolean = true,
    metadata?: string
  ): TokenResult {
    try {
      // Create AccessToken instance
      const at = new AccessToken(
        this.config.apiKey,
        this.config.apiSecret,
        {
          identity,
          name,
          metadata,
        }
      );

      // Add room grant with permissions
      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish,
        canSubscribe,
        canPublishData: true, // Allow data channel messages
      });

      // Generate JWT token
      const token = at.toJwt();
      const expiresAt = Math.floor(Date.now() / 1000) + this.config.tokenExpiry;

      logger.info('Generated LiveKit token', {
        roomName,
        identity,
        name,
        canPublish,
        canSubscribe,
        expiresAt,
      });

      return {
        token,
        roomName,
        identity,
        expiresAt,
        serverUrl: this.config.serverUrl,
        canPublish,
        canSubscribe,
      };
    } catch (error) {
      logger.error('Generate LiveKit token error:', error);
      throw error;
    }
  }

  /**
   * Generate token for 1-on-1 call
   *
   * Creates a LiveKit room for a direct call between two users
   * Room name format: call_{callId}
   *
   * @param callId - Database call record ID
   * @param userId - User requesting token
   * @param userName - Display name of user
   * @returns Token result for the call
   */
  async generateCallToken(
    callId: string,
    userId: string,
    userName: string
  ): Promise<TokenResult> {
    try {
      // Verify call exists and user is participant
      const call = await prisma.callLog.findUnique({
        where: { id: callId },
        include: {
          caller: true,
          receiver: true,
        },
      });

      if (!call) {
        throw new NotFoundError('Call not found');
      }

      // Verify user is caller or receiver
      if (call.callerId !== userId && call.receiverId !== userId) {
        throw new BadRequestError('You are not a participant in this call');
      }

      // Generate room name
      const roomName = `call_${callId}`;

      // Update call record with LiveKit room name
      if (!call.livekitRoom) {
        await prisma.callLog.update({
          where: { id: callId },
          data: { livekitRoom: roomName },
        });
      }

      // Generate token with full permissions (both can publish and subscribe)
      const tokenData = this.generateToken(
        roomName,
        userId,
        userName,
        true, // Can publish
        true  // Can subscribe
      );

      logger.info('Call token generated', {
        callId,
        userId,
        userName,
        roomName,
      });

      return tokenData;
    } catch (error) {
      logger.error('Generate call token error:', error);
      throw error;
    }
  }

  /**
   * Generate token for chat room
   *
   * Creates a LiveKit room for group voice/video chat
   * Room name format: room_{roomId}
   *
   * @param userId - User requesting access
   * @param roomId - Chat room ID
   * @param userName - Display name of user
   * @returns Token result for the room
   */
  async generateRoomToken(
    userId: string,
    roomId: string,
    userName: string
  ): Promise<TokenResult> {
    try {
      // Verify user is member of room
      const membership = await prisma.chatRoomMember.findFirst({
        where: {
          roomId,
          userId,
          leftAt: null, // User hasn't left
        },
        include: {
          chatRoom: true,
        },
      });

      if (!membership) {
        throw new BadRequestError('You are not a member of this room');
      }

      const room = membership.chatRoom;

      if (!room) {
        throw new NotFoundError('Room not found');
      }

      // Generate or use existing LiveKit room name
      let livekitRoomName = room.livekitRoomName;
      if (!livekitRoomName) {
        livekitRoomName = `room_${roomId}`;

        // Update room with LiveKit room name
        await prisma.chatRoom.update({
          where: { id: roomId },
          data: { livekitRoomName },
        });
      }

      // Determine permissions based on room role
      const canPublish = membership.role === 'admin' || membership.role === 'moderator' || membership.role === 'member';
      const canSubscribe = true;

      // Generate token
      const tokenData = this.generateToken(
        livekitRoomName,
        userId,
        userName,
        canPublish,
        canSubscribe,
        JSON.stringify({ role: membership.role })
      );

      logger.info('Room token generated', {
        userId,
        roomId,
        userName,
        livekitRoomName,
        role: membership.role,
      });

      return tokenData;
    } catch (error) {
      logger.error('Generate room token error:', error);
      throw error;
    }
  }

  /**
   * Create LiveKit Room
   *
   * Creates a new room in LiveKit server
   * Optional - rooms are auto-created when first participant joins
   *
   * @param roomName - Unique room identifier
   * @param options - Room configuration options
   */
  async createRoom(roomName: string, options?: RoomOptions): Promise<void> {
    try {
      await this.roomService.createRoom({
        name: roomName,
        emptyTimeout: options?.emptyTimeout || 300, // 5 minutes default
        maxParticipants: options?.maxParticipants || 100,
        metadata: options?.metadata,
      });

      logger.info('LiveKit room created', { roomName, options });
    } catch (error) {
      logger.error('Create LiveKit room error:', error);
      throw error;
    }
  }

  /**
   * Delete LiveKit Room
   *
   * Deletes a room from LiveKit server
   * All participants will be disconnected
   *
   * @param roomName - Room to delete
   */
  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.roomService.deleteRoom(roomName);
      logger.info('LiveKit room deleted', { roomName });
    } catch (error) {
      logger.error('Delete LiveKit room error:', error);
      throw error;
    }
  }

  /**
   * List Active Rooms
   *
   * Gets list of all active rooms from LiveKit server
   *
   * @returns Array of room names
   */
  async listRooms(): Promise<string[]> {
    try {
      const rooms = await this.roomService.listRooms();
      return rooms.map(room => room.name);
    } catch (error) {
      logger.error('List LiveKit rooms error:', error);
      throw error;
    }
  }

  /**
   * List Room Participants
   *
   * Gets list of participants currently in a room
   *
   * @param roomName - Room to query
   * @returns Array of participant identities
   */
  async listParticipants(roomName: string): Promise<string[]> {
    try {
      const participants = await this.roomService.listParticipants(roomName);
      return participants.map(p => p.identity);
    } catch (error) {
      logger.error('List room participants error:', error);
      throw error;
    }
  }

  /**
   * Remove Participant
   *
   * Forcefully removes a participant from a room
   *
   * @param roomName - Room name
   * @param identity - Participant identity to remove
   */
  async removeParticipant(roomName: string, identity: string): Promise<void> {
    try {
      await this.roomService.removeParticipant(roomName, identity);
      logger.info('Participant removed from room', { roomName, identity });
    } catch (error) {
      logger.error('Remove participant error:', error);
      throw error;
    }
  }

  /**
   * Get Room Info
   *
   * Gets detailed information about a room
   *
   * @param roomName - Room to query
   * @returns Room details
   */
  async getRoomInfo(roomName: string) {
    try {
      const rooms = await this.roomService.listRooms([roomName]);
      return rooms.length > 0 ? rooms[0] : null;
    } catch (error) {
      logger.error('Get room info error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new LiveKitService();
