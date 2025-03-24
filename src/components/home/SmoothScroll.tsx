
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SmoothScroll = () => {
  const location = useLocation();

  useEffect(() => {
    // Smooth scroll handling for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor && anchor.getAttribute("href")?.startsWith("#")) {
        e.preventDefault();
        const id = anchor.getAttribute("href")?.slice(1);
        const element = document.getElementById(id || "");

        if (element) {
          window.scrollTo({
            top: element.offsetTop - 100, // Offset for header
            behavior: "smooth",
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  // Control scroll restoration on route changes
  useEffect(() => {
    // Always scroll to top on route changes for all pages
    window.scrollTo({
      top: 0,
      behavior: "instant", // Use instant to avoid animation on page change
    });

    // Update history state with current path to track navigation
    const prevPath = window.history.state?.prevPath;
    if (prevPath !== location.pathname) {
      window.history.replaceState(
        { ...window.history.state, prevPath: location.pathname },
        ""
      );
    }
  }, [location]);

  return null;
};

export default SmoothScroll;
