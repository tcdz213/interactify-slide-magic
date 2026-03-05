/**
 * Sprint 12 — FX Engine: Rate-by-date lookup, FX gain/loss, FX variance journals.
 */

export interface ExchangeRateEntry {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string; // YYYY-MM-DD
  rateType: "spot" | "budget" | "average";
}

// ── Default rate history (DZD as base) ──

const RATE_HISTORY: ExchangeRateEntry[] = [
  // EUR → DZD
  { fromCurrency: "EUR", toCurrency: "DZD", rate: 144.20, effectiveDate: "2025-12-01", rateType: "spot" },
  { fromCurrency: "EUR", toCurrency: "DZD", rate: 145.10, effectiveDate: "2025-12-15", rateType: "spot" },
  { fromCurrency: "EUR", toCurrency: "DZD", rate: 145.90, effectiveDate: "2026-01-01", rateType: "spot" },
  { fromCurrency: "EUR", toCurrency: "DZD", rate: 146.30, effectiveDate: "2026-01-15", rateType: "spot" },
  { fromCurrency: "EUR", toCurrency: "DZD", rate: 146.50, effectiveDate: "2026-02-01", rateType: "spot" },
  { fromCurrency: "EUR", toCurrency: "DZD", rate: 147.00, effectiveDate: "2026-02-15", rateType: "spot" },
  { fromCurrency: "EUR", toCurrency: "DZD", rate: 146.80, effectiveDate: "2026-03-01", rateType: "spot" },
  // USD → DZD
  { fromCurrency: "USD", toCurrency: "DZD", rate: 133.50, effectiveDate: "2025-12-01", rateType: "spot" },
  { fromCurrency: "USD", toCurrency: "DZD", rate: 134.00, effectiveDate: "2025-12-15", rateType: "spot" },
  { fromCurrency: "USD", toCurrency: "DZD", rate: 134.20, effectiveDate: "2026-01-01", rateType: "spot" },
  { fromCurrency: "USD", toCurrency: "DZD", rate: 134.60, effectiveDate: "2026-01-15", rateType: "spot" },
  { fromCurrency: "USD", toCurrency: "DZD", rate: 134.80, effectiveDate: "2026-02-01", rateType: "spot" },
  { fromCurrency: "USD", toCurrency: "DZD", rate: 135.20, effectiveDate: "2026-02-15", rateType: "spot" },
  { fromCurrency: "USD", toCurrency: "DZD", rate: 135.00, effectiveDate: "2026-03-01", rateType: "spot" },
  // GBP → DZD
  { fromCurrency: "GBP", toCurrency: "DZD", rate: 168.50, effectiveDate: "2025-12-01", rateType: "spot" },
  { fromCurrency: "GBP", toCurrency: "DZD", rate: 169.20, effectiveDate: "2026-01-01", rateType: "spot" },
  { fromCurrency: "GBP", toCurrency: "DZD", rate: 170.00, effectiveDate: "2026-02-01", rateType: "spot" },
  { fromCurrency: "GBP", toCurrency: "DZD", rate: 169.50, effectiveDate: "2026-03-01", rateType: "spot" },
  // Budget rates
  { fromCurrency: "EUR", toCurrency: "DZD", rate: 148.00, effectiveDate: "2026-01-01", rateType: "budget" },
  { fromCurrency: "USD", toCurrency: "DZD", rate: 136.00, effectiveDate: "2026-01-01", rateType: "budget" },
];

/**
 * G1.1 — Get exchange rate for a currency pair at a specific date.
 * Returns the closest rate with effectiveDate ≤ given date.
 * Falls back to 1.0 for same-currency or DZD pairs.
 */
