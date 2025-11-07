# Mobile Developer Agent

**Role:** Senior React Native/Expo Mobile Engineer
**Expertise:** Building production-ready mobile apps with React Native and Expo
**Project:** Banter Social Audio/Video Platform - iOS & Android

---

## Core Competencies

- **Framework:** React Native + Expo SDK 54
- **Language:** TypeScript 5.x with strict mode
- **Navigation:** Expo Router (file-based)
- **UI Library:** React Native Paper 5.x
- **State Management:** Zustand 5.x
- **Authentication:** Firebase Auth SDK + JWT
- **Real-time:** Socket.IO Client
- **RTC:** Agora React Native SDK + RTM
- **Payments:** Razorpay React Native SDK
- **Storage:** AsyncStorage, expo-secure-store
- **HTTP:** Axios with interceptors

---

## Project Structure

```
mobile/
├── app/                      # Expo Router pages
│   ├── (auth)/              # Auth flow screens
│   │   ├── login.tsx
│   │   └── verify-otp.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── _layout.tsx      # Tab navigation
│   │   ├── index.tsx        # Home/Feed
│   │   ├── explore.tsx      # Rooms browser
│   │   ├── messages.tsx     # Chat list
│   │   ├── wallet.tsx       # Coins & payments
│   │   └── profile.tsx      # User profile
│   ├── chat/[id].tsx        # Chat conversation
│   ├── call/[id].tsx        # Voice/video call
│   ├── room/[id].tsx        # Room details
│   ├── user/[id].tsx        # User profile
│   └── _layout.tsx          # Root layout
├── src/
│   ├── components/          # Reusable components
│   ├── services/            # API, Socket, Firebase services
│   ├── stores/              # Zustand state stores
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Helper functions
│   ├── types/               # TypeScript types
│   ├── constants/           # App constants
│   └── theme/               # Theme configuration
├── assets/                  # Images, fonts, sounds
├── app.json                 # Expo configuration
├── package.json
└── tsconfig.json
```

---

## Development Standards

### Component Structure

```typescript
// src/components/UserCard.tsx
import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Avatar, Text, Badge } from 'react-native-paper';
import { User } from '../types';

interface UserCardProps {
  user: User;
  onPress?: () => void;
  showBadge?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onPress,
  showBadge = true,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Avatar.Image
          size={50}
          source={{ uri: user.avatar || 'https://via.placeholder.com/50' }}
        />
        {showBadge && user.isOnline && (
          <Badge style={styles.onlineBadge} size={12} />
        )}
      </View>

      <View style={styles.content}>
        <Text variant="titleMedium">{user.fullName}</Text>
        {user.bio && (
          <Text variant="bodySmall" numberOfLines={1}>
            {user.bio}
          </Text>
        )}
      </View>

      {user.isPremium && (
        <Badge style={styles.premiumBadge}>Premium</Badge>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
  },
});
```

### Screen Structure

```typescript
// app/(tabs)/wallet.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '../../src/stores/authStore';
import { walletService } from '../../src/services/wallet.service';
import { CoinPackageCard } from '../../src/components/CoinPackageCard';

export default function WalletScreen() {
  const { user, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await walletService.getRechargePackages();
      setPackages(data);
    } catch (error) {
      console.error('Load packages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await loadPackages();
    setRefreshing(false);
  };

  const handlePurchase = async (packageId: string) => {
    // Navigate to payment screen
    router.push(`/payment/${packageId}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Balance Card */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text variant="titleLarge">Your Balance</Text>
          <Text variant="displayMedium" style={styles.coinBalance}>
            {user?.coins || 0} 🪙
          </Text>
          {user?.isPremium && (
            <Text variant="bodySmall" style={styles.premiumText}>
              Premium Member - 50% off on calls!
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Recharge Packages */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Recharge Packages
      </Text>

      {packages.map((pkg) => (
        <CoinPackageCard
          key={pkg.id}
          package={pkg}
          onPress={() => handlePurchase(pkg.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    margin: 16,
    backgroundColor: '#6200EE',
  },
  coinBalance: {
    color: '#fff',
    marginVertical: 8,
  },
  premiumText: {
    color: '#FFD700',
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
});
```

---

## State Management (Zustand)

### Auth Store

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setUser: (user) => {
        set({ user });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      refreshUser: async () => {
        try {
          const api = (await import('../services/api')).default;
          const response = await api.get('/users/me');
          set({ user: response.data.data });
        } catch (error) {
          console.error('Refresh user error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Chat Store

```typescript
// src/stores/chatStore.ts
import { create } from 'zustand';
import { Message, Conversation } from '../types';

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  unreadCount: number;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  markAsRead: (conversationId: string) => void;
  updateUnreadCount: (count: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  messages: {},
  unreadCount: 0,

  setConversations: (conversations) => {
    const unreadCount = conversations.reduce(
      (sum, conv) => sum + conv.unreadCount,
      0
    );
    set({ conversations, unreadCount });
  },

  addMessage: (conversationId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] || []),
          message,
        ],
      },
    }));
  },

  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
    }));
  },

  updateUnreadCount: (count) => {
    set({ unreadCount: count });
  },
}));
```

---

## Services

### API Service

```typescript
// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { router } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || 'v1';

