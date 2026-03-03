import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ExportColumn } from "./exportUtils";

/**
 * Export data to PDF with styled table.
 */
export function exportToPDF<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  title?: string
): void {
  if (data.length === 0) return;

  const doc = new jsPDF({ orientation: data.length > 0 && columns.length > 6 ? "landscape" : "portrait" });

  // Title
  if (title) {
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(title, 14, 20);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-DZ")} à ${new Date().toLocaleTimeString("fr-DZ")}`, 14, 27);
  }

  const headers = columns.map((c) => c.label);
  const body = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      if (val === null || val === undefined) return "";
      return String(val);
    })
  );

  autoTable(doc, {
    head: [headers],
    body,
    startY: title ? 32 : 14,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
}

/**
 * Export a single sales order as a professional PDF document.
 */
export function exportOrderPDF(order: {
  id: string;
  customerName: string;
  salesRep: string;
  orderDate: string;
  deliveryDate: string;
  channel?: string;
  paymentTerms: string;
  subtotal: number;
  discountPct: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  lines: { productName: string; orderedQty: number; unitPrice: number; lineTotal: number }[];
}): void {
  const doc = new jsPDF();

  // Header bar
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 38, "F");
  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.text("BON DE COMMANDE", 14, 16);
  doc.setFontSize(11);
  doc.text(order.id, 14, 24);
  doc.setFontSize(9);
  doc.text(`Émis le ${new Date().toLocaleDateString("fr-DZ")}`, 14, 32);
  doc.text(`Généré: ${new Date().toLocaleString("fr-DZ")}`, 130, 32);

  let y = 48;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);

  const info = [
    ["Client", order.customerName],
    ["Vendeur", order.salesRep],
    ["Date commande", order.orderDate],
    ["Date livraison", order.deliveryDate],
    ["Paiement", order.paymentTerms.replace(/_/g, " ")],
    ...(order.channel ? [["Canal", order.channel]] : []),
  ];
  for (const [label, val] of info) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(val), 55, y);
    y += 6;
  }

  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Produit", "Qté", "Prix U.", "Total"]],
    body: order.lines.map((l) => [
      l.productName,
      String(l.orderedQty),
      `${l.unitPrice.toLocaleString("fr-DZ")} DZD`,
      `${l.lineTotal.toLocaleString("fr-DZ")} DZD`,
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  const totals = [
    ["Sous-total", `${order.subtotal.toLocaleString("fr-DZ")} DZD`],
    ...(order.discountPct > 0 ? [[`Remise (${order.discountPct}%)`, `-${Math.round(order.subtotal * order.discountPct / 100).toLocaleString("fr-DZ")} DZD`]] : []),
    ["TVA", `${order.taxAmount.toLocaleString("fr-DZ")} DZD`],
    ["Total TTC", `${order.totalAmount.toLocaleString("fr-DZ")} DZD`],
  ];
  for (const [label, val] of totals) {
    const isBold = label === "Total TTC";
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(isBold ? 12 : 10);
    doc.text(label, 120, y);
    doc.text(val, 196, y, { align: "right" });
    y += isBold ? 8 : 6;
  }

  if (order.notes) {
    y += 4;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text(`Notes: ${order.notes}`, 14, y);
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Flow ERP — Commande ${order.id} — Page ${i}/${pageCount}`, 14, 290);
  }

  doc.save(`commande-${order.id}.pdf`);
}

/**
 * Generate a daily closing PDF report.
 */
export function generateDailyClosingPDF(data: {
  date: string;
  driverName: string;
  deliveries: { client: string; amount: number; status: string; paymentMethod: string }[];
  cashCollected: number;
  cashExpected: number;
  chequesCollected: number;
  chequesCount: number;
  returns: { product: string; qty: number; reason: string }[];
  truckStockStart: number;
  truckStockEnd: number;
  truckStockSold: number;
  discrepancies: string[];
}): void {
  const doc = new jsPDF();

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.text("RAPPORT DE CLÔTURE QUOTIDIENNE", 14, 18);
  doc.setFontSize(10);
  doc.text(`Date: ${data.date}`, 14, 28);
  doc.text(`Chauffeur: ${data.driverName}`, 14, 34);
  doc.text(`Généré: ${new Date().toLocaleString("fr-DZ")}`, 120, 28);

  let y = 50;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.text("Résumé Financier", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Indicateur", "Valeur"]],
    body: [
      ["Espèces attendues", `${data.cashExpected.toLocaleString("fr-DZ")} DZD`],
      ["Espèces collectées", `${data.cashCollected.toLocaleString("fr-DZ")} DZD`],
      ["Écart espèces", `${(data.cashCollected - data.cashExpected).toLocaleString("fr-DZ")} DZD`],
      ["Chèques collectés", `${data.chequesCollected.toLocaleString("fr-DZ")} DZD (${data.chequesCount} chèques)`],
      ["Stock camion départ", `${data.truckStockStart} articles`],
      ["Stock camion retour", `${data.truckStockEnd} articles`],
      ["Vendus/Livrés", `${data.truckStockSold} articles`],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.text("Livraisons", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Client", "Montant (DZD)", "Statut", "Paiement"]],
    body: data.deliveries.map((d) => [d.client, d.amount.toLocaleString("fr-DZ"), d.status, d.paymentMethod]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [16, 185, 129] },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  if (data.returns.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.text("Retours", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Produit", "Quantité", "Motif"]],
      body: data.returns.map((r) => [r.product, String(r.qty), r.reason]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (data.discrepancies.length > 0) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setTextColor(239, 68, 68);
    doc.text("⚠ Écarts Détectés", 14, y);
    y += 6;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    data.discrepancies.forEach((d) => {
      doc.text(`• ${d}`, 18, y);
      y += 5;
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Flow ERP — Rapport clôture — Page ${i}/${pageCount}`, 14, 290);
  }

  doc.save(`cloture-${data.date}-${data.driverName.replace(/\s/g, "_")}.pdf`);
}

