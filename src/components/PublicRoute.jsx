import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsLoggedIn } from '../store/userSlice';

const PublicRoute = ({ children }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const location = useLocation();

  const bachahua = localStorage.getItem('pendingInvite');
  if (bachahua && isLoggedIn) {
    // User is not logged in and there's a pending invite, redirect to login
    return children;
  }

  if (isLoggedIn) {
    if (location.pathname === '/signup') {
      return <Navigate to="/survey" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;