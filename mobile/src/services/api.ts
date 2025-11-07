// mobile/src/services/api.ts

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV, API_ENDPOINTS } from '../constants';
import { useAuthStore } from '../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${ENV.API_URL}/api/${ENV.API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const tokens = await AsyncStorage.getItem('auth_tokens');

    if (tokens) {
      const { accessToken } = JSON.parse(tokens);
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = await AsyncStorage.getItem('auth_tokens');

        if (tokens) {
          const { refreshToken } = JSON.parse(tokens);

          // Refresh token
          const response = await axios.post(
            `${ENV.API_URL}/api/${ENV.API_VERSION}${API_ENDPOINTS.REFRESH_TOKEN}`,
            { refreshToken }
          );

          const newTokens = response.data.data;

          // Save new tokens
          await AsyncStorage.setItem('auth_tokens', JSON.stringify(newTokens));

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        const { logout } = useAuthStore.getState();
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
