// mobile/src/services/user.ts

import api from './api';
import { API_ENDPOINTS } from '../constants';
import { User, ApiResponse, PaginatedResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';

export class UserService {
  // Get current user profile
  async getMe(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(API_ENDPOINTS.GET_ME);
      const user = response.data.data!;

      // Update local storage and store
      await AsyncStorage.setItem('user', JSON.stringify(user));
      useAuthStore.getState().setUser(user);

      return user;
    } catch (error: any) {
      console.error('Get me error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(API_ENDPOINTS.GET_USER(userId));
      return response.data.data!;
    } catch (error: any) {
      console.error('Get user error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get user');
    }
  }

  // Update profile
  async updateProfile(data: {
    displayName?: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    interests?: string[];
  }): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>(
        API_ENDPOINTS.UPDATE_PROFILE,
        data
      );
      const user = response.data.data!;

      // Update local storage and store
      await AsyncStorage.setItem('user', JSON.stringify(user));
      useAuthStore.getState().setUser(user);

      return user;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  // Update avatar
  async updateAvatar(avatarUrl: string): Promise<User> {
    try {
      const response = await api.post<ApiResponse<{ id: string; avatarUrl: string }>>(
        API_ENDPOINTS.UPDATE_AVATAR,
        { avatarUrl }
      );

      // Get updated user
      const user = await this.getMe();
      return user;
    } catch (error: any) {
      console.error('Update avatar error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update avatar');
    }
  }

  // Search users
  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    try {
      const response = await api.get<PaginatedResponse<User[]>>(
        API_ENDPOINTS.SEARCH_USERS,
        { params: { q: query, page, limit } }
      );

      return {
        users: response.data.data!,
        pagination: response.data.pagination!,
      };
    } catch (error: any) {
      console.error('Search users error:', error);
      throw new Error(error.response?.data?.message || 'Failed to search users');
    }
  }

  // Block user
  async blockUser(userId: string): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.BLOCK_USER(userId));
    } catch (error: any) {
      console.error('Block user error:', error);
      throw new Error(error.response?.data?.message || 'Failed to block user');
    }
  }

  // Unblock user
  async unblockUser(userId: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.UNBLOCK_USER(userId));
    } catch (error: any) {
      console.error('Unblock user error:', error);
      throw new Error(error.response?.data?.message || 'Failed to unblock user');
    }
  }

  // Get blocked users
  async getBlockedUsers() {
    try {
      const response = await api.get<ApiResponse<User[]>>(
        API_ENDPOINTS.GET_BLOCKED_USERS
      );
      return response.data.data!;
    } catch (error: any) {
      console.error('Get blocked users error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get blocked users');
    }
  }
}

export default new UserService();
