
import React from "react";
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/contexts/UserRoleContext";
import { ROLES } from "@/utils/roles";
import AdminLayout from "@/components/admin/AdminLayout";
import CenterOwnerDashboardContent from "@/components/center-owner/CenterOwnerDashboardContent";

const CenterOwnerDashboard = () => {
  const { currentRole } = useUserRole();
  
  // Redirect if not a center owner
  if (currentRole !== ROLES.CENTER_OWNER && currentRole !== ROLES.PLATFORM_ADMIN) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <AdminLayout>
      <div className="container py-6">
        <CenterOwnerDashboardContent />
      </div>
    </AdminLayout>
  );
};

export default CenterOwnerDashboard;
