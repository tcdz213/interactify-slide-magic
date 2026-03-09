import { describe, it, expect } from "vitest";
import { checkCredit } from "@/shared/utils/creditCheck";

describe("creditCheck", () => {
  it("passes when order is within credit limit", () => {
    const result = checkCredit({ creditLimit: 100000, creditUsed: 30000 }, 50000);
    expect(result.passed).toBe(true);
    expect(result.available).toBe(70000);
    expect(result.blocked).toBe(false);
  });

  it("fails when order exceeds available credit", () => {
    const result = checkCredit({ creditLimit: 100000, creditUsed: 80000 }, 30000);
    expect(result.passed).toBe(false);
    expect(result.available).toBe(20000);
    expect(result.requested).toBe(30000);
  });

  it("blocks when overdue >= 60 days", () => {
    const result = checkCredit({ creditLimit: 100000, creditUsed: 0, oldestOverdueDays: 65 }, 1000);
    expect(result.passed).toBe(false);
    expect(result.blocked).toBe(true);
    expect(result.overdueDays).toBe(65);
  });

  it("passes when overdue < 60 days and within limit", () => {
    const result = checkCredit({ creditLimit: 100000, creditUsed: 0, oldestOverdueDays: 30 }, 5000);
    expect(result.passed).toBe(true);
    expect(result.blocked).toBe(false);
  });

  it("handles zero credit limit", () => {
    const result = checkCredit({ creditLimit: 0, creditUsed: 0 }, 100);
    expect(result.passed).toBe(false);
    expect(result.available).toBe(0);
  });

  it("handles exact credit limit match", () => {
    const result = checkCredit({ creditLimit: 50000, creditUsed: 30000 }, 20000);
    expect(result.passed).toBe(true);
  });
});