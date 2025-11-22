import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useContext(Store);
  const { userInfo } = state;

  if (!userInfo) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;