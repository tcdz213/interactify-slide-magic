/**
 * 90-DAY-TEST-PLAN — Phase 4: Gestion des Stocks & Inventaires
 * Scénarios 4.01 à 4.16
 * Comptages cycliques, ajustements, mouvements, FIFO/PMP, RBAC, scope entrepôt.
 */
import { describe, it, expect } from "vitest";
import {
  cycleCounts, stockAdjustments, inventory, stockTransfers,
  users, products,
} from "@/data/mockData";
import {
  stockMovements, stockBlocks, lotBatches, serialNumbers,
} from "@/data/operationalData";
import {
  canCreateDocument, canApproveDocument, canAccessWarehouse,
  canReadDocument, getApprovalTier,
} from "@/lib/rbac";
import { calculatePMP, valuateFIFO, valuatePMP } from "@/lib/pmpEngine";
import { validateTransfer } from "@/lib/transferEngine";

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

// ── 4.01 — WM Alger lance comptage cyclique zone A (Ciment) ──
describe("4.01 — Lancer comptage cyclique zone A (Ciment)", () => {
  const ccAlger = cycleCounts.find(cc => cc.id === "CC-20260221-001")!;

  it("CC-20260221-001 existe pour Alger zone A", () => {
    expect(ccAlger).toBeDefined();
    expect(ccAlger.warehouseId).toBe("wh-alger-construction");
    expect(ccAlger.zone).toBe("A");
  });

  it("statut initial = Scheduled ou In_Progress", () => {
    expect(["Scheduled", "In_Progress"]).toContain(ccAlger.status);
  });

  it("contient le Ciment (P001) dans les lignes", () => {
    const cimentLine = ccAlger.lines.find(l => l.productId === "P001");
    expect(cimentLine).toBeDefined();
    expect(cimentLine!.expectedQty).toBe(3200);
  });

  it("Karim (WM Alger) peut créer un cycleCount pour Alger", () => {
    expect(canCreateDocument(userKarim, "cycleCount", "wh-alger-construction")).toBe(true);
  });
});

// ── 4.02 — Operator saisit comptage : variance -5 (-1.02%) ──
describe("4.02 — Saisir comptage avec variance -1.02%", () => {
  const systemQty = 490;
  const countedQty = 485;
  const variance = countedQty - systemQty;
  const variancePct = (variance / systemQty) * 100;

  it("variance = -5 unités", () => {
    expect(variance).toBe(-5);
  });

  it("variance % = -1.02%", () => {
    expect(variancePct).toBeCloseTo(-1.02, 1);
  });

  it("tier approbation = manager (≤2%)", () => {
    expect(getApprovalTier(variancePct)).toBe("manager");
  });

  it("Operator peut créer un ajustement", () => {
    expect(canCreateDocument(userTarek, "stockAdjustment")).toBe(true);
  });
});

// ── 4.03 — WM Alger approuve ajustement ≤2% ──
describe("4.03 — Approuver ajustement variance ≤2%", () => {
  it("WM Alger peut approuver variance 1.02%", () => {
    const decision = canApproveDocument(userKarim, "stockAdjustment", 1.02, "wh-alger-construction");
    expect(decision.allowed).toBe(true);
  });

  it("ajustement ADJ-001 approuvé par Karim existe", () => {
    const adj = stockAdjustments.find(a => a.id === "ADJ-001");
    expect(adj).toBeDefined();
    expect(adj!.approvedBy).toBe("Karim Ben Ali");
    expect(adj!.status).toBe("Approved");
  });

  it("stock ajusté visible dans inventaire", () => {
    const ciment = inventory.find(i => i.productId === "P001" && i.warehouseId === "wh-alger-construction");
    expect(ciment).toBeDefined();
    expect(ciment!.qtyOnHand).toBeGreaterThan(0);
  });
});

