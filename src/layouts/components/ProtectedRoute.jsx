import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../features/auth/useAuthStore";
import ForbiddenPage from "../../pages/errors/ForbiddenPage";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role } = useAuthStore();

  const normalizedRole = role?.toUpperCase();

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Không có quyền
  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedRole)) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
