
import { Menu, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/redux/hooks";

interface MobileHeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

export const MobileHeader = ({
  isMenuOpen,
  setIsMenuOpen,
}: MobileHeaderProps) => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="md:hidden flex items-center space-x-2">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
        className="p-1.5 rounded-md hover:bg-muted"
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
};
