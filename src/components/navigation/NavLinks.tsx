import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Home, Compass, Briefcase, Users, Info, Mail } from "lucide-react";

const NavLinks = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const links = [
    { name: "Home", path: "/", icon: Home },
    { name: "Discover", path: "/discover", icon: Compass },
    { name: "Teaching Jobs", path: "/teacher-job-listings", icon: Briefcase },
    { name: "Community", path: "/community", icon: Users },
    { name: "About", path: "/about", icon: Info },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-2">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={cn(
            "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors hover:text-foreground rounded-md",
            location.pathname === link.path
              ? "text-foreground bg-accent/50"
              : "text-muted-foreground hover:bg-accent/30"
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.name}
          {location.pathname === link.path && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </Link>
      ))}
    </nav>
  );
};

export default NavLinks;
