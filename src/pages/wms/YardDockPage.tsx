import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormSection, formSelectClass, formInputClass } from "@/components/ui/form-field";
import { Plus, Search, Eye, Truck, DoorOpen, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { DockSlot, TruckCheckIn, TruckCheckInStatus, GateLog, DockStatus } from "@/data/mockDataPhase20_22";

export default function YardDockPage() {
  const { t } = useTranslation();
  const { dockSlots, setDockSlots, truckCheckIns, setTruckCheckIns, gateLogs, setGateLogs, warehouses } = useWMSData();
  const { canOperateOn, operationalWarehouses } = useWarehouseScope();
  const { canCreate } = useAuth();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("docks");

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
    if (!dockForm.dockNumber || !dockForm.warehouseId) { toast({ title: t("common.error"), description: t("yardDock.errorRequired"), variant: "destructive" }); return; }
    const wh = warehouses.find(w => w.id === dockForm.warehouseId);
    if (editDock) {
      setDockSlots((prev: DockSlot[]) => prev.map(d => d.id === editDock.id ? { ...d, ...dockForm, warehouseName: wh?.name || "" } : d));
      toast({ title: t("yardDock.dockModified") });
    } else {
      const nd: DockSlot = { id: `DOCK-${String(Date.now()).slice(-4)}`, ...dockForm, warehouseName: wh?.name || "", scheduledDate: undefined, scheduledTime: undefined, assignedTruckId: undefined };
      setDockSlots((prev: DockSlot[]) => [nd, ...prev]);
      toast({ title: t("yardDock.dockCreated") });
    }
    setShowDockForm(false);
  };

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
    setTruckForm({ truckPlate: "", driverName: "", driverPhone: "", carrierName: "", dockId: "", warehouseId: operationalWarehouses[0]?.id || "", purpose: "Inbound", sealNumber: "", notes: "" });
    setShowTruckForm(true);
  };
  const saveTruck = () => {
    if (!truckForm.truckPlate || !truckForm.driverName || !truckForm.warehouseId) { toast({ title: t("common.error"), description: t("yardDock.errorRequired"), variant: "destructive" }); return; }
    const wh = warehouses.find(w => w.id === truckForm.warehouseId);
    const dock = (dockSlots as DockSlot[]).find(d => d.id === truckForm.dockId);
    const nt: TruckCheckIn = { id: `TCI-${String(Date.now()).slice(-4)}`, ...truckForm, warehouseName: wh?.name || "", dockNumber: dock?.dockNumber || "N/A", status: "Checked_In", checkInTime: new Date().toISOString() };
    setTruckCheckIns((prev: TruckCheckIn[]) => [nt, ...prev]);
    const gl: GateLog = { id: `GL-${String(Date.now()).slice(-4)}`, warehouseId: truckForm.warehouseId, warehouseName: wh?.name || "", truckPlate: truckForm.truckPlate, driverName: truckForm.driverName, direction: "In", timestamp: new Date().toISOString(), gateNumber: "Auto", checkInId: nt.id, guardName: "Système", notes: "Entrée auto check-in" };
    setGateLogs((prev: GateLog[]) => [gl, ...prev]);
    toast({ title: t("yardDock.truckRegistered") });
    setShowTruckForm(false);
  };
  const updateTruckStatus = (id: string, status: TruckCheckInStatus) => {
    setTruckCheckIns((prev: TruckCheckIn[]) => prev.map(t2 => t2.id === id ? { ...t2, status, ...(status === "Checked_Out" ? { checkOutTime: new Date().toISOString() } : {}) } : t2));
    if (status === "Checked_Out") {
      const truck = (truckCheckIns as TruckCheckIn[]).find(t2 => t2.id === id);
      if (truck) {
        const gl: GateLog = { id: `GL-${String(Date.now()).slice(-4)}`, warehouseId: truck.warehouseId, warehouseName: truck.warehouseName, truckPlate: truck.truckPlate, driverName: truck.driverName, direction: "Out", timestamp: new Date().toISOString(), gateNumber: "Auto", checkInId: id, guardName: "Système", notes: "Sortie auto check-out" };
        setGateLogs((prev: GateLog[]) => [gl, ...prev]);
      }
    }
    toast({ title: t("yardDock.statusChanged", { status: status.replace("_", " ") }) });
  };

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
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Truck className="h-6 w-6" /> {t("yardDock.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("yardDock.subtitle")}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("yardDock.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(dockSlots as DockSlot[]).filter(d => d.status === "Available").length}</div><p className="text-xs text-muted-foreground">{t("yardDock.availableDocks")}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(truckCheckIns as TruckCheckIn[]).filter(tc => !["Checked_Out","Cancelled"].includes(tc.status)).length}</div><p className="text-xs text-muted-foreground">{t("yardDock.trucksOnSite")}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(dockSlots as DockSlot[]).filter(d => d.status === "Occupied").length}</div><p className="text-xs text-muted-foreground">{t("yardDock.occupiedDocks")}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(gateLogs as GateLog[]).filter(g => g.timestamp.startsWith("2026-02-24")).length}</div><p className="text-xs text-muted-foreground">{t("yardDock.passagesToday")}</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="docks"><Calendar className="h-4 w-4 mr-1" /> {t("yardDock.docksTab", { count: filteredDocks.length })}</TabsTrigger>
          <TabsTrigger value="trucks"><Truck className="h-4 w-4 mr-1" /> {t("yardDock.trucksTab", { count: filteredTrucks.length })}</TabsTrigger>
          <TabsTrigger value="gates"><DoorOpen className="h-4 w-4 mr-1" /> {t("yardDock.gatesTab", { count: filteredGates.length })}</TabsTrigger>
        </TabsList>

        <TabsContent value="docks" className="space-y-4">
          {userCanAct && <div className="flex justify-end"><Button onClick={openDockCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> {t("yardDock.newDock")}</Button></div>}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t("yardDock.dockId")}</TableHead><TableHead>{t("yardDock.dockNumber")}</TableHead><TableHead>{t("yardDock.warehouse")}</TableHead>
                <TableHead>{t("yardDock.type")}</TableHead><TableHead>{t("yardDock.capacity")}</TableHead><TableHead>{t("yardDock.status")}</TableHead>
                <TableHead>{t("yardDock.scheduled")}</TableHead><TableHead>{t("yardDock.actions")}</TableHead>
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

        <TabsContent value="trucks" className="space-y-4">
          {userCanAct && <div className="flex justify-end"><Button onClick={openTruckCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> {t("yardDock.registerTruck")}</Button></div>}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t("yardDock.truckId")}</TableHead><TableHead>{t("yardDock.plate")}</TableHead><TableHead>{t("yardDock.driver")}</TableHead>
                <TableHead>{t("yardDock.carrier")}</TableHead><TableHead>{t("yardDock.dock")}</TableHead><TableHead>{t("yardDock.purpose")}</TableHead>
                <TableHead>{t("yardDock.status")}</TableHead><TableHead>{t("yardDock.checkIn")}</TableHead><TableHead>{t("yardDock.actions")}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {truckPag.paginatedItems.map(tc => (
                  <TableRow key={tc.id}>
                    <TableCell className="font-mono text-xs">{tc.id}</TableCell>
                    <TableCell className="font-medium">{tc.truckPlate}</TableCell>
                    <TableCell>{tc.driverName}</TableCell>
                    <TableCell>{tc.carrierName}</TableCell>
                    <TableCell>{tc.dockNumber}</TableCell>
                    <TableCell><StatusBadge status={tc.purpose} /></TableCell>
                    <TableCell><StatusBadge status={tc.status.replace("_", " ")} /></TableCell>
                    <TableCell className="text-xs">{new Date(tc.checkInTime).toLocaleString("fr-DZ")}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewTruck(tc)}><Eye className="h-4 w-4" /></Button>
                      {userCanAct && tc.status !== "Checked_Out" && tc.status !== "Cancelled" && (
                        <select className={formSelectClass + " text-xs py-1 px-2"} value={tc.status} onChange={e => updateTruckStatus(tc.id, e.target.value as TruckCheckInStatus)}>
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

        <TabsContent value="gates" className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t("yardDock.gateId")}</TableHead><TableHead>{t("yardDock.plate")}</TableHead><TableHead>{t("yardDock.driver")}</TableHead>
                <TableHead>{t("yardDock.direction")}</TableHead><TableHead>{t("yardDock.gate")}</TableHead><TableHead>{t("yardDock.time")}</TableHead>
                <TableHead>{t("yardDock.warehouse")}</TableHead><TableHead>{t("yardDock.guard")}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {gatePag.paginatedItems.map(g => (
                  <TableRow key={g.id}>
                    <TableCell className="font-mono text-xs">{g.id}</TableCell>
                    <TableCell className="font-medium">{g.truckPlate}</TableCell>
                    <TableCell>{g.driverName}</TableCell>
                    <TableCell><StatusBadge status={g.direction === "In" ? t("yardDock.directionIn") : t("yardDock.directionOut")} /></TableCell>
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
        <DialogContent><DialogHeader><DialogTitle>{editDock ? t("yardDock.editDock") : t("yardDock.createDock")}</DialogTitle></DialogHeader>
          <FormSection title={editDock ? t("yardDock.editDock") : t("yardDock.dockDetails")}>
            <FormField label={t("yardDock.dockNumberField")}><Input className={formInputClass} value={dockForm.dockNumber} onChange={e => setDockForm(p => ({ ...p, dockNumber: e.target.value }))} /></FormField>
            <FormField label={t("yardDock.warehouseField")}><select className={formSelectClass} value={dockForm.warehouseId} onChange={e => setDockForm(p => ({ ...p, warehouseId: e.target.value }))}>{operationalWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
            <FormField label={t("yardDock.typeField")}><select className={formSelectClass} value={dockForm.type} onChange={e => setDockForm(p => ({ ...p, type: e.target.value as DockSlot["type"] }))}><option value="Inbound">{t("yardDock.typeInbound")}</option><option value="Outbound">{t("yardDock.typeOutbound")}</option><option value="Both">{t("yardDock.typeBoth")}</option></select></FormField>
            <FormField label={t("yardDock.capacityField")}><Input className={formInputClass} value={dockForm.capacity} onChange={e => setDockForm(p => ({ ...p, capacity: e.target.value }))} placeholder={t("yardDock.capacityPlaceholder")} /></FormField>
            <FormField label={t("yardDock.statusField")}><select className={formSelectClass} value={dockForm.status} onChange={e => setDockForm(p => ({ ...p, status: e.target.value as DockStatus }))}>{(["Available","Occupied","Maintenance","Reserved"] as DockStatus[]).map(s => <option key={s} value={s}>{s}</option>)}</select></FormField>
            <FormField label={t("yardDock.notesField")}><Input className={formInputClass} value={dockForm.notes} onChange={e => setDockForm(p => ({ ...p, notes: e.target.value }))} /></FormField>
          </FormSection>
          <DialogFooter><Button variant="outline" onClick={() => setShowDockForm(false)}>{t("common.cancel")}</Button><Button onClick={saveDock}>{t("common.save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Truck Form Dialog */}
      <Dialog open={showTruckForm} onOpenChange={setShowTruckForm}>
        <DialogContent><DialogHeader><DialogTitle>{t("yardDock.registerTruckTitle")}</DialogTitle></DialogHeader>
          <FormSection title={t("yardDock.truckInfo")}>
            <FormField label={t("yardDock.plateField")}><Input className={formInputClass} value={truckForm.truckPlate} onChange={e => setTruckForm(p => ({ ...p, truckPlate: e.target.value }))} /></FormField>
            <FormField label={t("yardDock.driverField")}><Input className={formInputClass} value={truckForm.driverName} onChange={e => setTruckForm(p => ({ ...p, driverName: e.target.value }))} /></FormField>
            <FormField label={t("yardDock.phoneField")}><Input className={formInputClass} value={truckForm.driverPhone} onChange={e => setTruckForm(p => ({ ...p, driverPhone: e.target.value }))} /></FormField>
            <FormField label={t("yardDock.carrierField")}><Input className={formInputClass} value={truckForm.carrierName} onChange={e => setTruckForm(p => ({ ...p, carrierName: e.target.value }))} /></FormField>
            <FormField label={t("yardDock.warehouseField")}><select className={formSelectClass} value={truckForm.warehouseId} onChange={e => setTruckForm(p => ({ ...p, warehouseId: e.target.value }))}>{operationalWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
            <FormField label={t("yardDock.dockField")}><select className={formSelectClass} value={truckForm.dockId} onChange={e => setTruckForm(p => ({ ...p, dockId: e.target.value }))}><option value="">—</option>{(dockSlots as DockSlot[]).filter(d => d.warehouseId === truckForm.warehouseId && d.status === "Available").map(d => <option key={d.id} value={d.id}>{d.dockNumber}</option>)}</select></FormField>
            <FormField label={t("yardDock.purposeField")}><select className={formSelectClass} value={truckForm.purpose} onChange={e => setTruckForm(p => ({ ...p, purpose: e.target.value as TruckCheckIn["purpose"] }))}><option value="Inbound">{t("yardDock.typeInbound")}</option><option value="Outbound">{t("yardDock.typeOutbound")}</option></select></FormField>
            <FormField label={t("yardDock.sealField")}><Input className={formInputClass} value={truckForm.sealNumber} onChange={e => setTruckForm(p => ({ ...p, sealNumber: e.target.value }))} /></FormField>
            <FormField label={t("yardDock.notesField")}><Input className={formInputClass} value={truckForm.notes} onChange={e => setTruckForm(p => ({ ...p, notes: e.target.value }))} /></FormField>
          </FormSection>
          <DialogFooter><Button variant="outline" onClick={() => setShowTruckForm(false)}>{t("common.cancel")}</Button><Button onClick={saveTruck}>{t("common.save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Truck Detail Dialog */}
      <Dialog open={!!viewTruck} onOpenChange={() => setViewTruck(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{viewTruck?.truckPlate}</DialogTitle></DialogHeader>
          {viewTruck && (
            <div className="space-y-2 text-sm">
              <p><strong>{t("yardDock.driverField")}:</strong> {viewTruck.driverName}</p>
              <p><strong>{t("yardDock.phoneField")}:</strong> {viewTruck.driverPhone}</p>
              <p><strong>{t("yardDock.carrierField")}:</strong> {viewTruck.carrierName}</p>
              <p><strong>{t("yardDock.dock")}:</strong> {viewTruck.dockNumber}</p>
              <p><strong>{t("yardDock.purpose")}:</strong> {viewTruck.purpose}</p>
              <p><strong>{t("yardDock.status")}:</strong> <StatusBadge status={viewTruck.status.replace("_", " ")} /></p>
              <p><strong>{t("yardDock.checkIn")}:</strong> {new Date(viewTruck.checkInTime).toLocaleString("fr-DZ")}</p>
              {viewTruck.checkOutTime && <p><strong>Check-out:</strong> {new Date(viewTruck.checkOutTime).toLocaleString("fr-DZ")}</p>}
              {viewTruck.sealNumber && <p><strong>{t("yardDock.sealField")}:</strong> {viewTruck.sealNumber}</p>}
              {viewTruck.notes && <p><strong>{t("yardDock.notesField")}:</strong> {viewTruck.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
