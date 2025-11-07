// backend/src/controllers/user.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import userService from '../services/user.service';

export class UserController {
  // GET /api/v1/users/me
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await userService.getUserById(userId, userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/users/:id
  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requesterId = req.user?.id;

      const user = await userService.getUserById(id, requesterId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/users/me
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await userService.updateProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/users/me/avatar
  async updateAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { avatarUrl } = req.body;

      const user = await userService.updateAvatar(userId, avatarUrl);

      res.status(200).json({
        success: true,
        message: 'Avatar updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/users/search
  async searchUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q, page, limit } = req.query as any;
      const userId = req.user!.id;

      const result = await userService.searchUsers(
        q || '',
        userId,
        parseInt(page) || 1,
        parseInt(limit) || 20
      );

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/users/:id/block
  async blockUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const blockerId = req.user!.id;
      const { id: blockedId } = req.params;

      const result = await userService.blockUser(blockerId, blockedId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/users/:id/block
  async unblockUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const blockerId = req.user!.id;
      const { id: blockedId } = req.params;

      const result = await userService.unblockUser(blockerId, blockedId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/users/blocked
  async getBlockedUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const blockedUsers = await userService.getBlockedUsers(userId);

      res.status(200).json({
        success: true,
        data: blockedUsers,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
