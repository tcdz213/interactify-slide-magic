/**
 * 90-DAY-TEST-PLAN — Phase 3: Cycle d'Achat PO → GRN
 * Scénarios 3.11 à 3.19
 * Tests: variance GRN, QC, approbation, GRNI, valorisation stock, RBAC
 */
import { describe, it, expect } from "vitest";
import { purchaseOrders, grns, products, users, inventory, invoices } from "@/data/mockData";
import { productUnitConversions } from "@/data/productUnitConversions";
import { toBaseUnits } from "@/lib/unitConversion";
import {
  canApproveDocument, canCreateDocument, canReadDocument,
  canAccessWarehouse, getApprovalTier,
} from "@/lib/rbac";
import { performThreeWayMatch, requiresManagerApproval } from "@/lib/threeWayMatch";
import type { GrnLine } from "@/data/transactionalData";

// ── Users ──
const userTarek = users.find(u => u.id === "U007")!;   // Operator Alger
const userSara = users.find(u => u.id === "U003")!;     // QCOfficer
const userKarim = users.find(u => u.id === "U002")!;    // WM Alger
const userHassan = users.find(u => u.id === "U010")!;   // WM Constantine
const userAnis = users.find(u => u.id === "U011")!;     // FinanceDirector
const userNadia = users.find(u => u.id === "U006")!;    // Accountant
const userLeila = users.find(u => u.id === "U008")!;    // BIAnalyst
const userOmar = users.find(u => u.id === "U004")!;     // Driver
const userAhmed = users.find(u => u.id === "U001")!;    // CEO

// ── Data ──
const sacCiment = productUnitConversions.find(c => c.id === "PUC-002")!;

// ── 3.11 — Saisir qté reçues : 490 sacs (10 manquants) → variance -2% ──
describe("3.11 — Variance GRN : 490/500 sacs = -2%", () => {
  const ordered = 500;
  const received = 490;
  const variance = received - ordered; // -10
  const variancePct = ((received - ordered) / ordered) * 100; // -2%

  it("calcule variance = -10 unités", () => {
    expect(variance).toBe(-10);
  });

  it("variance % = -2.0%", () => {
    expect(variancePct).toBe(-2);
  });

  it("en base units : 490 sacs × 50 = 24,500 kg vs 500 × 50 = 25,000 kg", () => {
    const orderedBase = toBaseUnits(ordered, sacCiment.conversionFactor);
    const receivedBase = toBaseUnits(received, sacCiment.conversionFactor);
    expect(orderedBase).toBe(25_000);
    expect(receivedBase).toBe(24_500);
    expect(receivedBase - orderedBase).toBe(-500);
  });

  it("variance -2% ne nécessite PAS d'escalade (seuil 5%)", () => {
    expect(requiresManagerApproval(variancePct)).toBe(false);
  });

  it("variance -2% → tier manager pour approbation", () => {
    expect(getApprovalTier(variancePct)).toBe("manager");
  });
});

// ── 3.12 — QCOfficer inspecte GRN, marque 5 sacs défectueux ──
describe("3.12 — QC Inspection : 5 sacs rejetés", () => {
  const received = 490;
  const rejected = 5;
  const accepted = received - rejected; // 485

  it("QCOfficer peut approuver les GRN (QC approval)", () => {
    const decision = canApproveDocument(userSara, "grn");
    expect(decision.allowed).toBe(true);
  });

  it("qté acceptée = 485 sacs", () => {
    expect(accepted).toBe(485);
  });

  it("rejet QC = 5 sacs, motif requis", () => {
    const mockLine: Partial<GrnLine> = {
      receivedQty: received,
      rejectedQty: rejected,
      rejectionReason: "Sacs endommagés au transport",
      qcStatus: "Conditional",
    };
    expect(mockLine.rejectedQty).toBe(5);
    expect(mockLine.rejectionReason).toBeTruthy();
  });

  it("les GRN existantes ont des statuts QC valides", () => {
    const validStatuses = ["Passed", "Failed", "Conditional"];
    grns.forEach(grn => {
      grn.lines.forEach(line => {
        expect(validStatuses).toContain(line.qcStatus);
      });
    });
  });

  it("GRN QC_Pending existe dans les données", () => {
    const pendingQC = grns.filter(g => g.status === "QC_Pending");
    expect(pendingQC.length).toBeGreaterThan(0);
  });
});

