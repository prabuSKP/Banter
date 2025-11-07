// backend/src/constants/index.ts

/**
 * Application-wide constants
 * Centralized location for all magic numbers and configuration values
 */

// ==================== EARNINGS & PAYMENTS ====================

export const EARNING_RATES = {
  AUDIO_CALL_PERCENTAGE: 0.15, // 15% of revenue for audio calls
  VIDEO_CALL_PERCENTAGE: 0.30, // 30% of revenue for video calls
  COIN_TO_INR_RATE: 0.1, // 10 coins = ₹1
} as const;

export const WITHDRAWAL = {
  MIN_AMOUNT: 500, // Minimum withdrawal amount in INR
  PROCESSING_TIME_DAYS: 5, // 3-5 business days
} as const;

export const COINS = {
  INITIAL_USER_COINS: 100, // Default coins for new users
  AUDIO_CALL_RATE_PER_MINUTE: 5, // Coins per minute for audio calls
  VIDEO_CALL_RATE_PER_MINUTE: 10, // Coins per minute for video calls
} as const;

// ==================== CALL SETTINGS ====================

export const CALL = {
  MAX_DURATION_HOURS: 24, // Maximum call duration
  RING_TIMEOUT_SECONDS: 60, // Ring timeout before auto-cancel
  MIN_DURATION_FOR_RATING: 30, // Minimum seconds to allow rating
} as const;

export const AGORA = {
  DEFAULT_TOKEN_EXPIRY: 3600, // 1 hour in seconds
  UID_MAX_VALUE: 2147483647, // Max int32 value for Agora UID
} as const;

// ==================== ROOM SETTINGS ====================

export const ROOM = {
  DEFAULT_MAX_MEMBERS: 10, // Default maximum members per room
  MAX_ROOM_NAME_LENGTH: 100,
  MAX_ROOM_DESCRIPTION_LENGTH: 500,
} as const;

// ==================== PAGINATION ====================

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
} as const;

// ==================== CACHE ====================

export const CACHE_TTL = {
  USER_PROFILE: 3600, // 1 hour
  ROOM_LIST: 300, // 5 minutes
  FRIEND_LIST: 600, // 10 minutes
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
} as const;

// ==================== RATE LIMITING ====================

export const RATE_LIMIT = {
  GENERAL_WINDOW_MS: 900000, // 15 minutes
  GENERAL_MAX_REQUESTS: 100,
  AUTH_WINDOW_MS: 60000, // 1 minute
  AUTH_MAX_REQUESTS: 5,
} as const;

// ==================== MESSAGES ====================

export const MESSAGE = {
  RETENTION_DAYS: 90, // Message retention period
  MAX_CONTENT_LENGTH: 5000,
} as const;

// ==================== FILE UPLOAD ====================

export const UPLOAD = {
  MAX_IMAGE_SIZE_MB: 5,
  MAX_VIDEO_SIZE_MB: 50,
  MAX_AUDIO_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
} as const;

// ==================== USER ====================

export const USER = {
  DEFAULT_COUNTRY_CODE: '+91',
  MIN_DISPLAY_NAME_LENGTH: 2,
  MAX_DISPLAY_NAME_LENGTH: 50,
  MAX_BIO_LENGTH: 500,
  MIN_AGE: 13,
} as const;

// ==================== HOST VERIFICATION ====================

export const HOST = {
  MIN_DOCUMENTS_REQUIRED: 2,
  MAX_DOCUMENTS: 5,
  VERIFICATION_REVIEW_DAYS: 3, // Days to review application
} as const;

// ==================== SUBSCRIPTION ====================

export const SUBSCRIPTION = {
  MONTHLY_PRICE: 99, // INR
  YEARLY_PRICE: 999, // INR
  YEARLY_DISCOUNT_PERCENTAGE: 16, // ~16% discount on yearly
} as const;

// ==================== BONUS TYPES ====================

export const BONUS_TYPES = {
  HIGH_RATING: 'high_rating',
  LONG_HOURS: 'long_hours',
  MILESTONE: 'milestone',
  REFERRAL: 'referral',
} as const;

// ==================== STATUS VALUES ====================

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

export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  GIF: 'gif',
} as const;

export const TRANSACTION_TYPE = {
  PURCHASE: 'purchase',
  EARNING: 'earning',
  REFUND: 'refund',
  WITHDRAWAL: 'withdrawal',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const WITHDRAWAL_METHOD = {
  UPI: 'upi',
  BANK_TRANSFER: 'bank_transfer',
  WALLET: 'wallet',
} as const;

export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;

export const ROOM_ROLE = {
  MEMBER: 'member',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

export const FRIEND_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export const SUBSCRIPTION_PLAN = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export const NOTIFICATION_TYPE = {
  FRIEND_REQUEST: 'friend_request',
  MESSAGE: 'message',
  CALL: 'call',
  SYSTEM: 'system',
} as const;

export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
} as const;

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  INSUFFICIENT_BALANCE: 'Insufficient coin balance',
  USER_NOT_FOUND: 'User not found',
  CALL_NOT_FOUND: 'Call not found',
  ROOM_NOT_FOUND: 'Room not found',
  FRIEND_REQUEST_EXISTS: 'Friend request already sent',
  ALREADY_FRIENDS: 'Already friends',
  NOT_FRIENDS: 'Not friends',
  BLOCKED_USER: 'User is blocked',
  ROOM_FULL: 'Room is full',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token has expired',
  VALIDATION_ERROR: 'Validation error',
} as const;

// ==================== SUCCESS MESSAGES ====================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  FRIEND_REQUEST_SENT: 'Friend request sent',
  FRIEND_REQUEST_ACCEPTED: 'Friend request accepted',
  CALL_INITIATED: 'Call initiated successfully',
  ROOM_CREATED: 'Room created successfully',
  ROOM_JOINED: 'Joined room successfully',
} as const;

// ==================== HTTP STATUS CODES ====================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ==================== REGEX PATTERNS ====================

export const REGEX = {
  PHONE_NUMBER: /^\+?[1-9]\d{1,14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  URL: /^https?:\/\/.+/,
} as const;

// ==================== TYPES ====================

// Export types for better TypeScript support
export type EarningRate = typeof EARNING_RATES[keyof typeof EARNING_RATES];
export type CallStatus = typeof CALL_STATUS[keyof typeof CALL_STATUS];
export type MessageType = typeof MESSAGE_TYPE[keyof typeof MESSAGE_TYPE];
export type TransactionType = typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];
export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];
export type WithdrawalMethod = typeof WITHDRAWAL_METHOD[keyof typeof WITHDRAWAL_METHOD];
export type WithdrawalStatus = typeof WITHDRAWAL_STATUS[keyof typeof WITHDRAWAL_STATUS];
export type RoomRole = typeof ROOM_ROLE[keyof typeof ROOM_ROLE];
export type FriendRequestStatus = typeof FRIEND_REQUEST_STATUS[keyof typeof FRIEND_REQUEST_STATUS];
export type SubscriptionPlan = typeof SUBSCRIPTION_PLAN[keyof typeof SUBSCRIPTION_PLAN];
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];
export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];
export type ReportStatus = typeof REPORT_STATUS[keyof typeof REPORT_STATUS];
export type Gender = typeof GENDER[keyof typeof GENDER];
