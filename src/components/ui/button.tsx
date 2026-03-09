import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* H1 — Primary: solid teal, main CTA */
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98]",
        /* H4 — Destructive: red for delete/remove */
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]",
        /* H2 — Outline/Secondary: outlined for secondary actions */
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent/10 hover:border-accent/60 hover:text-accent-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/70 active:scale-[0.98]",
        /* H3 — Ghost: text-only for tertiary/toolbar buttons */
        ghost:
          "hover:bg-accent/10 hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        "outline-destructive":
          "border border-destructive/40 bg-background text-destructive shadow-sm hover:bg-destructive/10 hover:border-destructive/70 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        /* H5 — Icon buttons: consistent sizing */
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-xs": "h-7 w-7 rounded-md",
        xs: "h-7 rounded-md px-2.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** H7 — Loading state: spinner replaces content, button disabled */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    if (asChild) {
      return <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>{children}</Slot>;
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? null : children}
      </button>
    );
  },
);
Button.displayName = "Button";

/* H6 — Button groups: toolbar pattern with dividers */
function ButtonGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-input bg-background shadow-sm [&>button]:rounded-none [&>button]:border-0 [&>button]:shadow-none [&>button:first-child]:rounded-s-lg [&>button:last-child]:rounded-e-lg [&>button+button]:border-s [&>button+button]:border-input",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* H8 — FAB (Floating Action Button) for mobile primary actions */
function FloatingActionButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "fixed bottom-6 end-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button, buttonVariants, ButtonGroup, FloatingActionButton };
