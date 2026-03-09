import { apiClient } from './index.js';

/**
 * Send a message to another user
 * @param {{receiverId: string, content: string, messageType?: string}} payload
 */
export const sendMessage = (payload) => {
  return apiClient.post('/messages/send', payload);
};

/**
 * Get all conversations with last message and unread count
 */
export const getConversations = () => {
  return apiClient.get('/messages/conversations');
};

/**
 * Get conversation with a specific user
 * @param {string} userId
 * @param {{page?: number, limit?: number}} params
 */
export const getConversationWithUser = (userId, params = {}) => {
  return apiClient.get(`/messages/conversation/${userId}`, { params });
};

/**
 * Mark messages as read
 * @param {{messageIds: string[]}} payload
 */
export const markMessagesAsRead = (payload) => {
  return apiClient.patch('/messages/mark-read', payload);
};

/**
 * Mark all messages in a conversation as read
 * @param {string} userId
 */
export const markConversationAsRead = (userId) => {
  return apiClient.patch(`/messages/conversation/${userId}/mark-read`);
};

/**
 * Get unread message count
 */
export const getUnreadCount = () => {
  return apiClient.get('/messages/unread-count');
};

/**
 * Search messages
 * @param {{query: string, userId?: string}} params
 */
export const searchMessages = (params) => {
  return apiClient.get('/messages/search', { params });
};

/**
 * Delete a specific message
 * @param {string} messageId
 */
export const deleteMessage = (messageId) => {
  return apiClient.delete(`/messages/${messageId}`);
};

/**
 * Delete entire conversation with a user
 * @param {string} userId
 */
export const deleteConversation = (userId) => {
  return apiClient.delete(`/messages/conversation/${userId}`);
};

/**
 * Get all users for messaging
 */
export const getAllUsers = () => {
  return apiClient.get('/users/allusers');
};

export default {
  sendMessage,
  getConversations,
  getConversationWithUser,
  markMessagesAsRead,
  markConversationAsRead,
  getUnreadCount,
  searchMessages,
  deleteMessage,
  deleteConversation,
  getAllUsers,
};
