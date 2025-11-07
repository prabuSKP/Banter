// backend/src/routes/message.routes.ts

import { Router } from 'express';
import messageController from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { messageSchema } from '../utils/validators';
import { z } from 'zod';

const router = Router();

// All message routes require authentication
router.use(authenticate);

// Mark as read schema
const markAsReadSchema = z.object({
  messageIds: z.array(z.string().uuid()),
});

// POST /api/v1/messages - Send message
router.post(
  '/',
  validateBody(messageSchema),
  messageController.sendMessage
);

// GET /api/v1/messages/conversations - Get recent conversations
router.get('/conversations', messageController.getRecentConversations);

// GET /api/v1/messages/unread/count - Get unread message count
router.get('/unread/count', messageController.getUnreadCount);

// GET /api/v1/messages/conversation/:userId - Get conversation with user
router.get('/conversation/:userId', messageController.getConversation);

// GET /api/v1/messages/room/:roomId - Get room messages
router.get('/room/:roomId', messageController.getRoomMessages);

// POST /api/v1/messages/read - Mark messages as read
router.post(
  '/read',
  validateBody(markAsReadSchema),
  messageController.markAsRead
);

// DELETE /api/v1/messages/:id - Delete message
router.delete('/:id', messageController.deleteMessage);

export default router;
