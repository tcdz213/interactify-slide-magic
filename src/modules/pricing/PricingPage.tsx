import { useState, useMemo, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Pencil, History, TrendingUp, Package, ArrowLeft, X, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { currency } from "@/data/masterData";
import { useWMSData } from "@/contexts/WMSDataContext";
import { usePricingStore } from "@/store/pricing.store";
import { useAuth } from "@/contexts/AuthContext";
import { RBACGuard } from "@/components/RBACGuard";
import { MarginBadge } from "./MarginBadge";
import { PriceForm } from "./PriceForm";
import { PriceHistoryDrawer } from "./PriceHistoryDrawer";
import { BulkUpdateDialog } from "./BulkUpdateDialog";
import { calcMargin } from "./pricing.types";
import type { ProductPrice } from "./pricing.types";

const APPROVAL_BADGE_KEYS: Record<string, { labelKey: string; className: string }> = {
  draft: { labelKey: "pricing.priceForm.draft", className: "bg-muted text-muted-foreground border-border" },
  pending: { labelKey: "pricing.priceForm.pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  approved: { labelKey: "pricing.priceForm.approved", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

const PAGE_SIZE = 20;

export default function PricingPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterProductId = searchParams.get("productId");

  const { products } = useWMSData();
  const { clientTypes, productPrices, upsertPrice, bulkUpdatePrices, getPriceHistory } = usePricingStore();
  const { currentUser } = useAuth();
  const canViewFinancials = currentUser ? ["CEO", "FinanceDirector", "OpsDirector", "Accountant"].includes(currentUser.role) : false;

  const activeClientTypes = useMemo(() => clientTypes.filter((ct) => ct.status === "active"), [clientTypes]);
  const [selectedClientType, setSelectedClientType] = useState<string>(activeClientTypes[0]?.id ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingPrice, setEditingPrice] = useState<{ price: ProductPrice | null; product: typeof products[0] } | null>(null);
  const [historyDrawer, setHistoryDrawer] = useState<{ priceId: string; productName: string } | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Phase 7: new filters
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [marginFilter, setMarginFilter] = useState("all");
  const [page, setPage] = useState(0);

  const filteredProduct = useMemo(
    () => filterProductId ? products.find((p) => p.id === filterProductId) : null,
    [filterProductId, products]
  );

  const clearFilter = useCallback(() => {
    searchParams.delete("productId");
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  // Build rows with filters
  const allRows = useMemo(() => {
    const base = filterProductId
      ? products.filter((p) => p.id === filterProductId)
      : products;
    return base.map((p) => {
      const price = productPrices.find(
        (pp) => pp.productId === p.id && pp.clientTypeId === selectedClientType
      );
      return { product: p, price };
    });
  }, [products, selectedClientType, productPrices, filterProductId]);

  // Apply search + approval + margin filters
  const filteredRows = useMemo(() => {
    let rows = allRows;

    // Search by name or SKU
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(r => r.product.name.toLowerCase().includes(q) || r.product.sku.toLowerCase().includes(q));
    }

    // Approval status filter
    if (approvalFilter !== "all") {
      rows = rows.filter(r => {
        if (!r.price) return approvalFilter === "none";
        return r.price.approvalStatus === approvalFilter;
      });
    }

    // Margin filter
    if (marginFilter !== "all" && canViewFinancials) {
      rows = rows.filter(r => {
        if (!r.price) return false;
        const margin = calcMargin(r.price.unitPrice, r.product.unitCost);
        switch (marginFilter) {
          case "negative": return margin < 0;
          case "low": return margin >= 0 && margin < 10;
          case "medium": return margin >= 10 && margin <= 20;
          case "high": return margin > 20;
          default: return true;
        }
      });
    }

    return rows;
  }, [allRows, searchQuery, approvalFilter, marginFilter, canViewFinancials]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  const paginatedRows = useMemo(() => filteredRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filteredRows, page]);

  // Reset page when filters change
  useMemo(() => { setPage(0); }, [searchQuery, approvalFilter, marginFilter, selectedClientType]);

  const toggleSelect = useCallback((priceId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(priceId)) next.delete(priceId); else next.add(priceId);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    const allPriceIds = paginatedRows.filter((r) => r.price).map((r) => r.price!.id);
    setSelected((prev) => (prev.size === allPriceIds.length ? new Set() : new Set(allPriceIds)));
  }, [paginatedRows]);

  const handleSavePrice = useCallback((values: { unitPrice: number; minQty?: number; approvalStatus: "draft" | "pending" | "approved" }) => {
    if (!editingPrice) return;
    upsertPrice(
      {
        productId: editingPrice.product.id,
        clientTypeId: selectedClientType,
        unitPrice: values.unitPrice,
        minQty: values.minQty,
        approvalStatus: values.approvalStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.name ?? "system",
      },
      currentUser?.name ?? "system"
    );
    toast({ title: t("pricing.pricingPage.priceSaved"), description: t("pricing.pricingPage.priceSavedDesc", { name: editingPrice.product.name }) });
    setEditingPrice(null);
  }, [editingPrice, selectedClientType, upsertPrice, currentUser]);

  const handleBulkApply = useCallback((pctChange: number) => {
    bulkUpdatePrices(Array.from(selected), pctChange, currentUser?.name ?? "system");
    toast({ title: t("pricing.pricingPage.bulkUpdated"), description: t("pricing.pricingPage.bulkUpdatedDesc", { count: selected.size, pct: `${pctChange > 0 ? "+" : ""}${pctChange}` }) });
    setSelected(new Set());
  }, [selected, bulkUpdatePrices, currentUser]);

  // KPIs
  const kpis = useMemo(() => {
    const ctPrices = productPrices.filter((p) => p.clientTypeId === selectedClientType);
    const withProducts = ctPrices.map((pp) => {
      const prod = products.find((p) => p.id === pp.productId);
      return { pp, cost: prod?.unitCost ?? 0 };
    });
    const avgMargin = withProducts.length
      ? withProducts.reduce((sum, { pp, cost }) => sum + calcMargin(pp.unitPrice, cost), 0) / withProducts.length
      : 0;
    const negativeCount = withProducts.filter(({ pp, cost }) => calcMargin(pp.unitPrice, cost) < 0).length;
    return { totalPrices: ctPrices.length, avgMargin, negativeCount };
  }, [productPrices, selectedClientType, products]);

  // Bulk preview data
  const bulkPreviewData = useMemo(() => {
    if (selected.size === 0) return [];
    return Array.from(selected).map(priceId => {
      const pp = productPrices.find(p => p.id === priceId);
      if (!pp) return null;
      const prod = products.find(p => p.id === pp.productId);
      return { name: prod?.name ?? "?", sku: prod?.sku ?? "", currentPrice: pp.unitPrice, cost: prod?.unitCost ?? 0 };
    }).filter(Boolean) as { name: string; sku: string; currentPrice: number; cost: number }[];
  }, [selected, productPrices, products]);

  return (
    <div className="space-y-6">
      {/* Product filter banner */}
      {filteredProduct && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <ArrowLeft className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Filtré par produit : <span className="text-primary">{filteredProduct.name}</span>
              <span className="text-muted-foreground ml-2 font-mono text-xs">{filteredProduct.sku}</span>
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilter} className="gap-1 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" /> Voir tous
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-1">
            <Link to="/wms/products">
              <Package className="h-3.5 w-3.5" /> Retour catalogue
            </Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("pricing.pricingPage.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("pricing.pricingPage.subtitle", { count: filteredRows.length })}</p>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              <TrendingUp className="mr-2 h-4 w-4" /> Mise à jour en masse ({selected.size})
            </Button>
          )}
          <Select value={selectedClientType} onValueChange={setSelectedClientType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Type client" />
            </SelectTrigger>
            <SelectContent>
              {activeClientTypes.map((ct) => (
                <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{t("pricing.pricingPage.configuredPrices")}</p>
            <p className="text-2xl font-bold text-foreground">{kpis.totalPrices}</p>
          </CardContent>
        </Card>
        <RBACGuard permission="view_financials">
          <Card>
            <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{t("pricing.pricingPage.avgMargin")}</p>
            <p className="text-2xl font-bold text-foreground">{kpis.avgMargin.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </RBACGuard>
        <RBACGuard permission="view_financials">
          <Card>
            <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{t("pricing.pricingPage.negativeMargins")}</p>
            <p className="text-2xl font-bold text-destructive">{kpis.negativeCount}</p>
            </CardContent>
          </Card>
        </RBACGuard>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("pricing.pricingPage.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={approvalFilter} onValueChange={setApprovalFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Statut approbation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("pricing.pricingPage.allStatuses")}</SelectItem>
            <SelectItem value="draft">{t("pricing.priceForm.draft")}</SelectItem>
            <SelectItem value="pending">{t("pricing.priceForm.pending")}</SelectItem>
            <SelectItem value="approved">{t("pricing.priceForm.approved")}</SelectItem>
            <SelectItem value="none">{t("pricing.pricingPage.notConfigured")}</SelectItem>
          </SelectContent>
        </Select>
        {canViewFinancials && (
          <Select value={marginFilter} onValueChange={setMarginFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filtre marge" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">{t("pricing.pricingPage.allMargins")}</SelectItem>
            <SelectItem value="negative">{t("pricing.pricingPage.negativeMargin")}</SelectItem>
            <SelectItem value="low">{t("pricing.pricingPage.lowMargin")}</SelectItem>
            <SelectItem value="medium">{t("pricing.pricingPage.mediumMargin")}</SelectItem>
            <SelectItem value="high">{t("pricing.pricingPage.highMargin")}</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Price Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Grille tarifaire — {activeClientTypes.find((ct) => ct.id === selectedClientType)?.name ?? ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.size > 0 && selected.size === paginatedRows.filter((r) => r.price).length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>SKU</TableHead>
                {canViewFinancials && <TableHead>Coût</TableHead>}
                <TableHead>Prix unitaire</TableHead>
                {canViewFinancials && <TableHead>Marge</TableHead>}
                <TableHead>Qté min</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">{t("pricing.pricingPage.noProducts")}</TableCell></TableRow>
              )}
              {paginatedRows.map(({ product, price }) => {
                const badge = price ? APPROVAL_BADGE_KEYS[price.approvalStatus] : null;
                return (
                   <TableRow key={product.id} className={cn(
                     selected.has(price?.id ?? "") ? "bg-primary/5" : "",
                     filterProductId === product.id ? "ring-2 ring-primary/30 bg-primary/5" : ""
                   )}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(price?.id ?? "")}
                        onCheckedChange={() => price && toggleSelect(price.id)}
                        disabled={!price}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/wms/products`} className="hover:text-primary hover:underline transition-colors">
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                    {canViewFinancials && (
                      <TableCell className="text-muted-foreground">{currency(product.unitCost)}</TableCell>
                    )}
                    <TableCell className="font-semibold">
                      {price ? currency(price.unitPrice) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    {canViewFinancials && (
                      <TableCell>
                        {price ? <MarginBadge unitPrice={price.unitPrice} cost={product.unitCost} /> : "—"}
                      </TableCell>
                    )}
                    <TableCell>{price?.minQty ?? "—"}</TableCell>
                    <TableCell>
                      {badge && (
                        <Badge variant="outline" className={badge.className}>{t(badge.labelKey)}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="xs" variant="ghost" onClick={() => setEditingPrice({ price: price ?? null, product })}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {price && (
                        <Button size="xs" variant="ghost" onClick={() => setHistoryDrawer({ priceId: price.id, productName: product.name })}>
                          <History className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} / {totalPages} — {filteredRows.length} résultat(s)
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  Précédent
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {editingPrice && (
        <PriceForm
          open
          onOpenChange={() => setEditingPrice(null)}
          price={editingPrice.price}
          productName={editingPrice.product.name}
          cost={editingPrice.product.unitCost}
          onSave={handleSavePrice}
          key={editingPrice.product.id}
        />
      )}

      {historyDrawer && (
        <PriceHistoryDrawer
          open
          onOpenChange={() => setHistoryDrawer(null)}
          productName={historyDrawer.productName}
          history={getPriceHistory(historyDrawer.priceId)}
        />
      )}

      <BulkUpdateDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        selectedCount={selected.size}
        onApply={handleBulkApply}
        previewData={bulkPreviewData}
      />
    </div>
  );
}
