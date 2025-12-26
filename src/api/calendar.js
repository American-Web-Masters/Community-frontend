import apiClient from './client.js';

/**
 * Check if user has connected their Google Calendar
 * @returns {Promise<Object>} Response containing calendar connection status
 */
export const checkCalendarConnection = async () => {
  try {
    console.log('Checking calendar connection...');
    
    const response = await apiClient.get('/users/check-calendar-connection');
    
    console.log('Calendar connection response:', response.data);
    
    if (response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to check calendar connection'
      };
    }
  } catch (err) {
    console.error('Error checking calendar connection:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to check calendar connection. Please try again.'
    };
  }
};

/**
 * Connect user's Google Calendar
 * @returns {Promise<Object>} Response containing connection status
 */
export const connectCalendar = async () => {
  try {
    // Redirect to Google OAuth
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google`;
    
    return {
      success: true,
      message: 'Redirecting to Google Calendar...'
    };
  } catch (err) {
    console.error('Error connecting calendar:', err);
    return {
      success: false,
      error: 'Failed to connect calendar. Please try again.'
    };
  }
};

/**
 * Disconnect user's Google Calendar
 * @returns {Promise<Object>} Response containing disconnection status
 */
export const disconnectCalendar = async () => {
  try {
    const response = await apiClient.post('/users/disconnect-calendar');
    
    if (response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to disconnect calendar'
      };
    }
  } catch (err) {
    console.error('Error disconnecting calendar:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message || 'Failed to disconnect calendar. Please try again.'
    };
  }
};
