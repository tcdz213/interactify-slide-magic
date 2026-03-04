import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DollarSign, Plus, Pencil, Trash2, RefreshCw, Check, X, Star, ArrowRightLeft,
  TrendingUp, TrendingDown, Minus, History, AlertTriangle,
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
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/* ─── Types ─── */
interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isBase: boolean;
  isActive: boolean;
}

interface ExchangeRate {
  id: string;
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
  rateType: "spot" | "budget" | "average";
  effectiveDate: string;
  source: "manual" | "api";
  createdBy: string;
  createdAt: string;
}

/* ─── Mock Data ─── */
const MOCK_CURRENCIES: Currency[] = [
  { id: "DZD", code: "DZD", name: "Dinar Algérien", symbol: "د.ج", decimalPlaces: 2, isBase: true, isActive: true },
  { id: "EUR", code: "EUR", name: "Euro", symbol: "€", decimalPlaces: 2, isBase: false, isActive: true },
  { id: "USD", code: "USD", name: "Dollar US", symbol: "$", decimalPlaces: 2, isBase: false, isActive: true },
  { id: "GBP", code: "GBP", name: "Livre Sterling", symbol: "£", decimalPlaces: 2, isBase: false, isActive: false },
  { id: "CNY", code: "CNY", name: "Yuan Chinois", symbol: "¥", decimalPlaces: 2, isBase: false, isActive: false },
];

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const MOCK_RATES: ExchangeRate[] = [
  { id: "r1", fromCurrencyId: "EUR", toCurrencyId: "DZD", rate: 146.50, rateType: "spot", effectiveDate: today, source: "manual", createdBy: "admin", createdAt: new Date().toISOString() },
  { id: "r2", fromCurrencyId: "USD", toCurrencyId: "DZD", rate: 134.80, rateType: "spot", effectiveDate: today, source: "manual", createdBy: "admin", createdAt: new Date().toISOString() },
  { id: "r3", fromCurrencyId: "EUR", toCurrencyId: "DZD", rate: 145.90, rateType: "spot", effectiveDate: yesterday, source: "manual", createdBy: "admin", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "r4", fromCurrencyId: "USD", toCurrencyId: "DZD", rate: 134.20, rateType: "spot", effectiveDate: yesterday, source: "manual", createdBy: "admin", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "r5", fromCurrencyId: "EUR", toCurrencyId: "DZD", rate: 148.00, rateType: "budget", effectiveDate: "2026-01-01", source: "manual", createdBy: "finance", createdAt: "2025-12-15T10:00:00Z" },
  { id: "r6", fromCurrencyId: "USD", toCurrencyId: "DZD", rate: 136.00, rateType: "budget", effectiveDate: "2026-01-01", source: "manual", createdBy: "finance", createdAt: "2025-12-15T10:00:00Z" },
];

const RATE_TYPE_LABELS: Record<string, string> = { spot: "Spot", budget: "Budget", average: "Moyenne" };

