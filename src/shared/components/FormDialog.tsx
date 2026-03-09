/**
 * Phase G — Standardized FormDialog with size variants and loading state.
 */
import { ReactNode } from "react";
import { LucideIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  type DialogSize,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  submitLabel?: string;
  onSubmit?: () => void;
  cancelLabel?: string;
  submitDisabled?: boolean;
  submitting?: boolean;
  submitVariant?: "default" | "destructive";
  /** Dialog size: sm (400px), md (560px), lg (720px), xl (960px) */
  size?: DialogSize;
  /** @deprecated Use `size` instead */
  maxWidth?: string;
  footerExtra?: ReactNode;
}

export default function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
  submitLabel = "Enregistrer",
  onSubmit,
  cancelLabel = "Annuler",
  submitDisabled = false,
  submitting = false,
  submitVariant = "default",
  size = "default",
  maxWidth,
  footerExtra,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={size} className={cn(maxWidth)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4.5 w-4.5" />
              </div>
            )}
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 py-2">{children}</div>

        {onSubmit && (
          <DialogFooter className="gap-2 sm:gap-0">
            {footerExtra && <div className="me-auto">{footerExtra}</div>}
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {cancelLabel}
            </Button>
            <Button
              variant={submitVariant}
              onClick={onSubmit}
              disabled={submitDisabled || submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "" : submitLabel}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
