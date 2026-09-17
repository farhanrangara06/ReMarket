import { v2 as cloudinary } from 'cloudinary';
import { isProduction } from './env.js';

export const isCloudinaryEnabled = () =>
  !!(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim()
  );

export const configureCloudinary = () => {
  if (!isCloudinaryEnabled()) return false;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return true;
};

export const getStorageMode = () => (isCloudinaryEnabled() ? 'cloudinary' : 'local');

export const logStorageMode = () => {
  const mode = getStorageMode();
  if (mode === 'cloudinary') {
    console.log(`Image storage: Cloudinary (${process.env.CLOUDINARY_CLOUD_NAME})`);
  } else {
    console.log('Image storage: Local (server/uploads/)');
    if (isProduction()) {
      console.warn(
        'WARNING: Production is using local file storage. Set CLOUDINARY_* env vars for cloud hosting.'
      );
    }
  }
};

export { cloudinary };
