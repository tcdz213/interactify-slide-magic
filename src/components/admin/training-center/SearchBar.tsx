
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  updateSearchResults: (term: string) => void;
}

const SearchBar = ({ searchTerm, updateSearchResults }: SearchBarProps) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search centers..."
        className="pl-10"
        value={searchTerm}
        onChange={(e) => updateSearchResults(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
