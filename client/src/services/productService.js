import api from './api';

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getMyProducts = async (params = {}) => {
  const response = await api.get('/products/mine', { params });
  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (formData) => {
  const response = await api.post('/products', formData);
  return response.data;
};

export const updateProduct = async (id, formData) => {
  const response = await api.put(`/products/${id}`, formData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const markAsSold = async (id) => {
  const response = await api.patch(`/products/${id}/sold`);
  return response.data;
};
