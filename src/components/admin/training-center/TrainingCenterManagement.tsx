
import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List as ListIcon } from "lucide-react";
import { useCenters } from "./useCenters";
import CentersList from "./CentersList";
import AddCenterDialog from "./AddCenterDialog";
import EditCenterDialog from "./EditCenterDialog";
import DeleteCenterDialog from "./DeleteCenterDialog";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import SubcategoryFilter from "@/components/filters/SubcategoryFilter";
import { Center } from "@/types/center.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TrainingCenterManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<Center | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { 
    centers, 
    filteredCenters,
    handleAddCenter, 
    handleEditCenter, 
    handleDeleteCenter, 
    handleVerifyCenter,
    resetForm,
    formData,
    setFormData,
    updateSearchResults,
    selectedCategory,
    selectedSubcategory,
    handleCategoryChange,
    handleSubcategoryChange
  } = useCenters(searchTerm);

  const openEditDialog = useCallback((center: Center) => {
    setCurrentCenter(center);
    setFormData({
      name: center.name,
      location: center.location,
      description: center.description || "",
      status: center.status,
      category: center.category || "",
      subcategory: center.subcategory || "",
    });
    setIsEditDialogOpen(true);
  }, [setFormData]);

  const openDeleteDialog = useCallback((center: Center) => {
    setCurrentCenter(center);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    updateSearchResults(term);
  }, [updateSearchResults]);

  const handleViewModeChange = useCallback((value: string) => {
    setViewMode(value as "grid" | "list");
  }, []);

  // No results message
  const noResultsMessage = useMemo(() => {
    if (filteredCenters.length === 0) {
      if (searchTerm || selectedCategory || selectedSubcategory) {
        return "No centers match your search criteria. Try adjusting your filters.";
      }
      return "No training centers found. Add your first center with the button above.";
    }
    return null;
  }, [filteredCenters.length, searchTerm, selectedCategory, selectedSubcategory]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Training Center Management</CardTitle>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4 mr-2" /> Add Center
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="w-full md:flex-1">
              <SearchBar searchTerm={searchTerm} updateSearchResults={handleSearch} />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <CategoryFilter 
                  selectedCategory={selectedCategory} 
                  onCategoryChange={handleCategoryChange} 
                />
                {selectedCategory && (
                  <div className="flex items-center space-x-2">
                    <SubcategoryFilter
                      value={selectedSubcategory}
                      categoryId={selectedCategory}
                      onChange={handleSubcategoryChange}
                      className="w-[180px] h-10"
                    />
                  </div>
                )}
              </div>
              <Tabs value={viewMode} onValueChange={handleViewModeChange}>
                <TabsList>
                  <TabsTrigger value="grid">
                    <Grid className="h-4 w-4 mr-1" />
                    Grid
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <ListIcon className="h-4 w-4 mr-1" />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="mt-4">
            {noResultsMessage ? (
              <div className="text-center py-8 text-muted-foreground">
                {noResultsMessage}
              </div>
            ) : (
              <CentersList 
                centers={filteredCenters}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onVerify={handleVerifyCenter}
                viewMode={viewMode}
              />
            )}
          </div>
        </CardContent>
      </Card>
      
      <AddCenterDialog 
        isOpen={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddCenter}
      />
      
      <EditCenterDialog 
        isOpen={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={() => currentCenter && handleEditCenter(currentCenter.id)}
      />
      
      <DeleteCenterDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
        center={currentCenter}
        onConfirm={() => currentCenter && handleDeleteCenter(currentCenter.id)}
      />
    </div>
  );
};

export default React.memo(TrainingCenterManagement);
