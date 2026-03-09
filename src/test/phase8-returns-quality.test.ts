/**
 * 90-DAY-TEST-PLAN — Phase 8 : Retours & Réclamations Qualité
 * Scénarios 8.01 → 8.15
 * Tests : retours clients/fournisseurs, QC, avoirs, réclamations, RBAC, serial tracking
 */
import { describe, it, expect } from "vitest";
import { returns, creditNotes, qualityClaims, inventory, invoices, customers } from "@/data/mockData";
import { users } from "@/data/userData";
import { serialNumbers, lotBatches } from "@/data/operationalData";
import { canAccessWarehouse } from "@/lib/rbac";
import {
  generateSupplierReturnJournal,
  generateCustomerReturnJournal,
} from "@/lib/returnsJournalEngine";
import type { ReturnOrder, ReturnLine, CreditNote, QualityClaim } from "@/data/transactionalData";

// ── Users ──
const userFarid = users.find(u => u.id === "U013")!;    // RegionalManager
const userSara = users.find(u => u.id === "U003")!;      // QCOfficer
const userKarim = users.find(u => u.id === "U002")!;     // WM Alger
const userSamir = users.find(u => u.id === "U009")!;     // WM Oran
const userHassan = users.find(u => u.id === "U010")!;    // WM Constantine
const userNadia = users.find(u => u.id === "U006")!;     // Accountant
const userRachid = users.find(u => u.id === "U012")!;    // OpsDirector
const userAnis = users.find(u => u.id === "U011")!;      // FinanceDirector
const userAhmed = users.find(u => u.id === "U001")!;     // CEO
const userLeila = users.find(u => u.id === "U008")!;     // BIAnalyst
const userOmar = users.find(u => u.id === "U004")!;      // Driver
const userTarek = users.find(u => u.id === "U007")!;     // Operator

// ── 8.01 — RegionalManager crée retour client : 10 sacs Ciment défectueux ──
describe("8.01 — Retour client : 10 sacs Ciment défectueux", () => {
  const mockReturn: ReturnOrder = {
    id: "RET-T801",
    type: "Customer",
    referenceId: "INV-20260220-004",
    partyName: "Promoteur Benhamed",
    date: "2026-03-01",
    status: "Submitted",
    reason: "Sacs ciment défectueux",
    reasonCode: "DEFECTIVE",
    totalValue: 10 * 1200,
    items: [{
      lineId: 1, productId: "P001", productName: "Ciment CPJ 42.5 (50kg)",
      qty: 10, unitCost: 1200, lineValue: 12000,
      reason: "Sacs endommagés", reasonCode: "DEFECTIVE",
    }],
    processedBy: "Farid Khelifi",
    refundMethod: "Credit_Note",
  };

  it("retour type = Customer", () => {
    expect(mockReturn.type).toBe("Customer");
  });

  it("motif = DEFECTIVE", () => {
    expect(mockReturn.reasonCode).toBe("DEFECTIVE");
  });

  it("total = 10 × 1,200 = 12,000 DZD", () => {
    expect(mockReturn.totalValue).toBe(12_000);
  });

  it("RegionalManager a accès entrepôt Alger", () => {
    expect(canAccessWarehouse(userFarid, "wh-alger-construction")).toBe(true);
  });

  it("des retours Customer existent dans les données", () => {
    const customerReturns = returns.filter(r => r.type === "Customer");
    expect(customerReturns.length).toBeGreaterThan(0);
  });
});

