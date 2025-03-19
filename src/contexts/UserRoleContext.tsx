
import React, { createContext, useContext, useEffect } from 'react';
import { Role, ROLES, hasPermission } from '@/utils/roles';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { changeRole } from '@/redux/slices/authSlice';

interface UserRoleContextType {
  currentRole: Role;
  permissions: string[];
  changeRole: (newRole: Role) => void;
  hasPermission: (permission: string) => boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { currentRole } = useAppSelector(state => state.auth);
  
  // Get permissions for current role from the role definitions
  const permissions = React.useMemo(() => {
    return ROLES[currentRole]?.permissions || [];
  }, [currentRole]);

  // Check for saved role on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as Role;
    if (savedRole && ROLES[savedRole]) {
      dispatch(changeRole(savedRole));
    }
  }, [dispatch]);

  const handleChangeRole = (newRole: Role) => {
    dispatch(changeRole(newRole));
  };

  const checkPermission = (permission: string): boolean => {
    return hasPermission(permissions, permission);
  };

  const value = {
    currentRole,
    permissions,
    changeRole: handleChangeRole,
    hasPermission: checkPermission
  };

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
};

export const useUserRole = (): UserRoleContextType => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};
