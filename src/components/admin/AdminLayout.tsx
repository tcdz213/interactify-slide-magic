
import React from "react";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import RoleSelector from "./RoleSelector";
import { useUserRole } from "@/contexts/UserRoleContext";
import { ROLE_DEFINITIONS, ROLES } from "@/utils/roles";
import RoleBasedElement from "@/components/RoleBasedElement";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { currentRole } = useUserRole();
  const roleDefinition = ROLE_DEFINITIONS[currentRole];
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b dark:border-zinc-800">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Admin Portal</h1>
              <p className="text-xs text-muted-foreground">{roleDefinition.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <RoleSelector />
            <ThemeToggle />
            <RoleBasedElement allowedRoles={[ROLES.CENTER_OWNER, ROLES.PLATFORM_ADMIN]}>
              <button 
                onClick={() => navigate('/center-owner-dashboard')} 
                className="text-sm font-medium text-primary hover:underline transition-colors"
              >
                Center Dashboard
              </button>
            </RoleBasedElement>
            <button 
              onClick={() => navigate('/')} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Website
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;
