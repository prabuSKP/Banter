// backend/src/socket/helpers.ts

import { Server as SocketIOServer } from 'socket.io';
import logger from '../config/logger';

/**
 * Socket helper class for managing user connections and utilities
 */
export class SocketHelper {
  private userConnections = new Map<string, string>(); // userId -> socketId

  /**
   * Add a user connection
   */
  addConnection(userId: string, socketId: string): void {
    this.userConnections.set(userId, socketId);
    logger.debug(`Socket connection added: ${userId} -> ${socketId}`);
  }

  /**
   * Remove a user connection
   */
  removeConnection(userId: string): void {
    this.userConnections.delete(userId);
    logger.debug(`Socket connection removed: ${userId}`);
  }

  /**
   * Get socket ID for a user
   */
  getUserSocketId(userId: string): string | undefined {
    return this.userConnections.get(userId);
  }

  /**
   * Check if user is online (has active socket connection)
   */
  isUserOnline(userId: string): boolean {
    return this.userConnections.has(userId);
  }

  /**
   * Get all connected user IDs
   */
  getOnlineUsers(): string[] {
    return Array.from(this.userConnections.keys());
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.userConnections.size;
  }

  /**
   * Emit event to specific user
   */
  emitToUser(io: SocketIOServer, userId: string, event: string, data: any): boolean {
    const socketId = this.getUserSocketId(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
      logger.debug(`Emitted ${event} to user ${userId}`);
      return true;
    }
    logger.debug(`Failed to emit ${event} to user ${userId} - user offline`);
    return false;
  }

  /**
   * Emit event to multiple users
   */
  emitToUsers(io: SocketIOServer, userIds: string[], event: string, data: any): number {
    let successCount = 0;
    userIds.forEach(userId => {
      if (this.emitToUser(io, userId, event, data)) {
        successCount++;
      }
    });
    return successCount;
  }
}

// Export singleton instance
export const socketHelper = new SocketHelper();
