import Lottie from "lottie-react";
import loadingAnimation from "@/assets/loading-animation.json";

interface AnimatedLoadingProps {
  size?: number;
  className?: string;
}

export const AnimatedLoading = ({ 
  size = 60, 
  className 
}: AnimatedLoadingProps) => {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Lottie
        animationData={loadingAnimation}
        loop={true}
        autoplay={true}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice'
        }}
      />
    </div>
  );
};
