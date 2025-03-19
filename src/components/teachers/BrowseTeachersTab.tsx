
import React from "react";
import { TeacherBrowser } from "./TeacherBrowser";
import SearchBox from "../hero/SearchBox";

export const BrowseTeachersTab = () => {
  const handleTeacherSearch = (searchValue: string) => {
    console.log("Searching for teachers:", searchValue);
    // Here you would implement the actual search functionality
  };

  return (
    <div className="grid gap-6">
      <SearchBox 
        className="mb-6" 
        onSearch={handleTeacherSearch} 
      />
      <TeacherBrowser />
    </div>
  );
};
