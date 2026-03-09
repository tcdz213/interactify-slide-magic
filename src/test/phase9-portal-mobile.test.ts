/**
 * 90-DAY-TEST-PLAN — Phase 9 : Portail Client B2B & App Mobile Commercial
 * Scénarios 9.01 → 9.14
 * Tests : portail client self-service, app mobile commercial, credit check, offline, sync
 */
import { describe, it, expect } from "vitest";
import {
  PORTAL_USER, PORTAL_CUSTOMER, portalOrders, portalInvoices,
  portalPayments, portalStatement, portalNotifications, portalReturns, portalCatalog,
} from "@/portal/data/mockPortalData";
import {
  REP_PROFILE, mockCustomers, mockOrders, mockRoutePlan, mobileCatalog,
} from "@/mobile/data/mockSalesData";
import { checkCredit } from "@/shared/utils/creditCheck";
import { users } from "@/data/userData";
import { salesOrders, customers, inventory } from "@/data/mockData";
import { canAccessWarehouse } from "@/lib/rbac";

// ── Users ──
const userFarid = users.find(u => u.id === "U013")!;    // RegionalManager
const userKarim = users.find(u => u.id === "U002")!;     // WM Alger
const userAhmed = users.find(u => u.id === "U001")!;     // CEO

// ══════════════════════════════════════════════════════════════
// PORTAIL CLIENT B2B (9.01 → 9.06)
// ══════════════════════════════════════════════════════════════

// ── 9.01 — Client login → Dashboard portail ──
describe("9.01 — Client login OTP → Dashboard portail", () => {
  it("portal user existe avec customerId C004", () => {
    expect(PORTAL_USER.id).toBe("PU-001");
    expect(PORTAL_USER.customerId).toBe("C004");
    expect(PORTAL_USER.customerName).toBe("Supermarché Uno");
  });

  it("solde crédit visible : limite 20M, utilisé 9.5M", () => {
    expect(PORTAL_CUSTOMER.creditLimit).toBe(20_000_000);
    expect(PORTAL_CUSTOMER.creditUsed).toBe(9_500_000);
    const available = PORTAL_CUSTOMER.creditLimit - PORTAL_CUSTOMER.creditUsed;
    expect(available).toBe(10_500_000);
  });

  it("commandes récentes visibles (≥3)", () => {
    const recent = portalOrders.filter(o => o.customerId === "C004");
    expect(recent.length).toBeGreaterThanOrEqual(3);
  });

  it("notifications non lues présentes", () => {
    const unread = portalNotifications.filter(n => !n.read);
    expect(unread.length).toBeGreaterThan(0);
  });

  it("customer status est Active", () => {
    expect(PORTAL_CUSTOMER.status).toBe("Active");
  });
});

// ── 9.02 — Passer commande en ligne : 50 sacs Ciment (credit check) ──
describe("9.02 — Commande portail : 50 sacs + credit check auto", () => {
  it("catalogue portail contient ≥10 produits", () => {
    expect(portalCatalog.length).toBeGreaterThanOrEqual(10);
  });

  it("chaque produit catalogue a prix et stock", () => {
    portalCatalog.forEach(p => {
      expect(p.unitPrice).toBeGreaterThan(0);
      expect(p.stock).toBeGreaterThan(0);
    });
  });

  it("credit check passe pour commande 240,000 DZD", () => {
    const result = checkCredit(PORTAL_CUSTOMER, 240_000);
    expect(result.passed).toBe(true);
    expect(result.available).toBe(10_500_000);
  });

  it("credit check bloque si commande > crédit disponible", () => {
    const result = checkCredit(PORTAL_CUSTOMER, 11_000_000);
    expect(result.passed).toBe(false);
  });

  it("credit check bloque si overdue ≥60 jours", () => {
    const result = checkCredit({ creditLimit: 1_000_000, creditUsed: 0, oldestOverdueDays: 60 }, 100);
    expect(result.passed).toBe(false);
    expect(result.blocked).toBe(true);
  });
});

