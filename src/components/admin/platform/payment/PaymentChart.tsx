
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for the chart
const monthlyData = [
  { month: 'Jan', revenue: 4000, subscriptions: 25 },
  { month: 'Feb', revenue: 3000, subscriptions: 22 },
  { month: 'Mar', revenue: 2000, subscriptions: 18 },
  { month: 'Apr', revenue: 2780, subscriptions: 20 },
  { month: 'May', revenue: 1890, subscriptions: 17 },
  { month: 'Jun', revenue: 2390, subscriptions: 19 },
  { month: 'Jul', revenue: 3490, subscriptions: 23 },
  { month: 'Aug', revenue: 4000, subscriptions: 25 },
  { month: 'Sep', revenue: 4500, subscriptions: 28 },
  { month: 'Oct', revenue: 5200, subscriptions: 32 },
  { month: 'Nov', revenue: 5800, subscriptions: 35 },
  { month: 'Dec', revenue: 6000, subscriptions: 38 },
];

const quarterlyData = [
  { quarter: 'Q1', revenue: 9000, subscriptions: 65 },
  { quarter: 'Q2', revenue: 7060, subscriptions: 56 },
  { quarter: 'Q3', revenue: 11990, subscriptions: 76 },
  { quarter: 'Q4', revenue: 17000, subscriptions: 105 },
];

const planData = [
  { plan: 'Basic', revenue: 12000, subscriptions: 120 },
  { plan: 'Premium', revenue: 18000, subscriptions: 90 },
  { plan: 'Advanced', revenue: 24000, subscriptions: 75 },
];

export const PaymentChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [chartType, setChartType] = useState('bar');
  
  const getChartData = () => {
    switch(timeframe) {
      case 'monthly':
        return monthlyData;
      case 'quarterly':
        return quarterlyData;
      case 'byPlan':
        return planData;
      default:
        return monthlyData;
    }
  };
  
  const getXAxisDataKey = () => {
    switch(timeframe) {
      case 'monthly':
        return 'month';
      case 'quarterly':
        return 'quarter';
      case 'byPlan':
        return 'plan';
      default:
        return 'month';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between px-6">
        <CardTitle>Payment Analytics</CardTitle>
        <div className="flex space-x-2">
          <Select 
            value={timeframe} 
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="byPlan">By Plan</SelectItem>
            </SelectContent>
          </Select>
          
          <Tabs value={chartType} onValueChange={setChartType} className="w-[150px]">
            <TabsList>
              <TabsTrigger value="bar" className="w-1/2">Bar</TabsTrigger>
              <TabsTrigger value="line" className="w-1/2">Line</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={getChartData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getXAxisDataKey()} />
                <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#82ca9d" />
                <Bar yAxisId="right" dataKey="subscriptions" name="Subscriptions" fill="#8884d8" />
              </BarChart>
            ) : (
              <LineChart
                data={getChartData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getXAxisDataKey()} />
                <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#82ca9d" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="subscriptions" name="Subscriptions" stroke="#8884d8" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
