// backend/tests/integration/auth.test.ts

import request from 'supertest';
import app from '../../src/app';
import { mockFirebaseIdToken, mockDecodedFirebaseToken, mockUser } from '../utils/testHelpers';
import prisma from '../../src/config/database';
import admin from 'firebase-admin';

// Mock Firebase admin
const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
const mockGetUserByPhoneNumber = admin.auth().getUserByPhoneNumber as jest.Mock;
const mockCreateUser = admin.auth().createUser as jest.Mock;
const mockDeleteUser = admin.auth().deleteUser as jest.Mock;

describe('Auth API', () => {
  describe('POST /api/v1/auth/login', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should login existing user with valid Firebase token', async () => {
      // Mock Firebase verification
      mockVerifyIdToken.mockResolvedValue(mockDecodedFirebaseToken);

      // Mock Prisma user lookup
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: mockFirebaseIdToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
      expect(response.body.data.user.phoneNumber).toBe(mockUser.phoneNumber);
    });

    it('should create new user if not exists', async () => {
      mockVerifyIdToken.mockResolvedValue(mockDecodedFirebaseToken);

      // User doesn't exist
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: mockFirebaseIdToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should reject invalid Firebase token', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('should reject token without phone number', async () => {
      const invalidToken = { ...mockDecodedFirebaseToken, phone_number: undefined };
      mockVerifyIdToken.mockResolvedValue(invalidToken);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: mockFirebaseIdToken });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      // First login to get refresh token
      mockVerifyIdToken.mockResolvedValue(mockDecodedFirebaseToken);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: mockFirebaseIdToken });

      const { refreshToken } = loginResponse.body.data.tokens;

      // Use refresh token
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject request without refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout authenticated user', async () => {
      mockVerifyIdToken.mockResolvedValue(mockDecodedFirebaseToken);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any);

      // Login first
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: mockFirebaseIdToken });

      const { accessToken } = loginResponse.body.data.tokens;

      // Logout
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject logout without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/auth/account', () => {
    it('should delete authenticated user account', async () => {
      mockVerifyIdToken.mockResolvedValue(mockDecodedFirebaseToken);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any);
      mockDeleteUser.mockResolvedValue(undefined);

      // Login first
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: mockFirebaseIdToken });

      const { accessToken } = loginResponse.body.data.tokens;

      // Delete account
      const response = await request(app)
        .delete('/api/v1/auth/account')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject delete without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/auth/account');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
