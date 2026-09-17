import api from './api';

export const register = async (formData) => {
  const response = await api.post('/auth/register', formData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const refresh = async () => {
  const response = await api.post('/auth/refresh');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const logoutAll = async () => {
  const response = await api.post('/auth/logout-all');
  return response.data;
};

export const verifyEmail = async (payload) => {
  const response = await api.post('/auth/verify-email', payload);
  return response.data;
};

export const resendVerification = async (payload) => {
  const response = await api.post('/auth/resend-verification', payload);
  return response.data;
};

export const forgotPassword = async (payload) => {
  const response = await api.post('/auth/forgot-password', payload);
  return response.data;
};

export const resetPassword = async (payload) => {
  const response = await api.post('/auth/reset-password', payload);
  return response.data;
};
