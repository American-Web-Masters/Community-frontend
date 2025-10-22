import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsLoggedIn } from '../store/userSlice';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  if (!isLoggedIn) {
    // Redirect to landing if not authenticated
    return <Navigate to="/landing" replace />;
  }

  return children;
};

export default ProtectedRoute;