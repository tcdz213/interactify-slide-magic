
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash, CalendarClock, DollarSign, Clock, User, BookOpen } from "lucide-react";
import CategorySelect from "./CategorySelect";
import { categories } from "@/data/categories";
import { useTranslation } from "react-i18next";

// Types
interface Course {
  id: number;
  title: string;
  description: string;
  centerId: number;
  centerName: string;
  categoryId: string;
  categoryName: string;
  schedule: string;
  duration: string;
  price: number;
  capacity: number;
  enrolledStudents: number;
}

interface Center {
  id: number;
  name: string;
}

// Mock data for centers
const mockCenters: Center[] = [
  { id: 1, name: "Tech Training Hub" },
  { id: 2, name: "Digital Skills Academy" },
];

// Mock data for courses
const mockCourses: Course[] = [
  {
    id: 1,
    title: "Web Development Fundamentals",
    description: "Learn the basics of HTML, CSS, and JavaScript to build responsive websites.",
    centerId: 1,
    centerName: "Tech Training Hub",
    categoryId: "101",
    categoryName: "Web Development",
    schedule: "Mondays and Wednesdays, 6-8 PM",
    duration: "8 weeks",
    price: 499,
    capacity: 20,
    enrolledStudents: 12,
  },
  {
    id: 2,
    title: "UX Design Principles",
    description: "Master the fundamentals of user experience design and create user-centered products.",
    centerId: 1,
    centerName: "Tech Training Hub",
    categoryId: "601",
    categoryName: "Graphic Design",
    schedule: "Tuesdays and Thursdays, 7-9 PM",
    duration: "6 weeks",
    price: 599,
    capacity: 15,
    enrolledStudents: 8,
  },
  {
    id: 3,
    title: "Data Science Basics",
    description: "Introduction to data analysis, visualization, and machine learning concepts.",
    centerId: 2,
    centerName: "Digital Skills Academy",
    categoryId: "105",
    categoryName: "Data Science",
    schedule: "Saturdays, 10 AM - 2 PM",
    duration: "10 weeks",
    price: 799,
    capacity: 18,
    enrolledStudents: 15,
  },
];

