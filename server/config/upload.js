import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import AppError from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsDir = path.join(__dirname, '..', 'uploads');

const dirs = ['products', 'profiles'];
dirs.forEach((dir) => {
  const fullPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed', 400), false);
  }
};

// Always buffer in memory — imageService writes to disk or Cloudinary
const memoryStorage = multer.memoryStorage();

export const uploadProductImages = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
  fileFilter,
}).array('images', 5);

export const uploadProfileImage = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter,
}).single('profileImage');

export const getImageUrl = (filename, subfolder = 'products') => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  return `/uploads/${subfolder}/${filename}`;
};

export const deleteFile = (filepath) => {
  try {
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (err) {
    console.error('Error deleting file:', err.message);
  }
};

export const saveBufferToDisk = (file, subfolder) => {
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const filename = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const dest = path.join(uploadsDir, subfolder, filename);
  fs.writeFileSync(dest, file.buffer);
  return filename;
};
