
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DateRange } from 'react-day-picker';

// Mock data for teacher analytics
const teacherRegistrationData = [
  { month: 'Jan', registrations: 45 },
  { month: 'Feb', registrations: 52 },
  { month: 'Mar', registrations: 48 },
  { month: 'Apr', registrations: 70 },
  { month: 'May', registrations: 65 },
  { month: 'Jun', registrations: 85 },
];

const teacherSpecializationData = [
  { name: 'Language', value: 30 },
  { name: 'STEM', value: 25 },
  { name: 'Arts', value: 15 },
  { name: 'Business', value: 20 },
  { name: 'Other', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface TeacherReportProps {
  compact?: boolean;
  dateRange?: DateRange;
}

export const TeacherReport: React.FC<TeacherReportProps> = ({ compact = false, dateRange }) => {
  return (
    <Card className={compact ? 'h-[350px]' : ''}>
      <CardHeader>
        <CardTitle>Teacher Analytics</CardTitle>
        {!compact && (
          <CardDescription>Overview of teacher registrations and specializations</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={compact ? 'h-[260px]' : 'h-[300px]'}>
            <p className="text-sm font-medium mb-2">Teacher Registrations</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teacherRegistrationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="registrations" fill="#8884d8" name="New Teachers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className={compact ? 'h-[260px]' : 'h-[300px]'}>
            <p className="text-sm font-medium mb-2">Specialization Distribution</p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teacherSpecializationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={compact ? 70 : 90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {teacherSpecializationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {!compact && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <TeacherMetricCard title="Active Teachers" value="1,245" change="+15%" />
            <TeacherMetricCard title="Avg. Rating" value="4.7" icon="★" />
            <TeacherMetricCard title="Job Applications" value="3,850" change="+22%" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TeacherMetricCard = ({ 
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
