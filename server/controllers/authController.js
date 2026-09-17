import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { isValidEmail, isValidPhone, validatePassword } from '../utils/validators.js';
import { isDevelopment } from '../config/env.js';
import {
  createAuthSession,
  refreshAuthSession,
  logoutSession,
  revokeAllUserTokens,
} from '../services/authTokenService.js';
import { COOKIE_NAMES } from '../utils/cookieUtils.js';
import { resolveImageUrl } from '../services/imageService.js';
import { isEmailEnabled, sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import {
  setEmailVerificationToken,
  setPasswordResetToken,
  clearEmailVerificationToken,
  clearPasswordResetToken,
  findUserByEmailToken,
  findUserByResetToken,
} from '../services/userTokenService.js';

const formatUserResponse = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationExpire;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;
  userObj.profileImage = resolveImageUrl(userObj.profileImage, 'profiles');
  return userObj;
};

const sendAuthResponse = async (res, user, statusCode, message, req) => {
  await createAuthSession(user._id, res, req);

  const payload = { user: formatUserResponse(user) };

  if (isDevelopment()) {
    payload.note = 'Auth tokens are set via httpOnly cookies';
  }

  sendSuccess(res, statusCode, message, payload);
};

const ensureEmailVerifiedForLogin = (user) => {
  if (isEmailEnabled() && !user.isEmailVerified) {
    throw new AppError('Please verify your email before logging in. Check your inbox or request a new link.', 403);
  }
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, phone, city } = req.body;

  if (!name?.trim()) throw new AppError('Name is required', 400);
  if (!email?.trim()) throw new AppError('Email is required', 400);
  if (!isValidEmail(email)) throw new AppError('Please provide a valid email', 400);
  if (!password) throw new AppError('Password is required', 400);
  validatePassword(password);
  if (password !== confirmPassword) throw new AppError('Passwords do not match', 400);
  if (!phone?.trim()) throw new AppError('Phone number is required', 400);
  if (!isValidPhone(phone)) throw new AppError('Please provide a valid 10-digit phone number', 400);
  if (!city?.trim()) throw new AppError('City is required', 400);

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new AppError('Email already registered', 409);

  const emailEnabled = isEmailEnabled();

  const userData = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone.replace(/\s/g, ''),
    city: city.trim(),
    isEmailVerified: !emailEnabled,
  };

  if (req.uploadedFile) {
    userData.profileImage = req.uploadedFile;
  }

  const user = await User.create(userData);

  if (emailEnabled) {
    const token = setEmailVerificationToken(user);
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(user, token);

    return sendSuccess(res, 201, 'Registration successful. Please check your email to verify your account.', {
      email: user.email,
      requiresVerification: true,
    });
  }

  await sendAuthResponse(res, user, 201, 'Registration successful', req);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim()) throw new AppError('Email is required', 400);
  if (!password) throw new AppError('Password is required', 400);

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been blocked. Contact admin', 403);
  }

  ensureEmailVerifiedForLogin(user);

  await revokeAllUserTokens(user._id);
  await sendAuthResponse(res, user, 200, 'Login successful', req);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token?.trim()) throw new AppError('Verification token is required', 400);

  const user = await findUserByEmailToken(User, token);

  if (!user) {
    throw new AppError('Invalid or expired verification link', 400);
  }

  user.isEmailVerified = true;
  clearEmailVerificationToken(user);
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 200, 'Email verified successfully. You can now log in.', {
    email: user.email,
  });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) throw new AppError('Email is required', 400);
  if (!isValidEmail(email)) throw new AppError('Please provide a valid email', 400);

  if (!isEmailEnabled()) {
    throw new AppError('Email verification is not enabled', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return sendSuccess(res, 200, 'If an account exists with that email, a verification link has been sent.');
  }

  if (user.isEmailVerified) {
    throw new AppError('This email is already verified', 400);
  }

  const token = setEmailVerificationToken(user);
  await user.save({ validateBeforeSave: false });
  await sendVerificationEmail(user, token);

  sendSuccess(res, 200, 'Verification email sent. Please check your inbox.');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) throw new AppError('Email is required', 400);
  if (!isValidEmail(email)) throw new AppError('Please provide a valid email', 400);

  if (!isEmailEnabled()) {
    throw new AppError('Password reset is not available. Contact support.', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return sendSuccess(res, 200, 'If an account exists with that email, a password reset link has been sent.');
  }

  const token = setPasswordResetToken(user);
  await user.save({ validateBeforeSave: false });
  await sendPasswordResetEmail(user, token);

  sendSuccess(res, 200, 'If an account exists with that email, a password reset link has been sent.');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token?.trim()) throw new AppError('Reset token is required', 400);
  if (!password) throw new AppError('Password is required', 400);
  validatePassword(password);
  if (password !== confirmPassword) throw new AppError('Passwords do not match', 400);

  const user = await findUserByResetToken(User, token);

  if (!user) {
    throw new AppError('Invalid or expired reset link', 400);
  }

  user.password = password;
  clearPasswordResetToken(user);
  await user.save();

  await revokeAllUserTokens(user._id);

  sendSuccess(res, 200, 'Password reset successful. You can now log in with your new password.');
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[COOKIE_NAMES.REFRESH_COOKIE];

  const { user } = await refreshAuthSession(refreshToken, res, req);

  sendSuccess(res, 200, 'Token refreshed successfully', {
    user: formatUserResponse(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'User fetched successfully', {
    user: formatUserResponse(req.user),
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[COOKIE_NAMES.REFRESH_COOKIE];
  await logoutSession(refreshToken, res);
  sendSuccess(res, 200, 'Logged out successfully');
});

export const logoutAll = asyncHandler(async (req, res) => {
  await revokeAllUserTokens(req.user._id);
  await logoutSession(req.cookies?.[COOKIE_NAMES.REFRESH_COOKIE], res);
  sendSuccess(res, 200, 'Logged out from all devices');
});
