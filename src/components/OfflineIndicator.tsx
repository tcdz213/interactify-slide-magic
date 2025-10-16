import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const [show, setShow] = useState(!isOnline);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
      setJustCameOnline(false);
    } else if (show) {
      // Show "back online" message briefly
      setJustCameOnline(true);
      const timer = setTimeout(() => {
        setShow(false);
        setJustCameOnline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, show]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-50 p-3 rounded-lg shadow-lg backdrop-blur-md animate-slide-up",
        justCameOnline
          ? "bg-success-default/90 text-success-on border border-success-light"
          : "bg-destructive/90 text-destructive-foreground border border-destructive"
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3">
        {justCameOnline ? (
          <Wifi className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        ) : (
          <WifiOff className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        )}
        <div className="flex-1">
          <p className="font-semibold text-sm">
            {justCameOnline ? "Back Online" : "No Internet Connection"}
          </p>
          <p className="text-xs opacity-90">
            {justCameOnline
              ? "You're connected again"
              : "Some features may not be available"}
          </p>
        </div>
      </div>
    </div>
  );
};
