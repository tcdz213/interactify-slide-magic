/**
 * Phase 5 — Side panel drawer for viewing record details.
 */
import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Side: right (default) or left */
  side?: "right" | "left";
  /** Width class override */
  widthClass?: string;
  /** Footer content (actions) */
  footer?: ReactNode;
}

export default function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = "right",
  widthClass = "sm:max-w-md",
  footer,
}: DetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn("flex flex-col", widthClass)}>
        <SheetHeader className="pb-4 border-b border-border/50">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4 space-y-4">{children}</div>
        {footer && (
          <div className="border-t border-border/50 pt-4 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/** Helper: labeled detail row */
export function DetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  );
}
