import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, token } = useAuth(); // Check if user is logged in (has user data and token)

  if (!user || !token) {
    // User not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>; // User is authenticated, render the children (protected component)
};

export default ProtectedRoute;