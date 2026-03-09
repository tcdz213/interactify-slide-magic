/**
 * 🏪 Portal Auth Guard — Mock OTP session with localStorage
 */
import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";

export function usePortalAuth() {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem("portal_session") === "active");

  const login = (email: string, otp: string) => {
    // Mock: accept any 6-digit OTP
    if (otp.length === 6) {
      localStorage.setItem("portal_session", "active");
      setIsAuth(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("portal_session");
    setIsAuth(false);
  };

  return { isAuth, login, logout };
}

export default function PortalAuthGuard() {
  const { isAuth } = usePortalAuth();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
