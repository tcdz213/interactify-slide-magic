
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock data for analytics
const userEngagementData = [
  { name: "Jan", visitors: 4000, signups: 2400, active: 2000 },
  { name: "Feb", visitors: 3000, signups: 1398, active: 2210 },
  { name: "Mar", visitors: 2000, signups: 9800, active: 2290 },
  { name: "Apr", visitors: 2780, signups: 3908, active: 2000 },
  { name: "May", visitors: 1890, signups: 4800, active: 2181 },
  { name: "Jun", visitors: 2390, signups: 3800, active: 2500 },
  { name: "Jul", visitors: 3490, signups: 4300, active: 2100 },
];

const popularCoursesData = [
  { name: "Web Development", value: 35 },
  { name: "Data Science", value: 25 },
  { name: "Mobile App Dev", value: 20 },
  { name: "UI/UX Design", value: 15 },
  { name: "Machine Learning", value: 5 },
];

const reviewsOverTimeData = [
  { month: "Jan", positive: 65, neutral: 25, negative: 10 },
  { month: "Feb", positive: 70, neutral: 20, negative: 10 },
  { month: "Mar", positive: 60, neutral: 30, negative: 10 },
  { month: "Apr", positive: 75, neutral: 15, negative: 10 },
  { month: "May", positive: 80, neutral: 15, negative: 5 },
  { month: "Jun", positive: 75, neutral: 20, negative: 5 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const AnalyticsReports = () => {
  const [reportType, setReportType] = useState("engagement");
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Analytics & Reports</h2>
        <p className="text-muted-foreground mt-1">
          View key metrics and performance insights for the platform.
        </p>
      </div>
      
      <Tabs defaultValue="engagement" className="w-full" onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="courses">Popular Courses</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="engagement">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24,893</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">18,472</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8.3% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">74.2%</div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">-1.5% from last month</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Monthly user engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userEngagementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visitors" stroke="#8884d8" />
                    <Line type="monotone" dataKey="signups" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="active" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="courses">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">347</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+24 new this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12,458</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+15.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">68.7%</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+2.3% from last month</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Categories</CardTitle>
                <CardDescription>Distribution of enrollments by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={popularCoursesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {popularCoursesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Courses</CardTitle>
                <CardDescription>Courses with highest enrollment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Complete Web Development Bootcamp", enrollment: 1245, rating: 4.8 },
                    { name: "Data Science Fundamentals", enrollment: 987, rating: 4.7 },
                    { name: "React JS Masterclass", enrollment: 876, rating: 4.9 },
                    { name: "Python for Beginners", enrollment: 754, rating: 4.6 },
                    { name: "UI/UX Design Principles", enrollment: 698, rating: 4.5 },
                  ].map((course, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {course.enrollment} enrollments
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-amber-500 font-bold">{course.rating}</div>
                        <div className="text-amber-500 ml-1">★</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reviews">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8,742</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+458 new this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.6 <span className="text-amber-500">★</span></div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+0.2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Response Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">92.5%</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+1.8% from last month</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Reviews Over Time</CardTitle>
              <CardDescription>Distribution of review sentiment by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reviewsOverTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="positive" stackId="a" fill="#4ade80" name="Positive" />
                    <Bar dataKey="neutral" stackId="a" fill="#facc15" name="Neutral" />
                    <Bar dataKey="negative" stackId="a" fill="#f87171" name="Negative" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsReports;
