// backend/tests/unit/services/call.service.test.ts

import callService from '../../../src/services/call.service';
import prisma from '../../../src/config/database';
import livekitService from '../../../src/services/livekit.service';
import friendService from '../../../src/services/friend.service';
import walletService from '../../../src/services/wallet.service';
import hostService from '../../../src/services/host.service';

jest.mock('../../../src/config/database');
jest.mock('../../../src/services/livekit.service');
jest.mock('../../../src/services/friend.service');
jest.mock('../../../src/services/wallet.service');
jest.mock('../../../src/services/host.service');

describe('CallService Unit Tests', () => {
  const callerId = 'caller-123';
  const receiverId = 'receiver-456';
  const callId = 'call-789';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateCall', () => {
    it('should successfully initiate a call between friends', async () => {
      // Mock friends check
      (friendService.areFriends as jest.Mock).mockResolvedValue(true);

      // Mock receiver user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: receiverId,
        displayName: 'Receiver',
        avatarUrl: null,
        isActive: true,
      });

      // Mock no blocking
      (prisma.blockedUser.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock LiveKit token generation
      (livekitService.generateCallToken as jest.Mock).mockResolvedValue({
        token: 'test-livekit-token',
        roomName: 'call_call-789',
        identity: callerId,
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
        serverUrl: 'wss://test.livekit.cloud',
        canPublish: true,
        canSubscribe: true,
      });

      // Mock call log creation
      (prisma.callLog.create as jest.Mock).mockResolvedValue({
        id: callId,
        callerId,
        receiverId,
        callType: 'video',
        status: 'initiated',
        livekitRoom: 'call_call-789',
      });

      const result = await callService.initiateCall(callerId, receiverId, 'video');

      expect(result).toHaveProperty('callId');
      expect(result).toHaveProperty('roomName');
      expect(result).toHaveProperty('callerToken');
      expect(result).toHaveProperty('receiverToken');
      expect(result).toHaveProperty('serverUrl');
      expect(friendService.areFriends).toHaveBeenCalledWith(callerId, receiverId);
      expect(prisma.callLog.create).toHaveBeenCalled();
    });

    it('should throw error if users are not friends', async () => {
      (friendService.areFriends as jest.Mock).mockResolvedValue(false);

      await expect(
        callService.initiateCall(callerId, receiverId, 'video')
      ).rejects.toThrow('Can only call friends');
    });

    it('should throw error if receiver not found', async () => {
      (friendService.areFriends as jest.Mock).mockResolvedValue(true);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        callService.initiateCall(callerId, receiverId, 'video')
      ).rejects.toThrow('User not found');
    });

    it('should throw error if users are blocked', async () => {
      (friendService.areFriends as jest.Mock).mockResolvedValue(true);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: receiverId,
        isActive: true,
      });
      (prisma.blockedUser.findFirst as jest.Mock).mockResolvedValue({
        id: 'block-id',
      });

      await expect(
        callService.initiateCall(callerId, receiverId, 'video')
      ).rejects.toThrow('Cannot call this user');
    });
  });

  describe('updateCallStatus', () => {
    it('should update call status to completed', async () => {
      const duration = 120;

      (prisma.callLog.findUnique as jest.Mock).mockResolvedValue({
        id: callId,
        callerId,
        receiverId,
        callType: 'video',
        status: 'answered',
        receiver: { isHost: false },
      });

      (prisma.callLog.update as jest.Mock).mockResolvedValue({
        id: callId,
        status: 'completed',
        duration,
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await callService.updateCallStatus(callId, 'completed', duration);

      expect(result).toHaveProperty('status', 'completed');
      expect(prisma.callLog.update).toHaveBeenCalled();
    });

    it('should charge coins for completed calls', async () => {
      const duration = 120;

      (prisma.callLog.findUnique as jest.Mock).mockResolvedValue({
        id: callId,
        callerId,
        receiverId,
        callType: 'video',
        receiver: { isHost: false },
      });

      (walletService.chargeForCall as jest.Mock).mockResolvedValue({
        coinsCharged: 20,
      });

      (prisma.callLog.update as jest.Mock).mockResolvedValue({
        id: callId,
        status: 'completed',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await callService.updateCallStatus(callId, 'completed', duration);

      expect(walletService.chargeForCall).toHaveBeenCalledWith(
        callerId,
        'video',
        duration,
        callId
      );
    });

    it('should record host earnings if receiver is host', async () => {
      const duration = 120;
      const coinsCharged = 20;

      (prisma.callLog.findUnique as jest.Mock).mockResolvedValue({
        id: callId,
        callerId,
        receiverId,
        callType: 'video',
        receiver: { isHost: true },
      });

      (walletService.chargeForCall as jest.Mock).mockResolvedValue({
        coinsCharged,
      });

      (prisma.callLog.update as jest.Mock).mockResolvedValue({
        id: callId,
        status: 'completed',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (hostService.recordEarning as jest.Mock).mockResolvedValue({});

      await callService.updateCallStatus(callId, 'completed', duration);

      expect(hostService.recordEarning).toHaveBeenCalledWith(
        callId,
        receiverId,
        'video',
        duration,
        coinsCharged
      );
    });

    it('should not charge coins for rejected calls', async () => {
      (prisma.callLog.findUnique as jest.Mock).mockResolvedValue({
        id: callId,
        callerId,
        receiverId,
        callType: 'video',
        receiver: { isHost: false },
      });

      (prisma.callLog.update as jest.Mock).mockResolvedValue({
        id: callId,
        status: 'rejected',
      });

      await callService.updateCallStatus(callId, 'rejected');

      expect(walletService.chargeForCall).not.toHaveBeenCalled();
    });
  });

  describe('getCallLogs', () => {
    it('should return paginated call logs', async () => {
      const mockCalls = [
        {
          id: 'call-1',
          callerId,
          receiverId,
          callType: 'video',
          status: 'completed',
          createdAt: new Date(),
          caller: { id: callerId, displayName: 'Caller' },
          receiver: { id: receiverId, displayName: 'Receiver' },
        },
      ];

      (prisma.callLog.findMany as jest.Mock).mockResolvedValue(mockCalls);
      (prisma.callLog.count as jest.Mock).mockResolvedValue(1);

      const result = await callService.getCallLogs(callerId, 1, 50);

      expect(result.calls).toHaveLength(1);
      expect(result.pagination).toHaveProperty('total', 1);
      expect(result.pagination).toHaveProperty('page', 1);
    });

    it('should add call direction to each call', async () => {
      const mockCalls = [
        {
          id: 'call-1',
          callerId,
          receiverId,
          caller: { id: callerId },
          receiver: { id: receiverId },
        },
      ];

      (prisma.callLog.findMany as jest.Mock).mockResolvedValue(mockCalls);
      (prisma.callLog.count as jest.Mock).mockResolvedValue(1);

      const result = await callService.getCallLogs(callerId);

      expect(result.calls[0]).toHaveProperty('direction', 'outgoing');
    });
  });

  describe('getCallStats', () => {
    it('should return call statistics', async () => {
      (prisma.callLog.groupBy as jest.Mock).mockResolvedValue([
        {
          callType: 'video',
          status: 'completed',
          _count: 10,
          _sum: { duration: 1200 },
        },
      ]);

      (prisma.callLog.count as jest.Mock).mockResolvedValue(15);

      (prisma.callLog.aggregate as jest.Mock).mockResolvedValue({
        _sum: { duration: 1800 },
      });

      const result = await callService.getCallStats(callerId);

      expect(result).toHaveProperty('totalCalls', 15);
      expect(result).toHaveProperty('completedCalls');
      expect(result).toHaveProperty('totalMinutes');
      expect(result).toHaveProperty('breakdown');
    });
  });

  describe('generateUid', () => {
    it('should generate consistent UID for same user', () => {
      const service = callService as any;
      const uid1 = service.generateUid(callerId);
      const uid2 = service.generateUid(callerId);

      expect(uid1).toBe(uid2);
      expect(typeof uid1).toBe('number');
      expect(uid1).toBeGreaterThan(0);
    });

    it('should generate different UIDs for different users', () => {
      const service = callService as any;
      const uid1 = service.generateUid(callerId);
      const uid2 = service.generateUid(receiverId);

      expect(uid1).not.toBe(uid2);
    });
  });
});
