import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userInfo } = useStore();
  const location = useLocation();

  if (!userInfo) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they
    // log in, which is a nicer user experience than dropping them off on the home page.
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;