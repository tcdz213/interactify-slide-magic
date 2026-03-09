import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import { usePagination } from "@/hooks/usePagination";
import DataTablePagination from "@/components/DataTablePagination";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormSection, formSelectClass, formInputClass } from "@/components/ui/form-field";
import { Plus, Search, Eye, Cog, Wifi, WifiOff, Activity, Bot, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// ─── Types ───
type DeviceType = "Conveyor" | "Sorter" | "AGV" | "Robotic_Arm" | "AS_RS" | "Palletizer";
type DeviceStatus = "Online" | "Offline" | "Maintenance" | "Error";
type CommandStatus = "Queued" | "Executing" | "Completed" | "Failed";

interface AutomationDevice {
  id: string;
  name: string;
  type: DeviceType;
  warehouseId: string;
  warehouseName: string;
  zone: string;
  ipAddress: string;
  protocol: "MQTT" | "OPC-UA" | "REST" | "Modbus";
  status: DeviceStatus;
  lastPing: string;
  throughput: number; // units/hour
  errorRate: number; // %
  firmware: string;
}

interface AutomationCommand {
  id: string;
  deviceId: string;
  deviceName: string;
  command: string;
  payload: string;
  status: CommandStatus;
  issuedAt: string;
  completedAt?: string;
  operator: string;
}

// ─── Mock Data ───
const MOCK_DEVICES: AutomationDevice[] = [
  { id: "DEV-001", name: "Convoyeur Principal L1", type: "Conveyor", warehouseId: "wh-alger-construction", warehouseName: "Alger Construction", zone: "Zone A - Réception", ipAddress: "192.168.10.101", protocol: "OPC-UA", status: "Online", lastPing: "2026-03-08 14:32", throughput: 1200, errorRate: 0.3, firmware: "v3.2.1" },
  { id: "DEV-002", name: "Trieur Automatique S1", type: "Sorter", warehouseId: "wh-alger-construction", warehouseName: "Alger Construction", zone: "Zone B - Tri", ipAddress: "192.168.10.102", protocol: "OPC-UA", status: "Online", lastPing: "2026-03-08 14:31", throughput: 800, errorRate: 0.5, firmware: "v2.8.4" },
  { id: "DEV-003", name: "AGV Navette #1", type: "AGV", warehouseId: "wh-alger-construction", warehouseName: "Alger Construction", zone: "Zone C - Stockage", ipAddress: "192.168.10.201", protocol: "MQTT", status: "Online", lastPing: "2026-03-08 14:30", throughput: 60, errorRate: 1.2, firmware: "v4.1.0" },
  { id: "DEV-004", name: "AGV Navette #2", type: "AGV", warehouseId: "wh-alger-construction", warehouseName: "Alger Construction", zone: "Zone C - Stockage", ipAddress: "192.168.10.202", protocol: "MQTT", status: "Maintenance", lastPing: "2026-03-08 10:15", throughput: 0, errorRate: 0, firmware: "v4.1.0" },
  { id: "DEV-005", name: "Bras Robotique R1", type: "Robotic_Arm", warehouseId: "wh-oran-food", warehouseName: "Oran Food", zone: "Zone A - Palettisation", ipAddress: "192.168.20.101", protocol: "REST", status: "Online", lastPing: "2026-03-08 14:32", throughput: 400, errorRate: 0.1, firmware: "v5.0.2" },
  { id: "DEV-006", name: "AS/RS Système Oran", type: "AS_RS", warehouseId: "wh-oran-food", warehouseName: "Oran Food", zone: "Zone B - Stockage Auto", ipAddress: "192.168.20.50", protocol: "OPC-UA", status: "Online", lastPing: "2026-03-08 14:32", throughput: 300, errorRate: 0.2, firmware: "v6.1.3" },
  { id: "DEV-007", name: "Palettiseur Auto P1", type: "Palletizer", warehouseId: "wh-oran-food", warehouseName: "Oran Food", zone: "Zone C - Expédition", ipAddress: "192.168.20.102", protocol: "Modbus", status: "Error", lastPing: "2026-03-08 13:45", throughput: 0, errorRate: 5.0, firmware: "v2.3.1" },
  { id: "DEV-008", name: "Convoyeur Secondaire L2", type: "Conveyor", warehouseId: "wh-constantine-tech", warehouseName: "Constantine Tech", zone: "Zone A - Inbound", ipAddress: "192.168.30.101", protocol: "REST", status: "Offline", lastPing: "2026-03-07 18:00", throughput: 0, errorRate: 0, firmware: "v3.1.0" },
];

const MOCK_COMMANDS: AutomationCommand[] = [
  { id: "CMD-001", deviceId: "DEV-001", deviceName: "Convoyeur Principal L1", command: "START_LINE", payload: '{"speed": 1.5, "direction": "forward"}', status: "Completed", issuedAt: "2026-03-08 08:00", completedAt: "2026-03-08 08:00", operator: "Karim Ben Ali" },
  { id: "CMD-002", deviceId: "DEV-003", deviceName: "AGV Navette #1", command: "MOVE_TO", payload: '{"destination": "Zone-C-R03-B12", "priority": "high"}', status: "Completed", issuedAt: "2026-03-08 09:15", completedAt: "2026-03-08 09:18", operator: "Tarek Daoui" },
  { id: "CMD-003", deviceId: "DEV-005", deviceName: "Bras Robotique R1", command: "PICK_PLACE", payload: '{"source": "conveyor-1", "target": "pallet-A3", "sku": "P001"}', status: "Executing", issuedAt: "2026-03-08 14:30", operator: "Sara Khalil" },
  { id: "CMD-004", deviceId: "DEV-007", deviceName: "Palettiseur Auto P1", command: "RESET_ERROR", payload: '{"errorCode": "E-042"}', status: "Failed", issuedAt: "2026-03-08 13:50", completedAt: "2026-03-08 13:50", operator: "Karim Ben Ali" },
  { id: "CMD-005", deviceId: "DEV-006", deviceName: "AS/RS Système Oran", command: "RETRIEVE", payload: '{"location": "ASRS-L04-R08", "sku": "P003", "qty": 50}', status: "Queued", issuedAt: "2026-03-08 14:33", operator: "Tarek Daoui" },
];

const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  Conveyor: "Convoyeur",
  Sorter: "Trieur",
  AGV: "AGV (Véhicule Guidé)",
  Robotic_Arm: "Bras Robotique",
  AS_RS: "AS/RS (Stockage Auto)",
  Palletizer: "Palettiseur",
};

