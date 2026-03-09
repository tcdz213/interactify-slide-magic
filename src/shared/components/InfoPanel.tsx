/**
 * Phase E5 — InfoPanel: split-panel layout (left sidebar + right content).
 * Used for detail views like vehicle detail, order detail, etc.
 */
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InfoPanelProps {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
  /** Width of the sidebar panel */
  sidebarWidth?: "narrow" | "default" | "wide";
}

const widthMap = {
  narrow: "w-56",
  default: "w-72",
  wide: "w-80",
};

export default function InfoPanel({
  sidebar,
  children,
  className,
  sidebarWidth = "default",
}: InfoPanelProps) {
  return (
    <div className={cn("flex rounded-xl border bg-card shadow-[var(--shadow-card)] overflow-hidden", className)}>
      {/* Left sidebar */}
      <div className={cn(
        "shrink-0 border-e border-border/60 bg-muted/30 p-5",
        widthMap[sidebarWidth],
        "hidden md:block"
      )}>
        {sidebar}
      </div>
      {/* Right content */}
      <div className="flex-1 min-w-0 p-5">
        {children}
      </div>
    </div>
  );
}