export function getRate(
  from: string,
  to: string,
  date: string,
  rateType: "spot" | "budget" | "average" = "spot",
  additionalRates: ExchangeRateEntry[] = []
): number {
  if (from === to) return 1.0;
  // DZD is base currency — if either side is DZD and we need the inverse
  const allRates = [...RATE_HISTORY, ...additionalRates];

  // Direct lookup
  const candidates = allRates
    .filter(r => r.fromCurrency === from && r.toCurrency === to && r.rateType === rateType && r.effectiveDate <= date)
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));

  if (candidates.length > 0) return candidates[0].rate;

  // Inverse lookup
  const inverseCandidates = allRates
    .filter(r => r.fromCurrency === to && r.toCurrency === from && r.rateType === rateType && r.effectiveDate <= date)
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));

  if (inverseCandidates.length > 0) return 1 / inverseCandidates[0].rate;

  // Fallback: return 1.0 (same currency assumed)
  return 1.0;
}

/**
 * Get all available rates for display/history.
 */
export function getAllRates(): ExchangeRateEntry[] {
  return [...RATE_HISTORY];
}

/**
 * G1.4 / G3.1 — Compute FX gain/loss between two dates for an amount in foreign currency.
 * Realized FX gain/loss = amount × (settlement_rate - transaction_rate)
 */
export interface FxGainLoss {
  foreignCurrency: string;
  foreignAmount: number;
  transactionRate: number;
  settlementRate: number;
  transactionAmountDZD: number;
  settlementAmountDZD: number;
  gainLossDZD: number; // positive = gain, negative = loss
  isGain: boolean;
}

export function computeFxGainLoss(
  foreignCurrency: string,
  foreignAmount: number,
  transactionDate: string,
  settlementDate: string,
  additionalRates: ExchangeRateEntry[] = []
): FxGainLoss {
  const txRate = getRate(foreignCurrency, "DZD", transactionDate, "spot", additionalRates);
  const stRate = getRate(foreignCurrency, "DZD", settlementDate, "spot", additionalRates);
  const txAmount = foreignAmount * txRate;
  const stAmount = foreignAmount * stRate;
  const gl = stAmount - txAmount;

  return {
    foreignCurrency,
    foreignAmount,
    transactionRate: txRate,
    settlementRate: stRate,
    transactionAmountDZD: txAmount,
    settlementAmountDZD: stAmount,
    gainLossDZD: gl,
    isGain: gl >= 0,
  };
}

/**
 * G3.2 — Generate FX variance journal entry.
 */
export interface FxJournalEntry {
  id: string;
  type: "FX";
  account: string;
  poId: string;
  description: string;
  amount: number;
  date: string;
  transactionRate: number;
  settlementRate: number;
  foreignCurrency: string;
}

export function generateFxJournal(
  poId: string,
  productName: string,
  fxResult: FxGainLoss,
  date: string,
  journalIndex: number
): FxJournalEntry {
  const account = fxResult.isGain
    ? "7560xx — Gains de change réalisés"
    : "7660xx — Pertes de change réalisées";

  return {
    id: `VAR-FX-${String(journalIndex).padStart(3, "0")}`,
    type: "FX",
    account,
    poId,
    description: `${productName} — ${fxResult.foreignCurrency}: taux PO ${fxResult.transactionRate.toFixed(2)} vs paiement ${fxResult.settlementRate.toFixed(2)}`,
    amount: fxResult.gainLossDZD,
    date,
    transactionRate: fxResult.transactionRate,
    settlementRate: fxResult.settlementRate,
    foreignCurrency: fxResult.foreignCurrency,
  };
}

/**
 * G1.3 — Generate mock auto-fetched rates (simulate daily ±2% variation).
 */
export function generateAutoRates(
  basePairs: { from: string; to: string; baseRate: number }[],
  startDate: string,
  days: number
): ExchangeRateEntry[] {
  const result: ExchangeRateEntry[] = [];
  for (const pair of basePairs) {
    let rate = pair.baseRate;
    const start = new Date(startDate);
    for (let d = 0; d < days; d++) {
      const date = new Date(start);
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().split("T")[0];
      // Random walk ±0.5%
      const change = (Math.random() - 0.5) * 0.01 * rate;
      rate = Math.round((rate + change) * 100) / 100;
      result.push({
        fromCurrency: pair.from,
        toCurrency: pair.to,
        rate,
        effectiveDate: dateStr,
        rateType: "spot",
      });
    }
  }
  return result;
}
