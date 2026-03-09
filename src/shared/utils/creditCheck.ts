/**
 * Shared credit check utility — used by both Mobile and Admin apps.
 * Per MOBILE_SPLIT_ARCHITECTURE Phase 3.3.
 */

import type { CreditCheckResult } from "../types/order";
import type { CustomerBase } from "../types/customer";

export function checkCredit(
  customer: Pick<CustomerBase, "creditLimit" | "creditUsed"> & { oldestOverdueDays?: number },
  orderTotal: number
): CreditCheckResult {
  const available = customer.creditLimit - customer.creditUsed;
  const overdueDays = customer.oldestOverdueDays ?? 0;
  return {
    passed: orderTotal <= available && overdueDays < 60,
    available,
    requested: orderTotal,
    overdueDays,
    blocked: overdueDays >= 60,
  };
}
