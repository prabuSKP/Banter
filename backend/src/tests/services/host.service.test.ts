// backend/src/tests/services/host.service.test.ts

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import hostService from '../../services/host.service';
import prisma from '../../config/database';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/errors';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    earning: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    withdrawal: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    hostRating: {
      create: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
    },
    hostBonus: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    callLog: {
      findUnique: jest.fn(),
    },
  },
}));

describe('HostService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('applyAsHost', () => {
    it('should successfully apply as host', async () => {
      const userId = 'user123';
      const documents = ['https://example.com/doc1.pdf', 'https://example.com/doc2.pdf'];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        isHost: false,
        hostVerificationStatus: null,
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: userId,
        hostVerificationStatus: 'pending',
        hostAppliedAt: new Date(),
      });

      const result = await hostService.applyAsHost(userId, documents);

      expect(result.message).toContain('Application submitted');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          hostVerificationStatus: 'pending',
          hostAppliedAt: expect.any(Date),
          hostDocuments: documents,
        },
      });
    });

    it('should throw error if user already applied', async () => {
      const userId = 'user123';
      const documents = ['https://example.com/doc1.pdf'];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        hostVerificationStatus: 'pending',
      });

      await expect(hostService.applyAsHost(userId, documents)).rejects.toThrow(BadRequestError);
    });

    it('should throw error if user is already a host', async () => {
      const userId = 'user123';
      const documents = ['https://example.com/doc1.pdf'];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        isHost: true,
      });

      await expect(hostService.applyAsHost(userId, documents)).rejects.toThrow(BadRequestError);
    });
  });

  describe('approveHost', () => {
    it('should successfully approve host application', async () => {
      const userId = 'user123';
      const adminId = 'admin123';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        hostVerificationStatus: 'pending',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: userId,
        isHost: true,
        hostVerificationStatus: 'approved',
        hostVerifiedAt: new Date(),
      });

      const result = await hostService.approveHost(userId, adminId);

      expect(result.message).toContain('approved');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          isHost: true,
          hostVerificationStatus: 'approved',
          hostVerifiedAt: expect.any(Date),
        },
      });
    });

    it('should throw error if no pending application', async () => {
      const userId = 'user123';
      const adminId = 'admin123';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        hostVerificationStatus: null,
      });

      await expect(hostService.approveHost(userId, adminId)).rejects.toThrow(BadRequestError);
    });
  });

  describe('recordEarning', () => {
    it('should record earnings for video call', async () => {
      const callId = 'call123';
      const hostId = 'host123';
      const callType = 'video';
      const duration = 600; // 10 minutes
      const coinsCharged = 100;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: hostId,
        isHost: true,
        totalEarnings: 0,
        availableBalance: 0,
      });

      (prisma.earning.create as jest.Mock).mockResolvedValue({
        id: 'earning123',
        hostId,
        callId,
        callType,
        callDuration: duration,
        totalRevenue: 10, // 100 coins * 0.1 = ₹10
        hostShare: 30,
        hostEarning: 3, // 30% of ₹10 = ₹3
        status: 'completed',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: hostId,
        totalEarnings: 3,
        availableBalance: 3,
      });

      const result = await hostService.recordEarning(callId, hostId, callType, duration, coinsCharged);

      expect(result).toBeDefined();
      expect(result?.hostEarning).toBe(3);
      expect(prisma.earning.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should record earnings for audio call', async () => {
      const callId = 'call123';
      const hostId = 'host123';
      const callType = 'audio';
      const duration = 600;
      const coinsCharged = 100;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: hostId,
        isHost: true,
        totalEarnings: 0,
        availableBalance: 0,
      });

      (prisma.earning.create as jest.Mock).mockResolvedValue({
        id: 'earning123',
        hostId,
        callId,
        callType,
        callDuration: duration,
        totalRevenue: 10,
        hostShare: 15,
        hostEarning: 1.5, // 15% of ₹10 = ₹1.5
        status: 'completed',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: hostId,
        totalEarnings: 1.5,
        availableBalance: 1.5,
      });

      const result = await hostService.recordEarning(callId, hostId, callType, duration, coinsCharged);

      expect(result).toBeDefined();
      expect(result?.hostEarning).toBe(1.5);
    });

    it('should return null if user is not a host', async () => {
      const callId = 'call123';
      const hostId = 'user123';
      const callType = 'video';
      const duration = 600;
      const coinsCharged = 100;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: hostId,
        isHost: false,
      });

      const result = await hostService.recordEarning(callId, hostId, callType, duration, coinsCharged);

      expect(result).toBeNull();
      expect(prisma.earning.create).not.toHaveBeenCalled();
    });
  });

  describe('requestWithdrawal', () => {
    it('should successfully request withdrawal', async () => {
      const userId = 'user123';
      const amount = 1000;
      const method = 'upi';
      const paymentDetails = { upiId: 'user@paytm' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        availableBalance: 2000,
      });

      (prisma.withdrawal.create as jest.Mock).mockResolvedValue({
        id: 'withdrawal123',
        userId,
        amount,
        method,
        status: 'pending',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: userId,
        availableBalance: 1000,
      });

      const result = await hostService.requestWithdrawal(userId, amount, method, paymentDetails);

      expect(result).toBeDefined();
      expect(result.amount).toBe(amount);
      expect(prisma.withdrawal.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { availableBalance: { decrement: amount } },
      });
    });

    it('should throw error if amount is below minimum', async () => {
      const userId = 'user123';
      const amount = 400; // Below ₹500 minimum
      const method = 'upi';
      const paymentDetails = { upiId: 'user@paytm' };

      await expect(
        hostService.requestWithdrawal(userId, amount, method, paymentDetails)
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw error if insufficient balance', async () => {
      const userId = 'user123';
      const amount = 1000;
      const method = 'upi';
      const paymentDetails = { upiId: 'user@paytm' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        availableBalance: 500,
      });

      await expect(
        hostService.requestWithdrawal(userId, amount, method, paymentDetails)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('rateHost', () => {
    it('should successfully rate a host', async () => {
      const hostId = 'host123';
      const callId = 'call123';
      const callerId = 'caller123';
      const rating = 5;
      const feedback = 'Great host!';

      (prisma.callLog.findUnique as jest.Mock).mockResolvedValue({
        id: callId,
        callerId,
        receiverId: hostId,
        status: 'completed',
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: hostId,
        isHost: true,
      });

      (prisma.hostRating.findUnique as jest.Mock).mockResolvedValue(null);

      (prisma.hostRating.create as jest.Mock).mockResolvedValue({
        id: 'rating123',
        hostId,
        callerId,
        callId,
        rating,
        feedback,
      });

      (prisma.hostRating.aggregate as jest.Mock).mockResolvedValue({
        _avg: { rating: 4.5 },
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: hostId,
        hostRating: 4.5,
      });

      const result = await hostService.rateHost(hostId, callId, callerId, rating, feedback);

      expect(result.message).toContain('rated successfully');
      expect(prisma.hostRating.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw error if call not found', async () => {
      const hostId = 'host123';
      const callId = 'call123';
      const callerId = 'caller123';
      const rating = 5;

      (prisma.callLog.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        hostService.rateHost(hostId, callId, callerId, rating)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw error if rating already exists', async () => {
      const hostId = 'host123';
      const callId = 'call123';
      const callerId = 'caller123';
      const rating = 5;

      (prisma.callLog.findUnique as jest.Mock).mockResolvedValue({
        id: callId,
        callerId,
        receiverId: hostId,
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: hostId,
        isHost: true,
      });

      (prisma.hostRating.findUnique as jest.Mock).mockResolvedValue({
        id: 'rating123',
        callId,
      });

      await expect(
        hostService.rateHost(hostId, callId, callerId, rating)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('getHostDashboard', () => {
    it('should return host dashboard data', async () => {
      const userId = 'host123';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        isHost: true,
        totalEarnings: 1000,
        availableBalance: 500,
        totalWithdrawn: 500,
        totalCallsAsHost: 50,
        totalMinutesAsHost: 500,
        hostRating: 4.5,
      });

      (prisma.withdrawal.findMany as jest.Mock).mockResolvedValue([
        { id: 'w1', status: 'pending' },
      ]);

      const result = await hostService.getHostDashboard(userId);

      expect(result.totalEarnings).toBe(1000);
      expect(result.availableBalance).toBe(500);
      expect(result.totalCallsAsHost).toBe(50);
      expect(result.hostRating).toBe(4.5);
      expect(result.pendingWithdrawals).toBe(1);
    });

    it('should throw error if user is not a host', async () => {
      const userId = 'user123';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        isHost: false,
      });

      await expect(hostService.getHostDashboard(userId)).rejects.toThrow(ForbiddenError);
    });
  });
});
