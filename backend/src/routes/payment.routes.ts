// backend/src/routes/payment.routes.ts

import { Router } from 'express';
import paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { paymentCreateSchema } from '../utils/validators';
import { z } from 'zod';

const router = Router();

// Payment verification schema
const paymentVerifySchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

// POST /api/v1/payments/webhook - Razorpay webhook (no auth)
router.post('/webhook', paymentController.handleWebhook);

// All other payment routes require authentication
router.use(authenticate);

// POST /api/v1/payments/order - Create order
router.post(
  '/order',
  validateBody(paymentCreateSchema),
  paymentController.createOrder
);

// POST /api/v1/payments/verify - Verify payment
router.post(
  '/verify',
  validateBody(paymentVerifySchema),
  paymentController.verifyPayment
);

// GET /api/v1/payments/transactions - Get transaction history
router.get('/transactions', paymentController.getTransactions);

// GET /api/v1/payments/subscription - Get active subscription
router.get('/subscription', paymentController.getSubscription);

// POST /api/v1/payments/subscription/cancel - Cancel subscription
router.post('/subscription/cancel', paymentController.cancelSubscription);

export default router;
