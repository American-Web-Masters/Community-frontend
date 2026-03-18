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

/**
 * Add a reaction to messages
 * @param {string} messageId
 * @param {{emoji: string}} payload
 */
export const addReaction = (messageId, payload) => {
  return apiClient.post(`/messages/${messageId}/reactions`, payload);
};

/**
 * Remove a reaction from a message
 * @param {string} messageId
 * @param {{emoji: string}} payload
 */
export const removeReaction = (messageId, payload) => {
  return apiClient.delete(`/messages/${messageId}/reactions`, { data: payload });
};

/**
 * Delete a message for everyone
 * @param {string} messageId
 */
export const deleteMessageForEveryone = (messageId) => {
  return apiClient.delete(`/messages/${messageId}/for-everyone`);
};

/**
 * Pin a user conversation
 * @param {string} userId
 */
export const pinUser = (userId) => {
  return apiClient.post(`/messages/pin/${userId}`);
};

/**
 * Unpin a user conversation
 * @param {string} userId
 */
export const unpinUser = (userId) => {
  return apiClient.delete(`/messages/pin/${userId}`);
};

/**
 * Get all pinned users
 */
export const getPinnedUsers = () => {
  return apiClient.get('/messages/pinned');
};

/**
 * Send a message to a community group
 * @param {string} communityId
 * @param {{content: string, messageType?: string, replyTo?: string}} payload
 */
export const sendGroupMessage = (communityId, payload) => {
  return apiClient.post(`/messages/groups/${communityId}/send`, payload);
};

/**
 * Get paginated messages for a community group
 * @param {string} communityId
 * @param {{page?: number, limit?: number}} params
 */
export const getCommunityGroupMessages = (communityId, params = {}) => {
  return apiClient.get(`/messages/groups/${communityId}/messages`, { params });
};

/**
 * Get all group conversations the current user belongs to
 */
export const getMyGroupConversations = () => {
  return apiClient.get('/messages/groups/conversations');
};

/**
 * Mark specific group messages as read
 * @param {{messageIds: string[]}} payload
 */
export const markSpecificGroupMessagesAsRead = (payload) => {
  return apiClient.patch('/messages/groups/mark-read', payload);
};

/**
 * Mark entire community group as read
 * @param {string} communityId
 */
export const markCommunityGroupAsRead = (communityId) => {
  return apiClient.patch(`/messages/groups/${communityId}/mark-read`);
};

/**
 * Get group unread count
 */
export const getGroupUnreadCount = () => {
  return apiClient.get('/messages/groups/unread-count');
};

/**
 * Search group messages
 * @param {{query: string, communityId?: string}} params
 */
export const searchGroupMessages = (params) => {
  return apiClient.get('/messages/groups/search', { params });
};

/**
 * Get online members in a community
 * @param {string} communityId
 */
export const getCommunityOnlineMembers = (communityId) => {
  return apiClient.get(`/messages/groups/${communityId}/online-members`);
};

/**
 * Add reaction to a group message
 * @param {string} messageId
 * @param {{emoji: string}} payload
 */
export const addGroupReaction = (messageId, payload) => {
  return apiClient.post(`/messages/groups/messages/${messageId}/reactions`, payload);
};

/**
 * Remove reaction from a group message
 * @param {string} messageId
 * @param {{emoji: string}} payload
 */
export const removeGroupReaction = (messageId, payload) => {
  return apiClient.delete(`/messages/groups/messages/${messageId}/reactions`, {
    data: payload,
  });
};

/**
 * Delete group message for current user
 * @param {string} messageId
 */
export const deleteGroupMessage = (messageId) => {
  return apiClient.delete(`/messages/groups/messages/${messageId}`);
};

/**
 * Delete group message for everyone
 * @param {string} messageId
 */
export const deleteGroupMessageForEveryone = (messageId) => {
  return apiClient.delete(`/messages/groups/messages/${messageId}/for-everyone`);
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
  addReaction,
  removeReaction,
  deleteMessageForEveryone,
  pinUser,
  unpinUser,
  getPinnedUsers,
  sendGroupMessage,
  getCommunityGroupMessages,
  getMyGroupConversations,
  markSpecificGroupMessagesAsRead,
  markCommunityGroupAsRead,
  getGroupUnreadCount,
  searchGroupMessages,
  getCommunityOnlineMembers,
  addGroupReaction,
  removeGroupReaction,
  deleteGroupMessage,
  deleteGroupMessageForEveryone,
};
