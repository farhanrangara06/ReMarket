import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { isProduction } from '../config/env.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const generalLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: isProduction() ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: isProduction() ? 15 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

export const uploadLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: isProduction() ? 30 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many upload requests. Please try again later.',
  },
});

export const applySecurityMiddleware = (app) => {
  // Trust reverse proxy (Render, Railway, Nginx, etc.)
  if (isProduction()) {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: isProduction()
        ? {
            directives: {
              defaultSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              connectSrc: ["'self'", ...getConnectSources()],
            },
          }
        : false,
    })
  );

  app.use(compression());
  app.use(hpp());
  app.use(mongoSanitize());

  app.use('/api', generalLimiter);
};

const getConnectSources = () => {
  const urls = (process.env.CLIENT_URL || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
  return urls;
};
