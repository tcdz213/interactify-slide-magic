
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  updateSavedSearch, 
  deleteSavedSearch,
  SavedSearch
} from "@/redux/slices/searchSlice";
import { RootState } from "@/redux/store";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Bell, BellOff, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

const SavedSearches = () => {
  const savedSearches = useSelector((state: RootState) => state.search.savedSearches);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState<SavedSearch | null>(null);

  const handleToggleAlerts = (id: string, currentValue: boolean) => {
    dispatch(updateSavedSearch({ 
      id, 
      changes: { alertsEnabled: !currentValue } 
    }));
    
    toast({
      title: currentValue ? "Alerts disabled" : "Alerts enabled",
      description: currentValue 
        ? "You will no longer receive alerts for this search." 
        : "You'll now receive alerts when new courses match your criteria."
    });
  };

  const handleDeleteSearch = () => {
    if (selectedSearch) {
      dispatch(deleteSavedSearch(selectedSearch.id));
      setDeleteDialogOpen(false);
      setSelectedSearch(null);
      
      toast({
        title: "Search deleted",
        description: "Your saved search has been deleted."
      });
    }
  };

  const confirmDelete = (search: SavedSearch) => {
    setSelectedSearch(search);
    setDeleteDialogOpen(true);
  };

  if (savedSearches.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Search className="h-10 w-10 text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No saved searches</CardTitle>
          <CardDescription>
            Save your searches to quickly access them later and get notified when new courses match your criteria.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Saved Searches</CardTitle>
          <CardDescription>
            Manage your saved searches and notification alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <Card key={search.id} className="border border-border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base font-medium">{search.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Saved {format(new Date(search.createdAt), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center mr-2" onClick={(e) => e.stopPropagation()}>
                          <Switch 
                            id={`alert-${search.id}`}
                            checked={search.alertsEnabled}
                            onCheckedChange={() => handleToggleAlerts(search.id, search.alertsEnabled)}
                          />
                          {search.alertsEnabled ? 
                            <Bell className="h-4 w-4 ml-2 text-primary" /> : 
                            <BellOff className="h-4 w-4 ml-2 text-muted-foreground" />
                          }
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => confirmDelete(search)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {search.filters.searchQuery && (
                        <Badge variant="outline" className="text-xs">
                          "{search.filters.searchQuery}"
                        </Badge>
                      )}
                      {search.filters.category !== 'all' && (
                        <Badge variant="outline" className="text-xs">
                          Category: {search.filters.category}
                        </Badge>
                      )}
                      {search.filters.location !== 'all' && (
                        <Badge variant="outline" className="text-xs">
                          Location: {search.filters.location}
                        </Badge>
                      )}
                      {search.filters.features.map(feature => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-4">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // This would apply the saved filters and navigate to results
                      }}
                    >
                      <Search className="h-3 w-3 mr-1" />
                      Run Search
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Saved Search</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete "{selectedSearch?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSearch}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedSearches;
