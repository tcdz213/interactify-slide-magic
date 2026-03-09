import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "@/components/StatusBadge";

describe("StatusBadge", () => {
  it("renders mapped label for known status", () => {
    render(<StatusBadge status="Approved" />);
    expect(screen.getByText("Approuvé")).toBeInTheDocument();
  });

  it("renders mapped label for Draft", () => {
    render(<StatusBadge status="Draft" />);
    expect(screen.getByText("Brouillon")).toBeInTheDocument();
  });

  it("renders mapped label for Completed", () => {
    render(<StatusBadge status="Completed" />);
    expect(screen.getByText("Terminé")).toBeInTheDocument();
  });

  it("renders raw status for unknown value", () => {
    render(<StatusBadge status="CustomStatus" />);
    expect(screen.getByText("CustomStatus")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<StatusBadge status="Active" className="extra-class" />);
    expect(container.firstChild).toHaveClass("extra-class");
  });

  it("renders all critical statuses correctly", () => {
    const statuses = [
      { status: "Pending", label: "En attente" },
      { status: "Rejected", label: "Rejeté" },
      { status: "Shipped", label: "Expédié" },
      { status: "Paid", label: "Payée" },
      { status: "Overdue", label: "En retard" },
    ];
    statuses.forEach(({ status, label }) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });
});
