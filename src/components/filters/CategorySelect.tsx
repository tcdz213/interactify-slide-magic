
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useCategoryOptions } from "@/hooks/useCategoryOptions";

type CategorySelectProps = {
  value: string;
  onChange: (value: string) => void;
};

const CategorySelect = ({ value, onChange }: CategorySelectProps) => {
  const { getCategories } = useCategoryOptions();
  const [categoryOptions, setCategoryOptions] = useState([
    { value: "all", label: "All Categories" }
  ]);
  
  // Update categories when language changes
  useEffect(() => {
    try {
      setCategoryOptions(getCategories());
    } catch (e) {
      console.error("Error loading categories:", e);
      // Fallback to static categories if there's an error
    }
  }, []);

  return (
    <Select 
      value={value} 
      onValueChange={onChange}
    >
      <SelectTrigger className="min-w-[180px] py-6 rounded-lg">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categoryOptions.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelect;
