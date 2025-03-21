
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DateRange } from 'react-day-picker';

// Mock data for center analytics
const centerGrowthData = [
  { month: 'Jan', centers: 180, courses: 550 },
  { month: 'Feb', centers: 195, courses: 590 },
  { month: 'Mar', centers: 210, courses: 645 },
  { month: 'Apr', centers: 230, courses: 720 },
  { month: 'May', centers: 250, courses: 810 },
  { month: 'Jun', centers: 270, courses: 900 },
];

const centerCategoryData = [
  { category: 'Language', count: 58 },
  { category: 'Technology', count: 72 },
  { category: 'Business', count: 45 },
  { category: 'Arts', count: 32 },
  { category: 'Health', count: 25 },
  { category: 'Other', count: 18 },
];

interface CenterReportProps {
  compact?: boolean;
  dateRange?: DateRange;
}

export const CenterReport: React.FC<CenterReportProps> = ({ compact = false, dateRange }) => {
  return (
    <Card className={compact ? 'h-[350px]' : ''}>
      <CardHeader>
        <CardTitle>Training Center Analytics</CardTitle>
        {!compact && (
          <CardDescription>Overview of training center growth and course offerings</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {compact ? (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={centerGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="centers" stroke="#8884d8" name="Training Centers" />
                <Line type="monotone" dataKey="courses" stroke="#82ca9d" name="Active Courses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-[300px]">
              <p className="text-sm font-medium mb-2">Growth Over Time</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={centerGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="centers" stroke="#8884d8" name="Training Centers" />
                  <Line type="monotone" dataKey="courses" stroke="#82ca9d" name="Active Courses" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-[300px]">
              <p className="text-sm font-medium mb-2">Centers by Category</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={centerCategoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Number of Centers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
