
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash, MapPin, Users, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock data for centers
const initialCenters = [
  { 
    id: 1, 
    name: "Tech Training Hub", 
    location: "New York", 
    description: "Comprehensive tech training programs",
    capacity: 50,
    courseCount: 12,
    bookingsThisMonth: 24,
    status: "active" 
  },
  { 
    id: 2, 
    name: "Digital Skills Academy", 
    location: "San Francisco", 
    description: "Learn the latest digital skills",
    capacity: 35,
    courseCount: 8,
    bookingsThisMonth: 16,
    status: "active" 
  }
];

const CentersManagement = () => {
  const [centers, setCenters] = useState(initialCenters);
  const [isAddCenterOpen, setIsAddCenterOpen] = useState(false);
  const [isEditCenterOpen, setIsEditCenterOpen] = useState(false);
  const [isDeleteCenterOpen, setIsDeleteCenterOpen] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<any>(null);
  const [centerFormData, setCenterFormData] = useState({
    name: "",
    location: "",
    description: "",
    capacity: "",
  });
  
  const { toast } = useToast();

  // Center CRUD operations
  const handleAddCenter = () => {
    const newCenter = {
      id: centers.length + 1,
      name: centerFormData.name,
      location: centerFormData.location,
      description: centerFormData.description,
      capacity: parseInt(centerFormData.capacity) || 0,
      courseCount: 0,
      bookingsThisMonth: 0,
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
            description: centerFormData.description,
            capacity: parseInt(centerFormData.capacity) || center.capacity
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
      capacity: "",
    });
    setCurrentCenter(null);
  };

  const openEditCenter = (center: any) => {
    setCurrentCenter(center);
    setCenterFormData({
      name: center.name,
      location: center.location,
      description: center.description || "",
      capacity: center.capacity.toString(),
    });
    setIsEditCenterOpen(true);
  };

  const openDeleteCenter = (center: any) => {
    setCurrentCenter(center);
    setIsDeleteCenterOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Training Centers</h2>
        <Button onClick={() => setIsAddCenterOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Center
        </Button>
      </div>
      
      {centers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          You haven't added any training centers yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {centers.map((center) => (
            <div key={center.id} className="border rounded-lg overflow-hidden bg-card">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-xl">{center.name}</h3>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{center.location}</span>
                    </div>
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
                
                <p className="mt-3 text-muted-foreground">{center.description}</p>
                
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                    <Users className="h-4 w-4 mb-1 text-muted-foreground" />
                    <span className="font-medium">{center.capacity}</span>
                    <span className="text-xs text-muted-foreground">Capacity</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                    <Calendar className="h-4 w-4 mb-1 text-muted-foreground" />
                    <span className="font-medium">{center.bookingsThisMonth}</span>
                    <span className="text-xs text-muted-foreground">Bookings</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                    <div className="h-4 w-4 mb-1 flex items-center justify-center text-muted-foreground font-bold text-xs">
                      #
                    </div>
                    <span className="font-medium">{center.courseCount}</span>
                    <span className="text-xs text-muted-foreground">Courses</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
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
              <Label htmlFor="capacity">Capacity</Label>
              <Input 
                id="capacity" 
                type="number"
                value={centerFormData.capacity}
                onChange={(e) => setCenterFormData({...centerFormData, capacity: e.target.value})}
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
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input 
                id="edit-capacity"
                type="number"
                value={centerFormData.capacity}
                onChange={(e) => setCenterFormData({...centerFormData, capacity: e.target.value})}
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

export default CentersManagement;