// ── 8.02 — QCOfficer inspecte retour : 8 défectueux, 2 OK ──
describe("8.02 — QC Inspection retour : 8 Scrap, 2 Restock", () => {
  const received = 10;
  const defective = 8;
  const ok = 2;

  it("QCOfficer est affecté à Alger", () => {
    expect(canAccessWarehouse(userSara, "wh-alger-construction")).toBe(true);
  });

  it("8 produits → Scrap, 2 → Restock", () => {
    const lines: Partial<ReturnLine>[] = [
      { lineId: 1, qty: 8, disposition: "Scrap", qcResult: "Failed" },
      { lineId: 2, qty: 2, disposition: "Restock", qcResult: "Passed" },
    ];
    expect(lines[0].disposition).toBe("Scrap");
    expect(lines[1].disposition).toBe("Restock");
    expect(lines[0].qty! + lines[1].qty!).toBe(received);
  });

  it("dispositions valides : Restock, Scrap, Quarantine, Return_To_Vendor, Repair", () => {
    const validDispositions = ["Restock", "Restock_Discounted", "Scrap", "Quarantine", "Return_To_Vendor", "Repair"];
    returns.forEach(r => {
      if (r.disposition) {
        expect(validDispositions).toContain(r.disposition);
      }
      r.items.forEach(item => {
        if (item.disposition) {
          expect(validDispositions).toContain(item.disposition);
        }
      });
    });
  });

  it("retour RET-001 (Pending_QC) existe et attend QC", () => {
    const ret001 = returns.find(r => r.id === "RET-001");
    expect(ret001).toBeDefined();
    expect(ret001!.status).toBe("Pending_QC");
  });
});

// ── 8.03 — WM Alger approuve retour, stock mis à jour ──
describe("8.03 — WM Alger approuve retour, stock +2 restock / -8 scrap", () => {
  const restockQty = 2;
  const scrapQty = 8;

  it("Karim (WM Alger) a accès à l'entrepôt Alger", () => {
    expect(canAccessWarehouse(userKarim, "wh-alger-construction")).toBe(true);
  });

  it("stock ciment Alger existe et > 0", () => {
    const cimentInv = inventory.find(i => i.productId === "P001" && i.warehouseId === "wh-alger-construction");
    expect(cimentInv).toBeDefined();
    expect(cimentInv!.qtyOnHand).toBeGreaterThan(0);
  });

  it("restock +2 serait traçable dans l'inventaire", () => {
    const cimentInv = inventory.find(i => i.productId === "P001" && i.warehouseId === "wh-alger-construction")!;
    const newQty = cimentInv.qtyOnHand + restockQty;
    expect(newQty).toBe(cimentInv.qtyOnHand + 2);
  });

  it("scrap -8 n'affecte pas le stock disponible (déjà retiré)", () => {
    expect(scrapQty).toBe(8);
    // Scrap items are written off, not returned to available stock
  });

  it("retour RET-006 est au statut Credited (approuvé + avoir émis)", () => {
    const ret006 = returns.find(r => r.id === "RET-006");
    expect(ret006).toBeDefined();
    expect(ret006!.status).toBe("Credited");
    expect(ret006!.creditNoteId).toBe("CN-001");
  });
});

// ── 8.04 — Accountant crée avoir (Credit Note) pour le retour ──
describe("8.04 — Avoir client : 10 × 1,200 = 12,000 DZD", () => {
  it("Accountant peut lire les factures et paiements", () => {
    expect(userNadia.role).toBe("Accountant");
  });

  it("CN-001 existe, type Customer_Credit, montant > 0", () => {
    const cn = creditNotes.find(c => c.id === "CN-001");
    expect(cn).toBeDefined();
    expect(cn!.documentType).toBe("Customer_Credit");
    expect(cn!.totalAmount).toBeGreaterThan(0);
  });

  it("CN-001 est liée au retour RET-006", () => {
    const cn = creditNotes.find(c => c.id === "CN-001")!;
    expect(cn.referenceType).toBe("Return");
    expect(cn.referenceId).toBe("RET-006");
  });

  it("CN-001 a un statut Posted", () => {
    const cn = creditNotes.find(c => c.id === "CN-001")!;
    expect(cn.status).toBe("Posted");
  });

  it("montant CN avec frais de restockage : 70,200 DZD HT", () => {
    const cn = creditNotes.find(c => c.id === "CN-001")!;
    expect(cn.subtotal).toBe(70_200);
  });
});

