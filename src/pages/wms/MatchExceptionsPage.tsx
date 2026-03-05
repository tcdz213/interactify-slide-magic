import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, XCircle, Search, Clock, Filter, ArrowUpDown, FileText, MessageSquare } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { performThreeWayMatch, DEFAULT_TOLERANCES, type ThreeWayMatchSummary, type MatchResult } from "@/lib/threeWayMatch";
import { currency } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ExceptionSeverity = "critical" | "high" | "medium" | "low";
type ExceptionResolution = "pending" | "accepted" | "credit_note" | "po_amended" | "supplier_return" | "escalated";

interface MatchException {
  id: string;
  poId: string;
  grnId: string;
  invoiceId?: string;
  productId: string;
  productName: string;
  exceptionType: string;
  severity: ExceptionSeverity;
  variancePct: number;
  varianceAmount: number;
  resolution: ExceptionResolution;
  resolvedBy?: string;
  resolvedAt?: string;
  notes: string;
  createdAt: string;
  slaDeadline: string;
}

const SLA_HOURS: Record<ExceptionSeverity, number> = { critical: 24, high: 72, medium: 120, low: 240 };

function getSeverity(variancePct: number, varianceAmount: number): ExceptionSeverity {
  const absPct = Math.abs(variancePct);
  if (absPct > 10 || Math.abs(varianceAmount) > 50000) return "critical";
  if (absPct > 5) return "high";
  if (absPct > 2) return "medium";
  return "low";
}

function getSlaDeadline(createdAt: string, severity: ExceptionSeverity): string {
  const d = new Date(createdAt);
  d.setHours(d.getHours() + SLA_HOURS[severity]);
  return d.toISOString();
}

const SEVERITY_COLORS: Record<ExceptionSeverity, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

const RESOLUTION_LABELS: Record<ExceptionResolution, string> = {
  pending: "En attente",
  accepted: "Variance acceptée",
  credit_note: "Avoir demandé",
  po_amended: "PO modifié",
  supplier_return: "Retour fournisseur",
  escalated: "Escaladé",
};

