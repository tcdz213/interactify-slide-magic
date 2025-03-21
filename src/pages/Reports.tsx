import React from "react";
import { PlatformReportDashboard } from "@/components/reports/PlatformReportDashboard";
import AdminLayout from "@/components/admin/AdminLayout";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { ROLES } from "@/utils/roles";

const Reports = () => {
  return (
    <AdminLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">
          Platform Reports & Analytics
        </h1>
        <PlatformReportDashboard />
      </div>
    </AdminLayout>
  );
};

export default Reports;
