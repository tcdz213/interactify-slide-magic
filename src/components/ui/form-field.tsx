/**
 * Phase G — FormField, FormSection, FormGrid, and form input classes.
 * G1: Consistent height (40px), border color, focus ring
 * G2: Label above input, optional required asterisk
 * G3: Form layout: 2-column grid for wide dialogs
 * G5: Validation errors: red border + message below, shake animation
 * G7: Form sections: dividers with section titles
 */
import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, icon, hint, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/70">
        {icon && <span className="text-primary/70">{icon}</span>}
        {label}
        {required && <span className="text-destructive ms-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground/80 leading-tight">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-destructive leading-tight flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive flex-none" />
          {error}
        </p>
      )}
    </div>
  );
}

/** G7 — Section divider inside a dialog form */
interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, icon, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 pt-2">
        {icon && (
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
        )}
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{title}</h4>
        <div className="flex-1 h-px bg-gradient-to-r from-border/80 to-transparent" />
      </div>
      {children}
    </div>
  );
}

/** G3 — Form grid: 2-column for wide dialogs, single column for narrow */
interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Styled input matching the design system */
export const formInputClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed";

/** Error variant of formInputClass */
export const formInputErrorClass =
  "h-10 w-full rounded-lg border border-destructive/60 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-destructive/30 focus:border-destructive/60 animate-shake disabled:opacity-50 disabled:cursor-not-allowed";

/** Styled select matching the design system */
export const formSelectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed";

/** Styled textarea matching the design system */
export const formTextareaClass =
  "w-full min-h-[88px] rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 hover:border-primary/40 resize-none";