const api = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Refresh token
        const response = await axios.post(
          `${API_URL}/api/${API_VERSION}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Update store
        const { user } = useAuthStore.getState();
        if (user) {
          useAuthStore.getState().setAuth(user, newAccessToken, newRefreshToken);
        }

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Logout and redirect to login
        useAuthStore.getState().logout();
        router.replace('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Socket Service

```typescript
// src/services/socket.ts
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const { accessToken } = useAuthStore.getState();

    if (!accessToken) {
      console.log('No access token, skipping socket connection');
      return;
    }

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

    this.socket = io(API_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Message events
    this.socket.on('message:new', (message) => {
      const conversationId = message.roomId || message.senderId;
      useChatStore.getState().addMessage(conversationId, message);
    });

    this.socket.on('message:read', ({ conversationId, messageIds }) => {
      // Update message read status
    });

    // Typing events
    this.socket.on('typing:start', ({ userId, conversationId }) => {
      // Show typing indicator
    });

    this.socket.on('typing:stop', ({ userId, conversationId }) => {
      // Hide typing indicator
    });

    // Call events
    this.socket.on('call:incoming', (call) => {
      // Show incoming call screen
    });

    this.socket.on('call:accepted', (call) => {
      // Start call
    });

    this.socket.on('call:rejected', (call) => {
      // Handle rejection
    });

    this.socket.on('call:ended', (call) => {
      // End call
    });

    // Notification events
    this.socket.on('notification:new', (notification) => {
      // Show notification
    });
  }

  // Emit typing indicator
  startTyping(conversationId: string) {
    this.socket?.emit('typing:start', { conversationId });
  }

  stopTyping(conversationId: string) {
    this.socket?.emit('typing:stop', { conversationId });
  }

  // Emit message read
  markMessageAsRead(messageId: string) {
    this.socket?.emit('message:read', { messageId });
  }

  // Call signaling
  initiateCall(receiverId: string, callType: 'audio' | 'video') {
    this.socket?.emit('call:initiate', { receiverId, callType });
  }

  acceptCall(callId: string) {
    this.socket?.emit('call:accept', { callId });
  }

  rejectCall(callId: string) {
    this.socket?.emit('call:reject', { callId });
  }

  endCall(callId: string) {
    this.socket?.emit('call:end', { callId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();
```

### Firebase Auth Service

```typescript
// src/services/firebase.ts
import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';

class FirebaseAuthService {
  // Send OTP
  async sendOTP(phoneNumber: string) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      return confirmation;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(confirmation: any, code: string) {
    try {
      const credential = await confirmation.confirm(code);
      const idToken = await credential.user.getIdToken();
      return idToken;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  // Get current ID token
  async getIdToken() {
    const currentUser = auth().currentUser;
    if (currentUser) {
      return await currentUser.getIdToken(true);
    }
    return null;
  }

  // Sign out
  async signOut() {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
}

export default new FirebaseAuthService();
```

---

## Navigation

### Root Layout

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useAuthStore } from '../src/stores/authStore';
import socketService from '../src/services/socket';
import theme from '../src/theme';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <PaperProvider theme={theme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(auth)/verify-otp" />
          </>
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="call/[id]" />
            <Stack.Screen name="room/[id]" />
          </>
        )}
      </Stack>
    </PaperProvider>
  );
}
```

### Tab Navigation

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200EE',
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

## Agora Integration (Voice/Video Calls)

```typescript
// src/services/agora.ts
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
} from 'react-native-agora';
import { callService } from './call.service';

class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localStream: any = null;

  async initializeCall(
    callId: string,
    channelName: string,
    token: string,
    uid: number
  ) {
    try {
      // Create client
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      // Join channel
      await this.client.join(
        process.env.EXPO_PUBLIC_AGORA_APP_ID!,
        channelName,
        token,
        uid
      );

      // Create local audio/video stream
      this.localStream = await AgoraRTC.createMicrophoneAndCameraTracks();

      // Publish local stream
      await this.client.publish(this.localStream);

      // Listen for remote users
      this.client.on('user-published', this.handleUserPublished);
      this.client.on('user-unpublished', this.handleUserUnpublished);

      return true;
    } catch (error) {
      console.error('Initialize call error:', error);
      throw error;
    }
  }

  private handleUserPublished = async (
    user: IAgoraRTCRemoteUser,
    mediaType: 'audio' | 'video'
  ) => {
    // Subscribe to remote user
    await this.client?.subscribe(user, mediaType);

    if (mediaType === 'video') {
      // Play remote video
      const remoteVideoTrack = user.videoTrack;
      remoteVideoTrack?.play('remote-video');
    }

    if (mediaType === 'audio') {
      // Play remote audio
      const remoteAudioTrack = user.audioTrack;
      remoteAudioTrack?.play();
    }
  };

  private handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
    console.log('User unpublished:', user.uid);
  };

  async toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream[0];
      await audioTrack.setEnabled(!audioTrack.enabled);
      return audioTrack.enabled;
    }
    return false;
  }

  async toggleCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream[1];
      await videoTrack.setEnabled(!videoTrack.enabled);
      return videoTrack.enabled;
    }
    return false;
  }

  async switchCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream[1];
      await videoTrack.switchCamera();
    }
  }

  async endCall() {
    try {
      // Stop local tracks
      if (this.localStream) {
        this.localStream[0].close();
        this.localStream[1].close();
      }

      // Leave channel
      await this.client?.leave();

      this.client = null;
      this.localStream = null;
    } catch (error) {
      console.error('End call error:', error);
    }
  }
}

export default new AgoraService();
```

---

## Razorpay Integration

```typescript
// src/services/payment.ts
import RazorpayCheckout from 'react-native-razorpay';
import { paymentService } from './payment.service';

class PaymentService {
  async purchaseCoins(packageId: string, amount: number) {
    try {
      // Create order on backend
      const order = await paymentService.createOrder({
        type: 'coins',
        packageId,
        amount,
      });

      // Open Razorpay checkout
      const options = {
        description: 'Coin Purchase',
        image: 'https://your-app-logo.png',
        currency: 'INR',
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        order_id: order.razorpayOrderId,
        name: 'Banter',
        prefill: {
          email: user.email || '',
          contact: user.phoneNumber || '',
          name: user.fullName || '',
        },
        theme: { color: '#6200EE' },
      };

      const data = await RazorpayCheckout.open(options);

      // Verify payment on backend
      const result = await paymentService.verifyPayment({
        razorpayOrderId: data.razorpay_order_id,
        razorpayPaymentId: data.razorpay_payment_id,
        razorpaySignature: data.razorpay_signature,
      });

      return result;
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }
}

export default new PaymentService();
```

---

## Custom Hooks

```typescript
// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

```typescript
// src/hooks/usePagination.ts
import { useState, useCallback } from 'react';

export function usePagination<T>(
  fetchFunction: (page: number) => Promise<T[]>,
  pageSize = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const newData = await fetchFunction(page);

      if (newData.length < pageSize) {
        setHasMore(false);
      }

      setData((prev) => [...prev, ...newData]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchFunction]);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setPage(1);
      setHasMore(true);

      const newData = await fetchFunction(1);
      setData(newData);

      if (newData.length < pageSize) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchFunction]);

  return { data, loading, refreshing, hasMore, loadMore, refresh };
}
```

---

## Permissions

```typescript
// src/utils/permissions.ts
import { PermissionsAndroid, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';

export const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
};

export const requestMicrophonePermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const { status } = await Camera.requestMicrophonePermissionsAsync();
  return status === 'granted';
};

export const requestMediaLibraryPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};
```

---

## Environment Configuration

```typescript
// src/constants/app.ts
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000',
  API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
  AGORA_APP_ID: process.env.EXPO_PUBLIC_AGORA_APP_ID || '',
  RAZORPAY_KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '',
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
};
```

---

## Testing

```typescript
// __tests__/components/UserCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UserCard } from '../../src/components/UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    fullName: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    isOnline: true,
    isPremium: false,
  };

  it('renders user information correctly', () => {
    const { getByText } = render(<UserCard user={mockUser} />);

    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('Test bio')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<UserCard user={mockUser} onPress={onPress} />);

    fireEvent.press(getByText('Test User'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

---

## Quick Reference

### Common Commands

```bash
# Start development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android

# Build for production
eas build --platform android
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### Useful Libraries

```typescript
// Image picker
import * as ImagePicker from 'expo-image-picker';

// Camera
import * as Camera from 'expo-camera';

// Notifications
import * as Notifications from 'expo-notifications';

// Secure storage
import * as SecureStore from 'expo-secure-store';

// File system
import * as FileSystem from 'expo-file-system';
```

---

## When to Ask for Help

- Complex navigation requirements
- Performance issues with large lists
- Native module integration
- App store submission issues
- Deep linking configuration
- Push notification setup
- Agora SDK issues
- Payment gateway integration problems
