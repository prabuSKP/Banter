// mobile/src/services/friends.ts

import api from './api';

export interface Friend {
  id: string;
  fullName: string;
  username: string | null;
  avatar: string | null;
  bio: string | null;
  isPremium: boolean;
  isOnline: boolean;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    username: string | null;
    avatar: string | null;
    bio: string | null;
    isPremium: boolean;
  };
}

class FriendsService {
  // Send friend request
  async sendFriendRequest(receiverId: string) {
    const response = await api.post('/friends/request', { receiverId });
    return response.data;
  }

  // Get received friend requests
  async getFriendRequests() {
    const response = await api.get('/friends/requests');
    return response.data.data as FriendRequest[];
  }

  // Accept friend request
  async acceptFriendRequest(requestId: string) {
    const response = await api.post(`/friends/accept/${requestId}`);
    return response.data;
  }

  // Reject friend request
  async rejectFriendRequest(requestId: string) {
    const response = await api.post(`/friends/reject/${requestId}`);
    return response.data;
  }

  // Get friends list
  async getFriends(page: number = 1, limit: number = 50) {
    const response = await api.get('/friends', {
      params: { page, limit },
    });
    return {
      friends: response.data.data as Friend[],
      pagination: response.data.pagination,
    };
  }

  // Remove friend
  async removeFriend(friendId: string) {
    const response = await api.delete(`/friends/${friendId}`);
    return response.data;
  }

  // Get friend suggestions
  async getFriendSuggestions(page: number = 1, limit: number = 20) {
    const response = await api.get('/friends/suggestions', {
      params: { page, limit },
    });
    return {
      suggestions: response.data.data,
      pagination: response.data.pagination,
    };
  }

  // Search users
  async searchUsers(query: string) {
    const response = await api.get('/users/search', {
      params: { query },
    });
    return response.data.data;
  }
}

export default new FriendsService();
