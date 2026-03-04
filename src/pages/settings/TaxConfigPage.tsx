import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Receipt, Plus, Pencil, Trash2, ArrowRightLeft, ShieldCheck, AlertTriangle, Percent, MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

/* ─── Types ─── */
interface TaxCode {
  id: string;
  code: string;
  name: string;
  rate: number;
  type: "purchase" | "sale" | "both";
  isActive: boolean;
  isDefault: boolean;
  description: string;
}

interface FiscalPosition {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  autoApply: boolean;
  country: string;
  taxMappings: TaxMapping[];
}

interface TaxMapping {
  id: string;
  sourceTaxId: string;
  destinationTaxId: string;
}

/* ─── Mock Data (Algerian tax context) ─── */
const MOCK_TAXES: TaxCode[] = [
  { id: "tva19", code: "TVA19", name: "TVA 19%", rate: 19, type: "both", isActive: true, isDefault: true, description: "Taux normal de TVA" },
  { id: "tva9", code: "TVA9", name: "TVA 9%", rate: 9, type: "both", isActive: true, isDefault: false, description: "Taux réduit de TVA (produits de large consommation)" },
  { id: "tva0", code: "TVA0", name: "TVA 0% (Exonéré)", rate: 0, type: "both", isActive: true, isDefault: false, description: "Exonération de TVA" },
  { id: "tap2", code: "TAP", name: "TAP 2%", rate: 2, type: "sale", isActive: true, isDefault: false, description: "Taxe sur l'activité professionnelle" },
  { id: "irs", code: "IRS", name: "IRG/IBS Retenue 5%", rate: 5, type: "purchase", isActive: true, isDefault: false, description: "Retenue à la source sur achats" },
  { id: "dd5", code: "DD5", name: "Droits de douane 5%", rate: 5, type: "purchase", isActive: true, isDefault: false, description: "Droits de douane à l'importation" },
  { id: "dd15", code: "DD15", name: "Droits de douane 15%", rate: 15, type: "purchase", isActive: true, isDefault: false, description: "Droits de douane majorés" },
  { id: "dd30", code: "DD30", name: "Droits de douane 30%", rate: 30, type: "purchase", isActive: false, isDefault: false, description: "Droits de douane protectionnistes" },
];

const MOCK_FISCAL_POSITIONS: FiscalPosition[] = [
  {
    id: "fp1", name: "Régime national standard", description: "Fournisseurs nationaux soumis à la TVA standard", isActive: true, autoApply: false, country: "DZ",
    taxMappings: [],
  },
  {
    id: "fp2", name: "Importation UE", description: "Fournisseurs européens — TVA auto-liquidée + droits de douane", isActive: true, autoApply: true, country: "EU",
    taxMappings: [
      { id: "m1", sourceTaxId: "tva19", destinationTaxId: "tva0" },
    ],
  },
  {
    id: "fp3", name: "Importation hors UE", description: "Fournisseurs hors UE — TVA auto-liquidée + droits de douane majorés", isActive: true, autoApply: true, country: "NON-EU",
    taxMappings: [
      { id: "m2", sourceTaxId: "tva19", destinationTaxId: "tva0" },
    ],
  },
  {
    id: "fp4", name: "Zone franche", description: "Opérations en zone franche — Exonération totale", isActive: true, autoApply: false, country: "DZ",
    taxMappings: [
      { id: "m3", sourceTaxId: "tva19", destinationTaxId: "tva0" },
      { id: "m4", sourceTaxId: "tva9", destinationTaxId: "tva0" },
    ],
  },
];

const TAX_TYPE_LABELS: Record<string, string> = { purchase: "Achat", sale: "Vente", both: "Achat & Vente" };
const COUNTRY_OPTIONS = [
  { value: "DZ", label: "Algérie" },
  { value: "EU", label: "Union Européenne" },
  { value: "NON-EU", label: "Hors UE" },
  { value: "MA", label: "Maroc" },
  { value: "TN", label: "Tunisie" },
];