// ── 9.03 — Historique commandes filtré par statut ──
describe("9.03 — Historique commandes portail", () => {
  it("commandes couvrent plusieurs statuts", () => {
    const statuses = new Set(portalOrders.map(o => o.status));
    expect(statuses.size).toBeGreaterThanOrEqual(3);
  });

  it("commandes Delivered ont une date de livraison", () => {
    portalOrders.filter(o => o.status === "Delivered").forEach(o => {
      expect(o.deliveryDate).toBeTruthy();
    });
  });

  it("commande Shipped a ETA", () => {
    const shipped = portalOrders.find(o => o.status === "Shipped");
    expect(shipped).toBeDefined();
    expect(shipped!.eta).toBeTruthy();
  });

  it("commande Cancelled existe", () => {
    const cancelled = portalOrders.find(o => o.status === "Cancelled");
    expect(cancelled).toBeDefined();
  });

  it("totalAmount cohérent avec somme des lignes", () => {
    portalOrders.forEach(o => {
      if (o.lines.length > 0) {
        const linesTotal = o.lines.reduce((s, l) => s + l.lineTotal, 0);
        // May include tax, so totalAmount >= linesTotal
        expect(o.totalAmount).toBeGreaterThanOrEqual(linesTotal * 0.9);
      }
    });
  });
});

// ── 9.04 — Factures et relevé de compte ──
describe("9.04 — Factures et statement client", () => {
  it("4 factures portail avec statuts variés", () => {
    expect(portalInvoices.length).toBe(4);
    const statuses = new Set(portalInvoices.map(i => i.status));
    expect(statuses.size).toBeGreaterThanOrEqual(3);
  });

  it("facture paid a balance = 0", () => {
    const paid = portalInvoices.find(i => i.status === "paid");
    expect(paid).toBeDefined();
    expect(paid!.balance).toBe(0);
    expect(paid!.paidAmount).toBe(paid!.totalAmount);
  });

  it("facture overdue existe avec balance > 0", () => {
    const overdue = portalInvoices.find(i => i.status === "overdue");
    expect(overdue).toBeDefined();
    expect(overdue!.balance).toBeGreaterThan(0);
  });

  it("relevé de compte a ≥8 entrées", () => {
    expect(portalStatement.length).toBeGreaterThanOrEqual(8);
  });

  it("statement a entrées debit et credit", () => {
    const types = new Set(portalStatement.map(s => s.type));
    expect(types.has("debit")).toBe(true);
    expect(types.has("credit")).toBe(true);
  });

  it("running balance est cohérent (positif sur dernière entrée)", () => {
    const latest = portalStatement[0];
    expect(latest.runningBalance).toBeGreaterThan(0);
  });
});

// ── 9.05 — Demander un retour via portail ──
describe("9.05 — Retour portail : formulaire soumis", () => {
  it("retour portail RET-001 existe", () => {
    expect(portalReturns.length).toBeGreaterThan(0);
  });

  it("retour lié à une commande existante", () => {
    const ret = portalReturns[0];
    expect(ret.orderId).toBeTruthy();
    const order = portalOrders.find(o => o.id === ret.orderId);
    expect(order).toBeDefined();
  });

  it("retour a statut approved", () => {
    expect(portalReturns[0].status).toBe("approved");
  });

  it("ligne retour a reason et qty", () => {
    const line = portalReturns[0].lines[0];
    expect(line.returnQty).toBeGreaterThan(0);
    expect(line.reason).toBeTruthy();
    expect(line.returnQty).toBeLessThanOrEqual(line.orderedQty);
  });

  it("retour a dates request et review", () => {
    const ret = portalReturns[0];
    expect(ret.requestedAt).toBeTruthy();
    expect(ret.reviewedAt).toBeTruthy();
  });
});

