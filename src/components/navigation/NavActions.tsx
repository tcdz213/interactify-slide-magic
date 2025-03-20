
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import CurrencySelect from "@/components/filters/CurrencySelect";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SidebarComponent from "@/components/SidebarComponent";
import { Menu, Sparkles } from "lucide-react";

// Desktop version of NavActions - needed by other components
export function DesktopNavActions() {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/discover')}
          className="text-sm"
        >
          Discover
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/teachers')}
          className="text-sm"
        >
          Teachers
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/categories')}
          className="text-sm"
        >
          Categories
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/for-training-centers')}
          className="text-sm"
        >
          For Centers
        </Button>
        
        <Button 
          size="sm"
          onClick={() => navigate('/get-started')}
          className="text-sm"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Get Started
        </Button>
      </div>
      <SidebarComponent />
    </div>
  );
}

// Mobile version of NavActions - needed by other components
export function MobileNavActions({ toggleMenu }: { toggleMenu?: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        className="md:hidden" 
        onClick={toggleMenu}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <SidebarComponent />
    </div>
  );
}
