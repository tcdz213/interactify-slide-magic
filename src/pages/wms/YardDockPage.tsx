import { useState, useMemo } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import { useAuth } from "@/contexts/AuthContext";
import { usePagination } from "@/hooks/usePagination";
import DataTablePagination from "@/components/DataTablePagination";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormSection, formSelectClass, formInputClass } from "@/components/ui/form-field";
import { Plus, Search, Eye, Truck, DoorOpen, Calendar, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { DockSlot, TruckCheckIn, TruckCheckInStatus, GateLog, DockStatus } from "@/data/mockDataPhase20_22";

// Status colors now in global StatusBadge map

export default function YardDockPage() {
  const { dockSlots, setDockSlots, truckCheckIns, setTruckCheckIns, gateLogs, setGateLogs, warehouses } = useWMSData();
  const { canOperateOn, operationalWarehouses } = useWarehouseScope();
  const { canCreate } = useAuth();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("docks");

  // --- Docks ---
  const [showDockForm, setShowDockForm] = useState(false);
  const [editDock, setEditDock] = useState<DockSlot | null>(null);
  const [dockForm, setDockForm] = useState({ dockNumber: "", warehouseId: "", type: "Both" as DockSlot["type"], capacity: "", status: "Available" as DockStatus, notes: "" });

  const filteredDocks = useMemo(() => {
    let d = (dockSlots as DockSlot[]).filter(x => canOperateOn(x.warehouseId));
    if (search) { const s = search.toLowerCase(); d = d.filter(x => x.dockNumber.toLowerCase().includes(s) || x.warehouseName.toLowerCase().includes(s)); }
    return d;
  }, [dockSlots, canOperateOn, search]);
  const dockPag = usePagination(filteredDocks, 10);

  const openDockCreate = () => { setEditDock(null); setDockForm({ dockNumber: "", warehouseId: operationalWarehouses[0]?.id || "", type: "Both", capacity: "", status: "Available", notes: "" }); setShowDockForm(true); };
  const openDockEdit = (d: DockSlot) => { setEditDock(d); setDockForm({ dockNumber: d.dockNumber, warehouseId: d.warehouseId, type: d.type, capacity: d.capacity, status: d.status, notes: d.notes }); setShowDockForm(true); };
  const saveDock = () => {
    if (!dockForm.dockNumber || !dockForm.warehouseId) { toast({ title: "Erreur", description: "Champs obligatoires manquants", variant: "destructive" }); return; }
    const wh = warehouses.find(w => w.id === dockForm.warehouseId);
    if (editDock) {
      setDockSlots((prev: DockSlot[]) => prev.map(d => d.id === editDock.id ? { ...d, ...dockForm, warehouseName: wh?.name || "" } : d));
      toast({ title: "Quai modifié" });
    } else {
      const nd: DockSlot = { id: `DOCK-${String(Date.now()).slice(-4)}`, ...dockForm, warehouseName: wh?.name || "", scheduledDate: undefined, scheduledTime: undefined, assignedTruckId: undefined };
      setDockSlots((prev: DockSlot[]) => [nd, ...prev]);
      toast({ title: "Quai créé" });
    }
    setShowDockForm(false);
  };

  // --- Trucks ---
  const [showTruckForm, setShowTruckForm] = useState(false);
  const [viewTruck, setViewTruck] = useState<TruckCheckIn | null>(null);
  const [truckForm, setTruckForm] = useState({ truckPlate: "", driverName: "", driverPhone: "", carrierName: "", dockId: "", warehouseId: "", purpose: "Inbound" as TruckCheckIn["purpose"], sealNumber: "", notes: "" });

  const filteredTrucks = useMemo(() => {
    let d = (truckCheckIns as TruckCheckIn[]).filter(x => canOperateOn(x.warehouseId));
    if (search) { const s = search.toLowerCase(); d = d.filter(x => x.truckPlate.toLowerCase().includes(s) || x.driverName.toLowerCase().includes(s)); }
    return d;
  }, [truckCheckIns, canOperateOn, search]);
  const truckPag = usePagination(filteredTrucks, 10);

  const openTruckCreate = () => {
    const wh = operationalWarehouses[0]?.id || "";
    setTruckForm({ truckPlate: "", driverName: "", driverPhone: "", carrierName: "", dockId: "", warehouseId: wh, purpose: "Inbound", sealNumber: "", notes: "" });
    setShowTruckForm(true);
  };
  const saveTruck = () => {
    if (!truckForm.truckPlate || !truckForm.driverName || !truckForm.warehouseId) { toast({ title: "Erreur", description: "Champs obligatoires", variant: "destructive" }); return; }
    const wh = warehouses.find(w => w.id === truckForm.warehouseId);
    const dock = (dockSlots as DockSlot[]).find(d => d.id === truckForm.dockId);
    const nt: TruckCheckIn = {
      id: `TCI-${String(Date.now()).slice(-4)}`, ...truckForm, warehouseName: wh?.name || "",
      dockNumber: dock?.dockNumber || "N/A", status: "Checked_In", checkInTime: new Date().toISOString(),
    };
    setTruckCheckIns((prev: TruckCheckIn[]) => [nt, ...prev]);
    // Auto gate log
    const gl: GateLog = { id: `GL-${String(Date.now()).slice(-4)}`, warehouseId: truckForm.warehouseId, warehouseName: wh?.name || "", truckPlate: truckForm.truckPlate, driverName: truckForm.driverName, direction: "In", timestamp: new Date().toISOString(), gateNumber: "Auto", checkInId: nt.id, guardName: "Système", notes: "Entrée auto check-in" };
    setGateLogs((prev: GateLog[]) => [gl, ...prev]);
    toast({ title: "Camion enregistré" });
    setShowTruckForm(false);
  };
  const updateTruckStatus = (id: string, status: TruckCheckInStatus) => {
    setTruckCheckIns((prev: TruckCheckIn[]) => prev.map(t => t.id === id ? { ...t, status, ...(status === "Checked_Out" ? { checkOutTime: new Date().toISOString() } : {}) } : t));
    if (status === "Checked_Out") {
      const truck = (truckCheckIns as TruckCheckIn[]).find(t => t.id === id);
      if (truck) {
        const gl: GateLog = { id: `GL-${String(Date.now()).slice(-4)}`, warehouseId: truck.warehouseId, warehouseName: truck.warehouseName, truckPlate: truck.truckPlate, driverName: truck.driverName, direction: "Out", timestamp: new Date().toISOString(), gateNumber: "Auto", checkInId: id, guardName: "Système", notes: "Sortie auto check-out" };
        setGateLogs((prev: GateLog[]) => [gl, ...prev]);
      }
    }
    toast({ title: `Statut → ${status.replace("_", " ")}` });
  };

  // --- Gate Logs ---
  const filteredGates = useMemo(() => {
    let d = (gateLogs as GateLog[]).filter(x => canOperateOn(x.warehouseId));
    if (search) { const s = search.toLowerCase(); d = d.filter(x => x.truckPlate.toLowerCase().includes(s) || x.driverName.toLowerCase().includes(s)); }
    return d.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [gateLogs, canOperateOn, search]);
  const gatePag = usePagination(filteredGates, 10);

  const userCanAct = canCreate("grn");

  return (
    <div className="space-y-6">
      <WarehouseScopeBanner />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Truck className="h-6 w-6" /> Yard & Dock Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestion des quais, enregistrement camions et portes</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(dockSlots as DockSlot[]).filter(d => d.status === "Available").length}</div><p className="text-xs text-muted-foreground">Quais disponibles</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(truckCheckIns as TruckCheckIn[]).filter(t => !["Checked_Out","Cancelled"].includes(t.status)).length}</div><p className="text-xs text-muted-foreground">Camions sur site</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(dockSlots as DockSlot[]).filter(d => d.status === "Occupied").length}</div><p className="text-xs text-muted-foreground">Quais occupés</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(gateLogs as GateLog[]).filter(g => g.timestamp.startsWith("2026-02-24")).length}</div><p className="text-xs text-muted-foreground">Passages aujourd'hui</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="docks"><Calendar className="h-4 w-4 mr-1" /> Quais ({filteredDocks.length})</TabsTrigger>
          <TabsTrigger value="trucks"><Truck className="h-4 w-4 mr-1" /> Camions ({filteredTrucks.length})</TabsTrigger>
          <TabsTrigger value="gates"><DoorOpen className="h-4 w-4 mr-1" /> Portes ({filteredGates.length})</TabsTrigger>
        </TabsList>

        {/* DOCKS TAB */}
        <TabsContent value="docks" className="space-y-4">
          {userCanAct && <div className="flex justify-end"><Button onClick={openDockCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Nouveau quai</Button></div>}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>ID</TableHead><TableHead>Quai</TableHead><TableHead>Entrepôt</TableHead><TableHead>Type</TableHead><TableHead>Capacité</TableHead><TableHead>Statut</TableHead><TableHead>Planifié</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {dockPag.paginatedItems.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.id}</TableCell>
                    <TableCell className="font-medium">{d.dockNumber}</TableCell>
                    <TableCell>{d.warehouseName}</TableCell>
                    <TableCell><StatusBadge status={d.type} /></TableCell>
                    <TableCell>{d.capacity}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell className="text-xs">{d.scheduledDate ? `${d.scheduledDate} ${d.scheduledTime || ""}` : "—"}</TableCell>
                    <TableCell>{userCanAct && <Button variant="ghost" size="sm" onClick={() => openDockEdit(d)}>✏️</Button>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination {...dockPag} totalItems={filteredDocks.length} onPageChange={dockPag.setCurrentPage} onPageSizeChange={dockPag.setPageSize} />
        </TabsContent>

        {/* TRUCKS TAB */}
        <TabsContent value="trucks" className="space-y-4">
          {userCanAct && <div className="flex justify-end"><Button onClick={openTruckCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Enregistrer camion</Button></div>}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>ID</TableHead><TableHead>Plaque</TableHead><TableHead>Chauffeur</TableHead><TableHead>Transporteur</TableHead><TableHead>Quai</TableHead><TableHead>But</TableHead><TableHead>Statut</TableHead><TableHead>Entrée</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {truckPag.paginatedItems.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="font-medium">{t.truckPlate}</TableCell>
                    <TableCell>{t.driverName}</TableCell>
                    <TableCell>{t.carrierName}</TableCell>
                    <TableCell>{t.dockNumber}</TableCell>
                    <TableCell><StatusBadge status={t.purpose} /></TableCell>
                    <TableCell><StatusBadge status={t.status.replace("_", " ")} /></TableCell>
                    <TableCell className="text-xs">{new Date(t.checkInTime).toLocaleString("fr-DZ")}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewTruck(t)}><Eye className="h-4 w-4" /></Button>
                      {userCanAct && t.status !== "Checked_Out" && t.status !== "Cancelled" && (
                        <select className={formSelectClass + " text-xs py-1 px-2"} value={t.status} onChange={e => updateTruckStatus(t.id, e.target.value as TruckCheckInStatus)}>
                          {(["Checked_In","Docked","Unloading","Loading","Checked_Out","Cancelled"] as TruckCheckInStatus[]).map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                        </select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination {...truckPag} totalItems={filteredTrucks.length} onPageChange={truckPag.setCurrentPage} onPageSizeChange={truckPag.setPageSize} />
        </TabsContent>

        {/* GATES TAB */}
        <TabsContent value="gates" className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>ID</TableHead><TableHead>Plaque</TableHead><TableHead>Chauffeur</TableHead><TableHead>Direction</TableHead><TableHead>Porte</TableHead><TableHead>Heure</TableHead><TableHead>Entrepôt</TableHead><TableHead>Agent</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {gatePag.paginatedItems.map(g => (
                  <TableRow key={g.id}>
                    <TableCell className="font-mono text-xs">{g.id}</TableCell>
                    <TableCell className="font-medium">{g.truckPlate}</TableCell>
                    <TableCell>{g.driverName}</TableCell>
                    <TableCell><StatusBadge status={g.direction === "In" ? "Entrée" : "Sortie"} /></TableCell>
                    <TableCell>{g.gateNumber}</TableCell>
                    <TableCell className="text-xs">{new Date(g.timestamp).toLocaleString("fr-DZ")}</TableCell>
                    <TableCell>{g.warehouseName}</TableCell>
                    <TableCell>{g.guardName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination {...gatePag} totalItems={filteredGates.length} onPageChange={gatePag.setCurrentPage} onPageSizeChange={gatePag.setPageSize} />
        </TabsContent>
      </Tabs>

      {/* Dock Form Dialog */}
      <Dialog open={showDockForm} onOpenChange={setShowDockForm}>
        <DialogContent><DialogHeader><DialogTitle>{editDock ? "Modifier quai" : "Nouveau quai"}</DialogTitle></DialogHeader>
          <FormSection title={editDock ? "Modifier quai" : "Détails quai"}>
            <FormField label="N° Quai"><Input className={formInputClass} value={dockForm.dockNumber} onChange={e => setDockForm(p => ({ ...p, dockNumber: e.target.value }))} /></FormField>
            <FormField label="Entrepôt"><select className={formSelectClass} value={dockForm.warehouseId} onChange={e => setDockForm(p => ({ ...p, warehouseId: e.target.value }))}>{operationalWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
            <FormField label="Type"><select className={formSelectClass} value={dockForm.type} onChange={e => setDockForm(p => ({ ...p, type: e.target.value as DockSlot["type"] }))}><option value="Inbound">Inbound</option><option value="Outbound">Outbound</option><option value="Both">Les deux</option></select></FormField>
            <FormField label="Capacité"><Input className={formInputClass} value={dockForm.capacity} onChange={e => setDockForm(p => ({ ...p, capacity: e.target.value }))} placeholder="ex: 40T" /></FormField>
            <FormField label="Statut"><select className={formSelectClass} value={dockForm.status} onChange={e => setDockForm(p => ({ ...p, status: e.target.value as DockStatus }))}>{(["Available","Occupied","Maintenance","Reserved"] as DockStatus[]).map(s => <option key={s} value={s}>{s}</option>)}</select></FormField>
            <FormField label="Notes"><Input className={formInputClass} value={dockForm.notes} onChange={e => setDockForm(p => ({ ...p, notes: e.target.value }))} /></FormField>
          </FormSection>
          <DialogFooter><Button variant="outline" onClick={() => setShowDockForm(false)}>Annuler</Button><Button onClick={saveDock}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Truck Form Dialog */}
      <Dialog open={showTruckForm} onOpenChange={setShowTruckForm}>
        <DialogContent><DialogHeader><DialogTitle>Enregistrer un camion</DialogTitle></DialogHeader>
          <FormSection title="Informations camion">
            <FormField label="Plaque"><Input className={formInputClass} value={truckForm.truckPlate} onChange={e => setTruckForm(p => ({ ...p, truckPlate: e.target.value }))} /></FormField>
            <FormField label="Chauffeur"><Input className={formInputClass} value={truckForm.driverName} onChange={e => setTruckForm(p => ({ ...p, driverName: e.target.value }))} /></FormField>
            <FormField label="Téléphone"><Input className={formInputClass} value={truckForm.driverPhone} onChange={e => setTruckForm(p => ({ ...p, driverPhone: e.target.value }))} /></FormField>
            <FormField label="Transporteur"><Input className={formInputClass} value={truckForm.carrierName} onChange={e => setTruckForm(p => ({ ...p, carrierName: e.target.value }))} /></FormField>
            <FormField label="Entrepôt"><select className={formSelectClass} value={truckForm.warehouseId} onChange={e => setTruckForm(p => ({ ...p, warehouseId: e.target.value }))}>{operationalWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
            <FormField label="Quai"><select className={formSelectClass} value={truckForm.dockId} onChange={e => setTruckForm(p => ({ ...p, dockId: e.target.value }))}><option value="">— Aucun —</option>{(dockSlots as DockSlot[]).filter(d => d.warehouseId === truckForm.warehouseId && d.status === "Available").map(d => <option key={d.id} value={d.id}>{d.dockNumber}</option>)}</select></FormField>
            <FormField label="But"><select className={formSelectClass} value={truckForm.purpose} onChange={e => setTruckForm(p => ({ ...p, purpose: e.target.value as TruckCheckIn["purpose"] }))}><option value="Inbound">Réception</option><option value="Outbound">Expédition</option><option value="Return">Retour</option></select></FormField>
            <FormField label="N° Scellé"><Input className={formInputClass} value={truckForm.sealNumber} onChange={e => setTruckForm(p => ({ ...p, sealNumber: e.target.value }))} /></FormField>
            <FormField label="Notes"><Input className={formInputClass} value={truckForm.notes} onChange={e => setTruckForm(p => ({ ...p, notes: e.target.value }))} /></FormField>
          </FormSection>
          <DialogFooter><Button variant="outline" onClick={() => setShowTruckForm(false)}>Annuler</Button><Button onClick={saveTruck}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Truck Dialog */}
      <Dialog open={!!viewTruck} onOpenChange={() => setViewTruck(null)}>
        <DialogContent>{viewTruck && <>
          <DialogHeader><DialogTitle>Détail — {viewTruck.truckPlate}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Chauffeur:</span> {viewTruck.driverName}</div>
            <div><span className="text-muted-foreground">Tél:</span> {viewTruck.driverPhone}</div>
            <div><span className="text-muted-foreground">Transporteur:</span> {viewTruck.carrierName}</div>
            <div><span className="text-muted-foreground">Quai:</span> {viewTruck.dockNumber}</div>
            <div><span className="text-muted-foreground">But:</span> {viewTruck.purpose}</div>
            <div><span className="text-muted-foreground">Statut:</span> <StatusBadge status={viewTruck.status.replace("_"," ")} /></div>
            <div><span className="text-muted-foreground">Entrée:</span> {new Date(viewTruck.checkInTime).toLocaleString("fr-DZ")}</div>
            <div><span className="text-muted-foreground">Sortie:</span> {viewTruck.checkOutTime ? new Date(viewTruck.checkOutTime).toLocaleString("fr-DZ") : "—"}</div>
            {viewTruck.sealNumber && <div><span className="text-muted-foreground">Scellé:</span> {viewTruck.sealNumber}</div>}
            {viewTruck.poId && <div><span className="text-muted-foreground">PO:</span> {viewTruck.poId}</div>}
            {viewTruck.soId && <div><span className="text-muted-foreground">SO:</span> {viewTruck.soId}</div>}
            {viewTruck.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {viewTruck.notes}</div>}
          </div>
        </>}</DialogContent>
      </Dialog>
    </div>
  );
}
