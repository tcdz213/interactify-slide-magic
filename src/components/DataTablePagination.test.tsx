import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DataTablePagination from "./DataTablePagination";

describe("DataTablePagination", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 3,
    onPageChange: vi.fn(),
    pageSize: 10,
    onPageSizeChange: vi.fn(),
    totalItems: 25,
  };

  it("renders showing text", () => {
    render(<DataTablePagination {...defaultProps} />);
    expect(screen.getByText("1–10 sur 25")).toBeInTheDocument();
  });

  it("shows page indicator", () => {
    render(<DataTablePagination {...defaultProps} />);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("disables prev buttons on first page", () => {
    render(<DataTablePagination {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled(); // first page
    expect(buttons[1]).toBeDisabled(); // prev
  });

  it("enables next buttons on first page", () => {
    render(<DataTablePagination {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[2]).not.toBeDisabled(); // next
    expect(buttons[3]).not.toBeDisabled(); // last page
  });

  it("calls onPageChange when next is clicked", () => {
    const onPageChange = vi.fn();
    render(<DataTablePagination {...defaultProps} onPageChange={onPageChange} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]); // next
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageSizeChange when select changes", () => {
    const onPageSizeChange = vi.fn();
    render(<DataTablePagination {...defaultProps} onPageSizeChange={onPageSizeChange} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "20" } });
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it("returns null for empty items", () => {
    const { container } = render(<DataTablePagination {...defaultProps} totalItems={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("disables next buttons on last page", () => {
    render(<DataTablePagination {...defaultProps} currentPage={3} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[2]).toBeDisabled(); // next
    expect(buttons[3]).toBeDisabled(); // last
  });

  it("shows correct range on page 2", () => {
    render(<DataTablePagination {...defaultProps} currentPage={2} />);
    expect(screen.getByText("11–20 sur 25")).toBeInTheDocument();
  });
});
