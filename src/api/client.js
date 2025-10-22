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

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  // Try to get token from localStorage first, then from Redux store
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('authenticatedUser');
      
      // Redirect to signup page
      window.location.href = '/signup';
    }
    return Promise.reject(error);
  }
);

export default apiClient;