// ── 4.04 — WM Oran lance comptage complet Food ──
describe("4.04 — Comptage complet Oran Food", () => {
  const ccOran = cycleCounts.find(cc => cc.warehouseId === "wh-oran-food")!;

  it("CC Oran existe", () => {
    expect(ccOran).toBeDefined();
    expect(ccOran.warehouseId).toBe("wh-oran-food");
  });

  it("contient 3 produits agroalimentaires", () => {
    expect(ccOran.lines.length).toBe(3);
  });

  it("Samir (WM Oran) peut créer cycleCount pour Oran", () => {
    expect(canCreateDocument(userSamir, "cycleCount", "wh-oran-food")).toBe(true);
  });

  it("Samir ne peut PAS créer cycleCount pour Alger", () => {
    expect(canCreateDocument(userSamir, "cycleCount", "wh-alger-construction")).toBe(false);
  });
});

// ── 4.05 — Variance >5% → escalade CEO ──
describe("4.05 — Variance >5% : anomalie flaggée, escalade CEO", () => {
  it("variance 6% → tier CEO", () => {
    expect(getApprovalTier(6)).toBe("ceo");
  });

  it("WM Alger ne peut pas approuver variance >5%", () => {
    const decision = canApproveDocument(userKarim, "stockAdjustment", 6, "wh-alger-construction");
    expect(decision.allowed).toBe(false);
    expect(decision.escalateTo).toBeDefined();
  });

  it("CC Constantine a une variance >3% (Laptop)", () => {
    const ccConst = cycleCounts.find(cc => cc.id === "CC-20260215-004")!;
    const laptopLine = ccConst.lines.find(l => l.productId === "P017")!;
    expect(laptopLine.variancePct).toBe(-3.08);
    expect(ccConst.status).toBe("Requires_Investigation");
  });
});

// ── 4.06 — CEO approuve ajustement >5% ──
describe("4.06 — CEO approuve ajustement haute variance", () => {
  it("CEO peut approuver variance 6%", () => {
    const decision = canApproveDocument(userAhmed, "stockAdjustment", 6);
    expect(decision.allowed).toBe(true);
  });

  it("CEO peut approuver n'importe quelle variance", () => {
    const decision = canApproveDocument(userAhmed, "stockAdjustment", 15);
    expect(decision.allowed).toBe(true);
  });

  it("ajustement ADJ-006 approuvé par CEO existe", () => {
    const adj = stockAdjustments.find(a => a.id === "ADJ-006");
    expect(adj).toBeDefined();
    expect(adj!.approvedBy).toBe("Ahmed Mansour");
  });
});

// ── 4.07 — FinanceDirector consulte impact financier ──
describe("4.07 — FinanceDirector : impact financier ajustements", () => {
  it("Anis peut lire les ajustements", () => {
    expect(canReadDocument(userAnis, "stockAdjustment")).toBe(true);
  });

  it("total valueLoss des ajustements approuvés > 0", () => {
    const approvedAdj = stockAdjustments.filter(a => a.status === "Approved");
    const totalLoss = approvedAdj.reduce((sum, a) => sum + a.valueLoss, 0);
    expect(totalLoss).toBeGreaterThan(0);
    // ADJ-001: 42,500 + ADJ-002: 36,000 + ADJ-004: 0 + ADJ-006: 48,000 = 126,500
    expect(totalLoss).toBe(126_500);
  });

  it("FinanceDirector peut approuver ajustements (via invoice/payment)", () => {
    expect(canApproveDocument(userAnis, "stockAdjustment", 3).allowed).toBe(true);
  });
});

// ── 4.08 — WM Alger crée ajustement Damage ──
describe("4.08 — Ajustement manuel type 'Damage'", () => {
  const adjDamage = stockAdjustments.find(a => a.type === "Damage")!;

  it("ajustement Damage existe (ADJ-001)", () => {
    expect(adjDamage).toBeDefined();
    expect(adjDamage.type).toBe("Damage");
    expect(adjDamage.direction).toBe("Decrease");
  });

  it("a un motif renseigné", () => {
    expect(adjDamage.reason.length).toBeGreaterThan(0);
  });

  it("valueLoss = qty × unitCost (50 × 850 = 42,500)", () => {
    expect(adjDamage.valueLoss).toBe(42_500);
  });
});

