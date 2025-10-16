import Lottie from "lottie-react";
import successAnimation from "@/assets/success-animation.json";

interface AnimatedSuccessProps {
  size?: number;
  className?: string;
}

export const AnimatedSuccess = ({ 
  size = 80, 
  className 
}: AnimatedSuccessProps) => {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Lottie
        animationData={successAnimation}
        loop={false}
        autoplay={true}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice'
        }}
      />
    </div>
  );
};
