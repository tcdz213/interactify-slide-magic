/**
 * Test d'intégration E2E : Flux complet PO → GRN → Stock
 *
 * Scénarios couverts :
 *   1. Création PO avec conversion d'unités
 *   2. Réception GRN liée à la PO (avec rejets partiels)
 *   3. Transition de statut PO (Draft → Sent → Received)
 *   4. Validation 3-Way Match (PO vs GRN)
 *   5. Calcul PMP (Prix Moyen Pondéré) après réception
 *   6. Création mouvements de stock (GRN_Receipt)
 *   7. QC Inspection liée au GRN
 *   8. Putaway après validation QC
 *   9. FIFO allocation depuis le stock reçu
 *  10. RBAC — séparation des responsabilités tout au long du flux
 */
import { describe, it, expect } from "vitest";

// ── Data ──
import { purchaseOrders, grns } from "@/data/transactionalData";
import { qcInspections, putawayTasks, stockMovements } from "@/data/operationalData";
import { products, users } from "@/data/mockData";
import { productUnitConversions } from "@/data/productUnitConversions";

// ── Engines ──
import { toBaseUnits } from "@/lib/unitConversion";
import { calculatePMP, valuatePMP, valuateFIFO, type FIFOLayer } from "@/lib/pmpEngine";
import { allocateFIFO } from "@/lib/fifoEngine";
import { performThreeWayMatch } from "@/lib/threeWayMatch";
import { canCreateDocument, canApproveDocument, canAccessWarehouse } from "@/lib/rbac";

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO A — Ciment Alger : flux complet PO → GRN → Stock → Vente FIFO
// ═══════════════════════════════════════════════════════════════════════════

