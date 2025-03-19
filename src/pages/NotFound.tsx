
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Sponsors from "@/components/Sponsors";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6 relative">
            <div className="text-9xl font-bold text-primary/10">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl font-semibold text-primary">Not Found</div>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button className="gap-2" asChild>
              <a href="/">
                <Home className="h-4 w-4" />
                Return Home
              </a>
            </Button>
          </div>
        </div>
      </div>
      <Sponsors />
    </div>
  );
};

export default NotFound;
