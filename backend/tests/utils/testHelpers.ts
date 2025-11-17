// backend/tests/utils/testHelpers.ts

import { generateAccessToken, generateRefreshToken } from '../../src/utils/jwt';
import { User } from '@prisma/client';

// Mock user data
export const mockUser: Partial<User> = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  phoneNumber: '+919876543210',
  countryCode: '+91',
  firebaseUid: 'test-firebase-uid',
  displayName: 'Test User',
  avatarUrl: null,
  bio: 'Test bio',
  dateOfBirth: null,
  gender: null,
  interests: [],
  coins: 100,
  isPremium: false,
  isOnline: false,
  isActive: true,
  lastActiveAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Generate test JWT token
export const generateTestToken = (userId: string = mockUser.id!) => {
  return generateAccessToken({
    userId,
    phoneNumber: mockUser.phoneNumber!,
    firebaseUid: mockUser.firebaseUid!,
  });
};

// Generate test refresh token
export const generateTestRefreshToken = (userId: string = mockUser.id!) => {
  return generateRefreshToken({
    userId,
    phoneNumber: mockUser.phoneNumber!,
    firebaseUid: mockUser.firebaseUid!,
  });
};

// Mock Firebase ID token
export const mockFirebaseIdToken = 'mock-firebase-id-token-for-testing';

// Mock decoded Firebase token
export const mockDecodedFirebaseToken = {
  uid: 'test-firebase-uid',
  phone_number: '+919876543210',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

// Mock LiveKit token
export const mockLiveKitToken = 'mock-livekit-rtc-token';

// Mock Razorpay order
export const mockRazorpayOrder = {
  id: 'order_test123456',
  entity: 'order',
  amount: 10000,
  currency: 'INR',
  receipt: 'receipt_test',
  status: 'created',
  created_at: Math.floor(Date.now() / 1000),
};

// Clean phone number for testing
export const cleanPhoneNumber = (phone: string) => {
  return phone.replace(/[\s\-\(\)]/g, '');
};

// Wait for specified milliseconds
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random user
export const generateRandomUser = (): Partial<User> => {
  const randomId = Math.random().toString(36).substring(7);
  return {
    id: `user-${randomId}`,
    phoneNumber: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    countryCode: '+91',
    firebaseUid: `firebase-${randomId}`,
    displayName: `User ${randomId}`,
    coins: 100,
    isPremium: false,
    isOnline: false,
    isActive: true,
  };
};
