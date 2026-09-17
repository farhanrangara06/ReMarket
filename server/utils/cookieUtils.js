import { isProduction } from '../config/env.js';

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

const parseDurationMs = (value, fallbackMs) => {
  if (!value) return fallbackMs;
  const match = String(value).match(/^(\d+)([smhd])$/);
  if (!match) return fallbackMs;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * (multipliers[unit] || 86400000);
};

const getSameSite = () => {
  const configured = process.env.COOKIE_SAME_SITE?.toLowerCase();
  if (configured === 'none' || configured === 'lax' || configured === 'strict') {
    return configured;
  }
  return isProduction() ? 'none' : 'lax';
};

const baseCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: getSameSite(),
  maxAge: maxAgeMs,
  path: '/',
});

export const getAccessCookieMaxAge = () =>
  parseDurationMs(process.env.JWT_EXPIRE, isProduction() ? 15 * 60 * 1000 : 7 * 86400000);

export const getRefreshCookieMaxAge = () =>
  parseDurationMs(process.env.JWT_REFRESH_EXPIRE, 7 * 86400000);

export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(ACCESS_COOKIE, accessToken, baseCookieOptions(getAccessCookieMaxAge()));
  res.cookie(REFRESH_COOKIE, refreshToken, baseCookieOptions(getRefreshCookieMaxAge()));
};

export const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE, { path: '/', httpOnly: true, secure: isProduction(), sameSite: getSameSite() });
  res.clearCookie(REFRESH_COOKIE, { path: '/', httpOnly: true, secure: isProduction(), sameSite: getSameSite() });
};

export const COOKIE_NAMES = { ACCESS_COOKIE, REFRESH_COOKIE };
