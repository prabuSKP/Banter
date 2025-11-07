// backend/src/routes/room.routes.ts

import { Router } from 'express';
import roomController from '../controllers/room.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { roomCreateSchema } from '../utils/validators';

const router = Router();

// All room routes require authentication
router.use(authenticate);

// POST /api/v1/rooms - Create room
router.post(
  '/',
  validateBody(roomCreateSchema),
  roomController.createRoom
);

// GET /api/v1/rooms - Get public rooms
router.get('/', roomController.getPublicRooms);

// GET /api/v1/rooms/my - Get user's rooms
router.get('/my', roomController.getMyRooms);

// GET /api/v1/rooms/search - Search rooms
router.get('/search', roomController.searchRooms);

// GET /api/v1/rooms/:id - Get room by ID
router.get('/:id', roomController.getRoomById);

// POST /api/v1/rooms/:id/join - Join room
router.post('/:id/join', roomController.joinRoom);

// POST /api/v1/rooms/:id/leave - Leave room
router.post('/:id/leave', roomController.leaveRoom);

// PUT /api/v1/rooms/:id - Update room
router.put(
  '/:id',
  validateBody(roomCreateSchema.partial()),
  roomController.updateRoom
);

// DELETE /api/v1/rooms/:id - Delete room
router.delete('/:id', roomController.deleteRoom);

export default router;
