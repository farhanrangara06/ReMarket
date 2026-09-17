export const getId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id?.toString() || value.toString();
};

export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (!error) return fallback;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message === 'Network Error') return 'Network error. Please check your connection.';
  return error.message || fallback;
};
