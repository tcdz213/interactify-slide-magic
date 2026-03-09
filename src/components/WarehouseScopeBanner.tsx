/**
 * WarehouseScopeBanner — shows the user's scope context at the top of WMS pages.
 * For restricted users (e.g., warehouse managers), it shows a colored banner
 * indicating which warehouse's data they are viewing.
 * Full-access users (CEO, Finance etc.) see no banner.
 */

import { Building2, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getWarehouseBadgeStyle, getWarehouseShortName } from "@/lib/rbac";
import { useWMSData } from "@/contexts/WMSDataContext";
import { cn } from "@/lib/utils";

export function WarehouseScopeBanner() {
    const { currentUser, isFullAccess, accessibleWarehouseIds } = useAuth();
    const { warehouses } = useWMSData();

    // No banner for full-access users
    if (!currentUser || isFullAccess) return null;

    const assignedWHs = warehouses.filter((wh) =>
        accessibleWarehouseIds?.includes(wh.id)
    );

    if (assignedWHs.length === 0) return null;

    return (
        <div className="flex items-center gap-2.5 rounded-xl border border-info/20 bg-info/5 px-4 py-2.5 text-sm mb-4">
            <Eye className="h-4 w-4 text-info shrink-0" />
            <span className="text-foreground font-medium">Périmètre affiché :</span>
            <div className="flex items-center gap-1.5 flex-wrap">
                {assignedWHs.map((wh) => (
                    <span
                        key={wh.id}
                        className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border",
                            getWarehouseBadgeStyle(wh.id)
                        )}
                    >
                        <Building2 className="h-3 w-3" />
                        {getWarehouseShortName(wh.id)} — {wh.name}
                    </span>
                ))}
            </div>
            <span className="text-muted-foreground text-xs ml-auto">
                Données filtrées selon votre périmètre de responsabilité
            </span>
        </div>
    );
}
