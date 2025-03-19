
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { subcategoryOptions } from './types';

type SubcategoryFilterProps = {
  value: string | null;
  categoryId: string | null;
  onChange: (value: string | null) => void;
  className?: string;
};

const SubcategoryFilter = ({ value, categoryId, onChange, className }: SubcategoryFilterProps) => {
  // Use memoized subcategories based on the selected category
  const subcategories = useMemo(() => {
    if (!categoryId || categoryId === 'all') {
      return subcategoryOptions.default;
    }
    
    return subcategoryOptions[categoryId as keyof typeof subcategoryOptions] || subcategoryOptions.default;
  }, [categoryId]);
  
  // Reset subcategory when category changes
  useEffect(() => {
    if (value !== 'all' && value !== null) {
      onChange('all');
    }
  }, [categoryId]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Subcategory</h3>
      <Select 
        value={value || 'all'} 
        onValueChange={(newValue) => onChange(newValue === 'all' ? null : newValue)}
        disabled={!categoryId || categoryId === 'all'}
      >
        <SelectTrigger className={`w-full ${className}`}>
          <SelectValue placeholder="Select subcategory" />
        </SelectTrigger>
        <SelectContent>
          {subcategories.map((subcategory) => (
            <SelectItem key={subcategory.value} value={subcategory.value}>
              {subcategory.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SubcategoryFilter;
