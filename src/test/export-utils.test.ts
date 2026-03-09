import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportToCSV, getSavedFilters, saveFilterPreset, deleteFilterPreset } from "@/lib/exportUtils";

// jsdom doesn't have URL.createObjectURL — polyfill for testing
beforeEach(() => {
  vi.restoreAllMocks();
  if (!URL.createObjectURL) {
    (URL as any).createObjectURL = vi.fn(() => "blob:test");
  }
  if (!URL.revokeObjectURL) {
    (URL as any).revokeObjectURL = vi.fn();
  }
});

describe("exportToCSV", () => {
  it("does nothing for empty data", () => {
    const createSpy = vi.spyOn(document, "createElement");
    exportToCSV([], [{ key: "id" as never, label: "ID" }], "test");
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("creates CSV and triggers download", () => {
    const mockClick = vi.fn();
    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: mockClick,
    } as unknown as HTMLAnchorElement);

    const data = [
      { id: "1", name: "Test Item" },
      { id: "2", name: 'Item with "quotes"' },
    ];

    exportToCSV(data, [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
    ], "export");

    expect(mockClick).toHaveBeenCalled();
  });
});

describe("Filter Presets", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array for unknown page", () => {
    expect(getSavedFilters("unknown-page")).toEqual([]);
  });

  it("saves and retrieves a filter preset", () => {
    saveFilterPreset("products", "myFilter", { category: "dairy" });
    const filters = getSavedFilters("products");
    expect(filters).toHaveLength(1);
    expect(filters[0].name).toBe("myFilter");
    expect(filters[0].filters.category).toBe("dairy");
  });

  it("overwrites existing preset with same name", () => {
    saveFilterPreset("products", "myFilter", { category: "dairy" });
    saveFilterPreset("products", "myFilter", { category: "frozen" });
    const filters = getSavedFilters("products");
    expect(filters).toHaveLength(1);
    expect(filters[0].filters.category).toBe("frozen");
  });

  it("deletes a filter preset", () => {
    saveFilterPreset("products", "filter1", { category: "dairy" });
    saveFilterPreset("products", "filter2", { category: "frozen" });
    deleteFilterPreset("products", "filter1");
    const filters = getSavedFilters("products");
    expect(filters).toHaveLength(1);
    expect(filters[0].name).toBe("filter2");
  });

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem("flow-erp-saved-filters", "not-json");
    expect(getSavedFilters("products")).toEqual([]);
  });
});