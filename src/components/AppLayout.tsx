import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import PageTransition from "./PageTransition";
import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebar from "./AppSidebar";
import ControlCenterTopbar from "./ControlCenterTopbar";
import { cn } from "@/lib/utils";
import OfflineStatusBar from "./OfflineStatusBar";

export default function AppLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("jawda-sidebar-collapsed") === "true");

  useEffect(() => {
    const check = () => setSidebarCollapsed(localStorage.getItem("jawda-sidebar-collapsed") === "true");
    const interval = setInterval(check, 200);
    window.addEventListener("storage", check);
    return () => { clearInterval(interval); window.removeEventListener("storage", check); };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-to-content">Aller au contenu principal</a>
      <AppSidebar />
      <div className={cn(
        "transition-all duration-300",
        isMobile ? "ms-0" : sidebarCollapsed ? "ms-14" : "ms-60"
      )}>
        <ControlCenterTopbar isMobile={isMobile} />
        <main id="main-content" className="p-4 md:p-6" tabIndex={-1}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <OfflineStatusBar />
    </div>
  );
}
