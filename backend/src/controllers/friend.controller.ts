// backend/src/controllers/friend.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import friendService from '../services/friend.service';

export class FriendController {
  // GET /api/v1/friends
  async getFriends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = req.query as any;

      const result = await friendService.getFriends(
        userId,
        parseInt(page) || 1,
        parseInt(limit) || 50
      );

      res.status(200).json({
        success: true,
        data: result.friends,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/friends/request
  async sendFriendRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const senderId = req.user!.id;
      const { receiverId } = req.body;

      const friendRequest = await friendService.sendFriendRequest(senderId, receiverId);

      res.status(201).json({
        success: true,
        message: 'Friend request sent',
        data: friendRequest,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/friends/requests
  async getFriendRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const requests = await friendService.getFriendRequests(userId);

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/friends/requests/:id/accept
  async acceptFriendRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const friendship = await friendService.acceptFriendRequest(id, userId);

      res.status(200).json({
        success: true,
        message: 'Friend request accepted',
        data: friendship,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/friends/requests/:id/reject
  async rejectFriendRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await friendService.rejectFriendRequest(id, userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/friends/:id
  async removeFriend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id: friendId } = req.params;

      const result = await friendService.removeFriend(userId, friendId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FriendController();
