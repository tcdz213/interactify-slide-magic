
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/contexts/UserRoleContext";
import { ROLES } from "@/utils/roles";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  FileBarChart2
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AdminNavigation = () => {
  const { pathname } = useLocation();
  const { currentRole } = useUserRole();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <div className="space-y-2">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Dashboard</h2>
        <div className="space-y-1">
          <Button
            variant={isActive("/admin") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link to="/admin">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Overview
            </Link>
          </Button>
          
          {/* Reports link - visible to platform admins and technical owners */}
          {(currentRole === ROLES.PLATFORM_ADMIN || 
            currentRole === ROLES.TECHNICAL_OWNER || 
            currentRole === ROLES.CENTER_OWNER) && (
            <Button
              variant={isActive("/reports") ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link to="/reports">
                <FileBarChart2 className="mr-2 h-4 w-4" />
                Reports
              </Link>
            </Button>
          )}
          
          {/* User Management - visible to admins only */}
          {(currentRole === ROLES.PLATFORM_ADMIN || 
            currentRole === ROLES.CONTENT_MODERATOR) && (
            <Button
              variant={isActive("/admin/users") ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link to="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                User Management
              </Link>
            </Button>
          )}
          
          {/* Training Centers - visible to admins and center owners */}
          {(currentRole === ROLES.PLATFORM_ADMIN || 
            currentRole === ROLES.CENTER_OWNER) && (
            <Button
              variant={isActive("/center-owner-dashboard") ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link to="/center-owner-dashboard">
                <Building2 className="mr-2 h-4 w-4" />
                Training Centers
              </Link>
            </Button>
          )}
          
          {/* Analytics - visible to admins and analysts */}
          {(currentRole === ROLES.PLATFORM_ADMIN || 
            currentRole === ROLES.TECHNICAL_OWNER) && (
            <Button
              variant={isActive("/admin/analytics") ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link to="/admin/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
          )}
          
          {/* Courses - visible to various roles */}
          <Button
            variant={isActive("/admin/courses") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link to="/admin/courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Courses
            </Link>
          </Button>
          
          {/* Support - visible to support agents and admins */}
          {(currentRole === ROLES.PLATFORM_ADMIN || 
            currentRole === ROLES.SUPPORT_AGENT) && (
            <Button
              variant={isActive("/admin/support") ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link to="/admin/support">
                <MessageSquare className="mr-2 h-4 w-4" />
                Support
              </Link>
            </Button>
          )}
          
          {/* Settings - visible to all admin roles */}
          <Button
            variant={isActive("/admin/settings") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link to="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;
