// backend/src/app.ts

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import env from './config/env';
import logger from './config/logger';

const app: Application = express();

// ==================== MIDDLEWARE ====================

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API server
  crossOriginEmbedderPolicy: false,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
const corsOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

app.get(`/api/${env.API_VERSION}/health`, (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// ==================== ROUTES ====================

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import friendRoutes from './routes/friend.routes';
import messageRoutes from './routes/message.routes';
import callRoutes from './routes/call.routes';
import roomRoutes from './routes/room.routes';
import uploadRoutes from './routes/upload.routes';
import paymentRoutes from './routes/payment.routes';
import walletRoutes from './routes/wallet.routes';
import reportRoutes from './routes/report.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import hostRoutes from './routes/host.routes';

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/users`, userRoutes);
app.use(`/api/${env.API_VERSION}/friends`, friendRoutes);
app.use(`/api/${env.API_VERSION}/messages`, messageRoutes);
app.use(`/api/${env.API_VERSION}/calls`, callRoutes);
app.use(`/api/${env.API_VERSION}/rooms`, roomRoutes);
app.use(`/api/${env.API_VERSION}/upload`, uploadRoutes);
app.use(`/api/${env.API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${env.API_VERSION}/wallet`, walletRoutes);
app.use(`/api/${env.API_VERSION}/reports`, reportRoutes);
app.use(`/api/${env.API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${env.API_VERSION}/admin`, adminRoutes);
app.use(`/api/${env.API_VERSION}/host`, hostRoutes);

// ==================== 404 HANDLER ====================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// ==================== ERROR HANDLER ====================

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

export default app;
