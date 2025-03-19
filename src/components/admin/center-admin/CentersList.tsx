
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import CenterItem from "./CenterItem";
import AddCenterDialog from "./dialogs/AddCenterDialog";
import EditCenterDialog from "./dialogs/EditCenterDialog";
import DeleteCenterDialog from "./dialogs/DeleteCenterDialog";
import { useCentersRedux } from "@/hooks/useCentersRedux";
import { Center } from "@/types/center.types";

const CentersList = () => {
  const [isAddCenterOpen, setIsAddCenterOpen] = useState(false);
  const [isEditCenterOpen, setIsEditCenterOpen] = useState(false);
  const [isDeleteCenterOpen, setIsDeleteCenterOpen] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<Center | null>(null);
  
  const { 
    centers, 
    formData, 
    setFormData, 
    handleAddCenter, 
    handleEditCenter, 
    handleDeleteCenter, 
    resetForm,
    loadCenters
  } = useCentersRedux();

  // Load centers on component mount
  useEffect(() => {
    loadCenters();
  }, []);

  const openEditCenter = (center: Center) => {
    setCurrentCenter(center);
    setFormData({
      name: center.name,
      location: center.location,
      description: center.description || "", // Add fallback for description
      status: center.status,
    });
    setIsEditCenterOpen(true);
  };

  const openDeleteCenter = (center: Center) => {
    setCurrentCenter(center);
    setIsDeleteCenterOpen(true);
  };

  const handleSubmitEdit = () => {
    if (currentCenter) {
      handleEditCenter(currentCenter.id);
      setIsEditCenterOpen(false);
    }
  };

  const handleSubmitDelete = () => {
    if (currentCenter) {
      handleDeleteCenter(currentCenter.id);
      setIsDeleteCenterOpen(false);
    }
  };

  return (
    <div>
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
            <CenterItem 
              key={center.id} 
              center={{
                id: center.id,
                name: center.name,
                location: center.location,
                description: center.description || "" // Ensure description is provided
              }}
              onEdit={openEditCenter} 
              onDelete={openDeleteCenter} 
            />
          ))}
        </div>
      )}
      
      {/* Add Center Dialog */}
      <AddCenterDialog 
        isOpen={isAddCenterOpen} 
        onOpenChange={setIsAddCenterOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={() => {
          handleAddCenter();
          setIsAddCenterOpen(false);
        }}
      />
      
      {/* Edit Center Dialog */}
      <EditCenterDialog 
        isOpen={isEditCenterOpen} 
        onOpenChange={setIsEditCenterOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmitEdit}
      />
      
      {/* Delete Center Dialog */}
      <DeleteCenterDialog 
        isOpen={isDeleteCenterOpen} 
        onOpenChange={setIsDeleteCenterOpen}
        center={currentCenter}
        onConfirm={handleSubmitDelete}
      />
    </div>
  );
};

export default CentersList;
