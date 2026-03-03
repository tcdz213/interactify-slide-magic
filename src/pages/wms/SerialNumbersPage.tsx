import { useState } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Hash, Package, Truck, RotateCcw, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { SerialStatus } from "@/data/mockData";

const STATUS_CONFIG: Record<SerialStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  In_Stock: { label: "En stock", variant: "default", icon: Package },
  Sold: { label: "Vendu", variant: "outline", icon: Hash },
  In_Transit: { label: "En transit", variant: "secondary", icon: Truck },
  Returned: { label: "Retourné", variant: "secondary", icon: RotateCcw },
  Defective: { label: "Défectueux", variant: "destructive", icon: AlertTriangle },
  Scrapped: { label: "Rebuté", variant: "destructive", icon: Trash2 },
};

// FIX-17 — Valid status transitions
const STATUS_TRANSITIONS: Partial<Record<SerialStatus, SerialStatus[]>> = {
  In_Stock: ["Sold", "Defective", "Scrapped"],
  In_Transit: ["In_Stock", "Sold", "Returned"],
  Sold: ["Returned", "Defective"],
  Returned: ["In_Stock", "Defective", "Scrapped"],
  Defective: ["Scrapped", "Returned"],
};

const DESTRUCTIVE_STATUSES = new Set<SerialStatus>(["Scrapped", "Defective"]);

export default function SerialNumbersPage() {
  const { serialNumbers, setSerialNumbers } = useWMSData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [changeDialog, setChangeDialog] = useState<{ id: string; current: SerialStatus; next: SerialStatus } | null>(null);

  const filtered = serialNumbers.filter((sn) => {
    const matchSearch = !search || sn.serialNumber.toLowerCase().includes(search.toLowerCase()) || sn.productName.toLowerCase().includes(search.toLowerCase()) || (sn.customerName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || sn.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const inStock = serialNumbers.filter((s) => s.status === "In_Stock").length;
  const sold = serialNumbers.filter((s) => s.status === "Sold").length;
  const defective = serialNumbers.filter((s) => s.status === "Defective" || s.status === "Scrapped").length;

  const handleStatusChange = (id: string, newStatus: SerialStatus) => {
    const sn = serialNumbers.find(s => s.id === id);
    if (!sn) return;
    if (DESTRUCTIVE_STATUSES.has(newStatus)) {
      setChangeDialog({ id, current: sn.status, next: newStatus });
      return;
    }
    applyStatusChange(id, newStatus);
  };

  const applyStatusChange = (id: string, newStatus: SerialStatus) => {
    setSerialNumbers((prev: any[]) => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    toast({ title: "Statut mis à jour", description: `${id} → ${STATUS_CONFIG[newStatus].label}` });
    setChangeDialog(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Suivi par Numéro de Série</h1>
        <p className="text-muted-foreground text-sm">Traçabilité unitaire — du fournisseur au client final</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inStock}</p>
              <p className="text-xs text-muted-foreground">En stock</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Hash className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sold}</p>
              <p className="text-xs text-muted-foreground">Vendus</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{defective}</p>
              <p className="text-xs text-muted-foreground">Défectueux / Rebutés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <CardTitle className="text-lg">Registre des numéros de série</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher N° série, produit, client…" className="pl-9 w-72" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="In_Stock">En stock</SelectItem>
                  <SelectItem value="Sold">Vendu</SelectItem>
                  <SelectItem value="In_Transit">En transit</SelectItem>
                  <SelectItem value="Returned">Retourné</SelectItem>
                  <SelectItem value="Defective">Défectueux</SelectItem>
                  <SelectItem value="Scrapped">Rebuté</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Série</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>N° Lot</TableHead>
                <TableHead>Entrepôt</TableHead>
                <TableHead>Emplacement</TableHead>
                <TableHead>Reçu le</TableHead>
                <TableHead>Vendu le</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Commande</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sn) => {
                const cfg = STATUS_CONFIG[sn.status];
                const transitions = STATUS_TRANSITIONS[sn.status] ?? [];
                return (
                  <TableRow key={sn.id}>
                    <TableCell className="font-mono text-xs">{sn.serialNumber}</TableCell>
                    <TableCell className="font-medium">{sn.productName}</TableCell>
                    <TableCell className="font-mono text-xs">{sn.lotNumber}</TableCell>
                    <TableCell className="text-xs">{sn.warehouseName}</TableCell>
                    <TableCell className="font-mono text-xs">{sn.locationId || "—"}</TableCell>
                    <TableCell className="text-xs">{sn.receivedDate}</TableCell>
                    <TableCell className="text-xs">{sn.soldDate || "—"}</TableCell>
                    <TableCell className="text-xs">{sn.customerName || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{sn.salesOrderId || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {transitions.length > 0 ? (
                        <Select onValueChange={(v) => handleStatusChange(sn.id, v as SerialStatus)}>
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue placeholder="Changer…" />
                          </SelectTrigger>
                          <SelectContent>
                            {transitions.map((st) => (
                              <SelectItem key={st} value={st}>{STATUS_CONFIG[st].label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground py-8">Aucun numéro de série trouvé</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation dialog for destructive status changes */}
      <Dialog open={!!changeDialog} onOpenChange={() => setChangeDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer le changement de statut</DialogTitle>
          </DialogHeader>
          {changeDialog && (
            <p className="text-sm text-muted-foreground">
              Changer le statut de <strong>{STATUS_CONFIG[changeDialog.current].label}</strong> vers{" "}
              <strong className="text-destructive">{STATUS_CONFIG[changeDialog.next].label}</strong> ?
              Cette action peut être irréversible.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setChangeDialog(null)}>Annuler</Button>
            <Button variant="destructive" size="sm" onClick={() => changeDialog && applyStatusChange(changeDialog.id, changeDialog.next)}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
