
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { CenterOwnerManagement } from './CenterOwnerManagement';
import { TrainingCenterApproval } from './TrainingCenterApproval';
import { CourseMonitoring } from './CourseMonitoring';
import { PaymentManagement } from './PaymentManagement';
import { SystemReports } from './SystemReports';

const PlatformOwnerDashboard: React.FC = () => {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Platform Owner Dashboard</h1>
      
      <Tabs defaultValue="centerOwners" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="centerOwners">Center Owners</TabsTrigger>
          <TabsTrigger value="trainingCenters">Training Centers</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="centerOwners" className="mt-6">
          <Card className="p-6">
            <CenterOwnerManagement />
          </Card>
        </TabsContent>
        
        <TabsContent value="trainingCenters" className="mt-6">
          <Card className="p-6">
            <TrainingCenterApproval />
          </Card>
        </TabsContent>
        
        <TabsContent value="courses" className="mt-6">
          <Card className="p-6">
            <CourseMonitoring />
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6">
          <Card className="p-6">
            <PaymentManagement />
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <Card className="p-6">
            <SystemReports />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformOwnerDashboard;
