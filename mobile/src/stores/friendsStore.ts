// mobile/src/stores/friendsStore.ts

import { create } from 'zustand';
import friendsService, { Friend, FriendRequest } from '../services/friends';

interface FriendsState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  suggestions: any[];
  searchResults: any[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFriends: (page?: number) => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  fetchSuggestions: (page?: number) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  clearSearchResults: () => void;
  clearError: () => void;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  friendRequests: [],
  suggestions: [],
  searchResults: [],
  isLoading: false,
  error: null,

  fetchFriends: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const { friends } = await friendsService.getFriends(page);

      set(state => ({
        friends: page === 1 ? friends : [...state.friends, ...friends],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch friends',
        isLoading: false,
      });
    }
  },

  fetchFriendRequests: async () => {
    try {
      set({ isLoading: true, error: null });
      const requests = await friendsService.getFriendRequests();
      set({ friendRequests: requests, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch requests',
        isLoading: false,
      });
    }
  },

  fetchSuggestions: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const { suggestions } = await friendsService.getFriendSuggestions(page);

      set(state => ({
        suggestions: page === 1 ? suggestions : [...state.suggestions, ...suggestions],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch suggestions',
        isLoading: false,
      });
    }
  },

  searchUsers: async (query: string) => {
    try {
      set({ isLoading: true, error: null });
      const results = await friendsService.searchUsers(query);
      set({ searchResults: results, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Search failed',
        isLoading: false,
      });
    }
  },

  sendFriendRequest: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      await friendsService.sendFriendRequest(userId);

      // Refresh suggestions
      await get().fetchSuggestions(1);

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to send request',
        isLoading: false,
      });
      throw error;
    }
  },

  acceptRequest: async (requestId: string) => {
    try {
      set({ isLoading: true, error: null });
      await friendsService.acceptFriendRequest(requestId);

      // Remove from requests and refresh friends
      set(state => ({
        friendRequests: state.friendRequests.filter(req => req.id !== requestId),
      }));

      await get().fetchFriends(1);

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to accept request',
        isLoading: false,
      });
      throw error;
    }
  },

  rejectRequest: async (requestId: string) => {
    try {
      set({ isLoading: true, error: null });
      await friendsService.rejectFriendRequest(requestId);

      // Remove from requests
      set(state => ({
        friendRequests: state.friendRequests.filter(req => req.id !== requestId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to reject request',
        isLoading: false,
      });
      throw error;
    }
  },

  removeFriend: async (friendId: string) => {
    try {
      set({ isLoading: true, error: null });
      await friendsService.removeFriend(friendId);

      // Remove from friends list
      set(state => ({
        friends: state.friends.filter(friend => friend.id !== friendId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to remove friend',
        isLoading: false,
      });
      throw error;
    }
  },

  clearSearchResults: () => set({ searchResults: [] }),
  clearError: () => set({ error: null }),
}));