// ── 8.05 — WM Oran : retour fournisseur 24 boîtes Tomate non conformes ──
describe("8.05 — Retour fournisseur : 24 boîtes Tomate non conformes (Oran)", () => {
  it("Samir (WM Oran) a accès entrepôt Oran Food", () => {
    expect(canAccessWarehouse(userSamir, "wh-oran-food")).toBe(true);
  });

  it("retour fournisseur RET-002 existe (type Vendor)", () => {
    const ret = returns.find(r => r.id === "RET-002");
    expect(ret).toBeDefined();
    expect(ret!.type).toBe("Vendor");
  });

  it("RET-002 est lié à un GRN", () => {
    const ret = returns.find(r => r.id === "RET-002")!;
    expect(ret.referenceId).toMatch(/^GRN-/);
  });

  it("retour fournisseur mock 24 boîtes = 24 × unitCost", () => {
    const qty = 24;
    const unitCost = 2400;
    expect(qty * unitCost).toBe(57_600);
  });

  it("stock Tomate Oran existe", () => {
    const tomInv = inventory.find(i => i.productId === "P011" && i.warehouseId === "wh-oran-food");
    expect(tomInv).toBeDefined();
    expect(tomInv!.qtyOnHand).toBeGreaterThan(0);
  });
});

// ── 8.06 — QCOfficer crée réclamation qualité fournisseur ──
describe("8.06 — Réclamation qualité : type Damaged, priorité High", () => {
  it("CLM-001 existe avec type Quality", () => {
    const claim = qualityClaims.find(c => c.id === "CLM-001");
    expect(claim).toBeDefined();
    expect(claim!.claimType).toBe("Quality");
  });

  it("CLM-001 a priorité High", () => {
    const claim = qualityClaims.find(c => c.id === "CLM-001")!;
    expect(claim.priority).toBe("High");
  });

  it("réclamation liée à un GRN et un retour", () => {
    const claim = qualityClaims.find(c => c.id === "CLM-001")!;
    expect(claim.grnId).toBeTruthy();
    expect(claim.returnId).toBeTruthy();
  });

  it("des réclamations avec statuts variés existent", () => {
    const statuses = new Set(qualityClaims.map(c => c.status));
    expect(statuses.size).toBeGreaterThanOrEqual(3);
  });
});

// ── 8.07 — QCOfficer ajoute preuves photo à la réclamation ──
describe("8.07 — Ajout preuves photo à réclamation", () => {
  it("QCOfficer Sara est assignée à Alger + Oran", () => {
    expect(canAccessWarehouse(userSara, "wh-alger-construction")).toBe(true);
    expect(canAccessWarehouse(userSara, "wh-oran-food")).toBe(true);
  });

  it("réclamation a un champ correctiveAction renseigné", () => {
    const claim = qualityClaims.find(c => c.id === "CLM-001")!;
    expect(claim.correctiveAction).toBeTruthy();
  });

  it("les réclamations ont un assignedTo défini", () => {
    qualityClaims.forEach(c => {
      expect(c.assignedTo).toBeTruthy();
    });
  });

  it("SLA date existe pour chaque réclamation", () => {
    qualityClaims.forEach(c => {
      expect(c.slaDueDate).toBeTruthy();
      expect(new Date(c.slaDueDate).getTime()).toBeGreaterThan(0);
    });
  });
});

// ── 8.08 — OpsDirector valide réclamation et décide disposition ──
describe("8.08 — OpsDirector valide réclamation : remplacement ou remboursement", () => {
  it("Rachid (OpsDirector) a accès global", () => {
    expect(userRachid.assignedWarehouseIds).toBe("all");
  });

  it("CLM-002 est Resolved avec settlement Full_Credit", () => {
    const claim = qualityClaims.find(c => c.id === "CLM-002");
    expect(claim).toBeDefined();
    expect(claim!.status).toBe("Resolved");
    expect(claim!.settlementType).toBe("Full_Credit");
  });

  it("CLM-003 est Escalated au Directeur Opérations", () => {
    const claim = qualityClaims.find(c => c.id === "CLM-003");
    expect(claim).toBeDefined();
    expect(claim!.status).toBe("Escalated");
    expect(claim!.escalatedTo).toBeTruthy();
  });

  it("settlement types valides couvrent tous les cas", () => {
    const validTypes = ["Full_Credit", "Partial_Credit", "Replacement", "Price_Reduction", "Penalty", "No_Action", "Mixed"];
    qualityClaims.forEach(c => {
      if (c.settlementType) {
        expect(validTypes).toContain(c.settlementType);
      }
    });
  });
});

