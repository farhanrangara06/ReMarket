import { generateSecureToken, hashToken } from '../utils/tokenUtils.js';

const HOURS_24 = 24 * 60 * 60 * 1000;
const HOUR_1 = 60 * 60 * 1000;

export const setEmailVerificationToken = (user) => {
  const token = generateSecureToken();
  user.emailVerificationToken = hashToken(token);
  user.emailVerificationExpire = new Date(Date.now() + HOURS_24);
  return token;
};

export const setPasswordResetToken = (user) => {
  const token = generateSecureToken();
  user.resetPasswordToken = hashToken(token);
  user.resetPasswordExpire = new Date(Date.now() + HOUR_1);
  return token;
};

export const clearEmailVerificationToken = (user) => {
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
};

export const clearPasswordResetToken = (user) => {
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
};

export const findUserByEmailToken = async (User, token) => {
  const hashed = hashToken(token);
  return User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpire: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpire');
};

export const findUserByResetToken = async (User, token) => {
  const hashed = hashToken(token);
  return User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpire');
};
