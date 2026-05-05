import { apiClient } from './index.js';

/**
 * Get paginated notifications for the authenticated user.
 * @param {{page?: number, limit?: number}} params
 */
export const getNotifications = (params = {}) => {
  return apiClient.get('/notifications', { params });
};

/**
 * Mark a single notification as read.
 * @param {string} id
 */
export const markNotificationRead = (id) => {
  return apiClient.patch(`/notifications/${id}/read`);
};

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsRead = () => {
  return apiClient.patch('/notifications/read');
};

export default {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
