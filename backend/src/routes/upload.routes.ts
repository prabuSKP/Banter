// backend/src/routes/upload.routes.ts

import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { avatarUpload, upload } from '../middleware/upload';

const router = Router();

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
router.delete('/file', uploadController.deleteFile);

// GET /api/v1/upload/file-info - Get file info
router.get('/file-info', uploadController.getFileInfo);

export default router;
