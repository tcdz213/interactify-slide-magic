
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder
}) => {
  return (
    <div className="relative flex-grow">
      <Label htmlFor="search-input" className="sr-only">Search training centers</Label>
      <Input
        id="search-input"
        type="text"
        placeholder={placeholder}
        className="pl-10 h-12 w-full rounded-lg text-base focus-visible:ring-offset-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        aria-label={placeholder}
      />
      <Search 
        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" 
        aria-hidden="true" 
      />
    </div>
  );
};

export default SearchInput;
