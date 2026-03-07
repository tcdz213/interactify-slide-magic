import { useNavigate } from "react-router-dom";
import { FileText, RotateCcw, ClipboardList, LogOut, User } from "lucide-react";
import { usePortalAuth } from "../components/PortalAuthGuard";
import { PORTAL_CUSTOMER } from "../data/mockPortalData";
import { useTranslation } from "react-i18next";

export default function PortalMoreScreen() {
  const navigate = useNavigate();
  const { logout } = usePortalAuth();
  const { t } = useTranslation();

  const MENU_ITEMS = [
    { icon: ClipboardList, label: t("portal.more.statement"), path: "/portal/statement" },
    { icon: RotateCcw, label: t("portal.more.returnRequest"), path: "/portal/return" },
    { icon: FileText, label: t("portal.more.myInvoices"), path: "/portal/invoices" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/portal/login", { replace: true });
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
          {PORTAL_CUSTOMER.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold">{PORTAL_CUSTOMER.name}</p>
          <p className="text-xs text-muted-foreground">{PORTAL_CUSTOMER.email}</p>
          <p className="text-[10px] text-muted-foreground">{PORTAL_CUSTOMER.zone} · {PORTAL_CUSTOMER.type}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {MENU_ITEMS.map((item, i) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left ${i < MENU_ITEMS.length - 1 ? "border-b border-border/50" : ""}`}
          >
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="w-full rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span className="text-sm font-medium">{t("portal.more.logout")}</span>
      </button>
    </div>
  );
}