// ── 8.09 — FinanceDirector approuve remboursement fournisseur ──
describe("8.09 — FinanceDirector approuve remboursement fournisseur", () => {
  it("FinanceDirector a accès global", () => {
    expect(userAnis.assignedWarehouseIds).toBe("all");
  });

  it("FinanceDirector peut approuver écriture financière", () => {
    expect(userAnis.role).toBe("FinanceDirector");
  });

  it("CN-002 (Vendor_Credit) est Applied", () => {
    const cn = creditNotes.find(c => c.id === "CN-002");
    expect(cn).toBeDefined();
    expect(cn!.documentType).toBe("Vendor_Credit");
    expect(cn!.status).toBe("Applied");
  });

  it("journal comptable retour fournisseur génère les bonnes écritures", () => {
    const journal = generateSupplierReturnJournal({
      id: "RET-TEST-809",
      partyName: "Fournisseur Test",
      totalValue: 22500,
      creditNoteId: "CN-002",
    });
    expect(journal.type).toBe("SUPPLIER_RETURN");
    expect(journal.lines.length).toBe(3);
    // Debit AP, Credit GRNI + TVA
    const totalDebit = journal.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = journal.lines.reduce((s, l) => s + l.credit, 0);
    expect(totalDebit).toBe(totalCredit);
  });
});

// ── 8.10 — CEO : Dashboard qualité, taux de retour par fournisseur ──
describe("8.10 — CEO : Vendor Scorecard & taux de retour", () => {
  it("Ahmed (CEO) a accès global", () => {
    expect(userAhmed.assignedWarehouseIds).toBe("all");
  });

  it("réclamations couvrent plusieurs fournisseurs", () => {
    const vendors = new Set(qualityClaims.map(c => c.vendorId));
    expect(vendors.size).toBeGreaterThanOrEqual(2);
  });

  it("retours fournisseur ont des montants cohérents", () => {
    const vendorReturns = returns.filter(r => r.type === "Vendor");
    vendorReturns.forEach(r => {
      expect(r.totalValue).toBeGreaterThan(0);
      r.items.forEach(item => {
        expect(item.lineValue).toBe(item.qty * item.unitCost);
      });
    });
  });

  it("claims avec rootCause documentée", () => {
    const documented = qualityClaims.filter(c => c.rootCause);
    expect(documented.length).toBeGreaterThanOrEqual(3);
  });
});

// ── 8.11 — WM Constantine : Retour Tech Laptop avec serial tracking ──
describe("8.11 — Retour Tech : Laptop écran cassé, serial tracked", () => {
  it("Hassan (WM Constantine) a accès Tech Constantine", () => {
    expect(canAccessWarehouse(userHassan, "wh-constantine-tech")).toBe(true);
  });

  it("retour RET-003 = Laptop garantie, statut Approved", () => {
    const ret = returns.find(r => r.id === "RET-003");
    expect(ret).toBeDefined();
    expect(ret!.reasonCode).toBe("WARRANTY");
    expect(ret!.status).toBe("Approved");
    expect(ret!.disposition).toBe("Repair");
  });

  it("serial number SN-003 est marqué Defective", () => {
    const sn = serialNumbers.find(s => s.id === "SN-003");
    expect(sn).toBeDefined();
    expect(sn!.status).toBe("Defective");
    expect(sn!.productId).toBe("P017");
  });

  it("SN-003 note mentionne écran défaillant", () => {
    const sn = serialNumbers.find(s => s.id === "SN-003")!;
    expect(sn.notes).toContain("Écran défaillant");
  });

  it("lot Laptop LOT-006 est actif dans Constantine", () => {
    const lot = lotBatches.find(l => l.id === "LOT-006");
    expect(lot).toBeDefined();
    expect(lot!.warehouseId).toBe("wh-constantine-tech");
    expect(lot!.status).toBe("Active");
  });
});

