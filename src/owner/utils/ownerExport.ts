/**
 * Owner Export Utilities — CSV & PDF generation
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── CSV Export ──

export function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const escape = (v: string) => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };

  const csvContent = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ].join("\n");

  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── PDF Export ──

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: string[][];
  filename: string;
  orientation?: "portrait" | "landscape";
}

export function exportPDF({
  title,
  subtitle,
  headers,
  rows,
  filename,
  orientation = "portrait",
}: PDFExportOptions) {
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 20);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(subtitle, 14, 27);
    doc.setTextColor(0);
  }

  // Branding
  doc.setFontSize(8);
  doc.setTextColor(150);
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text("Jawda SaaS Platform", pageWidth - 14, 20, { align: "right" });
  doc.text(new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }), pageWidth - 14, 25, { align: "right" });
  doc.setTextColor(0);

  // Table
  autoTable(doc, {
    startY: subtitle ? 33 : 28,
    head: [headers],
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 98, 255],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Page ${i}/${pageCount}`, pageWidth - 14, pageHeight - 10, { align: "right" });
    doc.text("Jawda © 2026", 14, pageHeight - 10);
  }

  doc.save(`${filename}.pdf`);
}

// ── Subscriber-specific exports ──

import type { Subscriber } from "../types/owner";

const currency = (v: number) =>
  v === 0 ? "Gratuit" : new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(v) + " DZD";

export function exportSubscribersCSV(subscribers: Subscriber[]) {
  const headers = ["ID", "Nom", "Type", "Plan", "Statut", "Ville", "Wilaya", "Contact", "Email", "Téléphone", "Redevance", "Users", "Max Users", "Commandes", "CA Total", "Début", "Renouvellement"];
  const rows = subscribers.map((s) => [
    s.id, s.name, s.type === "entrepot" ? "Entrepôt" : "Fournisseur",
    s.plan, s.status, s.city, s.wilaya, s.contactName, s.contactEmail, s.contactPhone,
    String(s.monthlyFee), String(s.userCount), String(s.maxUsers),
    String(s.totalOrders), String(s.totalRevenue), s.startDate, s.renewalDate,
  ]);
  exportCSV("jawda-abonnes", headers, rows);
}

export function exportSubscribersPDF(subscribers: Subscriber[]) {
  const headers = ["Nom", "Type", "Plan", "Statut", "Ville", "Redevance", "Users", "Commandes"];
  const rows = subscribers.map((s) => [
    s.name, s.type === "entrepot" ? "Entrepôt" : "Fournisseur",
    s.plan.charAt(0).toUpperCase() + s.plan.slice(1), s.status,
    s.city, currency(s.monthlyFee), `${s.userCount}/${s.maxUsers}`, String(s.totalOrders),
  ]);
  exportPDF({
    title: "Liste des abonnés Jawda",
    subtitle: `${subscribers.length} abonnés · Exporté le ${new Date().toLocaleDateString("fr-FR")}`,
    headers,
    rows,
    filename: "jawda-abonnes",
    orientation: "landscape",
  });
}

// ── Invoice-specific exports ──

import type { SubscriptionInvoice } from "../types/owner";

const STATUS_LABELS_FR: Record<string, string> = { paid: "Payée", pending: "En attente", overdue: "En retard", cancelled: "Annulée" };

export function exportInvoicesCSV(invoices: SubscriptionInvoice[]) {
  const headers = ["N° Facture", "Abonné", "Période", "Montant", "Statut", "Date émission", "Échéance", "Date paiement"];
  const rows = invoices.map((i) => [
    i.id, i.subscriberName, i.period, String(i.amount),
    STATUS_LABELS_FR[i.status] || i.status, i.issuedAt, i.dueDate, i.paidAt || "—",
  ]);
  exportCSV("jawda-factures", headers, rows);
}

export function exportInvoicesPDF(invoices: SubscriptionInvoice[]) {
  const headers = ["N° Facture", "Abonné", "Période", "Montant", "Statut", "Échéance", "Payée le"];
  const rows = invoices.map((i) => [
    i.id, i.subscriberName, i.period, currency(i.amount),
    STATUS_LABELS_FR[i.status] || i.status, i.dueDate, i.paidAt || "—",
  ]);
  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
  exportPDF({
    title: "Factures d'abonnement Jawda",
    subtitle: `${invoices.length} factures · Total : ${currency(totalAmount)} · Exporté le ${new Date().toLocaleDateString("fr-FR")}`,
    headers,
    rows,
    filename: "jawda-factures",
  });
}
