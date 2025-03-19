
import { centersData } from "./centers/centersData";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";
import VIPCentersHeader from "./centers/VIPCentersHeader";
import VIPCenterCarousel from "./centers/VIPCenterCarousel";
import VIPCentersBackground from "./centers/VIPCentersBackground";
import { Center as CenterType } from "@/types/center.types";

const VIPCenters = () => {
  const { isVisible, elementRef } = useVisibilityObserver();
  // Cast the data to the unified Center type
  const vipCenters = centersData.filter((center) => center.featured) as unknown as CenterType[];

  return (
    <section
      ref={elementRef}
      className="relative py-16 md:py-20 px-4 md:px-6 my-8 rounded-xl bg-gradient-to-b from-background/50 to-muted/30"
    >
      <VIPCentersBackground />
      <div className="container-custom max-w-7xl mx-auto relative z-10">
        <VIPCentersHeader isVisible={isVisible} />
        <VIPCenterCarousel centers={vipCenters} isVisible={isVisible} />
      </div>
    </section>
  );
};

export default VIPCenters;
