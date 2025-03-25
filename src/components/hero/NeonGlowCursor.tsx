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
    const timer = setTimeout(() => setIsActive(true), 500);

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
        x: mousePosition.x - 400,
        y: mousePosition.y - 400,
        transition: { type: "spring", damping: 30, stiffness: 200 },
      }}
    >
      <div className="relative w-[0px] h-[0px]">
        {/* Primary glow */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-[100px] will-change-transform" />

        {/* Secondary glow */}
        <div className="absolute inset-1/4 rounded-full bg-secondary/20 blur-[80px] will-change-transform" />

        {/* Accent glow */}
        <motion.div
          className="absolute inset-2/5 rounded-full bg-luxury-gold/30 blur-[60px] will-change-transform"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </div>
    </motion.div>
  );
};

export default NeonGlowCursor;
