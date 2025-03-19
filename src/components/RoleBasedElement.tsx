
import React from 'react';
import { useUserRole } from '@/contexts/UserRoleContext';
import { Role } from '@/utils/roles';

interface RoleBasedElementProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

const RoleBasedElement = ({
  children,
  allowedRoles = [],
  requiredPermission,
  fallback = null
}: RoleBasedElementProps) => {
  const { currentRole, hasPermission } = useUserRole();
  
  const hasRoleAccess = allowedRoles.length === 0 || allowedRoles.includes(currentRole);
  const hasPermissionAccess = !requiredPermission || hasPermission(requiredPermission);
  
  if (!hasRoleAccess || !hasPermissionAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default RoleBasedElement;
