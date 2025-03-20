import ThemeToggle from "@/components/ThemeToggle";
import CurrencySelect from "@/components/filters/CurrencySelect";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SidebarComponent from "@/components/SidebarComponent";

// Desktop version of NavActions - needed by other components
export function DesktopNavActions() {
  return (
    <div className="flex items-center gap-2">
      <SidebarComponent />
    </div>
  );
}

// Mobile version of NavActions - needed by other components
export function MobileNavActions({ toggleMenu }: { toggleMenu?: () => void }) {
  return <SidebarComponent />;
}
