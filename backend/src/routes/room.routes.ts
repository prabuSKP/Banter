// backend/src/routes/room.routes.ts

import { Router } from 'express';
import { z } from 'zod';
import roomController from '../controllers/room.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { roomCreateSchema, paginationSchema } from '../utils/validators';

const router = Router();

// Validation schemas
const roomIdParamSchema = z.object({
  id: z.string().uuid('Invalid room ID'),
});

const roomSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
});

// All room routes require authentication
router.use(authenticate);

// POST /api/v1/rooms - Create room
router.post(
  '/',
  validateBody(roomCreateSchema),
  roomController.createRoom
);

// GET /api/v1/rooms - Get public rooms
router.get(
  '/',
  validateQuery(paginationSchema),
  roomController.getPublicRooms
);

// GET /api/v1/rooms/my - Get user's rooms
router.get(
  '/my',
  validateQuery(paginationSchema),
  roomController.getMyRooms
);

// GET /api/v1/rooms/search - Search rooms
router.get(
  '/search',
  validateQuery(roomSearchSchema),
  roomController.searchRooms
);

// GET /api/v1/rooms/:id - Get room by ID
router.get(
  '/:id',
  validateParams(roomIdParamSchema),
  roomController.getRoomById
);

// POST /api/v1/rooms/:id/join - Join room
router.post(
  '/:id/join',
  validateParams(roomIdParamSchema),
  roomController.joinRoom
);

// POST /api/v1/rooms/:id/leave - Leave room
router.post(
  '/:id/leave',
  validateParams(roomIdParamSchema),
  roomController.leaveRoom
);

// PUT /api/v1/rooms/:id - Update room
router.put(
  '/:id',
  validateParams(roomIdParamSchema),
  validateBody(roomCreateSchema.partial()),
  roomController.updateRoom
);

// DELETE /api/v1/rooms/:id - Delete room
router.delete(
  '/:id',
  validateParams(roomIdParamSchema),
  roomController.deleteRoom
);

export default router;
