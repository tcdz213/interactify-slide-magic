import { useMemo, useState } from "react";
import { FileText, Search, Plus, Eye, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";
import { DateFilter } from "@/components/DateFilter";
import { currency, vendors } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type ContractStatus = "Active" | "Draft" | "Expired" | "Pending_Renewal" | "Cancelled";

interface SupplierContract {
  id: string;
  vendorId: string;
  vendorName: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  paymentTerms: string;
  minOrderValue: number;
  leadTimeDays: number;
  discountPct: number;
  penaltyLatePct: number;
  autoRenew: boolean;
  notes: string;
  products: { productName: string; agreedPrice: number; minQty: number }[];
}

const initialContracts: SupplierContract[] = [
  {
    id: "CTR-001", vendorId: "V001", vendorName: "Cevital",
    startDate: "2026-01-01", endDate: "2026-12-31", status: "Active",
    paymentTerms: "Net_30", minOrderValue: 200000, leadTimeDays: 2, discountPct: 3, penaltyLatePct: 1.5, autoRenew: true,
    notes: "Contrat annuel — conditions préférentielles",
    products: [
      { productName: "Lait UHT 1L", agreedPrice: 115, minQty: 500 },
      { productName: "Yaourt Nature 170g", agreedPrice: 75, minQty: 300 },
      { productName: "Fromage Cheddar 200g", agreedPrice: 190, minQty: 100 },
    ],
  },
  {
    id: "CTR-002", vendorId: "V003", vendorName: "Benamor",
    startDate: "2026-01-15", endDate: "2026-07-15", status: "Active",
    paymentTerms: "Net_30", minOrderValue: 150000, leadTimeDays: 4, discountPct: 2, penaltyLatePct: 2, autoRenew: false,
    notes: "Contrat semestriel",
    products: [
      { productName: "Jus d'Orange 1L", agreedPrice: 130, minQty: 400 },
      { productName: "Eau Minérale 1.5L", agreedPrice: 38, minQty: 800 },
    ],
  },
  {
    id: "CTR-003", vendorId: "V002", vendorName: "Tlidjen",
    startDate: "2025-07-01", endDate: "2026-01-01", status: "Expired",
    paymentTerms: "Net_45", minOrderValue: 100000, leadTimeDays: 3, discountPct: 1.5, penaltyLatePct: 2, autoRenew: false,
    notes: "Contrat expiré — en attente de renouvellement",
    products: [
      { productName: "Beurre 500g", agreedPrice: 235, minQty: 100 },
    ],
  },
  {
    id: "CTR-004", vendorId: "V004", vendorName: "Cevita",
    startDate: "2026-03-01", endDate: "2027-02-28", status: "Draft",
    paymentTerms: "Comptant", minOrderValue: 80000, leadTimeDays: 5, discountPct: 0, penaltyLatePct: 1, autoRenew: false,
    notes: "En négociation",
    products: [
      { productName: "Thon en conserve 185g", agreedPrice: 160, minQty: 200 },
      { productName: "Tomate pelée 400g", agreedPrice: 80, minQty: 300 },
    ],
  },
];

export default function SupplierContractsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [contracts, setContracts] = useState(initialContracts);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SupplierContract | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    vendorId: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    paymentTerms: "Net_30",
    minOrderValue: 100000,
    leadTimeDays: 3,
    discountPct: 0,
    penaltyLatePct: 1,
    autoRenew: false,
    notes: "",
  });

  const filtered = contracts.filter(
    (c) =>
      c.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => ({
    total: contracts.length,
    active: contracts.filter((c) => c.status === "Active").length,
    expired: contracts.filter((c) => c.status === "Expired" || c.status === "Pending_Renewal").length,
    draft: contracts.filter((c) => c.status === "Draft").length,
  }), [contracts]);

  const createContract = () => {
    const vendor = vendors.find((v) => v.id === newForm.vendorId);
    if (!vendor) {
      toast({ title: t("supplierContracts.vendorRequired"), variant: "destructive" });
      return;
    }
    if (!newForm.endDate) {
      toast({ title: t("supplierContracts.endDateRequired"), variant: "destructive" });
      return;
    }
    const newContract: SupplierContract = {
      id: `CTR-${String(contracts.length + 1).padStart(3, "0")}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      startDate: newForm.startDate,
      endDate: newForm.endDate,
      status: "Draft",
      paymentTerms: newForm.paymentTerms,
      minOrderValue: newForm.minOrderValue,
      leadTimeDays: newForm.leadTimeDays,
      discountPct: newForm.discountPct,
      penaltyLatePct: newForm.penaltyLatePct,
      autoRenew: newForm.autoRenew,
      notes: newForm.notes,
      products: [],
    };
    setContracts((prev) => [...prev, newContract]);
    toast({ title: t("supplierContracts.contractCreated"), description: `${newContract.id} — ${vendor.name}` });
    setNewOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("supplierContracts.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("supplierContracts.subtitle")}</p>
          </div>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> {t("supplierContracts.newContract")}
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: t("supplierContracts.total"), value: stats.total, color: "" },
          { label: t("supplierContracts.active"), value: stats.active, color: "text-success" },
          { label: t("supplierContracts.expiredRenewal"), value: stats.expired, color: "text-warning" },
          { label: t("supplierContracts.drafts"), value: stats.draft, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("supplierContracts.search")}
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm"
        />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("supplierContracts.colContract")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("supplierContracts.colVendor")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("supplierContracts.colPeriod")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("supplierContracts.colTerms")}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("supplierContracts.colMinOrder")}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("supplierContracts.colDiscount")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("supplierContracts.colStatus")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("supplierContracts.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                <td className="px-4 py-3 font-medium">{c.vendorName}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.startDate} → {c.endDate}</td>
                <td className="px-4 py-3 text-xs">{c.paymentTerms.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-right text-xs">{currency(c.minOrderValue)}</td>
                <td className="px-4 py-3 text-right text-xs font-medium">{c.discountPct}%</td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => setSelected(c)}>
                      <Eye className="h-3 w-3 mr-1" /> {t("supplierContracts.view")}
                    </Button>
                    {c.status === "Draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setContracts((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: "Active" } : x)));
                          toast({ title: t("supplierContracts.contractActivated"), description: c.id });
                        }}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> {t("supplierContracts.activate")}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {selected.id} — {selected.vendorName}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                <div><span className="text-muted-foreground">{t("supplierContracts.period")}</span> {selected.startDate} → {selected.endDate}</div>
                <div><span className="text-muted-foreground">{t("supplierContracts.terms")}</span> {selected.paymentTerms.replace(/_/g, " ")}</div>
                <div><span className="text-muted-foreground">{t("supplierContracts.leadTime")}</span> {t("supplierContracts.leadTimeDays", { days: selected.leadTimeDays })}</div>
                <div><span className="text-muted-foreground">{t("supplierContracts.minOrder")}</span> {currency(selected.minOrderValue)}</div>
                <div><span className="text-muted-foreground">{t("supplierContracts.discount")}</span> {selected.discountPct}%</div>
                <div><span className="text-muted-foreground">{t("supplierContracts.latePenalty")}</span> {selected.penaltyLatePct}%</div>
                <div><span className="text-muted-foreground">{t("supplierContracts.autoRenew")}</span> {selected.autoRenew ? t("supplierContracts.yes") : t("supplierContracts.no")}</div>
                {selected.notes && <div className="col-span-2 text-muted-foreground italic">{selected.notes}</div>}
              </div>
              {selected.products.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">{t("supplierContracts.contractedProducts")}</h4>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 text-muted-foreground">{t("supplierContracts.colProduct")}</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">{t("supplierContracts.colAgreedPrice")}</th>
                        <th className="text-right py-2 px-2 text-muted-foreground">{t("supplierContracts.colMinQty")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.products.map((p, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 px-2 font-medium">{p.productName}</td>
                          <td className="py-2 px-2 text-right">{currency(p.agreedPrice)}</td>
                          <td className="py-2 px-2 text-right">{p.minQty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New contract dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("supplierContracts.newContractTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>{t("supplierContracts.vendor")}</Label>
              <Select value={newForm.vendorId} onValueChange={(v) => setNewForm((p) => ({ ...p, vendorId: v }))}>
                <SelectTrigger><SelectValue placeholder={t("supplierContracts.selectVendor")} /></SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("supplierContracts.startDate")}</Label>
                <DateFilter value={newForm.startDate} onChange={(v) => setNewForm((p) => ({ ...p, startDate: v }))} placeholder={t("supplierContracts.startDate")} />
              </div>
              <div className="space-y-2">
                <Label>{t("supplierContracts.endDate")}</Label>
                <DateFilter value={newForm.endDate} onChange={(v) => setNewForm((p) => ({ ...p, endDate: v }))} placeholder={t("supplierContracts.endDate")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("supplierContracts.minOrderDZD")}</Label>
                <Input type="number" min={0} value={newForm.minOrderValue} onChange={(e) => setNewForm((p) => ({ ...p, minOrderValue: Number(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>{t("supplierContracts.discountPct")}</Label>
                <Input type="number" min={0} max={50} step={0.5} value={newForm.discountPct} onChange={(e) => setNewForm((p) => ({ ...p, discountPct: Number(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("supplierContracts.notes")}</Label>
              <Input value={newForm.notes} onChange={(e) => setNewForm((p) => ({ ...p, notes: e.target.value }))} placeholder={t("supplierContracts.notesPlaceholder")} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewOpen(false)}>{t("supplierContracts.cancel")}</Button>
              <Button onClick={createContract}>{t("supplierContracts.createContract")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
