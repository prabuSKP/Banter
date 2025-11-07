// backend/src/routes/wallet.routes.ts

import { Router } from 'express';
import walletController from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// All wallet routes require authentication
router.use(authenticate);

// Transfer coins schema
const transferCoinsSchema = z.object({
  toUserId: z.string().uuid('Invalid user ID'),
  amount: z.number().int().positive('Amount must be positive'),
  message: z.string().max(200).optional(),
});

// Charge call schema
const chargeCallSchema = z.object({
  callId: z.string().uuid('Invalid call ID'),
  callType: z.enum(['audio', 'video']),
  duration: z.number().int().positive('Duration must be positive'),
});

// GET /api/v1/wallet/balance - Get wallet balance
router.get('/balance', walletController.getBalance);

// GET /api/v1/wallet/transactions - Get transaction history
router.get('/transactions', walletController.getTransactionHistory);

// GET /api/v1/wallet/packages - Get recharge packages
router.get('/packages', walletController.getRechargePackages);

// GET /api/v1/wallet/statistics - Get coin statistics
router.get('/statistics', walletController.getCoinStatistics);

// POST /api/v1/wallet/transfer - Transfer coins to another user
router.post(
  '/transfer',
  validateBody(transferCoinsSchema),
  walletController.transferCoins
);

// POST /api/v1/wallet/charge-call - Charge for call
router.post(
  '/charge-call',
  validateBody(chargeCallSchema),
  walletController.chargeForCall
);

export default router;
