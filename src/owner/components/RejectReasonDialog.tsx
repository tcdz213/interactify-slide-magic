import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  onConfirm: (reason: string) => void;
}

export default function RejectReasonDialog({ open, onOpenChange, companyName, onConfirm }: Props) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    onConfirm(reason);
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Refuser la demande</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-xs text-muted-foreground">
            Vous allez refuser la demande de <span className="font-semibold text-foreground">{companyName}</span>.
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs">Motif du refus *</Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ex: Dossier incomplet, secteur non éligible…"
              className="text-xs min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button size="sm" variant="destructive" onClick={handleSubmit} disabled={!reason.trim()}>
            Refuser
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
