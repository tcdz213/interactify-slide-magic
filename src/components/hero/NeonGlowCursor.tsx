
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeonGlowCursorProps {
  className?: string;
}

const NeonGlowCursor = ({ className }: NeonGlowCursorProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === "undefined") return;

    // Set active after a small delay for initial animation
    const timer = setTimeout(() => setIsActive(true), 800);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  return (
    <motion.div
      className={cn(
        "fixed pointer-events-none z-10 opacity-0",
        isActive ? "opacity-100" : "",
        className
      )}
      animate={{
        x: mousePosition.x - 500, // Larger glow area
        y: mousePosition.y - 500, // Larger glow area
        transition: { type: "spring", damping: 40, stiffness: 150 }, // Softer movement
      }}
    >
      <div className="relative w-[0px] h-[0px]">
        {/* Primary glow - softer and larger */}
        <div className="absolute inset-0 w-[1000px] h-[1000px] rounded-full bg-primary/10 blur-[200px] will-change-transform" />

        {/* Secondary glow - softer */}
        <div className="absolute inset-1/4 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[150px] will-change-transform" />

        {/* Accent glow - softer pulsing */}
        <motion.div
          className="absolute inset-2/5 w-[250px] h-[250px] rounded-full bg-primary/5 blur-[100px] will-change-transform"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </div>
    </motion.div>
  );
};

export default NeonGlowCursor;
