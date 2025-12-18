import axios from 'axios';
import { API_BASE_URL } from './config.js';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - cookies are automatically sent
apiClient.interceptors.request.use((config) => {
  // No need to manually add auth token, cookies are automatically sent
  return config;
});

// Track retry attempts to prevent infinite loops
let isRetrying = false;
let failedQueue = [];

// Process failed requests queue
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor - handle 401 errors with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors with retry logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If already retrying, queue this request
      if (isRetrying) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      console.log('Received 401 error, attempting to verify authentication...');
      
      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;
      isRetrying = true;
      
      try {
        // Try to verify authentication with a simple endpoint
        console.log('Checking authentication status...');
        const authCheckResponse = await axios.get(`${API_BASE_URL}/users/auth-check`, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (authCheckResponse.data?.status === 'success') {
          console.log('Authentication is valid, retrying failed requests...');
          isRetrying = false;
          processQueue(null);
          
          // Retry the original request
          return apiClient(originalRequest);
        } else {
          throw new Error('Authentication check failed');
        }
      } catch (authError) {
        console.log('Authentication verification failed:', authError.response?.status || authError.message);
        
        isRetrying = false;
        processQueue(authError);
        
        // Only logout if this is a definitive auth failure (not network error)
        if (authError.response?.status === 401 || authError.response?.status === 403) {
          console.log('Definitive authentication failure, clearing user session...');
          
          // Clear user data from localStorage
          localStorage.removeItem('authenticatedUser');
          
          // Clear Redux store if available
          if (window.__REDUX_STORE__) {
            window.__REDUX_STORE__.dispatch({ type: 'user/clearUser' });
          }
          
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/signup') &&
              !window.location.pathname.includes('/landing')) {
            console.log('Redirecting to login page...');
            setTimeout(() => {
              window.location.href = '/login';
            }, 100); // Small delay to prevent immediate redirect
          }
        } else {
          console.log('Network or temporary error during auth check, not logging out user');
        }
        
        return Promise.reject(error);
      }
    }
    
    // Handle network errors separately
    if (!error.response) {
      console.warn('Network error occurred:', error.message);
      // Don't logout for network errors - these could be temporary
      return Promise.reject(error);
    }
    
    // Handle other HTTP errors normally
    return Promise.reject(error);
  }
);

export default apiClient;