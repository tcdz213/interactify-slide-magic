import { cn } from "@/lib/utils";
import NavGroup from "./NavGroup";

interface WmsChild {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface WmsSubGroupDef {
  label: string;
  icon: React.ElementType;
  colorClass: string;
  children: WmsChild[];
}

interface WmsSubGroupNavProps {
  subGroups: WmsSubGroupDef[];
  collapsed?: boolean;
}

export default function WmsSubGroupNav({ subGroups, collapsed }: WmsSubGroupNavProps) {
  return (
    <div className="space-y-px ms-1">
      {subGroups.map(sg => (
        <NavGroup
          key={sg.label}
          label={sg.label}
          icon={sg.icon}
          children={sg.children}
          collapsed={collapsed}
          colorClass={sg.colorClass}
        />
      ))}
    </div>
  );
}
