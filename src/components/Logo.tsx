import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconSize?: "sm" | "md" | "lg";
  showText?: boolean;
  asLink?: boolean;
  animated?: boolean;
}

export const Logo = ({ 
  className, 
  iconSize = "md",
  showText = true,
  asLink = true,
  animated = false
}: LogoProps) => {
  const sizes = {
    sm: { container: "w-6 h-6", circle: "w-2 h-2", text: "text-base" },
    md: { container: "w-8 h-8", circle: "w-3 h-3", text: "text-xl" },
    lg: { container: "w-12 h-12", circle: "w-4 h-4", text: "text-2xl" }
  };

  const logoContent = (
    <>
      <div className={cn(
        "relative rounded-lg flex items-center justify-center",
        sizes[iconSize].container,
        animated && "animate-[pulse_2s_ease-in-out_infinite]"
      )}>
        {/* Interlocking circles representing twin/connection */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "rounded-full bg-gradient-primary opacity-90",
            sizes[iconSize].circle,
            "absolute left-1/3 transform -translate-x-1/2",
            animated && "animate-[scale-in_0.5s_ease-out]"
          )} />
          <div className={cn(
            "rounded-full bg-gradient-accent opacity-90",
            sizes[iconSize].circle,
            "absolute right-1/3 transform translate-x-1/2",
            animated && "animate-[scale-in_0.5s_ease-out_0.1s]"
          )} />
        </div>
        
        {/* Connection symbol - a link between the circles */}
        <div className={cn(
          "absolute w-2/3 h-0.5 bg-gradient-twin opacity-80",
          animated && "animate-fade-in"
        )} />
      </div>
      {showText && (
        <span className={cn(
          "font-bold bg-gradient-twin bg-clip-text text-transparent",
          sizes[iconSize].text,
          animated && "animate-fade-in"
        )}>
          Bee-Twin
        </span>
      )}
    </>
  );

  if (asLink) {
    return (
      <Link 
        to="/" 
        className={cn("flex items-center space-x-2", className)}
        aria-label="Bee-Twin Home"
      >
        {logoContent}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {logoContent}
    </div>
  );
};
