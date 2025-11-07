// backend/src/server.ts

import http from 'http';
import app from './app';
import env from './config/env';
import logger from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import redis from './config/redis';
import { Server as SocketIOServer } from 'socket.io';
import { initializeSocket } from './socket';

const server = http.createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialize Socket.IO with authentication and event handlers
initializeSocket(io);

// Export io for use in other modules
export { io };

// ==================== SERVER STARTUP ====================

const PORT = parseInt(env.PORT);

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Test Redis connection
    await redis.ping();

    // Start server
    server.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════════╗
║   🚀 Banter Backend Server Started    ║
╠════════════════════════════════════════╣
║  Environment: ${env.NODE_ENV.padEnd(24)}║
║  Port: ${PORT.toString().padEnd(31)}║
║  API Version: ${env.API_VERSION.padEnd(24)}║
║  Database: Connected ✅               ║
║  Redis: Connected ✅                  ║
║  Socket.IO: Ready ✅                  ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ==================== GRACEFUL SHUTDOWN ====================

const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await disconnectDatabase();
      await redis.quit();
      logger.info('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();
