/**
 * Phase 4 — Anomaly Warning Dialog.
 * Shows detected anomalies with confirm/cancel actions.
 * Blocking anomalies prevent confirmation.
 */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, XCircle, ShieldAlert } from "lucide-react";
import type { AnomalyCheck } from "@/lib/qtyAnomalyDetector";
import { hasBlockingAnomaly } from "@/lib/qtyAnomalyDetector";

interface AnomalyWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anomalies: AnomalyCheck[];
  onConfirm: () => void;
  onCancel: () => void;
  productName?: string;
}

export default function AnomalyWarningDialog({
  open,
  onOpenChange,
  anomalies,
  onConfirm,
  onCancel,
  productName,
}: AnomalyWarningDialogProps) {
  const isBlocking = hasBlockingAnomaly(anomalies);
  const warnings = anomalies.filter(a => a.severity === "warning");
  const blockers = anomalies.filter(a => a.severity === "blocking");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            {isBlocking ? "Anomalie bloquante détectée" : "Anomalie détectée — Vérification requise"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left">
              {productName && (
                <p className="font-medium text-foreground">Produit : {productName}</p>
              )}

              {blockers.length > 0 && (
                <div className="space-y-2">
                  {blockers.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-md bg-destructive/10 p-2.5 text-sm">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-destructive">⛔ {a.type.replace(/_/g, " ")}</p>
                        <p className="text-muted-foreground">{a.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {warnings.length > 0 && (
                <div className="space-y-2">
                  {warnings.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-md bg-yellow-500/10 p-2.5 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-yellow-700 dark:text-yellow-500">⚠️ {a.type.replace(/_/g, " ")}</p>
                        <p className="text-muted-foreground">{a.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isBlocking && (
                <p className="text-xs text-muted-foreground">
                  📋 Cette action sera enregistrée dans le journal d'audit.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {isBlocking ? "Fermer" : "✖ Corriger"}
          </AlertDialogCancel>
          {!isBlocking && (
            <AlertDialogAction onClick={onConfirm}>
              ✅ Confirmer — je suis sûr(e)
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
