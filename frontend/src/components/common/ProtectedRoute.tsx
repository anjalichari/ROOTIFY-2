import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="w-8 h-8 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
      </div>
    );
  }

  // If role is required and user has different role:
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If not authenticated, prompt login with returnUrl
    if (!user) {
      return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
    }
    // If authenticated but wrong role, redirect to appropriate role home or marketplace
    if (role === 'vendor') return <Navigate to="/vendor/orders" replace />;
    if (role === 'delivery') return <Navigate to="/delivery/tasks" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