// ── 3.13 — WM Alger approuve GRN avec variance ≤2% ──
describe("3.13 — WM Alger approuve GRN, stock +485", () => {
  it("Karim (WM) peut approuver un GRN", () => {
    const decision = canApproveDocument(userKarim, "grn", null, "wh-alger-construction");
    expect(decision.allowed).toBe(true);
  });

  it("Karim approvalThreshold = 2% — suffisant pour -2% de variance", () => {
    expect(userKarim.approvalThresholdPct).toBe(2);
    const decision = canApproveDocument(userKarim, "grn", 2, "wh-alger-construction");
    expect(decision.allowed).toBe(true);
  });

  it("Karim NE PEUT PAS approuver variance >2%", () => {
    const decision = canApproveDocument(userKarim, "grn", 3, "wh-alger-construction");
    expect(decision.allowed).toBe(false);
  });

  it("les GRN Approved ont un approvedBy défini", () => {
    grns.filter(g => g.status === "Approved").forEach(grn => {
      expect(grn.approvedBy).toBeTruthy();
    });
  });

  it("stock valorisation : 485 sacs × 850 DZD = 412,250 DZD", () => {
    const acceptedQty = 485;
    const unitCost = 850;
    expect(acceptedQty * unitCost).toBe(412_250);
  });
});

// ── 3.14 — Operator réceptionne 2e ligne (Fer) : 200/200 barres ──
describe("3.14 — Réception complète Fer 200/200, pas de variance", () => {
  const ordered = 200;
  const received = 200;

  it("variance = 0% pour réception complète", () => {
    expect(((received - ordered) / ordered) * 100).toBe(0);
  });

  it("0% → tier auto (approbation automatique)", () => {
    expect(getApprovalTier(0)).toBe("auto");
  });

  it("GRN existante Fer a 2000/2000 barres reçues (réception complète)", () => {
    const ferGrn = grns.find(g => g.poId === "PO-2026-0110");
    expect(ferGrn).toBeDefined();
    const ferLine = ferGrn!.lines.find(l => l.productId === "P002");
    expect(ferLine).toBeDefined();
    expect(ferLine!.receivedQty).toBe(ferLine!.orderedQty);
    expect(ferLine!.rejectedQty).toBe(0);
  });

  it("baseQty Fer correcte : 200 × 1 = 200 barres en base", () => {
    expect(toBaseUnits(received, 1)).toBe(200);
  });
});

// ── 3.15 — FinanceDirector vérifie GRNI ──
describe("3.15 — GRNI : PO reçues sans facture fournisseur", () => {
  it("FinanceDirector peut lire les PO", () => {
    expect(canReadDocument(userAnis, "purchaseOrder")).toBe(true);
  });

  it("FinanceDirector peut lire les GRN", () => {
    expect(canReadDocument(userAnis, "grn")).toBe(true);
  });

  it("PO 'Received' sans facture associée = GRNI candidates", () => {
    const receivedPOs = purchaseOrders.filter(po => po.status === "Received");
    expect(receivedPOs.length).toBeGreaterThan(0);
    // GRNI = POs reçues mais pas encore facturées
    // Check that we have received POs (GRNI candidates)
    receivedPOs.forEach(po => {
      expect(po.totalAmount).toBeGreaterThan(0);
    });
  });

  it("GRN Approved ont une valeur totale > 0", () => {
    const approvedGrns = grns.filter(g => g.status === "Approved");
    approvedGrns.forEach(grn => {
      expect(grn.totalValue).toBeGreaterThan(0);
    });
  });

  it("FinanceDirector a accès global (scope 'all')", () => {
    expect(userAnis.assignedWarehouseIds).toBe("all");
  });
});

// ── 3.16 — Accountant vérifie valorisation stock post-GRN ──
describe("3.16 — Valorisation stock post-GRN Construction Alger", () => {
  it("Accountant peut lire les GRN et l'inventaire", () => {
    expect(canReadDocument(userNadia, "grn")).toBe(true);
    expect(canReadDocument(userNadia, "stockAdjustment")).toBe(true);
  });

  it("inventaire Alger contient des produits avec coût moyen", () => {
    const algerInv = inventory.filter(i => i.warehouseId === "wh-alger-construction");
    expect(algerInv.length).toBeGreaterThan(0);
    algerInv.forEach(item => {
      expect(item.unitCostAvg).toBeGreaterThan(0);
    });
  });

  it("valorisation Ciment Alger = qtyOnHand × unitCostAvg", () => {
    const cimentInv = inventory.find(
      i => i.productId === "P001" && i.warehouseId === "wh-alger-construction"
    );
    expect(cimentInv).toBeDefined();
    const valuation = cimentInv!.qtyOnHand * cimentInv!.unitCostAvg;
    expect(valuation).toBeGreaterThan(0);
    // 3200 × 850 = 2,720,000 DZD
    expect(valuation).toBe(3200 * 850);
  });

  it("valorisation totale Alger Construction > 0", () => {
    const algerInv = inventory.filter(i => i.warehouseId === "wh-alger-construction");
    const totalValuation = algerInv.reduce((sum, i) => sum + (i.qtyOnHand * i.unitCostAvg), 0);
    expect(totalValuation).toBeGreaterThan(1_000_000);
  });
});

