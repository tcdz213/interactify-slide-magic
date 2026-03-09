import { useState } from "react";
import { Bookmark, Plus, Trash2, X } from "lucide-react";
import { getSavedFilters, saveFilterPreset, deleteFilterPreset } from "@/lib/exportUtils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface SavedFiltersBarProps {
  pageKey: string;
  currentFilters: Record<string, string>;
  onApply: (filters: Record<string, string>) => void;
}

export default function SavedFiltersBar({ pageKey, currentFilters, onApply }: SavedFiltersBarProps) {
  const [presets, setPresets] = useState(() => getSavedFilters(pageKey));
  const [showSave, setShowSave] = useState(false);
  const [name, setName] = useState("");

  const reload = () => setPresets(getSavedFilters(pageKey));

  const handleSave = () => {
    if (!name.trim()) return;
    saveFilterPreset(pageKey, name.trim(), currentFilters);
    toast({ title: "Filtre sauvegardé", description: name });
    setName("");
    setShowSave(false);
    reload();
  };

  const handleDelete = (n: string) => {
    deleteFilterPreset(pageKey, n);
    toast({ title: "Filtre supprimé", description: n });
    reload();
  };

  const hasActiveFilter = Object.values(currentFilters).some(v => v && v !== "all");

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Bookmark className="h-4 w-4 text-muted-foreground" />
      {presets.map((p) => (
        <div key={p.name} className="flex items-center gap-1 bg-muted/50 border border-border/50 rounded-lg px-2 py-1">
          <button
            onClick={() => onApply(p.filters)}
            className="text-xs font-medium hover:text-primary transition-colors"
          >
            {p.name}
          </button>
          <button
            onClick={() => handleDelete(p.name)}
            className="p-0.5 rounded hover:bg-destructive/10"
          >
            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      ))}
      {hasActiveFilter && (
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowSave(true)}>
          <Plus className="h-3 w-3" /> Sauvegarder filtre
        </Button>
      )}

      <Dialog open={showSave} onOpenChange={setShowSave}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sauvegarder le filtre actuel</DialogTitle>
          </DialogHeader>
          <input
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            placeholder="Nom du filtre…"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
          />
          <div className="text-xs text-muted-foreground space-y-1">
            {Object.entries(currentFilters).filter(([, v]) => v && v !== "all").map(([k, v]) => (
              <div key={k}><span className="font-medium">{k}:</span> {v}</div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowSave(false)}>Annuler</Button>
            <Button size="sm" onClick={handleSave} disabled={!name.trim()}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
