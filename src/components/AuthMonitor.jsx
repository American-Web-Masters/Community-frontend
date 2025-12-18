import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsLoggedIn, clearUser } from '../store/userSlice';
import { validateAuthenticationState } from '../utils/authUtils';

/**
 * AuthMonitor - Periodically checks authentication status
 * This component runs in the background and validates that the user's
 * session is still valid on the server to prevent unexpected logouts
 */
const AuthMonitor = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    // Check authentication status every 5 minutes
    const checkInterval = 5 * 60 * 1000; // 5 minutes

    const checkAuth = async () => {
      try {
        const isValid = await validateAuthenticationState();
        
        if (!isValid) {
          console.log('Authentication monitor detected invalid session, clearing user data');
          dispatch(clearUser());
        }
      } catch (error) {
        console.warn('Authentication monitor check failed:', error);
        // Don't clear user on network errors, only on auth failures
      }
    };

    // Initial check after 30 seconds
    const initialTimeout = setTimeout(checkAuth, 30000);

    // Periodic checks
    const interval = setInterval(checkAuth, checkInterval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isLoggedIn, dispatch]);

  // This component doesn't render anything
  return null;
};

export default AuthMonitor;