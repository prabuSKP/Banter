// mobile/src/services/socket.ts

import { io, Socket } from 'socket.io-client';
import { ENV, SOCKET_EVENTS } from '../constants';
import { useAuthStore } from '../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  // Initialize socket connection
  async connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      // Get auth token
      const tokensStr = await AsyncStorage.getItem('auth_tokens');
      if (!tokensStr) {
        console.error('No auth tokens found');
        return;
      }

      const { accessToken } = JSON.parse(tokensStr);

      // Create socket connection
      this.socket = io(ENV.WS_URL, {
        auth: {
          token: accessToken,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  // Setup socket event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('Socket error:', error);
    });

    // User presence events
    this.socket.on(SOCKET_EVENTS.USER_ONLINE, (data) => {
      console.log('User online:', data.userId);
      // Handle user online status
    });

    this.socket.on(SOCKET_EVENTS.USER_OFFLINE, (data) => {
      console.log('User offline:', data.userId);
      // Handle user offline status
    });

    // Message events
    this.socket.on(SOCKET_EVENTS.MESSAGE_NEW, (data) => {
      console.log('New message:', data);
      // Handle new message
    });

    this.socket.on(SOCKET_EVENTS.MESSAGE_READ_RECEIPT, (data) => {
      console.log('Message read:', data);
      // Handle message read receipt
    });

    // Typing events
    this.socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
      console.log('User typing:', data.senderId);
      // Handle typing start
    });

    this.socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
      console.log('User stopped typing:', data.senderId);
      // Handle typing stop
    });

    // Call events
    this.socket.on(SOCKET_EVENTS.CALL_INCOMING, (data) => {
      console.log('Incoming call:', data);
      // Handle incoming call
    });

    this.socket.on(SOCKET_EVENTS.CALL_ACCEPTED, (data) => {
      console.log('Call accepted:', data);
      // Handle call accepted
    });

    this.socket.on(SOCKET_EVENTS.CALL_REJECTED, (data) => {
      console.log('Call rejected:', data);
      // Handle call rejected
    });

    this.socket.on(SOCKET_EVENTS.CALL_ENDED, (data) => {
      console.log('Call ended:', data);
      // Handle call ended
    });

    this.socket.on(SOCKET_EVENTS.CALL_ERROR, (data) => {
      console.log('Call error:', data);
      // Handle call error
    });

    // Room events
    this.socket.on(SOCKET_EVENTS.ROOM_USER_JOINED, (data) => {
      console.log('User joined room:', data);
      // Handle room user joined
    });

    this.socket.on(SOCKET_EVENTS.ROOM_USER_LEFT, (data) => {
      console.log('User left room:', data);
      // Handle room user left
    });

    this.socket.on(SOCKET_EVENTS.ROOM_USER_SPEAKING, (data) => {
      console.log('User speaking in room:', data);
      // Handle room user speaking
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Emit typing start
  emitTypingStart(receiverId: string) {
    this.socket?.emit(SOCKET_EVENTS.TYPING_START, { receiverId });
  }

  // Emit typing stop
  emitTypingStop(receiverId: string) {
    this.socket?.emit(SOCKET_EVENTS.TYPING_STOP, { receiverId });
  }

  // Emit message sent
  emitMessageSent(data: {
    receiverId?: string;
    roomId?: string;
    messageId: string;
  }) {
    this.socket?.emit(SOCKET_EVENTS.MESSAGE_SENT, data);
  }

  // Emit message read
  emitMessageRead(messageIds: string[]) {
    this.socket?.emit(SOCKET_EVENTS.MESSAGE_READ, { messageIds });
  }

  // Emit call initiate
  emitCallInitiate(data: {
    receiverId: string;
    callType: 'audio' | 'video';
    agoraChannel: string;
    agoraToken: string;
  }) {
    this.socket?.emit(SOCKET_EVENTS.CALL_INITIATE, data);
  }

  // Emit call accept
  emitCallAccept(callerId: string) {
    this.socket?.emit(SOCKET_EVENTS.CALL_ACCEPT, { callerId });
  }

  // Emit call reject
  emitCallReject(callerId: string, reason?: string) {
    this.socket?.emit(SOCKET_EVENTS.CALL_REJECT, { callerId, reason });
  }

  // Emit call end
  emitCallEnd(peerId: string) {
    this.socket?.emit(SOCKET_EVENTS.CALL_END, { peerId });
  }

  // Emit room join
  emitRoomJoin(roomId: string) {
    this.socket?.emit(SOCKET_EVENTS.ROOM_JOIN, { roomId });
  }

  // Emit room leave
  emitRoomLeave(roomId: string) {
    this.socket?.emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId });
  }

  // Emit room speaking
  emitRoomSpeaking(roomId: string, isSpeaking: boolean) {
    this.socket?.emit(SOCKET_EVENTS.ROOM_SPEAKING, { roomId, isSpeaking });
  }

  // Add custom event listener
  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  // Remove custom event listener
  off(event: string, callback?: (data: any) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  // Check if connected
  get connected() {
    return this.isConnected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
