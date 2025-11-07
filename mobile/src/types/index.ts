// mobile/src/types/index.ts

export interface User {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  interests: string[];
  coins: number;
  isPremium: boolean;
  isOnline: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  roomId?: string;
  content: string;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'gif';
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  maxMembers: number;
  agoraChannelName: string | null;
  createdById: string;
  createdAt: string;
  members?: ChatRoomMember[];
}

export interface ChatRoomMember {
  id: string;
  userId: string;
  roomId: string;
  joinedAt: string;
  user?: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface CallLog {
  id: string;
  callerId: string;
  receiverId: string;
  callType: 'audio' | 'video';
  status: 'missed' | 'completed' | 'rejected';
  duration: number | null;
  agoraChannelName: string;
  createdAt: string;
  caller?: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  receiver?: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface AgoraToken {
  token: string;
  channel: string;
  uid: number;
  expiresAt: number;
}

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
