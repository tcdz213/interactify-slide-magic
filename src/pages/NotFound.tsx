
import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import CTAButton from "@/components/CTAButton";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="relative animate-fade-in">
        <div className="mb-8 text-[120px] font-bold leading-none tracking-tight text-primary/10 sm:text-[150px]">
          404
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h1>
            <p className="text-muted-foreground">
              We couldn't find the page you were looking for.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-20 animate-fade-in" style={{animationDelay: '0.2s'}}>
        <a href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to home page</span>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
