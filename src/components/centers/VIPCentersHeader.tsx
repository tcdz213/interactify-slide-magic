
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface VIPCentersHeaderProps {
  isVisible: boolean;
}

const VIPCentersHeader = ({ isVisible }: VIPCentersHeaderProps) => {
  return (
    <motion.div
      className={`flex flex-col items-center justify-between mb-10 text-center ${
        isVisible ? "" : "opacity-0"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1 mb-4">
        Premium Centers
      </Badge>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Exceptional Training Centers</h2>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
        Discover top-rated, verified training centers that offer outstanding courses and experiences. 
        These centers are handpicked for their excellence in education and student satisfaction.
      </p>
    </motion.div>
  );
};

export default VIPCentersHeader;
