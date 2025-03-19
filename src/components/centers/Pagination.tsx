
import React from 'react';
import { Button } from "@/components/ui/button";

const Pagination: React.FC = () => {
  return (
    <div className="flex justify-center mt-12">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" disabled>
          <svg className="h-4 w-4 rotate-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
        {[1, 2, 3, 4, 5].map((page) => (
          <Button
            key={page}
            variant={page === 1 ? "default" : "outline"}
            size="icon"
            className="w-9 h-9"
          >
            {page}
          </Button>
        ))}
        <Button variant="outline" size="icon">
          <svg className="h-4 w-4 -rotate-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
