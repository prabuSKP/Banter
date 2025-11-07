// mobile/src/stores/authStore.ts

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthTokens } from '../types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setTokens: async (tokens) => {
    if (tokens) {
      await AsyncStorage.setItem('auth_tokens', JSON.stringify(tokens));
    } else {
      await AsyncStorage.removeItem('auth_tokens');
    }
    set({ tokens });
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_tokens');
    await AsyncStorage.removeItem('user');
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
    });
  },

  initialize: async () => {
    try {
      const [tokensStr, userStr] = await Promise.all([
        AsyncStorage.getItem('auth_tokens'),
        AsyncStorage.getItem('user'),
      ]);

      const tokens = tokensStr ? JSON.parse(tokensStr) : null;
      const user = userStr ? JSON.parse(userStr) : null;

      set({
        tokens,
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isLoading: false });
    }
  },
}));
