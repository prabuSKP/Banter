// mobile/src/constants/app.ts

/**
 * Mobile app constants
 * Centralized location for all configuration values and magic numbers
 */

// ==================== API ENDPOINTS ====================

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  DELETE_ACCOUNT: '/auth/account',

  // Users
  GET_PROFILE: '/users/me',
  UPDATE_PROFILE: '/users/me',
  UPDATE_AVATAR: '/users/me/avatar',
  SEARCH_USERS: '/users/search',
  GET_USER: (id: string) => `/users/${id}`,
  BLOCK_USER: (id: string) => `/users/${id}/block`,
  UNBLOCK_USER: (id: string) => `/users/${id}/block`,
  GET_BLOCKED: '/users/blocked',

  // Friends
  GET_FRIENDS: '/friends',
  SEND_REQUEST: '/friends/request',
  GET_REQUESTS: '/friends/requests',
  ACCEPT_REQUEST: (id: string) => `/friends/requests/${id}/accept`,
  REJECT_REQUEST: (id: string) => `/friends/requests/${id}/reject`,
  REMOVE_FRIEND: (id: string) => `/friends/${id}`,
  GET_SUGGESTIONS: '/friends/suggestions',

  // Messages
  SEND_MESSAGE: '/messages',
  GET_CONVERSATIONS: '/messages/conversations',
  GET_CONVERSATION: (userId: string) => `/messages/conversation/${userId}`,
  GET_ROOM_MESSAGES: (roomId: string) => `/messages/room/${roomId}`,
  MARK_READ: '/messages/read',
  DELETE_MESSAGE: (id: string) => `/messages/${id}`,
  UNREAD_COUNT: '/messages/unread/count',

  // Calls
  INITIATE_CALL: '/calls/initiate',
  UPDATE_CALL_STATUS: (id: string) => `/calls/${id}/status`,
  GET_CALL_LOGS: '/calls/logs',
  GET_CALL_STATS: '/calls/stats',
  GET_AGORA_TOKEN: '/calls/agora-token',

  // Rooms
  CREATE_ROOM: '/rooms',
  GET_PUBLIC_ROOMS: '/rooms',
  GET_MY_ROOMS: '/rooms/my',
  SEARCH_ROOMS: '/rooms/search',
  GET_ROOM: (id: string) => `/rooms/${id}`,
  JOIN_ROOM: (id: string) => `/rooms/${id}/join`,
  LEAVE_ROOM: (id: string) => `/rooms/${id}/leave`,
  UPDATE_ROOM: (id: string) => `/rooms/${id}`,
  DELETE_ROOM: (id: string) => `/rooms/${id}`,
  GET_ROOM_MEMBERS: (id: string) => `/rooms/${id}/members`,

  // Wallet
  GET_BALANCE: '/wallet/balance',
  GET_TRANSACTIONS: '/wallet/transactions',

  // Payments
  CREATE_ORDER: '/payments/create-order',
  VERIFY_PAYMENT: '/payments/verify',
  GET_PAYMENT_HISTORY: '/payments/history',

  // Host
  APPLY_AS_HOST: '/host/apply',
  GET_HOST_DASHBOARD: '/host/dashboard',
  GET_HOST_EARNINGS: '/host/earnings',
  REQUEST_WITHDRAWAL: '/host/withdrawal',
  RATE_HOST: '/host/rate',

  // Notifications
  GET_NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  DELETE_NOTIFICATION: (id: string) => `/notifications/${id}`,
} as const;

// ==================== SOCKET EVENTS ====================

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // User presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',

  // Typing indicators
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Messages
  MESSAGE_NEW: 'message:new',
  MESSAGE_SENT: 'message:sent',
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
} as const;

// ==================== PAGINATION ====================

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
  DEFAULT_PAGE: 1,
} as const;

// ==================== CALL SETTINGS ====================

export const CALL = {
  RING_TIMEOUT_MS: 60000, // 60 seconds
  MIN_DURATION_FOR_RATING: 30, // 30 seconds
  AUDIO_CALL_RATE: 5, // coins per minute
  VIDEO_CALL_RATE: 10, // coins per minute
} as const;

// ==================== ROOM SETTINGS ====================

export const ROOM = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  DEFAULT_MAX_MEMBERS: 10,
} as const;

// ==================== MESSAGE SETTINGS ====================

