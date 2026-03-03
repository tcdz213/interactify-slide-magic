import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const TYPES = [
  { value: "breakdown", label: "🔧 Panne véhicule" },
  { value: "accident", label: "💥 Accident" },
  { value: "road_blocked", label: "🚧 Route barrée" },
  { value: "other", label: "📝 Autre" },
] as const;

export default function IncidentScreen() {
  const navigate = useNavigate();
  const [type, setType] = useState<string>("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!type || !description.trim()) {
      toast({ title: "Remplissez tous les champs", variant: "destructive" });
      return;
    }
    toast({ title: "🚨 Incident signalé", description: "Le superviseur sera notifié" });
    navigate(-1);
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Signaler un incident</h1>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Type d'incident</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue placeholder="Sélectionner le type" /></SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez l'incident..."
          rows={4}
        />
      </div>

      <Button variant="outline" className="w-full">📷 Ajouter des photos</Button>

      <Button onClick={handleSubmit} className="w-full min-h-14 text-base" variant="destructive">
        🚨 Signaler l'incident
      </Button>
    </div>
  );
}
