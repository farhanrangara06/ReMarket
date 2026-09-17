import express from 'express';
import {
  register,
  login,
  refresh,
  getMe,
  logout,
  logoutAll,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { profileImageUpload } from '../middleware/upload.js';
import { processProfileUpload } from '../middleware/processUpload.js';
import { authLimiter, uploadLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/register', authLimiter, uploadLimiter, profileImageUpload, processProfileUpload, register);
router.post('/login', authLimiter, login);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/refresh', authLimiter, refresh);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);

export default router;
