import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, ComposedChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/data/masterData";
import type { PriceHistoryEntry, PriceChangeType } from "./pricing.types";

interface PriceHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  history: PriceHistoryEntry[];
}

export function PriceHistoryDrawer({ open, onOpenChange, productName, history }: PriceHistoryDrawerProps) {
  const { t } = useTranslation();

  const CHANGE_TYPE_CONFIG: Record<PriceChangeType, { label: string; className: string }> = {
    price: { label: t("pricing.priceHistoryDrawer.changeTypePrice"), className: "bg-primary/10 text-primary border-primary/20" },
    cost: { label: t("pricing.priceHistoryDrawer.changeTypeCost"), className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300" },
    both: { label: t("pricing.priceHistoryDrawer.changeTypeBoth"), className: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300" },
    bulk_price: { label: t("pricing.priceHistoryDrawer.changeTypeBulk"), className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300" },
    initial: { label: t("pricing.priceHistoryDrawer.changeTypeInitial"), className: "bg-muted text-muted-foreground border-border" },
  };

  const SOURCE_LABEL: Record<string, string> = {
    pricing: t("pricing.source.pricing"),
    products: t("pricing.source.products"),
    import: t("pricing.source.import"),
    api: "API",
  };

  const chartData = history.slice().reverse().map((h) => ({
    date: new Date(h.changedAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" }),
    price: h.newPrice,
    cost: h.newCost,
    margin: h.newMargin,
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t("pricing.priceHistoryDrawer.title", { product: productName })}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {chartData.length > 0 ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">{t("pricing.priceHistoryDrawer.priceAndCost")}</p>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                        formatter={(v: number, name: string) => [currency(v), name === "price" ? t("pricing.priceHistoryDrawer.price") : t("pricing.priceHistoryDrawer.cost")]}
                      />
                      <Line type="stepAfter" dataKey="cost" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" name={t("pricing.priceHistoryDrawer.cost")} dot={false} />
                      <Line type="stepAfter" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} name={t("pricing.priceHistoryDrawer.price")} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">{t("pricing.priceHistoryDrawer.marginEvolution")}</p>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" unit="%" />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                        formatter={(v: number) => [`${v.toFixed(1)}%`, t("pricing.priceHistoryDrawer.margin")]}
                      />
                      <Area type="stepAfter" dataKey="margin" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth={2} name={t("pricing.priceHistoryDrawer.margin")} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">{t("pricing.priceHistoryDrawer.noHistory")}</p>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((h) => {
              const changeConfig = CHANGE_TYPE_CONFIG[h.changeType] ?? CHANGE_TYPE_CONFIG.price;
              return (
                <div key={h.id} className="rounded-lg border border-border p-3 text-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={changeConfig.className}>
                        {changeConfig.label}
                      </Badge>
                      {h.source && (
                        <span className="text-[10px] text-muted-foreground">
                          {t("pricing.priceHistoryDrawer.via")} {SOURCE_LABEL[h.source] ?? h.source}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(h.changedAt).toLocaleDateString("fr-DZ")} — {h.changedBy}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    {h.changeType !== "cost" && (
                      <div>
                        <span className="text-muted-foreground">{t("pricing.priceHistoryDrawer.priceLabel")} </span>
                        <span className="line-through text-muted-foreground mr-1">{currency(h.oldPrice)}</span>
                        <span className="font-semibold text-foreground">{currency(h.newPrice)}</span>
                      </div>
                    )}
                    {(h.changeType === "cost" || h.changeType === "both") && (
                      <div>
                        <span className="text-muted-foreground">{t("pricing.priceHistoryDrawer.costLabel")} </span>
                        <span className="line-through text-muted-foreground mr-1">{currency(h.oldCost)}</span>
                        <span className="font-semibold text-foreground">{currency(h.newCost)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">{t("pricing.priceHistoryDrawer.marginLabel")} </span>
                      <span className={h.newMargin < 0 ? "text-destructive font-semibold" : h.newMargin < 10 ? "text-yellow-600 font-semibold" : "text-emerald-600 font-semibold"}>
                        {h.oldMargin.toFixed(1)}% → {h.newMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {h.reason && (
                    <p className="text-[11px] text-muted-foreground italic">{h.reason}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
