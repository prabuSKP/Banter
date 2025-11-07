// backend/src/routes/host.routes.ts

import { Router } from 'express';
import { z } from 'zod';
import hostController from '../controllers/host.controller';
import { authenticate } from '../middleware/auth';
import { isStrictAdmin } from '../middleware/admin';
import { validate } from '../middleware/validate';

const router = Router();

// Validation schemas
const applyHostSchema = z.object({
  body: z.object({
    documents: z.array(z.string().url()).min(1, 'At least one document is required'),
  }),
});

const rejectHostSchema = z.object({
  body: z.object({
    reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
  }),
  params: z.object({
    userId: z.string().uuid(),
  }),
});

const approveHostSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});

const withdrawalSchema = z.object({
  body: z.object({
    amount: z.number().min(500, 'Minimum withdrawal amount is ₹500'),
    method: z.enum(['upi', 'bank_transfer', 'wallet']),
    paymentDetails: z.object({
      upiId: z.string().optional(),
      accountNumber: z.string().optional(),
      ifscCode: z.string().optional(),
      accountHolderName: z.string().optional(),
    }),
  }),
});

const rateHostSchema = z.object({
  body: z.object({
    hostId: z.string().uuid(),
    callId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    feedback: z.string().optional(),
  }),
});

const earningsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

// User routes (authenticated)
router.post(
  '/apply',
  authenticate,
  validate(applyHostSchema),
  hostController.applyAsHost
);

router.get('/dashboard', authenticate, hostController.getDashboard);

router.get(
  '/earnings',
  authenticate,
  validate(earningsQuerySchema),
  hostController.getEarningsHistory
);

router.post(
  '/withdrawal',
  authenticate,
  validate(withdrawalSchema),
  hostController.requestWithdrawal
);

router.post('/rate', authenticate, validate(rateHostSchema), hostController.rateHost);

// Admin routes
router.post(
  '/approve/:userId',
  authenticate,
  isStrictAdmin,
  validate(approveHostSchema),
  hostController.approveHost
);

router.post(
  '/reject/:userId',
  authenticate,
  isStrictAdmin,
  validate(rejectHostSchema),
  hostController.rejectHost
);

export default router;
