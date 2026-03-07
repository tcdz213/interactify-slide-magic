import { useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Landmark, Upload, CheckCircle, Link2, AlertTriangle, Download, Search } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface BankStatementLine {
  id: string;
  date: string;
  reference: string;
  description: string;
  amount: number;
  balance: number;
  matched: boolean;
  matchedPaymentId?: string;
}

// Mock bank statement data
const MOCK_STATEMENT: BankStatementLine[] = [
  { id: "BSL-001", date: "2026-02-24", reference: "VIR-8842", description: "PAIEMENT BOULANGERIE EL BARAKA", amount: -861560, balance: 45000000, matched: false },
  { id: "BSL-002", date: "2026-02-23", reference: "VIR-8841", description: "COSIDER TP VIREMENT", amount: 10000000, balance: 45861560, matched: false },
  { id: "BSL-003", date: "2026-02-22", reference: "CHQ-1102", description: "UNIV CONSTANTINE 3 CHEQUE", amount: 1500000, balance: 35861560, matched: false },
  { id: "BSL-004", date: "2026-02-20", reference: "VIR-8839", description: "BATI-PLUS MATERIAUX", amount: 1000000, balance: 34361560, matched: false },
  { id: "BSL-005", date: "2026-02-18", reference: "FRAIS-BQ", description: "FRAIS BANCAIRES MENSUELS", amount: -25000, balance: 33361560, matched: false },
];

export default function BankReconciliationPage() {
  const { t } = useTranslation();
  const { payments } = useWMSData();
  const [statementLines, setStatementLines] = useState<BankStatementLine[]>(MOCK_STATEMENT);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const autoMatch = () => {
    let matched = 0;
    setStatementLines(prev => prev.map(line => {
      if (line.matched) return line;
      const matchPayment = payments.find(p =>
        Math.abs(p.amount - Math.abs(line.amount)) < 100 &&
        !prev.some(sl => sl.matchedPaymentId === p.id)
      );
      if (matchPayment) {
        matched++;
        return { ...line, matched: true, matchedPaymentId: matchPayment.id };
      }
      return line;
    }));
    toast({ title: t("accounting.bankReconciliation.linesMatched", { count: matched }) });
  };

  const manualMatch = (lineId: string, paymentId: string) => {
    setStatementLines(prev => prev.map(l => l.id === lineId ? { ...l, matched: true, matchedPaymentId: paymentId } : l));
    toast({ title: t("accounting.bankReconciliation.manualMatched") });
  };

  const unmatch = (lineId: string) => {
    setStatementLines(prev => prev.map(l => l.id === lineId ? { ...l, matched: false, matchedPaymentId: undefined } : l));
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").slice(1).filter(l => l.trim());
      const parsed: BankStatementLine[] = lines.map((line, i) => {
        const cols = line.split(",");
        return {
          id: `BSL-IMP-${String(i + 1).padStart(3, "0")}`,
          date: cols[0]?.trim() || "",
          reference: cols[1]?.trim() || "",
          description: cols[2]?.trim() || "",
          amount: parseFloat(cols[3]?.trim() || "0"),
          balance: parseFloat(cols[4]?.trim() || "0"),
          matched: false,
        };
      });
      if (parsed.length > 0) {
        setStatementLines(prev => [...prev, ...parsed]);
        toast({ title: t("accounting.bankReconciliation.linesImported", { count: parsed.length }) });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const matchedCount = statementLines.filter(l => l.matched).length;
  const unmatchedCount = statementLines.filter(l => !l.matched).length;
  const totalDebit = statementLines.filter(l => l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0);
  const totalCredit = statementLines.filter(l => l.amount > 0).reduce((s, l) => s + l.amount, 0);

  const filtered = statementLines.filter(l => {
    if (search && !l.description.toLowerCase().includes(search.toLowerCase()) && !l.reference.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Landmark className="h-6 w-6 text-primary" /> {t("accounting.bankReconciliation.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("accounting.bankReconciliation.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> {t("accounting.bankReconciliation.importCSV")}</Button>
          <Button onClick={autoMatch}><Link2 className="h-4 w-4 mr-2" /> {t("accounting.bankReconciliation.autoMatch")}</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">{t("accounting.bankReconciliation.matchedLines")}</div><div className="text-2xl font-bold text-emerald-600">{matchedCount}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">{t("accounting.bankReconciliation.unmatchedLines")}</div><div className="text-2xl font-bold text-amber-600">{unmatchedCount}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">{t("accounting.bankReconciliation.totalCredit")}</div><div className="text-2xl font-bold">{currency(totalCredit)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">{t("accounting.bankReconciliation.totalDebit")}</div><div className="text-2xl font-bold text-red-600">{currency(totalDebit)}</div></CardContent></Card>
      </div>

      <div className="relative w-64"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><input className="pl-8 pr-3 py-2 border rounded-md text-sm bg-background w-full" placeholder={t("common.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} /></div>

      {/* Statement table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-3 py-2 text-left font-medium">{t("accounting.bankReconciliation.date")}</th>
              <th className="px-3 py-2 text-left font-medium">{t("accounting.bankReconciliation.reference")}</th>
              <th className="px-3 py-2 text-left font-medium">{t("accounting.bankReconciliation.description")}</th>
              <th className="px-3 py-2 text-right font-medium">{t("accounting.bankReconciliation.amount")}</th>
              <th className="px-3 py-2 text-right font-medium">{t("accounting.bankReconciliation.balance")}</th>
              <th className="px-3 py-2 text-center font-medium">{t("accounting.bankReconciliation.status")}</th>
              <th className="px-3 py-2 text-center font-medium">{t("accounting.bankReconciliation.action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(line => (
              <tr key={line.id} className={`hover:bg-muted/30 ${line.matched ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""}`}>
                <td className="px-3 py-2 text-xs">{line.date}</td>
                <td className="px-3 py-2 font-mono text-xs">{line.reference}</td>
                <td className="px-3 py-2">{line.description}</td>
                <td className={`px-3 py-2 text-right font-mono ${line.amount < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {line.amount < 0 ? `-${currency(Math.abs(line.amount))}` : `+${currency(line.amount)}`}
                </td>
                <td className="px-3 py-2 text-right font-mono text-muted-foreground">{currency(line.balance)}</td>
                <td className="px-3 py-2 text-center">
                  {line.matched ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="h-3 w-3" /> {t("accounting.bankReconciliation.matched")}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600"><AlertTriangle className="h-3 w-3" /> {t("accounting.bankReconciliation.pending")}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {line.matched ? (
                    <Button size="sm" variant="ghost" onClick={() => unmatch(line.id)} className="text-xs">{t("accounting.bankReconciliation.unlink")}</Button>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                      const p = payments.find(pm => !statementLines.some(sl => sl.matchedPaymentId === pm.id));
                      if (p) manualMatch(line.id, p.id);
                      else toast({ title: t("accounting.bankReconciliation.noPaymentAvailable"), variant: "destructive" });
                    }}>
                      {t("accounting.bankReconciliation.match")}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CSV format hint */}
      <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground">
        <strong>{t("accounting.bankReconciliation.csvFormat")}</strong> Date, {t("accounting.bankReconciliation.reference")}, {t("accounting.bankReconciliation.description")}, {t("accounting.bankReconciliation.amount")}, {t("accounting.bankReconciliation.balance")}<br />
        {t("accounting.bankReconciliation.csvExample")} <code>2026-03-01,VIR-9001,PAIEMENT FOURNISSEUR X,-500000,44500000</code>
      </div>
    </div>
  );
}
