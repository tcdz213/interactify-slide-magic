/**
 * 👑 Owner Auth Guard — Mock PIN session with localStorage
 */
import { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";

export function useOwnerAuth() {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem("owner_session") === "active");

  const login = (email: string, pin: string) => {
    if (pin.length === 6) {
      localStorage.setItem("owner_session", "active");
      setIsAuth(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("owner_session");
    setIsAuth(false);
  };

  return { isAuth, login, logout };
}

export default function OwnerAuthGuard() {
  const { isAuth } = useOwnerAuth();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/owner/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