/* ─── Component ─── */
export default function CurrencyRatesPage() {
  const { t } = useTranslation();
  const [currencies, setCurrencies] = useState<Currency[]>(MOCK_CURRENCIES);
  const [rates, setRates] = useState<ExchangeRate[]>(MOCK_RATES);
  const [currencyDialog, setCurrencyDialog] = useState(false);
  const [rateDialog, setRateDialog] = useState(false);
  const [editCurrency, setEditCurrency] = useState<Currency | null>(null);
  const [editRate, setEditRate] = useState<ExchangeRate | null>(null);
  const [rateTypeFilter, setRateTypeFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");

  // Currency form state
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formSymbol, setFormSymbol] = useState("");
  const [formDecimals, setFormDecimals] = useState(2);
  const [formActive, setFormActive] = useState(true);

  // Rate form state
  const [formFromCurrency, setFormFromCurrency] = useState("");
  const [formToCurrency, setFormToCurrency] = useState("");
  const [formRate, setFormRate] = useState("");
  const [formRateType, setFormRateType] = useState<"spot" | "budget" | "average">("spot");
  const [formEffectiveDate, setFormEffectiveDate] = useState(today);

  const baseCurrency = currencies.find((c) => c.isBase);
  const activeCurrencies = currencies.filter((c) => c.isActive);

  // Get latest rates per currency pair
  const latestRates = useMemo(() => {
    const map = new Map<string, ExchangeRate>();
    const sorted = [...rates].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
    for (const r of sorted) {
      if (r.rateType !== "spot") continue;
      const key = `${r.fromCurrencyId}-${r.toCurrencyId}`;
      if (!map.has(key)) map.set(key, r);
    }
    return map;
  }, [rates]);

  // Get previous rates for trend
  const previousRates = useMemo(() => {
    const map = new Map<string, ExchangeRate>();
    const sorted = [...rates].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
    for (const r of sorted) {
      if (r.rateType !== "spot") continue;
      const key = `${r.fromCurrencyId}-${r.toCurrencyId}`;
      const latest = latestRates.get(key);
      if (latest && r.id !== latest.id && !map.has(key)) map.set(key, r);
    }
    return map;
  }, [rates, latestRates]);

  const filteredRates = useMemo(() => {
    let filtered = [...rates].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
    if (rateTypeFilter !== "all") filtered = filtered.filter((r) => r.rateType === rateTypeFilter);
    if (currencyFilter !== "all") filtered = filtered.filter((r) => r.fromCurrencyId === currencyFilter || r.toCurrencyId === currencyFilter);
    return filtered;
  }, [rates, rateTypeFilter, currencyFilter]);

  /* ─── Currency CRUD ─── */
  const openCurrencyForm = (c?: Currency) => {
    if (c) {
      setEditCurrency(c);
      setFormCode(c.code);
      setFormName(c.name);
      setFormSymbol(c.symbol);
      setFormDecimals(c.decimalPlaces);
      setFormActive(c.isActive);
    } else {
      setEditCurrency(null);
      setFormCode("");
      setFormName("");
      setFormSymbol("");
      setFormDecimals(2);
      setFormActive(true);
    }
    setCurrencyDialog(true);
  };

  const saveCurrency = () => {
    if (!formCode || !formName || !formSymbol) { toast.error("Tous les champs sont requis"); return; }
    if (editCurrency) {
      setCurrencies((prev) => prev.map((c) => c.id === editCurrency.id ? { ...c, code: formCode.toUpperCase(), name: formName, symbol: formSymbol, decimalPlaces: formDecimals, isActive: formActive } : c));
      toast.success(`Devise ${formCode.toUpperCase()} mise à jour`);
    } else {
      if (currencies.some((c) => c.code === formCode.toUpperCase())) { toast.error("Ce code devise existe déjà"); return; }
      setCurrencies((prev) => [...prev, { id: formCode.toUpperCase(), code: formCode.toUpperCase(), name: formName, symbol: formSymbol, decimalPlaces: formDecimals, isBase: false, isActive: formActive }]);
      toast.success(`Devise ${formCode.toUpperCase()} ajoutée`);
    }
    setCurrencyDialog(false);
  };

  const deleteCurrency = (id: string) => {
    const c = currencies.find((x) => x.id === id);
    if (c?.isBase) { toast.error("Impossible de supprimer la devise de base"); return; }
    if (rates.some((r) => r.fromCurrencyId === id || r.toCurrencyId === id)) { toast.error("Devise utilisée dans des taux de change"); return; }
    setCurrencies((prev) => prev.filter((x) => x.id !== id));
    toast.success("Devise supprimée");
  };

  /* ─── Rate CRUD ─── */
  const openRateForm = (r?: ExchangeRate) => {
    if (r) {
      setEditRate(r);
      setFormFromCurrency(r.fromCurrencyId);
      setFormToCurrency(r.toCurrencyId);
      setFormRate(String(r.rate));
      setFormRateType(r.rateType);
      setFormEffectiveDate(r.effectiveDate);
    } else {
      setEditRate(null);
      setFormFromCurrency(activeCurrencies.find((c) => !c.isBase)?.id ?? "");
      setFormToCurrency(baseCurrency?.id ?? "DZD");
      setFormRate("");
      setFormRateType("spot");
      setFormEffectiveDate(today);
    }
    setRateDialog(true);
  };

  const saveRate = () => {
    const rateNum = parseFloat(formRate);
    if (!formFromCurrency || !formToCurrency || isNaN(rateNum) || rateNum <= 0) { toast.error("Données invalides"); return; }
    if (formFromCurrency === formToCurrency) { toast.error("Les devises doivent être différentes"); return; }
    if (editRate) {
      setRates((prev) => prev.map((r) => r.id === editRate.id ? { ...r, fromCurrencyId: formFromCurrency, toCurrencyId: formToCurrency, rate: rateNum, rateType: formRateType, effectiveDate: formEffectiveDate } : r));
      toast.success("Taux mis à jour");
    } else {
      setRates((prev) => [...prev, { id: `r${Date.now()}`, fromCurrencyId: formFromCurrency, toCurrencyId: formToCurrency, rate: rateNum, rateType: formRateType, effectiveDate: formEffectiveDate, source: "manual", createdBy: "admin", createdAt: new Date().toISOString() }]);
      toast.success("Taux ajouté");
    }
    setRateDialog(false);
  };

  const deleteRate = (id: string) => {
    setRates((prev) => prev.filter((r) => r.id !== id));
    toast.success("Taux supprimé");
  };

  const getTrend = (fromId: string, toId: string) => {
    const key = `${fromId}-${toId}`;
    const latest = latestRates.get(key);
    const prev = previousRates.get(key);
    if (!latest || !prev) return null;
    const diff = ((latest.rate - prev.rate) / prev.rate) * 100;
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Devises & Taux de Change</h1>
          <p className="text-sm text-muted-foreground">
            Configuration multi-devises — Devise de base : <span className="font-semibold text-foreground">{baseCurrency?.code} ({baseCurrency?.symbol})</span>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devises actives</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCurrencies.length}</div>
            <p className="text-xs text-muted-foreground">sur {currencies.length} configurées</p>
          </CardContent>
        </Card>
        {activeCurrencies.filter((c) => !c.isBase).slice(0, 3).map((c) => {
          const key = `${c.id}-${baseCurrency?.id}`;
          const latest = latestRates.get(key);
          const trend = getTrend(c.id, baseCurrency?.id ?? "DZD");
          return (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">1 {c.code} → {baseCurrency?.code}</CardTitle>
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latest ? latest.rate.toFixed(2) : "—"}</div>
                {trend !== null && (
                  <p className={`text-xs flex items-center gap-1 ${trend > 0 ? "text-emerald-600" : trend < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    {trend > 0 ? "+" : ""}{trend.toFixed(2)}% vs veille
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Currencies Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Devises configurées</CardTitle>
          <Button size="sm" onClick={() => openCurrencyForm()}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Ajouter devise
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Symbole</TableHead>
                <TableHead className="text-center">Décimales</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-center">Base</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell className="text-lg">{c.symbol}</TableCell>
                  <TableCell className="text-center">{c.decimalPlaces}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {c.isBase && <Star className="h-4 w-4 text-amber-500 mx-auto fill-amber-500" />}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openCurrencyForm(c)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {!c.isBase && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCurrency(c.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Exchange Rates Table */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Historique des taux de change</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Devise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {activeCurrencies.filter((c) => !c.isBase).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rateTypeFilter} onValueChange={setRateTypeFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="spot">Spot</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="average">Moyenne</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => openRateForm()}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Nouveau taux
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>De</TableHead>
                <TableHead>Vers</TableHead>
                <TableHead className="text-right">Taux</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead>Date effective</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRates.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Aucun taux de change</TableCell></TableRow>
              ) : filteredRates.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono font-semibold">{r.fromCurrencyId}</TableCell>
                  <TableCell className="font-mono font-semibold">{r.toCurrencyId}</TableCell>
                  <TableCell className="text-right font-mono">{r.rate.toFixed(4)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={r.rateType === "spot" ? "default" : r.rateType === "budget" ? "outline" : "secondary"}>
                      {RATE_TYPE_LABELS[r.rateType]}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(r.effectiveDate), "dd MMM yyyy", { locale: fr })}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">{r.source === "manual" ? "Manuel" : "API"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openRateForm(r)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRate(r.id)}>
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

      {/* Alerts */}
      {activeCurrencies.filter((c) => !c.isBase).some((c) => !latestRates.has(`${c.id}-${baseCurrency?.id}`)) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Taux manquants</p>
              <p className="text-xs text-muted-foreground">
                Certaines devises actives n'ont pas de taux spot pour aujourd'hui. Les bons de commande utiliseront le dernier taux disponible.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Currency Dialog */}
      <Dialog open={currencyDialog} onOpenChange={setCurrencyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCurrency ? "Modifier la devise" : "Ajouter une devise"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code ISO</Label>
                <Input value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())} placeholder="EUR" maxLength={3} disabled={!!editCurrency?.isBase} />
              </div>
              <div className="space-y-2">
                <Label>Symbole</Label>
                <Input value={formSymbol} onChange={(e) => setFormSymbol(e.target.value)} placeholder="€" maxLength={5} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Euro" />
            </div>
            <div className="space-y-2">
              <Label>Décimales</Label>
              <Input type="number" min={0} max={4} value={formDecimals} onChange={(e) => setFormDecimals(Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formActive} onCheckedChange={setFormActive} disabled={editCurrency?.isBase} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCurrencyDialog(false)}>Annuler</Button>
            <Button onClick={saveCurrency}>{editCurrency ? "Enregistrer" : "Ajouter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rate Dialog */}
      <Dialog open={rateDialog} onOpenChange={setRateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRate ? "Modifier le taux" : "Nouveau taux de change"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>De (devise)</Label>
                <Select value={formFromCurrency} onValueChange={setFormFromCurrency}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {activeCurrencies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vers (devise)</Label>
                <Select value={formToCurrency} onValueChange={setFormToCurrency}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {activeCurrencies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taux</Label>
                <Input type="number" step="0.0001" min="0" value={formRate} onChange={(e) => setFormRate(e.target.value)} placeholder="146.50" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formRateType} onValueChange={(v) => setFormRateType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spot">Spot</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="average">Moyenne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date effective</Label>
              <Input type="date" value={formEffectiveDate} onChange={(e) => setFormEffectiveDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRateDialog(false)}>Annuler</Button>
            <Button onClick={saveRate}>{editRate ? "Enregistrer" : "Ajouter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
