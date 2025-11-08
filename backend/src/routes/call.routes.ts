// backend/src/routes/call.routes.ts

import { Router } from 'express';
import callController from '../controllers/call.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { callInitiateSchema } from '../utils/validators';
import { z } from 'zod';

const router = Router();

// All call routes require authentication
router.use(authenticate);

// Call status update schema
const callStatusSchema = z.object({
  status: z.enum(['completed', 'rejected', 'missed']),
  duration: z.number().optional(),
});

// POST /api/v1/calls/initiate - Initiate call
router.post(
  '/initiate',
  validateBody(callInitiateSchema),
  callController.initiateCall
);

// POST /api/v1/calls/:id/status - Update call status
router.post(
  '/:id/status',
  validateBody(callStatusSchema),
  callController.updateCallStatus
);

// GET /api/v1/calls/logs - Get call history
router.get('/logs', callController.getCallLogs);

// GET /api/v1/calls/livekit-token - Get LiveKit token for room
router.get('/livekit-token', callController.getLivekitToken);

// GET /api/v1/calls/stats - Get call statistics
router.get('/stats', callController.getCallStats);

export default router;
