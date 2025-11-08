// mobile/src/services/rooms.ts

import api from './api';

export interface Room {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  maxMembers: number;
  memberCount?: number;
  creatorId: string;
  creator?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  livekitRoomName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoomMember {
  id: string;
  userId: string;
  roomId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
  leftAt: string | null;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    isOnline: boolean;
  };
}

export interface CreateRoomData {
  name: string;
  description?: string;
  imageUrl?: string;
  isPublic: boolean;
  maxMembers?: number;
}

export interface UpdateRoomData {
  name?: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
  maxMembers?: number;
}

class RoomsService {
  // Create a new room
  async createRoom(data: CreateRoomData) {
    const response = await api.post('/rooms', data);
    return response.data.data as Room;
  }

  // Get public rooms (with pagination)
  async getPublicRooms(page: number = 1, limit: number = 20) {
    const response = await api.get('/rooms', {
      params: { page, limit },
    });
    return {
      rooms: response.data.data as Room[],
      pagination: response.data.pagination,
    };
  }

  // Get user's rooms
  async getMyRooms() {
    const response = await api.get('/rooms/my');
    return response.data.data as Room[];
  }

  // Search rooms
  async searchRooms(query: string, page: number = 1, limit: number = 20) {
    const response = await api.get('/rooms/search', {
      params: { q: query, page, limit },
    });
    return {
      rooms: response.data.data as Room[],
      pagination: response.data.pagination,
    };
  }

  // Get room by ID
  async getRoomById(roomId: string) {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data.data as Room;
  }

  // Join a room
  async joinRoom(roomId: string) {
    const response = await api.post(`/rooms/${roomId}/join`);
    return response.data.data as RoomMember;
  }

  // Leave a room
  async leaveRoom(roomId: string) {
    const response = await api.post(`/rooms/${roomId}/leave`);
    return response.data;
  }

  // Update room (creator/admin only)
  async updateRoom(roomId: string, data: UpdateRoomData) {
    const response = await api.put(`/rooms/${roomId}`, data);
    return response.data.data as Room;
  }

  // Delete room (creator only)
  async deleteRoom(roomId: string) {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  }

  // Get room members
  async getRoomMembers(roomId: string) {
    const response = await api.get(`/rooms/${roomId}/members`);
    return response.data.data as RoomMember[];
  }

  // Get LiveKit token for room
  async getLivekitToken(roomId: string) {
    const response = await api.get('/calls/livekit-token', {
      params: { roomId },
    });
    return response.data.data;
  }
}

export default new RoomsService();
