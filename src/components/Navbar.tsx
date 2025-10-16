import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BarChart3, User, Plus } from "@/components/ui/icon";
import { Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/hooks/use-language";
import { useCards } from "@/hooks/use-cards";
import { useCheckAdmin } from "@/hooks/use-check-admin";
import { isAuthenticated } from "@/services/cardApi";
const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { cards } = useCards();
  const { isAdmin } = useCheckAdmin();
  const hasCards = isAuthenticated() && cards.length > 0;
  const isActive = (path: string) => location.pathname === path;
  return <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8" role="search">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" aria-hidden="true" />
              <Input placeholder={t("search")} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-card border-border" aria-label={t("search")} />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
            
            {/* Admin Dashboard Button */}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Admin</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>;
};
export default Navbar;