// backend/src/routes/auth.routes.ts

import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { authRateLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';
import { firebaseIdTokenSchema } from '../utils/validators';

const router = Router();

// Login schema
const loginSchema = z.object({
  firebaseIdToken: firebaseIdTokenSchema,
});

// Refresh token schema
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// POST /api/v1/auth/login - Login or register with Firebase token
router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  authController.login
);

// POST /api/v1/auth/refresh - Refresh access token
router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

// POST /api/v1/auth/logout - Logout (requires authentication)
router.post(
  '/logout',
  authenticate,
  authController.logout
);

// DELETE /api/v1/auth/account - Delete account (requires authentication)
router.delete(
  '/account',
  authenticate,
  authController.deleteAccount
);

export default router;
