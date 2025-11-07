// mobile/src/hooks/useSocket.ts

import { useEffect } from 'react';
import socketService from '../services/socket';
import { useAuthStore } from '../stores/authStore';

export const useSocket = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      // Connect socket when authenticated
      socketService.connect();

      return () => {
        // Disconnect when unmounted or logged out
        socketService.disconnect();
      };
    } else {
      // Disconnect if not authenticated
      socketService.disconnect();
    }
  }, [isAuthenticated]);

  return socketService;
};
