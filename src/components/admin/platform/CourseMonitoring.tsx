
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, AlertTriangle } from 'lucide-react';

export const CourseMonitoring: React.FC = () => {
  // This would typically come from an API
  const courses = [
    { id: 1, name: 'Advanced Yoga', center: 'Yoga Retreat', students: 24, rating: 4.8, status: 'active' },
    { id: 2, name: 'Web Development Bootcamp', center: 'Tech Training Hub', students: 32, rating: 4.5, status: 'active' },
    { id: 3, name: 'Fitness Fundamentals', center: 'Fitness Forever', students: 18, rating: 3.9, status: 'flagged' },
    { id: 4, name: 'Spanish for Beginners', center: 'Language Center', students: 15, rating: 4.2, status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Monitoring</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Training Center</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>{course.center}</TableCell>
                  <TableCell>{course.students}</TableCell>
                  <TableCell>{course.rating}/5.0</TableCell>
                  <TableCell>
                    <Badge variant={course.status === 'active' ? 'default' : 'destructive'}>
                      {course.status === 'flagged' ? (
                        <span className="flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Flagged
                        </span>
                      ) : (
                        course.status.charAt(0).toUpperCase() + course.status.slice(1)
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseMonitoring;
