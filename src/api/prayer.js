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
export const fetchBookmarkedPrayers = async (ids) => {
  try {
    console.log('Fetching bookmarked prayers with IDs:', ids);
    console.log('Request body:', { ids: ids });
    const response = await apiClient.post('/prayers/bookmark', {
      ids: ids
    });
    return response.data;
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Local storage utilities for bookmarks
export const getBookmarkedIds = () => {
  try {
    const bookmarks = localStorage.getItem('prayerBookmarks');
    if (bookmarks) {
      const parsed = JSON.parse(bookmarks);
      return parsed.ids || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting bookmarked IDs:', error);
    return [];
  }
};

export const addBookmark = (prayerId) => {
  try {
    const currentIds = getBookmarkedIds();
    if (!currentIds.includes(prayerId)) {
      const updatedIds = [...currentIds, prayerId];
      localStorage.setItem('prayerBookmarks', JSON.stringify({ ids: updatedIds }));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

export const removeBookmark = (prayerId) => {
  try {
    const currentIds = getBookmarkedIds();
    const updatedIds = currentIds.filter(id => id !== prayerId);
    localStorage.setItem('prayerBookmarks', JSON.stringify({ ids: updatedIds }));
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

export const isBookmarked = (prayerId) => {
  const bookmarkedIds = getBookmarkedIds();
  return bookmarkedIds.includes(prayerId);
};