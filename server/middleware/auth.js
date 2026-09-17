import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';
import { COOKIE_NAMES } from '../utils/cookieUtils.js';

const getTokenFromRequest = (req) => {
  if (req.cookies?.[COOKIE_NAMES.ACCESS_COOKIE]) {
    return req.cookies[COOKIE_NAMES.ACCESS_COOKIE];
  }
  if (req.headers.authorization?.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new AppError('Not authorized. Please login', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new AppError('User not found. Please login again', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been blocked. Contact admin', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Access token expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401);
    }
    throw error;
  }
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Not authorized', 401);
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    next();
  };
};
