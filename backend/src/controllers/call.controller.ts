// backend/src/controllers/call.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import callService from '../services/call.service';

export class CallController {
  // POST /api/v1/calls/initiate
  async initiateCall(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const callerId = req.user!.id;
      const { receiverId, callType } = req.body;

      const callData = await callService.initiateCall(
        callerId,
        receiverId,
        callType
      );

      res.status(200).json({
        success: true,
        message: 'Call initiated',
        data: callData,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/calls/:id/status
  async updateCallStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: callId } = req.params;
      const { status, duration } = req.body;
      const userId = req.user!.id;

      await callService.updateCallStatus(callId, status, duration, userId);

      res.status(200).json({
        success: true,
        message: 'Call status updated',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/calls/logs
  async getCallLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = req.query as any;

      const result = await callService.getCallLogs(
        userId,
        parseInt(page) || 1,
        parseInt(limit) || 50
      );

      res.status(200).json({
        success: true,
        data: result.calls,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/calls/agora-token
  async getAgoraToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { roomId } = req.query as any;

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'roomId is required',
        });
      }

      const tokenData = await callService.getAgoraTokenForRoom(userId, roomId);

      res.status(200).json({
        success: true,
        data: tokenData,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/calls/stats
  async getCallStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const stats = await callService.getCallStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CallController();
