
import React, { useState } from 'react';
import { DateRangePicker } from './DateRangePicker';
import { RevenueReport } from './RevenueReport';
import { UserActivityReport } from './UserActivityReport';
import { TeacherReport } from './TeacherReport';
import { CenterReport } from './CenterReport';
import { CourseReport } from './CourseReport';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const PlatformReportDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Platform Performance</h2>
        <DateRangePicker 
          dateRange={dateRange}
          onChange={setDateRange}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="centers">Centers</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueReport compact dateRange={dateRange} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <UserActivityReport compact dateRange={dateRange} />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Teacher Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <TeacherReport compact dateRange={dateRange} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Center Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <CenterReport compact dateRange={dateRange} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Course Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CourseReport compact dateRange={dateRange} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <RevenueReport dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <UserActivityReport dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="centers" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <CenterReport dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="courses" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <CourseReport dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
