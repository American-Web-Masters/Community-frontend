import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsLoggedIn } from '../store/userSlice';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  if (!isLoggedIn) {
    // Redirect to signup if not authenticated
    return <Navigate to="/signup" replace />;
  }

  return children;
};

export default ProtectedRoute;