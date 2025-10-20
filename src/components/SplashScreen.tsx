import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  isVisible: boolean;
}

export const SplashScreen = ({ isVisible }: SplashScreenProps) => {
  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background",
        "animate-fade-in"
      )}
    >
      <div className="flex flex-col items-center gap-6 animate-bounce-in">
        <Logo 
          iconSize="lg" 
          showText={true} 
          asLink={false}
          animated={true}
          className="scale-150"
        />
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-[bounce_1s_ease-in-out_infinite]" />
          <div className="w-2 h-2 bg-red-500 rounded-full animate-[bounce_1s_ease-in-out_0.1s_infinite]" />
          <div className="w-2 h-2 bg-red-500 rounded-full animate-[bounce_1s_ease-in-out_0.2s_infinite]" />
        </div>
      </div>
    </div>
  );
};
