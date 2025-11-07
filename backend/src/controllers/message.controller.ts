// backend/src/controllers/message.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import messageService from '../services/message.service';

export class MessageController {
  // POST /api/v1/messages
  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const senderId = req.user!.id;
      const message = await messageService.sendMessage(senderId, req.body);

      res.status(201).json({
        success: true,
        message: 'Message sent',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/messages/conversation/:userId
  async getConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { userId: friendId } = req.params;
      const { page, limit } = req.query as any;

      const result = await messageService.getConversation(
        userId,
        friendId,
        parseInt(page) || 1,
        parseInt(limit) || 50
      );

      res.status(200).json({
        success: true,
        data: result.messages,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/messages/room/:roomId
  async getRoomMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { roomId } = req.params;
      const { page, limit } = req.query as any;

      const result = await messageService.getRoomMessages(
        userId,
        roomId,
        parseInt(page) || 1,
        parseInt(limit) || 50
      );

      res.status(200).json({
        success: true,
        data: result.messages,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/messages/conversations
  async getRecentConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { limit } = req.query as any;

      const conversations = await messageService.getRecentConversations(
        userId,
        parseInt(limit) || 20
      );

      res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/messages/read
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { messageIds } = req.body;

      const result = await messageService.markAsRead(userId, messageIds);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/messages/:id
  async deleteMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await messageService.deleteMessage(userId, id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/messages/unread/count
  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const count = await messageService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
