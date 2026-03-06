import apiClient from './client.js';

/**
 * Fetch the current authenticated user's profile
 * @returns {Promise<Object>} Response containing userProfile data
 */
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/user-profiles');
    if (response?.data?.data) {
      return {
        success: true,
        data: response.data.data.userProfile,
      };
    }
    return {
      success: false,
      error: 'Failed to load profile.',
    };
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return {
      success: false,
      error: 'Failed to load profile. Please try again.',
    };
  }
};

export default {
  getUserProfile,
};
