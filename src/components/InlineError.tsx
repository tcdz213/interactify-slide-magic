import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface InlineErrorProps {
  message: string;
  title?: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
  className?: string;
}

export const InlineError = ({ 
  message, 
  title,
  onDismiss,
  autoDismiss = true,
  dismissDelay = 5000,
  className = ""
}: InlineErrorProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss && dismissDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, dismissDelay);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <Alert 
      variant="destructive" 
      className={`animate-fade-in border-destructive/50 bg-destructive/10 ${className}`}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div className="text-sm">{message}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-destructive/20"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};
