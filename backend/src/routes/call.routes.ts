// backend/src/routes/call.routes.ts

import { Router } from 'express';
import { z } from 'zod';
import callController from '../controllers/call.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { callInitiateSchema, paginationSchema } from '../utils/validators';

const router = Router();

// All call routes require authentication
router.use(authenticate);

// Validation schemas
const callStatusSchema = z.object({
  status: z.enum(['completed', 'rejected', 'missed']),
  duration: z.number().optional(),
});

const callIdParamSchema = z.object({
  id: z.string().uuid('Invalid call ID'),
});

const livekitTokenSchema = z.object({
  callId: z.string().uuid('Invalid call ID'),
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
  validateParams(callIdParamSchema),
  validateBody(callStatusSchema),
  callController.updateCallStatus
);

// GET /api/v1/calls/logs - Get call history
router.get(
  '/logs',
  validateQuery(paginationSchema),
  callController.getCallLogs
);

// GET /api/v1/calls/livekit-token - Get LiveKit token for room
router.get(
  '/livekit-token',
  validateQuery(livekitTokenSchema),
  callController.getLivekitToken
);

// GET /api/v1/calls/stats - Get call statistics
router.get('/stats', callController.getCallStats);

export default router;