const CoursesManagement = () => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [centers] = useState<Center[]>(mockCenters);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    centerId: "",
    categoryId: "",
    schedule: "",
    duration: "",
    price: "",
    capacity: "",
  });
  
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "en" | "fr" | "ar";

  // Helper function to get category name based on categoryId
  const getCategoryName = (categoryId: string): string => {
    for (const category of categories) {
      const subcategory = category.subcategories.find(
        sub => sub.id.toString() === categoryId
      );
      if (subcategory) {
        return subcategory.name[currentLang];
      }
    }
    return "Unknown Category";
  };

  // Course CRUD operations
  const handleAddCourse = () => {
    const center = centers.find(c => c.id === parseInt(courseFormData.centerId));
    if (!center) {
      toast({
        title: "Error",
        description: "Please select a valid training center.",
        variant: "destructive",
      });
      return;
    }

    if (!courseFormData.categoryId) {
      toast({
        title: "Error",
        description: "Please select a category for the course.",
        variant: "destructive",
      });
      return;
    }

    const categoryName = getCategoryName(courseFormData.categoryId);

    const newCourse: Course = {
      id: courses.length + 1,
      title: courseFormData.title,
      description: courseFormData.description,
      centerId: parseInt(courseFormData.centerId),
      centerName: center.name,
      categoryId: courseFormData.categoryId,
      categoryName,
      schedule: courseFormData.schedule,
      duration: courseFormData.duration,
      price: parseFloat(courseFormData.price) || 0,
      capacity: parseInt(courseFormData.capacity) || 0,
      enrolledStudents: 0,
    };
    
    setCourses([...courses, newCourse]);
    setIsAddCourseOpen(false);
    resetCourseForm();
    
    toast({
      title: "Course added",
      description: `${courseFormData.title} has been added successfully.`,
    });
  };

  const handleEditCourse = () => {
    if (!currentCourse) return;
    
    const center = centers.find(c => c.id === parseInt(courseFormData.centerId));
    if (!center) {
      toast({
        title: "Error",
        description: "Please select a valid training center.",
        variant: "destructive",
      });
      return;
    }

    if (!courseFormData.categoryId) {
      toast({
        title: "Error",
        description: "Please select a category for the course.",
        variant: "destructive",
      });
      return;
    }

    const categoryName = getCategoryName(courseFormData.categoryId);

    const updatedCourses = courses.map(course => 
      course.id === currentCourse.id 
        ? { 
            ...course, 
            title: courseFormData.title,
            description: courseFormData.description,
            centerId: parseInt(courseFormData.centerId),
            centerName: center.name,
            categoryId: courseFormData.categoryId,
            categoryName,
            schedule: courseFormData.schedule,
            duration: courseFormData.duration,
            price: parseFloat(courseFormData.price) || course.price,
            capacity: parseInt(courseFormData.capacity) || course.capacity,
          } 
        : course
    );
    
    setCourses(updatedCourses);
    setIsEditCourseOpen(false);
    resetCourseForm();
    
    toast({
      title: "Course updated",
      description: `${courseFormData.title} has been updated successfully.`,
    });
  };

  const handleDeleteCourse = () => {
    if (!currentCourse) return;
    
    const updatedCourses = courses.filter(course => course.id !== currentCourse.id);
    setCourses(updatedCourses);
    setIsDeleteCourseOpen(false);
    
    toast({
      title: "Course deleted",
      description: `${currentCourse.title} has been deleted.`,
    });
  };

  const resetCourseForm = () => {
    setCourseFormData({
      title: "",
      description: "",
      centerId: "",
      categoryId: "",
      schedule: "",
      duration: "",
      price: "",
      capacity: "",
    });
    setCurrentCourse(null);
  };

  const openEditCourse = (course: Course) => {
    setCurrentCourse(course);
    setCourseFormData({
      title: course.title,
      description: course.description,
      centerId: course.centerId.toString(),
      categoryId: course.categoryId,
      schedule: course.schedule,
      duration: course.duration,
      price: course.price.toString(),
      capacity: course.capacity.toString(),
    });
    setIsEditCourseOpen(true);
  };

  const openDeleteCourse = (course: Course) => {
    setCurrentCourse(course);
    setIsDeleteCourseOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Courses Management</h2>
        <Button onClick={() => setIsAddCourseOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Course
        </Button>
      </div>
      
      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">You haven't added any courses yet.</p>
            <Button onClick={() => setIsAddCourseOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{course.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Center: {course.centerName}
                          </p>
                          <span className="text-muted-foreground">•</span>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{course.categoryName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditCourse(course)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteCourse(course)}>
                          <Trash className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                    
                    <p className="mt-3">{course.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        <span>{course.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Duration: {course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Price: ${course.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{course.enrolledStudents} / {course.capacity} students</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex md:hidden gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => openEditCourse(course)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteCourse(course)}>
                      <Trash className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Course Dialog */}
      <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="title">Course Title</Label>
              <Input 
                id="title" 
                value={courseFormData.title}
                onChange={(e) => setCourseFormData({...courseFormData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="center">Training Center</Label>
              <Select 
                value={courseFormData.centerId} 
                onValueChange={(value) => setCourseFormData({...courseFormData, centerId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a center" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((center) => (
                    <SelectItem key={center.id} value={center.id.toString()}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="category">Course Category</Label>
              <CategorySelect 
                value={courseFormData.categoryId}
                onChange={(value) => setCourseFormData({...courseFormData, categoryId: value})}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={courseFormData.description}
                onChange={(e) => setCourseFormData({...courseFormData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Input 
                  id="schedule" 
                  value={courseFormData.schedule}
                  onChange={(e) => setCourseFormData({...courseFormData, schedule: e.target.value})}
                  placeholder="e.g., Mon & Wed, 6-8 PM"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input 
                  id="duration" 
                  value={courseFormData.duration}
                  onChange={(e) => setCourseFormData({...courseFormData, duration: e.target.value})}
                  placeholder="e.g., 8 weeks"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input 
                  id="price" 
                  type="number"
                  value={courseFormData.price}
                  onChange={(e) => setCourseFormData({...courseFormData, price: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input 
                  id="capacity" 
                  type="number"
                  value={courseFormData.capacity}
                  onChange={(e) => setCourseFormData({...courseFormData, capacity: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCourse}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Course Dialog */}
      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-title">Course Title</Label>
              <Input 
                id="edit-title" 
                value={courseFormData.title}
                onChange={(e) => setCourseFormData({...courseFormData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-center">Training Center</Label>
              <Select 
                value={courseFormData.centerId} 
                onValueChange={(value) => setCourseFormData({...courseFormData, centerId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a center" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((center) => (
                    <SelectItem key={center.id} value={center.id.toString()}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-category">Course Category</Label>
              <CategorySelect 
                value={courseFormData.categoryId}
                onChange={(value) => setCourseFormData({...courseFormData, categoryId: value})}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                value={courseFormData.description}
                onChange={(e) => setCourseFormData({...courseFormData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-schedule">Schedule</Label>
                <Input 
                  id="edit-schedule" 
                  value={courseFormData.schedule}
                  onChange={(e) => setCourseFormData({...courseFormData, schedule: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-duration">Duration</Label>
                <Input 
                  id="edit-duration" 
                  value={courseFormData.duration}
                  onChange={(e) => setCourseFormData({...courseFormData, duration: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input 
                  id="edit-price" 
                  type="number"
                  value={courseFormData.price}
                  onChange={(e) => setCourseFormData({...courseFormData, price: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input 
                  id="edit-capacity" 
                  type="number"
                  value={courseFormData.capacity}
                  onChange={(e) => setCourseFormData({...courseFormData, capacity: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCourseOpen(false)}>Cancel</Button>
            <Button onClick={handleEditCourse}>Update Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Course Dialog */}
      <Dialog open={isDeleteCourseOpen} onOpenChange={setIsDeleteCourseOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete "{currentCourse?.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteCourseOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursesManagement;
