
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Compass, Briefcase, Users } from "lucide-react";

export const NavItems = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <Link
        to="/"
        className={`${
          isActive("/") ? "text-primary font-medium" : "text-muted-foreground"
        } hover:text-foreground text-sm animated-underline transition-colors flex items-center gap-1.5 px-3 py-2`}
      >
        <Home className="h-4 w-4" />
        {t("header.home")}
      </Link>
      <Link
        to="/discover"
        className={`${
          isActive("/discover")
            ? "text-primary font-medium"
            : "text-muted-foreground"
        } hover:text-foreground text-sm animated-underline transition-colors flex items-center gap-1.5 px-3 py-2`}
      >
        <Compass className="h-4 w-4" />
        {t("header.discover")}
      </Link>
      <Link
        to="/teacher-job-listings"
        className={`${
          isActive("/teacher-job-listings")
            ? "text-primary font-medium"
            : "text-muted-foreground"
        } hover:text-foreground text-sm animated-underline transition-colors flex items-center gap-1.5 px-3 py-2`}
      >
        <Briefcase className="h-4 w-4" />
        {t("header.TeachingJobs")}
      </Link>
      <Link
        to="/community"
        className={`${
          isActive("/community")
            ? "text-primary font-medium"
            : "text-muted-foreground"
        } hover:text-foreground text-sm animated-underline transition-colors flex items-center gap-1.5 px-3 py-2`}
      >
        <Users className="h-4 w-4" />
        {t("header.community")}
      </Link>
    </>
  );
};
