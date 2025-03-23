import { useNavigate } from "react-router-dom";
import SidebarComponent from "@/components/SidebarComponent";

// Desktop version of NavActions - needed by other components
export function DesktopNavActions() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3">
      <SidebarComponent />
    </div>
  );
}

// Mobile version of NavActions - needed by other components
export function MobileNavActions({ toggleMenu }: { toggleMenu?: () => void }) {
  return (
    <div className="  flex  items-center gap-2">
      <SidebarComponent />
    </div>
  );
}
