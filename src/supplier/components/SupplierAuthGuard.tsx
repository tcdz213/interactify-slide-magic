/**
 * 📦 Supplier Auth Guard — Mock session with localStorage
 */
import { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";

export function useSupplierAuth() {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem("supplier_session") === "active");

  const login = (email: string, otp: string) => {
    if (otp.length === 6) {
      localStorage.setItem("supplier_session", "active");
      setIsAuth(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("supplier_session");
    setIsAuth(false);
  };

  return { isAuth, login, logout };
}

export default function SupplierAuthGuard() {
  const { isAuth } = useSupplierAuth();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/supplier/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
