
import { useEffect } from "react";

const SmoothScroll = () => {
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

  return null;
};

export default SmoothScroll;
