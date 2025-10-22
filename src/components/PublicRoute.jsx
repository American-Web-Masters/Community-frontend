import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsLoggedIn } from '../store/userSlice';

const PublicRoute = ({ children }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  if (isLoggedIn) {
    // Redirect to home if already authenticated
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;