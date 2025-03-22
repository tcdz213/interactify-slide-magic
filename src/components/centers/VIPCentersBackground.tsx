import { memo } from "react";
interface VIPCentersBackgroundProps {
  className?: string;
}
const VIPCentersBackground = ({
  className = ""
}: VIPCentersBackgroundProps) => {
  return <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <div className="absolute -top-[30%] -right-[10%] w-2/3 h-2/3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl will-change-transform" />
      <div className="absolute -bottom-[20%] -left-[10%] w-1/2 h-1/2 bg-gradient-to-tr from-secondary/10 to-secondary/5 rounded-full blur-3xl will-change-transform" />
      
      {/* Additional subtle decorative elements */}
      <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-blue-300/5 rounded-full blur-2xl will-change-transform" />
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-amber-200/5 rounded-full blur-2xl will-change-transform" />
      
      {/* Grid pattern overlay with mask */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.008)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.008)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)] my-0 py-0" />
    </div>;
};
export default memo(VIPCentersBackground);