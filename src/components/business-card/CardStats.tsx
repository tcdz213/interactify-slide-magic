import { Badge } from "@/components/ui/badge";
import { Scan, Eye } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { getDomainColor } from "@/utils/categoryIcons";

interface CardStatsProps {
  scans: number;
  views: number;
  subdomainKey: string | string[];
  domainKey: string;
  showBadge?: boolean;
}

export const CardStats = ({ 
  scans, 
  views, 
  subdomainKey, 
  domainKey,
  showBadge = true 
}: CardStatsProps) => {
  const subdomainDisplay = Array.isArray(subdomainKey) 
    ? subdomainKey.join(', ').replace(/_/g, ' ')
    : subdomainKey.replace(/_/g, ' ');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 gap-2">
      <div className="flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1.5">
          <Scan className="w-3.5 h-3.5 text-accent" />
          <span className="font-semibold text-foreground">{scans || 0}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Eye className="w-3.5 h-3.5 text-accent" />
          <span className="font-semibold text-foreground">{views || 0}</span>
        </div>
      </div>

      {showBadge && (
        <Badge className={cn("text-xs self-start sm:self-auto", getDomainColor(domainKey))}>
          {subdomainDisplay}
        </Badge>
      )}
    </div>
  );
};
