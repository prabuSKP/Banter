// backend/tests/integration/user.test.ts

import request from 'supertest';
import app from '../../src/app';
import { generateTestToken, mockUser, generateRandomUser } from '../utils/testHelpers';
import prisma from '../../src/config/database';

describe('User API', () => {
  const authToken = generateTestToken();

  describe('GET /api/v1/users/me', () => {
    it('should get current user profile', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('phoneNumber');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/users/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/users/me', () => {
    it('should update user profile', async () => {
      const updatedUser = { ...mockUser, displayName: 'Updated Name' };
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser as any);

      const response = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          displayName: 'Updated Name',
          bio: 'New bio',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.displayName).toBe('Updated Name');
    });

    it('should reject invalid profile data', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          gender: 'invalid', // Invalid gender
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('should reject too many interests', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          interests: Array(11).fill('interest'), // Max is 10
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/users/me/avatar', () => {
    it('should update user avatar', async () => {
      const updatedUser = { ...mockUser, avatarUrl: 'https://example.com/avatar.jpg' };
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(updatedUser as any);

      const response = await request(app)
        .post('/api/v1/users/me/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          avatarUrl: 'https://example.com/avatar.jpg',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject invalid avatar URL', async () => {
      const response = await request(app)
        .post('/api/v1/users/me/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          avatarUrl: 'not-a-valid-url',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user by ID', async () => {
      const otherUser = generateRandomUser();
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(otherUser as any);

      const response = await request(app)
        .get(`/api/v1/users/${otherUser.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(otherUser.id);
    });

    it('should return 404 for non-existent user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users/search', () => {
    it('should search users by query', async () => {
      const users = [generateRandomUser(), generateRandomUser()];
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(users as any);
      jest.spyOn(prisma.user, 'count').mockResolvedValue(2);

      const response = await request(app)
        .get('/api/v1/users/search')
        .query({ q: 'test' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should require search query', async () => {
      const response = await request(app)
        .get('/api/v1/users/search')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('should support pagination', async () => {
      const users = [generateRandomUser()];
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(users as any);
      jest.spyOn(prisma.user, 'count').mockResolvedValue(10);

      const response = await request(app)
        .get('/api/v1/users/search')
        .query({ q: 'test', page: '2', limit: '5' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/v1/users/:id/block', () => {
    it('should block a user', async () => {
      const targetUser = generateRandomUser();
      jest.spyOn(prisma.blockedUser, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.blockedUser, 'create').mockResolvedValue({
        id: 'block-id',
        blockerId: mockUser.id!,
        blockedId: targetUser.id!,
        createdAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/v1/users/${targetUser.id}/block`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject blocking yourself', async () => {
      const response = await request(app)
        .post(`/api/v1/users/${mockUser.id}/block`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject blocking already blocked user', async () => {
      const targetUser = generateRandomUser();
      jest.spyOn(prisma.blockedUser, 'findUnique').mockResolvedValue({
        id: 'existing-block',
        blockerId: mockUser.id!,
        blockedId: targetUser.id!,
        createdAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/v1/users/${targetUser.id}/block`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/users/:id/block', () => {
    it('should unblock a user', async () => {
      const targetUser = generateRandomUser();
      jest.spyOn(prisma.blockedUser, 'delete').mockResolvedValue({
        id: 'block-id',
        blockerId: mockUser.id!,
        blockedId: targetUser.id!,
        createdAt: new Date(),
      });

      const response = await request(app)
        .delete(`/api/v1/users/${targetUser.id}/block`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 if block relationship not found', async () => {
      const targetUser = generateRandomUser();
      jest.spyOn(prisma.blockedUser, 'delete').mockRejectedValue(new Error('Not found'));

      const response = await request(app)
        .delete(`/api/v1/users/${targetUser.id}/block`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users/blocked', () => {
    it('should get blocked users list', async () => {
      const blockedUsers = [
        {
          id: 'block-1',
          blockerId: mockUser.id!,
          blockedId: 'user-1',
          createdAt: new Date(),
          blocked: {
            id: 'user-1',
            displayName: 'Blocked User 1',
            avatarUrl: null,
          },
        },
      ];

      jest.spyOn(prisma.blockedUser, 'findMany').mockResolvedValue(blockedUsers as any);

      const response = await request(app)
        .get('/api/v1/users/blocked')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });
});
