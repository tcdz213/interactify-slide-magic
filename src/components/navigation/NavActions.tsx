
import { useNavigate } from "react-router-dom";
import SidebarComponent from "@/components/SidebarComponent";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useCourseWishlist } from "@/hooks/courses";

// Desktop version of NavActions - needed by other components
export function DesktopNavActions() {
  const navigate = useNavigate();
  const { favorites } = useCourseWishlist();

  const handleGoToFavorites = () => {
    navigate("/discover");
    setTimeout(() => {
      document.querySelector('[value="favorites"]')?.dispatchEvent(
        new MouseEvent("click", { bubbles: true })
      );
    }, 100);
  };

  return (
    <div className="flex items-center gap-3">
      <Button 
        size="sm" 
        variant="ghost" 
        className="flex items-center relative"
        onClick={handleGoToFavorites}
      >
        <Heart className="h-5 w-5" />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </Button>
      <SidebarComponent />
    </div>
  );
}

// Mobile version of NavActions - needed by other components
export function MobileNavActions({ toggleMenu }: { toggleMenu?: () => void }) {
  const { favorites } = useCourseWishlist();
  const navigate = useNavigate();

  const handleGoToFavorites = () => {
    navigate("/discover");
    if (toggleMenu) toggleMenu();
    setTimeout(() => {
      document.querySelector('[value="favorites"]')?.dispatchEvent(
        new MouseEvent("click", { bubbles: true })
      );
    }, 100);
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        variant="ghost" 
        className="flex items-center relative"
        onClick={handleGoToFavorites}
      >
        <Heart className="h-5 w-5" />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </Button>
      <SidebarComponent />
    </div>
  );
}
