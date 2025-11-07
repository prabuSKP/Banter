// mobile/tests/services/calls.test.ts

import callsService from '../../src/services/calls';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

describe('CallsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateCall', () => {
    it('should initiate an audio call successfully', async () => {
      const mockCallData = {
        callId: 'call123',
        channel: 'channel123',
        token: 'token123',
        uid: 12345,
        appId: 'app123',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: { data: mockCallData },
      });

      const result = await callsService.initiateCall({
        receiverId: 'user123',
        callType: 'audio',
      });

      expect(api.post).toHaveBeenCalledWith('/calls/initiate', {
        receiverId: 'user123',
        callType: 'audio',
      });
      expect(result).toEqual(mockCallData);
    });

    it('should initiate a video call successfully', async () => {
      const mockCallData = {
        callId: 'call456',
        channel: 'channel456',
        token: 'token456',
        uid: 67890,
        appId: 'app456',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: { data: mockCallData },
      });

      const result = await callsService.initiateCall({
        receiverId: 'user456',
        callType: 'video',
      });

      expect(api.post).toHaveBeenCalledWith('/calls/initiate', {
        receiverId: 'user456',
        callType: 'video',
      });
      expect(result.callId).toBe('call456');
    });

    it('should handle errors when initiating call', async () => {
      (api.post as jest.Mock).mockRejectedValue(
        new Error('Failed to initiate call')
      );

      await expect(
        callsService.initiateCall({
          receiverId: 'user123',
          callType: 'audio',
        })
      ).rejects.toThrow('Failed to initiate call');
    });
  });

  describe('updateCallStatus', () => {
    it('should update call status to completed', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      const result = await callsService.updateCallStatus(
        'call123',
        'completed',
        120
      );

      expect(api.post).toHaveBeenCalledWith('/calls/call123/status', {
        status: 'completed',
        duration: 120,
      });
      expect(result).toEqual({ success: true });
    });

    it('should update call status to rejected', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      const result = await callsService.updateCallStatus('call123', 'rejected');

      expect(api.post).toHaveBeenCalledWith('/calls/call123/status', {
        status: 'rejected',
        duration: undefined,
      });
    });

    it('should update call status to missed', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      await callsService.updateCallStatus('call123', 'missed');

      expect(api.post).toHaveBeenCalledWith('/calls/call123/status', {
        status: 'missed',
        duration: undefined,
      });
    });

    it('should handle errors when updating status', async () => {
      (api.post as jest.Mock).mockRejectedValue(
        new Error('Failed to update status')
      );

      await expect(
        callsService.updateCallStatus('call123', 'completed', 60)
      ).rejects.toThrow('Failed to update status');
    });
  });

  describe('getCallLogs', () => {
    it('should fetch call logs successfully', async () => {
      const mockCallLogs = [
        {
          id: 'call1',
          callerId: 'user1',
          receiverId: 'user2',
          callType: 'audio',
          status: 'completed',
          duration: 120,
          coinsCharged: 20,
          createdAt: '2025-10-07T00:00:00Z',
        },
        {
          id: 'call2',
          callerId: 'user2',
          receiverId: 'user1',
          callType: 'video',
          status: 'missed',
          duration: null,
          coinsCharged: null,
          createdAt: '2025-10-06T00:00:00Z',
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: {
          data: mockCallLogs,
          pagination: { page: 1, limit: 50, total: 2 },
        },
      });

      const result = await callsService.getCallLogs(1, 50);

      expect(api.get).toHaveBeenCalledWith('/calls/logs', {
        params: { page: 1, limit: 50 },
      });
      expect(result.calls).toEqual(mockCallLogs);
      expect(result.pagination).toBeDefined();
    });

    it('should fetch call logs with default parameters', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: {
          data: [],
          pagination: { page: 1, limit: 50, total: 0 },
        },
      });

      await callsService.getCallLogs();

      expect(api.get).toHaveBeenCalledWith('/calls/logs', {
        params: { page: 1, limit: 50 },
      });
    });

    it('should handle errors when fetching call logs', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(callsService.getCallLogs()).rejects.toThrow('Network error');
    });
  });

  describe('getAgoraToken', () => {
    it('should get Agora token for a room', async () => {
      const mockTokenData = {
        token: 'agora_token_123',
        uid: 12345,
        channel: 'room123',
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: { data: mockTokenData },
      });

      const result = await callsService.getAgoraToken('room123');

      expect(api.get).toHaveBeenCalledWith('/calls/agora-token', {
        params: { roomId: 'room123' },
      });
      expect(result).toEqual(mockTokenData);
    });

    it('should handle errors when getting token', async () => {
      (api.get as jest.Mock).mockRejectedValue(
        new Error('Failed to get token')
      );

      await expect(callsService.getAgoraToken('room123')).rejects.toThrow(
        'Failed to get token'
      );
    });
  });

  describe('checkCallBalance', () => {
    it('should check balance for audio call', async () => {
      const mockBalanceCheck = {
        hasBalance: true,
        currentBalance: 500,
        callRate: 10,
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: { data: mockBalanceCheck },
      });

      const result = await callsService.checkCallBalance('audio');

      expect(api.get).toHaveBeenCalledWith('/calls/check-balance', {
        params: { callType: 'audio' },
      });
      expect(result).toEqual(mockBalanceCheck);
      expect(result.hasBalance).toBe(true);
    });

    it('should check balance for video call', async () => {
      const mockBalanceCheck = {
        hasBalance: false,
        currentBalance: 50,
        callRate: 60,
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: { data: mockBalanceCheck },
      });

      const result = await callsService.checkCallBalance('video');

      expect(api.get).toHaveBeenCalledWith('/calls/check-balance', {
        params: { callType: 'video' },
      });
      expect(result.hasBalance).toBe(false);
    });

    it('should handle errors when checking balance', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(callsService.checkCallBalance('audio')).rejects.toThrow(
        'Network error'
      );
    });
  });
});
