
import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Building, GraduationCap, CreditCard, BarChart3 } from 'lucide-react';
import { useUserRole } from '@/contexts/UserRoleContext';
import { ROLES } from '@/utils/roles';
import RoleBasedElement from '../RoleBasedElement';

const AdminNavigation = () => {
  const { currentRole } = useUserRole();
  
  return (
    <nav className="space-y-2 py-4">
      <RoleBasedElement allowedRoles={[ROLES.PLATFORM_ADMIN]}>
        <Link 
          to="/admin/owners" 
          className="flex items-center px-4 py-2.5 text-sm rounded-md hover:bg-accent"
        >
          <UserCircle className="h-4 w-4 mr-2.5" />
          Center Owners
        </Link>
      </RoleBasedElement>
      
      <RoleBasedElement allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.TECHNICAL_OWNER]}>
        <Link 
          to="/admin/centers" 
          className="flex items-center px-4 py-2.5 text-sm rounded-md hover:bg-accent"
        >
          <Building className="h-4 w-4 mr-2.5" />
          Training Centers
        </Link>
      </RoleBasedElement>
      
      <RoleBasedElement allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.CONTENT_MODERATOR]}>
        <Link 
          to="/admin/courses" 
          className="flex items-center px-4 py-2.5 text-sm rounded-md hover:bg-accent"
        >
          <GraduationCap className="h-4 w-4 mr-2.5" />
          Courses
        </Link>
      </RoleBasedElement>
      
      <RoleBasedElement allowedRoles={[ROLES.PLATFORM_ADMIN]}>
        <Link 
          to="/admin/payments" 
          className="flex items-center px-4 py-2.5 text-sm rounded-md hover:bg-accent"
        >
          <CreditCard className="h-4 w-4 mr-2.5" />
          Payments
        </Link>
      </RoleBasedElement>
      
      <RoleBasedElement allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.TECHNICAL_OWNER]}>
        <Link 
          to="/admin/reports" 
          className="flex items-center px-4 py-2.5 text-sm rounded-md hover:bg-accent"
        >
          <BarChart3 className="h-4 w-4 mr-2.5" />
          Reports & Analytics
        </Link>
      </RoleBasedElement>
    </nav>
  );
};

export default AdminNavigation;