describe("E2E — Scénario A : Ciment Alger (réception complète)", () => {
  // Pick a real PO/GRN pair from mock data
  const po = purchaseOrders.find(p => p.id === "PO-2026-0151")!;
  const grn = grns.find(g => g.poId === po.id)!;
  const poLine = po.lines[0];
  const grnLine = grn.lines[0];
  const cimentConv = productUnitConversions.find(c => c.id === "PUC-002")!;
  const userKarim = users.find(u => u.id === "U002")!;   // WM Alger
  const userTarek = users.find(u => u.id === "U007")!;   // Operator
  const userAhmed = users.find(u => u.id === "U001")!;   // CEO

  // ── Étape 1 : PO valide ──
  describe("Étape 1 — PO création et validation", () => {
    it("PO existe et est liée au bon fournisseur", () => {
      expect(po).toBeDefined();
      expect(po.vendorName).toBe("GICA Cimenterie");
      expect(po.deliveryWarehouseId).toBe("wh-alger-construction");
    });

    it("ligne PO : 6000 sacs × 850 DZD = 5,100,000 DZD", () => {
      expect(poLine.qty).toBe(6000);
      expect(poLine.unitCost).toBe(850);
      expect(poLine.lineTotal).toBe(5_100_000);
    });

    it("conversion unité : 6000 sacs × 50 kg = 300,000 kg base", () => {
      expect(poLine.conversionFactor).toBe(cimentConv.conversionFactor);
      expect(toBaseUnits(poLine.qty, poLine.conversionFactor!)).toBe(300_000);
      expect(poLine.baseQty).toBe(300_000);
    });

    it("RBAC — WM Alger peut créer la PO pour son entrepôt", () => {
      expect(canCreateDocument(userKarim, "purchaseOrder", "wh-alger-construction")).toBe(true);
    });

    it("RBAC — CEO a approuvé la PO", () => {
      expect(po.approvedBy).toBe("Ahmed Mansour");
      const decision = canApproveDocument(userAhmed, "purchaseOrder", 0);
      expect(decision.allowed).toBe(true);
    });

    it("statut PO = Received (cycle complet)", () => {
      expect(po.status).toBe("Received");
    });
  });

  // ── Étape 2 : GRN réception ──
  describe("Étape 2 — GRN réception liée à la PO", () => {
    it("GRN existe et référence la bonne PO", () => {
      expect(grn).toBeDefined();
      expect(grn.poId).toBe(po.id);
      expect(grn.vendorName).toBe(po.vendorName);
    });

    it("réception complète : receivedQty = orderedQty = 6000", () => {
      expect(grnLine.orderedQty).toBe(6000);
      expect(grnLine.receivedQty).toBe(6000);
      expect(grnLine.rejectedQty).toBe(0);
    });

    it("baseQty GRN = receivedQty × conversionFactor", () => {
      expect(grnLine.baseQty).toBe(grnLine.receivedQty * grnLine.conversionFactor!);
    });

    it("GRN contient un lot traçable", () => {
      expect(grnLine.batchNumber).toBeDefined();
      expect(grnLine.batchNumber).toMatch(/^LOT-/);
      expect(grnLine.expiryDate).toBeDefined();
    });

    it("RBAC — Operator a réceptionné le GRN", () => {
      expect(grn.receivedBy).toBe("Tarek Daoui");
      expect(canCreateDocument(userTarek, "grn")).toBe(true);
    });

    it("statut GRN = Approved", () => {
      expect(grn.status).toBe("Approved");
    });
  });

  // ── Étape 3 : 3-Way Match PO vs GRN ──
  describe("Étape 3 — 3-Way Match (PO vs GRN, sans facture)", () => {
    const matchResult = performThreeWayMatch(
      { id: po.id, taxAmount: po.taxAmount, lines: po.lines.map(l => ({ productId: l.productId, productName: l.productName, qty: l.qty, unitAbbr: l.unitAbbr, conversionFactor: l.conversionFactor, unitCost: l.unitCost, lineTotal: l.lineTotal })) },
      { id: grn.id, lines: grn.lines.map(l => ({ productId: l.productId, productName: l.productName, orderedQty: l.orderedQty, receivedQty: l.receivedQty, rejectedQty: l.rejectedQty, unitAbbr: l.unitAbbr, conversionFactor: l.conversionFactor })) },
      null,
      productUnitConversions,
    );

    it("match global = matched (aucun écart)", () => {
      expect(matchResult.overallStatus).toBe("matched");
    });

    it("qté base PO = qté base GRN = 300,000 kg", () => {
      expect(matchResult.totalPoBase).toBe(300_000);
      expect(matchResult.totalGrnBase).toBe(300_000);
    });

    it("aucune issue détectée", () => {
      matchResult.lines.forEach(line => {
        expect(line.status).toBe("matched");
        expect(line.grnVariancePct).toBe(0);
      });
    });
  });

  // ── Étape 4 : PMP après réception ──
  describe("Étape 4 — Calcul PMP (Prix Moyen Pondéré)", () => {
    // Simulate: stock existant 5000 sacs @ 840, réception 6000 @ 850
    const pmpResult = calculatePMP({
      currentQty: 5000,
      currentCost: 840,
      receivedQty: 6000,
      receivedUnitCost: 850,
    });

    it("nouveau PMP = (5000×840 + 6000×850) / 11000 ≈ 845", () => {
      expect(pmpResult.newCost).toBe(845);
      expect(pmpResult.newTotalQty).toBe(11_000);
    });

    it("ancien coût conservé pour audit", () => {
      expect(pmpResult.oldCost).toBe(840);
    });

    it("valorisation PMP cohérente", () => {
      const valuation = valuatePMP(pmpResult.newTotalQty, pmpResult.newCost);
      expect(valuation).toBe(11_000 * 845);
    });

    it("valorisation FIFO à partir des couches", () => {
      const layers: FIFOLayer[] = [
        { qty: 5000, unitCost: 840, date: "2026-02-13" },
        { qty: 6000, unitCost: 850, date: "2026-03-06" },
      ];
      const fifoVal = valuateFIFO(layers);
      expect(fifoVal).toBe(5000 * 840 + 6000 * 850);
    });
  });

  // ── Étape 5 : QC + Putaway + Mouvement de stock ──
  describe("Étape 5 — QC, Putaway et mouvement de stock", () => {
    const qc = qcInspections.find(q => q.grnId === grn.id);
    const putaway = putawayTasks.find(p => p.grnId === grn.id);
    const movement = stockMovements.find(m => m.referenceId === grn.id && m.movementType === "GRN_Receipt");

    it("inspection QC créée et liée au GRN", () => {
      expect(qc).toBeDefined();
      expect(qc!.grnId).toBe(grn.id);
      expect(qc!.overallResult).toBe("Passed");
    });

    it("tâche de rangement (putaway) créée", () => {
      expect(putaway).toBeDefined();
      expect(putaway!.grnId).toBe(grn.id);
      expect(putaway!.productId).toBe("P001");
      expect(putaway!.status).toBe("Completed");
    });

    it("mouvement de stock GRN_Receipt enregistré", () => {
      expect(movement).toBeDefined();
      expect(movement!.productId).toBe("P001");
      expect(movement!.direction).toBe("In");
      expect(movement!.warehouseId).toBe("wh-alger-construction");
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO B — Laptops Constantine : réception partielle + rejets
// ═══════════════════════════════════════════════════════════════════════════

describe("E2E — Scénario B : Laptops Constantine (réception partielle + rejets)", () => {
  const po = purchaseOrders.find(p => p.id === "PO-2026-0152")!;
  const grn = grns.find(g => g.poId === po.id)!;
  const laptopPOLine = po.lines.find(l => l.productId === "P017")!;
  const laptopGRNLine = grn.lines.find(l => l.productId === "P017")!;
  const userHassan = users.find(u => u.id === "U011")!; // WM Constantine

  describe("Étape 1 — PO multi-lignes", () => {
    it("PO a 2 lignes (laptops + moniteurs)", () => {
      expect(po.lines).toHaveLength(2);
    });

    it("total PO = 7,350,000 DZD HT", () => {
      expect(po.subtotal).toBe(7_350_000);
    });

    it("entrepôt = Constantine Tech", () => {
      expect(po.deliveryWarehouseId).toBe("wh-constantine-tech");
    });
  });

  describe("Étape 2 — GRN avec rejets partiels", () => {
    it("laptops : 58 reçus sur 60 commandés, 2 rejetés", () => {
      expect(laptopGRNLine.orderedQty).toBe(60);
      expect(laptopGRNLine.receivedQty).toBe(58);
      expect(laptopGRNLine.rejectedQty).toBe(2);
    });

    it("baseQty = receivedQty × factor (pas orderedQty)", () => {
      expect(laptopGRNLine.baseQty).toBe(laptopGRNLine.receivedQty * laptopGRNLine.conversionFactor!);
    });

    it("motif de rejet documenté", () => {
      expect(laptopGRNLine.rejectionReason).toBeDefined();
      expect(laptopGRNLine.rejectionReason).toMatch(/rayé/i);
    });

    it("moniteurs : réception complète sans rejet", () => {
      const monitorLine = grn.lines.find(l => l.productId === "P041")!;
      expect(monitorLine.receivedQty).toBe(60);
      expect(monitorLine.rejectedQty).toBe(0);
    });
  });

  describe("Étape 3 — 3-Way Match avec écart", () => {
    const matchResult = performThreeWayMatch(
      { id: po.id, taxAmount: po.taxAmount, lines: po.lines.map(l => ({ productId: l.productId, productName: l.productName, qty: l.qty, unitAbbr: l.unitAbbr, conversionFactor: l.conversionFactor, unitCost: l.unitCost, lineTotal: l.lineTotal })) },
      { id: grn.id, lines: grn.lines.map(l => ({ productId: l.productId, productName: l.productName, orderedQty: l.orderedQty, receivedQty: l.receivedQty, rejectedQty: l.rejectedQty, unitAbbr: l.unitAbbr, conversionFactor: l.conversionFactor })) },
      null,
      productUnitConversions,
    );

    it("écart détecté sur les laptops (58 vs 60 = -3.3%)", () => {
      const laptopMatch = matchResult.lines.find(l => l.productId === "P017")!;
      expect(laptopMatch.grnVariancePct).toBeCloseTo(-3.33, 1);
      expect(laptopMatch.status).toBe("within_tolerance"); // < 5% tolerance
    });

    it("moniteurs = matched (0% écart)", () => {
      const monitorMatch = matchResult.lines.find(l => l.productId === "P041")!;
      expect(monitorMatch.grnVariancePct).toBe(0);
      expect(monitorMatch.status).toBe("matched");
    });

    it("statut global = within_tolerance", () => {
      expect(matchResult.overallStatus).toBe("within_tolerance");
    });
  });

  describe("Étape 4 — PMP laptops après réception partielle", () => {
    // Simulate: stock existant 40 laptops @ 95,000, réception 58 @ 95,000
    const pmpResult = calculatePMP({
      currentQty: 40,
      currentCost: 95_000,
      receivedQty: 58,
      receivedUnitCost: 95_000,
    });

    it("même prix → PMP inchangé = 95,000", () => {
      expect(pmpResult.newCost).toBe(95_000);
    });

    it("stock total = 40 + 58 = 98 laptops", () => {
      expect(pmpResult.newTotalQty).toBe(98);
    });
  });

  describe("Étape 5 — QC conditionnel + Putaway en attente", () => {
    const qc = qcInspections.find(q => q.grnId === grn.id);
    const putaway = putawayTasks.find(p => p.grnId === grn.id);

    it("QC en cours — résultat conditionnel laptops", () => {
      expect(qc).toBeDefined();
      expect(qc!.status).toBe("In_Progress");
      const laptopQC = qc!.lines.find(l => l.productId === "P017")!;
      expect(laptopQC.result).toBe("Conditional");
      expect(laptopQC.failedQty).toBe(2);
    });

    it("putaway en attente validation QC", () => {
      expect(putaway).toBeDefined();
      expect(putaway!.status).toBe("Pending");
    });
  });

  describe("Étape 6 — FIFO allocation sur stock résultant", () => {
    // Simulate lots available after receipt
    const lots = [
      { id: "LOT-OLD", lotNumber: "LOT-LAP-OLD", productId: "P017", productName: "Laptop HP ProBook 450", batchDate: "2025-12-10", expiryDate: "2027-12-10", qtyAvailable: 40, warehouseId: "wh-constantine-tech", warehouseName: "Constantine Tech", status: "Active" },
      { id: "LOT-NEW", lotNumber: "LOT-LAP-0308A", productId: "P017", productName: "Laptop HP ProBook 450", batchDate: "2026-02-20", expiryDate: "2028-02-20", qtyAvailable: 58, warehouseId: "wh-constantine-tech", warehouseName: "Constantine Tech", status: "Active" },
    ];

    it("FIFO prend d'abord le lot le plus ancien", () => {
      const result = allocateFIFO("P017", "Laptop HP ProBook 450", 50, lots);
      expect(result.fullyAllocated).toBe(true);
      expect(result.allocations[0].lotNumber).toBe("LOT-LAP-OLD");
      expect(result.allocations[0].qtyAllocated).toBe(40);
      expect(result.allocations[1].lotNumber).toBe("LOT-LAP-0308A");
      expect(result.allocations[1].qtyAllocated).toBe(10);
    });

    it("commande de 100 → shortfall de 2", () => {
      const result = allocateFIFO("P017", "Laptop HP ProBook 450", 100, lots);
      expect(result.fullyAllocated).toBe(false);
      expect(result.shortfall).toBe(2);
      expect(result.allocatedQty).toBe(98);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO C — Agroalimentaire Oran : multi-produits + FEFO
// ═══════════════════════════════════════════════════════════════════════════

describe("E2E — Scénario C : Agroalimentaire Oran (multi-produits FEFO)", () => {
  const po = purchaseOrders.find(p => p.id === "PO-2026-0150")!;
  const grn = grns.find(g => g.poId === po.id)!;
  const userSamir = users.find(u => u.id === "U009")!; // WM Oran

  describe("Scope entrepôt et RBAC", () => {
    it("WM Oran a accès uniquement à Oran", () => {
      expect(canAccessWarehouse(userSamir, "wh-oran-food")).toBe(true);
      expect(canAccessWarehouse(userSamir, "wh-alger-construction")).toBe(false);
    });

    it("PO livrée à Oran Food", () => {
      expect(po.deliveryWarehouseId).toBe("wh-oran-food");
    });
  });

  describe("Traçabilité multi-lignes PO → GRN", () => {
    it("PO a 3 lignes (huile, farine, sucre)", () => {
      expect(po.lines).toHaveLength(3);
    });

    it("chaque ligne GRN a un lot et une DLC", () => {
      grn.lines.forEach(line => {
        expect(line.batchNumber).toMatch(/^LOT-/);
        expect(line.expiryDate).toBeDefined();
        expect(new Date(line.expiryDate).getTime()).toBeGreaterThan(Date.now());
      });
    });

    it("toutes les lignes receivedQty = orderedQty (réception complète)", () => {
      grn.lines.forEach(line => {
        expect(line.receivedQty).toBe(line.orderedQty);
        expect(line.rejectedQty).toBe(0);
      });
    });
  });

  describe("Conversion unités multi-produits", () => {
    it("huile : 2000 bidons × 5L = 10,000L base", () => {
      const huileLine = grn.lines.find(l => l.productId === "P010")!;
      expect(huileLine.conversionFactor).toBe(5);
      expect(huileLine.baseQty).toBe(10_000);
    });

    it("farine : 300 sacs × 50kg = 15,000 kg base", () => {
      const farineLine = grn.lines.find(l => l.productId === "P009")!;
      expect(farineLine.conversionFactor).toBe(50);
      expect(farineLine.baseQty).toBe(15_000);
    });

    it("sucre : 160 sacs × 50kg = 8,000 kg base", () => {
      const sucreLine = grn.lines.find(l => l.productId === "P012")!;
      expect(sucreLine.conversionFactor).toBe(50);
      expect(sucreLine.baseQty).toBe(8_000);
    });
  });

  describe("3-Way Match multi-lignes", () => {
    const matchResult = performThreeWayMatch(
      { id: po.id, taxAmount: po.taxAmount, lines: po.lines.map(l => ({ productId: l.productId, productName: l.productName, qty: l.qty, unitAbbr: l.unitAbbr, conversionFactor: l.conversionFactor, unitCost: l.unitCost, lineTotal: l.lineTotal })) },
      { id: grn.id, lines: grn.lines.map(l => ({ productId: l.productId, productName: l.productName, orderedQty: l.orderedQty, receivedQty: l.receivedQty, rejectedQty: l.rejectedQty, unitAbbr: l.unitAbbr, conversionFactor: l.conversionFactor })) },
      null,
      productUnitConversions,
    );

    it("3 lignes matchées", () => {
      expect(matchResult.lines).toHaveLength(3);
    });

    it("match global = matched", () => {
      expect(matchResult.overallStatus).toBe("matched");
    });

    it("total base GRN = total base PO", () => {
      expect(matchResult.totalGrnBase).toBe(matchResult.totalPoBase);
    });
  });

  describe("FEFO allocation (DLC la plus courte en premier)", () => {
    const lots = [
      { id: "LOT-1", lotNumber: "LOT-HUI-0220A", productId: "P010", productName: "Huile", batchDate: "2026-02-15", expiryDate: "2027-02-15", qtyAvailable: 1500, warehouseId: "wh-oran-food", warehouseName: "Oran Food", status: "Active" },
      { id: "LOT-2", lotNumber: "LOT-HUI-0305A", productId: "P010", productName: "Huile", batchDate: "2026-02-28", expiryDate: "2027-02-28", qtyAvailable: 2000, warehouseId: "wh-oran-food", warehouseName: "Oran Food", status: "Active" },
    ];

    it("FEFO prend le lot expirant le premier", () => {
      const result = allocateFIFO("P010", "Huile", 2000, lots, "FEFO");
      expect(result.fullyAllocated).toBe(true);
      expect(result.allocations[0].lotNumber).toBe("LOT-HUI-0220A");
      expect(result.allocations[0].qtyAllocated).toBe(1500);
      expect(result.allocations[1].lotNumber).toBe("LOT-HUI-0305A");
      expect(result.allocations[1].qtyAllocated).toBe(500);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO D — Séparation des responsabilités (RBAC end-to-end)
// ═══════════════════════════════════════════════════════════════════════════

describe("E2E — RBAC : séparation des responsabilités dans le flux PO→GRN→Stock", () => {
  const userKarim = users.find(u => u.id === "U002")!;   // WM Alger
  const userTarek = users.find(u => u.id === "U007")!;   // Operator
  const userOmar = users.find(u => u.id === "U004")!;     // Driver
  const userAhmed = users.find(u => u.id === "U001")!;   // CEO

  it("WM crée PO → Operator réceptionne GRN → WM approuve GRN", () => {
    // WM can create PO
    expect(canCreateDocument(userKarim, "purchaseOrder", "wh-alger-construction")).toBe(true);
    // Operator can create GRN
    expect(canCreateDocument(userTarek, "grn")).toBe(true);
    // WM can approve GRN
    const approval = canApproveDocument(userKarim, "grn", 0, "wh-alger-construction");
    expect(approval.allowed).toBe(true);
  });

  it("Operator ne peut PAS créer de PO", () => {
    expect(canCreateDocument(userTarek, "purchaseOrder")).toBe(false);
  });

  it("Driver ne peut ni créer PO ni GRN", () => {
    expect(canCreateDocument(userOmar, "purchaseOrder")).toBe(false);
    expect(canCreateDocument(userOmar, "grn")).toBe(false);
  });

  it("Operator ne peut PAS approuver de GRN", () => {
    const decision = canApproveDocument(userTarek, "grn");
    expect(decision.allowed).toBe(false);
  });

  it("CEO peut tout approuver, peu importe la variance", () => {
    expect(canApproveDocument(userAhmed, "purchaseOrder", 10).allowed).toBe(true);
    expect(canApproveDocument(userAhmed, "grn", 10).allowed).toBe(true);
  });
});
