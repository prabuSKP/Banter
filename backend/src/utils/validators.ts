// backend/src/utils/validators.ts

import { z } from 'zod';

// Phone number validator (supports international format)
export const phoneNumberSchema = z.string()
  .regex(/^\+\d{1,3}\d{6,14}$/, 'Invalid phone number format. Must be in format: +[country_code][number]');

// Firebase ID token validator
export const firebaseIdTokenSchema = z.string().min(1, 'Firebase ID token is required');

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
});

// User update schema
export const userUpdateSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(200).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  interests: z.array(z.string()).max(10).optional(),
});

// Friend request schema
export const friendRequestSchema = z.object({
  receiverId: z.string().uuid('Invalid user ID'),
});

// Message schema
export const messageSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID').optional(),
  roomId: z.string().uuid('Invalid room ID').optional(),
  content: z.string().min(1).max(5000),
  messageType: z.enum(['text', 'image', 'audio', 'video', 'gif']).default('text'),
  mediaUrl: z.string().url().optional(),
}).refine(
  (data) => data.receiverId || data.roomId,
  'Either receiverId or roomId must be provided'
);

// Room creation schema
export const roomCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
  maxMembers: z.number().int().min(2).max(50).default(10),
});

// Call initiation schema
export const callInitiateSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID'),
  callType: z.enum(['audio', 'video']),
});

// Report schema
export const reportSchema = z.object({
  reportedUserId: z.string().uuid('Invalid user ID'),
  reason: z.enum(['spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other']),
  description: z.string().max(500).optional(),
});

// Payment schema
export const paymentCreateSchema = z.object({
  productType: z.enum(['coins', 'premium_monthly', 'premium_yearly']),
  amount: z.number().positive(),
});

// Helper function to validate data against schema
export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};
