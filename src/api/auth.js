import { apiClient } from './index.js';

/**
 * Send forgot password request
 * @param {{email: string}} payload
 */
export const forgotPassword = (payload) => {
  return apiClient.post('/users/forgot-password', payload);
};

/**
 * Reset password using token from URL
 * @param {string} token
 * @param {{password: string}} payload
 */
export const resetPassword = (token, payload) => {
  return apiClient.post(`/users/reset-password/${token}`, payload);
};

export default {
  forgotPassword,
  resetPassword,
};
