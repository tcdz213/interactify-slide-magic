
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import SaveSearchDialog from "./SaveSearchDialog";
import { useState } from "react";

interface FilterActionsProps {
  hasActiveFilters: boolean;
  onSaveSearch: () => void;
}

const FilterActions = ({ hasActiveFilters, onSaveSearch }: FilterActionsProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  if (!hasActiveFilters) return null;

  return (
    <>
      <div className="mt-3 md:mt-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setShowSaveDialog(true)}
        >
          <Save className="h-3 w-3 md:h-4 md:w-4" />
          <span className="text-xs md:text-sm">Save this search</span>
        </Button>
      </div>

      <SaveSearchDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
      />
    </>
  );
};

export default FilterActions;
