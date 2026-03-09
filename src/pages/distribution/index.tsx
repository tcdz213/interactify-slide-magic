import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DateFilter } from "@/components/DateFilter";
import { Route, Truck, Eye, MapPin, Clock, CheckCircle2, Package, Plus, XCircle } from "lucide-react";
import { currency, users } from "@/data/mockData";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DeliveryTrip, DeliveryStatus, DeliveryOrder } from "@/data/mockData";
import type { TripStatus } from "@/data/mockData";

const DRIVERS = users.filter((u) => u.role === "Driver");
const VEHICLES = [
  { id: "VH-003", plate: "16-12345" },
  { id: "VH-005", plate: "16-67890" },
  { id: "VH-006", plate: "16-11111" },
  { id: "VH-007", plate: "16-22222" },
];

function nextTripId(trips: DeliveryTrip[]): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `TRIP-${today}-`;
  const sameDay = trips.filter((t) => t.id.startsWith(prefix));
  const nums = sameDay.map((t) => parseInt(t.id.slice(prefix.length), 10)).filter((n) => !Number.isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

function nextDeliveryIds(trips: DeliveryTrip[], count: number): string[] {
  const all = trips.flatMap((t) => t.orders);
  const nums = all.map((o) => parseInt(o.id.replace("DEL-", ""), 10)).filter((n) => !Number.isNaN(n));
  let next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return Array.from({ length: count }, () => `DEL-${String(next++).padStart(3, "0")}`);
}

export function RoutesPage() {
  const { t } = useTranslation();
  const { deliveryTrips, setDeliveryTrips, salesOrders, customers } = useWMSData();
  const { currentUser } = useAuth();
  const canPlanRoutes = currentUser ? ["CEO", "OpsDirector", "Supervisor", "RegionalManager"].includes(currentUser.role) : false;
  const [planOpen, setPlanOpen] = useState(false);
  const [planDate, setPlanDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [planZone, setPlanZone] = useState("Zone Nord");
  const [planDriverId, setPlanDriverId] = useState(DRIVERS[0]?.id ?? "");
  const [planVehicleId, setPlanVehicleId] = useState(VEHICLES[0]?.id ?? "");
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  const orderIdsInTrips = new Set(deliveryTrips.flatMap((t) => t.orders.map((o) => o.orderId)));
  const eligibleOrders = salesOrders.filter(
    (o) => ["Approved", "Picking", "Packed"].includes(o.status) && !orderIdsInTrips.has(o.id)
  );

  const toggleOrder = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Route className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("distribution.routesTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("distribution.routesSubtitle")}</p>
          </div>
        </div>
        {canPlanRoutes && (
          <Button className="flex items-center gap-2" onClick={() => { setPlanDate(new Date().toISOString().slice(0, 10)); setPlanZone("Zone Nord"); setPlanDriverId(DRIVERS[0]?.id ?? ""); setPlanVehicleId(VEHICLES[0]?.id ?? ""); setSelectedOrderIds(new Set()); setPlanOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("distribution.planRoute")}
          </Button>
        )}
      </div>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("distribution.planRouteTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("distribution.date")}</Label>
                <DateFilter value={planDate} onChange={setPlanDate} placeholder={t("distribution.date")} />
              </div>
              <div className="space-y-2">
                <Label>{t("distribution.zone")}</Label>
                <Select value={planZone} onValueChange={setPlanZone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Zone Nord", "Zone Est", "Zone Sud", "Zone Centre", "Alger Nord", "Alger Est", "Alger Sud", "Alger Centre", "Oran", "Constantine"].map((z) => (
                      <SelectItem key={z} value={z}>{z}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("distribution.driver")}</Label>
                <Select value={planDriverId} onValueChange={setPlanDriverId}>
                  <SelectTrigger><SelectValue placeholder={t("distribution.chooseDriver")} /></SelectTrigger>
                  <SelectContent>
                    {DRIVERS.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("distribution.vehicle")}</Label>
                <Select value={planVehicleId} onValueChange={setPlanVehicleId}>
                  <SelectTrigger><SelectValue placeholder={t("distribution.chooseVehicle")} /></SelectTrigger>
                  <SelectContent>
                    {VEHICLES.map((v) => (<SelectItem key={v.id} value={v.id}>{v.plate} ({v.id})</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t("distribution.ordersToDeliver")}</Label>
              <p className="text-xs text-muted-foreground mb-2">{t("distribution.eligibleOrders")}</p>
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {eligibleOrders.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">{t("distribution.noEligibleOrders")}</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="w-10" />
                        <th className="text-left p-2 text-xs font-medium text-muted-foreground">{t("distribution.order")}</th>
                        <th className="text-left p-2 text-xs font-medium text-muted-foreground">{t("distribution.client")}</th>
                        <th className="text-right p-2 text-xs font-medium text-muted-foreground">{t("common.total", "Total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eligibleOrders.map((o) => (
                        <tr key={o.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="p-2"><input type="checkbox" checked={selectedOrderIds.has(o.id)} onChange={() => toggleOrder(o.id)} className="rounded" /></td>
                          <td className="p-2 font-mono text-xs">{o.id}</td>
                          <td className="p-2">{o.customerName}</td>
                          <td className="p-2 text-right font-medium">{currency(o.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPlanOpen(false)}>{t("common.cancel", "Annuler")}</Button>
              <Button onClick={() => {
                const driver = DRIVERS.find((d) => d.id === planDriverId);
                const vehicle = VEHICLES.find((v) => v.id === planVehicleId);
                if (!driver || !vehicle) { toast({ title: t("distribution.driverAndVehicleRequired"), variant: "destructive" }); return; }
                if (selectedOrderIds.size === 0) { toast({ title: t("distribution.selectAtLeastOneOrder"), variant: "destructive" }); return; }
                const selectedOrders = salesOrders.filter((o) => selectedOrderIds.has(o.id));
                const newIds = nextDeliveryIds(deliveryTrips, selectedOrders.length);
                const newOrders: DeliveryOrder[] = selectedOrders.map((o, i) => {
                  const cust = customers.find((c) => c.id === o.customerId);
                  return { id: newIds[i], orderId: o.id, customerName: o.customerName, address: cust ? `Zone ${cust.zone}` : "—", zone: cust?.zone ?? "—", status: "Pending" as DeliveryStatus, scheduledTime: `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`, notes: "", items: o.lines.length, value: o.totalAmount };
                });
                const tripId = nextTripId(deliveryTrips);
                const newTrip: DeliveryTrip = { id: tripId, driverId: driver.id, driverName: driver.name, vehicleId: vehicle.id, vehiclePlate: vehicle.plate, date: planDate, status: "Planning" as TripStatus, zone: planZone, totalStops: newOrders.length, completedStops: 0, totalValue: newOrders.reduce((s, o) => s + o.value, 0), orders: newOrders };
                setDeliveryTrips((prev) => [...prev, newTrip]);
                toast({ title: t("distribution.routeCreated"), description: t("distribution.routeDesc", { id: tripId, count: newOrders.length }) });
                setPlanOpen(false);
              }}>
                {t("distribution.createRoute")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-3 gap-4">
        {deliveryTrips.map((trip) => (
          <div key={trip.id} className="glass-card rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground">{trip.id}</p>
                <p className="font-semibold mt-0.5">{trip.zone}</p>
              </div>
              <StatusBadge status={trip.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground"><Truck className="h-3.5 w-3.5" />{trip.driverName}</div>
              <div className="flex items-center gap-1.5 text-muted-foreground"><Package className="h-3.5 w-3.5" />{trip.vehiclePlate}</div>
              <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{trip.completedStops}/{trip.totalStops} {t("distribution.stops")}</div>
              <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{trip.departureTime || "—"}</div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>{t("distribution.progress")}</span>
                <span>{Math.round((trip.completedStops / trip.totalStops) * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(trip.completedStops / trip.totalStops) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-sm font-semibold">{currency(trip.totalValue)}</span>
              <span className="text-[10px] text-muted-foreground">{t("distribution.deliveriesCount", { count: trip.orders.length })}</span>
            </div>
            <div className="space-y-2">
              {trip.orders.map((order, i) => (
                <div key={order.id} className="flex items-center gap-2 text-xs">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${order.status === "Delivered" ? "bg-success/10 text-success" : order.status === "In_Transit" ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"}`}>
                    {order.status === "Delivered" ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{order.customerName}</p>
                    <p className="text-[10px] text-muted-foreground">{order.scheduledTime}{order.actualTime ? ` → ${order.actualTime}` : ""}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeliveriesPage() {
  const { t } = useTranslation();
  const { deliveryTrips, setDeliveryTrips, setSalesOrders } = useWMSData();
  const { currentUser } = useAuth();
  const [selectedTrip, setSelectedTrip] = useState<DeliveryTrip | null>(null);
  const [failTarget, setFailTarget] = useState<{ tripId: string; deliveryId: string } | null>(null);
  const [failReason, setFailReason] = useState("Absent");

  const allDeliveriesRaw = deliveryTrips.flatMap((t) => t.orders.map((o) => ({ ...o, tripId: t.id, driverName: t.driverName, driverId: t.driverId, vehiclePlate: t.vehiclePlate })));
  const isDriver = currentUser?.role === "Driver";
  const allDeliveries = isDriver ? allDeliveriesRaw.filter((d) => d.driverId === currentUser?.id) : allDeliveriesRaw;

  const setDeliveryStatus = (tripId: string, deliveryOrderId: string, status: DeliveryStatus) => {
    const delivery = allDeliveries.find((d) => d.id === deliveryOrderId);
    const salesOrderId = delivery?.orderId;
    setDeliveryTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      const newOrders = trip.orders.map(o => o.id !== deliveryOrderId ? o : { ...o, status, ...(status === "Delivered" ? { actualTime: new Date().toTimeString().slice(0, 5), signature: true } : {}) });
      const completedStops = newOrders.filter(o => o.status === "Delivered").length;
      return { ...trip, orders: newOrders, completedStops };
    }));
    if (status === "Delivered" && salesOrderId) {
      setSalesOrders(prev => prev.map(o => {
        if (o.id !== salesOrderId) return o;
        return { ...o, status: "Delivered" as const, lines: o.lines.map(l => ({ ...l, shippedQty: l.orderedQty })) };
      }));
    }
    toast({ title: t("distribution.deliveryUpdated"), description: `${deliveryOrderId} → ${status.replace(/_/g, " ")}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("distribution.deliveriesTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("distribution.deliveriesSubtitle", { count: allDeliveries.length })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: t("distribution.pending"), value: allDeliveries.filter(d => ["Pending", "Loaded"].includes(d.status)).length },
          { label: t("distribution.inTransit"), value: allDeliveries.filter(d => d.status === "In_Transit").length, color: "text-info" },
          { label: t("distribution.delivered"), value: allDeliveries.filter(d => d.status === "Delivered").length, color: "text-success" },
          { label: t("distribution.failed"), value: allDeliveries.filter(d => ["Failed", "Returned"].includes(d.status)).length, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-bold ${s.color || ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">ID</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("distribution.trip")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("distribution.client")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("distribution.address")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("distribution.driver")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("distribution.scheduledTime")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("distribution.value")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("common.status", "Statut")}</th>
              <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("distribution.signature")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("common.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {allDeliveries.map((d) => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{d.id}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.tripId}</td>
                <td className="px-4 py-3 font-medium">{d.customerName}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.address}</td>
                <td className="px-4 py-3 text-xs">{d.driverName}</td>
                <td className="px-4 py-3 text-xs">{d.scheduledTime}{d.actualTime ? ` → ${d.actualTime}` : ""}</td>
                <td className="px-4 py-3 text-right font-medium">{currency(d.value)}</td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-4 py-3 text-center">
                  {d.signature ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> : <span className="text-muted-foreground text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                  {d.status === "Pending" && (
                    <button onClick={() => setDeliveryStatus(d.tripId, d.id, "In_Transit")} className="text-xs px-2 py-1 rounded bg-info/10 text-info hover:bg-info/20">{t("distribution.inTransitBtn")}</button>
                  )}
                  {d.status === "In_Transit" && (
                    <>
                      <button onClick={() => setDeliveryStatus(d.tripId, d.id, "Delivered")} className="text-xs px-2 py-1 rounded bg-success/10 text-success hover:bg-success/20">{t("distribution.deliveredBtn")}</button>
                      <button onClick={() => setFailTarget({ tripId: d.tripId, deliveryId: d.id })} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20">{t("distribution.failedBtn")}</button>
                    </>
                  )}
                  {d.status === "Loaded" && (
                    <button onClick={() => setDeliveryStatus(d.tripId, d.id, "In_Transit")} className="text-xs px-2 py-1 rounded bg-info/10 text-info hover:bg-info/20">{t("distribution.inTransitBtn")}</button>
                  )}
                  {d.status === "Failed" && (
                    <button onClick={() => setDeliveryStatus(d.tripId, d.id, "Returned")} className="text-xs px-2 py-1 rounded bg-warning/10 text-warning hover:bg-warning/20">{t("distribution.returnBtn")}</button>
                  )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fail delivery dialog */}
      <Dialog open={!!failTarget} onOpenChange={(o) => !o && setFailTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive" /> {t("distribution.failedDelivery")}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Label>{t("distribution.failReason")}</Label>
            <Select value={failReason} onValueChange={setFailReason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Absent">{t("distribution.absent")}</SelectItem>
                <SelectItem value="Refusé">{t("distribution.refused")}</SelectItem>
                <SelectItem value="Adresse incorrecte">{t("distribution.wrongAddress")}</SelectItem>
                <SelectItem value="Autre">{t("distribution.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFailTarget(null)}>{t("common.cancel", "Annuler")}</Button>
            <Button variant="destructive" onClick={() => {
              if (failTarget) {
                setDeliveryStatus(failTarget.tripId, failTarget.deliveryId, "Failed");
                toast({ title: t("distribution.deliveryFailed"), description: t("distribution.deliveryFailedDesc", { id: failTarget.deliveryId, reason: failReason }) });
                setFailTarget(null);
              }
            }}>{t("distribution.confirmFail")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
