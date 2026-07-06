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

// Request interceptor to attach token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple response interceptor - no automatic logout
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error but don't automatically clear auth state
    // Let the components handle 401s as needed
    console.log('API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
