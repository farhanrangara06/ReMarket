import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getDashboardStats,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { profileImageUpload } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/security.js';
import { processProfileUpload } from '../middleware/processUpload.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', uploadLimiter, profileImageUpload, processProfileUpload, updateProfile);
router.put('/change-password', changePassword);
router.get('/dashboard', getDashboardStats);

export default router;
