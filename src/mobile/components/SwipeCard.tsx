import { useState, useRef, type ReactNode } from "react";
import { Phone, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

const SWIPE_THRESHOLD = 80;

export default function SwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = "Commander",
  rightLabel = "Appeler",
  className,
}: SwipeCardProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const swiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    swiping.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping.current) return;
    const dx = e.touches[0].clientX - startX.current;
    // Limit offset
    setOffset(Math.max(-120, Math.min(120, dx)));
  };

  const handleTouchEnd = () => {
    swiping.current = false;
    if (offset > SWIPE_THRESHOLD && onSwipeRight) {
      navigator.vibrate?.(30);
      onSwipeRight();
    } else if (offset < -SWIPE_THRESHOLD && onSwipeLeft) {
      navigator.vibrate?.(30);
      onSwipeLeft();
    }
    setOffset(0);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Reveal layers behind */}
      {offset > 10 && (
        <div className="absolute inset-0 flex items-center justify-start pl-4 bg-emerald-500 rounded-xl">
          <div className="flex items-center gap-2 text-white font-semibold text-xs">
            <Phone className="h-4 w-4" />
            {rightLabel}
          </div>
        </div>
      )}
      {offset < -10 && (
        <div className="absolute inset-0 flex items-center justify-end pr-4 bg-primary rounded-xl">
          <div className="flex items-center gap-2 text-primary-foreground font-semibold text-xs">
            {leftLabel}
            <ShoppingCart className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className="relative z-10 transition-transform"
        style={{ transform: `translateX(${offset}px)`, transition: swiping.current ? "none" : "transform 0.3s ease-out" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
