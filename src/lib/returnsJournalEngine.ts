/**
 * Sprint 14 — Returns Accounting Journal Engine
 * G4.1: Supplier return → debit GRNI, credit Inventory
 * G4.2: Customer return → debit Sales Returns, credit AR
 */

import { logAudit } from "@/services/auditService";

export interface ReturnJournalEntry {
  id: string;
  type: "SUPPLIER_RETURN" | "CUSTOMER_RETURN";
  returnId: string;
  creditNoteId?: string;
  date: string;
  lines: ReturnJournalLine[];
  totalAmount: number;
  createdAt: string;
}

export interface ReturnJournalLine {
  account: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

const JOURNAL_STORAGE_KEY = "jawda-return-journals";

function loadJournals(): ReturnJournalEntry[] {
  try {
    return JSON.parse(localStorage.getItem(JOURNAL_STORAGE_KEY) || "[]");
  } catch { return []; }
}

function saveJournals(entries: ReturnJournalEntry[]): void {
  try { localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries)); } catch {}
}

export function getReturnJournals(): ReturnJournalEntry[] {
  return loadJournals();
}

export function getJournalsByReturnId(returnId: string): ReturnJournalEntry[] {
  return loadJournals().filter(j => j.returnId === returnId);
}

export function getJournalsByCreditNoteId(cnId: string): ReturnJournalEntry[] {
  return loadJournals().filter(j => j.creditNoteId === cnId);
}

/**
 * G4.1 — Generate accounting journal for supplier return posting.
 * Debit: 4080 GRNI (reverse accrual)
 * Credit: 3xxx Inventory (goods returned)
 */
export function generateSupplierReturnJournal(
  returnData: { id: string; partyName: string; totalValue: number; creditNoteId?: string }
): ReturnJournalEntry {
  const now = new Date().toISOString();
  const date = now.slice(0, 10);
  const taxAmount = Math.round(returnData.totalValue * 0.19);
  const htAmount = returnData.totalValue;

  const entry: ReturnJournalEntry = {
    id: `JRN-SR-${Date.now().toString(36).toUpperCase()}`,
    type: "SUPPLIER_RETURN",
    returnId: returnData.id,
    creditNoteId: returnData.creditNoteId,
    date,
    totalAmount: htAmount + taxAmount,
    createdAt: now,
    lines: [
      { account: "4010", accountName: "Fournisseurs (AP)", debit: htAmount + taxAmount, credit: 0, description: `Retour ${returnData.id} — ${returnData.partyName}` },
      { account: "4080", accountName: "GRNI / Charges à payer", debit: 0, credit: htAmount, description: `Contrepassation GRNI — ${returnData.id}` },
      { account: "4450", accountName: "TVA déductible", debit: 0, credit: taxAmount, description: `TVA sur retour fournisseur — ${returnData.id}` },
    ],
  };

  const journals = loadJournals();
  journals.unshift(entry);
  saveJournals(journals);

  logAudit({
    action: "Journal retour fournisseur généré",
    module: "Comptabilité",
    entityId: entry.id,
    performedBy: "Système",
    details: `${entry.id} — Retour ${returnData.id} — ${returnData.partyName} — ${htAmount + taxAmount} DZD`,
  });

  return entry;
}

/**
 * G4.2 — Generate accounting journal for customer return posting.
 * Debit: 7050 Sales Returns
 * Credit: 3400 Clients (AR)
 */
export function generateCustomerReturnJournal(
  returnData: { id: string; partyName: string; totalValue: number; creditNoteId?: string }
): ReturnJournalEntry {
  const now = new Date().toISOString();
  const date = now.slice(0, 10);
  const taxAmount = Math.round(returnData.totalValue * 0.19);
  const htAmount = returnData.totalValue;

  const entry: ReturnJournalEntry = {
    id: `JRN-CR-${Date.now().toString(36).toUpperCase()}`,
    type: "CUSTOMER_RETURN",
    returnId: returnData.id,
    creditNoteId: returnData.creditNoteId,
    date,
    totalAmount: htAmount + taxAmount,
    createdAt: now,
    lines: [
      { account: "7050", accountName: "Retours sur ventes", debit: htAmount, credit: 0, description: `Retour client ${returnData.id} — ${returnData.partyName}` },
      { account: "4457", accountName: "TVA collectée (reversal)", debit: taxAmount, credit: 0, description: `TVA sur retour client — ${returnData.id}` },
      { account: "3400", accountName: "Clients (AR)", debit: 0, credit: htAmount + taxAmount, description: `Avoir client — ${returnData.id}` },
    ],
  };

  const journals = loadJournals();
  journals.unshift(entry);
  saveJournals(journals);

  logAudit({
    action: "Journal retour client généré",
    module: "Comptabilité",
    entityId: entry.id,
    performedBy: "Système",
    details: `${entry.id} — Retour ${returnData.id} — ${returnData.partyName} — ${htAmount + taxAmount} DZD`,
  });

  return entry;
}
