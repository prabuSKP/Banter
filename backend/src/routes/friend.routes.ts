// backend/src/routes/friend.routes.ts

import { Router } from 'express';
import friendController from '../controllers/friend.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { friendRequestSchema } from '../utils/validators';

const router = Router();

// All friend routes require authentication
router.use(authenticate);

// GET /api/v1/friends - Get friends list
router.get('/', friendController.getFriends);

// POST /api/v1/friends/request - Send friend request
router.post(
  '/request',
  validateBody(friendRequestSchema),
  friendController.sendFriendRequest
);

// GET /api/v1/friends/requests - Get friend requests
router.get('/requests', friendController.getFriendRequests);

// POST /api/v1/friends/requests/:id/accept - Accept friend request
router.post('/requests/:id/accept', friendController.acceptFriendRequest);

// POST /api/v1/friends/requests/:id/reject - Reject friend request
router.post('/requests/:id/reject', friendController.rejectFriendRequest);

// DELETE /api/v1/friends/:id - Remove friend
router.delete('/:id', friendController.removeFriend);

export default router;
