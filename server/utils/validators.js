import AppError from './AppError.js';

export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhone = (phone) => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (fields, body) => {
  const missing = fields.filter((field) => !body[field] || body[field].toString().trim() === '');
  if (missing.length > 0) {
    throw new AppError(`${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required`, 400);
  }
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }
};

export const validatePositiveNumber = (value, fieldName) => {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    throw new AppError(`${fieldName} must be a positive number`, 400);
  }
  return num;
};
