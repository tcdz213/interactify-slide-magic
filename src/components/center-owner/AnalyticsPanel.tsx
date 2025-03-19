
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Slider } from "@/components/ui/slider";

// Mock data for analytics
const revenueData = [
  { month: "Jan", revenue: 2500, target: 3000 },
  { month: "Feb", revenue: 3200, target: 3000 },
  { month: "Mar", revenue: 2800, target: 3000 },
  { month: "Apr", revenue: 3500, target: 3000 },
  { month: "May", revenue: 4200, target: 3500 },
  { month: "Jun", revenue: 3800, target: 3500 },
  { month: "Jul", revenue: 4500, target: 4000 },
  { month: "Aug", revenue: 5200, target: 4000 },
  { month: "Sep", revenue: 4800, target: 4500 },
  { month: "Oct", revenue: 5500, target: 4500 },
  { month: "Nov", revenue: 6200, target: 5000 },
  { month: "Dec", revenue: 5800, target: 5000 },
];

const bookingData = [
  { month: "Jan", bookings: 45, year: "2023" },
  { month: "Feb", bookings: 52, year: "2023" },
  { month: "Mar", bookings: 48, year: "2023" },
  { month: "Apr", bookings: 61, year: "2023" },
  { month: "May", bookings: 67, year: "2023" },
  { month: "Jun", bookings: 58, year: "2023" },
  { month: "Jul", bookings: 63, year: "2023" },
  { month: "Aug", bookings: 72, year: "2023" },
  { month: "Sep", bookings: 65, year: "2023" },
  { month: "Oct", bookings: 68, year: "2023" },
  { month: "Nov", bookings: 74, year: "2023" },
  { month: "Dec", bookings: 70, year: "2023" },
];

const popularCoursesData = [
  { name: "Web Development", value: 35 },
  { name: "Data Science", value: 25 },
  { name: "Mobile App Dev", value: 20 },
  { name: "UI/UX Design", value: 15 },
  { name: "Machine Learning", value: 5 },
];

const studentDemographicsData = [
  { name: "18-24", value: 30 },
  { name: "25-34", value: 45 },
  { name: "35-44", value: 15 },
  { name: "45+", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const AnalyticsPanel = () => {
  const [timeRange, setTimeRange] = useState("year");
  const [year, setYear] = useState("2023");
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$48,500</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">+18% from last {timeRange}</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="text-xs text-muted-foreground">$0</div>
              <Slider 
                defaultValue={[73]} 
                max={100} 
                step={1}
                className="flex-1"
                disabled
              />
              <div className="text-xs text-muted-foreground">$65,000</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">73% of yearly goal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">743</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% from last {timeRange}</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="text-xs text-muted-foreground">0</div>
              <Slider 
                defaultValue={[68]} 
                max={100} 
                step={1}
                className="flex-1"
                disabled
              />
              <div className="text-xs text-muted-foreground">1,100</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">68% of yearly goal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Student Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.8 <span className="text-amber-500">★</span></div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">+0.3 from last {timeRange}</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="text-xs text-muted-foreground">1.0</div>
              <Slider 
                defaultValue={[96]} 
                max={100} 
                step={1}
                className="flex-1"
                disabled
              />
              <div className="text-xs text-muted-foreground">5.0</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">96% of perfect score</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#0088FE" activeDot={{ r: 8 }} name="Revenue" />
                    <Line type="monotone" dataKey="target" stroke="#FF8042" strokeDasharray="5 5" name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" fill="#0088FE" name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Popular Courses</CardTitle>
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
        </TabsContent>
        
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentDemographicsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {studentDemographicsData.map((entry, index) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPanel;
