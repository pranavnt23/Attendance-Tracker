import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ROLES } from '../utils/constants';

const RoleRoute = ({ requiredRole }) => {
  const { me } = useAuthStore();

  if (!me) {
    return <Navigate to="/login" replace />;
  }

  // Check if role matches the required role (e.g. 'attendance_rep')
  if (me.role !== requiredRole) {
    // If not a representative, redirect to student dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
