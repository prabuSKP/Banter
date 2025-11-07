// backend/src/services/call.service.ts

import prisma from '../config/database';
import logger from '../config/logger';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { PAGINATION, AGORA } from '../constants';
import agoraService from './agora.service';
import friendService from './friend.service';
import walletService from './wallet.service';
import hostService from './host.service';

export class CallService {
  // Initiate a call between two users
  async initiateCall(callerId: string, receiverId: string, callType: 'audio' | 'video') {
    try {
      // 1. Validate users are friends
      const areFriends = await friendService.areFriends(callerId, receiverId);
      if (!areFriends) {
        throw new BadRequestError('Can only call friends');
      }

      // 2. Verify receiver exists and is active
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId, isActive: true },
      });

      if (!receiver) {
        throw new NotFoundError('User not found');
      }

      // 3. Check if users have blocked each other
      const isBlocked = await this.checkIfBlocked(callerId, receiverId);
      if (isBlocked) {
        throw new BadRequestError('Cannot call this user');
      }

      // 4. Generate unique channel name
      const channelName = `call_${Date.now()}_${callerId.substring(0, 8)}`;

      // 5. Generate Agora tokens for both users
      const callerUid = this.generateUid(callerId);
      const receiverUid = this.generateUid(receiverId);

      const callerToken = agoraService.generateRtcToken(channelName, callerUid, 'publisher');
      const receiverToken = agoraService.generateRtcToken(channelName, receiverUid, 'publisher');

      // 6. Create call log in database
      const callLog = await prisma.callLog.create({
        data: {
          callerId,
          receiverId,
          callType,
          status: 'initiated',
          agoraChannelName: channelName,
          agoraToken: callerToken.token,
        },
      });

      logger.info(`Call initiated: ${callerId} -> ${receiverId}, channel: ${channelName}, callId: ${callLog.id}`);

      return {
        callId: callLog.id,
        channelName,
        callerToken,
        receiverToken,
        receiver: {
          id: receiver.id,
          displayName: receiver.displayName,
          avatarUrl: receiver.avatarUrl,
        },
      };
    } catch (error) {
      logger.error('Initiate call error:', error);
      throw error;
    }
  }

  // Update call status and handle completion logic
  async updateCallStatus(
    callId: string,
    status: 'ringing' | 'answered' | 'completed' | 'rejected' | 'missed' | 'declined' | 'failed',
    duration?: number,
    userId?: string
  ) {
    try {
      // 1. Get call log details
      const callLog = await prisma.callLog.findUnique({
        where: { id: callId },
        include: {
          receiver: { select: { isHost: true } },
        },
      });

      if (!callLog) {
        throw new NotFoundError('Call not found');
      }

      let coinsCharged = 0;

      // 2. Charge coins only for completed calls with duration
      if (status === 'completed' && duration && duration > 0) {
        try {
          const result = await walletService.chargeForCall(
            callLog.callerId,
            callLog.callType as 'audio' | 'video',
            duration,
            callId
          );
          coinsCharged = result.coinsCharged;
          logger.info(`Charged ${coinsCharged} coins for call ${callId}`);
        } catch (walletError) {
          logger.error('Failed to charge for call:', walletError);
          // Don't throw - we still want to update call status
        }
      }

      // 3. Update call log
      const updateData: any = {
        status,
        duration: duration || null,
        coinsCharged: coinsCharged > 0 ? coinsCharged : null,
      };

      // Set timestamps based on status
      if (status === 'answered' && !callLog.startedAt) {
        updateData.startedAt = new Date();
      }
      if (status === 'completed' || status === 'failed') {
        updateData.endedAt = new Date();
      }

      const updatedCallLog = await prisma.callLog.update({
        where: { id: callId },
        data: updateData,
      });

      // 4. Record host earnings if applicable
      if (status === 'completed' && duration && duration > 0 && coinsCharged > 0 && callLog.receiver?.isHost) {
        try {
          await hostService.recordEarning(
            callId,
            callLog.receiverId,
            callLog.callType as 'audio' | 'video',
            duration,
            coinsCharged
          );
          logger.info(`Host earnings recorded for call ${callId}`);
        } catch (earningError) {
          logger.error('Failed to record host earnings:', earningError);
          // Don't throw - call status is already updated
        }
      }

      // 5. Update user statistics
      if (status === 'completed' && duration && duration > 0) {
        await this.updateUserCallStats(callLog.callerId, callLog.receiverId, duration);
      }

      logger.info(`Call status updated: ${callId} -> ${status}`);

      return updatedCallLog;
    } catch (error) {
      logger.error('Update call status error:', error);
      throw error;
    }
  }

  // Get call logs for a user
  async getCallLogs(userId: string, page: number = PAGINATION.DEFAULT_PAGE, limit: number = PAGINATION.DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;

      const calls = await prisma.callLog.findMany({
        where: {
          OR: [
            { callerId: userId },
            { receiverId: userId },
          ],
        },
        include: {
          caller: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              phoneNumber: false,
            },
          },
          receiver: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              phoneNumber: false,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.callLog.count({
        where: {
          OR: [
            { callerId: userId },
            { receiverId: userId },
          ],
        },
      });

      // Transform calls to include call direction
      const transformedCalls = calls.map(call => ({
        ...call,
        direction: call.callerId === userId ? 'outgoing' : 'incoming',
        peer: call.callerId === userId ? call.receiver : call.caller,
      }));

      return {
        calls: transformedCalls,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get call logs error:', error);
      throw error;
    }
  }

  // Get Agora token for an existing call or room
  async getAgoraTokenForRoom(userId: string, roomId: string) {
    try {
      return await agoraService.generateRoomToken(userId, roomId);
    } catch (error) {
      logger.error('Get Agora token for room error:', error);
      throw error;
    }
  }

  // Get call statistics for a user
  async getCallStats(userId: string) {
    try {
      const stats = await prisma.callLog.groupBy({
        by: ['callType', 'status'],
        where: {
          OR: [
            { callerId: userId },
            { receiverId: userId },
          ],
        },
        _count: true,
        _sum: {
          duration: true,
        },
      });

      const totalCalls = await prisma.callLog.count({
        where: {
          OR: [
            { callerId: userId },
            { receiverId: userId },
          ],
        },
      });

      const completedCalls = await prisma.callLog.count({
        where: {
          OR: [
            { callerId: userId },
            { receiverId: userId },
          ],
          status: 'completed',
        },
      });

      const totalMinutes = await prisma.callLog.aggregate({
        where: {
          OR: [
            { callerId: userId },
            { receiverId: userId },
          ],
          status: 'completed',
        },
        _sum: {
          duration: true,
        },
      });

      return {
        totalCalls,
        completedCalls,
        missedCalls: totalCalls - completedCalls,
        totalMinutes: Math.floor((totalMinutes._sum.duration || 0) / 60),
        breakdown: stats,
      };
    } catch (error) {
      logger.error('Get call stats error:', error);
      throw error;
    }
  }

  // Private helper: Check if users have blocked each other
  private async checkIfBlocked(userId1: string, userId2: string): Promise<boolean> {
    try {
      const blockExists = await prisma.blockedUser.findFirst({
        where: {
          OR: [
            { blockerId: userId1, blockedId: userId2 },
            { blockerId: userId2, blockedId: userId1 },
          ],
        },
      });

      return !!blockExists;
    } catch (error) {
      logger.error('Check blocked error:', error);
      return false;
    }
  }

  // Private helper: Update user call statistics
  private async updateUserCallStats(callerId: string, receiverId: string, duration: number) {
    try {
      // Update caller stats
      await prisma.user.update({
        where: { id: callerId },
        data: {
          totalCallsMade: { increment: 1 },
          totalCallMinutes: { increment: Math.floor(duration / 60) },
        },
      });

      // Update receiver stats
      await prisma.user.update({
        where: { id: receiverId },
        data: {
          totalCallsReceived: { increment: 1 },
          totalCallMinutes: { increment: Math.floor(duration / 60) },
        },
      });

      logger.debug(`Updated call stats for users: ${callerId}, ${receiverId}`);
    } catch (error) {
      logger.error('Update user call stats error:', error);
      // Don't throw - this is not critical
    }
  }

  // Private helper: Generate deterministic UID from user ID
  private generateUid(userId: string): number {
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

export default new CallService();
