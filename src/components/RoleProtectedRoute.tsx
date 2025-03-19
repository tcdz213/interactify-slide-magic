
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/contexts/UserRoleContext';
import { Role, ROLES } from '@/utils/roles';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCurrentUser } from '@/redux/slices/authSlice';
import { Loader2 } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requiredPermission?: string;
  fallbackPath?: string;
  redirectToLogin?: boolean;
}

const RoleProtectedRoute = ({
  children,
  allowedRoles = [],
  requiredPermission,
  fallbackPath = '/',
  redirectToLogin = true,
}: RoleProtectedRouteProps) => {
  const { currentRole, hasPermission } = useUserRole();
  const { isAuthenticated, isSessionPersisted, loading, user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  
  // Effect to fetch user data if we have a persisted session but no user data
  useEffect(() => {
    if (isSessionPersisted && !user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [isSessionPersisted, user, loading, dispatch]);
  
  // Allow platform admin by default
  const effectiveAllowedRoles = [...allowedRoles, ROLES.PLATFORM_ADMIN];
  
  // Check for authentication first
  if (!isAuthenticated) {
    if (redirectToLogin) {
      // Redirect to login with return URL
      return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
    }
    return <Navigate to={fallbackPath} replace />;
  }
  
  // Show loading indicator while fetching user data
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }
  
  const hasRoleAccess = effectiveAllowedRoles.length === 0 || effectiveAllowedRoles.includes(currentRole);
  const hasPermissionAccess = !requiredPermission || hasPermission(requiredPermission);
  
  if (!hasRoleAccess || !hasPermissionAccess) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
};

export default RoleProtectedRoute;
