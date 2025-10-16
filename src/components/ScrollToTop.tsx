import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AiOutlineUp } from "react-icons/ai";

const ChevronUp = AiOutlineUp;
import { cn } from "@/lib/utils";
export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => {
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    setIsVisible(scrollPercent > 20); // Show when scrolled 20% down
  };
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);
  
  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        "fixed bottom-24 right-4 z-50 rounded-full shadow-lg transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-4 w-4" />
    </Button>
  );
};