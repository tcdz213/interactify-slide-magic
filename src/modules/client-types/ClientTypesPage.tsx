import { useState, useMemo } from "react";
import { Plus, Pencil, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { usePricingStore } from "@/store/pricing.store";
import { ClientTypeForm } from "./ClientTypeForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { ClientType } from "./clientType.schema";
import type { ClientTypeFormValues } from "./clientType.schema";

export default function ClientTypesPage() {
  const { clientTypes, addClientType, updateClientType } = usePricingStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientType | null>(null);
  const [confirmDisable, setConfirmDisable] = useState<ClientType | null>(null);

  const sorted = useMemo(
    () => [...clientTypes].sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : a.name.localeCompare(b.name))),
    [clientTypes]
  );

  const handleSave = (values: ClientTypeFormValues) => {
    if (editing) {
      updateClientType(editing.id, values);
      toast({ title: "Type client modifié", description: `"${values.name}" a été mis à jour.` });
    } else {
      addClientType({
        name: values.name,
        description: values.description,
        isDefault: values.isDefault ?? false,
        status: values.status ?? "active",
      });
      toast({ title: "Type client créé", description: `"${values.name}" a été ajouté.` });
    }
    setEditing(null);
  };

  const handleToggleStatus = () => {
    if (!confirmDisable) return;
    const newStatus = confirmDisable.status === "active" ? "inactive" : "active";
    updateClientType(confirmDisable.id, { status: newStatus });
    toast({ title: newStatus === "active" ? "Type activé" : "Type désactivé", description: `"${confirmDisable.name}" est maintenant ${newStatus === "active" ? "actif" : "inactif"}.` });
    setConfirmDisable(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Types de Clients</h1>
          <p className="text-sm text-muted-foreground">Gérez les catégories de clients pour la tarification différenciée</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Liste des types ({sorted.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Défaut</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Aucun type client configuré</TableCell></TableRow>
              )}
              {sorted.map((ct) => (
                <TableRow key={ct.id}>
                  <TableCell className="font-medium">{ct.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{ct.description || "—"}</TableCell>
                  <TableCell>
                    {ct.isDefault && <Badge variant="default" className="bg-primary/15 text-primary border-primary/20">Par défaut</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ct.status === "active" ? "outline" : "secondary"} className={ct.status === "active" ? "border-emerald-300 text-emerald-700 bg-emerald-50" : ""}>
                      {ct.status === "active" ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="xs" variant="ghost" onClick={() => { setEditing(ct); setFormOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => setConfirmDisable(ct)}>
                      {ct.status === "active" ? <Ban className="h-3.5 w-3.5 text-destructive" /> : <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClientTypeForm
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null); }}
        clientType={editing}
        onSave={handleSave}
        key={editing?.id ?? "new"}
      />

      <ConfirmDialog
        open={!!confirmDisable}
        onOpenChange={() => setConfirmDisable(null)}
        title={confirmDisable?.status === "active" ? "Désactiver ce type ?" : "Réactiver ce type ?"}
        description={`Le type "${confirmDisable?.name}" sera ${confirmDisable?.status === "active" ? "désactivé" : "réactivé"}.`}
        confirmLabel={confirmDisable?.status === "active" ? "Désactiver" : "Activer"}
        variant={confirmDisable?.status === "active" ? "destructive" : "default"}
        onConfirm={handleToggleStatus}
      />
    </div>
  );
}
