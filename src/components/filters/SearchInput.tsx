
import { KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
};

const SearchInput = ({ value, onChange, onSearch }: SearchInputProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="relative flex-grow">
      <Input
        type="text"
        placeholder="Search training centers or courses..."
        className="pl-10 py-6 rounded-lg"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
    </div>
  );
};

export default SearchInput;
