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

/**
 * Bookmark functions
 */
export const bookmarkPrayer = async (prayerId, userId) => {
  try {
    const response = await apiClient.post(`/prayers/${prayerId}/bookmark`, {
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error bookmarking prayer:', error);
    throw error;
  }
};

export const unbookmarkPrayer = async (prayerId, userId) => {
  try {
    const response = await apiClient.post(`/prayers/${prayerId}/bookmark`, {
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error unbookmarking prayer:', error);
    throw error;
  }
};

export const fetchUserBookmarks = async (userId) => {
  try {
    const response = await apiClient.get(`/prayers/user/${userId}/bookmark`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    throw error;
  }
};

// Utility function to check if a prayer is bookmarked by the current user
export const isBookmarkedByUser = (prayer, userId) => {
  if (!prayer.bookmarks || !userId) return false;
  return prayer.bookmarks.some(bookmark => {
    const bookmarkUserId = bookmark.user?._id || bookmark.user;
    return bookmarkUserId === userId;
  });
};

// Utility function to check if a prayer is shared by the current user
export const isSharedByUser = (prayer, userId) => {
  if (!prayer.shares || !userId) return false;
  return prayer.shares.some(share => {
    const shareUserId = share.user?._id || share.user;
    return shareUserId === userId;
  });
};

/**
 * Flag prayer for moderation
 */
export const flagPrayer = async (prayerId, flagData, communityId) => {
  try {
    const response = await apiClient.post(`/communities/${communityId}/prayers/${prayerId}/report`, flagData);
    return response.data;
  } catch (error) {
    console.error('Error flagging prayer:', error);
    throw error;
  }
};

/**
 * Get reported prayers for a community
 */
export const getReportedPrayers = async (communityId) => {
  try {
    const response = await apiClient.get(`/communities/${communityId}/reported-prayers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reported prayers:', error);
    throw error;
  }
};

/**
 * Toggle prayer pin status for profile
 */
export const togglePrayerPinStatus = async (prayerId) => {
  try {
    const response = await apiClient.patch(`/prayers/${prayerId}/pin`);
    return response.data;
  } catch (error) {
    console.error('Error toggling prayer pin status:', error);
    throw error;
  }
};

/**
 * Toggle prayer visibility (public/private) for profile
 */
export const togglePrayerVisibility = async (prayerId) => {
  try {
    const response = await apiClient.patch(`/prayers/${prayerId}/visibility`);
    return response.data;
  } catch (error) {
    console.error('Error toggling prayer visibility:', error);
    throw error;
  }
};

/**
 * Edit / update a prayer
 */
export const editPrayer = async (prayerId, payload) => {
  try {
    const response = await apiClient.put(`/prayers/${prayerId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error editing prayer:', error);
    throw error;
  }
};

/**
 * Delete a prayer
 */
export const deletePrayer = async (prayerId) => {
  try {
    const response = await apiClient.delete(`/prayers/${prayerId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting prayer:', error);
    throw error;
  }
};