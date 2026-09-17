import api from './api';

export const createRequest = async (data) => {
  const response = await api.post('/requests', data);
  return response.data;
};

export const getSentRequests = async (params = {}) => {
  const response = await api.get('/requests/sent', { params });
  return response.data;
};

export const getReceivedRequests = async (params = {}) => {
  const response = await api.get('/requests/received', { params });
  return response.data;
};

export const acceptRequest = async (id) => {
  const response = await api.patch(`/requests/${id}/accept`);
  return response.data;
};

export const rejectRequest = async (id) => {
  const response = await api.patch(`/requests/${id}/reject`);
  return response.data;
};

export const cancelRequest = async (id) => {
  const response = await api.patch(`/requests/${id}/cancel`);
  return response.data;
};

export const completeRequest = async (id) => {
  const response = await api.patch(`/requests/${id}/complete`);
  return response.data;
};
