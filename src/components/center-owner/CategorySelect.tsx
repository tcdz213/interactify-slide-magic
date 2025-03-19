
import React from "react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/categories";
import { useTranslation } from "react-i18next";

type CategorySelectProps = {
  value: string;
  onChange: (value: string) => void;
};

const CategorySelect = ({ value, onChange }: CategorySelectProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "en" | "fr" | "ar";
  
  return (
    <Select 
      value={value} 
      onValueChange={onChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectGroup key={category.id}>
            <SelectLabel>{category.name[currentLang]}</SelectLabel>
            {category.subcategories.map((subcategory) => (
              <SelectItem 
                key={subcategory.id} 
                value={subcategory.id.toString()}
              >
                {subcategory.name[currentLang]}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelect;