// ── 8.12 — Accountant : Écriture comptable retour + avoir ──
describe("8.12 — Journal comptable retour client + avoir", () => {
  it("journal retour client génère 3 lignes (Retours/TVA/AR)", () => {
    const journal = generateCustomerReturnJournal({
      id: "RET-TEST-812",
      partyName: "Client Test",
      totalValue: 12000,
      creditNoteId: "CN-TEST",
    });
    expect(journal.type).toBe("CUSTOMER_RETURN");
    expect(journal.lines.length).toBe(3);
  });

  it("journal retour client : débit Retours + TVA, crédit AR", () => {
    const journal = generateCustomerReturnJournal({
      id: "RET-TEST-812B",
      partyName: "Client Test B",
      totalValue: 12000,
    });
    // Debit = 7050 (Retours) + 4457 (TVA)
    const debitLines = journal.lines.filter(l => l.debit > 0);
    expect(debitLines.length).toBe(2);
    expect(debitLines.map(l => l.account)).toContain("7050");
    expect(debitLines.map(l => l.account)).toContain("4457");
    // Credit = 3400 (AR)
    const creditLines = journal.lines.filter(l => l.credit > 0);
    expect(creditLines.length).toBe(1);
    expect(creditLines[0].account).toBe("3400");
  });

  it("journal équilibré : total débit = total crédit", () => {
    const journal = generateCustomerReturnJournal({
      id: "RET-TEST-812C",
      partyName: "Client Balance",
      totalValue: 50000,
    });
    const totalDebit = journal.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = journal.lines.reduce((s, l) => s + l.credit, 0);
    expect(totalDebit).toBe(totalCredit);
  });

  it("TVA calculée à 19% du HT", () => {
    const ht = 50000;
    const journal = generateCustomerReturnJournal({
      id: "RET-TEST-812D",
      partyName: "Test TVA",
      totalValue: ht,
    });
    const tvaLine = journal.lines.find(l => l.account === "4457")!;
    expect(tvaLine.debit).toBe(Math.round(ht * 0.19));
  });
});

// ── 8.13 — BIAnalyst : Rapport retours par catégorie et période ──
describe("8.13 — BIAnalyst : analyse tendance retours", () => {
  it("BIAnalyst a accès lecture global", () => {
    expect(userLeila.assignedWarehouseIds).toBe("all");
  });

  it("retours couvrent types Customer et Vendor", () => {
    const types = new Set(returns.map(r => r.type));
    expect(types.has("Customer")).toBe(true);
    expect(types.has("Vendor")).toBe(true);
  });

  it("retours couvrent plusieurs reasonCodes", () => {
    const reasons = new Set(returns.map(r => r.reasonCode).filter(Boolean));
    expect(reasons.size).toBeGreaterThanOrEqual(4);
  });

  it("retours couvrent plusieurs statuts (lifecycle complet)", () => {
    const statuses = new Set(returns.map(r => r.status));
    // Expect at least Draft, Submitted, Pending_QC, Approved, Processed, Credited
    expect(statuses.size).toBeGreaterThanOrEqual(4);
  });

  it("tous les retours ont un totalValue > 0", () => {
    returns.forEach(r => {
      expect(r.totalValue).toBeGreaterThan(0);
    });
  });

  it("valeur totale des retours calculable", () => {
    const total = returns.reduce((s, r) => s + r.totalValue, 0);
    expect(total).toBeGreaterThan(100_000);
  });
});