/**
 * Export an admin invoice as PDF (used in accounting page).
 */
export function exportInvoicePDF(inv: {
  id: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  orderId?: string;
  paymentTerms?: string;
}): void {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 38, "F");
  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.text("FACTURE", 14, 16);
  doc.setFontSize(12);
  doc.text(inv.id, 14, 25);
  doc.setFontSize(9);
  doc.text(`Généré: ${new Date().toLocaleString("fr-DZ")}`, 130, 32);

  let y = 48;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);

  const info = [
    ["Client", inv.customerName],
    ["Date d'émission", inv.issueDate],
    ["Date d'échéance", inv.dueDate],
    ["Statut", inv.status.replace(/_/g, " ")],
    ...(inv.orderId ? [["Commande", inv.orderId]] : []),
    ...(inv.paymentTerms ? [["Conditions", inv.paymentTerms]] : []),
  ];
  for (const [label, val] of info) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(val), 65, y);
    y += 7;
  }

  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Description", "Montant (DZD)"]],
    body: [
      ["Sous-total HT", inv.subtotal.toLocaleString("fr-DZ")],
      ["TVA", inv.taxAmount.toLocaleString("fr-DZ")],
      ["Total TTC", inv.totalAmount.toLocaleString("fr-DZ")],
      ["Montant payé", inv.paidAmount.toLocaleString("fr-DZ")],
      ["Solde restant", inv.balance.toLocaleString("fr-DZ")],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Flow ERP — ${inv.id} — Page ${i}/${pageCount}`, 14, 290);
  }

  doc.save(`facture-${inv.id}.pdf`);
}

/**
 * Export a portal invoice as customer-facing PDF.
 */
export function exportPortalInvoicePDF(inv: {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  issuedDate: string;
  dueDate: string;
}): void {
  const doc = new jsPDF();

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.text("FACTURE CLIENT", 14, 15);
  doc.setFontSize(11);
  doc.text(inv.id, 14, 24);
  doc.setFontSize(9);
  doc.text(`${new Date().toLocaleString("fr-DZ")}`, 140, 24);

  let y = 45;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);

  const info = [
    ["Client", inv.customerName],
    ["N° Client", inv.customerId],
    ["Date d'émission", new Date(inv.issuedDate).toLocaleDateString("fr-FR")],
    ["Date d'échéance", new Date(inv.dueDate).toLocaleDateString("fr-FR")],
  ];
  for (const [label, val] of info) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(val, 65, y);
    y += 7;
  }

  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Description", "Montant (DZD)"]],
    body: [
      ["Montant HT", inv.amount.toLocaleString("fr-DZ")],
      ["TVA", inv.taxAmount.toLocaleString("fr-DZ")],
      ["Total TTC", inv.totalAmount.toLocaleString("fr-DZ")],
      ["Payé", inv.paidAmount.toLocaleString("fr-DZ")],
      ["Solde dû", inv.balance.toLocaleString("fr-DZ")],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  doc.save(`facture-${inv.id}.pdf`);
}

/**
 * Export a portal account statement as PDF.
 */
export function exportPortalStatementPDF(
  customerName: string,
  entries: { date: string; description: string; type: string; amount: number; runningBalance: number }[],
  currentBalance: number
): void {
  const doc = new jsPDF();

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.text("RELEVÉ DE COMPTE", 14, 15);
  doc.setFontSize(10);
  doc.text(customerName, 14, 24);
  doc.setFontSize(9);
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 140, 24);

  let y = 45;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Solde actuel: ${currentBalance.toLocaleString("fr-DZ")} DZD`, 14, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Date", "Description", "Débit", "Crédit", "Solde"]],
    body: entries.map((e) => [
      new Date(e.date).toLocaleDateString("fr-FR"),
      e.description,
      e.type === "debit" ? e.amount.toLocaleString("fr-DZ") : "",
      e.type === "credit" ? e.amount.toLocaleString("fr-DZ") : "",
      e.runningBalance.toLocaleString("fr-DZ"),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  doc.save(`releve-${customerName.replace(/\s/g, "_")}.pdf`);
}
