
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { DesktopHeader } from './navigation/DesktopHeader';
import { MobileHeader } from './navigation/MobileHeader';
import { MobileMenu } from './navigation/MobileMenu';
import { useUiPreferences } from '@/redux/hooks';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { navigationStyle } = useUiPreferences();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-6 ${
        isScrolled 
          ? 'py-2 bg-background/95 backdrop-blur-md shadow-sm border-b border-border/40' 
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo - Common for both desktop and mobile */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">TC</span>
          </span>
          <span className={`font-medium text-lg transition-opacity duration-300 ${isScrolled ? 'text-primary' : 'text-primary'}`}>
            TrainingCenter
          </span>
        </Link>

        {/* Desktop Header */}
        <DesktopHeader isScrolled={isScrolled} />

        {/* Mobile Header and Menu Button */}
        <MobileHeader 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen}
        />
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

export default Header;
