
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { DateRange } from 'react-day-picker';

interface RevenueReportProps {
  compact?: boolean;
  dateRange?: DateRange;
}

// Mock data - in a real app, this would come from an API based on the dateRange
const generateMockData = (dateRange?: DateRange) => {
  // This is just a placeholder - in a real app, you'd fetch data based on the date range
  return [
    { name: 'Jan', revenue: 4000, profit: 2400, expenses: 1600 },
    { name: 'Feb', revenue: 3000, profit: 1398, expenses: 1602 },
    { name: 'Mar', revenue: 2000, profit: 800, expenses: 1200 },
    { name: 'Apr', revenue: 2780, profit: 1908, expenses: 872 },
    { name: 'May', revenue: 1890, profit: 1800, expenses: 90 },
    { name: 'Jun', revenue: 2390, profit: 1200, expenses: 1190 },
    { name: 'Jul', revenue: 3490, profit: 2300, expenses: 1190 },
  ];
};

export const RevenueReport: React.FC<RevenueReportProps> = ({ compact = false, dateRange }) => {
  const data = generateMockData(dateRange);
  
  if (compact) {
    return (
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 text-center">
          <div className="text-2xl font-bold">$34,500</div>
          <div className="text-xs text-muted-foreground">Total Revenue</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$34,500</div>
            <p className="text-xs text-muted-foreground">+2.5% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,300</div>
            <p className="text-xs text-muted-foreground">+1.2% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$22,200</div>
            <p className="text-xs text-muted-foreground">+3.1% from last period</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
                <Bar dataKey="profit" fill="#82ca9d" />
                <Bar dataKey="expenses" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
