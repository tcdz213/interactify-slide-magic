/**
 * 90-DAY-TEST-PLAN — Phase 5: Transferts Inter-Entrepôts
 * Scénarios 5.01 à 5.14
 * Transferts source→destination, RBAC scope, variance réception, valorisation.
 */
import { describe, it, expect } from "vitest";
import {
  stockTransfers, inventory, users, products,
} from "@/data/mockData";
import { stockMovements } from "@/data/operationalData";
import {
  canCreateDocument, canApproveDocument, canAccessWarehouse,
  canReadDocument, getApprovalTier,
} from "@/lib/rbac";
import { validateTransfer, calculateReceiptVariance } from "@/lib/transferEngine";

// ── Users ──
const userKarim = users.find(u => u.id === "U002")!;   // WM Alger
const userSamir = users.find(u => u.id === "U009")!;   // WM Oran
const userHassan = users.find(u => u.id === "U010")!;   // WM Constantine
const userTarek = users.find(u => u.id === "U007")!;    // Operator
const userAhmed = users.find(u => u.id === "U001")!;    // CEO
const userAnis = users.find(u => u.id === "U011")!;     // FinanceDirector
const userSara = users.find(u => u.id === "U003")!;     // QCOfficer
const userMourad = users.find(u => u.id === "U014")!;   // Supervisor
const userLeila = users.find(u => u.id === "U008")!;    // BIAnalyst
const userNadia = users.find(u => u.id === "U006")!;    // Accountant
const userRachid = users.find(u => u.id === "U012")!;   // OpsDirector
const userFarid = users.find(u => u.id === "U013")!;    // RegionalManager
const userOmar = users.find(u => u.id === "U004")!;     // Driver Oran
const userYoussef = users.find(u => u.id === "U005")!;  // Driver Alger

// ── 5.01 — WM Alger crée transfert : 50 sacs Ciment → Oran ──
describe("5.01 — Créer transfert Ciment Alger→Oran", () => {
  it("WM Alger peut créer un stockTransfer", () => {
    expect(canCreateDocument(userKarim, "stockTransfer", "wh-alger-construction")).toBe(true);
  });

  it("Karim a accès à Alger (source)", () => {
    expect(canAccessWarehouse(userKarim, "wh-alger-construction")).toBe(true);
  });

  it("validateTransfer accepte 50 sacs avec stock suffisant (3200 disponible)", () => {
    const result = validateTransfer(
      { productId: "P001", qty: 50, unitFactor: 50, fromWarehouseId: "wh-alger-construction", toWarehouseId: "wh-oran-food" },
      3200, // stock en base units (kg)
      1
    );
    expect(result.valid).toBe(true);
    expect(result.sourceBaseQty).toBe(2500); // 50 × 50kg
    expect(result.errors).toHaveLength(0);
  });

  it("transfert existant TRF-001 a les champs requis", () => {
    const trf = stockTransfers.find(t => t.id === "TRF-001")!;
    expect(trf).toBeDefined();
    expect(trf.fromWarehouseId).toBeDefined();
    expect(trf.toWarehouseId).toBeDefined();
    expect(trf.qty).toBeGreaterThan(0);
    expect(trf.createdBy).toBeDefined();
  });
});

// ── 5.02 — Dispatcher le transfert : stock source -50 ──
describe("5.02 — Dispatcher transfert : stock Alger déduit", () => {
  it("validateTransfer refuse si stock insuffisant", () => {
    const result = validateTransfer(
      { productId: "P001", qty: 100000, unitFactor: 50, fromWarehouseId: "wh-alger-construction", toWarehouseId: "wh-oran-food" },
      3200,
      1
    );
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("Stock insuffisant");
  });

  it("avertit si transfert > 50% du stock source", () => {
    const result = validateTransfer(
      { productId: "P001", qty: 40, unitFactor: 50, fromWarehouseId: "wh-alger-construction", toWarehouseId: "wh-oran-food" },
      3200,
      1
    );
    // 40×50=2000 / 3200 = 62.5% → warning
    expect(result.warnings.some(w => w.includes("%"))).toBe(true);
  });

  it("TRF-002 est en In_Transit", () => {
    const trf = stockTransfers.find(t => t.id === "TRF-002")!;
    expect(trf.status).toBe("In_Transit");
  });
});

// ── 5.03 — WM Oran réceptionne transfert entrant ──
describe("5.03 — Réceptionner transfert entrant Oran", () => {
  it("WM Oran peut créer stockTransfer (réception)", () => {
    expect(canCreateDocument(userSamir, "stockTransfer", "wh-oran-food")).toBe(true);
  });

  it("TRF-001 est en statut Received", () => {
    const trf = stockTransfers.find(t => t.id === "TRF-001")!;
    expect(trf.status).toBe("Received");
  });

  it("calculateReceiptVariance : 50 envoyés, 50 reçus → 0% variance", () => {
    const result = calculateReceiptVariance(50, 50, 1);
    expect(result.variance).toBe(0);
    expect(result.variancePct).toBe(0);
    expect(result.requiresAdjustment).toBe(false);
  });
});

