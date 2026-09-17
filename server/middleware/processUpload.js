import asyncHandler from '../utils/asyncHandler.js';
import { uploadFiles, uploadSingleFile } from '../services/imageService.js';

/**
 * After Multer runs, upload buffers to Cloudinary (if enabled)
 * and attach normalized references on the request object.
 */
export const processProductUploads = asyncHandler(async (req, res, next) => {
  if (req.files?.length) {
    req.uploadedImages = await uploadFiles(req.files, 'products');
  }
  next();
});

export const processProfileUpload = asyncHandler(async (req, res, next) => {
  if (req.file) {
    req.uploadedFile = await uploadSingleFile(req.file, 'profiles');
  }
  next();
});
