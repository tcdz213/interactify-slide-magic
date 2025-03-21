
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DateRange } from 'react-day-picker';

interface UserActivityReportProps {
  compact?: boolean;
  dateRange?: DateRange;
}

// Mock data generator - in a real app, this would fetch data based on the dateRange
const generateMockData = (dateRange?: DateRange) => {
  // This is just a placeholder - in a real app, you'd fetch data based on the date range
  return [
    { name: 'Week 1', learners: 400, teachers: 240, centerOwners: 100 },
    { name: 'Week 2', learners: 300, teachers: 139, centerOwners: 80 },
    { name: 'Week 3', learners: 200, teachers: 80, centerOwners: 70 },
    { name: 'Week 4', learners: 278, teachers: 190, centerOwners: 90 },
    { name: 'Week 5', learners: 189, teachers: 180, centerOwners: 60 },
  ];
};

export const UserActivityReport: React.FC<UserActivityReportProps> = ({ compact = false, dateRange }) => {
  const data = generateMockData(dateRange);
  
  if (compact) {
    return (
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Line type="monotone" dataKey="learners" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="teachers" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 text-center">
          <div className="text-2xl font-bold">1,234</div>
          <div className="text-xs text-muted-foreground">Active Users</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">875</div>
            <p className="text-xs text-muted-foreground">+12% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">320</div>
            <p className="text-xs text-muted-foreground">+5% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Center Owners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">+3% from last period</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Activity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="learners" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="teachers" stroke="#82ca9d" />
                <Line type="monotone" dataKey="centerOwners" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