export const MESSAGE = {
  MAX_CONTENT_LENGTH: 5000,
  MAX_IMAGE_SIZE_MB: 5,
  MAX_VIDEO_SIZE_MB: 50,
  MAX_AUDIO_SIZE_MB: 10,
} as const;

// ==================== USER SETTINGS ====================

export const USER = {
  MIN_DISPLAY_NAME_LENGTH: 2,
  MAX_DISPLAY_NAME_LENGTH: 50,
  MAX_BIO_LENGTH: 500,
} as const;

// ==================== WITHDRAWAL ====================

export const WITHDRAWAL = {
  MIN_AMOUNT: 500, // INR
} as const;

// ==================== FILE TYPES ====================

export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
} as const;

// ==================== COLORS ====================

export const COLORS = {
  PRIMARY: '#6200EE',
  PRIMARY_DARK: '#3700B3',
  PRIMARY_LIGHT: '#BB86FC',
  SECONDARY: '#03DAC6',
  SECONDARY_DARK: '#018786',
  ERROR: '#B00020',
  WARNING: '#FFA000',
  SUCCESS: '#4CAF50',
  INFO: '#2196F3',
  BACKGROUND: '#FFFFFF',
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#757575',
  DIVIDER: '#BDBDBD',
} as const;

// ==================== STORAGE KEYS ====================

export const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth_tokens',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  PUSH_TOKEN: 'push_token',
  DEVICE_ID: 'device_id',
} as const;

// ==================== CALL STATUS ====================

export const CALL_STATUS = {
  INITIATED: 'initiated',
  RINGING: 'ringing',
  ANSWERED: 'answered',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  MISSED: 'missed',
  DECLINED: 'declined',
  FAILED: 'failed',
} as const;

// ==================== MESSAGE TYPES ====================

export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  GIF: 'gif',
} as const;

// ==================== NOTIFICATION TYPES ====================

export const NOTIFICATION_TYPE = {
  FRIEND_REQUEST: 'friend_request',
  MESSAGE: 'message',
  CALL: 'call',
  SYSTEM: 'system',
} as const;

// ==================== TRANSACTION TYPES ====================

export const TRANSACTION_TYPE = {
  PURCHASE: 'purchase',
  EARNING: 'earning',
  REFUND: 'refund',
  WITHDRAWAL: 'withdrawal',
} as const;

// ==================== SUBSCRIPTION PLANS ====================

export const SUBSCRIPTION_PLAN = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

export const SUBSCRIPTION_PRICING = {
  MONTHLY: 99, // INR
  YEARLY: 999, // INR
} as const;

// ==================== ENVIRONMENT ====================

export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000',
  API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
  AGORA_APP_ID: process.env.EXPO_PUBLIC_AGORA_APP_ID || '',
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  RAZORPAY_KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '',
} as const;

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  INSUFFICIENT_BALANCE: 'Insufficient coin balance.',
  CALL_FAILED: 'Call failed. Please try again.',
  ROOM_FULL: 'Room is full.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  USER_NOT_FOUND: 'User not found.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
} as const;

// ==================== SUCCESS MESSAGES ====================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  FRIEND_REQUEST_SENT: 'Friend request sent!',
  MESSAGE_SENT: 'Message sent!',
  CALL_ENDED: 'Call ended.',
  ROOM_JOINED: 'Joined room successfully!',
} as const;

// ==================== TIMEOUTS ====================

export const TIMEOUTS = {
  API_TIMEOUT: 30000, // 30 seconds
  SOCKET_RECONNECT_DELAY: 5000, // 5 seconds
  DEBOUNCE_SEARCH: 500, // 500ms
  TOAST_DURATION: 3000, // 3 seconds
} as const;

// ==================== LIMITS ====================

export const LIMITS = {
  MAX_FRIEND_REQUESTS: 50,
  MAX_FRIENDS: 500,
  MAX_ROOMS: 20,
  MAX_MESSAGES_PER_DAY: 1000,
} as const;

// ==================== RATINGS ====================

export const RATING = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 3,
} as const;

// ==================== TYPES ====================

export type CallStatus = typeof CALL_STATUS[keyof typeof CALL_STATUS];
export type MessageType = typeof MESSAGE_TYPE[keyof typeof MESSAGE_TYPE];
export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];
export type TransactionType = typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];
export type SubscriptionPlan = typeof SUBSCRIPTION_PLAN[keyof typeof SUBSCRIPTION_PLAN];
export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