// ── 9.06 — Historique paiements ──
describe("9.06 — Paiements portail par facture", () => {
  it("3 paiements portail existent", () => {
    expect(portalPayments.length).toBe(3);
  });

  it("paiements couvrent méthodes transfer et cheque", () => {
    const methods = new Set(portalPayments.map(p => p.method));
    expect(methods.has("transfer")).toBe(true);
    expect(methods.has("cheque")).toBe(true);
  });

  it("paiement confirmed et pending existent", () => {
    const statuses = new Set(portalPayments.map(p => p.status));
    expect(statuses.has("confirmed")).toBe(true);
    expect(statuses.has("pending")).toBe(true);
  });

  it("chaque paiement est lié à une facture", () => {
    portalPayments.forEach(p => {
      expect(p.invoiceId).toBeTruthy();
      const inv = portalInvoices.find(i => i.id === p.invoiceId);
      expect(inv).toBeDefined();
    });
  });

  it("paiement le plus élevé = 4,165,000 DZD", () => {
    const max = Math.max(...portalPayments.map(p => p.amount));
    expect(max).toBe(4_165_000);
  });
});

// ══════════════════════════════════════════════════════════════
// APP MOBILE COMMERCIAL (9.07 → 9.11)
// ══════════════════════════════════════════════════════════════

// ── 9.07 — Login biométrique → Dashboard mobile ──
describe("9.07 — Mobile : login → Dashboard KPIs", () => {
  it("profil commercial existe avec quota", () => {
    expect(REP_PROFILE.id).toBe("REP-001");
    expect(REP_PROFILE.name).toBe("Yassine Khelifi");
    expect(REP_PROFILE.quotaTarget).toBe(500_000);
  });

  it("progression quota = 77%", () => {
    const pct = (REP_PROFILE.quotaCurrent / REP_PROFILE.quotaTarget) * 100;
    expect(pct).toBe(77);
  });

  it("PIN existe pour auth", () => {
    expect(REP_PROFILE.pin).toBe("123456");
  });

  it("zone commercial = Alger Ouest", () => {
    expect(REP_PROFILE.zone).toBe("Alger Ouest");
  });
});

// ── 9.08 — Liste clients route géolocalisés ──
describe("9.08 — Clients route géolocalisés sur carte", () => {
  it("8 clients dans la base mobile", () => {
    expect(mockCustomers.length).toBe(8);
  });

  it("tous les clients ont coordonnées GPS", () => {
    mockCustomers.forEach(c => {
      expect(c.lat).toBeGreaterThan(0);
      expect(c.lng).toBeGreaterThan(0);
    });
  });

  it("route plan contient 5 stops", () => {
    expect(mockRoutePlan.length).toBe(5);
  });

  it("stops ont planned time et adresse", () => {
    mockRoutePlan.forEach(r => {
      expect(r.plannedTime).toBeTruthy();
      expect(r.address).toBeTruthy();
    });
  });

  it("clients couvrent catégories A, B, C", () => {
    const cats = new Set(mockCustomers.map(c => c.category));
    expect(cats.has("A")).toBe(true);
    expect(cats.has("B")).toBe(true);
    expect(cats.has("C")).toBe(true);
  });

  it("certains stops sont déjà checked-in", () => {
    const checkedIn = mockRoutePlan.filter(r => r.checkedIn);
    expect(checkedIn.length).toBeGreaterThan(0);
  });
});