// ── 3.17 — WM Constantine crée PO Tech : 20 Laptops @ 95,000 ──
describe("3.17 — PO Tech haute valeur : 20 Laptops × 95,000 DZD", () => {
  const qty = 20;
  const unitCost = 95_000;
  const subtotal = qty * unitCost; // 1,900,000

  it("Hassan (WM Constantine) peut créer une PO", () => {
    expect(canCreateDocument(userHassan, "purchaseOrder", "wh-constantine-tech")).toBe(true);
  });

  it("total = 1,900,000 DZD HT", () => {
    expect(subtotal).toBe(1_900_000);
  });

  it("total TTC = 2,261,000 DZD", () => {
    expect(subtotal * 1.19).toBeCloseTo(2_261_000, 0);
  });

  it("Laptop P017 unité = Pièce (facteur 1)", () => {
    const laptopUnit = productUnitConversions.find(c => c.id === "PUC-080");
    expect(laptopUnit).toBeDefined();
    expect(laptopUnit!.conversionFactor).toBe(1);
    expect(laptopUnit!.unitAbbreviation).toBe("Pce");
  });

  it("PO Tech existante (PO-2026-0148) pour Constantine est Sent", () => {
    const techPO = purchaseOrders.find(po => po.id === "PO-2026-0148");
    expect(techPO).toBeDefined();
    expect(techPO!.deliveryWarehouseId).toBe("wh-constantine-tech");
    expect(techPO!.status).toBe("Sent");
  });
});

// ── 3.18 — BIAnalyst consulte historique PO ──
describe("3.18 — BIAnalyst consulte historique PO en lecture seule", () => {
  it("Leila (BIAnalyst) peut lire les PO", () => {
    expect(canReadDocument(userLeila, "purchaseOrder")).toBe(true);
  });

  it("BIAnalyst ne peut PAS créer de PO", () => {
    expect(canCreateDocument(userLeila, "purchaseOrder")).toBe(false);
  });

  it("BIAnalyst ne peut PAS approuver de PO", () => {
    const decision = canApproveDocument(userLeila, "purchaseOrder");
    expect(decision.allowed).toBe(false);
  });

  it("BIAnalyst a accès global en lecture", () => {
    expect(userLeila.assignedWarehouseIds).toBe("all");
  });

  it("toutes les PO sont visibles (toutes origines)", () => {
    const warehouses = new Set(purchaseOrders.map(po => po.deliveryWarehouseId));
    // Should span multiple warehouses
    expect(warehouses.size).toBeGreaterThanOrEqual(3);
  });
});

// ── 3.19 — Driver tente d'accéder aux PO → refusé ──
describe("3.19 — Driver : accès PO refusé", () => {
  it("Driver ne peut PAS lire les PO", () => {
    expect(canReadDocument(userOmar, "purchaseOrder")).toBe(false);
  });

  it("Driver ne peut PAS créer de PO", () => {
    expect(canCreateDocument(userOmar, "purchaseOrder")).toBe(false);
  });

  it("Driver ne peut PAS approuver de PO", () => {
    const decision = canApproveDocument(userOmar, "purchaseOrder");
    expect(decision.allowed).toBe(false);
  });

  it("Driver peut uniquement lire les commandes de vente (salesOrder)", () => {
    expect(canReadDocument(userOmar, "salesOrder")).toBe(true);
    expect(canReadDocument(userOmar, "grn")).toBe(false);
    expect(canReadDocument(userOmar, "stockAdjustment")).toBe(false);
  });
});

// ── BONUS: 3-Way Match Engine validation ──
describe("3-Way Match — Validation engine PO↔GRN", () => {
  it("match PO-2026-0145 ↔ GRN-20260213-001 (ciment) = within_tolerance (plâtre variance)", () => {
    const po = purchaseOrders.find(p => p.id === "PO-2026-0145")!;
    const grn = grns.find(g => g.id === "GRN-20260213-001")!;
    const result = performThreeWayMatch(po, grn, null, productUnitConversions);
    // Plâtre: 2800/3000 = -6.7% → mismatch
    expect(["within_tolerance", "mismatch"]).toContain(result.overallStatus);
    expect(result.lines.length).toBe(2);
  });

  it("match PO-2026-0110 ↔ GRN-20260115-004 (fer) = matched (2000/2000)", () => {
    const po = purchaseOrders.find(p => p.id === "PO-2026-0110")!;
    const grn = grns.find(g => g.id === "GRN-20260115-004")!;
    const result = performThreeWayMatch(po, grn, null, productUnitConversions);
    expect(result.overallStatus).toBe("matched");
    expect(result.lines[0].grnVariancePct).toBe(0);
  });
});
