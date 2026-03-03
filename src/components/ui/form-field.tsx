/**
 * FormField — Polished, consistent form field wrapper for CRUD dialogs.
 * Provides label, optional icon, hint text, error display, and proper spacing.
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
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground/80 leading-tight">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-destructive leading-tight flex items-center gap-1">
          <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Section divider inside a dialog form */
interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, icon, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 pt-1">
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

/** Styled input matching the design system */
export const formInputClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed";

/** Styled select matching the design system */
export const formSelectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed";

/** Styled textarea matching the design system */
export const formTextareaClass =
  "w-full min-h-[88px] rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 hover:border-primary/40 resize-none";
