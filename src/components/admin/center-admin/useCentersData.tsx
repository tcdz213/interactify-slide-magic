
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

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

export const useCentersData = () => {
  const [centers, setCenters] = useState(mockCenters);
  const [centerFormData, setCenterFormData] = useState({
    name: "",
    location: "",
    description: "",
  });
  
  const { toast } = useToast();
  
  const resetCenterForm = () => {
    setCenterFormData({
      name: "",
      location: "",
      description: "",
    });
  };

  const handleAddCenter = () => {
    const newCenter = {
      id: centers.length + 1,
      name: centerFormData.name,
      location: centerFormData.location,
      description: centerFormData.description,
      status: "active"
    };
    
    setCenters([...centers, newCenter]);
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
    resetCenterForm();
    
    toast({
      title: "Training center updated",
      description: `${centerFormData.name} has been updated successfully.`,
    });
  };

  const handleDeleteCenter = () => {
    const updatedCenters = centers.filter(center => center.id !== currentCenter.id);
    setCenters(updatedCenters);
    
    toast({
      title: "Training center deleted",
      description: `${currentCenter.name} has been deleted.`,
    });
  };

  // This variable is needed by the hook for its internal logic
  let currentCenter: any = null;

  return {
    centers,
    centerFormData,
    setCenterFormData,
    handleAddCenter,
    handleEditCenter,
    handleDeleteCenter,
    resetCenterForm,
  };
};
