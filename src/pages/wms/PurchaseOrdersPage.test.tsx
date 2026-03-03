import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import PurchaseOrdersPage from "./PurchaseOrdersPage";

describe("Commandes d'achat (PO)", () => {
  it("affiche le titre", () => {
    render(<PurchaseOrdersPage />);
    expect(screen.getByRole("heading", { name: /commandes d'achat/i })).toBeInTheDocument();
  });

  it("affiche un tableau de commandes", () => {
    render(<PurchaseOrdersPage />);
    const table = document.querySelector("table");
    expect(table).toBeInTheDocument();
  });
});
