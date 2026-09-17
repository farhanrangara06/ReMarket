import jwt from 'jsonwebtoken';
import { isProduction } from '../config/env.js';

export const generateAccessToken = (userId) => {
  const expiresIn = process.env.JWT_EXPIRE || (isProduction() ? '15m' : '7d');
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

// Backward-compatible alias
export const generateToken = generateAccessToken;

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Legacy alias
export const verifyToken = verifyAccessToken;
