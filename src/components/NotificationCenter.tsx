import { useState, useMemo } from "react";
import { Bell, CheckCircle, AlertTriangle, Clock, Info, X, Eye } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTranslation } from "react-i18next";

export interface AppNotification {
  id: string;
  type: "approval_pending" | "approval_sla" | "budget_exceeded" | "po_approved" | "grn_posted" | "invoice_due" | "match_exception" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: "info" | "warning" | "critical";
  link?: string;
}

const SEVERITY_ICON: Record<string, React.ElementType> = { info: Info, warning: AlertTriangle, critical: AlertTriangle };
const SEVERITY_COLOR: Record<string, string> = {
  info: "text-blue-500",
  warning: "text-amber-500",
  critical: "text-red-500",
};

export default function NotificationCenter() {
  const { purchaseOrders, invoices, grns } = useWMSData();
  const { t } = useTranslation();

  const generated = useMemo(() => {
    const notifs: AppNotification[] = [];
    const now = new Date();

    const pendingPOs = purchaseOrders.filter(p => p.status === "Draft");
    if (pendingPOs.length > 0) {
      notifs.push({
        id: "notif-po-pending",
        type: "approval_pending",
        title: t("notifications.poPending"),
        message: t("notifications.poPendingMsg", { count: pendingPOs.length }),
        timestamp: now.toISOString(),
        read: false,
        severity: "warning",
        link: "/wms/purchase-orders",
      });
    }

    const overdueInvs = invoices.filter(i => i.status === "Overdue");
    if (overdueInvs.length > 0) {
      notifs.push({
        id: "notif-inv-overdue",
        type: "invoice_due",
        title: t("notifications.invoiceOverdue"),
        message: t("notifications.invoiceOverdueMsg", { count: overdueInvs.length }),
        timestamp: now.toISOString(),
        read: false,
        severity: "critical",
        link: "/accounting/invoices",
      });
    }

    const pendingQC = grns.filter(g => g.status === "QC_Pending");
    if (pendingQC.length > 0) {
      notifs.push({
        id: "notif-grn-qc",
        type: "grn_posted",
        title: t("notifications.grnQcPending"),
        message: t("notifications.grnQcPendingMsg", { count: pendingQC.length }),
        timestamp: now.toISOString(),
        read: false,
        severity: "warning",
        link: "/wms/grn",
      });
    }

    const todayGrns = grns.filter(g => g.status === "Approved" && g.receivedAt.startsWith(now.toISOString().slice(0, 10)));
    if (todayGrns.length > 0) {
      notifs.push({
        id: "notif-grn-today",
        type: "info",
        title: t("notifications.grnToday"),
        message: t("notifications.grnTodayMsg", { count: todayGrns.length }),
        timestamp: now.toISOString(),
        read: false,
        severity: "info",
      });
    }

    notifs.push({
      id: "notif-budget",
      type: "budget_exceeded",
      title: t("notifications.budgetAlert"),
      message: t("notifications.budgetAlertMsg"),
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      severity: "warning",
      link: "/accounting/budgets",
    });

    return notifs;
  }, [purchaseOrders, invoices, grns, t]);

  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  
  const notifications = generated.map(n => ({ ...n, read: readIds.has(n.id) }));
  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id: string) => setReadIds(prev => new Set([...prev, id]));
  const markAllRead = () => setReadIds(new Set(notifications.map(n => n.id)));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[420px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> {t("notifications.title")}</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
                {t("notifications.markAllRead")}
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="mt-4 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t("notifications.empty")}</div>
          ) : (
            notifications.map(notif => {
              const Icon = SEVERITY_ICON[notif.severity];
              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${notif.read ? "bg-background opacity-60" : "bg-muted/30 border-primary/20"}`}
                  onClick={() => markRead(notif.id)}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${SEVERITY_COLOR[notif.severity]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{notif.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{notif.message}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-0.5" />
                          {new Date(notif.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {notif.link && (
                          <a href={notif.link} className="text-[10px] text-primary hover:underline" onClick={e => e.stopPropagation()}>
                            {t("notifications.see")}
                          </a>
                        )}
                      </div>
                    </div>
                    {!notif.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
