/**
 * Environment validation and helpers.
 * Fails fast on startup if required production variables are missing.
 */
const REQUIRED = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];

const PRODUCTION_REQUIRED = [...REQUIRED];

export const isProduction = () => process.env.NODE_ENV === 'production';

export const isDevelopment = () => !isProduction();

export const getClientUrls = () =>
  (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

export const validateEnv = () => {
  const required = isProduction() ? PRODUCTION_REQUIRED : REQUIRED;
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (isProduction() && process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET must be at least 32 characters in production');
    process.exit(1);
  }

  if (isDevelopment()) {
    console.log('Environment validated (development mode)');
  } else {
    console.log('Environment validated (production mode)');
  }
};