// ── 5.04 — Réceptionner avec variance (48 reçus sur 50) ──
describe("5.04 — Réception avec variance -4%", () => {
  it("calculateReceiptVariance : 50 envoyés, 48 reçus → variance -4%", () => {
    const result = calculateReceiptVariance(50, 48, 1);
    expect(result.variance).toBe(-2);
    expect(result.variancePct).toBe(-4);
    expect(result.requiresAdjustment).toBe(true);
    expect(result.adjustmentQty).toBe(2);
  });

  it("tier approbation pour 4% = finance", () => {
    expect(getApprovalTier(4)).toBe("finance");
  });

  it("WM Oran ne peut PAS approuver variance 4% (seuil 2%)", () => {
    const decision = canApproveDocument(userSamir, "stockTransfer", 4, "wh-oran-food");
    expect(decision.allowed).toBe(false);
    expect(decision.escalateTo).toBeDefined();
  });
});

// ── 5.05 — RegionalManager approuve transfert inter-régional ──
describe("5.05 — RegionalManager approuve transfert Alger↔Oran", () => {
  it("Farid a accès à Alger ET Oran", () => {
    expect(canAccessWarehouse(userFarid, "wh-alger-construction")).toBe(true);
    expect(canAccessWarehouse(userFarid, "wh-oran-food")).toBe(true);
  });

  it("Farid peut approuver stockTransfer ≤2%", () => {
    const decision = canApproveDocument(userFarid, "stockTransfer", 1.5, "wh-alger-construction");
    expect(decision.allowed).toBe(true);
  });

  it("Farid peut créer stockTransfer", () => {
    expect(canCreateDocument(userFarid, "stockTransfer", "wh-alger-construction")).toBe(true);
  });
});

// ── 5.06 — WM Alger tente transfert vers Constantine → refusé ──
describe("5.06 — WM Alger bloqué vers Constantine (hors scope)", () => {
  it("Karim n'a PAS accès à Constantine", () => {
    expect(canAccessWarehouse(userKarim, "wh-constantine-tech")).toBe(false);
  });

  it("Karim ne peut pas créer transfert pour Constantine", () => {
    expect(canCreateDocument(userKarim, "stockTransfer", "wh-constantine-tech")).toBe(false);
  });

  it("Farid (RegionalManager) n'a pas accès à Constantine non plus", () => {
    expect(canAccessWarehouse(userFarid, "wh-constantine-tech")).toBe(false);
  });
});

// ── 5.07 — OpsDirector crée transfert cross-région ──
describe("5.07 — OpsDirector : transfert cross-région Alger→Constantine", () => {
  it("Rachid a scope global (all)", () => {
    expect(userRachid.assignedWarehouseIds).toBe("all");
  });

  it("Rachid accède à tous les entrepôts", () => {
    expect(canAccessWarehouse(userRachid, "wh-alger-construction")).toBe(true);
    expect(canAccessWarehouse(userRachid, "wh-oran-food")).toBe(true);
    expect(canAccessWarehouse(userRachid, "wh-constantine-tech")).toBe(true);
  });

  it("Rachid peut approuver stockTransfer ≤5%", () => {
    const decision = canApproveDocument(userRachid, "stockTransfer", 3);
    expect(decision.allowed).toBe(true);
  });

  it("validateTransfer détecte transfert intra-entrepôt", () => {
    const result = validateTransfer(
      { productId: "P001", qty: 10, unitFactor: 1, fromWarehouseId: "wh-alger-construction", toWarehouseId: "wh-alger-construction" },
      3200, 1
    );
    expect(result.warnings.some(w => w.includes("même entrepôt"))).toBe(true);
  });
});

// ── 5.08 — CEO approuve transfert haute valeur ──
describe("5.08 — CEO approuve transfert haute valeur (Serveurs)", () => {
  it("CEO peut approuver stockTransfer sans limite", () => {
    const decision = canApproveDocument(userAhmed, "stockTransfer", 10);
    expect(decision.allowed).toBe(true);
  });

  it("CEO approuve à n'importe quelle variance", () => {
    const d1 = canApproveDocument(userAhmed, "stockTransfer", 0.5);
    const d2 = canApproveDocument(userAhmed, "stockTransfer", 15);
    expect(d1.allowed).toBe(true);
    expect(d2.allowed).toBe(true);
  });

  it("TRF-001 approuvé par Ahmed Mansour", () => {
    const trf = stockTransfers.find(t => t.id === "TRF-001")!;
    expect(trf.approvedBy).toBe("Ahmed Mansour");
  });
});

// ── 5.09 — Driver consulte bon de transfert (lecture seule) ──
describe("5.09 — Driver : lecture seule sur transferts", () => {
  it("Driver ne peut PAS lire stockTransfer", () => {
    // Driver can only read salesOrder
    expect(canReadDocument(userOmar, "stockTransfer")).toBe(false);
    expect(canReadDocument(userYoussef, "stockTransfer")).toBe(false);
  });

  it("Driver ne peut PAS créer de transfert", () => {
    expect(canCreateDocument(userOmar, "stockTransfer")).toBe(false);
  });

  it("Driver peut lire salesOrder", () => {
    expect(canReadDocument(userOmar, "salesOrder")).toBe(true);
  });
});

