import apiClient from './client.js';

/**
 * Validate an invite token
 * @param {string} token - The invite token to validate
 * @returns {Promise<Object>} Response containing validation result and community data
 */
export const validateInvite = async (token) => {
  try {
    const response = await apiClient.get(`/invites/validate/${token}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error validating invite:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to validate invite',
      status: error.response?.status
    };
  }
};

/**
 * Accept an invite and join the community
 * @param {string} token - The invite token to accept
 * @returns {Promise<Object>} Response containing acceptance result
 */
export const acceptInvite = async (token) => {
  try {
    const response = await apiClient.post('/invites/accept', { token });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error accepting invite:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to accept invite',
      status: error.response?.status
    };
  }
};