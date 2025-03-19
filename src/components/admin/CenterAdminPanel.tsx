
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Check, X, Edit, Trash, Plus, FileEdit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock data for centers
const mockCenters = [
  { 
    id: 1, 
    name: "Tech Training Hub", 
    location: "New York", 
    description: "Comprehensive tech training programs",
    status: "active" 
  },
  { 
    id: 2, 
    name: "Digital Skills Academy", 
    location: "San Francisco", 
    description: "Learn the latest digital skills",
    status: "active" 
  }
];

// Mock data for bookings
const mockBookings = [
  { 
    id: 1, 
    centerName: "Tech Training Hub", 
    studentName: "John Smith", 
    course: "Web Development Fundamentals", 
    date: "2023-11-15", 
    status: "pending" 
  },
  { 
    id: 2, 
    centerName: "Tech Training Hub", 
    studentName: "Sarah Johnson", 
    course: "UX Design Principles", 
    date: "2023-11-18", 
    status: "approved" 
  },
  { 
    id: 3, 
    centerName: "Digital Skills Academy", 
    studentName: "Michael Brown", 
    course: "Data Science Basics", 
    date: "2023-11-20", 
    status: "pending" 
  },
  { 
    id: 4, 
    centerName: "Digital Skills Academy", 
    studentName: "Emily Davis", 
    course: "Mobile App Development", 
    date: "2023-11-25", 
    status: "rejected" 
  },
];

const CenterAdminPanel = () => {
  const [centers, setCenters] = useState(mockCenters);
  const [bookings, setBookings] = useState(mockBookings);
  const [isAddCenterOpen, setIsAddCenterOpen] = useState(false);
  const [isEditCenterOpen, setIsEditCenterOpen] = useState(false);
  const [isDeleteCenterOpen, setIsDeleteCenterOpen] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<any>(null);
  const [centerFormData, setCenterFormData] = useState({
    name: "",
    location: "",
    description: "",
  });
  
  const { toast } = useToast();

  // Center CRUD operations
  const handleAddCenter = () => {
    const newCenter = {
      id: centers.length + 1,
      name: centerFormData.name,
      location: centerFormData.location,
      description: centerFormData.description,
      status: "active"
    };
    
    setCenters([...centers, newCenter]);
    setIsAddCenterOpen(false);
    resetCenterForm();
    
    toast({
      title: "Training center added",
      description: `${centerFormData.name} has been added successfully.`,
    });
  };

  const handleEditCenter = () => {
    const updatedCenters = centers.map(center => 
      center.id === currentCenter.id 
        ? { 
            ...center, 
            name: centerFormData.name, 
            location: centerFormData.location, 
            description: centerFormData.description
          } 
        : center
    );
    
    setCenters(updatedCenters);
    setIsEditCenterOpen(false);
    resetCenterForm();
    
    toast({
      title: "Training center updated",
      description: `${centerFormData.name} has been updated successfully.`,
    });
  };

  const handleDeleteCenter = () => {
    const updatedCenters = centers.filter(center => center.id !== currentCenter.id);
    setCenters(updatedCenters);
    setIsDeleteCenterOpen(false);
    
    toast({
      title: "Training center deleted",
      description: `${currentCenter.name} has been deleted.`,
    });
  };

  const resetCenterForm = () => {
    setCenterFormData({
      name: "",
      location: "",
      description: "",
    });
    setCurrentCenter(null);
  };

  const openEditCenter = (center: any) => {
    setCurrentCenter(center);
    setCenterFormData({
      name: center.name,
      location: center.location,
      description: center.description || "",
    });
    setIsEditCenterOpen(true);
  };

  const openDeleteCenter = (center: any) => {
    setCurrentCenter(center);
    setIsDeleteCenterOpen(true);
  };

  // Booking management
  const handleBookingAction = (id: number, status: string) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === id ? { ...booking, status } : booking
    );
    
    setBookings(updatedBookings);
    
    toast({
      title: `Booking ${status}`,
      description: `The booking has been ${status}.`,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Center Administration</h2>
      
      <Tabs defaultValue="centers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="centers">My Centers</TabsTrigger>
          <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
        </TabsList>
        
        {/* Centers Tab */}
        <TabsContent value="centers" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">My Training Centers</h3>
                <Button onClick={() => setIsAddCenterOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Center
                </Button>
              </div>
              
              {centers.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  You haven't added any training centers yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {centers.map((center) => (
                    <div key={center.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-lg">{center.name}</h4>
                          <p className="text-muted-foreground">{center.location}</p>
                          <p className="mt-2">{center.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditCenter(center)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteCenter(center)}>
                            <Trash className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bookings Tab */}
        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Booking Requests</h3>
                
                <div className="border rounded-md">
                  <div className="grid grid-cols-6 p-4 border-b font-medium">
                    <div>Student</div>
                    <div>Course</div>
                    <div>Center</div>
                    <div>Date</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  
                  {bookings.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No booking requests found.
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="grid grid-cols-6 p-4 border-b last:border-0 items-center">
                        <div>{booking.studentName}</div>
                        <div>{booking.course}</div>
                        <div>{booking.centerName}</div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {booking.date}
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            booking.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            booking.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex justify-end gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                                onClick={() => handleBookingAction(booking.id, 'approved')}
                              >
                                <Check className="h-4 w-4 mr-1" /> 
                                Accept
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={() => handleBookingAction(booking.id, 'rejected')}
                              >
                                <X className="h-4 w-4 mr-1" /> 
                                Refuse
                              </Button>
                            </>
                          )}
                          {booking.status !== 'pending' && (
                            <span className="text-sm text-muted-foreground">
                              {booking.status === 'approved' ? 'Accepted' : 'Refused'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Center Dialog */}
      <Dialog open={isAddCenterOpen} onOpenChange={setIsAddCenterOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Training Center</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="name">Center Name</Label>
              <Input 
                id="name" 
                value={centerFormData.name}
                onChange={(e) => setCenterFormData({...centerFormData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={centerFormData.location}
                onChange={(e) => setCenterFormData({...centerFormData, location: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={centerFormData.description}
                onChange={(e) => setCenterFormData({...centerFormData, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCenterOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCenter}>Add Center</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Center Dialog */}
      <Dialog open={isEditCenterOpen} onOpenChange={setIsEditCenterOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Training Center</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-name">Center Name</Label>
              <Input 
                id="edit-name" 
                value={centerFormData.name}
                onChange={(e) => setCenterFormData({...centerFormData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input 
                id="edit-location" 
                value={centerFormData.location}
                onChange={(e) => setCenterFormData({...centerFormData, location: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                value={centerFormData.description}
                onChange={(e) => setCenterFormData({...centerFormData, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCenterOpen(false)}>Cancel</Button>
            <Button onClick={handleEditCenter}>Update Center</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Center Dialog */}
      <Dialog open={isDeleteCenterOpen} onOpenChange={setIsDeleteCenterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete {currentCenter?.name}? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteCenterOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCenter}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CenterAdminPanel;
