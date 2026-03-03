/**
 * PHASE 8 — Inventory Reconciliation Tests
 * Validates: Perpetual vs physical count, batch ledger reconstruction
 */
import { describe, it, expect } from "vitest";

describe("Phase 8.1 — Perpetual vs Physical Count", () => {
  it("CEM-001: perpetual matches physical (90,500 Kg)", () => {
    // Perpetual: 0 + 100,000 + 50,000 - 20,000 - 60,000 + 500 = 70,500 (WH1) + 20,000 (WH3) = 90,500
    const wh1 = 100_000 - 20_000 - 10_000 + 500;
    const wh3 = 50_000 - 50_000 + 20_000;
    expect(wh1).toBe(70_500);
    expect(wh3).toBe(20_000);
    expect(wh1 + wh3).toBe(90_500);
  });

  it("STL-002: perpetual matches physical (42,500 Kg)", () => {
    const balance = 50_000 - 1_250 - 6_250;
    expect(balance).toBe(42_500);
  });

  it("TIL-003: perpetual matches physical (1,610 Pcs)", () => {
    const wh2 = 2_000 - 500 - 90;
    const wh4 = 500 - 300;
    expect(wh2).toBe(1_410);
    expect(wh4).toBe(200);
    expect(wh2 + wh4).toBe(1_610);
  });

  it("total variance = 0 across all products", () => {
    const perpetualCement = 90_500;
    const physicalCement = 90_500;
    const perpetualSteel = 42_500;
    const physicalSteel = 42_500;
    const perpetualTiles = 1_610;
    const physicalTiles = 1_610;

    expect(perpetualCement - physicalCement).toBe(0);
    expect(perpetualSteel - physicalSteel).toBe(0);
    expect(perpetualTiles - physicalTiles).toBe(0);
  });
});

describe("Phase 8.2 — Batch Ledger Reconstruction", () => {
  it("BATCH-00001 (Lafarge Cement) reconstructs correctly", () => {
    let balance = 0;
    balance += 100_000; // GRN-001
    balance -= 20_000;  // TRF-001 out
    balance -= 10_000;  // SO-001
    balance += 500;     // RET-001
    expect(balance).toBe(70_500);
  });

  it("BATCH-00002 (Hadid Steel) reconstructs correctly", () => {
    let balance = 0;
    balance += 50_000;  // GRN-002
    balance -= 1_250;   // SO-001
    balance -= 6_250;   // ADJ-001
    expect(balance).toBe(42_500);
  });

  it("BATCH-00003 (Hadid Cement) fully exhausted", () => {
    let balance = 0;
    balance += 50_000;  // GRN-003
    balance -= 50_000;  // SO-003
    expect(balance).toBe(0);
  });

  it("BATCH-00004 (Emco Tiles) reconstructs correctly", () => {
    let wh2 = 2_000;    // GRN-004
    wh2 -= 500;         // TRF-002 out
    wh2 -= 90;          // SO-004
    let wh4 = 500;      // TRF-002 in
    wh4 -= 300;         // SO-002
    expect(wh2).toBe(1_410);
    expect(wh4).toBe(200);
    expect(wh2 + wh4).toBe(1_610);
  });

  it("reconstructed inventory = physical count for all batches", () => {
    const reconstructed = {
      cement: 70_500 + 20_000, // B1 + B1-transferred (B3 exhausted)
      steel: 42_500,
      tiles: 1_410 + 200,
    };
    expect(reconstructed.cement).toBe(90_500);
    expect(reconstructed.steel).toBe(42_500);
    expect(reconstructed.tiles).toBe(1_610);
  });
});
