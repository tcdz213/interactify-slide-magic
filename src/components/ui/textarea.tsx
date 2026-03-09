import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[88px] w-full rounded-lg border bg-background px-3 py-2.5 text-sm ring-offset-background transition-all duration-150 resize-none",
        "placeholder:text-muted-foreground/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60",
        "hover:border-primary/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-destructive/60 focus-visible:ring-destructive/30 focus-visible:border-destructive/60 animate-shake"
          : "border-input",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
