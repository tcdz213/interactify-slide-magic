import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "./usePagination";

describe("usePagination hook", () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

  it("returns first page with default page size", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    expect(result.current.paginatedItems).toHaveLength(10);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.totalItems).toBe(25);
    expect(result.current.pageSize).toBe(10);
  });

  it("navigates to page 2", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.setCurrentPage(2));
    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedItems[0]).toEqual({ id: 11, name: "Item 11" });
  });

  it("last page has remaining items", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.setCurrentPage(3));
    expect(result.current.paginatedItems).toHaveLength(5);
  });

  it("changes page size and resets to page 1", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.setCurrentPage(2));
    act(() => result.current.setPageSize(20));
    expect(result.current.pageSize).toBe(20);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(2);
  });

  it("clamps current page to total pages", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.setCurrentPage(100));
    expect(result.current.currentPage).toBe(3); // clamped to totalPages
  });

  it("handles empty array", () => {
    const { result } = renderHook(() => usePagination([], 10));
    expect(result.current.paginatedItems).toHaveLength(0);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.totalItems).toBe(0);
  });

  it("handles single item", () => {
    const { result } = renderHook(() => usePagination([{ id: 1 }], 10));
    expect(result.current.paginatedItems).toHaveLength(1);
    expect(result.current.totalPages).toBe(1);
  });

  it("respects custom default page size", () => {
    const { result } = renderHook(() => usePagination(items, 5));
    expect(result.current.pageSize).toBe(5);
    expect(result.current.totalPages).toBe(5);
    expect(result.current.paginatedItems).toHaveLength(5);
  });
});
