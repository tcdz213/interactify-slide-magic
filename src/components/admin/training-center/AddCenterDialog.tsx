
import React, { memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SubcategoryFilter from "@/components/filters/SubcategoryFilter";

interface AddCenterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    name: string;
    location: string;
    description: string;
    status: string;
    category?: string;
    subcategory?: string;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
}

const categoryOptions = [
  { value: "technology", label: "Technology" },
  { value: "programming", label: "Programming" },
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "healthcare", label: "Healthcare" },
];

const AddCenterDialog = ({ 
  isOpen, 
  onOpenChange, 
  formData, 
  setFormData, 
  onSubmit 
}: AddCenterDialogProps) => {
  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value,
      subcategory: null // Reset subcategory when category changes
    });
  };

  const handleSubcategoryChange = (value: string | null) => {
    setFormData({
      ...formData,
      subcategory: value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Training Center</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="name">Center Name</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category || ""} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.category && (
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <SubcategoryFilter
                value={formData.subcategory || null}
                categoryId={formData.category}
                onChange={handleSubcategoryChange}
              />
            </div>
          )}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit}>Add Center</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default memo(AddCenterDialog);