export default function MatchExceptionsPage() {
  const { purchaseOrders, grns, invoices, productUnitConversions } = useWMSData();
  const [filterSeverity, setFilterSeverity] = useState<"all" | ExceptionSeverity>("all");
  const [filterResolution, setFilterResolution] = useState<"all" | ExceptionResolution>("all");
  const [search, setSearch] = useState("");
  const [resolveDialog, setResolveDialog] = useState<MatchException | null>(null);
  const [resolveAction, setResolveAction] = useState<ExceptionResolution>("accepted");
  const [resolveNotes, setResolveNotes] = useState("");

  // Generate exceptions from 3-way match results
  const { exceptions, setExceptions, matchSummaries } = useMemo(() => {
    const summaries: ThreeWayMatchSummary[] = [];
    const excs: MatchException[] = [];
    
    for (const grn of grns) {
      if (grn.status !== "Approved") continue;
      const po = purchaseOrders.find(p => p.id === grn.poId);
      if (!po) continue;

      // Find matching invoice (vendor invoice for this PO)
      const invoice = invoices.find(i => i.orderId === po.id) ?? null;
      
      const invData = invoice ? {
        id: invoice.id,
        taxAmount: invoice.taxAmount,
        lines: po.lines.map(pl => ({
          productId: pl.productId,
          qty: pl.qty,
          unitAbbr: pl.unitAbbr,
          conversionFactor: pl.conversionFactor,
          unitCost: pl.unitCost,
          lineTotal: pl.lineTotal,
        })),
      } : null;

      const summary = performThreeWayMatch(po, grn, invData, productUnitConversions);
      summaries.push(summary);

      for (const line of summary.lines) {
        if (line.status === "mismatch" || line.status === "within_tolerance") {
          const maxVar = Math.max(Math.abs(line.grnVariancePct), Math.abs(line.priceVariancePct));
          const maxAmt = Math.max(Math.abs(line.grnVariance), Math.abs(line.priceVariance));
          const severity = getSeverity(maxVar, maxAmt);
          const createdAt = grn.receivedAt;
          
          excs.push({
            id: `EXC-${grn.id}-${line.productId}`,
            poId: po.id,
            grnId: grn.id,
            invoiceId: invoice?.id,
            productId: line.productId,
            productName: line.productName,
            exceptionType: line.issues.join("; "),
            severity,
            variancePct: maxVar,
            varianceAmount: maxAmt,
            resolution: "pending",
            notes: "",
            createdAt,
            slaDeadline: getSlaDeadline(createdAt, severity),
          });
        }
      }
    }

    return { exceptions: excs, setExceptions: () => {}, matchSummaries: summaries };
  }, [grns, purchaseOrders, invoices, productUnitConversions]);

  const [localResolutions, setLocalResolutions] = useState<Record<string, { resolution: ExceptionResolution; notes: string }>>({});

  const allExceptions = exceptions.map(e => ({
    ...e,
    resolution: localResolutions[e.id]?.resolution ?? e.resolution,
    notes: localResolutions[e.id]?.notes ?? e.notes,
  }));

  const filtered = allExceptions.filter(e => {
    if (filterSeverity !== "all" && e.severity !== filterSeverity) return false;
    if (filterResolution !== "all" && e.resolution !== filterResolution) return false;
    if (search && !e.productName.toLowerCase().includes(search.toLowerCase()) && !e.poId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pending = allExceptions.filter(e => e.resolution === "pending").length;
  const critical = allExceptions.filter(e => e.severity === "critical" && e.resolution === "pending").length;
  const overdueSla = allExceptions.filter(e => e.resolution === "pending" && new Date(e.slaDeadline) < new Date()).length;

  const handleResolve = () => {
    if (!resolveDialog) return;
    setLocalResolutions(prev => ({
      ...prev,
      [resolveDialog.id]: { resolution: resolveAction, notes: resolveNotes },
    }));
    toast({ title: "Exception résolue", description: `${resolveDialog.id} — ${RESOLUTION_LABELS[resolveAction]}` });
    setResolveDialog(null);
    setResolveNotes("");
  };

  const slaRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff < 0) return "Dépassé";
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j ${hours % 24}h`;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-amber-500" /> File d'exceptions — Rapprochement</h1>
          <p className="text-muted-foreground text-sm">Écarts PO ↔ GRN ↔ Facture nécessitant une résolution</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Total exceptions</div><div className="text-2xl font-bold">{allExceptions.length}</div></CardContent></Card>
        <Card className="border-amber-200 dark:border-amber-800"><CardContent className="pt-4"><div className="text-sm text-muted-foreground">En attente</div><div className="text-2xl font-bold text-amber-600">{pending}</div></CardContent></Card>
        <Card className="border-red-200 dark:border-red-800"><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Critiques</div><div className="text-2xl font-bold text-red-600">{critical}</div></CardContent></Card>
        <Card className="border-destructive/30"><CardContent className="pt-4"><div className="text-sm text-muted-foreground">SLA dépassé</div><div className="text-2xl font-bold text-destructive">{overdueSla}</div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><input className="pl-8 pr-3 py-2 border rounded-md text-sm bg-background w-56" placeholder="Rechercher PO, produit…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="border rounded-md px-3 py-2 text-sm bg-background" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value as any)}>
          <option value="all">Toutes sévérités</option>
          <option value="critical">Critique</option>
          <option value="high">Haute</option>
          <option value="medium">Moyenne</option>
          <option value="low">Basse</option>
        </select>
        <select className="border rounded-md px-3 py-2 text-sm bg-background" value={filterResolution} onChange={e => setFilterResolution(e.target.value as any)}>
          <option value="all">Tous statuts</option>
          <option value="pending">En attente</option>
          <option value="accepted">Accepté</option>
          <option value="credit_note">Avoir</option>
          <option value="po_amended">PO modifié</option>
          <option value="supplier_return">Retour</option>
          <option value="escalated">Escaladé</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
          <p className="font-medium">Aucune exception trouvée</p>
          <p className="text-sm">Tous les rapprochements sont conformes</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-3 py-2 text-left font-medium">ID</th>
                <th className="px-3 py-2 text-left font-medium">PO / GRN</th>
                <th className="px-3 py-2 text-left font-medium">Produit</th>
                <th className="px-3 py-2 text-left font-medium">Type d'écart</th>
                <th className="px-3 py-2 text-center font-medium">Sévérité</th>
                <th className="px-3 py-2 text-right font-medium">Écart %</th>
                <th className="px-3 py-2 text-center font-medium">SLA</th>
                <th className="px-3 py-2 text-center font-medium">Résolution</th>
                <th className="px-3 py-2 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(exc => (
                <tr key={exc.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{exc.id.slice(0, 20)}</td>
                  <td className="px-3 py-2"><div className="text-xs">{exc.poId}</div><div className="text-xs text-muted-foreground">{exc.grnId}</div></td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{exc.productName}</td>
                  <td className="px-3 py-2 text-xs max-w-[250px]">{exc.exceptionType}</td>
                  <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[exc.severity]}`}>{exc.severity}</span></td>
                  <td className="px-3 py-2 text-right font-mono">{exc.variancePct.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-center">
                    {exc.resolution === "pending" ? (
                      <span className={`text-xs font-medium ${new Date(exc.slaDeadline) < new Date() ? "text-destructive" : "text-muted-foreground"}`}>
                        <Clock className="inline h-3 w-3 mr-1" />{slaRemaining(exc.slaDeadline)}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2 text-center"><span className="text-xs">{RESOLUTION_LABELS[exc.resolution]}</span></td>
                  <td className="px-3 py-2 text-center">
                    {exc.resolution === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => { setResolveDialog(exc); setResolveAction("accepted"); setResolveNotes(""); }}>
                        Résoudre
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resolve Dialog */}
      <Dialog open={!!resolveDialog} onOpenChange={() => setResolveDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Résoudre l'exception</DialogTitle></DialogHeader>
          {resolveDialog && (
            <div className="space-y-4">
              <div className="text-sm"><strong>PO:</strong> {resolveDialog.poId} | <strong>GRN:</strong> {resolveDialog.grnId}</div>
              <div className="text-sm"><strong>Produit:</strong> {resolveDialog.productName}</div>
              <div className="text-sm text-muted-foreground">{resolveDialog.exceptionType}</div>
              
              <div>
                <label className="text-sm font-medium">Action de résolution</label>
                <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-background" value={resolveAction} onChange={e => setResolveAction(e.target.value as ExceptionResolution)}>
                  <option value="accepted">Accepter la variance (imputer au compte d'écart)</option>
                  <option value="credit_note">Demander un avoir au fournisseur</option>
                  <option value="po_amended">Modifier le PO (avec approbation)</option>
                  <option value="supplier_return">Retour fournisseur</option>
                  <option value="escalated">Escalader au management</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-background" rows={3} value={resolveNotes} onChange={e => setResolveNotes(e.target.value)} placeholder="Justification de la résolution…" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialog(null)}>Annuler</Button>
            <Button onClick={handleResolve}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
