import { apiClient } from '../api';

/**
 * Authentication utility functions
 */

// Check if user is authenticated on the server
export const verifyServerAuthentication = async () => {
  try {
    const response = await apiClient.get('/users/auth-check');
    console.log('Server authentication check response:', response.data);
    return response.data.status === 'success' && response.data.data?.user;
  } catch (error) {
    console.log('Server authentication check failed:', error);
    return false;
  }
};

// Check if user data exists in local storage
export const hasLocalUserData = () => {
  try {
    const userData = localStorage.getItem('authenticatedUser');
    return userData && JSON.parse(userData);
  } catch (error) {
    console.error('Error reading local user data:', error);
    return false;
  }
};

// Validate authentication state across client and server
export const validateAuthenticationState = async () => {
  const localUser = hasLocalUserData();
  
  if (!localUser) {
    return false;
  }
  
  // Verify with server if local data exists
  const serverAuth = await verifyServerAuthentication();
  
  if (!serverAuth) {
    // Clear stale local data if server says user is not authenticated
    localStorage.removeItem('authenticatedUser');
    return false;
  }
  
  return true;
};

// Graceful logout that clears all authentication data
export const performLogout = async () => {
  try {
    // Try to logout on server first
    const response = await apiClient.post('/users/logout');
    console.log('Server logout response:', response.data);
  } catch (error) {
    console.warn('Server logout failed, proceeding with client cleanup:', error);
  } finally {
    // Clear Redux store if available
    if (window.__REDUX_STORE__) {
      window.__REDUX_STORE__.dispatch({ type: 'user/clearUser' });
    }
    
    // Redirect to login
    window.location.href = '/login';
  }
};

// Handle authentication errors with retry logic
export const handleAuthError = async (originalRequest) => {
  console.log('Handling authentication error...');
  
  // First check if authentication is still valid
  const isValid = await validateAuthenticationState();
  
  if (isValid) {
    console.log('Authentication is still valid, retrying request...');
    return true; // Can retry
  } else {
    console.log('Authentication is invalid, logging out...');
    await performLogout();
    return false; // Cannot retry
  }
};

// Initialize authentication on app startup
export const initializeAuthentication = async () => {
  const localUser = hasLocalUserData();
  
  if (localUser) {
    // Verify that the local session is still valid on the server
    const isValid = await validateAuthenticationState();
    
    if (!isValid) {
      console.log('Local session is invalid, clearing...');
      localStorage.removeItem('authenticatedUser');
      return false;
    }
    
    console.log('Authentication state validated successfully');
    return true;
  }
  
  return false;
};