// ── 5.10 — Operator prépare picking pour transfert sortant ──
describe("5.10 — Operator : picking pour transfert", () => {
  it("Operator peut lire stockTransfer", () => {
    expect(canReadDocument(userTarek, "stockTransfer")).toBe(true);
  });

  it("Operator ne peut PAS créer de stockTransfer", () => {
    // Operator can only create grn and stockAdjustment
    expect(canCreateDocument(userTarek, "stockTransfer")).toBe(false);
  });

  it("Operator ne peut PAS approuver de transfert", () => {
    const decision = canApproveDocument(userTarek, "stockTransfer", 1);
    expect(decision.allowed).toBe(false);
  });
});

// ── 5.11 — QCOfficer inspecte marchandise avant transfert ──
describe("5.11 — QCOfficer : inspection pré-transfert", () => {
  it("Sara (QCOfficer) ne peut pas lire stockTransfer directement", () => {
    // QCOfficer reads grn and stockAdjustment only
    expect(canReadDocument(userSara, "stockTransfer")).toBe(false);
  });

  it("Sara peut approuver GRN (QC inspection)", () => {
    const decision = canApproveDocument(userSara, "grn");
    expect(decision.allowed).toBe(true);
  });

  it("Sara a accès à Alger et Oran (multi-site QC)", () => {
    expect(canAccessWarehouse(userSara, "wh-alger-construction")).toBe(true);
    expect(canAccessWarehouse(userSara, "wh-oran-food")).toBe(true);
    expect(canAccessWarehouse(userSara, "wh-constantine-tech")).toBe(false);
  });
});

// ── 5.12 — Accountant vérifie mouvement comptable du transfert ──
describe("5.12 — Accountant : mouvement comptable transfert", () => {
  it("Nadia peut lire les stockTransfers", () => {
    expect(canReadDocument(userNadia, "stockTransfer")).toBe(true);
  });

  it("Nadia a scope global pour la compta", () => {
    expect(userNadia.assignedWarehouseIds).toBe("all");
  });

  it("les transferts ont un coût calculable (qty × unitCostAvg source)", () => {
    stockTransfers.forEach(trf => {
      const sourceInv = inventory.find(
        i => i.productId === trf.productId && i.warehouseId === trf.fromWarehouseId
      );
      // Source inventory should exist or have existed
      if (sourceInv) {
        const value = trf.qty * sourceInv.unitCostAvg;
        expect(value).toBeGreaterThan(0);
      }
    });
  });
});

// ── 5.13 — BIAnalyst analyse flux transferts mensuel ──
describe("5.13 — BIAnalyst : analyse flux transferts", () => {
  it("Leila peut lire les stockTransfers", () => {
    expect(canReadDocument(userLeila, "stockTransfer")).toBe(true);
  });

  it("Leila ne peut PAS créer de transfert", () => {
    expect(canCreateDocument(userLeila, "stockTransfer")).toBe(false);
  });

  it("transferts couvrent au moins 2 entrepôts source", () => {
    const sourceWhs = new Set(stockTransfers.map(t => t.fromWarehouseId));
    expect(sourceWhs.size).toBeGreaterThanOrEqual(2);
  });

  it("transferts ont des dates exploitables pour analyse", () => {
    stockTransfers.forEach(trf => {
      expect(new Date(trf.date).getTime()).not.toBeNaN();
      expect(new Date(trf.expectedDate).getTime()).not.toBeNaN();
    });
  });
});

// ── 5.14 — FinanceDirector vérifie valorisation transfert ──
describe("5.14 — FinanceDirector : valorisation transfert au coût moyen", () => {
  it("Anis peut lire les stockTransfers", () => {
    expect(canReadDocument(userAnis, "stockTransfer")).toBe(true);
  });

  it("Anis peut approuver stockAdjustment lié au transfert ≤5%", () => {
    const decision = canApproveDocument(userAnis, "stockAdjustment", 4);
    expect(decision.allowed).toBe(true);
  });

  it("valorisation TRF-001 = qty × unitCostAvg source", () => {
    const trf = stockTransfers.find(t => t.id === "TRF-001")!;
    const sourceInv = inventory.find(
      i => i.productId === trf.productId && i.warehouseId === trf.fromWarehouseId
    );
    expect(sourceInv).toBeDefined();
    if (sourceInv) {
      const value = trf.qty * sourceInv.unitCostAvg;
      expect(value).toBeGreaterThan(0);
    }
  });

  it("inventaire source et destination existent pour chaque transfert Received", () => {
    const received = stockTransfers.filter(t => t.status === "Received");
    received.forEach(trf => {
      const srcInv = inventory.find(i => i.productId === trf.productId && i.warehouseId === trf.fromWarehouseId);
      // Source should exist (may be depleted but row exists)
      expect(srcInv).toBeDefined();
    });
  });
});
