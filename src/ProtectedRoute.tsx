// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("userToken");

  // If no validation key is present, redirect to the login/auth entry screen
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If an active session exists, render the child route view seamlessly
  return <Outlet />;
}
