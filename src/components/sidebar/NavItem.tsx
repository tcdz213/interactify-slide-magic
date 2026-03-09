import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItemProps {
  label: string;
  icon: React.ElementType;
  path: string;
  collapsed?: boolean;
  layoutId?: string;
}

export default function NavItem({ label, icon: Icon, path, collapsed, layoutId = "nav-pill" }: NavItemProps) {
  const location = useLocation();
  const active = location.pathname === path;

  const linkContent = (
    <Link
      to={path}
      className={cn(
        "group/item relative flex items-center gap-2.5 rounded-lg text-[12.5px] tracking-wide transition-all duration-200",
        collapsed ? "justify-center p-2" : "px-2.5 py-[6px]",
        active
          ? "text-sidebar-primary font-semibold"
          : "text-sidebar-foreground/55 font-medium hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
      )}
    >
      {active && (
        <motion.div
          layoutId={collapsed ? undefined : layoutId}
          className={cn(
            "absolute inset-0 rounded-lg bg-sidebar-primary/10 ring-1 ring-sidebar-primary/15",
            !collapsed && "shadow-[0_0_16px_-4px_hsl(var(--sidebar-primary)/0.2)]"
          )}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      {active && collapsed && (
        <div className="absolute -end-0.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-sidebar-primary shadow-[0_0_6px_hsl(var(--sidebar-primary)/0.5)]" />
      )}
      <Icon className={cn(
        "relative z-10 shrink-0 transition-colors duration-200",
        collapsed ? "h-[16px] w-[16px]" : "h-[14px] w-[14px]",
        active
          ? "text-sidebar-primary drop-shadow-[0_0_4px_hsl(var(--sidebar-primary)/0.3)]"
          : "text-sidebar-foreground/30 group-hover/item:text-sidebar-foreground/65"
      )} />
      {!collapsed && (
        <span className="relative z-10 truncate leading-none">{label}</span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {linkContent}
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={8}
          className="bg-sidebar/95 backdrop-blur-xl text-sidebar-foreground border-sidebar-border/25 text-xs font-medium shadow-xl"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
