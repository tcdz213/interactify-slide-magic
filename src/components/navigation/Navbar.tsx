
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";
import { MobileMenu } from "./MobileMenu";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when switching to desktop view
  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMobile, isMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container-custom h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">TC</span>
          </span>
          <span className="font-medium text-lg">TrainingCenter</span>
        </Link>

        {/* Desktop Header */}
        <DesktopHeader isScrolled={isScrolled} />

        {/* Nav Actions / Profile */}
        <div className="flex items-center space-x-4">
          <MobileHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        toggleMenu={toggleMenu}
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
      />
    </header>
  );
};

export default Navbar;
