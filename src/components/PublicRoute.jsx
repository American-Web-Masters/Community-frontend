import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsLoggedIn, selectUser } from '../store/userSlice';

const PublicRoute = ({ children }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const location = useLocation();

  const bachahua = localStorage.getItem('pendingInvite');
  if (bachahua && isLoggedIn) {
    // User is not logged in and there's a pending invite, redirect to login
    return children;
  }

  if (isLoggedIn) {
    if (user?.isNewUser || location.pathname === '/signup') {
      return <Navigate to="/survey" replace />;
    }
    return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/'} replace />;
  }

  return children;
};

export default PublicRoute;