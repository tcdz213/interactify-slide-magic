
import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { centersData } from "@/components/centers/centersData";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";
import VIPCentersHeader from "@/components/centers/VIPCentersHeader";
import VIPCenterCarousel from "@/components/centers/VIPCenterCarousel";
import VIPCentersBackground from "@/components/centers/VIPCentersBackground";
import { Center as CenterType } from "@/types/center.types";
import { Skeleton } from "@/components/ui/skeleton";

interface VIPCentersProps {
  className?: string;
  showFullBackground?: boolean;
}

const VIPCenters = ({ className = "", showFullBackground = true }: VIPCentersProps) => {
  const { isVisible, elementRef } = useVisibilityObserver();
  const [isLoading, setIsLoading] = useState(true);
  const [vipCenters, setVipCenters] = useState<CenterType[]>([]);

  useEffect(() => {
    // Simulate data loading for better UX demonstration
    const timer = setTimeout(() => {
      // Cast the data to the unified Center type
      const filteredCenters = centersData.filter(
        (center) => center.featured
      ) as unknown as CenterType[];
      
      setVipCenters(filteredCenters);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.section
      ref={elementRef}
      id="vip-centers"
      className={`relative py-16 md:py-20 px-4 md:px-6 my-8 rounded-xl ${
        showFullBackground ? 'bg-gradient-to-b from-background/50 to-muted/30' : ''
      } ${className}`}
      aria-labelledby="vip-centers-title"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      {showFullBackground && <VIPCentersBackground />}
      <div className="container-custom max-w-7xl mx-auto relative z-10">
        <VIPCentersHeader isVisible={isVisible} />
        
        {isLoading ? (
          <div className="mt-10 overflow-hidden">
            <div className="flex space-x-6 pb-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="w-full max-w-xs flex-none">
                  <Skeleton className="h-48 w-full rounded-xl mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <VIPCenterCarousel centers={vipCenters} isVisible={isVisible} />
        )}
      </div>
    </motion.section>
  );
};

export default memo(VIPCenters);