export default function AutomationApiPage() {
  const { t } = useTranslation();
  const { canOperateOn } = useWarehouseScope();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<DeviceType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<DeviceStatus | "all">("all");
  const [selectedDevice, setSelectedDevice] = useState<AutomationDevice | null>(null);
  const [showCommand, setShowCommand] = useState(false);
  const [tab, setTab] = useState<"devices" | "commands">("devices");

  const [devices] = useState(MOCK_DEVICES);
  const [commands, setCommands] = useState(MOCK_COMMANDS);

  // New command form
  const [cmdForm, setCmdForm] = useState({ deviceId: "", command: "", payload: "{}" });

  const filteredDevices = useMemo(() => {
    let d = devices.filter(x => canOperateOn(x.warehouseId));
    if (filterType !== "all") d = d.filter(x => x.type === filterType);
    if (filterStatus !== "all") d = d.filter(x => x.status === filterStatus);
    if (search) {
      const s = search.toLowerCase();
      d = d.filter(x => x.name.toLowerCase().includes(s) || x.id.toLowerCase().includes(s) || x.zone.toLowerCase().includes(s));
    }
    return d;
  }, [devices, canOperateOn, filterType, filterStatus, search]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const s = search.toLowerCase();
    return commands.filter(c => c.deviceName.toLowerCase().includes(s) || c.command.toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
  }, [commands, search]);

  const { paginatedItems: paginatedDevices, currentPage: dp, totalPages: dtp, setCurrentPage: dsp, pageSize: dps, setPageSize: dsps } = usePagination(filteredDevices, 10);
  const { paginatedItems: paginatedCommands, currentPage: cp, totalPages: ctp, setCurrentPage: csp, pageSize: cps, setPageSize: csps } = usePagination(filteredCommands, 10);

  const stats = useMemo(() => ({
    online: devices.filter(d => d.status === "Online").length,
    offline: devices.filter(d => d.status === "Offline").length,
    maintenance: devices.filter(d => d.status === "Maintenance").length,
    error: devices.filter(d => d.status === "Error").length,
    totalThroughput: devices.filter(d => d.status === "Online").reduce((s, d) => s + d.throughput, 0),
  }), [devices]);

  const handleSendCommand = () => {
    if (!cmdForm.deviceId || !cmdForm.command) {
      toast({ title: "Erreur", description: "Appareil et commande requis.", variant: "destructive" });
      return;
    }
    const dev = devices.find(d => d.id === cmdForm.deviceId);
    const newCmd: AutomationCommand = {
      id: `CMD-${String(commands.length + 1).padStart(3, "0")}`,
      deviceId: cmdForm.deviceId,
      deviceName: dev?.name ?? cmdForm.deviceId,
      command: cmdForm.command,
      payload: cmdForm.payload,
      status: "Queued",
      issuedAt: new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
      operator: "Utilisateur courant",
    };
    setCommands(prev => [newCmd, ...prev]);
    setShowCommand(false);
    setCmdForm({ deviceId: "", command: "", payload: "{}" });
    toast({ title: "Commande envoyée", description: `${newCmd.id} → ${dev?.name}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Automatisation & Robotique</h1>
            <p className="text-sm text-muted-foreground">API d'intégration convoyeurs, AGV, bras robotiques et AS/RS</p>
          </div>
        </div>
        <Button onClick={() => setShowCommand(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Envoyer commande
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">En ligne</p>
          <p className="text-xl font-semibold text-success">{stats.online}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Hors ligne</p>
          <p className="text-xl font-semibold text-muted-foreground">{stats.offline}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Maintenance</p>
          <p className="text-xl font-semibold text-warning">{stats.maintenance}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">En erreur</p>
          <p className="text-xl font-semibold text-destructive">{stats.error}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Débit total</p>
          <p className="text-xl font-semibold">{stats.totalThroughput.toLocaleString()} u/h</p>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-1">
        <button onClick={() => setTab("devices")} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === "devices" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Cog className="inline h-4 w-4 mr-1" /> Appareils ({devices.length})
        </button>
        <button onClick={() => setTab("commands")} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === "commands" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Activity className="inline h-4 w-4 mr-1" /> Commandes ({commands.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {tab === "devices" && (
          <>
            <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className={formSelectClass}>
              <option value="all">Tous les types</option>
              {(Object.keys(DEVICE_TYPE_LABELS) as DeviceType[]).map(k => (
                <option key={k} value={k}>{DEVICE_TYPE_LABELS[k]}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className={formSelectClass}>
              <option value="all">Tous statuts</option>
              <option value="Online">En ligne</option>
              <option value="Offline">Hors ligne</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Error">Erreur</option>
            </select>
          </>
        )}
      </div>

      {/* Devices Table */}
      {tab === "devices" && (
        <>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Entrepôt</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Protocole</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Débit</TableHead>
                  <TableHead>Erreur %</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDevices.map(d => (
                  <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDevice(d)}>
                    <TableCell className="font-mono text-xs">{d.id}</TableCell>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell><Badge variant="outline">{DEVICE_TYPE_LABELS[d.type]}</Badge></TableCell>
                    <TableCell>{d.warehouseName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.zone}</TableCell>
                    <TableCell><Badge variant="secondary">{d.protocol}</Badge></TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} />
                    </TableCell>
                    <TableCell>{d.throughput > 0 ? `${d.throughput} u/h` : "—"}</TableCell>
                    <TableCell>{d.errorRate > 0 ? `${d.errorRate}%` : "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedDevice(d); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedDevices.length === 0 && (
                  <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Aucun appareil trouvé</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination currentPage={dp} totalPages={dtp} onPageChange={dsp} pageSize={dps} onPageSizeChange={dsps} totalItems={filteredDevices.length} />
        </>
      )}

      {/* Commands Table */}
      {tab === "commands" && (
        <>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Appareil</TableHead>
                  <TableHead>Commande</TableHead>
                  <TableHead>Payload</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Émis</TableHead>
                  <TableHead>Terminé</TableHead>
                  <TableHead>Opérateur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCommands.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell className="font-medium">{c.deviceName}</TableCell>
                    <TableCell><Badge variant="outline" className="font-mono">{c.command}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs font-mono text-muted-foreground">{c.payload}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-xs">{c.issuedAt}</TableCell>
                    <TableCell className="text-xs">{c.completedAt ?? "—"}</TableCell>
                    <TableCell className="text-xs">{c.operator}</TableCell>
                  </TableRow>
                ))}
                {paginatedCommands.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Aucune commande</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination currentPage={cp} totalPages={ctp} onPageChange={csp} pageSize={cps} onPageSizeChange={csps} totalItems={filteredCommands.length} />
        </>
      )}

      {/* Device Detail Dialog */}
      <Dialog open={!!selectedDevice} onOpenChange={() => setSelectedDevice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" /> {selectedDevice?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">ID:</span> <span className="font-mono">{selectedDevice.id}</span></div>
                <div><span className="text-muted-foreground">Type:</span> {DEVICE_TYPE_LABELS[selectedDevice.type]}</div>
                <div><span className="text-muted-foreground">Entrepôt:</span> {selectedDevice.warehouseName}</div>
                <div><span className="text-muted-foreground">Zone:</span> {selectedDevice.zone}</div>
                <div><span className="text-muted-foreground">IP:</span> <span className="font-mono">{selectedDevice.ipAddress}</span></div>
                <div><span className="text-muted-foreground">Protocole:</span> {selectedDevice.protocol}</div>
                <div><span className="text-muted-foreground">Firmware:</span> {selectedDevice.firmware}</div>
                <div><span className="text-muted-foreground">Dernier ping:</span> {selectedDevice.lastPing}</div>
                <div><span className="text-muted-foreground">Débit:</span> {selectedDevice.throughput} u/h</div>
                <div><span className="text-muted-foreground">Taux erreur:</span> {selectedDevice.errorRate}%</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Statut:</span>
                <StatusBadge status={selectedDevice.status} />
              </div>

              {/* API Endpoint Info */}
              <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">API Endpoint</p>
                <code className="text-xs block font-mono break-all">
                  POST /api/v1/automation/devices/{selectedDevice.id}/commands
                </code>
                <p className="text-xs text-muted-foreground mt-1">
                  Protocole: {selectedDevice.protocol} • Authentification: Bearer Token
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDevice(null)}>Fermer</Button>
            <Button onClick={() => { setShowCommand(true); setCmdForm(f => ({ ...f, deviceId: selectedDevice?.id ?? "" })); setSelectedDevice(null); }}>
              <ArrowRight className="h-4 w-4 mr-1" /> Envoyer commande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Command Dialog */}
      <Dialog open={showCommand} onOpenChange={setShowCommand}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer une commande</DialogTitle>
          </DialogHeader>
          <FormSection title="Paramètres">
            <FormField label="Appareil" required>
              <select value={cmdForm.deviceId} onChange={e => setCmdForm(f => ({ ...f, deviceId: e.target.value }))} className={formSelectClass}>
                <option value="">-- Sélectionner --</option>
                {devices.filter(d => d.status === "Online").map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                ))}
              </select>
            </FormField>
            <FormField label="Commande" required>
              <select value={cmdForm.command} onChange={e => setCmdForm(f => ({ ...f, command: e.target.value }))} className={formSelectClass}>
                <option value="">-- Sélectionner --</option>
                <option value="START_LINE">START_LINE</option>
                <option value="STOP_LINE">STOP_LINE</option>
                <option value="MOVE_TO">MOVE_TO</option>
                <option value="PICK_PLACE">PICK_PLACE</option>
                <option value="RETRIEVE">RETRIEVE</option>
                <option value="STORE">STORE</option>
                <option value="RESET_ERROR">RESET_ERROR</option>
                <option value="CALIBRATE">CALIBRATE</option>
                <option value="PALLETIZE">PALLETIZE</option>
              </select>
            </FormField>
            <FormField label="Payload (JSON)">
              <textarea
                value={cmdForm.payload}
                onChange={e => setCmdForm(f => ({ ...f, payload: e.target.value }))}
                className={`${formInputClass} font-mono text-xs min-h-[80px]`}
                placeholder='{"key": "value"}'
              />
            </FormField>
          </FormSection>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommand(false)}>Annuler</Button>
            <Button onClick={handleSendCommand}>Envoyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
