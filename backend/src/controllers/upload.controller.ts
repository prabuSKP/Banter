// backend/src/controllers/upload.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import uploadService from '../services/upload.service';
import userService from '../services/user.service';

export class UploadController {
  // POST /api/v1/upload/avatar
  async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // Upload to Azure Blob
      const fileUrl = await uploadService.uploadAvatar(req.file, userId);

      // Update user avatar in database
      await userService.updateAvatar(userId, fileUrl);

      res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          url: fileUrl,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  // POST /api/v1/upload/media
  async uploadMedia(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // Upload to Azure Blob
      const fileUrl = await uploadService.uploadMessageMedia(req.file);

      res.status(200).json({
        success: true,
        message: 'Media uploaded successfully',
        data: {
          url: fileUrl,
          type: req.file.mimetype,
          size: req.file.size,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  // DELETE /api/v1/upload/file
  async deleteFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'File URL is required',
        });
      }

      await uploadService.deleteFile(url);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // GET /api/v1/upload/file-info
  async getFileInfo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { url } = req.query as any;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'File URL is required',
        });
      }

      const fileInfo = await uploadService.getFileInfo(url);

      res.status(200).json({
        success: true,
        data: fileInfo,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new UploadController();
