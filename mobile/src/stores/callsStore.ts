// mobile/src/stores/callsStore.ts

import { create } from 'zustand';
import callsService, { CallLog, CallData } from '../services/calls';
import socketService from '../services/socket';
import { SOCKET_EVENTS } from '../constants';

export interface IncomingCall {
  callId: string;
  caller: {
    id: string;
    fullName: string;
    username: string;
    avatar: string | null;
  };
  callType: 'audio' | 'video';
  roomName: string;
  token: string;
  identity: string;
  serverUrl: string;
}

interface CallsState {
  callLogs: CallLog[];
  activeCall: CallData | null;
  incomingCall: IncomingCall | null;
  isInCall: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isVideoEnabled: boolean;
  callDuration: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCallLogs: (page?: number) => Promise<void>;
  initiateCall: (receiverId: string, callType: 'audio' | 'video') => Promise<CallData>;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  toggleVideo: () => void;
  setCallDuration: (duration: number) => void;
  setIncomingCall: (call: IncomingCall | null) => void;
  clearError: () => void;
  initializeSocketListeners: () => void;
  cleanupSocketListeners: () => void;
}

export const useCallsStore = create<CallsState>((set, get) => ({
  callLogs: [],
  activeCall: null,
  incomingCall: null,
  isInCall: false,
  isMuted: false,
  isSpeakerOn: false,
  isVideoEnabled: true,
  callDuration: 0,
  isLoading: false,
  error: null,

  fetchCallLogs: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const { calls } = await callsService.getCallLogs(page);
      set({ callLogs: calls, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch call logs',
        isLoading: false,
      });
    }
  },

  initiateCall: async (receiverId: string, callType: 'audio' | 'video') => {
    try {
      set({ isLoading: true, error: null });

      // Check balance first
      const balanceCheck = await callsService.checkCallBalance(callType);
      if (!balanceCheck.hasBalance) {
        throw new Error('Insufficient coin balance for this call');
      }

      // Initiate call
      const callData = await callsService.initiateCall({
        receiverId,
        callType,
      });

      set({
        activeCall: callData,
        isInCall: true,
        isVideoEnabled: callType === 'video',
        isSpeakerOn: callType === 'video',
        isLoading: false,
      });

      // Emit socket event
      if (socketService.connected) {
        socketService.emitCallInitiate({
          receiverId,
          callType,
          livekitRoom: callData.roomName,
          livekitToken: callData.token,
          callId: callData.callId,
        });
      }

      return callData;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to initiate call',
        isLoading: false,
      });
      throw error;
    }
  },

  acceptCall: () => {
    const { incomingCall } = get();
    if (!incomingCall) return;

    set({
      activeCall: {
        callId: incomingCall.callId,
        roomName: incomingCall.roomName,
        token: incomingCall.token,
        identity: incomingCall.identity,
        serverUrl: incomingCall.serverUrl,
      },
      isInCall: true,
      incomingCall: null,
      isVideoEnabled: incomingCall.callType === 'video',
      isSpeakerOn: incomingCall.callType === 'video',
    });

    // Emit socket event
    if (socketService.connected) {
      socketService.emitCallAccept(incomingCall.caller.id);
    }
  },

  rejectCall: () => {
    const { incomingCall } = get();
    if (!incomingCall) return;

    // Emit socket event
    if (socketService.connected) {
      socketService.emitCallReject(incomingCall.caller.id, 'User rejected');
    }

    set({ incomingCall: null });
  },

  endCall: async () => {
    const { activeCall, callDuration } = get();
    if (!activeCall) return;

    try {
      // Update call status on backend
      await callsService.updateCallStatus(
        activeCall.callId,
        'completed',
        callDuration
      );

      // Emit socket event
      if (socketService.connected) {
        socketService.emitCallEnd('peer-id'); // TODO: Get actual peer ID
      }

      set({
        activeCall: null,
        isInCall: false,
        callDuration: 0,
        isMuted: false,
        isSpeakerOn: false,
        isVideoEnabled: true,
      });

      // Refresh call logs
      get().fetchCallLogs(1);
    } catch (error: any) {
      console.error('Failed to end call:', error);
      set({ error: 'Failed to end call properly' });
    }
  },

  toggleMute: () => {
    set({ isMuted: !get().isMuted });
  },

  toggleSpeaker: () => {
    set({ isSpeakerOn: !get().isSpeakerOn });
  },

  toggleVideo: () => {
    set({ isVideoEnabled: !get().isVideoEnabled });
  },

  setCallDuration: (duration: number) => {
    set({ callDuration: duration });
  },

  setIncomingCall: (call: IncomingCall | null) => {
    set({ incomingCall: call });
  },

  clearError: () => set({ error: null }),

  initializeSocketListeners: () => {
    // Listen for incoming calls
    socketService.on(SOCKET_EVENTS.CALL_INCOMING, (data: IncomingCall) => {
      get().setIncomingCall(data);
    });

    // Listen for call accepted
    socketService.on(SOCKET_EVENTS.CALL_ACCEPTED, (data: any) => {
      console.log('Call accepted:', data);
      // Call is already in progress, just log
    });

    // Listen for call rejected
    socketService.on(SOCKET_EVENTS.CALL_REJECTED, (data: { reason?: string }) => {
      console.log('Call rejected:', data.reason);
      set({
        activeCall: null,
        isInCall: false,
        error: data.reason || 'Call was rejected',
      });
    });

    // Listen for call ended
    socketService.on(SOCKET_EVENTS.CALL_ENDED, () => {
      console.log('Call ended by peer');
      set({
        activeCall: null,
        isInCall: false,
        callDuration: 0,
        isMuted: false,
        isSpeakerOn: false,
        isVideoEnabled: true,
      });
    });
  },

  cleanupSocketListeners: () => {
    socketService.off(SOCKET_EVENTS.CALL_INCOMING);
    socketService.off(SOCKET_EVENTS.CALL_ACCEPTED);
    socketService.off(SOCKET_EVENTS.CALL_REJECTED);
    socketService.off(SOCKET_EVENTS.CALL_ENDED);
  },
}));
