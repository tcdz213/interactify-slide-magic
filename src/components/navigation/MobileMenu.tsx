import { Link, useLocation } from "react-router-dom";
import { MobileNavActions } from "./NavActions";
import { cn } from "@/lib/utils";
import { Home, Compass, Briefcase, Users, Info, Mail } from "lucide-react";

interface MobileMenuProps {
  toggleMenu: () => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export const MobileMenu = ({
  toggleMenu,
  isOpen,
  setIsOpen,
}: MobileMenuProps) => {
  const location = useLocation();

  const links = [
    { name: "Home", path: "/", icon: Home },
    { name: "Discover", path: "/discover", icon: Compass },
    { name: "Teaching Jobs", path: "/teacher-job-listings", icon: Briefcase },
    { name: "Community", path: "/community", icon: Users },
    { name: "About", path: "/about", icon: Info },
    {
      name: "Getstrted",
      path: "/get-started",
      icon: Mail,
      className: "bg-primary text-primary",
    },
  ];

  return (
    <div
      className={`md:hidden border-b border-border bg-background ${
        !isOpen ? "hidden" : ""
      }`}
    >
      <div className="container-custom py-5">
        <nav className="grid gap-3">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={toggleMenu}
              className={cn(
                "flex items-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                location.pathname === link.path
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
            >
              <link.icon className="h-4 w-4 mr-2" />
              {link.name}
            </Link>
          ))}
        </nav>

        <MobileNavActions toggleMenu={toggleMenu} />
      </div>
    </div>
  );
};
