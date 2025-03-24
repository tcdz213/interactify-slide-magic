
import { useNavigate } from "react-router-dom";
import { memo } from "react";
import SidebarComponent from "@/components/SidebarComponent";
import ThemeControls from "@/components/ThemeControls";

// Memoized ThemeControls component to prevent unnecessary re-renders
const MemoizedThemeControls = memo(ThemeControls);

// Desktop version of NavActions - needed by other components
export function DesktopNavActions() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3">
      <MemoizedThemeControls />
      <SidebarComponent />
    </div>
  );
}

// Mobile version of NavActions - needed by other components
export function MobileNavActions({ toggleMenu }: { toggleMenu?: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <MemoizedThemeControls />
      <SidebarComponent />
    </div>
  );
}
