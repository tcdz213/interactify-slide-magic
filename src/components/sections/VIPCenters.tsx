
import { memo } from "react";
import { centersData } from "@/components/centers/centersData";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";
import VIPCentersHeader from "@/components/centers/VIPCentersHeader";
import VIPCenterCarousel from "@/components/centers/VIPCenterCarousel";
import VIPCentersBackground from "@/components/centers/VIPCentersBackground";
import { Center as CenterType } from "@/types/center.types";

interface VIPCentersProps {
  className?: string;
  showFullBackground?: boolean;
}

const VIPCenters = ({ className = "", showFullBackground = true }: VIPCentersProps) => {
  const { isVisible, elementRef } = useVisibilityObserver();
  // Cast the data to the unified Center type
  const vipCenters = centersData.filter(
    (center) => center.featured
  ) as unknown as CenterType[];

  return (
    <section
      ref={elementRef}
      id="vip-centers"
      className={`relative py-16 md:py-20 px-4 md:px-6 my-8 rounded-xl ${showFullBackground ? 'bg-gradient-to-b from-background/50 to-muted/30' : ''} ${className}`}
      aria-labelledby="vip-centers-title"
    >
      {showFullBackground && <VIPCentersBackground />}
      <div className="container-custom max-w-7xl mx-auto relative z-10">
        <VIPCentersHeader isVisible={isVisible} />
        <VIPCenterCarousel centers={vipCenters} isVisible={isVisible} />
      </div>
    </section>
  );
};

export default memo(VIPCenters);
