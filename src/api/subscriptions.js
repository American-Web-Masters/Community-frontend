import apiClient from './client.js';

/**
 * Create a subscription with dynamic pricing
 * @param {Object} subscriptionData - The subscription data
 * @param {number} subscriptionData.amount - Amount in cents
 * @param {string} subscriptionData.interval - 'week', 'biweek', or 'month'
 * @param {string} subscriptionData.communityId - Community ID (optional)
 * @param {string} subscriptionData.description - Subscription description
 * @returns {Promise} - Promise resolving to client secret for payment
 */
export const createSubscription = async (subscriptionData) => {
  try {
    const response = await apiClient.post('/subscriptions/create', subscriptionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's active subscriptions
 * @returns {Promise} - Promise resolving to user's subscriptions
 */
export const getUserSubscriptions = async () => {
  try {
    const response = await apiClient.get('/subscriptions/user');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel a subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise} - Promise resolving to cancellation confirmation
 */
export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await apiClient.delete(`/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Confirm subscription payment
 * @param {string} paymentIntentId - Payment intent ID from Stripe
 * @returns {Promise} - Promise resolving to subscription details
 */
export const confirmSubscriptionPayment = async (paymentIntentId) => {
  try {
    const response = await apiClient.post('/subscriptions/confirm', { 
      paymentIntentId 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