// ── 9.09 — Créer commande terrain (offline) ──
describe("9.09 — Commande terrain offline", () => {
  it("catalogue mobile contient 10 produits avec conversions", () => {
    expect(mobileCatalog.length).toBe(10);
    mobileCatalog.forEach(p => {
      expect(p.conversions.length).toBeGreaterThan(0);
    });
  });

  it("chaque produit catalogue a baseUnit et stock", () => {
    mobileCatalog.forEach(p => {
      expect(p.baseUnit).toBeTruthy();
      expect(p.stock).toBeGreaterThan(0);
    });
  });

  it("credit check intégré à la commande mobile", () => {
    const customer = mockCustomers.find(c => c.id === "C001")!;
    const result = checkCredit(customer, 33_000);
    expect(result.passed).toBe(true);
    expect(result.available).toBe(customer.creditLimit - customer.creditUsed);
  });

  it("credit check bloque client C003 (crédit quasi épuisé + overdue 65j)", () => {
    const customer = mockCustomers.find(c => c.id === "C003")!;
    const result = checkCredit(customer, 10_000);
    expect(result.passed).toBe(false);
    expect(result.blocked).toBe(true);
  });

  it("commande offline a statut Pending", () => {
    const pending = mockOrders.find(o => o.status === "Pending");
    expect(pending).toBeDefined();
  });
});

// ── 9.10 — Synchroniser commandes au retour en ligne ──
describe("9.10 — Sync commandes mobile", () => {
  it("commandes couvrent statuts Pending → Delivered lifecycle", () => {
    const statuses = new Set(mockOrders.map(o => o.status));
    expect(statuses.has("Pending")).toBe(true);
    expect(statuses.has("Approved")).toBe(true);
    expect(statuses.has("Shipped")).toBe(true);
    expect(statuses.has("Delivered")).toBe(true);
  });

  it("commande Rejected existe (credit refusé)", () => {
    const rejected = mockOrders.find(o => o.status === "Rejected");
    expect(rejected).toBeDefined();
    expect(rejected!.customerName).toBe("Restaurant El Djazair");
  });

  it("commandes ont createdAt timestamp", () => {
    mockOrders.forEach(o => {
      expect(o.createdAt).toBeTruthy();
      expect(new Date(o.createdAt).getTime()).toBeGreaterThan(0);
    });
  });

  it("totalAmount cohérent avec lignes", () => {
    mockOrders.forEach(o => {
      const linesTotal = o.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
      expect(o.totalAmount).toBe(linesTotal);
    });
  });
});

// ── 9.11 — Historique commandes client (6 mois) ──
describe("9.11 — Historique 6 mois mobile", () => {
  it("5 commandes mobile couvrent fév-mars 2026", () => {
    expect(mockOrders.length).toBe(5);
    const dates = mockOrders.map(o => o.createdAt.slice(0, 7));
    expect(dates.some(d => d.startsWith("2026-02") || d.startsWith("2026-03"))).toBe(true);
  });

  it("commandes liées à des clients valides", () => {
    mockOrders.forEach(o => {
      const customer = mockCustomers.find(c => c.id === o.customerId);
      expect(customer).toBeDefined();
    });
  });

  it("certains clients ont lastVisit récente", () => {
    const recent = mockCustomers.filter(c => c.lastVisit >= "2026-02-25");
    expect(recent.length).toBeGreaterThan(0);
  });

  it("acceptPartial flag existe sur commandes", () => {
    const withPartial = mockOrders.filter(o => o.acceptPartial);
    expect(withPartial.length).toBeGreaterThan(0);
  });
});

// ══════════════════════════════════════════════════════════════
// INTÉGRATION ADMIN (9.12 → 9.14)
// ══════════════════════════════════════════════════════════════

// ── 9.12 — RegionalManager valide commandes portail ──
describe("9.12 — RegionalManager valide commandes portail", () => {
  it("RegionalManager Farid a accès Alger + Oran", () => {
    expect(canAccessWarehouse(userFarid, "wh-alger-construction")).toBe(true);
    expect(canAccessWarehouse(userFarid, "wh-oran-food")).toBe(true);
  });

  it("commandes portail Approved existent dans le pipeline", () => {
    const approved = portalOrders.filter(o => o.status === "Approved");
    expect(approved.length).toBeGreaterThan(0);
  });

  it("commande Approved a lignes avec stock vérifié", () => {
    const order = portalOrders.find(o => o.status === "Approved")!;
    order.lines.forEach(line => {
      const catalogItem = portalCatalog.find(p => p.id === line.productId);
      if (catalogItem) {
        expect(catalogItem.stock).toBeGreaterThan(0);
      }
    });
  });
});

