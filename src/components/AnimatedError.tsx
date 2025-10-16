import Lottie from "lottie-react";
import errorAnimation from "@/assets/error-animation.json";

interface AnimatedErrorProps {
  size?: number;
  className?: string;
}

export const AnimatedError = ({ 
  size = 80, 
  className 
}: AnimatedErrorProps) => {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Lottie
        animationData={errorAnimation}
        loop={false}
        autoplay={true}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice'
        }}
      />
    </div>
  );
};
