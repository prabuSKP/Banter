// backend/tests/integration/call.test.ts

import request from 'supertest';
import app from '../../src/app';
import { generateTestToken } from '../utils/testHelpers';
import prisma from '../../src/config/database';
import livekitService from '../../src/services/livekit.service';
import friendService from '../../src/services/friend.service';

describe('Call API Integration Tests', () => {
  const testToken = generateTestToken('test-user-id');
  const receiverId = 'receiver-user-id';
  const callId = 'test-call-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/calls/initiate', () => {
    it('should initiate a call successfully', async () => {
      // Mock friends check
      jest.spyOn(friendService, 'areFriends').mockResolvedValue(true);

      // Mock user lookup
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: receiverId,
        phoneNumber: '+919876543210',
        displayName: 'Test Receiver',
        avatarUrl: null,
        isActive: true,
      } as any);

      // Mock blocked user check
      jest.spyOn(prisma.blockedUser, 'findFirst').mockResolvedValue(null);

      // Mock call log creation
      jest.spyOn(prisma.callLog, 'create').mockResolvedValue({
        id: callId,
        callerId: 'test-user-id',
        receiverId,
        callType: 'video',
        status: 'initiated',
        livekitRoom: 'call_test-call-id',
        createdAt: new Date(),
      } as any);

      // Mock LiveKit token generation
      jest.spyOn(livekitService, 'generateCallToken').mockResolvedValue({
        token: 'test-livekit-token',
        roomName: 'call_test-call-id',
        identity: 'test-user-id',
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
        serverUrl: 'wss://test.livekit.cloud',
        canPublish: true,
        canSubscribe: true,
      });

      const response = await request(app)
        .post('/api/v1/calls/initiate')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverId,
          callType: 'video',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('callId');
      expect(response.body.data).toHaveProperty('roomName');
      expect(response.body.data).toHaveProperty('callerToken');
      expect(response.body.data).toHaveProperty('receiverToken');
      expect(response.body.data).toHaveProperty('serverUrl');
    });

    it('should fail if users are not friends', async () => {
      jest.spyOn(friendService, 'areFriends').mockResolvedValue(false);

      const response = await request(app)
        .post('/api/v1/calls/initiate')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverId,
          callType: 'video',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('friends');
    });

    it('should fail if receiver not found', async () => {
      jest.spyOn(friendService, 'areFriends').mockResolvedValue(true);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/calls/initiate')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverId,
          callType: 'video',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/calls/initiate')
        .send({
          receiverId,
          callType: 'video',
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/calls/initiate')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          callType: 'video',
          // Missing receiverId
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/calls/:id/status', () => {
    it('should update call status successfully', async () => {
      jest.spyOn(prisma.callLog, 'findUnique').mockResolvedValue({
        id: callId,
        callerId: 'test-user-id',
        receiverId,
        callType: 'video',
        status: 'answered',
        receiver: { isHost: false },
      } as any);

      jest.spyOn(prisma.callLog, 'update').mockResolvedValue({
        id: callId,
        status: 'completed',
        duration: 120,
      } as any);

      jest.spyOn(prisma.user, 'update').mockResolvedValue({} as any);

      const response = await request(app)
        .post(`/api/v1/calls/${callId}/status`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          status: 'completed',
          duration: 120,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail if call not found', async () => {
      jest.spyOn(prisma.callLog, 'findUnique').mockResolvedValue(null);

      const response = await request(app)
        .post(`/api/v1/calls/${callId}/status`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          status: 'completed',
          duration: 120,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/calls/logs', () => {
    it('should get call logs successfully', async () => {
      const mockCalls = [
        {
          id: 'call-1',
          callerId: 'test-user-id',
          receiverId: 'receiver-1',
          callType: 'video',
          status: 'completed',
          duration: 120,
          createdAt: new Date(),
          caller: {
            id: 'test-user-id',
            displayName: 'Test User',
            avatarUrl: null,
          },
          receiver: {
            id: 'receiver-1',
            displayName: 'Receiver 1',
            avatarUrl: null,
          },
        },
      ];

      jest.spyOn(prisma.callLog, 'findMany').mockResolvedValue(mockCalls as any);
      jest.spyOn(prisma.callLog, 'count').mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/calls/logs')
        .set('Authorization', `Bearer ${testToken}`)
        .query({ page: 1, limit: 50 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should support pagination', async () => {
      jest.spyOn(prisma.callLog, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.callLog, 'count').mockResolvedValue(0);

      const response = await request(app)
        .get('/api/v1/calls/logs')
        .set('Authorization', `Bearer ${testToken}`)
        .query({ page: 2, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(20);
    });
  });

  describe('GET /api/v1/calls/stats', () => {
    it('should get call statistics successfully', async () => {
      jest.spyOn(prisma.callLog, 'groupBy').mockResolvedValue([
        {
          callType: 'video',
          status: 'completed',
          _count: 10,
          _sum: { duration: 1200 },
        },
      ] as any);

      jest.spyOn(prisma.callLog, 'count').mockResolvedValue(15);

      jest.spyOn(prisma.callLog, 'aggregate').mockResolvedValue({
        _sum: { duration: 1800 },
      } as any);

      const response = await request(app)
        .get('/api/v1/calls/stats')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCalls');
      expect(response.body.data).toHaveProperty('completedCalls');
      expect(response.body.data).toHaveProperty('totalMinutes');
    });
  });

  describe('GET /api/v1/calls/agora-token', () => {
    it('should get Agora token for room', async () => {
      const roomId = 'test-room-id';

      jest.spyOn(prisma.chatRoomMember, 'findFirst').mockResolvedValue({
        id: 'member-id',
        roomId,
        userId: 'test-user-id',
        leftAt: null,
      } as any);

      jest.spyOn(prisma.chatRoom, 'findUnique').mockResolvedValue({
        id: roomId,
        name: 'Test Room',
        livekitRoomName: 'room_test-room-id',
      } as any);

      jest.spyOn(livekitService, 'generateRoomToken').mockResolvedValue({
        token: 'test-livekit-token',
        roomName: 'room_test-room-id',
        identity: 'test-user-id',
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
        serverUrl: 'wss://test.livekit.cloud',
        canPublish: true,
        canSubscribe: true,
      });

      const response = await request(app)
        .get('/api/v1/calls/agora-token')
        .set('Authorization', `Bearer ${testToken}`)
        .query({ roomId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should fail without roomId', async () => {
      const response = await request(app)
        .get('/api/v1/calls/agora-token')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('roomId');
    });
  });
});