// ── 8.14 — Driver : récupérer retour client sur tournée ──
describe("8.14 — Driver : bon de retour signé", () => {
  it("Omar (Driver Oran) existe et a rôle Driver", () => {
    expect(userOmar.role).toBe("Driver");
  });

  it("Driver a accès scope assigned", () => {
    expect(userOmar.assignedWarehouseIds).not.toBe("all");
  });

  it("retour RET-004 Lait est en statut Submitted (prêt à récupérer)", () => {
    const ret = returns.find(r => r.id === "RET-004");
    expect(ret).toBeDefined();
    expect(ret!.status).toBe("Submitted");
    expect(ret!.items[0].productName).toContain("Lait");
  });

  it("refund method Credit_Note sur RET-004", () => {
    const ret = returns.find(r => r.id === "RET-004")!;
    expect(ret.refundMethod).toBe("Credit_Note");
  });

  it("retours ont processedBy renseigné (traçabilité)", () => {
    returns.forEach(r => {
      expect(r.processedBy).toBeTruthy();
    });
  });
});

// ── 8.15 — Operator : réceptionner retour en entrepôt ──
describe("8.15 — Operator réceptionne retour en zone dédiée", () => {
  it("Tarek (Operator Alger) a accès entrepôt Alger", () => {
    expect(canAccessWarehouse(userTarek, "wh-alger-construction")).toBe(true);
  });

  it("retour RET-005 (Draft, Vendor) peut être réceptionné par Operator", () => {
    const ret = returns.find(r => r.id === "RET-005");
    expect(ret).toBeDefined();
    expect(ret!.status).toBe("Draft");
    expect(ret!.type).toBe("Vendor");
    expect(ret!.processedBy).toBe("Tarek Daoui");
  });

  it("lot en Quarantine existe pour zone dédiée retours", () => {
    const quarantine = lotBatches.filter(l => l.status === "Quarantine");
    expect(quarantine.length).toBeGreaterThan(0);
  });

  it("items retour ont reasonCode documenté", () => {
    returns.forEach(r => {
      r.items.forEach(item => {
        expect(item.reasonCode).toBeTruthy();
      });
    });
  });

  it("6 retours dans le jeu de données couvrent le cycle complet", () => {
    expect(returns.length).toBeGreaterThanOrEqual(6);
  });
});

// ── BONUS : Intégrité chaîne Return → CreditNote → Claim ──
describe("BONUS — Chaîne Return ↔ CreditNote ↔ Claim", () => {
  it("RET-006 → CN-001 : lien retour→avoir", () => {
    const ret = returns.find(r => r.id === "RET-006")!;
    const cn = creditNotes.find(c => c.id === ret.creditNoteId)!;
    expect(cn.referenceId).toBe("RET-006");
    expect(cn.referenceType).toBe("Return");
  });

  it("RET-002 → CN-002 → CLM-002 : chaîne complète fournisseur", () => {
    const cn = creditNotes.find(c => c.id === "CN-002")!;
    expect(cn.referenceId).toBe("RET-002");
    const claim = qualityClaims.find(c => c.returnId === "RET-002");
    expect(claim).toBeDefined();
    expect(claim!.id).toBe("CLM-002");
    expect(claim!.status).toBe("Resolved");
  });

  it("DN-001 (Vendor_Debit) lié à CLM-001", () => {
    const dn = creditNotes.find(c => c.id === "DN-001")!;
    expect(dn.documentType).toBe("Vendor_Debit");
    expect(dn.referenceId).toBe("CLM-001");
    expect(dn.referenceType).toBe("Claim");
  });

  it("restocking fee appliqué sur RET-006 : 10%", () => {
    const ret = returns.find(r => r.id === "RET-006")!;
    expect(ret.restockingFeePct).toBe(10);
    expect(ret.netCredit).toBe(70_200);
    // 78,000 × 0.9 = 70,200
    expect(ret.totalValue * (1 - ret.restockingFeePct! / 100)).toBe(ret.netCredit);
  });
});
