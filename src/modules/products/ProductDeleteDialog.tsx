import type { Product } from "@/data/mockData";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductDeleteDialogProps {
  product: Product | null;
  reasons: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function ProductDeleteDialog({ product, reasons, onConfirm, onCancel }: ProductDeleteDialogProps) {
  return (
    <AlertDialog open={!!product} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archiver le produit ?</AlertDialogTitle>
          <AlertDialogDescription>
            {product && (
              reasons.length > 0 ? (
                <>
                  <span className="text-destructive font-medium">⚠️ Archivage bloqué :</span>
                  <ul className="list-disc ml-4 mt-1">
                    {reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </>
              ) : (
                <>Le produit <strong>{product.name}</strong> sera désactivé et archivé. Il n'apparaîtra plus dans le catalogue mais restera dans l'historique.</>
              )
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={reasons.length > 0}
          >
            Archiver
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
