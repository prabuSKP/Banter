// mobile/src/services/auth.ts

import api from './api';
import { API_ENDPOINTS } from '../constants';
import { User, AuthTokens, ApiResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';
import firebaseAuthService from './firebase';

export class AuthService {
  // Login with Firebase ID token
  async login(firebaseIdToken: string): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
        API_ENDPOINTS.LOGIN,
        { firebaseIdToken }
      );

      const { user, tokens } = response.data.data!;

      // Save to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('auth_tokens', JSON.stringify(tokens));

      // Update store
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setTokens(tokens);

      return { user, tokens };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await api.post<ApiResponse<AuthTokens>>(
        API_ENDPOINTS.REFRESH_TOKEN,
        { refreshToken }
      );

      const tokens = response.data.data!;

      // Save to AsyncStorage
      await AsyncStorage.setItem('auth_tokens', JSON.stringify(tokens));

      // Update store
      useAuthStore.getState().setTokens(tokens);

      return tokens;
    } catch (error: any) {
      console.error('Refresh token error:', error);
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  // Logout
  async logout() {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Sign out from Firebase
      await firebaseAuthService.signOut();

      // Clear local storage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('auth_tokens');

      // Update store
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setTokens(null);
    }
  }

  // Delete account
  async deleteAccount() {
    try {
      await api.delete(API_ENDPOINTS.DELETE_ACCOUNT);

      // Sign out from Firebase
      await firebaseAuthService.signOut();

      // Clear local storage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('auth_tokens');

      // Update store
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setTokens(null);
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  }
}

export default new AuthService();
