// backend/src/types/index.ts

import { Request } from 'express';

// Extend Express Request with user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    phoneNumber: string;
    firebaseUid?: string;
    role?: 'user' | 'admin' | 'moderator';
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Socket events
export interface SocketUser {
  userId: string;
  socketId: string;
}

export interface MessagePayload {
  senderId: string;
  receiverId?: string;
  roomId?: string;
  content: string;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'gif';
  mediaUrl?: string;
}

export interface CallPayload {
  callerId: string;
  receiverId: string;
  callType: 'audio' | 'video';
  livekitRoom: string;
  livekitToken: string;
}

export interface RoomJoinPayload {
  userId: string;
  roomId: string;
  identity: string; // LiveKit uses string identities
}

export interface TypingPayload {
  senderId: string;
  receiverId: string;
  isTyping: boolean;
}

// LiveKit types
export interface LiveKitTokenResponse {
  token: string;
  roomName: string;
  identity: string;
  expiresAt: number;
  serverUrl: string;
  canPublish: boolean;
  canSubscribe: boolean;
}

// Payment types
export interface RazorpayOrderOptions {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, any>;
}

export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: any;
  created_at: number;
}
