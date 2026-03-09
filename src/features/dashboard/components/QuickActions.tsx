/**
 * Phase 6 — Quick Actions widget: shortcuts to common operations.
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ShoppingCart, Package, ClipboardList, Truck, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

const actions = [
  { key: "newPO", icon: Plus, route: "/wms/purchase-orders", color: "bg-primary/10 text-primary" },
  { key: "newOrder", icon: ShoppingCart, route: "/sales/orders", color: "bg-info/10 text-info" },
  { key: "cycleCount", icon: ClipboardList, route: "/wms/cycle-count", color: "bg-warning/10 text-warning" },
  { key: "transfers", icon: Truck, route: "/wms/transfers", color: "bg-chart-4/10 text-chart-4" },
  { key: "products", icon: Package, route: "/wms/products", color: "bg-success/10 text-success" },
  { key: "reports", icon: BarChart3, route: "/reports", color: "bg-destructive/10 text-destructive" },
];

const LABELS: Record<string, Record<string, string>> = {
  en: { newPO: "New PO", newOrder: "New Order", cycleCount: "Cycle Count", transfers: "Transfers", products: "Products", reports: "Reports" },
  fr: { newPO: "Nouvel achat", newOrder: "Nv. commande", cycleCount: "Inventaire", transfers: "Transferts", products: "Produits", reports: "Rapports" },
  ar: { newPO: "طلب شراء", newOrder: "طلب جديد", cycleCount: "جرد", transfers: "تحويلات", products: "منتجات", reports: "تقارير" },
};

export default function QuickActions() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("ar") ? "ar" : i18n.language?.startsWith("fr") ? "fr" : "en";
  const labels = LABELS[lang] ?? LABELS.en;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {actions.map((a, i) => (
        <motion.button
          key={a.key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04, duration: 0.25 }}
          onClick={() => navigate(a.route)}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-card p-3 hover:border-primary/40 hover:shadow-md transition-all group"
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.color} transition-transform group-hover:scale-110`}>
            <a.icon className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {labels[a.key]}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
