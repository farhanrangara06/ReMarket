import nodemailer from 'nodemailer';
import { isProduction } from './env.js';
import { getClientUrls } from './env.js';

export const isEmailEnabled = () =>
  !!(
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim()
  );

export const getEmailFrom = () =>
  process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@remarket.app';

export const getClientBaseUrl = () => getClientUrls()[0] || 'http://localhost:5173';

let transporter = null;

export const getTransporter = () => {
  if (!isEmailEnabled()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const logEmailMode = () => {
  if (isEmailEnabled()) {
    console.log(`Email service: SMTP (${process.env.SMTP_HOST})`);
  } else {
    console.log('Email service: Disabled (auto-verify users in development)');
    if (isProduction()) {
      console.warn('WARNING: SMTP not configured. Set SMTP_* env vars for email verification.');
    }
  }
};
