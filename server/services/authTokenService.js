import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { generateAccessToken } from '../utils/generateToken.js';
import { setAuthCookies, clearAuthCookies, getRefreshCookieMaxAge } from '../utils/cookieUtils.js';

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const generateRefreshToken = () => crypto.randomBytes(48).toString('hex');

const getRefreshExpiryDate = () =>
  new Date(Date.now() + getRefreshCookieMaxAge());

export const createAuthSession = async (userId, res, req = null) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);

  await RefreshToken.create({
    user: userId,
    tokenHash,
    expiresAt: getRefreshExpiryDate(),
    userAgent: req?.headers?.['user-agent'] || null,
    ipAddress: req?.ip || null,
  });

  setAuthCookies(res, accessToken, refreshToken);

  return { accessToken, refreshToken };
};

export const refreshAuthSession = async (refreshToken, res, req = null) => {
  if (!refreshToken) {
    throw new AppError('Refresh token missing', 401);
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!stored) {
    clearAuthCookies(res);
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(stored.user).select('-password');
  if (!user) {
    await RefreshToken.updateOne({ _id: stored._id }, { revokedAt: new Date() });
    clearAuthCookies(res);
    throw new AppError('User not found', 401);
  }

  if (!user.isActive) {
    clearAuthCookies(res);
    throw new AppError('Your account has been blocked', 403);
  }

  // Rotate refresh token
  const newRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRefreshToken);

  stored.revokedAt = new Date();
  stored.replacedBy = newTokenHash;
  await stored.save();

  await RefreshToken.create({
    user: user._id,
    tokenHash: newTokenHash,
    expiresAt: getRefreshExpiryDate(),
    userAgent: req?.headers?.['user-agent'] || null,
    ipAddress: req?.ip || null,
  });

  const accessToken = generateAccessToken(user._id);
  setAuthCookies(res, accessToken, newRefreshToken);

  return { user, accessToken };
};

export const revokeRefreshToken = async (refreshToken) => {
  if (!refreshToken) return;

  const tokenHash = hashToken(refreshToken);
  await RefreshToken.updateOne(
    { tokenHash, revokedAt: null },
    { revokedAt: new Date() }
  );
};

export const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { revokedAt: new Date() }
  );
};

export const logoutSession = async (refreshToken, res) => {
  await revokeRefreshToken(refreshToken);
  clearAuthCookies(res);
};
