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

// Response interceptor - handle 401 errors
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Clear user data from localStorage (cookies are handled by browser)
//       localStorage.removeItem('authenticatedUser');
      
//       // Redirect to login page
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;