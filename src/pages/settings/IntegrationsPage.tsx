import { useState, useMemo } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePagination } from "@/hooks/usePagination";
import DataTablePagination from "@/components/DataTablePagination";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormSection, formSelectClass, formInputClass } from "@/components/ui/form-field";
import { Plus, Search, Plug, Upload, Eye, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import type { Integration, IntegrationStatus, IntegrationType, ImportJob } from "@/data/mockDataPhase20_22";

export default function IntegrationsPage() {
  const { integrations, setIntegrations, importJobs, setImportJobs } = useWMSData();
  const { isSystemAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("integrations");

  // --- Integrations ---
  const [showIntForm, setShowIntForm] = useState(false);
  const [editInt, setEditInt] = useState<Integration | null>(null);
  const [viewInt, setViewInt] = useState<Integration | null>(null);
  const [intForm, setIntForm] = useState({ name: "", type: "ERP" as IntegrationType, provider: "", endpoint: "", syncFrequency: "", notes: "" });

  const filteredInt = useMemo(() => {
    let d = integrations as Integration[];
    if (search) { const s = search.toLowerCase(); d = d.filter(x => x.name.toLowerCase().includes(s) || x.provider.toLowerCase().includes(s)); }
    return d;
  }, [integrations, search]);
  const intPag = usePagination(filteredInt, 10);

  const openIntCreate = () => { setEditInt(null); setIntForm({ name: "", type: "ERP", provider: "", endpoint: "", syncFrequency: "", notes: "" }); setShowIntForm(true); };
  const openIntEdit = (i: Integration) => { setEditInt(i); setIntForm({ name: i.name, type: i.type, provider: i.provider, endpoint: i.endpoint, syncFrequency: i.syncFrequency, notes: i.notes }); setShowIntForm(true); };

  const saveInt = () => {
    if (!intForm.name || !intForm.provider) { toast({ title: "Erreur", description: "Champs obligatoires", variant: "destructive" }); return; }
    if (editInt) {
      setIntegrations((prev: Integration[]) => prev.map(i => i.id === editInt.id ? { ...i, ...intForm } : i));
      toast({ title: "Intégration modifiée" });
    } else {
      const ni: Integration = { id: `INT-${String(Date.now()).slice(-4)}`, ...intForm, status: "Disconnected", apiKeyConfigured: false, errorCount: 0, recordsSynced: 0, createdAt: new Date().toISOString().slice(0, 10), isActive: false };
      setIntegrations((prev: Integration[]) => [ni, ...prev]);
      toast({ title: "Intégration créée" });
    }
    setShowIntForm(false);
  };

  const toggleIntActive = (id: string) => setIntegrations((prev: Integration[]) => prev.map(i => i.id === id ? { ...i, isActive: !i.isActive, status: !i.isActive ? "Connected" : "Disconnected" } : i));
  const syncNow = (id: string) => { setIntegrations((prev: Integration[]) => prev.map(i => i.id === id ? { ...i, status: "Syncing" as IntegrationStatus, lastSync: new Date().toISOString() } : i)); setTimeout(() => { setIntegrations((prev: Integration[]) => prev.map(i => i.id === id ? { ...i, status: "Connected" as IntegrationStatus, recordsSynced: i.recordsSynced + Math.floor(Math.random() * 50) } : i)); toast({ title: "Sync terminé" }); }, 1500); };

  // --- Import Jobs ---
  const [viewImport, setViewImport] = useState<ImportJob | null>(null);
  const filteredImports = useMemo(() => {
    let d = importJobs as ImportJob[];
    if (search) { const s = search.toLowerCase(); d = d.filter(x => x.name.toLowerCase().includes(s) || x.fileName.toLowerCase().includes(s)); }
    return d;
  }, [importJobs, search]);
  const impPag = usePagination(filteredImports, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Plug className="h-6 w-6" /> Hub d'Intégrations</h1>
          <p className="text-sm text-muted-foreground mt-1">Connexions externes, imports CSV, monitoring sync</p>
        </div>
        <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(integrations as Integration[]).length}</div><p className="text-xs text-muted-foreground">Intégrations</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">{(integrations as Integration[]).filter(i => i.status === "Connected").length}</div><p className="text-xs text-muted-foreground">Connectées</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-red-500">{(integrations as Integration[]).filter(i => i.status === "Error").length}</div><p className="text-xs text-muted-foreground">En erreur</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(importJobs as ImportJob[]).length}</div><p className="text-xs text-muted-foreground">Jobs d'import</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="integrations"><Plug className="h-4 w-4 mr-1" /> Connexions ({filteredInt.length})</TabsTrigger>
          <TabsTrigger value="imports"><Upload className="h-4 w-4 mr-1" /> Imports CSV ({filteredImports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {isSystemAdmin && <div className="flex justify-end"><Button onClick={openIntCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Nouvelle intégration</Button></div>}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead>Fournisseur</TableHead><TableHead>Statut</TableHead><TableHead>Dernière sync</TableHead><TableHead>Fréquence</TableHead><TableHead>Records</TableHead><TableHead>Erreurs</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {intPag.paginatedItems.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell><StatusBadge status={i.type} /></TableCell>
                    <TableCell>{i.provider}</TableCell>
                    <TableCell><StatusBadge status={i.status} /></TableCell>
                    <TableCell className="text-xs">{i.lastSync ? new Date(i.lastSync).toLocaleString("fr-DZ") : "—"}</TableCell>
                    <TableCell className="text-xs">{i.syncFrequency}</TableCell>
                    <TableCell className="font-mono">{i.recordsSynced.toLocaleString()}</TableCell>
                    <TableCell className={i.errorCount > 0 ? "text-destructive font-medium" : ""}>{i.errorCount}</TableCell>
                    <TableCell><Switch checked={i.isActive} onCheckedChange={() => toggleIntActive(i.id)} /></TableCell>
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewInt(i)}><Eye className="h-4 w-4" /></Button>
                      {i.isActive && i.status !== "Syncing" && <Button variant="ghost" size="sm" onClick={() => syncNow(i.id)}><RefreshCw className="h-4 w-4" /></Button>}
                      {isSystemAdmin && <Button variant="ghost" size="sm" onClick={() => openIntEdit(i)}>✏️</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination {...intPag} totalItems={filteredInt.length} onPageChange={intPag.setCurrentPage} onPageSizeChange={intPag.setPageSize} />
        </TabsContent>

        <TabsContent value="imports" className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead>Fichier</TableHead><TableHead>Statut</TableHead><TableHead>Progression</TableHead><TableHead>Erreurs</TableHead><TableHead>Créé par</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {impPag.paginatedItems.map(j => (
                  <TableRow key={j.id}>
                    <TableCell className="font-medium">{j.name}</TableCell>
                    <TableCell><StatusBadge status={j.type} /></TableCell>
                    <TableCell className="text-xs font-mono">{j.fileName}</TableCell>
                    <TableCell><StatusBadge status={j.status} /></TableCell>
                    <TableCell className="min-w-[120px]">
                      {j.totalRows > 0 ? <div className="space-y-1"><Progress value={(j.processedRows / j.totalRows) * 100} className="h-2" /><span className="text-xs text-muted-foreground">{j.processedRows}/{j.totalRows}</span></div> : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className={j.errorRows > 0 ? "text-destructive font-medium" : ""}>{j.errorRows}</TableCell>
                    <TableCell>{j.createdBy}</TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => setViewImport(j)}><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination {...impPag} totalItems={filteredImports.length} onPageChange={impPag.setCurrentPage} onPageSizeChange={impPag.setPageSize} />
        </TabsContent>
      </Tabs>

      {/* Int Form */}
      <Dialog open={showIntForm} onOpenChange={setShowIntForm}>
        <DialogContent><DialogHeader><DialogTitle>{editInt ? "Modifier intégration" : "Nouvelle intégration"}</DialogTitle></DialogHeader>
          <FormSection title="Détails intégration">
            <FormField label="Nom"><Input className={formInputClass} value={intForm.name} onChange={e => setIntForm(p => ({ ...p, name: e.target.value }))} /></FormField>
            <FormField label="Type"><select className={formSelectClass} value={intForm.type} onChange={e => setIntForm(p => ({ ...p, type: e.target.value as IntegrationType }))}>{(["ERP","E-Commerce","Carrier","Accounting","Custom"] as IntegrationType[]).map(t => <option key={t} value={t}>{t}</option>)}</select></FormField>
            <FormField label="Fournisseur"><Input className={formInputClass} value={intForm.provider} onChange={e => setIntForm(p => ({ ...p, provider: e.target.value }))} /></FormField>
            <FormField label="Endpoint"><Input className={formInputClass} value={intForm.endpoint} onChange={e => setIntForm(p => ({ ...p, endpoint: e.target.value }))} placeholder="https://..." /></FormField>
            <FormField label="Fréquence sync"><Input className={formInputClass} value={intForm.syncFrequency} onChange={e => setIntForm(p => ({ ...p, syncFrequency: e.target.value }))} placeholder="ex: Toutes les 4h" /></FormField>
            <FormField label="Notes"><Input className={formInputClass} value={intForm.notes} onChange={e => setIntForm(p => ({ ...p, notes: e.target.value }))} /></FormField>
          </FormSection>
          <DialogFooter><Button variant="outline" onClick={() => setShowIntForm(false)}>Annuler</Button><Button onClick={saveInt}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Int */}
      <Dialog open={!!viewInt} onOpenChange={() => setViewInt(null)}>
        <DialogContent>{viewInt && <>
          <DialogHeader><DialogTitle>{viewInt.name}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Type:</span> {viewInt.type}</div>
            <div><span className="text-muted-foreground">Fournisseur:</span> {viewInt.provider}</div>
            <div><span className="text-muted-foreground">Statut:</span> <StatusBadge status={viewInt.status} /></div>
            <div><span className="text-muted-foreground">API Key:</span> {viewInt.apiKeyConfigured ? "✅ Configurée" : "❌ Non configurée"}</div>
            <div className="col-span-2"><span className="text-muted-foreground">Endpoint:</span> <code className="text-xs">{viewInt.endpoint}</code></div>
            <div><span className="text-muted-foreground">Fréquence:</span> {viewInt.syncFrequency}</div>
            <div><span className="text-muted-foreground">Records sync:</span> {viewInt.recordsSynced.toLocaleString()}</div>
            <div><span className="text-muted-foreground">Erreurs:</span> {viewInt.errorCount}</div>
            <div><span className="text-muted-foreground">Dernière sync:</span> {viewInt.lastSync ? new Date(viewInt.lastSync).toLocaleString("fr-DZ") : "—"}</div>
            {viewInt.lastError && <div className="col-span-2 p-2 bg-destructive/10 rounded text-xs text-destructive">{viewInt.lastError}</div>}
            {viewInt.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {viewInt.notes}</div>}
          </div>
        </>}</DialogContent>
      </Dialog>

      {/* View Import */}
      <Dialog open={!!viewImport} onOpenChange={() => setViewImport(null)}>
        <DialogContent>{viewImport && <>
          <DialogHeader><DialogTitle>{viewImport.name}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Type:</span> {viewImport.type}</div>
            <div><span className="text-muted-foreground">Fichier:</span> <code className="text-xs">{viewImport.fileName}</code></div>
            <div><span className="text-muted-foreground">Statut:</span> <StatusBadge status={viewImport.status} /></div>
            <div><span className="text-muted-foreground">Lignes:</span> {viewImport.processedRows}/{viewImport.totalRows}</div>
            <div><span className="text-muted-foreground">Erreurs:</span> {viewImport.errorRows}</div>
            <div><span className="text-muted-foreground">Créé par:</span> {viewImport.createdBy}</div>
            {viewImport.scheduledAt && <div><span className="text-muted-foreground">Planifié:</span> {new Date(viewImport.scheduledAt).toLocaleString("fr-DZ")}</div>}
            {viewImport.startedAt && <div><span className="text-muted-foreground">Début:</span> {new Date(viewImport.startedAt).toLocaleString("fr-DZ")}</div>}
            {viewImport.completedAt && <div><span className="text-muted-foreground">Fin:</span> {new Date(viewImport.completedAt).toLocaleString("fr-DZ")}</div>}
            <div className="col-span-2"><span className="text-muted-foreground">Mapping:</span> <pre className="text-xs bg-muted p-2 rounded mt-1">{JSON.stringify(viewImport.mapping, null, 2)}</pre></div>
            {viewImport.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {viewImport.notes}</div>}
          </div>
        </>}</DialogContent>
      </Dialog>
    </div>
  );
}
