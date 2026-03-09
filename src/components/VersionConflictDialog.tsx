/**
 * Phase 2 — Version Conflict Dialog.
 * Shown when an optimistic locking conflict is detected.
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
import { RefreshCw, AlertTriangle } from "lucide-react";
import type { ConflictError, NegativeStockError, InventoryUpdateError } from "@/lib/optimisticLock";

interface VersionConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: InventoryUpdateError | null;
  onRetry: () => void;
  onCancel: () => void;
}

export default function VersionConflictDialog({
  open,
  onOpenChange,
  error,
  onRetry,
  onCancel,
}: VersionConflictDialogProps) {
  if (!error) return null;

  const isConflict = error.code === "VERSION_CONFLICT";
  const conflictError = isConflict ? (error as ConflictError) : null;
  const negativeError = !isConflict ? (error as NegativeStockError) : null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {isConflict ? "Conflit de modification" : "Stock insuffisant"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left">
              {conflictError && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Un autre utilisateur a modifié ce stock pendant votre opération.
                  </p>
                  <div className="rounded-md bg-muted p-3 space-y-1 text-sm">
                    <p>Version attendue : <strong>v{conflictError.expectedVersion}</strong></p>
                    <p>Version actuelle : <strong>v{conflictError.currentVersion}</strong></p>
                    <p>Stock actuel : <strong>{conflictError.currentQty.toLocaleString("fr-FR")}</strong></p>
                    {conflictError.modifiedAt && (
                      <p className="text-xs text-muted-foreground">
                        Modifié le : {new Date(conflictError.modifiedAt).toLocaleString("fr-FR")}
                      </p>
                    )}
                  </div>
                </>
              )}
              {negativeError && (
                <>
                  <p className="text-sm text-muted-foreground">
                    L'opération entraînerait un stock négatif.
                  </p>
                  <div className="rounded-md bg-destructive/10 p-3 space-y-1 text-sm">
                    <p>Stock disponible : <strong>{negativeError.currentQty.toLocaleString("fr-FR")}</strong></p>
                    <p>Quantité demandée : <strong>{Math.abs(negativeError.requestedDelta).toLocaleString("fr-FR")}</strong></p>
                    <p className="text-destructive font-medium">
                      Résultat : {negativeError.resultingQty.toLocaleString("fr-FR")} (négatif)
                    </p>
                  </div>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Annuler</AlertDialogCancel>
          {isConflict && (
            <AlertDialogAction onClick={onRetry} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Rafraîchir et réessayer
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
