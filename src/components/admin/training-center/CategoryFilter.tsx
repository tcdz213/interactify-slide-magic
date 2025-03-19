
import React, { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categories = [
  { label: "All Categories", value: null },
  { label: "Technology", value: "technology" },
  { label: "Programming", value: "programming" },
  { label: "Engineering", value: "engineering" },
  { label: "Design", value: "design" },
  { label: "Business", value: "business" },
  { label: "Healthcare", value: "healthcare" },
];

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium">Category:</label>
      <Select 
        value={selectedCategory || ""} 
        onValueChange={(value) => onCategoryChange(value || null)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value || "all"} value={category.value || ""}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Using memo to prevent unnecessary re-renders
export default memo(CategoryFilter);
