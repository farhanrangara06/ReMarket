import cors from 'cors';
import { getClientUrls, isDevelopment } from './env.js';

export const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getClientUrls();

    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    if (isDevelopment() && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

export default cors(corsOptions);
