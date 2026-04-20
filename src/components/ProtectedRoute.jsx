import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsLoggedIn, selectUser } from '../store/userSlice';

const ProtectedRoute = ({ children, requireRole }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);

  if (!isLoggedIn) {
    // Redirect to landing if not authenticated
    return <Navigate to="/landing" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    // Authenticated but not authorized for this section
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;