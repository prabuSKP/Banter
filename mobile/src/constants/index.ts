// mobile/src/constants/index.ts

import Constants from 'expo-constants';

// Environment variables
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000',
  API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:5000',

  // Firebase
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,

  // LiveKit
  LIVEKIT_SERVER_URL: process.env.EXPO_PUBLIC_LIVEKIT_SERVER_URL || 'wss://livekit.banter.app',

  // Razorpay
  RAZORPAY_KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,

  // App
  DEFAULT_COUNTRY_CODE: process.env.EXPO_PUBLIC_DEFAULT_COUNTRY_CODE || '+91',
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'Banter',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  DELETE_ACCOUNT: '/auth/account',

  // User
  GET_ME: '/users/me',
  UPDATE_PROFILE: '/users/me',
  UPDATE_AVATAR: '/users/me/avatar',
  SEARCH_USERS: '/users/search',
  GET_USER: (id: string) => `/users/${id}`,
  BLOCK_USER: (id: string) => `/users/${id}/block`,
  UNBLOCK_USER: (id: string) => `/users/${id}/block`,
  GET_BLOCKED_USERS: '/users/blocked',

  // Friends
  GET_FRIENDS: '/friends',
  SEND_FRIEND_REQUEST: '/friends/request',
  GET_FRIEND_REQUESTS: '/friends/requests',
  ACCEPT_FRIEND_REQUEST: (id: string) => `/friends/requests/${id}/accept`,
  REJECT_FRIEND_REQUEST: (id: string) => `/friends/requests/${id}/reject`,
  REMOVE_FRIEND: (id: string) => `/friends/${id}`,

  // Messages
  GET_MESSAGES: '/messages',
  SEND_MESSAGE: '/messages',
  GET_CONVERSATION: (userId: string) => `/messages/conversation/${userId}`,
  MARK_AS_READ: '/messages/read',

  // Rooms
  GET_ROOMS: '/rooms',
  CREATE_ROOM: '/rooms',
  GET_ROOM: (id: string) => `/rooms/${id}`,
  JOIN_ROOM: (id: string) => `/rooms/${id}/join`,
  LEAVE_ROOM: (id: string) => `/rooms/${id}/leave`,

  // Calls
  INITIATE_CALL: '/calls/initiate',
  GET_CALL_LOGS: '/calls/logs',
  GET_LIVEKIT_TOKEN: '/calls/livekit-token',

  // Payments
  CREATE_ORDER: '/payments/order',
  VERIFY_PAYMENT: '/payments/verify',
  GET_TRANSACTIONS: '/payments/transactions',

  // Host
  APPLY_AS_HOST: '/host/apply',
  GET_HOST_DASHBOARD: '/host/dashboard',
  GET_HOST_EARNINGS: '/host/earnings',
  REQUEST_WITHDRAWAL: '/host/withdrawal',
  RATE_HOST: '/host/rate',
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // User presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',

  // Typing
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Messages
  MESSAGE_SENT: 'message:sent',
  MESSAGE_NEW: 'message:new',
  MESSAGE_READ: 'message:read',
  MESSAGE_READ_RECEIPT: 'message:read_receipt',

  // Calls
  CALL_INITIATE: 'call:initiate',
  CALL_INCOMING: 'call:incoming',
  CALL_ACCEPT: 'call:accept',
  CALL_ACCEPTED: 'call:accepted',
  CALL_REJECT: 'call:reject',
  CALL_REJECTED: 'call:rejected',
  CALL_END: 'call:end',
  CALL_ENDED: 'call:ended',
  CALL_ERROR: 'call:error',

  // Rooms
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_USER_JOINED: 'room:user_joined',
  ROOM_USER_LEFT: 'room:user_left',
  ROOM_SPEAKING: 'room:speaking',
  ROOM_USER_SPEAKING: 'room:user_speaking',
};

// Theme colors
export const COLORS = {
  primary: '#6200EE',
  secondary: '#03DAC6',
  error: '#B00020',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#000000',
  textSecondary: '#757575',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  online: '#4CAF50',
  offline: '#9E9E9E',
};

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text' as const,
  IMAGE: 'image' as const,
  AUDIO: 'audio' as const,
  VIDEO: 'video' as const,
  GIF: 'gif' as const,
};

// Call types
export const CALL_TYPES = {
  AUDIO: 'audio' as const,
  VIDEO: 'video' as const,
};

// Gender options
export const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];
