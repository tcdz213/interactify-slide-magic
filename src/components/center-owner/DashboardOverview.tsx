
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, TrendingUp, BookOpen } from "lucide-react";

// Mock data for dashboard
const overviewStats = [
  { id: 1, title: "Total Bookings", value: "256", change: "+12% from last month", icon: BookOpen },
  { id: 2, title: "Active Students", value: "128", change: "+5% from last month", icon: Users },
  { id: 3, title: "Total Revenue", value: "$8,560", change: "+15% from last month", icon: TrendingUp },
  { id: 4, title: "Upcoming Sessions", value: "24", change: "Next 7 days", icon: Calendar },
];

const DashboardOverview = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
          <Card key={stat.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "John Smith", course: "Web Development", date: "Today, 10:00 AM", status: "Confirmed" },
                { name: "Sarah Johnson", course: "UX Design", date: "Tomorrow, 2:00 PM", status: "Pending" },
                { name: "Michael Brown", course: "Data Science", date: "Oct 25, 9:30 AM", status: "Confirmed" },
              ].map((booking, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{booking.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{booking.date}</p>
                    <p className={`text-xs ${
                      booking.status === "Confirmed" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-amber-600 dark:text-amber-400"
                    }`}>
                      {booking.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Popular Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Web Development Fundamentals", students: 45, rating: 4.8 },
                { name: "UX/UI Design Principles", students: 38, rating: 4.7 },
                { name: "Data Science Basics", students: 32, rating: 4.9 },
              ].map((course, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-muted-foreground">{course.students} students</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-amber-500 mr-1">★</span>
                    <span>{course.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
