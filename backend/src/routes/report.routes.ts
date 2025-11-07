// backend/src/routes/report.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import reportController from '../controllers/report.controller';
import { z } from 'zod';
import { validateRequest } from '../middleware/validator';

const router = Router();

// Validation schemas
const submitReportSchema = z.object({
  body: z.object({
    reportedUserId: z.string().uuid(),
    reportType: z.enum(['user', 'message', 'room']),
    reason: z.enum(['harassment', 'spam', 'inappropriate', 'fake', 'other']),
    description: z.string().min(10).max(500).optional(),
  }),
});

const updateReportStatusSchema = z.object({
  body: z.object({
    status: z.enum(['reviewed', 'action_taken', 'dismissed']),
    notes: z.string().max(500).optional(),
  }),
});

// User routes
router.post(
  '/',
  authenticate,
  validateRequest(submitReportSchema),
  reportController.submitReport
);

router.get(
  '/my-reports',
  authenticate,
  reportController.getMyReports
);

router.delete(
  '/:id',
  authenticate,
  reportController.deleteReport
);

// Admin routes (TODO: Add admin middleware)
router.get(
  '/pending',
  authenticate,
  reportController.getPendingReports
);

router.get(
  '/against/:userId',
  authenticate,
  reportController.getReportsAgainstUser
);

router.patch(
  '/:id/status',
  authenticate,
  validateRequest(updateReportStatusSchema),
  reportController.updateReportStatus
);

router.get(
  '/statistics',
  authenticate,
  reportController.getStatistics
);

export default router;
