import NavLinks from "./NavLinks";
import { DesktopNavActions } from "./NavActions";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/hooks/useWishlist";

interface DesktopHeaderProps {
  isScrolled?: boolean;
}

export const DesktopHeader = ({ isScrolled = false }: DesktopHeaderProps) => {
  const { favorites } = useWishlist();
  const navigate = useNavigate();

  const handleFavoritesClick = () => {
    navigate("/discover");
    // We need to wait for the page to load before selecting the tab
    setTimeout(() => {
      document
        .querySelector('[value="favorites"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, 100);
  };

  return (
    <div className="hidden md:flex items-center justify-between flex-1 ml-6">
      {/* Desktop Navigation */}
      <nav className="flex items-center space-x-6">
        <NavLinks />
      </nav>

      {/* Favorites Badge */}
      {favorites.length > 0 && (
        <button
          onClick={handleFavoritesClick}
          className="mr-4 flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
        >
          <Heart className="h-4 w-4 fill-primary text-primary" />
          <span className="text-sm font-medium">{favorites.length}</span>
        </button>
      )}

      {/* Desktop Actions */}
      <DesktopNavActions />
    </div>
  );
};
