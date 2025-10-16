import Lottie from "lottie-react";
import noResultsAnimation from "@/assets/no-results-animation.json";

interface AnimatedNoResultsProps {
  size?: number;
  className?: string;
}

export const AnimatedNoResults = ({
  size = 100,
  className
}: AnimatedNoResultsProps) => {
  return (
    <div className={`${className} flex flex-col items-center gap-2`}>
      <div style={{ width: size, height: size }}>
        <Lottie
          animationData={noResultsAnimation}
          loop={true}
          autoplay={true}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice'
          }}
        />
      </div>
    </div>
  );
};