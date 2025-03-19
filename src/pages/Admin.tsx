
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import { TrainingCenterManagement } from "@/components/admin/training-center";
import UserManagement from "@/components/admin/UserManagement";
import AnalyticsReports from "@/components/admin/AnalyticsReports";
import { CenterAdminPanel } from "@/components/admin/center-admin";
import { useUserRole } from "@/contexts/UserRoleContext";
import { ROLES } from "@/utils/roles";
import RoleBasedElement from "@/components/RoleBasedElement";

const Admin = () => {
  const { currentRole, hasPermission } = useUserRole();
  
  // Define which tabs to show based on role
  const showCentersTab = hasPermission('manage:centers') || hasPermission('admin:full');
  const showUsersTab = hasPermission('manage:users') || hasPermission('admin:full');
  const showAnalyticsTab = hasPermission('view:analytics') || hasPermission('admin:full');
  const showCenterAdminTab = currentRole === ROLES.CENTER_OWNER;
  
  // Calculate how many tabs are visible to set the grid
  const visibleTabsCount = [
    showCentersTab, 
    showUsersTab, 
    showAnalyticsTab, 
    showCenterAdminTab
  ].filter(Boolean).length;
  
  // Default tab based on role
  let defaultTab = "centers";
  if (currentRole === ROLES.CENTER_OWNER) defaultTab = "centerAdmin";
  if (currentRole === ROLES.CONTENT_MODERATOR) defaultTab = "centers";
  
  return (
    <AdminLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <RoleBasedElement allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.TECHNICAL_OWNER]}>
              <TabsTrigger value="centers">Training Centers</TabsTrigger>
            </RoleBasedElement>
            
            <RoleBasedElement allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.SUPPORT_AGENT]}>
              <TabsTrigger value="users">User Management</TabsTrigger>
            </RoleBasedElement>
            
            <RoleBasedElement 
              allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.ADVERTISER, ROLES.TECHNICAL_OWNER, ROLES.CENTER_OWNER]}
            >
              <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
            </RoleBasedElement>
            
            <RoleBasedElement allowedRoles={[ROLES.CENTER_OWNER, ROLES.PLATFORM_ADMIN]}>
              <TabsTrigger value="centerAdmin">Center Admin</TabsTrigger>
            </RoleBasedElement>
          </TabsList>
          
          <RoleBasedElement allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.TECHNICAL_OWNER]}>
            <TabsContent value="centers" className="mt-6">
              <Card className="p-6">
                <TrainingCenterManagement />
              </Card>
            </TabsContent>
          </RoleBasedElement>
          
          <RoleBasedElement allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.SUPPORT_AGENT]}>
            <TabsContent value="users" className="mt-6">
              <Card className="p-6">
                <UserManagement />
              </Card>
            </TabsContent>
          </RoleBasedElement>
          
          <RoleBasedElement 
            allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.ADVERTISER, ROLES.TECHNICAL_OWNER, ROLES.CENTER_OWNER]}
          >
            <TabsContent value="analytics" className="mt-6">
              <Card className="p-6">
                <AnalyticsReports />
              </Card>
            </TabsContent>
          </RoleBasedElement>
          
          <RoleBasedElement allowedRoles={[ROLES.CENTER_OWNER, ROLES.PLATFORM_ADMIN]}>
            <TabsContent value="centerAdmin" className="mt-6">
              <Card className="p-6">
                <CenterAdminPanel />
              </Card>
            </TabsContent>
          </RoleBasedElement>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Admin;
