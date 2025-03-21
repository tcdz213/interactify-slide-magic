
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DateRange } from 'react-day-picker';

// Mock data for course analytics
const courseCompletionData = [
  { month: 'Jan', completed: 320, enrolled: 520 },
  { month: 'Feb', completed: 350, enrolled: 580 },
  { month: 'Mar', completed: 410, enrolled: 650 },
  { month: 'Apr', completed: 480, enrolled: 720 },
  { month: 'May', completed: 520, enrolled: 780 },
  { month: 'Jun', completed: 580, enrolled: 850 },
];

const popularCoursesData = [
  { name: 'Web Development', students: 850 },
  { name: 'Business English', students: 720 },
  { name: 'Data Science', students: 680 },
  { name: 'Digital Marketing', students: 550 },
  { name: 'UI/UX Design', students: 480 },
];

interface CourseReportProps {
  compact?: boolean;
  dateRange?: DateRange;
}

export const CourseReport: React.FC<CourseReportProps> = ({ compact = false, dateRange }) => {
  return (
    <Card className={compact ? 'h-[350px]' : ''}>
      <CardHeader>
        <CardTitle>Course Analytics</CardTitle>
        {!compact && (
          <CardDescription>Overview of course enrollments and completions</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {compact ? (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={courseCompletionData} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="enrolled" fill="#8884d8" name="Enrolled" />
                <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-[300px]">
              <p className="text-sm font-medium mb-2">Course Completion Rates</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={courseCompletionData} 
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrolled" fill="#8884d8" name="Enrolled" />
                  <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-[300px]">
              <p className="text-sm font-medium mb-2">Most Popular Courses</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={popularCoursesData} 
                  layout="vertical" 
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#82ca9d" name="Active Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <CourseMetricCard title="Total Courses" value="1,850" change="+12%" />
              <CourseMetricCard title="Avg. Completion Rate" value="72%" change="+5%" />
              <CourseMetricCard title="Avg. Rating" value="4.6" icon="★" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CourseMetricCard = ({ 
  title, 
  value, 
  change, 
  icon 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  icon?: string;
}) => {
  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="flex items-center mt-1">
        <span className="text-2xl font-bold">{value}</span>
        {icon && <span className="ml-1 text-amber-500">{icon}</span>}
        {change && <span className="ml-2 text-xs text-green-600">{change}</span>}
      </div>
    </div>
  );
};
