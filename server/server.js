import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import path from 'path';

import { fileURLToPath } from 'url';

import { validateEnv, isProduction } from './config/env.js';
import { configureCloudinary, logStorageMode } from './config/cloudinary.js';
import { logEmailMode } from './config/email.js';
import { isEmailEnabled } from './services/emailService.js';

import corsMiddleware from './config/cors.js';

import connectDB, { getDBStatus } from './config/db.js';

import { applySecurityMiddleware } from './middleware/security.js';

import errorHandler from './middleware/errorHandler.js';

import notFound from './middleware/notFound.js';

import requestLogger from './middleware/requestLogger.js';

import asyncHandler from './utils/asyncHandler.js';

import { setupGracefulShutdown } from './utils/gracefulShutdown.js';

import authRoutes from './routes/authRoutes.js';

import productRoutes from './routes/productRoutes.js';

import wishlistRoutes from './routes/wishlistRoutes.js';

import requestRoutes from './routes/requestRoutes.js';

import notificationRoutes from './routes/notificationRoutes.js';

import userRoutes from './routes/userRoutes.js';

import adminRoutes from './routes/adminRoutes.js';



dotenv.config();

validateEnv();
configureCloudinary();
logStorageMode();
logEmailMode();



const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);



const app = express();

const startTime = Date.now();



connectDB();



applySecurityMiddleware(app);



app.use(corsMiddleware);
app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));



if (!isProduction()) {

  app.use(requestLogger);

}



app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {

  maxAge: isProduction() ? '7d' : 0,

  etag: true,

}));



app.get('/api/health', asyncHandler(async (req, res) => {

  const dbStatus = getDBStatus();

  const healthy = dbStatus === 'connected';



  res.status(healthy ? 200 : 503).json({

    success: healthy,

    message: healthy ? 'ReMarket API is running' : 'Database unavailable',

    environment: process.env.NODE_ENV || 'development',

    storage: process.env.CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'local',
    email: isEmailEnabled() ? 'smtp' : 'disabled',

    database: dbStatus,

    uptime: Math.floor((Date.now() - startTime) / 1000),

    timestamp: new Date().toISOString(),

  });

}));



app.use('/api/auth', authRoutes);

app.use('/api/products', productRoutes);

app.use('/api/users', userRoutes);

app.use('/api/requests', requestRoutes);

app.use('/api/wishlist', wishlistRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/admin', adminRoutes);



app.use(notFound);

app.use(errorHandler);



const PORT = process.env.PORT || 5000;



const server = app.listen(PORT, () => {

  console.log(`ReMarket Server running on port ${PORT}`);

  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  if (isProduction()) {

    console.log('Production security middleware enabled');

  }

});



setupGracefulShutdown(server);