/* ─── Component ─── */
export default function TaxConfigPage() {
  const { t } = useTranslation();
  const [taxes, setTaxes] = useState<TaxCode[]>(MOCK_TAXES);
  const [fiscalPositions, setFiscalPositions] = useState<FiscalPosition[]>(MOCK_FISCAL_POSITIONS);
  const [taxDialog, setTaxDialog] = useState(false);
  const [fpDialog, setFpDialog] = useState(false);
  const [editTax, setEditTax] = useState<TaxCode | null>(null);
  const [editFp, setEditFp] = useState<FiscalPosition | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Tax form
  const [fCode, setFCode] = useState("");
  const [fName, setFName] = useState("");
  const [fRate, setFRate] = useState("");
  const [fType, setFType] = useState<"purchase" | "sale" | "both">("both");
  const [fActive, setFActive] = useState(true);
  const [fDefault, setFDefault] = useState(false);
  const [fDesc, setFDesc] = useState("");

  // FP form
  const [fpName, setFpName] = useState("");
  const [fpDesc, setFpDesc] = useState("");
  const [fpCountry, setFpCountry] = useState("DZ");
  const [fpActive, setFpActive] = useState(true);
  const [fpAutoApply, setFpAutoApply] = useState(false);
  const [fpMappings, setFpMappings] = useState<TaxMapping[]>([]);

  const activeTaxes = taxes.filter((t) => t.isActive);
  const filteredTaxes = useMemo(() => {
    if (typeFilter === "all") return taxes;
    return taxes.filter((t) => t.type === typeFilter);
  }, [taxes, typeFilter]);

  /* ─── Tax CRUD ─── */
  const openTaxForm = (tax?: TaxCode) => {
    if (tax) {
      setEditTax(tax); setFCode(tax.code); setFName(tax.name); setFRate(String(tax.rate));
      setFType(tax.type); setFActive(tax.isActive); setFDefault(tax.isDefault); setFDesc(tax.description);
    } else {
      setEditTax(null); setFCode(""); setFName(""); setFRate(""); setFType("both");
      setFActive(true); setFDefault(false); setFDesc("");
    }
    setTaxDialog(true);
  };

  const saveTax = () => {
    const rate = parseFloat(fRate);
    if (!fCode || !fName || isNaN(rate) || rate < 0) { toast.error("Données invalides"); return; }
    if (editTax) {
      setTaxes((prev) => prev.map((t) => t.id === editTax.id ? { ...t, code: fCode, name: fName, rate, type: fType, isActive: fActive, isDefault: fDefault, description: fDesc } : (fDefault ? { ...t, isDefault: false } : t)));
      toast.success(`Taxe ${fCode} mise à jour`);
    } else {
      if (taxes.some((t) => t.code === fCode)) { toast.error("Ce code taxe existe déjà"); return; }
      const newTax: TaxCode = { id: `tax_${Date.now()}`, code: fCode, name: fName, rate, type: fType, isActive: fActive, isDefault: fDefault, description: fDesc };
      setTaxes((prev) => fDefault ? [...prev.map((t) => ({ ...t, isDefault: false })), newTax] : [...prev, newTax]);
      toast.success(`Taxe ${fCode} ajoutée`);
    }
    setTaxDialog(false);
  };

  const deleteTax = (id: string) => {
    const used = fiscalPositions.some((fp) => fp.taxMappings.some((m) => m.sourceTaxId === id || m.destinationTaxId === id));
    if (used) { toast.error("Taxe utilisée dans une position fiscale"); return; }
    setTaxes((prev) => prev.filter((t) => t.id !== id));
    toast.success("Taxe supprimée");
  };

  /* ─── FP CRUD ─── */
  const openFpForm = (fp?: FiscalPosition) => {
    if (fp) {
      setEditFp(fp); setFpName(fp.name); setFpDesc(fp.description); setFpCountry(fp.country);
      setFpActive(fp.isActive); setFpAutoApply(fp.autoApply); setFpMappings([...fp.taxMappings]);
    } else {
      setEditFp(null); setFpName(""); setFpDesc(""); setFpCountry("DZ");
      setFpActive(true); setFpAutoApply(false); setFpMappings([]);
    }
    setFpDialog(true);
  };

  const addMapping = () => {
    setFpMappings((prev) => [...prev, { id: `m_${Date.now()}`, sourceTaxId: activeTaxes[0]?.id ?? "", destinationTaxId: activeTaxes[0]?.id ?? "" }]);
  };

  const updateMapping = (idx: number, field: "sourceTaxId" | "destinationTaxId", value: string) => {
    setFpMappings((prev) => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const removeMapping = (idx: number) => {
    setFpMappings((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveFp = () => {
    if (!fpName) { toast.error("Le nom est requis"); return; }
    if (editFp) {
      setFiscalPositions((prev) => prev.map((fp) => fp.id === editFp.id ? { ...fp, name: fpName, description: fpDesc, country: fpCountry, isActive: fpActive, autoApply: fpAutoApply, taxMappings: fpMappings } : fp));
      toast.success(`Position fiscale mise à jour`);
    } else {
      setFiscalPositions((prev) => [...prev, { id: `fp_${Date.now()}`, name: fpName, description: fpDesc, country: fpCountry, isActive: fpActive, autoApply: fpAutoApply, taxMappings: fpMappings }]);
      toast.success(`Position fiscale ajoutée`);
    }
    setFpDialog(false);
  };

  const deleteFp = (id: string) => {
    setFiscalPositions((prev) => prev.filter((fp) => fp.id !== id));
    toast.success("Position fiscale supprimée");
  };

  const getTaxLabel = (id: string) => {
    const tax = taxes.find((t) => t.id === id);
    return tax ? `${tax.code} (${tax.rate}%)` : id;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuration Fiscale</h1>
        <p className="text-sm text-muted-foreground">Codes TVA, taxes à l'achat/vente et positions fiscales</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxes actives</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{activeTaxes.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positions fiscales</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{fiscalPositions.filter((fp) => fp.isActive).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TVA par défaut</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxes.find((t) => t.isDefault)?.rate ?? 0}%</div>
            <p className="text-xs text-muted-foreground">{taxes.find((t) => t.isDefault)?.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mappings actifs</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{fiscalPositions.reduce((sum, fp) => sum + fp.taxMappings.length, 0)}</div></CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="taxes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="taxes">Codes Taxes / TVA</TabsTrigger>
          <TabsTrigger value="fiscal">Positions Fiscales</TabsTrigger>
        </TabsList>

        {/* Tax Codes Tab */}
        <TabsContent value="taxes">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Codes Taxes</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="purchase">Achat</SelectItem>
                    <SelectItem value="sale">Vente</SelectItem>
                    <SelectItem value="both">Achat & Vente</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => openTaxForm()}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Ajouter taxe
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-right">Taux</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTaxes.map((tax) => (
                    <TableRow key={tax.id}>
                      <TableCell className="font-mono font-semibold">
                        {tax.code}
                        {tax.isDefault && <Badge variant="outline" className="ml-2 text-[10px]">Défaut</Badge>}
                      </TableCell>
                      <TableCell>{tax.name}</TableCell>
                      <TableCell className="text-right font-mono">{tax.rate}%</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-[10px]">{TAX_TYPE_LABELS[tax.type]}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={tax.isActive ? "default" : "secondary"}>{tax.isActive ? "Actif" : "Inactif"}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{tax.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openTaxForm(tax)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTax(tax.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fiscal Positions Tab */}
        <TabsContent value="fiscal">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Positions Fiscales</CardTitle>
              <Button size="sm" onClick={() => openFpForm()}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Ajouter position
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fiscalPositions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune position fiscale configurée</p>
              ) : fiscalPositions.map((fp) => (
                <Card key={fp.id} className="border">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm">{fp.name}</CardTitle>
                        <Badge variant={fp.isActive ? "default" : "secondary"} className="text-[10px]">{fp.isActive ? "Actif" : "Inactif"}</Badge>
                        {fp.autoApply && <Badge variant="outline" className="text-[10px]">Auto</Badge>}
                        <Badge variant="secondary" className="text-[10px]">{COUNTRY_OPTIONS.find((c) => c.value === fp.country)?.label ?? fp.country}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{fp.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openFpForm(fp)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteFp(fp.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  {fp.taxMappings.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Taxe source</TableHead>
                              <TableHead className="text-xs text-center">→</TableHead>
                              <TableHead className="text-xs">Taxe destination</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fp.taxMappings.map((m) => (
                              <TableRow key={m.id}>
                                <TableCell className="text-xs font-mono">{getTaxLabel(m.sourceTaxId)}</TableCell>
                                <TableCell className="text-center"><ArrowRightLeft className="h-3 w-3 text-muted-foreground mx-auto" /></TableCell>
                                <TableCell className="text-xs font-mono">{getTaxLabel(m.destinationTaxId)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tax Dialog */}
      <Dialog open={taxDialog} onOpenChange={setTaxDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTax ? "Modifier la taxe" : "Ajouter une taxe"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={fCode} onChange={(e) => setFCode(e.target.value.toUpperCase())} placeholder="TVA19" />
              </div>
              <div className="space-y-2">
                <Label>Taux (%)</Label>
                <Input type="number" min="0" max="100" step="0.01" value={fRate} onChange={(e) => setFRate(e.target.value)} placeholder="19" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="TVA 19%" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={fType} onValueChange={(v) => setFType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Achat uniquement</SelectItem>
                  <SelectItem value="sale">Vente uniquement</SelectItem>
                  <SelectItem value="both">Achat & Vente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Description…" />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={fActive} onCheckedChange={setFActive} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={fDefault} onCheckedChange={setFDefault} />
                <Label>Par défaut</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaxDialog(false)}>Annuler</Button>
            <Button onClick={saveTax}>{editTax ? "Enregistrer" : "Ajouter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fiscal Position Dialog */}
      <Dialog open={fpDialog} onOpenChange={setFpDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editFp ? "Modifier la position fiscale" : "Ajouter une position fiscale"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={fpName} onChange={(e) => setFpName(e.target.value)} placeholder="Régime national standard" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={fpDesc} onChange={(e) => setFpDesc(e.target.value)} placeholder="Description…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pays / Région</Label>
                <Select value={fpCountry} onValueChange={setFpCountry}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2">
                  <Switch checked={fpActive} onCheckedChange={setFpActive} />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={fpAutoApply} onCheckedChange={setFpAutoApply} />
                  <Label>Auto-appliquer</Label>
                </div>
              </div>
            </div>

            {/* Tax Mappings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Correspondances de taxes</Label>
                <Button variant="outline" size="sm" onClick={addMapping}>
                  <Plus className="mr-1 h-3 w-3" /> Mapping
                </Button>
              </div>
              {fpMappings.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3 border rounded-md">Aucune correspondance — les taxes source seront appliquées telles quelles</p>
              ) : (
                <div className="space-y-2">
                  {fpMappings.map((m, idx) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <Select value={m.sourceTaxId} onValueChange={(v) => updateMapping(idx, "sourceTaxId", v)}>
                        <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {activeTaxes.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.code} ({t.rate}%)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <Select value={m.destinationTaxId} onValueChange={(v) => updateMapping(idx, "destinationTaxId", v)}>
                        <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {activeTaxes.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.code} ({t.rate}%)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => removeMapping(idx)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFpDialog(false)}>Annuler</Button>
            <Button onClick={saveFp}>{editFp ? "Enregistrer" : "Ajouter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
