import { useState, useRef, useCallback, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
}

const THRESHOLD = 80;

export default function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      setPullDistance(Math.min(dy * 0.5, 120));
    }
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      navigator.vibrate?.(30);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPulling(false);
    setPullDistance(0);
  }, [pullDistance, refreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col h-full overflow-y-auto overscroll-y-contain", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all shrink-0"
        style={{ height: pullDistance > 10 ? pullDistance : 0 }}
      >
        <RefreshCw
          className={cn(
            "h-5 w-5 text-primary transition-transform",
            refreshing && "animate-spin",
            pullDistance >= THRESHOLD && "scale-125"
          )}
          style={{ transform: refreshing ? undefined : `rotate(${pullDistance * 3}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}
