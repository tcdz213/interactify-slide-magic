import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModulePageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

export default function ModulePage({ title, description, icon: Icon, children }: ModulePageProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children || (
        <div className="glass-card rounded-xl p-12 text-center">
          <Icon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground/60">Module en développement</h3>
          <p className="text-sm text-muted-foreground/40 mt-1 max-w-md mx-auto">
            Ce module sera disponible prochainement. Les fonctionnalités sont en cours d'implémentation.
          </p>
        </div>
      )}
    </div>
  );
}
