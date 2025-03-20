
import { useState } from "react";
import { centerService } from "@/services/centerService";
import { Center, CenterFormData } from "@/types/center.types";
import { useCenterFormState } from "./useCenterFormState";

export const useCenterOperations = (searchTerm: string) => {
  const { formData, setFormData, resetForm, toast } = useCenterFormState();
  const [centers, setCenters] = useState<Center[]>(centerService.getFilteredCenters(""));
  const [filteredCenters, setFilteredCenters] = useState<Center[]>(centers);

  const handleAddCenter = () => {
    const newCenter = centerService.addCenter(formData);
    setCenters(prev => [...prev, newCenter]);
    setFilteredCenters(centerService.getFilteredCenters(searchTerm));
    resetForm();
    
    toast({
      title: "Training center added",
      description: `${formData.name} has been added successfully.`,
    });
  };

  const handleEditCenter = (id: number) => {
    const updatedCenter = centerService.updateCenter(id, formData);
    if (updatedCenter) {
      setCenters(prev => prev.map(center => center.id === id ? updatedCenter : center));
      setFilteredCenters(centerService.getFilteredCenters(searchTerm));
      resetForm();
      
      toast({
        title: "Training center updated",
        description: `${formData.name} has been updated successfully.`,
      });
    }
  };

  const handleDeleteCenter = (id: number) => {
    if (centerService.deleteCenter(id)) {
      setCenters(prev => prev.filter(center => center.id !== id));
      setFilteredCenters(centerService.getFilteredCenters(searchTerm));
      
      toast({
        title: "Training center deleted",
        description: "The center has been deleted successfully.",
      });
    }
  };

  const handleVerifyCenter = (id: number) => {
    const updatedCenter = centerService.toggleVerification(id);
    if (updatedCenter) {
      setCenters(prev => prev.map(center => center.id === id ? updatedCenter : center));
      setFilteredCenters(centerService.getFilteredCenters(searchTerm));
      
      toast({
        title: updatedCenter.verified ? "Center verified" : "Center unverified",
        description: `${updatedCenter.name} has been ${updatedCenter.verified ? "" : "un"}verified.`,
      });
    }
  };

  return {
    centers,
    filteredCenters,
    setFilteredCenters,
    formData,
    setFormData,
    handleAddCenter,
    handleEditCenter,
    handleDeleteCenter,
    handleVerifyCenter,
    resetForm,
  };
};
