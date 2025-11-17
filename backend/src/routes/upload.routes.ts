// backend/src/routes/upload.routes.ts

import { Router } from 'express';
import { z } from 'zod';
import uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { avatarUpload, upload } from '../middleware/upload';
import { validateBody, validateQuery } from '../middleware/validation';

const router = Router();

// Validation schemas
const deleteFileSchema = z.object({
  fileUrl: z.string().url('Invalid file URL'),
});

const fileInfoSchema = z.object({
  fileUrl: z.string().url('Invalid file URL'),
});

// All upload routes require authentication
router.use(authenticate);

// POST /api/v1/upload/avatar - Upload avatar
router.post(
  '/avatar',
  avatarUpload.single('avatar'),
  uploadController.uploadAvatar
);

// POST /api/v1/upload/media - Upload message media
router.post(
  '/media',
  upload.single('file'),
  uploadController.uploadMedia
);

// DELETE /api/v1/upload/file - Delete file
router.delete(
  '/file',
  validateBody(deleteFileSchema),
  uploadController.deleteFile
);

// GET /api/v1/upload/file-info - Get file info
router.get(
  '/file-info',
  validateQuery(fileInfoSchema),
  uploadController.getFileInfo
);

export default router;
