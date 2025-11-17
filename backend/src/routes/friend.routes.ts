// backend/src/routes/friend.routes.ts

import { Router } from 'express';
import { z } from 'zod';
import friendController from '../controllers/friend.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { friendRequestSchema, paginationSchema } from '../utils/validators';

const router = Router();

// Validation schemas
const friendIdParamSchema = z.object({
  id: z.string().uuid('Invalid friend ID'),
});

const requestIdParamSchema = z.object({
  id: z.string().uuid('Invalid request ID'),
});

// All friend routes require authentication
router.use(authenticate);

// GET /api/v1/friends - Get friends list
router.get(
  '/',
  validateQuery(paginationSchema),
  friendController.getFriends
);

// POST /api/v1/friends/request - Send friend request
router.post(
  '/request',
  validateBody(friendRequestSchema),
  friendController.sendFriendRequest
);

// GET /api/v1/friends/requests - Get friend requests
router.get(
  '/requests',
  validateQuery(paginationSchema),
  friendController.getFriendRequests
);

// POST /api/v1/friends/requests/:id/accept - Accept friend request
router.post(
  '/requests/:id/accept',
  validateParams(requestIdParamSchema),
  friendController.acceptFriendRequest
);

// POST /api/v1/friends/requests/:id/reject - Reject friend request
router.post(
  '/requests/:id/reject',
  validateParams(requestIdParamSchema),
  friendController.rejectFriendRequest
);

// DELETE /api/v1/friends/:id - Remove friend
router.delete(
  '/:id',
  validateParams(friendIdParamSchema),
  friendController.removeFriend
);

export default router;
