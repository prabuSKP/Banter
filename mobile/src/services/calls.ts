// mobile/src/services/calls.ts

import api from './api';
import { API_ENDPOINTS } from '../constants';

export interface CallLog {
  id: string;
  callerId: string;
  receiverId: string;
  callType: 'audio' | 'video';
  status: 'completed' | 'missed' | 'rejected';
  duration: number | null;
  coinsCharged: number | null;
  createdAt: string;
  caller?: {
    id: string;
    fullName: string;
    username: string;
    avatar: string | null;
  };
  receiver?: {
    id: string;
    fullName: string;
    username: string;
    avatar: string | null;
  };
}

export interface CallInitiateData {
  receiverId: string;
  callType: 'audio' | 'video';
}

export interface CallData {
  callId: string;
  channel: string;
  token: string;
  uid: number;
  appId: string;
}

export interface AgoraTokenData {
  token: string;
  uid: number;
  channel: string;
}

class CallsService {
  // Initiate a call
  async initiateCall(data: CallInitiateData): Promise<CallData> {
    const response = await api.post(API_ENDPOINTS.INITIATE_CALL, data);
    return response.data.data;
  }

  // Update call status
  async updateCallStatus(
    callId: string,
    status: 'completed' | 'rejected' | 'missed',
    duration?: number
  ) {
    const response = await api.post(`/calls/${callId}/status`, {
      status,
      duration,
    });
    return response.data;
  }

  // Get call logs
  async getCallLogs(page: number = 1, limit: number = 50) {
    const response = await api.get(API_ENDPOINTS.GET_CALL_LOGS, {
      params: { page, limit },
    });
    return {
      calls: response.data.data as CallLog[],
      pagination: response.data.pagination,
    };
  }

  // Get Agora token for a room/channel
  async getAgoraToken(roomId: string): Promise<AgoraTokenData> {
    const response = await api.get(API_ENDPOINTS.GET_AGORA_TOKEN, {
      params: { roomId },
    });
    return response.data.data;
  }

  // Check user's coin balance before call
  async checkCallBalance(callType: 'audio' | 'video'): Promise<{
    hasBalance: boolean;
    currentBalance: number;
    callRate: number;
  }> {
    const response = await api.get('/calls/check-balance', {
      params: { callType },
    });
    return response.data.data;
  }
}

export default new CallsService();
