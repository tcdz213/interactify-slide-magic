import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import NavItem from "./NavItem";

interface NavGroupChild {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface NavGroupProps {
  label: string;
  icon: React.ElementType;
  children: NavGroupChild[];
  collapsed?: boolean;
  colorClass?: string;
  defaultOpen?: boolean;
  onExpandSidebar?: (groupLabel: string) => void;
  forceOpen?: boolean;
  onForceOpenHandled?: () => void;
}

export default function NavGroup({ label, icon: Icon, children, collapsed, colorClass, defaultOpen, onExpandSidebar, forceOpen, onForceOpenHandled }: NavGroupProps) {
  const location = useLocation();
  const hasActive = children.some(c => location.pathname.startsWith(c.path));
  const [open, setOpen] = useState(defaultOpen ?? hasActive);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasActive && !open) setOpen(true);
  }, [hasActive]);

  // Force open when clicking collapsed icon
  useEffect(() => {
    if (forceOpen && !collapsed) {
      setOpen(true);
      onForceOpenHandled?.();
      setTimeout(() => {
        groupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [forceOpen, collapsed]);

  const handleToggle = useCallback(() => {
    setOpen(prev => {
      const willOpen = !prev;
      if (willOpen) {
        setTimeout(() => {
          groupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
      return willOpen;
    });
  }, []);

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={() => onExpandSidebar?.(label)}
            className={cn(
              "relative flex items-center justify-center rounded-md p-2 w-full transition-all duration-200",
              hasActive
                ? "text-sidebar-primary bg-sidebar-primary/8"
                : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent/40"
            )}
          >
            <Icon className={cn("h-[16px] w-[16px]", colorClass)} />
            {/* Active dot indicator */}
            {hasActive && (
              <div className="absolute -end-0.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-sidebar-primary shadow-[0_0_6px_hsl(var(--sidebar-primary)/0.5)]" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={8}
          className="bg-sidebar/95 backdrop-blur-xl text-sidebar-foreground border-sidebar-border/25 shadow-xl"
        >
          <p className="text-xs font-semibold">{label}</p>
          <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">
            {children.length} items · Click to expand
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div ref={groupRef}>
      <button
        onClick={handleToggle}
        className={cn(
          "group/btn flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] font-semibold tracking-wide transition-all duration-200",
          hasActive
            ? "text-sidebar-primary bg-sidebar-primary/8"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
        )}
      >
        <Icon className={cn(
          "h-[14px] w-[14px] shrink-0 transition-colors duration-200",
          hasActive
            ? colorClass || "text-sidebar-primary drop-shadow-[0_0_4px_hsl(var(--sidebar-primary)/0.4)]"
            : "text-sidebar-foreground/35 group-hover/btn:text-sidebar-foreground/70"
        )} />
        <span className={cn(
          "flex-1 text-start truncate leading-none transition-colors duration-200",
          hasActive ? "text-sidebar-primary" : ""
        )}>{label}</span>
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <ChevronRight className={cn(
            "h-2.5 w-2.5 transition-colors duration-200",
            hasActive ? "text-sidebar-primary/40" : "text-sidebar-foreground/15 group-hover/btn:text-sidebar-foreground/30"
          )} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="ms-[17px] ps-2.5 mt-0.5 space-y-px border-s border-sidebar-border/15">
              {children.map(c => (
                <NavItem key={c.path} {...c} layoutId={`group-${label}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
