
import { useState } from "react";
import { useDispatch } from "react-redux";
import { saveSearch } from "@/redux/slices/searchSlice";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface SaveSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SaveSearchDialog = ({ open, onOpenChange }: SaveSearchDialogProps) => {
  const [searchName, setSearchName] = useState("");
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleSave = () => {
    if (!searchName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your search",
        variant: "destructive",
      });
      return;
    }

    dispatch(saveSearch({ name: searchName, alertsEnabled }));
    toast({
      title: "Search saved",
      description: alertsEnabled 
        ? "You'll receive notifications when new courses match your criteria."
        : "Your search has been saved."
    });

    // Reset form and close dialog
    setSearchName("");
    setAlertsEnabled(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Your Search</DialogTitle>
          <DialogDescription>
            Save your search criteria for quick access. You can also enable alerts to get notified when new courses match.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="search-name" className="col-span-4">
              Name
            </Label>
            <Input
              id="search-name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g., Web Development Courses"
              className="col-span-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alerts">Enable email alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new courses match your criteria
              </p>
            </div>
            <Switch
              id="alerts"
              checked={alertsEnabled}
              onCheckedChange={setAlertsEnabled}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Search</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveSearchDialog;
