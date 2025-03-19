
import { useEffect, useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryOptions } from "@/hooks/useCategoryOptions";

type SubcategorySelectProps = {
  value: string | null;
  categoryId: string | null;
  onChange: (value: string) => void;
};

const SubcategorySelect = ({ value, categoryId, onChange }: SubcategorySelectProps) => {
  const { getSubcategories } = useCategoryOptions();
  const [subcategories, setSubcategories] = useState([
    { value: "all", label: "All Subcategories" }
  ]);
  
  // Update subcategories when category changes
  useEffect(() => {
    try {
      setSubcategories(getSubcategories(categoryId));
      // Reset subcategory when category changes
      if (value !== 'all') {
        onChange('all');
      }
    } catch (e) {
      console.error("Error loading subcategories:", e);
      // Fallback to default if there's an error
      setSubcategories([{ value: "all", label: "All Subcategories" }]);
    }
  }, [categoryId]);

  return (
    <Select 
      value={value || 'all'} 
      onValueChange={onChange}
    >
      <SelectTrigger className="min-w-[180px] py-6 rounded-lg">
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
  );
};

export default SubcategorySelect;
