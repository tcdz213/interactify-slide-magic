import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import PortalStatusBadge from "../components/PortalStatusBadge";
import { portalOrders } from "../data/mockPortalData";
import { useTranslation } from "react-i18next";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

export default function MyOrdersScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const FILTERS = [
    { key: "all", label: t("portal.orders.all") },
    { key: "inProgress", label: t("portal.orders.inProgress") },
    { key: "delivered", label: t("portal.orders.delivered") },
    { key: "cancelled", label: t("portal.orders.cancelled") },
  ];

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filterMatch = (status: string, f: string) => {
    if (f === "all") return true;
    if (f === "inProgress") return ["Draft", "Pending", "Approved", "Picking", "Shipped"].includes(status);
    if (f === "delivered") return status === "Delivered";
    if (f === "cancelled") return ["Cancelled", "Credit_Hold"].includes(status);
    return true;
  };

  const filtered = portalOrders
    .filter((o) => filterMatch(o.status, filter))
    .filter((o) => !search || o.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <h1 className="text-lg font-bold">{t("portal.orders.title")}</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("common.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((o) => (
          <button
            key={o.id}
            onClick={() => navigate(`/portal/orders/${o.id}`)}
            className="w-full rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs font-medium">{o.id}</span>
              <PortalStatusBadge status={o.status} />
            </div>
            <p className="text-sm font-semibold">{currency(o.totalAmount)}</p>
            <p className="text-[10px] text-muted-foreground">{o.lines.length} {t("portal.orders.articles")} · {new Date(o.createdAt).toLocaleDateString("fr-FR")}</p>
            {o.eta && <p className="text-[10px] text-primary mt-1">{t("portal.orders.expectedDelivery")} {o.eta}</p>}
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] text-primary hover:underline">{t("portal.orders.detail")}</span>
              {o.status === "Delivered" && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <RefreshCw className="h-3 w-3" /> {t("portal.orders.reorder")}
                </span>
              )}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">{t("portal.orders.noOrders")}</div>
        )}
      </div>
    </div>
  );
}
