
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface AdminFiltersProps {
  onSearch: (term: string) => void;
  onFilter: (filter: string) => void;
  onStatusChange: (status: string) => void;
  filterOptions?: { value: string; label: string }[];
  statusOptions?: { value: string; label: string }[];
  placeholder?: string;
}

const AdminFilters = ({
  onSearch,
  onFilter,
  onStatusChange,
  filterOptions = [],
  statusOptions = [],
  placeholder = "Search..."
}: AdminFiltersProps) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <form onSubmit={handleSearch} className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="pl-10 w-full"
        />
        <Button 
          type="submit" 
          variant="ghost" 
          size="sm" 
          className="absolute right-0 top-0 h-full"
        >
          Search
        </Button>
      </form>
      
      {filterOptions.length > 0 && (
        <div className="w-full sm:w-40">
          <Select onValueChange={onFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {statusOptions.length > 0 && (
        <div className="w-full sm:w-40">
          <Select onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default AdminFilters;