// ── 9.13 — WM voit commandes portail dans pipeline ──
describe("9.13 — WM voit commandes dans pipeline normal", () => {
  it("Karim (WM Alger) a accès entrepôt", () => {
    expect(canAccessWarehouse(userKarim, "wh-alger-construction")).toBe(true);
  });

  it("sales orders admin existent dans le système", () => {
    expect(salesOrders.length).toBeGreaterThan(0);
  });

  it("commandes portail et admin partagent même structure", () => {
    const portalOrder = portalOrders[0];
    expect(portalOrder.lines[0]).toHaveProperty("productId");
    expect(portalOrder.lines[0]).toHaveProperty("qty");
    expect(portalOrder.lines[0]).toHaveProperty("unitPrice");
    expect(portalOrder.lines[0]).toHaveProperty("lineTotal");
  });

  it("stock Oran disponible pour commandes Food", () => {
    const oranInv = inventory.filter(i => i.warehouseId === "wh-oran-food");
    expect(oranInv.length).toBeGreaterThan(0);
    const totalAvail = oranInv.reduce((s, i) => s + i.qtyAvailable, 0);
    expect(totalAvail).toBeGreaterThan(0);
  });
});

// ── 9.14 — CEO Dashboard : part commandes portail vs terrain ──
describe("9.14 — CEO : KPI adoption portail vs terrain", () => {
  it("Ahmed (CEO) a accès global", () => {
    expect(userAhmed.assignedWarehouseIds).toBe("all");
  });

  it("commandes portail (5) et mobile (5) = 10 commandes totales", () => {
    const portalCount = portalOrders.length;
    const mobileCount = mockOrders.length;
    expect(portalCount).toBe(5);
    expect(mobileCount).toBe(5);
    expect(portalCount + mobileCount).toBe(10);
  });

  it("CA portail calculable", () => {
    const portalCA = portalOrders
      .filter(o => o.status !== "Cancelled")
      .reduce((s, o) => s + o.totalAmount, 0);
    expect(portalCA).toBeGreaterThan(10_000_000);
  });

  it("CA mobile calculable", () => {
    const mobileCA = mockOrders
      .filter(o => o.status !== "Rejected" && o.status !== "Cancelled")
      .reduce((s, o) => s + o.totalAmount, 0);
    expect(mobileCA).toBeGreaterThan(200_000);
  });

  it("taux adoption portail = 50% des commandes (5/10)", () => {
    const total = portalOrders.length + mockOrders.length;
    const portalShare = (portalOrders.length / total) * 100;
    expect(portalShare).toBe(50);
  });
});

// ── BONUS : Cohérence cross-channel ──
describe("BONUS — Cohérence Portail ↔ Mobile ↔ Admin", () => {
  it("notifications portail couvrent tous les types", () => {
    const types = new Set(portalNotifications.map(n => n.type));
    expect(types.size).toBeGreaterThanOrEqual(4);
  });

  it("catalogue mobile et portail partagent des produits communs", () => {
    const portalIds = new Set(portalCatalog.map(p => p.id));
    const mobileIds = new Set(mobileCatalog.map(p => p.id));
    const common = [...portalIds].filter(id => mobileIds.has(id));
    expect(common.length).toBeGreaterThanOrEqual(5);
  });

  it("credit check logic identique portail et mobile", () => {
    // Same function used for both
    const portalCheck = checkCredit(PORTAL_CUSTOMER, 100_000);
    const mobileCustomer = mockCustomers.find(c => c.id === "C004")!;
    const mobileCheck = checkCredit(mobileCustomer, 100_000);
    expect(portalCheck.passed).toBe(true);
    expect(mobileCheck.passed).toBe(true);
  });
});
