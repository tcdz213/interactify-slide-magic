import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  const getIcon = (variant?: string) => {
    const iconClass = "h-4 w-4 sm:h-5 sm:w-5 shrink-0";
    switch (variant) {
      case "success":
        return <CheckCircle2 className={iconClass} />;
      case "destructive":
        return <XCircle className={iconClass} />;
      case "warning":
        return <AlertCircle className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  return (
    <ToastProvider swipeDirection="up">
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            {getIcon(variant)}
            <div className="flex-1 grid gap-0.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
