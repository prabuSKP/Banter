// backend/src/services/room.service.ts

import prisma from '../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import logger from '../config/logger';
import env from '../config/env';

export class RoomService {
  // Create room
  async createRoom(
    creatorId: string,
    data: {
      name: string;
      description?: string;
      isPublic: boolean;
      maxMembers?: number;
    }
  ) {
    try {
      const { name, description, isPublic, maxMembers } = data;

      const room = await prisma.chatRoom.create({
        data: {
          name,
          description,
          isPublic,
          maxMembers: maxMembers || parseInt(env.MAX_ROOM_MEMBERS),
          createdById: creatorId,
          members: {
            create: {
              userId: creatorId,
            },
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { members: true },
          },
        },
      });

      logger.info(`Room created: ${room.id} by ${creatorId}`);

      return {
        ...room,
        memberCount: room._count.members,
      };
    } catch (error) {
      logger.error('Create room error:', error);
      throw error;
    }
  }

  // Get public rooms
  async getPublicRooms(page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const rooms = await prisma.chatRoom.findMany({
        where: {
          isPublic: true,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { members: true },
          },
        },
        orderBy: [
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      });

      const total = await prisma.chatRoom.count({
        where: { isPublic: true },
      });

      return {
        rooms: rooms.map(room => ({
          ...room,
          memberCount: room._count.members,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get public rooms error:', error);
      throw error;
    }
  }

  // Get room by ID
  async getRoomById(roomId: string, userId?: string) {
    try {
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: {
          createdBy: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  avatarUrl: true,
                  isOnline: true,
                },
              },
            },
          },
        },
      });

      if (!room) {
        throw new NotFoundError('Room not found');
      }

      // Check if user has access
      if (!room.isPublic && userId) {
        const isMember = room.members.some(m => m.userId === userId);
        if (!isMember) {
          throw new ForbiddenError('Access denied to this private room');
        }
      }

      return {
        ...room,
        memberCount: room.members.length,
      };
    } catch (error) {
      logger.error('Get room error:', error);
      throw error;
    }
  }

  // Join room
  async joinRoom(roomId: string, userId: string) {
    try {
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: {
          _count: {
            select: { members: true },
          },
        },
      });

      if (!room) {
        throw new NotFoundError('Room not found');
      }

      // Check if already member
      const existingMember = await prisma.chatRoomMember.findFirst({
        where: {
          roomId,
          userId,
        },
      });

      if (existingMember) {
        throw new BadRequestError('Already a member of this room');
      }

      // Check room capacity
      if (room._count.members >= room.maxMembers) {
        throw new BadRequestError('Room is full');
      }

      // Check if room is public
      if (!room.isPublic) {
        throw new ForbiddenError('Cannot join private room without invitation');
      }

      // Add member
      const membership = await prisma.chatRoomMember.create({
        data: {
          roomId,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      logger.info(`User ${userId} joined room ${roomId}`);

      return membership;
    } catch (error) {
      logger.error('Join room error:', error);
      throw error;
    }
  }

  // Leave room
  async leaveRoom(roomId: string, userId: string) {
    try {
      const membership = await prisma.chatRoomMember.findFirst({
        where: {
          roomId,
          userId,
        },
      });

      if (!membership) {
        throw new NotFoundError('Not a member of this room');
      }

      // Check if creator
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
      });

      if (room?.createdById === userId) {
        // If creator leaves, delete the room
        await prisma.chatRoom.delete({
          where: { id: roomId },
        });
        logger.info(`Room ${roomId} deleted as creator left`);
      } else {
        // Remove membership
        await prisma.chatRoomMember.delete({
          where: { id: membership.id },
        });
        logger.info(`User ${userId} left room ${roomId}`);
      }

      return { message: 'Left room successfully' };
    } catch (error) {
      logger.error('Leave room error:', error);
      throw error;
    }
  }

  // Get user's rooms
  async getUserRooms(userId: string) {
    try {
      const memberships = await prisma.chatRoomMember.findMany({
        where: { userId },
        include: {
          room: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
              _count: {
                select: { members: true },
              },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });

      return memberships.map(m => ({
        ...m.room,
        memberCount: m.room._count.members,
        joinedAt: m.joinedAt,
      }));
    } catch (error) {
      logger.error('Get user rooms error:', error);
      throw error;
    }
  }

  // Update room
  async updateRoom(
    roomId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      isPublic?: boolean;
      maxMembers?: number;
    }
  ) {
    try {
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        throw new NotFoundError('Room not found');
      }

      if (room.createdById !== userId) {
        throw new ForbiddenError('Only room creator can update room');
      }

      const updatedRoom = await prisma.chatRoom.update({
        where: { id: roomId },
        data,
        include: {
          createdBy: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { members: true },
          },
        },
      });

      logger.info(`Room updated: ${roomId}`);

      return {
        ...updatedRoom,
        memberCount: updatedRoom._count.members,
      };
    } catch (error) {
      logger.error('Update room error:', error);
      throw error;
    }
  }

  // Delete room
  async deleteRoom(roomId: string, userId: string) {
    try {
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        throw new NotFoundError('Room not found');
      }

      if (room.createdById !== userId) {
        throw new ForbiddenError('Only room creator can delete room');
      }

      await prisma.chatRoom.delete({
        where: { id: roomId },
      });

      logger.info(`Room deleted: ${roomId} by ${userId}`);

      return { message: 'Room deleted successfully' };
    } catch (error) {
      logger.error('Delete room error:', error);
      throw error;
    }
  }

  // Search rooms
  async searchRooms(query: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const rooms = await prisma.chatRoom.findMany({
        where: {
          AND: [
            { isPublic: true },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
          ],
        },
        include: {
          createdBy: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { members: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.chatRoom.count({
        where: {
          AND: [
            { isPublic: true },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
          ],
        },
      });

      return {
        rooms: rooms.map(room => ({
          ...room,
          memberCount: room._count.members,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Search rooms error:', error);
      throw error;
    }
  }
}

export default new RoomService();
