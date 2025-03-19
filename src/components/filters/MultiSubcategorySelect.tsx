
import { useEffect, useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCategoryOptions } from "@/hooks/useCategoryOptions";
import { ScrollArea } from "@/components/ui/scroll-area";

type MultiSubcategorySelectProps = {
  values: string[];
  categoryId: string | null;
  onChange: (values: string[]) => void;
};

const MultiSubcategorySelect = ({ values, categoryId, onChange }: MultiSubcategorySelectProps) => {
  const { getSubcategories } = useCategoryOptions();
  const [subcategories, setSubcategories] = useState<{ value: string; label: string }[]>([]);
  
  // Update subcategories when category changes
  useEffect(() => {
    try {
      const options = getSubcategories(categoryId);
      // Filter out the "All Subcategories" option
      setSubcategories(options.filter(option => option.value !== "all"));
    } catch (e) {
      console.error("Error loading subcategories:", e);
      setSubcategories([]);
    }
  }, [categoryId]);

  const handleToggleSubcategory = (subcategoryId: string) => {
    if (values.includes(subcategoryId)) {
      onChange(values.filter(id => id !== subcategoryId));
    } else {
      onChange([...values, subcategoryId]);
    }
  };

  if (!categoryId || categoryId === 'all' || subcategories.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        Select a category first to see subcategories
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px] w-full pr-3">
      <div className="space-y-3">
        {subcategories.map((subcategory) => (
          <div key={subcategory.value} className="flex items-center space-x-2">
            <Checkbox 
              id={`subcategory-${subcategory.value}`}
              checked={values.includes(subcategory.value)}
              onCheckedChange={() => handleToggleSubcategory(subcategory.value)}
            />
            <Label 
              htmlFor={`subcategory-${subcategory.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {subcategory.label}
            </Label>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MultiSubcategorySelect;
