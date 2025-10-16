import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  className = "" 
}: LoadingSpinnerProps) => {
  return (
    <div className={cn("inline-flex", className)}>
      <Logo 
        iconSize={size} 
        showText={false} 
        asLink={false}
        animated={true}
      />
    </div>
  );
};

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingState = ({ 
  message = "Loading...", 
  size = "md" 
}: LoadingStateProps) => {
  return (
    <div className="flex items-center justify-center gap-3 p-6">
      <Logo 
        iconSize={size} 
        showText={false} 
        asLink={false}
        animated={true}
      />
      <span className="text-muted-foreground animate-pulse">{message}</span>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-card rounded-2xl shadow-elegant border border-border overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-muted rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
};