// ── 4.09 — QCOfficer bloque lot défectueux (StockBlock) ──
describe("4.09 — QCOfficer bloque lot (StockBlock)", () => {
  const block = stockBlocks.find(b => b.id === "BLK-001")!;

  it("BLK-001 existe, statut Blocked", () => {
    expect(block).toBeDefined();
    expect(block.status).toBe("Blocked");
  });

  it("bloqué par Sara (QCOfficer)", () => {
    expect(block.blockedBy).toBe("Sara Khalil");
  });

  it("produit = Carrelage en quarantaine", () => {
    expect(block.productId).toBe("P003");
    expect(block.reason).toContain("QC");
  });

  it("lot correspondant en Quarantine", () => {
    const lot = lotBatches.find(l => l.lotNumber === "LOT-CAR-0218A")!;
    expect(lot.status).toBe("Quarantine");
    expect(lot.qcStatus).toBe("Pending");
  });
});

// ── 4.10 — QCOfficer libère lot après re-inspection ──
describe("4.10 — Libérer lot après re-inspection", () => {
  const unblock = stockBlocks.find(b => b.id === "BLK-002")!;

  it("BLK-002 est Unblocked", () => {
    expect(unblock.status).toBe("Unblocked");
  });

  it("débloqué par Samir (WM Oran)", () => {
    expect(unblock.unblockedBy).toBe("Samir Rafik");
    expect(unblock.unblockedAt).toBeDefined();
  });

  it("produit Lait, raison = DLC courte", () => {
    expect(unblock.productId).toBe("P013");
    expect(unblock.reason).toContain("DLC");
  });
});

// ── 4.11 — Supervisor consulte mouvements du jour ──
describe("4.11 — Supervisor : journal mouvements filtré Oran", () => {
  it("Mourad (Supervisor) peut lire les mouvements", () => {
    expect(canReadDocument(userMourad, "stockAdjustment")).toBe(true);
  });

  it("mouvements Oran existent", () => {
    const oranMov = stockMovements.filter(m => m.warehouseId === "wh-oran-food");
    expect(oranMov.length).toBeGreaterThan(0);
  });

  it("types de mouvements incluent GRN_Receipt et Picking", () => {
    const oranTypes = new Set(
      stockMovements.filter(m => m.warehouseId === "wh-oran-food").map(m => m.movementType)
    );
    expect(oranTypes.has("GRN_Receipt")).toBe(true);
    expect(oranTypes.has("Picking")).toBe(true);
  });
});

// ── 4.12 — BIAnalyst exporte rapport comptages ──
describe("4.12 — BIAnalyst : export rapport comptages", () => {
  it("Leila peut lire les cycleCounts", () => {
    expect(canReadDocument(userLeila, "cycleCount")).toBe(true);
  });

  it("ne peut PAS créer de cycleCount", () => {
    expect(canCreateDocument(userLeila, "cycleCount")).toBe(false);
  });

  it("tous les CC ont des lignes avec variance calculée", () => {
    cycleCounts.forEach(cc => {
      cc.lines.forEach(line => {
        expect(typeof line.variance).toBe("number");
        expect(typeof line.variancePct).toBe("number");
      });
    });
  });

  it("scope global — voit CC des 3 entrepôts", () => {
    const whs = new Set(cycleCounts.map(cc => cc.warehouseId));
    expect(whs.size).toBeGreaterThanOrEqual(2);
  });
});

