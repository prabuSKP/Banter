// backend/src/routes/admin.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { isAdmin, isStrictAdmin } from '../middleware/admin';
import adminController from '../controllers/admin.controller';
import reportController from '../controllers/report.controller';
import { z } from 'zod';
import { validateRequest } from '../middleware/validator';

const router = Router();

// All admin routes require authentication + admin/moderator role
router.use(authenticate);

// Validation schemas
const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(['user', 'admin', 'moderator']),
  }),
});

const toggleStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
    reason: z.string().optional(),
  }),
});

const adjustCoinsSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    action: z.enum(['add', 'deduct']),
    reason: z.string().optional(),
  }),
});

const deleteUserSchema = z.object({
  body: z.object({
    confirmDelete: z.boolean(),
  }),
});

// ==================== DASHBOARD & ANALYTICS ====================

// Dashboard overview (admin or moderator)
router.get(
  '/dashboard',
  isAdmin,
  adminController.getDashboard
);

// System analytics (admin or moderator)
router.get(
  '/analytics',
  isAdmin,
  adminController.getAnalytics
);

// System health info (admin only)
router.get(
  '/system',
  isStrictAdmin,
  adminController.getSystemInfo
);

// ==================== USER MANAGEMENT ====================

// Get all users with filters (admin or moderator)
router.get(
  '/users',
  isAdmin,
  adminController.getUsers
);

// Update user role (admin only)
router.patch(
  '/users/:userId/role',
  isStrictAdmin,
  validateRequest(updateRoleSchema),
  adminController.updateUserRole
);

// Suspend/activate user (admin or moderator)
router.patch(
  '/users/:userId/status',
  isAdmin,
  validateRequest(toggleStatusSchema),
  adminController.toggleUserStatus
);

// Adjust user coins (admin only)
router.post(
  '/users/:userId/coins',
  isStrictAdmin,
  validateRequest(adjustCoinsSchema),
  adminController.adjustUserCoins
);

// Delete user permanently (admin only - dangerous!)
router.delete(
  '/users/:userId',
  isStrictAdmin,
  validateRequest(deleteUserSchema),
  adminController.deleteUser
);

// ==================== REPORTS & MODERATION ====================

// Get pending reports (admin or moderator)
router.get(
  '/reports/pending',
  isAdmin,
  reportController.getPendingReports
);

// Get reports against specific user (admin or moderator)
router.get(
  '/reports/against/:userId',
  isAdmin,
  reportController.getReportsAgainstUser
);

// Update report status (admin or moderator)
router.patch(
  '/reports/:id/status',
  isAdmin,
  reportController.updateReportStatus
);

// Get report statistics (admin or moderator)
router.get(
  '/reports/statistics',
  isAdmin,
  reportController.getStatistics
);

// ==================== EXPORT ====================

// Export data to CSV (admin only)
router.get(
  '/export/:type',
  isStrictAdmin,
  adminController.exportData
);

// ==================== BULK OPERATIONS ====================

const bulkSuspendSchema = z.object({
  body: z.object({
    userIds: z.array(z.string().uuid()),
    reason: z.string().optional(),
  }),
});

const bulkActivateSchema = z.object({
  body: z.object({
    userIds: z.array(z.string().uuid()),
  }),
});

// Bulk suspend users (admin only)
router.post(
  '/bulk/suspend',
  isStrictAdmin,
  validateRequest(bulkSuspendSchema),
  adminController.bulkSuspendUsers
);

// Bulk activate users (admin only)
router.post(
  '/bulk/activate',
  isStrictAdmin,
  validateRequest(bulkActivateSchema),
  adminController.bulkActivateUsers
);

export default router;
