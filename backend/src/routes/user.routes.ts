// backend/src/routes/user.routes.ts

import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { z } from 'zod';
import { userUpdateSchema } from '../utils/validators';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Avatar update schema
const avatarSchema = z.object({
  avatarUrl: z.string().url('Invalid avatar URL'),
});

// Search query schema
const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// GET /api/v1/users/me - Get current user profile
router.get('/me', userController.getMe);

// PUT /api/v1/users/me - Update current user profile
router.put('/me', validateBody(userUpdateSchema), userController.updateProfile);

// POST /api/v1/users/me/avatar - Update avatar
router.post('/me/avatar', validateBody(avatarSchema), userController.updateAvatar);

// GET /api/v1/users/search - Search users
router.get('/search', validateQuery(searchSchema), userController.searchUsers);

// GET /api/v1/users/blocked - Get blocked users
router.get('/blocked', userController.getBlockedUsers);

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// POST /api/v1/users/:id/block - Block user
router.post('/:id/block', userController.blockUser);

// DELETE /api/v1/users/:id/block - Unblock user
router.delete('/:id/block', userController.unblockUser);

export default router;
