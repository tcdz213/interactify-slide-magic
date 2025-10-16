import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: number;
  className?: string;
  fullScreen?: boolean;
}

export const LoadingState = ({ 
  message = "Loading...", 
  size = 60,
  className,
  fullScreen = false
}: LoadingStateProps) => {
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4",
      fullScreen ? "min-h-screen" : "py-12",
      className
    )}>
      <Logo 
        iconSize="lg" 
        showText={true} 
        asLink={false}
        animated={true}
      />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse" role="status" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );

  return content;
};
