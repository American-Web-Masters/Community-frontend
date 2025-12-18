import { useDispatch } from 'react-redux';
import { clearUser } from '../store/userSlice';
import { performLogout } from '../utils/authUtils';

/**
 * Custom hook for handling logout functionality
 * Provides a clean logout function that handles both client and server-side cleanup
 */
export const useLogout = () => {
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      console.log('Initiating logout process...');
      
      // Use the utility function that handles server logout and cleanup
      await performLogout();
      
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Fallback: clear client state even if server logout fails
      dispatch(clearUser());
      localStorage.removeItem('authenticatedUser');
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  return { logout };
};