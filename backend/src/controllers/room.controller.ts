// backend/src/controllers/room.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import roomService from '../services/room.service';

export class RoomController {
  // POST /api/v1/rooms
  async createRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const room = await roomService.createRoom(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/rooms
  async getPublicRooms(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query as any;

      const result = await roomService.getPublicRooms(
        parseInt(page) || 1,
        parseInt(limit) || 20
      );

      res.status(200).json({
        success: true,
        data: result.rooms,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/rooms/my
  async getMyRooms(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const rooms = await roomService.getUserRooms(userId);

      res.status(200).json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/rooms/search
  async searchRooms(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q, page, limit } = req.query as any;

      const result = await roomService.searchRooms(
        q || '',
        parseInt(page) || 1,
        parseInt(limit) || 20
      );

      res.status(200).json({
        success: true,
        data: result.rooms,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/rooms/:id
  async getRoomById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const room = await roomService.getRoomById(id, userId);

      res.status(200).json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/rooms/:id/join
  async joinRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const membership = await roomService.joinRoom(id, userId);

      res.status(200).json({
        success: true,
        message: 'Joined room successfully',
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/rooms/:id/leave
  async leaveRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await roomService.leaveRoom(id, userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/rooms/:id
  async updateRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const room = await roomService.updateRoom(id, userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Room updated successfully',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/rooms/:id
  async deleteRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await roomService.deleteRoom(id, userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RoomController();
