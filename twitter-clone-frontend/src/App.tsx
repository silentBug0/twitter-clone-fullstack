import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import { useAuth } from "./context/AuthContext"; // Import useAuth to potentially redirect root
import UserProfilePage from "./pages/UserProfilePage";

const App: React.FC = () => {
  const { user } = useAuth(); // Get user from auth context

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:username"
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Redirect root path */}
      <Route
        path="/"
        element={<Navigate to={user ? "/home" : "/login"} replace />}
      />

      {/* You can add a 404 Not Found page later if needed */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
};

export default App;
