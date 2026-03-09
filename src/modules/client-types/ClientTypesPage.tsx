import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      toast({ title: t("clientTypes.typeModified"), description: t("clientTypes.typeModifiedDesc", { name: values.name }) });
    } else {
      addClientType({
        name: values.name,
        description: values.description,
        isDefault: values.isDefault ?? false,
        status: values.status ?? "active",
      });
      toast({ title: t("clientTypes.typeCreated"), description: t("clientTypes.typeCreatedDesc", { name: values.name }) });
    }
    setEditing(null);
  };

  const handleToggleStatus = () => {
    if (!confirmDisable) return;
    const newStatus = confirmDisable.status === "active" ? "inactive" : "active";
    updateClientType(confirmDisable.id, { status: newStatus });
    toast({
      title: newStatus === "active" ? t("clientTypes.activated") : t("clientTypes.deactivated"),
      description: t("clientTypes.statusChangedDesc", { name: confirmDisable.name, status: newStatus === "active" ? t("clientTypes.active") : t("clientTypes.inactive") }),
    });
    setConfirmDisable(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("clientTypes.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("clientTypes.subtitle")}</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> {t("clientTypes.newType")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("clientTypes.listTitle", { count: sorted.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("clientTypes.name")}</TableHead>
                <TableHead>{t("clientTypes.description")}</TableHead>
                <TableHead>{t("clientTypes.default")}</TableHead>
                <TableHead>{t("clientTypes.status")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("clientTypes.noTypes")}</TableCell></TableRow>
              )}
              {sorted.map((ct) => (
                <TableRow key={ct.id}>
                  <TableCell className="font-medium">{ct.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{ct.description || "—"}</TableCell>
                  <TableCell>
                    {ct.isDefault && <Badge variant="default" className="bg-primary/15 text-primary border-primary/20">{t("clientTypes.defaultBadge")}</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ct.status === "active" ? "outline" : "secondary"} className={ct.status === "active" ? "border-emerald-300 text-emerald-700 bg-emerald-50" : ""}>
                      {ct.status === "active" ? t("clientTypes.active") : t("clientTypes.inactive")}
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
        title={confirmDisable?.status === "active" ? t("clientTypes.deactivateConfirm") : t("clientTypes.reactivateConfirm")}
        description={t("clientTypes.statusChangeDesc", {
          name: confirmDisable?.name,
          action: confirmDisable?.status === "active" ? t("clientTypes.deactivate").toLowerCase() : t("clientTypes.activate").toLowerCase(),
        })}
        confirmLabel={confirmDisable?.status === "active" ? t("clientTypes.deactivate") : t("clientTypes.activate")}
        variant={confirmDisable?.status === "active" ? "destructive" : "default"}
        onConfirm={handleToggleStatus}
      />
    </div>
  );
}
