
import { Badge } from "@/components/ui/badge";

interface VIPCentersHeaderProps {
  isVisible: boolean;
}

const VIPCentersHeader = ({ isVisible }: VIPCentersHeaderProps) => {
  return (
    <div
      className={`flex items-center justify-between mb-10 ${
        isVisible ? "animate-fade-up" : "opacity-0"
      }`}
    >
      <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-3">
        <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1">
          VIP
        </Badge>
        Featured Training Centers
      </h2>
    </div>
  );
};

export default VIPCentersHeader;
