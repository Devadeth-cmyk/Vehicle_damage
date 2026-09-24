import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Authenticating..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ensure Customer role
  if (user && user.role && user.role !== 'CUSTOMER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 max-w-md text-center">
          <h2 className="text-xl font-bold text-rose-600 mb-2">Access Denied</h2>
          <p className="text-slate-600 text-sm mb-4">
            Customers only. You do not have permission to access the customer portal with account role <strong>{user.role}</strong>.
          </p>
          <a href="/login" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Switch Account
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
