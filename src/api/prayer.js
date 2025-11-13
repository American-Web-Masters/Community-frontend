import { apiClient } from './index.js';

/**
 * Mark/Unmark prayer as prayed
 */
export const markAsPrayed = async (prayerId, userId) => {
  try {
    const response = await apiClient.post(`/prayers/${prayerId}/prayed`, {
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error marking prayer as prayed:', error);
    throw error;
  }
};

export const unmarkAsPrayed = async (prayerId, userId) => {
  try {
    const response = await apiClient.delete(`/prayers/${prayerId}/prayed`, {
      data: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error unmarking prayer as prayed:', error);
    throw error;
  }
};

/**
 * Add comment to prayer
 */
export const addComment = async (prayerId, userId, commentText) => {
  try {
    const response = await apiClient.post(`/prayers/${prayerId}/comments`, {
      userId,
      commentText
    });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

/**
 * Add reaction to comment
 */
export const addCommentReaction = async (prayerId, commentId, userId, emoji) => {
  try {
    const response = await apiClient.post(`/prayers/${prayerId}/comments/${commentId}/reactions`, {
      userId,
      emoji
    });
    return response.data;
  } catch (error) {
    console.error('Error adding comment reaction:', error);
    throw error;
  }
};

/**
 * Remove reaction from comment
 */
export const removeCommentReaction = async (prayerId, commentId, userId) => {
  try {
    const response = await apiClient.delete(`/prayers/${prayerId}/comments/${commentId}/reactions`, {
      data: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing comment reaction:', error);
    throw error;
  }
};

/**
 * Share/Unshare prayer
 */
export const sharePrayer = async (prayerId, userId) => {
  try {
    const response = await apiClient.post(`/prayers/${prayerId}/share`, {
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error sharing prayer:', error);
    throw error;
  }
};

export const unsharePrayer = async (prayerId, userId) => {
  try {
    const response = await apiClient.delete(`/prayers/${prayerId}/share`, {
      data: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error unsharing prayer:', error);
    throw error;
  }
};