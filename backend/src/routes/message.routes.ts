// backend/src/routes/message.routes.ts

import { Router } from 'express';
import { z } from 'zod';
import messageController from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { messageSchema, paginationSchema } from '../utils/validators';

const router = Router();

// All message routes require authentication
router.use(authenticate);

// Validation schemas
const markAsReadSchema = z.object({
  messageIds: z.array(z.string().uuid()),
});

const messageIdParamSchema = z.object({
  id: z.string().uuid('Invalid message ID'),
});

const userIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

const roomIdParamSchema = z.object({
  roomId: z.string().uuid('Invalid room ID'),
});

// POST /api/v1/messages - Send message
router.post(
  '/',
  validateBody(messageSchema),
  messageController.sendMessage
);

// GET /api/v1/messages/conversations - Get recent conversations
router.get(
  '/conversations',
  validateQuery(paginationSchema),
  messageController.getRecentConversations
);

// GET /api/v1/messages/unread/count - Get unread message count
router.get('/unread/count', messageController.getUnreadCount);

// GET /api/v1/messages/conversation/:userId - Get conversation with user
router.get(
  '/conversation/:userId',
  validateParams(userIdParamSchema),
  validateQuery(paginationSchema),
  messageController.getConversation
);

// GET /api/v1/messages/room/:roomId - Get room messages
router.get(
  '/room/:roomId',
  validateParams(roomIdParamSchema),
  validateQuery(paginationSchema),
  messageController.getRoomMessages
);

// POST /api/v1/messages/read - Mark messages as read
router.post(
  '/read',
  validateBody(markAsReadSchema),
  messageController.markAsRead
);

// DELETE /api/v1/messages/:id - Delete message
router.delete(
  '/:id',
  validateParams(messageIdParamSchema),
  messageController.deleteMessage
);

export default router;
