import apiClient from './client.js';

/**
 * Fetch the current authenticated user's profile
 * @returns {Promise<Object>} Response containing userProfile data
 */
export const getUserProfile = async (username) => {
  try {
    const response = await apiClient.get(`/user-profiles/${username}`);
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

/**
 * Update the current authenticated user's profile
 * Supports multipart/form-data for profile picture upload
 * @param {Object} updateData - Fields to update (firstname, lastname, username, bio, verse, profilePicture file)
 * @returns {Promise<Object>} Response containing updated userProfile data
 */
export const updateUserProfile = async (updateData) => {
  try {
    const formData = new FormData();

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const response = await apiClient.patch('/user-profiles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response?.data?.data) {
      return {
        success: true,
        data: response.data.data.userProfile ?? response.data.data,
        message: response.data.message || 'Profile updated successfully!',
      };
    }

    return {
      success: false,
      error: 'Failed to update profile.',
    };
  } catch (err) {
    console.error('Error updating user profile:', err);
    return {
      success: false,
      error: err?.response?.data?.message || 'Failed to update profile. Please try again.',
    };
  }
};

/**
 * Get payment availability for a specific user profile
 * @param {string} username - The username to check payment status for
 * @returns {Promise<Object>} Response with payment availability
 */
export const getUserPaymentStatus = async (username) => {
  try {
    const response = await apiClient.get(`/payments/user-payment-status/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user payment status:', error);
    throw error;
  }
};

/**
 * Get Stripe account status for the current authenticated user
 * @returns {Promise<Object>} Response with Stripe account status
 */
export const getUserStripeAccountStatus = async () => {
  try {
    const response = await apiClient.get('/payments/user-stripe-account-status');
    return response.data;
  } catch (error) {
    console.error('Error getting user Stripe account status:', error);
    throw error;
  }
};

/**
 * Connect Stripe account for the current authenticated user
 * @returns {Promise<Object>} Response with Stripe onboarding URL
 */
export const connectUserStripe = async () => {
  try {
    const response = await apiClient.post('/payments/create-user-stripe-account');
    return response.data;
  } catch (error) {
    console.error('Error connecting user Stripe:', error);
    throw error;
  }
};

/**
 * Create a payment intent for a user-to-user payment
 * @param {number} amount - Amount in cents
 * @param {string} recipientUserId - The recipient user's MongoDB _id
 * @param {string} personalMessage - Optional personal message
 * @returns {Promise<Object>} Response with clientSecret, paymentId, platformFee, recipientAmount
 */
export const createUserPaymentIntent = async (amount, recipientUserId, personalMessage) => {
  try {
    const response = await apiClient.post('/payments/user/create-payment-intent', {
      amount,
      recipientUserId,
      personalMessage,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user payment intent:', error);
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  getUserPaymentStatus,
  getUserStripeAccountStatus,
  connectUserStripe,
  createUserPaymentIntent,
};
