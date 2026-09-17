import multer from 'multer';
import { uploadProductImages, uploadProfileImage } from '../config/upload.js';
import AppError from '../utils/AppError.js';

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large. Maximum size is 5MB', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files. Maximum is 5 images', 400));
    }
    return next(new AppError(err.message, 400));
  }
  next(err);
};

export const productImageUpload = (req, res, next) => {
  uploadProductImages(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
};

export const profileImageUpload = (req, res, next) => {
  uploadProfileImage(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
};