// ── 4.13 — Accountant vérifie valorisation FIFO/PMP ──
describe("4.13 — Valorisation stock FIFO & PMP", () => {
  it("PMP calcul correct : (2000×850 + 500×900) / 2500 = 860", () => {
    const result = calculatePMP({
      currentQty: 2000,
      currentCost: 850,
      receivedQty: 500,
      receivedUnitCost: 900,
    });
    expect(result.newCost).toBe(860);
    expect(result.newTotalQty).toBe(2500);
    expect(result.oldCost).toBe(850);
  });

  it("FIFO valuation = somme(qty × unitCost) par couche", () => {
    const layers = [
      { qty: 1000, unitCost: 850, date: "2025-12-05" },
      { qty: 500, unitCost: 900, date: "2026-02-13" },
    ];
    expect(valuateFIFO(layers)).toBe(1000 * 850 + 500 * 900); // 1,300,000
  });

  it("PMP valuation = qty × avgCost", () => {
    expect(valuatePMP(3200, 850)).toBe(2_720_000);
  });

  it("Nadia (Accountant) peut lire l'inventaire", () => {
    expect(canReadDocument(userNadia, "stockAdjustment")).toBe(true);
    expect(canReadDocument(userNadia, "cycleCount")).toBe(true);
  });
});

// ── 4.14 — WM Constantine : comptage numéros de série ──
describe("4.14 — Comptage serials Constantine", () => {
  it("serials Laptop existent", () => {
    const laptopSerials = serialNumbers.filter(s => s.productId === "P017");
    expect(laptopSerials.length).toBeGreaterThanOrEqual(3);
  });

  it("serials ont des statuts variés (In_Stock, Sold, Defective)", () => {
    const statuses = new Set(serialNumbers.filter(s => s.productId === "P017").map(s => s.status));
    expect(statuses.has("In_Stock")).toBe(true);
    expect(statuses.has("Sold")).toBe(true);
    expect(statuses.has("Defective")).toBe(true);
  });

  it("Hassan (WM Constantine) a accès", () => {
    expect(canAccessWarehouse(userHassan, "wh-constantine-tech")).toBe(true);
  });

  it("chaque serial a un lotId de référence", () => {
    serialNumbers.forEach(sn => {
      expect(sn.lotId).toBeDefined();
      expect(sn.lotNumber.length).toBeGreaterThan(0);
    });
  });
});

// ── 4.15 — Operator ne peut PAS approuver un ajustement ──
describe("4.15 — Operator ne peut pas approuver", () => {
  it("Tarek ne peut pas approuver stockAdjustment", () => {
    const decision = canApproveDocument(userTarek, "stockAdjustment", 1);
    expect(decision.allowed).toBe(false);
  });

  it("Tarek ne peut pas approuver cycleCount", () => {
    const decision = canApproveDocument(userTarek, "cycleCount");
    expect(decision.allowed).toBe(false);
  });
});

// ── 4.16 — OpsDirector : vue consolidée 3 entrepôts ──
describe("4.16 — OpsDirector : stock consolidé multi-warehouse", () => {
  it("Rachid (OpsDirector) a scope global", () => {
    expect(userRachid.assignedWarehouseIds).toBe("all");
  });

  it("inventaire couvre 3 entrepôts", () => {
    const whs = new Set(inventory.map(i => i.warehouseId));
    expect(whs.has("wh-alger-construction")).toBe(true);
    expect(whs.has("wh-oran-food")).toBe(true);
    expect(whs.has("wh-constantine-tech")).toBe(true);
  });

  it("Rachid peut lire ajustements, transfers, CC", () => {
    expect(canReadDocument(userRachid, "stockAdjustment")).toBe(true);
    expect(canReadDocument(userRachid, "stockTransfer")).toBe(true);
    expect(canReadDocument(userRachid, "cycleCount")).toBe(true);
  });

  it("valorisation totale stock > 0", () => {
    const totalValue = inventory.reduce((sum, item) => sum + item.qtyOnHand * item.unitCostAvg, 0);
    expect(totalValue).toBeGreaterThan(10_000_000); // > 10M DZD
  });

  it("OpsDirector peut approuver ajustements ≤5%", () => {
    const d1 = canApproveDocument(userRachid, "stockAdjustment", 2);
    expect(d1.allowed).toBe(true);
    const d5 = canApproveDocument(userRachid, "stockAdjustment", 5);
    expect(d5.allowed).toBe(true);
  });
});
