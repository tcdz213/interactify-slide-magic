/**
 * Phase 3 — Unit Timeline Drawer.
 * Shows version history of a unit conversion (e.g., Sac 50kg → 40kg).
 * Allows deactivation and creation of replacement versions.
 */
import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FormField, formInputClass } from "@/components/ui/form-field";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Clock, Lock, Plus, XCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import type { ProductUnitConversion } from "@/lib/unitConversion";
import { validateDateRange, validatePackagingChange } from "@/lib/unitConversion";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { generateId } from "@/services/crudService";
import { logFactorChange } from "@/lib/factorAudit";

interface UnitTimelineDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  unitAbbreviation: string;
}

export default function UnitTimelineDrawer({
  open,
  onOpenChange,
  productId,
  productName,
  unitAbbreviation,
}: UnitTimelineDrawerProps) {
  const { productUnitConversions, setProductUnitConversions } = useWMSData();
  const { currentUser } = useAuth();

  const [deactivateTarget, setDeactivateTarget] = useState<ProductUnitConversion | null>(null);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [newForm, setNewForm] = useState({ unitName: "", conversionFactor: 1, validFrom: new Date().toISOString().slice(0, 10) });

  const versions = useMemo(() =>
    productUnitConversions
      .filter(c => c.productId === productId && c.unitAbbreviation === unitAbbreviation)
      .sort((a, b) => {
        const aFrom = a.validFrom ? new Date(a.validFrom).getTime() : 0;
        const bFrom = b.validFrom ? new Date(b.validFrom).getTime() : 0;
        return bFrom - aFrom;
      }),
    [productUnitConversions, productId, unitAbbreviation]
  );

  const activeVersions = versions.filter(v => !v.validTo);
  const expiredVersions = versions.filter(v => !!v.validTo);

  const handleDeactivate = (conv: ProductUnitConversion) => {
    const today = new Date().toISOString().slice(0, 10);
    setProductUnitConversions(prev =>
      prev.map(c => c.id === conv.id ? { ...c, validTo: today } : c)
    );
    logFactorChange("FACTOR_DELETED", conv, currentUser?.name ?? "system");
    toast({ title: "✅ Unité désactivée", description: `${conv.unitName} expire aujourd'hui` });
    setDeactivateTarget(null);
    setShowNewVersion(true);
    setNewForm({ unitName: conv.unitName, conversionFactor: conv.conversionFactor, validFrom: today });
  };

  const handleCreateVersion = () => {
    if (newForm.conversionFactor <= 0) {
      toast({ title: "Erreur", description: "Le facteur doit être > 0", variant: "destructive" });
      return;
    }

    const dateCheck = validateDateRange(
      productUnitConversions,
      { productId, unitAbbreviation, validFrom: newForm.validFrom, validTo: undefined }
    );
    if (!dateCheck.valid) {
      toast({ title: "⚠️ Chevauchement", description: dateCheck.error, variant: "destructive" });
      return;
    }

    const newConv: ProductUnitConversion = {
      id: generateId("PUC"),
      productId,
      unitName: newForm.unitName,
      unitAbbreviation,
      conversionFactor: newForm.conversionFactor,
      allowBuy: true,
      allowSell: true,
      sortOrder: versions.length + 1,
      usedInTransactions: false,
      validFrom: newForm.validFrom,
      decimalPlaces: 0,
      roundingMode: "round",
    };

    setProductUnitConversions(prev => [...prev, newConv]);
    logFactorChange("FACTOR_CREATED", newConv, currentUser?.name ?? "system");
    toast({ title: "✅ Nouvelle version créée", description: `${newConv.unitName} (×${newConv.conversionFactor}) effective dès ${newForm.validFrom}` });
    setShowNewVersion(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {unitAbbreviation} — Historique des versions
            </SheetTitle>
            <p className="text-sm text-muted-foreground">Produit : {productName}</p>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Active versions */}
            {activeVersions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> ACTIVE
                </h3>
                {activeVersions.map(v => (
                  <div key={v.id} className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{v.unitName}</p>
                      {v.usedInTransactions && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Lock className="h-3 w-3" /> Verrouillé
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Facteur :</span>
                        <span className="ml-1 font-mono font-bold">×{v.conversionFactor}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Depuis :</span>
                        <span className="ml-1">{v.validFrom ?? "Toujours"}</span>
                      </div>
                      {v.decimalPlaces != null && (
                        <div>
                          <span className="text-muted-foreground">Décimales :</span>
                          <span className="ml-1">{v.decimalPlaces}</span>
                        </div>
                      )}
                    </div>
                    {v.usedInTransactions && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => setDeactivateTarget(v)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Désactiver
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Expired versions */}
            {expiredVersions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" /> EXPIRÉ
                </h3>
                {expiredVersions.map(v => (
                  <div key={v.id} className="rounded-lg border border-border bg-muted/30 p-4 space-y-1">
                    <p className="font-medium text-muted-foreground">{v.unitName}</p>
                    <div className="text-sm text-muted-foreground">
                      <span>Facteur : ×{v.conversionFactor}</span>
                      <span className="mx-2">·</span>
                      <span>{v.validFrom ?? "début"} → {v.validTo}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {versions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune version trouvée pour cette unité.</p>
            )}

            {/* New version form */}
            {showNewVersion && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-primary" /> Nouvelle version — {unitAbbreviation}
                </h4>
                <FormField label="Nom" required>
                  <input className={formInputClass} value={newForm.unitName} onChange={e => setNewForm({ ...newForm, unitName: e.target.value })} placeholder="ex: Sac (40kg)" />
                </FormField>
                <FormField label="Facteur de conversion" required>
                  <input type="number" min={0.01} step="any" className={formInputClass} value={newForm.conversionFactor} onChange={e => setNewForm({ ...newForm, conversionFactor: +e.target.value })} />
                </FormField>
                <FormField label="Date d'effet" required>
                  <input type="date" className={formInputClass} value={newForm.validFrom} onChange={e => setNewForm({ ...newForm, validFrom: e.target.value })} />
                </FormField>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  L'ancien facteur reste valide pour les transactions antérieures.
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowNewVersion(false)}>Annuler</Button>
                  <Button size="sm" onClick={handleCreateVersion}>Créer la nouvelle version</Button>
                </div>
              </div>
            )}

            {!showNewVersion && (
              <Button variant="outline" className="w-full" onClick={() => {
                setShowNewVersion(true);
                setNewForm({ unitName: "", conversionFactor: 1, validFrom: new Date().toISOString().slice(0, 10) });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Nouvelle version
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Deactivation confirmation */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={() => setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Désactiver {deactivateTarget?.unitName} ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Cette action va :</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Fixer la date de fin à aujourd'hui</li>
                  <li>Garder l'historique intact</li>
                  <li>Bloquer l'utilisation future de ce facteur</li>
                </ul>
                {deactivateTarget?.usedInTransactions && (
                  <p className="text-sm text-amber-600 font-medium mt-2">
                    ⚠️ Des transactions utilisent ce facteur — elles ne seront PAS affectées.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deactivateTarget && handleDeactivate(deactivateTarget)}>
              Confirmer la désactivation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}