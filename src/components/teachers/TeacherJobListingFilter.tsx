
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";

interface FilterProps {
  onFilterChange: (filters: any) => void;
  totalResults: number;
}

export const TeacherJobListingFilter = ({ onFilterChange, totalResults }: FilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchQuery });
  };
  
  return (
    <Card className="mb-6 dark:bg-gray-800/80 dark:border-gray-700 dark:backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <form className="relative flex-1" onSubmit={handleSearch}>
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search teaching positions..." 
              className="pl-9 dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-200 filter-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <div className="flex flex-wrap gap-3">
            <Select defaultValue="all" onValueChange={(value) => onFilterChange({ location: value })}>
              <SelectTrigger className="w-[180px] dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-200 filter-select-trigger">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700 filter-select-content">
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="new_york">New York</SelectItem>
                <SelectItem value="san_francisco">San Francisco</SelectItem>
                <SelectItem value="chicago">Chicago</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="all" onValueChange={(value) => onFilterChange({ specialization: value })}>
              <SelectTrigger className="w-[180px] dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-200 filter-select-trigger">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700 filter-select-content">
                <SelectItem value="all">All Specializations</SelectItem>
                <SelectItem value="web_dev">Web Development</SelectItem>
                <SelectItem value="data_science">Data Science</SelectItem>
                <SelectItem value="ui_design">UI Design</SelectItem>
                <SelectItem value="marketing">Digital Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="dark:text-gray-300">{totalResults} results found</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Sort by:</span>
            <Select defaultValue="newest">
              <SelectTrigger className="w-[150px] h-8 text-xs dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-200 filter-select-trigger">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700 filter-select-content">
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="salary_high">Highest salary</SelectItem>
                <SelectItem value="salary_low">Lowest salary</SelectItem>
                <SelectItem value="relevance">Relevance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
